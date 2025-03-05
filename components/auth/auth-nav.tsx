"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"

export function AuthNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-3">
      <Link
        href="/auth/sign-in"
        className={cn(
          buttonVariants({ 
            variant: pathname === "/auth/sign-in" ? "default" : "outline",
            size: "sm"
          }),
          "flex-1 sm:flex-none flex items-center gap-1.5"
        )}
      >
        <LogIn className="h-4 w-4" />
        <span>Sign In</span>
      </Link>
      <Link
        href="/auth/sign-up"
        className={cn(
          buttonVariants({ 
            variant: pathname === "/auth/sign-up" ? "default" : "secondary",
            size: "sm"
          }),
          "flex-1 sm:flex-none flex items-center gap-1.5"
        )}
      >
        <UserPlus className="h-4 w-4" />
        <span>Sign Up</span>
      </Link>
    </nav>
  )
} 