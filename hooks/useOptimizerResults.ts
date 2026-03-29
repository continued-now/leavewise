'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { FormState, OptimizationResult, FlightDeal, HotelDeal, Strategy, VacationWindow, DayData } from '@/lib/types';
import type { LockedWindow } from '@/lib/optimizer';
import { downloadAllICS } from '@/lib/ics';
import { trackOptimize, trackCalendarExport } from '@/lib/analytics';

const COUNTRY_CURRENCY: Record<string, string> = { US: 'USD', KR: 'KRW' };

// ---------------------------------------------------------------------------
// API response types (dates arrive as ISO strings, need rehydration)
// ---------------------------------------------------------------------------
interface SerializedDay extends Omit<DayData, 'date'> {
  date: string;
}

interface SerializedWindow extends Omit<VacationWindow, 'startDate' | 'endDate'> {
  startDate: string;
  endDate: string;
}

interface SerializedResult extends Omit<OptimizationResult, 'days' | 'windows'> {
  days: SerializedDay[];
  windows: SerializedWindow[];
}

interface OptimizeAPIResponse {
  balanced: SerializedResult;
  short?: SerializedResult;
  long?: SerializedResult;
  error?: string;
}

/** Rehydrate ISO date strings back to Date objects */
function rehydrateResult(serialized: SerializedResult): OptimizationResult {
  return {
    ...serialized,
    days: serialized.days.map((d) => ({
      ...d,
      date: new Date(d.date),
    })),
    windows: serialized.windows.map((w) => ({
      ...w,
      startDate: new Date(w.startDate),
      endDate: new Date(w.endDate),
    })),
  };
}

// ---------------------------------------------------------------------------
// Flight + hotel deal fetchers (unchanged)
// ---------------------------------------------------------------------------
async function fetchFlightDealsForWindows(
  windows: OptimizationResult['windows'],
  origin: string,
  currency: string,
  onUpdate: (id: number, deal: FlightDeal | 'error') => void
): Promise<Record<number, FlightDeal | 'error'>> {
  const results: Record<number, FlightDeal | 'error'> = {};
  await Promise.all(
    windows.map(async (w) => {
      try {
        const params = new URLSearchParams({
          origin,
          dateFrom: w.startStr,
          dateTo: w.endStr,
          currency,
        });
        const res = await fetch(`/api/flights?${params.toString()}`);
        if (!res.ok) { results[w.id] = 'error'; onUpdate(w.id, 'error'); return; }
        const deal: FlightDeal | null = await res.json();
        const resolved = deal ?? 'error';
        results[w.id] = resolved;
        onUpdate(w.id, resolved);
      } catch {
        results[w.id] = 'error';
        onUpdate(w.id, 'error');
      }
    })
  );
  return results;
}

async function fetchHotelDealsForWindows(
  windows: OptimizationResult['windows'],
  flightResults: Record<number, FlightDeal | 'error'>,
  currency: string,
  onUpdate: (id: number, deal: HotelDeal | 'error') => void
) {
  await Promise.all(
    windows.map(async (w) => {
      const flight = flightResults[w.id];
      if (!flight || flight === 'error') { onUpdate(w.id, 'error'); return; }
      try {
        const params = new URLSearchParams({
          destination: flight.destination,
          checkIn: w.startStr,
          checkOut: w.endStr,
          currency,
        });
        const res = await fetch(`/api/hotels?${params.toString()}`);
        if (!res.ok) { onUpdate(w.id, 'error'); return; }
        const deal: HotelDeal | null = await res.json();
        onUpdate(w.id, deal ?? 'error');
      } catch {
        onUpdate(w.id, 'error');
      }
    })
  );
}

