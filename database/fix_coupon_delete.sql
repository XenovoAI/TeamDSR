-- Fix Coupon Delete Issues
-- Run this in Supabase SQL Editor

-- 1. Ensure CASCADE delete is set up properly
ALTER TABLE coupon_products 
DROP CONSTRAINT IF EXISTS coupon_products_coupon_id_fkey;

ALTER TABLE coupon_products
ADD CONSTRAINT coupon_products_coupon_id_fkey 
FOREIGN KEY (coupon_id) 
REFERENCES coupons(id) 
ON DELETE CASCADE;

-- 2. Ensure coupon_usage has proper CASCADE
ALTER TABLE coupon_usage
DROP CONSTRAINT IF EXISTS coupon_usage_coupon_id_fkey;

ALTER TABLE coupon_usage
ADD CONSTRAINT coupon_usage_coupon_id_fkey
FOREIGN KEY (coupon_id)
REFERENCES coupons(id)
ON DELETE CASCADE;

-- 3. Drop existing RLS policies and recreate them
DROP POLICY IF EXISTS "Allow read coupons" ON coupons;
DROP POLICY IF EXISTS "Allow all for service role on coupons" ON coupons;
DROP POLICY IF EXISTS "Allow admin all on coupons" ON coupons;

-- 4. Create comprehensive RLS policies for coupons
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

-- 5. Same for coupon_products
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

-- 6. Same for coupon_usage
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

-- 7. Verify the setup
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

-- Expected output: Each table should have 4 policies (SELECT, INSERT, UPDATE, DELETE)
