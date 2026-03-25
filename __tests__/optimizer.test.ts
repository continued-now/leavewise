import { optimizePTO, buildCalendarBase } from '../lib/optimizer';
import { getBridgeSuggestions } from '../lib/bridge-suggestions';
import type { Holiday, LeavePool } from '../lib/types';

function makeHoliday(date: string, name: string): Holiday {
  return { date, localName: name, name, countryCode: 'US', fixed: true, global: true, types: ['Public'] };
}

const YEAR = 2026;

// 2026: Jan 1 = Thursday
const US_HOLIDAYS_2026: Holiday[] = [
  makeHoliday('2026-01-01', "New Year's Day"),  // Thursday
  makeHoliday('2026-01-19', 'MLK Day'),          // Monday
  makeHoliday('2026-02-16', "Presidents' Day"),  // Monday
  makeHoliday('2026-05-25', 'Memorial Day'),      // Monday
  makeHoliday('2026-07-03', 'Independence Day'),  // Friday (observed)
  makeHoliday('2026-09-07', 'Labor Day'),         // Monday
  makeHoliday('2026-11-26', 'Thanksgiving'),      // Thursday
  makeHoliday('2026-12-25', 'Christmas Day'),     // Friday
];

const BASE_POOL: LeavePool = { ptoDays: 15, compDays: 0, floatingHolidays: 0 };

// ─── buildCalendarBase ────────────────────────────────────────────────────────

describe('buildCalendarBase', () => {
  it('returns 365 days for 2026 (non-leap year)', () => {
    const days = buildCalendarBase(YEAR, [], [], []);
    expect(days).toHaveLength(365);
  });

  it('first day is Jan 1 2026, a Thursday (dayOfWeek 4)', () => {
    const days = buildCalendarBase(YEAR, [], [], []);
    expect(days[0].dateStr).toBe('2026-01-01');
    expect(days[0].dayOfWeek).toBe(4);
    expect(days[0].isWeekend).toBe(false);
  });

  it('Jan 3 2026 is Saturday — isWeekend and isFree', () => {
    const days = buildCalendarBase(YEAR, [], [], []);
    expect(days[2].dateStr).toBe('2026-01-03');
    expect(days[2].isWeekend).toBe(true);
    expect(days[2].isFree).toBe(true);
    expect(days[2].isHoliday).toBe(false);
  });

  it('marks a public holiday as isHoliday and isFree with correct name', () => {
    const days = buildCalendarBase(YEAR, [makeHoliday('2026-01-01', "New Year's Day")], [], []);
    expect(days[0].isHoliday).toBe(true);
    expect(days[0].isFree).toBe(true);
    expect(days[0].holidayName).toBe("New Year's Day");
  });

  it('marks a company holiday on a weekday as isCompanyHoliday and isFree', () => {
    const days = buildCalendarBase(YEAR, [], ['2026-01-02'], []); // Friday
    expect(days[1].dateStr).toBe('2026-01-02');
    expect(days[1].isCompanyHoliday).toBe(true);
    expect(days[1].isFree).toBe(true);
  });

  it('does NOT mark a company holiday on a weekend as isCompanyHoliday', () => {
    const days = buildCalendarBase(YEAR, [], ['2026-01-03'], []); // Saturday
    expect(days[2].isCompanyHoliday).toBe(false);
    expect(days[2].isWeekend).toBe(true);
  });

  it('marks a prebooked workday as isPrebooked and isPTO', () => {
    const days = buildCalendarBase(YEAR, [], [], ['2026-01-02']); // Friday
    expect(days[1].isPrebooked).toBe(true);
    expect(days[1].isPTO).toBe(true);
  });

  it('does NOT mark a prebooked date that is already free as isPrebooked', () => {
    // Jan 3 is a weekend — prebooking it should not count
    const days = buildCalendarBase(YEAR, [], [], ['2026-01-03']);
    expect(days[2].isPrebooked).toBe(false);
  });

  it('last day of year is Dec 31 2026', () => {
    const days = buildCalendarBase(YEAR, [], [], []);
    expect(days[364].dateStr).toBe('2026-12-31');
  });
});

