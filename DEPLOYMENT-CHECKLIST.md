# Tier'd Deployment Checklist

This checklist ensures that all necessary steps are completed before and after deploying the Tier'd application to production.

## Pre-Deployment Checks

### Code Quality

- [ ] Run linting: `npm run lint`
- [ ] Run type checking: `npx tsc --noEmit`
- [ ] Run pre-build checks: `npm run pre-build-check`
- [ ] Run tests: `npm test`
- [ ] Verify all tests pass

### Data Integrity

- [ ] Run vote count fixer: `npm run fix-votes:dry`
- [ ] If inconsistencies are found, run: `npm run fix-votes`
- [ ] Verify data files exist and are valid

### Build Verification

- [ ] Run local build: `npm run build`
- [ ] Verify build completes without errors
- [ ] Start production server locally: `npm run start:production`
- [ ] Run health check: `npm run health-check`
- [ ] Verify all health checks pass

### Feature Verification

- [ ] Test voting functionality on `/test-vote` page
- [ ] Verify vote toggling works correctly
- [ ] Verify rate limiting for anonymous users
- [ ] Test product ranking by vote score
- [ ] Verify authentication flow (if enabled)
- [ ] Test responsive design on mobile and desktop

## Deployment Process

### Vercel Deployment

1. Prepare for Vercel deployment:
   ```bash
   npm run prepare-for-vercel
   ```

2. Deploy to Vercel:
   ```bash
   # For preview deployment
   vercel
   
   # For production deployment
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `DEPLOY_ENV` (set to `production`)
   - `NEXT_PUBLIC_MAX_VOTES_PER_DAY` (default: 10)

### Alternative Deployment (Docker)

1. Build Docker image:
   ```bash
   docker build -t tierd-app .
   ```

2. Run Docker container:
   ```bash
   docker run -p 3000:3000 -e NEXT_PUBLIC_SITE_URL=your-url tierd-app
   ```

## Post-Deployment Verification

- [ ] Run health check against production: `npm run health-check:production`
- [ ] Verify all API endpoints are working
- [ ] Test voting functionality on production
- [ ] Verify static assets are loading correctly
- [ ] Check for any console errors in browser
- [ ] Verify analytics tracking (if enabled)

## Rollback Procedure

If issues are detected after deployment:

1. Identify the issue and determine if rollback is necessary
2. If rollback is needed, deploy the previous version:
   ```bash
   vercel --prod --name tierd-app --scope your-team
   ```
3. Verify the rollback resolves the issue
4. Document the issue for future reference

## Monitoring

- [ ] Set up monitoring for critical endpoints
- [ ] Configure alerts for server errors
- [ ] Monitor vote activity for unusual patterns
- [ ] Check server logs for any errors

## Documentation

- [ ] Update deployment documentation if process changes
- [ ] Document any issues encountered during deployment
- [ ] Update version number in documentation

## Security

- [ ] Verify security headers are properly set
- [ ] Check for any exposed sensitive information
- [ ] Verify rate limiting is working correctly
- [ ] Ensure proper error handling without leaking information

This checklist should be completed for each production deployment to ensure a smooth and reliable deployment process. 