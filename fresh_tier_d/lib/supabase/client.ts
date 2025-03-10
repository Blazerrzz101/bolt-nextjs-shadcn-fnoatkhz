import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This will be true in production builds
const isMockDb = process.env.MOCK_DB === 'true';

// Supabase client wrapper with error handling
const initSupabase = () => {
  // If we're in mock mode, return null
  if (isMockDb) {
    console.log('Using mock database mode. Supabase client not initialized.');
    return null;
  }

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
    
    // Return a non-functional client in development to prevent crashes
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // In production, we should throw to avoid silent failures
    throw new Error('Missing Supabase environment variables');
  }

  try {
    // Create and return the Supabase client
    const client = createClient(supabaseUrl, supabaseAnonKey);
    return client;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    throw error;
  }
};

// Create the client
const supabaseClient = initSupabase();

export default supabaseClient; 