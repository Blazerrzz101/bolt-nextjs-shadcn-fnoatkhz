# Tier'd - Minimal Version

A streamlined version of the Tier'd application focusing on the core product ranking and voting functionality.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Ftierd-minimal&env=NEXT_PUBLIC_ENABLE_VOTES,NEXT_PUBLIC_ENABLE_REVIEWS,NEXT_PUBLIC_ENABLE_DISCUSSIONS,NEXT_PUBLIC_MAX_VOTES_PER_DAY&envDescription=Configure%20feature%20flags%20for%20your%20deployment&envDefault=true,true,true,10&project-name=tierd-app&repository-name=tierd-app)

## Features

- Product listings with upvote/downvote functionality
- Product sorting by vote score
- Rate limiting for votes
- Responsive design
- Offline fallback mode

## Local Development

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/tierd-minimal.git
cd tierd-minimal
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment Options

### 1. Direct Deployment to Vercel

The easiest way to deploy is to click the "Deploy with Vercel" button above.

### 2. GitHub Integration

For a more robust deployment workflow:

1. Push your code to GitHub
2. Run the deployment helper script:
   ```bash
   ./deploy-vercel.sh
   ```
3. Follow the prompts to connect your GitHub repository to Vercel

### 3. Manual Deployment

If you prefer a manual approach:

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy using the CLI:
   ```bash
   vercel
   ```

## Environment Variables

The following environment variables can be configured:

- `NEXT_PUBLIC_ENABLE_VOTES` (default: true) - Enable voting functionality
- `NEXT_PUBLIC_ENABLE_REVIEWS` (default: true) - Enable reviews (for future use)
- `NEXT_PUBLIC_ENABLE_DISCUSSIONS` (default: true) - Enable discussions (for future use)
- `NEXT_PUBLIC_MAX_VOTES_PER_DAY` (default: 10) - Maximum votes per day per user

## Offline Mode

The application includes a fallback offline mode that uses demo data when the API is unavailable. This ensures that users can still interact with the application even if there are network issues. 