'use client';

import { useState, useRef, useEffect } from 'react';
import {
  downloadICS,
  downloadAllICS,
  buildGoogleCalendarLink,
  buildOutlookCalendarLink,
  buildYahooCalendarLink,
  openBulkGoogleCalendar,
} from '@/lib/calendar-export';

interface CalendarWindow {
  startStr: string;
  endStr: string;
  label: string;
  ptoDaysUsed: number;
}

interface CalendarExportMenuProps {
  windows: CalendarWindow[];
  mode: 'single' | 'bulk';
  className?: string;
}

export function CalendarExportMenu({ windows, mode, className = '' }: CalendarExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const w = windows[0];

  function handleICS(e: React.MouseEvent) {
    e.stopPropagation();
    if (mode === 'single' && w) {
      downloadICS(w.startStr, w.endStr, w.label, w.ptoDaysUsed);
    } else {
      downloadAllICS(windows);
    }
    setOpen(false);
  }

  function handleGoogle(e: React.MouseEvent) {
    e.stopPropagation();
    if (mode === 'single' && w) {
      window.open(buildGoogleCalendarLink(w.startStr, w.endStr, w.label, w.ptoDaysUsed), '_blank', 'noopener,noreferrer');
    } else {
      openBulkGoogleCalendar(windows);
    }
    setOpen(false);
  }

  function handleOutlook(e: React.MouseEvent) {
    e.stopPropagation();
    if (mode === 'single' && w) {
      window.open(buildOutlookCalendarLink(w.startStr, w.endStr, w.label, w.ptoDaysUsed), '_blank', 'noopener,noreferrer');
    } else {
      windows.forEach((win, i) => {
        setTimeout(() => {
          window.open(buildOutlookCalendarLink(win.startStr, win.endStr, win.label, win.ptoDaysUsed), '_blank', 'noopener,noreferrer');
        }, i * 300);
      });
    }
    setOpen(false);
  }

  function handleYahoo(e: React.MouseEvent) {
    e.stopPropagation();
    if (mode === 'single' && w) {
      window.open(buildYahooCalendarLink(w.startStr, w.endStr, w.label, w.ptoDaysUsed), '_blank', 'noopener,noreferrer');
    } else {
      windows.forEach((win, i) => {
        setTimeout(() => {
          window.open(buildYahooCalendarLink(win.startStr, win.endStr, win.label, win.ptoDaysUsed), '_blank', 'noopener,noreferrer');
        }, i * 300);
      });
    }
    setOpen(false);
  }

  const isBulk = mode === 'bulk';

  return (
    <div ref={menuRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={isBulk ? 'Export all to calendar' : 'Add to calendar'}
        className={
          isBulk
            ? 'text-[10px] font-semibold text-teal hover:text-teal-hover transition-colors flex items-center gap-1 px-2 py-1 rounded-lg border border-teal/20 hover:border-teal/40 bg-teal-light'
            : 'inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted hover:text-teal transition-colors py-1'
        }
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {isBulk ? 'Export All' : 'Calendar'}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-1 w-52 bg-white rounded-xl border border-border shadow-lg py-1.5 animate-fade-in ${
            isBulk ? 'right-0 top-full' : 'left-0 top-full'
          }`}
          role="menu"
        >
          <button
            type="button"
            onClick={handleICS}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-ink hover:bg-cream transition-colors text-left"
            role="menuitem"
          >
            <svg className="w-4 h-4 text-ink-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <div>
              <div className="font-semibold">Download .ics</div>
              <div className="text-[10px] text-ink-muted">Apple Calendar, any app</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-ink hover:bg-cream transition-colors text-left"
            role="menuitem"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#4285F4" strokeWidth="1.5" />
              <path d="M3 9h18" stroke="#4285F4" strokeWidth="1.5" />
              <path d="M9 3v6" stroke="#4285F4" strokeWidth="1.5" />
              <path d="M15 3v6" stroke="#4285F4" strokeWidth="1.5" />
              <rect x="6" y="12" width="3" height="3" rx="0.5" fill="#4285F4" />
            </svg>
            <div>
              <div className="font-semibold">Google Calendar</div>
              <div className="text-[10px] text-ink-muted">{isBulk ? 'Opens each event' : 'Add event'}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleOutlook}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-ink hover:bg-cream transition-colors text-left"
            role="menuitem"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#0078D4" strokeWidth="1.5" />
              <path d="M3 9h18" stroke="#0078D4" strokeWidth="1.5" />
              <circle cx="12" cy="15" r="3" stroke="#0078D4" strokeWidth="1.5" />
            </svg>
            <div>
              <div className="font-semibold">Outlook Calendar</div>
              <div className="text-[10px] text-ink-muted">{isBulk ? 'Opens each event' : 'Outlook.com'}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleYahoo}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-ink hover:bg-cream transition-colors text-left"
            role="menuitem"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#6001D2" strokeWidth="1.5" />
              <path d="M8 8l4 5 4-5" stroke="#6001D2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 13v4" stroke="#6001D2" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>
              <div className="font-semibold">Yahoo Calendar</div>
              <div className="text-[10px] text-ink-muted">{isBulk ? 'Opens each event' : 'Add event'}</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
