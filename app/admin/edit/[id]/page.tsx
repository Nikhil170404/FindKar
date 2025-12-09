"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Loader2, Navigation, Save, RefreshCw, Plus, X, Sparkles, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCurrentLocation } from "@/lib/geolocation"

const ADMIN_EMAIL = "aipgl200ok@gmail.com"

const SHOP_CATEGORIES = [
    { id: "tea", name: "Tea Stall", emoji: "☕" },
    { id: "chai-nashta", name: "Chai Nashta", emoji: "🍵" },
    { id: "chinese", name: "Chinese Stall", emoji: "🍜" },
    { id: "momo", name: "Momo Stall", emoji: "🥟" },
    { id: "chowmein", name: "Chowmein", emoji: "🍝" },
    { id: "fastfood", name: "Fast Food Stall", emoji: "🍔" },
    { id: "burger", name: "Burger Stall", emoji: "🍔" },
    { id: "pizza", name: "Pizza Stall", emoji: "🍕" },
    { id: "sandwich", name: "Sandwich Stall", emoji: "🥪" },
    { id: "vadapav", name: "Vada Pav", emoji: "🥙" },
    { id: "samosa", name: "Samosa Stall", emoji: "🥟" },
    { id: "chaat", name: "Chaat Stall", emoji: "🥘" },
    { id: "panipuri", name: "Pani Puri", emoji: "🫕" },
    { id: "bhelpuri", name: "Bhel Puri", emoji: "🥗" },
    { id: "pavbhaji", name: "Pav Bhaji", emoji: "🍛" },
    { id: "dosa", name: "Dosa Stall", emoji: "🥞" },
    { id: "idli", name: "Idli Vada", emoji: "🍚" },
    { id: "paratha", name: "Paratha Stall", emoji: "🫓" },
    { id: "chole", name: "Chole Bhature", emoji: "🍛" },
    { id: "poha", name: "Poha Jalebi", emoji: "🍲" },
    { id: "biryani", name: "Biryani Stall", emoji: "🍛" },
    { id: "thali", name: "Thali Center", emoji: "🍱" },
    { id: "frankie", name: "Frankie/Roll", emoji: "🌯" },
    { id: "egg", name: "Egg Stall", emoji: "🥚" },
    { id: "nonveg", name: "Non-Veg Stall", emoji: "🍗" },
    { id: "kebab", name: "Kebab Stall", emoji: "🍢" },
    { id: "juice", name: "Juice Center", emoji: "🧃" },
    { id: "lassi", name: "Lassi Stall", emoji: "🥛" },
    { id: "sugarcane", name: "Sugarcane Juice", emoji: "🎋" },
    { id: "icecream", name: "Ice Cream", emoji: "🍨" },
    { id: "kulfi", name: "Kulfi", emoji: "🍦" },
    { id: "sweets", name: "Sweets Shop", emoji: "🍮" },
    { id: "jalebi", name: "Jalebi Fafda", emoji: "🥨" },
    { id: "fruits", name: "Fruit Stall", emoji: "🍎" },
    { id: "coconut", name: "Coconut Water", emoji: "🥥" },
    { id: "paan", name: "Paan Shop", emoji: "🌿" },
    { id: "grocery", name: "Grocery", emoji: "🛒" },
    { id: "general", name: "General Store", emoji: "🏪" },
]

const COMMON_HIGHLIGHTS = [
    { emoji: "🔥", label: "Popular" },
    { emoji: "⭐", label: "Best Seller" },
    { emoji: "🆕", label: "New" },
    { emoji: "💯", label: "Authentic" },
    { emoji: "🌶️", label: "Spicy" },
    { emoji: "🥬", label: "Veg Only" },
    { emoji: "🍗", label: "Non-Veg" },
    { emoji: "🧈", label: "Extra Butter" },
    { emoji: "🧀", label: "Cheese Special" },
    { emoji: "🌙", label: "Late Night" },
    { emoji: "☀️", label: "Morning Special" },
    { emoji: "💰", label: "Budget Friendly" },
    { emoji: "🏆", label: "Award Winning" },
    { emoji: "👨‍🍳", label: "Chef Special" },
    { emoji: "🚀", label: "Fast Service" },
    { emoji: "😋", label: "Tasty" },
]

