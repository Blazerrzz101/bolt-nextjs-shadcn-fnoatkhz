"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/product'

// Hook for subscribing to real-time product updates
export function useProductUpdates() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Initial data fetch
    async function fetchProducts() {
      try {
        setLoading(true)
        const supabase = createClient()
        
        // Return mock data if supabase client isn't available
        if (!supabase) {
          console.log('Using mock product data for realtime updates')
          const mockProducts: Product[] = [
            {
              id: '1',
              name: 'Sample Product',
              description: 'A mock product for testing',
              slug: 'sample-product',
              price: 99.99,
              image_url: 'https://example.com/img.jpg',
              category: 'sample',
              upvotes: 5,
              downvotes: 2,
              rank: 1,
              score: 3,
              severity: 'low'
            }
          ]
          setProducts(mockProducts)
          setLoading(false)
          return
        }

        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .order('updated_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setProducts(data || [])
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()

    // Set up real-time subscription
    let subscription: any = null
    
    const setupSubscription = async () => {
      try {
        const supabase = createClient()
        
        if (!supabase) return
        
        subscription = supabase
          .channel('product-updates')
          .on('postgres_changes', 
            {
              event: '*',
              schema: 'public',
              table: 'products'
            }, 
            (payload) => {
              // Handle different event types
              if (payload.eventType === 'INSERT') {
                setProducts(current => [payload.new as Product, ...current])
              } else if (payload.eventType === 'UPDATE') {
                setProducts(current => 
                  current.map(product => 
                    product.id === payload.new.id ? payload.new as Product : product
                  )
                )
              } else if (payload.eventType === 'DELETE') {
                setProducts(current => 
                  current.filter(product => product.id !== payload.old.id)
                )
              }
            }
          )
          .subscribe()
      } catch (err) {
        console.error('Error setting up realtime subscription:', err)
      }
    }
    
    setupSubscription()

    // Cleanup function
    return () => {
      if (subscription) {
        const supabase = createClient()
        if (supabase) {
          supabase.channel('product-updates').unsubscribe()
        }
      }
    }
  }, [])

  return { products, loading, error }
}

// Hook for subscribing to vote updates
export function useVoteUpdates(productId: string) {
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!productId) {
      setLoading(false)
      return
    }

    // Initial vote count fetch
    async function fetchVotes() {
      try {
        setLoading(true)
        const supabase = createClient()
        
        if (!supabase) {
          // Return mock data if supabase isn't available
          setVotes({ upvotes: 5, downvotes: 2 })
          setLoading(false)
          return
        }

        const { data, error: fetchError } = await supabase
          .from('products')
          .select('upvotes, downvotes')
          .eq('id', productId)
          .single()

        if (fetchError) {
          throw fetchError
        }

        if (data) {
          setVotes({
            upvotes: data.upvotes || 0,
            downvotes: data.downvotes || 0
          })
        }
      } catch (err) {
        console.error('Error fetching vote counts:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchVotes()

    // Set up real-time subscription
    let subscription: any = null
    
    const setupSubscription = async () => {
      try {
        const supabase = createClient()
        
        if (!supabase) return
        
        subscription = supabase
          .channel(`product-votes-${productId}`)
          .on('postgres_changes', 
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'products',
              filter: `id=eq.${productId}`
            }, 
            (payload) => {
              // Update vote counts
              setVotes({
                upvotes: payload.new.upvotes || 0,
                downvotes: payload.new.downvotes || 0
              })
            }
          )
          .subscribe()
      } catch (err) {
        console.error('Error setting up vote subscription:', err)
      }
    }
    
    setupSubscription()

    // Cleanup
    return () => {
      if (subscription) {
        const supabase = createClient()
        if (supabase) {
          supabase.channel(`product-votes-${productId}`).unsubscribe()
        }
      }
    }
  }, [productId])

  return { votes, loading, error }
}