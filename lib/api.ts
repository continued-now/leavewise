import { Holiday } from './types';
import type { CountryCode } from './types';
import { getStateHolidays } from './state-holidays';

export function parseDates(raw: string): string[] {
  return raw
    .split(/[\n,;\s]+/)
    .map((s) => s.trim().slice(0, 10))
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
}

/**
 * Korean substitute holidays (대체공휴일) — when a public holiday falls on
 * a weekend, the next available weekday is granted as a substitute.
 *
 * Substitute holiday law (대체공휴일제) coverage as of 2023:
 *  - All public holidays EXCEPT New Year's Day (신정) and Memorial Day (현충일)
 *  - Expanded in 2021 to cover Sat+Sun for most holidays
 *  - Expanded in 2023 to include Buddha's Birthday and Christmas
 *
 * Constitution Day (제헌절, Jul 17) reinstated as public holiday Jan 2026.
 *
 * Sources:
 *  - Korea Herald: https://www.koreaherald.com/article/10648348
 *  - Korea Herald (Constitution Day): https://www.koreaherald.com/article/10665867
 *  - Kim & Chang: https://www.kimchang.com/en/insights/detail.kc?sch_section=4&idx=23714
 *  - TimeAndDate: https://www.timeanddate.com/holidays/south-korea/
 *
 * Keyed by year. Last verified: 2026-03-26.
 */
const KR_SUBSTITUTE_HOLIDAYS: Record<number, { date: string; name: string; localName: string; replaces: string }[]> = {
  2026: [
    { date: '2026-03-02', name: 'Substitute Holiday (Independence Movement Day)', localName: '대체공휴일 (삼일절)', replaces: '2026-03-01' },
    { date: '2026-05-25', name: 'Substitute Holiday (Buddha\'s Birthday)', localName: '대체공휴일 (부처님오신날)', replaces: '2026-05-24' },
    { date: '2026-08-17', name: 'Substitute Holiday (Liberation Day)', localName: '대체공휴일 (광복절)', replaces: '2026-08-15' },
    { date: '2026-09-28', name: 'Substitute Holiday (Chuseok)', localName: '대체공휴일 (추석)', replaces: '2026-09-26' },
    { date: '2026-10-05', name: 'Substitute Holiday (National Foundation Day)', localName: '대체공휴일 (개천절)', replaces: '2026-10-03' },
  ],
  2027: [
    { date: '2027-02-09', name: 'Substitute Holiday (Seollal)', localName: '대체공휴일 (설날)', replaces: '2027-02-07' },
    { date: '2027-07-19', name: 'Substitute Holiday (Constitution Day)', localName: '대체공휴일 (제헌절)', replaces: '2027-07-17' },
    { date: '2027-08-16', name: 'Substitute Holiday (Liberation Day)', localName: '대체공휴일 (광복절)', replaces: '2027-08-15' },
    { date: '2027-10-04', name: 'Substitute Holiday (National Foundation Day)', localName: '대체공휴일 (개천절)', replaces: '2027-10-03' },
    { date: '2027-10-11', name: 'Substitute Holiday (Hangeul Day)', localName: '대체공휴일 (한글날)', replaces: '2027-10-09' },
    { date: '2027-12-27', name: 'Substitute Holiday (Christmas)', localName: '대체공휴일 (크리스마스)', replaces: '2027-12-25' },
  ],
};

/**
 * Korean holidays that Nager.Date API is missing entirely.
 * Constitution Day (제헌절) was reinstated as a public holiday in Jan 2026
 * but Nager.Date has not yet added it.
 */
const KR_EXTRA_HOLIDAYS: Record<number, { date: string; name: string; localName: string }[]> = {
  2026: [
    { date: '2026-07-17', name: 'Constitution Day', localName: '제헌절' },
  ],
  2027: [
    { date: '2027-07-17', name: 'Constitution Day', localName: '제헌절' },
  ],
};

/** Last date Korean holiday data was verified against government sources */
export const KR_SUBSTITUTE_HOLIDAYS_VERIFIED = '2026-03-26';

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
  if (country === 'KR') {
    const existingDates = new Set(holidays.map((h) => h.date));

    // Add holidays missing from Nager.Date (e.g. Constitution Day)
    const extras = KR_EXTRA_HOLIDAYS[year] ?? [];
    for (const extra of extras) {
      if (!existingDates.has(extra.date)) {
        existingDates.add(extra.date);
        holidays.push({
          date: extra.date,
          localName: extra.localName,
          name: extra.name,
          countryCode: 'KR',
          fixed: true,
          global: true,
          counties: null,
          types: ['Public'],
        });
      }
    }

    // Add substitute holidays (대체공휴일)
    const substitutes = KR_SUBSTITUTE_HOLIDAYS[year] ?? [];
    for (const sub of substitutes) {
      if (!existingDates.has(sub.date)) {
        holidays.push({
          date: sub.date,
          localName: sub.localName,
          name: sub.name,
          countryCode: 'KR',
          fixed: false,
          global: true,
          counties: null,
          types: ['Public'],
        });
      }
    }
  }
  return holidays;
}
