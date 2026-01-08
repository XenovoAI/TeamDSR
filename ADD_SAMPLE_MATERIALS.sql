-- ============================================
-- ADD SAMPLE STUDY MATERIALS
-- Run this in Supabase SQL Editor
-- ============================================

-- First, let's check if we have subjects and chapters
SELECT 'Subjects:' as info, COUNT(*) as count FROM subjects;
SELECT 'Chapters:' as info, COUNT(*) as count FROM chapters;

-- Add sample study materials for each chapter
INSERT INTO study_materials (chapter_id, title, description, material_type, file_url, is_premium, download_count, is_active)
SELECT 
  c.id,
  c.name || ' - Complete Notes',
  'Comprehensive study notes covering all important topics in ' || c.name || ' for NEET preparation.',
  'pdf',
  'https://example.com/materials/' || LOWER(REPLACE(c.name, ' ', '-')) || '-notes.pdf',
  false,
  FLOOR(RANDOM() * 1000 + 100)::int,
  true
FROM chapters c
WHERE c.is_active = true;

-- Add more materials (formula sheets)
INSERT INTO study_materials (chapter_id, title, description, material_type, file_url, is_premium, download_count, is_active)
SELECT 
  c.id,
  c.name || ' - Formula Sheet',
  'Quick reference formula sheet for ' || c.name || '. Perfect for last-minute revision.',
  'pdf',
  'https://example.com/materials/' || LOWER(REPLACE(c.name, ' ', '-')) || '-formulas.pdf',
  false,
  FLOOR(RANDOM() * 500 + 50)::int,
  true
FROM chapters c
WHERE c.is_active = true;

-- Add premium materials (mind maps)
INSERT INTO study_materials (chapter_id, title, description, material_type, file_url, is_premium, download_count, is_active)
SELECT 
  c.id,
  c.name || ' - Mind Map',
  'Visual mind map for ' || c.name || '. Great for understanding concepts at a glance.',
  'pdf',
  'https://example.com/materials/' || LOWER(REPLACE(c.name, ' ', '-')) || '-mindmap.pdf',
  true,
  FLOOR(RANDOM() * 300 + 20)::int,
  true
FROM chapters c
WHERE c.is_active = true
LIMIT 10;

-- Verify the materials were added
SELECT 
  sm.title,
  c.name as chapter,
  s.name as subject,
  sm.download_count,
  sm.is_active
FROM study_materials sm
JOIN chapters c ON sm.chapter_id = c.id
JOIN subjects s ON c.subject_id = s.id
ORDER BY s.order_index, c.order_index
LIMIT 20;

-- Count total materials
SELECT 'Total Materials Added:' as info, COUNT(*) as count FROM study_materials;

-- Success message
DO $
BEGIN
  RAISE NOTICE '✅ Sample materials added successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Now refresh the /materials page to see the study materials.';
END $;
