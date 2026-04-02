import { buildGoogleCalendarLink } from '@/lib/affiliates';
import { downloadICS, downloadAllICS } from '@/lib/ics';

interface CalendarWindow {
  startStr: string;
  endStr: string;
  label: string;
  ptoDaysUsed: number;
}

/**
 * Build an Outlook Calendar deep link for an all-day event.
 * Opens the Outlook web compose form pre-filled with dates and title.
 */
export function buildOutlookCalendarLink(
  startStr: string,
  endStr: string,
  label: string,
  ptoDaysUsed: number,
): string {
  const title = `${label} (${ptoDaysUsed} PTO day${ptoDaysUsed === 1 ? '' : 's'})`;
  const body = `Planned via Leavewise PTO Optimizer\n${ptoDaysUsed} PTO day${ptoDaysUsed === 1 ? '' : 's'} used`;

  // Outlook end date is exclusive for all-day events, add 1 day
  const endDate = new Date(endStr + 'T00:00:00');
  endDate.setDate(endDate.getDate() + 1);
  const endClean = endDate.toISOString().slice(0, 10);

  const params = new URLSearchParams({
    subject: title,
    startdt: startStr,
    enddt: endClean,
    body,
    allday: 'true',
  });

  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}

/**
 * Build a Yahoo Calendar link for an all-day event.
 */
export function buildYahooCalendarLink(
  startStr: string,
  endStr: string,
  label: string,
  ptoDaysUsed: number,
): string {
  const title = `${label} (${ptoDaysUsed} PTO day${ptoDaysUsed === 1 ? '' : 's'})`;
  const desc = `Planned via Leavewise PTO Optimizer\n${ptoDaysUsed} PTO day${ptoDaysUsed === 1 ? '' : 's'} used`;

  // Yahoo expects YYYYMMDD for the start date
  const st = startStr.replace(/-/g, '');

  const params = new URLSearchParams({
    v: '60',
    title,
    st,
    dur: 'allday',
    desc,
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

/**
 * Open multiple Google Calendar events in new tabs (one per window).
 * Browsers may block popups after the first, so we stagger with a small delay.
 */
export function openBulkGoogleCalendar(windows: CalendarWindow[]): void {
  windows.forEach((w, i) => {
    const url = buildGoogleCalendarLink(w.startStr, w.endStr, w.label, w.ptoDaysUsed);
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, i * 300);
  });
}

// Re-export for convenience so consumers can import everything from one place
export { buildGoogleCalendarLink } from '@/lib/affiliates';
export { downloadICS, downloadAllICS } from '@/lib/ics';
