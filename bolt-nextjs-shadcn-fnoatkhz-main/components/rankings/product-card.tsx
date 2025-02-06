<<<<<<< HEAD
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
=======
import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';

interface ProductCardProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ productId, productName, productPrice, productImage }) => {
  const [voteCount, setVoteCount] = useState<number>(0);

  const handleVote = async (type: 'upvote' | 'downvote') => {
    setVoteCount(type === 'upvote' ? voteCount + 1 : voteCount - 1);
    console.log(`${type} registered for product ${productId}`);

    // API call to persist the vote
    const { error } = await supabase
      .from('votes')
      .insert([{ product_id: productId, vote_type: type === 'upvote' ? 'up' : 'down' }]);

    if (error) {
      console.error('Error submitting vote:', error.message);
    }
  };

  return (
    <div className="product-card">
      <img src={productImage} alt={productName} className="product-image" />
      <h2>{productName}</h2>
      <p>${productPrice.toFixed(2)}</p>
      <div className="vote-section">
        <button onClick={() => handleVote('upvote')}>Upvote</button>
        <span>{voteCount} votes</span>
        <button onClick={() => handleVote('downvote')}>Downvote</button>
      </div>
    </div>
  );
};

export default ProductCard;
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
