'use client';

import { useState, useEffect } from 'react';
import { DayData } from '@/lib/types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDayClasses(
  day: DayData,
  isSelected: boolean,
  isPreview: boolean,
  isActive: boolean,
  isInWindow: boolean,
  isPast: boolean,
  isHighlighted: boolean,
  isToday: boolean
): string {
  const base =
    'aspect-square flex items-center justify-center text-[11px] rounded-md transition-all duration-100 select-none font-medium';
  const todayRing = isToday ? ' ring-2 ring-teal ring-offset-1' : '';

  if (isPast) {
    return `${base}${todayRing} text-ink-muted/25 cursor-default`;
  }

  if (isHighlighted) {
    if (day.isPTO || isSelected || day.isPrebooked) {
      return `${base}${todayRing} bg-coral text-white scale-110 shadow-sm cursor-pointer`;
    }
    if (day.isHoliday) {
      return `${base}${todayRing} bg-sage text-white scale-110 shadow-sm cursor-pointer`;
    }
    if (day.isWeekend) {
      return `${base}${todayRing} bg-stone-warm scale-105 cursor-default`;
    }
    return `${base}${todayRing} bg-coral-light text-ink scale-105 border border-coral/40 cursor-pointer`;
  }

  if (isActive && day.isHoliday) {
    return `${base}${todayRing} bg-sage text-white ring-2 ring-white ring-offset-1 ring-offset-sage scale-110 z-10 cursor-pointer`;
  }

  if (isSelected || day.isPrebooked) {
    return `${base}${todayRing} bg-coral text-white cursor-pointer hover:opacity-90`;
  }

  if (isPreview) {
    return `${base}${todayRing} bg-coral/30 text-coral border-2 border-coral border-dashed cursor-default`;
  }

  if (day.isHoliday) {
    return `${base}${todayRing} bg-sage text-white cursor-pointer hover:scale-110 hover:shadow-md shadow-sm ring-1 ring-sage/30`;
  }

  if (day.isCompanyHoliday) {
    return `${base}${todayRing} bg-amber text-white cursor-default`;
  }

  if (day.isWeekend) {
    return `${base}${todayRing} bg-stone-warm text-ink-muted cursor-default`;
  }

  if (isInWindow) {
    return `${base}${todayRing} bg-coral-light text-ink border border-coral/20 cursor-pointer hover:bg-coral/20`;
  }

  return `${base}${todayRing} bg-white text-ink-muted border border-border cursor-pointer hover:border-coral/40 hover:bg-coral/5`;
}

interface MonthGridProps {
  month: number;
  days: DayData[];
  selectedPTO: Set<string>;
  previewDates: Set<string>;
  activeHolidayDateStr: string | null;
  onDayClick?: (day: DayData) => void;
  hoveredWindow: number | null;
  onHoverWindow: (id: number | null) => void;
  today: string;
  windowLabels: Map<number, string>;
}

