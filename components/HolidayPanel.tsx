'use client';

import { DayData } from '@/lib/types';
import { BridgeOption } from '@/lib/bridge-suggestions';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatFullDate(date: Date): string {
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

function formatShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

function EfficiencyPill({ efficiency }: { efficiency: number }) {
  const bonus = Math.round((efficiency - 1) * 100);
  return (
    <span className="inline-flex items-center gap-1 bg-sage-light text-sage text-[10px] font-bold px-2 py-0.5 rounded-full">
      +{bonus}% bonus
    </span>
  );
}

interface BridgeCardProps {
  option: BridgeOption;
  applied: boolean;
  canAfford: boolean;
  onApply: () => void;
  onPreviewEnter: () => void;
  onPreviewLeave: () => void;
}

function BridgeCard({
  option,
  applied,
  canAfford,
  onApply,
  onPreviewEnter,
  onPreviewLeave,
}: BridgeCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        applied
          ? 'border-sage bg-sage-light'
          : canAfford
            ? 'border-border bg-white hover:border-coral/30 hover:shadow-sm cursor-pointer'
            : 'border-border bg-cream opacity-50 cursor-not-allowed'
      }`}
      onMouseEnter={!applied && canAfford ? onPreviewEnter : undefined}
      onMouseLeave={!applied && canAfford ? onPreviewLeave : undefined}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="text-xs font-semibold text-ink mb-1">{option.label}</div>
          <div className="text-[10px] text-ink-muted">
            {formatShort(option.startStr)} – {formatShort(option.endStr)}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <EfficiencyPill efficiency={option.efficiency} />
          <span className="text-[10px] text-coral font-semibold">
            {option.ptoCost} PTO {option.ptoCost === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-ink-muted leading-relaxed mb-3">{option.rationale}</p>

      {applied ? (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sage">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Applied to calendar
        </div>
      ) : (
        <button
          onClick={canAfford ? onApply : undefined}
          disabled={!canAfford}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            canAfford
              ? 'bg-coral text-white hover:bg-coral/90'
              : 'bg-cream text-ink-muted cursor-not-allowed'
          }`}
        >
          {canAfford ? 'Apply to calendar' : 'Not enough PTO'}
        </button>
      )}
    </div>
  );
}

interface HolidayPanelProps {
  holiday: DayData;
  suggestions: BridgeOption[];
  appliedDates: Set<string>;
  remainingPTO: number;
  onApply: (daysToAdd: string[]) => void;
  onPreviewEnter: (dates: string[]) => void;
  onPreviewLeave: () => void;
  onClose: () => void;
}

export function HolidayPanel({
  holiday,
  suggestions,
  appliedDates,
  remainingPTO,
  onApply,
  onPreviewEnter,
  onPreviewLeave,
  onClose,
}: HolidayPanelProps) {
  const isWeekendHoliday = holiday.isWeekend;
  const holidayName = holiday.holidayName ?? 'Holiday';

  return (
    <div className="flex flex-col h-full bg-white border-l border-border overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border shrink-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-sage mb-1">
              Public Holiday
            </div>
            <h3 className="text-base font-display font-semibold text-ink leading-tight">
              {holidayName}
            </h3>
            <div className="text-xs text-ink-muted mt-1">
              {formatFullDate(holiday.date)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-cream text-ink-muted hover:text-ink hover:bg-stone-200 transition-colors flex items-center justify-center text-sm shrink-0 mt-0.5"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        {/* Context note */}
        {isWeekendHoliday ? (
          <div className="bg-stone-50 rounded-lg px-3 py-2 text-[11px] text-ink-muted leading-relaxed">
            Falls on a {DAY_NAMES[holiday.dayOfWeek]} — it&apos;s already part of the weekend.
            Adding PTO adjacent to it still extends your time off.
          </div>
        ) : (
          <div className="bg-sage-light rounded-lg px-3 py-2 text-[11px] text-sage leading-relaxed">
            Falls on a {DAY_NAMES[holiday.dayOfWeek]} — a free workday.
            Adding PTO before or after stretches this into a longer break.
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-2xl mb-2">✓</div>
            <p className="text-sm font-semibold text-ink mb-1">Already well-positioned</p>
            <p className="text-xs text-ink-muted leading-relaxed">
              This holiday sits adjacent to existing free days. No PTO needed to
              create a decent break — or the gaps are too large to bridge efficiently.
            </p>
          </div>
        ) : (
          <>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3">
              Bridge recommendations
            </div>

            <div className="space-y-3">
              {suggestions.map((opt) => {
                const applied = opt.daysToAdd.every((d) => appliedDates.has(d));
                const canAfford = opt.ptoCost <= remainingPTO || applied;

                return (
                  <BridgeCard
                    key={opt.id}
                    option={opt}
                    applied={applied}
                    canAfford={canAfford}
                    onApply={() => onApply(opt.daysToAdd)}
                    onPreviewEnter={() => onPreviewEnter(opt.daysToAdd)}
                    onPreviewLeave={onPreviewLeave}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border px-5 py-3 bg-cream/60">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>
            <span className="font-semibold text-ink">{remainingPTO}</span> PTO days remaining
          </span>
          <button
            onClick={onClose}
            className="text-teal hover:text-teal-hover font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
