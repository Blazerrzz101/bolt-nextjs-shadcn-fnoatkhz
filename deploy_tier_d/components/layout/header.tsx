"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { AuthNav } from "@/components/auth/auth-nav"
import { UserNav } from "@/components/auth/user-nav"
import { useEnhancedAuth } from "@/components/auth/auth-provider"

export function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useEnhancedAuth()
  
  // Enhanced debug logs
  useEffect(() => {
    console.log("Header: Authentication state updated", { 
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        isAnonymous: user.isAnonymous
      } : null, 
      isAuthenticated,
      isLoading
    })
  }, [user, isAuthenticated, isLoading])
  
  console.log("Header: Current auth state on render", { 
    hasUser: !!user, 
    isAuthenticated, 
    isAnonymous: user?.isAnonymous 
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container flex h-16 items-center">
        <div className="mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Tier'd
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-6 text-sm">
          <Link
            href="/rankings"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/rankings" ? "text-foreground" : "text-foreground/60"
            )}
          >
            Rankings
          </Link>
          <Link
            href="/threads"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/threads" ? "text-foreground" : "text-foreground/60"
            )}
          >
            Discussions
          </Link>
          <Link
            href="/about"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/about" ? "text-foreground" : "text-foreground/60"
            )}
          >
            About
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          {isAuthenticated ? <UserNav /> : <AuthNav />}
        </div>
      </div>
    </header>
  )
} 