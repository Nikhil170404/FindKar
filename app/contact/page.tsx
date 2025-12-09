"use client"

import Link from "next/link"
import { ArrowLeft, MessageCircle, Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
    const whatsappNumber = "919987568422"
    const email = "prashants1704@gmail.com"

    const handleWhatsApp = () => {
        window.open(`https://wa.me/${whatsappNumber}?text=Hi! I have a query about Findkar app.`, "_blank")
    }

    const handleEmail = () => {
        window.open(`mailto:${email}?subject=Findkar App Query`, "_blank")
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link href="/user/settings">
                            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Contact Us</h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-lg">
                {/* Hero */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">💬</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">We&apos;d Love to Hear From You!</h2>
                    <p className="text-gray-600">Have questions or feedback? Reach out to us anytime.</p>
                </div>

                {/* Contact Cards */}
                <div className="space-y-4">
                    {/* WhatsApp */}
                    <button
                        onClick={handleWhatsApp}
                        className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl p-6 flex items-center gap-4 transition-all shadow-lg hover:shadow-xl"
                    >
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-7 h-7" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-lg">WhatsApp</p>
                            <p className="text-green-100">+91 99875 68422</p>
                        </div>
                    </button>

                    {/* Email */}
                    <button
                        onClick={handleEmail}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-6 flex items-center gap-4 transition-all shadow-lg hover:shadow-xl"
                    >
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                            <Mail className="w-7 h-7" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-lg">Email</p>
                            <p className="text-blue-100">prashants1704@gmail.com</p>
                        </div>
                    </button>

                    {/* Phone */}
                    <a
                        href="tel:+919987568422"
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-2xl p-6 flex items-center gap-4 transition-all shadow-lg hover:shadow-xl"
                    >
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                            <Phone className="w-7 h-7" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-lg">Call Us</p>
                            <p className="text-purple-100">+91 99875 68422</p>
                        </div>
                    </a>
                </div>

                {/* Location */}
                <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <MapPin className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Our Location</h3>
                    </div>
                    <p className="text-gray-600">
                        Mumbai, Maharashtra, India 🇮🇳
                    </p>
                </div>

                {/* Response Time */}
                <div className="mt-6 text-center text-gray-500 text-sm">
                    <p>⏰ We typically respond within 24 hours</p>
                </div>
            </div>
        </div>
    )
}
