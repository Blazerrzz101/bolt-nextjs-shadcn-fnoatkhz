/**
 * Authentication utility functions for consistent auth-related operations
 */

import { EnhancedUser } from "@/components/auth/auth-provider"

/**
 * Clears all authentication-related data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('authUser')
    console.log("🔑 [AuthUtils] Cleared auth data from localStorage")
  } catch (err) {
    console.error("🔑 [AuthUtils] Error clearing auth data:", err)
  }
}

/**
 * Checks if the user is authenticated and not anonymous
 * Also checks localStorage directly as a fallback
 */
export function isFullyAuthenticated(user: EnhancedUser | null): boolean {
  // First check the provided user object
  if (user && !user.isAnonymous) {
    return true
  }
  
  // As a fallback, check localStorage directly
  if (typeof window !== 'undefined') {
    try {
      const storedUserJson = localStorage.getItem('authUser')
      if (storedUserJson) {
        const storedUser = JSON.parse(storedUserJson)
        return !!storedUser && storedUser.isAnonymous !== true
      }
    } catch (e) {
      console.error("🔑 [AuthUtils] Error checking localStorage for auth:", e)
    }
  }
  
  return false
}

/**
 * Redirects to sign-in page with the appropriate next parameter
 */
export function redirectToSignIn(returnPath: string = '/profile'): void {
  if (typeof window === 'undefined') return
  
  const encodedReturnPath = encodeURIComponent(returnPath)
  
  // Add timestamp to prevent caching issues
  const timestamp = new Date().getTime()
  const signInUrl = `/auth/sign-in?next=${encodedReturnPath}&t=${timestamp}`
  
  console.log(`🔑 [AuthUtils] Redirecting to sign-in: ${signInUrl}`)
  
  // Use location.replace to prevent back button issues
  window.location.replace(signInUrl)
}

/**
 * Redirects to a specific path after successful authentication
 */
export function redirectAfterAuth(path: string): void {
  if (typeof window === 'undefined') return
  
  console.log(`🔑 [AuthUtils] Redirecting after auth: ${path}`)
  window.location.href = path
}

/**
 * Gets stored user data from localStorage, if any
 */
export function getStoredUserData(): EnhancedUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userData = localStorage.getItem('authUser')
    if (!userData) return null
    
    return JSON.parse(userData) as EnhancedUser
  } catch (err) {
    console.error("🔑 [AuthUtils] Error getting stored user data:", err)
    return null
  }
}

/**
 * Debug helper to log authentication state
 */
export function logAuthState(
  componentName: string, 
  user: EnhancedUser | null, 
  isAuthenticated: boolean, 
  isLoading: boolean
): void {
  console.log(`🔒 [${componentName}] Auth state:`, {
    isAuthenticated,
    isLoading,
    user: user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      isAnonymous: user.isAnonymous
    } : "No user"
  })
  
  if (typeof window !== 'undefined') {
    console.log(`🔒 [${componentName}] localStorage authUser:`, localStorage.getItem('authUser'))
  }
} 