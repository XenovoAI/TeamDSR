-- Hard Copy Delivery System Database Setup
-- Run this in Supabase SQL Editor

-- Add hard copy fields to study_materials
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS has_hard_copy BOOLEAN DEFAULT false;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS hard_copy_price INTEGER DEFAULT 0;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS shipping_cost INTEGER DEFAULT 50;

-- Add delivery fields to purchases
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'digital'; -- 'digital' or 'physical'
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending'; -- pending, processing, shipped, delivered, cancelled
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shiprocket_shipment_id TEXT;

-- Create shipping_addresses table for saved addresses
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_delivery_type ON purchases(delivery_type);
CREATE INDEX IF NOT EXISTS idx_purchases_delivery_status ON purchases(delivery_status);

-- Enable RLS on shipping_addresses
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shipping_addresses
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
