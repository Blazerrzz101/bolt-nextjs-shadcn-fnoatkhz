"use client"

import Link from "next/link"
import Image from "next/image"
import { Product } from "@/types"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact'
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const isCompact = variant === 'compact'

  return (
    <Link 
      href={`/products/${product.id}`}
      className="block cursor-pointer"
    >
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        "bg-card/95 backdrop-blur-sm"
      )}>
        <div className={cn(
          "relative flex gap-4 p-6",
          isCompact && "p-4"
        )}>
          {/* Product Image */}
          <div className={cn(
            "relative shrink-0 overflow-hidden rounded-lg",
            isCompact ? "h-16 w-16" : "h-24 w-24"
          )}>
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="min-w-0 flex-1">
            <h3 className={cn(
              "truncate font-semibold transition-colors group-hover:text-primary",
              isCompact ? "text-base" : "text-lg"
            )}>
              {product.name}
            </h3>
            <p className={cn(
              "line-clamp-2 text-sm text-muted-foreground",
              isCompact && "line-clamp-1 text-xs"
            )}>
              {product.description}
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="font-medium">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground">
                {product.votes} votes
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}