// ---------------------------------------------------------------------------
// API call to server-side optimizer
// ---------------------------------------------------------------------------
async function callOptimizeAPI(
  form: FormState,
  lockedWindows: LockedWindow[],
  allStrategies: boolean
): Promise<OptimizeAPIResponse> {
  const res = await fetch('/api/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      country: form.country,
      year: form.year,
      usState: form.usState,
      leavePool: form.leavePool,
      daysToAllocate: form.daysToAllocate,
      maxDaysPerWindow: form.maxDaysPerWindow,
      companyHolidaysRaw: form.companyHolidaysRaw,
      prebookedRaw: form.prebookedRaw,
      travelValueWeight: form.travelValueWeight,
      lockedWindows,
      allStrategies,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Optimization failed (${res.status})`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useOptimizerResults(
  form: FormState,
  setSelectedPTO: (s: Set<string>) => void,
  setActiveHoliday: (d: null) => void,
  setPreviewDates: (s: Set<string>) => void,
  setSidebarOpen: (open: boolean) => void,
  toast: (msg: string, type?: 'success' | 'info') => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const resultRef = useRef<OptimizationResult | null>(null);
  const resultsAreaRef = useRef<HTMLDivElement>(null);
  const [hoveredWindow, setHoveredWindow] = useState<number | null>(null);
  const [windowSort, setWindowSort] = useState<'date' | 'efficiency' | 'length'>('date');
  const [flightDeals, setFlightDeals] = useState<Record<number, FlightDeal | 'loading' | 'error'>>({});
  const [hotelDeals, setHotelDeals] = useState<Record<number, HotelDeal | 'loading' | 'error'>>({});
  const [windowAllocations, setWindowAllocations] = useState<Record<number, number>>({});
  const windowAllocationsRef = useRef<Record<number, number>>({});
  const [showShareCard, setShowShareCard] = useState(false);

  const [strategies, setStrategies] = useState<Record<Strategy, OptimizationResult | null>>({
    short: null, balanced: null, long: null,
  });
  const [activeStrategy, setActiveStrategy] = useState<Strategy>('balanced');

  // Sync displayed result when active strategy changes
  useEffect(() => {
    const s = strategies[activeStrategy];
    if (s) {
      setResult(s);
      resultRef.current = s;
      const ptoDates = new Set(
        s.days.filter((d) => d.isPTO && !d.isPrebooked).map((d) => d.dateStr)
      );
      setSelectedPTO(ptoDates);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStrategy, strategies]);

  const sortedWindows = useMemo(() => {
    if (!result) return [];
    const ws = [...result.windows];
    if (windowSort === 'efficiency') ws.sort((a, b) => b.efficiency - a.efficiency);
    else if (windowSort === 'length') ws.sort((a, b) => b.totalDays - a.totalDays);
    else ws.sort((a, b) => a.startStr.localeCompare(b.startStr));
    return ws;
  }, [result, windowSort]);

  const bestWindowId = useMemo(() => {
    if (!result || result.windows.length === 0) return null;
    const best = result.windows.reduce((a, b) =>
      b.efficiency > a.efficiency || (b.efficiency === a.efficiency && b.totalDays > a.totalDays) ? b : a
    );
    return best.id;
  }, [result]);

  const windowLabels = useMemo(() => {
    const m = new Map<number, string>();
    if (result?.windows) {
      for (const w of result.windows) {
        m.set(w.id, `${w.label} · ${w.totalDays} days off`);
      }
    }
    return m;
  }, [result]);

  const handleOptimize = useCallback(
    async (isAllocationAdjustment = false) => {
      setLoading(true);
      setError(null);
      if (!isAllocationAdjustment) {
        setResult(null);
        resultRef.current = null;
        setFlightDeals({});
        setHotelDeals({});
        windowAllocationsRef.current = {};
        setWindowAllocations({});
      }

      try {
        const currentAllocations = windowAllocationsRef.current;
        const currentResult = resultRef.current;
        const lockedWindows: LockedWindow[] =
          isAllocationAdjustment && currentResult
            ? Object.entries(currentAllocations)
                .map(([id, pto]) => {
                  const w = currentResult.windows.find((win) => win.id === Number(id));
                  return w ? { startStr: w.startStr, endStr: w.endStr, targetPTO: pto } : null;
                })
                .filter((x): x is LockedWindow => x !== null)
            : [];

        const allStrategies = !isAllocationAdjustment;
        const apiResult = await callOptimizeAPI(form, lockedWindows, allStrategies);

        if (apiResult.error) {
          throw new Error(apiResult.error);
        }

        const optimized = rehydrateResult(apiResult.balanced);

        if (allStrategies && apiResult.short && apiResult.long) {
          const shortResult = rehydrateResult(apiResult.short);
          const longResult = rehydrateResult(apiResult.long);
          setStrategies({ short: shortResult, balanced: optimized, long: longResult });
        } else {
          setStrategies((prev) => ({ ...prev, balanced: optimized }));
        }

        setActiveStrategy('balanced');
        resultRef.current = optimized;
        setResult(optimized);

        const ptoDates = new Set(
          optimized.days.filter((d) => d.isPTO && !d.isPrebooked).map((d) => d.dateStr)
        );
        setSelectedPTO(ptoDates);
        setActiveHoliday(null);
        setPreviewDates(new Set());

        const currency = COUNTRY_CURRENCY[form.country] ?? 'USD';
        const initial: Record<number, 'loading'> = {};
        optimized.windows.forEach((w) => { initial[w.id] = 'loading'; });
        setFlightDeals(initial);
        setHotelDeals(initial);
        fetchFlightDealsForWindows(
          optimized.windows,
          form.homeAirport,
          currency,
          (id, deal) => setFlightDeals((prev) => ({ ...prev, [id]: deal }))
        ).then((flightResults) => {
          fetchHotelDealsForWindows(
            optimized.windows,
            flightResults,
            currency,
            (id, deal) => setHotelDeals((prev) => ({ ...prev, [id]: deal }))
          );
        });

        // Scroll to results with offset for sticky nav + stats bar (~100px)
        setTimeout(() => {
          const el = resultsAreaRef.current;
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 110;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            el.focus();
          }
        }, 200);

        setSidebarOpen(false);

        const bestW = optimized.windows.reduce((a, b) =>
          b.efficiency > a.efficiency ? b : a, optimized.windows[0]
        );
        trackOptimize(form.country, form.daysToAllocate);

        if (bestW && bestW.efficiency >= 3) {
          toast(`${bestW.efficiency.toFixed(1)}x efficiency — ${bestW.ptoDaysUsed} PTO days → ${bestW.totalDays} days off!`);
        } else {
          toast(`Found ${optimized.windows.length} optimized window${optimized.windows.length === 1 ? '' : 's'}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form]
  );

  const handleAdjustAllocation = useCallback(
    (windowId: number, delta: number) => {
      const currentWindow = resultRef.current?.windows.find((w) => w.id === windowId);
      if (!currentWindow) return;
      const currentPTO = windowAllocationsRef.current[windowId] ?? currentWindow.ptoDaysUsed;
      const newPTO = Math.max(1, currentPTO + delta);
      const updated = { ...windowAllocationsRef.current, [windowId]: newPTO };
      windowAllocationsRef.current = updated;
      setWindowAllocations(updated);
      handleOptimize(true);
    },
    [handleOptimize]
  );

  const handleExportAll = useCallback(() => {
    if (!result || result.windows.length === 0) return;
    downloadAllICS(result.windows);
    trackCalendarExport('ics');
    toast(`Exported ${result.windows.length} windows to calendar`);
  }, [result, toast]);

  const clearOptimizerState = useCallback(() => {
    setResult(null);
    resultRef.current = null;
    setFlightDeals({});
    setHotelDeals({});
    windowAllocationsRef.current = {};
    setWindowAllocations({});
    setStrategies({ short: null, balanced: null, long: null });
    setActiveStrategy('balanced');
  }, []);

  return {
    loading,
    error,
    result,
    resultRef,
    resultsAreaRef,
    hoveredWindow,
    setHoveredWindow,
    windowSort,
    setWindowSort,
    flightDeals,
    hotelDeals,
    windowAllocations,
    showShareCard,
    setShowShareCard,
    strategies,
    activeStrategy,
    setActiveStrategy,
    sortedWindows,
    bestWindowId,
    windowLabels,
    handleOptimize,
    handleAdjustAllocation,
    handleExportAll,
    clearOptimizerState,
  };
}
