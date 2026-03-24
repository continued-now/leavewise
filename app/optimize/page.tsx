'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { WindowCard } from '@/components/WindowCard';
import { InteractiveCalendar } from '@/components/InteractiveCalendar';
import { HolidayPanel } from '@/components/HolidayPanel';
import { optimizePTO, buildCalendarBase, LockedWindow } from '@/lib/optimizer';
import { getBridgeSuggestions, BridgeOption } from '@/lib/bridge-suggestions';
import { US_STATES } from '@/lib/countries';
import { getStateHolidays } from '@/lib/state-holidays';
import { Holiday, DayData, LeavePool, OptimizationResult, FlightDeal } from '@/lib/types';
import { inferAirport } from '@/lib/airports';
import { buildTripComLink, buildBookingComLink } from '@/lib/affiliates';
import { computeLongWeekends, formatPreviewDate, LongWeekendPreview } from '@/lib/longWeekends';
import { TimelineBar } from '@/components/TimelineBar';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2];

type CountryCode = 'US' | 'KR';

const COUNTRY_CURRENCY: Record<CountryCode, string> = {
  US: 'USD',
  KR: 'KRW',
};

interface FormState {
  country: CountryCode;
  usState: string;
  year: number;
  leavePool: LeavePool;
  daysToAllocate: number;
  maxDaysPerWindow: number;
  companyName: string;
  companyHolidaysRaw: string;
  prebookedRaw: string;
  homeAirport: string;
  airportManuallySet: boolean;
  travelValueWeight: 0 | 0.4 | 0.8;
}

function parseDates(raw: string): string[] {
  return raw
    .split(/[\n,;\s]+/)
    .map((s) => s.trim().slice(0, 10))
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
}

async function fetchHolidaysForSettings(
  year: number,
  country: CountryCode,
  usState: string
): Promise<Holiday[]> {
  const res = await fetch(`/api/holidays?year=${year}&country=${country}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to fetch holiday data');
  }
  let holidays: Holiday[] = await res.json();
  if (country === 'US') {
    holidays = holidays.filter(
      (h) =>
        h.global ||
        h.counties === null ||
        (Array.isArray(h.counties) && h.counties.includes(usState))
    );
    const stateHols = getStateHolidays(year, usState).map((sh) => ({
      date: sh.date,
      localName: sh.name,
      name: sh.name,
      countryCode: 'US',
      fixed: true,
      global: false,
      counties: [usState],
      types: ['Public'],
    }));
    holidays = [...holidays, ...stateHols];
  }
  return holidays;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold tracking-widest uppercase text-ink-muted/70 mb-3 flex items-center gap-2">
      <span className="flex-1 h-px bg-border" />
      {children}
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 60,
  sublabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  sublabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1">
        <div className="text-xs font-semibold text-ink-soft">{label}</div>
        {sublabel && <div className="text-[10px] text-ink-muted mt-0.5">{sublabel}</div>}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-lg border border-border bg-cream text-ink-muted hover:border-teal/40 hover:text-teal transition-colors flex items-center justify-center text-sm font-medium"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-display font-semibold text-ink">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-lg border border-border bg-cream text-ink-muted hover:border-teal/40 hover:text-teal transition-colors flex items-center justify-center text-sm font-medium"
        >
          +
        </button>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 group"
      >
        <span className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-ink-muted/70 group-hover:text-ink-muted transition-colors flex items-center gap-1.5 shrink-0">
          {title}
          {!open && badge && (
            <span className="bg-teal/10 text-teal text-[9px] font-semibold px-1.5 py-0.5 rounded-full tracking-normal normal-case border border-teal/15">
              {badge}
            </span>
          )}
        </span>
        <span className="flex-1 h-px bg-border" />
        <svg
          className={`w-3 h-3 shrink-0 text-ink-muted/50 group-hover:text-ink-muted transition-all duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

const MINI_WEEK_ABBR = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function MiniWeekStrip({ lw }: { lw: LongWeekendPreview }) {
  // Build the 7 days of the Sunday-anchored week containing the main holiday
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
            {MINI_WEEK_ABBR[i]}
          </div>
        );
      })}
    </div>
  );
}

