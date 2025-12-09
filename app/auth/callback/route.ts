import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const ADMIN_EMAIL = "aipgl200ok@gmail.com"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Admin users go to admin panel
      if (user.email === ADMIN_EMAIL) {
        return NextResponse.redirect(new URL("/admin", requestUrl.origin))
      }

      // Regular users go to user dashboard
      return NextResponse.redirect(new URL("/user/dashboard", requestUrl.origin))
    }
  }

  // If no code or authentication failed, redirect to login with error
  return NextResponse.redirect(
    new URL("/login?error=authentication_failed", requestUrl.origin)
  )
}
