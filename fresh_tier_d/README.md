# Tier'd - Product Ranking Platform

![Tier'd Logo](https://placehold.co/300x100/e0f2fe/0c4a6e?text=Tier%27d)

Tier'd is a modern web application that allows users to discover, vote on, and discuss products across multiple categories. Built with Next.js and featuring a clean, responsive design, Tier'd provides a powerful platform for community-driven product rankings.

## Tier'd: Product Ranking Platform

### 🚀 Live Demo

Visit the live application: [https://freshtier-qv1ft5zr7-jimmonty7-gmailcoms-projects.vercel.app](https://freshtier-qv1ft5zr7-jimmonty7-gmailcoms-projects.vercel.app)

### 🛠️ Key Features

- **Community-Driven Rankings**: Products are ranked based on user votes
- **Real-Time Voting System**: Instantly see vote counts update
- **Category Filtering**: Browse products by category
- **Admin Dashboard**: View analytics and manage product data
- **Responsive Design**: Works on all device sizes

### 👩‍💻 Tech Stack

- **Frontend**: Next.js (App Router), React
- **Deployment**: Vercel
- **Data Storage**: Mock data with in-memory storage (MOCK_DB=true)
- **Authentication**: Simple username/password for admin

### 🔧 Admin Access

For admin access, use:
- **URL**: [https://freshtier-qv1ft5zr7-jimmonty7-gmailcoms-projects.vercel.app/admin](https://freshtier-qv1ft5zr7-jimmonty7-gmailcoms-projects.vercel.app/admin)
- **Username**: admin
- **Password**: admin123

### 📝 Deployment Status

All features are fully functional in the current deployment:
- ✅ Home page with application overview
- ✅ Products listing with voting functionality
- ✅ Category filtering system
- ✅ Admin dashboard with analytics
- ✅ API endpoints for products and voting

### 🚀 Local Development

To run the application locally:

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with the following:
   ```
   MOCK_DB=true
   NODE_ENV=development
   ENABLE_REALTIME=true
   ENABLE_ANALYTICS=true
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### 📊 API Endpoints

- `GET /api/products` - Get all products or filter by category
- `GET /api/products?id={id}` - Get a specific product by ID
- `POST /api/vote` - Cast a vote for a product
- `GET /api/vote?productId={id}&clientId={clientId}` - Check vote status

### 🔄 Latest Updates

- **March 9, 2024**: Full application deployment with all features
- Added enhanced security headers
- Optimized for production performance
- Implemented complete admin dashboard

## Features

- **Product Rankings**: Browse products ranked by user votes
- **Real-time Voting**: Cast your vote on products and see results instantly
- **Category Filtering**: Filter products by category
- **Admin Dashboard**: Access analytics and insights on product performance
- **Responsive Design**: Works on desktop and mobile devices

## Demo Credentials

To access the admin dashboard, use the following credentials:

- **Username**: admin
- **Password**: admin123

## Deployment Tools

We've created deployment tools to make the process smooth and repeatable:

### Deployment Script

Run the automated deployment script to deploy Tier'd to Vercel:

```bash
./deploy.sh
```

This script:
- Installs all dependencies
- Verifies environment configuration
- Builds the application
- Offers to test locally before deploying
- Deploys to Vercel
- Verifies the deployment

### Deployment Verification

After deployment, you can verify if all components are working correctly:

```bash
./verify_deployment.sh
```

This script checks:
- Main application pages
- API endpoints
- Admin login functionality
- Admin dashboard access

For detailed instructions, see [DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md).

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/tierd.git
cd tierd
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## API Routes

### GET /api/products

Returns a list of all products sorted by vote score.

Example response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Premium Noise-Cancelling Headphones",
      "description": "Experience crystal-clear audio with our premium noise-cancelling technology.",
      "category": "Electronics",
      "upvotes": 127,
      "downvotes": 14,
      "score": 113,
      "imageUrl": "https://placehold.co/300x200/e4f2ff/003366?text=Headphones"
    },
    // More products...
  ]
}
```

### POST /api/vote

Cast a vote for a product.

Request body:
```json
{
  "productId": 1,
  "voteType": 1,  // 1 for upvote, -1 for downvote
  "clientId": "unique-client-identifier"
}
```

Example response:
```json
{
  "success": true,
  "data": {
    "message": "Vote recorded successfully",
    "voteType": 1
  }
}
```

### GET /api/vote

Check if a user has voted for a product.

Query parameters:
- `productId`: The ID of the product
- `clientId`: The unique identifier for the client

Example response:
```json
{
  "success": true,
  "data": {
    "hasVoted": true,
    "voteType": 1
  }
}
```

## Deployment

This application can be easily deployed to Vercel:

```bash
npm run build
# or
vercel --prod
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- This project was built with [Next.js](https://nextjs.org/)
- Placeholder images provided by [Placehold.co](https://placehold.co/) 