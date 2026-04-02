'use client';

import { useMemo } from 'react';
import type { DayData } from '@/lib/types';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface YearMiniMapProps {
  days: DayData[];
  year: number;
  hoveredWindow: number | null;
  onHoverWindow: (id: number | null) => void;
  onMonthClick?: (month: number) => void;
}

interface MiniDay {
  dateStr: string;
  color: string;
  windowId?: number;
  opacity: number;
}

function getDayColor(day: DayData): { color: string; opacity: number } {
  if (day.isPTO || day.isPrebooked) return { color: 'bg-coral', opacity: 1 };
  if (day.isHoliday) return { color: 'bg-sage', opacity: 1 };
  if (day.isCompanyHoliday) return { color: 'bg-amber', opacity: 1 };
  if (day.isWeekend) return { color: 'bg-stone-warm', opacity: 0.5 };
  if (day.windowId) return { color: 'bg-coral', opacity: 0.3 };
  return { color: 'bg-border', opacity: 0.4 };
}

export function YearMiniMap({ days, year, hoveredWindow, onHoverWindow, onMonthClick }: YearMiniMapProps) {
  const monthData = useMemo(() => {
    // Single pass: group days by month instead of filtering 12 times
    const grouped: MiniDay[][] = Array.from({ length: 12 }, () => []);
    for (const d of days) {
      if (d.date.getFullYear() !== year) continue;
      const m = d.date.getMonth();
      const { color, opacity } = getDayColor(d);
      grouped[m].push({ dateStr: d.dateStr, color, windowId: d.windowId, opacity });
    }
    return grouped.map((mDays, m) => ({ month: m, days: mDays }));
  }, [days, year]);

  // Collect all window IDs present in the year
  const windowIds = useMemo(() => {
    const ids = new Set<number>();
    for (const d of days) {
      if (d.windowId) ids.add(d.windowId);
    }
    return ids;
  }, [days]);

  return (
    <div className="bg-white rounded-xl border border-border px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide">
          {year} at a glance
        </span>
        {windowIds.size > 0 && (
          <div className="flex items-center gap-3 text-[9px] text-ink-muted">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-sm bg-coral inline-block" />
              PTO
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-sm bg-sage inline-block" />
              Holiday
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-sm bg-stone-warm inline-block" />
              Weekend
            </span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-x-2 gap-y-3">
        {monthData.map(({ month, days: mDays }) => {
          const hasWindow = mDays.some((d) => d.windowId && d.windowId === hoveredWindow);
          return (
            <button
              key={month}
              type="button"
              className={`text-left transition-all rounded-lg px-1 py-0.5 ${
                hasWindow ? 'bg-coral/5 ring-1 ring-coral/20' : 'hover:bg-cream'
              }`}
              onClick={() => onMonthClick?.(month)}
              onMouseEnter={() => {
                // Find first window in this month to highlight
                const firstWindow = mDays.find((d) => d.windowId);
                if (firstWindow?.windowId) onHoverWindow(firstWindow.windowId);
              }}
              onMouseLeave={() => onHoverWindow(null)}
            >
              <div className="text-[9px] font-semibold text-ink-muted mb-0.5 text-center">
                {MONTH_ABBR[month]}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {/* Offset for first day of month */}
                {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} className="w-[5px] h-[5px]" />
                ))}
                {mDays.map((d) => {
                  const isHighlighted = hoveredWindow != null && d.windowId === hoveredWindow;
                  const isDimmed = hoveredWindow != null && d.windowId !== hoveredWindow && d.windowId != null;
                  return (
                    <div
                      key={d.dateStr}
                      className={`w-[5px] h-[5px] rounded-[1px] transition-all duration-100 ${d.color} ${
                        isHighlighted ? 'scale-150 ring-1 ring-coral' : ''
                      } ${isDimmed ? 'opacity-20' : ''}`}
                      style={!isHighlighted && !isDimmed ? { opacity: d.opacity } : undefined}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
