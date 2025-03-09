# Tier'd Application

A Next.js application for product ranking and reviews with real-time updates and analytics.

## Features

### Real-Time Capabilities
- **Real-Time Voting**: Users can upvote or downvote products and see updates in real-time
- **Real-Time Reviews**: Users can leave reviews and see new reviews from others immediately
- **Global Updates**: All users are notified of changes across the application instantly

### CMS Analytics Dashboard
- **Product Performance**: Track top-performing products by votes and score
- **Category Distribution**: Visualize product distribution across categories
- **Activity Trends**: Monitor voting, reviews, and viewing activity over time
- **Review Management**: View and manage user reviews easily

### Supabase Integration
- **Real-Time Database**: Built on Supabase's real-time capabilities
- **Mock Mode**: Functions seamlessly with or without a Supabase connection
- **Easy Configuration**: Simple environment variables to configure the backend

### Deployment-Ready
- **Vercel Optimized**: Configured for easy deployment on Vercel
- **Polyfill System**: Comprehensive polyfills for server-side rendering
- **Mock Data**: Includes mock data for development and testing

## Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn
- (Optional) Supabase account for real database functionality

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd tier-d-application
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```
# Create a .env.local file with the following:
MOCK_DB=true  # Set to false to use a real Supabase database
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result

## Deployment

### Deploy to Vercel

The easiest way to deploy this application is to use the Vercel platform:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project to Vercel
3. Set the environment variables
4. Deploy!

### Using the Deployment Script

For a more controlled deployment, use our deployment script:

```bash
# Run the deployment script
bash scripts/conflict-fix-deploy.sh
```

This script:
- Resolves routing conflicts
- Sets up all required polyfills
- Creates mock data
- Configures the application for real-time features
- Builds and deploys to Vercel

## Architecture

### Real-Time System

The real-time system is built on Supabase's real-time capabilities, with three main components:

1. **Supabase Client**: A wrapper around the Supabase client that handles real-time subscriptions
2. **React Hooks**: Custom hooks for real-time data that work with both Supabase and mock mode
3. **API Routes**: Enhanced API routes that broadcast changes to all connected clients

```
User Event → API Route → Database Update → Real-Time Broadcast → UI Update
```

### CMS Analytics Dashboard

The analytics dashboard provides insights into product performance, user activity, and review sentiment:

- Summary statistics on products, votes, and reviews
- Time-series charts of activity trends
- Bar charts of top-performing products
- Pie charts of category distribution
- Detailed review management

### Mock Mode

The application can run in mock mode, which simulates a database with in-memory data structures. This is useful for:

- Local development without a database
- Testing and debugging
- Demos and presentations
- Production deployments when database connectivity is not available

## API Endpoints

### Product Voting
- `GET /api/vote?productId=<id>&clientId=<id>` - Get vote status for a product
- `POST /api/vote` - Submit a vote for a product

### Product Reviews
- `GET /api/reviews?productId=<id>` - Get reviews for a product
- `POST /api/reviews` - Submit a new review
- `PUT /api/reviews` - Update an existing review
- `DELETE /api/reviews?reviewId=<id>` - Delete a review

### Analytics
- `GET /api/analytics?period=<period>&category=<category>` - Get analytics data

## License

This project is licensed under the MIT License - see the LICENSE file for details.