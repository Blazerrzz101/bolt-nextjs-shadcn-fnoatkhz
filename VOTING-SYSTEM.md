# Tier'd Voting System Architecture

## Overview

The voting system in Tier'd allows users to upvote or downvote products, with different permissions for authenticated and anonymous users. The implementation supports both a production version using Supabase and a development/testing version using mock data.

## Current Implementation

### Architecture

![Voting System Architecture](https://i.imgur.com/0XYcOld.png)

The voting system follows a modern architecture with these key components:

1. **Frontend Components**:
   - `VoteButtons` - UI component that displays upvote/downvote buttons and handles user interactions
   - `ProductCard` - Displays product information with vote counts
   - `ProductRankings` - Displays products ranked by their vote scores

2. **React Hooks**:
   - `useVote` - Core hook for vote management, including checking vote status and submitting votes
   - `useProduct` - Hook for fetching product details with vote information
   - `useProducts` - Hook for fetching multiple products, including vote counts and status

3. **API Routes**:
   - `/api/vote` - Main endpoint for checking vote status (GET) and submitting votes (POST)
   - `/api/vote/remaining-votes` - Endpoint for checking rate limits for anonymous users
   - `/api/products/product` - Product details endpoint that includes vote information
   - `/api/products` - Product listing endpoint with vote-based sorting

4. **Data Storage**:
   - Development: JSON files in `/data` directory
   - Production: Supabase tables with PostgreSQL functions

### Mock Implementation

The current mock implementation:

1. Stores votes in a JSON file at `/data/votes.json`
2. Tracks vote counts for each product
3. Maps user votes using a `clientId:productId` pattern
4. Records vote history for rate limiting and auditing
5. Calculates scores for product ranking

### Key Features

- **Vote Toggling**: Voting the same way twice removes the vote
- **Vote Changing**: Users can change from upvote to downvote and vice versa
- **Optimistic UI Updates**: Interface updates immediately, then confirms with server
- **Rate Limiting**: Anonymous users are limited to a configurable number of votes per day
- **Authenticated Unlimited Voting**: Signed-in users have unlimited voting capacity
- **Product Ranking**: Products are sorted by score (upvotes - downvotes)
- **Vote History**: Comprehensive vote history tracking for analytics

## Testing

The system includes a test page at `/test-vote` that demonstrates:
1. Viewing product vote status
2. Upvoting and downvoting
3. Vote toggling and changing
4. Remaining votes display

## Supabase Implementation

The production implementation uses Supabase with:

1. **Tables**:
   - `products` - Store product information
   - `votes` - Store individual votes
   
2. **Functions**:
   - `vote_for_product` - Handle vote logic including toggling
   - `get_vote_status` - Check user's current vote for a product
   - `fix_all_product_vote_counts` - Maintenance function to ensure vote counts match actual votes

3. **RLS Policies**:
   - Ensure users can only modify their own votes
   - Allow reading product information

## Development Roadmap

### Immediate Priorities

1. ✅ Working mock implementation for development/testing
2. ✅ Test page to verify all voting features
3. ✅ Vote toggling and changing functionality
4. ✅ Product ranking by vote score

### Short-term Goals

1. ✅ Optimistic UI updates with fallback
2. ✅ Rate limiting for anonymous users
3. ✅ Vote history recording
4. [ ] Analytics dashboard for vote metrics

### Long-term Goals

1. [ ] Enhanced vote analytics
2. [ ] Trending products algorithm based on vote velocity
3. [ ] User reputation system tied to voting
4. [ ] Vote-based recommendation engine

## Integration Points

### Auth System Integration

The voting system integrates with the auth system to:
1. Identify users for vote tracking
2. Apply different rate limits based on auth status
3. Display appropriate UI for different user types

### Product System Integration

The voting system integrates with the product system to:
1. Update product rankings based on votes
2. Display vote counts and status on product pages
3. Filter and sort products by vote score

## Configuration

The voting system is configurable through environment variables:

- `NEXT_PUBLIC_MAX_VOTES_PER_DAY` - Maximum votes per day for anonymous users (default: 10)
- `NEXT_PUBLIC_ENABLE_VOTES` - Feature flag to enable/disable voting functionality

## Future Considerations

1. **Weighted Voting**: Giving more voting power to trusted users
2. **Vote Categories**: Allowing users to vote on specific aspects of products
3. **Vote Comments**: Enabling users to leave a reason for their vote
4. **Timeline Views**: Showing how votes have changed over time
5. **Abuse Prevention**: More sophisticated measures to prevent vote manipulation

## Conclusion

The voting system is a central component of the Tier'd platform, enabling community-driven product rankings. Its dual implementation (mock for development and Supabase for production) provides flexibility while maintaining consistent functionality. 