'use client';

interface EmptyPlansStateProps {
  noSavedPlans: string;
  noSavedPlansDesc: string;
}

export function EmptyPlansState({ noSavedPlans, noSavedPlansDesc }: EmptyPlansStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <svg className="w-12 h-12 text-ink-muted/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
      <p className="text-sm font-semibold text-ink-muted mb-1">{noSavedPlans}</p>
      <p className="text-xs text-ink-muted/70 max-w-[200px] leading-relaxed">{noSavedPlansDesc}</p>
    </div>
  );
}
