'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { WindowCard } from '@/components/WindowCard';
import { InteractiveCalendar } from '@/components/InteractiveCalendar';
import { HolidayPanel } from '@/components/HolidayPanel';

import { ShareCard } from '@/components/ShareCard';
import { useToast } from '@/components/Toast';
import { SectionLabel } from '@/components/optimize/SectionLabel';
import { NumberStepper } from '@/components/optimize/NumberStepper';
import { CollapsibleSection } from '@/components/optimize/CollapsibleSection';
import { LongWeekendCard } from '@/components/optimize/LongWeekendCard';
import { ExpandedLongWeekendModal } from '@/components/optimize/ExpandedLongWeekendModal';
import { useThemeLocale } from '@/hooks/useThemeLocale';
import { useFormState, DEFAULT_FORM, encodeShareURL } from '@/hooks/useFormState';
import { useCalendarBase } from '@/hooks/useCalendarBase';
import { useInteractiveCalendar } from '@/hooks/useInteractiveCalendar';
import { useOptimizerResults } from '@/hooks/useOptimizerResults';
import { parseDates, KR_SUBSTITUTE_HOLIDAYS_VERIFIED as KR_SUBSTITUTE_VERIFIED } from '@/lib/api';
import { US_STATES, COUNTRY_CURRENCY } from '@/lib/countries';
import { generatePlanSummary, getStateName } from '@/lib/planUtils';
import type { CountryCode, Strategy } from '@/lib/types';

const CURRENT_YEAR = new Date().getFullYear();

