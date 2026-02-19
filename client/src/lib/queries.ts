// Direct REST API helper - more reliable than Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ezcoqsyzchjijbwwnhfn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Y29xc3l6Y2hqaWpid3duaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODQxNTQsImV4cCI6MjA4MDc2MDE1NH0.Uig4RSmHuaG_KKluQWM9DXEAUBNQA_g2upsDeOXt3uk';

const fetchSupabase = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': options.method === 'POST' ? 'return=representation' : 'return=minimal',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API Error: ${response.status}`);
  }
  
  if (response.status === 204 || options.method === 'HEAD') {
    return null;
  }
  
  return response.json();
};

// Get count from a table
const getCount = async (table: string, filter?: string): Promise<number> => {
  const endpoint = filter ? `${table}?${filter}&select=id` : `${table}?select=id`;
  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'count=exact',
    },
  });
  const count = response.headers.get('content-range')?.split('/')[1];
  return parseInt(count || '0');
};

// ============================================
// USER QUERIES
// ============================================

export const getAllUsers = async () => {
  const response = await fetch(`${supabaseUrl}/rest/v1/users?order=created_at.desc`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Range': '0-999', // Fetch up to 1000 users
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }
  
  return response.json();
};

// ============================================
// SUBJECT QUERIES
// ============================================

export const getAllSubjects = async () => {
  return fetchSupabase('subjects?is_active=eq.true&order=order_index.asc');
};

// ============================================
// CHAPTER QUERIES
// ============================================

export const getChaptersBySubject = async (subjectId: string) => {
  return fetchSupabase(`chapters?subject_id=eq.${subjectId}&is_active=eq.true&order=order_index.asc`);
};

// ============================================
// STUDY MATERIALS QUERIES
// ============================================

export const getStudyMaterialsByChapter = async (chapterId: string) => {
  return fetchSupabase(`study_materials?chapter_id=eq.${chapterId}&is_active=eq.true&order=created_at.desc`);
};

export const getAllStudyMaterials = async () => {
  return fetchSupabase('study_materials?is_active=eq.true&order=created_at.desc&select=*,chapter:chapters(*,subject:subjects(*))');
};

// ============================================
// ADMIN STATS QUERIES
// ============================================

export const getAdminStats = async () => {
  const [totalStudents, totalMaterials] = await Promise.all([
    getCount('users'),
    getCount('study_materials', 'is_active=eq.true'),
  ]);

  return { totalStudents, totalMaterials, totalQuestions: 0, totalVideos: 0 };
};

// ============================================
// MATERIAL DOWNLOADS TRACKING
// ============================================

export const trackMaterialDownload = async (userId: string, materialId: string) => {
  try {
    const materials = await fetchSupabase(`study_materials?id=eq.${materialId}&select=download_count`);
    const currentCount = materials?.[0]?.download_count || 0;
    
    await fetchSupabase(`study_materials?id=eq.${materialId}`, {
      method: 'PATCH',
      body: JSON.stringify({ download_count: currentCount + 1 }),
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking download:', error);
    return { success: false, error };
  }
};
