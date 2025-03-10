/**
 * Health Check API
 * 
 * This API route provides a health check endpoint for the application.
 * It returns the status of the application and basic system information.
 */

// Import enhanced polyfills first
import '../../../lib/enhanced-polyfills.js';

// Import the enhanced API wrapper
import { 
  withEnhancedApi, 
  createSuccessResponse,
  getClientForRequest
} from '@/lib/api-wrapper-enhanced';

/**
 * GET handler for health check
 * 
 * @param {Request} request - The request object
 * @returns {Response} The response object with health status
 */
async function handleHealthCheck(request) {
  // Get Supabase client to check connection
  const supabase = getClientForRequest(request);
  
  // Check if mock mode is enabled
  const mockMode = process.env.MOCK_DB === 'true' || process.env.DEPLOY_ENV === 'production';
  
  // Check server time and environment
  const serverTime = new Date().toISOString();
  const environment = process.env.DEPLOY_ENV || 'development';
  
  // Check database connection
  let dbStatus = 'unknown';
  if (mockMode) {
    dbStatus = 'mock';
  } else {
    try {
      const { data, error } = await supabase.from('healthcheck').select('*').limit(1);
      dbStatus = error ? 'error' : 'connected';
    } catch (error) {
      dbStatus = 'error';
    }
  }
  
  // Return success response with health check information
  return createSuccessResponse({
    status: 'ok',
    version: '1.0.0',
    timestamp: serverTime,
    environment,
    databaseStatus: dbStatus,
    mockMode,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().rss / 1024 / 1024,
  });
}

/**
 * Export handlers wrapped with enhanced API utilities
 */
export const GET = withEnhancedApi(handleHealthCheck);
