// Import polyfills first
import '../../../lib/complete-polyfills.js';

import { NextRequest } from 'next/server';

// Ensure route is dynamic
export const dynamic = 'force-dynamic';

// GET handler
export async function GET(request: NextRequest) {
  try {
    // Return success response
    return Response.json({
      success: true,
      data: {
        message: "API is working",
        timestamp: new Date().toISOString(),
        endpoint: "/api/categories",
        categories: [
          "electronics",
          "kitchen",
          "fitness",
          "outdoor",
          "home",
          "office",
          "audio"
        ]
      }
    });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
