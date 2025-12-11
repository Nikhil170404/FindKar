"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Search, Copy, Edit, Trash2, MapPin, Loader2, Check, ChevronLeft, ChevronRight, LogOut, Eye, Power } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ADMIN_EMAILS } from "@/lib/constants"

const PAGE_SIZE = 20

interface Vendor {
    id: string
    name: string
    category: string
    category_emoji: string
    lat: number
    lng: number
    status: string
    vendor_secret_key: string
    created_at: string
    menu_items?: string[]
}

export default function AdminDashboard() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [toggling, setToggling] = useState<string | null>(null)

    useEffect(() => {
        checkAdmin()
    }, [])

    useEffect(() => {
        if (isAdmin) {
            fetchVendors()
        }
    }, [isAdmin, page, searchQuery])

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push("/login")
            return
        }

        if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
            router.push("/user/dashboard")
            return
        }

        setIsAdmin(true)
        setLoading(false)
    }

    const fetchVendors = useCallback(async () => {
        let query = supabase
            .from("vendors")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

        if (searchQuery) {
            query = query.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        }

        const { data, count, error } = await query

        if (error) {
            console.error("Error fetching vendors:", error)
            return
        }

        setVendors(data || [])
        setTotalCount(count || 0)
    }, [page, searchQuery, supabase])

    const toggleStatus = async (vendor: Vendor) => {
        const newStatus = vendor.status === "online" ? "offline" : "online"
        setToggling(vendor.id)

        // Optimistic update
        setVendors(vendors.map(v => v.id === vendor.id ? { ...v, status: newStatus } : v))

        try {
            const updates: any = { status: newStatus }
            if (newStatus === "online") {
                updates.last_online_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from("vendors")
                .update(updates)
                .eq("id", vendor.id)

            if (error) throw error
        } catch (error) {
            console.error("Error toggling status:", error)
            alert("Failed to update status")
            // Revert
            setVendors(vendors.map(v => v.id === vendor.id ? { ...v, status: vendor.status } : v))
        } finally {
            setToggling(null)
        }
    }

    const copyVendorLink = (vendor: Vendor) => {
        const link = `${window.location.origin}/v/${vendor.vendor_secret_key}`
        navigator.clipboard.writeText(link)
        setCopiedId(vendor.id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const deleteVendor = async (id: string) => {
        if (!confirm("Delete this vendor?")) return

        setDeleting(id)
        const { error } = await supabase.from("vendors").delete().eq("id", id)

        if (error) {
            alert("Failed to delete")
        } else {
            fetchVendors()
        }
        setDeleting(null)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    const totalPages = Math.ceil(totalCount / PAGE_SIZE)

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-40">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">🔐 Admin</h1>
                            <p className="text-xs text-gray-500">{totalCount} vendors</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/admin/add"
                                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg font-medium text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-500 hover:text-red-600"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-4 py-4">
                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
                        placeholder="Search vendors..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-base"
                    />
                </div>

                {/* Vendor List */}
                {vendors.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <div className="text-5xl mb-3">🏪</div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No vendors</h3>
                        <Link
                            href="/admin/add"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add First Vendor
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {vendors.map((vendor) => (
                            <div
                                key={vendor.id}
                                className="bg-white rounded-xl p-3 shadow-sm border border-gray-200"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Emoji */}
                                    <div className="text-3xl flex-shrink-0">{vendor.category_emoji || "🏪"}</div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-gray-900 truncate">{vendor.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${vendor.status === "online"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-600"
                                                }`}>
                                                {vendor.status === "online" ? "🟢" : "🔴"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{vendor.category}</p>
                                        {vendor.menu_items && vendor.menu_items.length > 0 && (
                                            <p className="text-xs text-gray-400 mt-1 truncate">
                                                🍽️ {vendor.menu_items.slice(0, 3).join(", ")}
                                                {vendor.menu_items.length > 3 && ` +${vendor.menu_items.length - 3}`}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                    {/* Toggle Status Button */}
                                    <button
                                        onClick={() => toggleStatus(vendor)}
                                        disabled={toggling === vendor.id}
                                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-bold transition-colors ${vendor.status === "online"
                                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                                            : "bg-green-100 text-green-700 hover:bg-green-200"
                                            }`}
                                    >
                                        {toggling === vendor.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Power className="w-4 h-4" />
                                        )}
                                        {vendor.status === "online" ? "Close" : "Open"}
                                    </button>

                                    <button
                                        onClick={() => copyVendorLink(vendor)}
                                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-colors ${copiedId === vendor.id
                                            ? "bg-green-50 text-green-600"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {copiedId === vendor.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copiedId === vendor.id ? "Copied" : "Link"}
                                    </button>

                                    <Link
                                        href={`/admin/edit/${vendor.id}`}
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>

                                    <button
                                        onClick={() => deleteVendor(vendor.id)}
                                        disabled={deleting === vendor.id}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg disabled:opacity-50 hover:bg-red-100"
                                    >
                                        {deleting === vendor.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="flex items-center gap-1 px-3 py-2 bg-white border rounded-lg disabled:opacity-50 text-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                        </button>
                        <span className="text-gray-600 text-sm">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="flex items-center gap-1 px-3 py-2 bg-white border rounded-lg disabled:opacity-50 text-sm"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
