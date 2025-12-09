import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } from '@/lib/firebase';
import { upsertUserProfile, getUserProfile, UserProfile, supabase } from '@/lib/supabase';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // User is signed in, sync with Supabase
        try {
          await upsertUserProfile({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            avatar_url: firebaseUser.photoURL || undefined
          });
          
          // Fetch full profile
          await fetchUserProfile(firebaseUser.uid);
        } catch (error) {
          console.error('Error syncing user with Supabase:', error);
        }
      } else {
        // User is signed out
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time subscription to Supabase user profile changes
  useEffect(() => {
    if (!user) return;

    console.log('🔔 Setting up real-time subscription for user:', user.uid);

    // Subscribe to changes in the user's profile
    const channel = supabase
      .channel(`user-${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.uid}`
        },
        (payload) => {
          console.log('🔄 Real-time update received:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            // Update local state with new data
            setUserProfile(payload.new as UserProfile);
            console.log('✅ User profile updated in real-time:', payload.new);
          } else if (payload.eventType === 'DELETE') {
            setUserProfile(null);
            console.log('⚠️ User profile deleted');
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    // Cleanup subscription on unmount or user change
    return () => {
      console.log('🔌 Unsubscribing from real-time updates');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error('Email sign in error:', error);
      throw error;
    }
  };

  const handleSignUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      await signUpWithEmail(email, password, name);
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error('Email sign up error:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserProfile(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    signOut: handleSignOut,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
