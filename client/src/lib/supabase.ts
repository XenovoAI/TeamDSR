import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ezcoqsyzchjijbwwnhfn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Y29xc3l6Y2hqaWpid3duaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODQxNTQsImV4cCI6MjA4MDc2MDE1NH0.Uig4RSmHuaG_KKluQWM9DXEAUBNQA_g2upsDeOXt3uk';

// Log configuration (without exposing full key)
console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  keyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
  fromEnv: !!import.meta.env.VITE_SUPABASE_URL
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration! Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

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
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    console.log('✅ Signed out successfully');
  } catch (error) {
    console.error('Sign out failed:', error);
    // Force clear local storage as fallback
    localStorage.removeItem('sb-ezcoqsyzchjijbwwnhfn-auth-token');
    throw error;
  }
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

// Direct fetch helper
const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API Error: ${response.status}`);
  }
  
  if (response.status === 204) return null;
  return response.json();
};

// Create or update user profile in Supabase
export const upsertUserProfile = async (userData: {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}) => {
  console.log('🔄 Attempting to upsert user to Supabase:', userData);
  
  try {
    // First check if user exists by ID
    let existingUsers = await fetchApi(`users?id=eq.${userData.id}&select=id,role,is_admin,email`);
    let existingUser = existingUsers?.[0];

    // If not found by ID, check by email (user might have been created with different ID)
    if (!existingUser) {
      console.log('🔍 User not found by ID, checking by email...');
      existingUsers = await fetchApi(`users?email=eq.${encodeURIComponent(userData.email)}&select=id,role,is_admin,email`);
      existingUser = existingUsers?.[0];
      
      if (existingUser) {
        console.log('✅ Found user by email with ID:', existingUser.id);
        // Update the user's ID to match auth ID
        await fetchApi(`users?id=eq.${existingUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            id: userData.id,
            name: userData.name,
            avatar_url: userData.avatar_url,
            updated_at: new Date().toISOString()
          }),
          headers: { 'Prefer': 'return=minimal' }
        });
        console.log('✅ Updated user ID to match auth ID');
        return { ...existingUser, id: userData.id };
      }
    }

    if (existingUser) {
      // User exists - just update non-critical fields
      console.log('🔄 Updating existing user, preserving role:', existingUser.role, 'is_admin:', existingUser.is_admin);
      
      await fetchApi(`users?id=eq.${userData.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: userData.name,
          avatar_url: userData.avatar_url,
          updated_at: new Date().toISOString()
        }),
        headers: { 'Prefer': 'return=minimal' }
      });
      
      // Return existing user data with preserved role
      return existingUser;
    } else {
      // New user - create with student role
      console.log('📝 Creating new user with student role');
      
      const newUserData = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar_url: userData.avatar_url,
        role: 'student',
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const data = await fetchApi('users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      });
      
      console.log('✅ User created:', data);
      return data?.[0] || newUserData;
    }
  } catch (error: any) {
    // If it's a duplicate key error, the user exists - try to fetch them by email
    if (error.message?.includes('23505') || error.message?.includes('duplicate')) {
      console.log('⚠️ User already exists, fetching profile by email...');
      const existingUsers = await fetchApi(`users?email=eq.${encodeURIComponent(userData.email)}`);
      if (existingUsers?.[0]) {
        // Update the ID to match
        const existingUser = existingUsers[0];
        if (existingUser.id !== userData.id) {
          try {
            await fetchApi(`users?email=eq.${encodeURIComponent(userData.email)}`, {
              method: 'PATCH',
              body: JSON.stringify({ id: userData.id, updated_at: new Date().toISOString() }),
              headers: { 'Prefer': 'return=minimal' }
            });
          } catch (e) {
            console.log('Could not update user ID');
          }
        }
        return existingUsers[0];
      }
      return null;
    }
    console.error('❌ Error upserting user profile:', error);
    throw error;
  }
};

// Get user profile from Supabase - check by ID first, then by email
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('🔍 Fetching user profile for ID:', userId);
    
    // Try by ID first
    let data = await fetchApi(`users?id=eq.${userId}`);
    
    if (data && data.length > 0) {
      console.log('✅ Found user by ID:', data[0]);
      return data[0];
    }
    
    console.log('⚠️ User not found by ID');
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const data = await fetchApi(`users?id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString()
      }),
    });
    return data?.[0] || data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
