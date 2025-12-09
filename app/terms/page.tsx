"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link href="/user/settings">
                            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 mb-6">Last updated: December 2024</p>

                    <div className="prose prose-gray max-w-none space-y-6">
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                            <p className="text-gray-600 leading-relaxed">
                                By accessing and using Findkar (&quot;the App&quot;), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Description of Service</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Findkar is a platform that connects users with local street food vendors. We provide location-based services to help users discover nearby vendors and help vendors reach more customers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">3. User Accounts</h2>
                            <ul className="list-disc pl-5 text-gray-600 space-y-2">
                                <li>You must provide accurate information when creating an account</li>
                                <li>You are responsible for maintaining the security of your account</li>
                                <li>You must be at least 13 years old to use this service</li>
                                <li>One person may only have one user account and one vendor account</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Vendor Terms</h2>
                            <ul className="list-disc pl-5 text-gray-600 space-y-2">
                                <li>Vendors must provide accurate location and availability information</li>
                                <li>Vendors are responsible for the quality and safety of their food</li>
                                <li>Vendors must comply with all local food safety regulations</li>
                                <li>Findkar is not responsible for any transactions between users and vendors</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">5. User Conduct</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Users agree not to:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-2 mt-2">
                                <li>Post false or misleading reviews</li>
                                <li>Harass or abuse vendors or other users</li>
                                <li>Use the app for any illegal purposes</li>
                                <li>Attempt to manipulate ratings or reviews</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Disclaimer</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Findkar is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the accuracy of vendor information, food quality, or availability. Users interact with vendors at their own risk.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Limitation of Liability</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Findkar shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service, including but not limited to food-related illness or injury.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Changes to Terms</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Contact</h2>
                            <p className="text-gray-600 leading-relaxed">
                                For questions about these Terms, please contact us at{" "}
                                <a href="mailto:prashants1704@gmail.com" className="text-blue-600 hover:underline">
                                    prashants1704@gmail.com
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
