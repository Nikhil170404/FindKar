# 🎓 Findkar - Interview Deep Dive & Code Examples

> Advanced technical documentation with code explanations

---

## 📂 File-by-File Code Explanation

### 1. `/app/v/[key]/page.tsx` - Vendor Control Page

**Purpose:** Simple page for vendors to toggle OPEN/CLOSE status

```typescript
// Dynamic route - [key] comes from URL
// Example: /v/abc123 → key = "abc123"
export default function VendorPage() {
  const params = useParams()
  const key = params.key as string  // Get secret key from URL
  
  // Fetch vendor by secret key
  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("vendor_secret_key", key)
    .single()
  
  // Toggle status
  const toggleStatus = async () => {
    const newStatus = vendor.status === "online" ? "offline" : "online"
    
    await supabase
      .from("vendors")
      .update({ 
        status: newStatus,
        last_online_at: new Date().toISOString()
      })
      .eq("vendor_secret_key", key)
    
    // Hindi voice feedback
    if (newStatus === "online") {
      speak("Dukaan khul gayi")  // Shop opened
    } else {
      speak("Dukaan band ho gayi")  // Shop closed
    }
  }
}
```

**Key Concepts:**
- Dynamic routes with `[key]`
- No auth required - security via unguessable key
- Web Speech API for Hindi voice

---

### 2. `/lib/geolocation.ts` - Location Functions

```typescript
// Get user's current location
export function getCurrentLocation(): Promise<{latitude: number, longitude: number}> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371  // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c  // Distance in km
}

// Cache location for faster load
export function saveLocation(loc: {latitude: number, longitude: number}) {
  localStorage.setItem("user_location", JSON.stringify(loc))
}

export function getSavedLocation() {
  const saved = localStorage.getItem("user_location")
  return saved ? JSON.parse(saved) : null
}
```

---

### 3. `/lib/favorites.ts` - Custom Hook

```typescript
// Custom React hook for managing favorites
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("favorites")
    if (saved) setFavorites(JSON.parse(saved))
  }, [])
  
  // Check if vendor is favorite
  const isFavorite = (vendorId: string) => favorites.includes(vendorId)
  
  // Toggle favorite status
  const toggleFavorite = (vendorId: string) => {
    let newFavorites: string[]
    
    if (favorites.includes(vendorId)) {
      newFavorites = favorites.filter(id => id !== vendorId)
    } else {
      newFavorites = [...favorites, vendorId]
    }
    
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }
  
  return { favorites, isFavorite, toggleFavorite }
}
```

**Key Concept:** Custom hooks let you reuse stateful logic across components.

---

### 4. Authentication Flow Code

```typescript
// /app/login/page.tsx - Initiate login
const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  // This redirects user to Google, then back to /auth/callback
}

// /app/auth/callback/route.ts - Handle OAuth response
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  
  if (code) {
    const supabase = createRouteHandlerClient()
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get user and check role
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user?.email === "aipgl200ok@gmail.com") {
      return redirect("/admin")  // Admin user
    }
    return redirect("/user/dashboard")  // Regular user
  }
  
  return redirect("/login?error=no_code")
}
```

---

## 🔥 Advanced Interview Topics

### 1. React Server Components (RSC)
```typescript
// Server Component - runs on server, no "use client"
// Can directly fetch from database
export default async function Page() {
  const data = await fetch("...")  // Server-side fetch
  return <div>{data}</div>
}

// Client Component - runs in browser
"use client"
export default function Button() {
  const [count, setCount] = useState(0)  // Needs client JS
  return <button onClick={() => setCount(c => c+1)}>{count}</button>
}
```

**When to use which:**
- Server: Data fetching, SEO, no interactivity
- Client: Forms, buttons, hooks (useState, useEffect)

---

### 2. Supabase Row Level Security

```sql
-- Policy: Anyone can read vendors
CREATE POLICY "public_read" ON vendors
FOR SELECT USING (true);

-- Policy: Only authenticated can insert
CREATE POLICY "auth_insert" ON vendors
FOR INSERT TO authenticated
WITH CHECK (true);

-- Policy: Users can only update their own ratings
CREATE POLICY "own_ratings" ON ratings
FOR ALL USING (auth.uid() = user_id);
```

**Why RLS matters:**
- Security at database level, not app level
- Even if someone exploits frontend, data is protected
- Automatic for all queries

---

### 3. Real-time Subscriptions

```typescript
// Subscribe to vendor status changes
useEffect(() => {
  const channel = supabase
    .channel('vendors')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'vendors' },
      (payload) => {
        console.log('Vendor updated:', payload.new)
        // Update UI with new data
        setVendors(prev => prev.map(v => 
          v.id === payload.new.id ? payload.new : v
        ))
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)  // Cleanup on unmount
  }
}, [])
```

