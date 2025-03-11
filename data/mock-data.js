/**
 * Mock Data for Supabase
 * 
 * This file contains mock data to be used when Supabase is in mock mode.
 * It provides a consistent data structure that mimics the actual database.
 */

module.exports = {
  products: [
    {
      id: '1',
      name: 'Premium Headphones',
      description: 'Noise cancelling headphones with amazing sound quality',
      url_slug: 'premium-headphones',
      category: 'audio',
      price: 299.99,
      image_url: '/images/products/headphones.png',
      specifications: {
        'Battery Life': '20 hours',
        'Connectivity': 'Bluetooth 5.0',
        'Weight': '250g'
      },
      rating: 4.5,
      review_count: 128,
      upvotes: 42,
      downvotes: 5,
      score: 37,
      rank: 1
    },
    {
      id: '2',
      name: 'Ultra Slim Laptop',
      description: 'Powerful and portable laptop for professionals',
      url_slug: 'ultra-slim-laptop',
      category: 'computers',
      price: 1299.99,
      image_url: '/images/products/laptop.png',
      specifications: {
        'Processor': 'Intel Core i7',
        'RAM': '16GB',
        'Storage': '512GB SSD',
        'Display': '14-inch 4K'
      },
      rating: 4.7,
      review_count: 95,
      upvotes: 38,
      downvotes: 3,
      score: 35,
      rank: 2
    },
    {
      id: '3',
      name: 'Smart Watch Pro',
      description: 'Advanced smartwatch with health monitoring',
      url_slug: 'smart-watch-pro',
      category: 'wearables',
      price: 349.99,
      image_url: '/images/products/smartwatch.png',
      specifications: {
        'Battery Life': '3 days',
        'Water Resistance': '50m',
        'Display': 'AMOLED',
        'Sensors': 'Heart Rate, Oxygen, Sleep'
      },
      rating: 4.3,
      review_count: 76,
      upvotes: 29,
      downvotes: 7,
      score: 22,
      rank: 3
    },
    {
      id: '4',
      name: 'Professional Camera',
      description: 'High-end DSLR camera for photography enthusiasts',
      url_slug: 'professional-camera',
      category: 'photography',
      price: 1999.99,
      image_url: '/images/products/camera.png',
      specifications: {
        'Sensor': 'Full-frame 45MP',
        'ISO Range': '100-51200',
        'Video': '8K 30fps',
        'Storage': 'Dual SD Card Slots'
      },
      rating: 4.8,
      review_count: 64,
      upvotes: 31,
      downvotes: 2,
      score: 29,
      rank: 4
    },
    {
      id: '5',
      name: 'Wireless Earbuds',
      description: 'Comfortable true wireless earbuds with excellent sound',
      url_slug: 'wireless-earbuds',
      category: 'audio',
      price: 129.99,
      image_url: '/images/products/earbuds.png',
      specifications: {
        'Battery Life': '6 hours + 18 with case',
        'Water Resistance': 'IPX4',
        'Connectivity': 'Bluetooth 5.2',
        'Noise Cancellation': 'Yes'
      },
      rating: 4.2,
      review_count: 112,
      upvotes: 35,
      downvotes: 9,
      score: 26,
      rank: 5
    }
  ],
  
  categories: [
    {
      id: '1',
      name: 'Audio',
      slug: 'audio',
      description: 'Headphones, earbuds, and speakers',
      image_url: '/images/categories/audio.png',
      product_count: 12
    },
    {
      id: '2',
      name: 'Computers',
      slug: 'computers',
      description: 'Laptops, desktops, and accessories',
      image_url: '/images/categories/computers.png',
      product_count: 15
    },
    {
      id: '3',
      name: 'Wearables',
      slug: 'wearables',
      description: 'Smartwatches and fitness trackers',
      image_url: '/images/categories/wearables.png',
      product_count: 8
    },
    {
      id: '4',
      name: 'Photography',
      slug: 'photography',
      description: 'Cameras, lenses, and accessories',
      image_url: '/images/categories/photography.png',
      product_count: 10
    }
  ],
  
  reviews: [
    {
      id: '1',
      product_id: '1',
      user_id: 'user-1',
      user_name: 'John Smith',
      rating: 5,
      title: 'Amazing sound quality',
      content: 'These headphones have incredible sound quality. The noise cancellation is top-notch and the comfort is excellent for long listening sessions.',
      created_at: '2023-05-15T10:30:00Z',
      upvotes: 12,
      downvotes: 1
    },
    {
      id: '2',
      product_id: '1',
      user_id: 'user-2',
      user_name: 'Sarah Johnson',
      rating: 4,
      title: 'Great but a bit heavy',
      content: 'Sound quality is fantastic but they get a bit uncomfortable after a few hours due to the weight. Battery life is excellent though!',
      created_at: '2023-06-02T14:15:00Z',
      upvotes: 8,
      downvotes: 2
    },
    {
      id: '3',
      product_id: '2',
      user_id: 'user-3',
      user_name: 'Michael Brown',
      rating: 5,
      title: 'Perfect for work and travel',
      content: 'This laptop is incredibly light yet powerful. I can easily work all day on a single charge and the screen is gorgeous.',
      created_at: '2023-04-29T09:45:00Z',
      upvotes: 15,
      downvotes: 0
    }
  ],
  
  users: [
    {
      id: 'user-1',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Smith',
      avatar_url: '/images/avatars/male-1.png',
      created_at: '2023-01-15T10:30:00Z'
    },
    {
      id: 'user-2',
      email: 'sarah@example.com',
      first_name: 'Sarah',
      last_name: 'Johnson',
      avatar_url: '/images/avatars/female-1.png',
      created_at: '2023-02-20T14:15:00Z'
    },
    {
      id: 'user-3',
      email: 'michael@example.com',
      first_name: 'Michael',
      last_name: 'Brown',
      avatar_url: '/images/avatars/male-2.png',
      created_at: '2023-03-05T09:45:00Z'
    }
  ],
  
  votes: {
    products: {
      '1': { upvotes: 42, downvotes: 5 },
      '2': { upvotes: 38, downvotes: 3 },
      '3': { upvotes: 29, downvotes: 7 },
      '4': { upvotes: 31, downvotes: 2 },
      '5': { upvotes: 35, downvotes: 9 }
    },
    reviews: {
      '1': { upvotes: 12, downvotes: 1 },
      '2': { upvotes: 8, downvotes: 2 },
      '3': { upvotes: 15, downvotes: 0 }
    }
  },
  
  userVotes: [
    { user_id: 'user-1', product_id: '1', vote_type: 1 },
    { user_id: 'user-1', product_id: '3', vote_type: -1 },
    { user_id: 'user-2', product_id: '2', vote_type: 1 },
    { user_id: 'user-3', product_id: '1', vote_type: 1 },
    { user_id: 'user-3', product_id: '4', vote_type: 1 }
  ]
}; 