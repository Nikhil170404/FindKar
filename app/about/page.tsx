"use client"

import Link from "next/link"
import { ArrowLeft, Users, Target, Zap, Heart } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link href="/user/settings">
                            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">About Findkar</h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-lg">
                {/* Hero */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Findkar</h2>
                    <p className="text-lg text-gray-600">Find Street Vendors Near You</p>
                    <p className="text-sm text-gray-500 mt-2">Version 1.0.0</p>
                </div>

                {/* Mission */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">Our Mission</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        To connect hungry customers with local street food vendors in real-time. We believe every chai stall, momo corner, and vada pav thela deserves to be discovered!
                    </p>
                </div>

                {/* How It Works */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">How It Works</h3>
                    </div>
                    <div className="space-y-3 text-gray-600">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">📍</span>
                            <p><strong>For Users:</strong> Find nearby vendors who are currently open, see their menu, ratings, and get directions.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">🏪</span>
                            <p><strong>For Vendors:</strong> Go online with one tap so customers can find you. Add your menu and specialties.</p>
                        </div>
                    </div>
                </div>

                {/* Why Findkar */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Heart className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">Why Findkar?</h3>
                    </div>
                    <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            Real-time vendor availability
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            Distance-based search
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            User ratings & reviews
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            One-tap directions
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            100% free for vendors
                        </li>
                    </ul>
                </div>

                {/* Team */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="w-5 h-5" />
                        <h3 className="font-bold">Made with ❤️ in India</h3>
                    </div>
                    <p className="text-white/90 text-sm">
                        Building for the streets, by the streets.
                    </p>
                </div>

                {/* Contact Link */}
                <div className="mt-6 text-center">
                    <Link href="/contact" className="text-blue-600 font-medium hover:underline">
                        Have questions? Contact Us →
                    </Link>
                </div>
            </div>
        </div>
    )
}
