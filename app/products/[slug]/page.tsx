'use client';

import { ProductView } from '@/components/products/product-view';
import { MainLayout } from '@/components/home/main-layout';
import { useEffect, useState } from 'react';
import { fetchProductBySlug } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import { toast } from 'sonner';

type Product = Database['public']['Tables']['products']['Row'] & {
  product_rankings?: Database['public']['Views']['product_rankings']['Row'][];
};

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await fetchProductBySlug(params.slug);
        setProduct(data);
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-4xl py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-4xl py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Product not found</h2>
            <p className="text-muted-foreground mt-2">
              The product you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8">
        <ProductView productId={product.id} />
      </div>
    </MainLayout>
  );
} 