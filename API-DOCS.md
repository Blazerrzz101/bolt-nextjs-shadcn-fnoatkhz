# Tier'd API Documentation

This document provides detailed information about the Tier'd API endpoints, with a focus on the voting system. The API is RESTful and follows standard HTTP conventions.

## Base URL

- Development: `http://localhost:3000/api`
- Production: Depends on your deployment (e.g., `https://your-domain.com/api`)

## Authentication

Most endpoints can be accessed without authentication, but anonymous users have limited voting capabilities. For full functionality, include:

- For authenticated users: Authentication is handled via Supabase Auth and cookies.
- For anonymous users: A client ID should be provided (`clientId` parameter).

## Response Format

All API responses follow this standard format:

```json
{
  "success": true|false,
  "data": {...} | [...],
  "error": "Error message if success is false"
}
```

## Endpoints

### Voting API

#### Get Vote Status

Retrieves the current vote status for a product.

- **URL**: `/vote`
- **Method**: `GET`
- **Query Parameters**:
  - `productId` (required): The ID of the product to check
  - `clientId` (optional): Client identifier for anonymous users

**Response**:
```json
{
  "success": true,
  "productId": "product-id",
  "voteType": 1|-1|null,
  "hasVoted": true|false,
  "upvotes": 5,
  "downvotes": 2,
  "score": 3
}
```

**Example**:
```bash
curl -X GET "http://localhost:3000/api/vote?productId=p1&clientId=test-client"
```

#### Cast a Vote

Submits a vote for a product.

- **URL**: `/vote`
- **Method**: `POST`
- **Body**:
```json
{
  "productId": "product-id",
  "voteType": 1|-1|0,
  "clientId": "client-id"
}
```

- `voteType`: 1 for upvote, -1 for downvote, 0 to clear vote

**Response**:
```json
{
  "success": true,
  "productId": "product-id",
  "upvotes": 6,
  "downvotes": 2,
  "voteType": 1|-1|null,
  "score": 4,
  "remainingVotes": 10
}
```

**Example**:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"productId":"p1","voteType":1,"clientId":"test-client"}' "http://localhost:3000/api/vote"
```

#### Check Remaining Votes

Checks how many votes an anonymous user has remaining.

- **URL**: `/vote/remaining-votes`
- **Method**: `GET`
- **Query Parameters**:
  - `clientId` (optional): Client identifier for anonymous users

**Response**:
```json
{
  "success": true,
  "clientId": "client-id",
  "remainingVotes": 10,
  "maxVotesPerDay": 10,
  "votesUsedToday": 0
}
```

**Example**:
```bash
curl -X GET "http://localhost:3000/api/vote/remaining-votes?clientId=test-client"
```

### Products API

#### Get All Products

Retrieves a list of products, optionally filtered by category.

- **URL**: `/products`
- **Method**: `GET`
- **Query Parameters**:
  - `category` (optional): Filter by product category
  - `clientId` (optional): Client identifier for getting personalized vote status

**Response**:
```json
[
  {
    "id": "product-id",
    "name": "Product Name",
    "description": "Product description",
    "category": "Category name",
    "price": 99.99,
    "url_slug": "product-slug",
    "image_url": "/path/to/image.jpg",
    "specifications": { ... },
    "upvotes": 10,
    "downvotes": 3,
    "score": 7,
    "userVote": 1|-1|null,
    "rank": 1
  },
  ...
]
```

**Example**:
```bash
curl -X GET "http://localhost:3000/api/products?category=mice&clientId=test-client"
```

#### Get Product Details

Retrieves detailed information about a specific product.

- **URL**: `/products/product`
- **Method**: `GET`
- **Query Parameters**:
  - `id` (required if no slug): Product ID
  - `slug` (required if no id): Product URL slug
  - `clientId` (optional): Client identifier for getting personalized vote status

**Response**:
```json
{
  "success": true,
  "product": {
    "id": "product-id",
    "name": "Product Name",
    "description": "Product description",
    "category": "Category name",
    "price": 99.99,
    "url_slug": "product-slug",
    "image_url": "/path/to/image.jpg",
    "specifications": { ... },
    "upvotes": 10,
    "downvotes": 3,
    "score": 7,
    "userVote": 1|-1|null,
    "rank": 1,
    "reviews": [ ... ],
    "threads": [ ... ]
  }
}
```

**Example**:
```bash
curl -X GET "http://localhost:3000/api/products/product?id=p1&clientId=test-client"
```

### User Activities API

#### Get User Activities

Retrieves a list of activities for the current user.

- **URL**: `/activities`
- **Method**: `GET`
- **Query Parameters**:
  - `clientId` (optional): Client identifier for anonymous users

**Response**:
```json
{
  "success": true,
  "activities": [
    {
      "id": "activity-id",
      "type": "vote|comment|review",
      "action": "upvote|downvote|comment|review",
      "productId": "product-id",
      "productName": "Product Name",
      "timestamp": "2025-03-06T08:35:27.831Z",
      "details": "Optional details",
      "userId": "user-id"
    },
    ...
  ]
}
```

**Example**:
```bash
curl -X GET "http://localhost:3000/api/activities?clientId=test-client"
```

### Notifications API

#### Get User Notifications

Retrieves a list of notifications for the current user.

- **URL**: `/notifications`
- **Method**: `GET`
- **Query Parameters**:
  - `clientId` (optional): Client identifier for anonymous users

**Response**:
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notification-id",
      "userId": "user-id",
      "type": "system|vote|product",
      "title": "Notification Title",
      "message": "Notification message content",
      "read": false,
      "actionUrl": "/optional/action/url",
      "createdAt": "2025-03-06T08:35:27.831Z"
    },
    ...
  ]
}
```

**Example**:
```bash
curl -X GET "http://localhost:3000/api/notifications?clientId=test-client"
```

### System Status API

#### Get System Status

Retrieves the current system status, including version and feature flags.

- **URL**: `/system-status`
- **Method**: `GET`

**Response**:
```json
{
  "success": true,
  "version": "0.1.0",
  "features": {
    "votes": true,
    "reviews": true,
    "discussions": true
  },
  "uptime": 3600,
  "environment": "development|production"
}
```

**Example**:
```bash
curl -X GET "http://localhost:3000/api/system-status"
```

## Error Handling

When an error occurs, the API returns an appropriate HTTP status code along with an error message in the response body.

Common error codes:
- `400 Bad Request`: Invalid parameters or malformed request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

Example error response:
```json
{
  "success": false,
  "error": "Product not found"
}
```

## Rate Limiting

Anonymous users are limited to a configurable number of votes per day (default: 10).

If a rate limit is reached, the API returns a 429 status code with an error message.

## Client ID Generation

For anonymous users, a client ID should be generated and persisted in local storage. This ID is used to track votes and provide consistent user experience across sessions.

Example client ID generation:
```javascript
const getClientId = () => {
  if (typeof localStorage !== 'undefined') {
    const storedId = localStorage.getItem('clientId');
    if (storedId) return storedId;
    
    const newId = Math.random().toString(36).substring(2);
    localStorage.setItem('clientId', newId);
    return newId;
  }
  return 'server-side';
}
```

## Webhooks (Coming Soon)

The API will soon support webhooks for real-time updates on:
- New votes
- Vote count thresholds
- Product ranking changes

## Testing

A test page is available at `/test-vote` that demonstrates the voting functionality.

## Changelog

### v0.1.0 (Current)
- Initial API release
- Basic voting functionality
- Mock implementation for development

### v0.2.0 (Planned)
- Enhanced analytics
- Real-time updates via WebSockets
- Expanded notification options 