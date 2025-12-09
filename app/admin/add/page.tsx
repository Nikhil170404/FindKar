"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, MapPin, Loader2, Navigation, Save, Plus, X, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCurrentLocation } from "@/lib/geolocation"

const ADMIN_EMAIL = "aipgl200ok@gmail.com"

const DEFAULT_CATEGORIES = [
    { name: "Tea Stall", emoji: "☕" },
    { name: "Chai Nashta", emoji: "🍵" },
    { name: "Chinese Stall", emoji: "🍜" },
    { name: "Momo Stall", emoji: "🥟" },
    { name: "Chowmein", emoji: "🍝" },
    { name: "Fast Food", emoji: "🍔" },
    { name: "Burger Stall", emoji: "🍔" },
    { name: "Pizza Stall", emoji: "🍕" },
    { name: "Sandwich", emoji: "🥪" },
    { name: "Vada Pav", emoji: "🥙" },
    { name: "Samosa Stall", emoji: "🥟" },
    { name: "Chaat Stall", emoji: "🥘" },
    { name: "Pani Puri", emoji: "🫕" },
    { name: "Pav Bhaji", emoji: "🍛" },
    { name: "Dosa Stall", emoji: "🥞" },
    { name: "Paratha Stall", emoji: "🫓" },
    { name: "Chole Bhature", emoji: "🍛" },
    { name: "Biryani Stall", emoji: "🍛" },
    { name: "Thali Center", emoji: "🍱" },
    { name: "Frankie/Roll", emoji: "🌯" },
    { name: "Egg Stall", emoji: "🥚" },
    { name: "Non-Veg Stall", emoji: "🍗" },
    { name: "Juice Center", emoji: "🧃" },
    { name: "Lassi Stall", emoji: "🥛" },
    { name: "Ice Cream", emoji: "🍨" },
    { name: "Sweets Shop", emoji: "🍮" },
    { name: "Fruit Stall", emoji: "🍎" },
    { name: "Paan Shop", emoji: "🌿" },
    { name: "Grocery", emoji: "🛒" },
    { name: "General Store", emoji: "🏪" },
]

const DEFAULT_HIGHLIGHTS = [
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
    { emoji: "☀️", label: "Morning" },
    { emoji: "💰", label: "Budget Friendly" },
    { emoji: "🚀", label: "Fast Service" },
    { emoji: "😋", label: "Tasty" },
]

function generateSecretKey(name?: string): string {
    const random = Math.random().toString(36).substring(2, 8)
    if (name) {
        const sanitized = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
            .replace(/^-+|-+$/g, '')     // Remove leading/trailing hyphens
        return `${sanitized}-${random}`
    }
    return random
}

interface MenuItem {
    name: string
    price: number
}

interface Highlight {
    emoji: string
    label: string
}

