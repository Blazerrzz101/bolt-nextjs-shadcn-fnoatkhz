"use client"

import { useEffect, useState } from "react"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { clearAuthData } from "@/lib/auth-utils"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthStatusDebug() {
  const { user, isAuthenticated, isLoading, refreshAuthState } = useEnhancedAuth()
  const [localStorageData, setLocalStorageData] = useState<{ [key: string]: any }>({})
  const [serverAuthData, setServerAuthData] = useState<any>(null)
  const [isLoadingServerData, setIsLoadingServerData] = useState(false)
  
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
  
  // Fetch server-side auth status
  const fetchServerAuthStatus = async () => {
    setIsLoadingServerData(true)
    try {
      const timestamp = new Date().getTime() // Cache-busting
      const response = await fetch(`/api/auth-status?t=${timestamp}`)
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }
      const data = await response.json()
      setServerAuthData(data)
    } catch (error) {
      console.error("Error fetching server auth status:", error)
      setServerAuthData({ error: String(error) })
      toast.error("Failed to fetch server auth status")
    } finally {
      setIsLoadingServerData(false)
    }
  }
  
  // Update localStorage data when auth state changes
  useEffect(() => {
    updateLocalStorageData()
    fetchServerAuthStatus()
  }, [user, isAuthenticated])
  
  // Handler to clear auth data
  const handleClearAuth = () => {
    try {
      clearAuthData()
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
      clearAuthData()
      
      // Trigger a hard refresh
      const timestamp = new Date().getTime()
      window.location.href = `/auth/sign-in?t=${timestamp}`
      
      toast.success("Redirecting to sign-in page")
    } catch (e) {
      toast.error("Failed to reset and redirect: " + String(e))
    }
  }
  
  // Handler to refresh server auth data
  const handleRefreshServerData = () => {
    fetchServerAuthStatus()
    toast.success("Refreshing server auth data")
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <Tabs defaultValue="client">
        <TabsList className="mx-6 mt-6">
          <TabsTrigger value="client">Client Auth</TabsTrigger>
          <TabsTrigger value="local">LocalStorage</TabsTrigger>
          <TabsTrigger value="server">Server Auth</TabsTrigger>
        </TabsList>
        
        <TabsContent value="client">
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
        </TabsContent>
        
        <TabsContent value="local">
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
        </TabsContent>
        
        <TabsContent value="server">
          <CardHeader>
            <CardTitle>Server Auth Status</CardTitle>
            <CardDescription>
              Authentication status from the server perspective
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingServerData ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <pre className="bg-black/80 p-4 rounded-md overflow-auto max-h-[400px]">
                {JSON.stringify(serverAuthData, null, 2)}
              </pre>
            )}
            <div className="mt-4">
              <Button onClick={handleRefreshServerData} variant="outline" size="sm">
                Refresh Server Data
              </Button>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>

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