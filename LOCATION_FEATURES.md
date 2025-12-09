# Location & Map Features

## Overview
Findkar now includes complete location-based features for both vendors and users. This enables:
- Vendors to set their shop location
- Users to find nearby vendors
- Distance calculations and sorting
- Map-based vendor discovery

## For Vendors

### Setting Up Location

**Page:** [/vendor/location](app/vendor/location/page.tsx)

Vendors can set their shop location in two ways:

1. **Use Current Location** (Recommended)
   - Tap the "Use Current Location" button
   - Allow browser location access
   - Coordinates are automatically filled
   - Best accuracy when done at the shop

2. **Manual Entry**
   - Enter latitude and longitude manually
   - Useful if coordinates are known from Google Maps
   - Format: Latitude (-90 to 90), Longitude (-180 to 180)

3. **Address**
   - Always provide complete shop address
   - Include nearby landmarks for easy discovery

### Access Location Settings

Vendors can access location management from:
- Dashboard → Settings → Update Location
- Direct link: `/vendor/location`

## For Users

### User Dashboard with Distance

**Page:** [/user/dashboard](app/user/dashboard/page.tsx)

The user dashboard now:
- Automatically requests user location on load
- Calculates distance to each vendor
- Sorts vendors by proximity
- Shows distance in meters/kilometers
- Displays location permission status

**Features:**
- Real-time distance calculation using Haversine formula
- Graceful fallback if location is denied
- Shows "All Vendors" if location unavailable
- Shows "Nearby Vendors" with distances when location enabled

### Nearby Vendors Map View

**Page:** [/user/nearby](app/user/nearby/page.tsx)

A dedicated page for discovering nearby vendors:

**Features:**
1. **Radius Filter**
   - 2 km, 5 km, 10 km, 20 km options
   - Adjustable based on needs
   - Only shows vendors within selected radius

2. **Category Filter**
   - Filter by Food, Salon, Repair, Grocery
   - "All" to see all categories

3. **Vendor List**
   - Ranked by distance (#1, #2, etc.)
   - Shows exact distance
   - Open/Closed status badges
   - Rating and review count

4. **Quick Actions**
   - View Details button
   - Get Directions (opens Google Maps)
   - Call vendor directly

## Technical Implementation

### Database Schema

**Vendors Table:**
```sql
CREATE TABLE vendors (
  ...
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  ...
);
```

**Distance Calculation Function:**
```sql
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL
```

Uses Haversine formula for accurate Earth-surface distances.

**Nearby Vendors Function:**
```sql
CREATE OR REPLACE FUNCTION get_nearby_vendors(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km INTEGER DEFAULT 5
)
```

Returns vendors within specified radius, sorted by distance.

### Geolocation Utilities

**File:** [lib/geolocation.ts](lib/geolocation.ts)

**Functions:**
- `getCurrentLocation()` - Get user's current position
- `calculateDistance()` - Haversine formula implementation
- `formatDistance()` - Format distance for display (m/km)
- `watchLocation()` - Continuous location tracking
- `getDirectionsUrl()` - Generate Google Maps directions URL

### Client-Side Implementation

**User Location Retrieval:**
```typescript
const position = await getCurrentLocation()
setUserLocation({
  latitude: position.latitude,
  longitude: position.longitude,
})
```

**Distance Calculation:**
```typescript
const distance = calculateDistance(
  userLat, userLng,
  vendorLat, vendorLng
)
```

**Sorting by Distance:**
```typescript
vendors.sort((a, b) => {
  if (a.distance !== undefined && b.distance !== undefined) {
    return a.distance - b.distance
  }
  return 0
})
```

## User Experience

### For Vendors

1. **First Time Setup:**
   - Complete vendor setup
   - Go to Settings → Update Location
   - Use "Use Current Location" at shop
   - Save

2. **Updating Location:**
   - Go to Settings → Update Location
   - Update coordinates or address
   - Save changes

### For Users

1. **Finding Vendors:**
   - Open app, allow location access
   - Dashboard shows nearby vendors with distances
   - Sorted by proximity automatically

2. **Exploring Nearby:**
   - Go to "Nearby" tab in bottom navigation
   - Adjust radius filter (2km - 20km)
   - Filter by category if needed
   - Tap "Get Directions" for navigation

3. **No Location Access:**
   - App works without location
   - Shows all vendors
   - Distance info not available
   - Can enable location anytime

## Privacy & Permissions

### Browser Location Permission
- Required for distance calculations
- Requested only when needed
- User can deny and still use app
- No location data stored on servers

### Vendor Location Data
- Stored in database for discovery
- Public (visible to all users)
- Vendors control their own location
- Can update anytime

## Future Enhancements

Possible improvements:
1. Interactive map with pins
2. Real-time location tracking
3. Geofencing notifications
4. Location history for vendors
5. Multiple shop locations per vendor
6. Delivery radius settings
7. Peak hours by location analytics

## Testing

### Test Vendor Location Setup
1. Login as vendor
2. Complete setup if needed
3. Go to Settings → Update Location
4. Test "Use Current Location"
5. Verify coordinates are filled
6. Save and check database

### Test User Distance View
1. Login as user
2. Allow location access
3. Check dashboard shows distances
4. Verify vendors sorted by proximity
5. Go to "Nearby" tab
6. Test radius filters
7. Test directions links

### Test Without Location
1. Login as user
2. Deny location access
3. Verify app still works
4. Check vendors are shown (without distance)
5. Verify graceful error messages

## Support & Troubleshooting

### Common Issues

**Location not detected:**
- Check browser permissions
- Ensure HTTPS connection
- Try manual coordinate entry

**Distance not showing:**
- Vendor may not have set location
- Check vendor location in database
- Verify geolocation.ts functions

**Inaccurate distance:**
- Haversine formula is accurate for Earth surface
- Minor variations normal (<100m)
- Check coordinate precision (8 decimals for latitude)

## Database Migration

If updating existing database, run:

```sql
-- Add location columns if not exist
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_vendors_location
ON vendors(latitude, longitude);

-- Add distance calculation function (see complete-schema.sql)
```

## API Integration (Future)

For external integrations:

**Get Nearby Vendors API:**
```javascript
const { data } = await supabase.rpc('get_nearby_vendors', {
  user_lat: 28.6139,
  user_lng: 77.2090,
  radius_km: 5
})
```

Returns vendors with distance calculations performed in database for optimal performance.
