import { NextRequest, NextResponse } from 'next/server';
import { buildKiwiLink } from '@/lib/affiliates';
import type { FlightDeal } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limit';

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
  const origin = searchParams.get('origin');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const currency = searchParams.get('currency') ?? 'USD';

  if (!origin || !dateFrom || !dateTo) {
    return NextResponse.json({ error: 'Missing origin, dateFrom, or dateTo' }, { status: 400 });
  }

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

  // Basic input sanitation
  const originClean = origin.replace(/[^A-Z]/gi, '').slice(0, 3).toUpperCase();
  const currClean = currency.replace(/[^A-Z]/gi, '').slice(0, 3).toUpperCase();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFrom) || !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  const affiliateId = process.env.KIWI_AFFILIATE_ID ?? '';

  try {
    // Primary search: flights departing within the window
    const primary = await searchKiwi(originClean, dateFrom, dateTo, currClean, 5);

    if (primary.length === 0) {
      return NextResponse.json(null);
    }

    const cheapest = primary[0];
    const deal: FlightDeal = {
      price: cheapest.price,
      currency: currClean,
      deeplink: buildKiwiLink(cheapest.deep_link, affiliateId),
      destination: cheapest.cityTo,
    };

    // Cheaper-day check: look at 3 days *before* the window starts
    const earlyFrom = subtractDays(dateFrom, 3);
    const earlyTo = subtractDays(dateFrom, 1);
    const early = await searchKiwi(originClean, earlyFrom, earlyTo, currClean, 5);

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
  } catch {
    return NextResponse.json(null);
  }
}
