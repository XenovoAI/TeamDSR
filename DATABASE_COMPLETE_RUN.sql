
BEGIN;







ALTER TABLE study_materials 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

COMMENT ON COLUMN study_materials.thumbnail_url IS 'URL of the thumbnail image for the study material';

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'study_materials' 
AND column_name = 'thumbnail_url';





INSERT INTO subjects (name, description, icon_url, order_index, is_active) VALUES
('Mathematics', 'Math for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=math', 1, true),
('Physics', 'Physics for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=physics', 2, true),
('Chemistry', 'Chemistry for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=chemistry', 3, true),
('Biology', 'Biology for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=biology', 4, true),
('English', 'English for Class 10-12', 'https://api.dicebear.com/7.x/shapes/svg?seed=english', 5, true)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1), 'Algebra', 'Basic algebra concepts', 1, true),
((SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1), 'Geometry', 'Shapes and measurements', 2, true),
((SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1), 'Trigonometry', 'Angles and triangles', 3, true),
((SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1), 'Calculus', 'Differentiation and integration', 4, true)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'Physics' LIMIT 1), 'Mechanics', 'Motion and forces', 1, true),
((SELECT id FROM subjects WHERE name = 'Physics' LIMIT 1), 'Electricity', 'Current and circuits', 2, true),
((SELECT id FROM subjects WHERE name = 'Physics' LIMIT 1), 'Optics', 'Light and reflection', 3, true),
((SELECT id FROM subjects WHERE name = 'Physics' LIMIT 1), 'Thermodynamics', 'Heat and energy', 4, true)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'Chemistry' LIMIT 1), 'Organic Chemistry', 'Carbon compounds', 1, true),
((SELECT id FROM subjects WHERE name = 'Chemistry' LIMIT 1), 'Inorganic Chemistry', 'Elements and compounds', 2, true),
((SELECT id FROM subjects WHERE name = 'Chemistry' LIMIT 1), 'Physical Chemistry', 'Chemical reactions', 3, true),
((SELECT id FROM subjects WHERE name = 'Chemistry' LIMIT 1), 'Acids and Bases', 'pH and reactions', 4, true)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1), 'Cell Biology', 'Structure of cells', 1, true),
((SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1), 'Genetics', 'DNA and heredity', 2, true),
((SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1), 'Evolution', 'Natural selection', 3, true),
((SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1), 'Ecology', 'Ecosystems and environment', 4, true)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (subject_id, name, description, order_index, is_active) VALUES
((SELECT id FROM subjects WHERE name = 'English' LIMIT 1), 'Grammar', 'Parts of speech', 1, true),
((SELECT id FROM subjects WHERE name = 'English' LIMIT 1), 'Literature', 'Poetry and prose', 2, true),
((SELECT id FROM subjects WHERE name = 'English' LIMIT 1), 'Writing Skills', 'Essays and letters', 3, true),
((SELECT id FROM subjects WHERE name = 'English' LIMIT 1), 'Comprehension', 'Reading and understanding', 4, true)
ON CONFLICT DO NOTHING;

SELECT 
  s.name as subject,
  COUNT(c.id) as chapter_count
FROM subjects s
LEFT JOIN chapters c ON s.id = c.subject_id
GROUP BY s.id, s.name
ORDER BY s.order_index;

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




ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_study_materials_slug ON study_materials(slug);

