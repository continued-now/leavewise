'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DayData } from '@/lib/types';
import type { BridgeOption } from '@/lib/bridge-suggestions';
import type { LongWeekendPreview } from '@/lib/longWeekends';
import { getBridgeSuggestions } from '@/lib/bridge-suggestions';
import { useUndoRedo } from '@/hooks/useUndoRedo';

export function useInteractiveCalendar(
  baseCalendar: DayData[] | null,
  remainingPTO: number,
  initialPTO: string[]
) {
  const {
    state: selectedPTO,
    setState: setSelectedPTO,
    undo,
    redo,
    canUndo,
    canRedo,
    historySize,
    clear: clearUndoHistory,
  } = useUndoRedo<Set<string>>(new Set(initialPTO), { maxHistory: 50 });
  const [previewDates, setPreviewDates] = useState<Set<string>>(new Set());
  const [activeHoliday, setActiveHoliday] = useState<DayData | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<BridgeOption[]>([]);
  const [expandedLW, setExpandedLW] = useState<LongWeekendPreview | null>(null);

  // Refresh bridge suggestions when active holiday or selection changes
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

  const handleDayClick = useCallback(
    (day: DayData) => {
      if (!day.isHoliday) return;
      if (activeHoliday?.dateStr === day.dateStr) {
        setActiveHoliday(null);
        setPreviewDates(new Set());
      } else {
        setActiveHoliday(day);
        setPreviewDates(new Set());
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
  }, [setSelectedPTO]);

  const handlePreviewEnter = useCallback((dates: string[]) => {
    setPreviewDates(new Set(dates));
  }, []);

  const handlePreviewLeave = useCallback(() => {
    setPreviewDates(new Set());
  }, []);

  const handleTogglePTO = useCallback((dateStr: string) => {
    setSelectedPTO((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  }, [setSelectedPTO]);

  const handleDragSelect = useCallback((dates: string[], mode: 'add' | 'remove') => {
    setSelectedPTO((prev) => {
      const next = new Set(prev);
      for (const d of dates) {
        if (mode === 'add') next.add(d);
        else next.delete(d);
      }
      return next;
    });
  }, [setSelectedPTO]);

  const clearInteractiveState = useCallback(() => {
    setSelectedPTO(new Set());
    clearUndoHistory();
    setActiveHoliday(null);
    setActiveSuggestions([]);
    setPreviewDates(new Set());
  }, [setSelectedPTO, clearUndoHistory]);

  return {
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
  };
}
