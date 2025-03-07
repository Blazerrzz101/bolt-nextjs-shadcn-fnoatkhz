"use client"

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Product = {
  id: string;
  name: string;
  description: string;
  slug?: string;
  url_slug?: string;
  price: number;
  image_url: string;
  category: string;
  upvotes: number;
  downvotes: number;
  rank?: number;
  score?: number;
  severity?: string;
  specifications?: Record<string, any>;
  rating?: number;
  review_count?: number;
  reviews?: any[];
  threads?: any[];
  userVote?: number | null;
  created_at?: string;
  updated_at?: string;
};

export interface Review {
  id: string;
  content: string;
  title: string;
  rating: number;
  pros: string[];
  cons: string[];
  created_at: string;
  user: UserProfile;
}

export interface Thread {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  username: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export type VoteType = 1 | -1 | null;

export interface ProductWithVotes extends Product {
  ranking_score: number;
}

export const ProductCategories = {
  MICE: "Gaming Mice",
  KEYBOARDS: "Gaming Keyboards",
  MONITORS: "Gaming Monitors",
  HEADSETS: "Gaming Headsets",
  CHAIRS: "Gaming Chairs"
} as const;

export type ProductCategory = keyof typeof ProductCategories