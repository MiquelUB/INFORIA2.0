# Security Implementation Guide - INFORIA 2.0

## Overview
This document outlines the security measures implemented in INFORIA 2.0 and provides guidelines for maintaining security standards.

## Implemented Security Measures

### 1. Authentication & Authorization ✅

#### Rate Limiting
- **Location:** `lib/rateLimit.ts`
- **Implementation:** In-memory rate limiter for API endpoints
- **Configuration:**
  - Authentication endpoints: 5 requests/minute
  - General API endpoints: 100 requests/minute
- **Usage Example:**
```typescript
import { checkRateLimit, authRateLimiter } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, authRateLimiter);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimit.headers }
    );
  }
  // ... rest of handler
}
```

#### Input Validation
- **Location:** All API routes should use Zod schemas
- **Example:** `app/api/auth/session/route.ts`
```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
```

### 2. Security Headers ✅

#### Configuration
- **Location:** `next.config.js`
- **Headers Implemented:**
  - `Strict-Transport-Security`: Forces HTTPS
  - `X-Frame-Options`: Prevents clickjacking
  - `X-Content-Type-Options`: Prevents MIME sniffing
  - `Referrer-Policy`: Controls referrer information
  - `Permissions-Policy`: Restricts browser features (camera, microphone, geolocation, payment, usb, display-capture, fullscreen, autoplay, encrypted-media)
  - `X-DNS-Prefetch-Control`: Controls DNS prefetching

**Note:** The deprecated `X-XSS-Protection` header is intentionally NOT included as modern browsers have better built-in XSS protection.

**Permissions-Policy Note:** If your application requires fullscreen or autoplay features (e.g., for video reports or imaging), change the policy to `fullscreen=(self)` and `autoplay=(self)` instead of `()`.

### 3. Data Protection ✅

#### Sensitive Data Logging
- **Rule:** Never log passwords, tokens, or API keys in plain text
- **Implementation:**
  - Token masking: `${token.substring(0, 8)}...${token.substring(token.length - 4)}`
  - Email masking: `email.replace(/(^.{2}).*(@.*)/, '$1***$2')`

#### Examples:
```typescript
// ❌ BAD
console.log('User token:', token);

// ✅ GOOD
const maskedToken = `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
console.log('User token:', maskedToken);
```

### 4. Debug Endpoints Protection ✅

#### Environment-Based Access Control
- **Endpoints:** `/api/validate-env`, `/api/health`
- **Rule:** Disabled in production
```typescript
if (process.env.NODE_ENV === 'production') {
  return NextResponse.json(
    { error: 'This endpoint is disabled in production' },
    { status: 403 }
  );
}
```

### 5. Dependency Security ✅

#### Regular Audits
```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Update specific packages
npm update @supabase/ssr eslint-config-next
```

#### Current Status:
- ✅ Updated `@supabase/ssr` to ^0.8.0 (fixes cookie vulnerability)
- ✅ Updated `eslint-config-next` to ^15.0.3 (fixes glob vulnerability)

### 6. Database Security ✅

#### Row-Level Security (RLS)
- **Status:** Enabled on all tables
- **Implementation:** Supabase RLS policies
- **Best Practice:** Always query with user context
```typescript
// RLS automatically filters by user_id
const { data } = await supabase
  .from('patients')
  .select('*')
  .eq('user_id', user.id);
