'use client';

import { useState, useEffect } from 'react';
import { DayData } from '@/lib/types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDayClasses(day: DayData, isHighlighted: boolean, isPast: boolean): string {
  const base =
    'aspect-square flex items-center justify-center text-[10px] rounded cursor-default transition-all duration-150 select-none font-medium';

  if (isPast) {
    return `${base} text-ink-muted/30`;
  }
  if (day.isPrebooked) {
    return `${base} bg-coral text-white opacity-80 ${isHighlighted ? 'scale-110 shadow-sm' : ''}`;
  }
  if (day.isPTO) {
    return `${base} bg-coral text-white ${isHighlighted ? 'scale-110 shadow-sm' : ''}`;
  }
  if (day.isHoliday) {
    return `${base} bg-sage text-white ${isHighlighted ? 'scale-110 shadow-sm' : ''}`;
  }
  if (day.isCompanyHoliday) {
    return `${base} bg-amber text-white ${isHighlighted ? 'scale-110 shadow-sm' : ''}`;
  }
  if (day.isWeekend) {
    return `${base} bg-stone-warm text-ink-muted ${isHighlighted ? 'opacity-80' : ''}`;
  }
  if (day.windowId !== undefined) {
    return `${base} bg-coral-light text-ink border border-coral/20`;
  }
  return `${base} bg-white text-ink-muted border border-border`;
}

interface MonthGridProps {
  month: number;
  year: number;
  days: DayData[];
  hoveredWindow: number | null;
  onHoverDay: (windowId: number | null) => void;
  today: string; // YYYY-MM-DD
}

function MonthGrid({ month, year, days, hoveredWindow, onHoverDay, today }: MonthGridProps) {
  const monthDays = days.filter((d) => d.date.getMonth() === month && d.date.getFullYear() === year);
  if (monthDays.length === 0) return null;

  const firstDow = monthDays[0].dayOfWeek;
  const emptyCells = Array(firstDow).fill(null);

  return (
    <div>
      <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest mb-2.5">
        {MONTH_NAMES[month]}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {DAY_ABBR.map((d) => (
          <div key={d} className="text-[9px] text-ink-muted/60 text-center pb-1">
            {d}
          </div>
        ))}
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {monthDays.map((day) => {
          const isPast = day.dateStr < today;
          const isHighlighted =
            !isPast && day.windowId !== undefined && day.windowId === hoveredWindow;
          const tooltip =
            day.holidayName
              ? day.holidayName
              : day.isPrebooked
                ? 'Pre-booked'
                : day.isPTO
                  ? 'PTO'
                  : undefined;

          return (
            <div
              key={day.dateStr}
              title={tooltip}
              onMouseEnter={() =>
                !isPast && day.windowId !== undefined && onHoverDay(day.windowId)
              }
              onMouseLeave={() => onHoverDay(null)}
              className={getDayClasses(day, isHighlighted, isPast)}
            >
              {day.date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CalendarGridProps {
  days: DayData[];
  hoveredWindow: number | null;
  onHoverWindow: (id: number | null) => void;
  showCompanyHolidays?: boolean;
  /** YYYY-MM-DD — days before this are dimmed. Defaults to today. */
  today?: string;
  /** 0-indexed month to start the view on (0 = January). Defaults to current month for current year, 0 for future years. */
  defaultStartMonth?: number;
}

export function CalendarGrid({
  days,
  hoveredWindow,
  onHoverWindow,
  showCompanyHolidays = false,
  today,
  defaultStartMonth = 0,
}: CalendarGridProps) {
  const todayStr = today ?? new Date().toISOString().slice(0, 10);
  const [startMonth, setStartMonth] = useState(defaultStartMonth);

  // Sync when the user changes year (defaultStartMonth changes)
  useEffect(() => {
    setStartMonth(defaultStartMonth);
  }, [defaultStartMonth]);

  const year = days[0]?.date.getFullYear() ?? new Date().getFullYear();

  // Build ordered list of months that have data, starting from startMonth
  const allMonths = Array.from({ length: 12 }, (_, i) => i);
  const visibleMonths = allMonths.filter((m) => m >= startMonth);
  const hiddenMonths = allMonths.filter((m) => m < startMonth); // for "go back" display

  const canGoPrev = startMonth > 0;
  const canGoNext = startMonth < 11;

  // Label for the current view range
  const lastVisible = visibleMonths[visibleMonths.length - 1] ?? startMonth;
  const rangeLabel =
    startMonth === 0 && lastVisible === 11
      ? `${year}`
      : startMonth === lastVisible
        ? `${MONTH_NAMES[startMonth]} ${year}`
        : `${MONTH_NAMES[startMonth]} – ${MONTH_NAMES[lastVisible]} ${year}`;

  const legendItems = [
    { color: 'bg-coral', label: 'PTO / prebooked' },
    { color: 'bg-sage', label: 'Public holidays' },
    ...(showCompanyHolidays
      ? [{ color: 'bg-amber', label: 'Company holidays' }]
      : []),
    { color: 'bg-stone-warm', label: 'Weekends' },
    { color: 'bg-coral-light border border-coral/20', label: 'Rest of window' },
    { color: 'bg-white border border-border', label: 'Workdays' },
  ];

  return (
    <div>
      {/* Nav bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setStartMonth((m) => Math.max(0, m - 1))}
          disabled={!canGoPrev}
          className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-teal disabled:opacity-25 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-cream disabled:hover:bg-transparent"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {canGoPrev ? MONTH_NAMES[startMonth - 1] : 'Jan'}
        </button>

        <span className="text-xs font-semibold text-ink-muted tracking-wide">{rangeLabel}</span>

        <button
          onClick={() => setStartMonth((m) => Math.min(11, m + 1))}
          disabled={!canGoNext}
          className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-teal disabled:opacity-25 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-cream disabled:hover:bg-transparent"
        >
          {canGoNext ? MONTH_NAMES[startMonth + 1] : 'Dec'}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Hidden months hint */}
      {hiddenMonths.length > 0 && (
        <div className="mb-4 text-xs text-ink-muted/60 text-center">
          {hiddenMonths.length} month{hiddenMonths.length > 1 ? 's' : ''} hidden —{' '}
          <button
            onClick={() => setStartMonth(0)}
            className="underline hover:text-teal transition-colors"
          >
            show all of {year}
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {legendItems.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className={`w-3 h-3 rounded-sm ${l.color}`} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleMonths.map((m) => (
          <MonthGrid
            key={m}
            month={m}
            year={year}
            days={days}
            hoveredWindow={hoveredWindow}
            onHoverDay={onHoverWindow}
            today={todayStr}
          />
        ))}
      </div>
    </div>
  );
}
