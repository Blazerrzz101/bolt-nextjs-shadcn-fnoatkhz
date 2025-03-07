import { Product } from '@/types/product';

// Mock product data
export const mockProducts: Product[] = [
  {
    id: "j1k2l3m4-n5o6-p7q8-r9s0-t1u2v3w4x5y6",
    name: "ASUS ROG Swift PG279QM",
    description: "27-inch gaming monitor with 240Hz refresh rate and G-SYNC",
    category: "monitors",
    price: 849.99,
    url_slug: "asus-rog-swift-pg279qm",
    image_url: "/images/products/placeholder-monitor.svg",
    specifications: {
      "Screen Size": "27 inches",
      "Resolution": "2560 x 1440",
      "Refresh Rate": "240Hz",
      "Response Time": "1ms",
      "Panel Type": "IPS",
      "HDR": "HDR400",
      "G-SYNC": "Yes"
    },
    created_at: "2023-01-15T12:00:00Z",
    updated_at: "2023-06-20T15:30:00Z",
    rating: 4.8,
    review_count: 156,
    reviews: [],
    threads: [],
    upvotes: 5,
    downvotes: 2,
    rank: 1,
    score: 3
  },
  {
    id: "c8d9e0f1-2a3b-4c5d-6e7f-8g9h0i1j2k3l",
    name: "Razer DeathAdder V2",
    description: "Ergonomic gaming mouse with optical switches",
    category: "mice",
    price: 69.99,
    url_slug: "razer-deathadder-v2",
    image_url: "/images/products/placeholder-mouse.svg",
    specifications: {
      "Sensor": "Focus+ 20K DPI Optical",
      "Switches": "Optical",
      "Buttons": "8",
      "Connection": "Wired",
      "Weight": "82g"
    },
    created_at: "2023-03-05T14:30:00Z",
    updated_at: "2023-08-12T10:20:00Z",
    rating: 4.7,
    review_count: 189,
    reviews: [],
    threads: [],
    upvotes: 10,
    downvotes: 3,
    rank: 2,
    score: 7
  },
  {
    id: "9dd2bfe2-6eef-40de-ae12-c35ff1975914",
    name: "Logitech G502 HERO",
    description: "High-performance gaming mouse with HERO sensor",
    category: "mice",
    price: 79.99,
    url_slug: "logitech-g502-hero",
    image_url: "/images/products/placeholder-mouse.svg",
    specifications: {
      "Sensor": "HERO 25K",
      "Switches": "Mechanical",
      "Buttons": "11",
      "Connection": "Wired",
      "Weight": "121g (adjustable)"
    },
    created_at: "2023-02-10T09:15:00Z",
    updated_at: "2023-07-05T11:45:00Z",
    rating: 4.5,
    review_count: 256,
    reviews: [],
    threads: [],
    upvotes: 7,
    downvotes: 1,
    rank: 3,
    score: 6
  },
  {
    id: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
    name: "Logitech G Pro X Superlight",
    description: "Ultra-lightweight wireless gaming mouse for esports professionals",
    category: "mice",
    price: 149.99,
    url_slug: "logitech-g-pro-x-superlight",
    image_url: "/images/products/placeholder-mouse.svg",
    specifications: {
      "Sensor": "HERO 25K",
      "Switches": "Omron",
      "Buttons": "5",
      "Connection": "Wireless",
      "Weight": "63g"
    },
    created_at: "2023-04-12T08:45:00Z",
    updated_at: "2023-09-03T16:20:00Z",
    rating: 4.9,
    review_count: 320,
    reviews: [],
    threads: [],
    upvotes: 12,
    downvotes: 2,
    rank: 4,
    score: 10
  },
  {
    id: "q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6",
    name: "SteelSeries Apex Pro",
    description: "Mechanical gaming keyboard with adjustable actuation",
    category: "keyboards",
    price: 199.99,
    url_slug: "steelseries-apex-pro",
    image_url: "/images/products/placeholder-keyboard.svg",
    specifications: {
      "Switches": "OmniPoint Adjustable",
      "Backlight": "RGB Per-Key",
      "Layout": "Full-size",
      "Wrist Rest": "Magnetic",
      "Media Controls": "OLED Smart Display",
      "Connection": "Wired"
    },
    created_at: "2023-02-18T11:30:00Z",
    updated_at: "2023-08-25T09:15:00Z",
    rating: 4.6,
    review_count: 284,
    reviews: [],
    threads: [],
    upvotes: 8,
    downvotes: 4,
    rank: 5,
    score: 4
  }
];

