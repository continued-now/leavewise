'use client';

import { useState, useCallback } from 'react';
import {
  REMINDER_LABELS,
  type ReminderTypeValue,
} from '@/lib/reminders';

const REMINDER_TYPES: ReminderTypeValue[] = [
  'pto_reset',
  'booking_deadline',
  'weekly_digest',
];

export interface ReminderSignupProps {
  windows?: { startStr: string; endStr: string; label: string }[];
  country: 'US' | 'KR';
  className?: string;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function ReminderSignup({
  windows,
  country,
  className = '',
}: ReminderSignupProps) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState<Set<ReminderTypeValue>>(
    new Set(['pto_reset', 'booking_deadline'])
  );
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleReminder = useCallback((type: ReminderTypeValue) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (selected.size === 0) {
        setErrorMsg('Select at least one reminder type.');
        setState('error');
        return;
      }

      setState('submitting');
      setErrorMsg('');

      try {
        const res = await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            reminders: Array.from(selected),
            country,
            windows,
          }),
        });

        if (res.status === 429) {
          setErrorMsg('Too many requests. Please try again later.');
          setState('error');
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setErrorMsg(data?.error ?? 'Something went wrong. Please try again.');
          setState('error');
          return;
        }

        setState('success');
      } catch {
        setErrorMsg('Network error. Please check your connection.');
        setState('error');
      }
    },
    [email, selected, country, windows]
  );

  // Success state
  if (state === 'success') {
    return (
      <div
        className={`bg-white border border-border rounded-2xl p-6 text-center ${className}`}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal/10 mb-3">
          <svg
            className="w-6 h-6 text-teal animate-[checkmark_0.4s_ease-in-out]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-ink">You&apos;re all set!</p>
        <p className="text-xs text-ink-muted mt-1">
          We&apos;ll send reminders to {email}
        </p>
      </div>
    );
  }

  // Collapsed teaser
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={`w-full bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-teal/40 transition-colors text-left group ${className}`}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-teal"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">
            Never miss a PTO deadline
          </p>
          <p className="text-xs text-ink-muted">
            Get reminders before your time off resets
          </p>
        </div>
        <svg
          className="w-4 h-4 text-ink-muted/50 group-hover:text-teal transition-colors flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    );
  }

  // Expanded form
  return (
    <div
      className={`bg-white border border-border rounded-2xl p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4.5 h-4.5 text-teal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">PTO Reminders</p>
            <p className="text-xs text-ink-muted">
              Never miss a deadline again
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-ink-muted hover:text-ink transition-colors p-0.5"
          aria-label="Collapse reminder signup"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M6 6l8 8M14 6l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Reminder type checkboxes */}
        <div className="space-y-2 mb-4">
          {REMINDER_TYPES.map((type) => {
            const label = REMINDER_LABELS[type];
            const checked = selected.has(type);
            return (
              <label
                key={type}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${
                  checked
                    ? 'bg-teal/5 border border-teal/20'
                    : 'bg-surface border border-transparent hover:border-border'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleReminder(type)}
                  className="mt-0.5 w-4 h-4 rounded border-border text-teal accent-teal focus:ring-teal/30"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink">
                    {label.title}
                  </p>
                  <p className="text-[11px] text-ink-muted leading-snug">
                    {label.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Email + submit */}
        <div className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === 'error') setState('idle');
            }}
            placeholder="you@email.com"
            className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-teal/40 focus:ring-1 focus:ring-teal/20 transition-colors"
          />
          <button
            type="submit"
            disabled={state === 'submitting'}
            className="px-4 py-2 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-hover transition-colors disabled:opacity-60 flex-shrink-0"
          >
            {state === 'submitting' ? (
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving
              </span>
            ) : (
              'Notify me'
            )}
          </button>
        </div>

        {/* Error message */}
        {state === 'error' && errorMsg && (
          <p className="text-xs text-red-600 mt-2">{errorMsg}</p>
        )}

        {/* Privacy note */}
        <p className="text-[10px] text-ink-muted/60 mt-2.5">
          Unsubscribe anytime. We never share your email.
        </p>
      </form>
    </div>
  );
}
