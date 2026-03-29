import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { fetchHolidaysServer } from '@/lib/api.server';
import { parseDates } from '@/lib/api';
import { optimizePTO } from '@/lib/optimizer';
import type { CountryCode, OptimizationResult } from '@/lib/types';

const LockedWindowSchema = z.object({
  startStr: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endStr: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  targetPTO: z.number().int().min(0).max(365),
});

const BodySchema = z.object({
  country: z.enum(['US', 'KR']),
  year: z.number().int().min(2020).max(2035),
  usState: z.string().default(''),
  leavePool: z.object({
    ptoDays: z.number().int().min(0).max(365),
    compDays: z.number().int().min(0).max(365),
    floatingHolidays: z.number().int().min(0).max(365),
  }),
  daysToAllocate: z.number().int().min(0).max(365),
  maxDaysPerWindow: z.number().int().min(1).max(60).default(14),
  companyHolidaysRaw: z.string().default(''),
  prebookedRaw: z.string().default(''),
  travelValueWeight: z.number().min(0).max(1).default(0),
  lockedWindows: z.array(LockedWindowSchema).default([]),
  // When true, run all 3 strategies (short/balanced/long)
  allStrategies: z.boolean().default(false),
});

/**
 * Serialize an OptimizationResult for JSON transport.
 * Converts Date objects to ISO strings so the client can rehydrate them.
 */
function serializeResult(result: OptimizationResult) {
  return {
    ...result,
    days: result.days.map((d) => ({
      ...d,
      date: d.date.toISOString(),
    })),
    windows: result.windows.map((w) => ({
      ...w,
      startDate: w.startDate.toISOString(),
      endDate: w.endDate.toISOString(),
    })),
  };
}

// Cache key for deterministic results
function buildCacheKey(body: z.infer<typeof BodySchema>): string {
  return JSON.stringify({
    c: body.country,
    y: body.year,
    s: body.usState,
    lp: body.leavePool,
    da: body.daysToAllocate,
    mx: body.maxDaysPerWindow,
    ch: body.companyHolidaysRaw,
    pb: body.prebookedRaw,
    tw: body.travelValueWeight,
    lw: body.lockedWindows,
    as: body.allStrategies,
  });
}

export async function POST(request: NextRequest) {
  // Rate limit: 20 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const rl = checkRateLimit(`optimize:${ip}`, 20);
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

  let body: z.infer<typeof BodySchema>;
  try {
    const raw = await request.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const holidays = await fetchHolidaysServer(
      body.year,
      body.country as CountryCode,
      body.usState
    );
    const companyHolidayDates = parseDates(body.companyHolidaysRaw);
    const prebookedDates = parseDates(body.prebookedRaw);

    const baseOpts = {
      budgetCap: body.daysToAllocate,
      lockedWindows: body.lockedWindows,
      travelValueWeight: body.travelValueWeight,
      homeCountry: body.country as 'US' | 'KR',
    };

    if (body.allStrategies) {
      // Run all 3 strategies in parallel
      const [balanced, short, long] = await Promise.all([
        Promise.resolve(optimizePTO(
          body.year, body.leavePool, holidays, companyHolidayDates, prebookedDates,
          body.country, { ...baseOpts, maxWindowDays: body.maxDaysPerWindow, strategy: 'balanced' }
        )),
        Promise.resolve(optimizePTO(
          body.year, body.leavePool, holidays, companyHolidayDates, prebookedDates,
          body.country, { ...baseOpts, maxWindowDays: 5, strategy: 'short' }
        )),
        Promise.resolve(optimizePTO(
          body.year, body.leavePool, holidays, companyHolidayDates, prebookedDates,
          body.country, { ...baseOpts, maxWindowDays: 28, strategy: 'long' }
        )),
      ]);

      const responseBody = {
        balanced: serializeResult(balanced),
        short: serializeResult(short),
        long: serializeResult(long),
      };

      return NextResponse.json(responseBody, {
        headers: {
          'Cache-Control': 'private, max-age=300',
          'X-RateLimit-Remaining': String(rl.remaining),
        },
      });
    }

    // Single strategy (used for allocation adjustments)
    const result = optimizePTO(
      body.year, body.leavePool, holidays, companyHolidayDates, prebookedDates,
      body.country, { ...baseOpts, maxWindowDays: body.maxDaysPerWindow, strategy: 'balanced' }
    );

    return NextResponse.json(
      { balanced: serializeResult(result) },
      {
        headers: {
          'Cache-Control': 'private, max-age=300',
          'X-RateLimit-Remaining': String(rl.remaining),
        },
      }
    );
  } catch (err) {
    console.error('[optimize] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Optimization failed' },
      { status: 500 }
    );
  }
}
