import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

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
    const { displayName, bio, avatarUrl } = await req.json()
    
    // Update user profile
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        username: displayName,
        bio: bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
    
    if (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      )
    }
    
    // Also update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: displayName,
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
        details: "Updated profile information"
      })
    
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    })
    
  } catch (error) {
    console.error("Error in profile update:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 