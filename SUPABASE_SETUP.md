# Supabase Setup Guide for Findkar

This guide will walk you through setting up Supabase for the Findkar application.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in the details:
   - **Project Name**: Findkar
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your target users (e.g., Mumbai for India)
4. Click "Create new project"
5. Wait for the project to be ready (~2 minutes)

## Step 2: Get Your API Keys

1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
3. Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Enable PostGIS Extension

1. In your Supabase dashboard, go to **Database** → **Extensions**
2. Search for "postgis"
3. Enable the **postgis** extension
4. This is required for location-based features

## Step 4: Run the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" or press Ctrl+Enter
6. You should see "Success. No rows returned"

This will create:
- All database tables (vendors, services, menu_items, reviews, etc.)
- Indexes for performance
- Row Level Security policies
- Geospatial functions for finding nearby vendors
- Triggers for automatic rating calculations

## Step 5: Enable Phone Authentication

### 5.1 Enable Phone Provider

1. Go to **Authentication** → **Providers**
2. Find **Phone** and toggle it ON
3. Enable "Phone signups"

### 5.2 Configure Twilio (Recommended for India)

#### Create Twilio Account

1. Go to [twilio.com](https://www.twilio.com) and sign up
2. After verification, you'll get:
   - Account SID
   - Auth Token
   - A phone number (you'll need to buy one)

#### Get a Phone Number

1. In Twilio Console, go to **Phone Numbers** → **Buy a number**
2. Select **India** as country
3. Choose a number with SMS capability
4. Buy the number (~$1/month)

#### Configure Twilio in Supabase

1. In Supabase, go to **Authentication** → **Providers** → **Phone**
2. Scroll to "Twilio Settings"
3. Enter your:
   - **Twilio Account SID**
   - **Twilio Auth Token**
   - **Twilio Phone Number** (with country code: +91XXXXXXXXXX)
4. Click "Save"

### 5.3 Configure SMS Template (Optional)

Customize the OTP message:
```
Your Findkar verification code is: {{ .Token }}
```

## Step 6: Configure Storage (Optional - for vendor photos)

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket called "vendor-photos"
3. Set it to **Public** (for profile pictures)
4. Set up policies:

```sql
-- Allow anyone to view photos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'vendor-photos' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'vendor-photos' AND auth.role() = 'authenticated' );
```

## Step 7: Test Your Setup

### Test Database Connection

Run this query in SQL Editor:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see: vendors, services, menu_items, reviews, favorites, etc.

### Test Phone Auth

1. Start your Next.js app: `npm run dev`
2. Go to [http://localhost:3000/login](http://localhost:3000/login)
3. Enter a phone number (use your actual number)
4. You should receive an OTP SMS
5. Enter the OTP to complete login

### Test Geolocation Function

Run this in SQL Editor to test the nearby vendors function:

```sql
-- Test getting vendors near Delhi coordinates
SELECT * FROM get_nearby_vendors(28.6139, 77.2090, 5);
```

It should return no results (empty) since you don't have vendors yet.

## Step 8: Insert Sample Data (Optional)

For testing, you can insert sample vendors:

```sql
-- Sample vendor in Delhi
INSERT INTO vendors (
  shop_name,
  category,
  phone,
  address,
  latitude,
  longitude,
  location,
  is_open,
  rating,
  review_count
) VALUES (
  'Raju Tea Stall',
  'food',
  '+919876543210',
  'Gandhi Road, Near Bus Stand, New Delhi',
  28.6139,
  77.2090,
  ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography,
  true,
  4.5,
  120
);

-- Add menu items for this vendor
INSERT INTO menu_items (vendor_id, emoji, name, is_available)
SELECT
  id,
  emoji,
  name,
  true
FROM vendors,
  (VALUES
    ('☕', 'Chai'),
    ('🍔', 'Sandwich'),
    ('🥪', 'Samosa')
  ) AS items(emoji, name)
WHERE shop_name = 'Raju Tea Stall';
```

Now test the nearby vendors function again:

```sql
SELECT * FROM get_nearby_vendors(28.6139, 77.2090, 5);
```

You should see your test vendor!

## Step 9: Set Up Row Level Security (RLS)

RLS is already configured in the schema. To verify:

1. Go to **Database** → **Tables**
2. Click on any table (e.g., "vendors")
3. Go to **Policies** tab
4. You should see policies like:
   - "Vendors are viewable by everyone"
   - "Vendors can be updated by owner"

## Step 10: Monitor Usage

### Check Authentication

1. Go to **Authentication** → **Users**
2. After users sign up, they'll appear here
3. You can manually delete test users

### Check Database Usage

1. Go to **Database** → **Usage**
2. Monitor:
   - Database size
   - Number of rows
   - API requests

### Check API Logs

1. Go to **Logs** → **API**
2. View all API requests
3. Debug errors if any

## Troubleshooting

### Phone OTP Not Sending

**Problem**: OTP SMS not received

**Solutions**:
1. Check Twilio balance (top up if needed)
2. Verify phone number format: `+91XXXXXXXXXX` (with country code)
3. Check Twilio logs in Twilio Console
4. Ensure phone number is verified in Twilio (for trial accounts)

### Location Queries Not Working

**Problem**: `get_nearby_vendors()` returns error

**Solutions**:
1. Ensure PostGIS extension is enabled
2. Check if vendors table has `location` column of type `geography`
3. Run the schema script again

### RLS Blocking Requests

**Problem**: "new row violates row-level security policy"

**Solutions**:
1. Check if user is authenticated: `SELECT auth.uid();`
2. Verify RLS policies are correct
3. Temporarily disable RLS for testing (not recommended for production):
   ```sql
   ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
   ```

### Distance Calculation Issues

**Problem**: Distances seem incorrect

**Solution**:
Ensure coordinates are in correct format:
- Latitude: -90 to 90
- Longitude: -180 to 180
- Delhi example: Lat: 28.6139, Lng: 77.2090

## Production Checklist

Before going live:

- [ ] Change database password from default
- [ ] Review and test all RLS policies
- [ ] Set up database backups (automatic in Supabase)
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and alerts
- [ ] Test phone authentication thoroughly
- [ ] Add proper error handling in app
- [ ] Test geolocation on real devices
- [ ] Verify API rate limits
- [ ] Set up proper SMS credits in Twilio

## Cost Considerations

### Supabase Free Tier Includes:
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

### When to Upgrade:
- More than 500 MB of data
- Heavy usage (>2GB bandwidth/month)
- Need for priority support

### Twilio Costs:
- SMS to India: ~$0.0058 per message
- Phone number: ~$1/month
- Budget accordingly based on expected users

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Rotate API keys** if exposed
3. **Use RLS policies** for all tables
4. **Validate phone numbers** before sending OTP
5. **Rate limit** OTP requests
6. **Monitor** for suspicious activity

## Need Help?

- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- Twilio Docs: [twilio.com/docs](https://www.twilio.com/docs)

---

**Your Findkar database is now ready! 🎉**
