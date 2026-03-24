// Airports whose destinations are typically served from GMP (Gimpo) rather than ICN (Incheon)
// for Korean departures. GMP handles short-haul Japan and some China routes.
const GMP_DESTINATIONS = new Set([
  // Japan
  'NRT', 'HND', 'ITM', 'OSA', 'KIX', 'FUK', 'CTS', 'OKA',
  // China
  'PEK', 'PKX', 'SHA', 'PVG',
]);

// Primary airport(s) per country code
const COUNTRY_AIRPORTS: Record<string, string[]> = {
  KR: ['ICN', 'GMP'],
  US: ['JFK', 'LAX', 'ORD', 'ATL', 'DFW', 'DEN', 'SFO', 'SEA', 'MIA', 'BOS'],
  JP: ['NRT', 'HND', 'KIX', 'ITM', 'FUK', 'CTS'],
  GB: ['LHR', 'LGW', 'MAN', 'EDI'],
  DE: ['FRA', 'MUC', 'BER'],
  FR: ['CDG', 'ORY', 'NCE'],
  AU: ['SYD', 'MEL', 'BNE', 'PER'],
  SG: ['SIN'],
  HK: ['HKG'],
  TH: ['BKK', 'DMK', 'HKT'],
  ID: ['CGK', 'DPS', 'SUB'],
  MY: ['KUL', 'PEN'],
  PH: ['MNL', 'CEB'],
  CN: ['PEK', 'PVG', 'CAN', 'CTU'],
  IN: ['DEL', 'BOM', 'BLR', 'MAA'],
  NL: ['AMS'],
  ES: ['MAD', 'BCN'],
  IT: ['FCO', 'MXP', 'LIN'],
  PT: ['LIS', 'OPO'],
  SE: ['ARN', 'GOT'],
  NO: ['OSL', 'BGO'],
  DK: ['CPH'],
  FI: ['HEL'],
  CH: ['ZRH', 'GVA'],
  AT: ['VIE'],
  BE: ['BRU'],
  IE: ['DUB'],
  NZ: ['AKL', 'CHC', 'WLG'],
  ZA: ['JNB', 'CPT'],
  BR: ['GRU', 'GIG', 'BSB'],
  MX: ['MEX', 'CUN'],
  AR: ['EZE'],
  CO: ['BOG'],
  CL: ['SCL'],
  PL: ['WAW', 'KRK'],
  CZ: ['PRG'],
  HU: ['BUD'],
  RO: ['OTP'],
  GR: ['ATH', 'SKG'],
  TR: ['IST', 'SAW', 'AYT'],
};

/**
 * Infer the best departure airport for a given country.
 *
 * For Korea (KR): returns GMP if the destination IATA is a known GMP short-haul route,
 * otherwise returns ICN.
 *
 * For all other countries: returns the primary airport.
 */
export function inferAirport(countryCode: string, destinationIata?: string): string {
  if (countryCode === 'KR') {
    if (destinationIata && GMP_DESTINATIONS.has(destinationIata.toUpperCase())) {
      return 'GMP';
    }
    return 'ICN';
  }
  const options = COUNTRY_AIRPORTS[countryCode];
  return options?.[0] ?? '';
}

/**
 * Returns the list of selectable airport IATA codes for a given country.
 */
export function getAirportOptions(countryCode: string): string[] {
  return COUNTRY_AIRPORTS[countryCode] ?? [];
}
