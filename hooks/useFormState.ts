'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { FormState, StoredState, ShareableSnapshot, CountryCode } from '@/lib/types';
import { inferAirport } from '@/lib/airports';

const STORAGE_KEY = 'leavewise_state_v1';
const CURRENT_YEAR = new Date().getFullYear();

export const DEFAULT_FORM: FormState = {
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
};

function loadSavedState(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !parsed.form) return null;
    return parsed as StoredState;
  } catch {
    return null;
  }
}

function saveState(form: FormState, selectedPTO: Set<string>) {
  try {
    const state: StoredState = {
      version: 1,
      form,
      selectedPTO: Array.from(selectedPTO),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* private browsing — ignore */ }
}

export function encodeShareURL(form: FormState): string {
  const snap: ShareableSnapshot = {
    v: 1,
    c: form.country, s: form.usState, y: form.year,
    lp: [form.leavePool.ptoDays, form.leavePool.compDays, form.leavePool.floatingHolidays],
    da: form.daysToAllocate, mx: form.maxDaysPerWindow,
    ch: form.companyHolidaysRaw, pb: form.prebookedRaw,
    tw: form.travelValueWeight, ha: form.homeAirport,
  };
  return `${window.location.origin}${window.location.pathname}#${btoa(JSON.stringify(snap))}`;
}

function decodeShareURL(): FormState | null {
  try {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    const snap: ShareableSnapshot = JSON.parse(atob(hash));
    if (snap.v !== 1) return null;
    return {
      country: snap.c as CountryCode,
      usState: snap.s,
      year: snap.y,
      leavePool: { ptoDays: snap.lp[0], compDays: snap.lp[1], floatingHolidays: snap.lp[2] },
      daysToAllocate: snap.da,
      maxDaysPerWindow: snap.mx,
      companyName: '',
      companyHolidaysRaw: snap.ch,
      prebookedRaw: snap.pb,
      homeAirport: snap.ha,
      airportManuallySet: !!snap.ha,
      travelValueWeight: snap.tw as 0 | 0.4 | 0.8,
    };
  } catch {
    return null;
  }
}

export function useFormState(selectedPTO: Set<string>) {
  const urlFormRef = useRef<FormState | null | undefined>(undefined);
  const restoredFromStorage = useRef(false);

  function getURLForm(): FormState | null {
    if (urlFormRef.current === undefined) {
      urlFormRef.current = typeof window !== 'undefined' ? decodeShareURL() : null;
      if (urlFormRef.current && typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
    return urlFormRef.current;
  }

  const [form, setForm] = useState<FormState>(() => {
    const fromURL = getURLForm();
    if (fromURL) return fromURL;
    const saved = loadSavedState()?.form;
    if (saved) return saved;
    let fallbackCountry: CountryCode = 'US';
    if (typeof window !== 'undefined') {
      try {
        const qc = new URLSearchParams(window.location.search).get('country')?.toUpperCase();
        if (qc === 'KR' || qc === 'US') fallbackCountry = qc;
        else {
          const lsc = localStorage.getItem('leavewise_default_country');
          if (lsc === 'KR') fallbackCountry = 'KR';
        }
      } catch { /* ok */ }
    }
    return fallbackCountry === 'US' ? DEFAULT_FORM : { ...DEFAULT_FORM, country: fallbackCountry };
  });

  const [initialPTO] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    if (getURLForm()) return [];
    const saved = loadSavedState();
    if (saved?.selectedPTO?.length) {
      restoredFromStorage.current = true;
      return saved.selectedPTO;
    }
    return [];
  });

  // Debounced save to localStorage
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveState(form, selectedPTO);
    }, 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [form, selectedPTO]);

  const setLeave = useCallback((key: keyof FormState['leavePool'], value: number) => {
    setForm((f) => {
      const newPool = { ...f.leavePool, [key]: value };
      const oldTotal = f.leavePool.ptoDays + f.leavePool.compDays + f.leavePool.floatingHolidays;
      const newTotal = newPool.ptoDays + newPool.compDays + newPool.floatingHolidays;
      const newDaysToAllocate =
        f.daysToAllocate >= oldTotal ? newTotal : Math.min(f.daysToAllocate, newTotal);
      return { ...f, leavePool: newPool, daysToAllocate: newDaysToAllocate };
    });
  }, []);

  const handleCountryChange = useCallback((code: CountryCode) => {
    setForm((f) => ({
      ...f,
      country: code,
      homeAirport: f.airportManuallySet ? f.homeAirport : inferAirport(code),
    }));
  }, []);

  const clearSavedState = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ok */ }
  }, []);

  return {
    form,
    setForm,
    initialPTO,
    restoredFromStorage,
    setLeave,
    handleCountryChange,
    clearSavedState,
  };
}
