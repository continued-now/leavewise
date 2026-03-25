'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { DayData } from '@/lib/types';
import type { LongWeekendPreview } from '@/lib/longWeekends';
import { formatPreviewDate } from '@/lib/longWeekends';
import type { TranslationBundle } from '@/lib/i18n/optimize';

function buildLWDateRange(lw: LongWeekendPreview): string[] {
  const start = new Date(lw.startStr + 'T00:00:00');
  const end = new Date(lw.endStr + 'T00:00:00');
  const padStart = new Date(start);
  padStart.setDate(padStart.getDate() - padStart.getDay());
  const padEnd = new Date(end);
  padEnd.setDate(padEnd.getDate() + (6 - padEnd.getDay()));

  const dates: string[] = [];
  const cur = new Date(padStart);
  while (cur <= padEnd) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function ExpandedLongWeekendModal({
  lw,
  days,
  selectedPTO,
  onTogglePTO,
  onClose,
  l,
}: {
  lw: LongWeekendPreview;
  days: DayData[];
  selectedPTO: Set<string>;
  onTogglePTO: (dateStr: string) => void;
  onClose: () => void;
  l: TranslationBundle;
}) {
  const isFree = lw.ptoCost === 0;
  const dateRange = buildLWDateRange(lw);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const dayMap = useMemo(() => {
    const m = new Map<string, DayData>();
    for (const d of days) m.set(d.dateStr, d);
    return m;
  }, [days]);

  const selectedInWindow = lw.bridgeDates.filter((d) => selectedPTO.has(d)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lw-modal-title"
        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 id="lw-modal-title" className="text-lg font-display font-semibold text-ink">
              {lw.holidayNames.join(' · ')}
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {formatPreviewDate(lw.startStr)} – {formatPreviewDate(lw.endStr)}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="text-ink-muted hover:text-ink transition-colors p-1 -mr-1 -mt-1"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-display font-semibold text-ink">{lw.totalDays}</span>
            <span className="text-xs text-ink-muted">{l.daysTotal}</span>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full self-center ${
            isFree ? 'bg-sage-light text-sage' : 'bg-coral-light text-coral'
          }`}>
            {isFree ? l.noPTONeededBadge : `${lw.ptoCost} ${lw.ptoCost > 1 ? l.ptoDayPlural : l.ptoDaySingular} ${l.toBridge}`}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {l.dayNames.map((d, i) => (
            <div key={i} className="text-[10px] text-ink-muted font-medium text-center py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {dateRange.map((dateStr) => {
            const day = dayMap.get(dateStr);
            const d = new Date(dateStr + 'T00:00:00');
            const dayNum = d.getDate();
            const inWindow = dateStr >= lw.startStr && dateStr <= lw.endStr;
            const isHoliday = day?.isHoliday ?? false;
            const isWeekend = day?.isWeekend ?? (d.getDay() === 0 || d.getDay() === 6);
            const isCompanyHoliday = day?.isCompanyHoliday ?? false;
            const isPrebooked = day?.isPrebooked ?? false;
            const isBridge = lw.bridgeDates.includes(dateStr);
            const isPTOSelected = selectedPTO.has(dateStr);
            const isWorkday = !isWeekend && !isHoliday && !isCompanyHoliday && !isPrebooked;
            const canToggle = isWorkday && inWindow;

            let cellClass = 'text-ink-muted/30 bg-cream';
            if (inWindow) {
              if (isHoliday) {
                cellClass = 'bg-sage text-white';
              } else if (isCompanyHoliday) {
                cellClass = 'bg-sage/70 text-white';
              } else if (isPTOSelected) {
                cellClass = 'bg-coral text-white';
              } else if (isBridge && !isPTOSelected) {
                cellClass = 'bg-coral/20 border-2 border-dashed border-coral text-coral';
              } else if (isWeekend) {
                cellClass = 'bg-stone-warm text-ink-muted';
              } else {
                cellClass = 'bg-cream border border-border text-ink-muted';
              }
            } else if (isWeekend || isHoliday) {
              cellClass = 'text-ink-muted/20 bg-transparent';
            }

            return (
              <button
                key={dateStr}
                disabled={!canToggle}
                onClick={() => canToggle && onTogglePTO(dateStr)}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold
                  transition-all
                  ${cellClass}
                  ${canToggle ? 'cursor-pointer hover:ring-2 hover:ring-coral/40 active:scale-95' : 'cursor-default'}
                `}
                title={
                  isHoliday ? day?.holidayName ?? l.holidayLabel
                  : isPTOSelected ? l.clickToRemovePTO
                  : canToggle ? l.clickToAddPTO
                  : undefined
                }
              >
                <span>{dayNum}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-sage" />
            <span className="text-[10px] text-ink-muted">{l.holidayLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-stone-warm" />
            <span className="text-[10px] text-ink-muted">{l.weekend}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-coral" />
            <span className="text-[10px] text-ink-muted">{l.ptoSelectedLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-coral/20 border border-dashed border-coral" />
            <span className="text-[10px] text-ink-muted">{l.suggestedBridge}</span>
          </div>
        </div>

        {!isFree && selectedInWindow < lw.ptoCost && (
          <p className="text-[11px] text-ink-muted">{l.clickDashedDays}</p>
        )}
      </div>
    </div>
  );
}
