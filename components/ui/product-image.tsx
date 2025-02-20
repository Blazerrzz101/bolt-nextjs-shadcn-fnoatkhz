"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { getPlaceholderImage } from "@/lib/constants"
import { ImageIcon } from "lucide-react"

interface ProductImageProps {
  src?: string | null
  alt: string
  category?: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  priority?: boolean
  className?: string
  containerClassName?: string
  showPlaceholderIcon?: boolean
}

export function ProductImage({
  src,
  alt,
  category,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  className,
  containerClassName,
  showPlaceholderIcon = true,
}: ProductImageProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  
  const placeholderImage = getPlaceholderImage(category)
  const imageSource = error || !src ? placeholderImage : src
  
  return (
    <div className={cn(
      "relative bg-muted overflow-hidden",
      !fill && "flex items-center justify-center",
      containerClassName
    )}>
      {/* Main Image */}
      <Image
        src={imageSource}
        alt={alt}
        width={!fill ? (width || 300) : undefined}
        height={!fill ? (height || 300) : undefined}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-cover transition-all duration-300",
          !loaded && "scale-110 blur-sm",
          loaded && "scale-100 blur-0",
          className
        )}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
      />
      
      {/* Loading/Error State */}
      {(!loaded || error) && showPlaceholderIcon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="h-1/4 w-1/4 text-muted-foreground/50" />
        </div>
      )}
    </div>
  )
} 