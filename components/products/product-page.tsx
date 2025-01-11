"use client"

import { Product } from "@/types"
import { ProductDetailLayout } from "./product-detail-layout"
import { ProductTabs } from "./product-tabs"
import { RelatedProducts } from "./product-related"

interface ProductPageProps {
  product: Product
}

export function ProductPage({ product }: ProductPageProps) {
  return (
    <div className="space-y-12 pb-12">
      <ProductDetailLayout product={product} />
      <ProductTabs product={product} />
      <div className="container mx-auto max-w-6xl px-4">
        <RelatedProducts 
          currentProductId={product.id}
          category={product.category}
        />
      </div>
    </div>
  )
}