// ─── optimizePTO ──────────────────────────────────────────────────────────────

describe('optimizePTO', () => {
  it('returns empty windows when leave pool is 0', () => {
    const pool: LeavePool = { ptoDays: 0, compDays: 0, floatingHolidays: 0 };
    const result = optimizePTO(YEAR, pool, US_HOLIDAYS_2026, [], []);
    expect(result.windows).toHaveLength(0);
    expect(result.totalLeaveUsed).toBe(0);
    expect(result.remainingLeave).toBe(0);
  });

  it('never exceeds the leave budget', () => {
    const pool: LeavePool = { ptoDays: 5, compDays: 0, floatingHolidays: 0 };
    const result = optimizePTO(YEAR, pool, US_HOLIDAYS_2026, [], []);
    expect(result.totalLeaveUsed).toBeLessThanOrEqual(5);
    expect(result.remainingLeave).toBeGreaterThanOrEqual(0);
    expect(result.totalLeaveUsed + result.remainingLeave).toBe(5);
  });

  it('all returned windows have efficiency >= 1.4', () => {
    const result = optimizePTO(YEAR, BASE_POOL, US_HOLIDAYS_2026, [], []);
    for (const w of result.windows) {
      expect(w.efficiency).toBeGreaterThanOrEqual(1.4);
    }
  });

  it('returns at least one window with enough PTO and holidays', () => {
    const pool: LeavePool = { ptoDays: 3, compDays: 0, floatingHolidays: 0 };
    const result = optimizePTO(YEAR, pool, US_HOLIDAYS_2026, [], []);
    expect(result.windows.length).toBeGreaterThan(0);
  });

  it('windows are sorted chronologically', () => {
    const result = optimizePTO(YEAR, BASE_POOL, US_HOLIDAYS_2026, [], []);
    for (let i = 1; i < result.windows.length; i++) {
      expect(result.windows[i].startDate.getTime()).toBeGreaterThanOrEqual(
        result.windows[i - 1].startDate.getTime()
      );
    }
  });

  it('returns at most 8 windows', () => {
    const pool: LeavePool = { ptoDays: 30, compDays: 0, floatingHolidays: 0 };
    const result = optimizePTO(YEAR, pool, US_HOLIDAYS_2026, [], []);
    expect(result.windows.length).toBeLessThanOrEqual(8);
  });

  it('respects the budgetCap option', () => {
    const result = optimizePTO(YEAR, BASE_POOL, US_HOLIDAYS_2026, [], [], undefined, {
      budgetCap: 3,
    });
    expect(result.totalLeaveUsed).toBeLessThanOrEqual(3);
  });

  it('compDays and floatingHolidays extend total budget', () => {
    const poolA: LeavePool = { ptoDays: 5, compDays: 0, floatingHolidays: 0 };
    const poolB: LeavePool = { ptoDays: 5, compDays: 3, floatingHolidays: 2 };
    const resultA = optimizePTO(YEAR, poolA, US_HOLIDAYS_2026, [], []);
    const resultB = optimizePTO(YEAR, poolB, US_HOLIDAYS_2026, [], []);
    expect(resultB.totalLeaveUsed).toBeGreaterThanOrEqual(resultA.totalLeaveUsed);
  });

  it('prebooked dates count against the budget', () => {
    const pool: LeavePool = { ptoDays: 5, compDays: 0, floatingHolidays: 0 };
    // Prebook 3 workdays — only 2 should be available for optimization
    const result = optimizePTO(YEAR, pool, US_HOLIDAYS_2026, [], [
      '2026-02-02', '2026-02-03', '2026-02-04',
    ]);
    expect(result.totalLeaveUsed).toBeLessThanOrEqual(5);
  });

  it('each window has non-empty date strings and positive days', () => {
    const result = optimizePTO(YEAR, BASE_POOL, US_HOLIDAYS_2026, [], []);
    for (const w of result.windows) {
      expect(w.startStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(w.endStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(w.totalDays).toBeGreaterThan(0);
      expect(w.ptoDaysUsed).toBeGreaterThan(0);
    }
  });

  it('processes locked windows and includes them in results', () => {
    // Lock Thanksgiving: Nov 26 (Thu) → take Nov 27 (Fri) = 1 PTO → 4 days off
    const result = optimizePTO(YEAR, BASE_POOL, US_HOLIDAYS_2026, [], [], undefined, {
      lockedWindows: [{ startStr: '2026-11-26', endStr: '2026-11-29', targetPTO: 1 }],
    });
    const win = result.windows.find(
      (w) => w.startStr <= '2026-11-26' && w.endStr >= '2026-11-26'
    );
    expect(win).toBeDefined();
    expect(win!.ptoDaysUsed).toBe(1);
  });

  it('windows do not overlap in dates', () => {
    const result = optimizePTO(YEAR, BASE_POOL, US_HOLIDAYS_2026, [], []);
    for (let i = 1; i < result.windows.length; i++) {
      expect(result.windows[i].startDate.getTime()).toBeGreaterThan(
        result.windows[i - 1].endDate.getTime()
      );
    }
  });

  it('respects maxWindowDays option', () => {
    const result = optimizePTO(YEAR, BASE_POOL, US_HOLIDAYS_2026, [], [], undefined, {
      maxWindowDays: 5,
    });
    for (const w of result.windows) {
      expect(w.totalDays).toBeLessThanOrEqual(5);
    }
  });
});

// ─── getBridgeSuggestions ─────────────────────────────────────────────────────

describe('getBridgeSuggestions', () => {
  const days = buildCalendarBase(YEAR, US_HOLIDAYS_2026, [], []);

  it('returns empty array for a date not in the calendar', () => {
    const options = getBridgeSuggestions('2025-01-01', days, 10, new Set());
    expect(options).toHaveLength(0);
  });

  it('returns a forward bridge for New Year\'s Day (Thu) toward the following weekend', () => {
    // Jan 1 (Thu holiday) → Jan 2 (Fri, 1 PTO) → Jan 3-4 (Sat-Sun) = 4-day break
    const options = getBridgeSuggestions('2026-01-01', days, 10, new Set());
    expect(options.length).toBeGreaterThan(0);
    const forward = options.find((o) => o.id === 'after');
    expect(forward).toBeDefined();
    expect(forward!.ptoCost).toBe(1);
    expect(forward!.totalDays).toBe(4);
    expect(forward!.efficiency).toBeCloseTo(4.0, 1);
  });

  it('does not suggest options exceeding ptoBudget', () => {
    // Budget = 0 → MAX_PTO = 0 → no workdays qualify
    const options = getBridgeSuggestions('2026-11-26', days, 0, new Set());
    expect(options).toHaveLength(0);
  });

  it('returns at most 3 suggestions', () => {
    const options = getBridgeSuggestions('2026-11-26', days, 10, new Set());
    expect(options.length).toBeLessThanOrEqual(3);
  });

  it('all suggestions have efficiency >= 1.4', () => {
    const options = getBridgeSuggestions('2026-12-25', days, 10, new Set());
    for (const opt of options) {
      expect(opt.efficiency).toBeGreaterThanOrEqual(1.4);
    }
  });

  it('excludes already-selected dates from bridge cost', () => {
    // Jan 2 is the only workday bridging Jan 1 holiday to the Jan 3-4 weekend
    // With Jan 2 already selected, no 'after' option is possible
    const alreadySelected = new Set(['2026-01-02']);
    const options = getBridgeSuggestions('2026-01-01', days, 10, alreadySelected);
    const forward = options.find((o) => o.id === 'after');
    expect(forward).toBeUndefined();
  });

  it('suggestions include the dates to add as PTO', () => {
    const options = getBridgeSuggestions('2026-01-01', days, 10, new Set());
    const forward = options.find((o) => o.id === 'after');
    expect(forward).toBeDefined();
    expect(forward!.daysToAdd).toContain('2026-01-02');
  });
});
