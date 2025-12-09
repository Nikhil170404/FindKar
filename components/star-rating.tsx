"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Rating phrases in Hindi
const RATING_PHRASES: Record<number, { text: string; emoji: string }> = {
    1: { text: "Kharab hai", emoji: "😞" },
    2: { text: "Mat lelo", emoji: "😕" },
    3: { text: "Thik hai", emoji: "😐" },
    4: { text: "Accha hai", emoji: "😊" },
    5: { text: "Badhiya hai!", emoji: "🤩" },
}

interface StarRatingProps {
    vendorId: string
    onRated?: (rating: number) => void
    showAverage?: boolean
    size?: "sm" | "md" | "lg"
}

export function StarRating({ vendorId, onRated, showAverage = false, size = "md" }: StarRatingProps) {
    const supabase = createClient()
    const [userRating, setUserRating] = useState<number | null>(null)
    const [hoverRating, setHoverRating] = useState<number | null>(null)
    const [averageRating, setAverageRating] = useState<number | null>(null)
    const [totalRatings, setTotalRatings] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasRated, setHasRated] = useState(false)

    const starSize = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6"

    useEffect(() => {
        fetchRatings()
    }, [vendorId])

    const fetchRatings = async () => {
        try {
            // Get average rating
            const { data: ratings } = await supabase
                .from("ratings")
                .select("rating")
                .eq("vendor_id", vendorId)

            if (ratings && ratings.length > 0) {
                const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                setAverageRating(Math.round(avg * 10) / 10)
                setTotalRatings(ratings.length)
            }

            // Check if current user has rated
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: userRatingData } = await supabase
                    .from("ratings")
                    .select("rating")
                    .eq("vendor_id", vendorId)
                    .eq("user_id", user.id)
                    .single()

                if (userRatingData) {
                    setUserRating(userRatingData.rating)
                    setHasRated(true)
                }
            }
        } catch (error) {
            console.error("Error fetching ratings:", error)
        }
    }

    const handleRate = async (rating: number) => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert("Please login to rate")
                return
            }

            // Upsert rating (insert or update)
            const { error } = await supabase
                .from("ratings")
                .upsert({
                    vendor_id: vendorId,
                    user_id: user.id,
                    rating: rating,
                    phrase: RATING_PHRASES[rating].text,
                }, {
                    onConflict: "vendor_id,user_id"
                })

            if (error) throw error

            setUserRating(rating)
            setHasRated(true)
            onRated?.(rating)

            // Refresh ratings
            fetchRatings()
        } catch (error) {
            console.error("Error rating:", error)
        } finally {
            setLoading(false)
        }
    }

    const displayRating = hoverRating || userRating

    return (
        <div className="flex flex-col items-center">
            {/* Stars */}
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        disabled={loading}
                        className={`transition-transform ${loading ? "opacity-50" : "hover:scale-110"}`}
                    >
                        <Star
                            className={`${starSize} transition-colors ${(displayRating && star <= displayRating) || (hoverRating && star <= hoverRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                        />
                    </button>
                ))}
            </div>

            {/* Phrase Display */}
            {displayRating && (
                <div className="mt-2 text-center animate-in fade-in duration-200">
                    <span className="text-2xl">{RATING_PHRASES[displayRating].emoji}</span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {RATING_PHRASES[displayRating].text}
                    </p>
                </div>
            )}

            {/* Rated Confirmation */}
            {hasRated && !hoverRating && (
                <p className="mt-1 text-xs text-green-600">✓ Rated!</p>
            )}

            {/* Average Rating Display */}
            {showAverage && averageRating && (
                <div className="mt-2 text-center">
                    <span className="text-lg font-bold text-yellow-600">{averageRating}</span>
                    <span className="text-sm text-gray-500"> ({totalRatings} ratings)</span>
                </div>
            )}
        </div>
    )
}

// Compact display for vendor cards
export function RatingBadge({ rating, count }: { rating: number; count: number }) {
    if (!rating) return null

    return (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">{rating}</span>
            <span className="text-xs text-yellow-600 dark:text-yellow-400">({count})</span>
        </div>
    )
}
