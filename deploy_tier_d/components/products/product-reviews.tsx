"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Star, MessageSquarePlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { formatTimeAgo } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface ProductReviewsProps {
  productId: string
  reviews?: Array<{
    id: string
    rating: number
    content: string
    title: string
    created_at: string
    user: {
      id: string
      username: string
      avatar_url: string | null
    }
  }>
}

export function ProductReviews({ productId, reviews: initialReviews }: ProductReviewsProps) {
  const { user } = useAuth()
  const router = useRouter()

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      if (initialReviews) return initialReviews

      const supabase = createClient()
      
      // Return mock data if supabase client isn't available
      if (!supabase) {
        console.log('Using mock reviews data')
        return [
          {
            id: '1',
            rating: 5,
            content: 'This product exceeded my expectations. The build quality is excellent and performance is top-notch.',
            title: 'Excellent product',
            created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
            user: {
              id: 'user1',
              username: 'techreviewer',
              avatar_url: null
            },
            product_id: productId
          },
          {
            id: '2',
            rating: 4,
            content: 'Great value for the price. Would recommend to others looking for a reliable option.',
            title: 'Great value',
            created_at: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
            user: {
              id: 'user2',
              username: 'gamingpro',
              avatar_url: null
            },
            product_id: productId
          }
        ];
      }

      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          user:users (
            id,
            username,
            avatar_url
          )
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data
    },
    initialData: initialReviews
  })

  const handleWriteReview = () => {
    if (!user) {
      router.push("/auth/sign-in")
      return
    }
    // TODO: Implement review creation dialog
  }

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Reviews ({reviews?.length || 0})
        </h3>
        <Button onClick={handleWriteReview}>
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          Write a Review
        </Button>
      </div>

      {reviews?.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews?.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {review.user.avatar_url ? (
                      <img
                        src={review.user.avatar_url}
                        alt={review.user.username}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {review.user.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{review.user.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeAgo(review.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-medium">{review.title}</h4>
                <p className="text-muted-foreground">{review.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}