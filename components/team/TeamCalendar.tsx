'use client';

import { useMemo } from 'react';
import type { TeamMember } from '@/lib/team';

interface TeamCalendarProps {
  members: TeamMember[];
  year: number;
  startMonth?: number;
}

interface CalendarDay {
  dateStr: string;
  day: number;
  isWeekend: boolean;
  memberColors: string[]; // colors of members off this day
  isConflict: boolean; // 2+ members off
}

function getMonthDays(year: number, month: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().slice(0, 10);
    const dow = date.getDay();

    days.push({
      dateStr,
      day: d,
      isWeekend: dow === 0 || dow === 6,
      memberColors: [],
      isConflict: false,
    });
  }
  return days;
}

function getDateRange(startStr: string, endStr: string): Set<string> {
  const dates = new Set<string>();
  const current = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  while (current <= end) {
    dates.add(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function TeamCalendar({ members, year, startMonth }: TeamCalendarProps) {
  // Build member date maps
  const memberDateMap = useMemo(() => {
    const map = new Map<string, string[]>(); // dateStr -> member colors
    for (const member of members) {
      for (const w of member.windows) {
        const dates = getDateRange(w.startStr, w.endStr);
        for (const d of dates) {
          const existing = map.get(d) ?? [];
          existing.push(member.color);
          map.set(d, existing);
        }
      }
    }
    return map;
  }, [members]);

  const start = startMonth ?? new Date().getMonth();
  const monthsToShow = 3;

  const months = useMemo(() => {
    const result: { month: number; year: number; days: CalendarDay[] }[] = [];
    for (let i = 0; i < monthsToShow; i++) {
      const m = (start + i) % 12;
      const y = year + Math.floor((start + i) / 12);
      const days = getMonthDays(y, m);

      // Annotate with member data
      for (const day of days) {
        const colors = memberDateMap.get(day.dateStr) ?? [];
        day.memberColors = colors;
        day.isConflict = colors.length >= 2;
      }

      result.push({ month: m, year: y, days });
    }
    return result;
  }, [start, year, memberDateMap]);

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <p className="text-sm text-ink-muted">No team members yet. Add windows to see the calendar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: m.color }}
            />
            <span className="text-xs text-ink-muted">{m.name}</span>
          </div>
        ))}
        {members.length >= 2 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shrink-0 border-2 border-coral bg-coral/20" />
            <span className="text-xs text-coral font-medium">Overlap</span>
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-border p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {months.map(({ month, year: y, days }) => {
            // First day of month offset
            const firstDow = new Date(y, month, 1).getDay();
            const blanks = Array(firstDow).fill(null);

            return (
              <div key={`${y}-${month}`}>
                <h3 className="text-xs font-semibold text-ink mb-2">
                  {MONTH_NAMES[month]} {y}
                </h3>
                <div className="grid grid-cols-7 gap-px">
                  {DAY_HEADERS.map((d) => (
                    <div key={d} className="text-center text-[9px] font-semibold text-ink-muted/60 pb-1">
                      {d}
                    </div>
                  ))}
                  {blanks.map((_, i) => (
                    <div key={`blank-${i}`} />
                  ))}
                  {days.map((day) => {
                    const hasMembers = day.memberColors.length > 0;
                    const isConflict = day.isConflict;

                    return (
                      <div
                        key={day.dateStr}
                        className={`aspect-square flex items-center justify-center rounded-md text-[10px] relative ${
                          day.isWeekend
                            ? 'text-ink-muted/40'
                            : hasMembers
                              ? 'font-semibold'
                              : 'text-ink-soft'
                        }`}
                        title={
                          hasMembers
                            ? `${day.dateStr}${isConflict ? ' (OVERLAP)' : ''}`
                            : day.dateStr
                        }
                      >
                        {/* Background color for member off */}
                        {hasMembers && !isConflict && (
                          <div
                            className="absolute inset-0.5 rounded-md opacity-25"
                            style={{ backgroundColor: day.memberColors[0] }}
                          />
                        )}
                        {/* Conflict: striped pattern */}
                        {isConflict && (
                          <div
                            className="absolute inset-0.5 rounded-md border-2 border-coral/50"
                            style={{
                              background: `repeating-linear-gradient(
                                45deg,
                                ${day.memberColors[0]}33,
                                ${day.memberColors[0]}33 2px,
                                ${day.memberColors[1] ?? day.memberColors[0]}33 2px,
                                ${day.memberColors[1] ?? day.memberColors[0]}33 4px
                              )`,
                            }}
                          />
                        )}
                        <span className="relative z-10">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation hint */}
      <p className="text-[10px] text-ink-muted text-center">
        Showing {MONTH_NAMES[months[0].month]} &ndash; {MONTH_NAMES[months[months.length - 1].month]} {year}
      </p>
    </div>
  );
}
