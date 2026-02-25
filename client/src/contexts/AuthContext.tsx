import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import {
  supabase,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getUserProfile,
  upsertUserProfile,
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

  const lastFetchedUserIdRef = useRef<string | null>(null);
  const profileFetchInFlightRef = useRef<Promise<UserProfile | null> | null>(null);

  // Fetch user profile from database and create if doesn't exist
  const fetchUserProfile = async (currentUser: User, force = false) => {
    if (!currentUser?.id) return null;

    if (!force && lastFetchedUserIdRef.current === currentUser.id && userProfile) {
      return userProfile;
    }

    if (profileFetchInFlightRef.current && !force) {
      return profileFetchInFlightRef.current;
    }

    const fetchPromise = (async () => {
      try {
        let profile = await getUserProfile(currentUser.id);

        if (!profile) {
          await upsertUserProfile({
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
            avatar_url: currentUser.user_metadata?.avatar_url || null,
          });

          profile = await getUserProfile(currentUser.id);
        }

        lastFetchedUserIdRef.current = currentUser.id;
        setUserProfile(profile);
        return profile;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      } finally {
        profileFetchInFlightRef.current = null;
      }
    })();

    profileFetchInFlightRef.current = fetchPromise;
    return fetchPromise;
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user, true);
    }
  };

  // Initialize auth
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchUserProfile(currentUser);
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 5000);

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'INITIAL_SESSION') {
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchUserProfile(currentUser, true);
      } else {
        lastFetchedUserIdRef.current = null;
        setUserProfile(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const handleSignInWithGoogle = async () => {
    await signInWithGoogle();
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  };

  const handleSignUpWithEmail = async (email: string, password: string, name: string) => {
    await signUpWithEmail(email, password, name);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      lastFetchedUserIdRef.current = null;
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      lastFetchedUserIdRef.current = null;
      setUser(null);
      setUserProfile(null);
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
