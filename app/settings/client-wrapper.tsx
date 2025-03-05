"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ProfileHeader } from "@/components/profile/profile-header"

interface SettingsClientWrapperProps {
  children: React.ReactNode
}

export function SettingsClientWrapper({ children }: SettingsClientWrapperProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useEnhancedAuth()
  const [authChecked, setAuthChecked] = useState(false)
  
  // Check authentication on mount and when auth state changes
  useEffect(() => {
    console.log("🔒 [SettingsClientWrapper] Auth state check:", { 
      isLoading, 
      isAuthenticated,
      user: user ? {
        id: user.id,
        email: user.email, 
        name: user.name,
        isAnonymous: user.isAnonymous
      } : "No user" 
    })
    
    // Log localStorage values
    if (typeof window !== 'undefined') {
      console.log("🔒 [SettingsClientWrapper] localStorage authUser:", localStorage.getItem('authUser'))
      console.log("🔒 [SettingsClientWrapper] localStorage tierd_client_id:", localStorage.getItem('tierd_client_id'))
    }

    // Only redirect if loading is complete and we know the user is not authenticated
    if (!isLoading) {
      if (!user) {
        console.log("🔒 [SettingsClientWrapper] No user found, redirecting to sign-in")
        window.location.href = "/auth/sign-in?next=/settings"
      } else if (user.isAnonymous) {
        console.log("🔒 [SettingsClientWrapper] User is anonymous, redirecting to sign-in")
        window.location.href = "/auth/sign-in?next=/settings"
      } else {
        console.log("🔒 [SettingsClientWrapper] User is authenticated, showing settings")
        setAuthChecked(true)
      }
    }
  }, [user, isLoading, router, isAuthenticated])

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
  if (!authChecked || !user || user.isAnonymous) {
    return (
      <div className="container py-6">
        <ProfileHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in to view your settings</h1>
            <p className="text-muted-foreground mb-6">You need to be signed in to access your settings.</p>
            <Button onClick={() => window.location.href = "/auth/sign-in?next=/settings"}>
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