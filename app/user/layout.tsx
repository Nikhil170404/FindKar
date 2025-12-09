"use client"

import { FavoritesProvider } from "@/lib/favorites"

export default function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <FavoritesProvider>
            {children}
        </FavoritesProvider>
    )
}
