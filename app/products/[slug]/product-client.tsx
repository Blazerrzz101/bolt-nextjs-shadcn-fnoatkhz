"use client"

import { Product } from "@/types"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/database.types"
import { useQuery } from "@tanstack/react-query"
import { ProductDetailLayout } from "@/components/products/product-detail-layout"
import { ErrorBoundary } from "react-error-boundary"
import { ErrorFallback } from "@/components/error-fallback"
import { FC } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { products as localProducts, productImages } from "@/lib/data"
import { generateSlug } from "@/lib/utils"

function slugToName(url_slug: string): string {
  // Convert url_slug like "pulsar-x2" to "Pulsar X2"
  return url_slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface DatabaseThread {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  mentioned_products: string[];
  is_pinned: boolean;
  is_locked: boolean;
}

interface DatabaseUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface DatabaseReview {
  id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    console.log('Fetching product with slug:', slug)
    
    // Try to create Supabase client
    let supabase;
    try {
      supabase = createClient();
    } catch (err) {
      console.warn('Unable to create Supabase client, using mock data:', err);
      
      // Return mock data when in offline mode
      const product = localProducts.find(p => p.url_slug === slug || generateSlug(p.name) === slug);
      if (!product) return null;
      
      // Convert mock product to match Product type
      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price || 0,
        imageUrl: product.image_url || productImages[product.category.toLowerCase() as keyof typeof productImages] || '/images/fallback.png',
        category: product.category,
        upvotes: 0,
        downvotes: 0,
        rank: 0,
        userVote: null,
        specs: product.specifications || {},
        url_slug: product.url_slug
      };
    }
    
    // Get the basic product data
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('url_slug', slug)
      .single()

    if (productError) {
      console.error('Error fetching product:', productError)
      return null
    }

    if (!productData) {
      console.error('No product found with slug:', slug)
      return null
    }

    // Get rankings data
    const { data: rankingsData } = await supabase
      .from('product_rankings')
      .select('*')
      .eq('id', productData.id)
      .single()

    // Get reviews data
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productData.id)

    // Get threads data
    const { data: threadProductsData } = await supabase
      .from('thread_products')
      .select('thread_id, product_id')
      .eq('product_id', productData.id)

    // If we have thread products, get the actual threads
    let threadsData: Thread[] = []
    if (threadProductsData && threadProductsData.length > 0) {
      const threadIds = threadProductsData.map((tp: { thread_id: string }) => tp.thread_id)
      const { data: threads } = await supabase
        .from('threads')
        .select('*')
        .in('id', threadIds)
      threadsData = (threads || []) as Thread[]
    }

    // Transform the data into the expected format
    const product: Product = {
      id: productData.id,
      name: productData.name,
      description: productData.description || '',
      category: productData.category,
      price: productData.price || 0,
      imageUrl: productData.image_url || `/images/products/${productData.category.toLowerCase()}.png`,
      specs: productData.specifications as Record<string, string> || {},
      upvotes: rankingsData?.upvotes || 0,
      downvotes: rankingsData?.downvotes || 0,
      rank: 0,
      userVote: null,
      url_slug: productData.url_slug
    }

    console.log('Successfully fetched product:', product.name)
    return product
  } catch (error) {
    console.error('Error in fetchProduct:', error)
    return null
  }
}

function useProduct(url_slug: string) {
  return useQuery({
    queryKey: ['product', url_slug],
    queryFn: () => fetchProduct(url_slug),
    retry: 1,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  })
}

interface ProductContentProps {
  url_slug: string;
}

const ProductContent: FC<ProductContentProps> = ({ url_slug }) => {
  const { data: product, error, isLoading } = useProduct(url_slug)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto"></div>
          <p className="mt-4">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Error in ProductContent:', error)
    throw error
  }

  if (!product) {
    console.error('No product data available')
    throw new Error('Product not found. Please check the URL and try again.')
  }

  return <ProductDetailLayout product={product} />
}

interface ProductClientProps {
  url_slug: string;
}

export const ProductClient: FC<ProductClientProps> = ({ url_slug }) => {
  if (!url_slug) return null

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <ProductContent url_slug={url_slug} />
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default ProductClient 