'use client';

import { useState, useCallback } from 'react';
import type { SavedPlanMeta } from '@/lib/types';
import { SavedPlanCard } from './SavedPlanCard';
import { CompareModal } from './CompareModal';
import { EmptyPlansState } from './EmptyPlansState';
import { trackPlanCompare } from '@/lib/analytics';

interface SavedPlansDrawerProps {
  open: boolean;
  onClose: () => void;
  plans: SavedPlanMeta[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  l: {
    savedPlans: string;
    loadPlan: string;
    deletePlan: string;
    comparePlans: string;
    noSavedPlans: string;
    noSavedPlansDesc: string;
    selectTwoToCompare: string;
    confirmDelete: string;
  };
}

export function SavedPlansDrawer({
  open,
  onClose,
  plans,
  onLoad,
  onDelete,
  onRename,
  l,
}: SavedPlansDrawerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [comparing, setComparing] = useState(false);

  const handleToggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 2) {
          // Replace oldest selection
          const first = next.values().next().value;
          if (first !== undefined) next.delete(first);
        }
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCompare = useCallback(() => {
    if (selected.size === 2) {
      setComparing(true);
      trackPlanCompare();
    }
  }, [selected]);

  const selectedPlans = plans.filter((p) => selected.has(p.id));

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/20 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-[57px] bottom-0 w-full max-w-sm z-40 shadow-2xl animate-slide-in-right bg-cream flex flex-col"
        role="dialog"
        aria-label={l.savedPlans}
      >
        {/* Header */}
        <div className="bg-white border-b border-border px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-display font-semibold text-ink">{l.savedPlans}</h2>
            {plans.length > 0 && (
              <span className="text-[10px] font-semibold bg-teal-light text-teal px-1.5 py-0.5 rounded-full">
                {plans.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-cream transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Plan list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {plans.length === 0 ? (
            <EmptyPlansState noSavedPlans={l.noSavedPlans} noSavedPlansDesc={l.noSavedPlansDesc} />
          ) : (
            plans.map((plan) => (
              <SavedPlanCard
                key={plan.id}
                plan={plan}
                selected={selected.has(plan.id)}
                onToggleSelect={handleToggleSelect}
                onLoad={onLoad}
                onDelete={(id) => {
                  onDelete(id);
                  setSelected((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                  });
                }}
                onRename={onRename}
                loadLabel={l.loadPlan}
                deleteLabel={l.deletePlan}
                confirmDeleteLabel={l.confirmDelete}
              />
            ))
          )}
        </div>

        {/* Compare footer */}
        {plans.length >= 2 && (
          <div className="bg-white border-t border-border px-5 py-3 shrink-0">
            {selected.size === 2 ? (
              <button
                type="button"
                onClick={handleCompare}
                className="w-full bg-teal text-white font-semibold py-2.5 rounded-xl hover:bg-teal-hover transition-colors text-sm"
              >
                {l.comparePlans}
              </button>
            ) : (
              <p className="text-center text-[10px] text-ink-muted">
                {l.selectTwoToCompare}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Compare modal */}
      {comparing && selectedPlans.length === 2 && (
        <CompareModal
          planA={selectedPlans[0]}
          planB={selectedPlans[1]}
          onClose={() => setComparing(false)}
        />
      )}
    </>
  );
}
