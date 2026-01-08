import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  supabase, 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  signOut,
  upsertUserProfile, 
  getUserProfile, 
  UserProfile 
} from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
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
      await fetchUserProfile(user.id);
    }
  };

  // Listen to Supabase auth state changes
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        const supabaseUser = session?.user ?? null;
        setUser(supabaseUser);
        
        if (supabaseUser) {
          // Sync user profile in background, don't block loading
          upsertUserProfile({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
            avatar_url: supabaseUser.user_metadata?.avatar_url || undefined
          }).then(() => {
            if (mounted) {
              fetchUserProfile(supabaseUser.id);
            }
          }).catch(error => {
            console.error('Error syncing user with Supabase:', error);
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set a shorter timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timeout - proceeding without auth');
        setLoading(false);
      }
    }, 2000);

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      const supabaseUser = session?.user ?? null;
      setUser(supabaseUser);
      
      if (supabaseUser) {
        // User is signed in, sync with Supabase
        try {
          await upsertUserProfile({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
            avatar_url: supabaseUser.user_metadata?.avatar_url || undefined
          });
          
          // Fetch full profile
          await fetchUserProfile(supabaseUser.id);
        } catch (error) {
          console.error('Error syncing user with Supabase:', error);
        }
      } else {
        // User is signed out
        setUserProfile(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Real-time subscription to Supabase user profile changes
  useEffect(() => {
    if (!user) return;

    console.log('🔔 Setting up real-time subscription for user:', user.id);

    // Subscribe to changes in the user's profile
    const channel = supabase
      .channel(`user-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
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
