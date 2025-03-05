"use client"

import { useEffect, useState } from "react"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { clearAuthData } from "@/lib/auth-utils"
import { toast } from "sonner"

export function AuthStatusDebug() {
  const { user, isAuthenticated, isLoading, refreshAuthState } = useEnhancedAuth()
  const [localStorageData, setLocalStorageData] = useState<{ [key: string]: any }>({})
  
  // Update localStorage data for debugging
  const updateLocalStorageData = () => {
    try {
      const data: { [key: string]: any } = {}
      
      // Get all auth-related localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          try {
            const value = localStorage.getItem(key)
            if (value && (
              key.includes('auth') || 
              key.includes('user') || 
              key.includes('debug') || 
              key.includes('tierd')
            )) {
              try {
                data[key] = JSON.parse(value)
              } catch {
                data[key] = value
              }
            }
          } catch (e) {
            console.error(`Error reading localStorage key ${key}:`, e)
          }
        }
      }
      
      setLocalStorageData(data)
    } catch (e) {
      console.error("Error updating localStorage data:", e)
      setLocalStorageData({ error: String(e) })
    }
  }
  
  // Update localStorage data when auth state changes
  useEffect(() => {
    updateLocalStorageData()
  }, [user, isAuthenticated])
  
  // Handler to clear auth data
  const handleClearAuth = () => {
    try {
      localStorage.removeItem('authUser')
      updateLocalStorageData()
      toast.success("Auth data cleared")
    } catch (e) {
      toast.error("Failed to clear auth data: " + String(e))
    }
  }
  
  // Handler to refresh auth state
  const handleRefreshAuth = async () => {
    try {
      await refreshAuthState()
      updateLocalStorageData()
      toast.success("Auth state refreshed")
    } catch (e) {
      toast.error("Failed to refresh auth state: " + String(e))
    }
  }
  
  // Handler to force hard refresh
  const handleHardRefresh = () => {
    try {
      // Clear any potentially problematic cache
      localStorage.setItem('force_reload', new Date().toISOString())
      
      // Force reload without cache
      window.location.reload()
      
      toast.success("Forcing page reload")
    } catch (e) {
      toast.error("Failed to force refresh: " + String(e))
    }
  }
  
  // Handler to reset and redirect to sign-in
  const handleResetAndRedirect = () => {
    try {
      // Clear auth data
      localStorage.removeItem('authUser')
      
      // Trigger a hard refresh
      const timestamp = new Date().getTime()
      window.location.href = `/auth/sign-in?t=${timestamp}`
      
      toast.success("Redirecting to sign-in page")
    } catch (e) {
      toast.error("Failed to reset and redirect: " + String(e))
    }
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Auth Context State</CardTitle>
        <CardDescription>
          Current authentication state from the EnhancedAuth provider
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="bg-black/80 p-4 rounded-md overflow-auto max-h-[400px]">
          {JSON.stringify(
            {
              isAuthenticated,
              isLoading,
              user: user ? {
                id: user.id,
                email: user.email,
                name: user.name,
                isAnonymous: user.isAnonymous,
                avatar_url: user.avatar_url
              } : null,
            },
            null,
            2
          )}
        </pre>
      </CardContent>

      <CardHeader>
        <CardTitle>LocalStorage Data</CardTitle>
        <CardDescription>
          Current authentication data stored in localStorage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="bg-black/80 p-4 rounded-md overflow-auto max-h-[400px]">
          {JSON.stringify(localStorageData, null, 2)}
        </pre>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={handleRefreshAuth} variant="outline">
          Refresh Auth State
        </Button>
        <Button onClick={handleClearAuth} variant="outline" className="text-red-500">
          Clear Auth Data
        </Button>
        <Button onClick={handleHardRefresh} variant="outline" className="text-blue-500">
          Force Hard Refresh
        </Button>
        <Button onClick={handleResetAndRedirect} variant="outline" className="text-amber-500">
          Reset & Go to Sign-In
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function DebugAuthStatusPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Auth Debug</h1>
      <AuthStatusDebug />
    </div>
  )
} 