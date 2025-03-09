# Tier'd Application Deployment Guide

This document provides step-by-step instructions for deploying the Tier'd application to Vercel, with special consideration for resolving the "self is not defined" error that can occur when deploying applications using Supabase.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have the following:

- Node.js 18.x or later installed
- Vercel CLI installed (optional, can use `npx vercel` instead)
- Git access to the repository
- Access to Supabase project (if integrating with a real database)

## 🛠️ Deployment Options

We provide several deployment scripts to suit different needs:

1. **Polyfilled Deployment (Recommended)**: 
   ```bash
   ./scripts/deploy-polyfilled.sh
   ```
   This script includes all necessary polyfills to resolve the "self is not defined" error.

2. **Global Deployment**:
   ```bash
   ./scripts/global-deploy.sh
   ```
   For deploying globally with additional optimizations.

3. **Minimal Deployment**:
   ```bash
   cd minimal-app && ./deploy.sh
   ```
   Deploys only the minimal version of the application.

## 🚀 Step-by-Step Deployment Process

### Option 1: One-Click Polyfilled Deployment (Recommended)

This approach uses our comprehensive script to handle all the necessary fixes and deployments:

1. **Run the polyfilled deployment script**:
   ```bash
   ./scripts/deploy-polyfilled.sh
   ```

2. **Follow the prompts** to complete the deployment.

3. **Verify the deployment** by visiting the provided Vercel URL.

### Option 2: Manual Deployment with Polyfills

If you prefer to understand each step or troubleshoot specific issues:

1. **Update API routes with polyfills**:
   ```bash
   node scripts/update-api-routes.js
   node scripts/fix-api-routes.js
   ```

2. **Verify polyfill setup**:
   ```bash
   node scripts/verify-vercel-build.js
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel deploy --prod
   ```
   or with npx:
   ```bash
   npx vercel deploy --prod
   ```

## 🔍 How the Polyfill Solution Works

Our solution addresses the "self is not defined" error through several components:

1. **Global Polyfills** (`lib/polyfills.js`): Ensures `self`, `window`, and other browser globals are defined in Node.js environments.

2. **Supabase Safe Client** (`lib/supabase-safe-client.js`): A wrapper around the Supabase client that handles initialization safely in all environments.

3. **API Wrapper** (`lib/api-wrapper.js`): Provides utilities for API routes to ensure they work in both server and client environments.

4. **Vercel Entry Point** (`scripts/vercel-entry.js`): Sets up polyfills at the start of the Vercel build process.

5. **Build Script** (`scripts/build-for-vercel.js`): Custom build script for Vercel that handles environment configuration.

## 🔧 Configuration Files

The deployment process updates/creates several important configuration files:

- **vercel.json**: Configures the Vercel deployment with proper build commands and environment variables.
- **.env.local**: Sets the necessary environment variables for production.
- **next.config.mjs**: Configures Next.js with optimizations and polyfills.

## ⚠️ Troubleshooting Common Issues

### "self is not defined" Error

If this error persists after deployment:

1. Ensure all API routes use the `withPolyfills` wrapper:
   ```javascript
   export const GET = withPolyfills(
     withStaticBuildHandler(async (request) => {
       // Your code
     })
   );
   ```

2. Verify that `scripts/vercel-entry.js` is being properly loaded in the build process.

3. Check that the polyfills in `lib/polyfills.js` are being imported in your API routes.

### Missing API Endpoints After Deployment

If your API endpoints are not accessible after deployment:

1. Verify that the API routes are properly exported with the `export const` syntax.

2. Check that the environment variable `MOCK_DB=true` is set.

3. Run a healthcheck on your deployed application:
   ```bash
   npm run health-check:production
   ```

### Authentication Issues

If authentication is not working properly:

1. Verify that the Supabase URL and Anon Key are correctly set in your environment variables.

2. Ensure that the Supabase client is being initialized using the safe client:
   ```javascript
   import { getServerClient } from '@/lib/supabase-safe-client';
   ```

## 📈 Post-Deployment Verification

After deploying, run these checks to verify everything is working:

1. **Health Check**:
   ```bash
   npm run health-check:production YOUR_VERCEL_URL
   ```

2. **Manual Testing**:
   - Test product browsing
   - Test voting functionality
   - Test user authentication (if enabled)
   - Test all API endpoints

## 🔄 Continuous Deployment

For continuous deployment:

1. Connect your GitHub repository to Vercel.

2. Configure the build command in Vercel to:
   ```
   npm run build:vercel
   ```

3. Add the required environment variables in the Vercel project settings.

## 📝 Deployment Status Tracking

Track the deployment status in the `PROJECT-STATUS.md` file, which includes:

- Current deployment status
- Features that are ready
- Pending features
- Known issues

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)

---

This deployment guide was last updated on: August 7, 2023 