-- Drop existing table if it exists (to start fresh)
DROP TABLE IF EXISTS user_material_downloads CASCADE;

-- Create table to track user material downloads
CREATE TABLE user_material_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  material_id UUID NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_user_downloads_user ON user_material_downloads(user_id);
CREATE INDEX idx_user_downloads_material ON user_material_downloads(material_id);
CREATE INDEX idx_user_downloads_date ON user_material_downloads(downloaded_at DESC);

-- Disable RLS temporarily for testing (you can enable it later)
ALTER TABLE user_material_downloads DISABLE ROW LEVEL SECURITY;

-- Grant full access for testing
GRANT ALL ON user_material_downloads TO anon;
GRANT ALL ON user_material_downloads TO authenticated;

-- Create or replace the increment function
CREATE OR REPLACE FUNCTION increment_download_count(material_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE study_materials
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO authenticated;

-- Test: Insert a sample record (replace with your actual user_id and material_id)
-- INSERT INTO user_material_downloads (user_id, material_id) 
-- VALUES ('your-user-id-here', 'your-material-id-here');

-- Verify table was created
SELECT 'Table created successfully!' as status;
SELECT COUNT(*) as total_records FROM user_material_downloads;
