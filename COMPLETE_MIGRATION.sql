-- ============================================================================
-- COMPLETE MIGRATION SCRIPT FOR FINDKAR
-- ============================================================================
-- This script includes EVERYTHING needed for the complete database setup
-- Run this entire script in Supabase SQL Editor
-- It's safe to run multiple times - won't break existing data
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE OR UPDATE VENDORS TABLE
-- ============================================================================

-- Create vendors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  open_hours VARCHAR(100) DEFAULT '9:00 AM - 9:00 PM',
  is_open BOOLEAN DEFAULT false,
  last_opened TIMESTAMP WITH TIME ZONE,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add location columns to vendors table if they don't exist
DO $$
BEGIN
    -- Add latitude column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'vendors'
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE public.vendors ADD COLUMN latitude DECIMAL(10, 8);
        RAISE NOTICE 'Added latitude column to vendors table';
    ELSE
        RAISE NOTICE 'Latitude column already exists';
    END IF;

    -- Add longitude column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'vendors'
        AND column_name = 'longitude'
    ) THEN
        ALTER TABLE public.vendors ADD COLUMN longitude DECIMAL(11, 8);
        RAISE NOTICE 'Added longitude column to vendors table';
    ELSE
        RAISE NOTICE 'Longitude column already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: CREATE MENU ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: CREATE SERVICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  duration VARCHAR(50),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: CREATE VENDOR VISITS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.vendor_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: CREATE REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: CREATE FAVORITES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vendor_id)
);

-- ============================================================================
-- STEP 7: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_is_open ON public.vendors(is_open);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_location ON public.vendors(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_menu_items_vendor_id ON public.menu_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_services_vendor_id ON public.services(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_visits_vendor_id ON public.vendor_visits(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON public.reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- ============================================================================
-- STEP 8: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 9: CREATE RLS POLICIES FOR VENDORS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view vendors" ON public.vendors;
CREATE POLICY "Anyone can view vendors" ON public.vendors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own vendor profile" ON public.vendors;
CREATE POLICY "Users can create their own vendor profile" ON public.vendors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own vendor profile" ON public.vendors;
CREATE POLICY "Users can update their own vendor profile" ON public.vendors
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own vendor profile" ON public.vendors;
CREATE POLICY "Users can delete their own vendor profile" ON public.vendors
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 10: CREATE RLS POLICIES FOR MENU ITEMS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
CREATE POLICY "Anyone can view menu items" ON public.menu_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can manage their menu items" ON public.menu_items;
CREATE POLICY "Vendors can manage their menu items" ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = menu_items.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 11: CREATE RLS POLICIES FOR SERVICES
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
CREATE POLICY "Anyone can view services" ON public.services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can manage their services" ON public.services;
CREATE POLICY "Vendors can manage their services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = services.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 12: CREATE RLS POLICIES FOR VENDOR VISITS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can create visits" ON public.vendor_visits;
CREATE POLICY "Anyone can create visits" ON public.vendor_visits
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Vendors can view their visits" ON public.vendor_visits;
CREATE POLICY "Vendors can view their visits" ON public.vendor_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_visits.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 13: CREATE RLS POLICIES FOR REVIEWS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 14: CREATE RLS POLICIES FOR FAVORITES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their favorites" ON public.favorites;
CREATE POLICY "Users can view their favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their favorites" ON public.favorites;
CREATE POLICY "Users can manage their favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 15: CREATE DISTANCE CALCULATION FUNCTION (HAVERSINE FORMULA)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  r DECIMAL := 6371; -- Earth radius in kilometers
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  -- Handle NULL inputs
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  -- Haversine formula
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));

  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- STEP 16: CREATE NEARBY VENDORS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_nearby_vendors(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  shop_name VARCHAR,
  category VARCHAR,
  rating DECIMAL,
  is_open BOOLEAN,
  address TEXT,
  phone VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.shop_name,
    v.category,
    v.rating,
    v.is_open,
    v.address,
    v.phone,
    v.latitude,
    v.longitude,
    ROUND(calculate_distance(user_lat, user_lng, v.latitude, v.longitude)::NUMERIC, 2) as distance_km
  FROM public.vendors v
  WHERE v.latitude IS NOT NULL
    AND v.longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lng, v.latitude, v.longitude) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 17: CREATE TRIGGER TO UPDATE VENDOR RATING
-- ============================================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE public.vendors
    SET
      rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM public.reviews
        WHERE vendor_id = NEW.vendor_id
      ),
      review_count = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE vendor_id = NEW.vendor_id
      )
    WHERE id = NEW.vendor_id;
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF (TG_OP = 'DELETE') THEN
    UPDATE public.vendors
    SET
      rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM public.reviews
        WHERE vendor_id = OLD.vendor_id
      ),
      review_count = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE vendor_id = OLD.vendor_id
      )
    WHERE id = OLD.vendor_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_rating_trigger ON public.reviews;
CREATE TRIGGER update_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_vendor_rating();

-- ============================================================================
-- STEP 18: VERIFY MIGRATION SUCCESS
-- ============================================================================

DO $$
DECLARE
    vendor_count INTEGER;
    menu_count INTEGER;
    services_count INTEGER;
    has_latitude BOOLEAN;
    has_longitude BOOLEAN;
BEGIN
    -- Count existing data
    SELECT COUNT(*) INTO vendor_count FROM public.vendors;
    SELECT COUNT(*) INTO menu_count FROM public.menu_items;
    SELECT COUNT(*) INTO services_count FROM public.services;

    -- Check for location columns
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'vendors'
        AND column_name = 'latitude'
    ) INTO has_latitude;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'vendors'
        AND column_name = 'longitude'
    ) INTO has_longitude;

    -- Print summary
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database Statistics:';
    RAISE NOTICE '  - Vendors: %', vendor_count;
    RAISE NOTICE '  - Menu Items: %', menu_count;
    RAISE NOTICE '  - Services: %', services_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Location Features:';
    RAISE NOTICE '  - Latitude column: %', CASE WHEN has_latitude THEN 'YES ✓' ELSE 'MISSING ✗' END;
    RAISE NOTICE '  - Longitude column: %', CASE WHEN has_longitude THEN 'YES ✓' ELSE 'MISSING ✗' END;
    RAISE NOTICE '';
    RAISE NOTICE 'All tables, indexes, and functions created successfully!';
    RAISE NOTICE 'Your database is now ready for location features.';
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- You can now:
-- 1. Refresh your Findkar app
-- 2. Login as vendor and set location (Settings → Update Location)
-- 3. Login as user and see nearby vendors with distances
-- 4. Manage services for non-food vendors
-- ============================================================================
