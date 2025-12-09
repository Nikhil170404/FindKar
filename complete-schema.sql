-- Complete Schema for Findkar with Location & Services
-- Run this in Supabase SQL Editor

-- Create vendors table with location
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  open_hours VARCHAR(100) DEFAULT '9:00 AM - 9:00 PM',
  is_open BOOLEAN DEFAULT false,
  last_opened TIMESTAMP WITH TIME ZONE,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table (for non-food vendors)
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

-- Create vendor_visits table
CREATE TABLE IF NOT EXISTS public.vendor_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vendor_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_is_open ON public.vendors(is_open);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_location ON public.vendors(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_menu_items_vendor_id ON public.menu_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_services_vendor_id ON public.services(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_visits_vendor_id ON public.vendor_visits(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON public.reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- Enable Row Level Security
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can create their own vendor profile" ON public.vendors;
DROP POLICY IF EXISTS "Users can update their own vendor profile" ON public.vendors;
DROP POLICY IF EXISTS "Users can delete their own vendor profile" ON public.vendors;
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Vendors can manage their menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
DROP POLICY IF EXISTS "Vendors can manage their services" ON public.services;
DROP POLICY IF EXISTS "Anyone can create visits" ON public.vendor_visits;
DROP POLICY IF EXISTS "Vendors can view their visits" ON public.vendor_visits;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view their favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage their favorites" ON public.favorites;

-- RLS Policies for vendors
CREATE POLICY "Anyone can view vendors" ON public.vendors
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own vendor profile" ON public.vendors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor profile" ON public.vendors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendor profile" ON public.vendors
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for menu_items
CREATE POLICY "Anyone can view menu items" ON public.menu_items
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their menu items" ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = menu_items.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- RLS Policies for services
CREATE POLICY "Anyone can view services" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = services.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- RLS Policies for vendor_visits
CREATE POLICY "Anyone can create visits" ON public.vendor_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Vendors can view their visits" ON public.vendor_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_visits.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for favorites
CREATE POLICY "Users can view their favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Function to calculate distance between two points (Haversine formula)
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

-- Function to get nearby vendors
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

-- Trigger to update rating when review is added
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.vendors
  SET
    rating = (SELECT AVG(rating) FROM public.reviews WHERE vendor_id = NEW.vendor_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE vendor_id = NEW.vendor_id)
  WHERE id = NEW.vendor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_vendor_rating();
