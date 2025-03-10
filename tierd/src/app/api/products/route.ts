import { NextRequest, NextResponse } from 'next/server';

// Mock product data
const products = [
  {
    id: 1,
    name: "Premium Noise-Cancelling Headphones",
    description: "Experience crystal-clear audio with our premium noise-cancelling technology.",
    category: "Electronics",
    upvotes: 127,
    downvotes: 14,
    score: 113,
    imageUrl: "https://placehold.co/300x200/e4f2ff/003366?text=Headphones"
  },
  {
    id: 2,
    name: "Ergonomic Office Chair",
    description: "Designed for comfort during long work sessions with adjustable lumbar support.",
    category: "Furniture",
    upvotes: 85,
    downvotes: 7,
    score: 78,
    imageUrl: "https://placehold.co/300x200/f5f5f5/333333?text=Chair"
  },
  {
    id: 3,
    name: "Smartphone Stand with Wireless Charging",
    description: "Charge your device while keeping it at the perfect viewing angle.",
    category: "Electronics",
    upvotes: 64,
    downvotes: 3,
    score: 61,
    imageUrl: "https://placehold.co/300x200/fff4e6/663300?text=PhoneStand"
  },
  {
    id: 4,
    name: "Smart Fitness Tracker",
    description: "Monitor your health metrics and activity levels throughout the day.",
    category: "Wearables",
    upvotes: 42,
    downvotes: 8,
    score: 34,
    imageUrl: "https://placehold.co/300x200/e6f9ff/004466?text=FitnessTracker"
  },
  {
    id: 5,
    name: "Reusable Water Bottle",
    description: "Eco-friendly water bottle with temperature retention technology.",
    category: "Lifestyle",
    upvotes: 38,
    downvotes: 5,
    score: 33,
    imageUrl: "https://placehold.co/300x200/e6fffa/005544?text=WaterBottle"
  }
];

export async function GET(request: NextRequest) {
  // No delay in production for faster API response
  
  return NextResponse.json({ 
    success: true,
    data: products
  });
} 