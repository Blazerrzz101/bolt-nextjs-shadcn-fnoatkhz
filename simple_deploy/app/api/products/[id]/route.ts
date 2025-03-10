// Import polyfills first
import '@/lib/polyfills';

import { NextRequest } from 'next/server';
import { 
  withPolyfills, 
  withStaticBuildHandler,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-wrapper';

// Ensure route is dynamic
export const dynamic = 'force-dynamic';

// Mock products data
const mockProducts = [
  {
    id: "product-1",
    name: "AI Calendar Assistant",
    description: "Smart calendar that uses AI to schedule and manage your meetings efficiently.",
    price: 49.99,
    category: "productivity",
    imageUrl: "https://images.unsplash.com/photo-1611746872915-64382b5c2a41?auto=format&fit=crop&q=80&w=2000",
    upvotes: 42,
    downvotes: 5,
    score: 37
  },
  {
    id: "product-2",
    name: "Virtual Reality Fitness Trainer",
    description: "VR fitness app with personalized workouts and real-time feedback.",
    price: 79.99,
    category: "health",
    imageUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=2000",
    upvotes: 38,
    downvotes: 3,
    score: 35
  },
  {
    id: "product-3",
    name: "Smart Home Energy Optimizer",
    description: "AI-powered system that reduces your energy bills by optimizing usage patterns.",
    price: 129.99,
    category: "smart-home",
    imageUrl: "https://images.unsplash.com/photo-1586227740560-8cf2732c1531?auto=format&fit=crop&q=80&w=2000",
    upvotes: 56,
    downvotes: 8,
    score: 48
  }
];

// GET handler for product details
export const GET = withPolyfills(
  withStaticBuildHandler(async (request, { params }) => {
    try {
      const id = params?.id;
      
      if (!id) {
        return createErrorResponse("Product ID is required");
      }
      
      const product = mockProducts.find(p => p.id === id);
      
      if (!product) {
        return createErrorResponse("Product not found", null, 404);
      }
      
      return createSuccessResponse({
        product
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
