'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { FormState, OptimizationResult } from '@/lib/types';

interface WhatIfProps {
  form: FormState;
  currentResult: OptimizationResult;
  locale: 'en' | 'ko';
}

interface WhatIfResult {
  delta: number;
  totalDaysOff: number;
  totalLeaveUsed: number;
  windowCount: number;
  efficiency: number;
}

export function WhatIfPanel({ form, currentResult, locale }: WhatIfProps) {
  const [extraDays, setExtraDays] = useState(0);
  const [whatIfResult, setWhatIfResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentEfficiency =
    currentResult.totalDaysOff / Math.max(1, currentResult.totalLeaveUsed);

  const isKo = locale === 'ko';

  const runWhatIf = useCallback(
    async (delta: number) => {
      if (delta === 0) {
        setWhatIfResult(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const modifiedLeavePool = {
          ...form.leavePool,
          ptoDays: Math.max(0, form.leavePool.ptoDays + delta),
        };

        const res = await fetch('/api/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: form.country,
            year: form.year,
            usState: form.usState,
            leavePool: modifiedLeavePool,
            daysToAllocate: Math.max(0, form.daysToAllocate + delta),
            maxDaysPerWindow: form.maxDaysPerWindow,
            companyHolidaysRaw: form.companyHolidaysRaw,
            prebookedRaw: form.prebookedRaw,
            travelValueWeight: form.travelValueWeight,
            lockedWindows: [],
            allStrategies: false,
          }),
        });

        if (!res.ok) {
          setWhatIfResult(null);
          setError(isKo ? '계산에 실패했습니다. 다시 시도해 주세요.' : 'Calculation failed. Please try again.');
          return;
        }

        const data = await res.json();
        const balanced = data.balanced;
        if (!balanced) {
          setWhatIfResult(null);
          return;
        }

        setWhatIfResult({
          delta,
          totalDaysOff: balanced.totalDaysOff,
          totalLeaveUsed: balanced.totalLeaveUsed,
          windowCount: balanced.windows.length,
          efficiency:
            balanced.totalDaysOff / Math.max(1, balanced.totalLeaveUsed),
        });
      } catch {
        setWhatIfResult(null);
        setError(isKo ? '네트워크 오류가 발생했습니다.' : 'Network error — check your connection.');
      } finally {
        setLoading(false);
      }
    },
    [form, isKo]
  );

  const handleChange = useCallback(
    (delta: number) => {
      setExtraDays(delta);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runWhatIf(delta), 400);
    },
    [runWhatIf]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const daysOffDelta = whatIfResult
    ? whatIfResult.totalDaysOff - currentResult.totalDaysOff
    : 0;
  const effDelta = whatIfResult
    ? whatIfResult.efficiency - currentEfficiency
    : 0;

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide">
          {isKo ? '만약에...' : 'What if...'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-ink-soft whitespace-nowrap">
          {isKo ? '연차가' : 'I had'}
        </span>

        <div className="flex items-center bg-cream border border-border rounded-lg overflow-hidden shrink-0">
          <button
            type="button"
            onClick={() => handleChange(Math.max(-form.leavePool.ptoDays, extraDays - 1))}
            className="px-2 py-1.5 text-ink-muted hover:text-teal hover:bg-teal-light transition-colors text-sm font-semibold"
          >
            -
          </button>
          <div className="w-12 text-center text-sm font-display font-semibold text-teal border-x border-border py-1.5">
            {extraDays > 0 ? `+${extraDays}` : extraDays}
          </div>
          <button
            type="button"
            onClick={() => handleChange(Math.min(20, extraDays + 1))}
            className="px-2 py-1.5 text-ink-muted hover:text-teal hover:bg-teal-light transition-colors text-sm font-semibold"
          >
            +
          </button>
        </div>

        <span className="text-xs text-ink-soft whitespace-nowrap">
          {isKo ? '일 더 있다면?' : 'more days?'}
        </span>
      </div>

      {/* Results */}
      {loading && (
        <div className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {isKo ? '계산 중...' : 'Calculating...'}
        </div>
      )}

      {error && !loading && (
        <p className="mt-2 text-xs text-coral">{error}</p>
      )}

      {!loading && whatIfResult && extraDays !== 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="bg-cream rounded-lg px-3 py-2 text-center">
            <div className={`text-lg font-display font-semibold ${daysOffDelta > 0 ? 'text-sage' : daysOffDelta < 0 ? 'text-coral' : 'text-ink-muted'}`}>
              {daysOffDelta > 0 ? '+' : ''}{daysOffDelta}
            </div>
            <div className="text-[9px] text-ink-muted font-semibold">
              {isKo ? '휴가 일수' : 'days off'}
            </div>
          </div>
          <div className="bg-cream rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-display font-semibold text-teal">
              {whatIfResult.totalDaysOff}
            </div>
            <div className="text-[9px] text-ink-muted font-semibold">
              {isKo ? '총 휴가' : 'total off'}
            </div>
          </div>
          <div className="bg-cream rounded-lg px-3 py-2 text-center">
            <div className={`text-lg font-display font-semibold ${effDelta > 0 ? 'text-sage' : effDelta < 0 ? 'text-coral' : 'text-ink-muted'}`}>
              {effDelta > 0 ? '+' : ''}{effDelta.toFixed(1)}x
            </div>
            <div className="text-[9px] text-ink-muted font-semibold">
              {isKo ? '효율 변화' : 'efficiency'}
            </div>
          </div>
        </div>
      )}

      {!loading && extraDays !== 0 && whatIfResult && daysOffDelta !== 0 && (
        <p className="mt-2 text-[11px] text-ink-muted leading-relaxed">
          {extraDays > 0
            ? (isKo
                ? `연차 ${extraDays}일을 더 쓰면 ${daysOffDelta}일의 추가 휴가를 얻을 수 있습니다.`
                : `${extraDays} more PTO day${extraDays !== 1 ? 's' : ''} would unlock ${daysOffDelta} extra day${daysOffDelta !== 1 ? 's' : ''} off.`)
            : (isKo
                ? `연차 ${Math.abs(extraDays)}일을 줄이면 휴가가 ${Math.abs(daysOffDelta)}일 줄어듭니다.`
                : `${Math.abs(extraDays)} fewer PTO day${Math.abs(extraDays) !== 1 ? 's' : ''} would mean ${Math.abs(daysOffDelta)} fewer day${Math.abs(daysOffDelta) !== 1 ? 's' : ''} off.`)}
        </p>
      )}
    </div>
  );
}
