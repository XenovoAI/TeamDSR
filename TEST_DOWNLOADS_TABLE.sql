-- Test if the table exists and check its structure
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_material_downloads'
) as table_exists;

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_material_downloads'
ORDER BY ordinal_position;

-- Check if there are any records
SELECT COUNT(*) as total_downloads FROM user_material_downloads;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_material_downloads';
