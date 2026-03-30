/**
 * Crowd Calendar — tracks major holidays and events worldwide that cause
 * travel price spikes. Used to score vacation windows for travel value.
 */

import { CrowdInsight } from './types';

// ─── Lunar calendar lookup tables ────────────────────────────────────────────
// Lunar New Year (Chinese Spring Festival / Seollal / Tết) dates
const LUNAR_NEW_YEAR_DATES: Record<number, string> = {
  2024: '2024-02-10',
  2025: '2025-01-29',
  2026: '2026-02-17',
  2027: '2027-02-06',
  2028: '2028-01-26',
  2029: '2029-02-13',
  2030: '2030-02-03',
  2031: '2031-01-23',
  2032: '2032-02-11',
};

// Chuseok (Korean Harvest / Mid-Autumn Festival) — 15th day of 8th lunar month
const CHUSEOK_DATES: Record<number, string> = {
  2024: '2024-09-17',
  2025: '2025-10-06',
  2026: '2026-09-25',
  2027: '2027-10-14',
  2028: '2028-10-02',
  2029: '2029-10-22',
  2030: '2030-10-11',
  2031: '2031-09-30',
  2032: '2032-09-18',
};

// Dragon Boat Festival (端午節) — 5th day of 5th lunar month (Taiwan / East Asia)
const DRAGON_BOAT_DATES: Record<number, string> = {
  2024: '2024-06-10',
  2025: '2025-05-31',
  2026: '2026-06-19',
  2027: '2027-06-09',
  2028: '2028-05-28',
  2029: '2029-06-16',
  2030: '2030-06-05',
  2031: '2031-06-24',
  2032: '2032-06-13',
};

// Nyepi (Balinese Day of Silence / Saka New Year) — based on Balinese Saka calendar
const NYEPI_DATES: Record<number, string> = {
  2024: '2024-03-11',
  2025: '2025-03-29',
  2026: '2026-03-19',
  2027: '2027-03-08',
  2028: '2028-03-27',
  2029: '2029-03-16',
  2030: '2030-03-06',
  2031: '2031-03-25',
  2032: '2032-03-13',
};

// Eid al-Fitr (end of Ramadan) — Islamic calendar, shifts ~11 days earlier each year
const EID_AL_FITR_DATES: Record<number, string> = {
  2024: '2024-04-10',
  2025: '2025-03-30',
  2026: '2026-03-20',
  2027: '2027-03-09',
  2028: '2028-02-27',
  2029: '2029-02-14',
  2030: '2030-02-04',
  2031: '2031-01-24',
  2032: '2032-01-13',
};

