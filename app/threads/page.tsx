"use client"

import { useEffect, useState } from "react"
import { Thread } from "@/types/thread"
import { getSupabaseClient } from "@/lib/supabase/client"
import { ThreadCard } from "@/components/threads/thread-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { CreateThreadDialog } from "@/components/threads/create-thread-dialog"
import { useAuth } from "@/hooks/use-auth"
import { Product } from "@/types/product"

interface ThreadResponse {
  id: string
  title: string
  content: string
  user_id: string
  created_at: string
  updated_at: string
  upvotes: number
  downvotes: number
  mentioned_products: string[]
  is_pinned: boolean
  is_locked: boolean
  user: Array<{
    username: string
    avatar_url?: string | null
  }>
  products: Array<{
    products: Product
  }>
}

export default function ThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchThreads() {
      try {
        const { data, error } = await supabase
          .from('threads')
          .select(`
            *,
            user:users(username, avatar_url),
            products:thread_products(products(*))
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          const transformedThreads = (data as ThreadResponse[]).map(thread => ({
            ...thread,
            user: {
              ...thread.user[0],
              avatar_url: thread.user[0]?.avatar_url || undefined
            },
            products: thread.products.map(p => p.products)
          }))
          setThreads(transformedThreads)
        }
      } catch (error) {
        console.error('Error fetching threads:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchThreads()
  }, [supabase])

  const handleCreateClick = () => {
    if (!user) {
      router.push('/auth/sign-in')
      return
    }
    setShowCreateDialog(true)
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Discussions</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Join the conversation about gaming gear
          </p>
        </div>
        <Button 
          onClick={handleCreateClick}
          className="mt-4 sm:mt-0"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Thread
        </Button>
      </div>

      <div className="space-y-6">
        {threads.map(thread => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
        {threads.length === 0 && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h2 className="text-xl font-semibold">No threads yet</h2>
            <p className="mt-2 text-muted-foreground">
              Be the first to start a discussion
            </p>
            <Button 
              onClick={handleCreateClick}
              variant="outline" 
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Thread
            </Button>
          </div>
        )}
      </div>

      <CreateThreadDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
} 