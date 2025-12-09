-- Supabase Database Schema for Findkar

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================
-- VENDORS TABLE
-- =============================================
CREATE TABLE vendors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(POINT),
  is_open BOOLEAN DEFAULT false,
  open_hours VARCHAR(100) DEFAULT '9:00 AM - 9:00 PM',
  rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  last_opened TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on location for faster geospatial queries
CREATE INDEX idx_vendors_location ON vendors USING GIST(location);
CREATE INDEX idx_vendors_is_open ON vendors(is_open);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_user_id ON vendors(user_id);

-- =============================================
-- SERVICES TABLE
-- =============================================
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10) DEFAULT '🔧',
  price DECIMAL(10, 2),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_services_vendor_id ON services(vendor_id);
CREATE INDEX idx_services_is_available ON services(is_available);

-- =============================================
-- MENU_ITEMS TABLE (for food vendors)
-- =============================================
CREATE TABLE menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_menu_items_vendor_id ON menu_items(vendor_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- =============================================
-- FAVORITES TABLE
-- =============================================
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vendor_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_vendor_id ON favorites(vendor_id);

-- =============================================
-- VENDOR_VISITS TABLE (for analytics)
-- =============================================
CREATE TABLE vendor_visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vendor_visits_vendor_id ON vendors(id);
CREATE INDEX idx_vendor_visits_visited_at ON vendor_visits(visited_at);

-- =============================================
-- USER_PROFILES TABLE
-- =============================================
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name VARCHAR(255),
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update vendor rating
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vendors
  SET
    rating = (SELECT AVG(rating) FROM reviews WHERE vendor_id = NEW.vendor_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE vendor_id = NEW.vendor_id)
  WHERE id = NEW.vendor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendor_rating_trigger AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_vendor_rating();

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
    ROUND(
      CAST(
        ST_Distance(
          v.location,
          ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) / 1000 AS NUMERIC
      ), 2
    ) as distance_km
  FROM vendors v
  WHERE ST_DWithin(
    v.location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_km * 1000
  )
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Vendors policies
CREATE POLICY "Vendors are viewable by everyone" ON vendors
  FOR SELECT USING (true);

CREATE POLICY "Vendors can be created by authenticated users" ON vendors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can be updated by owner" ON vendors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Vendors can be deleted by owner" ON vendors
  FOR DELETE USING (auth.uid() = user_id);

-- Services policies
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

CREATE POLICY "Services can be managed by vendor owner" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = services.vendor_id AND vendors.user_id = auth.uid()
    )
  );

-- Menu items policies
CREATE POLICY "Menu items are viewable by everyone" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "Menu items can be managed by vendor owner" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = menu_items.vendor_id AND vendors.user_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Reviews can be created by authenticated users" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reviews can be updated by owner" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Reviews can be deleted by owner" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Favorites are viewable by owner" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Favorites can be created by authenticated users" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Favorites can be deleted by owner" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Vendor visits policies
CREATE POLICY "Vendor visits can be created by anyone" ON vendor_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Vendor visits are viewable by vendor owner" ON vendor_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = vendor_visits.vendor_id AND vendors.user_id = auth.uid()
    )
  );

-- User profiles policies
CREATE POLICY "User profiles are viewable by owner" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User profiles can be created by owner" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User profiles can be updated by owner" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert sample vendors (uncomment to use)
/*
INSERT INTO vendors (shop_name, category, phone, address, latitude, longitude, location, is_open, rating, review_count) VALUES
('Raju''s Tea Stall', 'food', '+919876543210', 'Gandhi Road, Near Bus Stand', 28.6139, 77.2090, ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography, true, 4.5, 120),
('Kumar Hair Salon', 'salon', '+919876543211', 'MG Road, Shop 45', 28.6145, 77.2095, ST_SetSRID(ST_MakePoint(77.2095, 28.6145), 4326)::geography, true, 4.2, 85),
('Bike Repair Centre', 'repair', '+919876543212', 'Main Market, Block A', 28.6150, 77.2100, ST_SetSRID(ST_MakePoint(77.2100, 28.6150), 4326)::geography, false, 4.8, 200);
*/
