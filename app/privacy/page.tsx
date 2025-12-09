"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link href="/user/settings">
                            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 mb-6">Last updated: December 2024</p>

                    <div className="prose prose-gray max-w-none space-y-6">
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Information We Collect</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                We collect the following types of information:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-2">
                                <li><strong>Account Information:</strong> Name, email address, phone number (via Google Sign-In)</li>
                                <li><strong>Location Data:</strong> Your device location to show nearby vendors</li>
                                <li><strong>Usage Data:</strong> How you interact with the app, searches, favorites</li>
                                <li><strong>Vendor Data:</strong> Shop name, category, location, menu items</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                            <ul className="list-disc pl-5 text-gray-600 space-y-2">
                                <li>To provide and improve our services</li>
                                <li>To show you nearby vendors based on your location</li>
                                <li>To enable ratings and reviews</li>
                                <li>To communicate with you about updates or issues</li>
                                <li>To ensure safety and prevent fraud</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Location Data</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Location is essential for Findkar to work. We use your location to:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-2 mt-2">
                                <li>Find vendors near you</li>
                                <li>Calculate distance to vendors</li>
                                <li>Provide navigation directions</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-2">
                                Your location is only accessed when you use the app and is not tracked in the background.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Data Sharing</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We do not sell your personal data. We may share data with:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-2 mt-2">
                                <li><strong>Service Providers:</strong> Supabase (database), Vercel (hosting), Google (authentication)</li>
                                <li><strong>Legal Requirements:</strong> If required by law or to protect rights</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Data Security</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We implement industry-standard security measures to protect your data, including encryption, secure authentication, and regular security audits.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Your Rights</h2>
                            <ul className="list-disc pl-5 text-gray-600 space-y-2">
                                <li><strong>Access:</strong> Request a copy of your data</li>
                                <li><strong>Delete:</strong> Request deletion of your account and data</li>
                                <li><strong>Update:</strong> Correct inaccurate information</li>
                                <li><strong>Opt-out:</strong> Disable location access in your device settings</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Cookies & Local Storage</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We use local storage to save your preferences and cached location for a better experience. No third-party tracking cookies are used.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Children&apos;s Privacy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Findkar is not intended for children under 13. We do not knowingly collect information from children under 13 years of age.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Changes to This Policy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or email.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Contact Us</h2>
                            <p className="text-gray-600 leading-relaxed">
                                For privacy-related questions, contact us at:
                            </p>
                            <ul className="list-none text-gray-600 mt-2 space-y-1">
                                <li>📧 Email: <a href="mailto:prashants1704@gmail.com" className="text-blue-600 hover:underline">prashants1704@gmail.com</a></li>
                                <li>📱 WhatsApp: +91 99875 68422</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
