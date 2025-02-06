"use client"

import { useState, useEffect } from "react"
import { RankingCard } from "./ranking-card"
import { Product } from "@/types"
import { supabase } from "@/lib/supabase/client"

interface RankingListProps {
  categoryId: string
}

interface DatabaseProduct {
  id: string
  name: string
  brand: string
  category: string
  price: number
  rating: number | null
  details: Record<string, string>
  image_url: string
  description: string
  slug: string
  product_rankings: {
    upvotes: number
    downvotes: number
    net_score: number
    rank: number
  }
}

export function RankingList({ categoryId }: RankingListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log('Fetching products for category:', categoryId)
        setIsLoading(true)
        setError(null)

        // First test a simple query
        const { data: testData, error: testError } = await supabase
          .from('products')
          .select('id, name')
          .limit(1)

        if (testError) {
          console.error('Simple query failed:', {
            code: testError.code,
            message: testError.message,
            details: testError.details,
            hint: testError.hint
          })
          throw testError
        }

        console.log('Simple query successful, attempting full query...')

        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_rankings!inner (
              upvotes,
              downvotes,
              net_score,
              rank
            )
          `)
          .eq('category', categoryId)
          .order('rank', { foreignTable: 'product_rankings' })
          .limit(5)

        if (error) {
          console.error('Error fetching products:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            query: {
              category: categoryId,
              table: 'products',
              join: 'product_rankings'
            }
          })
          setError(`Failed to fetch products: ${error.message}`)
          return
        }

        console.log('Query response:', {
          success: true,
          count: data?.length || 0,
          categoryId,
          firstProduct: data?.[0] ? {
            id: data[0].id,
            name: data[0].name,
            category: data[0].category,
            hasRankings: !!data[0].product_rankings
          } : null
        })

        // Transform the data to match the Product type
        const transformedProducts = data.map((product: DatabaseProduct) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          rank: product.product_rankings.rank,
          votes: product.product_rankings.upvotes - product.product_rankings.downvotes,
          userVote: null,
          category: product.category,
          imageUrl: product.image_url,
          specs: product.details
        } as Product))

        console.log('Transformed products:', transformedProducts.map((p: Product) => ({
          id: p.id,
          name: p.name,
          votes: p.votes,
          rank: p.rank
        })))

        setProducts(transformedProducts)
      } catch (err: any) {
        console.error('Unexpected error:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          categoryId
        })
        setError(`An unexpected error occurred: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [categoryId])

  if (isLoading) {
    return <div className="text-center py-8">Loading products...</div>
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <div>Error loading products:</div>
        <div className="text-sm">{error}</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No products found in this category.
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-4">
      {products.map((product, index) => (
        <RankingCard
          key={product.id}
          rank={index + 1}
          product={product}
        />
      ))}
    </div>
  )
}