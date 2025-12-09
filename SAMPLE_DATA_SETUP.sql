-- ============================================
-- SAMPLE DATA FOR TESTING
-- Run this in Supabase SQL Editor
-- ============================================

-- Add Subjects
INSERT INTO subjects (name, description, icon_url, order_index, is_active) VALUES
('Mathematics', 'Math for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=math', 1, true),
('Physics', 'Physics for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=physics', 2, true),
('Chemistry', 'Chemistry for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=chemistry', 3, true),
('Biology', 'Biology for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=biology', 4, true),
('English', 'English for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=english', 5, true);

-- Get subject IDs (you'll need to replace these with actual IDs after running the above)
-- To get IDs, run: SELECT id, name FROM subjects;

-- Add Chapters for Mathematics (replace 'MATH_SUBJECT_ID' with actual ID)
INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1), 'Algebra', 'Basic algebra concepts', 1, true),
((SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1), 'Geometry', 'Shapes and measurements', 2, true),
((SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1), 'Trigonometry', 'Angles and triangles', 3, true),
((SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1), 'Calculus', 'Differentiation and integration', 4, true);

-- Add Chapters for Physics
INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'Physics' LIMIT 1), 'Mechanics', 'Motion and forces', 1, true),
((SELECT id FROM subjects WHERE name = 'Physics' LIMIT 1), 'Electricity', 'Current and circuits', 2, true),
((SELECT id FROM subjects WHERE name = 'Physics' LIMIT 1), 'Optics', 'Light and reflection', 3, true),
((SELECT id FROM subjects WHERE name = 'Physics' LIMIT 1), 'Thermodynamics', 'Heat and energy', 4, true);

-- Add Chapters for Chemistry
INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'Chemistry' LIMIT 1), 'Organic Chemistry', 'Carbon compounds', 1, true),
((SELECT id FROM subjects WHERE name = 'Chemistry' LIMIT 1), 'Inorganic Chemistry', 'Elements and compounds', 2, true),
((SELECT id FROM subjects WHERE name = 'Chemistry' LIMIT 1), 'Physical Chemistry', 'Chemical reactions', 3, true),
((SELECT id FROM subjects WHERE name = 'Chemistry' LIMIT 1), 'Acids and Bases', 'pH and reactions', 4, true);

-- Add Chapters for Biology
INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1), 'Cell Biology', 'Structure of cells', 1, true),
((SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1), 'Genetics', 'DNA and heredity', 2, true),
((SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1), 'Evolution', 'Natural selection', 3, true),
((SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1), 'Ecology', 'Ecosystems and environment', 4, true);

-- Add Chapters for English
INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'English' LIMIT 1), 'Grammar', 'Parts of speech', 1, true),
((SELECT id FROM subjects WHERE name = 'English' LIMIT 1), 'Literature', 'Poetry and prose', 2, true),
((SELECT id FROM subjects WHERE name = 'English' LIMIT 1), 'Writing Skills', 'Essays and letters', 3, true),
((SELECT id FROM subjects WHERE name = 'English' LIMIT 1), 'Comprehension', 'Reading and understanding', 4, true);

-- Add a sample question for testing
INSERT INTO questions (
  chapter_id,
  question_text,
  question_type,
  options,
  correct_answer,
  explanation,
  difficulty,
  is_active
) VALUES (
  (SELECT id FROM chapters WHERE name = 'Algebra' LIMIT 1),
  'What is the value of x in the equation: 2x + 5 = 15?',
  'mcq',
  '["5", "10", "7.5", "12"]',
  '5',
  'Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5',
  'easy',
  true
);

-- Verify the data
SELECT 
  s.name as subject,
  COUNT(c.id) as chapter_count
FROM subjects s
LEFT JOIN chapters c ON s.id = c.subject_id
GROUP BY s.id, s.name
ORDER BY s.order_index;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Sample data added successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Added:';
  RAISE NOTICE '- 5 Subjects (Math, Physics, Chemistry, Biology, English)';
  RAISE NOTICE '- 20 Chapters (4 per subject)';
  RAISE NOTICE '- 1 Sample question';
  RAISE NOTICE '';
  RAISE NOTICE 'Now you can:';
  RAISE NOTICE '1. Go to /admin/questions';
  RAISE NOTICE '2. Click "Add Question"';
  RAISE NOTICE '3. Select subject and chapter from dropdowns';
  RAISE NOTICE '4. Create questions!';
END $$;
