import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// ---------------------------------------------------------------------------
// Redis client (reused across requests; null when env vars are missing)
// ---------------------------------------------------------------------------

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = getRedis();

/** Redis key prefix & TTL (7 days) for benchmark buckets */
const REDIS_PREFIX = 'lw:bench:';
const REDIS_TTL_SECONDS = 7 * 24 * 60 * 60;

// ---------------------------------------------------------------------------
// In-memory fallback (local dev / when Redis is not configured)
// ---------------------------------------------------------------------------

const memStore = new Map<string, number[]>();

function getOrCreateMemBucket(country: string): number[] {
  const key = country.toUpperCase();
  if (!memStore.has(key)) memStore.set(key, []);
  return memStore.get(key)!;
}

/** Binary search to find insertion index (keep the array sorted). */
function insertSorted(arr: number[], value: number): void {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  arr.splice(lo, 0, value);
}

/** Calculate the percentile: what % of stored scores are strictly lower. */
function percentileFromArray(arr: number[], value: number): number {
  if (arr.length === 0) return 50; // no data yet
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return Math.round((lo / arr.length) * 100);
}

// ---------------------------------------------------------------------------
// Redis-backed storage helpers
// ---------------------------------------------------------------------------

function redisKey(country: string): string {
  return `${REDIS_PREFIX}${country.toUpperCase()}`;
}

/** Add a score to the Redis sorted set and return the percentile. */
async function addAndPercentileRedis(
  r: Redis,
  country: string,
  efficiency: number,
): Promise<number> {
  const key = redisKey(country);
  // ZADD the score (member = score:timestamp to avoid dedup)
  const member = `${efficiency}:${Date.now()}`;
  await r.zadd(key, { score: efficiency, member });
  await r.expire(key, REDIS_TTL_SECONDS);

  // Count how many scores are strictly below this value
  const below = await r.zcount(key, '-inf', `(${efficiency}`);
  const total = await r.zcard(key);
  if (total === 0) return 50;
  return Math.round((below / total) * 100);
}

/** Get the percentile from Redis without storing. */
async function percentileRedis(
  r: Redis,
  country: string,
  efficiency: number,
): Promise<number> {
  const key = redisKey(country);
  const total = await r.zcard(key);
  if (total === 0) return 50;
  const below = await r.zcount(key, '-inf', `(${efficiency}`);
  return Math.round((below / total) * 100);
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/**
 * POST /api/benchmark
 * Body: { efficiency: number, country: string, ptoDays: number }
 * Stores the score and returns { percentile: number }
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { efficiency, country } = body as Record<string, unknown>;

  if (typeof efficiency !== 'number' || typeof country !== 'string') {
    return NextResponse.json(
      { error: 'Missing required fields: efficiency (number), country (string)' },
      { status: 400 },
    );
  }

  // Try Redis first, fall back to in-memory
  if (redis) {
    try {
      const pct = await addAndPercentileRedis(redis, country, efficiency);
      return NextResponse.json({ percentile: pct });
    } catch {
      // Redis error — fall through to in-memory
    }
  }

  const bucket = getOrCreateMemBucket(country);
  insertSorted(bucket, efficiency);
  return NextResponse.json({ percentile: percentileFromArray(bucket, efficiency) });
}

/**
 * GET /api/benchmark?efficiency=X&country=Y
 * Returns the percentile without storing.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const effStr = searchParams.get('efficiency');
  const country = searchParams.get('country');

  if (!effStr || !country) {
    return NextResponse.json(
      { error: 'Missing query params: efficiency, country' },
      { status: 400 },
    );
  }

  const efficiency = parseFloat(effStr);
  if (isNaN(efficiency)) {
    return NextResponse.json({ error: 'efficiency must be a number' }, { status: 400 });
  }

  // Try Redis first, fall back to in-memory
  if (redis) {
    try {
      const pct = await percentileRedis(redis, country, efficiency);
      return NextResponse.json({ percentile: pct });
    } catch {
      // Redis error — fall through to in-memory
    }
  }

  const bucket = getOrCreateMemBucket(country);
  return NextResponse.json({ percentile: percentileFromArray(bucket, efficiency) });
}
