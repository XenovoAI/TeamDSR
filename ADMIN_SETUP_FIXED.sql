-- ============================================
-- TEAM DSR ADMIN PANEL DATABASE SCHEMA
-- STEP-BY-STEP SETUP (Run this entire script)
-- ============================================

-- ============================================
-- STEP 1: ADD ADMIN COLUMNS TO USERS TABLE
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- ============================================
-- STEP 2: CREATE NEW TABLES
-- ============================================

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  class TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapters Table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- AI Generated Questions Log
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
-- STEP 3: ENABLE ROW LEVEL SECURITY
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
-- STEP 4: CREATE POLICIES
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view active subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can manage subjects" ON subjects;
DROP POLICY IF EXISTS "Anyone can view active chapters" ON chapters;
DROP POLICY IF EXISTS "Admins can manage chapters" ON chapters;
DROP POLICY IF EXISTS "Anyone can view active questions" ON questions;
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Anyone can view active materials" ON study_materials;
DROP POLICY IF EXISTS "Admins can manage materials" ON study_materials;
DROP POLICY IF EXISTS "Anyone can view active videos" ON one_shot_videos;
DROP POLICY IF EXISTS "Admins can manage videos" ON one_shot_videos;
DROP POLICY IF EXISTS "Users can view own sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can view own answers" ON question_answers;
DROP POLICY IF EXISTS "Users can create answers" ON question_answers;
DROP POLICY IF EXISTS "Admins can view AI logs" ON ai_question_logs;
DROP POLICY IF EXISTS "Admins can create AI logs" ON ai_question_logs;

-- Create new policies
CREATE POLICY "Anyone can view active subjects" ON subjects FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage subjects" ON subjects FOR ALL USING (true);

CREATE POLICY "Anyone can view active chapters" ON chapters FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage chapters" ON chapters FOR ALL USING (true);

CREATE POLICY "Anyone can view active questions" ON questions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage questions" ON questions FOR ALL USING (true);

CREATE POLICY "Anyone can view active materials" ON study_materials FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage materials" ON study_materials FOR ALL USING (true);

CREATE POLICY "Anyone can view active videos" ON one_shot_videos FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage videos" ON one_shot_videos FOR ALL USING (true);

CREATE POLICY "Users can view own sessions" ON quiz_sessions FOR SELECT USING (true);
CREATE POLICY "Users can create sessions" ON quiz_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own sessions" ON quiz_sessions FOR UPDATE USING (true);

CREATE POLICY "Users can view own answers" ON question_answers FOR SELECT USING (true);
CREATE POLICY "Users can create answers" ON question_answers FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view AI logs" ON ai_question_logs FOR SELECT USING (true);
CREATE POLICY "Admins can create AI logs" ON ai_question_logs FOR INSERT WITH CHECK (true);

-- ============================================
-- STEP 5: CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_materials_chapter ON study_materials(chapter_id);
CREATE INDEX IF NOT EXISTS idx_videos_chapter ON one_shot_videos(chapter_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_chapter ON quiz_sessions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON question_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON question_answers(question_id);

-- ============================================
-- STEP 6: INSERT SAMPLE DATA
-- ============================================
INSERT INTO subjects (name, class, description, order_index) VALUES
('Mathematics', 'Class 10', 'Complete CBSE Class 10 Mathematics', 1),
('Science', 'Class 10', 'Physics, Chemistry, and Biology', 2),
('Social Science', 'Class 10', 'History, Geography, Civics, Economics', 3),
('English', 'Class 10', 'Literature and Language', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert sample chapters for Mathematics
INSERT INTO chapters (subject_id, name, description, order_index)
SELECT id, 'Real Numbers', 'Euclid''s division algorithm, HCF, LCM', 1
FROM subjects WHERE name = 'Mathematics' AND class = 'Class 10'
ON CONFLICT DO NOTHING;

INSERT INTO chapters (subject_id, name, description, order_index)
SELECT id, 'Polynomials', 'Zeros of polynomial, relationship between zeros and coefficients', 2
FROM subjects WHERE name = 'Mathematics' AND class = 'Class 10'
ON CONFLICT DO NOTHING;

INSERT INTO chapters (subject_id, name, description, order_index)
SELECT id, 'Linear Equations', 'Pair of linear equations in two variables', 3
FROM subjects WHERE name = 'Mathematics' AND class = 'Class 10'
ON CONFLICT DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Admin panel database setup complete!';
  RAISE NOTICE 'Next step: Run this SQL to make yourself an admin:';
  RAISE NOTICE 'UPDATE users SET role = ''admin'', is_admin = true WHERE email = ''your-email@gmail.com'';';
END $$;
