"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Product } from "@/types/product"
import { normalizeProduct } from "@/lib/utils"
import { ProductCard } from "@/components/products/product-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface RelatedProductsProps {
  product: Product
  limit?: number
}

export function RelatedProducts({ product, limit = 4 }: RelatedProductsProps) {
  // Early return if no product or category
  if (!product?.category) {
    return null
  }

  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ["related-products", product.category, product.id],
    queryFn: async () => {
      const supabase = createClient()
      
      // Return mock data if supabase client isn't available
      if (!supabase) {
        console.log('Using mock related products data')
        return Array.from({ length: limit }).map((_, index) => ({
          id: `related-${index + 1}`,
          name: `Related ${product.category} ${index + 1}`,
          description: `A related product in the ${product.category} category`,
          slug: `related-${product.category.toLowerCase()}-${index + 1}`,
          price: 79.99 + (index * 10),
          image_url: `/images/products/${product.category.toLowerCase()}-alt${index + 1}.svg`,
          category: product.category,
          upvotes: 5 - index,
          downvotes: index,
          rank: index + 5,
          score: 5 - (index * 2),
          severity: index % 2 === 0 ? 'low' : 'medium',
          specifications: {}
        })) as Product[];
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", product.id)
        .order("score", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data.map((p: any) => normalizeProduct(p)) as Product[]
    },
    enabled: !!product.category, // Only run query if we have a category
  })

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!relatedProducts?.length) {
    return (
      <div className="text-center text-muted-foreground">
        No related products found in {product.category}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {relatedProducts.map((relatedProduct) => (
        <ProductCard
          key={relatedProduct.id}
          product={relatedProduct}
          size="sm"
        />
      ))}
    </div>
  )
}