function MonthGrid({
  month, days, selectedPTO, previewDates,
  activeHolidayDateStr, onDayClick,
  hoveredWindow, onHoverWindow, today, windowLabels,
}: MonthGridProps) {
  const monthDays = days.filter((d) => d.date.getMonth() === month);
  if (monthDays.length === 0) return null;

  const firstDow = monthDays[0].dayOfWeek;

  return (
    <div>
      <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest mb-2">
        {MONTH_NAMES[month]}
      </div>
      <div className="grid grid-cols-7 gap-0.5" role="grid" aria-label={MONTH_NAMES[month]}>
        {DAY_ABBR.map((d) => (
          <div key={d} className="text-[9px] text-ink-muted/50 text-center pb-1" role="columnheader">
            {d}
          </div>
        ))}
        {Array(firstDow).fill(null).map((_, i) => <div key={`e-${i}`} />)}
        {monthDays.map((day) => {
          const isPast = day.dateStr < today;
          const isSelected = !isPast && selectedPTO.has(day.dateStr) && !day.isFree;
          const isPreview = !isPast && previewDates.has(day.dateStr) && !day.isFree && !isSelected;
          const isActive = day.dateStr === activeHolidayDateStr;
          const isInWindow = day.windowId !== undefined;
          const isHighlighted = !isPast && isInWindow && day.windowId === hoveredWindow;
          const isToday = day.dateStr === today;

          const windowLabel = isInWindow && day.windowId != null ? windowLabels.get(day.windowId) : undefined;

          let tooltip: string | undefined;
          if (day.holidayName) {
            tooltip = windowLabel
              ? `${day.holidayName} · ${windowLabel}`
              : `${day.holidayName} — click for suggestions`;
          } else if (day.isPrebooked) {
            tooltip = windowLabel ? `Pre-booked · ${windowLabel}` : 'Pre-booked';
          } else if (day.isCompanyHoliday) {
            tooltip = 'Company holiday';
          } else if (isSelected) {
            tooltip = windowLabel ? `PTO · ${windowLabel} — click to remove` : 'PTO — click to remove';
          } else if (isPast) {
            tooltip = undefined;
          } else if (day.isFree) {
            tooltip = windowLabel ? windowLabel : undefined;
          } else if (isInWindow && windowLabel) {
            tooltip = `${windowLabel} — click to toggle PTO`;
          } else {
            tooltip = 'Click to add PTO';
          }

          return (
            <div
              key={day.dateStr}
              role="gridcell"
              aria-label={`${MONTH_NAMES[month]} ${day.date.getDate()}${day.holidayName ? ` — ${day.holidayName}` : ''}${isSelected ? ' (PTO)' : ''}`}
              title={tooltip}
              tabIndex={day.isHoliday || (!isPast && !day.isFree) ? 0 : -1}
              onClick={() => !isPast && onDayClick?.(day)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  !isPast && onDayClick?.(day);
                }
              }}
              onMouseEnter={() => !isPast && isInWindow && onHoverWindow(day.windowId!)}
              onMouseLeave={() => onHoverWindow(null)}
              className={getDayClasses(day, isSelected, isPreview, isActive, isInWindow, isPast, isHighlighted, isToday)}
            >
              {day.date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface InteractiveCalendarProps {
  days: DayData[];
  selectedPTO?: Set<string>;
  previewDates?: Set<string>;
  activeHolidayDateStr?: string | null;
  onDayClick?: (day: DayData) => void;
  showCompanyHolidays?: boolean;
  hoveredWindow?: number | null;
  onHoverWindow?: (id: number | null) => void;
  /** Map from windowId → label string, shown in hover tooltips */
  windowLabels?: Map<number, string>;
  /** YYYY-MM-DD — days before this date are dimmed */
  today?: string;
  /** 0-indexed month to start the view on */
  defaultStartMonth?: number;
}

export function InteractiveCalendar({
  days,
  selectedPTO = new Set(),
  previewDates = new Set(),
  activeHolidayDateStr = null,
  onDayClick,
  showCompanyHolidays = false,
  hoveredWindow = null,
  onHoverWindow,
  windowLabels = new Map(),
  today,
  defaultStartMonth = 0,
}: InteractiveCalendarProps) {
  const todayStr = today ?? new Date().toISOString().slice(0, 10);
  const [startMonth, setStartMonth] = useState(defaultStartMonth);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  useEffect(() => {
    setStartMonth(defaultStartMonth);
  }, [defaultStartMonth]);

  const handleHoverWindow = onHoverWindow ?? (() => {});
  const visibleMonths = Array.from({ length: 12 }, (_, i) => i).filter((m) => m >= startMonth);

  const legendItems = [
    { color: 'bg-sage', label: 'Public holiday' },
    ...(showCompanyHolidays ? [{ color: 'bg-amber', label: 'Company holiday' }] : []),
    { color: 'bg-coral', label: 'PTO' },
    ...(onDayClick ? [{ color: 'bg-coral/30 border-2 border-coral border-dashed', label: 'Preview' }] : []),
    { color: 'bg-stone-warm', label: 'Weekend' },
    { color: 'bg-white border border-border', label: 'Workday' },
  ];

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setStartMonth((m) => Math.max(0, m - 1))}
          disabled={startMonth === 0}
          aria-label="Previous month"
          className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-teal disabled:opacity-25 disabled:cursor-not-allowed transition-colors px-2 py-1.5 rounded-lg hover:bg-cream disabled:hover:bg-transparent"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden sm:inline">{startMonth > 0 ? MONTH_ABBR[startMonth - 1] : 'Jan'}</span>
        </button>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setShowMonthPicker((v) => !v)}
            className="text-xs font-semibold text-ink-muted hover:text-teal transition-colors px-2 py-1 rounded-lg hover:bg-cream flex items-center gap-1"
            aria-label="Jump to month"
          >
            {startMonth > 0 ? `${MONTH_ABBR[startMonth]} – Dec` : 'All months'}
            <svg className={`w-3 h-3 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Month quick-jump dropdown */}
          {showMonthPicker && (
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white rounded-xl border border-border shadow-lg p-2 z-20 grid grid-cols-4 gap-1 min-w-[200px]">
              <button
                onClick={() => { setStartMonth(0); setShowMonthPicker(false); }}
                className={`text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-colors ${
                  startMonth === 0
                    ? 'bg-teal text-white'
                    : 'text-ink-muted hover:bg-cream hover:text-teal'
                }`}
              >
                All
              </button>
              {MONTH_ABBR.map((name, i) => (
                <button
                  key={i}
                  onClick={() => { setStartMonth(i); setShowMonthPicker(false); }}
                  className={`text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-colors ${
                    startMonth === i && startMonth !== 0
                      ? 'bg-teal text-white'
                      : 'text-ink-muted hover:bg-cream hover:text-teal'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setStartMonth((m) => Math.min(11, m + 1))}
          disabled={startMonth >= 11}
          aria-label="Next month"
          className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-teal disabled:opacity-25 disabled:cursor-not-allowed transition-colors px-2 py-1.5 rounded-lg hover:bg-cream disabled:hover:bg-transparent"
        >
          <span className="hidden sm:inline">{startMonth < 11 ? MONTH_ABBR[startMonth + 1] : 'Dec'}</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5">
        {legendItems.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className={`w-3 h-3 rounded-sm shrink-0 ${l.color}`} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleMonths.map((m) => (
          <MonthGrid
            key={m}
            month={m}
            days={days}
            selectedPTO={selectedPTO}
            previewDates={previewDates}
            activeHolidayDateStr={activeHolidayDateStr}
            onDayClick={onDayClick}
            hoveredWindow={hoveredWindow}
            onHoverWindow={handleHoverWindow}
            today={todayStr}
            windowLabels={windowLabels}
          />
        ))}
      </div>
    </div>
  );
}
