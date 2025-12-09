# 📚 FINDKAR - Complete Project Guide
> For Interviews, Learning & Understanding

---

## 🎯 What is Findkar?

**Simple Answer:** An app to find nearby street vendors (chai stalls, momo shops, etc.) and see if they're OPEN or CLOSED in real-time.

**Problem Solved:** Street vendors don't have fixed hours. Users waste time going to closed shops. Findkar shows live status.

---

## 🛠️ Tech Stack Explained

### 1. Next.js 14 (App Router)
**What:** React framework for building websites
**Why:** 
- Server-side rendering = Fast loading
- App Router = Modern file-based routing
- Built-in API routes

**Example:** 
```
app/
  page.tsx          → Homepage (/)
  login/page.tsx    → Login page (/login)
  user/
    dashboard/page.tsx → User dashboard (/user/dashboard)
```

### 2. Supabase (Backend)
**What:** Open-source Firebase alternative
**Why:**
- PostgreSQL database = Reliable, scalable
- Real-time subscriptions = Live updates
- Built-in auth = Easy Google login
- Row Level Security = Secure data

**Example:**
```javascript
// Fetch all online vendors
const { data } = await supabase
  .from("vendors")
  .select("*")
  .eq("status", "online")
```

### 3. TypeScript
**What:** JavaScript with types
**Why:** Catches errors before running, better autocomplete

**Example:**
```typescript
interface Vendor {
  id: string
  name: string
  status: "online" | "offline"
}
```

### 4. Tailwind CSS
**What:** Utility-first CSS framework
**Why:** Fast styling without writing CSS files

**Example:**
```jsx
<button className="bg-blue-600 text-white rounded-xl py-3">
  Click Me
</button>
```

### 5. Vercel (Hosting)
**What:** Cloud platform for Next.js
**Why:** One-click deploy, automatic HTTPS, fast CDN

---

## 📁 Project Structure

```
findkar-app/
├── app/                    # All pages (Next.js 14 App Router)
│   ├── page.tsx           # Landing page
│   ├── login/page.tsx     # User login
│   ├── admin/             # Admin panel
│   │   ├── page.tsx       # Vendor list
│   │   ├── add/page.tsx   # Add vendor (wizard)
│   │   └── edit/[id]/     # Edit vendor
│   ├── user/              # User pages
│   │   ├── dashboard/     # Main vendor list
│   │   ├── vendor/[id]/   # Vendor detail
│   │   ├── favorites/     # User favorites
│   │   └── settings/      # User settings
│   ├── v/[key]/page.tsx   # Vendor control (OPEN/CLOSE)
│   └── auth/callback/     # Google OAuth callback
├── components/            # Reusable UI components
├── lib/                   # Utility functions
│   ├── supabase/         # Database client
│   ├── geolocation.ts    # Location helpers
│   └── favorites.ts      # Favorites logic
└── public/               # Static files (images, icons)
```

---

## 🔐 Authentication Flow

### How Google Login Works:

```
1. User clicks "Login with Google"
        ↓
2. Supabase redirects to Google OAuth
        ↓
3. User enters Google credentials
        ↓
4. Google returns token to /auth/callback
        ↓
5. Supabase creates session
        ↓
6. App checks email:
   - aipgl200ok@gmail.com → /admin
   - Others → /user/dashboard
```

**Code Example:**
```javascript
// Login button click
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})

// Callback route checks user
const { data: { user } } = await supabase.auth.getUser()
if (user.email === "aipgl200ok@gmail.com") {
  redirect("/admin")
} else {
  redirect("/user/dashboard")
}
```

---

## 📊 Database Schema

### vendors table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Vendor name |
| category | TEXT | "Tea Stall", "Momo Stall" etc |
| category_emoji | TEXT | 🍵, 🥟 etc |
| lat | DECIMAL | Latitude |
| lng | DECIMAL | Longitude |
| status | TEXT | "online" or "offline" |
| description | TEXT | About vendor |
| menu_items | TEXT[] | Array of items with prices |
| vendor_secret_key | TEXT | Unique key for vendor link |
| last_online_at | TIMESTAMP | When vendor went online |

### highlights table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vendor_id | UUID | Foreign key to vendors |
| emoji | TEXT | 🔥, ⭐ etc |
| label | TEXT | "Popular", "Best Seller" |

### ratings table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vendor_id | UUID | Foreign key |
| user_id | UUID | Who rated |
| rating | INTEGER | 1-5 stars |

---

## ⭐ Key Features Explained

### 1. No-Login Vendor System
**What:** Vendors don't need app/login. Just a link with big OPEN/CLOSE button.

**How it works:**
```
1. Admin creates vendor → System generates secret_key (abc123xyz)
2. Admin copies link: findkar.com/v/abc123xyz
3. Vendor bookmarks link on phone
4. Vendor opens link → Taps OPEN when starting
5. Database updates → Users see vendor is OPEN
```

**Why genius:** 
- Zero friction for vendors
- Works on any phone with browser
- No passwords to remember

### 2. Real-time Location
**What:** Shows distance to each vendor

**How it works:**
```javascript
// 1. Get user's location
navigator.geolocation.getCurrentPosition()

// 2. Calculate distance using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  // Math to calculate distance on Earth's surface
  return distanceInKm
}

// 3. Sort vendors by distance
vendors.sort((a, b) => a.distance - b.distance)
```

