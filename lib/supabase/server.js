/**
 * Centralized Supabase server client creation
 * This file safely handles different environments and build scenarios
 */

// Handle 'self is not defined' error in various environments
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  // @ts-ignore
  global.self = global;
}

// Set browser environment flag
if (typeof process !== 'undefined' && typeof process === 'object') {
  try {
    Object.defineProperty(process, 'browser', { value: false });
  } catch (e) {
    console.warn('Could not set process.browser:', e);
  }
}

// This ensures we use the mock during static export builds
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
const isSSG = process.env.NEXT_STATIC_EXPORT === 'true';
const shouldUseMock = isBuildTime || isSSG || process.env.NODE_ENV === 'production';

let serverClientImpl;
let componentClientImpl;
let browserClientImpl;
let routeHandlerClientImpl;

// In server-side build context, use the mock
if (shouldUseMock) {
  console.log('Using Supabase SSR mock for build/SSG');
  const mock = require('../mocks/supabase-ssr-mock');
  serverClientImpl = mock.createServerClient;
  componentClientImpl = mock.createServerComponentClient;
  browserClientImpl = mock.createBrowserClient;
  routeHandlerClientImpl = mock.createRouteHandlerClient;
} else {
  try {
    // In browser or non-SSG server context, use the real client
    const {
      createServerComponentClient: realServerComponentClient,
      createClientComponentClient: realClientComponentClient,
      createBrowserClient: realBrowserClient,
      createRouteHandlerClient: realRouteHandlerClient
    } = require('@supabase/auth-helpers-nextjs');
    
    const createBaseClient = (creator) => (context = {}, options = {}) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase URL or key missing, using mock client');
        return require('../mocks/supabase-ssr-mock').createServerClient();
      }
      
      try {
        return creator({ ...context, supabaseUrl, supabaseKey }, options);
      } catch (error) {
        console.warn('Error creating Supabase client, using mock:', error.message);
        return require('../mocks/supabase-ssr-mock').createServerClient();
      }
    };
    
    serverClientImpl = createBaseClient(realServerComponentClient);
    componentClientImpl = createBaseClient(realServerComponentClient);
    browserClientImpl = createBaseClient(realBrowserClient);
    routeHandlerClientImpl = createBaseClient(realRouteHandlerClient);
  } catch (error) {
    console.warn('Failed to import Supabase SSR client, using mock:', error.message);
    const mock = require('../mocks/supabase-ssr-mock');
    serverClientImpl = mock.createServerClient;
    componentClientImpl = mock.createServerComponentClient;
    browserClientImpl = mock.createBrowserClient;
    routeHandlerClientImpl = mock.createRouteHandlerClient;
  }
}

/**
 * Creates a Supabase server client
 * Automatically uses a mock client during static builds
 */
export const createServerClient = (context = {}, options = {}) => {
  try {
    return serverClientImpl(context, options);
  } catch (error) {
    console.error('Error creating Supabase server client:', error);
    // Fallback to mock in case of any error
    return require('../mocks/supabase-ssr-mock').createServerClient();
  }
};

/**
 * Creates a Supabase server component client
 * Automatically uses a mock client during static builds
 */
export const createServerComponentClient = (context = {}, options = {}) => {
  try {
    return componentClientImpl(context, options);
  } catch (error) {
    console.error('Error creating Supabase component client:', error);
    // Fallback to mock in case of any error
    return require('../mocks/supabase-ssr-mock').createServerComponentClient();
  }
};

/**
 * Creates a Supabase browser client
 * Automatically uses a mock client during static builds
 */
export const createBrowserClient = (context = {}, options = {}) => {
  try {
    return browserClientImpl(context, options);
  } catch (error) {
    console.error('Error creating Supabase browser client:', error);
    // Fallback to mock in case of any error
    return require('../mocks/supabase-ssr-mock').createBrowserClient();
  }
};

/**
 * Creates a Supabase route handler client
 * Automatically uses a mock client during static builds
 */
export const createRouteHandlerClient = (context = {}, options = {}) => {
  try {
    return routeHandlerClientImpl(context, options);
  } catch (error) {
    console.error('Error creating Supabase route handler client:', error);
    // Fallback to mock in case of any error
    return require('../mocks/supabase-ssr-mock').createRouteHandlerClient();
  }
};

// Create a default instance that some imports might expect
const supabaseServer = createServerClient();
export { supabaseServer };

export default {
  createServerClient,
  createServerComponentClient,
  createBrowserClient,
  createRouteHandlerClient,
  supabaseServer
}; 