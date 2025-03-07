# Tier'd - Product Ranking Application

Tier'd is a modern web application for ranking and reviewing products, featuring a robust voting system, user authentication, and real-time activity tracking.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-green)](https://supabase.io/)

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

### Dashboard
- **Product Analytics**: Visual representation of product rankings and vote distribution
- **Category Distribution**: Pie chart showing the distribution of products across categories
- **Activity Tracking**: Visualization of user activities by type
- **Top Product Showcase**: Highlighting the highest-ranked product
- **Real-time Stats**: Up-to-date statistics on products, votes, and user activities

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
# Add any other required environment variables
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Development Tools

### Voting System Testing

The application includes several tools to test and manage the voting system:

1. **Test Page**: Visit `/test-vote` in your browser to test the voting interface
2. **Vote API Test Script**: Run the test script to verify API functionality:
   ```bash
   ./scripts/test-vote.sh [product-id]
   ```
3. **Vote Count Fixer**: Fix inconsistencies in vote counts:
   ```bash
   # Dry run (no changes)
   npm run fix-votes:dry
   
   # Fix vote counts
   npm run fix-votes
   ```

### Documentation

Comprehensive documentation is available in several markdown files:

- **API Documentation**: See [API-DOCS.md](./API-DOCS.md) for API endpoint details
- **Voting System Architecture**: See [VOTING-SYSTEM.md](./VOTING-SYSTEM.md) for details on the voting implementation
- **Deployment Guide**: See [DEPLOY.md](./DEPLOY.md) for deployment instructions

## Deployment

This application uses Supabase for authentication, database, and storage, which requires server-side rendering (SSR) support for proper functionality.

### Recommended Deployment Method: Vercel

Vercel provides native support for Next.js applications with SSR and API routes, making it ideal for deploying this application.

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. Set up environment variables in your Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `NEXT_PUBLIC_SITE_URL`: The URL of your deployed site
   - `DEPLOY_ENV`: Set to `production`

5. For production deployment:
   ```bash
   vercel --prod
   ```

### Using the vercel.json Configuration

This repository includes a `vercel.json` file that configures:
- Build commands and output directory
- Security headers for better protection
- Caching policies for optimal performance
- Environment variable references
- Regional deployment settings

The configuration ensures optimal performance and security for your deployed application.

### Handling "self is not defined" Errors

If you encounter `ReferenceError: self is not defined` errors during build or deployment, check:

1. The application uses proper checks for browser-specific APIs:
   ```javascript
   const isBrowser = typeof window !== 'undefined';
   
   // Use this before accessing browser APIs
   if (isBrowser) {
     // Access window, document, localStorage, etc.
   }
   ```

2. The `next.config.js` file includes Webpack configuration to handle these cases:
   ```javascript
   webpack: (config, { isServer }) => {
     if (!isServer) {
       // Client-side specific configuration
     } else {
       // Server-side specific configuration
       config.plugins.push(
         new webpack.DefinePlugin({
           'global.self': '{}',
           'self': isServer ? '{}' : 'self',
           'window': isServer ? '{}' : 'window',
         })
       );
     }
     return config;
   }
   ```

3. Components that use browser APIs are properly guarded with checks.

### Important Note About Static Exports

Static exports (`next export`) are not compatible with this application due to Supabase's dependency on browser APIs. When attempting static exports, you may encounter `ReferenceError: self is not defined` errors during the build process.

For more advanced deployment options or troubleshooting, see our [DEPLOY.md](./DEPLOY.md) guide.

## Technical Details

### Tech Stack
- **Frontend**: Next.js 14 with App Router
- **UI Components**: shadcn/ui with Tailwind CSS
- **Authentication**: Custom authentication system (easily replaceable with Auth.js/NextAuth)
- **State Management**: React Context and Hooks
- **Data Storage**: JSON files (can be replaced with a database)

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

### Mock Implementation

For development and testing purposes, the application includes a mock implementation of the voting system that doesn't require a database connection. The mock implementation:

- Uses in-memory storage for votes and vote counts
- Simulates all voting functionality including toggling and changing votes
- Provides realistic vote counts and scores for testing
- Includes test products (p1-p5) for easy testing

To test the voting system, visit the `/test-vote` page in the application. This page allows you to:

- View the current vote status for test products
- Cast upvotes and downvotes
- See the effects of vote toggling and changing
- Check remaining votes for anonymous users

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
  "lastUpdated": "ISO date string",
  "userVotes": [
    {
      "productId": "product-id",
      "clientId": "client-id",
      "voteType": 1|-1,
      "timestamp": "ISO date string"
    }
  ]
}
```

### Voting API

The voting API is documented in detail in the [API-DOCS.md](./API-DOCS.md) file. Key endpoints:

- `GET /api/vote?productId={productId}&clientId={clientId}` - get vote status
- `POST /api/vote` - submit a vote
- `GET /api/vote/remaining-votes?clientId={clientId}` - check remaining votes

### Testing the Voting System

The repository includes a shell script `scripts/test-vote.sh` that tests the voting functionality:

```bash
# Run the test script
./scripts/test-vote.sh [product-id]
```

The script tests:
1. Fetching product details
2. Upvoting a product
3. Toggling an upvote (removing it)
4. Downvoting a product
5. Changing from downvote to upvote
6. Verifying the final product state

### Fixing Vote Count Inconsistencies

If vote counts become inconsistent (which can happen if the server is interrupted during a vote update), you can use the fix-votes script:

```bash
# Check for inconsistencies without making changes
npm run fix-votes:dry

