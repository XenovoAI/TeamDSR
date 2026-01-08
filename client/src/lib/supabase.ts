import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ezcoqsyzchjijbwwnhfn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Y29xc3l6Y2hqaWpid3duaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODQxNTQsImV4cCI6MjA4MDc2MDE1NH0.Uig4RSmHuaG_KKluQWM9DXEAUBNQA_g2upsDeOXt3uk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data.user;
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name
      }
    }
  });
  
  if (error) throw error;
  return data.user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Database types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  class?: string;
  school?: string;
  role?: string;
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

// Create or update user profile in Supabase
export const upsertUserProfile = async (userData: {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}) => {
  console.log('🔄 Attempting to upsert user to Supabase:', userData);
  
  // First check if user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id, role, is_admin')
    .eq('id', userData.id)
    .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 error

  // Prepare update data - preserve role and is_admin for existing users
  const updateData: any = {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    avatar_url: userData.avatar_url,
    updated_at: new Date().toISOString()
  };

  // Only set role and is_admin for NEW users
  if (!existingUser) {
    updateData.role = 'student';
    updateData.is_admin = false;
    console.log('📝 Creating new user with student role');
  } else {
    console.log('🔄 Updating existing user, preserving role:', existingUser.role, 'is_admin:', existingUser.is_admin);
  }
  
  const { data, error } = await supabase
    .from('users')
    .upsert(updateData, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error upserting user profile:', error);
    throw error;
  }

  console.log('✅ User successfully synced to Supabase:', data);
  return data;
};

// Get user profile from Supabase
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
};
