import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const QuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2035),
  country: z.string().regex(/^[A-Z]{2}$/i).transform((s) => s.toUpperCase()),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error.flatten() }, { status: 400 });
  }
  const { year: yearNum, country: countryClean } = parsed.data;

  // Rate limit: 60 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const rl = checkRateLimit(`holidays:${ip}`, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  try {
    const res = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${yearNum}/${countryClean}`,
      {
        next: { revalidate: 86400 },
        headers: { Accept: 'application/json' },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Holiday data not available for ${countryClean}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch holiday data' }, { status: 500 });
  }
}
