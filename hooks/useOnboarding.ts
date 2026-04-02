'use client';

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'leavewise_tour_complete';

export interface OnboardingState {
  step: number;
  active: boolean;
  nextStep: () => void;
  prevStep: () => void;
  dismiss: () => void;
}

export function useOnboarding(): OnboardingState {
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(() => {
    try {
      return !localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  });

  const nextStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, 3));
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const dismiss = useCallback(() => {
    setActive(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // localStorage not available
    }
  }, []);

  return { step, active, nextStep, prevStep, dismiss };
}