function LongWeekendCard({ lw }: { lw: LongWeekendPreview }) {
  const isFree = lw.ptoCost === 0;
  const accentClass = isFree ? 'border-l-sage' : 'border-l-coral';
  const badgeClass = isFree ? 'bg-sage-light text-sage' : 'bg-coral-light text-coral';
  const badgeLabel = isFree ? 'No PTO needed' : `${lw.ptoCost} PTO day${lw.ptoCost > 1 ? 's' : ''}`;

  return (
    <div className={`bg-white rounded-2xl border border-border border-l-4 ${accentClass} p-4`}>
      <div className="text-[10px] text-ink-muted font-medium truncate leading-snug">
        {lw.holidayNames.join(' · ')}
      </div>
      <div className="flex items-baseline gap-1.5 mt-1 mb-1">
        <span className="text-2xl font-display font-semibold text-ink">{lw.totalDays}</span>
        <span className="text-xs text-ink-muted">days off</span>
      </div>
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
        {badgeLabel}
      </span>
      <MiniWeekStrip lw={lw} />
      <div className="text-[10px] text-ink-muted mt-2">
        {formatPreviewDate(lw.startStr)} – {formatPreviewDate(lw.endStr)}
      </div>
    </div>
  );
}

export default function OptimizePage() {
  const [form, setForm] = useState<FormState>({
    country: 'US',
    usState: 'US-NY',
    year: CURRENT_YEAR,
    leavePool: { ptoDays: 15, compDays: 0, floatingHolidays: 0 },
    daysToAllocate: 15,
    maxDaysPerWindow: 14,
    companyName: '',
    companyHolidaysRaw: '',
    prebookedRaw: '',
    homeAirport: inferAirport('US'),
    airportManuallySet: false,
    travelValueWeight: 0,
  });

  // Optimizer state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const resultRef = useRef<OptimizationResult | null>(null);
  const [hoveredWindow, setHoveredWindow] = useState<number | null>(null);
  const [windowSort, setWindowSort] = useState<'date' | 'efficiency' | 'length'>('date');
  const [flightDeals, setFlightDeals] = useState<Record<number, FlightDeal | 'loading' | 'error'>>({});
  const [windowAllocations, setWindowAllocations] = useState<Record<number, number>>({});
  const windowAllocationsRef = useRef<Record<number, number>>({});

  // Interactive calendar state
  const [baseCalendar, setBaseCalendar] = useState<DayData[] | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [selectedPTO, setSelectedPTO] = useState<Set<string>>(new Set());
  const [previewDates, setPreviewDates] = useState<Set<string>>(new Set());
  const [activeHoliday, setActiveHoliday] = useState<DayData | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<BridgeOption[]>([]);

  // Derived values
  const totalLeave =
    form.leavePool.ptoDays + form.leavePool.compDays + form.leavePool.floatingHolidays;
  const prebookedCount = baseCalendar?.filter((d) => d.isPrebooked).length ?? 0;
  const remainingPTO = Math.max(0, totalLeave - prebookedCount - selectedPTO.size);

  // Long weekends preview — computed from baseCalendar whenever it changes
  const longWeekends = useMemo(() => {
    if (!baseCalendar) return [];
    const today = new Date().toISOString().slice(0, 10);
    return computeLongWeekends(baseCalendar, today);
  }, [baseCalendar]);

  const freeWeekends = useMemo(() => longWeekends.filter((w) => w.ptoCost === 0), [longWeekends]);
  const boostWeekends = useMemo(() => longWeekends.filter((w) => w.ptoCost > 0), [longWeekends]);

  // Sorted windows for the results grid
  const sortedWindows = useMemo(() => {
    if (!result) return [];
    const ws = [...result.windows];
    if (windowSort === 'efficiency') ws.sort((a, b) => b.efficiency - a.efficiency);
    else if (windowSort === 'length') ws.sort((a, b) => b.totalDays - a.totalDays);
    else ws.sort((a, b) => a.startStr.localeCompare(b.startStr));
    return ws;
  }, [result, windowSort]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const calendarDays = result?.days ?? baseCalendar ?? [];
  const defaultStartMonth = form.year === CURRENT_YEAR ? new Date().getMonth() : 0;
  const hasCompanyHolidays = parseDates(form.companyHolidaysRaw).length > 0;
  const selectedStateName = US_STATES.find((s) => s.code === form.usState)?.name ?? '';
  const remainingBudget = result?.remainingLeave ?? 0;

  // Auto-load base calendar when location / year / company settings change
  useEffect(() => {
    let cancelled = false;
    setCalendarLoading(true);

    (async () => {
      try {
        const holidays = await fetchHolidaysForSettings(form.year, form.country, form.usState);
        if (cancelled) return;
        const companyHolidayDates = parseDates(form.companyHolidaysRaw);
        const prebookedDates = parseDates(form.prebookedRaw);
        const base = buildCalendarBase(form.year, holidays, companyHolidayDates, prebookedDates);
        setBaseCalendar(base);
      } catch {
        // silent — user can still use the optimizer
      } finally {
        if (!cancelled) setCalendarLoading(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country, form.usState, form.year, form.companyHolidaysRaw, form.prebookedRaw]);

  // Clear interactive state when fundamental settings change
  useEffect(() => {
    setSelectedPTO(new Set());
    setActiveHoliday(null);
    setActiveSuggestions([]);
    setPreviewDates(new Set());
    setResult(null);
    resultRef.current = null;
    setFlightDeals({});
    windowAllocationsRef.current = {};
    setWindowAllocations({});
  }, [form.country, form.usState, form.year]);

  // Keep bridge suggestions fresh whenever activeHoliday or selection changes
  useEffect(() => {
    if (!activeHoliday || !baseCalendar) return;
    const suggestions = getBridgeSuggestions(
      activeHoliday.dateStr,
      baseCalendar,
      remainingPTO,
      selectedPTO
    );
    setActiveSuggestions(suggestions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHoliday, baseCalendar, remainingPTO, selectedPTO]);

  const setLeave = (key: keyof LeavePool, value: number) =>
    setForm((f) => {
      const newPool = { ...f.leavePool, [key]: value };
      const oldTotal = f.leavePool.ptoDays + f.leavePool.compDays + f.leavePool.floatingHolidays;
      const newTotal = newPool.ptoDays + newPool.compDays + newPool.floatingHolidays;
      const newDaysToAllocate =
        f.daysToAllocate >= oldTotal ? newTotal : Math.min(f.daysToAllocate, newTotal);
      return { ...f, leavePool: newPool, daysToAllocate: newDaysToAllocate };
    });

  const handleCountryChange = (code: CountryCode) => {
    setForm((f) => ({
      ...f,
      country: code,
      homeAirport: f.airportManuallySet ? f.homeAirport : inferAirport(code),
    }));
  };

  const handleDayClick = useCallback(
    (day: DayData) => {
      if (day.isHoliday) {
        if (activeHoliday?.dateStr === day.dateStr) {
          setActiveHoliday(null);
          setPreviewDates(new Set());
        } else {
          setActiveHoliday(day);
          setPreviewDates(new Set());
        }
      } else if (!day.isFree && !day.isPrebooked) {
        setSelectedPTO((prev) => {
          const next = new Set(prev);
          if (next.has(day.dateStr)) next.delete(day.dateStr);
          else next.add(day.dateStr);
          return next;
        });
      }
    },
    [activeHoliday]
  );

  const handleApplyBridge = useCallback((daysToAdd: string[]) => {
    setSelectedPTO((prev) => {
      const next = new Set(prev);
      daysToAdd.forEach((d) => next.add(d));
      return next;
    });
  }, []);

  const handlePreviewEnter = useCallback((dates: string[]) => {
    setPreviewDates(new Set(dates));
  }, []);

  const handlePreviewLeave = useCallback(() => {
    setPreviewDates(new Set());
  }, []);

  const fetchFlightDeals = async (
    windows: OptimizationResult['windows'],
    origin: string,
    currency: string
  ) => {
    const initial: Record<number, 'loading'> = {};
    windows.forEach((w) => { initial[w.id] = 'loading'; });
    setFlightDeals(initial);

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
          const deal: FlightDeal | null = await res.json();
          setFlightDeals((prev) => ({ ...prev, [w.id]: deal ?? 'error' }));
        } catch {
          setFlightDeals((prev) => ({ ...prev, [w.id]: 'error' }));
        }
      })
    );
  };

  const handleOptimize = useCallback(
    async (isAllocationAdjustment = false) => {
      setLoading(true);
      setError(null);
      if (!isAllocationAdjustment) {
        setResult(null);
        resultRef.current = null;
        setFlightDeals({});
        windowAllocationsRef.current = {};
        setWindowAllocations({});
      }

      try {
        const holidays = await fetchHolidaysForSettings(form.year, form.country, form.usState);
        const companyHolidayDates = parseDates(form.companyHolidaysRaw);
        const prebookedDates = parseDates(form.prebookedRaw);

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

        const optimized = optimizePTO(
          form.year,
          form.leavePool,
          holidays,
          companyHolidayDates,
          prebookedDates,
          form.country,
          {
            maxWindowDays: form.maxDaysPerWindow,
            budgetCap: form.daysToAllocate,
            lockedWindows,
            travelValueWeight: form.travelValueWeight,
            homeCountry: form.country,
          }
        );

        resultRef.current = optimized;
        setResult(optimized);

        // Reflect optimizer results on the interactive calendar
        const ptoDates = new Set(
          optimized.days.filter((d) => d.isPTO && !d.isPrebooked).map((d) => d.dateStr)
        );
        setSelectedPTO(ptoDates);
        setActiveHoliday(null);
        setPreviewDates(new Set());

        const currency = COUNTRY_CURRENCY[form.country] ?? 'USD';
        fetchFlightDeals(optimized.windows, form.homeAirport, currency);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleOptimize]
  );

  // Keyboard shortcut: ⌘↵ / Ctrl+↵ to optimize
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!loading && totalLeave > 0) handleOptimize();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleOptimize, loading, totalLeave]);

  return (
    <div className="min-h-screen bg-cream">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display font-semibold text-ink text-lg tracking-tight hover:text-teal transition-colors"
          >
            Leavewise
          </Link>
          <div className="hidden sm:flex items-center gap-5 text-sm">
            {result ? (
              <>
                <span className="text-ink-muted"><span className="font-semibold text-ink">{result.totalLeaveUsed}</span> used</span>
                <span className="text-ink-muted"><span className="font-semibold text-coral">{result.totalDaysOff}</span> days off</span>
                <span className="text-ink-muted"><span className="font-semibold text-sage">{result.windows.length}</span> windows</span>
                <span className="text-ink-muted"><span className="font-semibold text-teal">{result.remainingLeave}</span> remaining</span>
              </>
            ) : (
              <span className="text-ink-muted">
                <span className="font-semibold text-teal">{totalLeave}</span> leave days · {form.year}
                {selectedPTO.size > 0 && <span className="ml-3"><span className="font-semibold text-coral">{selectedPTO.size}</span> manually added</span>}
              </span>
            )}
            <button
              onClick={() => window.print()}
              className="print:hidden flex items-center gap-1 text-xs text-ink-muted hover:text-teal transition-colors border border-border rounded-lg px-2.5 py-1 hover:border-teal/40"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── SIDEBAR FORM ── */}
          <aside className="lg:w-80 xl:w-88 shrink-0">
            <div className="bg-white rounded-2xl border border-border p-6 sticky top-24 space-y-5 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <div>
                <h1 className="text-xl font-display font-semibold text-ink">
                  Plan your time off
                </h1>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Fill in your details and we&apos;ll find the best windows.
                </p>
              </div>

              {/* ── LOCATION ── */}
              <div>
                <SectionLabel>Location</SectionLabel>

                <div className="flex gap-2 mb-3">
                  {([
                    { code: 'US', label: '🇺🇸 United States' },
                    { code: 'KR', label: '🇰🇷 South Korea' },
                  ] as { code: CountryCode; label: string }[]).map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => handleCountryChange(code)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        form.country === code
                          ? 'bg-teal text-white border-teal'
                          : 'bg-cream text-ink-muted border-border hover:border-teal/40'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                    Home airport
                  </label>
                  <input
                    type="text"
                    value={form.homeAirport}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
                      setForm((f) => ({ ...f, homeAirport: val, airportManuallySet: true }));
                    }}
                    placeholder="e.g. ICN"
                    maxLength={3}
                    className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink font-mono uppercase placeholder:text-ink-muted/50 placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                  />
                  {form.country === 'KR' && (
                    <p className="text-[10px] text-ink-muted mt-1">
                      ICN for international · GMP for Japan / China routes
                    </p>
                  )}
                </div>

                {form.country === 'US' && (
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                      State
                    </label>
                    <select
                      value={form.usState}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, usState: e.target.value }))
                      }
                      className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                    >
                      {US_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* ── YEAR ── */}
              <div>
                <SectionLabel>Year</SectionLabel>
                <div className="flex gap-2">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      onClick={() => setForm((f) => ({ ...f, year: y }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        form.year === y
                          ? 'bg-teal text-white border-teal'
                          : 'bg-cream text-ink-muted border-border hover:border-teal/40'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── LEAVE POOL ── */}
              <div>
                <SectionLabel>Your leave pool</SectionLabel>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-ink-soft">PTO days</label>
                      <span className="text-base font-display font-semibold text-teal">
                        {form.leavePool.ptoDays}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={form.leavePool.ptoDays}
                      onChange={(e) => setLeave('ptoDays', parseInt(e.target.value, 10))}
                      className="w-full accent-teal"
                    />
                    <div className="flex justify-between text-[10px] text-ink-muted mt-0.5">
                      <span>0</span><span>40</span>
                    </div>
                    {/* Quick-select presets */}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {[5, 10, 15, 20, 25].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setLeave('ptoDays', n)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                            form.leavePool.ptoDays === n
                              ? 'bg-teal text-white border-teal'
                              : 'bg-cream text-ink-muted border-border hover:border-teal/40 hover:text-teal'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <NumberStepper
                    label="Comp days earned"
                    sublabel="Days owed to you for overtime / working holidays"
                    value={form.leavePool.compDays}
                    onChange={(v) => setLeave('compDays', v)}
                  />

                  <NumberStepper
                    label="Floating holidays"
                    sublabel="Company-assigned flexible days"
                    value={form.leavePool.floatingHolidays}
                    onChange={(v) => setLeave('floatingHolidays', v)}
                  />

                  <div className="flex items-center justify-between bg-teal-light rounded-lg px-3 py-2 border border-teal/10">
                    <span className="text-xs font-semibold text-teal">Total available</span>
                    <span className="text-base font-display font-semibold text-teal">
                      {totalLeave} {totalLeave === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  {/* Days to use */}
                  {totalLeave > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-ink-soft">Days to plan</label>
                        <span className="text-sm font-display font-semibold text-ink">
                          {Math.min(form.daysToAllocate, totalLeave)}
                          {form.daysToAllocate < totalLeave && (
                            <span className="text-ink-muted font-normal text-xs"> of {totalLeave}</span>
                          )}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={totalLeave}
                        value={Math.min(form.daysToAllocate, totalLeave)}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, daysToAllocate: parseInt(e.target.value, 10) }))
                        }
                        className="w-full accent-teal"
                      />
                      <p className="text-[10px] text-ink-muted mt-0.5">
                        {form.daysToAllocate >= totalLeave
                          ? 'All days will be planned · adjust to hold some back'
                          : `${totalLeave - form.daysToAllocate} day${totalLeave - form.daysToAllocate === 1 ? '' : 's'} held back`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── COMPANY SETUP (collapsible) ── */}
              <CollapsibleSection
                title="Company setup"
                defaultOpen={!!(form.companyName || form.companyHolidaysRaw)}
                badge={form.companyName || parseDates(form.companyHolidaysRaw).length > 0 ? 'set' : undefined}
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                      Company name <span className="text-ink-muted font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">
                      Company holidays
                    </label>
                    <p className="text-[10px] text-ink-muted mb-1.5 leading-snug">
                      Free days your company gives — shown in{' '}
                      <span className="text-amber font-semibold">amber</span>{' '}
                      and won&apos;t cost any leave.
                    </p>
                    <textarea
                      value={form.companyHolidaysRaw}
                      onChange={(e) => setForm((f) => ({ ...f, companyHolidaysRaw: e.target.value }))}
                      placeholder={`${form.year}-12-24 Christmas Eve\n${form.year}-12-26 Boxing Day`}
                      rows={3}
                      className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-xs text-ink font-mono placeholder:text-ink-muted/40 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
                    />
                    <p className="text-[10px] text-ink-muted mt-1">One per line · YYYY-MM-DD</p>
                  </div>
                </div>
              </CollapsibleSection>

              {/* ── ALREADY PLANNED (collapsible) ── */}
              <CollapsibleSection
                title="Already planned"
                defaultOpen={!!form.prebookedRaw}
                badge={parseDates(form.prebookedRaw).length > 0 ? `${parseDates(form.prebookedRaw).length}d` : undefined}
              >
                <div>
                  <p className="text-[10px] text-ink-muted mb-2 leading-snug">
                    Dates already committed — deducted from your budget.
                  </p>
                  <textarea
                    value={form.prebookedRaw}
                    onChange={(e) => setForm((f) => ({ ...f, prebookedRaw: e.target.value }))}
                    placeholder={`${form.year}-06-14\n${form.year}-06-15`}
                    rows={3}
                    className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-xs text-ink font-mono placeholder:text-ink-muted/40 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
                  />
                  <p className="text-[10px] text-ink-muted mt-1">One per line · YYYY-MM-DD</p>
                </div>
              </CollapsibleSection>

              {/* ── ADVANCED (collapsible) ── */}
              <CollapsibleSection
                title="Advanced"
                defaultOpen={form.maxDaysPerWindow !== 14}
                badge={form.maxDaysPerWindow !== 14 ? `${form.maxDaysPerWindow}d max` : undefined}
              >
                <NumberStepper
                  label="Max trip length"
                  sublabel="Max days in any single window"
                  value={form.maxDaysPerWindow}
                  min={3}
                  max={28}
                  onChange={(v) => setForm((f) => ({ ...f, maxDaysPerWindow: v }))}
                />
              </CollapsibleSection>

              {/* ── OPTIMIZE FOR ── */}
              <div>
                <SectionLabel>Optimize for</SectionLabel>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { weight: 0 as const, label: 'PTO efficiency', sublabel: 'Max days off' },
                    { weight: 0.4 as const, label: 'Balanced', sublabel: 'Both' },
                    { weight: 0.8 as const, label: 'Travel value', sublabel: 'Cheap travel' },
                  ] as { weight: 0 | 0.4 | 0.8; label: string; sublabel: string }[]).map(({ weight, label, sublabel }) => (
                    <button
                      key={weight}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, travelValueWeight: weight }))}
                      className={`py-2 px-1 rounded-xl text-center border transition-all ${
                        form.travelValueWeight === weight
                          ? 'bg-teal text-white border-teal'
                          : 'bg-cream text-ink-muted border-border hover:border-teal/40'
                      }`}
                    >
                      <div className="text-[10px] font-semibold leading-tight">{label}</div>
                      <div className={`text-[9px] leading-tight mt-0.5 ${form.travelValueWeight === weight ? 'text-white/70' : 'text-ink-muted/60'}`}>{sublabel}</div>
                    </button>
                  ))}
                </div>
                {form.travelValueWeight > 0 && (
                  <p className="text-[10px] text-ink-muted mt-2 leading-snug">
                    {form.travelValueWeight === 0.8
                      ? 'Prefers windows when most destinations have low crowds and cheap flights — avoids Lunar New Year, Golden Week, European summer, etc.'
                      : 'Blends PTO efficiency with travel value — avoids the worst peak periods while still maximizing days off.'}
                  </p>
                )}
              </div>

              {/* ── SUBMIT ── */}
              <button
                onClick={() => handleOptimize()}
                disabled={loading || totalLeave === 0}
                className="w-full bg-teal text-white font-semibold py-3 rounded-xl hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
                    Finding windows…
                  </>
                ) : (
                  <>
                    Optimize my leave
                    <span className="ml-1 text-white/50 text-xs font-normal hidden sm:inline">⌘↵</span>
                  </>
                )}
              </button>

              {error && (
                <div className="bg-coral-light border border-coral/20 rounded-lg px-3 py-2.5 text-sm text-coral">
                  {error}
                </div>
              )}
            </div>
          </aside>

          {/* ── MAIN CONTENT (two-pane) ── */}
          <main className="flex-1 min-w-0">
          <div className="flex flex-col xl:flex-row gap-6 items-start">

            {/* ── LEFT PANE: scrollable results ── */}
            <div className="w-full xl:w-[440px] shrink-0 space-y-8">

            {/* Optimizer results */}
            {result && (
              <div className="space-y-8">
                {/* Summary stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: result.totalDaysOff, label: 'Days off', color: 'text-coral' },
                    { value: result.totalLeaveUsed, label: 'Leave used', color: 'text-teal' },
                    { value: result.windows.length, label: 'Windows', color: 'text-sage' },
                    { value: result.remainingLeave, label: 'Remaining', color: 'text-ink-muted' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white rounded-xl border border-border p-4 text-center"
                    >
                      <div className={`text-3xl font-display font-semibold ${s.color}`}>
                        {s.value}
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Location context */}
                <div className="flex items-center gap-2 text-sm text-ink-muted">
                  <span className="text-base">{form.country === 'US' ? '🇺🇸' : '🇰🇷'}</span>
                  <span>
                    {form.country === 'US'
                      ? `United States · ${selectedStateName}`
                      : 'South Korea'}
                  </span>
                  <span>·</span>
                  <span>{form.year}</span>
                  {form.companyName && (
                    <>
                      <span>·</span>
                      <span className="text-amber font-medium">{form.companyName}</span>
                    </>
                  )}
                </div>

                {/* Vacation windows */}
                {result.windows.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4 gap-3">
                      <h2 className="text-lg font-display font-semibold text-ink shrink-0">
                        Optimized windows
                      </h2>
                      <div className="flex gap-1">
                        {(['date', 'efficiency', 'length'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setWindowSort(s)}
                            className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-colors ${
                              windowSort === s
                                ? 'bg-teal text-white border-teal'
                                : 'bg-cream text-ink-muted border-border hover:border-teal/40'
                            }`}
                          >
                            {s === 'date' ? 'Date' : s === 'efficiency' ? 'Efficiency' : 'Length'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {sortedWindows.map((w) => (
                        <WindowCard
                          key={w.id}
                          window={w}
                          isHighlighted={hoveredWindow === w.id}
                          onHover={setHoveredWindow}
                          flightDeal={flightDeals[w.id]}
                          origin={form.homeAirport}
                          currency={COUNTRY_CURRENCY[form.country] ?? 'USD'}
                          tripComAffiliateId={
                            process.env.NEXT_PUBLIC_TRIP_COM_AFFILIATE_ID ?? ''
                          }
                          bookingComAffiliateId={
                            process.env.NEXT_PUBLIC_BOOKING_COM_AFFILIATE_ID ?? ''
                          }
                          onAdjustPTO={handleAdjustAllocation}
                          remainingBudget={remainingBudget}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-ink-muted mt-3 text-right">
                      Prices from Kiwi.com · also search Trip.com &amp; Booking.com
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-border p-8 text-center">
                    <p className="text-ink-muted text-sm">
                      No optimized windows found. Try increasing your leave pool or a different
                      year.
                    </p>
                  </div>
                )}

                {/* US Pay Insights */}
                {form.country === 'US' &&
                  result.windows.length > 0 &&
                  (() => {
                    const allBookendRisks = result.windows.flatMap((w) =>
                      (w.bookendRisks ?? []).map((r) => ({ ...r, windowLabel: w.label }))
                    );
                    const allPremiumDays = result.windows.flatMap((w) =>
                      (w.premiumPayDays ?? []).map((d) => ({ holiday: d, windowLabel: w.label }))
                    );

                    if (allBookendRisks.length === 0 && allPremiumDays.length === 0) return null;

                    return (
                      <div className="bg-white rounded-2xl border border-border p-6">
                        <h2 className="text-lg font-display font-semibold text-ink mb-1">
                          US pay insights
                        </h2>
                        <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                          Based on common US employment practices. Verify with your
                          employer&apos;s policy.
                        </p>
                        <div className="space-y-4">
                          {allBookendRisks.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                  ⚠ Holiday pay risk
                                </span>
                              </div>
                              <p className="text-xs text-ink-muted mb-2 leading-relaxed">
                                Many US employers require you to work the day{' '}
                                <strong>before and after</strong> a paid holiday to receive holiday
                                pay. The windows below include PTO on those adjacent days.
                              </p>
                              <ul className="space-y-1.5">
                                {allBookendRisks.map((r, i) => (
                                  <li key={i} className="text-xs text-ink flex items-start gap-2">
                                    <span className="mt-0.5 text-amber-500 shrink-0">•</span>
                                    <span>
                                      <span className="font-semibold">{r.holidayName}</span>
                                      {' — '}
                                      {r.riskBefore && r.riskAfter
                                        ? 'PTO falls both the day before and after'
                                        : r.riskBefore
                                          ? 'PTO falls the workday before'
                                          : 'PTO falls the workday after'}
                                      {'. You may forfeit holiday pay for this day.'}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {allPremiumDays.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-light text-teal border border-teal/20 px-2 py-0.5 rounded-full">
                                  $ Premium pay opportunity
                                </span>
                              </div>
                              <p className="text-xs text-ink-muted mb-2 leading-relaxed">
                                These holidays fall on weekdays inside your windows. If your
                                employer offers <strong>holiday premium pay (1.5×–2×)</strong>,
                                working the day and using PTO another time could earn more.
                              </p>
                              <ul className="space-y-1.5">
                                {allPremiumDays.map((d, i) => (
                                  <li key={i} className="text-xs text-ink flex items-start gap-2">
                                    <span className="mt-0.5 text-teal shrink-0">•</span>
                                    <span>
                                      <span className="font-semibold">{d.holiday}</span>
                                      {
                                        ' — working this day may qualify for double or premium pay instead of using PTO.'
                                      }
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            )}

            {/* Long weekends preview — shown before optimization */}
            {!result && !calendarLoading && longWeekends.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-display font-semibold text-ink">
                    Upcoming long weekends
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {form.country === 'US' ? selectedStateName : 'South Korea'} · {form.year}
                    {' · '}based on public holidays
                  </p>
                </div>

                {freeWeekends.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-sage">Already free</span>
                      <span className="text-[10px] text-ink-muted">· no PTO needed</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {freeWeekends.map((lw) => (
                        <LongWeekendCard key={lw.id} lw={lw} />
                      ))}
                    </div>
                  </div>
                )}

                {boostWeekends.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-ink-soft">Add a few days</span>
                      <span className="text-[10px] text-ink-muted">· use 1–3 PTO to extend</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {boostWeekends.map((lw) => (
                        <LongWeekendCard key={lw.id} lw={lw} />
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-ink-muted">
                  Hit <span className="font-medium text-teal">Optimize my leave</span> to find the best multi-day windows using your full PTO budget.
                </p>
              </div>
            )}

            </div>

            {/* ── RIGHT PANE: sticky calendar ── */}
            <div className="flex-1 min-w-0 xl:sticky xl:top-24 space-y-4">

            {/* Calendar */}
            {calendarLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-5 h-5 border-2 border-teal border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-ink-muted">Loading calendar…</p>
              </div>
            ) : calendarDays.length > 0 ? (
              <div>
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-display font-semibold text-ink">
                      {form.year} calendar
                      {form.country === 'US' && ` · ${selectedStateName}`}
                      {form.companyName && (
                        <span className="text-amber"> · {form.companyName}</span>
                      )}
                    </h2>
                    {!result && (
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                        Click a{' '}
                        <span className="font-semibold text-sage">public holiday</span> to see
                        bridge suggestions, or click any workday to manually toggle PTO.
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-display font-semibold text-teal">
                      {remainingPTO}
                    </div>
                    <div className="text-[10px] text-ink-muted leading-tight">
                      days<br />unallocated
                    </div>
                  </div>
                </div>
                <TimelineBar
                  days={calendarDays}
                  hoveredWindow={hoveredWindow}
                  onHoverWindow={setHoveredWindow}
                  today={todayStr}
                />
                <div className="bg-white rounded-2xl border border-border p-6">
                  <InteractiveCalendar
                    days={calendarDays}
                    selectedPTO={selectedPTO}
                    previewDates={previewDates}
                    activeHolidayDateStr={activeHoliday?.dateStr ?? null}
                    onDayClick={handleDayClick}
                    showCompanyHolidays={hasCompanyHolidays}
                    hoveredWindow={hoveredWindow}
                    onHoverWindow={setHoveredWindow}
                    today={todayStr}
                    defaultStartMonth={defaultStartMonth}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🗓</div>
                <h2 className="text-2xl font-display font-semibold text-ink mb-2">
                  Ready when you are
                </h2>
                <p className="text-ink-muted text-sm max-w-sm leading-relaxed">
                  Fill in your location and leave pool — the calendar loads automatically.
                </p>
              </div>
            )}
            </div>

          </div>
          </main>
        </div>
      </div>

      {/* ── HOLIDAY PANEL (fixed right drawer) ── */}
      {activeHoliday && baseCalendar && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => {
              setActiveHoliday(null);
              setPreviewDates(new Set());
            }}
          />
          {/* Panel */}
          <div className="fixed right-0 top-[61px] bottom-0 w-80 z-40 shadow-2xl">
            <HolidayPanel
              holiday={activeHoliday}
              suggestions={activeSuggestions}
              appliedDates={selectedPTO}
              remainingPTO={remainingPTO}
              onApply={handleApplyBridge}
              onPreviewEnter={handlePreviewEnter}
              onPreviewLeave={handlePreviewLeave}
              onClose={() => {
                setActiveHoliday(null);
                setPreviewDates(new Set());
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
