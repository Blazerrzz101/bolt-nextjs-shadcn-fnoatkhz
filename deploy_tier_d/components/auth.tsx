"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function AuthForm({ mode = "sign-in", className }: { mode: string, className?: string }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams?.get("next") || "/"

  useEffect(() => {
    // Reset form states when mode changes
    setEmail("")
    setPassword("")
    setLoading(false)
    setError(null)
    setMessage(null)
  }, [mode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = createClient()

      // Check if Supabase client is available (for build-time safety)
      if (!supabase) {
        console.error("Supabase client not available")
        setError("Authentication service unavailable")
        setLoading(false)
        return
      }

      if (mode === "sign-in") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        if (data?.session) {
          router.push(nextUrl)
          router.refresh()
        }
      } else if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error
        setMessage("Check your email for a confirmation link")
      }
    } catch (error: any) {
      setError(error?.message || "An unexpected error occurred")
      console.error("Auth error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display error message if any */}
        {error && (
          <div className="bg-red-50 p-4 rounded border border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Display success message if any */}
        {message && (
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <p className="text-green-600 text-sm">{message}</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Please wait..."
            : mode === "sign-in"
            ? "Sign In"
            : "Sign Up"}
        </button>

        {mode === "sign-in" ? (
          <p className="text-sm text-center">
            Don't have an account?{" "}
            <a href="/auth/sign-up" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        ) : (
          <p className="text-sm text-center">
            Already have an account?{" "}
            <a href="/auth/sign-in" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        )}
      </form>
    </div>
  )
} 