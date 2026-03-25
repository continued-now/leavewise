import type { TranslationBundle } from '@/lib/i18n/optimize';
import type { LongWeekendPreview } from '@/lib/longWeekends';
import { formatPreviewDate } from '@/lib/longWeekends';
import { MiniWeekStrip } from './MiniWeekStrip';

export function LongWeekendCard({
  lw,
  onClick,
  l,
}: {
  lw: LongWeekendPreview;
  onClick?: () => void;
  l: TranslationBundle;
}) {
  const isFree = lw.ptoCost === 0;
  const accentClass = isFree ? 'border-l-sage' : 'border-l-coral';
  const badgeClass = isFree ? 'bg-sage-light text-sage' : 'bg-coral-light text-coral';
  const badgeLabel = isFree
    ? l.noPTONeededBadge
    : `${lw.ptoCost} ${lw.ptoCost > 1 ? l.ptoDayPlural : l.ptoDaySingular}`;

  return (
    <div
      className={`bg-white rounded-2xl border border-border border-l-4 ${accentClass} p-4 cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onClick}
    >
      <div className="text-[10px] text-ink-muted font-medium truncate leading-snug">
        {lw.holidayNames.join(' · ')}
      </div>
      <div className="flex items-baseline gap-1.5 mt-1 mb-1">
        <span className="text-2xl font-display font-semibold text-ink">{lw.totalDays}</span>
        <span className="text-xs text-ink-muted">{l.daysOff}</span>
      </div>
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
        {badgeLabel}
      </span>
      <MiniWeekStrip lw={lw} miniWeekAbbr={l.miniWeekAbbr} />
      <div className="text-[10px] text-ink-muted mt-2">
        {formatPreviewDate(lw.startStr)} – {formatPreviewDate(lw.endStr)}
      </div>
    </div>
  );
}
