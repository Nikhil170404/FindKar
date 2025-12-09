# Next Steps - Database Setup

## ✅ Environment Variables Configured

Your Supabase credentials have been added to `.env.local`:
- **Project URL**: https://dybhxveohvritzrbztgp.supabase.co
- **Anon Key**: Configured ✅
- **Service Role Key**: Configured ✅

## 🚀 Next Step: Set Up Database

### Step 1: Enable PostGIS Extension (1 minute)

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dybhxveohvritzrbztgp
2. Click on **Database** → **Extensions** in the left sidebar
3. Search for "postgis"
4. Click the toggle to **Enable** PostGIS
5. Wait for it to activate (should be instant)

### Step 2: Run Database Schema (2 minutes)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the ENTIRE contents of the file: `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see: ✅ "Success. No rows returned"

**What this creates:**
- ✅ All database tables (vendors, services, menu_items, reviews, favorites, etc.)
- ✅ PostGIS location support
- ✅ Indexes for fast queries
- ✅ Row Level Security policies
- ✅ Automatic triggers
- ✅ Helper functions (get_nearby_vendors)

### Step 3: Verify Setup (1 minute)

Run this query in SQL Editor to check tables:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see these tables:
- ✅ vendors
- ✅ services
- ✅ menu_items
- ✅ reviews
- ✅ favorites
- ✅ vendor_visits
- ✅ user_profiles

### Step 4: Test Your App (Now!)

Your app is running at: **http://localhost:3000**

Try these pages:
1. **Landing Page**: http://localhost:3000
2. **User Login**: http://localhost:3000/login?mode=user
3. **Vendor Login**: http://localhost:3000/login?mode=vendor

## 🎉 Authentication Already Working!

### ✅ Email/Password Authentication (MVP)

Your app now uses **Email/Password** authentication instead of Phone OTP. This means:
- ✅ **No setup required** - Works immediately!
- ✅ **No SMS costs** - Free testing
- ✅ **Easy to test** - Create unlimited accounts
- ✅ **Perfect for MVP** - Get started right away

### How to Test

1. **Create User Account**
   - Go to: http://localhost:3000/login?mode=user
   - Click "Don't have an account? Sign Up"
   - Enter email: `user@test.com`
   - Password: `test123`
   - Click "Create Account"

2. **Create Vendor Account**
   - Go to: http://localhost:3000/login?mode=vendor
   - Click "Don't have an account? Sign Up"
   - Enter email: `vendor@test.com`
   - Password: `test123`
   - Click "Create Account"

3. **View Users in Supabase**
   - Go to: https://supabase.com/dashboard/project/dybhxveohvritzrbztgp/auth/users
   - See all your test accounts!

### 📱 Phone OTP (Coming Later)
Phone authentication can be added later without breaking anything. For MVP, email/password is perfect!

See [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed authentication guide.

## 🧪 Optional: Add Sample Data for Testing

Run this in SQL Editor to add a test vendor:

```sql
-- Add a sample vendor
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
  'Test Chai Stall',
  'food',
  '+919999999999',
  'MG Road, Near Bus Stand',
  28.6139,
  77.2090,
  ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography,
  true,
  4.5,
  100
);

-- Add menu items for the vendor
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
    ('🥪', 'Samosa'),
    ('🍜', 'Noodles')
  ) AS items(emoji, name)
WHERE shop_name = 'Test Chai Stall';
```

Now check the user dashboard - you'll see the vendor!

## 🎯 What Works Right Now

### ✅ Working (Without Phone Auth)
- Landing page
- All page navigation
- UI and design
- Layouts and components

### ⚙️ Needs Phone Auth Setup
- OTP login
- Creating accounts
- Vendor dashboard functionality
- User favorites

### ✅ Working (After Database Setup)
- All CRUD operations
- Location queries
- Reviews and ratings
- Analytics

## 📊 Database Connection Status

You can test if your app connects to Supabase by:

1. Open browser console (F12)
2. Go to http://localhost:3000
3. Check for any errors
4. Network tab should show requests to `dybhxveohvritzrbztgp.supabase.co`

## 🐛 Troubleshooting

### "Failed to fetch" error?
- Check if Supabase project is active
- Verify URL and keys in `.env.local`
- Restart dev server: `npm run dev`

### PostGIS not working?
- Make sure you enabled the extension
- Run the schema again
- Check Supabase logs

### Can't see sample data?
- Make sure database schema is loaded
- Check if tables exist (run verification query)
- Try adding sample vendor again

## 🚀 Deploy to Production (Later)

When ready:
1. Push code to GitHub
2. Create Vercel account
3. Import repository
4. Add same environment variables
5. Deploy!

## 📝 Summary

**Current Status:**
- ✅ Code complete
- ✅ Environment variables configured
- ✅ Dev server running
- ⚙️ Database setup needed (2 minutes)
- ⚙️ Phone auth optional (10 minutes)

**Next Action:**
👉 **Go to Supabase and run the database schema!**

---

Need help? Check:
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Detailed guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick reference
- [README.md](./README.md) - Full documentation