// Mock vote data
export const mockVoteCounts: Record<string, { upvotes: number; downvotes: number }> = {
  'j1k2l3m4-n5o6-p7q8-r9s0-t1u2v3w4x5y6': { upvotes: 5, downvotes: 2 },
  'c8d9e0f1-2a3b-4c5d-6e7f-8g9h0i1j2k3l': { upvotes: 10, downvotes: 3 },
  '9dd2bfe2-6eef-40de-ae12-c35ff1975914': { upvotes: 7, downvotes: 1 },
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6': { upvotes: 12, downvotes: 2 },
  'q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6': { upvotes: 8, downvotes: 4 }
};

// Mock notifications data
export interface Notification {
  id: string;
  userId: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: null,
    type: "system",
    title: "Welcome to Tier'd",
    message: "Welcome to the Tier'd platform! Start exploring top gaming gear.",
    read: false,
    actionUrl: "/rankings",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: "notif-2",
    userId: null,
    type: "product",
    title: "New Product Added",
    message: "ASUS ROG Swift PG279QM has been added to monitors.",
    read: false,
    actionUrl: "/products/asus-rog-swift-pg279qm",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: "notif-3",
    userId: null,
    type: "vote",
    title: "Your Vote Counted",
    message: "Thank you for voting on Logitech G Pro X Superlight.",
    read: true,
    actionUrl: "/products/logitech-g-pro-x-superlight",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
  }
];

// Mock activities data
export interface Activity {
  id: string;
  type: "vote" | "comment" | "review";
  action: "upvote" | "downvote" | "comment" | "review";
  productId: string;
  productName: string;
  timestamp: string;
  details?: string;
  userId: string;
}

export const mockActivities: Activity[] = [
  {
    id: "act-1",
    type: "vote",
    action: "upvote",
    productId: "j1k2l3m4-n5o6-p7q8-r9s0-t1u2v3w4x5y6",
    productName: "ASUS ROG Swift PG279QM",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    userId: "anonymous"
  },
  {
    id: "act-2",
    type: "vote",
    action: "downvote",
    productId: "c8d9e0f1-2a3b-4c5d-6e7f-8g9h0i1j2k3l",
    productName: "Razer DeathAdder V2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    userId: "anonymous"
  },
  {
    id: "act-3",
    type: "comment",
    action: "comment",
    productId: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
    productName: "Logitech G Pro X Superlight",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    details: "This is the best mouse I've ever used!",
    userId: "anonymous"
  }
];

