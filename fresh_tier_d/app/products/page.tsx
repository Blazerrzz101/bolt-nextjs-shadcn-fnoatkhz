'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from '../../components/products/product-card';
import VoteButtons from '../../components/products/vote-buttons';

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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Load products on page load
  useEffect(() => {
    async function loadProducts() {
      try {
        // Add category filter if selected
        let url = '/api/products';
        if (selectedCategory) {
          url += `?category=${encodeURIComponent(selectedCategory)}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch products');
        }
        
        // Update products list
        setProducts(data.data || []);
        
        // Extract unique categories if no category is selected
        if (!selectedCategory) {
          const uniqueCategories = Array.from(
            new Set((data.data || []).map((p: Product) => p.category))
          ) as string[];
          
          setCategories(uniqueCategories);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Error loading products. Please try again.');
        setLoading(false);
      }
    }
    
    loadProducts();
  }, [selectedCategory]);
  
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    // This will trigger the useEffect to load products for the selected category
  };

  const handleVote = async (productId: number, currentVote: number | null, newVote: number) => {
    // Optimistically update the UI
    setProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.id !== productId) return product;
        
        let upvotes = product.upvotes;
        let downvotes = product.downvotes;
        
        // Remove previous vote if any
        if (currentVote === 1) upvotes--;
        if (currentVote === -1) downvotes--;
        
        // Add new vote
        if (newVote === 1) upvotes++;
        if (newVote === -1) downvotes++;
        
        // Recalculate score
        const score = upvotes - downvotes;
        
        return { ...product, upvotes, downvotes, score };
      })
    );
    
    // Send the vote to the API
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId, 
          voteType: newVote,
          clientId: 'client-' + Math.random().toString(36).substring(2, 15)
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to record vote');
      }
      
      // Voting was successful, no need to update UI again
    } catch (err) {
      console.error('Error recording vote:', err);
      // Revert the optimistic update on failure
      // This would reload the products instead
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    }
  };
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh'
      }}>
        <p>Loading products...</p>
      </div>
    );
  }
  
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        color: '#0f172a',
        textAlign: 'center'
      }}>
        Product Rankings
      </h1>
      
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '2rem'
        }}>
          {error}
        </div>
      )}
      
      {/* Category filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '2rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => handleCategorySelect(null)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: 'none',
            background: selectedCategory === null ? '#0ea5e9' : '#f1f5f9',
            color: selectedCategory === null ? 'white' : '#64748b',
            cursor: 'pointer',
            fontWeight: 'medium'
          }}
        >
          All Categories
        </button>
        
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleCategorySelect(category)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              background: selectedCategory === category ? '#0ea5e9' : '#f1f5f9',
              color: selectedCategory === category ? 'white' : '#64748b',
              cursor: 'pointer',
              fontWeight: 'medium'
            }}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Product Grid */}
      <div>
        {products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b',
            backgroundColor: '#f8fafc',
            borderRadius: '8px'
          }}>
            No products available{selectedCategory ? ` in ${selectedCategory}` : ''}
          </div>
        ) : (
          <div>
            {products.map(product => (
              <div 
                key={product.id}
                style={{
                  marginBottom: '2rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  category={product.category}
                  upvotes={product.upvotes}
                  downvotes={product.downvotes}
                  score={product.score}
                  imageUrl={product.imageUrl}
                />
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '0.5rem'
                }}>
                  <VoteButtons
                    productId={product.id}
                    initialUpvotes={product.upvotes}
                    initialDownvotes={product.downvotes}
                    initialVoteType={null} // This would be fetched from the API in a real app
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 