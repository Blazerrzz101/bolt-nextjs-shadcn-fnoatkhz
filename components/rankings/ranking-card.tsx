"use client"

import Link from "next/link"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { motion } from "framer-motion"
import { VoteButtons } from "@/components/products/vote-buttons"
import { useVote } from "@/hooks/use-vote"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RankingCardProps {
  rank: number
  product: Product
}

export function RankingCard({ rank, product }: RankingCardProps) {
  const { product: currentProduct, vote } = useVote(product)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex items-center gap-8 rounded-xl bg-[#121212] p-8 transition-all duration-300 hover:bg-[#1A1A1A] hover:shadow-lg hover:shadow-black/5"
    >
      {/* Rank Number with Tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br",
              rank === 1 && "from-yellow-500/20 to-yellow-500/10 text-yellow-500",
              rank === 2 && "from-zinc-400/20 to-zinc-400/10 text-zinc-400",
              rank === 3 && "from-orange-500/20 to-orange-500/10 text-orange-500",
              rank > 3 && "from-zinc-800/50 to-zinc-900/50 text-zinc-500"
            )}>
              <span className="text-4xl font-bold tracking-tighter">
                #{rank}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Community Ranking Position</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Product Image */}
      <div className="relative h-24 w-24 overflow-hidden rounded-xl">
        <Image
          src={currentProduct.imageUrl}
          alt={currentProduct.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-white/90 transition-colors group-hover:text-white">
          {currentProduct.name}
        </h3>
        <p className="text-sm font-medium text-white/50">
          {currentProduct.category}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-8">
        <VoteButtons
          votes={currentProduct.votes}
          userVote={currentProduct.userVote}
          onVote={vote}
          size="sm"
          showLabel={false}
          showStatus={false}
        />
        <Link href={`/products/${currentProduct.id}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="group/btn flex items-center gap-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            Learn More
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}