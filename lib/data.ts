export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  votes: number;
  category: string;
  specs: Record<string, string>;
  userVote?: 'up' | 'down' | null;
  rank?: number;
  score?: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Pro Gaming Mouse",
    description: "High-precision gaming mouse with customizable RGB lighting",
    imageUrl: "/images/products/mouse.jpg",
    price: 79.99,
    votes: 1250,
    category: "Gaming Mice",
    specs: {
      "DPI Range": "100-25,600",
      "Buttons": "8 programmable",
      "Weight": "89g",
      "Connection": "Wireless/Wired"
    }
  },
  // Add more products as needed
]; 