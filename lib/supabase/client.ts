"use client";

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'
import { Product } from "@/types";

// Debug flag - set to true to enable detailed logging
const DEBUG = true;

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[Supabase Debug]', ...args);
  }
}

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'tierd-web'
      }
    }
  }
)

// Connection state monitoring
let isConnected = false;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

// Check connection status
async function checkConnection(): Promise<boolean> {
  const now = Date.now();
  if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    debugLog('Using cached connection status:', isConnected);
    return isConnected;
  }

  try {
    debugLog('Checking database connection...');
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    isConnected = !error;
    lastConnectionCheck = now;
    
    if (error) {
      debugLog('Connection check failed:', error.message);
    } else {
      debugLog('Connection check successful');
    }
    
    return isConnected;
  } catch (error) {
    debugLog('Connection check error:', error);
    isConnected = false;
    lastConnectionCheck = now;
    return false;
  }
}

// Enhanced error handler
function handleDatabaseError(error: any, context: string): never {
  debugLog(`Error in ${context}:`, error);

  if (error instanceof DatabaseError) {
    throw error;
  }

  if (error?.message?.includes('JWT')) {
    throw new DatabaseError(
      DatabaseErrorType.AUTHENTICATION,
      'Authentication failed - please check your Supabase configuration',
      error
    );
  }

  if (error?.message?.includes('connection')) {
    throw new DatabaseError(
      DatabaseErrorType.CONNECTION,
      'Database connection failed - please check your network connection',
      error
    );
  }

  if (error?.code === '23505') {
    throw new DatabaseError(
      DatabaseErrorType.VALIDATION,
      'Duplicate entry found',
      error
    );
  }

  throw new DatabaseError(
    DatabaseErrorType.UNKNOWN,
    error?.message || 'An unknown database error occurred',
    error
  );
}

// Helper function to sanitize data
export function sanitizeData<T>(data: T): T {
  // Handle null values early
  if (data === null) return null as T;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item)) as T;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString() as T;
  }

  // Handle non-object types
  if (typeof data !== 'object') {
    return data;
  }

  // Handle special Supabase types
  if (data && 'toJSON' in data) {
    return sanitizeData((data as any).toJSON());
  }

  // Process object recursively
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      sanitizeData(value)
    ])
  ) as T;
}

// Test connection and permissions with enhanced checks
async function testConnection() {
  try {
    debugLog('Testing database connection...')
    
    // First, check authentication status with detailed logging
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    debugLog('Auth status:', {
      isAuthenticated: !!user,
      userId: user?.id,
      email: user?.email,
      lastSignInAt: user?.last_sign_in_at,
      sessionValid: !!user?.aud,
      authError: authError?.message,
      authErrorCode: authError?.status
    })

    if (authError) {
      debugLog('Auth check failed:', {
        status: authError.status,
        message: authError.message,
        name: authError.name
      })
      return false
    }

    // Test basic table access without RLS dependencies
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id')
      .limit(1)
    
    debugLog('Basic table access test:', {
      success: !testError,
      error: testError?.message,
      hasData: !!testData,
      dataLength: testData?.length
    })

    if (testError) {
      debugLog('Basic query failed:', {
        code: testError.code,
        message: testError.message,
        details: testError.details,
        hint: testError.hint,
        isAuthError: testError.message.includes('JWT'),
        isPermissionError: testError.message.includes('permission denied'),
        isSchemaError: testError.message.includes('does not exist')
      })
      return false
    }

    // Test RLS policies with detailed logging
    const { data: rlsTestData, error: rlsError } = await supabase
      .from('products')
      .select('id, created_at, user_id')
      .limit(1)

    debugLog('RLS test results:', {
      hasRlsError: !!rlsError,
      rlsErrorMessage: rlsError?.message,
      rlsErrorCode: rlsError?.code,
      canAccessCreatedAt: !!rlsTestData?.[0]?.created_at,
      canAccessUserId: !!rlsTestData?.[0]?.user_id,
      dataReceived: !!rlsTestData
    })

    return true
  } catch (error: any) {
    debugLog('Connection test error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      isNetworkError: error.message.includes('network'),
      isTimeoutError: error.message.includes('timeout'),
      isCORSError: error.message.includes('CORS')
    })
    return false
  }
}

// Fetch products with enhanced error handling and logging
export async function fetchProducts() {
  try {
    // First test the connection
    const isConnected = await testConnection()
    if (!isConnected) {
      throw new Error('Database connection failed')
    }

    debugLog('Fetching products...')
    
    // Start with a simple query first
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1)

    if (testError) {
      debugLog('Simple query failed:', {
        code: testError.code,
        message: testError.message,
        details: testError.details
      })
      throw testError
    }

    debugLog('Simple query successful, attempting full query...')

    // If simple query works, try the full query
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        votes:product_votes(count),
        reviews(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      debugLog('Full query failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw error
    }

    debugLog('Successfully fetched products:', {
      count: data?.length || 0,
      firstItem: data?.[0] ? {
        id: data[0].id,
        name: data[0].name,
        hasVotes: !!data[0].votes,
        hasReviews: !!data[0].reviews
      } : null
    })

    return data
  } catch (error: any) {
    debugLog('Error in fetchProducts:', {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    })
    throw error
  }
}

