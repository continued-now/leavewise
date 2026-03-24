import { DayData } from './types';

export interface BridgeOption {
  id: string;
  label: string;
  ptoCost: number;
  totalDays: number;
  efficiency: number;
  startStr: string;
  endStr: string;
  daysToAdd: string[];    // workdays to mark as PTO
  rationale: string;
}

function getWorkdaysInRange(
  days: DayData[],
  from: number,
  to: number,
  exclude: Set<string>
): DayData[] {
  const result: DayData[] = [];
  for (let i = from; i <= to; i++) {
    const d = days[i];
    if (!d.isFree && !d.isPrebooked && !exclude.has(d.dateStr)) {
      result.push(d);
    }
  }
  return result;
}

function describeCluster(days: DayData[], startIdx: number): string {
  const d = days[startIdx];
  if (d.isHoliday && d.holidayName) return d.holidayName;
  if (d.isWeekend) return 'weekend';
  return 'free period';
}

export function getBridgeSuggestions(
  holidayDateStr: string,
  days: DayData[],
  ptoBudget: number,
  alreadySelected: Set<string>
): BridgeOption[] {
  const holidayIdx = days.findIndex((d) => d.dateStr === holidayDateStr);
  if (holidayIdx === -1) return [];

  // Expand the free cluster containing this holiday
  let clusterStart = holidayIdx;
  while (clusterStart > 0 && days[clusterStart - 1].isFree) clusterStart--;
  let clusterEnd = holidayIdx;
  while (clusterEnd < days.length - 1 && days[clusterEnd + 1].isFree) clusterEnd++;

  // Find nearest free cluster BEFORE clusterStart
  let prevFreeEnd = -1;
  let prevFreeStart = -1;
  for (let i = clusterStart - 1; i >= 0; i--) {
    if (days[i].isFree) {
      prevFreeEnd = i;
      prevFreeStart = i;
      while (prevFreeStart > 0 && days[prevFreeStart - 1].isFree) prevFreeStart--;
      break;
    }
  }

  // Find nearest free cluster AFTER clusterEnd
  let nextFreeStart = -1;
  let nextFreeEnd = -1;
  for (let i = clusterEnd + 1; i < days.length; i++) {
    if (days[i].isFree) {
      nextFreeStart = i;
      nextFreeEnd = i;
      while (nextFreeEnd < days.length - 1 && days[nextFreeEnd + 1].isFree) nextFreeEnd++;
      break;
    }
  }

  const options: BridgeOption[] = [];
  const MAX_PTO = Math.min(ptoBudget, 8);
  const MIN_EFF = 1.4;

  // Option A: Bridge backward
  if (prevFreeEnd >= 0 && prevFreeEnd + 1 < clusterStart) {
    const workdays = getWorkdaysInRange(days, prevFreeEnd + 1, clusterStart - 1, alreadySelected);
    const totalDays = clusterEnd - prevFreeStart + 1;
    const eff = workdays.length > 0 ? totalDays / workdays.length : 0;

    if (workdays.length > 0 && workdays.length <= MAX_PTO && eff >= MIN_EFF) {
      const desc = describeCluster(days, prevFreeStart);
      options.push({
        id: 'before',
        label: `${workdays.length} day${workdays.length > 1 ? 's' : ''} before → ${totalDays}-day break`,
        ptoCost: workdays.length,
        totalDays,
        efficiency: eff,
        startStr: days[prevFreeStart].dateStr,
        endStr: days[clusterEnd].dateStr,
        daysToAdd: workdays.map((d) => d.dateStr),
        rationale: `Add ${workdays.length} PTO day${workdays.length > 1 ? 's' : ''} before to bridge into the ${desc}. You get ${totalDays} consecutive days off — ${Math.round((eff - 1) * 100)}% more than PTO spent.`,
      });
    }
  }

  // Option B: Bridge forward
  if (nextFreeStart >= 0 && clusterEnd + 1 < nextFreeStart) {
    const workdays = getWorkdaysInRange(days, clusterEnd + 1, nextFreeStart - 1, alreadySelected);
    const totalDays = nextFreeEnd - clusterStart + 1;
    const eff = workdays.length > 0 ? totalDays / workdays.length : 0;

    if (workdays.length > 0 && workdays.length <= MAX_PTO && eff >= MIN_EFF) {
      const desc = describeCluster(days, nextFreeStart);
      options.push({
        id: 'after',
        label: `${workdays.length} day${workdays.length > 1 ? 's' : ''} after → ${totalDays}-day break`,
        ptoCost: workdays.length,
        totalDays,
        efficiency: eff,
        startStr: days[clusterStart].dateStr,
        endStr: days[nextFreeEnd].dateStr,
        daysToAdd: workdays.map((d) => d.dateStr),
        rationale: `Add ${workdays.length} PTO day${workdays.length > 1 ? 's' : ''} after to bridge into the ${desc}. You get ${totalDays} consecutive days off — ${Math.round((eff - 1) * 100)}% more than PTO spent.`,
      });
    }
  }

  // Option C: Bridge both sides
  if (prevFreeEnd >= 0 && nextFreeStart >= 0) {
    const beforeWorkdays = getWorkdaysInRange(days, prevFreeEnd + 1, clusterStart - 1, alreadySelected);
    const afterWorkdays = getWorkdaysInRange(days, clusterEnd + 1, nextFreeStart - 1, alreadySelected);
    const totalCost = beforeWorkdays.length + afterWorkdays.length;
    const totalDays = nextFreeEnd - prevFreeStart + 1;
    const eff = totalCost > 0 ? totalDays / totalCost : 0;
    const existingCosts = [beforeWorkdays.length, afterWorkdays.length].filter((c) => c > 0);

    if (
      totalCost > 0 &&
      totalCost <= MAX_PTO &&
      eff >= MIN_EFF &&
      existingCosts.length === 2 // only show if both sides have gaps
    ) {
      options.push({
        id: 'both',
        label: `${totalCost} days total → ${totalDays}-day break`,
        ptoCost: totalCost,
        totalDays,
        efficiency: eff,
        startStr: days[prevFreeStart].dateStr,
        endStr: days[nextFreeEnd].dateStr,
        daysToAdd: [
          ...beforeWorkdays.map((d) => d.dateStr),
          ...afterWorkdays.map((d) => d.dateStr),
        ],
        rationale: `Bridge both sides for a ${totalDays}-day stretch. ${totalCost} PTO days used — ${Math.round((eff - 1) * 100)}% efficiency bonus by connecting both surrounding free periods.`,
      });
    }
  }

  return options
    .sort((a, b) =>
      Math.abs(b.efficiency - a.efficiency) > 0.05
        ? b.efficiency - a.efficiency
        : b.totalDays - a.totalDays
    )
    .slice(0, 3);
}
