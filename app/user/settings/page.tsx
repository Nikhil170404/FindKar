"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Phone, Mail, MapPin, Bell, HelpCircle, AlertCircle, LogOut, Shield, Navigation, Loader2, Home, Map, Settings, Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCurrentLocation } from "@/lib/geolocation"

export default function UserSettings() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    avatar_url: "",
  })
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
    address?: string
  } | null>(null)

  useEffect(() => {
    fetchProfile()
    fetchLocation()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setProfile({
          name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          phone: user.phone || "",
          email: user.email || "",
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const fetchLocation = async () => {
    try {
      setLocationLoading(true)
      const position = await getCurrentLocation()
      setUserLocation({
        latitude: position.latitude,
        longitude: position.longitude,
      })
    } catch (error) {
      console.error("Error getting location:", error)
    } finally {
      setLocationLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/user/dashboard">
              <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile</h2>

          <div className="space-y-4">
            {/* Profile Picture & Name */}
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name || "Profile"}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                />
              ) : (
                <div className="bg-blue-100 rounded-full p-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile.name || "Not set"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 rounded-full p-4 flex-shrink-0">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Google Email</p>
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {profile.email || "Not set"}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-full p-4">
                <Navigation className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Your Location</p>
                {locationLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Getting location...</span>
                  </div>
                ) : userLocation ? (
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      📍 Location detected
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {userLocation.latitude.toFixed(4)}°, {userLocation.longitude.toFixed(4)}°
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-gray-500">Location not available</p>
                )}
              </div>
              {!locationLoading && (
                <button
                  onClick={fetchLocation}
                  className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                >
                  Refresh
                </button>
              )}
            </div>

            {/* Phone (optional) */}
            {profile.phone && (
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 rounded-full p-4">
                  <Phone className="w-8 h-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.phone}</p>
                </div>
              </div>
            )}
          </div>

          <button className="w-full mt-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Edit Profile
          </button>
        </div>


        {/* Support & Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Support</h2>

          <div className="space-y-3">
            <Link
              href="/about"
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">About Findkar</span>
              </div>
              <span className="text-gray-400">›</span>
            </Link>

            <Link
              href="/contact"
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Contact Us</span>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
          </div>
        </div>

        {/* Legal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Legal</h2>

          <div className="space-y-3">
            <Link
              href="/terms"
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Terms of Service</span>
              </div>
              <span className="text-gray-400">›</span>
            </Link>

            <Link
              href="/privacy"
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Privacy Policy</span>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          {loading ? "Logging out..." : "Logout"}
        </button>

        {/* App Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Findkar v1.0.0</p>
          <p className="mt-2">
            <Link href="/about" className="text-blue-600 hover:underline">About</Link>
            {" • "}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link>
            {" • "}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy</Link>
          </p>
        </div>
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
            <Link href="/user/map" className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900">
              <Map className="w-6 h-6" />
              <span className="text-xs font-medium">Map</span>
            </Link>
            <div className="flex flex-col items-center gap-1 text-blue-600">
              <Settings className="w-6 h-6" />
              <span className="text-xs font-medium">Settings</span>
            </div>
          </div>
        </div>
      </nav>
    </div >
  )
}
