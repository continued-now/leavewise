import { DayData } from './types';

export interface LongWeekendPreview {
  id: string;
  holidayNames: string[];
  startStr: string;
  endStr: string;
  totalDays: number;
  ptoCost: number;       // 0 = completely free, >0 = bridge PTO needed
  bridgeDates: string[]; // workday dates that would be PTO for the bridge
}

/**
 * Given a full year's DayData (with holidays/weekends marked), compute
 * upcoming long weekend opportunities anchored on public holidays.
 *
 * Returns sorted upcoming results (startStr >= today).
 */
export function computeLongWeekends(
  days: DayData[],
  today: string,
  maxPTOBridge = 3
): LongWeekendPreview[] {
  const results: LongWeekendPreview[] = [];
  const consumed = new Set<number>(); // indices already claimed by a result

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    if (!day.isHoliday || !day.holidayName) continue;
    if (consumed.has(i)) continue;

    // Expand free cluster around this holiday (holiday + adjacent weekends/holidays)
    let cs = i;
    let ce = i;
    while (cs > 0 && days[cs - 1].isFree) cs--;
    while (ce < days.length - 1 && days[ce + 1].isFree) ce++;

    const clusterSize = ce - cs + 1;
    const holidayNames = days
      .slice(cs, ce + 1)
      .filter((d) => d.isHoliday && d.holidayName)
      .map((d) => d.holidayName!)
      .filter((n, idx, arr) => arr.indexOf(n) === idx);

    // Helper: find best bridge option
    const tryBridge = (): { start: number; end: number; ptoCost: number; dates: string[] } | null => {
      // Find nearest free cluster before the current cluster
      let prevFreeEnd = -1;
      let prevFreeStart = -1;
      for (let j = cs - 1; j >= Math.max(0, cs - maxPTOBridge - 5); j--) {
        if (days[j].isFree) {
          prevFreeEnd = j;
          prevFreeStart = j;
          while (prevFreeStart > 0 && days[prevFreeStart - 1].isFree) prevFreeStart--;
          break;
        }
      }

      // Find nearest free cluster after the current cluster
      let nextFreeStart = -1;
      let nextFreeEnd = -1;
      for (let j = ce + 1; j <= Math.min(days.length - 1, ce + maxPTOBridge + 5); j++) {
        if (days[j].isFree) {
          nextFreeStart = j;
          nextFreeEnd = j;
          while (nextFreeEnd < days.length - 1 && days[nextFreeEnd + 1].isFree) nextFreeEnd++;
          break;
        }
      }

      const bridgeBefore: string[] = [];
      if (prevFreeEnd >= 0) {
        for (let j = prevFreeEnd + 1; j < cs; j++) {
          if (!days[j].isFree) bridgeBefore.push(days[j].dateStr);
        }
      }

      const bridgeAfter: string[] = [];
      if (nextFreeStart >= 0) {
        for (let j = ce + 1; j < nextFreeStart; j++) {
          if (!days[j].isFree) bridgeAfter.push(days[j].dateStr);
        }
      }

      // Score each option: prefer higher total days per PTO cost, min 4 days total
      type Option = { start: number; end: number; ptoCost: number; dates: string[] };
      const options: Option[] = [];

      if (bridgeAfter.length > 0 && bridgeAfter.length <= maxPTOBridge) {
        const totalDays = nextFreeEnd - cs + 1;
        if (totalDays >= 4) {
          options.push({ start: cs, end: nextFreeEnd, ptoCost: bridgeAfter.length, dates: bridgeAfter });
        }
      }
      if (bridgeBefore.length > 0 && bridgeBefore.length <= maxPTOBridge) {
        const totalDays = ce - prevFreeStart + 1;
        if (totalDays >= 4) {
          options.push({ start: prevFreeStart, end: ce, ptoCost: bridgeBefore.length, dates: bridgeBefore });
        }
      }
      if (
        bridgeBefore.length > 0 && bridgeAfter.length > 0 &&
        bridgeBefore.length + bridgeAfter.length <= maxPTOBridge &&
        prevFreeStart >= 0 && nextFreeEnd >= 0
      ) {
        const totalDays = nextFreeEnd - prevFreeStart + 1;
        if (totalDays >= 5) {
          options.push({
            start: prevFreeStart,
            end: nextFreeEnd,
            ptoCost: bridgeBefore.length + bridgeAfter.length,
            dates: [...bridgeBefore, ...bridgeAfter],
          });
        }
      }

      if (options.length === 0) return null;
      // Pick the most efficient option (most days per PTO day)
      return options.sort(
        (a, b) =>
          (b.end - b.start + 1) / b.ptoCost -
          (a.end - a.start + 1) / a.ptoCost
      )[0];
    };

    if (clusterSize >= 3) {
      // Natural long weekend — only include upcoming ones
      if (days[ce].dateStr >= today) {
        for (let j = cs; j <= ce; j++) consumed.add(j);
        results.push({
          id: day.dateStr,
          holidayNames,
          startStr: days[cs].dateStr,
          endStr: days[ce].dateStr,
          totalDays: clusterSize,
          ptoCost: 0,
          bridgeDates: [],
        });
      }
    } else {
      // Look for a bridge option
      const bridge = tryBridge();
      if (bridge && days[bridge.end].dateStr >= today) {
        for (let j = cs; j <= ce; j++) consumed.add(j);
        results.push({
          id: day.dateStr,
          holidayNames,
          startStr: days[bridge.start].dateStr,
          endStr: days[bridge.end].dateStr,
          totalDays: bridge.end - bridge.start + 1,
          ptoCost: bridge.ptoCost,
          bridgeDates: bridge.dates,
        });
      }
    }
  }

  return results.sort((a, b) => a.startStr.localeCompare(b.startStr));
}

/** Format YYYY-MM-DD as "Mon Apr 6" */
export function formatPreviewDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
