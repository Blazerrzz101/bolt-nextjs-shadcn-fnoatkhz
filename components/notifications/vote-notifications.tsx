"use client"

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useEnhancedAuth } from '@/components/auth/auth-provider'
import { ArrowBigUp, ArrowBigDown, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

interface VoteNotification {
  id: string
  productId: string
  productName?: string
  voteType: number | null
  action: string
  timestamp: string
  seen: boolean
}

export function VoteNotifications() {
  const { user } = useEnhancedAuth()
  const queryClient = useQueryClient()
  const [notifications, setNotifications] = useState<VoteNotification[]>([])
  const [isActive, setIsActive] = useState(true)

  // Listen for vote update events
  useEffect(() => {
    // Skip if user is not authenticated
    if (!user) return

    const handleVoteUpdate = (event: CustomEvent) => {
      const { productId, voteType, action, timestamp } = event.detail

      // Don't show notifications for the user's own votes
      // In a real app, we would check if the vote is from the current user
      // For demo purposes, we'll show all notifications with a 30% chance
      if (Math.random() > 0.3) return

      // Get product name from cache if available
      const products = queryClient.getQueryData<any[]>(['products'])
      const product = products?.find(p => p.id === productId)
      const productName = product?.name || 'a product'

      // Create notification
      const newNotification: VoteNotification = {
        id: `vote-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        productId,
        productName,
        voteType,
        action,
        timestamp,
        seen: false
      }

      // Add to notifications
      setNotifications(prev => [newNotification, ...prev].slice(0, 10))

      // Show toast if notifications are active
      if (isActive) {
        const actionText = 
          action === 'INSERT' ? (voteType === 1 ? 'upvoted' : 'downvoted') :
          action === 'UPDATE' ? 'changed their vote on' :
          'removed their vote from'

        toast(
          <div className="flex items-center gap-2">
            {voteType === 1 && <ArrowBigUp className="h-4 w-4 text-green-500" />}
            {voteType === -1 && <ArrowBigDown className="h-4 w-4 text-red-500" />}
            {voteType === null && <RefreshCw className="h-4 w-4 text-muted-foreground" />}
            <span>Someone {actionText} <strong>{productName}</strong></span>
          </div>,
          {
            duration: 3000,
            position: 'bottom-right',
          }
        )
      }
    }

    // Add event listener
    window.addEventListener('vote-update', handleVoteUpdate as EventListener)

    // Clean up
    return () => {
      window.removeEventListener('vote-update', handleVoteUpdate as EventListener)
    }
  }, [user, isActive, queryClient])

  // Mark notifications as seen
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, seen: true }))
      )
    }, 5000)

    return () => clearTimeout(timer)
  }, [notifications])

  // Toggle notifications
  const toggleNotifications = () => {
    setIsActive(prev => !prev)
    toast.info(
      isActive ? 'Vote notifications paused' : 'Vote notifications enabled',
      { duration: 2000 }
    )
  }

  // This component doesn't render anything visible
  // It just listens for events and shows toasts
  return null
} 