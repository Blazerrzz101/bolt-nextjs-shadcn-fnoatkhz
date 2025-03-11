'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  url_slug: string;
  category: string;
  price: number;
  image_url: string;
  specifications: Record<string, string>;
  rating: number;
  review_count: number;
  upvotes?: number;
  downvotes?: number;
  score?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteStatus, setVoteStatus] = useState<{ voteType: number | null; hasVoted: boolean }>({
    voteType: null,
    hasVoted: false,
  });

  // Fetch product details on page load
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const response = await fetch(`/api/simple-products?slug=${slug}`);
        const data = await response.json();

        if (data.success && data.product) {
          setProduct(data.product);
          // Fetch vote status for this product
          await checkVoteStatus(data.product.id);
        } else {
          setError(data.error || 'Failed to load product');
        }
      } catch (err) {
        setError('An error occurred while fetching product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  // Check the current vote status
  async function checkVoteStatus(productId: string) {
    try {
      const response = await fetch(`/api/simple-vote?productId=${productId}`);
      const data = await response.json();

      if (data.success) {
        setVoteStatus({
          voteType: data.voteType,
          hasVoted: data.hasVoted,
        });
      }
    } catch (err) {
      console.error('Error checking vote status:', err);
    }
  }

  // Handle voting
  async function handleVote(voteType: number) {
    if (!product) return;

    try {
      const response = await fetch('/api/simple-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          voteType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the product with the new vote counts
        setProduct(prevProduct => {
          if (!prevProduct) return null;
          
          return {
            ...prevProduct,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            score: data.score,
          };
        });

        // Update vote status
        setVoteStatus({
          voteType: data.voteType,
          hasVoted: data.hasVoted,
        });
      } else {
        setError(data.error || 'Failed to cast vote');
      }
    } catch (err) {
      setError('An error occurred while voting');
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Product not found'}
        </div>
        <Link href="/test-simple" className="text-blue-500 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/test-simple" className="text-blue-500 hover:underline mb-6 inline-block">
        ← Back to Products
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <img
              src={product.image_url || '/images/products/placeholder.svg'}
              alt={product.name}
              className="w-full rounded-lg"
            />
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Product Rating</h3>
              <div className="flex items-center mb-2">
                <div className="flex items-center mr-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < Math.round(product.rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                  ))}
                </div>
                <span className="text-gray-600">({product.review_count} reviews)</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Vote For This Product</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleVote(1)}
                  className={`px-4 py-2 rounded-md ${
                    voteStatus.voteType === 1
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 hover:bg-green-500 hover:text-white'
                  }`}
                >
                  👍 Upvote ({product.upvotes || 0})
                </button>
                <button
                  onClick={() => handleVote(-1)}
                  className={`px-4 py-2 rounded-md ${
                    voteStatus.voteType === -1
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  👎 Downvote ({product.downvotes || 0})
                </button>
              </div>
              <div className="mt-2">
                <span className="font-bold">Score: {product.score || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 md:pl-8">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <p className="text-green-600 font-bold text-2xl mb-4">${product.price.toFixed(2)}</p>
            
            <div className="mb-6">
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                {product.category}
              </span>
            </div>
            
            <h2 className="text-xl font-semibold mb-3">Specifications</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {Object.entries(product.specifications || {}).map(([key, value]) => (
                <div key={key} className="py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between">
                    <span className="font-medium">{key}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 