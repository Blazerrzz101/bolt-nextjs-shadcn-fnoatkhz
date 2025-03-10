"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ProfileHeader } from "@/components/profile/profile-header"
import { isFullyAuthenticated, logAuthState, redirectToSignIn } from "@/lib/auth-utils"

interface ActivitiesClientWrapperProps {
  children: React.ReactNode
}

export function ActivitiesClientWrapper({ children }: ActivitiesClientWrapperProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useEnhancedAuth()
  const [authChecked, setAuthChecked] = useState(false)
  
  // Check authentication on mount and when auth state changes
  useEffect(() => {
    // Log auth state for debugging
    logAuthState("ActivitiesClientWrapper", user, isAuthenticated, isLoading)
    
    // Only redirect if loading is complete and we know the user is not authenticated
    if (!isLoading) {
      if (!isFullyAuthenticated(user)) {
        console.log("🔒 [ActivitiesClientWrapper] User not fully authenticated, redirecting to sign-in")
        redirectToSignIn("/activities")
      } else {
        console.log("🔒 [ActivitiesClientWrapper] User is authenticated, showing activities")
        setAuthChecked(true)
      }
    }
  }, [user, isLoading, isAuthenticated])

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="container py-6">
        <ProfileHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading activities...</h1>
            <p className="text-muted-foreground">Please wait while we load your activities.</p>
          </div>
        </div>
      </div>
    )
  }

  // If user is not authenticated or is anonymous, show sign-in prompt
  if (!authChecked || !isFullyAuthenticated(user)) {
    return (
      <div className="container py-6">
        <ProfileHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in to view your activities</h1>
            <p className="text-muted-foreground mb-6">You need to be signed in to access your activity feed.</p>
            <Button onClick={() => redirectToSignIn("/activities")}>
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated, render children
  return <>{children}</>
} 