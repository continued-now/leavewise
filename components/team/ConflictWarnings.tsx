'use client';

import type { Conflict } from '@/lib/team';
import { formatDateShort } from '@/lib/team';

interface ConflictWarningsProps {
  conflicts: Conflict[];
}

export function ConflictWarnings({ conflicts }: ConflictWarningsProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-ink">Overlap warnings</h3>
        <span className="text-[10px] font-semibold text-coral bg-coral-light px-2 py-0.5 rounded-full">
          {conflicts.length}
        </span>
      </div>

      <div className="space-y-2">
        {conflicts.map((conflict, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-coral/20 p-4 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-coral-light flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-ink">
                <span className="font-semibold">{conflict.memberA}</span>
                {' and '}
                <span className="font-semibold">{conflict.memberB}</span>
                {' both off '}
                <span className="font-medium text-coral">
                  {formatDateShort(conflict.overlapStart)}
                  {conflict.overlapStart !== conflict.overlapEnd
                    ? ` \u2013 ${formatDateShort(conflict.overlapEnd)}`
                    : ''}
                </span>
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                {conflict.overlapDays} day{conflict.overlapDays !== 1 ? 's' : ''} of overlap
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
