'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('score');
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query string
      let url = '/api/products';
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        // Check for vote status for each product
        const productsWithVoteStatus = await Promise.all(
          result.data.map(async (product) => {
            // Get client ID from localStorage if it exists
            const clientId = localStorage.getItem('clientId');
            if (!clientId) return product;
            
            try {
              const voteResponse = await fetch(`/api/vote?productId=${product.id}&clientId=${clientId}`);
              const voteResult = await voteResponse.json();
              
              if (voteResult.success) {
                return {
                  ...product,
                  voteType: voteResult.data.voteType
                };
              }
              return product;
            } catch (error) {
              console.error(`Error fetching vote status for product ${product.id}:`, error);
              return product;
            }
          })
        );
        
        setProducts(productsWithVoteStatus);
      } else {
        setError(result.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Generate client ID if not exists
    if (!localStorage.getItem('clientId')) {
      const clientId = 'anon-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('clientId', clientId);
    }
    
    fetchProducts();
  }, [category, sort]);
  
  const categories = ['', 'electronics', 'clothing', 'home'];
  const sortOptions = [
    { value: 'score', label: 'Score' },
    { value: 'price', label: 'Price' },
    { value: 'name', label: 'Name' }
  ];
  
  if (loading) {
    return <div className="text-center p-4">Loading products...</div>;
  }
  
  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Product Rankings</h1>
      
      <div className="flex flex-col md:flex-row md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.slice(1).map((cat) => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        <div className="md:ml-auto">
          <button
            onClick={() => fetchProducts()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center p-4 bg-gray-100 rounded">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
