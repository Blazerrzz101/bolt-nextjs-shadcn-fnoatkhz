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