// Add mock products for test-vote page
export const testProducts: Record<string, Product> = {
  'p1': {
    id: 'p1',
    name: 'Test Product 1',
    description: 'This is a test product for voting',
    category: 'test',
    price: 99.99,
    url_slug: 'test-product-1',
    image_url: '/images/products/placeholder-product.svg',
    specifications: {
      'Test Spec': 'Test Value'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.5,
    review_count: 10,
    reviews: [],
    threads: [],
    upvotes: 5,
    downvotes: 2,
    rank: 1,
    score: 3
  },
  'p2': {
    id: 'p2',
    name: 'Test Product 2',
    description: 'This is another test product for voting',
    category: 'test',
    price: 149.99,
    url_slug: 'test-product-2',
    image_url: '/images/products/placeholder-product.svg',
    specifications: {
      'Test Spec': 'Test Value'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.2,
    review_count: 8,
    reviews: [],
    threads: [],
    upvotes: 3,
    downvotes: 1,
    rank: 2,
    score: 2
  },
  'p3': {
    id: 'p3',
    name: 'Test Product 3',
    description: 'A third test product for voting',
    category: 'test',
    price: 199.99,
    url_slug: 'test-product-3',
    image_url: '/images/products/placeholder-product.svg',
    specifications: {
      'Test Spec': 'Test Value'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4.0,
    review_count: 5,
    reviews: [],
    threads: [],
    upvotes: 2,
    downvotes: 2,
    rank: 3,
    score: 0
  },
  'p4': {
    id: 'p4',
    name: 'Test Product 4',
    description: 'A fourth test product for voting',
    category: 'test',
    price: 249.99,
    url_slug: 'test-product-4',
    image_url: '/images/products/placeholder-product.svg',
    specifications: {
      'Test Spec': 'Test Value'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 3.8,
    review_count: 3,
    reviews: [],
    threads: [],
    upvotes: 1,
    downvotes: 3,
    rank: 4,
    score: -2
  },
  'p5': {
    id: 'p5',
    name: 'Test Product 5',
    description: 'A fifth test product for voting',
    category: 'test',
    price: 299.99,
    url_slug: 'test-product-5',
    image_url: '/images/products/placeholder-product.svg',
    specifications: {
      'Test Spec': 'Test Value'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 3.5,
    review_count: 2,
    reviews: [],
    threads: [],
    upvotes: 0,
    downvotes: 0,
    rank: 5,
    score: 0
  }
};

// Initialize vote counts for test products
for (const productId in testProducts) {
  if (!mockVoteCounts[productId]) {
    mockVoteCounts[productId] = {
      upvotes: testProducts[productId].upvotes || 0,
      downvotes: testProducts[productId].downvotes || 0
    };
  }
}

// Helper functions to work with mock data

// Get a product by ID
export function getProductById(id: string): Product | undefined {
  // Check test products first
  if (testProducts[id]) {
    return testProducts[id];
  }
  // Then check regular products
  return mockProducts.find(product => product.id === id);
}

// Get a product by slug
export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find(product => product.url_slug === slug);
}

// Get products by category
export function getProductsByCategory(category: string): Product[] {
  return category === 'all' 
    ? mockProducts 
    : mockProducts.filter(product => product.category === category);
}

// Get products sorted by votes
export function getProductsSortedByVotes(): Product[] {
  return [...mockProducts].sort((a, b) => {
    // First sort by score (upvotes - downvotes)
    const scoreA = a.score !== undefined ? a.score : (a.upvotes || 0) - (a.downvotes || 0);
    const scoreB = b.score !== undefined ? b.score : (b.upvotes || 0) - (b.downvotes || 0);
    
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    
    // If scores are equal, sort by total votes
    const totalVotesA = (a.upvotes || 0) + (a.downvotes || 0);
    const totalVotesB = (b.upvotes || 0) + (b.downvotes || 0);
    
    if (totalVotesB !== totalVotesA) {
      return totalVotesB - totalVotesA;
    }
    
    // Finally sort by name
    return a.name.localeCompare(b.name);
  });
}

// Get vote counts for a product
export function getVoteCounts(productId: string): { upvotes: number; downvotes: number } {
  return mockVoteCounts[productId] || { upvotes: 0, downvotes: 0 };
}

// Set vote counts for a product
export function setVoteCounts(
  productId: string, 
  counts: { upvotes: number; downvotes: number }
): void {
  mockVoteCounts[productId] = counts;
}

// Get activities for a user
export function getActivitiesForUser(userId: string): Activity[] {
  return mockActivities.filter(activity => activity.userId === userId);
}

// Add a new activity
export function addActivity(activity: Activity): void {
  mockActivities.unshift(activity);
} 