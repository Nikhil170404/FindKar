-- Complete Migration for No-Login Vendor System
-- Run ALL of this in Supabase SQL Editor

-- ==========================================
-- STEP 1: Add columns to vendors table
-- ==========================================
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS vendor_secret_key TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS menu_items TEXT[];

-- Generate keys for existing vendors  
UPDATE vendors 
SET vendor_secret_key = LOWER(SUBSTRING(md5(random()::text) FROM 1 FOR 12))
WHERE vendor_secret_key IS NULL;

-- ==========================================
-- STEP 2: Create highlights table
-- ==========================================
CREATE TABLE IF NOT EXISTS highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- STEP 3: Enable RLS and create policies
-- ==========================================

-- Vendors table policies
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON vendors;
CREATE POLICY "Allow public read" ON vendors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated" ON vendors;
CREATE POLICY "Allow all for authenticated" ON vendors FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for authenticated" ON vendors;
CREATE POLICY "Allow insert for authenticated" ON vendors FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for all" ON vendors;
CREATE POLICY "Allow update for all" ON vendors FOR UPDATE USING (true) WITH CHECK (true);

-- Highlights table policies
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on highlights" ON highlights;
CREATE POLICY "Allow all on highlights" ON highlights FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- DONE! Now test the admin panel
-- ==========================================
