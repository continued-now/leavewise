'use client';

import { useState, useCallback } from 'react';
import { t, type Locale } from '@/lib/i18n/optimize';

export function useThemeLocale() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    try {
      const saved = localStorage.getItem('leavewise_locale');
      if (saved === 'ko' || saved === 'en') return saved;
      const qc = new URLSearchParams(window.location.search).get('country')?.toUpperCase();
      if (qc === 'KR') return 'ko';
      const lsc = localStorage.getItem('leavewise_default_country');
      if (lsc === 'KR') return 'ko';
    } catch { /* ok */ }
    return 'en';
  });

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next: Locale = prev === 'en' ? 'ko' : 'en';
      try { localStorage.setItem('leavewise_locale', next); } catch { /* ok */ }
      return next;
    });
  }, []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      if (localStorage.getItem('leavewise_theme') === 'dark') return 'dark';
    } catch { /* ok */ }
    return 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        if (next === 'dark') {
          localStorage.setItem('leavewise_theme', 'dark');
          document.documentElement.dataset.theme = 'dark';
        } else {
          localStorage.removeItem('leavewise_theme');
          delete document.documentElement.dataset.theme;
        }
      } catch { /* ok */ }
      return next;
    });
  }, []);

  return { locale, toggleLocale, l: t[locale], theme, toggleTheme };
}
