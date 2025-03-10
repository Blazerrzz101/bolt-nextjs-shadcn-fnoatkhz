'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  upvotes: number;
  downvotes: number;
  score: number;
  imageUrl: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [clientId] = useState(() => `client-${Math.random().toString(36).substr(2, 9)}`);
  const [votes, setVotes] = useState<Record<number, number | null>>({});

  const categories = ['All', 'Electronics', 'Furniture', 'Wearables', 'Lifestyle'];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.data || []);
        setIsLoading(false);
      } catch (err) {
        setError('Error loading products. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle voting
  const handleVote = async (productId: number, voteType: number) => {
    try {
      // Optimistic update
      const oldVote = votes[productId];
      
      // Update local state
      setVotes({
        ...votes,
        [productId]: voteType === oldVote ? null : voteType
      });
      
      // Update server
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          voteType,
          clientId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
      
      // After success, fetch updated products
      const productsResponse = await fetch('/api/products');
      if (productsResponse.ok) {
        const data = await productsResponse.json();
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  // Filter products by category
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Back to Home
        </Link>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(category => (
          <CategoryButton
            key={category}
            category={category}
            active={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          />
        ))}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            name={product.name}
            description={product.description}
            category={product.category}
            upvotes={product.upvotes}
            downvotes={product.downvotes}
            imageUrl={product.imageUrl}
            onUpvote={() => handleVote(product.id, 1)}
            onDownvote={() => handleVote(product.id, -1)}
            voteStatus={votes[product.id]}
          />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}

interface CategoryButtonProps {
  category: string;
  active: boolean;
  onClick: () => void;
}

function CategoryButton({ category, active, onClick }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
    >
      {category}
    </button>
  );
}

interface ProductCardProps {
  name: string;
  description: string;
  category: string;
  upvotes: number;
  downvotes: number;
  imageUrl: string;
  onUpvote: () => void;
  onDownvote: () => void;
  voteStatus: number | null;
}

function ProductCard({
  name,
  description,
  category,
  upvotes,
  downvotes,
  imageUrl,
  onUpvote,
  onDownvote,
  voteStatus
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      <div className="h-48 bg-gray-200 relative">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
        <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
          {category}
        </span>
      </div>
      
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{name}</h2>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onUpvote}
              className={`flex items-center space-x-1 ${
                voteStatus === 1 ? 'text-green-600 font-bold' : 'text-gray-500 hover:text-green-600'
              }`}
            >
              <span className="text-xl">👍</span>
              <span>{upvotes}</span>
            </button>
            
            <button 
              onClick={onDownvote}
              className={`flex items-center space-x-1 ${
                voteStatus === -1 ? 'text-red-600 font-bold' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <span className="text-xl">👎</span>
              <span>{downvotes}</span>
            </button>
          </div>
          
          <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
            Score: {upvotes - downvotes}
          </div>
        </div>
      </div>
    </div>
  );
} 