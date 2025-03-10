// Import polyfills first
import '@/lib/polyfills';

import { 
  withPolyfills, 
  withStaticBuildHandler,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-wrapper';

// Ensure route is dynamic
export const dynamic = 'force-dynamic';

// GET handler
export const GET = withPolyfills(
  withStaticBuildHandler(async (request) => {
    try {
      // Return success response
      return createSuccessResponse({
        message: "API is working",
        timestamp: new Date().toISOString(),
        endpoint: "/api/log-activity"
      });
    } catch (error) {
      console.error("Error in GET handler:", error);
      return createErrorResponse(
        "Internal server error", 
        error instanceof Error ? error.message : null, 
        500
      );
    }
  })
);
