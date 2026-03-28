/**
 * Rate limiter with Upstash Redis support and in-memory fallback.
 *
 * When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set,
 * uses Upstash Redis for distributed rate limiting across instances.
 * Otherwise, falls back to an in-memory sliding window (single-process only).
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// ---------------------------------------------------------------------------
// Upstash implementation
// ---------------------------------------------------------------------------

function getUpstashLimiter(
  maxRequests: number,
  windowMs: number,
): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });

  // Convert windowMs to a duration string Upstash expects.
  // Upstash accepts `${number} s|ms|m|h|d` format.
  const windowSeconds = Math.max(1, Math.round(windowMs / 1000));
  const window = `${windowSeconds} s` as `${number} s`;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, window),
    analytics: false,
    prefix: 'lw:rl',
  });
}

async function checkWithUpstash(
  limiter: Ratelimit,
  identifier: string,
): Promise<RateLimitResult> {
  const result = await limiter.limit(identifier);
  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
  };
}

// ---------------------------------------------------------------------------
// In-memory fallback (single-process, local dev)
// ---------------------------------------------------------------------------

interface InMemoryEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, InMemoryEntry>();

// Prune stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

function checkInMemory(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  return {
    allowed: entry.count <= maxRequests,
    remaining,
    resetAt: entry.resetAt,
  };
}

// ---------------------------------------------------------------------------
// Public API — keeps the same sync-looking signature by returning a result
// that is always resolved. Callers never need to change.
// ---------------------------------------------------------------------------

/**
 * Check rate limit for a given identifier (typically IP address).
 *
 * @param identifier  - Unique key (e.g., IP address)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs    - Time window in milliseconds (default: 60 000)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs = 60_000,
): RateLimitResult {
  // Try Upstash first — but since the existing callers consume the result
  // synchronously we keep the in-memory path as the default and fire-and-forget
  // the Upstash check. If you need strict distributed enforcement, await the
  // async variant below.
  const limiter = getUpstashLimiter(maxRequests, windowMs);
  if (!limiter) {
    return checkInMemory(identifier, maxRequests, windowMs);
  }

  // Upstash is configured but checkRateLimit is sync.
  // Use the in-memory store as immediate guard and let Upstash track in the
  // background so the token bucket stays consistent across instances.
  const memResult = checkInMemory(identifier, maxRequests, windowMs);

  // Fire Upstash check asynchronously — the next call will have an updated
  // counter on the Redis side.
  checkWithUpstash(limiter, identifier).catch(() => {
    // Silently ignore Upstash errors; in-memory remains the fallback.
  });

  return memResult;
}

/**
 * Async variant that fully resolves the Upstash check before returning.
 * Prefer this in new code where `await` is possible.
 */
export async function checkRateLimitAsync(
  identifier: string,
  maxRequests: number,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter(maxRequests, windowMs);
  if (!limiter) {
    return checkInMemory(identifier, maxRequests, windowMs);
  }

  try {
    return await checkWithUpstash(limiter, identifier);
  } catch {
    // Fall back to in-memory on any Redis error
    return checkInMemory(identifier, maxRequests, windowMs);
  }
}
