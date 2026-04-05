'use client';

import { useMemo } from 'react';
import { VacationWindow, FlightDeal, HotelDeal } from '@/lib/types';
import { buildFlightSearchLink, buildHotelSearchLink, buildFlightCompareLink, buildKlookLink, buildTiqetsLink, buildAiraloLink } from '@/lib/affiliates';
import { useToast } from '@/components/Toast';
import { trackAffiliateClick } from '@/lib/analytics';
import { CalendarExportMenu } from '@/components/CalendarExportMenu';
import { PriceAlertButton } from '@/components/PriceAlertButton';

const WINDOW_COLORS = [
  'border-l-teal',
  'border-l-coral',
  'border-l-sage',
  'border-l-amber-500',
  'border-l-sky-500',
  'border-l-rose-400',
  'border-l-indigo-400',
  'border-l-orange-400',
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

interface WindowCardProps {
  window: VacationWindow;
  isHighlighted: boolean;
  onHover: (id: number | null) => void;
  flightDeal?: FlightDeal | 'loading' | 'error';
  hotelDeal?: HotelDeal | 'loading' | 'error';
  origin?: string;
  currency?: string;
  tpMarker?: string;
  onAdjustPTO?: (id: number, delta: number) => void;
  remainingBudget?: number;
  isBestWindow?: boolean;
}

export function WindowCard({
  window: w,
  isHighlighted,
  onHover,
  flightDeal,
  hotelDeal,
  origin = '',
  currency = 'USD',
  tpMarker = '',
  onAdjustPTO,
  remainingBudget = 0,
  isBestWindow = false,
}: WindowCardProps) {
  const accentColor = WINDOW_COLORS[(w.id - 1) % WINDOW_COLORS.length];
  const deal = flightDeal !== 'loading' && flightDeal !== 'error' ? flightDeal : undefined;
  const hotel = hotelDeal !== 'loading' && hotelDeal !== 'error' ? hotelDeal : undefined;
  const { toast } = useToast();

  // P3-04: Estimated trip cost computation
  const nights = Math.max(w.totalDays - 1, 1);
  const estimatedCost = useMemo(() => {
    if (deal && hotel) {
      const hotelLow = hotel.minPrice * nights;
      const hotelHigh = Math.round(hotel.minPrice * 1.5) * nights;
      const low = deal.price + hotelLow;
      const high = deal.price + hotelHigh;
      return { type: 'full' as const, low, high, currency: deal.currency };
    }
    if (deal) {
      return { type: 'flight_only' as const, price: deal.price, currency: deal.currency };
    }
    return null;
  }, [deal, hotel, nights]);

  function handleCopyDates() {
    const text = `${formatDate(w.startStr)} – ${formatDateLong(w.endStr)} (${w.totalDays} days, ${w.ptoDaysUsed} PTO) · ${w.label}`;
    navigator.clipboard.writeText(text).then(() => {
      toast('Dates copied to clipboard');
    }).catch(() => {
      toast('Could not copy to clipboard', 'info');
    });
  }

  return (
    <article
      role="article"
      aria-label={`${w.label} — ${w.totalDays} days off using ${w.ptoDaysUsed} PTO${isBestWindow ? ' (most efficient)' : ''}`}
      className={`bg-white rounded-2xl border-l-4 border border-border ${accentColor} p-5 transition-all duration-200 cursor-default ${
        isHighlighted ? 'shadow-md ring-1 ring-teal/20 bg-teal/[0.02]' : 'hover:shadow-sm hover:bg-cream-dark/30 hover:border-border/80'
      } ${isBestWindow ? 'ring-2 ring-sage/20' : ''}`}
      onMouseEnter={() => onHover(w.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-ink-muted font-medium truncate">{w.label}</span>
            {isBestWindow && (
              <span className="bg-sage text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 leading-none">
                Most efficient
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-semibold text-ink">
              {w.totalDays}
            </span>
            <span className="text-sm text-ink-muted">days off</span>
          </div>
          <div className="text-xs font-medium text-ink-soft mt-0.5">
            {formatDate(w.startStr)} – {formatDateLong(w.endStr)}
          </div>
        </div>
        {/* PTO days stepper */}
        <div className="shrink-0 text-right">
          <div className="text-[10px] text-ink-muted mb-1">PTO days</div>
          {onAdjustPTO ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Use fewer PTO days"
                onClick={(e) => { e.stopPropagation(); onAdjustPTO(w.id, -1); }}
                disabled={w.ptoDaysUsed <= 1}
                className="w-8 h-8 sm:w-7 sm:h-7 rounded-md border border-border bg-cream text-ink-muted hover:border-coral/40 hover:text-coral hover:bg-coral-light active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-xs font-medium"
              >
                −
              </button>
              <span className="w-7 text-center text-sm font-display font-semibold text-coral">
                {w.ptoDaysUsed}
              </span>
              <button
                type="button"
                aria-label="Use more PTO days"
                onClick={(e) => { e.stopPropagation(); onAdjustPTO(w.id, +1); }}
                disabled={remainingBudget <= 0}
                className="w-8 h-8 sm:w-7 sm:h-7 rounded-md border border-border bg-cream text-ink-muted hover:border-teal/40 hover:text-teal hover:bg-teal-light active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-xs font-medium"
              >
                +
              </button>
            </div>
          ) : (
            <div>
              <div className="text-sm font-semibold text-coral">{w.ptoDaysUsed} PTO</div>
              <div className="text-[10px] text-ink-muted">{w.ptoDaysUsed === 1 ? 'day used' : 'days used'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Efficiency + pay badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          title="Days off per PTO day used"
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-help ${
            isBestWindow ? 'bg-sage text-white' : 'bg-sage-light text-sage'
          }`}
        >
          {w.efficiency.toFixed(1)}x efficiency
        </span>
        {w.bookendRisks && w.bookendRisks.length > 0 && (
          <span
            title={`Holiday pay risk: ${w.bookendRisks.map((r) => r.holidayName).join(', ')}`}
            className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-help"
          >
            Pay risk
          </span>
        )}
        {w.premiumPayDays && w.premiumPayDays.length > 0 && (
          <span
            title={`Premium pay opportunity: ${w.premiumPayDays.join(', ')}`}
            className="inline-flex items-center gap-1 bg-teal-light text-teal border border-teal/20 text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-help"
          >
            $ Double pay
          </span>
        )}
        {w.holidays.map((h) => (
          <span
            key={h}
            className="text-[11px] bg-cream text-ink-muted px-2 py-0.5 rounded-full border border-border"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Flight deal: loading skeleton */}
      {flightDeal === 'loading' && (
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-28 bg-border/60 rounded-full animate-skeleton" />
          <div className="h-5 w-20 bg-border/60 rounded-full animate-skeleton" />
        </div>
      )}

      {/* Flight deal: loaded */}
      {deal && (
        <div className="mb-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-teal-light text-teal text-[11px] font-semibold px-2 py-0.5 rounded-full border border-teal/20">
              ✈ {formatPrice(deal.price, deal.currency)} · {deal.destination}
            </span>
            {hotelDeal === 'loading' && (
              <div className="h-5 w-20 bg-border/60 rounded-full animate-skeleton" />
            )}
            {hotelDeal && hotelDeal !== 'loading' && hotelDeal !== 'error' && (
              <span className="inline-flex items-center gap-1 bg-cream text-ink-soft text-[11px] font-semibold px-2 py-0.5 rounded-full border border-border">
                🏨 {formatPrice(hotelDeal.minPrice, hotelDeal.currency)}/night
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {origin && (
              <a
                href={buildFlightSearchLink(origin, w.startStr, w.endStr, tpMarker || undefined, w.label)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal text-white px-2.5 py-1.5 rounded-lg hover:bg-teal-hover transition-colors"
                onClick={(e) => { e.stopPropagation(); trackAffiliateClick(w.label, 'flight'); }}
              >
                Search flights
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            )}
            {origin && (
              <a
                href={buildFlightCompareLink(origin, w.startStr, w.endStr, tpMarker || undefined, w.label)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-cream text-ink-soft px-2.5 py-1.5 rounded-lg border border-border hover:border-teal/40 hover:text-teal transition-colors"
                onClick={(e) => { e.stopPropagation(); trackAffiliateClick(w.label, 'compare'); }}
              >
                Compare
              </a>
            )}
            <a
              href={buildHotelSearchLink(deal.destination, w.startStr, w.endStr, tpMarker || undefined, w.label)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-cream text-ink-soft px-2.5 py-1.5 rounded-lg border border-border hover:border-teal/40 hover:text-teal transition-colors"
              onClick={(e) => { e.stopPropagation(); trackAffiliateClick(w.label, 'hotel'); }}
            >
              {hotelDeal && hotelDeal !== 'loading' && hotelDeal !== 'error'
                ? `Hotels from ${formatPrice(hotelDeal.minPrice, hotelDeal.currency)}/night`
                : 'Hotels'}
            </a>
          </div>

          {/* Activities row — Klook + Tiqets */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <a
              href={buildKlookLink(deal.destination, tpMarker || undefined, w.label)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-medium text-ink-muted hover:text-teal transition-colors"
              onClick={(e) => { e.stopPropagation(); trackAffiliateClick(w.label, 'activities'); }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Things to do
            </a>
            <span className="text-ink-muted/30 text-[10px] select-none">·</span>
            <a
              href={buildTiqetsLink(deal.destination, tpMarker || undefined, w.label)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-medium text-ink-muted hover:text-teal transition-colors"
              onClick={(e) => { e.stopPropagation(); trackAffiliateClick(w.label, 'attractions'); }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
              </svg>
              Attractions
            </a>
          </div>

          {/* Estimated trip cost badge */}
          {estimatedCost && estimatedCost.type === 'full' && (
            <div className="text-[10px] text-ink-muted font-medium">
              Est. trip cost: {formatPrice(estimatedCost.low, estimatedCost.currency)}–{formatPrice(estimatedCost.high, estimatedCost.currency)}
            </div>
          )}
          {estimatedCost && estimatedCost.type === 'flight_only' && (
            <div className="text-[10px] text-ink-muted font-medium">
              Flights from {formatPrice(estimatedCost.price, estimatedCost.currency)}
            </div>
          )}

          {deal.cheaperAlternative && (
            <div className="text-[11px] text-ink-muted bg-cream rounded-lg px-2.5 py-1.5 border border-border leading-snug">
              Flights are{' '}
              <span className="font-semibold text-sage">
                {deal.cheaperAlternative.savingPct}% cheaper
              </span>{' '}
              on {formatDate(deal.cheaperAlternative.date)} (
              {formatPrice(deal.cheaperAlternative.price, deal.currency)}).
              Take 1 extra PTO day?
            </div>
          )}
        </div>
      )}

      {/* Travel insights */}
      {((w.crowdInsights && w.crowdInsights.length > 0) ||
        (w.destinationIdeas && w.destinationIdeas.length > 0)) && (
        <div className="mt-3 pt-3 border-t border-border space-y-2.5">
          {w.travelValueScore !== undefined && (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  w.travelValueScore >= 70
                    ? 'bg-sage-light text-sage'
                    : w.travelValueScore >= 40
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-coral-light text-coral'
                }`}
              >
                {w.travelValueScore >= 70
                  ? 'Cheap flights likely'
                  : w.travelValueScore >= 40
                    ? 'Average prices'
                    : 'Expect higher prices'}
              </span>
            </div>
          )}

          {w.crowdInsights && w.crowdInsights.length > 0 && (
            <div className="space-y-1">
              {w.crowdInsights.slice(0, 2).map((ci) => (
                <div
                  key={ci.eventName}
                  title={ci.note}
                  className="flex items-start gap-1.5 cursor-help"
                >
                  <span
                    className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${
                      ci.crowdLevel === 'peak'
                        ? 'bg-coral'
                        : ci.crowdLevel === 'high'
                          ? 'bg-amber-500'
                          : 'bg-ink-muted/40'
                    }`}
                  />
                  <span className="text-[10px] text-ink-muted leading-snug">
                    <span className="font-semibold text-ink">{ci.eventName}</span>
                    {' — '}
                    {ci.affectedRegions.join(', ')} will be expensive
                  </span>
                </div>
              ))}
              {w.crowdInsights.length > 2 && (
                <div className="text-[10px] text-ink-muted/60 pl-3">
                  +{w.crowdInsights.length - 2} more events
                </div>
              )}
            </div>
          )}

          {w.destinationIdeas && w.destinationIdeas.length > 0 && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-ink-muted/60 mb-1.5">
                Where to go
              </div>
              <div className="flex flex-wrap gap-1.5">
                {w.destinationIdeas.slice(0, 4).map((idea) => (
                  <span
                    key={idea.region}
                    title={idea.reason}
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border cursor-help ${
                      idea.priceOutlook === 'great'
                        ? 'bg-sage-light text-sage border-sage/20'
                        : idea.priceOutlook === 'good'
                          ? 'bg-teal-light text-teal border-teal/20'
                          : idea.priceOutlook === 'fair'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-coral-light text-coral border-coral/20'
                    }`}
                  >
                    {idea.flag} {idea.region}
                    {idea.avgTempC != null && <span className="text-ink-muted/70">{idea.avgTempC}°</span>}
                    {idea.dailyBudgetUSD != null && <span className="text-ink-muted/70">~${idea.dailyBudgetUSD}/d</span>}
                  </span>
                ))}
              </div>
              {w.destinationIdeas[0].dailyBudgetUSD && (
                <div className="text-[10px] text-ink-muted mt-1.5">
                  Est. trip cost for {w.totalDays} nights in {w.destinationIdeas[0].region}: ~{formatPrice(w.destinationIdeas[0].dailyBudgetUSD * w.totalDays, 'USD')}
                  {deal && <> + {formatPrice(deal.price, deal.currency)} flights</>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="pt-3 border-t border-border mt-3">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 sm:flex-wrap">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleCopyDates(); }}
            aria-label="Copy date range to clipboard"
            className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-[11px] font-semibold text-ink-muted hover:text-teal transition-colors min-h-[44px] sm:min-h-0 sm:py-1 rounded-lg sm:rounded-none border border-border sm:border-0 bg-cream sm:bg-transparent"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>

          <CalendarExportMenu
            windows={[{ startStr: w.startStr, endStr: w.endStr, label: w.label, ptoDaysUsed: w.ptoDaysUsed }]}
            mode="single"
          />
          {deal && (
            <a
              href={buildAiraloLink(deal.destination, tpMarker || undefined, w.label)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); trackAffiliateClick(w.label, 'esim'); }}
              aria-label="Get eSIM for this destination"
              className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-[11px] font-semibold text-ink-muted hover:text-teal transition-colors min-h-[44px] sm:min-h-0 sm:py-1 rounded-lg sm:rounded-none border border-border sm:border-0 bg-cream sm:bg-transparent"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
              </svg>
              eSIM
            </a>
          )}
          {deal && origin && (
            <PriceAlertButton
              windowLabel={w.label}
              origin={origin}
              startStr={w.startStr}
              endStr={w.endStr}
              currentPrice={deal.price}
              currency={deal.currency}
              destination={deal.destination}
              className="justify-center sm:justify-start min-h-[44px] sm:min-h-0 rounded-lg sm:rounded-none border border-border sm:border-0 bg-cream sm:bg-transparent px-2"
            />
          )}
        </div>

        {!deal && flightDeal !== 'loading' && origin && (
          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            <a
              href={buildFlightSearchLink(origin, w.startStr, w.endStr, tpMarker || undefined, w.label)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal hover:text-teal-hover transition-colors min-h-[44px] sm:min-h-0"
              onClick={(e) => { e.stopPropagation(); trackAffiliateClick(w.label, 'flight'); }}
            >
              Find flights
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            {flightDeal === 'error' && (
              <span className="text-[10px] text-ink-muted">Flight prices unavailable</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
