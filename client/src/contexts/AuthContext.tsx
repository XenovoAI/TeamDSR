import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  completeRedirectSignIn,
  getCurrentAuthUser,
  getUserProfile,
  signInWithGoogle,
  signOut,
  subscribeToAuthState,
  syncUserProfileSafely,
  type AppUser,
  type UserProfile,
} from '@/lib/firebase-auth';

interface AuthContextType {
  user: AppUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authDebug: string;
  signInWithGoogle: () => Promise<void>;
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
      console.error('Error refreshing Firebase profile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    void completeRedirectSignIn()
      .then(({ user: redirectUser, profile: redirectProfile, debug }) => {
        if (mounted) {
          setAuthDebug(debug.message ? `${debug.stage}: ${debug.message}` : debug.stage);
          if (redirectUser) {
            setUser(redirectUser);
            setUserProfile(redirectProfile);
          } else {
            const currentUser = getCurrentAuthUser();
            if (currentUser) {
              setAuthDebug(`current-user-found: ${currentUser.email || currentUser.id}`);
              setUser(currentUser);
              void getUserProfile(currentUser.id).then((profile) => {
                if (mounted) {
                  setUserProfile(profile);
                }
              });
            }
          }
        }
      })
      .catch((error) => {
        console.error("Error completing Firebase redirect sign-in:", error);
        if (mounted) {
          setAuthDebug(`redirect-error: ${error instanceof Error ? error.message : 'unknown'}`);
        }
      });

    const timeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = subscribeToAuthState(async (nextUser, nextProfile) => {
      if (!mounted) return;

      setUser(nextUser);
      setAuthDebug(nextUser ? `auth-state-user: ${nextUser.email || nextUser.id}` : 'auth-state-empty');
      if (nextUser && !nextProfile) {
        const fallbackProfile = await getUserProfile(nextUser.id).catch(() => null);
        setUserProfile(fallbackProfile);
      } else {
        setUserProfile(nextProfile);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const handleSignInWithGoogle = async () => {
    await signInWithGoogle();
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
        signOut: handleSignOut,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
