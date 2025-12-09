"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Share2, Navigation, Clock, Loader2, Phone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCurrentLocation, calculateDistance, formatDistance, getDirectionsUrl } from "@/lib/geolocation"
import { StarRating } from "@/components/star-rating"

interface Vendor {
  id: string
  name: string
  category: string
  category_emoji: string
  lat: number
  lng: number
  status: string
  last_online_at: string
  description?: string
  menu_items?: string[]
}

interface Highlight {
  emoji: string
  label: string
}

interface MenuItem {
  name: string
  price?: number
}

export default function VendorDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string
  const supabase = createClient()

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [distance, setDistance] = useState<number | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  useEffect(() => {
    fetchVendorDetails()
    getUserLocation()

    const interval = setInterval(() => {
      fetchVendorDetails(true)
    }, 15000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId])

  const getUserLocation = async () => {
    try {
      const position = await getCurrentLocation()
      setUserLocation({
        latitude: position.latitude,
        longitude: position.longitude,
      })
    } catch (error) {
      console.error("Location access denied:", error)
    }
  }

  const fetchVendorDetails = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true)

      const { data: vendorData, error: vendorError } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", vendorId)
        .single()

      if (vendorError) throw vendorError

      setVendor(vendorData)

      if (userLocation && vendorData.lat && vendorData.lng) {
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          vendorData.lat,
          vendorData.lng
        )
        setDistance(dist)
      }

      const { data: highlightsData } = await supabase
        .from("highlights")
        .select("emoji, label")
        .eq("vendor_id", vendorId)

      setHighlights(highlightsData || [])

      // Parse menu items
      const parsedMenuItems: MenuItem[] = []
      if (vendorData.menu_items && vendorData.menu_items.length > 0) {
        vendorData.menu_items.forEach((item: string) => {
          const match = item.match(/(.+?)\s*₹(\d+)/)
          if (match) {
            parsedMenuItems.push({ name: match[1].trim(), price: parseInt(match[2]) })
          } else {
            parsedMenuItems.push({ name: item })
          }
        })
      }
      setMenuItems(parsedMenuItems)
    } catch (error) {
      console.error("Error fetching vendor:", error)
      if (!isBackground) router.push("/user/dashboard")
    } finally {
      setLoading(false)
    }
  }

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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: vendor?.name,
          text: `Check out ${vendor?.name} on Findkar!`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert("Link copied!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Vendor not found</h2>
        <Link href="/user/dashboard" className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const isOnline = vendor.status === "online"

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      {/* Header */}
      <header className={`${isOnline ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-gradient-to-br from-gray-500 to-gray-600"} text-white`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/user/dashboard" className="p-2 -ml-2 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <button onClick={handleShare} className="p-2 -mr-2 hover:bg-white/20 rounded-full">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Hero */}
        <div className="px-6 pb-8 pt-2 text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-5xl">{vendor.category_emoji}</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">{vendor.name}</h1>
          <p className="text-white/80 text-sm mb-4">{vendor.category}</p>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold ${isOnline ? "bg-white text-green-600" : "bg-white/20 text-white"
            }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
            {isOnline ? "OPEN NOW" : "CLOSED"}
          </div>
        </div>
      </header>

      <div className="px-4 -mt-4">
        {/* Stats Row */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center justify-around">
          {distance !== null && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <MapPin className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-gray-900">{formatDistance(distance)}</p>
              <p className="text-xs text-gray-500">away</p>
            </div>
          )}

          {isOnline && vendor.last_online_at && (
            <>
              <div className="w-px h-10 bg-gray-200"></div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold text-gray-900">{getTimeSinceOnline(vendor.last_online_at)}</p>
                <p className="text-xs text-gray-500">online</p>
              </div>
            </>
          )}

          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center">
            <StarRating vendorId={vendorId} showAverage={true} size="sm" />
          </div>
        </div>

        {/* Description */}
        {vendor.description && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">About</h3>
            <p className="text-gray-700 leading-relaxed">{vendor.description}</p>
          </div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {highlights.map((h, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-full text-sm font-semibold border border-purple-100"
                >
                  <span>{h.emoji}</span>
                  <span>{h.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Menu - Clean Design */}
        {menuItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
            <div className="p-5 pb-3 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Menu</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {menuItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  {item.price ? (
                    <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                      ₹{item.price}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Menu */}
        {menuItems.length === 0 && !vendor.description && highlights.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-4 text-center">
            <div className="text-5xl mb-3">🏪</div>
            <p className="text-gray-500">Visit this vendor for more details</p>
          </div>
        )}
      </div>

      {/* Get Directions Button */}
      {vendor.lat && vendor.lng && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t shadow-2xl">
          <a
            href={getDirectionsUrl(vendor.lat, vendor.lng, vendor.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
          >
            <Navigation className="w-5 h-5" />
            Get Directions
          </a>
        </div>
      )}
    </div>
  )
}
