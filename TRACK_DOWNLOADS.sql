-- Create table to track user material downloads
CREATE TABLE IF NOT EXISTS user_material_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_material_downloads_user_id ON user_material_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_material_downloads_material_id ON user_material_downloads(material_id);
CREATE INDEX IF NOT EXISTS idx_user_material_downloads_downloaded_at ON user_material_downloads(downloaded_at DESC);

-- Enable RLS
ALTER TABLE user_material_downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own downloads"
  ON user_material_downloads FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own downloads"
  ON user_material_downloads FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Grant permissions
GRANT ALL ON user_material_downloads TO authenticated;
GRANT ALL ON user_material_downloads TO anon;


-- Create function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(material_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE study_materials
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO anon;