// Fetch single product by ID with enhanced error handling
export async function fetchProductById(id: string) {
  try {
    debugLog('Fetching product by ID:', id)
    
    // First test a simple query
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single()

    if (testError) {
      debugLog('Simple product query failed:', {
        code: testError.code,
        message: testError.message,
        details: testError.details
      })
      throw testError
    }

    debugLog('Simple product query successful, attempting full query...')

    // If simple query works, try the full query
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        votes:product_votes(count),
        reviews(
          id,
          rating,
          title,
          content,
          created_at,
          user:users(username, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      debugLog('Full product query failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw error
    }

    debugLog('Successfully fetched product:', {
      id: data?.id,
      name: data?.name,
      hasVotes: !!data?.votes,
      hasReviews: !!data?.reviews
    })

    return data
  } catch (error: any) {
    debugLog('Error in fetchProductById:', {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    })
    throw error
  }
}

// Export connection check for components that need it
export const checkDatabaseConnection = checkConnection;

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Test user profile fetch with enhanced diagnostics
async function testUserProfile() {
  try {
    debugLog('Testing user profile fetch...')
    
    // Check auth status with detailed session info
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    debugLog('Auth state:', {
      user: {
        exists: !!user,
        id: user?.id,
        email: user?.email,
        lastSignIn: user?.last_sign_in_at,
        metadata: user?.user_metadata
      },
      session: {
        exists: !!session,
        expiresAt: session?.expires_at,
        provider: session?.user?.app_metadata?.provider,
        role: session?.user?.role
      },
      errors: {
        authError: authError?.message,
        sessionError: sessionError?.message
      }
    })

    if (authError || !user) {
      debugLog('Auth check failed:', {
        error: authError?.message || 'No user found',
        status: authError?.status,
        isExpired: authError?.message?.includes('expired'),
        isInvalid: authError?.message?.includes('invalid')
      })
      return false
    }

    // First try a simple profile query
    const { data: simpleProfile, error: simpleError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    debugLog('Simple profile query:', {
      success: !simpleError,
      error: simpleError?.message,
      hasData: !!simpleProfile
    })

    // Then try the full profile query
    const { data: fullProfile, error: fullError } = await supabase
      .from('users')
      .select('username, email, avatar_url, is_online')
      .eq('id', user.id)
      .single()

    debugLog('Full profile query:', {
      success: !fullError,
      error: fullError?.message,
      hasUsername: !!fullProfile?.username,
      hasEmail: !!fullProfile?.email,
      hasAvatar: !!fullProfile?.avatar_url,
      isOnline: fullProfile?.is_online
    })

    if (fullError) {
      debugLog('Profile fetch failed:', {
        code: fullError.code,
        message: fullError.message,
        details: fullError.details,
        hint: fullError.hint,
        isPermissionError: fullError.message.includes('permission denied'),
        isNotFound: fullError.message.includes('not found'),
        isRLSError: fullError.message.includes('policy')
      })
      return false
    }

    return true
  } catch (error: any) {
    debugLog('Profile test error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      isNetworkError: error.message.includes('network'),
      isTimeoutError: error.message.includes('timeout')
    })
    return false
  }
}

// Export test functions for components that need them
export const testDatabaseConnection = testConnection;
export const testUserProfileFetch = testUserProfile;

// Helper function to check auth status
export async function checkAuthStatus() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Auth status check failed:', error)
    return null
  }
}

// Helper function to refresh session
export async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Session refresh failed:', error)
    return null
  }
}

// Helper function to fetch products with rankings
export async function fetchProductsWithRankings(category?: string) {
  try {
    // First fetch the products
    const productsQuery = supabase
      .from('products')
      .select('*')
      
    if (category) {
      productsQuery.eq('category', category)
    }

    const { data: products, error: productsError } = await productsQuery

    if (productsError) throw productsError

    // Then fetch their rankings
    const { data: rankings, error: rankingsError } = await supabase
      .from('product_rankings')
      .select('*')
      .in('id', products.map(p => p.id))

    if (rankingsError) throw rankingsError

    // Combine the data
    return products.map(product => ({
      ...product,
      product_rankings: rankings.filter(r => r.id === product.id)
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

// Helper function to fetch a single product
export async function fetchProductBySlug(slug: string) {
  try {
    // First fetch the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single()

    if (productError) throw productError

    // Then fetch its ranking
    const { data: rankings, error: rankingError } = await supabase
      .from('product_rankings')
      .select('*')
      .eq('id', product.id)
      .single()

    if (rankingError && rankingError.code !== 'PGRST116') { // Ignore not found errors
      throw rankingError
    }

    // Combine the data
    return {
      ...product,
      product_rankings: rankings ? [rankings] : []
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}