UPDATE study_materials 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL;




ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS original_price INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_material_id ON purchases(material_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON purchases;
DROP POLICY IF EXISTS "Service role can do anything" ON purchases;

CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow all for service role" ON purchases
  FOR ALL USING (true);




ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS has_hard_copy BOOLEAN DEFAULT false;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS hard_copy_price INTEGER DEFAULT 0;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS shipping_cost INTEGER DEFAULT 50;

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'digital'; -- 'digital' or 'physical'
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending'; -- pending, processing, shipped, delivered, cancelled
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shiprocket_shipment_id TEXT;

CREATE TABLE IF NOT EXISTS shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_delivery_type ON purchases(delivery_type);
CREATE INDEX IF NOT EXISTS idx_purchases_delivery_status ON purchases(delivery_status);

ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON shipping_addresses;

CREATE POLICY "Users can view own addresses" ON shipping_addresses
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own addresses" ON shipping_addresses
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own addresses" ON shipping_addresses
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own addresses" ON shipping_addresses
  FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Allow all for service role on addresses" ON shipping_addresses
  FOR ALL USING (true);




CREATE TABLE IF NOT EXISTS hard_copy_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 299,
  original_price DECIMAL(10,2),
  shipping_cost DECIMAL(10,2) DEFAULT 50,
  stock_quantity INTEGER DEFAULT 100,
  weight_kg DECIMAL(5,2) DEFAULT 0.5,
  dimensions_cm VARCHAR(50) DEFAULT '25x20x3',
  subject_id UUID REFERENCES subjects(id),
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'digital';
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);

ALTER TABLE purchases ALTER COLUMN material_id DROP NOT NULL;
ALTER TABLE purchases ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE hard_copy_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active products" ON hard_copy_products;
CREATE POLICY "Anyone can view active products" ON hard_copy_products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can insert products" ON hard_copy_products;
CREATE POLICY "Anyone can insert products" ON hard_copy_products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update products" ON hard_copy_products;
CREATE POLICY "Anyone can update products" ON hard_copy_products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete products" ON hard_copy_products;
CREATE POLICY "Anyone can delete products" ON hard_copy_products FOR DELETE USING (true);

GRANT ALL ON hard_copy_products TO anon;
GRANT ALL ON hard_copy_products TO authenticated;





CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  default_discount_value DECIMAL(10,2) DEFAULT 0, -- Default discount if no product-specific discount
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER, -- NULL means unlimited
  times_used INTEGER DEFAULT 0,
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2), -- Cap for percentage discounts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  discount_value DECIMAL(10,2) NOT NULL, -- Product-specific discount
  applies_to VARCHAR(20) DEFAULT 'both' CHECK (applies_to IN ('digital', 'hard_copy', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, material_id)
);

CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  discount_applied DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10,2);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_products_coupon ON coupon_products(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_products_material ON coupon_products(material_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Allow all for service role on coupons" ON coupons FOR ALL USING (true);

CREATE POLICY "Allow read coupon_products" ON coupon_products FOR SELECT USING (true);
CREATE POLICY "Allow all for service role on coupon_products" ON coupon_products FOR ALL USING (true);

CREATE POLICY "Allow read own coupon_usage" ON coupon_usage FOR SELECT USING (true);
CREATE POLICY "Allow insert coupon_usage" ON coupon_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all for service role on coupon_usage" ON coupon_usage FOR ALL USING (true);





ALTER TABLE coupon_products ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES hard_copy_products(id) ON DELETE CASCADE;

ALTER TABLE coupon_products ALTER COLUMN material_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_coupon_products_product ON coupon_products(product_id);






CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons 
  SET times_used = times_used + 1,
      updated_at = NOW()
  WHERE id = NEW.coupon_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_coupon_usage ON coupon_usage;
CREATE TRIGGER trigger_increment_coupon_usage
  AFTER INSERT ON coupon_usage
  FOR EACH ROW
  EXECUTE FUNCTION increment_coupon_usage();

UPDATE coupons c
SET times_used = (
  SELECT COUNT(*)
  FROM coupon_usage cu
  WHERE cu.coupon_id = c.id
),
updated_at = NOW();

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupon_usage' AND column_name = 'purchase_id'
  ) THEN
    ALTER TABLE coupon_usage 
    ADD COLUMN purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coupon_usage_purchase ON coupon_usage(purchase_id);

CREATE OR REPLACE VIEW coupon_analytics AS
SELECT 
  c.id,
  c.code,
  c.description,
  c.discount_type,
  c.default_discount_value,
  c.is_active,
  c.usage_limit,
  c.times_used,
  COUNT(DISTINCT cu.user_id) as unique_users,
  COALESCE(SUM(cu.discount_applied), 0) as total_discount_given,
  COALESCE(SUM(p.amount), 0) as total_revenue_generated,
  c.created_at,
  c.start_date,
  c.end_date
FROM coupons c
LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
LEFT JOIN purchases p ON cu.purchase_id = p.id
GROUP BY c.id, c.code, c.description, c.discount_type, c.default_discount_value, 
         c.is_active, c.usage_limit, c.times_used, c.created_at, c.start_date, c.end_date;

GRANT SELECT ON coupon_analytics TO authenticated, anon;




ALTER TABLE coupon_products 
DROP CONSTRAINT IF EXISTS coupon_products_coupon_id_fkey;

ALTER TABLE coupon_products
ADD CONSTRAINT coupon_products_coupon_id_fkey 
FOREIGN KEY (coupon_id) 
REFERENCES coupons(id) 
ON DELETE CASCADE;

ALTER TABLE coupon_usage
DROP CONSTRAINT IF EXISTS coupon_usage_coupon_id_fkey;

ALTER TABLE coupon_usage
ADD CONSTRAINT coupon_usage_coupon_id_fkey
FOREIGN KEY (coupon_id)
REFERENCES coupons(id)
ON DELETE CASCADE;

DROP POLICY IF EXISTS "Allow read coupons" ON coupons;
DROP POLICY IF EXISTS "Allow all for service role on coupons" ON coupons;
DROP POLICY IF EXISTS "Allow admin all on coupons" ON coupons;

CREATE POLICY "Allow read coupons" 
ON coupons FOR SELECT 
USING (true);

CREATE POLICY "Allow insert coupons for service role" 
ON coupons FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update coupons for service role" 
ON coupons FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete coupons for service role" 
ON coupons FOR DELETE 
USING (true);

DROP POLICY IF EXISTS "Allow read coupon_products" ON coupon_products;
DROP POLICY IF EXISTS "Allow all for service role on coupon_products" ON coupon_products;

CREATE POLICY "Allow read coupon_products" 
ON coupon_products FOR SELECT 
USING (true);

CREATE POLICY "Allow insert coupon_products" 
ON coupon_products FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update coupon_products" 
ON coupon_products FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete coupon_products" 
ON coupon_products FOR DELETE 
USING (true);

DROP POLICY IF EXISTS "Allow read own coupon_usage" ON coupon_usage;
DROP POLICY IF EXISTS "Allow insert coupon_usage" ON coupon_usage;
DROP POLICY IF EXISTS "Allow all for service role on coupon_usage" ON coupon_usage;

CREATE POLICY "Allow read coupon_usage" 
ON coupon_usage FOR SELECT 
USING (true);

CREATE POLICY "Allow insert coupon_usage" 
ON coupon_usage FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update coupon_usage" 
ON coupon_usage FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete coupon_usage" 
ON coupon_usage FOR DELETE 
USING (true);

SELECT 
  'coupons' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'coupons'
UNION ALL
SELECT 
  'coupon_products' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'coupon_products'
UNION ALL
SELECT 
  'coupon_usage' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'coupon_usage';





INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

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




INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO NOTHING;


CREATE POLICY "Public can view study materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-materials');

CREATE POLICY "Authenticated users can upload study materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'study-materials');

CREATE POLICY "Authenticated users can update study materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'study-materials');

CREATE POLICY "Authenticated users can delete study materials"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'study-materials');

SELECT * FROM storage.buckets WHERE id = 'study-materials';



CREATE TABLE IF NOT EXISTS user_material_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

CREATE INDEX IF NOT EXISTS idx_user_material_downloads_user_id ON user_material_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_material_downloads_material_id ON user_material_downloads(material_id);
CREATE INDEX IF NOT EXISTS idx_user_material_downloads_downloaded_at ON user_material_downloads(downloaded_at DESC);

