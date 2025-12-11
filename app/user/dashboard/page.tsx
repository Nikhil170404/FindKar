"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, MapPin, Home, Map, Loader2, Navigation, Clock, Settings, Heart, RefreshCw, Star, Filter, ChevronDown, LogOut, WifiOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCurrentLocation, calculateDistance, formatDistance, saveLocation, getSavedLocation } from "@/lib/geolocation"
import { useFavorites } from "@/lib/favorites"

interface Vendor {
  id: string
  name: string
  category: string
  category_emoji: string
  lat: number
  lng: number
  last_online_at: string
  distance?: number
  rating?: number
  rating_count?: number
  menu_items?: string[]
}

interface Highlight {
  emoji: string
  label: string
}

interface MenuItem {
  name: string
  emoji: string
}

export default function UserDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [highlights, setHighlights] = useState<Record<string, Highlight[]>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [gettingLocation, setGettingLocation] = useState(true)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [sortBy, setSortBy] = useState<"nearby" | "high-rated" | "low-rated">("nearby")
  const [showFilter, setShowFilter] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [offline, setOffline] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const PAGE_SIZE = 20

  const userLocationRef = useRef<{ latitude: number; longitude: number } | null>(null)

  const { isFavorite, toggleFavorite } = useFavorites()

  useEffect(() => {
    userLocationRef.current = userLocation
  }, [userLocation])

  // Check auth and handle offline
  useEffect(() => {
    checkAuth()

    const handleOnline = () => { setOffline(false); setConnectionError(false) }
    const handleOffline = () => setOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/login")
        return
      }
      setUser(user)
      setAuthChecked(true)
    } catch (err) {
      setConnectionError(true)
      setAuthChecked(true)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  useEffect(() => {
    if (!authChecked) return

    const saved = getSavedLocation()
    if (saved) {
      setUserLocation(saved)
      setGettingLocation(false)
    }

    getUserLocation(!!saved)

    const interval = setInterval(() => {
      fetchVendors(true)
    }, 15000)

    return () => clearInterval(interval)
  }, [authChecked])

  useEffect(() => {
    if (userLocation && authChecked) {
      fetchVendors()
    }
  }, [userLocation, authChecked])

  const getUserLocation = async (hasSavedLocation = false) => {
    try {
      if (!hasSavedLocation) setGettingLocation(true)

      const position = await getCurrentLocation()
      const newLocation = {
        latitude: position.latitude,
        longitude: position.longitude,
      }

      setUserLocation(newLocation)
      saveLocation(newLocation)
    } catch (error) {
      console.error("Location access denied or unavailable:", error)
      // If we don't have saved location, we must show vendors without distance
      if (!hasSavedLocation) {
        setUserLocation(null)
        fetchVendors()
      }
    } finally {
      setGettingLocation(false)
    }
  }

  const fetchVendors = async (isBackground = false, loadMore = false) => {
    try {
      if (!isBackground && !loadMore) setLoading(true)

      // Calculate range
      // If loading more, fetch next page.
      // If refreshing (background or manual), fetch everything currently shown.
      const currentPage = loadMore ? page + 1 : page
      const from = loadMore ? currentPage * PAGE_SIZE : 0
      const to = loadMore ? (currentPage + 1) * PAGE_SIZE - 1 : (currentPage + 1) * PAGE_SIZE - 1

      // Get only ONLINE vendors
      const { data: vendorsData, error, count } = await supabase
        .from("vendors")
        .select("id, name, category, category_emoji, lat, lng, last_online_at, menu_items", { count: "exact" })
        .eq("status", "online")
        .order("last_online_at", { ascending: false })
        .range(from, to)

      if (error) throw error

      // Calculate distances
      const currentLocation = userLocationRef.current
      const vendorsWithDistance: Vendor[] = (vendorsData || []).map((vendor) => {
        let distance: number | undefined = undefined
        if (currentLocation && vendor.lat && vendor.lng) {
          distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            vendor.lat,
            vendor.lng
          )
        }
        return {
          ...vendor,
          distance,
          // Ensure menu_items is array
          menu_items: Array.isArray(vendor.menu_items) ? vendor.menu_items : []
        }
      })

      // Sort by distance
      vendorsWithDistance.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance
        }
        return 0
      })

      // Fetch ratings for these vendors
      let vendorsWithRatings = vendorsWithDistance
      if (vendorsData && vendorsData.length > 0) {
        const { data: ratingsData } = await supabase
          .from("ratings")
          .select("vendor_id, rating")
          .in("vendor_id", vendorsData.map((v) => v.id))

        const ratingsMap: Record<string, { sum: number; count: number }> = {}
        ratingsData?.forEach((r) => {
          if (!ratingsMap[r.vendor_id]) {
            ratingsMap[r.vendor_id] = { sum: 0, count: 0 }
          }
          ratingsMap[r.vendor_id].sum += r.rating
          ratingsMap[r.vendor_id].count += 1
        })

        vendorsWithRatings = vendorsWithDistance.map((v) => {
          const r = ratingsMap[v.id]
          return {
            ...v,
            rating: r ? Math.round((r.sum / r.count) * 10) / 10 : 0,
            rating_count: r ? r.count : 0,
          }
        })
      }

      if (loadMore) {
        setVendors(prev => [...prev, ...vendorsWithRatings])
        setPage(currentPage)
      } else {
        setVendors(vendorsWithRatings)
      }

      // Check if there are more vendors
      if (count !== null) {
        setHasMore(to < count - 1)
      }

      // Fetch highlights for new vendors
      if (vendorsData && vendorsData.length > 0) {
        const { data: highlightsData } = await supabase
          .from("highlights")
          .select("vendor_id, emoji, label")
          .in("vendor_id", vendorsData.map((v) => v.id))

        const highlightsByVendor: Record<string, Highlight[]> = {}
        highlightsData?.forEach((h: any) => {
          if (!highlightsByVendor[h.vendor_id]) {
            highlightsByVendor[h.vendor_id] = []
          }
          highlightsByVendor[h.vendor_id].push({ emoji: h.emoji, label: h.label })
        })

        setHighlights(prev => ({ ...prev, ...highlightsByVendor }))

        // Legacy vendor_menu fetch removed
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchVendors()
    setRefreshing(false)
  }

  const handleLoadMore = () => {
    fetchVendors(false, true)
  }

  const filteredVendors = vendors.filter((vendor) => {
    const query = searchQuery.toLowerCase()
    const matchesName = vendor.name.toLowerCase().includes(query)
    const matchesCategory = vendor.category.toLowerCase().includes(query)
    const matchesMenu = vendor.menu_items?.some(item => item.toLowerCase().includes(query)) || false
    return matchesName || matchesCategory || matchesMenu
  }).sort((a, b) => {
    if (sortBy === "high-rated") {
      return (b.rating || 0) - (a.rating || 0)
    } else if (sortBy === "low-rated") {
      return (a.rating || 0) - (b.rating || 0)
    }
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance
    }
    return 0
  })

  const getTimeSinceOnline = (timestamp: string) => {
    const now = new Date()
    const online = new Date(timestamp)
    const diffMs = now.getTime() - online.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return "Today"
  }

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Connection error screen
  if (connectionError && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Problem</h2>
          <p className="text-gray-600 mb-6">Unable to connect. Please check your internet and try again.</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout & Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Offline Banner */}
      {offline && (
        <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
          <WifiOff className="w-4 h-4" />
          You're offline - Some features may not work
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Findkar</h1>
                <p className="text-xs text-gray-500">Find nearby vendors</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Location Status */}
        {gettingLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Getting your location...</p>
              <p className="text-xs text-blue-700">Finding nearby vendors</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            🟢 Vendors Near You
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredVendors.length} online)
            </span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                <Filter className="w-4 h-4" />
                {sortBy === "nearby" ? "Nearby" : sortBy === "high-rated" ? "⭐ High" : "Low"}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilter ? "rotate-180" : ""}`} />
              </button>
              {showFilter && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  <button
                    onClick={() => { setSortBy("nearby"); setShowFilter(false) }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-2 ${sortBy === "nearby" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                  >
                    📍 Nearby First
                  </button>
                  <button
                    onClick={() => { setSortBy("high-rated"); setShowFilter(false) }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-2 ${sortBy === "high-rated" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                  >
                    ⭐ High Rated
                  </button>
                  <button
                    onClick={() => { setSortBy("low-rated"); setShowFilter(false) }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-2 ${sortBy === "low-rated" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                  >
                    📉 Low Rated
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && !gettingLocation ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No vendors online</h3>
            <p className="text-gray-500">Check back in a few minutes</p>
            <button
              onClick={() => fetchVendors()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer relative"
                onClick={() => window.location.href = `/user/vendor/${vendor.id}`}
              >
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(vendor.id)
                  }}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${isFavorite(vendor.id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400 hover:text-red-400"
                      }`}
                  />
                </button>

                {/* Rating Badge */}
                {vendor.rating !== undefined && vendor.rating > 0 && (
                  <div className="absolute top-6 right-16 flex items-center gap-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/30 rounded-full border border-yellow-100 dark:border-yellow-800">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{vendor.rating}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">({vendor.rating_count})</span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4 pr-10">
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{vendor.category_emoji}</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{vendor.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{vendor.category}</p>
                    </div>
                  </div>
                </div>

                {/* Live Badge (Moved to bottom right) */}
                <div className="absolute bottom-6 right-6 flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  LIVE
                </div>

                {/* Highlights */}
                {highlights[vendor.id] && highlights[vendor.id].length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {highlights[vendor.id].map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                      >
                        <span>{h.emoji}</span>
                        <span>{h.label}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Info */}
                <div className="space-y-2">
                  {vendor.distance !== undefined && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Navigation className="w-4 h-4" />
                      <span className="font-medium">{formatDistance(vendor.distance)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Online {getTimeSinceOnline(vendor.last_online_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && filteredVendors.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 shadow-sm transition-colors"
            >
              Load More Vendors
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <div className="flex flex-col items-center gap-1 text-blue-600">
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Home</span>
            </div>
            <Link href="/user/favorites" className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900">
              <Heart className="w-6 h-6" />
              <span className="text-xs font-medium">Favorites</span>
            </Link>
            <Link href="/user/map" className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900">
              <Map className="w-6 h-6" />
              <span className="text-xs font-medium">Map</span>
            </Link>
            <Link href="/user/settings" className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900">
              <Settings className="w-6 h-6" />
              <span className="text-xs font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
