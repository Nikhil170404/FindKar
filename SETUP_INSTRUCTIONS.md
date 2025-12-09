# 🚀 FINDKAR - COMPLETE SETUP INSTRUCTIONS

## ⚠️ IMPORTANT: Fix Database Error First!

If you see this error:
```
Error: column 'status' does not exist
```

**Follow these steps to fix it:**

### Step 1: Fix Database Schema

1. Open [Supabase SQL Editor](https://supabase.com)
2. Go to your project → **SQL Editor**
3. Open the file: `MIGRATION_FIX.sql` from your project
4. Copy **ALL** contents
5. Paste into SQL Editor
6. Click **Run**
7. Wait for success message: ✅ **"MIGRATION COMPLETED SUCCESSFULLY!"**

**What this does:**
- Drops old tables cleanly
- Creates new simplified schema with `status` column
- Loads 20 popular categories (Tea Stall, Chinese, Momo, etc.)
- Sets up all security policies
- Creates distance calculation functions

---

## 📱 Step 2: Create Missing Vendor Details Page

The vendor details page file needs to be created manually due to special characters in the path.

**Follow these exact steps:**

### Windows:
1. Open File Explorer
2. Navigate to: `findkar-app\app\user\vendor\`
3. Create a new folder named: `[id]` (include the square brackets!)
4. Inside the `[id]` folder, create a file named: `page.tsx`
5. Open `page-template.txt` from the project root
6. Copy **ALL** contents
7. Paste into the new `page.tsx` file
8. Save the file

### Mac/Linux:
```bash
cd findkar-app/app/user/vendor/
mkdir "[id]"
cd "[id]"
touch page.tsx
# Then copy contents from page-template.txt into page.tsx
```

**What this page does:**
- Shows vendor details with HUGE emoji
- Green background when ONLINE, grey when OFFLINE
- Displays highlights with emojis
- Shows distance and time online
- BIG "Get Directions" button → Opens Google Maps
- Auto-refreshes every 15 seconds
- Share button

---

## 🧪 Step 3: Test Complete Flow

### Start the App:
```bash
cd findkar-app
npm run dev
```

App runs at: **http://localhost:3000**

---

## ✅ Test as Vendor

1. Go to: `http://localhost:3000/login?mode=vendor`
2. Sign up with:
   - Email: `test@example.com`
   - Password: `password123`
3. **3-Step Setup:**
   - **Step 1:** Enter shop name (e.g., "Sharma Tea Stall")
   - **Step 2:** Select category (e.g., ☕ Tea Stall)
   - **Step 3:** Click "Use Current Location"
     - **Allow location access** when browser asks
     - You should see: "Location captured successfully!"
4. Add highlights (optional) or skip
5. You'll see the **GIANT GREEN OPEN BUTTON!**
6. Tap it → Background turns **GREEN** 🟢
7. You're now **LIVE!**

---

## 👥 Test as User

1. Open **new incognito window** (or different browser)
2. Go to: `http://localhost:3000/user/dashboard`
3. Allow location access
4. You should see your vendor appear!
5. Check:
   - ✅ Distance shown (e.g., "250 m")
   - ✅ Time online (e.g., "2m ago")
   - ✅ Green "LIVE" badge pulsing
   - ✅ Highlights displayed
6. Click **"View Details"** on the vendor card
7. You should see:
   - ✅ **HUGE emoji** (8xl size)
   - ✅ Shop name & category
   - ✅ Green background (because vendor is online)
   - ✅ Highlights with emojis
   - ✅ Distance box
   - ✅ Time online box
   - ✅ **"Get Directions"** button
8. Click **"Get Directions"** → Google Maps opens!

---

## 🗺️ Test Map View

1. From user dashboard, click **"Map"** button
2. You should see:
   - ✅ Vendors ranked by distance (#1, #2, #3...)
   - ✅ Top 3 have green number badges
   - ✅ Each vendor shows distance
   - ✅ "Get Directions" button on each
   - ✅ "View Details" button on each

---

## 🔍 Troubleshooting

### Location Not Working?

**Check these:**
1. ✅ Browser location permission is enabled
2. ✅ GPS/Location services are ON on your device
3. ✅ Using `localhost` or `https://` (not `http://`)
4. ✅ Not using incognito for vendor setup (use regular window)

**Location Error Messages:**
- If you see: "Location access denied or unavailable"
  - Go to browser settings → Site permissions → Location
  - Make sure localhost is allowed
- On Chrome: `chrome://settings/content/location`
- On Firefox: Permissions → Allow location
- On Safari: Preferences → Websites → Location Services

### Database Errors?

**"Column does not exist":**
- Run `MIGRATION_FIX.sql` again in Supabase
- Make sure you ran the ENTIRE script, not just part of it

**"Permission denied":**
- Check Supabase RLS policies are enabled
- Make sure you're logged in as a user

### Vendor Not Showing on User Dashboard?

**Check:**
1. ✅ Vendor status is "OPEN" (green background on vendor dashboard)
2. ✅ User has allowed location access
3. ✅ Both vendor and user are using location
4. ✅ Auto-refresh working (wait 15 seconds)
5. ✅ Click refresh button manually

### Page Not Found for Vendor Details?

**This means the `[id]` folder wasn't created correctly:**
- Make sure you created folder named `[id]` with square brackets
- Make sure `page.tsx` is inside the `[id]` folder
- Path should be: `app/user/vendor/[id]/page.tsx`

---

## 📊 What Should Work Now

### Vendor Side:
✅ Sign up/Login
✅ 3-step setup wizard
✅ 20 shop categories
✅ One-tap location capture
✅ Optional highlights (3-5 items)
✅ GIANT OPEN/CLOSE button
✅ Green/Grey background transitions
✅ Status persistence
✅ Time tracking

### User Side:
✅ See only ONLINE vendors
✅ Distance calculation & sorting
✅ Live updates (15-second auto-refresh)
✅ Time since online
✅ Highlights display
✅ Search functionality
✅ Map view (ranked list)
✅ Vendor details page
✅ Google Maps directions
✅ Share functionality

### Technical:
✅ Real-time database updates
✅ Geolocation API integration
✅ Distance sorting (Haversine formula)
✅ Row Level Security (RLS)
✅ Auto-refresh mechanism
✅ Responsive design
✅ Proper error handling

---

## 🎯 Key Features Working

1. **Shop-Type Only** - No complex menus
2. **GIANT 320x320px Button** - Impossible to miss!
3. **Color-Changing Background** - Green = Online, Grey = Offline
4. **Emoji-First Design** - Works for non-readers
5. **Live Status** - 15-second auto-refresh
6. **One-Tap Location** - No manual address entry
7. **Distance Sorting** - Closest vendors first
8. **Time Online** - See how long they've been open
9. **Direct to Maps** - One tap navigation
10. **Auto-Disappear** - Offline vendors hidden from users

---

## 🎉 Success Checklist

Before considering it "complete", verify:

- [ ] Database migration ran successfully
- [ ] Vendor details page created at correct path
- [ ] Can signup as vendor
- [ ] Can complete 3-step setup
- [ ] Location capture works
- [ ] GIANT button changes from green to red
- [ ] Background color changes
- [ ] Vendor appears on user dashboard when online
- [ ] Vendor disappears when offline
- [ ] Distance shows correctly
- [ ] "Get Directions" opens Google Maps
- [ ] Vendor details page shows with green background
- [ ] Auto-refresh works (vendor status updates)
- [ ] Map view shows ranked list
- [ ] Search works on dashboard

---

## 📞 Still Having Issues?

1. **Check browser console** for error messages (F12)
2. **Check Supabase logs** in dashboard
3. **Verify environment variables** in `.env.local`
4. **Try incognito mode** to rule out cache issues
5. **Check database tables** in Supabase Table Editor:
   - `vendors` table should have `status` column
   - `categories` table should have 20 rows
   - `highlights` table should exist

---

## 🚀 Ready to Deploy?

Once everything works locally:

1. Deploy to Vercel/Netlify
2. Update environment variables in hosting
3. Make sure production Supabase has same schema
4. Test with real mobile devices
5. Enable HTTPS (required for geolocation)

---

## 💡 Quick Reference

**Vendor Dashboard:** `/vendor/dashboard`
**User Dashboard:** `/user/dashboard`
**Map View:** `/user/map`
**Vendor Details:** `/user/vendor/[id]`
**Login (Vendor):** `/login?mode=vendor`
**Login (User):** `/login?mode=user`

**Database Tables:**
- `vendors` - Shop info and status
- `highlights` - 3-5 specialty items per vendor
- `categories` - 20 pre-loaded shop types

**Key Functions:**
- `calculate_distance()` - Haversine formula
- `get_online_vendors()` - Returns nearby online vendors

---

**Everything should work perfectly now! 🎉**

For full feature details, see: [FINAL_MVP_COMPLETE.md](FINAL_MVP_COMPLETE.md)
For quick testing, see: [QUICK_START.md](QUICK_START.md)
