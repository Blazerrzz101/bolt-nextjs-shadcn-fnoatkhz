"use client"

import { useEffect, useState } from "react"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function TestAuthPage() {
  const { user, isLoading, isAuthenticated, signIn, signOut } = useEnhancedAuth()
  const [localStorageAuth, setLocalStorageAuth] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  
  // Check localStorage on mount
  useEffect(() => {
    // Safe check for browser environment
    if (typeof window !== 'undefined') {
      const authUser = localStorage.getItem('authUser')
      setLocalStorageAuth(authUser)
      
      const clientId = localStorage.getItem('tierd_client_id')
      setClientId(clientId)
    }
  }, [])
  
  // Update localStorage check when auth state changes
  useEffect(() => {
    if (!isLoading) {
      const authUser = localStorage.getItem('authUser')
      setLocalStorageAuth(authUser)
      
      const clientId = localStorage.getItem('tierd_client_id')
      setClientId(clientId)
    }
  }, [isLoading, user])
  
  // Test sign in function
  const handleTestSignIn = async () => {
    try {
      const success = await signIn('test@example.com', 'password123')
      if (success) {
        toast.success('Signed in successfully!')
        // Update localStorage check
        const authUser = localStorage.getItem('authUser')
        setLocalStorageAuth(authUser)
      } else {
        toast.error('Sign in failed')
      }
    } catch (error) {
      console.error('Test sign in error:', error)
      toast.error('An error occurred during sign in')
    }
  }
  
  // Test sign out function
  const handleTestSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully!')
      // Update localStorage check
      const authUser = localStorage.getItem('authUser')
      setLocalStorageAuth(authUser)
    } catch (error) {
      console.error('Test sign out error:', error)
      toast.error('An error occurred during sign out')
    }
  }
  
  // Force localStorage update
  const forceLocalStorageUpdate = () => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user))
      toast.success('Forced localStorage update')
      // Update localStorage check
      const authUser = localStorage.getItem('authUser')
      setLocalStorageAuth(authUser)
    } else {
      toast.error('No user to store')
    }
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authentication State</CardTitle>
            <CardDescription>Current state from useEnhancedAuth hook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Loading: <span className={isLoading ? "text-yellow-500" : "text-green-500"}>{isLoading ? "True" : "False"}</span></p>
            </div>
            <div>
              <p className="font-medium">Authenticated: <span className={isAuthenticated ? "text-green-500" : "text-red-500"}>{isAuthenticated ? "True" : "False"}</span></p>
            </div>
            <div>
              <p className="font-medium">User:</p>
              <pre className="mt-2 p-4 bg-muted rounded-md overflow-auto text-xs">
                {user ? JSON.stringify(user, null, 2) : "null"}
              </pre>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleTestSignIn} disabled={isAuthenticated}>Test Sign In</Button>
            <Button onClick={handleTestSignOut} disabled={!isAuthenticated} variant="destructive">Test Sign Out</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>LocalStorage Values</CardTitle>
            <CardDescription>Current values stored in browser localStorage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">authUser:</p>
              <pre className="mt-2 p-4 bg-muted rounded-md overflow-auto text-xs">
                {localStorageAuth || "null"}
              </pre>
            </div>
            <Separator className="my-4" />
            <div>
              <p className="font-medium">clientId:</p>
              <pre className="mt-2 p-4 bg-muted rounded-md overflow-auto text-xs">
                {clientId || "null"}
              </pre>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={forceLocalStorageUpdate} disabled={!user}>Force localStorage Update</Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
            <CardDescription>Additional actions to help debug authentication issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button 
                onClick={() => {
                  localStorage.clear()
                  toast.success('localStorage cleared')
                  window.location.reload()
                }}
                variant="outline"
              >
                Clear All localStorage
              </Button>
              
              <Button 
                onClick={() => {
                  window.location.href = '/profile'
                }}
              >
                Go to Profile Page
              </Button>
              
              <Button 
                onClick={() => {
                  window.location.href = '/auth/sign-in'
                }}
                variant="outline"
              >
                Go to Sign In Page
              </Button>
              
              <Button 
                onClick={() => {
                  window.location.reload()
                }}
                variant="outline"
              >
                Reload Page
              </Button>
              
              <Button 
                onClick={() => {
                  // Test the profile redirect issue
                  console.log("🧪 Testing profile redirect issue")
                  console.log("🧪 Current auth state:", { 
                    isAuthenticated, 
                    user: user ? {
                      id: user.id,
                      isAnonymous: user.isAnonymous,
                      email: user.email,
                      name: user.name
                    } : "No user" 
                  })
                  console.log("🧪 localStorage authUser:", localStorage.getItem('authUser'))
                  console.log("🧪 localStorage tierd_client_id:", localStorage.getItem('tierd_client_id'))
                  
                  // Force a sign in if not authenticated
                  if (!isAuthenticated && !isLoading) {
                    signIn('test@example.com', 'password123').then(success => {
                      if (success) {
                        console.log("🧪 Sign in successful, redirecting to profile")
                        setTimeout(() => {
                          window.location.href = '/profile'
                        }, 1000)
                      } else {
                        console.log("🧪 Sign in failed")
                      }
                    })
                  } else {
                    console.log("🧪 Already authenticated, redirecting to profile")
                    window.location.href = '/profile'
                  }
                }}
                variant="default"
              >
                Test Profile Redirect
              </Button>
              
              <Button 
                onClick={() => {
                  // Log all localStorage keys and values
                  console.log("🧪 All localStorage keys and values:")
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    if (key) {
                      const value = localStorage.getItem(key)
                      console.log(`🧪 ${key}:`, value)
                    }
                  }
                }}
                variant="outline"
              >
                Log All localStorage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 