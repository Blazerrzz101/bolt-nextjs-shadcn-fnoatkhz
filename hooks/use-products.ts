"use client"

import { useQuery } from "@tanstack/react-query"
import { Product } from "@/types/product"
import { useState } from "react"

const isBrowser = typeof window !== 'undefined'

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = async (category?: string) => {
    try {
      setLoading(true)
      
      // Create the URL using origin or a default value for server-side
      const origin = isBrowser ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || "https://tier-d.vercel.app"
      const url = new URL('/api/products', origin)
      
      if (category) {
        url.searchParams.append('category', category)
      }
      
      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }
      
      const data = await response.json()
      // Ensure we handle the array response
      const productArray = Array.isArray(data) ? data : []
      setProducts(productArray)
      setLoading(false)
      return productArray
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setLoading(false)
      throw err
    }
  }

  return useQuery<Product[]>({
    queryKey: ['products', category],
    queryFn: async () => {
      try {
        // Use our mock API endpoint with optional category filtering
        const url = new URL('/api/products', window.location.origin)
        if (category) {
          url.searchParams.append('category', category)
        }
        
        const response = await fetch(url.toString())
        
        if (!response.ok) {
          throw new Error(`Error fetching products: ${response.statusText}`)
        }
        
        const data = await response.json()
        // Ensure we handle the array response
        const products = Array.isArray(data) ? data : []
        
        // Sort products by score (most upvoted first)
        return products.sort((a: Product, b: Product) => {
          // First by score (upvotes - downvotes)
          const scoreA = (a.upvotes || 0) - (a.downvotes || 0)
          const scoreB = (b.upvotes || 0) - (b.downvotes || 0)
          
          if (scoreB !== scoreA) {
            return scoreB - scoreA
          }
          
          // Then by total votes
          const totalVotesA = (a.upvotes || 0) + (a.downvotes || 0)
          const totalVotesB = (b.upvotes || 0) + (b.downvotes || 0)
          
          if (totalVotesB !== totalVotesA) {
            return totalVotesB - totalVotesA
          }
          
          // Finally by name
          return a.name.localeCompare(b.name)
        })
      } catch (error) {
        console.error('Error in useProducts hook:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  })
}