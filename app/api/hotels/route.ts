import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { HotelDeal } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limit';

const QuerySchema = z.object({
  destination: z.string().min(1).max(100),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.string().regex(/^[A-Z]{3}$/i).transform((s) => s.toUpperCase()).default('USD'),
});

interface HotellookHotel {
  priceFrom: number;
  name?: string;
  stars?: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }
  const { destination, checkIn, checkOut, currency } = parsed.data;

  const token = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER;
  if (!token) return NextResponse.json(null);

  // Rate limit: 30 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const rl = checkRateLimit(`hotels:${ip}`, 30);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const params = new URLSearchParams({
      location: destination,
      checkIn,
      checkOut,
      adults: '1',
      currency: currency.toLowerCase(),
      token,
      limit: '5',
      sortBy: 'price',
      sortAsc: '1',
    });

    const res = await fetch(
      `https://engine.hotellook.com/api/v2/cache.json?${params.toString()}`,
      { next: { revalidate: 3600 } } // hotel cached data — 1hr is fine
    );

    if (!res.ok) return NextResponse.json(null);

    const data: HotellookHotel[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) return NextResponse.json(null);

    const best = data[0];
    if (!best.priceFrom) return NextResponse.json(null);

    const deal: HotelDeal = {
      minPrice: Math.round(best.priceFrom),
      currency,
      cityName: destination,
    };

    return NextResponse.json(deal);
  } catch (err) {
    console.error('[hotels] Hotellook API error:', err);
    return NextResponse.json(null);
  }
}
