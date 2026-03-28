/**
 * Multi-country configuration foundation.
 *
 * Each entry provides locale-specific defaults used by the form,
 * optimizer, and display layers. Keyed by ISO 3166-1 alpha-2 code.
 *
 * To add a new country:
 * 1. Add an entry here with all required fields.
 * 2. Add a matching holiday provider in `lib/` (or wire the Nager.Date API).
 * 3. Update `CountryCode` in `lib/types.ts`.
 */

export interface CountryConfig {
  code: string;
  name: string;
  nameLocal: string;
  flag: string;
  defaultAirport: string;
  currency: string;
  avgPtoDays: number;
  locale: 'en' | 'ko';
  hasSubstituteHolidays: boolean;
  hasStateHolidays: boolean;
}

export const COUNTRY_CONFIG: Record<string, CountryConfig> = {
  US: {
    code: 'US',
    name: 'United States',
    nameLocal: 'United States',
    flag: '\u{1F1FA}\u{1F1F8}',
    defaultAirport: 'JFK',
    currency: 'USD',
    avgPtoDays: 15,
    locale: 'en',
    hasSubstituteHolidays: false,
    hasStateHolidays: true,
  },
  KR: {
    code: 'KR',
    name: 'South Korea',
    nameLocal: '\uB300\uD55C\uBBFC\uAD6D',
    flag: '\u{1F1F0}\u{1F1F7}',
    defaultAirport: 'ICN',
    currency: 'KRW',
    avgPtoDays: 15,
    locale: 'ko',
    hasSubstituteHolidays: true,
    hasStateHolidays: false,
  },

  // ── Ready-to-populate stubs ──────────────────────────────────────────────
  // Uncomment and fill in when adding support for these countries.

  // JP: {
  //   code: 'JP',
  //   name: 'Japan',
  //   nameLocal: '日本',
  //   flag: '🇯🇵',
  //   defaultAirport: 'NRT',
  //   currency: 'JPY',
  //   avgPtoDays: 20,
  //   locale: 'en',
  //   hasSubstituteHolidays: true,
  //   hasStateHolidays: false,
  // },

  // UK: {
  //   code: 'UK',
  //   name: 'United Kingdom',
  //   nameLocal: 'United Kingdom',
  //   flag: '🇬🇧',
  //   defaultAirport: 'LHR',
  //   currency: 'GBP',
  //   avgPtoDays: 28,
  //   locale: 'en',
  //   hasSubstituteHolidays: true,
  //   hasStateHolidays: false,
  // },

  // DE: {
  //   code: 'DE',
  //   name: 'Germany',
  //   nameLocal: 'Deutschland',
  //   flag: '🇩🇪',
  //   defaultAirport: 'FRA',
  //   currency: 'EUR',
  //   avgPtoDays: 30,
  //   locale: 'en',
  //   hasSubstituteHolidays: false,
  //   hasStateHolidays: true,
  // },
};
