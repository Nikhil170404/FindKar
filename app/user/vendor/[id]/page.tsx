"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Share2, Navigation, Clock, Loader2, Phone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCurrentLocation, calculateDistance, formatDistance, getDirectionsUrl, watchLocation, clearLocationWatch } from "@/lib/geolocation"
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
    // price removed
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

        // Start watching location for real-time updates
        let watchId: number | null = null
        try {
            watchId = watchLocation((coords) => {
                setUserLocation(coords)
            })
        } catch (error) {
            console.error("Error starting location watch:", error)
            getUserLocation() // Fallback
        }

        const interval = setInterval(() => {
            fetchVendorDetails(true)
        }, 15000)

        return () => {
            clearInterval(interval)
            if (watchId !== null) clearLocationWatch(watchId)
        }
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

            // Parse menu items - now just strings
            const parsedMenuItems: MenuItem[] = []
            if (vendorData.menu_items && vendorData.menu_items.length > 0) {
                vendorData.menu_items.forEach((item: string) => {
                    // Clean up old "Name ₹Price" format if exists
                    const match = item.match(/(.+?)\s*₹\d+/)
                    if (match) {
                        parsedMenuItems.push({ name: match[1].trim() })
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
                alert("Link copied to clipboard!")
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

    if (!vendor) return null

    const isOnline = vendor.status === "online"

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Image/Gradient */}
            <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-700 relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <button
                    onClick={() => router.push("/user/dashboard")}
                    className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={handleShare}
                    className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                >
                    <Share2 className="w-6 h-6" />
                </button>
            </div>

            <div className="px-4 -mt-16 relative z-10">
                {/* Vendor Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-4 text-center">
                    <div className="w-20 h-20 bg-white rounded-full shadow-lg mx-auto -mt-16 mb-4 flex items-center justify-center text-5xl">
                        {vendor.category_emoji}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{vendor.name}</h1>
                    <p className="text-gray-500 font-medium mb-4">{vendor.category}</p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-center gap-6 py-4 border-t border-gray-100">
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
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t shadow-2xl z-50">
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
