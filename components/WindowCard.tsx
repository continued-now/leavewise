'use client';

import { useState } from 'react';
import { VacationWindow, FlightDeal } from '@/lib/types';
import { buildKiwiLink, buildTripComLink, buildBookingComLink } from '@/lib/affiliates';
import { downloadICS } from '@/lib/ics';

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
  origin?: string;
  currency?: string;
  tripComAffiliateId?: string;
  bookingComAffiliateId?: string;
  onAdjustPTO?: (id: number, delta: number) => void;
  remainingBudget?: number;
}

export function WindowCard({
  window: w,
  isHighlighted,
  onHover,
  flightDeal,
  origin = '',
  currency = 'USD',
  tripComAffiliateId = '',
  bookingComAffiliateId = '',
  onAdjustPTO,
  remainingBudget = 0,
}: WindowCardProps) {
  const accentColor = WINDOW_COLORS[(w.id - 1) % WINDOW_COLORS.length];
  const deal = flightDeal !== 'loading' && flightDeal !== 'error' ? flightDeal : undefined;
  const [copied, setCopied] = useState(false);

  function handleCopyDates() {
    const text = `${formatDate(w.startStr)} – ${formatDateLong(w.endStr)}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className={`bg-white rounded-2xl border-l-4 border border-border ${accentColor} p-5 transition-all duration-200 cursor-default ${
        isHighlighted ? 'shadow-md border-opacity-100' : 'hover:shadow-sm'
      }`}
      onMouseEnter={() => onHover(w.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-ink-muted font-medium mb-1 truncate">{w.label}</div>
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
                onClick={(e) => { e.stopPropagation(); onAdjustPTO(w.id, -1); }}
                disabled={w.ptoDaysUsed <= 1}
                className="w-6 h-6 rounded-md border border-border bg-cream text-ink-muted hover:border-coral/40 hover:text-coral disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-xs font-medium"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-display font-semibold text-coral">
                {w.ptoDaysUsed}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAdjustPTO(w.id, +1); }}
                disabled={remainingBudget <= 0}
                className="w-6 h-6 rounded-md border border-border bg-cream text-ink-muted hover:border-teal/40 hover:text-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-xs font-medium"
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
          className="inline-flex items-center gap-1 bg-sage-light text-sage text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-help"
        >
          {w.efficiency.toFixed(1)}× efficiency
        </span>
        {w.bookendRisks && w.bookendRisks.length > 0 && (
          <span
            title={`Holiday pay risk: ${w.bookendRisks.map((r) => r.holidayName).join(', ')}`}
            className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-help"
          >
            ⚠ Pay risk
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
          <div className="h-5 w-28 bg-border/60 rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-border/60 rounded-full animate-pulse" />
        </div>
      )}

      {/* Flight deal: loaded */}
      {deal && (
        <div className="mb-3 space-y-2">
          {/* Price badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-teal-light text-teal text-[11px] font-semibold px-2 py-0.5 rounded-full border border-teal/20">
              From {formatPrice(deal.price, deal.currency)} · {deal.destination}
            </span>
          </div>

          {/* Booking CTAs */}
          <div className="flex flex-wrap gap-2">
            <a
              href={buildKiwiLink(deal.deeplink)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal text-white px-2.5 py-1 rounded-lg hover:bg-teal-hover transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Book on Kiwi
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            {origin && (
              <a
                href={buildTripComLink(origin, w.startStr, currency, tripComAffiliateId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-cream text-ink-soft px-2.5 py-1 rounded-lg border border-border hover:border-teal/40 hover:text-teal transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Trip.com
              </a>
            )}
            {origin && (
              <a
                href={buildBookingComLink(origin, w.startStr, w.endStr, bookingComAffiliateId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-cream text-ink-soft px-2.5 py-1 rounded-lg border border-border hover:border-teal/40 hover:text-teal transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Booking.com
              </a>
            )}
          </div>

          {/* Cheaper-day prompt */}
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
          {/* Travel value score + crowd warnings */}
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
                  ? '✦ Great travel value'
                  : w.travelValueScore >= 40
                    ? '~ Moderate travel value'
                    : '⚠ Peak travel period'}
              </span>
            </div>
          )}

          {/* Crowd warnings (up to 2) */}
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

          {/* Destination ideas */}
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
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Copy dates */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleCopyDates(); }}
            title="Copy date range"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-muted hover:text-teal transition-colors"
          >
            {copied ? (
              'Copied ✓'
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy dates
              </>
            )}
          </button>

          {/* Add to calendar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadICS(w.startStr, w.endStr, w.label, w.ptoDaysUsed);
            }}
            title="Download .ics calendar event"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-muted hover:text-teal transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add to calendar
          </button>
        </div>

        {!deal && flightDeal !== 'loading' && (
          <a
            href={w.skyscannerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal hover:text-teal-hover transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Find flights
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
