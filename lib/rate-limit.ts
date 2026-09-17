import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

// Login: 5 attempts per 15 min per IP+email
export const loginLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'rl:login',
    })
  : null;

// Signup: 3 attempts per hour per IP
export const signupLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: 'rl:signup',
    })
  : null;

// Password reset: 3 per 15 min per IP
export const resetLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '15 m'),
      analytics: true,
      prefix: 'rl:reset',
    })
  : null;

// Pool join: 10 per minute per user
export const joinLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'rl:join',
    })
  : null;

// Get real client IP — Vercel sets x-real-ip from trusted edge
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-real-ip') || '127.0.0.1';
}
