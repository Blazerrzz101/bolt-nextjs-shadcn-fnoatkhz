'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  image_url: string
  category: string
  average_rating: number
}

interface ProductQuickViewProps {
  onSelect: (product: Product) => void
}

export function ProductQuickView({ onSelect }: ProductQuickViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setProducts([])
        return
      }

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, image_url, category, average_rating')
          .ilike('name', `%${searchQuery}%`)
          .order('average_rating', { ascending: false })
          .limit(5)

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error('Error searching products:', error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, supabase])

  return (
    <Card className="w-[300px] p-4 shadow-lg border border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full bg-transparent"
          />
        </div>
        <ScrollArea className="h-[200px] overflow-y-auto">
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className="flex items-center space-x-3 p-2 hover:bg-accent/50 rounded-md cursor-pointer transition-colors group"
                >
                  <div className="relative w-10 h-10 rounded-md overflow-hidden border border-border/50">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {product.category}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-yellow-500">
                    {'★'.repeat(Math.round(product.average_rating))}
                  </div>
                </div>
              ))
            ) : searchQuery.length >= 2 ? (
              <p className="text-center text-muted-foreground py-4">
                No products found
              </p>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Type to search for products
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
} 