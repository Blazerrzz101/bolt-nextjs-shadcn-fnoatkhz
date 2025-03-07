import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs" // Need nodejs runtime for file handling

export async function POST(req: NextRequest) {
  try {
    // Use our mock implementation for now
    console.log("Profile upload API called - using mock implementation")
    
    // Parse the form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }
    
    // Check file size and type
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json(
        { success: false, error: "File size exceeded 5MB limit" },
        { status: 400 }
      )
    }
    
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 }
      )
    }
    
    // Generate a mock URL
    const mockAvatarUrl = `https://mock-storage.example.com/avatars/user-${Date.now()}.jpg`
    
    // Return a success response for testing
    return NextResponse.json({
      success: true,
      avatarUrl: mockAvatarUrl,
      message: "Profile picture updated successfully (mock)",
      mockData: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error("Error in profile picture upload:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 