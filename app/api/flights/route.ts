import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildKiwiLink } from '@/lib/affiliates';
import type { FlightDeal } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limit';

const QuerySchema = z.object({
  origin: z.string().regex(/^[A-Z]{3}$/i).transform((s) => s.toUpperCase()),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.string().regex(/^[A-Z]{3}$/i).transform((s) => s.toUpperCase()).default('USD'),
});

// Kiwi Tequila date format: DD/MM/YYYY
function toKiwiDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

// Subtract N days from an ISO date string
function subtractDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

interface KiwiItinerary {
  price: number;
  deep_link: string;
  cityTo: string;
  cityCodeTo: string;
  local_departure: string; // ISO datetime
}

interface KiwiResponse {
  data: KiwiItinerary[];
  _results: number;
}

async function searchKiwi(
  origin: string,
  dateFrom: string,
  dateTo: string,
  currency: string,
  limit = 5,
): Promise<KiwiItinerary[]> {
  const apiKey = process.env.KIWI_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    fly_from: origin,
    date_from: toKiwiDate(dateFrom),
    date_to: toKiwiDate(dateTo),
    fly_to: 'anywhere',
    curr: currency,
    limit: String(limit),
    sort: 'price',
    nights_in_dst_from: '3',
    nights_in_dst_to: '21',
    ret_from_diff_city: 'false',
    one_for_city: '1',
  });

  const res = await fetch(
    `https://tequila.kiwi.com/v2/search?${params.toString()}`,
    {
      headers: { apikey: apiKey },
      next: { revalidate: 0 }, // no caching — prices change
    },
  );

  if (!res.ok) return [];

  const json: KiwiResponse = await res.json();
  return json.data ?? [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error.flatten() }, { status: 400 });
  }
  const { origin, dateFrom, dateTo, currency } = parsed.data;

  // Rate limit: 30 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const rl = checkRateLimit(`flights:${ip}`, 30);
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

  const affiliateId = process.env.KIWI_AFFILIATE_ID ?? '';

  try {
    // Primary search: flights departing within the window
    const primary = await searchKiwi(origin, dateFrom, dateTo, currency, 5);

    if (primary.length === 0) {
      return NextResponse.json(null);
    }

    const cheapest = primary[0];
    const deal: FlightDeal = {
      price: cheapest.price,
      currency,
      deeplink: buildKiwiLink(cheapest.deep_link, affiliateId),
      destination: cheapest.cityTo,
    };

    // Cheaper-day check: look at 3 days *before* the window starts
    const earlyFrom = subtractDays(dateFrom, 3);
    const earlyTo = subtractDays(dateFrom, 1);
    const early = await searchKiwi(origin, earlyFrom, earlyTo, currency, 5);

    if (early.length > 0) {
      const cheapestEarly = early[0];
      if (cheapestEarly.price < cheapest.price) {
        const savingPct = Math.round(((cheapest.price - cheapestEarly.price) / cheapest.price) * 100);
        if (savingPct >= 10) {
          deal.cheaperAlternative = {
            date: cheapestEarly.local_departure.slice(0, 10),
            price: cheapestEarly.price,
            savingPct,
          };
        }
      }
    }

    return NextResponse.json(deal);
  } catch (err) {
    console.error('[flights] Kiwi API error:', err);
    return NextResponse.json({ error: 'api_error' }, { status: 502 });
  }
}
