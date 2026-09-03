// Simple in-memory rate limiting for development
// In production, replace with @upstash/ratelimit and Redis

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
