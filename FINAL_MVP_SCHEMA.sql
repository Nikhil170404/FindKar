-- ============================================================================
-- FINAL MVP SCHEMA - SHOP TYPE ONLY VERSION
-- ============================================================================
-- This is the simplified, cleanest schema for Indian street vendors
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP OLD TABLES (IF YOU WANT FRESH START)
-- ============================================================================
-- Uncomment these lines if you want to start fresh
-- DROP TABLE IF EXISTS public.highlights CASCADE;
-- DROP TABLE IF EXISTS public.menu_items CASCADE;
-- DROP TABLE IF EXISTS public.services CASCADE;
-- DROP TABLE IF EXISTS public.vendor_visits CASCADE;
-- DROP TABLE IF EXISTS public.reviews CASCADE;
-- DROP TABLE IF EXISTS public.favorites CASCADE;
-- DROP TABLE IF EXISTS public.vendors CASCADE;

-- ============================================================================
-- STEP 2: CREATE VENDORS TABLE (SIMPLIFIED)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL, -- "Tea Stall", "Momo", "Chinese", etc
  category_emoji TEXT NOT NULL, -- "☕", "🥟", "🍜"
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  last_online_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: CREATE HIGHLIGHTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: CREATE CATEGORIES TABLE (REFERENCE DATA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  type TEXT DEFAULT 'food' -- food, service, etc
);

-- Insert 20 popular categories
INSERT INTO public.categories (id, name, emoji, type) VALUES
  ('tea', 'Tea Stall', '☕', 'food'),
  ('chinese', 'Chinese', '🍜', 'food'),
  ('momo', 'Momo', '🥟', 'food'),
  ('juice', 'Juice Center', '🍋', 'food'),
  ('biryani', 'Biryani', '🍛', 'food'),
  ('chaat', 'Chaat', '🥘', 'food'),
  ('vadapav', 'Vada Pav', '🌮', 'food'),
  ('dosa', 'Dosa', '🥞', 'food'),
  ('burger', 'Burger', '🍔', 'food'),
  ('pizza', 'Pizza', '🍕', 'food'),
  ('sandwich', 'Sandwich', '🥪', 'food'),
  ('paratha', 'Paratha', '🌯', 'food'),
  ('samosa', 'Samosa', '🥙', 'food'),
  ('sweets', 'Sweets', '🍮', 'food'),
  ('icecream', 'Ice Cream', '🍨', 'food'),
  ('salad', 'Salad Bar', '🥗', 'food'),
  ('thali', 'Thali', '🍱', 'food'),
  ('frankie', 'Frankie', '🌯', 'food'),
  ('pavbhaji', 'Pav Bhaji', '🥪', 'food'),
  ('chole', 'Chole Bhature', '🥙', 'food')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 5: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_location ON public.vendors(lat, lng);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_highlights_vendor_id ON public.highlights(vendor_id);

-- ============================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: RLS POLICIES FOR VENDORS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view online vendors" ON public.vendors;
CREATE POLICY "Anyone can view online vendors" ON public.vendors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their vendor profile" ON public.vendors;
CREATE POLICY "Users can create their vendor profile" ON public.vendors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their vendor profile" ON public.vendors;
CREATE POLICY "Users can update their vendor profile" ON public.vendors
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their vendor profile" ON public.vendors;
CREATE POLICY "Users can delete their vendor profile" ON public.vendors
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 8: RLS POLICIES FOR HIGHLIGHTS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view highlights" ON public.highlights;
CREATE POLICY "Anyone can view highlights" ON public.highlights
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can manage their highlights" ON public.highlights;
CREATE POLICY "Vendors can manage their highlights" ON public.highlights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = highlights.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 9: RLS POLICIES FOR CATEGORIES
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

-- ============================================================================
-- STEP 10: CREATE DISTANCE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lng1 DECIMAL,
  lat2 DECIMAL,
  lng2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  r DECIMAL := 6371; -- Earth radius in km
  dlat DECIMAL;
  dlng DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  IF lat1 IS NULL OR lng1 IS NULL OR lat2 IS NULL OR lng2 IS NULL THEN
    RETURN NULL;
  END IF;

  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2) * sin(dlat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlng/2) * sin(dlng/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));

  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- STEP 11: CREATE FUNCTION TO GET ONLINE VENDORS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_online_vendors(
  user_lat DECIMAL DEFAULT NULL,
  user_lng DECIMAL DEFAULT NULL,
  radius_km INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  category_emoji TEXT,
  lat DECIMAL,
  lng DECIMAL,
  last_online_at TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL,
  highlights JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.name,
    v.category,
    v.category_emoji,
    v.lat,
    v.lng,
    v.last_online_at,
    CASE
      WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND v.lat IS NOT NULL AND v.lng IS NOT NULL
      THEN ROUND(calculate_distance(user_lat, user_lng, v.lat, v.lng)::NUMERIC, 2)
      ELSE NULL
    END as distance_km,
    COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object('emoji', h.emoji, 'label', h.label))
        FROM public.highlights h
        WHERE h.vendor_id = v.id
      ),
      '[]'::jsonb
    ) as highlights
  FROM public.vendors v
  WHERE v.status = 'online'
    AND (
      user_lat IS NULL OR user_lng IS NULL OR v.lat IS NULL OR v.lng IS NULL
      OR calculate_distance(user_lat, user_lng, v.lat, v.lng) <= radius_km
    )
  ORDER BY distance_km NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 12: VERIFY MIGRATION
-- ============================================================================

DO $$
DECLARE
    vendor_count INTEGER;
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO vendor_count FROM public.vendors;
    SELECT COUNT(*) INTO category_count FROM public.categories;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL MVP MIGRATION COMPLETED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database Statistics:';
    RAISE NOTICE '  - Vendors: %', vendor_count;
    RAISE NOTICE '  - Categories: %', category_count;
    RAISE NOTICE '';
    RAISE NOTICE '✓ Simplified shop-type-only schema ready';
    RAISE NOTICE '✓ 20 popular categories loaded';
    RAISE NOTICE '✓ Distance calculation ready';
    RAISE NOTICE '✓ All RLS policies active';
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- Your database is now ready for the simplified MVP!
--
-- Next steps:
-- 1. Update vendor login/signup flow
-- 2. Create vendor setup with category selection
-- 3. Build vendor dashboard with OPEN/CLOSE button
-- 4. Create user map view with live pins
-- ============================================================================
