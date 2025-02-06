export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          avatar_url: string | null
          is_online: boolean
          is_public: boolean
          created_at: string
          last_seen: string
        }
        Insert: {
          id: string
          username: string
          email: string
          avatar_url?: string | null
          is_online?: boolean
          is_public?: boolean
          created_at?: string
          last_seen?: string
        }
        Update: {
          username?: string
          email?: string
          avatar_url?: string | null
          is_online?: boolean
          is_public?: boolean
          last_seen?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          category: string | null
          details: Json | null
          image_url: string | null
          created_at: string
          slug: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number | null
          category?: string | null
          details?: Json | null
          image_url?: string | null
          created_at?: string
          slug: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number | null
          category?: string | null
          details?: Json | null
          image_url?: string | null
          created_at?: string
          slug?: string
          metadata?: Json | null
        }
      }
      product_votes: {
        Row: {
          id: string
          product_id: string
          user_id: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          vote_type: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          vote_type?: 'up' | 'down'
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string
          content: string
          helpful_count: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title: string
          content: string
          helpful_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          title?: string
          content?: string
          helpful_count?: number
          created_at?: string
        }
      }
      threads: {
        Row: {
          id: string
          content: string
          user_id: string
          mentioned_products: string[]
          upvotes: number
          downvotes: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          content: string
          user_id: string
          mentioned_products?: string[]
          upvotes?: number
          downvotes?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          mentioned_products?: string[]
          upvotes?: number
          downvotes?: number
          comment_count?: number
          updated_at?: string
        }
      }
      thread_products: {
        Row: {
          id: string
          thread_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          thread_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          thread_id?: string
          product_id?: string
          created_at?: string
        }
      }
      thread_votes: {
        Row: {
          id: string
          thread_id: string
          user_id: string
          vote_type: 'upvote' | 'downvote'
          created_at: string
        }
        Insert: {
          thread_id: string
          user_id: string
          vote_type: 'upvote' | 'downvote'
          created_at?: string
        }
        Update: {
          vote_type?: 'upvote' | 'downvote'
          created_at?: string
        }
      }
      thread_comments: {
        Row: {
          id: string
          thread_id: string
          user_id: string
          content: string
          parent_comment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          thread_id: string
          user_id: string
          content: string
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          updated_at?: string
        }
      }
    }
    Views: {
      product_rankings: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          price: number | null
          category: string | null
          slug: string
          upvotes: number
          downvotes: number
          rating: number
          review_count: number
          net_score: number
          category_rank: number
          overall_rank: number
        }
      }
    }
    Functions: {
      refresh_product_rankings: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}