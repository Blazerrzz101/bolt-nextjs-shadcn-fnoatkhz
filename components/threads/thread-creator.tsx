'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ProductQuickView } from './product-quick-view'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

interface MentionedProduct {
  id: string
  name: string
  image_url: string
  category: string
  average_rating: number
}

export function ThreadCreator() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [content, setContent] = useState('')
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null)
  const [showProductQuickView, setShowProductQuickView] = useState(false)
  const [mentionedProducts, setMentionedProducts] = useState<MentionedProduct[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)

    // Check for @ symbol
    if (newContent.endsWith('@')) {
      const rect = e.target.getBoundingClientRect()
      const position = getCaretCoordinates(e.target)
      setMentionPosition({
        top: rect.top + position.top - 220, // Adjusted for better positioning
        left: rect.left + position.left
      })
      setShowProductQuickView(true)
    } else if (!newContent.includes('@')) {
      setShowProductQuickView(false)
    }
  }

  const handleProductSelect = (product: MentionedProduct) => {
    const currentContent = content
    const newContent = currentContent.replace(/@$/, `@${product.name} `)
    setContent(newContent)
    setShowProductQuickView(false)
    setMentionedProducts([...mentionedProducts, product])
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to create a thread')
      return
    }

    if (!content.trim()) {
      toast.error('Please enter some content for your thread')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: thread, error: threadError } = await supabase
        .from('threads')
        .insert([
          {
            content,
            user_id: user.id,
            mentioned_products: mentionedProducts.map(p => p.id)
          }
        ])
        .select()
        .single()

      if (threadError) throw threadError

      // Create thread-product relationships
      if (mentionedProducts.length > 0) {
        const { error: relationError } = await supabase
          .from('thread_products')
          .insert(
            mentionedProducts.map(product => ({
              thread_id: thread.id,
              product_id: product.id
            }))
          )

        if (relationError) throw relationError
      }

      toast.success('Thread created successfully')
      setContent('')
      setMentionedProducts([])
      setIsExpanded(false)
    } catch (error) {
      console.error('Error creating thread:', error)
      toast.error('Failed to create thread. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFocus = () => {
    setIsExpanded(true)
  }

  // Helper function to get caret coordinates
  const getCaretCoordinates = (element: HTMLTextAreaElement) => {
    const position = element.selectionEnd || 0
    const div = document.createElement('div')
    const styles = getComputedStyle(element)
    const properties = [
      'fontFamily',
      'fontSize',
      'fontWeight',
      'wordWrap',
      'whiteSpace',
      'padding'
    ]

    properties.forEach((prop) => {
      div.style[prop as any] = styles[prop]
    })

    div.textContent = element.value.substring(0, position)
    div.style.visibility = 'hidden'
    div.style.position = 'absolute'
    div.style.whiteSpace = 'pre-wrap'

    document.body.appendChild(div)
    const coordinates = {
      top: div.offsetHeight,
      left: div.offsetWidth
    }
    document.body.removeChild(div)

    return coordinates
  }

  return (
    <Card className={`w-full transition-all duration-300 ${isExpanded ? 'p-4' : 'p-2'}`}>
      <div className="relative">
        <Textarea
          ref={inputRef}
          placeholder="Ask anything... Use @ to mention products"
          value={content}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className={`resize-none transition-all duration-300 ${
            isExpanded ? 'h-32' : 'h-12'
          } focus:ring-2 focus:ring-primary bg-background/50`}
        />
        {showProductQuickView && mentionPosition && (
          <div
            style={{
              position: 'absolute',
              top: mentionPosition.top,
              left: mentionPosition.left,
              zIndex: 50
            }}
          >
            <ProductQuickView onSelect={handleProductSelect} />
          </div>
        )}
        {mentionedProducts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {mentionedProducts.map((product) => (
              <div
                key={product.id}
                className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>@{product.name}</span>
              </div>
            ))}
          </div>
        )}
        {isExpanded && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {user ? 'Posting as ' + user.email : 'Sign in to post'}
            </p>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !user}
              className="relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isSubmitting ? 'Posting...' : 'Post Thread'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
} 