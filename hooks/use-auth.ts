"use client"

import { useState, useEffect } from "react"
import { UserProfile } from "@/types/user"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AuthError, Session, User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check active sessions and sets up subscription
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      if (session) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserProfile(userId: string) {
    try {
      setLoading(true)
      console.log('Fetching user profile for ID:', userId)
      
      // First, check if user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (fetchError) {
        console.log('Error fetching profile:', fetchError)
        
        if (fetchError.code === "PGRST116") { // Record not found
          console.log('Profile not found, creating new profile')
          // Create new profile if it doesn't exist
          const { data: authUser, error: authError } = await supabase.auth.getUser()
          
          if (authError) {
            console.error('Error getting auth user:', authError)
            throw authError
          }

          if (!authUser.user) {
            console.error('No auth user found')
            throw new Error('No authenticated user found')
          }

          const newProfile = {
            id: userId,
            email: authUser.user.email,
            username: authUser.user.user_metadata?.username || authUser.user.email?.split('@')[0],
            avatar_url: authUser.user.user_metadata?.avatar_url,
            is_online: true,
            is_public: true,
            created_at: new Date().toISOString(),
            last_seen: new Date().toISOString(),
          }

          console.log('Creating new profile:', newProfile)
          
          const { error: createError } = await supabase
            .from("users")
            .insert([newProfile])
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
            throw createError
          }
          
          // Fetch the newly created profile
          const { data: newProfileData, error: refetchError } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single()

          if (refetchError) {
            console.error('Error fetching new profile:', refetchError)
            throw refetchError
          }
          
          console.log('Successfully created and fetched new profile:', newProfileData)
          
          setUser({
            id: newProfileData.id,
            username: newProfileData.username,
            email: newProfileData.email,
            avatarUrl: newProfileData.avatar_url,
            isOnline: newProfileData.is_online,
            isPublic: newProfileData.is_public,
            preferredAccessories: newProfileData.preferred_accessories || [],
            activityLog: newProfileData.activity_log || [],
            createdAt: new Date(newProfileData.created_at).getTime(),
            lastSeen: new Date(newProfileData.last_seen).getTime(),
          })
        } else {
          throw fetchError
        }
      } else if (existingProfile) {
        console.log('Found existing profile:', existingProfile)
        // Update last seen
        const { error: updateError } = await supabase
          .from("users")
          .update({ last_seen: new Date().toISOString(), is_online: true })
          .eq("id", userId)

        if (updateError) {
          console.error('Error updating last seen:', updateError)
        }

        setUser({
          id: existingProfile.id,
          username: existingProfile.username,
          email: existingProfile.email,
          avatarUrl: existingProfile.avatar_url,
          isOnline: existingProfile.is_online,
          isPublic: existingProfile.is_public,
          preferredAccessories: existingProfile.preferred_accessories || [],
          activityLog: existingProfile.activity_log || [],
          createdAt: new Date(existingProfile.created_at).getTime(),
          lastSeen: new Date(existingProfile.last_seen).getTime(),
        })
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
      toast.error("Failed to load user profile. Please try refreshing the page.")
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          shouldRememberSession: true
        }
      })
      if (error) throw error
      
      await fetchUserProfile(data.user.id)
      toast.success("Welcome back!")
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing in:", error)
      toast.error("Invalid email or password")
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          shouldRememberSession: true,
          data: {
            username,
          }
        }
      })
      if (authError) throw authError

      if (authData.user) {
        await fetchUserProfile(authData.user.id)
        toast.success("Welcome to the community!")
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Error signing up:", error)
      toast.error("Failed to create account")
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error("No user logged in")

      const { error } = await supabase
        .from("users")
        .update({
          username: updates.username,
          avatar_url: updates.avatarUrl,
          is_public: updates.isPublic,
          preferred_accessories: updates.preferredAccessories,
        })
        .eq("id", user.id)

      if (error) throw error

      // Refresh user profile
      await fetchUserProfile(user.id)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    }
  }

  const signOut = async () => {
    try {
      // Update user status to offline
      if (user) {
        await supabase
          .from("users")
          .update({ is_online: false, last_seen: new Date().toISOString() })
          .eq("id", user.id)
      }

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      router.push("/")
      toast.success("Signed out successfully!")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}