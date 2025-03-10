// Mock product data
export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  upvotes: number;
  downvotes: number;
  score: number;
  imageUrl: string;
  createdAt: string;
}

// Mock vote data
export interface Vote {
  id: number;
  productId: number;
  clientId: string;
  voteType: number; // 1 for upvote, -1 for downvote
  createdAt: string;
}

// In-memory storage
let products: Product[] = [
  {
    id: 1,
    name: "Premium Noise-Cancelling Headphones",
    description: "Experience crystal-clear audio with our premium noise-cancelling technology.",
    category: "Electronics",
    upvotes: 127,
    downvotes: 14,
    score: 113,
    imageUrl: "https://placehold.co/300x200/e4f2ff/003366?text=Headphones",
    createdAt: "2023-01-15T12:00:00Z"
  },
  {
    id: 2,
    name: "Ergonomic Office Chair",
    description: "Work comfortably for hours with our ergonomic design and premium materials.",
    category: "Furniture",
    upvotes: 95,
    downvotes: 12,
    score: 83,
    imageUrl: "https://placehold.co/300x200/e2ffe4/003300?text=Chair",
    createdAt: "2023-02-20T15:30:00Z"
  },
  {
    id: 3,
    name: "Smart Home Security System",
    description: "Protect your home with our advanced AI-powered security system.",
    category: "Smart Home",
    upvotes: 84,
    downvotes: 9,
    score: 75,
    imageUrl: "https://placehold.co/300x200/fff0e6/6b0000?text=Security",
    createdAt: "2023-03-10T09:15:00Z"
  },
  {
    id: 4,
    name: "Ultra-Thin Laptop",
    description: "Powerful performance in an incredibly thin and lightweight design.",
    category: "Electronics",
    upvotes: 110,
    downvotes: 38,
    score: 72,
    imageUrl: "https://placehold.co/300x200/f0f0ff/00006b?text=Laptop",
    createdAt: "2023-02-05T14:20:00Z"
  },
  {
    id: 5,
    name: "Ceramic Non-Stick Cookware Set",
    description: "Premium cookware set with advanced non-stick ceramic coating.",
    category: "Kitchen",
    upvotes: 65,
    downvotes: 8,
    score: 57,
    imageUrl: "https://placehold.co/300x200/fff0f0/6b0000?text=Cookware",
    createdAt: "2023-04-18T10:45:00Z"
  }
];

let votes: Vote[] = [];

// Mock API functions
export const mockApi = {
  // Get all products
  getProducts: () => {
    return [...products].sort((a, b) => b.score - a.score);
  },
  
  // Get product by ID
  getProductById: (id: number) => {
    return products.find(p => p.id === id);
  },
  
  // Get products by category
  getProductsByCategory: (category: string) => {
    return products
      .filter(p => p.category === category)
      .sort((a, b) => b.score - a.score);
  },
  
  // Record a vote
  recordVote: (productId: number, voteType: number, clientId: string) => {
    // Find the product
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return { success: false, error: "Product not found" };
    }
    
    // Check if the client has already voted for this product
    const existingVoteIndex = votes.findIndex(
      v => v.productId === productId && v.clientId === clientId
    );
    
    // Get the product to update
    const product = { ...products[productIndex] };
    
    // Handle new vote
    if (existingVoteIndex === -1) {
      // Add new vote to votes array
      const newVote: Vote = {
        id: votes.length + 1,
        productId,
        clientId,
        voteType,
        createdAt: new Date().toISOString()
      };
      votes.push(newVote);
      
      // Update product counts
      if (voteType === 1) {
        product.upvotes += 1;
      } else {
        product.downvotes += 1;
      }
    } 
    // Handle changing or removing vote
    else {
      const existingVote = votes[existingVoteIndex];
      
      // If same vote type, remove the vote
      if (existingVote.voteType === voteType) {
        // Remove vote
        votes.splice(existingVoteIndex, 1);
        
        // Update product counts
        if (voteType === 1) {
          product.upvotes -= 1;
        } else {
          product.downvotes -= 1;
        }
      } 
      // If different vote type, change the vote
      else {
        // Update vote type
        votes[existingVoteIndex] = {
          ...existingVote,
          voteType
        };
        
        // Update product counts
        if (voteType === 1) {
          product.upvotes += 1;
          product.downvotes -= 1;
        } else {
          product.upvotes -= 1;
          product.downvotes += 1;
        }
      }
    }
    
    // Recalculate score
    product.score = product.upvotes - product.downvotes;
    
    // Update products array
    products[productIndex] = product;
    
    return { 
      success: true, 
      data: {
        voteType: existingVoteIndex !== -1 && votes[existingVoteIndex]?.voteType === voteType ? null : voteType
      }
    };
  },
  
  // Check vote status
  getVoteStatus: (productId: number, clientId: string) => {
    const vote = votes.find(
      v => v.productId === productId && v.clientId === clientId
    );
    
    return {
      success: true,
      data: {
        hasVoted: !!vote,
        voteType: vote?.voteType || null
      }
    };
  }
};

export default mockApi; 