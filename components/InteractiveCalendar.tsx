'use client';

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { DayData } from '@/lib/types';
import { buildFlightSearchLink } from '@/lib/affiliates';
import { trackCalendarDayClick } from '@/lib/analytics';
import { CalendarTooltip } from '@/components/CalendarTooltip';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Stable default instances to avoid creating new objects every render
const EMPTY_SET = new Set<string>();
const EMPTY_MAP = new Map<number, string>();

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
    'aspect-square flex items-center justify-center text-base rounded-lg transition-all duration-100 select-none font-semibold min-h-[44px] sm:min-h-0';
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
  year: number;
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
  showYear: boolean;
  // Drag-to-select
  isDragging: boolean;
  dragDates: Set<string>;
  dragMode: 'add' | 'remove';
  onDragStart: (day: DayData) => void;
  onDragEnter: (day: DayData) => void;
  dragJustEndedRef: React.RefObject<boolean>;
  onTogglePTO?: (dateStr: string) => void;
}

const MonthGrid = memo(function MonthGrid({
  year, month, days, selectedPTO, previewDates,
  activeHolidayDateStr, onDayClick,
  hoveredWindow, onHoverWindow, today, windowLabels, showYear,
  isDragging, dragDates, dragMode, onDragStart, onDragEnter, dragJustEndedRef, onTogglePTO,
}: MonthGridProps) {
  const monthDays = days.filter((d) => d.date.getFullYear() === year && d.date.getMonth() === month);
  if (monthDays.length === 0) return null;

  const firstDow = monthDays[0].dayOfWeek;

  // Find window days in this month — used for the suggest prompt
  const windowDays = monthDays.filter((d) => d.dateStr >= today && d.windowId !== undefined);
  const monthWindowIds = [...new Set(windowDays.map((d) => d.windowId!))];
  const hasWindows = monthWindowIds.length > 0;

  return (
    <div>
      <div className="text-sm font-bold text-ink-muted uppercase tracking-widest mb-3">
        {MONTH_NAMES[month]}{showYear ? ` ${year}` : ''}
      </div>
      <div className="grid grid-cols-7 gap-1.5" role="grid" aria-label={MONTH_NAMES[month]}>
        {DAY_ABBR.map((d) => (
          <div key={d} className="text-xs text-ink-muted/60 text-center pb-2 font-semibold" role="columnheader">
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

          const isDragTarget = isDragging && dragDates.has(day.dateStr);
          const canDrag = !isPast && !day.isFree && !day.isPrebooked && !day.isHoliday;

          return (
            <CalendarTooltip key={day.dateStr} content={isDragging ? undefined : tooltip}>
              <div
                role="gridcell"
                aria-label={`${MONTH_NAMES[month]} ${day.date.getDate()}${day.holidayName ? ` — ${day.holidayName}` : ''}${isSelected ? ' (PTO)' : ''}`}
                tabIndex={day.isHoliday || (!isPast && !day.isFree) ? 0 : -1}
                onMouseDown={(e) => {
                  if (canDrag && e.button === 0) {
                    e.preventDefault();
                    onDragStart(day);
                  }
                }}
                onMouseEnter={() => {
                  if (isDragging && canDrag) {
                    onDragEnter(day);
                  } else if (!isPast && isInWindow) {
                    onHoverWindow(day.windowId!);
                  }
                }}
                onMouseLeave={() => { if (!isDragging) onHoverWindow(null); }}
                onClick={() => {
                  if (dragJustEndedRef.current) return;
                  if (!isDragging && !isPast && onDayClick) {
                    onDayClick(day); trackCalendarDayClick();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isPast) return;
                    if (day.isHoliday && onDayClick) {
                      onDayClick(day);
                    } else if (canDrag && onTogglePTO) {
                      onTogglePTO(day.dateStr);
                    }
                    trackCalendarDayClick();
                  }
                }}
                className={`${getDayClasses(day, isSelected, isPreview, isActive, isInWindow, isPast, isHighlighted, isToday)} ${
                  isDragTarget
                    ? dragMode === 'add'
                      ? '!bg-coral/40 !border-coral !border-dashed ring-1 ring-coral/30'
                      : '!bg-border/60 !border-border !border-dashed ring-1 ring-border'
                    : ''
                } ${canDrag ? 'cursor-crosshair' : ''}`}
              >
                {day.date.getDate()}
              </div>
            </CalendarTooltip>
          );
        })}
      </div>

      {/* Window suggestion — hover to preview */}
      {hasWindows && (
        <div className="mt-3">
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-coral/6 border border-coral/15 hover:bg-coral/12 hover:border-coral/30 transition-colors text-left group"
            onMouseEnter={() => onHoverWindow(monthWindowIds[0])}
            onMouseLeave={() => onHoverWindow(null)}
            onClick={() => onHoverWindow(monthWindowIds[0])}
          >
            <span className="text-base leading-none">&#127796;</span>
            <span className="text-sm text-coral font-semibold leading-snug">
              {monthWindowIds.length === 1
                ? windowLabels.get(monthWindowIds[0]) ?? 'Suggested window'
                : `${monthWindowIds.length} suggested windows`}
              <span className="text-coral/60 font-medium group-hover:text-coral transition-colors">
                {' '}&#8212; hover to preview
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
});

interface Streak {
  days: number;
  startStr: string;
  endStr: string;
}

function FlightStreaks({ days, selectedPTO, todayStr, origin }: {
  days: DayData[];
  selectedPTO: Set<string>;
  todayStr: string;
  origin: string;
}) {
  const [showShortBreaks, setShowShortBreaks] = useState(false);

  const { longStreaks, shortStreaks } = useMemo(() => {
    const long: Streak[] = [];
    const short: Streak[] = [];
    let cur = 0;
    let curStart = '';
    let prevDateStr = '';
    for (const d of days) {
      if (d.dateStr < todayStr) { cur = 0; continue; }
      const isOff = d.isFree || d.isPTO || d.isPrebooked || selectedPTO.has(d.dateStr) || d.windowId !== undefined;
      if (isOff) {
        if (cur === 0) curStart = d.dateStr;
        cur++;
        prevDateStr = d.dateStr;
      } else {
        if (cur >= 4) long.push({ days: cur, startStr: curStart, endStr: prevDateStr });
        else if (cur >= 2) short.push({ days: cur, startStr: curStart, endStr: prevDateStr });
        cur = 0;
      }
    }
    if (cur >= 4) long.push({ days: cur, startStr: curStart, endStr: prevDateStr });
    else if (cur >= 2) short.push({ days: cur, startStr: curStart, endStr: prevDateStr });
    return { longStreaks: long, shortStreaks: short };
  }, [days, selectedPTO, todayStr]);

  if (longStreaks.length === 0 && shortStreaks.length === 0) return null;

  const renderStreak = (s: Streak, i: number) => {
    const startDate = new Date(s.startStr);
    const endDate = new Date(s.endStr);
    const startLabel = `${MONTH_ABBR[startDate.getMonth()]} ${startDate.getDate()}`;
    const endLabel = `${MONTH_ABBR[endDate.getMonth()]} ${endDate.getDate()}`;
    return (
      <a
        key={`streak-${i}-${s.startStr}`}
        href={buildFlightSearchLink(origin, s.startStr, s.endStr)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal/5 border border-teal/15 hover:bg-teal/10 hover:border-teal/30 transition-colors group"
      >
        <span className="text-lg leading-none">&#9992;&#65039;</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-teal">
            You have {s.days} days off. Book flights?
          </span>
          <span className="text-xs text-teal/60 ml-2">
            {startLabel} – {endLabel}
          </span>
        </div>
        <svg className="w-4 h-4 text-teal/40 group-hover:text-teal transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </a>
    );
  };

  return (
    <div className="mt-6 space-y-3">
      {longStreaks.map((s, i) => renderStreak(s, i))}

      {shortStreaks.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowShortBreaks((v) => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-teal transition-colors px-1 py-1"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${showShortBreaks ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            {showShortBreaks
              ? `Hide short breaks (${shortStreaks.length})`
              : `${shortStreaks.length} short break${shortStreaks.length > 1 ? 's' : ''} — search flights`}
          </button>
          {showShortBreaks && shortStreaks.map((s, i) => renderStreak(s, i))}
        </>
      )}
    </div>
  );
}

interface InteractiveCalendarProps {
  days: DayData[];
  selectedPTO?: Set<string>;
  previewDates?: Set<string>;
  activeHolidayDateStr?: string | null;
  onDayClick?: (day: DayData) => void;
  /** Called when user toggles PTO via keyboard */
  onTogglePTO?: (dateStr: string) => void;
  /** Called when user completes a drag-select gesture */
  onDragSelect?: (dates: string[], mode: 'add' | 'remove') => void;
  showCompanyHolidays?: boolean;
  hoveredWindow?: number | null;
  onHoverWindow?: (id: number | null) => void;
  /** Map from windowId → label string, shown in hover tooltips */
  windowLabels?: Map<number, string>;
  /** YYYY-MM-DD — days before this date are dimmed */
  today?: string;
  /** 0-indexed month to start the view on */
  defaultStartMonth?: number;
  /** Home airport IATA code for flight search links */
  origin?: string;
}

export function InteractiveCalendar({
  days,
  selectedPTO = EMPTY_SET,
  previewDates = EMPTY_SET,
  activeHolidayDateStr = null,
  onDayClick,
  onTogglePTO,
  onDragSelect,
  showCompanyHolidays = false,
  hoveredWindow = null,
  onHoverWindow,
  windowLabels = EMPTY_MAP,
  today,
  defaultStartMonth = 0,
  origin = '',
}: InteractiveCalendarProps) {
  const todayStr = today ?? new Date().toISOString().slice(0, 10);
  const [startMonth, setStartMonth] = useState(defaultStartMonth);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Drag-to-select state
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');
  const [dragDates, setDragDates] = useState<Set<string>>(new Set());
  const dragJustEndedRef = useRef(false);

  const handleDragStart = useCallback((day: DayData) => {
    const mode = selectedPTO.has(day.dateStr) ? 'remove' : 'add';
    setIsDragging(true);
    setDragMode(mode);
    setDragDates(new Set([day.dateStr]));
  }, [selectedPTO]);

  const handleDragEnter = useCallback((day: DayData) => {
    setDragDates((prev) => {
      const next = new Set(prev);
      next.add(day.dateStr);
      return next;
    });
  }, []);

  // Commit drag on mouseup (attached to window)
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseUp = () => {
      if (dragDates.size > 0 && onDragSelect) {
        onDragSelect([...dragDates], dragMode);
      }
      setIsDragging(false);
      setDragDates(new Set());
      dragJustEndedRef.current = true;
      setTimeout(() => { dragJustEndedRef.current = false; }, 0);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, dragDates, dragMode, onDragSelect]);

  useEffect(() => {
    setStartMonth(defaultStartMonth);
  }, [defaultStartMonth]);

  const handleHoverWindow = useCallback(
    (id: number | null) => { onHoverWindow?.(id); },
    [onHoverWindow]
  );

  // Derive unique year-month pairs from the actual data
  const allMonths = useMemo(() => {
    const seen = new Set<string>();
    const result: { year: number; month: number }[] = [];
    for (const d of days) {
      const y = d.date.getFullYear();
      const m = d.date.getMonth();
      const key = `${y}-${m}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ year: y, month: m });
      }
    }
    return result;
  }, [days]);

  const visibleMonths = useMemo(
    () => allMonths.filter((_, i) => i >= startMonth),
    [startMonth, allMonths]
  );

  const baseYear = allMonths.length > 0 ? allMonths[0].year : new Date().getFullYear();

  const legendItems = useMemo(() => [
    { color: 'bg-sage', label: 'Public holiday' },
    ...(showCompanyHolidays ? [{ color: 'bg-amber', label: 'Company holiday' }] : []),
    { color: 'bg-coral', label: 'PTO' },
    ...(onDayClick ? [{ color: 'bg-coral/30 border-2 border-coral border-dashed', label: 'Preview' }] : []),
    { color: 'bg-stone-warm', label: 'Weekend' },
    { color: 'bg-white border border-border', label: 'Workday' },
  ], [showCompanyHolidays, onDayClick]);

  return (
    <div>
      {/* Navigation + Legend row */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 mb-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStartMonth((m) => Math.max(0, m - 1))}
            disabled={startMonth === 0}
            aria-label="Previous month"
            className="flex items-center gap-1.5 text-base font-semibold text-ink-muted hover:text-teal disabled:opacity-25 disabled:cursor-not-allowed transition-colors px-2.5 py-1.5 rounded-lg hover:bg-cream disabled:hover:bg-transparent"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="hidden sm:inline">{startMonth > 0 ? MONTH_ABBR[allMonths[startMonth - 1]?.month ?? 0] : MONTH_ABBR[allMonths[0]?.month ?? 0]}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMonthPicker((v) => !v)}
              className="text-base font-semibold text-ink-muted hover:text-teal transition-colors px-3 py-1.5 rounded-lg hover:bg-cream flex items-center gap-2"
              aria-label="Jump to month"
            >
              {startMonth > 0
                ? `${MONTH_ABBR[allMonths[startMonth]?.month ?? 0]} – ${MONTH_ABBR[allMonths[allMonths.length - 1]?.month ?? 11]}`
                : 'All months'}
              <svg className={`w-5 h-5 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Month quick-jump dropdown */}
            {showMonthPicker && (
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white rounded-xl border border-border shadow-lg p-3 z-20 grid grid-cols-4 gap-2 min-w-[260px]">
                <button
                  onClick={() => { setStartMonth(0); setShowMonthPicker(false); }}
                  className={`text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors ${
                    startMonth === 0
                      ? 'bg-teal text-white'
                      : 'text-ink-muted hover:bg-cream hover:text-teal'
                  }`}
                >
                  All
                </button>
                {allMonths.map(({ year: y, month: m }, i) => (
                  <button
                    key={`${y}-${m}`}
                    onClick={() => { setStartMonth(i); setShowMonthPicker(false); }}
                    className={`text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors ${
                      startMonth === i && startMonth !== 0
                        ? 'bg-teal text-white'
                        : 'text-ink-muted hover:bg-cream hover:text-teal'
                    }`}
                  >
                    {y !== baseYear ? `${MONTH_ABBR[m]} '${String(y).slice(2)}` : MONTH_ABBR[m]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setStartMonth((m) => Math.min(allMonths.length - 1, m + 1))}
            disabled={startMonth >= allMonths.length - 1}
            aria-label="Next month"
            className="flex items-center gap-1.5 text-base font-semibold text-ink-muted hover:text-teal disabled:opacity-25 disabled:cursor-not-allowed transition-colors px-2.5 py-1.5 rounded-lg hover:bg-cream disabled:hover:bg-transparent"
          >
            <span className="hidden sm:inline">{startMonth < allMonths.length - 1 ? MONTH_ABBR[allMonths[startMonth + 1]?.month ?? 0] : MONTH_ABBR[allMonths[allMonths.length - 1]?.month ?? 11]}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Legend — inline right */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 sm:gap-x-5 sm:gap-y-2">
          {legendItems.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-ink-muted font-medium">
              <span className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded shrink-0 ${l.color}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Month grid + flight message boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-8">
        {visibleMonths.map(({ year: y, month: m }) => (
          <MonthGrid
            key={`${y}-${m}`}
            year={y}
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
            showYear={y !== baseYear}
            isDragging={isDragging}
            dragDates={dragDates}
            dragMode={dragMode}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            dragJustEndedRef={dragJustEndedRef}
            onTogglePTO={onTogglePTO}
          />
        ))}
      </div>

      {/* Flight search message boxes */}
      {origin.length >= 3 && (
        <FlightStreaks days={days} selectedPTO={selectedPTO} todayStr={todayStr} origin={origin} />
      )}
    </div>
  );
}
