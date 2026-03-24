function toICSDate(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

function nextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function generateICS(startStr: string, endStr: string, label: string, ptoDaysUsed: number): string {
  const dtStart = toICSDate(startStr);
  const dtEnd = nextDay(endStr);
  const summary = `Vacation – ${label}`;
  const description = `Leavewise optimized window. ${ptoDaysUsed} PTO ${ptoDaysUsed === 1 ? 'day' : 'days'} used.`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Leavewise//EN',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICS(startStr: string, endStr: string, label: string, ptoDaysUsed: number): void {
  const content = generateICS(startStr, endStr, label, ptoDaysUsed);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vacation-${startStr}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
