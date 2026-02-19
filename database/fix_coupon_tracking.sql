-- Fix Coupon Sales Tracking
-- This migration adds automatic tracking of coupon usage

-- 1. Create a function to increment coupon times_used
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment the times_used counter in coupons table
  UPDATE coupons 
  SET times_used = times_used + 1,
      updated_at = NOW()
  WHERE id = NEW.coupon_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger on coupon_usage table
DROP TRIGGER IF EXISTS trigger_increment_coupon_usage ON coupon_usage;
CREATE TRIGGER trigger_increment_coupon_usage
  AFTER INSERT ON coupon_usage
  FOR EACH ROW
  EXECUTE FUNCTION increment_coupon_usage();

-- 3. Fix existing data - sync times_used with actual usage
UPDATE coupons c
SET times_used = (
  SELECT COUNT(*)
  FROM coupon_usage cu
  WHERE cu.coupon_id = c.id
),
updated_at = NOW();

-- 4. Add purchase_id tracking to coupon_usage if missing
-- This ensures we can track which purchase used which coupon
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

-- 5. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_coupon_usage_purchase ON coupon_usage(purchase_id);

-- 6. Create a view for coupon analytics
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

-- Grant access to the view
GRANT SELECT ON coupon_analytics TO authenticated, anon;
