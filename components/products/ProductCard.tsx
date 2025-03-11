import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import type { Database } from '@/types/supabase'
import { cn } from '@/lib/utils'
import { Product } from '@/types/product'

type ProductRanking = Database['public']['Views']['product_rankings']['Row']

interface ProductCardProps {
  product: Partial<Product> | ProductRanking
  onVote: (productId: string, voteType: 'upvote' | 'downvote') => Promise<void>
  userVote?: number | null
}

export function ProductCard({ product, onVote, userVote }: ProductCardProps) {
  const [isVoting, setIsVoting] = useState(false)

  // Ensure all properties have fallback values to prevent rendering errors
  const productId = product.id || 'unknown'
  const productName = product.name || 'Unknown Product'
  const productDescription = product.description || 'No description available'
  const productCategory = product.category || 'Uncategorized'
  const productPrice = typeof product.price === 'number' ? product.price : null
  const productImageUrl = product.image_url || '/images/products/placeholder.svg'
  const productUrlSlug = product.url_slug || productId
  const productUpvotes = typeof product.upvotes === 'number' ? product.upvotes : 0
  const productDownvotes = typeof product.downvotes === 'number' ? product.downvotes : 0
  const productRank = typeof product.rank === 'number' ? product.rank : 999
  const productRating = typeof product.rating === 'number' ? product.rating : 0
  const productReviewCount = typeof product.review_count === 'number' ? product.review_count : 0

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (isVoting) return
    setIsVoting(true)
    try {
      await onVote(productId, voteType)
    } catch (error) {
      console.error(`Error voting ${voteType} for product ${productId}:`, error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="relative aspect-square overflow-hidden p-0">
        <Link href={`/products/${productUrlSlug}`}>
          <Image
            src={productImageUrl}
            alt={productName}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <Link 
          href={`/products/${productUrlSlug}`}
          className="text-lg font-semibold hover:underline"
        >
          {productName}
        </Link>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {productDescription}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">Category:</span> {productCategory}
          </div>
          {productPrice && (
            <div className="text-lg font-bold">
              ${productPrice.toFixed(2)}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote('upvote')}
              disabled={isVoting}
              className={cn(
                'gap-1',
                userVote === 1 && 'bg-green-100 hover:bg-green-200'
              )}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{productUpvotes}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote('downvote')}
              disabled={isVoting}
              className={cn(
                'gap-1',
                userVote === -1 && 'bg-red-100 hover:bg-red-200'
              )}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{productDownvotes}</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rank: #{productRank}</span>
            {productRating > 0 && (
              <>
                <span>•</span>
                <span>Rating: {productRating.toFixed(1)}/5</span>
                <span>({productReviewCount})</span>
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
} 