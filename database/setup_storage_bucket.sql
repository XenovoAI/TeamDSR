-- ============================================
-- SETUP STORAGE BUCKET FOR MATERIALS & THUMBNAILS
-- ============================================
-- Run this script to create the storage bucket for uploading files

-- Create storage bucket for study materials and thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Allow public to view/download files
CREATE POLICY "Public can view study materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-materials');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload study materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'study-materials');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update study materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'study-materials');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete study materials"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'study-materials');

-- Verify bucket was created
SELECT * FROM storage.buckets WHERE id = 'study-materials';
