import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { ADMIN_EMAILS } from "@/lib/constants"

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // Public pages that don't need auth check
    const publicPaths = ["/login", "/auth/callback", "/_next", "/favicon.ico", "/manifest.json"]
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

    // If user is logged in and tries to access home or login page
    if (user && (pathname === "/" || pathname === "/login")) {
        // Check if admin
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = "/admin"
            return NextResponse.redirect(redirectUrl)
        }

        // Check if user is a vendor
        const { data: vendor } = await supabase
            .from("vendors")
            .select("id")
            .eq("user_id", user.id)
            .single()

        const redirectUrl = request.nextUrl.clone()

        if (vendor) {
            redirectUrl.pathname = "/vendor/dashboard"
        } else {
            redirectUrl.pathname = "/user/dashboard"
        }

        return NextResponse.redirect(redirectUrl)
    }

    // Protected routes - redirect to login if not authenticated
    const protectedPaths = ["/user/", "/vendor/"]
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

    if (!user && isProtectedPath) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = "/login"
        return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
