import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"
export const runtime = "nodejs" // Need nodejs runtime for file handling

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
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
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase
      .storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) {
      console.error("Error uploading file:", error)
      return NextResponse.json(
        { success: false, error: "Failed to upload file" },
        { status: 500 }
      )
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('profiles')
      .getPublicUrl(filePath)
    
    const avatarUrl = publicUrlData.publicUrl
    
    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
    
    if (updateError) {
      console.error("Error updating profile:", updateError)
      // Continue anyway, the file was uploaded
    }
    
    // Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        avatar_url: avatarUrl
      }
    })
    
    if (authError) {
      console.error("Error updating auth metadata:", authError)
      // Continue anyway, not critical
    }
    
    // Log activity
    await supabase
      .from("activities")
      .insert({
        user_id: userId,
        type: "profile",
        action: "update",
        timestamp: new Date().toISOString(),
        details: "Updated profile picture"
      })
    
    return NextResponse.json({
      success: true,
      avatarUrl,
      message: "Profile picture updated successfully"
    })
    
  } catch (error) {
    console.error("Error in profile picture upload:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 