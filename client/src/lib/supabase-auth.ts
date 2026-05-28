import { supabase, getUserProfile, upsertUserProfile, type UserProfile } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  uid: string;
  email: string | null;
  user_metadata: {
    name?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    picture?: string | null;
    email?: string | null;
  };
}

export const mapSupabaseUser = (supabaseUser: User): AppUser => ({
  id: supabaseUser.id,
  uid: supabaseUser.id,
  email: supabaseUser.email || null,
  user_metadata: {
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
    full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    picture: supabaseUser.user_metadata?.picture || supabaseUser.user_metadata?.avatar_url,
    email: supabaseUser.email,
  },
});

export const signInWithGoogle = async (): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) throw error;
};

export const signInWithEmail = async (email: string, password: string): Promise<AppUser> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('No user returned from sign in');

  // Sync user profile
  await upsertUserProfile({
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
    avatar_url: data.user.user_metadata?.avatar_url,
  });

  return mapSupabaseUser(data.user);
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string
): Promise<AppUser> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        full_name: name,
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('No user returned from sign up');

  // Create user profile
  await upsertUserProfile({
    id: data.user.id,
    email: data.user.email!,
    name: name,
    avatar_url: data.user.user_metadata?.avatar_url,
  });

  return mapSupabaseUser(data.user);
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentAuthUser = (): AppUser | null => {
  const session = supabase.auth.getSession();
  // Note: getSession() returns a promise, but we can check the cached session
  const cachedSession = (supabase.auth as any)._currentSession;
  if (cachedSession?.user) {
    return mapSupabaseUser(cachedSession.user);
  }
  return null;
};

export const subscribeToAuthState = (
  callback: (user: AppUser | null, profile: UserProfile | null) => Promise<void> | void
): (() => void) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (!session?.user) {
      await callback(null, null);
      return;
    }

    const appUser = mapSupabaseUser(session.user);
    
    // Sync profile
    try {
      await upsertUserProfile({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        avatar_url: session.user.user_metadata?.avatar_url,
      });
      
      const profile = await getUserProfile(session.user.id);
      await callback(appUser, profile);
    } catch (error) {
      console.error('Error syncing user profile:', error);
      await callback(appUser, null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};

export { getUserProfile, upsertUserProfile, type UserProfile };
