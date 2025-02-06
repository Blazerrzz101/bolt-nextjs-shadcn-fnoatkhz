export type VoteType = "up" | "down" | null;

export interface ProductDetails {
  dpi?: string;
  buttons?: string;
  weight?: string;
  connection?: string;
  sensor?: string;
  battery_life?: string;
  rgb?: boolean;
  switches?: string;
  layout?: string;
  driver?: string;
  frequency?: string;
  resolution?: string;
  refresh_rate?: string;
  panel?: string;
  response_time?: string;
  [key: string]: string | boolean | undefined;
}

export interface ProductMetadata {
  manufacturer_url?: string;
  specs_url?: string;
  alternative_images?: string[];
  features?: string[];
  pros?: string[];
  cons?: string[];
  last_updated?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  details: ProductDetails;
  specs?: Record<string, string>;
  image_url: string;
  imageUrl?: string; // For UI compatibility
  created_at: string;
  ranking: number;
  rank: number; // For UI compatibility
  description: string;
  votes: number; // Total number of votes
  reviews: Review[];
  userVote: VoteType;
  slug: string; // URL-friendly identifier
  metadata?: ProductMetadata;
  last_scraped_at?: string;
  source_url?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
}

export interface ProductVote {
  id: string;
  product_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}
