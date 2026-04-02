import { NextRequest, NextResponse } from 'next/server';
import { PriceAlertSchema } from '@/lib/price-alerts';
import type { StoredPriceAlert } from '@/lib/price-alerts';
import { checkRateLimit } from '@/lib/rate-limit';

async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateId(): string {
  return `pa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * POST /api/price-alerts
 * Create a new price alert. Stores in Upstash Redis when configured.
 */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const rl = checkRateLimit(`price_alerts:${ip}`, 10, 3_600_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = PriceAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const alert = parsed.data;
  const alertId = generateId();
  const emailHash = await hashEmail(alert.email);

  const stored: StoredPriceAlert = {
    ...alert,
    id: alertId,
    createdAt: Date.now(),
    triggered: false,
  };

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    console.warn('[price-alerts] Upstash Redis not configured — skipping persistence');
    return NextResponse.json({ success: true, alertId });
  }

  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url: redisUrl, token: redisToken });

    // Store the alert with 90-day TTL
    await redis.set(`price_alert:${alertId}`, JSON.stringify(stored), {
      ex: 90 * 24 * 60 * 60,
    });

    // Maintain a set of alert IDs per email for lookup
    await redis.sadd(`price_alerts:${emailHash}`, alertId);
    await redis.expire(`price_alerts:${emailHash}`, 90 * 24 * 60 * 60);

    return NextResponse.json({ success: true, alertId });
  } catch (err) {
    console.error('[price-alerts] Redis error:', err);
    return NextResponse.json(
      { error: 'Failed to save price alert' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/price-alerts?email=...
 * Retrieve active alerts for an email address.
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return NextResponse.json({ alerts: [] });
  }

  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url: redisUrl, token: redisToken });
    const emailHash = await hashEmail(email);

    const alertIds = await redis.smembers(`price_alerts:${emailHash}`);
    if (!alertIds || alertIds.length === 0) {
      return NextResponse.json({ alerts: [] });
    }

    const alerts: StoredPriceAlert[] = [];
    for (const id of alertIds) {
      const data = await redis.get(`price_alert:${id}`);
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        alerts.push(parsed as StoredPriceAlert);
      }
    }

    return NextResponse.json({ alerts });
  } catch (err) {
    console.error('[price-alerts] Redis error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve alerts' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/price-alerts?id=...&email=...
 * Remove a price alert.
 */
export async function DELETE(request: NextRequest) {
  const alertId = request.nextUrl.searchParams.get('id');
  const email = request.nextUrl.searchParams.get('email');

  if (!alertId || !email) {
    return NextResponse.json(
      { error: 'Both id and email parameters are required' },
      { status: 400 }
    );
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return NextResponse.json({ success: true });
  }

  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url: redisUrl, token: redisToken });
    const emailHash = await hashEmail(email);

    await redis.del(`price_alert:${alertId}`);
    await redis.srem(`price_alerts:${emailHash}`, alertId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[price-alerts] Redis error:', err);
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}
