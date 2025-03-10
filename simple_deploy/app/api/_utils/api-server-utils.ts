import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Create a mock implementation that doesn't rely on actual Supabase
// This is a temporary solution until we can properly configure Supabase for both environments
export function createApiClient() {
  // Return a mock client with the same interface
  return {
    from: (table: string) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
      in: () => Promise.resolve({ data: [], error: null }),
      limit: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    rpc: () => Promise.resolve({ data: null, error: null }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
  }
}

// Log user activity - mock implementation
export async function logActivity(userId: string, type: string, productId?: string, productName?: string, action?: string) {
  console.log('Mock log activity:', { userId, type, productId, productName, action })
  return null
}

// Fetch user preferences - mock implementation
export async function getUserPreferences(userId: string) {
  console.log('Mock get user preferences:', { userId })
  return {
    theme: 'light',
    notifications_enabled: true,
    preferred_categories: ['MICE', 'KEYBOARDS']
  }
}

// Update user preferences - mock implementation
export async function updateUserPreferences(userId: string, preferences: any) {
  console.log('Mock update user preferences:', { userId, preferences })
  return { updated: true }
}

// Fetch public profiles - mock implementation
export async function getPublicProfiles() {
  console.log('Mock get public profiles')
  return [
    { id: 'mock-1', username: 'user1', is_public: true },
    { id: 'mock-2', username: 'user2', is_public: true }
  ]
} 