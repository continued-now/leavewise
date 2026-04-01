'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  FormState,
  Strategy,
  SerializedResult,
  SavedPlan,
  SavedPlanMeta,
  SavedPlansStore,
} from '@/lib/types';
import { serializeResult } from '@/hooks/useOptimizerResults';
import type { OptimizationResult } from '@/lib/types';

const STORAGE_KEY = 'leavewise_saved_plans_v1';
const MAX_PLANS = 10;

function loadStore(): SavedPlansStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, plans: [] };
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return { version: 1, plans: [] };
    return parsed as SavedPlansStore;
  } catch {
    return { version: 1, plans: [] };
  }
}

function saveStore(store: SavedPlansStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage full or private browsing
  }
}

function toMeta(plan: SavedPlan): SavedPlanMeta {
  return {
    id: plan.id,
    name: plan.name,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    country: plan.country,
    year: plan.year,
    strategy: plan.strategy,
    totalLeaveUsed: plan.totalLeaveUsed,
    totalDaysOff: plan.totalDaysOff,
    efficiency: plan.efficiency,
    windowCount: plan.windowCount,
    remainingLeave: plan.remainingLeave,
  };
}

function generateDefaultName(strategy: Strategy): string {
  const strategyLabel = strategy.charAt(0).toUpperCase() + strategy.slice(1);
  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${strategyLabel} plan — ${date}`;
}

export function useSavedPlans() {
  const [plans, setPlans] = useState<SavedPlanMeta[]>([]);

  // Load plan metadata on mount
  useEffect(() => {
    const store = loadStore();
    setPlans(store.plans.map(toMeta).sort((a, b) => b.updatedAt - a.updatedAt));
  }, []);

  const canSave = plans.length < MAX_PLANS;

  const savePlan = useCallback((
    name: string | undefined,
    form: FormState,
    selectedPTO: string[],
    result: OptimizationResult,
    strategies: Record<Strategy, OptimizationResult | null>,
    strategy: Strategy
  ): boolean => {
    const store = loadStore();
    if (store.plans.length >= MAX_PLANS) return false;

    const serializedResult = serializeResult(result);
    const extraStrategies: SavedPlan['strategies'] = {};
    if (strategies.short) extraStrategies.short = serializeResult(strategies.short);
    if (strategies.long) extraStrategies.long = serializeResult(strategies.long);

    const now = Date.now();
    const plan: SavedPlan = {
      id: crypto.randomUUID(),
      name: name || generateDefaultName(strategy),
      createdAt: now,
      updatedAt: now,
      country: form.country,
      year: form.year,
      strategy,
      totalLeaveUsed: result.totalLeaveUsed,
      totalDaysOff: result.totalDaysOff,
      efficiency: Math.round((result.totalDaysOff / Math.max(1, result.totalLeaveUsed)) * 10) / 10,
      windowCount: result.windows.length,
      remainingLeave: result.remainingLeave,
      form,
      selectedPTO,
      result: serializedResult,
      strategies: Object.keys(extraStrategies).length > 0 ? extraStrategies : undefined,
    };

    store.plans.push(plan);
    saveStore(store);
    setPlans(store.plans.map(toMeta).sort((a, b) => b.updatedAt - a.updatedAt));
    return true;
  }, []);

  const loadPlan = useCallback((id: string): SavedPlan | null => {
    const store = loadStore();
    return store.plans.find((p) => p.id === id) ?? null;
  }, []);

  const deletePlan = useCallback((id: string) => {
    const store = loadStore();
    store.plans = store.plans.filter((p) => p.id !== id);
    saveStore(store);
    setPlans(store.plans.map(toMeta).sort((a, b) => b.updatedAt - a.updatedAt));
  }, []);

  const renamePlan = useCallback((id: string, newName: string) => {
    const store = loadStore();
    const plan = store.plans.find((p) => p.id === id);
    if (!plan) return;
    plan.name = newName;
    plan.updatedAt = Date.now();
    saveStore(store);
    setPlans(store.plans.map(toMeta).sort((a, b) => b.updatedAt - a.updatedAt));
  }, []);

  return {
    plans,
    canSave,
    savePlan,
    loadPlan,
    deletePlan,
    renamePlan,
  };
}
