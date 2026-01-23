# Emergency QR Code - Deployment & Configuration Guide

## 🚀 Deployment Steps

### Step 1: Pre-Deployment Verification

```bash
# Check TypeScript compilation
npm run typecheck

# Verify all imports
npm run build

# No errors should appear
```

### Step 2: Environment Configuration

```bash
# .env.local (if needed for API calls)
# No special environment variables needed for MVP
# QR Server API is public and requires no auth

# For production with database:
DATABASE_URL=your_database_url
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### Step 3: Database Migration (When Ready)

```bash
# 1. Create migration file
npm run prisma migrate create --name add_emergency_tokens

# 2. Add schema to migration
# See emergency-qr-implementation.md for SQL

# 3. Apply migration
npm run prisma migrate deploy

# 4. Update src/lib/emergency-token.ts
# Replace localStorage functions with DB calls
```

### Step 4: API Configuration

**Current (Works as-is):**
- Uses QR Server API (external, no setup needed)
- Uses localStorage (client-side, no server setup)
- No authentication required (intentional for emergencies)

**For Production:**
```typescript
// src/app/api/emergency/[token]/route.ts
// Add these improvements:

1. Rate limiting
   const rateLimit = (token: string) => {
     // Implement rate limiting per token
     // Suggested: 100 requests per minute per token
   }

2. Token expiration check
   if (token.expires_at < new Date()) {
     return 404; // Expired token
   }

3. Audit logging
   await db.query('INSERT INTO emergency_access_logs ...')

4. Error tracking
   Sentry.captureException(error)
```

### Step 5: Deployment Checklist

```
Pre-deployment:
☐ All TypeScript compiles without errors
☐ No console errors in development
☐ QR codes are scannable
☐ Public page loads without auth
☐ Emergency info displays correctly
☐ Mobile responsive tested
☐ Copy link functionality works
☐ Regenerate works correctly

Security:
☐ No email addresses exposed
☐ No passwords in API responses
☐ No internal user IDs exposed
☐ HTTPS enforced on public page (if possible)
☐ Rate limiting planned for production
☐ Error messages are generic

Performance:
☐ QR code generates in <100ms
☐ API response <200ms
☐ No memory leaks
☐ Page loads under 2s on mobile 3G

Testing:
☐ Valid tokens work
☐ Invalid tokens show error
☐ Multiple concurrent requests work
☐ Browser cache cleared between tests
☐ Mobile device tested
☐ Different browsers tested
```

## 🔧 Configuration Options

### QR Code Settings

```typescript
// src/components/qr-code-display.tsx
// Customize QR code appearance:

<QRCodeDisplay
  qrData={emergencyUrl}
  size={200}              // Options: 150, 200, 250, 300
  showDescription={true}  // Show helper text
  copyableUrl={emergencyUrl} // Enable copy button
/>
```

### Emergency Page Styling

```typescript
// src/app/emergency/[token]/page.tsx
// Current color scheme (hospital-friendly):
- Header: Red to Orange gradient (danger)
- Blood group section: Blue (critical, very large)
- Allergies section: Yellow (warning)
- Medications: Green (active)
- Emergency contact: Orange (important)

// To customize:
1. Edit bg-gradient-to-r from-red-600 to-red-700
2. Change text colors (text-red-600, etc.)
3. Adjust font sizes (text-5xl, text-lg, etc.)
```

### Token Storage Options

```typescript
// Current: localStorage
// For production, choose one:

Option 1: Prisma ORM + PostgreSQL
├─ Fast queries
├─ JSONB support for emergency_info
├─ Built-in migration system
└─ Schema provided in implementation guide

Option 2: Firebase Firestore
├─ Real-time updates
├─ Scalable
├─ No database management needed
└─ Update storeEmergencyToken() function

Option 3: MongoDB + Mongoose
├─ Flexible schema
├─ Good for scaling
├─ Replace Token utility functions
└─ Update database calls

// For any option:
storeEmergencyToken(token) → POST /api/token/store
getStoredEmergencyToken() → GET /api/token
```

## 🎯 Feature Flags (Optional)

```typescript
// src/lib/features.ts (optional)
export const FEATURES = {
  QR_CODE_ENABLED: true,
  TOKEN_EXPIRATION_DAYS: null, // null = never expire
  REQUIRE_HTTPS: false, // Set true for production
  ENABLE_AUDIT_LOGGING: false, // Set true for production
  RATE_LIMIT_PER_MINUTE: null, // null = no limit
};

