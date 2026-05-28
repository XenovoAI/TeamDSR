import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  getCurrentAuthUser,
  getUserProfile,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
  subscribeToAuthState,
  type AppUser,
  type UserProfile,
} from '@/lib/supabase-auth';

interface AuthContextType {
  user: AppUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authDebug: string;
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
  const [user, setUser] = useState<AppUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authDebug, setAuthDebug] = useState('init');

  const refreshUserProfile = async () => {
    if (!user) return;

    try {
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check for current session
    const checkSession = async () => {
      const currentUser = getCurrentAuthUser();
      if (currentUser && mounted) {
        setAuthDebug(`current-user-found: ${currentUser.email || currentUser.id}`);
        setUser(currentUser);
        try {
          const profile = await getUserProfile(currentUser.id);
          if (mounted) {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
      if (mounted) {
        setLoading(false);
      }
    };

    void checkSession();

    const unsubscribe = subscribeToAuthState(async (nextUser, nextProfile) => {
      if (!mounted) return;

      setUser(nextUser);
      setAuthDebug(nextUser ? `auth-state-user: ${nextUser.email || nextUser.id}` : 'signed-out');
      setUserProfile(nextProfile);
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
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
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setUser(null);
      setUserProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        authDebug,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        signOut: handleSignOut,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
