/**
 * Lightweight calendar base builder — no dependency on crowd-calendar or destinations.
 * Extracted from optimizer.ts so the client bundle doesn't pull in the full optimizer.
 */

import { Holiday, DayData } from './types';

function dateToStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function buildYearDays(
  year: number,
  publicHolidays: Holiday[],
  companyHolidayDates: string[],
  prebookedDates: string[]
): DayData[] {
  const days: DayData[] = [];

  const publicHolidayMap = new Map<string, string>();
  for (const h of publicHolidays) {
    if (!publicHolidayMap.has(h.date)) {
      publicHolidayMap.set(h.date, h.localName || h.name);
    }
  }

  const companyHolidaySet = new Set(companyHolidayDates);
  const prebookedSet = new Set(prebookedDates);

  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = dateToStr(d);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isHoliday = publicHolidayMap.has(dateStr);
    const isCompanyHoliday = companyHolidaySet.has(dateStr) && !isHoliday && !isWeekend;
    const isFree = isWeekend || isHoliday || isCompanyHoliday;
    const isPrebooked = prebookedSet.has(dateStr) && !isFree;

    days.push({
      dateStr,
      date: new Date(d),
      dayOfWeek: dow,
      isWeekend,
      isHoliday,
      isCompanyHoliday,
      holidayName: publicHolidayMap.get(dateStr) ?? (isCompanyHoliday ? 'Company Holiday' : undefined),
      isPrebooked,
      isPTO: isPrebooked,
      isFree,
      windowId: undefined,
      leaveType: isPrebooked ? 'prebooked' : undefined,
    });
  }

  return days;
}

/**
 * Build a base year calendar (holidays, weekends, company/prebooked days)
 * without running the optimizer. Used by the interactive calendar view.
 */
export function buildCalendarBase(
  year: number,
  publicHolidays: Holiday[],
  companyHolidayDates: string[],
  prebookedDates: string[]
): DayData[] {
  return buildYearDays(year, publicHolidays, companyHolidayDates, prebookedDates);
}
