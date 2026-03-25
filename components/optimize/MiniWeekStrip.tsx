import type { LongWeekendPreview } from '@/lib/longWeekends';

export function MiniWeekStrip({
  lw,
  miniWeekAbbr,
}: {
  lw: LongWeekendPreview;
  miniWeekAbbr: readonly string[];
}) {
  const holidayDate = new Date(lw.id + 'T00:00:00');
  const dow = holidayDate.getDay();
  const sunday = new Date(holidayDate);
  sunday.setDate(sunday.getDate() - dow);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return (
    <div className="flex gap-0.5 mt-3">
      {weekDays.map((dateStr, i) => {
        const isWeekend = i === 0 || i === 6;
        const isBridge = lw.bridgeDates.includes(dateStr);
        const isHoliday = dateStr === lw.id;
        const inWindow = dateStr >= lw.startStr && dateStr <= lw.endStr;

        let cell = 'bg-cream border border-border/60 text-ink-muted/40';
        if (inWindow) {
          if (isHoliday)       cell = 'bg-sage text-white';
          else if (isBridge)   cell = 'bg-coral text-white';
          else if (isWeekend)  cell = 'bg-stone-warm text-ink-muted';
          else                 cell = 'bg-coral-light border border-coral/20 text-ink';
        }

        return (
          <div
            key={dateStr}
            className={`flex-1 aspect-square flex items-center justify-center text-[8px] font-semibold rounded-sm ${cell}`}
          >
            {miniWeekAbbr[i]}
          </div>
        );
      })}
    </div>
  );
}