ALTER TABLE user_material_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own downloads"
  ON user_material_downloads FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own downloads"
  ON user_material_downloads FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

GRANT ALL ON user_material_downloads TO authenticated;
GRANT ALL ON user_material_downloads TO anon;


CREATE OR REPLACE FUNCTION increment_download_count(material_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE study_materials
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO anon;



DROP TABLE IF EXISTS user_material_downloads CASCADE;

CREATE TABLE user_material_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  material_id UUID NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

CREATE INDEX idx_user_downloads_user ON user_material_downloads(user_id);
CREATE INDEX idx_user_downloads_material ON user_material_downloads(material_id);
CREATE INDEX idx_user_downloads_date ON user_material_downloads(downloaded_at DESC);

ALTER TABLE user_material_downloads DISABLE ROW LEVEL SECURITY;

GRANT ALL ON user_material_downloads TO anon;
GRANT ALL ON user_material_downloads TO authenticated;

CREATE OR REPLACE FUNCTION increment_download_count(material_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE study_materials
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO authenticated;


SELECT 'Table created successfully!' as status;
SELECT COUNT(*) as total_records FROM user_material_downloads;





ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

ALTER TABLE subjects ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE chapters ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

UPDATE subjects SET is_active = true WHERE is_active IS NULL;
UPDATE chapters SET is_active = true WHERE is_active IS NULL;


CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq',
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  explanation_audio_url TEXT,
  difficulty TEXT DEFAULT 'medium',
  tags TEXT[],
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  file_size INTEGER,
  page_count INTEGER,
  is_premium BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS one_shot_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  views_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id),
  chapter_id UUID REFERENCES chapters(id),
  questions_attempted INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  score DECIMAL(5,2),
  time_taken INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  user_answer TEXT,
  is_correct BOOLEAN,
  time_taken INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_question_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id),
  prompt TEXT NOT NULL,
  generated_questions JSONB,
  model_used TEXT,
  tokens_used INTEGER,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_shot_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_question_logs ENABLE ROW LEVEL SECURITY;


DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
              AND tablename IN ('subjects', 'chapters', 'questions', 'study_materials', 
                               'one_shot_videos', 'quiz_sessions', 'question_answers', 'ai_question_logs'))
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active subjects" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage subjects" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active chapters" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage chapters" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active questions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage questions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active materials" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage materials" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active videos" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage videos" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own sessions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can create sessions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own sessions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own answers" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can create answers" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can view AI logs" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can create AI logs" ON ' || r.tablename;
    END LOOP;
END $$;

CREATE POLICY "Allow all on subjects" ON subjects FOR ALL USING (true);
CREATE POLICY "Allow all on chapters" ON chapters FOR ALL USING (true);
CREATE POLICY "Allow all on questions" ON questions FOR ALL USING (true);
CREATE POLICY "Allow all on study_materials" ON study_materials FOR ALL USING (true);
CREATE POLICY "Allow all on one_shot_videos" ON one_shot_videos FOR ALL USING (true);
CREATE POLICY "Allow all on quiz_sessions" ON quiz_sessions FOR ALL USING (true);
CREATE POLICY "Allow all on question_answers" ON question_answers FOR ALL USING (true);
CREATE POLICY "Allow all on ai_question_logs" ON ai_question_logs FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_materials_chapter ON study_materials(chapter_id);
CREATE INDEX IF NOT EXISTS idx_videos_chapter ON one_shot_videos(chapter_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_chapter ON quiz_sessions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON question_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON question_answers(question_id);

DO $$
BEGIN
  RAISE NOTICE '✅ ✅ ✅ Admin panel setup complete! ✅ ✅ ✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Make yourself an admin by running:';
  RAISE NOTICE 'UPDATE users SET role = ''admin'', is_admin = true WHERE email = ''your-email@gmail.com'';';
  RAISE NOTICE '';
  RAISE NOTICE 'Then visit: http://localhost:5000/admin';
END $$;


COMMIT;

