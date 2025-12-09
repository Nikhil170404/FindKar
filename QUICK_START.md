# ⚡ FINDKAR - QUICK START GUIDE

## 🚀 Get Running in 5 Minutes

### Step 1: Database Setup (2 minutes)

1. Open https://supabase.com
2. Go to your project → **SQL Editor**
3. Copy everything from `FINAL_MVP_SCHEMA.sql`
4. Paste and click **Run**
5. Wait for: ✓ "MIGRATION COMPLETED SUCCESSFULLY!"

### Step 2: Start App (1 minute)

```bash
cd findkar-app
npm run dev
```

App runs at: **http://localhost:3000**

### Step 3: Test as Vendor (1 minute)

1. Go to: `http://localhost:3000/login?mode=vendor`
2. Sign up: `test@example.com` / `password123`
3. Enter shop name: `Sharma Tea Stall`
4. Select: ☕ **Tea Stall**
5. Click: **"Use Current Location"** (Allow browser)
6. Skip highlights or select a few
7. See the **GIANT GREEN OPEN BUTTON!**
8. Tap it → Background turns GREEN 🟢

### Step 4: Test as User (1 minute)

1. Open **new incognito window**
2. Go to: `http://localhost:3000/user/dashboard`
3. Allow location
4. See your vendor appear!
5. Check distance, time online
6. Tap "View Details"
7. Tap "Get Directions" → Maps opens!

---

## ✅ YOU'RE DONE!

The complete MVP is working!

---

## 🎯 Key Pages

**Vendor:**
- Login: `/login?mode=vendor`
- Dashboard: `/vendor/dashboard`

**User:**
- Dashboard: `/user/dashboard`
- Map: `/user/map`
- Details: `/user/vendor/[id]`

---

## 🟢 What Makes It Special

1. **GIANT 320px Button** - Can't miss it!
2. **Green/Grey Background** - Instant visual status
3. **Live Updates** - Auto-refresh every 15 seconds
4. **Distance Sorting** - Closest vendors first
5. **One-Tap Everything** - Location, open, directions
6. **Emoji-First** - Works without reading
7. **Shop-Type Only** - No complex menus

---

## 📱 Perfect For

- ☕ Tea stalls
- 🍜 Chinese food vendors
- 🥟 Momo sellers
- 🍋 Juice centers
- 🌮 Street food carts
- 🍛 Biryani shops
- And any local vendor!

---

## 🎉 Ready to Launch!

Everything works. Just add vendors and go live!

For full details, see: [FINAL_MVP_COMPLETE.md](FINAL_MVP_COMPLETE.md)
