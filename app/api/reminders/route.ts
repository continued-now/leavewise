import { NextRequest, NextResponse } from 'next/server';
import { ReminderPreferencesSchema } from '@/lib/reminders';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/reminders
 * Save reminder preferences. Stores in Upstash Redis when configured,
 * otherwise returns success silently (dev/staging without credentials).
 */
export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per hour per IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const rl = checkRateLimit(`reminders:${ip}`, 5, 3_600_000);
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

  const parsed = ReminderPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const prefs = parsed.data;

  // Hash the email for use as a Redis key
  const emailHash = await hashEmail(prefs.email);

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    // Redis not configured — return success silently (dev/staging)
    console.warn('[reminders] Upstash Redis not configured — skipping persistence');
    return NextResponse.json({ success: true });
  }

  try {
    // Store preferences with 1-year TTL
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url: redisUrl, token: redisToken });

    await redis.set(`reminder:${emailHash}`, JSON.stringify(prefs), {
      ex: 365 * 24 * 60 * 60, // 1 year
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[reminders] Redis error:', err);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
