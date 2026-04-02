'use client';

const WINDOW_COLORS = [
  'border-l-teal',
  'border-l-coral',
  'border-l-sage',
  'border-l-amber-500',
  'border-l-sky-500',
  'border-l-rose-400',
  'border-l-indigo-400',
  'border-l-orange-400',
];

interface SkeletonWindowCardProps {
  colorIndex: number;
}

export function SkeletonWindowCard({ colorIndex }: SkeletonWindowCardProps) {
  const accentColor = WINDOW_COLORS[colorIndex % WINDOW_COLORS.length];

  return (
    <div
      className={`bg-white rounded-2xl border-l-4 border border-border ${accentColor} p-5`}
    >
      {/* Header: label + days off + PTO stepper */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* Label placeholder */}
          <div className="mb-1">
            <div className="h-3 w-24 bg-border/50 rounded-full skeleton-shimmer" />
          </div>
          {/* Days off number */}
          <div className="flex items-baseline gap-2">
            <div className="h-7 w-10 bg-border/60 rounded skeleton-shimmer" />
            <div className="h-3.5 w-14 bg-border/40 rounded skeleton-shimmer" />
          </div>
          {/* Date range */}
          <div className="mt-1">
            <div className="h-3 w-36 bg-border/40 rounded skeleton-shimmer" />
          </div>
        </div>
        {/* PTO stepper placeholder */}
        <div className="shrink-0 text-right">
          <div className="h-2.5 w-14 bg-border/40 rounded mb-1.5 skeleton-shimmer" />
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 bg-border/40 rounded-md skeleton-shimmer" />
            <div className="w-5 h-5 bg-border/50 rounded skeleton-shimmer" />
            <div className="w-7 h-7 bg-border/40 rounded-md skeleton-shimmer" />
          </div>
        </div>
      </div>

      {/* Efficiency badge + holiday tags */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="h-5 w-24 bg-sage-light rounded-full skeleton-shimmer" />
        <div className="h-5 w-20 bg-border/30 rounded-full skeleton-shimmer" />
      </div>

      {/* Flight deal placeholder */}
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-32 bg-teal-light rounded-full skeleton-shimmer" />
        <div className="h-5 w-20 bg-border/40 rounded-full skeleton-shimmer" />
      </div>

      {/* Action buttons placeholder */}
      <div className="flex items-center gap-3 pt-3 border-t border-border mt-3">
        <div className="h-4 w-12 bg-border/40 rounded skeleton-shimmer" />
        <div className="h-4 w-16 bg-border/40 rounded skeleton-shimmer" />
        <div className="h-4 w-20 bg-border/40 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}
