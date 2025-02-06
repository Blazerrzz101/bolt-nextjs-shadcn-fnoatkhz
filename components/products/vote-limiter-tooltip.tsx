"use client"

import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface VoteLimiterTooltipProps {
  remainingCooldown: number
  canVote: boolean
  children: React.ReactNode
}

export default function VoteLimiterTooltip({ 
  remainingCooldown, 
  canVote, 
  children 
}: VoteLimiterTooltipProps) {
  if (canVote) {
    return <>{children}</>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {remainingCooldown > 0
            ? `Please wait ${Math.ceil(remainingCooldown / 1000)}s before voting again`
            : 'You must be logged in to vote'
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}