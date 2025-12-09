import Link from "next/link"
import { Store, Users, MapPin, Star, Search, TrendingUp } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-2">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Findkar</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Trusted Service
            <span className="text-blue-600"> Vendors Nearby</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Connect with local vendors, street food sellers, and service providers in your area. Real-time availability, verified services, and instant contact.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Users className="w-5 h-5" />
              Find Vendors Near Me
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                <MapPin className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nearby Vendors</h3>
              <p className="text-gray-600">
                Find service providers and street vendors near your location in real-time
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-green-100 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                <Search className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Discovery</h3>
              <p className="text-gray-600">
                Search by category, location, or service type to find exactly what you need
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="bg-purple-100 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                <Star className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Services</h3>
              <p className="text-gray-600">
                Trust ratings and reviews from real customers in your community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Vendors Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">For Street Vendors & Service Providers</h2>
            <p className="text-xl text-blue-100 mb-8">
              Go online with just one tap. Let customers find you when you're open for business.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <TrendingUp className="w-10 h-10 text-white mb-3 mx-auto" />
                <h3 className="text-xl font-bold mb-2">Grow Your Business</h3>
                <p className="text-blue-100">Reach more customers in your area automatically</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <Store className="w-10 h-10 text-white mb-3 mx-auto" />
                <h3 className="text-xl font-bold mb-2">Simple to Use</h3>
                <p className="text-blue-100">One button to go online, update menu with emojis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-blue-600 rounded-lg p-2">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Findkar</span>
            </div>
            <div className="flex gap-6">
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                Help
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-500">
            © 2025 Findkar. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
