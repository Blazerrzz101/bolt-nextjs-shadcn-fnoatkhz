/**
 * Renders the product page, displaying a list of products with their rankings, votes, and reviews.
 * The component subscribes to real-time updates for vote and review changes, and updates the product data accordingly.
 */
'use client';

import { useState, useEffect } from 'react';
import { subscribeToRealtimeUpdates, supabase } from '@/supabaseClient';

interface Product {
  id: string;
  name: string;
  description?: string;
  ranking?: number;
  votes?: any[];
  reviews?: any[];
}

interface ProductPageProps {
  productId?: string;
}

export function ProductPage({ productId }: ProductPageProps): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [votesCount, setVotesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch products
    async function fetchProducts() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch products directly from Supabase
        const query = supabase
          .from('products')
          .select(`
            *,
            votes (*),
            reviews (*)
          `);

        // If productId is provided, filter for that specific product
        if (productId) {
          query.eq('id', productId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (!data) {
          setProducts([]);
          setReviewsCount(0);
          setVotesCount(0);
          return;
        }

        console.log('Fetched products:', data); // Debug log
        setProducts(data);

        // Update counts safely
        const totalReviews = data.reduce((acc, product) => 
          acc + ((product.reviews?.length) || 0), 0
        );
        
        const totalVotes = data.reduce((acc, product) => 
          acc + ((product.votes?.length) || 0), 0
        );

        setReviewsCount(totalReviews);
        setVotesCount(totalVotes);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    }

    // Function to handle vote changes
    function handleVoteChange(newVote: any) {
      console.log('Vote added or updated:', newVote);
      fetchProducts(); // Refetch to update rankings and counts
    }

    // Function to handle review changes
    function handleReviewChange(newReview: any) {
      console.log('Review added:', newReview);
      fetchProducts(); // Refetch to update rankings and counts
    }

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRealtimeUpdates({
      onVoteChange: handleVoteChange,
      onReviewChange: handleReviewChange,
    });

    // Fetch initial products
    fetchProducts();

    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up subscriptions'); // Debug log
      unsubscribe();
    };
  }, [productId]); // Add productId to dependency array

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-lg">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {productId ? 'Product Details' : 'Product Rankings'}
      </h1>
      
      <div className="mb-4">
        <p className="text-sm">Total Reviews: {reviewsCount}</p>
        <p className="text-sm">Total Votes: {votesCount}</p>
      </div>
      
      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              {product.description && (
                <p className="text-gray-600 mt-1">{product.description}</p>
              )}
              <div className="mt-2 space-y-1">
                <p className="text-sm">Ranking: {product.ranking || 'Not ranked'}</p>
                <p className="text-sm">Votes: {product.votes?.length || 0}</p>
                <p className="text-sm">Reviews: {product.reviews?.length || 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
