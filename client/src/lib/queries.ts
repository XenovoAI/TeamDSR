import { supabase } from './supabase';

// ============================================
// USER QUERIES
// ============================================

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getUserStats = async (userId: string) => {
  // Get user's quiz sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', userId);

  if (sessionsError) throw sessionsError;

  const totalTests = sessions?.length || 0;
  const avgScore = sessions?.length 
    ? sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length 
    : 0;

  return {
    totalTests,
    avgScore: Math.round(avgScore),
    dayStreak: 31, // TODO: Calculate from actual data
    notesRead: 5 // TODO: Calculate from actual data
  };
};

// ============================================
// SUBJECT QUERIES
// ============================================

export const getAllSubjects = async () => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data;
};

export const getSubjectById = async (id: string) => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// CHAPTER QUERIES
// ============================================

export const getChaptersBySubject = async (subjectId: string) => {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data;
};

export const getChapterById = async (id: string) => {
  const { data, error } = await supabase
    .from('chapters')
    .select(`
      *,
      subject:subjects(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// QUESTION QUERIES
// ============================================

export const getQuestionsByChapter = async (chapterId: string) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('chapter_id', chapterId)
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data;
};

export const getAllQuestions = async () => {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      chapter:chapters(
        *,
        subject:subjects(*)
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ============================================
// STUDY MATERIALS QUERIES
// ============================================

export const getStudyMaterialsByChapter = async (chapterId: string) => {
  const { data, error } = await supabase
    .from('study_materials')
    .select('*')
    .eq('chapter_id', chapterId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAllStudyMaterials = async () => {
  const { data, error } = await supabase
    .from('study_materials')
    .select(`
      *,
      chapter:chapters(
        *,
        subject:subjects(*)
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ============================================
// VIDEO QUERIES
// ============================================

export const getVideosByChapter = async (chapterId: string) => {
  const { data, error } = await supabase
    .from('one_shot_videos')
    .select('*')
    .eq('chapter_id', chapterId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAllVideos = async () => {
  const { data, error } = await supabase
    .from('one_shot_videos')
    .select(`
      *,
      chapter:chapters(
        *,
        subject:subjects(*)
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ============================================
// QUIZ SESSION QUERIES
// ============================================

export const createQuizSession = async (sessionData: {
  user_id: string;
  chapter_id: string;
}) => {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateQuizSession = async (
  sessionId: string,
  updates: {
    questions_attempted?: number;
    correct_answers?: number;
    score?: number;
    time_taken?: number;
    completed_at?: string;
  }
) => {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserQuizSessions = async (userId: string) => {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select(`
      *,
      chapter:chapters(
        *,
        subject:subjects(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ============================================
// ADMIN STATS QUERIES
// ============================================

export const getAdminStats = async () => {
  // Get counts for all entities
  const [usersCount, questionsCount, materialsCount, videosCount] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('study_materials').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('one_shot_videos').select('id', { count: 'exact', head: true }).eq('is_active', true)
  ]);

  return {
    totalStudents: usersCount.count || 0,
    totalQuestions: questionsCount.count || 0,
    totalMaterials: materialsCount.count || 0,
    totalVideos: videosCount.count || 0
  };
};

export const getRecentActivity = async (limit = 10) => {
  // Get recent questions
  const { data: recentQuestions } = await supabase
    .from('questions')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Get recent materials
  const { data: recentMaterials } = await supabase
    .from('study_materials')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Get recent videos
  const { data: recentVideos } = await supabase
    .from('one_shot_videos')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Get recent users
  const { data: recentUsers } = await supabase
    .from('users')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  return {
    recentQuestions: recentQuestions || [],
    recentMaterials: recentMaterials || [],
    recentVideos: recentVideos || [],
    recentUsers: recentUsers || []
  };
};

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table
      },
      callback
    )
    .subscribe();

  return channel;
};

// ============================================
// MATERIAL DOWNLOADS TRACKING
// ============================================

export const trackMaterialDownload = async (userId: string, materialId: string) => {
  try {
    // Insert or update download record
    const { error: downloadError } = await supabase
      .from('user_material_downloads')
      .upsert({
        user_id: userId,
        material_id: materialId,
        downloaded_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,material_id'
      });

    if (downloadError) throw downloadError;

    // Increment download count on material
    const { error: updateError } = await supabase.rpc('increment_download_count', {
      material_id: materialId
    });

    // If RPC doesn't exist, fallback to manual update
    if (updateError) {
      const { data: material } = await supabase
        .from('study_materials')
        .select('download_count')
        .eq('id', materialId)
        .single();

      await supabase
        .from('study_materials')
        .update({ download_count: (material?.download_count || 0) + 1 })
        .eq('id', materialId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error tracking download:', error);
    return { success: false, error };
  }
};

export const getUserDownloadedMaterials = async (userId: string, limit = 5) => {
  console.log('🔍 Fetching downloads for user:', userId);
  
  const { data, error } = await supabase
    .from('user_material_downloads')
    .select(`
      *,
      material:study_materials(
        *,
        chapter:chapters(
          *,
          subject:subjects(*)
        )
      )
    `)
    .eq('user_id', userId)
    .order('downloaded_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching downloads:', error);
    throw error;
  }
  
  console.log('✅ Downloads fetched:', data);
  return data || [];
};
