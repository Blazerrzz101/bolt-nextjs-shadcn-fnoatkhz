# Deployment Guide

This document provides detailed instructions for deploying the Tier'd application to various hosting platforms, with a focus on Vercel as the recommended option.

## Deploying to Vercel

### Prerequisites
- A Vercel account
- A GitHub account (for GitHub integration)
- A Supabase project set up with the necessary tables and schemas

### Deployment Steps

#### Option 1: Deploy from GitHub
1. Push your code to a GitHub repository
2. Log in to your Vercel account
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `NEXT_PUBLIC_SITE_URL`: The URL of your deployed site
   - `DEPLOY_ENV`: Set to `production`
7. Click "Deploy"

#### Option 2: Deploy with Vercel CLI
1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to your project directory:
   ```bash
   cd path/to/your/project
   ```

4. Deploy to Vercel:
   ```bash
   vercel
   ```

5. Follow the CLI prompts to configure your project
6. For production deployment:
   ```bash
   vercel --prod
   ```

### Configuring Vercel

#### Environment Variables
Set up the following environment variables in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL`: The URL of your deployed site
- `DEPLOY_ENV`: Set to `production`

#### Custom Domains
1. Go to your Vercel project settings
2. Click on "Domains"
3. Add your custom domain and follow the verification steps

#### Deployment Protection
For additional security, consider enabling:
- Password protection for preview deployments
- Branch protection rules in your GitHub repository

## Troubleshooting Common Issues

### "self is not defined" Error

This error occurs when the application tries to access browser APIs during server-side rendering or static builds.

#### Solution:
1. Ensure all components using browser APIs have proper checks:
   ```javascript
   const isBrowser = typeof window !== 'undefined';
   if (isBrowser) {
     // Access browser APIs here
   }
   ```

2. Verify that your `next.config.js` has the proper Webpack configuration:
   ```javascript
   webpack: (config, { isServer }) => {
     if (isServer) {
       config.plugins.push(
         new webpack.DefinePlugin({
           'global.self': '{}',
           'self': '{}',
           'window': '{}'
         })
       );
     }
     return config;
   }
   ```

3. Check files that commonly use browser APIs:
   - Authentication hooks
   - Local storage utilities
   - Components with DOM manipulation

### Build Failures

If your builds are failing, check:

1. Dependency issues:
   ```bash
   # Clean install dependencies
   rm -rf node_modules
   npm install
   ```

2. TypeScript errors:
   ```bash
   # Run TypeScript compiler
   npx tsc --noEmit
   ```

3. ESLint errors:
   ```bash
   # Run ESLint
   npx eslint . --ext .js,.jsx,.ts,.tsx
   ```

4. Ensure your Node.js version matches the one specified in `package.json` or `.nvmrc`

### API Routes Not Working

If your API routes aren't working properly:

1. Check CORS configuration in your API routes
2. Verify environment variables are correctly set
3. Ensure your Supabase connection is working
4. Check for serverless function timeouts or memory limits

## Alternative Deployment Options

### AWS Amplify

1. Create an AWS account
2. Install the AWS Amplify CLI
3. Configure Amplify:
   ```bash
   amplify configure
   ```
4. Initialize Amplify in your project:
   ```bash
   amplify init
   ```
5. Add hosting:
   ```bash
   amplify add hosting
   ```
6. Deploy:
   ```bash
   amplify publish
   ```

### Netlify

1. Create a Netlify account
2. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
3. Login:
   ```bash
   netlify login
   ```
4. Initialize your site:
   ```bash
   netlify init
   ```
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Set up Netlify Functions for API routes
7. Deploy:
   ```bash
   netlify deploy --prod
   ```

### Docker Deployment

For more control, you can containerize the application:

1. Create a Dockerfile:
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm install

   COPY . .
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. Build the Docker image:
   ```bash
   docker build -t tierd-app .
   ```

3. Run the container:
   ```bash
   docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=your-url -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key tierd-app
   ```

4. Deploy to services like:
   - AWS ECS
   - Google Cloud Run
   - Azure Container Instances

## Continuous Integration/Continuous Deployment

### GitHub Actions

Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Post-Deployment Tasks

1. **Verify Environment Variables**: Ensure all environment variables are correctly set in the production environment.

2. **Run Smoke Tests**: Check critical application paths:
   - Authentication flow
   - Product listing and detail pages
   - Voting functionality
   - User profile features

3. **Set Up Monitoring**:
   - Configure error tracking with Sentry or similar tools
   - Set up performance monitoring
   - Implement health check endpoints

4. **Configure Backup Strategy**:
   - Set up regular backups of Supabase data
   - Implement disaster recovery procedures

5. **Performance Optimization**:
   - Analyze and optimize Core Web Vitals
   - Configure CDN caching rules
   - Set up image optimization

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.io/docs/guides/production-checklist)
- [Web Vitals Monitoring](https://web.dev/vitals-measurement-getting-started/) 