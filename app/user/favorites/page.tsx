"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Heart, Navigation, Clock, Loader2, Home, Map, Settings, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useFavorites } from "@/lib/favorites"
import { getCurrentLocation, calculateDistance, formatDistance } from "@/lib/geolocation"

interface Vendor {
    id: string
    name: string
    category: string
    category_emoji: string
    lat: number
    lng: number
    status: string
    last_online_at: string
    distance?: number
}

export default function FavoritesPage() {
    const supabase = createClient()
    const { favorites, toggleFavorite } = useFavorites()

    const [vendors, setVendors] = useState<Vendor[]>([])
    const [loading, setLoading] = useState(true)
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

    useEffect(() => {
        getUserLocation()
    }, [])

    useEffect(() => {
        if (favorites.length > 0) {
            fetchFavoriteVendors()
        } else {
            setVendors([])
            setLoading(false)
        }
    }, [favorites, userLocation])

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

    const fetchFavoriteVendors = async () => {
        try {
            setLoading(true)

            const { data: vendorsData, error } = await supabase
                .from("vendors")
                .select("id, name, category, category_emoji, lat, lng, status, last_online_at")
                .in("id", favorites)

            if (error) throw error

            // Calculate distances and sort
            const vendorsWithDistance: Vendor[] = (vendorsData || []).map((vendor) => {
                if (userLocation && vendor.lat && vendor.lng) {
                    const distance = calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        vendor.lat,
                        vendor.lng
                    )
                    return { ...vendor, distance }
                }
                return { ...vendor, distance: undefined }
            })

            // Sort: online first, then by distance
            vendorsWithDistance.sort((a, b) => {
                if (a.status === "online" && b.status !== "online") return -1
                if (a.status !== "online" && b.status === "online") return 1
                if (a.distance !== undefined && b.distance !== undefined) {
                    return a.distance - b.distance
                }
                return 0
            })

            setVendors(vendorsWithDistance)
        } catch (error) {
            console.error("Error fetching favorites:", error)
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link href="/user/dashboard">
                            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Favorites</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{favorites.length} saved vendors</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">💔</div>
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No favorites yet</h3>
                        <p className="text-gray-500 dark:text-gray-500 mb-4">Tap the ❤️ on vendors to save them here</p>
                        <Link
                            href="/user/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                        >
                            Find Vendors
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {vendors.map((vendor) => {
                            const isOnline = vendor.status === "online"

                            return (
                                <div
                                    key={vendor.id}
                                    className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-2 transition-all cursor-pointer ${isOnline
                                            ? "border-green-300 dark:border-green-700"
                                            : "border-gray-200 dark:border-gray-700 opacity-75"
                                        }`}
                                    onClick={() => window.location.href = `/user/vendor/${vendor.id}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Emoji */}
                                        <div className="text-4xl">{vendor.category_emoji}</div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{vendor.name}</h3>
                                                {isOnline ? (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                        LIVE
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                                                        Offline
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{vendor.category}</p>

                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-500">
                                                {vendor.distance !== undefined && (
                                                    <span className="flex items-center gap-1">
                                                        <Navigation className="w-3 h-3" />
                                                        {formatDistance(vendor.distance)}
                                                    </span>
                                                )}
                                                {vendor.last_online_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {isOnline ? "Online " : "Last seen "}
                                                        {getTimeSinceOnline(vendor.last_online_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Remove Favorite */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                toggleFavorite(vendor.id)
                                            }}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                                        >
                                            <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-around py-3">
                        <Link href="/user/dashboard" className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <Home className="w-6 h-6" />
                            <span className="text-xs font-medium">Home</span>
                        </Link>
                        <div className="flex flex-col items-center gap-1 text-red-500">
                            <Heart className="w-6 h-6 fill-current" />
                            <span className="text-xs font-medium">Favorites</span>
                        </div>
                        <Link href="/user/map" className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <Map className="w-6 h-6" />
                            <span className="text-xs font-medium">Map</span>
                        </Link>
                        <Link href="/user/settings" className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <Settings className="w-6 h-6" />
                            <span className="text-xs font-medium">Settings</span>
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    )
}
