import {
  Holiday,
  DayData,
  VacationWindow,
  OptimizationResult,
  LeavePool,
} from './types';
import { analyzeUSPayInsights } from './usHolidayPay';
import { analyzeWindowCrowding } from './crowd-calendar';
import { getDestinationSuggestions } from './destinations';

function dateToStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildYearDays(
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

function scoreWindow(
  days: DayData[],
  start: number,
  end: number
): { ptoCost: number; totalDays: number; efficiency: number; holidays: string[] } {
  let ptoCost = 0;
  const holidays: string[] = [];

  for (let i = start; i <= end; i++) {
    const d = days[i];
    if (!d.isFree && !d.isPrebooked) {
      ptoCost++;
    }
    if ((d.isHoliday || d.isCompanyHoliday) && d.holidayName && !holidays.includes(d.holidayName)) {
      holidays.push(d.holidayName);
    }
  }

  const totalDays = end - start + 1;
  const efficiency = ptoCost > 0 ? totalDays / ptoCost : 0;

  return { ptoCost, totalDays, efficiency, holidays };
}

function scoreWindowFiltered(
  days: DayData[],
  start: number,
  end: number,
  skip: Set<number>
): { ptoCost: number; totalDays: number; efficiency: number; holidays: string[] } {
  let ptoCost = 0;
  const holidays: string[] = [];

  for (let i = start; i <= end; i++) {
    const d = days[i];
    if (!d.isFree && !d.isPrebooked && !skip.has(i)) {
      ptoCost++;
    }
    if ((d.isHoliday || d.isCompanyHoliday) && d.holidayName && !holidays.includes(d.holidayName)) {
      holidays.push(d.holidayName);
    }
  }

  const totalDays = end - start + 1;
  const efficiency = ptoCost > 0 ? totalDays / ptoCost : 0;

  return { ptoCost, totalDays, efficiency, holidays };
}

function adjustWindowToPTO(
  days: DayData[],
  startIdx: number,
  endIdx: number,
  targetPTO: number,
  usedIndices: Set<number>
): { start: number; end: number } {
  let s = startIdx;
  let e = endIdx;

  const countPTO = (): number => {
    let n = 0;
    for (let i = s; i <= e; i++) {
      if (!days[i].isFree && !days[i].isPrebooked && !usedIndices.has(i)) n++;
    }
    return n;
  };

  let pto = countPTO();

  if (pto < targetPTO) {
    // Extend right first, then left
    while (pto < targetPTO && e + 1 < days.length && !usedIndices.has(e + 1)) {
      e++;
      pto = countPTO();
    }
    while (pto < targetPTO && s - 1 >= 0 && !usedIndices.has(s - 1)) {
      s--;
      pto = countPTO();
    }
  } else if (pto > targetPTO) {
    // Shrink from right first, then left
    while (pto > targetPTO && e > s) {
      e--;
      pto = countPTO();
    }
    while (pto > targetPTO && s < e) {
      s++;
      pto = countPTO();
    }
  }

  return { start: s, end: e };
}

function formatSkyscannerDate(date: Date): string {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function buildWindowLabel(
  startDate: Date,
  endDate: Date,
  totalDays: number,
  holidays: string[]
): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const sm = months[startDate.getMonth()];
  const em = months[endDate.getMonth()];
  const sd = startDate.getDate();
  const ed = endDate.getDate();
  const dateRange = sm === em ? `${sm} ${sd}–${ed}` : `${sm} ${sd} – ${em} ${ed}`;

  if (holidays.length > 0) {
    return `${dateRange} · Around ${holidays[0]}`;
  }
  if (totalDays >= 14) return `${dateRange} · Extended break`;
  if (totalDays >= 7) return `${dateRange} · Full week away`;
  return `${dateRange} · Long weekend`;
}

export interface LockedWindow {
  startStr: string;
  endStr: string;
  targetPTO: number;
}

export interface OptimizerOptions {
  /** Max total days in any single window (default 28) */
  maxWindowDays?: number;
  /** Cap total leave days used, regardless of pool size (default = pool total) */
  budgetCap?: number;
  /** Windows to lock to a specific PTO allocation; optimizer extends/shrinks to match */
  lockedWindows?: LockedWindow[];
  /**
   * 0 = optimize purely for PTO efficiency (default)
   * 1 = optimize purely for travel value (avoid peak-crowd periods)
   * 0.4 = balanced blend
   */
  travelValueWeight?: number;
  /** Home country of the user — used for destination suggestions */
  homeCountry?: 'US' | 'KR';
  /** Strategy bias: 'short' favors many small windows, 'long' favors fewer big ones */
  strategy?: 'short' | 'balanced' | 'long';
}

export function optimizePTO(
  year: number,
  leavePool: LeavePool,
  publicHolidays: Holiday[],
  companyHolidayDates: string[],
  prebookedDates: string[],
  country?: string,
  options: OptimizerOptions = {}
): OptimizationResult {
  const {
    maxWindowDays = 28,
    budgetCap,
    lockedWindows = [],
    travelValueWeight = 0,
    homeCountry = 'US',
    strategy = 'balanced',
  } = options;

  const days = buildYearDays(year, publicHolidays, companyHolidayDates, prebookedDates);

  const prebookedCount = days.filter((d) => d.isPrebooked).length;
  const totalLeave = leavePool.ptoDays + leavePool.compDays + leavePool.floatingHolidays;
  const effectiveBudget = budgetCap != null ? Math.min(budgetCap, totalLeave) : totalLeave;
  let budgetLeft = Math.max(0, effectiveBudget - prebookedCount);

  // Build date → index map
  const dateToIdx = new Map<string, number>();
  for (let i = 0; i < days.length; i++) {
    dateToIdx.set(days[i].dateStr, i);
  }

  // Strategy-dependent parameters
  const MIN_EFFICIENCY = strategy === 'long' ? 1.15 : 1.4;
  const MAX_WINDOWS = strategy === 'short' ? 12 : strategy === 'long' ? 4 : 8;

  interface Candidate {
    start: number;
    end: number;
    ptoCost: number;
    totalDays: number;
    efficiency: number;
    holidays: string[];
  }

  const usedIndices = new Set<number>();
  const selectedWindows: Candidate[] = [];
  let totalLeaveUsed = prebookedCount;

  // ── Process locked windows first ──────────────────────────────────────
  for (const lw of lockedWindows) {
    if (lw.targetPTO <= 0) continue;
    const startIdx = dateToIdx.get(lw.startStr);
    const endIdx = dateToIdx.get(lw.endStr);
    if (startIdx == null || endIdx == null) continue;

    const target = Math.min(lw.targetPTO, budgetLeft);
    if (target <= 0) continue;

    const { start: s, end: e } = adjustWindowToPTO(days, startIdx, endIdx, target, usedIndices);
    const score = scoreWindowFiltered(days, s, e, usedIndices);

    if (score.ptoCost > budgetLeft) continue;

    selectedWindows.push({ start: s, end: e, ...score });
    budgetLeft -= score.ptoCost;
    totalLeaveUsed += score.ptoCost;

    for (let i = s; i <= e; i++) {
      usedIndices.add(i);
      if (!days[i].isFree && !days[i].isPrebooked) {
        days[i].isPTO = true;
        days[i].leaveType = 'pto';
      }
    }
  }

  // ── Normal greedy optimization on remaining days ──────────────────────
  const candidates: Candidate[] = [];

  for (let s = 0; s < days.length; s++) {
    if (usedIndices.has(s)) continue;
    const limit = Math.min(s + maxWindowDays, days.length);
    for (let e = s; e < limit; e++) {
      if (usedIndices.has(e)) break; // don't span locked windows
      const score = scoreWindow(days, s, e);
      if (score.ptoCost === 0) continue;
      if (score.efficiency < MIN_EFFICIENCY) continue;
      if (score.ptoCost > budgetLeft) continue;
      candidates.push({ start: s, end: e, ...score });
    }
  }

  // Optionally blend travel-value score into the ranking
  const travelScoreMap = new Map<(typeof candidates)[0], number>();
  if (travelValueWeight > 0) {
    for (const c of candidates) {
      const { travelValueScore } = analyzeWindowCrowding(
        days[c.start].dateStr,
        days[c.end].dateStr,
        year
      );
      travelScoreMap.set(c, travelValueScore);
    }
  }

  const maxEff = candidates.reduce((m, c) => Math.max(m, c.efficiency), MIN_EFFICIENCY);

  const maxTotalDays = candidates.reduce((m, c) => Math.max(m, c.totalDays), 1);

  candidates.sort((a, b) => {
    if (travelValueWeight === 0 && strategy === 'balanced') {
      const diff = b.efficiency - a.efficiency;
      if (Math.abs(diff) > 0.05) return diff;
      return b.totalDays - a.totalDays;
    }

    const normalizeEff = (e: number) =>
      maxEff > MIN_EFFICIENCY ? (e - MIN_EFFICIENCY) / (maxEff - MIN_EFFICIENCY) : 1;

    // Strategy bias: short prefers high-efficiency small windows, long prefers bigger windows
    let scoreA = normalizeEff(a.efficiency);
    let scoreB = normalizeEff(b.efficiency);

    if (strategy === 'short') {
      // Penalize longer windows — prefer 1-2 PTO day bridges
      const shortBonusA = 1 - (a.ptoCost / Math.max(budgetLeft, effectiveBudget, 1));
      const shortBonusB = 1 - (b.ptoCost / Math.max(budgetLeft, effectiveBudget, 1));
      scoreA = 0.6 * scoreA + 0.4 * shortBonusA;
      scoreB = 0.6 * scoreB + 0.4 * shortBonusB;
    } else if (strategy === 'long') {
      // Favor bigger windows — weight total days heavily
      const sizeA = a.totalDays / maxTotalDays;
      const sizeB = b.totalDays / maxTotalDays;
      scoreA = 0.3 * scoreA + 0.7 * sizeA;
      scoreB = 0.3 * scoreB + 0.7 * sizeB;
    }

    if (travelValueWeight > 0) {
      const tvA = (travelScoreMap.get(a) ?? 50) / 100;
      const tvB = (travelScoreMap.get(b) ?? 50) / 100;
      scoreA = (1 - travelValueWeight) * scoreA + travelValueWeight * tvA;
      scoreB = (1 - travelValueWeight) * scoreB + travelValueWeight * tvB;
    }

    return scoreB - scoreA;
  });

  for (const c of candidates) {
    if (budgetLeft <= 0) break;
    if (selectedWindows.length >= MAX_WINDOWS) break;
    if (c.ptoCost > budgetLeft) continue;

    let overlap = false;
    for (let i = c.start; i <= c.end; i++) {
      if (usedIndices.has(i)) { overlap = true; break; }
    }
    if (overlap) continue;

    selectedWindows.push(c);
    budgetLeft -= c.ptoCost;
    totalLeaveUsed += c.ptoCost;

    for (let i = c.start; i <= c.end; i++) {
      usedIndices.add(i);
      if (!days[i].isFree && !days[i].isPrebooked) {
        days[i].isPTO = true;
        days[i].leaveType = 'pto';
      }
      days[i].windowId = selectedWindows.length;
    }
  }

  // Sort chronologically
  selectedWindows.sort((a, b) => a.start - b.start);

  const vacationWindows: VacationWindow[] = selectedWindows.map((c, idx) => {
    const startDate = days[c.start].date;
    const endDate = days[c.end].date;
    const wid = idx + 1;

    for (let i = c.start; i <= c.end; i++) {
      days[i].windowId = wid;
    }

    const startStr = days[c.start].dateStr;
    const endStr = days[c.end].dateStr;

    // Travel value enrichment
    const crowdResult = analyzeWindowCrowding(startStr, endStr, year);
    const destinationIdeas = getDestinationSuggestions(
      startStr,
      endStr,
      homeCountry,
      crowdResult.crowdInsights
    );

    return {
      id: wid,
      startDate,
      endDate,
      startStr,
      endStr,
      totalDays: c.totalDays,
      ptoDaysUsed: c.ptoCost,
      efficiency: c.efficiency,
      holidays: c.holidays,
      month: startDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      skyscannerUrl: `https://www.skyscanner.net/transport/flights/anywhere/anywhere/${formatSkyscannerDate(startDate)}/${formatSkyscannerDate(endDate)}/?adults=1&adultsv2=1`,
      label: buildWindowLabel(startDate, endDate, c.totalDays, c.holidays),
      crowdInsights: crowdResult.crowdInsights,
      destinationIdeas,
      travelValueScore: crowdResult.travelValueScore,
    };
  });

  const totalDaysOff = vacationWindows.reduce((sum, w) => sum + w.totalDays, 0);

  if (country === 'US') {
    analyzeUSPayInsights(vacationWindows, days);
  }

  return {
    days,
    windows: vacationWindows,
    totalLeaveUsed,
    remainingLeave: budgetLeft,
    totalDaysOff,
  };
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
