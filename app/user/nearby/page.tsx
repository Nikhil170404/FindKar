"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Navigation, Store, Loader2, Filter, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCurrentLocation, calculateDistance, formatDistance, getDirectionsUrl } from "@/lib/geolocation"

interface Vendor {
  id: string
  shop_name: string
  category: string
  rating: number
  distance?: number
  is_open: boolean
  address: string
  phone: string
  latitude: number | null
  longitude: number | null
  review_count: number
}

export default function NearbyVendors() {
  const supabase = createClient()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [gettingLocation, setGettingLocation] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [radiusKm, setRadiusKm] = useState(5)

  const categories = [
    { id: "all", name: "All", icon: "🏪" },
    { id: "food", name: "Food", icon: "🍔" },
    { id: "salon", name: "Salon", icon: "💇" },
    { id: "repair", name: "Repair", icon: "🔧" },
    { id: "grocery", name: "Grocery", icon: "🛒" },
  ]

  useEffect(() => {
    getUserLocation()
  }, [])

  useEffect(() => {
    if (userLocation) {
      fetchNearbyVendors()
    }
  }, [userLocation, radiusKm])

  const getUserLocation = async () => {
    try {
      setGettingLocation(true)
      const position = await getCurrentLocation()
      setUserLocation({
        latitude: position.latitude,
        longitude: position.longitude,
      })
    } catch (error) {
      console.error("Error getting location:", error)
      alert("Please enable location access to see nearby vendors")
    } finally {
      setGettingLocation(false)
    }
  }

  const fetchNearbyVendors = async () => {
    if (!userLocation) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null)

      if (error) throw error

      // Calculate distances and filter by radius
      const vendorsWithDistance = (data || [])
        .map((vendor) => {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            vendor.latitude!,
            vendor.longitude!
          )
          return { ...vendor, distance }
        })
        .filter((vendor) => vendor.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)

      setVendors(vendorsWithDistance)
    } catch (error) {
      console.error("Error fetching nearby vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter((vendor) => {
    return selectedCategory === "all" || vendor.category === selectedCategory
  })

  if (gettingLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900">Getting your location...</p>
          <p className="text-sm text-gray-600 mt-2">Please allow location access</p>
        </div>
      </div>
    )
  }

  if (!userLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <header className="bg-white border-b shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Link href="/user/dashboard">
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Nearby Vendors</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-20 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Required</h2>
          <p className="text-gray-600 mb-6">
            We need your location to show nearby vendors
          </p>
          <button
            onClick={getUserLocation}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Enable Location
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/user/dashboard">
              <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Nearby Vendors</h1>
          </div>

          {/* Location Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
            <Navigation className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">Your Location</p>
              <p className="text-xs text-blue-700">
                Lat: {userLocation.latitude.toFixed(4)}, Lng: {userLocation.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Radius Filter */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Search Radius:</span>
            <div className="flex gap-2">
              {[2, 5, 10, 20].map((km) => (
                <button
                  key={km}
                  onClick={() => setRadiusKm(km)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    radiusKm === km
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 overflow-x-auto">
          <div className="flex gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vendors List */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
          </h2>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No vendors nearby</h3>
            <p className="text-gray-500 mb-4">Try increasing the search radius</p>
            <button
              onClick={() => setRadiusKm(radiusKm + 5)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Expand to {radiusKm + 5} km
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVendors.map((vendor, index) => (
              <div
                key={vendor.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold text-blue-600">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{vendor.shop_name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{vendor.category}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    vendor.is_open
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${vendor.is_open ? "bg-green-500" : "bg-red-500"}`}></div>
                    {vendor.is_open ? "Open" : "Closed"}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{formatDistance(vendor.distance!)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{vendor.rating} ({vendor.review_count} reviews)</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/user/vendor/${vendor.id}`}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium text-center hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                  <a
                    href={getDirectionsUrl(vendor.latitude!, vendor.longitude!, vendor.shop_name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Navigation className="w-5 h-5" />
                  </a>
                  <a
                    href={`tel:${vendor.phone}`}
                    className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
