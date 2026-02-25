# Database Instructions

Use one file only:
- `DATABASE_COMPLETE_RUN.sql`

## How to run
1. Open Supabase SQL Editor.
2. Paste full content of `DATABASE_COMPLETE_RUN.sql`.
3. Run once.

## What it includes
- Core tables and schema updates
- Shop + hard copy setup
- Coupon setup and fixes
- Storage/download tracking setup
- Admin setup

## Optional (after run): backfill paid coupon usage
```sql
BEGIN;

ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS times_used INTEGER NOT NULL DEFAULT 0;

UPDATE coupons
SET times_used = 0;

UPDATE coupons c
SET times_used = x.paid_count
FROM (
  SELECT
    cu.coupon_id,
    COUNT(*)::int AS paid_count
  FROM coupon_usage cu
  JOIN purchases p
    ON p.id = cu.purchase_id
  WHERE cu.coupon_id IS NOT NULL
    AND p.status = 'completed'
  GROUP BY cu.coupon_id
) x
WHERE c.id = x.coupon_id;

COMMIT;
```
