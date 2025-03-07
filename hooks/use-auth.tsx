"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Provider, User } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signInWithProvider: (provider: Provider) => Promise<void>
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  signInWithProvider: async () => {},
})

const isBrowser = typeof window !== 'undefined';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()
  const { toast } = useToast()

  React.useEffect(() => {
    if (isBrowser) {
      const storedUser = localStorage.getItem('authUser')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setUser(user)
          setLoading(false)
        } catch (e) {
          console.error('Error parsing stored user:', e)
          localStorage.removeItem('authUser')
        }
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setLoading(false)
        throw error
      }

      setLoading(false)
      
      router.push("/")
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      })
    } catch (error) {
      console.error('Error signing in:', error)
      setLoading(false)
      toast({
        title: "Error signing in",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: "Welcome!",
        description: "Please check your email to verify your account."
      })
    } catch (error) {
      toast({
        title: "Error signing up",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      router.push("/")
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      })
    } catch (error) {
      toast({
        title: "Error signing out",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: isBrowser ? `${window.location.origin}/auth/reset-password` : '/auth/reset-password',
      })
      
      if (error) {
        setLoading(false)
        throw error
      }
      
      setLoading(false)
      toast({
        title: "Password reset email sent",
        description: "Please check your email for the password reset link."
      })
    } catch (error) {
      console.error('Error resetting password:', error)
      setLoading(false)
      toast({
        title: "Error resetting password",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    }
  }

  const signInWithProvider = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      toast({
        title: "Error signing in",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 