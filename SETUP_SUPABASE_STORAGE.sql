-- ============================================
-- SETUP SUPABASE STORAGE FOR FILE UPLOADS
-- Run this in Supabase SQL Editor
-- ============================================

-- Create storage bucket for study materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for audio (voice explanations)
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for study-materials bucket
CREATE POLICY "Anyone can view study materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-materials');

CREATE POLICY "Authenticated users can upload study materials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'study-materials');

CREATE POLICY "Authenticated users can update study materials"
ON storage.objects FOR UPDATE
USING (bucket_id = 'study-materials');

CREATE POLICY "Authenticated users can delete study materials"
ON storage.objects FOR DELETE
USING (bucket_id = 'study-materials');

-- Set up storage policies for videos bucket
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos');

-- Set up storage policies for audio bucket
CREATE POLICY "Anyone can view audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Authenticated users can update audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'audio');

CREATE POLICY "Authenticated users can delete audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'audio');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Storage buckets created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created buckets:';
  RAISE NOTICE '- study-materials (for PDFs, documents)';
  RAISE NOTICE '- videos (for one-shot videos)';
  RAISE NOTICE '- audio (for voice explanations)';
  RAISE NOTICE '';
  RAISE NOTICE 'All buckets are public and ready for uploads!';
END $$;
