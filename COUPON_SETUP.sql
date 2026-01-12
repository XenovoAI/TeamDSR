-- Coupon System Setup for NEETPeak
-- Run this in Supabase SQL Editor

-- 1. Create coupons table
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

-- 2. Create coupon_products table (for product-specific discounts)
CREATE TABLE IF NOT EXISTS coupon_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  discount_value DECIMAL(10,2) NOT NULL, -- Product-specific discount
  applies_to VARCHAR(20) DEFAULT 'both' CHECK (applies_to IN ('digital', 'hard_copy', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, material_id)
);

-- 3. Create coupon_usage table (track who used which coupon)
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  discount_applied DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add coupon fields to purchases table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10,2);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_products_coupon ON coupon_products(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_products_material ON coupon_products(material_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);

-- 6. Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies - Allow read for all, write for service role
CREATE POLICY "Allow read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Allow all for service role on coupons" ON coupons FOR ALL USING (true);

CREATE POLICY "Allow read coupon_products" ON coupon_products FOR SELECT USING (true);
CREATE POLICY "Allow all for service role on coupon_products" ON coupon_products FOR ALL USING (true);

CREATE POLICY "Allow read own coupon_usage" ON coupon_usage FOR SELECT USING (true);
CREATE POLICY "Allow insert coupon_usage" ON coupon_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all for service role on coupon_usage" ON coupon_usage FOR ALL USING (true);

-- 8. Sample coupon (optional - remove in production)
-- INSERT INTO coupons (code, description, discount_type, default_discount_value, is_active, end_date)
-- VALUES ('NEET2025', 'New Year Discount', 'percentage', 10, true, '2025-12-31');
