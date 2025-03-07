"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ProfileHeader } from "@/components/profile/profile-header"
import { isFullyAuthenticated, logAuthState, redirectToSignIn } from "@/lib/auth-utils"

interface SettingsClientWrapperProps {
  children: React.ReactNode
}

export function SettingsClientWrapper({ children }: SettingsClientWrapperProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useEnhancedAuth()
  const [authChecked, setAuthChecked] = useState(false)
  
  // Check authentication on mount and when auth state changes
  useEffect(() => {
    // Log auth state for debugging
    logAuthState("SettingsClientWrapper", user, isAuthenticated, isLoading)
    
    // Only redirect if loading is complete and we know the user is not authenticated
    if (!isLoading) {
      if (!isFullyAuthenticated(user)) {
        console.log("🔒 [SettingsClientWrapper] User not fully authenticated, redirecting to sign-in")
        redirectToSignIn("/settings")
      } else {
        console.log("🔒 [SettingsClientWrapper] User is authenticated, showing settings")
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
            <h1 className="text-2xl font-bold mb-4">Loading settings...</h1>
            <p className="text-muted-foreground">Please wait while we load your settings.</p>
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
            <h1 className="text-2xl font-bold mb-4">Sign in to view your settings</h1>
            <p className="text-muted-foreground mb-6">You need to be signed in to access your settings.</p>
            <Button onClick={() => redirectToSignIn("/settings")}>
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