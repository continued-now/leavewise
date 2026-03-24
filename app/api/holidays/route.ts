import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const country = searchParams.get('country');

  if (!year || !country) {
    return NextResponse.json({ error: 'Missing year or country' }, { status: 400 });
  }

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

  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2035) {
    return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
  }

  const countryClean = country.replace(/[^A-Z]/gi, '').slice(0, 2).toUpperCase();

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
