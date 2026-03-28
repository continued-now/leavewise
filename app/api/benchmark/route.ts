import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory efficiency benchmark store.
 * In production this would use Redis sorted sets — this resets on cold start.
 */
const store = new Map<string, number[]>();

function getOrCreateBucket(country: string): number[] {
  const key = country.toUpperCase();
  if (!store.has(key)) store.set(key, []);
  return store.get(key)!;
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
function percentile(arr: number[], value: number): number {
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
      { status: 400 }
    );
  }

  const bucket = getOrCreateBucket(country);
  insertSorted(bucket, efficiency);

  return NextResponse.json({ percentile: percentile(bucket, efficiency) });
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
      { status: 400 }
    );
  }

  const efficiency = parseFloat(effStr);
  if (isNaN(efficiency)) {
    return NextResponse.json({ error: 'efficiency must be a number' }, { status: 400 });
  }

  const bucket = getOrCreateBucket(country);
  return NextResponse.json({ percentile: percentile(bucket, efficiency) });
}
