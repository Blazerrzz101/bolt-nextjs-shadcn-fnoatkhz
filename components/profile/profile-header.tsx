"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { User, Activity, Settings } from "lucide-react"

export function ProfileHeader() {
  const pathname = usePathname()

  return (
    <div className="border-b mb-6">
      <div className="container py-4">
        <h1 className="text-2xl font-bold mb-4">Your Account</h1>
        <nav className="flex space-x-4 pb-2">
          <Link
            href="/profile"
            className={cn(
              buttonVariants({ 
                variant: pathname === "/profile" ? "default" : "ghost",
                size: "sm"
              }),
              "flex items-center gap-1.5"
            )}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
          <Link
            href="/activities"
            className={cn(
              buttonVariants({ 
                variant: pathname === "/activities" ? "default" : "ghost",
                size: "sm"
              }),
              "flex items-center gap-1.5"
            )}
          >
            <Activity className="h-4 w-4" />
            <span>Activities</span>
          </Link>
          <Link
            href="/settings"
            className={cn(
              buttonVariants({ 
                variant: pathname === "/settings" ? "default" : "ghost",
                size: "sm"
              }),
              "flex items-center gap-1.5"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}