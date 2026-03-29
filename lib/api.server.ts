import type { CountryCode } from './types';
import type { Holiday } from './types';
import { applyHolidayAdjustments } from './api';

/**
 * Server-side holiday fetcher — calls Nager.Date directly (not via /api/holidays).
 * Used by the /api/optimize route to avoid internal HTTP round-trips.
 *
 * Keep this file server-only. Do not import it from client components.
 */
export async function fetchHolidaysServer(
  year: number,
  country: CountryCode,
  usState: string
): Promise<Holiday[]> {
  const res = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`,
    { headers: { Accept: 'application/json' } }
  );
  if (!res.ok) {
    throw new Error(`Holiday data not available for ${country} ${year}`);
  }
  const holidays: Holiday[] = await res.json();
  return applyHolidayAdjustments(holidays, year, country, usState);
}
