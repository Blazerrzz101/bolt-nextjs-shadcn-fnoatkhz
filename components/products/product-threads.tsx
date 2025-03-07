"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { MessageSquarePlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { formatTimeAgo } from "@/lib/utils"
import { ThreadCard } from "@/components/threads/thread-card"
import { Thread } from "@/types/thread"
import { Product } from "@/types/product"

interface ProductThreadsProps {
  productId: string
  threads?: Array<{
    id: string
    title: string
    content: string
    created_at: string
    user: {
      id: string
      username: string
      avatar_url: string | null
    }
  }>
}

interface ThreadWithCounts extends Omit<Thread, 'taggedProducts'> {
  _count: {
    replies: number
    votes: number
  }
}

export function ProductThreads({ productId, threads: initialThreads }: ProductThreadsProps) {
  const { user } = useAuth()
  const router = useRouter()

  const { data: product } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const supabase = createClient()
      
      // Return mock data if supabase client isn't available
      if (!supabase) {
        console.log('Using mock product data')
        return {
          id: productId,
          name: "Sample Product",
          description: "This is a sample product description",
          slug: "sample-product",
          category: "keyboard",
          image_url: "/images/products/placeholder-keyboard.svg",
          price: 99.99,
          specifications: {},
          upvotes: 10,
          downvotes: 2,
          score: 8,
          rank: 1,
          severity: "medium"
        } as Product;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()

      if (error) throw error
      return data
    },
  })

  const { data: threads, isLoading } = useQuery({
    queryKey: ["product-threads", productId],
    queryFn: async () => {
      if (initialThreads) return initialThreads

      const supabase = createClient()
      
      // Return mock data if supabase client isn't available
      if (!supabase) {
        console.log('Using mock threads data')
        return [
          {
            id: '1',
            title: 'What do you think about the durability?',
            content: 'I\'ve been using this product for a month and I\'m concerned about its long-term durability. Has anyone had it for longer?',
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
            user: {
              id: 'user1',
              username: 'durabilityexpert',
              avatar_url: null
            },
            product_id: productId,
            _count: {
              replies: 3,
              votes: 5
            }
          },
          {
            id: '2',
            title: 'Feature request for next version',
            content: 'I think the next version should include better RGB controls. The current software is limited.',
            created_at: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
            user: {
              id: 'user2',
              username: 'rgbfanatic',
              avatar_url: null
            },
            product_id: productId,
            _count: {
              replies: 7,
              votes: 12
            }
          }
        ];
      }

      const { data, error } = await supabase
        .from("threads")
        .select(`
          *,
          user:users (
            id,
            username,
            avatar_url
          ),
          _count (
            replies,
            votes
          )
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data
    },
    initialData: initialThreads
  })

  const handleCreateThread = () => {
    if (!user) {
      router.push("/auth/sign-in")
      return
    }
    // TODO: Implement thread creation dialog
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
          Discussions ({threads?.length || 0})
        </h3>
        <Button onClick={handleCreateThread}>
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          Start Discussion
        </Button>
      </div>

      {threads?.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-muted-foreground">
            No discussions yet. Start a new discussion about this product!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads?.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={{
                ...thread,
                taggedProducts: [{
                  id: productId,
                  name: product?.name || "",
                  description: product?.description || "",
                  category: product?.category || "",
                  url_slug: product?.url_slug || "",
                  image_url: product?.image_url || "",
                  price: product?.price || 0,
                  specifications: product?.specifications || {},
                  is_active: product?.is_active || false,
                  upvotes: product?.upvotes || 0,
                  downvotes: product?.downvotes || 0,
                  score: product?.score || 0,
                  rank: product?.rank || 0
                }]
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
} 