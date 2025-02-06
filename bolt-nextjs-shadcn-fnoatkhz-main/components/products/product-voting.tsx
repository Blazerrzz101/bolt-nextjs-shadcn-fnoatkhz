<<<<<<< HEAD
"use client"

import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import { useVote } from "@/hooks/use-vote"
import { cn } from "@/lib/utils"

interface ProductVotingProps {
  product: Product
}

export function ProductVoting({ product }: ProductVotingProps) {
  const { product: currentProduct, vote } = useVote(product)

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => vote("down")}
            className={cn(
              "rounded-full hover:border-red-500 hover:text-red-500",
              currentProduct.userVote === "down" && "border-red-500 text-red-500"
            )}
          >
            <ThumbsDown className="mr-2 h-5 w-5" />
            Downvote
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => vote("up")}
            className={cn(
              "rounded-full hover:border-green-500 hover:text-green-500",
              currentProduct.userVote === "up" && "border-green-500 text-green-500"
            )}
          >
            <ThumbsUp className="mr-2 h-5 w-5" />
            Upvote
          </Button>
        </div>
        <span className="text-lg font-medium">
          {currentProduct.votes} votes
        </span>
      </div>
    </Card>
  )
}
=======
import { logActivity } from '../../lib/api';

export default function ProductVoting({ productId, productName, userId }) {
  async function handleVote(action) {
    try {
      await logActivity(userId, 'vote', productId, productName, action);
      alert(`You voted: ${action}`);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  return (
    <div>
      <h2>Vote for {productName}</h2>
      <button onClick={() => handleVote('upvote')}>Upvote</button>
      <button onClick={() => handleVote('downvote')}>Downvote</button>
    </div>
  );
}
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
