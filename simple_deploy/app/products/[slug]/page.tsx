"use client"

import { Suspense } from "react"
import { products as mockProducts } from "@/lib/data"
import { ProductDetails } from "@/components/products/product-details"
import { ProductSkeleton } from "@/components/products/product-skeleton"
import { ErrorBoundary } from "@/components/error-boundary"
import { notFound } from "next/navigation"
import { generateSlug } from "@/lib/utils"
import { Product } from "@/types"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  // For static builds, use mock data
  const findMockProduct = (): Product | undefined => {
    const product = mockProducts.find(
      p => p.url_slug === params.slug || generateSlug(p.name) === params.slug
    );
    
    if (!product) return undefined;
    
    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: product.price || 0,
      imageUrl: product.image_url || '',
      rank: product.rank || 0,
      upvotes: product.upvotes || 0,
      downvotes: product.downvotes || 0,
      userVote: null,
      specs: product.specifications || {},
      url_slug: product.url_slug
    };
  };

  const product = findMockProduct();
  
  if (!product) {
    return notFound();
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails product={product} />
      </Suspense>
    </ErrorBoundary>
  )
} 