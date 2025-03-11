"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Github, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { useEnhancedAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, isLoading: authLoading, refreshAuthState } = useEnhancedAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate inputs
      if (!name) {
        setError("Please enter your name")
        toast.error("Please enter your name")
        return
      }
      
      if (!email) {
        setError("Please enter your email address")
        toast.error("Please enter your email address")
        return
      }
      
      if (!password) {
        setError("Please enter your password")
        toast.error("Please enter your password")
        return
      }
      
      // The success toast is handled by the auth provider
      const success = await signUp(email, password, name)
      
      // Redirect to home page after successful sign-up
      if (success) {
        // Force refresh the auth state before redirecting
        await refreshAuthState()
        router.push("/")
        router.refresh()
      }
      // No success toast here to avoid duplication
    } catch (err) {
      // Don't display error toast here as the auth provider will handle it
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An error occurred during sign up")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setIsLoading(true)
    setError(null)
    
    try {
      // For now, we'll just show a toast notification since OAuth is not fully implemented in the mock auth
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
      
      toast.info("OAuth Sign Up", {
        description: `OAuth with ${provider} is not available in the demo. Please use email/password.`
      })
      
      // For demo purposes, let's auto-fill the email field with a demo account
      setEmail("new-user@example.com")
      setPassword("password123")
      setName("New User")
    } catch (error) {
      setError("OAuth sign up failed. Please try again or use email/password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-6 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to create your account
        </p>
      </div>
      
      <Card className="w-full border border-white/10 bg-black/30 backdrop-blur-sm shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 z-0" />
        <CardHeader className="space-y-1 pb-4 relative z-10">
          <CardTitle className="text-xl">Sign up</CardTitle>
          <CardDescription>
            Choose your preferred sign up method
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4 relative z-10">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className="bg-background/50 border-white/10 hover:bg-white/10 hover:text-white transition-colors relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-black to-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin relative z-10" />
              ) : (
                <Github className="mr-2 h-4 w-4 relative z-10" />
              )}
              <span className="relative z-10">GitHub</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="bg-background/50 border-white/10 hover:bg-white/10 hover:text-white transition-colors relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin relative z-10" />
              ) : (
                <Icons.google className="mr-2 h-4 w-4 relative z-10" />
              )}
              <span className="relative z-10">Google</span>
            </Button>
          </div>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/30 backdrop-blur-sm px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full relative overflow-hidden group bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/80 via-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin relative z-10" />
                  <span className="relative z-10">Creating account...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Create Account</span>
                  <ArrowRight className="ml-2 h-4 w-4 relative z-10" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center space-y-2 pt-0 relative z-10">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </>
  )
}