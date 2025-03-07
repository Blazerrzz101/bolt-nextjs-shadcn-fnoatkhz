import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Client for use in both API routes and client-side code
export const createClientWithoutCookies = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Mock utilities for client-side use
// These will be replaced with actual implementations in API routes
// but provide a fallback for client-side code

// Log user activity (mock for client-side)
export async function logActivity(userId: string, type: string, productId?: string, productName?: string, action?: string) {
  console.log('Mock log activity:', { userId, type, productId, productName, action })
  return null
}

// Fetch user preferences (mock for client-side)
export async function getUserPreferences(userId: string) {
  console.log('Mock get user preferences:', { userId })
  return {
    theme: 'light',
    notifications_enabled: true,
    preferred_categories: ['MICE', 'KEYBOARDS']
  }
}

// Update user preferences (mock for client-side)
export async function updateUserPreferences(userId: string, preferences: any) {
  console.log('Mock update user preferences:', { userId, preferences })
  return { updated: true }
}

// Fetch public profiles (mock for client-side)
export async function getPublicProfiles() {
  console.log('Mock get public profiles')
  return [
    { id: 'mock-1', username: 'user1', is_public: true },
    { id: 'mock-2', username: 'user2', is_public: true }
  ]
} 