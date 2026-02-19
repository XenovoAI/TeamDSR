# Fix Coupon Sales Tracking

## Problem
Coupon codes were not tracking sales properly. The `times_used` counter in the `coupons` table was not being incremented when coupons were used.

## Solution

### 1. Run Database Migration

Execute the SQL migration in your Supabase SQL Editor:

```bash
# File: database/fix_coupon_tracking.sql
```

This migration will:
- Create a database trigger that automatically increments `times_used` when a coupon is used
- Fix existing data by syncing `times_used` with actual usage from `coupon_usage` table
- Add `purchase_id` tracking to link coupon usage with specific purchases
- Create a `coupon_analytics` view for easy reporting

### 2. Server Code Updates

The following files have been updated:

**server/routes.ts**
- `/api/verify-payment` - Now properly tracks coupon usage with purchase link
- `/api/verify-cart-payment` - Now captures purchase IDs and links them to coupon usage

### 3. How It Works Now

When a purchase is completed:

1. Purchase record is created with coupon information
2. Coupon usage is recorded in `coupon_usage` table with:
   - `coupon_id` - Which coupon was used
   - `user_id` - Who used it
   - `purchase_id` - Which purchase it was used for
   - `discount_applied` - How much discount was given
3. Database trigger automatically increments `times_used` in `coupons` table
4. All data is now properly tracked for analytics

### 4. Coupon Analytics View

You can now query coupon performance using the `coupon_analytics` view:

```sql
SELECT * FROM coupon_analytics;
```

This view shows:
- Total times each coupon was used
- Unique users who used the coupon
- Total discount given
- Total revenue generated from coupon usage
- Usage vs limit tracking

### 5. Verify the Fix

After running the migration:

1. Check existing coupon usage:
```sql
SELECT code, times_used, usage_limit 
FROM coupons 
WHERE is_active = true;
```

2. Test a new purchase with a coupon
3. Verify `times_used` increments automatically
4. Check `coupon_usage` table for the record

### 6. Admin Dashboard

The admin coupon management page will now show accurate usage statistics automatically.

## Files Changed

- `database/fix_coupon_tracking.sql` - New migration file
- `server/routes.ts` - Updated payment verification endpoints
- `FIX_COUPON_TRACKING.md` - This documentation

## Next Steps

1. Run the migration in Supabase SQL Editor
2. Test with a sample coupon purchase
3. Verify analytics in admin dashboard
4. Monitor coupon usage going forward
