-- ============================================
-- TEAM DSR ADMIN PANEL - FINAL SETUP
-- Run this script in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: UPDATE EXISTING TABLES
-- ============================================

-- Add admin columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add missing columns to subjects table (if it exists)
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to chapters table (if it exists)
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing rows to have is_active = true
UPDATE subjects SET is_active = true WHERE is_active IS NULL;
UPDATE chapters SET is_active = true WHERE is_active IS NULL;

-- ============================================
-- PART 2: CREATE NEW TABLES
-- ============================================

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq',
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  explanation_audio_url TEXT,
  difficulty TEXT DEFAULT 'medium',
  tags TEXT[],
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Materials Table
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  file_size INTEGER,
  page_count INTEGER,
  is_premium BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- One Shot Videos Table
CREATE TABLE IF NOT EXISTS one_shot_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  views_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Sessions Table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id),
  chapter_id UUID REFERENCES chapters(id),
  questions_attempted INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  score DECIMAL(5,2),
  time_taken INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Answers Table
CREATE TABLE IF NOT EXISTS question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  user_answer TEXT,
  is_correct BOOLEAN,
  time_taken INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Question Logs
CREATE TABLE IF NOT EXISTS ai_question_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id),
  prompt TEXT NOT NULL,
  generated_questions JSONB,
  model_used TEXT,
  tokens_used INTEGER,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_shot_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_question_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 4: CREATE POLICIES (Simple version)
-- ============================================

-- Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
              AND tablename IN ('subjects', 'chapters', 'questions', 'study_materials', 
                               'one_shot_videos', 'quiz_sessions', 'question_answers', 'ai_question_logs'))
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active subjects" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage subjects" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active chapters" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage chapters" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active questions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage questions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active materials" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage materials" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active videos" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage videos" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own sessions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can create sessions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own sessions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own answers" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can create answers" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can view AI logs" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can create AI logs" ON ' || r.tablename;
    END LOOP;
END $$;

-- Create simple policies (allow all for now)
CREATE POLICY "Allow all on subjects" ON subjects FOR ALL USING (true);
CREATE POLICY "Allow all on chapters" ON chapters FOR ALL USING (true);
CREATE POLICY "Allow all on questions" ON questions FOR ALL USING (true);
CREATE POLICY "Allow all on study_materials" ON study_materials FOR ALL USING (true);
CREATE POLICY "Allow all on one_shot_videos" ON one_shot_videos FOR ALL USING (true);
CREATE POLICY "Allow all on quiz_sessions" ON quiz_sessions FOR ALL USING (true);
CREATE POLICY "Allow all on question_answers" ON question_answers FOR ALL USING (true);
CREATE POLICY "Allow all on ai_question_logs" ON ai_question_logs FOR ALL USING (true);

-- ============================================
-- PART 5: CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_materials_chapter ON study_materials(chapter_id);
CREATE INDEX IF NOT EXISTS idx_videos_chapter ON one_shot_videos(chapter_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_chapter ON quiz_sessions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON question_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON question_answers(question_id);

-- ============================================
-- SUCCESS!
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ ✅ ✅ Admin panel setup complete! ✅ ✅ ✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Make yourself an admin by running:';
  RAISE NOTICE 'UPDATE users SET role = ''admin'', is_admin = true WHERE email = ''your-email@gmail.com'';';
  RAISE NOTICE '';
  RAISE NOTICE 'Then visit: http://localhost:5000/admin';
END $$;
