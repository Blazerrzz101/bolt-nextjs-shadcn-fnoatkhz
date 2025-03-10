"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ProfileHeader } from "@/components/profile/profile-header"
import { isFullyAuthenticated, logAuthState, redirectToSignIn } from "@/lib/auth-utils"

interface ProfileClientWrapperProps {
  children: React.ReactNode
}

export function ProfileClientWrapper({ children }: ProfileClientWrapperProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, refreshAuthState } = useEnhancedAuth()
  const [authChecked, setAuthChecked] = useState(false)
  const [checkCount, setCheckCount] = useState(0)
  const [hasRedirected, setHasRedirected] = useState(false)
  
  // Debug function to check localStorage directly
  const checkLocalStorage = () => {
    try {
      const storedUser = localStorage.getItem('authUser')
      console.log("🔍 [ProfileClientWrapper] Direct localStorage check:", storedUser ? JSON.parse(storedUser) : "No stored user")
      return !!storedUser
    } catch (e) {
      console.error("🔍 [ProfileClientWrapper] Error checking localStorage:", e)
      return false
    }
  }
  
  // Check authentication on mount and when auth state changes
  useEffect(() => {
    // Log authentication state for debugging
    logAuthState('ProfileClientWrapper', user, isAuthenticated, isLoading)
    console.log(`🔍 [ProfileClientWrapper] Auth check #${checkCount+1}`)
    
    // Only proceed with auth checks after loading is complete
    if (!isLoading) {
      // Check localStorage directly as a fallback
      const hasStoredUser = checkLocalStorage()
      
      // First attempt to refresh auth state if needed
      if (!user && hasStoredUser && checkCount < 1) {
        console.log("🔄 [ProfileClientWrapper] Found user in localStorage but not in context, refreshing auth state")
        refreshAuthState()
        setCheckCount(prev => prev + 1)
        return
      }
      
      // For profile page, user must be logged in and not anonymous
      const fullyAuthenticated = isFullyAuthenticated(user)
      console.log(`🔒 [ProfileClientWrapper] User fully authenticated: ${fullyAuthenticated}`)
      
      if (!fullyAuthenticated && !hasRedirected) {
        // Add short delay before redirect to allow auth state to settle
        const timer = setTimeout(() => {
          // Double-check auth state before redirecting
          const currentStoredUser = localStorage.getItem('authUser')
          if (!currentStoredUser) {
            console.log("🔒 [ProfileClientWrapper] User not authenticated or is anonymous, redirecting to sign-in")
            setHasRedirected(true)
            redirectToSignIn('/profile')
          } else {
            console.log("🔒 [ProfileClientWrapper] Found user in final localStorage check, avoiding redirect")
            setAuthChecked(true)
          }
        }, 500)
        
        return () => clearTimeout(timer)
      } else if (fullyAuthenticated) {
        console.log("🔒 [ProfileClientWrapper] User authenticated, allowing access")
        setAuthChecked(true)
      }
    }
  }, [isLoading, user, isAuthenticated, checkCount, hasRedirected, refreshAuthState])

  // If still loading auth state, show loading screen
  if (isLoading || (!authChecked && checkCount < 2)) {
    return (
      <div className="container py-6">
        <ProfileHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading profile...</h1>
            <p className="text-muted-foreground">Please wait while we load your profile information.</p>
            <p className="text-xs text-muted-foreground mt-2">Status: {isLoading ? "Loading auth state" : "Verifying authentication"}</p>
          </div>
        </div>
      </div>
    )
  }

  // Force one last localStorage check before showing sign-in prompt
  const finalStoredUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null
  
  // If user is not authenticated or is anonymous, show sign-in prompt
  if (!finalStoredUser && (!authChecked || !isFullyAuthenticated(user))) {
    return (
      <div className="container py-6">
        <ProfileHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in to view your profile</h1>
            <p className="text-muted-foreground mb-6">You need to be signed in to access your profile information.</p>
            <Button onClick={() => redirectToSignIn('/profile')}>
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