# Deployment Guide

This document provides detailed deployment instructions for the Benny and Blue RSVP Web App.

## Prerequisites

- [ ] Neon PostgreSQL database created and configured
- [ ] Vercel account connected to GitHub
- [ ] GitHub repository forked or cloned
- [ ] All environment variables ready

## Quick Deployment Checklist

### 1. Database Setup (5 minutes)

1. **Create Neon Database**
   ```bash
   # Visit https://neon.tech and create a new project
   # Copy connection strings from the dashboard
   ```

2. **Set Local Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Neon database URLs
   ```

3. **Initialize Database**
   ```bash
   npm run db:init
   npm run db:test
   ```

### 2. Vercel Deployment (10 minutes)

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub repository

2. **Configure Environment Variables**
   In Vercel project settings, add these variables:

   **Required Database Variables:**
   ```
   POSTGRES_URL=postgresql://username:password@hostname:port/database?sslmode=require
   POSTGRES_PRISMA_URL=postgresql://username:password@hostname:port/database?sslmode=require&pgbouncer=true&connect_timeout=15
   POSTGRES_URL_NON_POOLING=postgresql://username:password@hostname:port/database?sslmode=require
   ```

   **Required Auth Variables:**
   ```
   NEXTAUTH_SECRET=your-32-character-secret-key-here
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

   **Application Settings:**
   ```
   APP_URL=https://your-app.vercel.app
   WEDDING_DATE=2024-06-15
   RSVP_DEADLINE=2024-05-15
   ```

3. **Deploy**
   ```bash
   # Push to main branch triggers automatic deployment
   git push origin main
   ```

### 3. Post-Deployment Verification (5 minutes)

1. **Test Application**
   - [ ] Visit your deployment URL
   - [ ] Check home page loads
   - [ ] Test RSVP form functionality
   - [ ] Verify database connectivity

2. **Monitor Deployment**
   - [ ] Check Vercel deployment logs
   - [ ] Verify no build errors
   - [ ] Test all API endpoints

## Environment Variables Reference

### Production Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `POSTGRES_URL` | Main database connection | `postgresql://user:pass@host:port/db?sslmode=require` | ✅ |
| `POSTGRES_PRISMA_URL` | Pooled connection for ORM | `postgresql://user:pass@host:port/db?sslmode=require&pgbouncer=true` | ✅ |
| `POSTGRES_URL_NON_POOLING` | Direct connection | `postgresql://user:pass@host:port/db?sslmode=require` | ✅ |
| `NEXTAUTH_SECRET` | Auth encryption key | `your-secret-key-32-chars-minimum` | ✅ |
| `NEXTAUTH_URL` | Production domain | `https://your-app.vercel.app` | ✅ |
| `APP_URL` | Application base URL | `https://your-app.vercel.app` | ✅ |
| `WEDDING_DATE` | Wedding date | `2024-06-15` | ✅ |
| `RSVP_DEADLINE` | RSVP deadline | `2024-05-15` | ✅ |
| `NODE_ENV` | Environment mode | `production` | Auto-set |
| `VERCEL_URL` | Vercel domain | Auto-generated | Auto-set |

### Optional Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VERCEL_ANALYTICS_ID` | Vercel Analytics | `analytics-id` | ❌ |
| `SENTRY_DSN` | Error tracking | `https://sentry.io/dsn` | ❌ |

## Deployment Strategies

### Strategy 1: GitHub Auto-Deployment (Recommended)

```bash
# 1. Push to main branch
git push origin main

# 2. Vercel automatically:
#    - Detects changes
#    - Runs build process
#    - Deploys to production
#    - Updates domain
```

**Pros:** Zero-config, automatic, rollback support
**Cons:** Less control over deployment timing

### Strategy 2: Manual Vercel CLI Deployment

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login and link project
vercel login
vercel link

# 3. Deploy
vercel --prod
```

**Pros:** Full control, preview deployments
**Cons:** Manual process, requires CLI setup

## Monitoring and Maintenance

### Health Checks

```bash
# Test database connectivity
curl https://your-app.vercel.app/api/health

# Test RSVP endpoint
curl https://your-app.vercel.app/api/rsvp
```

### Log Monitoring

1. **Vercel Logs**
   ```bash
   vercel logs --follow
   ```

2. **Database Monitoring**
   - Monitor Neon dashboard for connection counts
   - Check query performance metrics
   - Review error logs

### Regular Maintenance

- [ ] Weekly: Check deployment logs
- [ ] Monthly: Review database performance
- [ ] Quarterly: Update dependencies
- [ ] As needed: Monitor RSVP submissions

## Troubleshooting

### Common Deployment Issues

**Build Fails**
```bash
# Check build logs in Vercel dashboard
# Common fixes:
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**Database Connection Issues**
```bash
# Test connectivity locally
npm run db:test

# Check environment variables match exactly
# Verify IP allowlist in Neon (if applicable)
```

**Environment Variable Issues**
- Ensure all required variables are set in Vercel
- Check for typos in variable names
- Verify secrets are properly escaped

**API Route Issues**
- Check function logs in Vercel dashboard
- Verify API routes are properly configured
- Test endpoints directly

### Emergency Rollback

If deployment fails:

```bash
# Option 1: Revert via Vercel dashboard
# Go to Deployments → Find last working version → Promote

# Option 2: Revert via git
git revert HEAD
git push origin main
```

## Performance Optimization

### Database Optimization

- Use connection pooling (POSTGRES_PRISMA_URL)
- Monitor query performance in Neon
- Implement query caching if needed

### Frontend Optimization

- Images are optimized by Next.js automatically
- Static pages are pre-generated
- CSS is automatically optimized

### Vercel Configuration

The `vercel.json` file includes:
- Optimized function duration (30s max)
- Proper environment variable mapping
- Optimal region selection (iad1)

## Security Considerations

- [ ] NEXTAUTH_SECRET is cryptographically secure (32+ chars)
- [ ] Database connections use SSL (sslmode=require)
- [ ] Environment variables are not exposed to client
- [ ] API routes include proper error handling

## Support and Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Neon Documentation:** https://neon.tech/docs
- **Project Repository:** https://github.com/bwierzbo/BennyandBlueRSVPWebApp

## Deployment Timeline

**Total Estimated Time: 20-30 minutes**

- Database setup: 5-10 minutes
- Vercel configuration: 10-15 minutes
- Testing and verification: 5-10 minutes

**First-time setup:** 30-45 minutes
**Subsequent deployments:** 2-5 minutes (automatic)

---

*Last updated: September 2024*
*Next review: Monthly*