'use client';

import { useEffect } from 'react';
import type { SavedPlanMeta } from '@/lib/types';

const STRATEGY_LABELS: Record<string, string> = { short: 'Short', balanced: 'Balanced', long: 'Long' };

interface CompareModalProps {
  planA: SavedPlanMeta;
  planB: SavedPlanMeta;
  onClose: () => void;
}

function DeltaValue({ a, b, suffix, higherIsBetter = true }: { a: number; b: number; suffix?: string; higherIsBetter?: boolean }) {
  const diff = b - a;
  if (diff === 0) return <span className="text-ink-muted">—</span>;
  const isPositive = higherIsBetter ? diff > 0 : diff < 0;
  const formatted = `${diff > 0 ? '+' : ''}${Number.isInteger(diff) ? diff : diff.toFixed(1)}`;
  return (
    <span className={`font-semibold ${isPositive ? 'text-sage' : 'text-coral'}`}>
      {formatted}{suffix}
    </span>
  );
}

function StatRow({ label, aVal, bVal, suffix, higherIsBetter = true }: {
  label: string;
  aVal: number;
  bVal: number;
  suffix?: string;
  higherIsBetter?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_80px_80px_80px] items-center py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="text-xs font-semibold text-ink text-center">{aVal}{suffix}</span>
      <span className="text-xs font-semibold text-ink text-center">{bVal}{suffix}</span>
      <span className="text-[10px] text-center">
        <DeltaValue a={aVal} b={bVal} suffix={suffix} higherIsBetter={higherIsBetter} />
      </span>
    </div>
  );
}

export function CompareModal({ planA, planB, onClose }: CompareModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-base font-display font-semibold text-ink">Compare Plans</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-cream transition-colors"
            aria-label="Close comparison"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Plan names header */}
          <div className="grid grid-cols-[1fr_80px_80px_80px] items-center pb-3 border-b border-border mb-1">
            <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide">Metric</span>
            <div className="text-center">
              <span className="text-[10px] font-semibold text-teal block truncate px-1" title={planA.name}>
                {planA.name.length > 12 ? planA.name.slice(0, 12) + '...' : planA.name}
              </span>
              <span className="text-[9px] text-ink-muted bg-teal-light px-1.5 rounded">
                {STRATEGY_LABELS[planA.strategy]}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-semibold text-teal block truncate px-1" title={planB.name}>
                {planB.name.length > 12 ? planB.name.slice(0, 12) + '...' : planB.name}
              </span>
              <span className="text-[9px] text-ink-muted bg-teal-light px-1.5 rounded">
                {STRATEGY_LABELS[planB.strategy]}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-ink-muted text-center uppercase tracking-wide">Delta</span>
          </div>

          {/* Stats */}
          <StatRow label="Days off" aVal={planA.totalDaysOff} bVal={planB.totalDaysOff} />
          <StatRow label="PTO used" aVal={planA.totalLeaveUsed} bVal={planB.totalLeaveUsed} higherIsBetter={false} />
          <StatRow label="Efficiency" aVal={planA.efficiency} bVal={planB.efficiency} suffix="x" />
          <StatRow label="Trips" aVal={planA.windowCount} bVal={planB.windowCount} />
          <StatRow label="Remaining" aVal={planA.remainingLeave} bVal={planB.remainingLeave} />
        </div>
      </div>
    </div>
  );
}
