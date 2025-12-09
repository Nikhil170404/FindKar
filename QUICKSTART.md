# Quick Start Guide - Findkar

Get your Findkar app running in 5 minutes!

## Prerequisites Check

Make sure you have:
- ✅ Node.js 18+ installed
- ✅ npm or yarn
- ✅ A code editor (VS Code recommended)

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

This installs:
- Next.js 15
- React 19
- Supabase client
- Tailwind CSS
- Lucide icons
- TypeScript

## Step 2: Set Up Environment Variables (1 min)

1. Open `.env.local` file
2. Replace with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to get these?**
- Go to [supabase.com](https://supabase.com)
- Create a project (takes 2 minutes)
- Go to Settings → API
- Copy URL and anon key

## Step 3: Set Up Database (2 min)

1. In Supabase dashboard, go to **SQL Editor**
2. Copy contents of `supabase-schema.sql`
3. Paste and run
4. Done! ✅

## Step 4: Start Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the landing page! 🎉

## What You Get

### Landing Page (/)
Beautiful landing page with:
- Hero section
- Feature cards
- Call-to-action buttons

### User Flow
1. `/login?mode=user` → User login
2. `/user/dashboard` → See nearby vendors
3. `/user/vendor/[id]` → Vendor details
4. `/user/settings` → User settings

### Vendor Flow
1. `/login?mode=vendor` → Vendor login
2. `/vendor/dashboard` → Simple on/off toggle
3. Emoji-based menu
4. Voice feedback (Hindi)

## Test the App

### Without Database (Frontend Only)
- ✅ Landing page works
- ✅ Login page UI works
- ❌ OTP won't work (needs Supabase)
- ❌ Dashboard shows empty

### With Database Setup
- ✅ Everything works!
- ✅ Phone OTP authentication
- ✅ Can view vendors (if you add sample data)

## Add Sample Vendor (Optional)

In Supabase SQL Editor:

```sql
INSERT INTO vendors (
  shop_name, category, phone, address,
  latitude, longitude, location, is_open
) VALUES (
  'Test Vendor',
  'food',
  '+919999999999',
  'Test Address',
  28.6139,
  77.2090,
  ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography,
  true
);
```

Now refresh `/user/dashboard` - you'll see the vendor!

## Troubleshooting

### Port 3000 already in use?
```bash
# Kill the process
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Environment variables not working?
- Restart dev server after changing `.env.local`
- Check for typos in variable names
- Ensure file is named `.env.local` (not `.env`)

### Supabase connection error?
- Check URL and key in `.env.local`
- Verify project is active in Supabase
- Check browser console for errors

### TypeScript errors?
```bash
# Regenerate types
npm run build

# Clear cache
rm -rf .next
npm run dev
```

## Next Steps

### 1. Enable Phone Auth
- Follow `SUPABASE_SETUP.md`
- Set up Twilio
- Test OTP login

### 2. Customize Branding
- Change colors in Tailwind config
- Update logo
- Modify text/copy

### 3. Add Features
- Payment integration
- Push notifications
- Chat system
- Admin dashboard

### 4. Deploy to Production
- Push to GitHub
- Deploy on Vercel (free)
- Add production env variables
- Test everything!

## Project Structure at a Glance

```
findkar-app/
├── app/
│   ├── page.tsx              # Landing page ✅
│   ├── login/                # Login/OTP ✅
│   ├── user/                 # User pages ✅
│   └── vendor/               # Vendor pages ✅
├── lib/
│   ├── supabase/             # Database config ✅
│   └── geolocation.ts        # Location utils ✅
├── .env.local                # Your secrets 🔒
└── supabase-schema.sql       # Database schema ✅
```

## Development Tips

### Hot Reload
- Save any file → Changes reflect instantly
- No need to restart server

### Mobile Testing
- Your phone on same WiFi
- Go to `http://your-ip:3000`
- Get IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

### Debug Mode
- Open browser DevTools (F12)
- Check Console for errors
- Network tab for API calls

## Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint code
npm run lint
```

## Resources

- 📖 [Full Documentation](./README.md)
- 🗄️ [Supabase Setup Guide](./SUPABASE_SETUP.md)
- 💬 Need help? Create an issue on GitHub

---

**You're all set! Start building your hyperlocal vendor network! 🚀**
