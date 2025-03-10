"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export interface AuthCheckProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProfileAuthCheck({ children, redirectTo = "/auth/sign-in?next=/profile" }: AuthCheckProps) {
  const { user, isLoading } = useEnhancedAuth()
  const router = useRouter()

  useEffect(() => {
    // Add detailed logging for authentication state
    console.log("🔒 [ProfileAuthCheck] Auth state:", { 
      isLoading, 
      user: user ? { 
        id: user.id, 
        email: user.email, 
        isAnonymous: user.isAnonymous 
      } : "No user" 
    })

    // Only redirect if loading is complete and we know the user is not authenticated
    if (!isLoading) {
      if (!user) {
        console.log("🔒 [ProfileAuthCheck] No user, redirecting to:", redirectTo)
        router.push(redirectTo)
      } else if (user.isAnonymous) {
        console.log("🔒 [ProfileAuthCheck] User is anonymous, redirecting to:", redirectTo)
        router.push(redirectTo)
      } else {
        console.log("🔒 [ProfileAuthCheck] User is authenticated, rendering content")
      }
    }
  }, [isLoading, user, router, redirectTo])

  // Show loading or nothing while we determine if user is authenticated
  if (isLoading || !user || user.isAnonymous) {
    return null
  }

  return <>{children}</>
} 