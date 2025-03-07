import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Notification {
  id: string;
  userId: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: null,
    type: "system",
    title: "Welcome to Tier'd",
    message: "Welcome to the Tier'd platform! Start exploring top gaming gear.",
    read: false,
    actionUrl: "/rankings",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: "notif-2",
    userId: null,
    type: "product",
    title: "New Product Added",
    message: "ASUS ROG Swift PG279QM has been added to monitors.",
    read: false,
    actionUrl: "/products/asus-rog-swift-pg279qm",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: "notif-3",
    userId: null,
    type: "vote",
    title: "Your Vote Counted",
    message: "Thank you for voting on Logitech G Pro X Superlight.",
    read: true,
    actionUrl: "/products/logitech-g-pro-x-superlight",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
  }
];

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/notifications called');
    
    // Get clientId from query params to potentially filter notifications
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || 'anonymous';
    const userId = searchParams.get('user_id');
    
    // In a real implementation, we'd filter notifications based on the clientId/userId
    // For now, we'll just return all mock notifications
    
    // Return the array directly
    return NextResponse.json(mockNotifications);
    
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
    return NextResponse.json([], { status: 500 });
  }
} 