// Diwali (new moon of Hindu month Kartik) dates
const DIWALI_DATES: Record<number, string> = {
  2024: '2024-11-01',
  2025: '2025-10-20',
  2026: '2026-11-08',
  2027: '2027-10-29',
  2028: '2028-10-17',
  2029: '2029-11-05',
  2030: '2030-10-26',
  2031: '2031-11-14',
  2032: '2032-11-02',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nthWeekday(year: number, month: number, weekday: number, n: number): string {
  // month: 0-based (Jan=0). weekday: 0=Sun, 4=Thu.
  let count = 0;
  for (let d = 1; d <= 31; d++) {
    const dt = new Date(year, month, d);
    if (dt.getMonth() !== month) break;
    if (dt.getDay() === weekday) {
      count++;
      if (count === n) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }
  }
  return '';
}

// ─── Internal event type ─────────────────────────────────────────────────────
interface CrowdEventDef {
  id: string;
  name: string;
  startStr: string;
  endStr: string;
  affectedRegions: string[];
  avoidRegionKeys: string[];
  crowdLevel: 'peak' | 'high' | 'moderate';
  note: string;
}

// ─── Events for a given year ──────────────────────────────────────────────────
export function getCrowdEventsForYear(year: number): CrowdEventDef[] {
  const events: CrowdEventDef[] = [];

  // ── Lunar New Year (Chinese Spring Festival / Korean Seollal / Vietnamese Tết)
  // Biggest annual migration on Earth — affects all of East & SE Asia for ~3 weeks
  const lny = LUNAR_NEW_YEAR_DATES[year];
  if (lny) {
    events.push({
      id: 'lunar-new-year',
      name: 'Lunar New Year',
      startStr: addDays(lny, -7),
      endStr: addDays(lny, 15),
      affectedRegions: ['East Asia', 'Southeast Asia'],
      avoidRegionKeys: ['east-asia', 'southeast-asia', 'china', 'korea', 'japan', 'vietnam', 'thailand', 'singapore'],
      crowdLevel: 'peak',
      note: "World's largest annual migration. Flights and hotels across East and Southeast Asia surge 40–120%. Chinese, Korean, and Vietnamese travelers fill every route. Consider Europe, the Americas, or South Asia instead.",
    });
  }

  // ── Japan Golden Week (Apr 29 – May 5)
  events.push({
    id: 'japan-golden-week',
    name: 'Japan Golden Week',
    startStr: `${year}-04-27`,
    endStr: `${year}-05-06`,
    affectedRegions: ['Japan'],
    avoidRegionKeys: ['japan'],
    crowdLevel: 'peak',
    note: "Japan's biggest travel period. Domestic hotels and bullet trains are fully booked weeks ahead. Neighboring countries (Korea, Taiwan) also see overflow crowds. Southern Europe or long-haul destinations offer good alternatives.",
  });

  // ── Japan Obon (mid-August)
  events.push({
    id: 'japan-obon',
    name: 'Japan Obon Festival',
    startStr: `${year}-08-10`,
    endStr: `${year}-08-18`,
    affectedRegions: ['Japan'],
    avoidRegionKeys: ['japan'],
    crowdLevel: 'high',
    note: "Major Japanese domestic travel period — resorts, onsen, and coastal towns fill up. Shinkansen and domestic flights are peak-priced. Outside Japan it's business as usual.",
  });

  // ── Japan Silver Week (3rd Mon of Sep = Respect for the Aged Day + Autumnal Equinox ~Sep 22–23)
  const respectAgedDay = nthWeekday(year, 8, 1, 3); // Sep = month 8 (0-based), Mon = 1, 3rd
  if (respectAgedDay) {
    events.push({
      id: 'japan-silver-week',
      name: 'Japan Silver Week',
      startStr: addDays(respectAgedDay, -1),
      endStr: `${year}-09-24`,
      affectedRegions: ['Japan'],
      avoidRegionKeys: ['japan'],
      crowdLevel: 'high',
      note: "Respect for the Aged Day plus Autumnal Equinox create a long weekend. Domestic travel surges — popular onsen towns and Kyoto are crowded. Prices rise 20–30% on domestic routes.",
    });
  }

  // ── Japan Shogatsu / New Year (Dec 28 – Jan 3)
  events.push({
    id: 'japan-new-year',
    name: 'Japan New Year (Shogatsu)',
    startStr: `${year}-12-28`,
    endStr: `${year + 1}-01-03`,
    affectedRegions: ['Japan'],
    avoidRegionKeys: ['japan'],
    crowdLevel: 'peak',
    note: "Japan's most important holiday. Most businesses close Dec 29–Jan 3. Hotels in onsen towns and ski resorts sell out months ahead. Shinkansen reserved seats are fully booked. Prices spike 50–100%.",
  });

  // ── Taiwan Tomb Sweeping Day (Qingming, Apr 4–5)
  events.push({
    id: 'taiwan-tomb-sweeping',
    name: 'Taiwan Tomb Sweeping Day (Qingming)',
    startStr: `${year}-04-03`,
    endStr: `${year}-04-06`,
    affectedRegions: ['Taiwan'],
    avoidRegionKeys: ['east-asia'],
    crowdLevel: 'moderate',
    note: "Taiwanese families travel for ancestral tomb visits. Domestic transport is busy and popular scenic areas (Taroko Gorge, Sun Moon Lake) see moderate crowds.",
  });

  // ── Taiwan Dragon Boat Festival (端午節)
  const dragonBoat = DRAGON_BOAT_DATES[year];
  if (dragonBoat) {
    events.push({
      id: 'taiwan-dragon-boat',
      name: 'Taiwan Dragon Boat Festival',
      startStr: addDays(dragonBoat, -1),
      endStr: addDays(dragonBoat, 2),
      affectedRegions: ['Taiwan'],
      avoidRegionKeys: ['east-asia'],
      crowdLevel: 'moderate',
      note: "3-day weekend in Taiwan. Domestic travel picks up and popular destinations see moderate price increases. Dragon boat races draw crowds to riverside areas.",
    });
  }

  // ── Taiwan Moon Festival (Mid-Autumn) — same lunar date as Chuseok
  const moonFest = CHUSEOK_DATES[year]; // 15th of 8th lunar month, same as Chuseok
  if (moonFest) {
    events.push({
      id: 'taiwan-moon-festival',
      name: 'Taiwan Moon Festival (Mid-Autumn)',
      startStr: addDays(moonFest, -1),
      endStr: addDays(moonFest, 2),
      affectedRegions: ['Taiwan'],
      avoidRegionKeys: ['east-asia'],
      crowdLevel: 'moderate',
      note: "Family gathering holiday in Taiwan. Domestic travel is busy, and nearby destinations (Japan, Korea) see some overflow. Overlaps with Korean Chuseok — double impact on East Asian routes.",
    });
  }

  // ── Indonesia Nyepi (Balinese Day of Silence)
  const nyepi = NYEPI_DATES[year];
  if (nyepi) {
    events.push({
      id: 'indonesia-nyepi',
      name: 'Nyepi (Balinese Day of Silence)',
      startStr: addDays(nyepi, -2),
      endStr: addDays(nyepi, 1),
      affectedRegions: ['Indonesia', 'Bali'],
      avoidRegionKeys: ['southeast-asia'],
      crowdLevel: 'moderate',
      note: "Bali shuts down completely for 24 hours — no flights, no transport, no leaving hotels. The days before and after see heavy domestic travel. Plan around this if visiting Bali.",
    });
  }

  // ── Indonesia Eid al-Fitr (Lebaran)
  const eid = EID_AL_FITR_DATES[year];
  if (eid) {
    events.push({
      id: 'indonesia-eid',
      name: 'Eid al-Fitr (Lebaran)',
      startStr: addDays(eid, -5),
      endStr: addDays(eid, 7),
      affectedRegions: ['Indonesia', 'Southeast Asia'],
      avoidRegionKeys: ['southeast-asia'],
      crowdLevel: 'high',
      note: "Indonesia's biggest travel event — 'mudik' (homecoming) moves 100M+ people. Flights and trains are fully booked weeks ahead. Bali sees a huge domestic tourist surge. Prices spike 40–80% on all routes.",
    });
  }

  // ── Vietnam Liberation Day / Reunification Day (Apr 30) + May Day (May 1)
  events.push({
    id: 'vietnam-liberation-day',
    name: 'Vietnam Liberation & May Day',
    startStr: `${year}-04-29`,
    endStr: `${year}-05-02`,
    affectedRegions: ['Vietnam'],
    avoidRegionKeys: ['vietnam'],
    crowdLevel: 'moderate',
    note: "4-day holiday weekend in Vietnam. Domestic tourism surges to Da Nang, Phu Quoc, and Ha Long Bay. Hotel prices in beach towns rise 20–40%.",
  });

  // ── China National Day / Golden Week (Oct 1–7)
  events.push({
    id: 'china-golden-week',
    name: 'China National Day Golden Week',
    startStr: `${year}-09-28`,
    endStr: `${year}-10-08`,
    affectedRegions: ['China', 'East Asia', 'Southeast Asia'],
    avoidRegionKeys: ['china', 'east-asia', 'southeast-asia', 'japan', 'korea', 'thailand', 'vietnam', 'singapore'],
    crowdLevel: 'peak',
    note: "400+ million Chinese travelers move during this week. East and Southeast Asia are packed. European gateway cities and Australian resorts also see a surge. The shoulder season in Europe ends here.",
  });

  // ── Chuseok (Korean Harvest Festival)
  const chuseok = CHUSEOK_DATES[year];
  if (chuseok) {
    events.push({
      id: 'chuseok',
      name: 'Chuseok (Korean Harvest Festival)',
      startStr: addDays(chuseok, -2),
      endStr: addDays(chuseok, 3),
      affectedRegions: ['South Korea'],
      avoidRegionKeys: ['korea'],
      crowdLevel: 'high',
      note: "Korea's largest holiday. KTX bullet trains and domestic flights are fully booked. Seoul hotels spike in price. Popular nearby destinations (Japan, Southeast Asia) also see a surge of Korean tourists.",
    });
  }

  // ── Songkran (Thai New Year, Apr 13–15)
  events.push({
    id: 'songkran',
    name: 'Songkran (Thai New Year)',
    startStr: `${year}-04-10`,
    endStr: `${year}-04-17`,
    affectedRegions: ['Thailand'],
    avoidRegionKeys: ['thailand'],
    crowdLevel: 'high',
    note: "Thailand's beloved water festival draws huge domestic crowds to Bangkok and Chiang Mai. International visitors also peak during this window. Expect higher prices and chaotic traffic.",
  });

  // ── Diwali (Festival of Lights)
  const diwali = DIWALI_DATES[year];
  if (diwali) {
    events.push({
      id: 'diwali',
      name: 'Diwali (Festival of Lights)',
      startStr: addDays(diwali, -3),
      endStr: addDays(diwali, 4),
      affectedRegions: ['India'],
      avoidRegionKeys: ['india'],
      crowdLevel: 'high',
      note: "India's biggest festival. Domestic flights are fully booked weeks in advance. Hotels in major cities (Delhi, Mumbai, Jaipur, Varanasi) and temple towns see massive price surges.",
    });
  }

  // ── US Thanksgiving (4th Thursday of November)
  const thanksgiving = nthWeekday(year, 10, 4, 4); // Nov = month 10, Thu = weekday 4, 4th
  if (thanksgiving) {
    events.push({
      id: 'us-thanksgiving',
      name: 'US Thanksgiving',
      startStr: addDays(thanksgiving, -4),
      endStr: addDays(thanksgiving, 3),
      affectedRegions: ['United States'],
      avoidRegionKeys: ['usa', 'caribbean', 'mexico-beach'],
      crowdLevel: 'peak',
      note: "The busiest US travel week of the year. Domestic flights from major hubs are the most expensive 365 days a year. Beach destinations (Caribbean, Cancún) also spike. International routes from US hub airports are pricier.",
    });
  }

  // ── Christmas & New Year (global peak)
  events.push({
    id: 'christmas-new-year',
    name: 'Christmas & New Year',
    startStr: `${year}-12-20`,
    endStr: `${year}-12-31`,
    affectedRegions: ['Europe', 'Americas', 'Australia', 'Global'],
    avoidRegionKeys: ['europe', 'americas', 'usa', 'caribbean', 'australia', 'ski-resorts'],
    crowdLevel: 'peak',
    note: "Global travel peak. Ski resorts, tropical beach destinations, and major cities worldwide hit their highest prices. Airlines and hotels charge 60–200% premiums. Book 4–6 months ahead or expect to pay a lot.",
  });

  // ── European Summer Holiday Season (Jul–Aug)
  events.push({
    id: 'european-summer',
    name: 'European Summer Holiday Season',
    startStr: `${year}-07-01`,
    endStr: `${year}-08-31`,
    affectedRegions: ['Southern Europe', 'Mediterranean'],
    avoidRegionKeys: ['southern-europe', 'mediterranean', 'italy', 'spain', 'greece', 'croatia', 'turkey'],
    crowdLevel: 'peak',
    note: "Peak tourist season in the Mediterranean. Flights to Spain, Italy, Greece, Croatia, and Turkey are at their most expensive and beaches are packed. Northern Europe, Japan (post-Obon), and Southeast Asia offer much better value.",
  });

  // ── US Spring Break (school holiday travel window)
  events.push({
    id: 'us-spring-break',
    name: 'US Spring Break',
    startStr: `${year}-03-08`,
    endStr: `${year}-04-07`,
    affectedRegions: ['Caribbean', 'Mexico (beach)'],
    avoidRegionKeys: ['caribbean', 'mexico-beach'],
    crowdLevel: 'moderate',
    note: "American students flood beach destinations. Cancún, Cabo, Jamaica, the Bahamas, and Florida beaches are priciest during this 4-week window. East Asia, Europe, and South America see no impact.",
  });

  return events;
}

// ─── Overlap computation ─────────────────────────────────────────────────────
function overlapDays(aStart: string, aEnd: string, bStart: string, bEnd: string): number {
  const start = aStart > bStart ? aStart : bStart;
  const end = aEnd < bEnd ? aEnd : bEnd;
  if (start > end) return 0;
  const ms = new Date(end + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

// ─── Public API ──────────────────────────────────────────────────────────────
export interface WindowCrowdResult {
  crowdInsights: CrowdInsight[];
  travelValueScore: number;    // 0 = terrible, 100 = excellent for travel value
  pricePressure: 'low' | 'moderate' | 'high' | 'peak';
  avoidRegionKeys: string[];   // union of all avoid keys from overlapping events
}

export function analyzeWindowCrowding(
  startStr: string,
  endStr: string,
  year: number
): WindowCrowdResult {
  // Also check next year's events in case of late-December windows
  const events = [
    ...getCrowdEventsForYear(year),
    ...(year < 2032 ? getCrowdEventsForYear(year + 1) : []),
  ];

  const insights: CrowdInsight[] = [];
  let score = 100;
  const allAvoidKeys = new Set<string>();

  for (const ev of events) {
    const overlap = overlapDays(startStr, endStr, ev.startStr, ev.endStr);
    if (overlap <= 0) continue;

    insights.push({
      eventName: ev.name,
      crowdLevel: ev.crowdLevel,
      affectedRegions: ev.affectedRegions,
      avoidRegionKeys: ev.avoidRegionKeys,
      note: ev.note,
      overlapDays: overlap,
    });

    ev.avoidRegionKeys.forEach((k) => allAvoidKeys.add(k));

    // Score penalty weighted by crowd level and overlap length
    const overlapWeight = Math.min(overlap / 7, 1); // saturates at 1 week of overlap
    if (ev.crowdLevel === 'peak') score -= Math.round(overlapWeight * 35);
    else if (ev.crowdLevel === 'high') score -= Math.round(overlapWeight * 20);
    else score -= Math.round(overlapWeight * 10);
  }

  score = Math.max(0, score);

  const pricePressure: WindowCrowdResult['pricePressure'] =
    score >= 75 ? 'low' : score >= 50 ? 'moderate' : score >= 25 ? 'high' : 'peak';

  return {
    crowdInsights: insights,
    travelValueScore: score,
    pricePressure,
    avoidRegionKeys: [...allAvoidKeys],
  };
}
