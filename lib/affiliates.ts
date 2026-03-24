/**
 * Affiliate link builders for Kiwi.com, Trip.com, and Booking.com.
 *
 * Affiliate IDs are read from env vars at call time.
 * If an ID is absent, the link still works but earns no commission.
 */

/** Append Kiwi affiliate ID to their booking deep-link. */
export function buildKiwiLink(deeplink: string, affiliateId?: string): string {
  if (!affiliateId) return deeplink;
  try {
    const url = new URL(deeplink);
    url.searchParams.set('affilid', affiliateId);
    return url.toString();
  } catch {
    return deeplink;
  }
}

/**
 * Build a Trip.com one-way flight search deep-link.
 * dateStr: YYYY-MM-DD
 */
export function buildTripComLink(
  origin: string,
  dateStr: string,
  currency: string,
  affiliateId?: string,
): string {
  const params = new URLSearchParams({
    depdate: dateStr,
    triptype: 'ow',
    curr: currency,
    locale: 'en-US',
  });
  if (affiliateId) {
    params.set('allianceid', affiliateId);
  }
  return `https://www.trip.com/flights/list?${params.toString()}&depCity=${origin}`;
}

/**
 * Build a Booking.com flights search deep-link.
 * dateFrom / dateTo: YYYY-MM-DD
 */
export function buildBookingComLink(
  origin: string,
  dateFrom: string,
  dateTo: string,
  affiliateId?: string,
): string {
  const params = new URLSearchParams({
    type: 'roundtrip',
    from: origin,
    depart: dateFrom,
    return: dateTo,
    adults: '1',
  });
  if (affiliateId) {
    params.set('aid', affiliateId);
  }
  return `https://www.booking.com/flights/search.html?${params.toString()}`;
}