function generateSecretKey(name?: string): string {
    const random = Math.random().toString(36).substring(2, 8)
    if (name) {
        const sanitized = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        return `${sanitized}-${random}`
    }
    return random
}

interface MenuItemWithPrice {
    name: string
    price: number
}

interface Highlight {
    emoji: string
    label: string
}

export default function AdminEditVendor() {
    const router = useRouter()
    const params = useParams()
    const vendorId = params.id as string
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [gettingLocation, setGettingLocation] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [regeneratingKey, setRegeneratingKey] = useState(false)

    const [menuItems, setMenuItems] = useState<MenuItemWithPrice[]>([])
    const [newMenuName, setNewMenuName] = useState("")
    const [newMenuPrice, setNewMenuPrice] = useState("")

    const [highlights, setHighlights] = useState<Highlight[]>([])

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        category_emoji: "",
        lat: null as number | null,
        lng: null as number | null,
        description: "",
        vendor_secret_key: "",
    })

    useEffect(() => {
        checkAdminAndLoad()
    }, [vendorId])

    const checkAdminAndLoad = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.email !== ADMIN_EMAIL) {
            router.push("/user/dashboard")
            return
        }
        setIsAdmin(true)

        // Load vendor
        const { data, error } = await supabase
            .from("vendors")
            .select("*")
            .eq("id", vendorId)
            .single()

        if (error || !data) {
            alert("Vendor not found")
            router.push("/admin")
            return
        }

        setFormData({
            name: data.name,
            category: data.category,
            category_emoji: data.category_emoji,
            lat: data.lat,
            lng: data.lng,
            description: data.description || "",
            vendor_secret_key: data.vendor_secret_key || "",
        })

        // Parse menu items from array
        if (data.menu_items && data.menu_items.length > 0) {
            const parsed = data.menu_items.map((item: string) => {
                const match = item.match(/(.+)\s₹(\d+)/)
                if (match) {
                    return { name: match[1].trim(), price: parseInt(match[2]) }
                }
                return { name: item, price: 0 }
            })
            setMenuItems(parsed)
        }

        // Load highlights
        const { data: highlightsData } = await supabase
            .from("highlights")
            .select("emoji, label")
            .eq("vendor_id", vendorId)

        if (highlightsData) {
            setHighlights(highlightsData)
        }

        setLoading(false)
    }

    const handleCategorySelect = (cat: typeof SHOP_CATEGORIES[0]) => {
        setFormData({
            ...formData,
            category: cat.name,
            category_emoji: cat.emoji,
        })
    }

    const handleGetLocation = async () => {
        setGettingLocation(true)
        try {
            const position = await getCurrentLocation()
            setFormData({
                ...formData,
                lat: position.latitude,
                lng: position.longitude,
            })
        } catch (error) {
            console.error("Error getting location:", error)
            alert("Failed to get location.")
        } finally {
            setGettingLocation(false)
        }
    }

    const handleRegenerateKey = async () => {
        if (!confirm("Regenerate link? Old link stops working.")) return
        setRegeneratingKey(true)
        const newKey = generateSecretKey(formData.name)

        const { error } = await supabase
            .from("vendors")
            .update({ vendor_secret_key: newKey })
            .eq("id", vendorId)

        if (!error) {
            setFormData({ ...formData, vendor_secret_key: newKey })
        }
        setRegeneratingKey(false)
    }

    const addMenuItem = () => {
        if (newMenuName && newMenuPrice) {
            setMenuItems([...menuItems, { name: newMenuName, price: parseInt(newMenuPrice) }])
            setNewMenuName("")
            setNewMenuPrice("")
        }
    }

    const removeMenuItem = (index: number) => {
        setMenuItems(menuItems.filter((_, i) => i !== index))
    }

    const toggleHighlight = (h: Highlight) => {
        if (highlights.find(x => x.label === h.label)) {
            setHighlights(highlights.filter(x => x.label !== h.label))
        } else {
            setHighlights([...highlights, h])
        }
    }

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            alert("Please enter vendor name")
            return
        }
        if (!formData.category) {
            alert("Please select a category")
            return
        }

        setSaving(true)
        try {
            // Update vendor
            const { error } = await supabase
                .from("vendors")
                .update({
                    name: formData.name,
                    category: formData.category,
                    category_emoji: formData.category_emoji,
                    lat: formData.lat,
                    lng: formData.lng,
                    description: formData.description,
                    menu_items: menuItems.map(m => `${m.name} ₹${m.price}`),
                })
                .eq("id", vendorId)

            if (error) throw error

            // Update highlights - delete old, insert new
            await supabase.from("highlights").delete().eq("vendor_id", vendorId)

            if (highlights.length > 0) {
                const highlightsToInsert = highlights.map(h => ({
                    vendor_id: vendorId,
                    emoji: h.emoji,
                    label: h.label
                }))
                await supabase.from("highlights").insert(highlightsToInsert)
            }

            alert("Vendor updated!")
            router.push("/admin")
        } catch (error) {
            console.error("Error updating vendor:", error)
            alert("Failed to update")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        )
    }

    if (!isAdmin) return null

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-40">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/admin">
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </Link>
                            <h1 className="text-xl font-bold text-gray-900">Edit Vendor</h1>
                        </div>
                        <Link
                            href={`/user/vendor/${vendorId}`}
                            target="_blank"
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                        >
                            <Eye className="w-4 h-4" />
                            View
                        </Link>
                    </div>
                </div>
            </header>

            <div className="px-4 py-4 max-w-lg mx-auto">
                {/* Vendor Link */}
                {formData.vendor_secret_key && (
                    <div className="bg-blue-50 rounded-xl p-3 mb-3 border border-blue-200">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-blue-800">Vendor Link</p>
                                <p className="text-blue-600 text-xs font-mono truncate">
                                    /v/{formData.vendor_secret_key}
                                </p>
                            </div>
                            <button
                                onClick={handleRegenerateKey}
                                disabled={regeneratingKey}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                            >
                                <RefreshCw className={`w-4 h-4 ${regeneratingKey ? "animate-spin" : ""}`} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Vendor Name */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Vendor Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Category */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                        {formData.category && (
                            <span className="ml-2 text-blue-600">
                                {formData.category_emoji} {formData.category}
                            </span>
                        )}
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {SHOP_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat)}
                                className={`p-2 rounded-lg border-2 text-center ${formData.category === cat.name
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200"
                                    }`}
                            >
                                <div className="text-xl">{cat.emoji}</div>
                                <div className="text-xs font-medium text-gray-700 truncate">{cat.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <button
                        onClick={handleGetLocation}
                        disabled={gettingLocation}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                    >
                        {gettingLocation ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Getting...</>
                        ) : (
                            <><Navigation className="w-5 h-5" /> 📍 Update Location</>
                        )}
                    </button>
                    {formData.lat && formData.lng && (
                        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-green-800 text-sm">{formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}</span>
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Famous for samosas, open till late..."
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                    />
                </div>

                {/* Highlights */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Sparkles className="w-4 h-4 inline mr-1" />
                        Highlights ({highlights.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_HIGHLIGHTS.map((h) => (
                            <button
                                key={h.label}
                                onClick={() => toggleHighlight(h)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${highlights.find(x => x.label === h.label)
                                    ? "bg-purple-100 text-purple-700 border-purple-300"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                                    }`}
                            >
                                {h.emoji} {h.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        🍽️ Menu ({menuItems.length})
                    </label>

                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newMenuName}
                            onChange={(e) => setNewMenuName(e.target.value)}
                            placeholder="Item name"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <input
                            type="number"
                            value={newMenuPrice}
                            onChange={(e) => setNewMenuPrice(e.target.value)}
                            placeholder="₹"
                            className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <button onClick={addMenuItem} className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {menuItems.length > 0 && (
                        <div className="space-y-2">
                            {menuItems.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                                    <span className="font-medium text-gray-900">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-600 font-bold">₹{item.price}</span>
                                        <button onClick={() => removeMenuItem(i)} className="text-red-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Submit */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                    ) : (
                        <><Save className="w-5 h-5" /> Save Changes</>
                    )}
                </button>
            </div>
        </div>
    )
}
