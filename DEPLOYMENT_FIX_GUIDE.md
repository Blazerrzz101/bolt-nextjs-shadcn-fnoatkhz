# Tier'd Deployment Fix Guide

This guide addresses the specific deployment issues identified in the Tier'd application and provides solutions for each problem.

## Summary of Issues and Fixes

| Issue | Description | Fix |
|-------|-------------|-----|
| PostCSS missing | The PostCSS package required for processing CSS is missing or incorrectly installed | `npm install postcss@8.4.31 --save --legacy-peer-deps` |
| optimizeFonts error | The `optimizeFonts` setting in next.config.js is causing issues | Remove this option from next.config.js |
| Missing components | Some components referenced in the code don't exist | Install or create placeholder components for shadcn/ui |
| @/components/ui/button missing | The Button component from shadcn/ui is missing | Create a basic button component |
| Deployment failure | General build and deployment failures | Clean install and rebuild |

## Fix Scripts

We've created several scripts to help fix these issues:

### 1. fix_critical_dependencies.sh

This script fixes the dependency issues:
- Installs PostCSS with the correct version
- Installs other critical dependencies (autoprefixer, framer-motion, sonner)
- Cleans up node_modules and package-lock.json
- Reinstalls dependencies with the correct flags
- Creates basic component directory structure

### 2. install_shadcn.js

This script creates basic shadcn/ui components:
- Creates a Button component
- Creates Card components
- Sets up the proper directory structure

### 3. apply_all_fixes.sh

The master script that applies all fixes:
- Runs fix_critical_dependencies.sh
- Updates next.config.js to remove optimizeFonts
- Runs install_shadcn.js
- Updates tsconfig.json to ensure paths are correct
- Attempts to build the application

## How to Apply the Fixes

Run the master script to apply all fixes at once:

```bash
chmod +x apply_all_fixes.sh
./apply_all_fixes.sh
```

Or apply them individually:

1. Fix dependencies:
   ```bash
   chmod +x fix_critical_dependencies.sh
   ./fix_critical_dependencies.sh
   ```

2. Update next.config.js:
   ```bash
   cp fixed_next_config.js fresh_tier_d/next.config.js
   ```

3. Install shadcn/ui components:
   ```bash
   node install_shadcn.js fresh_tier_d
   ```

## Vercel Deployment

After fixing the issues, you can deploy to Vercel:

```bash
cd fresh_tier_d
npx vercel --prod
```

Note: We're using `npx vercel` instead of the global Vercel CLI to avoid permission issues.

## Troubleshooting

If you still encounter issues after applying these fixes:

1. **Build Errors**:
   - Check the error messages in the build output
   - Look for any missing dependencies
   - Check for syntax errors in your components

2. **Deployment Errors**:
   - Ensure Vercel settings match your project requirements
   - Check that all environment variables are correctly set
   - Review the deployment logs for specific errors

3. **Runtime Errors**:
   - Check browser console for JavaScript errors
   - Ensure API endpoints are working correctly
   - Verify that all components render properly

## Important Notes

1. The fix scripts create basic placeholder components for shadcn/ui. These are simplified versions and may not have all the functionality of the original components.

2. If you need the full shadcn/ui library, consider installing it properly:
   ```bash
   npx shadcn-ui@latest init
   ```

3. The PostCSS version has been set to 8.4.31 to ensure compatibility with other dependencies. If you need a different version, update the scripts accordingly. 