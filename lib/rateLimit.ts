/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private cleanupIntervalId?: NodeJS.Timeout;
  private readonly cleanupIntervalMs: number;

  constructor(
    windowMs: number = 60000, 
    maxRequests: number = 100,
    cleanupIntervalMs?: number
  ) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    // Default cleanup interval is the same as window, but can be customized
    this.cleanupIntervalMs = cleanupIntervalMs ?? windowMs;

    // Clean up expired entries periodically
    this.cleanupIntervalId = setInterval(() => this.cleanup(), this.cleanupIntervalMs);
    
    // Prevent the interval from keeping the process alive
    this.cleanupIntervalId.unref();
  }

  /**
   * Check if a request should be allowed
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @returns true if request is allowed, false if rate limit exceeded
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // New window
      const resetTime = now + this.windowMs;
      this.requests.set(identifier, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime,
      };
    }

    if (entry.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.requests.set(identifier, entry);
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanupRunning = false;
  
  private cleanup(): void {
    // Prevent overlapping cleanup operations
    if (this.cleanupRunning) {
      return;
    }
    
    this.cleanupRunning = true;
    try {
      const now = Date.now();
      for (const [key, entry] of this.requests.entries()) {
        if (now > entry.resetTime) {
          this.requests.delete(key);
        }
      }
    } finally {
      this.cleanupRunning = false;
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Get the maximum number of requests allowed
   */
  getMaxRequests(): number {
    return this.maxRequests;
  }

  /**
   * Cleanup and stop the interval timer
   */
  destroy(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = undefined;
    }
    this.requests.clear();
  }
}

// Different rate limiters for different endpoints
export const authRateLimiter = new RateLimiter(60000, 5); // 5 requests per minute for auth
export const apiRateLimiter = new RateLimiter(60000, 100); // 100 requests per minute for general API

/**
 * Get client identifier from request
 * Uses IP address or user-agent as fallback
 * Note: In production behind a proxy, ensure proxy is trusted and properly configured
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (works with most proxies)
  // Note: X-Forwarded-For can be spoofed. In production, ensure you're behind
  // a trusted proxy (Vercel, CloudFlare, etc.) that sanitizes these headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  // Take the first IP from X-Forwarded-For (client IP)
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
  
  // Validate IP format
  if (ip !== 'unknown' && !isValidIP(ip)) {
    // If IP format is invalid, fall back to a hash of user-agent
    const userAgent = request.headers.get('user-agent') || 'unknown-agent';
    // Simple hash for identifier purposes
    return `ua-${userAgent.length}-${userAgent.charCodeAt(0)}`;
  }
  
  return ip;
}

/**
 * Validate if a string is a valid IPv4 or IPv6 address
 */
function isValidIP(ip: string): boolean {
  // IPv4 validation: each octet must be 0-255
  const ipv4Parts = ip.split('.');
  if (ipv4Parts.length === 4) {
    return ipv4Parts.every(part => {
      // Check if part is a valid number without leading zeros (except '0' itself)
      if (!/^\d+$/.test(part)) return false;
      if (part.length > 1 && part[0] === '0') return false; // Reject leading zeros like '010'
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  // IPv6 validation: simplified check for valid hex groups
  // For production use, consider using a library like 'is-ip' for comprehensive validation
  if (ip.includes(':')) {
    // Handle ::1 (loopback), :: (all zeros), and standard formats
    if (ip === '::1' || ip === '::') return true;
    
    // Split by :: to handle compressed notation
    const parts = ip.split('::');
    if (parts.length > 2) return false; // Can only have one ::
    
    // Validate each part contains valid hex groups
    const validateGroups = (str: string) => {
      if (!str) return true; // Empty is valid (represents compressed zeros)
      const groups = str.split(':');
      return groups.every(g => /^[0-9a-fA-F]{1,4}$/.test(g));
    };
    
    return parts.every(validateGroups);
  }
  
  return false;
}

/**
 * Apply rate limiting to a request
 */
export function checkRateLimit(
  request: Request,
  limiter: RateLimiter = apiRateLimiter
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  headers: Record<string, string>;
} {
  const identifier = getClientIdentifier(request);
  const result = limiter.check(identifier);

  return {
    ...result,
    headers: {
      'X-RateLimit-Limit': String(limiter.getMaxRequests()),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    },
  };
}
