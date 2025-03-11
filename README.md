# Tier'd - Product Ranking Application

Tier'd is a modern web application for ranking and reviewing products, featuring a robust voting system, user authentication, real-time updates, and activity tracking.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-green)](https://supabase.io/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-black)](https://vercel.com/)

## Features

### Authentication System
- **User Authentication**: Complete authentication flow with sign-up, sign-in, and sign-out functionality
- **Profile Management**: Users can update profile information and upload profile pictures
- **Activity Tracking**: Real-time display of user activities, including votes, comments, and profile updates
- **Anonymous Mode**: Support for anonymous browsing with limited voting privileges

### Voting System
- **Unlimited Voting for Authenticated Users**: Authenticated users can vote without limits
- **Rate Limiting for Anonymous Users**: Anonymous users are limited to 5 votes per 24-hour period
- **Vote Toggling**: Users can toggle their votes (clicking the same vote button again removes the vote)
- **Vote Changing**: Users can change their vote from upvote to downvote and vice versa
- **Optimistic UI Updates**: Immediate visual feedback with server-side validation
- **Real-Time Vote Updates**: See votes from other users in real-time with animated UI feedback

### Profile Page
- **Enhanced Profile UI**: Modern profile page with cover image, profile picture, and activity feed
- **Real-Time Activity Feed**: Chronological display of user activities with detailed timestamps
- **Filter Options**: Filter activities by type (votes, comments, reviews, profile updates)
- **Settings Management**: User preferences and profile information management
- **Visual Enhancements**: Particles background, hover effects, and responsive design

### Product Details Page
- **Rich Product Information**: Comprehensive product details with specifications, ratings, and reviews
- **Interactive Gallery**: Product image gallery with zoom functionality
- **User Feedback Aggregation**: Summary of pros and cons extracted from user reviews
- **Rating Distribution**: Visual breakdown of user ratings
- **Related Products**: Suggestions for similar products based on category and features
- **Discussion Threads**: Community discussions about products

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

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Add any other required environment variables
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Deployment on Vercel

### Automatic Deployment

The easiest way to deploy the application is directly from GitHub to Vercel:

1. Fork this repository to your GitHub account
2. Create a new project on [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Vercel will automatically detect the Next.js project and configure the build settings
5. Add the required environment variables in the Vercel project settings
6. Deploy the project

### Manual Deployment

You can also deploy the application manually using the Vercel CLI:

1. Install the Vercel CLI:
```bash
npm install -g vercel
```

2. Login to your Vercel account:
```bash
vercel login
```

3. Deploy the application:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Environment Variables for Deployment

Make sure to set the following environment variables in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_VERCEL_URL`: Set automatically by Vercel
- `NEXT_PUBLIC_VERCEL_ENV`: Set to "production" for production deployments

## Technical Details

### Tech Stack
- **Frontend**: Next.js 14 with App Router
- **UI Components**: shadcn/ui with Tailwind CSS
- **Authentication**: Custom authentication system (easily replaceable with Auth.js/NextAuth)
- **State Management**: React Context and Hooks
- **Data Storage**: JSON files (can be replaced with a database)
- **Real-Time Updates**: Custom event system with Supabase Realtime

### Architecture

#### Authentication Flow
1. User signs up or logs in
2. Authentication state is managed in the `EnhancedAuthProvider`
3. User information, including remaining votes for anonymous users, is provided throughout the application

#### Voting System
1. VoteButtons component displays the current vote status
2. Clicking a vote button triggers the `handleVote` function
3. Optimistic UI updates are applied immediately
4. API request is sent to `/api/vote` endpoint
5. Server validates the vote and updates the vote counts
6. Response updates the UI or reverts changes if an error occurs
7. Real-time updates are broadcast to other users via custom events

#### Real-Time Updates
1. The `useRealtimeUpdates` hook subscribes to database changes
2. When a vote is cast, a custom event is dispatched
3. Components listening for these events update their UI accordingly
4. Toast notifications inform users of new votes and reviews
5. Vote counts are animated to provide visual feedback

#### Profile Page
1. User activities are fetched from the server
2. Activities are grouped by date for easy navigation
3. Real-time updates are supported via polling or WebSockets

## API Routes

### Authentication
- **POST /api/auth/sign-up**: Create a new user account
- **POST /api/auth/sign-in**: Sign in with existing credentials
- **POST /api/auth/sign-out**: Sign out the current user

### Voting
- **GET /api/vote/remaining-votes**: Get remaining votes for the current user
- **GET /api/vote**: Get vote status for a specific product
- **POST /api/vote**: Cast or update a vote for a product

### User Activities
- **GET /api/activities**: Get all activities for the current user

### Products
- **GET /api/products**: Get a list of products with optional filtering
- **GET /api/products/product**: Get detailed information about a specific product

## Testing Real-Time Vote Updates

The application includes a test page to verify real-time vote updates:

1. Navigate to `/test-vote` in your browser
2. Use the vote buttons to cast votes
3. Use the simulation controls to trigger vote updates from other users
4. Observe the real-time updates in the UI and toast notifications

This test page demonstrates:
- Real-time vote count updates
- Animated UI feedback
- Toast notifications for vote events
- Different types of vote actions (upvote, downvote, change, remove)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Voting System

The application includes a standardized voting system that allows users to upvote or downvote products. The voting system supports:

- Anonymous voting with client ID tracking
- Vote toggling (voting the same way twice removes the vote)
- Vote changing (from upvote to downvote and vice versa)
- Score calculation (upvotes minus downvotes)
- Product ranking based on vote score
- Real-time updates for votes from other users

### Vote Storage

Votes are stored in a JSON file at `data/votes.json` with the following structure:

```json
{
  "votes": {
    "productId:clientId": voteType
  },
  "voteCounts": {
    "productId": {
      "upvotes": number,
      "downvotes": number
    }
  },
  "lastUpdated": "ISO date string"
}
```

### Voting API

The voting API is accessible via the standardized product endpoint:

- `POST /api/products/product` - to submit a vote with body:
  ```json
  {
    "productId": "product-id",
    "voteType": 1 or -1,
    "clientId": "unique-client-id"
  }
  ```

- `GET /api/products/product?id={productId}&clientId={clientId}` - to fetch product details with vote status

### Testing the Voting System

The repository includes a PowerShell script `test-vote.ps1` that tests the voting functionality:

```bash
# Run the test script
powershell -ExecutionPolicy Bypass -File test-vote.ps1
```

The script tests:
1. Fetching product details
2. Upvoting a product
3. Toggling an upvote (removing it)
4. Downvoting a product
5. Changing from downvote to upvote
6. Verifying the final product state

### Fixing Vote Count Inconsistencies

If vote counts become inconsistent (which can happen if the server is interrupted during a vote update), you can use the `fix-votes.js` script to recalculate and fix the counts:

```bash
# Check what would be fixed without making changes
node fix-votes.js --dry-run

# Fix the vote counts
node fix-votes.js
```

The script recalculates vote counts based on the actual votes in the `votes` object and updates the `voteCounts` object accordingly.

## Performance Optimizations

The application includes several performance optimizations:

- **Image Optimization**: Automatic image optimization via Next.js Image component
- **Code Splitting**: Automatic code splitting for smaller bundle sizes
- **Caching**: Aggressive caching for static assets and API responses
- **Lazy Loading**: Components and images are loaded only when needed
- **Optimistic UI**: Updates are shown immediately before server confirmation
- **Prefetching**: Critical resources are prefetched for faster navigation

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)
- [Sonner](https://sonner.emilkowal.ski/) for toast notifications