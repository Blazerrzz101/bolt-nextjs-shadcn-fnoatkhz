"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Get code from the URL
    const code = new URL(window.location.href).searchParams.get("code")
    let next = new URL(window.location.href).searchParams.get("next") || "/"

    // Handle the authentication callback
    async function handleCallback() {
      try {
        if (!code) {
          console.error("No code parameter found in URL")
          router.push("/auth/sign-in?error=no_code")
          return
        }

        // Clean up the URL by removing the code
        if (window) {
          const url = new URL(window.location.href)
          url.searchParams.delete("code")
          url.searchParams.delete("next")
          window.history.replaceState({}, document.title, url.toString())
        }

        // Get the Supabase client
        const supabase = createClient()

        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error("Error exchanging code for session:", error)
          router.push("/auth/sign-in?error=callback_error")
          return
        }

        if (data?.session) {
          console.log("User authenticated, redirecting to:", next)
          router.push(next)
        } else {
          console.error("No session data received")
          router.push("/auth/sign-in?error=no_session")
        }
      } catch (err) {
        console.error("Unexpected error during authentication callback:", err)
        router.push("/auth/sign-in?error=unexpected")
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Completing Sign In</h1>
        <p className="text-center text-gray-500">Please wait while we complete your authentication...</p>
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    </div>
  )
} 