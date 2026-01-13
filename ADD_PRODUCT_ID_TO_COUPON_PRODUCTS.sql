-- Add product_id column to coupon_products table for hard copy products support
-- Run this in Supabase SQL Editor

-- 1. Add product_id column (references hard_copy_products)
ALTER TABLE coupon_products ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES hard_copy_products(id) ON DELETE CASCADE;

-- 2. Make material_id nullable (since we can now have either material_id OR product_id)
ALTER TABLE coupon_products ALTER COLUMN material_id DROP NOT NULL;

-- 3. Create index for product_id
CREATE INDEX IF NOT EXISTS idx_coupon_products_product ON coupon_products(product_id);

-- 4. Add check constraint to ensure at least one ID is provided
-- (Optional - uncomment if you want to enforce this at DB level)
-- ALTER TABLE coupon_products ADD CONSTRAINT check_product_or_material 
--   CHECK (material_id IS NOT NULL OR product_id IS NOT NULL);

-- Done! Now you can add both study materials and hard copy products to coupons.
