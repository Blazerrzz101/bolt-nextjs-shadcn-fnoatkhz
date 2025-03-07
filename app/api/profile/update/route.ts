import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    // Use our mock implementation for now
    console.log("Profile update API called - using mock implementation")
    
    // Parse request body
    const { displayName, bio, avatarUrl } = await req.json()
    
    // Return a success response for testing
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully (mock)",
      mockData: {
        displayName,
        bio,
        avatarUrl,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error("Error in profile update:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 