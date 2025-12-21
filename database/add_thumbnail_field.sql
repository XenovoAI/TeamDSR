-- ============================================
-- ADD THUMBNAIL FIELD TO STUDY MATERIALS
-- ============================================
-- Run this script if you already have the study_materials table
-- and just need to add the thumbnail_url field

-- Add thumbnail_url column to study_materials table
ALTER TABLE study_materials 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN study_materials.thumbnail_url IS 'URL of the thumbnail image for the study material';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'study_materials' 
AND column_name = 'thumbnail_url';
