-- Shop System Database Setup
-- Run this in Supabase SQL Editor

-- Add price column to study_materials
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS original_price INTEGER DEFAULT 0;

-- Create purchases table (user_id as TEXT to match users table)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_material_id ON purchases(material_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON purchases;
DROP POLICY IF EXISTS "Service role can do anything" ON purchases;

-- RLS Policies for purchases
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow all for service role" ON purchases
  FOR ALL USING (true);
