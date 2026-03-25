import { Holiday } from './types';
import type { CountryCode } from './types';
import { getStateHolidays } from './state-holidays';

export function parseDates(raw: string): string[] {
  return raw
    .split(/[\n,;\s]+/)
    .map((s) => s.trim().slice(0, 10))
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
}

export async function fetchHolidaysForSettings(
  year: number,
  country: CountryCode,
  usState: string
): Promise<Holiday[]> {
  const res = await fetch(`/api/holidays?year=${year}&country=${country}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to fetch holiday data');
  }
  let holidays: Holiday[] = await res.json();
  if (country === 'US') {
    holidays = holidays.filter(
      (h) =>
        h.global ||
        h.counties === null ||
        (Array.isArray(h.counties) && h.counties.includes(usState))
    );
    const stateHols = getStateHolidays(year, usState).map((sh) => ({
      date: sh.date,
      localName: sh.name,
      name: sh.name,
      countryCode: 'US',
      fixed: true,
      global: false,
      counties: [usState],
      types: ['Public'],
    }));
    holidays = [...holidays, ...stateHols];
  }
  return holidays;
}
