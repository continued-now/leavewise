'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DayData } from '@/lib/types';
import type { BridgeOption } from '@/lib/bridge-suggestions';
import type { LongWeekendPreview } from '@/lib/longWeekends';
import { getBridgeSuggestions } from '@/lib/bridge-suggestions';

export function useInteractiveCalendar(
  baseCalendar: DayData[] | null,
  remainingPTO: number,
  initialPTO: string[]
) {
  const [selectedPTO, setSelectedPTO] = useState<Set<string>>(() => new Set(initialPTO));
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

  const handleTogglePTO = useCallback((dateStr: string) => {
    setSelectedPTO((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  }, []);

  const clearInteractiveState = useCallback(() => {
    setSelectedPTO(new Set());
    setActiveHoliday(null);
    setActiveSuggestions([]);
    setPreviewDates(new Set());
  }, []);

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
    handleApplyBridge,
    handlePreviewEnter,
    handlePreviewLeave,
    handleTogglePTO,
    clearInteractiveState,
  };
}
