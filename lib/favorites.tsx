"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"

interface FavoritesContextType {
    favorites: string[]
    addFavorite: (vendorId: string) => void
    removeFavorite: (vendorId: string) => void
    isFavorite: (vendorId: string) => boolean
    toggleFavorite: (vendorId: string) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const STORAGE_KEY = "findkar_favorites"

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                setFavorites(JSON.parse(stored))
            }
        } catch (error) {
            console.error("Error loading favorites:", error)
        }
        setIsLoaded(true)
    }, [])

    // Save to localStorage whenever favorites change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
            } catch (error) {
                console.error("Error saving favorites:", error)
            }
        }
    }, [favorites, isLoaded])

    const addFavorite = (vendorId: string) => {
        setFavorites((prev) => {
            if (prev.includes(vendorId)) return prev
            return [...prev, vendorId]
        })
    }

    const removeFavorite = (vendorId: string) => {
        setFavorites((prev) => prev.filter((id) => id !== vendorId))
    }

    const isFavorite = (vendorId: string) => {
        return favorites.includes(vendorId)
    }

    const toggleFavorite = (vendorId: string) => {
        if (isFavorite(vendorId)) {
            removeFavorite(vendorId)
        } else {
            addFavorite(vendorId)
        }
    }

    return (
        <FavoritesContext.Provider
            value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}
        >
            {children}
        </FavoritesContext.Provider>
    )
}

export function useFavorites() {
    const context = useContext(FavoritesContext)
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider")
    }
    return context
}
