# Tier'd Deployment Instructions

This document provides detailed instructions for deploying the Tier'd application to Vercel using the included deployment script.

## Deployment Script

The repository includes a `deploy.sh` script that automates the deployment process. This script follows a checklist to ensure a full deployment of Tier'd that replicates the localhost environment exactly.

### Prerequisites

Before running the deployment script, ensure you have the following:

- Node.js and npm installed
- A Vercel account
- The Vercel CLI (will be installed by the script if not already available)
- Git installed

### Steps to Deploy

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd fresh_tier_d
   ```

2. **Run the Deployment Script**
   ```bash
   ./deploy.sh
   ```

3. **Follow the Interactive Prompts**
   The script will guide you through the deployment process with interactive prompts:
   - Verifying environment variables
   - Building the application
   - Testing locally (optional)
   - Deploying to Vercel
   - Verifying the deployment

## What the Script Does

The deployment script performs the following steps:

### 1. Install Required Dependencies
- Ensures all project dependencies are installed
- Installs the Vercel CLI globally if not already installed

### 2. Verify .env Configuration
- Checks if the `.env.local` file exists and contains the required variables
- Offers to create or update the `.env.local` file with recommended settings
- Allows you to choose between mock data or a real database (Supabase)

### 3. Build the Full Version of Tier'd Locally
- Runs a full production build
- Attempts to fix any build errors
- Offers to test the built version locally before deploying

### 4. Deploy Full Version to Vercel
- Links the project to Vercel (if not already linked)
- Deploys the project to Vercel production

### 5. Verify Deployment
- Retrieves the deployment URL
- Calculates deployment duration
- Offers to open the deployed site in a browser

## Deployment Configuration

### Environment Variables

The deployment uses the following environment variables:

```
# Set production environment
NODE_ENV=production

# Enable real-time functionality
ENABLE_REALTIME=true
ENABLE_ANALYTICS=true

# Database Configuration
MOCK_DB=true
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**Important:** To use a real database instead of mock data, edit the `.env.local` file and:
1. Set `MOCK_DB=false`
2. Update the Supabase URL and anon key with your actual credentials

### Vercel Configuration

The application includes a `vercel.json` file that configures:
- Build settings
- Environment variables
- Headers for security and caching
- Region deployment settings

## Post-Deployment

After deployment, you can access:

- **Main Application**: `https://[your-deployment-url]`
- **Products Page**: `https://[your-deployment-url]/products`
- **Admin Dashboard**: `https://[your-deployment-url]/admin`
  - Username: admin
  - Password: admin123 (or the value set in your .env.local)

## Troubleshooting

If you encounter issues during deployment:

1. **Build Errors**
   - Check the build logs for specific error messages
   - Ensure all dependencies are correctly installed
   - Verify that all environment variables are properly set

2. **Vercel Connection Issues**
   - Verify that you're logged into the correct Vercel account
   - Run `vercel logout` and then `vercel login` to reauthenticate

3. **Application Not Working as Expected**
   - Compare the deployed version with the local version
   - Check Vercel logs for runtime errors
   - Verify that environment variables are correctly set in Vercel

4. **Database Connection Issues**
   - If using Supabase, verify your connection credentials
   - Ensure database tables have the correct structure
   - Check network access rules in your Supabase project

## Updating the Deployment

To update an existing deployment:

1. Make your changes locally
2. Test thoroughly with `npm run dev`
3. Run the deployment script again: `./deploy.sh`
4. The script will build and deploy the updated version

## Conclusion

The deployment script provides a streamlined process for deploying the Tier'd application to Vercel. By following the interactive prompts, you can ensure that your deployment matches the localhost environment exactly. 