export default function AdminAddVendor() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [step, setStep] = useState(1)
    const [gettingLocation, setGettingLocation] = useState(false)

    // Form data
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [categoryEmoji, setCategoryEmoji] = useState("")
    const [lat, setLat] = useState<number | null>(null)
    const [lng, setLng] = useState<number | null>(null)
    const [description, setDescription] = useState("")
    const [highlights, setHighlights] = useState<Highlight[]>([])
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])

    // Custom adds
    const [showCustomCategory, setShowCustomCategory] = useState(false)
    const [customCategoryName, setCustomCategoryName] = useState("")
    const [customCategoryEmoji, setCustomCategoryEmoji] = useState("🏪")

    const [showCustomHighlight, setShowCustomHighlight] = useState(false)
    const [customHighlightLabel, setCustomHighlightLabel] = useState("")
    const [customHighlightEmoji, setCustomHighlightEmoji] = useState("✨")

    const [newMenuName, setNewMenuName] = useState("")
    const [newMenuPrice, setNewMenuPrice] = useState("")

    const TOTAL_STEPS = 6

    useEffect(() => {
        checkAdmin()
    }, [])

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.email !== ADMIN_EMAIL) {
            router.push("/user/dashboard")
            return
        }
        setIsAdmin(true)
        setLoading(false)
    }

    const handleGetLocation = async () => {
        setGettingLocation(true)
        try {
            const position = await getCurrentLocation()
            setLat(position.latitude)
            setLng(position.longitude)
        } catch (error) {
            alert("Failed to get location")
        } finally {
            setGettingLocation(false)
        }
    }

    const selectCategory = (cat: { name: string; emoji: string }) => {
        setCategory(cat.name)
        setCategoryEmoji(cat.emoji)
    }

    const addCustomCategory = () => {
        if (customCategoryName) {
            setCategory(customCategoryName)
            setCategoryEmoji(customCategoryEmoji)
            setShowCustomCategory(false)
            setCustomCategoryName("")
        }
    }

    const toggleHighlight = (h: Highlight) => {
        if (highlights.find(x => x.label === h.label)) {
            setHighlights(highlights.filter(x => x.label !== h.label))
        } else {
            setHighlights([...highlights, h])
        }
    }

    const addCustomHighlight = () => {
        if (customHighlightLabel) {
            const newH = { emoji: customHighlightEmoji, label: customHighlightLabel }
            setHighlights([...highlights, newH])
            setShowCustomHighlight(false)
            setCustomHighlightLabel("")
        }
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

    const canProceed = () => {
        switch (step) {
            case 1: return name.trim().length > 0
            case 2: return category.length > 0
            case 3: return lat !== null && lng !== null
            case 4: return true // description optional
            case 5: return true // highlights optional
            case 6: return true // menu optional
            default: return true
        }
    }

    const handleSubmit = async () => {
        setSaving(true)
        try {
            const { data: vendorData, error: vendorError } = await supabase
                .from("vendors")
                .insert([{
                    name,
                    category,
                    category_emoji: categoryEmoji,
                    lat,
                    lng,
                    description,
                    menu_items: menuItems.map(m => `${m.name} ₹${m.price}`),
                    status: "offline",
                    vendor_secret_key: generateSecretKey(name),
                }])
                .select()
                .single()

            if (vendorError) throw vendorError

            if (highlights.length > 0 && vendorData) {
                await supabase.from("highlights").insert(
                    highlights.map(h => ({
                        vendor_id: vendorData.id,
                        emoji: h.emoji,
                        label: h.label
                    }))
                )
            }

            alert("✅ Vendor added!")
            router.push("/admin")
        } catch (error) {
            console.error(error)
            alert("Failed to add vendor")
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-40">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/admin">
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </Link>
                            <h1 className="text-lg font-bold text-gray-900">Add Vendor</h1>
                        </div>
                        <span className="text-sm text-gray-500">Step {step}/{TOTAL_STEPS}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                        />
                    </div>
                </div>
            </header>

            <div className="px-4 py-6 pb-32">
                {/* Step 1: Name */}
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's the vendor name?</h2>
                        <p className="text-gray-500 mb-6">Enter the shop or stall name</p>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Sharma Tea Stall"
                            className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
                            autoFocus
                        />
                    </div>
                )}

                {/* Step 2: Category */}
                {step === 2 && (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select category</h2>
                        <p className="text-gray-500 mb-4">
                            {category ? `Selected: ${categoryEmoji} ${category}` : "Choose one"}
                        </p>

                        {!showCustomCategory ? (
                            <>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {DEFAULT_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.name}
                                            onClick={() => selectCategory(cat)}
                                            className={`p-3 rounded-xl border-2 text-center transition-all ${category === cat.name
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 bg-white"
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{cat.emoji}</div>
                                            <div className="text-xs font-medium text-gray-700">{cat.name}</div>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowCustomCategory(true)}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Custom Category
                                </button>
                            </>
                        ) : (
                            <div className="bg-white p-4 rounded-xl border-2 border-blue-200">
                                <h3 className="font-semibold mb-3">New Category</h3>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={customCategoryEmoji}
                                        onChange={(e) => setCustomCategoryEmoji(e.target.value)}
                                        placeholder="🏪"
                                        className="w-16 px-3 py-3 border rounded-xl text-center text-2xl"
                                        maxLength={2}
                                    />
                                    <input
                                        type="text"
                                        value={customCategoryName}
                                        onChange={(e) => setCustomCategoryName(e.target.value)}
                                        placeholder="Category name"
                                        className="flex-1 px-4 py-3 border rounded-xl"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowCustomCategory(false)}
                                        className="flex-1 py-2 border rounded-xl text-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addCustomCategory}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-medium"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Location */}
                {step === 3 && (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set location</h2>
                        <p className="text-gray-500 mb-6">Go to vendor's spot and tap below</p>

                        <button
                            onClick={handleGetLocation}
                            disabled={gettingLocation}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-medium text-lg flex items-center justify-center gap-2"
                        >
                            {gettingLocation ? (
                                <><Loader2 className="w-6 h-6 animate-spin" /> Getting...</>
                            ) : (
                                <><Navigation className="w-6 h-6" /> 📍 Get Current Location</>
                            )}
                        </button>

                        {lat && lng && (
                            <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-2xl flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-green-800">Location Set!</p>
                                    <p className="text-sm text-green-600">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Description */}
                {step === 4 && (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add description</h2>
                        <p className="text-gray-500 mb-6">Optional - What's special about this vendor?</p>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Famous for samosas, open till late night..."
                            rows={4}
                            className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none resize-none"
                        />
                    </div>
                )}

                {/* Step 5: Highlights */}
                {step === 5 && (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add highlights</h2>
                        <p className="text-gray-500 mb-4">
                            {highlights.length > 0 ? `${highlights.length} selected` : "Optional - Select tags"}
                        </p>

                        {!showCustomHighlight ? (
                            <>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {DEFAULT_HIGHLIGHTS.map((h) => (
                                        <button
                                            key={h.label}
                                            onClick={() => toggleHighlight(h)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${highlights.find(x => x.label === h.label)
                                                ? "bg-purple-100 text-purple-700 border-purple-300"
                                                : "bg-white text-gray-600 border-gray-200"
                                                }`}
                                        >
                                            {h.emoji} {h.label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowCustomHighlight(true)}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Custom Highlight
                                </button>
                            </>
                        ) : (
                            <div className="bg-white p-4 rounded-xl border-2 border-purple-200">
                                <h3 className="font-semibold mb-3">New Highlight</h3>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={customHighlightEmoji}
                                        onChange={(e) => setCustomHighlightEmoji(e.target.value)}
                                        placeholder="✨"
                                        className="w-16 px-3 py-3 border rounded-xl text-center text-2xl"
                                        maxLength={2}
                                    />
                                    <input
                                        type="text"
                                        value={customHighlightLabel}
                                        onChange={(e) => setCustomHighlightLabel(e.target.value)}
                                        placeholder="Highlight name"
                                        className="flex-1 px-4 py-3 border rounded-xl"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowCustomHighlight(false)}
                                        className="flex-1 py-2 border rounded-xl text-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addCustomHighlight}
                                        className="flex-1 py-2 bg-purple-600 text-white rounded-xl font-medium"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Selected highlights */}
                        {highlights.length > 0 && (
                            <div className="mt-4 p-3 bg-purple-50 rounded-xl">
                                <p className="text-xs text-purple-600 font-semibold mb-2">SELECTED:</p>
                                <div className="flex flex-wrap gap-1">
                                    {highlights.map((h, i) => (
                                        <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                            {h.emoji} {h.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 6: Menu */}
                {step === 6 && (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add menu items</h2>
                        <p className="text-gray-500 mb-4">
                            {menuItems.length > 0 ? `${menuItems.length} items added` : "Optional - Add with prices"}
                        </p>

                        {/* Add Item Form */}
                        <div className="bg-white p-4 rounded-xl border-2 border-gray-200 mb-4">
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newMenuName}
                                    onChange={(e) => setNewMenuName(e.target.value)}
                                    placeholder="Item name"
                                    className="flex-1 px-4 py-3 border rounded-xl"
                                />
                                <input
                                    type="number"
                                    value={newMenuPrice}
                                    onChange={(e) => setNewMenuPrice(e.target.value)}
                                    placeholder="₹"
                                    className="w-24 px-4 py-3 border rounded-xl"
                                />
                            </div>
                            <button
                                onClick={addMenuItem}
                                disabled={!newMenuName || !newMenuPrice}
                                className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Plus className="w-5 h-5" />
                                Add Item
                            </button>
                        </div>

                        {/* Menu List */}
                        {menuItems.length > 0 && (
                            <div className="space-y-2">
                                {menuItems.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-200"
                                    >
                                        <span className="font-medium text-gray-900">🍽️ {item.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-green-600">₹{item.price}</span>
                                            <button onClick={() => removeMenuItem(i)} className="text-red-500">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                <div className="flex gap-3">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-4 border-2 border-gray-200 rounded-xl font-medium text-gray-600"
                        >
                            Back
                        </button>
                    )}

                    {step < TOTAL_STEPS ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            Next <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="w-5 h-5" /> Add Vendor</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    )
}
