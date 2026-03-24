/**
 * Affiliate link builders for Travelpayouts (Aviasales, Hotellook, Jetradar)
 * and Google Calendar event creation.
 *
 * Each link includes:
 * - Partner marker ID (from env var NEXT_PUBLIC_TRAVELPAYOUTS_MARKER)
 * - UTM parameters for attribution tracking
 * - Sub-ID encoding the window context for conversion analysis
 *
 * If the marker is absent, the link still works but earns no commission.
 */

function buildSubId(windowLabel?: string): string {
  // Encode window context into a short sub-ID for affiliate dashboards
  // e.g. "lw_jul1-jul14" — helps attribute which window drove the click
  if (!windowLabel) return 'lw_direct';
  const clean = windowLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40);
  return `lw_${clean}`;
}

const UTM_PARAMS = {
  utm_source: 'leavewise',
  utm_medium: 'affiliate',
};

/**
 * Format YYYY-MM-DD to DDMM for Aviasales search URLs.
 * e.g. "2026-07-04" → "0407"
 */
function toAviasalesDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}${month}`;
}

/**
 * Build an Aviasales flight search link (primary flight CTA).
 * URL pattern: https://www.aviasales.com/search/{IATA_from}{DDMM}{IATA_to}{DDMM}1?marker={marker}
 *
 * When no destination is specified, the link opens a general search from the origin.
 */
export function buildFlightSearchLink(
  origin: string,
  dateFrom: string,
  dateTo: string,
  marker?: string,
  windowLabel?: string,
): string {
  const from = origin.toUpperCase().slice(0, 3);
  const departDate = toAviasalesDate(dateFrom);
  const returnDate = toAviasalesDate(dateTo);

  // Aviasales search path: {origin}{DDMM}{dest}{DDMM}{passengers}
  // Empty destination = "anywhere" style search on Aviasales
  const searchPath = `${from}${departDate}${returnDate}1`;

  const url = new URL(`https://www.aviasales.com/search/${searchPath}`);
  if (marker) url.searchParams.set('marker', marker);
  url.searchParams.set('utm_source', UTM_PARAMS.utm_source);
  url.searchParams.set('utm_medium', UTM_PARAMS.utm_medium);
  url.searchParams.set('utm_campaign', 'pto_optimizer');
  if (windowLabel) url.searchParams.set('utm_content', buildSubId(windowLabel));

  return url.toString();
}

/**
 * Build a Hotellook hotel search link.
 * URL pattern: https://search.hotellook.com/?destination={city}&checkIn={YYYY-MM-DD}&checkOut={YYYY-MM-DD}&marker={marker}
 */
export function buildHotelSearchLink(
  destination: string,
  checkIn: string,
  checkOut: string,
  marker?: string,
  windowLabel?: string,
): string {
  const params = new URLSearchParams({
    destination,
    checkIn,
    checkOut,
    ...UTM_PARAMS,
    utm_campaign: 'pto_optimizer',
  });
  if (marker) params.set('marker', marker);
  if (windowLabel) params.set('utm_content', buildSubId(windowLabel));

  return `https://search.hotellook.com/?${params.toString()}`;
}

/**
 * Build a Jetradar flight comparison link (secondary flight CTA).
 * URL pattern: https://www.jetradar.com/search/?origin_iata={origin}&dest_iata=&depart_date={YYYY-MM-DD}&return_date={YYYY-MM-DD}&adults=1&marker={marker}
 */
export function buildFlightCompareLink(
  origin: string,
  dateFrom: string,
  dateTo: string,
  marker?: string,
  windowLabel?: string,
): string {
  const from = origin.toUpperCase().slice(0, 3);

  const params = new URLSearchParams({
    origin_iata: from,
    dest_iata: '',
    depart_date: dateFrom,
    return_date: dateTo,
    adults: '1',
    ...UTM_PARAMS,
    utm_campaign: 'pto_optimizer',
  });
  if (marker) params.set('marker', marker);
  if (windowLabel) params.set('utm_content', buildSubId(windowLabel));

  return `https://www.jetradar.com/search/?${params.toString()}`;
}

/**
 * Build a Google Calendar "quick add" link for a vacation window.
 * Opens the Google Calendar event creation form pre-filled with dates and title.
 */
export function buildGoogleCalendarLink(
  startStr: string,
  endStr: string,
  label: string,
  ptoDaysUsed: number,
): string {
  // Google Calendar expects dates in YYYYMMDD format for all-day events.
  // The end date is exclusive, so add 1 day.
  const startClean = startStr.replace(/-/g, '');

  const endDate = new Date(endStr + 'T00:00:00');
  endDate.setDate(endDate.getDate() + 1);
  const endClean = endDate.toISOString().slice(0, 10).replace(/-/g, '');

  const title = `${label} (${ptoDaysUsed} PTO day${ptoDaysUsed === 1 ? '' : 's'})`;
  const details = `Planned via Leavewise PTO Optimizer\n${ptoDaysUsed} PTO day${ptoDaysUsed === 1 ? '' : 's'} used`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startClean}/${endClean}`,
    details,
  });

  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
}

/**
 * Append Kiwi affiliate ID + UTM tracking to their booking deep-link.
 * Kept for the server-side flight API route which still fetches from Kiwi.
 */
export function buildKiwiLink(
  deeplink: string,
  affiliateId?: string,
  windowLabel?: string,
): string {
  try {
    const url = new URL(deeplink);
    if (affiliateId) url.searchParams.set('affilid', affiliateId);
    url.searchParams.set('utm_source', UTM_PARAMS.utm_source);
    url.searchParams.set('utm_medium', UTM_PARAMS.utm_medium);
    url.searchParams.set('utm_campaign', 'pto_optimizer');
    if (windowLabel) url.searchParams.set('utm_content', buildSubId(windowLabel));
    return url.toString();
  } catch {
    return deeplink;
  }
}
