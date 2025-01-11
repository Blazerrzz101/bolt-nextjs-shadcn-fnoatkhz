"use client"

import { UserProfile } from "@/types/user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/rankings/product-card"
import { usePreferredProducts } from "@/hooks/use-preferred-products"

interface PreferredAccessoriesProps {
  user: UserProfile
}

export function PreferredAccessories({ user }: PreferredAccessoriesProps) {
  const preferredProducts = usePreferredProducts(user.preferredAccessories)

  if (preferredProducts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferred Accessories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {preferredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            variant="compact"
          />
        ))}
      </CardContent>
    </Card>
  )
}