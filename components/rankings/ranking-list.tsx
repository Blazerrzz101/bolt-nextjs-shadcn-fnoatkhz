"use client"

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/products/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '@/types/product';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

const isBrowser = typeof window !== 'undefined';

interface RankingListProps {
  selectedCategory: string;
  searchQuery: string;
}

export function RankingList({ selectedCategory, searchQuery }: RankingListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const origin = isBrowser ? window.location.origin : 'http://localhost:3000';
      const url = new URL('/api/products', origin);
      
      if (selectedCategory && selectedCategory !== 'all') {
        url.searchParams.append('category', selectedCategory);
      }
      
      if (debouncedSearch) {
        url.searchParams.append('search', debouncedSearch);
      }

      console.log('Fetching products from:', url.toString());
      
      // Add a cache-busting parameter to avoid stale data
      url.searchParams.append('t', Date.now().toString());
      
      const response = await fetch(url.toString(), {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      // The API now returns an array directly, not wrapped in an object
      const data = await response.json();
      
      // Log for debugging
      console.log(`Received ${Array.isArray(data) ? data.length : 0} products`);
      
      // Ensure we handle the array response
      if (!Array.isArray(data)) {
        console.error('API did not return an array:', data);
        setProducts([]);
        setError('Invalid data format received from server');
        toast({
          title: "Data Error",
          description: "The server returned an unexpected data format. Please try again.",
          variant: "destructive",
        });
      } else {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to load products. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, debouncedSearch]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[300px] w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Error Loading Products</h3>
        <p className="text-gray-500 mb-6 max-w-md">{error}</p>
        <Button 
          onClick={fetchProducts}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-xl font-bold mb-2">No Products Found</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          {debouncedSearch 
            ? `No products matching "${debouncedSearch}" in ${selectedCategory === 'all' ? 'any category' : `the ${selectedCategory} category`}`
            : `No products found in ${selectedCategory === 'all' ? 'any category' : `the ${selectedCategory} category`}`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}