export default function OptimizePage() {
  const { toast } = useToast();
  const { locale, toggleLocale, l, theme, toggleTheme } = useThemeLocale();

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return !localStorage.getItem('leavewise_visited'); } catch { return false; }
  });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [lwGuideDismissed, setLwGuideDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem('leavewise_lw_guide_dismissed') === '1'; } catch { return false; }
  });

  // Interactive calendar state (selectedPTO needed before form & optimizer hooks)
  // We bootstrap with empty set, then the formState hook provides initialPTO
  const [selectedPTOProxy, setSelectedPTOProxy] = useState<Set<string>>(new Set());

  // Form state — depends on selectedPTO for localStorage save
  const {
    form,
    setForm,
    initialPTO,
    restoredFromStorage,
    setLeave,
    handleCountryChange,
    clearSavedState,
  } = useFormState(selectedPTOProxy);

  // Calendar base (holidays + weekends)
  const { baseCalendar, calendarLoading, freeWeekends, boostWeekends, longWeekends } =
    useCalendarBase(form, (msg) => toast(msg, 'info'));

  // Derived leave values
  const totalLeave =
    form.leavePool.ptoDays + form.leavePool.compDays + form.leavePool.floatingHolidays;
  const prebookedCount = baseCalendar?.filter((d) => d.isPrebooked).length ?? 0;

  // Interactive calendar
  const {
    selectedPTO,
    setSelectedPTO,
    previewDates,
    activeHoliday,
    setActiveHoliday,
    activeSuggestions,
    expandedLW,
    setExpandedLW,
    handleDayClick,
    handleApplyBridge,
    handlePreviewEnter,
    handlePreviewLeave,
    handleTogglePTO,
    clearInteractiveState,
  } = useInteractiveCalendar(
    baseCalendar,
    Math.max(0, totalLeave - prebookedCount - selectedPTOProxy.size),
    initialPTO
  );

  // Keep proxy in sync so formState saves correctly
  useEffect(() => { setSelectedPTOProxy(selectedPTO); }, [selectedPTO]);

  const remainingPTO = Math.max(0, totalLeave - prebookedCount - selectedPTO.size);

  // Optimizer results + flight deals
  const {
    loading,
    error,
    result,
    resultsAreaRef,
    hoveredWindow,
    setHoveredWindow,
    windowSort,
    setWindowSort,
    flightDeals,
    hotelDeals,
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
  } = useOptimizerResults(form, setSelectedPTO, setActiveHoliday, setPreviewDates, setSidebarOpen, toast);

  // Clear interactive + optimizer state when fundamental settings change
  useEffect(() => {
    clearInteractiveState();
    clearOptimizerState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country, form.usState, form.year]);

  // Show restore toast on mount
  useEffect(() => {
    if (restoredFromStorage.current) {
      toast('Restored your previous settings', 'info');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSidebarInteraction = useCallback(() => {
    if (!hasInteracted) setHasInteracted(true);
  }, [hasInteracted]);

  const handleDismissWelcome = useCallback(() => {
    setShowWelcome(false);
    try { localStorage.setItem('leavewise_visited', '1'); } catch { /* ok */ }
  }, []);

  const handleReset = useCallback(() => {
    setForm(DEFAULT_FORM);
    clearInteractiveState();
    clearOptimizerState();
    clearSavedState();
    toast('Form reset to defaults', 'info');
  }, [setForm, clearInteractiveState, clearOptimizerState, clearSavedState, toast]);

  const handleSharePlan = useCallback(() => {
    const url = encodeShareURL(form);
    navigator.clipboard.writeText(url).then(() => {
      toast('Share link copied to clipboard');
    });
  }, [form, toast]);

  const handleCopyPlan = useCallback(() => {
    if (!result) return;
    const stateName = getStateName(form.usState);
    const summary = generatePlanSummary(result, form, stateName);
    navigator.clipboard.writeText(summary).then(() => {
      toast('Plan summary copied to clipboard');
    });
  }, [result, form, toast]);

  // Derived display values
  const selectedStateName = getStateName(form.usState);
  const remainingBudget = result?.remainingLeave ?? 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  // When optimizer runs, its result only covers the selected year.
  // Append any next-year months from baseCalendar so the rolling 12-month view stays intact.
  const calendarDays = useMemo(() => {
    const optimized = result?.days;
    if (!optimized) return baseCalendar ?? [];
    if (!baseCalendar) return optimized;
    const maxYear = optimized.length > 0 ? optimized[optimized.length - 1].date.getFullYear() : form.year;
    const nextYearDays = baseCalendar.filter((d) => d.date.getFullYear() > maxYear);
    return nextYearDays.length > 0 ? [...optimized, ...nextYearDays] : optimized;
  }, [result?.days, baseCalendar, form.year]);
  const defaultStartMonth = form.year === CURRENT_YEAR ? new Date().getMonth() : 0;
  const hasCompanyHolidays = parseDates(form.companyHolidaysRaw).length > 0;

  function setPreviewDates(s: Set<string>) {
    // handled in useInteractiveCalendar; this is for useOptimizerResults integration
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm" role="navigation" aria-label="Main">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="flex items-center justify-center w-11 h-11 rounded-lg text-ink-muted hover:text-teal hover:bg-cream transition-colors"
              aria-label={sidebarOpen ? l.hideSettings : l.showSettings}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
            <Link
              href={locale === 'ko' ? '/ko' : '/'}
              className="font-display font-semibold text-ink text-lg tracking-tight hover:text-teal transition-colors"
            >
              Leavewise
            </Link>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-sm">
            {result ? (
              <>
                <span className="text-ink-muted"><span className="font-semibold text-ink">{result.totalLeaveUsed}</span> {l.used}</span>
                <span className="text-ink-muted"><span className="font-semibold text-coral">{result.totalDaysOff}</span> {l.daysOff}</span>
                <span className="text-ink-muted"><span className="font-semibold text-sage">{result.windows.length}</span> {l.windows}</span>
                <span className="text-ink-muted"><span className="font-semibold text-teal">{result.remainingLeave}</span> {l.remaining}</span>
              </>
            ) : (
              <span className="text-ink-muted">
                <span className="font-semibold text-teal">{totalLeave}</span> {l.leaveDays} · {form.year}
                {selectedPTO.size > 0 && <span className="ml-3"><span className="font-semibold text-coral">{selectedPTO.size}</span> {l.manuallyAdded}</span>}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleLocale}
              className="print:hidden h-8 px-2 text-[11px] font-semibold text-ink-muted hover:text-teal transition-colors rounded-lg hover:bg-cream border border-border hover:border-teal/40"
              aria-label={locale === 'en' ? 'Switch to Korean' : 'Switch to English'}
            >
              {l.langToggle}
            </button>
            <button
              onClick={toggleTheme}
              className="print:hidden flex items-center justify-center w-8 h-8 text-ink-muted hover:text-teal transition-colors rounded-lg hover:bg-cream"
              aria-label={theme === 'dark' ? l.lightMode : l.darkMode}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleSharePlan}
              className="print:hidden flex items-center gap-1 text-xs text-ink-muted hover:text-teal transition-colors border border-border rounded-lg px-2.5 py-1.5 hover:border-teal/40"
              aria-label={l.sharePlanLink}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.886-3.497l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              <span className="hidden sm:inline">{l.share}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="print:hidden flex items-center gap-1 text-xs text-ink-muted hover:text-teal transition-colors border border-border rounded-lg px-2.5 py-1.5 hover:border-teal/40"
              aria-label={l.printPlan}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              <span className="hidden sm:inline">{l.print}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* STATS BAR */}
      <div className="bg-white border-b border-border/60 print:hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 overflow-x-auto scrollbar-none text-xs min-h-[38px]">
          {calendarLoading ? (
            <span className="text-ink-muted/60 animate-pulse">
              {locale === 'ko' ? '캘린더 불러오는 중…' : 'Loading calendar data…'}
            </span>
          ) : result ? (
            <>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-coral inline-block" />
                <span className="font-semibold text-coral">{result.totalDaysOff}</span>
                <span className="text-ink-muted">{l.daysOff}</span>
              </div>
              <div className="w-px h-3 bg-border shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-teal inline-block" />
                <span className="font-semibold text-teal">{result.totalLeaveUsed}</span>
                <span className="text-ink-muted">{l.used}</span>
              </div>
              <div className="w-px h-3 bg-border shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
                <span className="font-semibold text-sage">
                  {(result.totalDaysOff / Math.max(1, result.totalLeaveUsed)).toFixed(1)}×
                </span>
                <span className="text-ink-muted">{locale === 'ko' ? '효율' : 'efficiency'}</span>
              </div>
              <div className="w-px h-3 bg-border shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-semibold text-ink">{result.windows.length}</span>
                <span className="text-ink-muted">{l.windows}</span>
              </div>
              {result.remainingLeave > 0 && (
                <>
                  <div className="w-px h-3 bg-border shrink-0" />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-semibold text-ink-muted">{result.remainingLeave}</span>
                    <span className="text-ink-muted">{l.remaining}</span>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-semibold text-teal">{totalLeave}</span>
                <span className="text-ink-muted">{l.leaveDays}</span>
              </div>
              {longWeekends.length > 0 && (
                <>
                  <div className="w-px h-3 bg-border shrink-0" />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-semibold text-sage">{longWeekends.length}</span>
                    <span className="text-ink-muted">
                      {locale === 'ko' ? '연휴' : 'long weekends'}
                    </span>
                  </div>
                </>
              )}
              {freeWeekends.length > 0 && (
                <>
                  <div className="w-px h-3 bg-border shrink-0" />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-semibold text-ink">{freeWeekends.length}</span>
                    <span className="text-ink-muted">
                      {locale === 'ko' ? '공휴일 없는 주말' : 'free weekends'}
                    </span>
                  </div>
                </>
              )}
              {selectedPTO.size > 0 && (
                <>
                  <div className="w-px h-3 bg-border shrink-0" />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-semibold text-coral">{selectedPTO.size}</span>
                    <span className="text-ink-muted">{l.manuallyAdded}</span>
                  </div>
                </>
              )}
              <div className="flex-1 min-w-2" />
              <span className="text-ink-muted/50 italic shrink-0 hidden sm:block text-[11px]">
                {locale === 'ko' ? '⌘↵ 최적화' : '⌘↵ to optimize'}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── SIDEBAR FORM ── */}
          <aside
            className={`shrink-0 transition-all duration-500 ease-in-out ${
              sidebarOpen
                ? 'lg:w-80 xl:w-88 max-h-[2000px] opacity-100 pointer-events-auto'
                : 'lg:w-0 max-h-0 lg:max-h-[2000px] overflow-hidden opacity-0 lg:opacity-0 pointer-events-none'
            }`}
            role="complementary"
            aria-label="Optimization settings"
          >
            <div
              className="bg-white rounded-2xl border border-border p-5 sm:p-6 space-y-5"
              onPointerDown={handleSidebarInteraction}
            >
              {showWelcome && (
                <div className="bg-teal-light border border-teal/20 rounded-xl p-4 flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-teal mb-1">{l.welcomeTitle}</p>
                    <p className="text-[11px] text-teal/80 leading-relaxed">{l.welcomeBody}</p>
                  </div>
                  <button
                    onClick={handleDismissWelcome}
                    className="text-teal/50 hover:text-teal transition-colors shrink-0 mt-0.5"
                    aria-label={l.dismissWelcome}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-display font-semibold text-ink">{l.planHeading}</h1>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">{l.planSubheading}</p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[10px] font-semibold text-ink-muted hover:text-coral transition-colors px-2 py-1 rounded-lg hover:bg-coral-light shrink-0 mt-0.5"
                  aria-label={l.resetAll}
                >
                  {l.reset}
                </button>
              </div>

              {/* PTO Budget Slider */}
              {totalLeave > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-ink-muted/70">{l.budget}</span>
                    <span className="text-xs font-semibold text-ink">
                      {selectedPTO.size + prebookedCount} / {totalLeave} {l.used}
                    </span>
                  </div>

                  {/* Layered slider: visual track + native range input */}
                  <div className="relative h-3 group">
                    {/* Background track */}
                    <div className="absolute inset-0 rounded-full bg-border/40 overflow-hidden flex">
                      {prebookedCount > 0 && (
                        <div
                          className="bg-ink-muted/40 h-full shrink-0 transition-all duration-200"
                          style={{ width: `${(prebookedCount / 40) * 100}%` }}
                        />
                      )}
                      {selectedPTO.size > 0 && (
                        <div
                          className="bg-coral h-full shrink-0 transition-all duration-200"
                          style={{ width: `${(selectedPTO.size / 40) * 100}%` }}
                        />
                      )}
                      <div
                        className="bg-teal/30 h-full shrink-0 transition-all duration-200"
                        style={{ width: `${(Math.max(0, form.leavePool.ptoDays - selectedPTO.size - prebookedCount) / 40) * 100}%` }}
                      />
                    </div>
                    {/* Native range input (transparent track, styled thumb) */}
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={form.leavePool.ptoDays}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setLeave('ptoDays', v);
                        setForm((f) => ({ ...f, daysToAllocate: v }));
                      }}
                      className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal [&::-webkit-slider-thumb]:border-2
                        [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab
                        [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] font-semibold text-ink-muted">0</span>
                    <span className="text-xs font-bold text-teal">{form.leavePool.ptoDays} {locale === 'ko' ? '일' : 'days'}</span>
                    <span className="text-[10px] font-semibold text-ink-muted">40</span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5">
                    {prebookedCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-ink-muted">
                        <span className="w-2 h-2 rounded-sm bg-ink-muted/40" />
                        {prebookedCount} {l.preBooked}
                      </span>
                    )}
                    {selectedPTO.size > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-ink-muted">
                        <span className="w-2 h-2 rounded-sm bg-coral" />
                        {selectedPTO.size} {l.selected}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-ink-muted">
                      <span className="w-2 h-2 rounded-sm bg-teal/30" />
                      {remainingPTO} {l.remainingBadge}
                    </span>
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <SectionLabel>{l.location}</SectionLabel>
                <div className="flex gap-2 mb-3">
                  {([
                    { code: 'US' as CountryCode, label: l.countryUS },
                    { code: 'KR' as CountryCode, label: l.countryKR },
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
                  <label htmlFor="home-airport" className="block text-xs font-semibold text-ink-soft mb-1.5">
                    {l.homeAirport}
                  </label>
                  <input
                    id="home-airport"
                    type="text"
                    value={form.homeAirport}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
                      setForm((f) => ({ ...f, homeAirport: val, airportManuallySet: true }));
                    }}
                    placeholder={l.airportPlaceholder}
                    maxLength={3}
                    className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink font-mono uppercase placeholder:text-ink-muted/50 placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                  />
                  {form.country === 'KR' && (
                    <p className="text-[10px] text-ink-muted mt-1">{l.airportHint}</p>
                  )}
                </div>

                {form.country === 'US' && (
                  <div>
                    <label htmlFor="us-state" className="block text-xs font-semibold text-ink-soft mb-1.5">
                      {l.state}
                    </label>
                    <select
                      id="us-state"
                      value={form.usState}
                      onChange={(e) => setForm((f) => ({ ...f, usState: e.target.value }))}
                      className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                    >
                      {US_STATES.map((s) => (
                        <option key={s.code} value={s.code}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Optimize For */}
              <div>
                <SectionLabel>{l.optimizeFor}</SectionLabel>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { weight: 0 as const, label: l.ptoEfficiency, sublabel: l.maxDaysOff },
                    { weight: 0.4 as const, label: l.balanced, sublabel: l.both },
                    { weight: 0.8 as const, label: l.travelValue, sublabel: l.cheapTravel },
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

              {/* Optimize Button */}
              <button
                onClick={() => { handleOptimize(); handleSidebarInteraction(); }}
                disabled={loading || totalLeave === 0}
                className={`w-full bg-teal text-white font-semibold py-3 rounded-xl hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 ${
                  !hasInteracted && !result && totalLeave > 0 ? 'animate-pulse' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {l.findingWindows}
                  </>
                ) : (
                  <>
                    {l.optimizeMyLeave}
                    <span className="ml-1 text-white/50 text-xs font-normal hidden sm:inline">⌘↵</span>
                  </>
                )}
              </button>

              {error && (
                <div className="bg-coral-light border border-coral/20 rounded-lg px-4 py-3 text-sm text-coral flex items-start gap-2" role="alert">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* PTO Budget */}
              <div>
                <SectionLabel>{locale === 'ko' ? 'PTO 예산' : 'PTO budget'}</SectionLabel>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink-soft">{locale === 'ko' ? '사용' : 'Use'}</span>
                        <div className="flex items-center bg-cream border border-border rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setForm((f) => {
                              const newVal = Math.max(0, f.leavePool.ptoDays - 1);
                              return { ...f, leavePool: { ...f.leavePool, ptoDays: newVal }, daysToAllocate: newVal };
                            })}
                            className="px-2 py-1.5 text-ink-muted hover:text-teal hover:bg-teal-light transition-colors text-sm font-semibold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={40}
                            value={form.leavePool.ptoDays}
                            onChange={(e) => {
                              const v = Math.max(0, Math.min(40, parseInt(e.target.value, 10) || 0));
                              setLeave('ptoDays', v);
                              setForm((f) => ({ ...f, daysToAllocate: v }));
                            }}
                            className="w-12 text-center text-sm font-display font-semibold text-teal bg-transparent border-x border-border py-1.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => setForm((f) => {
                              const newVal = Math.min(40, f.leavePool.ptoDays + 1);
                              return { ...f, leavePool: { ...f.leavePool, ptoDays: newVal }, daysToAllocate: newVal };
                            })}
                            className="px-2 py-1.5 text-ink-muted hover:text-teal hover:bg-teal-light transition-colors text-sm font-semibold"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-ink-muted">{locale === 'ko' ? '일' : 'days'}</span>
                      </div>
                      <p className="text-[10px] text-ink-muted mt-1.5">
                        {locale === 'ko'
                          ? `${form.country === 'KR' ? '한국' : '미국'} 평균: ${form.country === 'KR' ? '15' : '15'}일`
                          : `${form.country === 'US' ? 'US' : 'KR'} avg: ${form.country === 'KR' ? '15' : '15'} days`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLeave('ptoDays', 40);
                        setForm((f) => ({ ...f, daysToAllocate: 40 }));
                      }}
                      className={`shrink-0 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                        form.leavePool.ptoDays >= 40
                          ? 'bg-teal/10 text-teal border-teal/20'
                          : 'bg-cream text-ink-muted border-border hover:border-teal/40 hover:text-teal'
                      }`}
                    >
                      {locale === 'ko' ? '전부 사용' : 'Use all'}
                    </button>
                  </div>

                  <CollapsibleSection
                    title={locale === 'ko' ? '추가 휴가' : 'Additional leave'}
                    defaultOpen={form.leavePool.compDays > 0 || form.leavePool.floatingHolidays > 0}
                    badge={form.leavePool.compDays + form.leavePool.floatingHolidays > 0
                      ? `+${form.leavePool.compDays + form.leavePool.floatingHolidays}`
                      : undefined}
                  >
                    <div className="space-y-3">
                      <NumberStepper
                        label={l.compDays}
                        sublabel={l.compDaysSub}
                        value={form.leavePool.compDays}
                        onChange={(v) => setLeave('compDays', v)}
                      />
                      <NumberStepper
                        label={l.floatingHolidays}
                        sublabel={l.floatingHolidaysSub}
                        value={form.leavePool.floatingHolidays}
                        onChange={(v) => setLeave('floatingHolidays', v)}
                      />
                    </div>
                  </CollapsibleSection>

                  {totalLeave > 0 && (
                    <div className="flex items-center justify-between bg-teal-light rounded-lg px-3 py-2 border border-teal/10">
                      <span className="text-xs font-semibold text-teal">{l.totalAvailable}</span>
                      <span className="text-base font-display font-semibold text-teal">
                        {totalLeave} {l.days}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Setup */}
              <CollapsibleSection
                title={l.companySetup}
                defaultOpen={!!(form.companyName || form.companyHolidaysRaw)}
                badge={form.companyName || parseDates(form.companyHolidaysRaw).length > 0 ? l.set : undefined}
              >
                <div className="space-y-3">
                  <div>
                    <label htmlFor="company-name" className="block text-xs font-semibold text-ink-soft mb-1.5">
                      {l.companyName} <span className="text-ink-muted font-normal">{l.optional}</span>
                    </label>
                    <input
                      id="company-name"
                      type="text"
                      value={form.companyName}
                      onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                      placeholder={l.companyPlaceholder}
                      className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="company-holidays" className="block text-xs font-semibold text-ink-soft mb-1">
                      {l.companyHolidays}
                    </label>
                    <p className="text-[10px] text-ink-muted mb-1.5 leading-snug">{l.companyHolidaysDesc}</p>
                    <textarea
                      id="company-holidays"
                      value={form.companyHolidaysRaw}
                      onChange={(e) => setForm((f) => ({ ...f, companyHolidaysRaw: e.target.value }))}
                      placeholder={`${form.year}-12-24 Christmas Eve\n${form.year}-12-26 Boxing Day`}
                      rows={3}
                      className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-xs text-ink font-mono placeholder:text-ink-muted/40 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
                    />
                    <p className="text-[10px] text-ink-muted mt-1">{l.onePerLine}</p>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Already Planned */}
              <CollapsibleSection
                title={l.alreadyPlanned}
                defaultOpen={!!form.prebookedRaw}
                badge={parseDates(form.prebookedRaw).length > 0 ? `${parseDates(form.prebookedRaw).length}d` : undefined}
              >
                <div>
                  <p className="text-[10px] text-ink-muted mb-2 leading-snug">{l.alreadyPlannedDesc}</p>
                  <textarea
                    aria-label={l.alreadyPlanned}
                    value={form.prebookedRaw}
                    onChange={(e) => setForm((f) => ({ ...f, prebookedRaw: e.target.value }))}
                    placeholder={`${form.year}-06-14\n${form.year}-06-15`}
                    rows={3}
                    className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-xs text-ink font-mono placeholder:text-ink-muted/40 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
                  />
                  <p className="text-[10px] text-ink-muted mt-1">{l.onePerLine}</p>
                </div>
              </CollapsibleSection>

              {/* Advanced */}
              <CollapsibleSection
                title={l.advanced}
                defaultOpen={form.maxDaysPerWindow !== 14}
                badge={form.maxDaysPerWindow !== 14 ? `${form.maxDaysPerWindow}${l.dMax}` : undefined}
              >
                <NumberStepper
                  label={l.maxTripLength}
                  sublabel={l.maxTripLengthSub}
                  value={form.maxDaysPerWindow}
                  min={3}
                  max={28}
                  onChange={(v) => setForm((f) => ({ ...f, maxDaysPerWindow: v }))}
                />
              </CollapsibleSection>
            </div>
          </aside>

          {/* Mobile sticky CTA */}
          {!sidebarOpen && !result && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-sm border-t border-border px-4 py-3 safe-area-pb">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-xs font-semibold text-ink-muted border border-border rounded-xl px-3 py-2.5 hover:border-teal/40 transition-colors"
                >
                  {l.settings}
                </button>
                <button
                  onClick={() => handleOptimize()}
                  disabled={loading || totalLeave === 0}
                  className="flex-1 bg-teal text-white font-semibold py-2.5 rounded-xl hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  {loading ? l.findingWindows : l.optimizeMyLeave}
                </button>
              </div>
            </div>
          )}

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0" role="main" aria-label="Calendar and results">
          <div className="flex flex-col gap-8">

            {/* Results section */}
            <div ref={resultsAreaRef} className="w-full order-3 space-y-8">

            {result && (
              <div className="space-y-5">
                <div className="flex items-center gap-5 flex-wrap bg-white rounded-xl border border-border px-5 py-3">
                  {[
                    { value: result.totalDaysOff, label: l.daysOffLabel, color: 'text-coral' },
                    { value: result.totalLeaveUsed, label: l.leaveUsed, color: 'text-teal' },
                    { value: result.windows.length, label: l.windowsLabel, color: 'text-sage' },
                    { value: result.remainingLeave, label: l.remainingLabel, color: 'text-ink-muted' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <span className={`text-xl font-display font-semibold ${s.color}`}>{s.value}</span>
                      <span className="text-[11px] text-ink-muted">{s.label}</span>
                    </div>
                  ))}
                  <div className="flex-1" />
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <span className="text-sm">{form.country === 'US' ? '🇺🇸' : '🇰🇷'}</span>
                    <span>{form.country === 'US' ? `${l.countryUSContext}${selectedStateName}` : l.southKorea} · {form.year}</span>
                    {form.companyName && <span className="text-amber font-medium">{form.companyName}</span>}
                  </div>
                </div>

                {/* Vacation windows */}
                {result.windows.length > 0 ? (
                  <CollapsibleSection
                    title={l.optimizedWindows}
                    defaultOpen={false}
                    badge={`${result.windows.length} trips · ${result.totalDaysOff} ${l.daysOff}`}
                  >
                    <div className="flex items-center justify-end mb-4 gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {(['date', 'efficiency', 'length'] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setWindowSort(s)}
                              aria-label={`${l.sortBy} ${s}`}
                              className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-colors ${
                                windowSort === s
                                  ? 'bg-teal text-white border-teal'
                                  : 'bg-cream text-ink-muted border-border hover:border-teal/40'
                              }`}
                            >
                              {s === 'date' ? l.date : s === 'efficiency' ? l.efficiency : l.length}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyPlan}
                          className="text-[10px] font-semibold text-ink-muted hover:text-teal transition-colors flex items-center gap-1 px-2 py-1 rounded-lg border border-border hover:border-teal/40"
                          aria-label={l.copyPlanClipboard}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {l.copyPlan}
                        </button>
                        <button
                          type="button"
                          onClick={handleExportAll}
                          className="text-[10px] font-semibold text-teal hover:text-teal-hover transition-colors flex items-center gap-1 px-2 py-1 rounded-lg border border-teal/20 hover:border-teal/40 bg-teal-light"
                          aria-label={l.exportAllCalendar}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          {l.exportAll}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowShareCard(true)}
                          className="text-[10px] font-semibold text-teal hover:text-teal-hover transition-colors flex items-center gap-1 px-2 py-1 rounded-lg border border-teal/20 hover:border-teal/40 bg-teal-light"
                          aria-label="Share plan as image"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                          </svg>
                          Share plan
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sortedWindows.map((w) => (
                        <WindowCard
                          key={w.id}
                          window={w}
                          isHighlighted={hoveredWindow === w.id}
                          onHover={setHoveredWindow}
                          flightDeal={flightDeals[w.id]}
                          hotelDeal={hotelDeals[w.id]}
                          origin={form.homeAirport}
                          currency={COUNTRY_CURRENCY[form.country] ?? 'USD'}
                          tpMarker={process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? ''}
                          onAdjustPTO={handleAdjustAllocation}
                          remainingBudget={remainingBudget}
                          isBestWindow={w.id === bestWindowId}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-ink-muted mt-3 text-right">{l.pricesFrom}</p>
                  </CollapsibleSection>
                ) : (
                  <div className="bg-white rounded-2xl border border-border p-8 text-center">
                    <div className="text-3xl mb-3 opacity-40">
                      <svg className="w-10 h-10 mx-auto text-ink-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-ink mb-1">{l.noWindowsFound}</p>
                    <p className="text-ink-muted text-xs leading-relaxed max-w-xs mx-auto">{l.noWindowsFoundDesc}</p>
                  </div>
                )}

                {/* US Pay Insights */}
                {form.country === 'US' && result.windows.length > 0 && (() => {
                  const allBookendRisks = result.windows.flatMap((w) =>
                    (w.bookendRisks ?? []).map((r) => ({ ...r, windowLabel: w.label }))
                  );
                  const allPremiumDays = result.windows.flatMap((w) =>
                    (w.premiumPayDays ?? []).map((d) => ({ holiday: d, windowLabel: w.label }))
                  );
                  if (allBookendRisks.length === 0 && allPremiumDays.length === 0) return null;
                  return (
                    <div className="bg-white rounded-2xl border border-border p-6">
                      <h2 className="text-lg font-display font-semibold text-ink mb-1">{l.usPayInsights}</h2>
                      <p className="text-xs text-ink-muted mb-4 leading-relaxed">{l.usPayInsightsDesc}</p>
                      <div className="space-y-4">
                        {allBookendRisks.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{l.holidayPayRisk}</span>
                            </div>
                            <p className="text-xs text-ink-muted mb-2 leading-relaxed">
                              Many US employers require you to work the day <strong>before and after</strong> a paid holiday to receive holiday pay.
                            </p>
                            <ul className="space-y-1.5">
                              {allBookendRisks.map((r, i) => (
                                <li key={i} className="text-xs text-ink flex items-start gap-2">
                                  <span className="mt-0.5 text-amber-500 shrink-0">•</span>
                                  <span>
                                    <span className="font-semibold">{r.holidayName}</span>
                                    {' — '}
                                    {r.riskBefore && r.riskAfter ? 'PTO falls both the day before and after' : r.riskBefore ? 'PTO falls the workday before' : 'PTO falls the workday after'}
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
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-light text-teal border border-teal/20 px-2 py-0.5 rounded-full">{l.premiumPayOpportunity}</span>
                            </div>
                            <p className="text-xs text-ink-muted mb-2 leading-relaxed">
                              These holidays fall on weekdays inside your windows. If your employer offers <strong>holiday premium pay (1.5×–2×)</strong>, working the day could earn more.
                            </p>
                            <ul className="space-y-1.5">
                              {allPremiumDays.map((d, i) => (
                                <li key={i} className="text-xs text-ink flex items-start gap-2">
                                  <span className="mt-0.5 text-teal shrink-0">•</span>
                                  <span><span className="font-semibold">{d.holiday}</span>{' — working this day may qualify for double or premium pay instead of using PTO.'}</span>
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
              <CollapsibleSection
                title={l.upcomingLongWeekends}
                defaultOpen={true}
                badge={`${longWeekends.length} weekends`}
              >
              <div className="space-y-6">
                <p className="text-xs text-ink-muted">
                  {form.country === 'US' ? selectedStateName : l.southKorea} · {form.year} · based on public holidays
                </p>

                {!lwGuideDismissed && (
                  <div className="relative bg-teal/5 border border-teal/15 rounded-2xl p-4 space-y-3">
                    <button
                      onClick={() => {
                        setLwGuideDismissed(true);
                        try { localStorage.setItem('leavewise_lw_guide_dismissed', '1'); } catch {}
                      }}
                      className="absolute top-3 right-3 text-ink-muted/50 hover:text-ink-muted transition-colors"
                      aria-label="Dismiss guide"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                    <p className="text-xs font-semibold text-teal">How to use</p>
                    <ol className="space-y-2 text-xs text-ink-soft pr-4">
                      <li className="flex gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal/10 text-teal text-[10px] font-bold flex items-center justify-center">1</span>
                        <span><span className="font-medium text-ink">Tap a card</span> below to open a window and see all its days</span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal/10 text-teal text-[10px] font-bold flex items-center justify-center">2</span>
                        <span><span className="font-medium text-ink">Click the days</span> you want off — they'll be marked as PTO</span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal/10 text-teal text-[10px] font-bold flex items-center justify-center">3</span>
                        <span>Or hit <span className="font-medium text-teal">Optimize my leave</span> and let us pick the best days for you</span>
                      </li>
                    </ol>
                  </div>
                )}

                {freeWeekends.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-sage">{l.alreadyFree}</span>
                      <span className="text-[10px] text-ink-muted">{l.noPTONeeded}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {freeWeekends.map((lw) => (
                        <LongWeekendCard key={lw.id} lw={lw} onClick={() => setExpandedLW(lw)} l={l} />
                      ))}
                    </div>
                  </div>
                )}

                {boostWeekends.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-ink-soft">{l.addAFewDays}</span>
                      <span className="text-[10px] text-ink-muted">{l.use1to3PTO}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {boostWeekends.map((lw) => (
                        <LongWeekendCard key={lw.id} lw={lw} onClick={() => setExpandedLW(lw)} l={l} />
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-ink-muted">{l.hitOptimize}</p>
              </div>
              </CollapsibleSection>
            )}

            </div>

            {/* Strategy comparison — above calendar when results exist */}
            {result && strategies.balanced && (
              <div className="w-full order-1">
                <div className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-ink">Compare strategies</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { key: 'short' as Strategy, label: 'Short breaks', desc: 'Many mini-trips', icon: String.fromCodePoint(0x26A1) },
                      { key: 'balanced' as Strategy, label: 'Balanced', desc: 'Mix of short & long', icon: String.fromCodePoint(0x2696, 0xFE0F) },
                      { key: 'long' as Strategy, label: 'Long trips', desc: 'Fewer, bigger vacations', icon: String.fromCodePoint(0x1F334) },
                    ]).map(({ key, label, desc, icon }) => {
                      const s = strategies[key];
                      const isActive = activeStrategy === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveStrategy(key)}
                          className={`text-left p-3 rounded-xl border transition-all ${isActive ? 'border-teal bg-teal/5 shadow-sm' : 'border-border hover:border-teal/30'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm">{icon}</span>
                            <span className={`text-xs font-semibold ${isActive ? 'text-teal' : 'text-ink'}`}>{label}</span>
                          </div>
                          <p className="text-[10px] text-ink-muted mb-2">{desc}</p>
                          {s && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-ink-muted">Windows</span>
                                <span className="font-semibold text-ink">{s.windows.length}</span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-ink-muted">Days off</span>
                                <span className="font-semibold text-ink">{s.totalDaysOff}</span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-ink-muted">Avg efficiency</span>
                                <span className="font-semibold text-sage">
                                  {(s.windows.reduce((a, w) => a + w.efficiency, 0) / Math.max(s.windows.length, 1)).toFixed(1)}x
                                </span>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Calendar — front and center */}
            <div className="w-full order-2 space-y-3">
            {calendarLoading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-40 bg-border/50 rounded-lg animate-skeleton" />
                  <div className="h-5 w-16 bg-border/50 rounded-lg animate-skeleton" />
                </div>
                <div className="h-4 w-full bg-border/40 rounded-lg animate-skeleton" />
                <div className="bg-white rounded-2xl border border-border p-6">
                  <div className="grid grid-cols-3 gap-5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 w-16 bg-border/50 rounded animate-skeleton" />
                        <div className="grid grid-cols-7 gap-px">
                          {Array(35).fill(0).map((_, j) => (
                            <div key={j} className="aspect-square rounded bg-border/30 animate-skeleton" style={{ animationDelay: `${j * 30}ms` }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : calendarDays.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2 gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-display font-semibold text-ink truncate">
                      {form.year} {l.calendar}
                      {form.country === 'US' && ` · ${selectedStateName}`}
                      {form.companyName && <span className="text-amber"> · {form.companyName}</span>}
                    </h2>
                    {!result && (
                      <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">{l.clickHolidayInstruction}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-display font-semibold text-teal leading-tight">{remainingPTO}</div>
                    <div className="text-[10px] text-ink-muted leading-tight">
                      {l.daysUnallocated}<br />{l.unallocated}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 lg:p-8">
                  <InteractiveCalendar
                    days={calendarDays}
                    selectedPTO={selectedPTO}
                    previewDates={previewDates}
                    activeHolidayDateStr={activeHoliday?.dateStr ?? null}
                    onDayClick={handleDayClick}
                    showCompanyHolidays={hasCompanyHolidays}
                    hoveredWindow={hoveredWindow}
                    onHoverWindow={setHoveredWindow}
                    windowLabels={windowLabels}
                    today={todayStr}
                    defaultStartMonth={defaultStartMonth}
                    origin={form.homeAirport}
                  />
                  {form.country === 'KR' && (
                    <p className="text-[9px] text-ink-muted/50 mt-3 text-left">
                      {locale === 'ko'
                        ? `대체공휴일 확인 일자: ${KR_SUBSTITUTE_VERIFIED}`
                        : `Substitute holidays (대체공휴일) last verified: ${KR_SUBSTITUTE_VERIFIED}`}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🗓</div>
                <h2 className="text-2xl font-display font-semibold text-ink mb-2">{l.readyWhenYouAre}</h2>
                <p className="text-ink-muted text-sm max-w-sm leading-relaxed">{l.fillInLocation}</p>
              </div>
            )}
            </div>

          </div>
          </main>
        </div>
      </div>

      {/* Share card modal */}
      {showShareCard && result && (
        <ShareCard
          year={form.year}
          totalLeave={result.totalLeaveUsed}
          totalDaysOff={result.totalDaysOff}
          windows={result.windows.map((w) => ({
            label: w.label,
            totalDays: w.totalDays,
            ptoDaysUsed: w.ptoDaysUsed,
            startStr: w.startStr,
            endStr: w.endStr,
          }))}
          onClose={() => setShowShareCard(false)}
        />
      )}

      {/* Expanded long weekend modal */}
      {expandedLW && baseCalendar && (
        <ExpandedLongWeekendModal
          lw={expandedLW}
          days={baseCalendar}
          selectedPTO={selectedPTO}
          onTogglePTO={handleTogglePTO}
          onClose={() => setExpandedLW(null)}
          l={l}
        />
      )}

      {/* Holiday bridge suggestions panel */}
      {activeHoliday && baseCalendar && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/20 animate-fade-in"
            onClick={() => { setActiveHoliday(null); }}
            aria-hidden="true"
          />
          <div
            className="fixed right-0 top-[57px] bottom-0 w-full max-w-80 z-40 shadow-2xl animate-slide-in-right"
            role="dialog"
            aria-label={`Bridge suggestions for ${activeHoliday.holidayName ?? 'holiday'}`}
          >
            <HolidayPanel
              holiday={activeHoliday}
              suggestions={activeSuggestions}
              appliedDates={selectedPTO}
              remainingPTO={remainingPTO}
              onApply={handleApplyBridge}
              onPreviewEnter={handlePreviewEnter}
              onPreviewLeave={handlePreviewLeave}
              onClose={() => { setActiveHoliday(null); }}
            />
          </div>
        </>
      )}
    </div>
  );
}
