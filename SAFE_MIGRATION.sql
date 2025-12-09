-- SAFE MIGRATION SCRIPT
-- This script safely updates your existing database without losing data
-- Run this in Supabase SQL Editor

-- Step 1: Add new columns to existing vendors table (if they don't exist)
DO $$
BEGIN
    -- Add latitude column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE public.vendors ADD COLUMN latitude DECIMAL(10, 8);
    END IF;

    -- Add longitude column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE public.vendors ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
END $$;

-- Step 2: Create services table (only if it doesn't exist)
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

-- Step 3: Create indexes (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_vendors_location ON public.vendors(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_services_vendor_id ON public.services(vendor_id);

-- Step 4: Enable RLS on services table
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop and recreate RLS policies for services
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

-- Step 6: Create distance calculation function
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

-- Step 7: Create nearby vendors function
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

-- Step 8: Verify the migration
DO $$
DECLARE
    vendor_count INTEGER;
    services_count INTEGER;
BEGIN
    -- Count vendors
    SELECT COUNT(*) INTO vendor_count FROM public.vendors;
    RAISE NOTICE 'Migration complete! Found % vendors in database', vendor_count;

    -- Check if services table exists
    SELECT COUNT(*) INTO services_count FROM information_schema.tables
    WHERE table_name = 'services';

    IF services_count > 0 THEN
        RAISE NOTICE 'Services table created successfully';
    END IF;

    -- Check if latitude column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'latitude'
    ) THEN
        RAISE NOTICE 'Location columns added successfully to vendors table';
    END IF;
END $$;

-- Done! Your database is now ready for location features
