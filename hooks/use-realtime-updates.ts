"use client"

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// Define types for the payload data
interface VoteRecord {
  id: string
  product_id: string
  vote_type: number
  user_id?: string
  client_id?: string
  created_at: string
}

interface ReviewRecord {
  id: string
  product_id: string
  user_id?: string
  content: string
  rating: number
  created_at: string
}

interface ProductRecord {
  id: string
  name: string
  description: string
  upvotes: number
  downvotes: number
  score: number
  created_at: string
}

// Type for the payload with proper handling of new and old records
type VotePayload = RealtimePostgresChangesPayload<VoteRecord>
type ReviewPayload = RealtimePostgresChangesPayload<ReviewRecord>
type ProductPayload = RealtimePostgresChangesPayload<ProductRecord>

export function useRealtimeUpdates() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Create a channel for real-time updates
    const channel = supabase
      .channel('product_votes_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'product_votes' },
        (payload: VotePayload) => {
          console.log('Vote update received:', payload)
          
          // Invalidate queries to refresh data
          const productId = payload.new && 'product_id' in payload.new ? payload.new.product_id : undefined
          
          if (productId) {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['product', productId] })
            queryClient.invalidateQueries({ queryKey: ['votes'] })
          }
          
          // Get vote type safely
          const voteType = payload.new && 'vote_type' in payload.new ? payload.new.vote_type : undefined
          const oldVoteType = payload.old && 'vote_type' in payload.old ? payload.old.vote_type : undefined
          
          // Dispatch custom event for components to listen to
          window.dispatchEvent(new CustomEvent('vote-update', {
            detail: {
              productId,
              voteType,
              action: payload.eventType, // INSERT, UPDATE, DELETE
              oldVoteType,
              timestamp: new Date().toISOString()
            }
          }))
          
          // Show toast notification for vote updates from other users
          // In a real app, we would check if the vote is from the current user
          if (payload.eventType === 'INSERT' && voteType !== undefined) {
            toast.info('New vote received', {
              description: `A product just received a ${voteType === 1 ? 'positive' : 'negative'} vote`,
              duration: 3000,
            })
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        (payload: ReviewPayload) => {
          console.log('Review update received:', payload)
          
          // Extract data safely
          const productId = payload.new && 'product_id' in payload.new ? payload.new.product_id : undefined
          const reviewId = payload.new && 'id' in payload.new ? payload.new.id : undefined
          
          // Invalidate queries to refresh data
          if (productId) {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['product', productId] })
            queryClient.invalidateQueries({ queryKey: ['reviews'] })
          }
          
          // Dispatch custom event for components to listen to
          window.dispatchEvent(new CustomEvent('review-update', {
            detail: {
              productId,
              reviewId,
              action: payload.eventType,
              timestamp: new Date().toISOString()
            }
          }))
          
          // Show toast notification for new reviews
          if (payload.eventType === 'INSERT') {
            toast.info('New review posted', {
              description: 'A product just received a new review',
              duration: 3000,
            })
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload: ProductPayload) => {
          console.log('Product update received:', payload)
          
          // Extract data safely
          const productId = payload.new && 'id' in payload.new ? payload.new.id : undefined
          
          // Invalidate queries to refresh data
          if (productId) {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['product', productId] })
          }
          
          // Dispatch custom event for components to listen to
          window.dispatchEvent(new CustomEvent('product-update', {
            detail: {
              productId,
              action: payload.eventType,
              timestamp: new Date().toISOString()
            }
          }))
        }
      )
      .subscribe()

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      console.log('Unsubscribing from real-time updates')
      channel.unsubscribe()
    }
  }, [queryClient])
}