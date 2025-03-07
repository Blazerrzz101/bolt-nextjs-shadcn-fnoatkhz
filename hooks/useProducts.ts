"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/types/product"

const isBrowser = typeof window !== 'undefined';

// Helper function to calculate score from upvotes and downvotes
const calculateScore = (product: Partial<Product>) => {
  const upvotes = product.upvotes || 0
  const downvotes = product.downvotes || 0
  return upvotes - downvotes
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Define fetchProducts as a function that can be called from the outside
  const fetchProducts = async (category?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Create the URL using origin or a default value for server-side
      const origin = isBrowser ? window.location.origin : 'http://localhost:3000'
      const url = new URL('/api/products', origin)
      
      // Add category filter if provided
      if (category) {
        url.searchParams.append('category', category)
      }
      
      // Add cache-busting parameter
      url.searchParams.append('t', Date.now().toString())
      
      console.log('Fetching products from:', url.toString())
      
      const response = await fetch(url.toString(), {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Ensure we have an array
      if (!Array.isArray(data)) {
        console.error('API did not return an array:', data)
        throw new Error('Invalid response format')
      }
      
      console.log(`Received ${data.length} products from API`)
      
      // Calculate score for each product if not already calculated
      const productsWithScore = data.map((product: any) => ({
        ...product,
        // Use existing score if available, otherwise calculate it
        score: product.score !== undefined ? product.score : calculateScore(product)
      }))
      
      // Sort by score (descending)
      productsWithScore.sort((a: Product, b: Product) => {
        // First by score
        const scoreA = a.score || 0
        const scoreB = b.score || 0
        
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
      
      setProducts(productsWithScore)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err : new Error('Unknown error fetching products'))
      
      // Set empty products array on error
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Call fetchProducts on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Function to get products by category
  const getProductsByCategory = (category: string) => {
    if (!category) return products
    return products.filter(product => product.category === category)
  }

  // Function to get a product by slug
  const getProductBySlug = (slug: string) => {
    return products.find(product => 
      product.slug === slug || product.url_slug === slug
    ) || null
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProductsByCategory,
    getProductBySlug
  }
} 