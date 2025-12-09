"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Vendor {
    id: string
    name: string
    category: string
    category_emoji: string
    status: string
}

export default function VendorControlPage() {
    const params = useParams()
    const key = params.key as string
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [vendor, setVendor] = useState<Vendor | null>(null)
    const [error, setError] = useState("")

    useEffect(() => {
        loadVendor()
    }, [key])

    const loadVendor = async () => {
        const { data, error } = await supabase
            .from("vendors")
            .select("id, name, category, category_emoji, status")
            .eq("vendor_secret_key", key)
            .single()

        if (error || !data) {
            setError("Invalid link or vendor not found")
            setLoading(false)
            return
        }

        setVendor(data)
        setLoading(false)
    }

    const toggleStatus = async () => {
        if (!vendor) return

        setUpdating(true)
        const newStatus = vendor.status === "online" ? "offline" : "online"

        const { error } = await supabase
            .from("vendors")
            .update({
                status: newStatus,
                last_online_at: newStatus === "online" ? new Date().toISOString() : undefined
            })
            .eq("id", vendor.id)

        if (error) {
            alert("Failed to update. Please try again.")
        } else {
            setVendor({ ...vendor, status: newStatus })

            // Voice feedback
            if ("speechSynthesis" in window) {
                const msg = new SpeechSynthesisUtterance(
                    newStatus === "online"
                        ? "Dukaan khul gayi"
                        : "Dukaan band ho gayi"
                )
                msg.lang = "hi-IN"
                speechSynthesis.speak(msg)
            }
        }
        setUpdating(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-white animate-spin" />
            </div>
        )
    }

    if (error || !vendor) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
                <p className="text-gray-400">This vendor link is not valid or has expired.</p>
            </div>
        )
    }

    const isOnline = vendor.status === "online"

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${isOnline ? "bg-green-600" : "bg-gray-800"
            }`}>
            {/* Shop Info */}
            <div className="text-center mb-12">
                <div className="text-8xl mb-4">{vendor.category_emoji || "🏪"}</div>
                <h1 className="text-3xl font-bold text-white mb-2">{vendor.name}</h1>
                <p className="text-white/80">{vendor.category}</p>
            </div>

            {/* Status */}
            <div className={`px-6 py-3 rounded-full text-lg font-bold mb-8 ${isOnline
                    ? "bg-white text-green-600"
                    : "bg-gray-700 text-gray-300"
                }`}>
                {isOnline ? "🟢 SHOP IS OPEN" : "🔴 SHOP IS CLOSED"}
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleStatus}
                disabled={updating}
                className={`w-64 h-64 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl active:scale-95 ${isOnline
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
            >
                {updating ? (
                    <Loader2 className="w-20 h-20 animate-spin" />
                ) : (
                    <>
                        <span className="text-6xl mb-2">{isOnline ? "🔴" : "🟢"}</span>
                        <span className="text-2xl font-bold">
                            {isOnline ? "CLOSE" : "OPEN"}
                        </span>
                        <span className="text-lg opacity-80">
                            {isOnline ? "Shop" : "Shop"}
                        </span>
                    </>
                )}
            </button>

            {/* Hint */}
            <p className="mt-12 text-white/60 text-center text-sm max-w-xs">
                Tap the button to {isOnline ? "close" : "open"} your shop. Customers will see your status instantly.
            </p>

            {/* Powered by */}
            <div className="absolute bottom-6 text-white/40 text-xs">
                Powered by Findkar
            </div>
        </div>
    )
}
