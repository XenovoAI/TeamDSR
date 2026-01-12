-- =============================================
-- HARD COPY PRODUCTS TABLE (Separate from Digital)
-- Run this in Supabase SQL Editor
-- =============================================

-- Create hard_copy_products table
CREATE TABLE IF NOT EXISTS hard_copy_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2),
  shipping_cost DECIMAL(10,2) DEFAULT 50,
  stock_quantity INTEGER DEFAULT 100,
  weight_kg DECIMAL(5,2) DEFAULT 0.5,
  dimensions_cm VARCHAR(50) DEFAULT '25x20x3',
  category VARCHAR(100),
  subject_id UUID REFERENCES subjects(id),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hard_copy_products_slug ON hard_copy_products(slug);
CREATE INDEX IF NOT EXISTS idx_hard_copy_products_active ON hard_copy_products(is_active);
CREATE INDEX IF NOT EXISTS idx_hard_copy_products_subject ON hard_copy_products(subject_id);

-- Enable RLS
ALTER TABLE hard_copy_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active hard copy products"
  ON hard_copy_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage hard copy products"
  ON hard_copy_products FOR ALL
  USING (true);

-- Update purchases table to support hard copy products
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES hard_copy_products(id);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'digital';

-- Create index for product lookups
CREATE INDEX IF NOT EXISTS idx_purchases_product ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_type ON purchases(product_type);

-- Grant permissions
GRANT ALL ON hard_copy_products TO authenticated;
GRANT SELECT ON hard_copy_products TO anon;
