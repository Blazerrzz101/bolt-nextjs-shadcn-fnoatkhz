import "../../../../lib/minimal-polyfills";

export const dynamic = "force-dynamic";

// Mock products data for testing
const mockProducts = [
  {
    id: 1,
    name: "Eco-friendly Water Bottle",
    description: "Stainless steel, BPA-free water bottle that keeps liquids cold for 24 hours and hot for 12 hours.",
    category: "Lifestyle",
    price: 35,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
    upvotes: 42,
    downvotes: 3,
    score: 39,
  },
  {
    id: 2,
    name: "Wireless Noise-Cancelling Headphones",
    description: "Premium headphones with adaptive noise cancelling and 20-hour battery life.",
    category: "Electronics",
    price: 249,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    upvotes: 78,
    downvotes: 12,
    score: 66,
  },
  {
    id: 3,
    name: "Smart Plant Monitor",
    description: "Monitors soil moisture, light, and temperature to help you care for your houseplants.",
    category: "Smart Home",
    price: 65,
    image: "https://images.unsplash.com/photo-1631700611307-37dbcb89ef7e",
    upvotes: 54,
    downvotes: 7,
    score: 47,
  },
  {
    id: 4,
    name: "Ergonomic Office Chair",
    description: "Adjustable office chair with lumbar support and breathable mesh back.",
    category: "Home Office",
    price: 350,
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8",
    upvotes: 31,
    downvotes: 5,
    score: 26,
  },
  {
    id: 5,
    name: "Subscription Meal Kit",
    description: "Weekly delivery of pre-portioned ingredients and recipes for easy home cooking.",
    category: "Food & Drink",
    price: 80,
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71",
    upvotes: 24,
    downvotes: 8,
    score: 16,
  },
];

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return Response.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        { status: 400 }
      );
    }
    
    const product = mockProducts.find((p) => p.id === id);
    
    if (!product) {
      return Response.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error in product detail API:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
} 