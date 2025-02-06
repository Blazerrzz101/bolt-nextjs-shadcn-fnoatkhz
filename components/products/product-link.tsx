"use client"

import Link from "next/link"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface ProductLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function ProductLink({ href, children, className }: ProductLinkProps) {
  // Ensure href starts with /products/ and uses slug
  const formattedHref = href.startsWith('/products/') ? href : `/products/${href}`
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const fullUrl = `${baseUrl}${formattedHref}`

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={formattedHref} className={className}>
            {children}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{fullUrl}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}