"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Navigation, Loader2, Home, Map as MapIcon, Settings, Heart, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCurrentLocation, formatDistance, calculateDistance, getDirectionsUrl, saveLocation, getSavedLocation } from "@/lib/geolocation"
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
}

interface Highlight {
  emoji: string
  label: string
}

export default function UserMapView() {
  const supabase = createClient()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [highlights, setHighlights] = useState<Record<string, Highlight[]>>({})
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [gettingLocation, setGettingLocation] = useState(true)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  // Use ref to access latest location in setInterval closure
  const userLocationRef = useRef<{ latitude: number; longitude: number } | null>(null)

  const { isFavorite, toggleFavorite } = useFavorites()

  useEffect(() => {
    userLocationRef.current = userLocation
  }, [userLocation])

  useEffect(() => {
    // Try to get saved location first for instant load
    const saved = getSavedLocation()
    if (saved) {
      setUserLocation(saved)
      setGettingLocation(false)
    }

    getUserLocation(!!saved)

    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      fetchVendors(true) // true = background refresh
    }, 15000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (userLocation) {
      fetchVendors()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation])

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
      if (!hasSavedLocation) {
        setUserLocation(null)
        fetchVendors()
      }
    } finally {
      setGettingLocation(false)
    }
  }

  const fetchVendors = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true)

      // Get only ONLINE vendors
      const { data: vendorsData, error } = await supabase
        .from("vendors")
        .select("id, name, category, category_emoji, lat, lng, last_online_at")
        .eq("status", "online")
        .order("last_online_at", { ascending: false })

      if (error) throw error

      // Calculate distances
      const currentLocation = userLocationRef.current
      const vendorsWithDistance: Vendor[] = (vendorsData || []).map((vendor) => {
        if (currentLocation && vendor.lat && vendor.lng) {
          const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            vendor.lat,
            vendor.lng
          )
          return { ...vendor, distance }
        }
        return { ...vendor, distance: undefined }
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

      setVendors(vendorsWithRatings)

      // Fetch highlights
      if (vendorsData && vendorsData.length > 0) {
        const { data: highlightsData } = await supabase
          .from("highlights")
          .select("vendor_id, emoji, label")
          .in("vendor_id", vendorsData.map((v) => v.id))

        const highlightsByVendor: Record<string, Highlight[]> = {}
        highlightsData?.forEach((h: { vendor_id: string; emoji: string; label: string }) => {
          if (!highlightsByVendor[h.vendor_id]) {
            highlightsByVendor[h.vendor_id] = []
          }
          highlightsByVendor[h.vendor_id].push({ emoji: h.emoji, label: h.label })
        })
        setHighlights(highlightsByVendor)
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/user/dashboard">
              <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Map View</h1>
              <p className="text-sm text-gray-600">{vendors.length} vendors online</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              LIVE
            </div>
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
            </div>
          </div>
        )}

        {/* Map Placeholder / Info */}
        {userLocation && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 mb-6 text-white text-center">
            <MapIcon className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-2">Interactive Map Coming Soon!</h2>
            <p className="text-blue-100 mb-4">
              For now, browse vendors below sorted by distance
            </p>
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              📍 Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </div>
          </div>
        )}

        {/* Vendors List (Map Style) */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No vendors nearby</h3>
            <p className="text-gray-500">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Vendors Near You ({vendors.length})
            </h3>

            {vendors.map((vendor, index) => (
              <div
                key={vendor.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 transition-all relative ${selectedVendor?.id === vendor.id
                  ? "border-blue-500 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                onClick={() => setSelectedVendor(selectedVendor?.id === vendor.id ? null : vendor)}
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

                <div className="flex items-start gap-4 pr-10">
                  {/* Pin Number */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${index < 3 ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}>
                    #{index + 1}
                  </div>

                  {/* Vendor Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{vendor.category_emoji}</span>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">{vendor.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{vendor.category}</p>
                        </div>
                      </div>
                    </div>

                    {/* Highlights */}
                    {highlights[vendor.id] && highlights[vendor.id].length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {highlights[vendor.id].map((h, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs dark:text-gray-300">
                            <span>{h.emoji}</span>
                            <span>{h.label}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Distance */}
                    {vendor.distance !== undefined && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{formatDistance(vendor.distance)}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/user/vendor/${vendor.id}`}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium text-center hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                      <a
                        href={getDirectionsUrl(vendor.lat, vendor.lng, vendor.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Navigation className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Link href="/user/dashboard" className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900">
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link href="/user/favorites" className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900">
              <Heart className="w-6 h-6" />
              <span className="text-xs font-medium">Favorites</span>
            </Link>
            <div className="flex flex-col items-center gap-1 text-blue-600">
              <MapIcon className="w-6 h-6" />
              <span className="text-xs font-medium">Map</span>
            </div>
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
