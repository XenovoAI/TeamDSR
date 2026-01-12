-- =============================================
-- HARD COPY PRODUCTS - Simple Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create hard_copy_products table
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

-- 2. Add columns to purchases table for hard copy products
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'digital';

-- 3. Enable RLS
ALTER TABLE hard_copy_products ENABLE ROW LEVEL SECURITY;

-- 4. Simple RLS policies
DROP POLICY IF EXISTS "Anyone can view active products" ON hard_copy_products;
CREATE POLICY "Anyone can view active products" ON hard_copy_products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can insert products" ON hard_copy_products;
CREATE POLICY "Anyone can insert products" ON hard_copy_products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update products" ON hard_copy_products;
CREATE POLICY "Anyone can update products" ON hard_copy_products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete products" ON hard_copy_products;
CREATE POLICY "Anyone can delete products" ON hard_copy_products FOR DELETE USING (true);

-- 5. Grant permissions
GRANT ALL ON hard_copy_products TO anon;
GRANT ALL ON hard_copy_products TO authenticated;

-- Done! Now you can add hard copy products from /admin/hardcopy
