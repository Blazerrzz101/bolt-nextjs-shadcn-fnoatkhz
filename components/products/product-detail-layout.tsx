"use client"

import { Product } from "@/types"
import { formatRanking } from "@/lib/utils/product-ranking"
import Image from "next/image"
import Link from "next/link"
import { ProductVote } from './product-vote'

interface Props {
  product: Product
}

export function ProductDetailLayout({ product }: Props) {
  // Ensure all required fields have default values
  const {
    name = '',
    brand = '',
    description = '',
    price = 0,
    rating = 0,
    details = {},
    image_url = '',
    metadata = {},
    ranking = 0,
    reviews = []
  } = product || {}

  if (!product) {
    return <div>No product data available</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8">
      {/* Left column with image and voting */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg">
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <ProductVote productId={product.id} className="mt-4" />
      </div>

      {/* Right column with product details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-lg text-gray-600">{brand}</p>
        </div>

        <div className="space-y-2">
          <p className="text-2xl font-bold">${typeof price === 'number' ? price.toFixed(2) : '0.00'}</p>
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500">★</span>
            <span>{typeof rating === 'number' ? rating.toFixed(1) : '0.0'}</span>
            <span className="text-gray-400">|</span>
            <span>Rank: {formatRanking(ranking)}</span>
          </div>
        </div>

        <div className="prose max-w-none">
          <h2>Description</h2>
          <p>{description}</p>
        </div>

        {/* Technical Details */}
        {Object.keys(details).length > 0 && (
          <div className="prose max-w-none">
            <h2>Details</h2>
            <ul>
              {Object.entries(details).map(([key, value]) => (
                <li key={key}>
                  <strong>{key.replace('_', ' ')}:</strong> {value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        {metadata?.features && metadata.features.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Key Features</h2>
            <ul className="list-disc list-inside space-y-2">
              {metadata.features.map((feature, i) => (
                <li key={i} className="text-gray-600">{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {/* External Links */}
        {(metadata?.manufacturer_url || metadata?.specs_url) && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Additional Information</h2>
            <div className="space-y-2">
              {metadata.manufacturer_url && (
                <Link 
                  href={metadata.manufacturer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block"
                >
                  Manufacturer Website
                </Link>
              )}
              {metadata.specs_url && (
                <Link 
                  href={metadata.specs_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block"
                >
                  Technical Specifications
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Reviews Summary */}
        {reviews.length > 0 && (
          <div className="prose max-w-none">
            <h2>Reviews</h2>
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    <span>{typeof review.rating === 'number' ? review.rating.toFixed(1) : '0.0'}</span>
                    <span className="text-gray-500">•</span>
                    <span className="font-semibold">{review.title}</span>
                  </div>
                  <p className="mt-2">{review.content}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {reviews.length > 3 && (
                <button className="text-blue-600 hover:underline">
                  View all {reviews.length} reviews
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}