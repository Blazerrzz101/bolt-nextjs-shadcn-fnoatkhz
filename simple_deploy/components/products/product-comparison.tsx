"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Product } from "@/types/product"
import { ProductImage } from "@/components/ui/product-image"
import Link from "next/link"

interface ProductComparisonProps {
  product: Product
}

export function ProductComparison({ product }: ProductComparisonProps) {
  const { data: similarProducts, isLoading } = useQuery({
    queryKey: ["similar-products", product.category, product.id],
    queryFn: async () => {
      const supabase = createClient()
      
      // Return mock data if supabase client isn't available
      if (!supabase) {
        console.log('Using mock similar products data')
        return [
          {
            id: '101',
            name: 'Similar Product 1',
            description: 'A similar product in the same category',
            slug: 'similar-product-1',
            price: 89.99,
            image_url: `/images/products/${product.category.toLowerCase()}-alt1.svg`,
            category: product.category,
            upvotes: 10,
            downvotes: 3,
            rank: 5,
            score: 7,
            severity: 'low',
            specifications: {}
          },
          {
            id: '102',
            name: 'Similar Product 2',
            description: 'Another similar product',
            slug: 'similar-product-2',
            price: 79.99,
            image_url: `/images/products/${product.category.toLowerCase()}-alt2.svg`,
            category: product.category,
            upvotes: 8,
            downvotes: 2,
            rank: 6,
            score: 6,
            severity: 'medium',
            specifications: {}
          }
        ] as Product[];
      }
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", product.id)
        .order("score", { ascending: false })
        .limit(3)

      if (error) throw error
      return data.map((p: any) => ({
        ...p,
        specifications: p.specifications || {},
        severity: p.severity || 'medium',
        slug: p.slug || p.url_slug || p.id
      })) as Product[]
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const allProducts = [product, ...(similarProducts || [])]
  const allSpecs = Array.from(
    new Set(
      allProducts.flatMap(p => Object.keys(p.specifications || {}))
    )
  ).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Compare with Similar Products
        </h3>
        <Button asChild>
          <Link href={`/products?category=${product.category}`}>
            <Plus className="mr-2 h-4 w-4" />
            Compare More
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left font-medium text-muted-foreground">
                Specification
              </th>
              {allProducts.map((p) => (
                <th key={p.id} className="p-4 text-left">
                  <div className="space-y-2">
                    <div className="relative aspect-square w-24 overflow-hidden rounded-lg">
                      <ProductImage
                        src={p.image_url}
                        alt={p.name}
                        category={p.category}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <Link
                      href={`/products/${p.slug}`}
                      className="block font-medium hover:underline"
                    >
                      {p.name}
                    </Link>
                    <div className="text-lg font-bold">
                      ${p.price?.toFixed(2)}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allSpecs.map((spec) => (
              <tr key={spec} className="border-t border-white/10">
                <td className="p-4 font-medium text-muted-foreground">
                  {spec}
                </td>
                {allProducts.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.specifications?.[spec] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}