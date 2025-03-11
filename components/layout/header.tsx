"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ClientOnly } from "@/components/client-only"
import { AuthNavigation } from "@/components/layout/auth-navigation"

export function Header() {
  const pathname = usePathname()

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
          {/* Auth navigation only rendered on client-side */}
          <ClientOnly fallback={<div className="h-8 w-8 rounded-full bg-muted animate-pulse" />}>
            <AuthNavigation />
          </ClientOnly>
        </div>
      </div>
    </header>
  )
} 