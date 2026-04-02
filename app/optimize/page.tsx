'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { WindowCard } from '@/components/WindowCard';
import { InteractiveCalendar } from '@/components/InteractiveCalendar';
import { EfficiencyBadge } from '@/components/EfficiencyBadge';
import { useToast } from '@/components/Toast';
import { SectionLabel } from '@/components/optimize/SectionLabel';
import { NumberStepper } from '@/components/optimize/NumberStepper';
import { CollapsibleSection } from '@/components/optimize/CollapsibleSection';
import { LongWeekendCard } from '@/components/optimize/LongWeekendCard';
import { OnboardingTour } from '@/components/OnboardingTour';

const ShareCard = dynamic(() => import('@/components/ShareCard').then((mod) => mod.ShareCard), { ssr: false });
const PTOScoreCard = dynamic(() => import('@/components/PTOScoreCard').then((mod) => mod.PTOScoreCard), { ssr: false });
const ExpandedLongWeekendModal = dynamic(() => import('@/components/optimize/ExpandedLongWeekendModal').then((mod) => mod.ExpandedLongWeekendModal), { ssr: false });
const HolidayPanel = dynamic(() => import('@/components/HolidayPanel').then((mod) => mod.HolidayPanel), { ssr: false });
import { MobileSettingsDrawer } from '@/components/MobileSettingsDrawer';
import { UndoRedoControls } from '@/components/UndoRedoControls';
import { YearMiniMap } from '@/components/YearMiniMap';
import { WhatIfPanel } from '@/components/WhatIfPanel';
import { AnimatedStat } from '@/components/AnimatedStat';
import { CelebrationBurst } from '@/components/CelebrationBurst';
import { SkeletonWindowCard } from '@/components/SkeletonWindowCard';
import { LoadingProgress } from '@/components/LoadingProgress';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { useKeyboardShortcuts, type ShortcutConfig } from '@/hooks/useKeyboardShortcuts';
import { useThemeLocale } from '@/hooks/useThemeLocale';
import { useFormState, DEFAULT_FORM, encodeShareURL } from '@/hooks/useFormState';
import { useCalendarBase } from '@/hooks/useCalendarBase';
import { useInteractiveCalendar } from '@/hooks/useInteractiveCalendar';
import { useOptimizerResults } from '@/hooks/useOptimizerResults';
import { parseDates, KR_SUBSTITUTE_HOLIDAYS_VERIFIED as KR_SUBSTITUTE_VERIFIED } from '@/lib/api';
import { US_STATES, COUNTRY_CURRENCY } from '@/lib/countries';
import { generatePlanSummary, getStateName } from '@/lib/planUtils';
import { trackStrategySwitch, trackPlanSave, trackPlanLoad, trackPlanDelete } from '@/lib/analytics';
import { useSavedPlans } from '@/hooks/useSavedPlans';
import { SavePlanButton } from '@/components/saved-plans/SavePlanButton';
import { SavedPlansDrawer } from '@/components/saved-plans/SavedPlansDrawer';
import { CalendarExportMenu } from '@/components/CalendarExportMenu';
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
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [calendarStartMonth, setCalendarStartMonth] = useState<number | undefined>(undefined);
  const [celebrationTrigger, setCelebrationTrigger] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Ref to hold the latest selectedPTO for the formState save effect
  // (avoids the extra render cycle of a proxy useState)
  const selectedPTORef = useRef<Set<string>>(new Set());

  // Form state — depends on selectedPTORef for localStorage save
  const {
    form,
    setForm,
    initialPTO,
    restoredFromStorage,
    setLeave,
    handleCountryChange,
    clearSavedState,
    scheduleSave,
  } = useFormState(selectedPTORef);

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
    handleDragSelect,
    handleApplyBridge,
    handlePreviewEnter,
    handlePreviewLeave,
    handleTogglePTO,
    clearInteractiveState,
    undo,
    redo,
    canUndo,
    canRedo,
    historySize,
  } = useInteractiveCalendar(
    baseCalendar,
    Math.max(0, totalLeave - prebookedCount - selectedPTORef.current.size),
    initialPTO
  );

  // Keep ref in sync so formState saves correctly; trigger debounced save without extra render
  useEffect(() => {
    selectedPTORef.current = selectedPTO;
    scheduleSave();
  }, [selectedPTO, scheduleSave]);

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
    dealProgress,
    handleOptimize,
    handleAdjustAllocation,
    handleExportAll,
    clearOptimizerState,
    loadSavedResult,
  } = useOptimizerResults(form, setSelectedPTO, setActiveHoliday, setPreviewDates, setSidebarOpen, toast);

  // Saved plans
  const { plans: savedPlans, canSave, savePlan, loadPlan, deletePlan, renamePlan } = useSavedPlans();

  // Clear interactive + optimizer state when fundamental settings change
  useEffect(() => {
    clearInteractiveState();
    clearOptimizerState();
  }, [form.country, form.usState, form.year, clearInteractiveState, clearOptimizerState]);

  // Show restore toast on mount
  useEffect(() => {
    if (restoredFromStorage.current) {
      toast('Restored your previous settings', 'info');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire celebration burst when a new result arrives
  useEffect(() => {
    if (result && result.totalLeaveUsed > 0) {
      setCelebrationTrigger(true);
      const timer = setTimeout(() => setCelebrationTrigger(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [result]);

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

  // Escape key to close modals (topmost first)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showShortcuts) { setShowShortcuts(false); return; }
        if (drawerOpen) { setDrawerOpen(false); return; }
        if (showShareCard) { setShowShareCard(false); return; }
        if (showScoreCard) { setShowScoreCard(false); return; }
        if (expandedLW) { setExpandedLW(null); return; }
        if (activeHoliday) { setActiveHoliday(null); return; }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showShortcuts, drawerOpen, showShareCard, showScoreCard, expandedLW, activeHoliday, setShowShareCard, setExpandedLW, setActiveHoliday]);

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

  const handleSavePlan = useCallback((name: string) => {
    if (!result) return;
    const ptoArray = Array.from(selectedPTO);
    const success = savePlan(name, form, ptoArray, result, strategies, activeStrategy);
    if (success) {
      toast(l.planSaved);
      trackPlanSave(activeStrategy);
    } else {
      toast(l.planLimitReached, 'info');
    }
  }, [result, selectedPTO, form, strategies, activeStrategy, savePlan, toast, l]);

  const handleLoadSavedPlan = useCallback((id: string) => {
    const plan = loadPlan(id);
    if (!plan) return;
    setForm(plan.form);
    loadSavedResult(plan.result, plan.strategy, plan.strategies);
    setDrawerOpen(false);
    toast(l.planLoaded);
    trackPlanLoad(plan.strategy);
  }, [loadPlan, setForm, loadSavedResult, toast, l]);

  const handleDeletePlan = useCallback((id: string) => {
    deletePlan(id);
    toast(l.planDeleted, 'info');
    trackPlanDelete();
  }, [deletePlan, toast, l]);

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
  const defaultStartMonth = calendarStartMonth ?? (form.year === CURRENT_YEAR ? new Date().getMonth() : 0);

  // When hovering a window card, also scroll the calendar to that window's start month
  const handleWindowHover = useCallback((windowId: number | null) => {
    setHoveredWindow(windowId);
    if (windowId != null && result) {
      const win = result.windows.find((w) => w.id === windowId);
      if (win) {
        setCalendarStartMonth(win.startDate.getMonth());
      }
    }
  }, [result, setHoveredWindow]);
  // Keyboard shortcuts (centralized handler)
  const shortcuts = useMemo<ShortcutConfig[]>(
    () => [
      {
        key: '?',
        handler: () => setShowShortcuts((o) => !o),
        description: 'Show keyboard shortcuts',
        group: 'actions' as const,
      },
      {
        key: 's',
        handler: () => setSidebarOpen((o) => !o),
        description: 'Toggle sidebar',
        group: 'navigation' as const,
      },
      {
        key: '1',
        handler: () => { if (strategies.short) setActiveStrategy('short'); },
        description: 'Short breaks strategy',
        group: 'navigation' as const,
      },
      {
        key: '2',
        handler: () => { if (strategies.balanced) setActiveStrategy('balanced'); },
        description: 'Balanced strategy',
        group: 'navigation' as const,
      },
      {
        key: '3',
        handler: () => { if (strategies.long) setActiveStrategy('long'); },
        description: 'Long trips strategy',
        group: 'navigation' as const,
      },
      {
        key: 'e',
        handler: () => { if (result) handleExportAll(); },
        description: 'Export all to calendar',
        group: 'actions' as const,
      },
      {
        key: 'p',
        handler: () => window.print(),
        description: 'Print plan',
        group: 'actions' as const,
      },
      {
        key: 'ArrowLeft',
        handler: () => setCalendarStartMonth((m) => Math.max(0, (m ?? defaultStartMonth) - 3)),
        description: 'Previous calendar months',
        group: 'calendar' as const,
      },
      {
        key: 'ArrowRight',
        handler: () => setCalendarStartMonth((m) => Math.min(11, (m ?? defaultStartMonth) + 3)),
        description: 'Next calendar months',
        group: 'calendar' as const,
      },
    ],
    [strategies, result, handleExportAll, setActiveStrategy, defaultStartMonth]
  );
  useKeyboardShortcuts(shortcuts, !showShortcuts);

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
              onClick={() => {
                // On mobile: open bottom sheet; on desktop: toggle inline sidebar
                if (window.innerWidth < 1024) {
                  setMobileSettingsOpen((o) => !o);
                } else {
                  setSidebarOpen((o) => !o);
                }
              }}
              className="flex items-center justify-center w-11 h-11 rounded-lg text-ink-muted hover:text-teal hover:bg-cream transition-colors focus-visible:ring-2 focus-visible:ring-teal/30 active:scale-95"
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
            {/* Desktop-only nav buttons */}
            <button
              onClick={() => setShowShortcuts(true)}
              className="print:hidden hidden sm:flex items-center justify-center w-8 h-8 text-ink-muted hover:text-teal transition-colors rounded-lg hover:bg-cream border border-border hover:border-teal/40 text-xs font-bold"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
            >
              ?
            </button>
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
              className="print:hidden hidden sm:flex items-center gap-1 text-xs text-ink-muted hover:text-teal transition-colors border border-border rounded-lg px-2.5 py-1.5 hover:border-teal/40"
              aria-label={l.sharePlanLink}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.886-3.497l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              <span className="hidden sm:inline">{l.share}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="print:hidden hidden sm:flex items-center gap-1 text-xs text-ink-muted hover:text-teal transition-colors border border-border rounded-lg px-2.5 py-1.5 hover:border-teal/40"
              aria-label={l.printPlan}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              <span className="hidden sm:inline">{l.print}</span>
            </button>
            <button
              onClick={() => setDrawerOpen((o) => !o)}
              className="print:hidden flex items-center gap-1 text-xs text-ink-muted hover:text-teal transition-colors border border-border rounded-lg px-2.5 py-1.5 hover:border-teal/40 relative"
              aria-label={l.myPlans}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              <span className="hidden sm:inline">{l.myPlans}</span>
              {savedPlans.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-teal text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {savedPlans.length}
                </span>
              )}
            </button>

            {/* Mobile overflow menu */}
            <div className="relative sm:hidden print:hidden">
              <button
                onClick={() => setMobileNavOpen((o) => !o)}
                className="flex items-center justify-center w-8 h-8 text-ink-muted hover:text-teal transition-colors rounded-lg hover:bg-cream border border-border"
                aria-label="More actions"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </button>
              {mobileNavOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl border border-border shadow-lg py-1 min-w-[180px] animate-fade-in">
                    <button
                      onClick={() => { handleSharePlan(); setMobileNavOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-ink hover:bg-cream transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.886-3.497l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                      {l.share}
                    </button>
                    <button
                      onClick={() => { window.print(); setMobileNavOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-ink hover:bg-cream transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                      </svg>
                      {l.print}
                    </button>
                    <button
                      onClick={() => { setShowShortcuts(true); setMobileNavOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-ink hover:bg-cream transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                      </svg>
                      Shortcuts
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* STATS BAR — sticky when results exist */}
      <div className={`bg-white/95 backdrop-blur-sm border-b border-border/60 print:hidden ${result ? 'sticky top-[57px] z-40' : ''}`} aria-live="polite">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 overflow-x-auto scrollbar-none text-xs min-h-[38px]">
          {calendarLoading ? (
            <span className="text-ink-muted/60 animate-pulse">
              {locale === 'ko' ? '캘린더 불러오는 중…' : 'Loading calendar data…'}
            </span>
          ) : result ? (
            <>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-coral inline-block" />
                <AnimatedStat value={result.totalDaysOff} className="font-semibold text-coral" />
                <span className="text-ink-muted">{l.daysOff}</span>
              </div>
              <div className="w-px h-3 bg-border shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-teal inline-block" />
                <AnimatedStat value={result.totalLeaveUsed} className="font-semibold text-teal" />
                <span className="text-ink-muted">{l.used}</span>
              </div>
              <div className="w-px h-3 bg-border shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
                <AnimatedStat
                  value={result.totalDaysOff / Math.max(1, result.totalLeaveUsed)}
                  className="font-semibold text-sage"
                  suffix="×"
                  decimals={1}
                />
                <span className="text-ink-muted">{locale === 'ko' ? '효율' : 'efficiency'}</span>
              </div>
              <EfficiencyBadge
                efficiency={result.totalDaysOff / Math.max(1, result.totalLeaveUsed)}
                country={form.country}
              />
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
          {/* Mobile settings bottom sheet */}
          <MobileSettingsDrawer open={mobileSettingsOpen} onClose={() => setMobileSettingsOpen(false)}>
            <div className="space-y-5" onPointerDown={handleSidebarInteraction}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-display font-semibold text-ink">{l.planHeading}</h2>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">{l.planSubheading}</p>
                </div>
                <button type="button" onClick={handleReset} className="text-[10px] font-semibold text-ink-muted hover:text-coral transition-colors px-2 py-1 rounded-lg hover:bg-coral-light shrink-0 mt-0.5" aria-label={l.resetAll}>{l.reset}</button>
              </div>
              {/* PTO Budget */}
              <div>
                <SectionLabel>{locale === 'ko' ? 'PTO 예산' : 'PTO budget'}</SectionLabel>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="relative h-3 group">
                        <div className="absolute inset-0 rounded-full bg-border/40 overflow-hidden flex">
                          {prebookedCount > 0 && <div className="bg-ink-muted/40 h-full shrink-0 transition-all duration-200" style={{ width: `${(prebookedCount / 40) * 100}%` }} />}
                          {selectedPTO.size > 0 && <div className="bg-coral h-full shrink-0 transition-all duration-200" style={{ width: `${(selectedPTO.size / 40) * 100}%` }} />}
                          <div className="bg-teal/30 h-full shrink-0 transition-all duration-200" style={{ width: `${(Math.max(0, form.leavePool.ptoDays - selectedPTO.size - prebookedCount) / 40) * 100}%` }} />
                        </div>
                        <input type="range" min={0} max={40} value={form.leavePool.ptoDays} onChange={(e) => { const v = parseInt(e.target.value, 10); setLeave('ptoDays', v); setForm((f) => ({ ...f, daysToAllocate: v })); }} className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md" />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] font-semibold text-ink-muted">0</span>
                        <span className="text-xs font-bold text-teal">{form.leavePool.ptoDays} {locale === 'ko' ? '일' : 'days'}</span>
                        <span className="text-[10px] font-semibold text-ink-muted">40</span>
                      </div>
                    </div>
                  </div>
                  {totalLeave > 0 && (
                    <div className="flex items-center justify-between bg-teal-light rounded-lg px-3 py-2 border border-teal/10">
                      <span className="text-xs font-semibold text-teal">{l.totalAvailable}</span>
                      <span className="text-base font-display font-semibold text-teal">{totalLeave} {l.days}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Location */}
              <div>
                <SectionLabel>{l.location}</SectionLabel>
                <div className="flex gap-2 mb-3">
                  {([{ code: 'US' as CountryCode, label: l.countryUS }, { code: 'KR' as CountryCode, label: l.countryKR }] as { code: CountryCode; label: string }[]).map(({ code, label }) => (
                    <button key={code} onClick={() => handleCountryChange(code)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${form.country === code ? 'bg-teal text-white border-teal' : 'bg-cream text-ink-muted border-border hover:border-teal/40'}`}>{label}</button>
                  ))}
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-ink-soft mb-1.5">{l.homeAirport}</label>
                  <input type="text" value={form.homeAirport} onChange={(e) => { const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3); setForm((f) => ({ ...f, homeAirport: val, airportManuallySet: true })); }} placeholder={l.airportPlaceholder} maxLength={3} className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink font-mono uppercase placeholder:text-ink-muted/50 placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors" />
                </div>
                {form.country === 'US' && (
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1.5">{l.state}</label>
                    <select value={form.usState} onChange={(e) => setForm((f) => ({ ...f, usState: e.target.value }))} className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors">
                      {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {/* Optimize button */}
              <button
                onClick={() => { handleOptimize(); handleSidebarInteraction(); setMobileSettingsOpen(false); }}
                disabled={loading || totalLeave === 0}
                className="w-full bg-teal text-white font-semibold py-3 rounded-xl hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 min-h-[48px]"
              >
                {loading ? l.findingWindows : l.optimizeMyLeave}
              </button>
            </div>
          </MobileSettingsDrawer>

          {/* Desktop sidebar */}
          <aside
            className={`hidden lg:block shrink-0 transition-all duration-500 ease-in-out ${
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

              {/* PTO Budget */}
              <div>
                <SectionLabel>{locale === 'ko' ? 'PTO 예산' : 'PTO budget'}</SectionLabel>
                <div className="space-y-3">
                  {/* Slider + stepper combo */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      {/* Layered slider: visual track + native range input */}
                      <div className="relative h-3 group">
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
                    </div>
                    <div className="flex items-center bg-cream border border-border rounded-lg overflow-hidden shrink-0">
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
                        className="w-10 text-center text-sm font-display font-semibold text-teal bg-transparent border-x border-border py-1.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  </div>

                  {/* Budget legend */}
                  <div className="flex items-center gap-3">
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

              {/* Location */}
              <div data-tour="location">
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
                data-tour="optimize-button"
                onClick={() => { handleOptimize(); handleSidebarInteraction(); }}
                disabled={loading || totalLeave === 0}
                className={`w-full bg-teal text-white font-semibold py-3 rounded-xl hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 active:scale-[0.98] ${
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

          {/* Mobile sticky bottom bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-border px-4 py-3 print:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
            {result ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 min-w-0 overflow-x-auto scrollbar-none">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-sm font-display font-semibold text-coral">{result.totalDaysOff}</span>
                    <span className="text-[10px] text-ink-muted">{l.daysOff}</span>
                  </div>
                  <div className="w-px h-3 bg-border shrink-0" />
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-sm font-display font-semibold text-sage">{(result.totalDaysOff / Math.max(1, result.totalLeaveUsed)).toFixed(1)}x</span>
                    <span className="text-[10px] text-ink-muted">{locale === 'ko' ? '효율' : 'eff.'}</span>
                  </div>
                  <div className="w-px h-3 bg-border shrink-0" />
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-sm font-display font-semibold text-teal">{result.totalLeaveUsed}</span>
                    <span className="text-[10px] text-ink-muted">{l.used}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setMobileSettingsOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl border border-border text-ink-muted hover:text-teal transition-colors"
                    aria-label={l.settings}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleSharePlan}
                    className="flex items-center gap-1.5 bg-teal text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-teal-hover transition-colors min-h-[44px]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.886-3.497l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    {l.share}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileSettingsOpen(true)}
                  className="text-xs font-semibold text-ink-muted border border-border rounded-xl px-3 min-h-[44px] hover:border-teal/40 transition-colors"
                >
                  {l.settings}
                </button>
                <button
                  onClick={() => handleOptimize()}
                  disabled={loading || totalLeave === 0}
                  className="flex-1 bg-teal text-white font-semibold min-h-[44px] rounded-xl hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  {loading ? l.findingWindows : l.optimizeMyLeave}
                </button>
              </div>
            )}
          </div>

          {/* ── MAIN CONTENT ── */}
          <main id="main-content" className="flex-1 min-w-0 pb-20 lg:pb-0" role="main" aria-label="Calendar and results">
          <div className="flex flex-col gap-8">

            {/* Results section */}
            <div className="w-full order-4 space-y-8">

            {/* Loading skeleton while optimizing */}
            {loading && !result && (
              <div className="space-y-5 skeleton-stagger">
                <div className="bg-white rounded-xl border border-border px-5 py-4 flex items-center gap-5 animate-skeleton">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-8 h-6 bg-border/50 rounded skeleton-shimmer" />
                      <div className="w-14 h-3 bg-border/40 rounded skeleton-shimmer" />
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-border p-6">
                  <div className="h-4 w-48 bg-border/50 rounded mb-4 skeleton-shimmer" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 skeleton-stagger">
                    {[0, 1, 2].map((i) => (
                      <SkeletonWindowCard key={i} colorIndex={i} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-5 stagger-children">
                <div className="flex items-center gap-3 sm:gap-5 flex-wrap bg-white rounded-xl border border-border px-3 sm:px-5 py-3">
                  {[
                    { value: result.totalDaysOff, label: l.daysOffLabel, color: 'text-coral' },
                    { value: result.totalLeaveUsed, label: l.leaveUsed, color: 'text-teal' },
                    { value: result.windows.length, label: l.windowsLabel, color: 'text-sage' },
                    { value: result.remainingLeave, label: l.remainingLabel, color: 'text-ink-muted' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <AnimatedStat value={s.value} className={`text-xl font-display font-semibold ${s.color}`} />
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

                {/* What If + PTO Score row */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
                  <WhatIfPanel
                    form={form}
                    currentResult={result}
                    locale={locale}
                  />
                  <button
                    type="button"
                    onClick={() => setShowScoreCard(true)}
                    className="h-full bg-white rounded-xl border border-border px-5 py-4 flex flex-col items-center justify-center gap-1.5 hover:border-teal/40 hover:shadow-md transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-display font-bold text-lg group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: (result.totalDaysOff / Math.max(1, result.totalLeaveUsed)) >= 2.5 ? '#1A6363' : (result.totalDaysOff / Math.max(1, result.totalLeaveUsed)) >= 2.0 ? '#4A7C5E' : '#C4872A' }}
                    >
                      {(result.totalDaysOff / Math.max(1, result.totalLeaveUsed)) >= 3.5 ? 'S' :
                       (result.totalDaysOff / Math.max(1, result.totalLeaveUsed)) >= 3.0 ? 'A+' :
                       (result.totalDaysOff / Math.max(1, result.totalLeaveUsed)) >= 2.5 ? 'A' :
                       (result.totalDaysOff / Math.max(1, result.totalLeaveUsed)) >= 2.0 ? 'B+' :
                       (result.totalDaysOff / Math.max(1, result.totalLeaveUsed)) >= 1.8 ? 'B' :
                       (result.totalDaysOff / Math.max(1, result.totalLeaveUsed)) >= 1.5 ? 'C' : 'D'}
                    </div>
                    <span className="text-[10px] font-semibold text-ink-muted">{locale === 'ko' ? 'PTO 점수' : 'PTO Score'}</span>
                    <span className="text-[9px] text-ink-muted/60">{locale === 'ko' ? '공유하기' : 'Share it'}</span>
                  </button>
                </div>

                {/* Vacation windows */}
                {result.windows.length > 0 ? (
                  <CollapsibleSection
                    title={l.optimizedWindows}
                    defaultOpen={true}
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
                        <CalendarExportMenu
                          windows={sortedWindows.map((win) => ({
                            startStr: win.startStr,
                            endStr: win.endStr,
                            label: win.label,
                            ptoDaysUsed: win.ptoDaysUsed,
                          }))}
                          mode="bulk"
                        />
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
                        <SavePlanButton
                          canSave={canSave}
                          defaultName={`${activeStrategy.charAt(0).toUpperCase() + activeStrategy.slice(1)} plan — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                          onSave={handleSavePlan}
                          onLimitReached={() => toast(l.planLimitReached, 'info')}
                          label={l.savePlan}
                        />
                      </div>
                    </div>
                    {dealProgress && !dealProgress.allDone && (
                      <LoadingProgress
                        total={dealProgress.total}
                        loaded={dealProgress.flightsDone}
                        label="Loading flight deals"
                      />
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-fade-in">
                      {sortedWindows.map((w) => (
                        <WindowCard
                          key={w.id}
                          window={w}
                          isHighlighted={hoveredWindow === w.id}
                          onHover={handleWindowHover}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

            {/* Strategy loading skeleton */}
            {loading && !result && (
              <div className="w-full order-1 animate-pulse">
                <div className="bg-white rounded-2xl border border-border p-4">
                  <div className="h-4 w-32 bg-border/50 rounded mb-3" />
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 rounded-xl border border-border space-y-2">
                        <div className="h-4 w-24 bg-border/50 rounded" />
                        <div className="h-3 w-full bg-border/40 rounded" />
                        <div className="space-y-1.5 mt-2">
                          <div className="h-3 w-full bg-border/30 rounded" />
                          <div className="h-3 w-full bg-border/30 rounded" />
                          <div className="h-3 w-2/3 bg-border/30 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Strategy comparison — above calendar when results exist */}
            {result && strategies.balanced && (
              <div ref={resultsAreaRef} tabIndex={-1} className="w-full order-1 outline-none" data-tour="strategy-cards">
                <div className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-ink">Compare strategies</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
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
                          onClick={() => { setActiveStrategy(key); trackStrategySwitch(key); }}
                          className={`text-left p-3 rounded-xl border transition-all ${isActive ? 'border-teal bg-teal/5 shadow-sm' : 'border-border hover:border-teal/30'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm">{icon}</span>
                            <span className={`text-xs font-semibold ${isActive ? 'text-teal' : 'text-ink'}`}>{label}</span>
                          </div>
                          <p className="text-[10px] text-ink-muted mb-2">{desc}</p>
                          {s && (() => {
                            const active = strategies[activeStrategy];
                            const daysDelta = active ? s.totalDaysOff - active.totalDaysOff : 0;
                            const windowDelta = active ? s.windows.length - active.windows.length : 0;
                            return (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-ink-muted">Windows</span>
                                  <span className="font-semibold text-ink">
                                    {s.windows.length}
                                    {!isActive && windowDelta !== 0 && (
                                      <span className={`ml-1 text-[9px] ${windowDelta > 0 ? 'text-sage' : 'text-coral'}`}>
                                        {windowDelta > 0 ? '+' : ''}{windowDelta}
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-ink-muted">Days off</span>
                                  <span className="font-semibold text-ink">
                                    {s.totalDaysOff}
                                    {!isActive && daysDelta !== 0 && (
                                      <span className={`ml-1 text-[9px] ${daysDelta > 0 ? 'text-sage' : 'text-coral'}`}>
                                        {daysDelta > 0 ? '+' : ''}{daysDelta}
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-ink-muted">Avg efficiency</span>
                                  <span className="font-semibold text-sage">
                                    {(s.windows.reduce((a, w) => a + w.efficiency, 0) / Math.max(s.windows.length, 1)).toFixed(1)}x
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Year-at-a-Glance Mini Map */}
            {calendarDays.length > 0 && !calendarLoading && (
              <div className="w-full order-2">
                <YearMiniMap
                  days={calendarDays}
                  year={form.year}
                  hoveredWindow={hoveredWindow}
                  onHoverWindow={setHoveredWindow}
                  onMonthClick={(m) => setCalendarStartMonth(m)}
                />
              </div>
            )}

            {/* Calendar — front and center */}
            <div className="w-full order-3 space-y-3" data-tour="calendar">
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
                    onTogglePTO={handleTogglePTO}
                    onDragSelect={handleDragSelect}
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

      {/* Celebration burst on high-efficiency results */}
      <CelebrationBurst
        trigger={celebrationTrigger}
        efficiency={result ? result.totalDaysOff / Math.max(1, result.totalLeaveUsed) : 0}
      />

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

      {/* PTO Score card modal */}
      {showScoreCard && result && (
        <PTOScoreCard
          year={form.year}
          totalLeave={result.totalLeaveUsed}
          totalDaysOff={result.totalDaysOff}
          windowCount={result.windows.length}
          efficiency={result.totalDaysOff / Math.max(1, result.totalLeaveUsed)}
          onClose={() => setShowScoreCard(false)}
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

      {/* Saved plans drawer */}
      <SavedPlansDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        plans={savedPlans}
        onLoad={handleLoadSavedPlan}
        onDelete={handleDeletePlan}
        onRename={renamePlan}
        l={l}
      />

      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsHelp open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Undo/redo controls */}
      <UndoRedoControls
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        historySize={historySize}
      />

      {/* Onboarding tour */}
      <OnboardingTour />
    </div>
  );
}
