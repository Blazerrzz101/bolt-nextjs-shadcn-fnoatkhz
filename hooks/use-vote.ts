"use client";

import { useEffect, useState } from "react";
import { Product, VoteType } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./use-auth";

export function useVote(initialProduct: Product) {
  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load initial vote state
  useEffect(() => {
    async function loadUserVote() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("product_votes")
          .select("vote_type")
          .eq("product_id", product.id)
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error loading vote:", error);
          return;
        }

        if (data) {
          setProduct(prev => ({
            ...prev,
            userVote: data.vote_type as VoteType
          }));
        }
      } catch (err) {
        console.error("Error in loadUserVote:", err);
      }
    }

    loadUserVote();
  }, [user, product.id]);

  // Listen for real-time vote updates
  useEffect(() => {
    const channel = supabase
      .channel(`product-votes-${product.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_votes',
          filter: `product_id=eq.${product.id}`
        },
        async (payload) => {
          // Fetch updated vote count
          const { data, error } = await supabase
            .from('products')
            .select('votes:product_votes(count)')
            .eq('id', product.id)
            .single();

          if (!error && data) {
            setProduct(prev => ({
              ...prev,
              votes: data.votes?.[0]?.count || 0
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product.id]);

  const vote = async (voteType: VoteType) => {
    if (!user) {
      toast.error("Please sign in to vote", {
        description: "Create an account or sign in to vote on products"
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      if (product.userVote === voteType) {
        voteType = null;
      }

      const previousVote = product.userVote;
      const voteChange = voteType === "up" ? 1 : voteType === "down" ? -1 : 0;
      const previousVoteChange =
        previousVote === "up" ? -1 : previousVote === "down" ? 1 : 0;

      // Optimistic update
      setProduct(prev => ({
        ...prev,
        votes: prev.votes + voteChange + previousVoteChange,
        userVote: voteType,
      }));

      const { error } = await supabase.from("product_votes").upsert({
        product_id: product.id,
        user_id: user.id,
        vote_type: voteType,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Log activity
      await supabase.from("activities").insert({
        user_id: user.id,
        type: "vote",
        product_id: product.id,
        product_name: product.name,
        action: voteType === "up" ? "upvoted" : voteType === "down" ? "downvoted" : "removed vote",
      });

      toast.success(
        voteType === "up"
          ? "Upvoted successfully!"
          : voteType === "down"
          ? "Downvoted successfully!"
          : "Vote removed successfully!"
      );
    } catch (error) {
      // Revert optimistic update
      setProduct(product);
      console.error("Error submitting vote:", error);
      toast.error("Failed to submit vote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    product,
    isLoading,
    vote,
  };
}
