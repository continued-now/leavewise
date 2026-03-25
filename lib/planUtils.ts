import type { OptimizationResult, FormState } from './types';
import { US_STATES } from './countries';

export function generatePlanSummary(
  result: OptimizationResult,
  form: FormState,
  stateName: string
): string {
  const country = form.country === 'US' ? `United States · ${stateName}` : 'South Korea';
  const lines: string[] = [
    `Leavewise PTO Plan — ${form.year}`,
    `${country} · ${result.totalLeaveUsed} PTO days`,
    '',
    `→ ${result.totalDaysOff} days off across ${result.windows.length} window${result.windows.length === 1 ? '' : 's'}`,
    '',
  ];

  result.windows
    .sort((a, b) => a.startStr.localeCompare(b.startStr))
    .forEach((w, i) => {
      const start = new Date(w.startStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = new Date(w.endStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const holidays = w.holidays.length > 0 ? ` · ${w.holidays.join(', ')}` : '';
      lines.push(`${i + 1}. ${start} – ${end} (${w.totalDays} days, ${w.ptoDaysUsed} PTO) · ${w.efficiency.toFixed(1)}x${holidays}`);
    });

  lines.push('', 'Plan your own at leavewise.com/optimize');
  return lines.join('\n');
}

export function getStateName(usState: string): string {
  return US_STATES.find((s) => s.code === usState)?.name ?? '';
}
