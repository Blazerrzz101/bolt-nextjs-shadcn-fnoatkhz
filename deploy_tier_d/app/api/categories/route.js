// Import polyfills first
import '../../../lib/basic-polyfills.js';

// GET handler
export async function GET(request) {
  try {
    return Response.json({
      success: true,
      data: {
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
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 