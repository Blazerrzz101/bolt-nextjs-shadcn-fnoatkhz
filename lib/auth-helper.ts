import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';

/**
 * Helper function to safely get current auth status
 * 
 * @param redirectTo Optional path to redirect if not authenticated
 * @returns The user session if authenticated, or null if not
 */
export async function getAuthStatus(redirectTo?: string): Promise<Session | null> {
  try {
    // Only import createServerClient dynamically to prevent issues during build
    const { createServerClient } = await import('@/lib/supabase/server');
    const supabase = createServerClient();
    
    // Get session - wrap in try/catch for build-time safety
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Authentication error:', error.message);
      throw error;
    }
    
    // Check if session exists
    if (!data?.session) {
      // If redirectTo is provided and no session, redirect to that path
      if (redirectTo) {
        // Use setTimeout to make sure it doesn't interfere with rendering
        redirect(redirectTo);
      }
      return null;
    }
    
    return data.session;
  } catch (error) {
    // Log the error but don't throw it further (prevents build failures)
    console.error('Auth helper error:', error);
    
    // If in development, throw the error for easier debugging
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    
    // In production, just return null (no session)
    return null;
  }
}

/**
 * Helper function to check if user is authenticated
 * 
 * @param redirectTo Optional path to redirect if not authenticated
 * @returns Boolean indicating if user is authenticated
 */
export async function isAuthenticated(redirectTo?: string): Promise<boolean> {
  try {
    const session = await getAuthStatus(redirectTo);
    return !!session;
  } catch (error) {
    console.error('isAuthenticated error:', error);
    return false;
  }
}

/**
 * Get the current user ID if authenticated
 * 
 * @returns The user ID if authenticated, or null if not
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await getAuthStatus();
    return session?.user?.id || null;
  } catch (error) {
    console.error('getCurrentUserId error:', error);
    return null;
  }
} 