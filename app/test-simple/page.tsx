'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  url_slug: string;
  category: string;
  price: number;
  upvotes?: number;
  downvotes?: number;
  score?: number;
}

interface VoteStatus {
  productId: string;
  voteType: number | null;
  upvotes: number;
  downvotes: number;
}

export default function TestSimplePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on page load
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/simple-products');
        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
        } else {
          setError(data.error || 'Failed to load products');
        }
      } catch (err) {
        setError('An error occurred while fetching products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Handle voting
  async function handleVote(productId: string, voteType: number) {
    try {
      // Get the current vote status
      const statusResponse = await fetch(`/api/simple-vote?productId=${productId}`);
      const statusData = await statusResponse.json();

      // Determine if we should remove the vote or change it
      const currentVoteType = statusData.voteType;
      let voteAction = 'add';

      if (currentVoteType === voteType) {
        voteAction = 'remove';
      } else if (currentVoteType !== null) {
        voteAction = 'change';
      }

      // Submit the vote
      const response = await fetch('/api/simple-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          voteType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the products list with the new vote counts
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product.id === productId
              ? {
                  ...product,
                  upvotes: data.upvotes,
                  downvotes: data.downvotes,
                  score: data.score,
                }
              : product
          )
        );
      } else {
        setError(data.error || 'Failed to cast vote');
      }
    } catch (err) {
      setError('An error occurred while voting');
      console.error(err);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Test Simple Page</h1>
      <p className="mb-4">This page uses the simplified API endpoints that don't rely on Supabase.</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div
              key={product.id}
              className="border rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <p className="text-green-600 font-bold mb-4">${product.price.toFixed(2)}</p>
              <div className="mb-4">
                <span className="text-sm text-gray-500">Category: {product.category}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote(product.id, 1)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    👍 Upvote ({product.upvotes || 0})
                  </button>
                  <button
                    onClick={() => handleVote(product.id, -1)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    👎 Downvote ({product.downvotes || 0})
                  </button>
                </div>
                <div>
                  <span className="font-bold">Score: {product.score || 0}</span>
                </div>
              </div>
              <Link href={`/test-simple/${product.url_slug}`} className="text-blue-500 hover:underline">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 