```

### 7. Third-Party Integration Security ✅

#### Stripe Webhook Security
- **Location:** `app/api/webhooks/stripe/route.ts`
- **Implementation:** Signature verification
```typescript
const signature = headerList.get('stripe-signature');
event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
```

#### Google OAuth
- **Scopes:** Minimal required scopes only
- **Token Storage:** Secure session-based storage via Supabase

## Security Checklist for New Features

### When Adding a New API Route:
- [ ] Add authentication check
- [ ] Implement rate limiting
- [ ] Add input validation with Zod
- [ ] Validate user authorization (not just authentication)
- [ ] Add proper error handling
- [ ] Avoid logging sensitive data
- [ ] Test with invalid inputs

### When Adding a New Form:
- [ ] Use Zod for client-side validation
- [ ] Use Zod for server-side validation
- [ ] Sanitize user inputs
- [ ] Use controlled components
- [ ] Implement CSRF protection (built into Next.js)
- [ ] Add rate limiting on submission

### When Adding Third-Party Integration:
- [ ] Use environment variables for secrets
- [ ] Verify webhooks/callbacks with signatures
- [ ] Implement proper error handling
- [ ] Use minimal required scopes/permissions
- [ ] Add logging for security events
- [ ] Test failure scenarios

## Security Testing

### Manual Testing Checklist:
1. **Authentication:**
   - [ ] Test with invalid credentials
   - [ ] Test rate limiting (try 6+ login attempts)
   - [ ] Test session expiration
   - [ ] Test OAuth flow

2. **Authorization:**
   - [ ] Try accessing other users' data
   - [ ] Test API endpoints without authentication
   - [ ] Test role-based access (if applicable)

3. **Input Validation:**
   - [ ] SQL injection attempts
   - [ ] XSS payloads: `<script>alert('xss')</script>`
   - [ ] Oversized inputs
   - [ ] Special characters

4. **Session Management:**
   - [ ] Test concurrent sessions
   - [ ] Test logout functionality
   - [ ] Test session timeout

### Automated Testing:
```bash
# Run security audit
npm audit

# Run linter (includes security rules)
npm run lint

# Run tests
npm test
```

## Incident Response

### If a Security Vulnerability is Discovered:

1. **Assess Severity:**
   - Critical: Data breach, authentication bypass
   - High: Information disclosure, privilege escalation
   - Medium: Rate limit bypass, validation issues
   - Low: Information leakage, minor issues

2. **Immediate Actions:**
   - For Critical/High: Take affected service offline
   - Review logs for exploitation
   - Notify team and stakeholders
   - Document the vulnerability

3. **Remediation:**
   - Develop and test fix
   - Deploy to production
   - Monitor for issues
   - Update this document

4. **Post-Incident:**
   - Root cause analysis
   - Update security policies
   - Additional testing
   - Security training if needed

## Environment Variables Security

### Required Environment Variables:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # ⚠️ NEVER expose publicly

# Authentication
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_GOOGLE_SERVICE_ACCOUNT_EMAIL=
NEXT_GOOGLE_ACCOUNT_PRIVATE_KEY=  # ⚠️ NEVER expose publicly

# APIs
OPENAI_API_KEY=  # ⚠️ NEVER expose publicly
NEXT_PUBLIC_OPENROUTER_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=  # ⚠️ NEVER expose publicly
STRIPE_WEBHOOK_SECRET=  # ⚠️ NEVER expose publicly

# Email
RESEND_API_KEY=  # ⚠️ NEVER expose publicly
SENDER_EMAIL=

# App
NEXT_PUBLIC_APP_URL=
```

### Environment Variable Rules:
1. ⚠️ **NEVER** commit `.env` files to Git
2. ⚠️ **NEVER** expose secret keys in client-side code
3. ✅ Use `NEXT_PUBLIC_` prefix ONLY for public variables
4. ✅ Rotate secrets regularly
5. ✅ Use different keys for dev/staging/production

## Monitoring & Logging

### What to Log:
- ✅ Authentication attempts (success/failure)
- ✅ Authorization failures
- ✅ Rate limit violations
- ✅ API errors
- ✅ Webhook events
- ✅ Security events

### What NOT to Log:
- ❌ Passwords
- ❌ API keys
- ❌ Session tokens
- ❌ Credit card numbers
- ❌ Private keys

### Log Levels:
```typescript
console.log()    // INFO: General information
console.warn()   // WARNING: Potential issues
console.error()  // ERROR: Errors that need attention
```

## Regular Maintenance

### Weekly:
- [ ] Review error logs for anomalies
- [ ] Check rate limit violations

### Monthly:
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review and update dependencies
- [ ] Check for security advisories

### Quarterly:
- [ ] Security audit of new features
- [ ] Review and update security policies
- [ ] Team security training
- [ ] Penetration testing (if budget allows)

## Resources

### Security Tools:
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)

### Learning Resources:
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Security Best Practices](https://stripe.com/docs/security/guide)

## Contact

For security issues or questions, contact:
- Security Team: [Add contact info]
- Emergency: [Add emergency contact]

---

**Last Updated:** December 17, 2024  
**Next Review:** January 17, 2025
