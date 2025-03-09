"use client";

import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  upvotes: number;
  downvotes: number;
  score: number;
}

// Fallback product data if API fails
const fallbackProducts: Product[] = [
  {
    id: "prod_1",
    name: "Premium Ergonomic Chair",
    description: "Experience ultimate comfort with our premium ergonomic office chair, designed to support your back during long work hours.",
    price: 299.99,
    category: "office",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    upvotes: 15,
    downvotes: 3,
    score: 12
  },
  {
    id: "prod_2",
    name: "Smart Home Assistant Hub",
    description: "Control your entire home with our voice-activated smart hub. Compatible with all major smart home ecosystems.",
    price: 149.99,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7",
    upvotes: 22,
    downvotes: 5,
    score: 17
  },
  {
    id: "prod_3",
    name: "Wireless Noise-Cancelling Headphones",
    description: "Immerse yourself in your favorite music with our premium wireless headphones featuring active noise cancellation.",
    price: 199.99,
    category: "audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    upvotes: 18,
    downvotes: 2,
    score: 16
  },
  {
    id: "prod_4",
    name: "Ultralight Hiking Backpack",
    description: "A 45L hiking backpack that weighs less than 2 pounds, perfect for multi-day adventures in the backcountry.",
    price: 179.99,
    category: "outdoor",
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3",
    upvotes: 12,
    downvotes: 1,
    score: 11
  },
  {
    id: "prod_5",
    name: "Professional Chef's Knife Set",
    description: "A set of 5 essential kitchen knives crafted from high-carbon stainless steel, perfect for professional and home chefs alike.",
    price: 249.99,
    category: "kitchen",
    image: "https://images.unsplash.com/photo-1563861826100-c7f8049945e4",
    upvotes: 9,
    downvotes: 0,
    score: 9
  }
];

// Helper function to get or create client ID
function getClientId() {
  try {
    if (typeof window === 'undefined') return 'server';
    
    let clientId = localStorage.getItem('clientId');
    if (!clientId) {
      clientId = 'anonymous-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('clientId', clientId);
    }
    return clientId;
  } catch (err) {
    // Fallback if localStorage is not available
    return 'anonymous-' + Math.random().toString(36).substring(2, 15);
  }
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingProduct, setVotingProduct] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Try to fetch from the API
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data.data || []);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError('Failed to load products from API. Using fallback data.');
        setProducts(fallbackProducts);
        setIsUsingFallback(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleVote = async (productId: string, voteType: 1 | -1) => {
    try {
      setVotingProduct(productId);
      
      // Optimistically update UI
      setProducts(prev => {
        const newProducts = [...prev];
        const index = newProducts.findIndex(p => p.id === productId);
        
        if (index !== -1) {
          const product = { ...newProducts[index] };
          
          // Simple toggle behavior
          product.upvotes += voteType === 1 ? 1 : 0;
          product.downvotes += voteType === -1 ? 1 : 0;
          product.score = product.upvotes - product.downvotes;
          
          newProducts[index] = product;
          return newProducts.sort((a, b) => b.score - a.score);
        }
        
        return prev;
      });
      
      // Only try API if not using fallback
      if (!isUsingFallback) {
        try {
          const response = await fetch('/api/vote', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId,
              voteType,
              clientId: getClientId()
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to vote');
          }

          // Refresh products
          const productsResponse = await fetch('/api/products');
          if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            setProducts(productsData.data || []);
          }
        } catch (err) {
          console.error('Error with API vote:', err);
          setIsUsingFallback(true);
          // We already updated the UI optimistically, so no need to do anything more
        }
      }
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to vote. Please try again.');
    } finally {
      setVotingProduct(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-8">Tier'd</h1>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Tier'd</h1>
        <p className="text-gray-600">Community-ranked products</p>
        {isUsingFallback && (
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md max-w-md mx-auto text-sm">
            Using offline mode with demo data
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md max-w-md mx-auto text-sm">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </header>

      <main>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Top Products</h2>
          
          <div className="space-y-6">
            {products.map((product) => (
              <div 
                key={product.id}
                className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center space-y-1 min-w-16">
                    <button 
                      onClick={() => handleVote(product.id, 1)}
                      className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                      aria-label="Upvote"
                      disabled={votingProduct === product.id}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                    </button>
                    <span className="font-bold">{product.score}</span>
                    <button 
                      onClick={() => handleVote(product.id, -1)}
                      className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50" 
                      aria-label="Downvote"
                      disabled={votingProduct === product.id}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {product.category}
                      </span>
                      <span className="font-medium">${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <div className="text-center p-12 border rounded-lg shadow-sm bg-white">
                <p className="text-gray-500">No products found</p>
                <button 
                  onClick={() => setProducts(fallbackProducts)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Load Demo Products
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 py-8 text-center text-gray-500 border-t">
        <p>Tier'd - Community-driven product ranking</p>
      </footer>
    </div>
  );
} 