# Tier'd

Tier'd is a modern product discovery and discussion platform built with Next.js, Supabase, and Tailwind CSS. It allows users to discover, discuss, and vote on tech products, creating a community-driven ranking system.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-green)](https://supabase.io/)

## Features

- 🔒 **Authentication**
  - Email/password and OAuth (GitHub, Google) sign-in
  - Password reset functionality
  - Profile management

- 🗳️ **Voting System**
  - Upvote/downvote products
  - Anonymous voting with client ID tracking
  - Vote toggling (click same button to remove vote)
  - Optimistic UI updates for better user experience
  - Real-time vote counts

- 💬 **Discussion System**
  - Thread creation and management
  - Product mentions with @ syntax
  - Real-time updates
  - Rich text formatting

- 🏷️ **Product Management**
  - Product categories and tags
  - Product rankings based on votes
  - Product search and filtering
  - SEO-friendly URLs

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark/light mode
  - Accessibility features
  - Loading states and animations

## Tech Stack

- **Frontend**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - Zustand for state management

- **Backend**
  - Supabase (PostgreSQL)
  - Row Level Security
  - Real-time subscriptions
  - Edge Functions

- **Infrastructure**
  - Vercel deployment
  - Supabase hosting
  - Image optimization
  - Edge caching

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Supabase account and CLI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tierd.git
   cd tierd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials and other required variables.

4. Run database migrations:
   ```bash
   supabase db reset
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the app running.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
tierd/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── ui/                # Shared UI components
│   ├── products/          # Product-related components
│   └── thread/            # Thread-related components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── public/               # Static assets
├── styles/              # Global styles
├── supabase/            # Supabase config
└── types/               # TypeScript types
```

## Development

### Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### Testing

We use Vitest and Testing Library for testing. Run tests with:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Process

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Deployment

The app is configured for deployment on Vercel with Supabase as the backend.

### Vercel Deployment

1. Push your changes to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy

### Database Migrations

Run migrations on your Supabase instance:

```bash
supabase db reset
```

## Documentation

- [API Documentation](docs/api.md)
- [Database Schema](docs/schema.md)
- [Component Library](docs/components.md)

## Support

- [Discord Community](https://discord.gg/tierd)
- [GitHub Issues](https://github.com/yourusername/tierd/issues)
- [Email Support](mailto:support@tierd.com)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Voting System

The application includes a standardized voting system that allows users to upvote or downvote products. The voting system supports:

- Anonymous voting with client ID tracking
- Vote toggling (voting the same way twice removes the vote)
- Vote changing (from upvote to downvote and vice versa)
- Score calculation (upvotes minus downvotes)
- Product ranking based on vote score

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

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)