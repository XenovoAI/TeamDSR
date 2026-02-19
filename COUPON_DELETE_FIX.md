# Coupon Delete Issue - Fixed

## Problem
Coupons were not getting deleted from the admin panel.

## Root Causes

1. **Foreign Key Constraints**: `coupon_usage` and `coupon_products` tables reference coupons, preventing deletion
2. **RLS Policies**: Row Level Security policies might not allow DELETE operations
3. **Error Handling**: Client wasn't showing proper error messages

## Solutions Applied

### 1. Server-Side Fix (`server/routes.ts`)
Updated delete endpoint to:
- First delete related `coupon_products` records
- Then delete the coupon itself
- Better error handling and logging

```typescript
// Delete related products first
await fetch(`${supabaseUrl}/rest/v1/coupon_products?coupon_id=eq.${id}`, {
  method: 'DELETE'
});

// Then delete coupon
await fetch(`${supabaseUrl}/rest/v1/coupons?id=eq.${id}`, {
  method: 'DELETE'
});
```

### 2. Client-Side Fix (`CouponsManagement.tsx`)
- Better error messages
- Shows if coupon is in use
- Confirms deletion with warning about related data

### 3. Database Migration (`database/fix_coupon_delete.sql`)
Run this SQL to fix:
- CASCADE delete on foreign keys
- Proper RLS policies for DELETE operations
- Allows service role to delete coupons

## How to Fix Completely

### Step 1: Run Database Migration
In Supabase SQL Editor, run:
```sql
-- File: database/fix_coupon_delete.sql
```

This will:
- ✅ Set up CASCADE delete on foreign keys
- ✅ Create proper RLS policies
- ✅ Allow DELETE operations

### Step 2: Restart Server
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

### Step 3: Test Delete
1. Go to Admin → Coupons
2. Click delete icon on a test coupon
3. Confirm deletion
4. Coupon should be deleted successfully

## What Gets Deleted

When you delete a coupon:
1. ✅ Coupon record from `coupons` table
2. ✅ All related product discounts from `coupon_products` (CASCADE)
3. ⚠️ `coupon_usage` records are preserved (for historical data)
4. ⚠️ `purchases` table keeps coupon_code for reference

## Error Messages

**Before Fix:**
- "Failed to delete coupon" (generic)

**After Fix:**
- "Coupon deleted successfully" (success)
- "Failed to delete coupon. It may be in use by existing orders." (specific error)
- Shows actual error from database

## Important Notes

### Coupons in Active Use
If a coupon has been used in purchases:
- The coupon can still be deleted
- Purchase records keep the `coupon_code` for reference
- Historical data is preserved

### Cascade Behavior
```
DELETE coupon
  ↓
  ├─ coupon_products (deleted automatically)
  └─ coupon_usage (preserved with ON DELETE SET NULL on purchase_id)
```

## Verification

After running the migration, verify:

```sql
-- Check foreign key constraints
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name = 'coupon_products' OR tc.table_name = 'coupon_usage')
  AND ccu.table_name = 'coupons';
```

Expected: `delete_rule` should be `CASCADE` for both tables.

## Files Changed
- `server/routes.ts` - Improved delete endpoint
- `client/src/pages/admin/CouponsManagement.tsx` - Better error handling
- `database/fix_coupon_delete.sql` - Database migration

## Status
✅ Code fixed
⏳ Database migration pending (run `fix_coupon_delete.sql`)