// Usage in API:
if (FEATURES.REQUIRE_HTTPS && !request.secure) {
  return 403; // Forbidden
}

if (FEATURES.ENABLE_AUDIT_LOGGING) {
  await logAccess(token, request.ip);
}
```

## 📊 Monitoring & Analytics

### What to Monitor in Production

```typescript
// Add tracking for:

1. QR Code Generation
   - Event: qr_generated
   - Track: user_id, timestamp, token

2. Emergency Page Views
   - Event: emergency_page_viewed
   - Track: token, timestamp, user_agent

3. API Calls
   - Event: emergency_info_fetched
   - Track: token, response_time, status_code

4. Errors
   - Event: emergency_error
   - Track: error_type, token, timestamp

// Example implementation:
analytics.track('emergency_info_fetched', {
  token: token.slice(0, 8) + '...', // Don't log full token
  duration: performance.now() - startTime,
  status: response.status
});
```

### Error Monitoring

```typescript
// Setup error tracking:

import Sentry from '@sentry/nextjs';

// In route handler:
try {
  // ... code ...
} catch (error) {
  Sentry.captureException(error, {
    tags: { route: 'emergency' }
  });
}
```

## 🔐 Security Hardening for Production

### Step 1: HTTPS Enforcement

```typescript
// middleware.ts (optional)
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // In production, redirect HTTP to HTTPS
  if (process.env.NODE_ENV === 'production') {
    if (!request.secure) {
      const secureUrl = request.url.replace('http://', 'https://');
      return NextResponse.redirect(secureUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
```

### Step 2: Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 per minute
});

// In API route:
const { success } = await ratelimit.limit(token);
if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

### Step 3: Token Expiration

```typescript
// In emergency_tokens table:
ALTER TABLE emergency_tokens ADD COLUMN expires_at TIMESTAMP;

// In API route:
const token = await db.query(
  'SELECT * FROM emergency_tokens WHERE token = ? AND (expires_at IS NULL OR expires_at > NOW())',
  [tokenParam]
);

// Optional: Auto-expire tokens after 1 year
ALTER TABLE emergency_tokens 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL 1 YEAR;
```

### Step 4: Audit Logging

```typescript
// src/app/api/emergency/[token]/route.ts
// Add logging for all access:

async function logEmergencyAccess(
  token: string,
  ip: string,
  userAgent: string
) {
  await db.query(
    `INSERT INTO emergency_access_logs 
     (token, ip_address, user_agent, accessed_at) 
     VALUES (?, ?, ?, NOW())`,
    [token, ip, userAgent]
  );
}

// Get IP from request:
const ip = request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown';

const userAgent = request.headers.get('user-agent') || 'unknown';

await logEmergencyAccess(token, ip, userAgent);
```

## 📈 Performance Optimization

### Image Optimization (QR Code)

```typescript
// src/components/qr-code-display.tsx
// Already optimized with Next.js Image component
// No additional configuration needed

// For very high traffic, consider:
- CDN caching for QR Server API responses
- Local QR generation library (for offline support)
- Webp format support
```

### Database Query Optimization

```sql
-- For production database:

-- Create indexes for fast lookups
CREATE INDEX idx_emergency_tokens_token ON emergency_tokens(token);
CREATE INDEX idx_emergency_tokens_active ON emergency_tokens(is_active);
CREATE INDEX idx_emergency_tokens_expires ON emergency_tokens(expires_at);

-- For pagination (if needed):
CREATE INDEX idx_emergency_access_logs_date ON emergency_access_logs(accessed_at DESC);

-- Query plan analysis:
EXPLAIN SELECT * FROM emergency_tokens WHERE token = 'uuid';
```

### API Response Caching

```typescript
// src/app/api/emergency/[token]/route.ts
// Currently: No caching (correct for emergencies)
// If you want to cache:

const response = NextResponse.json(emergencyData);

// Cache for 1 hour (optional)
response.headers.set('Cache-Control', 'public, max-age=3600');

// Or use Vercel's ISR (Incremental Static Regeneration)
response.headers.set('Cache-Control', 's-maxage=3600');
```

## 🧪 Testing Checklist for Production

### Smoke Tests
```bash
# Test the basic flow
1. Generate QR code
2. Verify QR is scannable
3. Access public page
4. Verify all data displays
5. Test on mobile device
```

### Security Tests
```bash
# Test security measures
1. Invalid token → Error
2. Expired token → Error (if implemented)
3. Rate limiting → 429 on excess (if implemented)
4. No sensitive data exposed → Verified
5. HTTPS redirect works (if implemented)
```

### Performance Tests
```bash
# Measure performance
1. QR generation: <100ms
2. API response: <200ms
3. Page load: <2s on 3G
4. Concurrent requests: Handle 100+
```

### Accessibility Tests
```bash
# Test accessibility
1. Fonts readable: ≥18px
2. Color contrast: WCAG AA
3. Touch targets: ≥44px
4. Mobile viewport: Works
5. No keyboard traps
```

## 🐛 Troubleshooting Production Issues

### Issue: QR Code Not Displaying
```
Causes:
1. QR Server API unreachable
2. URL encoding issue
3. Browser cache issue

Solutions:
1. Check internet connection
2. Clear browser cache
3. Verify QR Server API status
4. Check browser console for errors
```

### Issue: Emergency Info Not Fetching
```
Causes:
1. Invalid token
2. Token expired (if implemented)
3. Database connection issue
4. API rate limiting

Solutions:
1. Verify token format
2. Regenerate token if expired
3. Check database connection
4. Implement exponential backoff
```

### Issue: Slow Response Times
```
Causes:
1. Slow database query
2. No query index
3. High traffic overload

Solutions:
1. Add indexes to database
2. Implement query caching
3. Use CDN for static assets
4. Implement rate limiting
```

## 📋 Maintenance Tasks

### Daily
- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Verify QR generation working

### Weekly
- [ ] Review access logs
- [ ] Check for abuse patterns
- [ ] Verify token generation

### Monthly
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Performance analysis

### Quarterly
- [ ] Security audit
- [ ] Database optimization
- [ ] Capacity planning

## 🆘 Support & Resources

### Emergency Access (If Things Break)
```typescript
// Emergency override (use carefully):
// Only for debugging - remove in production

if (process.env.EMERGENCY_OVERRIDE === 'true') {
  // Return mock data
  return mockEmergencyData;
}
```

### Rollback Procedure
```bash
# If deployment fails:
1. Identify issue from error logs
2. Revert to previous version
3. Fix issue locally
4. Deploy again

# Git commands:
git revert HEAD
git push
npm run build
npm start
```

### Contact & Escalation
```
Issue Categories:
- QR Code Generation → Check QR Server API
- Database Issues → Check database connection
- API Issues → Check logs at /api/emergency/[token]
- Public Page Issues → Check browser console
```

## ✅ Final Deployment Checklist

```
Code Quality
☐ TypeScript strict mode passes
☐ ESLint passes (if configured)
☐ No console.log in production code
☐ Comments removed (keep doc comments)
☐ Error handling comprehensive

Security
☐ No hardcoded secrets in code
☐ Environment variables used
☐ HTTPS ready
☐ Rate limiting considered
☐ Input validation in place

Performance
☐ Build completes without warnings
☐ Bundle size acceptable
☐ Images optimized
☐ No memory leaks

Documentation
☐ README updated with new features
☐ API documented
☐ Configuration documented
☐ Deployment guide in place

Testing
☐ Manual testing completed
☐ Cross-browser tested
☐ Mobile tested
☐ Error scenarios tested

Monitoring
☐ Error tracking configured
☐ Analytics configured
☐ Logs setup
☐ Alerting configured

Final Sign-off
☐ Code review completed
☐ Security review completed
☐ Performance review completed
☐ Ready for production
```

## 🎉 Deployment Complete

After all checks pass:

```bash
# Deploy to production
npm run build
npm start

# Verify deployment
curl https://yourdomain.com/emergency/test-token-here
# Should return 404 (valid response for invalid token)

# Monitor for issues
# Check logs and analytics
```

**Congratulations! Emergency QR Code system is live!** 🚀
