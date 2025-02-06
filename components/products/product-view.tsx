'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Product = Database['public']['Tables']['products']['Row'] & {
  product_rankings?: Database['public']['Views']['product_rankings']['Row'][];
};

interface ProductViewProps {
  productId: string;
}

export function ProductView({ productId }: ProductViewProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  async function fetchProduct() {
    try {
      setLoading(true);
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          product_rankings (
            upvotes,
            downvotes,
            rating,
            net_score,
            category_rank,
            overall_rank
          )
        `)
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      if (user) {
        // Fetch user's vote if logged in
        const { data: voteData } = await supabase
          .from('product_votes')
          .select('vote_type')
          .eq('product_id', productId)
          .eq('user_id', user.id)
          .single();

        setUserVote(voteData?.vote_type || null);
      }

      setProduct(productData);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(voteType: 'up' | 'down') {
    if (!user) {
      toast.error('Please sign in to vote');
      router.push('/auth/sign-in');
      return;
    }

    try {
      const previousVote = userVote;
      
      // Optimistic update
      setUserVote(voteType === previousVote ? null : voteType);

      if (previousVote === voteType) {
        // Remove vote if clicking the same button
        const { error } = await supabase
          .from('product_votes')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Upsert vote
        const { error } = await supabase
          .from('product_votes')
          .upsert({
            product_id: productId,
            user_id: user.id,
            vote_type: voteType
          });

        if (error) throw error;
      }

      // Show success message
      toast.success(previousVote === voteType 
        ? 'Vote removed' 
        : `${voteType === 'up' ? 'Upvoted' : 'Downvoted'} successfully`
      );

      // Refresh product data to get updated rankings
      fetchProduct();
    } catch (error) {
      console.error('Error voting:', error);
      setUserVote(previousVote); // Revert optimistic update
      toast.error('Failed to register vote');
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Product not found</h2>
          <p className="text-muted-foreground mt-2">The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </Card>
    );
  }

  const rankings = product.product_rankings?.[0];

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={userVote === 'up' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleVote('up')}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              {rankings?.upvotes || 0}
            </Button>
            <Button
              variant={userVote === 'down' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleVote('down')}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              {rankings?.downvotes || 0}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Star className="mr-1 h-4 w-4 text-yellow-400" />
            <span>{rankings?.rating?.toFixed(1) || '0.0'}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Category Rank: #{rankings?.category_rank || 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground">
            Overall Rank: #{rankings?.overall_rank || 'N/A'}
          </div>
        </div>

        <p className="text-muted-foreground">{product.description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Price</h3>
            <p>${product.price?.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="font-semibold">Category</h3>
            <p className="capitalize">{product.category}</p>
          </div>
        </div>

        {product.details && (
          <div>
            <h3 className="font-semibold mb-2">Specifications</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(product.details as Record<string, string>).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium capitalize">{key}: </span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 