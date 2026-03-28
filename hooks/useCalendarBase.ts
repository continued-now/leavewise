'use client';

import { useState, useEffect, useMemo } from 'react';
import type { DayData, FormState } from '@/lib/types';
import { buildCalendarBase } from '@/lib/calendar-base';
import { parseDates, fetchHolidaysForSettings } from '@/lib/api';
import { computeLongWeekends } from '@/lib/longWeekends';

export function useCalendarBase(
  form: Pick<FormState, 'year' | 'country' | 'usState' | 'companyHolidaysRaw' | 'prebookedRaw'>,
  onError: (msg: string) => void
) {
  const [baseCalendar, setBaseCalendar] = useState<DayData[] | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  // When viewing the current year and we're past January, we need next year's months to fill 12
  const needsNextYear = form.year === currentYear && currentMonth > 0;

  useEffect(() => {
    let cancelled = false;
    setCalendarLoading(true);

    (async () => {
      try {
        const holidays = await fetchHolidaysForSettings(form.year, form.country, form.usState);
        if (cancelled) return;
        const companyHolidayDates = parseDates(form.companyHolidaysRaw);
        const prebookedDates = parseDates(form.prebookedRaw);
        const base = buildCalendarBase(form.year, holidays, companyHolidayDates, prebookedDates);

        if (needsNextYear) {
          // Fetch next year's holidays and build extra months
          try {
            const nextHolidays = await fetchHolidaysForSettings(form.year + 1, form.country, form.usState);
            if (cancelled) return;
            const nextBase = buildCalendarBase(form.year + 1, nextHolidays, companyHolidayDates, prebookedDates);
            // Only include months 0..(currentMonth-1) of next year to complete a rolling 12
            const cutoffMonth = currentMonth;
            const nextMonths = nextBase.filter((d) => d.date.getMonth() < cutoffMonth);
            setBaseCalendar([...base, ...nextMonths]);
          } catch {
            // If next year fetch fails, just show the current year
            setBaseCalendar(base);
          }
        } else {
          setBaseCalendar(base);
        }
      } catch (err) {
        if (!cancelled) {
          onError(err instanceof Error ? err.message : 'Holiday data unavailable — some dates may be missing');
        }
      } finally {
        if (!cancelled) setCalendarLoading(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country, form.usState, form.year, form.companyHolidaysRaw, form.prebookedRaw, needsNextYear]);

  const longWeekends = useMemo(() => {
    if (!baseCalendar) return [];
    const today = new Date().toISOString().slice(0, 10);
    return computeLongWeekends(baseCalendar, today);
  }, [baseCalendar]);

  const freeWeekends = useMemo(() => longWeekends.filter((w) => w.ptoCost === 0), [longWeekends]);
  const boostWeekends = useMemo(() => longWeekends.filter((w) => w.ptoCost > 0), [longWeekends]);

  return { baseCalendar, calendarLoading, longWeekends, freeWeekends, boostWeekends };
}
