'use client';

import { DayData } from '@/lib/types';

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// How many days in each month for a given year
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

interface TimelineBarProps {
  days: DayData[];
  hoveredWindow: number | null;
  onHoverWindow: (id: number | null) => void;
  today: string; // YYYY-MM-DD
}

export function TimelineBar({ days, hoveredWindow, onHoverWindow, today }: TimelineBarProps) {
  if (!days.length) return null;

  const year = days[0].date.getFullYear();
  const dayMap = new Map<string, DayData>();
  for (const d of days) dayMap.set(d.dateStr, d);

  // Build month data: counts for proportional widths
  const months = Array.from({ length: 12 }, (_, m) => ({
    month: m,
    count: daysInMonth(year, m),
  }));

  function getDayColor(day: DayData, isPast: boolean, isHovered: boolean): string {
    if (isPast) {
      if (day.isWeekend) return 'bg-stone-warm/30';
      return 'bg-border/40';
    }
    if (isHovered) return 'bg-coral/70';
    if (day.isPTO || day.isPrebooked) return 'bg-coral';
    if (day.windowId !== undefined) return 'bg-coral/25';
    if (day.isHoliday) return 'bg-sage';
    if (day.isCompanyHoliday) return 'bg-amber/70';
    if (day.isWeekend) return 'bg-stone-warm/60';
    return 'bg-border/30';
  }

  return (
    <div className="mb-4 print:hidden">
      {/* Month labels */}
      <div className="flex mb-1">
        {months.map(({ month, count }) => (
          <div
            key={month}
            style={{ flex: count }}
            className="text-center text-[10px] font-medium text-ink-muted/60 tracking-wide overflow-hidden"
          >
            {MONTH_ABBR[month]}
          </div>
        ))}
      </div>

      {/* Day strip */}
      <div className="flex h-6 rounded-lg overflow-hidden gap-px">
        {days.map((day) => {
          const isPast = day.dateStr < today;
          const isToday = day.dateStr === today;
          const isHovered = hoveredWindow !== null && day.windowId === hoveredWindow;

          return (
            <div
              key={day.dateStr}
              style={{ flex: 1 }}
              title={
                isToday
                  ? 'Today'
                  : day.holidayName
                    ? day.holidayName
                    : day.isPTO
                      ? 'PTO'
                      : undefined
              }
              className={`
                relative transition-all duration-100
                ${getDayColor(day, isPast, isHovered)}
                ${isToday ? 'ring-1 ring-inset ring-teal' : ''}
                ${day.windowId !== undefined && !isPast ? 'cursor-pointer' : 'cursor-default'}
              `}
              onMouseEnter={() => day.windowId !== undefined && !isPast && onHoverWindow(day.windowId)}
              onMouseLeave={() => onHoverWindow(null)}
            />
          );
        })}
      </div>
    </div>
  );
}