### 3. Hindi Voice Feedback
**What:** Says "Dukaan khul gayi" when vendor opens shop

**How it works:**
```javascript
const speech = new SpeechSynthesisUtterance("Dukaan khul gayi")
speech.lang = "hi-IN"
window.speechSynthesis.speak(speech)
```

### 4. Star Rating System
**What:** Users rate vendors 1-5 stars

**How it works:**
```javascript
// Save rating
await supabase.from("ratings").upsert({
  vendor_id: vendorId,
  user_id: currentUserId,
  rating: 5
})

// Calculate average
SELECT AVG(rating) FROM ratings WHERE vendor_id = 'xyz'
```

---

## 🔒 Security Concepts

### Row Level Security (RLS)
**What:** Database rules that control who can read/write data

**Example:**
```sql
-- Anyone can read vendors
CREATE POLICY "Public read" ON vendors
FOR SELECT USING (true);

-- Only authenticated users can insert
CREATE POLICY "Auth insert" ON vendors
FOR INSERT TO authenticated
WITH CHECK (true);
```

### Why vendor_secret_key works:
- Key is random, unguessable (abc123xyz)
- Never shown publicly
- Only admin and vendor know it
- Even if someone gets it, can only change status (not delete)

---

## 🧪 Testing Approaches

### Manual Testing Checklist:
- [ ] Login with Google works
- [ ] Vendors appear on map
- [ ] Distance calculation is correct
- [ ] Vendor OPEN/CLOSE updates in real-time
- [ ] Ratings save and display
- [ ] Favorites persist across sessions
- [ ] Offline banner shows when disconnected
- [ ] Admin can add/edit/delete vendors

### What to Test in Each Page:
| Page | Test Cases |
|------|------------|
| /login | Google login, offline handling, auto-redirect if logged in |
| /user/dashboard | Location permission, vendor list, search, sort |
| /user/vendor/[id] | Details load, rating works, directions open |
| /v/[key] | OPEN/CLOSE toggle, voice feedback, status updates |
| /admin | Auth check, search, pagination, delete confirmation |

---

## ❓ Interview Questions & Answers

### Q1: What problem does Findkar solve?
**A:** Street vendors don't have digital presence. Users can't know if vendor is open. Findkar provides real-time open/closed status.

### Q2: Why Next.js over React?
**A:** 
- Server-side rendering for SEO
- File-based routing (no react-router needed)
- API routes built-in
- Built-in image optimization
- Easy deployment on Vercel

### Q3: Why Supabase over Firebase?
**A:**
- PostgreSQL (relational) vs Firestore (NoSQL)
- SQL queries more powerful
- Open-source, can self-host
- Better pricing model
- Row Level Security is cleaner

### Q4: How does real-time work?
**A:** Supabase uses PostgreSQL's LISTEN/NOTIFY. When data changes, connected clients get notified instantly via WebSocket.

### Q5: Explain the vendor_secret_key approach
**A:** 
- Each vendor gets unique random key
- Key is in URL: /v/{key}
- No login needed - just bookmark link
- Security: key is unguessable, only status can be updated

### Q6: How do you handle offline users?
**A:** 
- Check `navigator.onLine` and listen to online/offline events
- Show orange banner when offline
- Cache last location in localStorage
- Show retry button on connection errors

### Q7: Explain authentication flow
**A:** 
1. Click Google login
2. Supabase redirects to Google
3. Google returns to /auth/callback with code
4. Supabase exchanges code for session
5. Check email for admin vs user redirect

### Q8: How is location calculated?
**A:** Haversine formula - calculates great-circle distance between two points on Earth using latitude/longitude. Result in kilometers.

### Q9: What is Row Level Security?
**A:** Database-level access control. Policies define who can SELECT/INSERT/UPDATE/DELETE. More secure than app-level checks.

### Q10: How would you scale this app?
**A:**
- Supabase handles PostgreSQL scaling
- Vercel handles frontend scaling with CDN
- Add caching with Redis for hot data
- Use database indexes on lat/lng for geo queries
- Consider PostGIS for advanced geo features

---

## 🚀 Deployment Steps

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# 3. Run locally
npm run dev

# 4. Deploy to Vercel
npx vercel --prod
```

---

## 📝 Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check for errors

# Database (run in Supabase SQL Editor)
-- See vendor-secret-key-migration.sql
-- See ratings-schema.sql
```

---

## 🎯 Key Learning Points

1. **Next.js App Router** - Modern React with file-based routing
2. **Supabase** - Backend-as-a-Service with real-time features
3. **TypeScript** - Type-safe JavaScript
4. **OAuth 2.0** - How Google login works
5. **Geolocation API** - Getting user's location
6. **Row Level Security** - Database access control
7. **Real-time Updates** - WebSocket-based live data
8. **PWA Concepts** - Offline handling, caching

---

## ✅ What Makes This MVP Good

1. **Solves Real Problem** - Street vendors have no digital presence
2. **Zero Friction** - No app download for vendors
3. **Real-time** - Live status updates
4. **Mobile-First** - Works great on phones
5. **Simple UI** - Big buttons, clear actions
6. **Scalable Architecture** - Supabase + Vercel handle growth

---

*Last Updated: December 2024*
