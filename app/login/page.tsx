"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Store, Loader2, WifiOff, RefreshCw, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ADMIN_EMAILS } from "@/lib/constants"

function LoginContent() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState("")
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    // Check if already logged in
    checkAuth()

    // Listen for online/offline
    const handleOnline = () => setOffline(false)
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
      if (user) {
        // Check if admin
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
          router.replace("/admin")
        } else {
          router.replace("/user/dashboard")
        }
        return
      }
    } catch (err) {
      console.error("Auth check failed:", err)
    }
    setChecking(false)
  }

  const handleGoogleSignIn = async () => {
    if (offline) {
      setError("You're offline. Please check your internet connection.")
      return
    }

    setError("")
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) throw error
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in. Please try again."
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setError("")
    window.location.reload()
  }

  // Show loading while checking auth
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600 font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-2">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Findkar</span>
          </div>
        </div>
      </header>

      {/* Offline Banner */}
      {offline && (
        <div className="bg-orange-500 text-white px-4 py-3 flex items-center justify-center gap-2">
          <WifiOff className="w-5 h-5" />
          <span className="font-medium">You're offline</span>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👋</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
              <p className="text-gray-600">Sign in to find nearby vendors</p>
            </div>

            {/* Error with Retry */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm mb-3">{error}</p>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 text-red-600 font-medium text-sm hover:underline"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading || offline}
              className="w-full py-4 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-center text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </p>
          </div>

          {/* Security Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">🔒 Your data is secure and never shared</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
