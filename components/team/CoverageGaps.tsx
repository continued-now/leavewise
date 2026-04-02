'use client';

import { formatDateShort } from '@/lib/team';

interface CoverageGapsProps {
  gaps: string[];
}

/** Group consecutive dates into ranges */
function groupConsecutive(dates: string[]): { start: string; end: string; count: number }[] {
  if (dates.length === 0) return [];

  const ranges: { start: string; end: string; count: number }[] = [];
  let rangeStart = dates[0];
  let rangeEnd = dates[0];
  let count = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(rangeEnd + 'T00:00:00');
    const curr = new Date(dates[i] + 'T00:00:00');
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    // Allow gap of up to 3 days (over weekends)
    if (diffDays <= 3) {
      rangeEnd = dates[i];
      count++;
    } else {
      ranges.push({ start: rangeStart, end: rangeEnd, count });
      rangeStart = dates[i];
      rangeEnd = dates[i];
      count = 1;
    }
  }
  ranges.push({ start: rangeStart, end: rangeEnd, count });

  return ranges;
}

export function CoverageGaps({ gaps }: CoverageGapsProps) {
  if (gaps.length === 0) {
    return (
      <div className="bg-sage-light border border-sage/15 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sage/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-sage">No coverage gaps</p>
          <p className="text-xs text-sage/70">At least one team member is available every workday.</p>
        </div>
      </div>
    );
  }

  const ranges = groupConsecutive(gaps);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-ink">Coverage gaps</h3>
        <span className="text-[10px] font-semibold text-amber bg-amber-light px-2 py-0.5 rounded-full">
          {gaps.length} day{gaps.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="bg-amber-light border border-amber/15 rounded-xl p-4">
        <p className="text-xs text-amber mb-3">
          Everyone on the team is off on these workdays. Consider adjusting plans for coverage.
        </p>
        <div className="space-y-1.5">
          {ranges.map((range, i) => (
            <div key={i} className="flex items-center justify-between text-xs bg-white/60 rounded-lg px-3 py-2">
              <span className="text-ink font-medium">
                {formatDateShort(range.start)}
                {range.start !== range.end ? ` \u2013 ${formatDateShort(range.end)}` : ''}
              </span>
              <span className="text-ink-muted">
                {range.count} workday{range.count !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