---

### 4. Optimistic Updates

```typescript
// Show change immediately, sync with server later
const toggleFavorite = async (vendorId: string) => {
  // 1. Update UI immediately (optimistic)
  setFavorites(prev => 
    prev.includes(vendorId) 
      ? prev.filter(id => id !== vendorId)
      : [...prev, vendorId]
  )
  
  // 2. Sync with server
  try {
    await saveToDatabase(vendorId)
  } catch (error) {
    // 3. Rollback if failed
    setFavorites(prev => 
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    )
  }
}
```

---

## 🧠 Data Flow Diagrams

### User Finding Vendor
```
User opens app
     ↓
Check if logged in (Supabase)
     ↓
Get saved location (localStorage)
     ↓
Request fresh GPS (Browser API)
     ↓
Fetch online vendors (Supabase)
     ↓
Calculate distances (Haversine)
     ↓
Sort by nearest
     ↓
Render list
```

### Vendor Going Online
```
Vendor opens /v/abc123
     ↓
Fetch vendor by secret_key
     ↓
Show current status (OPEN/CLOSE button)
     ↓
Vendor taps button
     ↓
Update status in database
     ↓
Play Hindi voice feedback
     ↓
Users see status change (real-time)
```

---

## 📊 Performance Optimizations

### 1. Location Caching
```typescript
// Save location to avoid repeated GPS requests
saveLocation({ lat: 19.07, lng: 72.87 })

// On next visit, use cached first
const saved = getSavedLocation()
if (saved) {
  showVendors(saved)  // Instant load
}
// Then get fresh location in background
getFreshLocation()
```

### 2. Pagination
```typescript
// Don't load all vendors at once
const PAGE_SIZE = 20
const { data } = await supabase
  .from("vendors")
  .select("*")
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
```

### 3. Incremental Loading
```typescript
// Load more on scroll
const handleScroll = () => {
  if (nearBottom() && hasMore) {
    loadMoreVendors()
  }
}
```

---

## 🐛 Common Bugs & Fixes

### Bug: Location not working
**Cause:** User denied permission or HTTPS required
**Fix:**
```typescript
try {
  await getCurrentLocation()
} catch (error) {
  if (error.code === 1) {
    alert("Please enable location access")
  }
  // Fallback: Show vendors without distance
}
```

### Bug: Auth redirect loop
**Cause:** Token expired, keeps redirecting
**Fix:**
```typescript
// Clear session and redirect to login
await supabase.auth.signOut()
router.push("/login")
```

### Bug: Real-time not updating
**Cause:** Supabase Realtime not enabled
**Fix:** Enable in Supabase Dashboard → Database → Replication

---

## 📋 Testing Checklist

### Unit Tests (if adding Jest)
```typescript
test("calculateDistance returns correct distance", () => {
  const distance = calculateDistance(19.07, 72.88, 19.08, 72.89)
  expect(distance).toBeCloseTo(1.5, 1)  // ~1.5 km
})

test("formatDistance formats correctly", () => {
  expect(formatDistance(0.5)).toBe("500m")
  expect(formatDistance(2.3)).toBe("2.3 km")
})
```

### E2E Tests (if adding Playwright)
```typescript
test("user can login and see vendors", async ({ page }) => {
  await page.goto("/login")
  await page.click("text=Continue with Google")
  // ... mock OAuth
  await expect(page).toHaveURL("/user/dashboard")
  await expect(page.locator(".vendor-card")).toBeVisible()
})
```

---

## 🎯 Quick Reference

### Supabase Client
```typescript
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()

// SELECT
const { data } = await supabase.from("vendors").select("*")

// INSERT
await supabase.from("vendors").insert({ name: "Test" })

// UPDATE
await supabase.from("vendors").update({ status: "online" }).eq("id", "123")

// DELETE
await supabase.from("vendors").delete().eq("id", "123")
```

### Next.js Routing
```
app/page.tsx           → /
app/about/page.tsx     → /about
app/user/[id]/page.tsx → /user/123 (dynamic)
app/api/hello/route.ts → /api/hello (API route)
```

### Tailwind Common Classes
```
p-4         → padding: 1rem
mx-auto     → margin-left/right: auto (center)
flex        → display: flex
items-center→ align-items: center
rounded-xl  → border-radius: 0.75rem
bg-blue-600 → background: #2563eb
text-white  → color: white
```

---

*Study this file before interviews! 🚀*
