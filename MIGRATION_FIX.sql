-- =====================================================
-- FINDKAR DATABASE MIGRATION FIX
-- Run this FIRST to fix the "status column does not exist" error
-- =====================================================

-- Step 1: Drop old tables cleanly (if they exist)
DROP TABLE IF EXISTS public.highlights CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- Step 2: Now run the complete new schema

-- =====================================================
-- SIMPLIFIED VENDORS TABLE (Shop-Type Only)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL,
  category_emoji TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  last_online_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HIGHLIGHTS TABLE (3-5 specialty items per vendor)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CATEGORIES TABLE (Pre-loaded 20 popular types)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  type TEXT DEFAULT 'food',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRE-LOAD 20 POPULAR CATEGORIES
-- =====================================================
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
  ('samosa', 'Samosa', '🥟', 'food'),
  ('pani-puri', 'Pani Puri', '🫧', 'food'),
  ('ice-cream', 'Ice Cream', '🍦', 'food'),
  ('bhel', 'Bhel', '🥗', 'food'),
  ('manchurian', 'Manchurian', '🍗', 'food'),
  ('paratha', 'Paratha', '🫓', 'food'),
  ('sandwich', 'Sandwich', '🥪', 'food'),
  ('kulfi', 'Kulfi', '🍧', 'food'),
  ('lassi', 'Lassi', '🥛', 'food'),
  ('pav-bhaji', 'Pav Bhaji', '🍲', 'food')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Vendors Policies
DROP POLICY IF EXISTS "Vendors are viewable by everyone" ON public.vendors;
CREATE POLICY "Vendors are viewable by everyone"
  ON public.vendors FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own vendor" ON public.vendors;
CREATE POLICY "Users can insert own vendor"
  ON public.vendors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own vendor" ON public.vendors;
CREATE POLICY "Users can update own vendor"
  ON public.vendors FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own vendor" ON public.vendors;
CREATE POLICY "Users can delete own vendor"
  ON public.vendors FOR DELETE
  USING (auth.uid() = user_id);

-- Highlights Policies
DROP POLICY IF EXISTS "Highlights are viewable by everyone" ON public.highlights;
CREATE POLICY "Highlights are viewable by everyone"
  ON public.highlights FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Vendor owners can insert highlights" ON public.highlights;
CREATE POLICY "Vendor owners can insert highlights"
  ON public.highlights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_id AND vendors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Vendor owners can update highlights" ON public.highlights;
CREATE POLICY "Vendor owners can update highlights"
  ON public.highlights FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_id AND vendors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Vendor owners can delete highlights" ON public.highlights;
CREATE POLICY "Vendor owners can delete highlights"
  ON public.highlights FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_id AND vendors.user_id = auth.uid()
    )
  );

-- Categories Policies (Read-only for all)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Calculate distance using Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  r DECIMAL := 6371; -- Earth radius in km
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get online vendors near a location
CREATE OR REPLACE FUNCTION get_online_vendors(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km DECIMAL DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  category_emoji TEXT,
  lat DECIMAL,
  lng DECIMAL,
  last_online_at TIMESTAMP WITH TIME ZONE,
  distance DECIMAL
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
    calculate_distance(user_lat, user_lng, v.lat, v.lng) as distance
  FROM public.vendors v
  WHERE v.status = 'online'
    AND v.lat IS NOT NULL
    AND v.lng IS NOT NULL
    AND calculate_distance(user_lat, user_lng, v.lat, v.lng) <= radius_km
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '✅ 20 popular categories loaded';
  RAISE NOTICE '✅ All RLS policies active';
  RAISE NOTICE '✅ Helper functions created';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 You can now start the app!';
  RAISE NOTICE 'Run: npm run dev';
END $$;
