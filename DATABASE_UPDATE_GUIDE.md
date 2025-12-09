# Database Update Guide - Location Features

## ⚠️ Important: You Need to Update Your Database

The location and services features require database schema updates. You're seeing this error because the database doesn't have the new columns yet:

```
ERROR: column "latitude" does not exist
```

## Quick Fix - Follow These Steps:

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com
2. Sign in to your account
3. Open your project: **dybhxveohvritzrbztgp**

### Step 2: Run the Schema Update

1. In your project dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `complete-schema.sql` in your project folder
4. Copy ALL the contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify the Update

Run this query to check if the columns exist:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'vendors'
AND column_name IN ('latitude', 'longitude');
```

You should see:
- `latitude` - `numeric`
- `longitude` - `numeric`

### Step 4: Check Services Table

```sql
SELECT * FROM information_schema.tables
WHERE table_name = 'services';
```

Should return one row showing the services table exists.

## What Gets Updated?

### New Columns in `vendors` table:
- `latitude DECIMAL(10, 8)` - Shop latitude coordinate
- `longitude DECIMAL(11, 8)` - Shop longitude coordinate

### New `services` table:
- `id` - UUID primary key
- `vendor_id` - Foreign key to vendors
- `name` - Service name
- `description` - Service details
- `price` - Service price
- `duration` - Service duration
- `is_available` - Availability toggle
- `created_at` / `updated_at` - Timestamps

### New Functions:
- `calculate_distance()` - Haversine formula for distance calculation
- `get_nearby_vendors()` - Find vendors within radius

### New Indexes:
- `idx_vendors_location` - For fast location queries
- `idx_services_vendor_id` - For service lookups

## Alternative: Update Existing Database

If you want to keep your existing data and just add new features, run this instead:

```sql
-- Add location columns to existing vendors table
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create services table (will skip if exists)
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  duration VARCHAR(50),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_services_vendor_id ON services(vendor_id);

-- Enable RLS on services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for services
DROP POLICY IF EXISTS "Anyone can view services" ON services;
CREATE POLICY "Anyone can view services" ON services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can manage their services" ON services;
CREATE POLICY "Vendors can manage their services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = services.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Add distance calculation function
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

-- Add nearby vendors function
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
  FROM vendors v
  WHERE v.latitude IS NOT NULL
    AND v.longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lng, v.latitude, v.longitude) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
```

## After Update is Complete

1. Refresh your app in the browser
2. Login as vendor
3. Go to Settings → Update Location
4. Set your shop location
5. Login as user
6. Dashboard will now show distances to vendors

## Troubleshooting

### Still seeing errors?
- Make sure you ran the ENTIRE schema
- Check Supabase logs for specific error messages
- Verify you're connected to the correct database

### Functions not working?
- PostgreSQL functions need proper permissions
- Make sure you're running as database owner
- Check if functions exist: `\df calculate_distance` in psql

### RLS policies blocking?
- Check your user authentication
- Verify auth.uid() returns correct user ID
- Test with RLS disabled temporarily (for debugging only)

## Need Help?

If you encounter issues:
1. Check the Supabase dashboard logs
2. Run the verification queries above
3. Ensure you're signed in with admin privileges
4. Try the "Alternative" update script if full schema fails

## What Works Without Database Update?

These features will work without the update:
- Vendor dashboard
- Menu management
- User dashboard (basic)
- Authentication

These features **require** the database update:
- ✗ Location management
- ✗ Distance calculations
- ✗ Services management
- ✗ Nearby vendors view
- ✗ Map features

**Run the database update now to enable all features!**