# Fix inconsistencies
npm run fix-votes
```

The script:
1. Analyzes all votes in the system
2. Counts actual votes for each product
3. Compares with stored vote counts
4. Updates counts to match actual votes
5. Reports on all changes made

### Rate Limiting

Anonymous users are limited to a configurable number of votes per day (default: 10). This is managed through:

1. The `userVotes` array in the vote state, which tracks all votes with timestamps
2. The `/api/vote/remaining-votes` endpoint that calculates votes used in the current 24-hour period
3. The `VoteButtons` component, which displays remaining votes and blocks voting when the limit is reached

### Further Documentation

For a complete architectural overview of the voting system, see [VOTING-SYSTEM.md](./VOTING-SYSTEM.md).

## Recent Improvements and Fixes

### System Stability Enhancements

We've made several improvements to ensure the application runs reliably in both development and production environments:

1. **Fixed Static Asset Loading**: Resolved 404 errors for CSS and JavaScript files by properly configuring the Next.js build process with MiniCssExtractPlugin.

2. **Improved Error Handling**: Added comprehensive error handling throughout the application, particularly in API routes and React components.

3. **Data Integrity Checks**: Added automatic checks and repairs for data files to prevent corruption and ensure consistent state.

4. **Pre-build Validation**: Implemented a pre-build check script that verifies all necessary files and dependencies exist before building.

5. **Production-Ready Startup**: Created a production startup script that ensures all required data is available and valid before starting the server.

### Monitoring and Testing

1. **Health Check System**: Added a comprehensive health check system that tests all critical API endpoints and features.

2. **Vote System Testing**: Enhanced the vote testing script to verify all voting scenarios, including upvoting, downvoting, and vote toggling.

3. **Data Consistency Tools**: Improved the vote count fixer script to detect and repair inconsistencies in vote data.

### Development Tools

1. **Improved Scripts**: Added several npm scripts to streamline development and testing:
   - `npm run health-check`: Run a comprehensive health check
   - `npm run health-check:production`: Run health check against production
   - `npm run pre-build-check`: Verify all requirements before building
   - `npm run start:production`: Start the server with production checks

2. **Enhanced Documentation**: Updated documentation to reflect the latest changes and provide clear instructions for development and deployment.

### Voting System Improvements

1. **Optimized Vote Toggling**: Enhanced the vote toggling logic to properly handle all edge cases.

2. **Improved Client ID Management**: Better handling of client IDs for anonymous users.

3. **Enhanced Rate Limiting**: More reliable rate limiting for anonymous users.

4. **Vote Status Caching**: Improved caching of vote status to reduce API calls.

## Advanced Monitoring and Automation

The application now includes robust tools for monitoring system health, generating realistic user traffic, stress testing, and automating activities:

### System Monitor

The system monitor continuously checks all components of the application to ensure everything is working properly.

```bash
# Run the system monitor
npm run monitor

# Run with faster update interval (5 seconds)
npm run monitor:fast
```

Features:
- Real-time endpoint status checks
- Data file integrity verification
- Automated vote functionality testing
- Comprehensive error reporting

### Stress Testing

The stress testing tool simulates multiple users voting simultaneously to test system performance and stability.

```bash
# Run standard stress test (50 users, 10 votes each)
npm run stress-test

# Run light stress test (10 users, 5 votes each)
npm run stress-test:light

# Run heavy stress test (100 users, 20 votes each, 20 concurrent requests)
npm run stress-test:heavy
```

Features:
- Configurable user count and vote volume
- Concurrent request handling
- Detailed performance metrics
- Error pattern analysis

### Activity Bot

The activity bot simulates real user behavior by continuously performing various actions like browsing products, voting, checking notifications, etc.

```bash
# Run standard activity bot (5 bots)
npm run bot

# Run light activity bot (2 bots, slower activity)
npm run bot:light

# Run heavy activity bot (10 bots, rapid activity)
npm run bot:heavy

# Run time-limited bot (5 bots, runs for 5 minutes)
npm run bot:timed
```

Features:
- Realistic user behavior simulation
- Weighted activity distribution
- Detailed activity tracking
- Configurable bot count and timing

### All-In-One Startup

For the ultimate development experience, the all-in-one startup script launches the application, system monitor, and activity bot in separate terminals.

```bash
# Start everything
npm run start:all
```

Features:
- One-command setup
- Automatic server verification
- Browser auto-launch
- Detailed status reporting

### Usage Recommendations

Different combinations of these tools are useful for different scenarios:

1. **Development**: Use `npm run dev` for normal development or `npm run start:all` for a comprehensive development environment.

2. **Testing**: Use `npm run bot:light` to generate background traffic and `npm run health-check` to verify functionality.

3. **Stress Testing**: Use `npm run stress-test:light` to check for errors under light load or `npm run stress-test:heavy` for performance testing.

4. **Production Preparation**: Run `npm run pre-build-check` to verify everything is ready for production.

5. **Production**: Use `npm run start:production` for the most reliable production startup.