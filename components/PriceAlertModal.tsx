'use client';

import { useState, useEffect, useRef } from 'react';

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

interface PriceAlertModalProps {
  open: boolean;
  onClose: () => void;
  windowLabel: string;
  origin: string;
  startStr: string;
  endStr: string;
  currentPrice: number;
  currency: string;
  destination: string;
}

export function PriceAlertModal({
  open,
  onClose,
  windowLabel,
  origin,
  startStr,
  endStr,
  currentPrice,
  currency,
  destination,
}: PriceAlertModalProps) {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(Math.round(currentPrice * 0.85));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Load saved email from localStorage
  useEffect(() => {
    if (open) {
      try {
        const saved = localStorage.getItem('leavewise_alert_email');
        if (saved) setEmail(saved);
      } catch {}
      setTargetPrice(Math.round(currentPrice * 0.85));
      setSuccess(false);
      setError(null);
      // Focus email input after mount
      setTimeout(() => emailRef.current?.focus(), 100);
    }
  }, [open, currentPrice]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const discount = Math.round(((currentPrice - targetPrice) / currentPrice) * 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      localStorage.setItem('leavewise_alert_email', email);
    } catch {}

    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          windowLabel,
          origin,
          startStr,
          endStr,
          currentPrice,
          targetPrice,
          currency,
          destination,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to set alert');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-border w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-sm font-display font-semibold text-ink">
              Price alert
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {destination} &middot; {windowLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-muted hover:bg-cream hover:text-ink transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="px-5 pb-5 text-center">
            <div className="w-10 h-10 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-teal" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-ink mb-1">Alert set</p>
            <p className="text-xs text-ink-muted mb-3">
              We&apos;ll email you when flights to {destination} drop below{' '}
              {formatPrice(targetPrice, currency)}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-teal hover:text-teal-hover transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
            {/* Price display */}
            <div className="bg-cream rounded-xl p-3 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink-muted">Current price</span>
                <span className="text-sm font-semibold text-ink">
                  {formatPrice(currentPrice, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-muted">Alert when below</span>
                <span className="text-sm font-semibold text-teal">
                  {formatPrice(targetPrice, currency)}
                </span>
              </div>
              {discount > 0 && (
                <div className="text-[10px] text-ink-muted text-right mt-1">
                  {discount}% below current
                </div>
              )}
            </div>

            {/* Target price input */}
            <div>
              <label htmlFor="alert-target-price" className="text-xs font-medium text-ink-soft block mb-1.5">
                Target price ({currency})
              </label>
              <input
                id="alert-target-price"
                type="number"
                min={1}
                max={currentPrice}
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
              />
              <button
                type="button"
                onClick={() => setTargetPrice(Math.round(currentPrice * 0.85))}
                className="text-[10px] text-teal font-medium mt-1 hover:underline"
              >
                Reset to 15% below current
              </button>
            </div>

            {/* Email input */}
            <div>
              <label htmlFor="alert-email" className="text-xs font-medium text-ink-soft block mb-1.5">
                Email address
              </label>
              <input
                ref={emailRef}
                id="alert-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
              />
            </div>

            {/* Price history placeholder */}
            <div className="bg-cream rounded-lg p-3 border border-border">
              <div className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-2">
                Price trend
              </div>
              <div className="flex items-end gap-[3px] h-8">
                {[65, 70, 60, 75, 80, 72, 68, 85, 78, 70, 65, 62].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-teal/20"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="text-[9px] text-ink-muted/60 mt-1 text-center">
                Historical price data coming soon
              </div>
            </div>

            {error && (
              <p className="text-xs text-coral font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !email}
              className="w-full bg-teal text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-teal-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Setting alert...' : 'Alert me when price drops'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
