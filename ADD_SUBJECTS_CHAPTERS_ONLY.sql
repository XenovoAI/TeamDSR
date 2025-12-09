-- ============================================
-- ADD SUBJECTS AND CHAPTERS ONLY
-- Run this in Supabase SQL Editor
-- ============================================

-- First, make sure tables exist and have correct structure
-- If you haven't run ADMIN_SETUP_FINAL.sql yet, run it first!

-- Add Subjects
INSERT INTO subjects (name, description, icon_url, order_index, is_active) VALUES
('Mathematics', 'Math for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=math', 1, true),
('Physics', 'Physics for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=physics', 2, true),
('Chemistry', 'Chemistry for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=chemistry', 3, true),
('Biology', 'Biology for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=biology', 4, true),
('English', 'English for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=english', 5, true)
ON CONFLICT DO NOTHING;

-- Add Chapters for Mathematics
INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1), 'Algebra', 'Basic algebra concepts', 1, true),
((SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1), 'Geometry', 'Shapes and measurements', 2, true),
((SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1), 'Trigonometry', 'Angles and triangles', 3, true),
((SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1), 'Calculus', 'Differentiation and integration', 4, true)
ON CONFLICT DO NOTHING;

-- Add Chapters for Physics
INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'Physics' LIMIT 1), 'Mechanics', 'Motion and forces', 1, true),
((SELECT id FROM subjects WHERE name = 'Physics' LIMIT 1), 'Electricity', 'Current and circuits', 2, true),
((SELECT id FROM subjects WHERE name = 'Physics' LIMIT 1), 'Optics', 'Light and reflection', 3, true),
((SELECT id FROM subjects WHERE name = 'Physics' LIMIT 1), 'Thermodynamics', 'Heat and energy', 4, true)
ON CONFLICT DO NOTHING;

-- Add Chapters for Chemistry
INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'Chemistry' LIMIT 1), 'Organic Chemistry', 'Carbon compounds', 1, true),
((SELECT id FROM subjects WHERE name = 'Chemistry' LIMIT 1), 'Inorganic Chemistry', 'Elements and compounds', 2, true),
((SELECT id FROM subjects WHERE name = 'Chemistry' LIMIT 1), 'Physical Chemistry', 'Chemical reactions', 3, true),
((SELECT id FROM subjects WHERE name = 'Chemistry' LIMIT 1), 'Acids and Bases', 'pH and reactions', 4, true)
ON CONFLICT DO NOTHING;

-- Add Chapters for Biology
INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1), 'Cell Biology', 'Structure of cells', 1, true),
((SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1), 'Genetics', 'DNA and heredity', 2, true),
((SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1), 'Evolution', 'Natural selection', 3, true),
((SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1), 'Ecology', 'Ecosystems and environment', 4, true)
ON CONFLICT DO NOTHING;

-- Add Chapters for English
INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'English' LIMIT 1), 'Grammar', 'Parts of speech', 1, true),
((SELECT id FROM subjects WHERE name = 'English' LIMIT 1), 'Literature', 'Poetry and prose', 2, true),
((SELECT id FROM subjects WHERE name = 'English' LIMIT 1), 'Writing Skills', 'Essays and letters', 3, true),
((SELECT id FROM subjects WHERE name = 'English' LIMIT 1), 'Comprehension', 'Reading and understanding', 4, true)
ON CONFLICT DO NOTHING;

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
  RAISE NOTICE '✅ Subjects and chapters added successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Added:';
  RAISE NOTICE '- 5 Subjects';
  RAISE NOTICE '- 20 Chapters';
  RAISE NOTICE '';
  RAISE NOTICE 'Now refresh /admin/questions and the dropdowns will work!';
END $$;
