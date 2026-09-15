// ⚠️  SECURITY WARNING: This in-memory rate limiter is NOT safe for production.
//
// On serverless platforms (Vercel, AWS Lambda), each function invocation may use
// a different instance with a fresh in-memory state. This means rate limits reset
// on every cold start, making this completely ineffective for preventing brute-force
// attacks in a live environment.
//
// TODO (REQUIRED before production): Replace with @upstash/ratelimit + Redis:
//   npm install @upstash/ratelimit @upstash/redis
//   https://github.com/upstash/ratelimit-js
//
// Additionally: rate limiting based on x-forwarded-for is spoofable. Consider
// rate limiting by email address for auth endpoints in addition to IP.

const rateLimits = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(ip: string, action: string, limit: number, windowMs: number): boolean {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const record = rateLimits.get(key);

  if (!record || now > record.expiresAt) {
    rateLimits.set(key, { count: 1, expiresAt: now + windowMs });
    return true; // Allowed
  }

  if (record.count >= limit) {
    return false; // Rate limited
  }

  record.count += 1;
  return true; // Allowed
}
