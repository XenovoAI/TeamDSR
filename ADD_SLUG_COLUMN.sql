-- Add slug column to study_materials table for SEO-friendly URLs
-- Run this in Supabase SQL Editor

-- Add slug column
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_study_materials_slug ON study_materials(slug);

-- Update existing materials with auto-generated slugs from title
UPDATE study_materials 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL;
