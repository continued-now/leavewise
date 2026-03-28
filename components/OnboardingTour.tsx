'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';

interface StepConfig {
  title: string;
  description: string;
  selector: string;
  requiresOptimization: boolean;
}

const STEPS: StepConfig[] = [
  {
    title: 'Pick your country',
    description:
      'Choose your location so we can load the right public holidays and optimize around them.',
    selector: '[data-tour="location"]',
    requiresOptimization: false,
  },
  {
    title: 'Hit Optimize',
    description:
      'Once your PTO budget is set, click this button to find the best vacation windows for your year.',
    selector: '[data-tour="optimize-button"]',
    requiresOptimization: false,
  },
  {
    title: 'Compare strategies',
    description:
      'After optimization, switch between Short breaks, Balanced, and Long trips to find your ideal mix.',
    selector: '[data-tour="strategy-cards"]',
    requiresOptimization: true,
  },
  {
    title: 'Click calendar days',
    description:
      'Click any workday on the calendar to manually toggle it as PTO. Build your own custom plan or tweak the optimized one.',
    selector: '[data-tour="calendar"]',
    requiresOptimization: false,
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingTour() {
  const { step, active, nextStep, prevStep, dismiss } = useOnboarding();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const measureTarget = useCallback(() => {
    if (!active) return;
    const config = STEPS[step];
    if (!config) return;

    const el = document.querySelector(config.selector);
    if (!el) {
      setTargetRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    });
  }, [active, step]);

  useEffect(() => {
    measureTarget();
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);
    return () => {
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [measureTarget]);

  // Re-measure when step changes
  useEffect(() => {
    // Small delay to allow DOM to settle after step change
    const t = setTimeout(measureTarget, 100);
    return () => clearTimeout(t);
  }, [step, measureTarget]);

  if (!active) return null;

  const config = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  // If target requires optimization and isn't visible, show a centered card
  const showCentered = !targetRect;

  // Popover position: place below the target by default
  const popoverStyle: React.CSSProperties = showCentered
    ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 110,
      }
    : {
        position: 'absolute',
        top: (targetRect?.top ?? 0) + (targetRect?.height ?? 0) + 12,
        left: Math.max(
          16,
          Math.min(
            (targetRect?.left ?? 0) + (targetRect?.width ?? 0) / 2 - 160,
            typeof window !== 'undefined' ? window.innerWidth - 336 : 600
          )
        ),
        zIndex: 110,
      };

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/30 transition-opacity duration-300"
        style={{ pointerEvents: 'none' }}
        aria-hidden="true"
      />

      {/* Highlight hole (outline around target) */}
      {targetRect && (
        <div
          className="absolute z-[101] rounded-xl ring-4 ring-teal/50 transition-all duration-300"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}

      {/* Popover card */}
      <div
        ref={popoverRef}
        style={popoverStyle}
        className="w-80 bg-white rounded-2xl shadow-lg border border-border p-5 pointer-events-auto"
        role="dialog"
        aria-label={`Tour step ${step + 1} of ${STEPS.length}: ${config.title}`}
      >
        {/* Step indicator dots */}
        <div className="flex items-center gap-1.5 mb-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-teal' : 'bg-border'
              }`}
            />
          ))}
          <span className="ml-auto text-[10px] text-ink-muted font-semibold">
            {step + 1}/{STEPS.length}
          </span>
        </div>

        <h3 className="text-sm font-display font-semibold text-ink mb-1.5">
          {config.title}
        </h3>
        <p className="text-xs text-ink-muted leading-relaxed mb-4">
          {config.description}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-xs text-ink-muted hover:text-ink transition-colors font-medium"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={prevStep}
                className="text-xs text-ink-muted hover:text-teal transition-colors font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-teal/40"
              >
                Back
              </button>
            )}
            <button
              onClick={isLastStep ? dismiss : nextStep}
              className="text-xs font-semibold text-white bg-teal hover:bg-teal-hover transition-colors px-4 py-1.5 rounded-lg"
            >
              {isLastStep ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
