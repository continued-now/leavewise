import { DayData, VacationWindow, BookendRisk } from './types';

// Federal holidays commonly associated with premium/double pay in the US
const PREMIUM_PAY_HOLIDAY_KEYWORDS = [
  "New Year's Day",
  'Martin Luther King',
  "Washington's Birthday",
  'Presidents',
  'Memorial Day',
  'Juneteenth',
  'Independence Day',
  'Labor Day',
  'Columbus Day',
  'Veterans Day',
  'Thanksgiving',
  'Christmas',
];

function isPremiumPayHoliday(name: string): boolean {
  return PREMIUM_PAY_HOLIDAY_KEYWORDS.some((kw) =>
    name.toLowerCase().includes(kw.toLowerCase())
  );
}

/**
 * For a given holiday date index in `days`, find the nearest workday before it
 * (skip backwards over weekends and other holidays).
 */
function nearestWorkdayBefore(days: DayData[], holidayIdx: number): number | null {
  for (let i = holidayIdx - 1; i >= 0; i--) {
    if (!days[i].isFree) return i;
  }
  return null;
}

/**
 * For a given holiday date index in `days`, find the nearest workday after it.
 */
function nearestWorkdayAfter(days: DayData[], holidayIdx: number): number | null {
  for (let i = holidayIdx + 1; i < days.length; i++) {
    if (!days[i].isFree) return i;
  }
  return null;
}

/**
 * Annotates each vacation window with:
 * - bookendRisks: holidays where adjacent PTO days would forfeit holiday pay
 * - premiumPayDays: holidays that fall on weekdays (working them earns double/premium pay)
 *
 * Mutates `windows` in place.
 */
export function analyzeUSPayInsights(
  windows: VacationWindow[],
  days: DayData[]
): void {
  // Build a fast lookup: dateStr → index in days array
  const dateIndexMap = new Map<string, number>();
  for (let i = 0; i < days.length; i++) {
    dateIndexMap.set(days[i].dateStr, i);
  }

  // Build a set of all window day indices per window id for O(1) membership tests
  const windowDaySet = new Map<number, Set<number>>();
  for (let i = 0; i < days.length; i++) {
    const wid = days[i].windowId;
    if (wid == null) continue;
    if (!windowDaySet.has(wid)) windowDaySet.set(wid, new Set());
    windowDaySet.get(wid)!.add(i);
  }

  for (const w of windows) {
    const myDays = windowDaySet.get(w.id) ?? new Set<number>();
    const bookendRisks: BookendRisk[] = [];
    const premiumPayDays: string[] = [];

    // Find all holidays that fall within the window
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (!myDays.has(i)) continue;
      if (!day.isHoliday || !day.holidayName) continue;

      // --- Premium pay check ---
      // Holiday falls on a weekday → working it could earn double pay
      if (!day.isWeekend && isPremiumPayHoliday(day.holidayName)) {
        premiumPayDays.push(day.holidayName);
      }

      // --- Bookend risk check ---
      // The "bookend rule": to receive holiday pay you must work the workday
      // immediately before AND after the holiday. If either of those workdays
      // is inside the vacation window (i.e., the employee is taking PTO), they
      // risk forfeiting holiday pay for this holiday.
      const beforeIdx = nearestWorkdayBefore(days, i);
      const afterIdx = nearestWorkdayAfter(days, i);

      const riskBefore = beforeIdx != null && myDays.has(beforeIdx);
      const riskAfter = afterIdx != null && myDays.has(afterIdx);

      if (riskBefore || riskAfter) {
        bookendRisks.push({
          holidayName: day.holidayName,
          holidayDate: day.dateStr,
          riskBefore,
          riskAfter,
        });
      }
    }

    w.bookendRisks = bookendRisks.length > 0 ? bookendRisks : undefined;
    w.premiumPayDays = premiumPayDays.length > 0 ? premiumPayDays : undefined;
  }
}
