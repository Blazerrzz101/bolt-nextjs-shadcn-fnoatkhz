"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { Checkbox } from "@/components/ui/checkbox"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { toast } from "sonner"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { 
  clearAuthData, 
  isFullyAuthenticated, 
  redirectAfterAuth, 
  logAuthState 
} from "@/lib/auth-utils"

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
})

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const { signIn, isAuthenticated, user, refreshAuthState } = useEnhancedAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check for both 'next' and 'redirect' parameters to support all redirect formats
  const redirectTo = searchParams.get("next") || searchParams.get("redirect") || "/profile"
  
  // Log authentication state for debugging
  useEffect(() => {
    logAuthState('SignInForm', user, isAuthenticated, false)
    console.log("🔑 [SignInForm] Redirect target:", redirectTo)
    console.log("🔑 [SignInForm] Search params:", Object.fromEntries(searchParams.entries()))
    
    // If already authenticated with a non-anonymous user, redirect
    if (isFullyAuthenticated(user)) {
      console.log("🔑 [SignInForm] User already authenticated (non-anonymous), redirecting")
      redirectAfterAuth(redirectTo)
    }
  }, [isAuthenticated, redirectTo, user, searchParams])

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof signInSchema>) {
    setIsLoading(true)
    setError("")
    
    console.log("🔑 [SignInForm] Attempting to sign in with email:", data.email)
    console.log("🔑 [SignInForm] Will redirect to:", redirectTo)
    
    // Clear existing auth data to ensure a clean slate
    clearAuthData()
    
    try {
      const success = await signIn(data.email, data.password)
      
      if (success) {
        console.log("🔑 [SignInForm] Sign-in successful!")
        
        // Force refresh the auth state to ensure everything is in sync
        await refreshAuthState()
        
        // Give time for localStorage to fully update
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Double-check localStorage to make sure auth data is properly set
        const storedUser = localStorage.getItem('authUser')
        if (!storedUser) {
          console.error("🔑 [SignInForm] Auth data not found in localStorage after successful sign-in")
          throw new Error("Authentication data not properly stored. Please try again.")
        }
        
        // Verify the user object is properly set
        try {
          const parsedUser = JSON.parse(storedUser)
          console.log("🔑 [SignInForm] Stored user verified:", {
            id: parsedUser.id,
            email: parsedUser.email,
            isAnonymous: parsedUser.isAnonymous
          })
          
          // Final auth state check 
          logAuthState('SignInForm (pre-redirect)', user, isAuthenticated, false)
        } catch (e) {
          console.error("🔑 [SignInForm] Error parsing stored user:", e)
        }
        
        toast.success("Signed in successfully!")
        
        // Use direct window.location for the most reliable redirect
        // Add timestamp to prevent caching issues
        const timestamp = new Date().getTime()
        window.location.href = `${redirectTo}?t=${timestamp}`
      } else {
        console.log("🔑 [SignInForm] Sign-in failed")
        setError("Invalid email or password")
        toast.error("Failed to sign in. Please check your credentials.")
      }
    } catch (err) {
      console.error("🔑 [SignInForm] Sign in error:", err)
      setError("An error occurred during sign in. Please try again.")
      toast.error("An unexpected error occurred during sign in.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        <div className="mt-8">
          {error && (
            <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium leading-none">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign in
              </Button>
            </form>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <OAuthButtons />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/auth/sign-up"
              className="font-medium text-[#ff4b26] hover:text-[#ff4b26]/90"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}