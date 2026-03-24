/**
 * Destination suggestions engine.
 * Given a vacation window's dates, home country, and crowd analysis,
 * returns destination region ideas ranked by travel value.
 */

import { CrowdInsight, DestinationIdea } from './types';

interface DestinationTemplate {
  key: string;
  region: string;
  flag: string;
  examples: string[];
  // Months where this destination is genuinely great value (1=Jan, 12=Dec)
  greatMonths: number[];
  // Months that are inherently expensive regardless of crowd events
  peakMonths: number[];
  // Region keys from crowd events that make this destination worse
  affectedByEventKeys: string[];
  // Notes keyed by season: built into dynamic reason strings
  greatNote: string;
  peakNote: string;
  neutralNote: string;
  // Which home countries have easy/cheap access to this destination
  accessibleFrom: ('US' | 'KR' | 'both')[];
  // Average high temperature in °C by month (index 0=Jan, 11=Dec)
  avgHighC: number[];
  // Rough daily budget in USD (mid-range: decent hotel + food + transport)
  dailyBudgetUSD: number;
}

const DESTINATIONS: DestinationTemplate[] = [
  {
    key: 'western-europe',
    region: 'Western Europe',
    flag: '🇪🇺',
    examples: ['Lisbon', 'Barcelona', 'Amsterdam', 'Vienna'],
    greatMonths: [3, 4, 5, 9, 10, 11],          // Apr–Jun, Oct–Dec (shoulder/off-peak)
    peakMonths: [7, 8, 12],                       // Jul–Aug (summer), Dec (Xmas)
    affectedByEventKeys: ['europe', 'southern-europe', 'mediterranean'],
    greatNote: 'Shoulder season — fewer crowds, lower airfare, and hotel rates 30–50% below summer highs.',
    peakNote: 'Summer peak — Mediterranean beaches and city breaks are at their most expensive.',
    neutralNote: 'Reasonable value; some popular spots may be crowded but alternatives abound.',
    accessibleFrom: ['both'],
    avgHighC: [7, 9, 13, 16, 20, 25, 28, 27, 23, 17, 11, 8],
    dailyBudgetUSD: 150,
  },
  {
    key: 'eastern-europe',
    region: 'Eastern Europe',
    flag: '🏰',
    examples: ['Prague', 'Budapest', 'Kraków', 'Tallinn'],
    greatMonths: [3, 4, 5, 6, 9, 10],
    peakMonths: [7, 8, 12],
    affectedByEventKeys: ['europe'],
    greatNote: 'Spring or autumn shoulder season — stunning architecture, great food, and fraction of Western European prices.',
    peakNote: 'Summer sees strong tourist flow to Prague and Budapest, though still cheaper than the West.',
    neutralNote: 'Good value year-round compared to Western Europe; mild weather in spring and fall.',
    accessibleFrom: ['both'],
    avgHighC: [2, 4, 10, 16, 21, 25, 27, 27, 22, 15, 8, 3],
    dailyBudgetUSD: 80,
  },
  {
    key: 'japan',
    region: 'Japan',
    flag: '🇯🇵',
    examples: ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima'],
    greatMonths: [2, 5, 6, 9, 10, 11],           // Mar (early cherry), Jun, Sep–Nov (fall foliage)
    peakMonths: [4, 8],                            // Golden Week peak, Obon peak
    affectedByEventKeys: ['japan', 'east-asia'],
    greatNote: 'Shoulder season with comfortable weather and hotel rates 20–40% below Golden Week peaks.',
    peakNote: 'Golden Week or Obon — fully booked and prices spike. Book 3–4 months ahead if needed.',
    neutralNote: 'Off-peak months offer excellent value; Japan rewards timing your visit carefully.',
    accessibleFrom: ['both'],
    avgHighC: [10, 10, 14, 19, 24, 26, 30, 31, 27, 22, 17, 12],
    dailyBudgetUSD: 130,
  },
  {
    key: 'southeast-asia',
    region: 'Southeast Asia',
    flag: '🌴',
    examples: ['Bali', 'Chiang Mai', 'Da Nang', 'Kuala Lumpur'],
    greatMonths: [11, 12, 1, 2, 3],              // Nov–Mar: cool-dry season
    peakMonths: [7, 8],                            // Western summer tourist peak
    affectedByEventKeys: ['east-asia', 'southeast-asia', 'thailand', 'vietnam', 'singapore'],
    greatNote: 'Cool-dry season — the best time to visit with pleasant weather and manageable crowds.',
    peakNote: 'Western summer or Lunar New Year surge. Popular islands and beach towns are at capacity.',
    neutralNote: 'Year-round destination; check the monsoon calendar for your specific country.',
    accessibleFrom: ['both'],
    avgHighC: [32, 33, 34, 35, 34, 33, 33, 33, 32, 32, 31, 31],
    dailyBudgetUSD: 60,
  },
  {
    key: 'south-korea',
    region: 'South Korea',
    flag: '🇰🇷',
    examples: ['Seoul', 'Busan', 'Jeju Island', 'Gyeongju'],
    greatMonths: [3, 4, 5, 9, 10],               // Cherry blossom + fall foliage
    peakMonths: [1, 2, 10],                        // Seollal, Chuseok
    affectedByEventKeys: ['korea', 'east-asia'],
    greatNote: 'Cherry blossom spring or autumn foliage — stunning visuals and good hotel availability.',
    peakNote: 'Seollal (Lunar New Year) or Chuseok — domestic travel surges and hotels fill up fast.',
    neutralNote: 'Compact and very well-connected; shoulder months offer great value.',
    accessibleFrom: ['both'],
    avgHighC: [-1, 3, 9, 17, 23, 27, 29, 30, 26, 19, 11, 2],
    dailyBudgetUSD: 100,
  },
  {
    key: 'south-asia',
    region: 'South Asia (India / Sri Lanka)',
    flag: '🇮🇳',
    examples: ['Goa', 'Jaipur', 'Colombo', 'Kathmandu'],
    greatMonths: [11, 12, 1, 2, 3],              // Cool-dry November–March
    peakMonths: [10, 11],                          // Diwali surge
    affectedByEventKeys: ['india'],
    greatNote: 'Cool-dry season — ideal weather, manageable crowds, and cheaper rates outside Diwali.',
    peakNote: 'Diwali brings a surge in domestic Indian travel; hotels in major cities fill fast.',
    neutralNote: 'Monsoon season (Jun–Sep) means lower prices but heavy rain in most areas.',
    accessibleFrom: ['both'],
    avgHighC: [25, 28, 33, 37, 39, 36, 33, 32, 33, 33, 29, 26],
    dailyBudgetUSD: 50,
  },
  {
    key: 'middle-east',
    region: 'Middle East',
    flag: '🌙',
    examples: ['Dubai', 'Abu Dhabi', 'Muscat', 'Amman'],
    greatMonths: [11, 12, 1, 2, 3, 4],           // Cool Oct–Apr
    peakMonths: [12],                              // Christmas/New Year at Dubai
    affectedByEventKeys: ['east-asia'],            // Chinese Golden Week sends crowds to Dubai
    greatNote: 'Winter months are genuinely pleasant — warm, dry, and far less crowded than summer. Excellent hotel value in Abu Dhabi and Muscat.',
    peakNote: "Dubai hosts a major New Year's event — prices skyrocket in late December.",
    neutralNote: 'Summer is extremely hot (45°C+) but hotels are very cheap; Oman and Jordan are year-round options.',
    accessibleFrom: ['both'],
    avgHighC: [24, 25, 28, 33, 38, 41, 42, 42, 39, 35, 30, 26],
    dailyBudgetUSD: 140,
  },
  {
    key: 'central-america',
    region: 'Central America',
    flag: '🌿',
    examples: ['Costa Rica', 'Panama City', 'Antigua (Guatemala)', 'Belize'],
    greatMonths: [12, 1, 2, 3, 4],               // Dec–Apr: dry season
    peakMonths: [],
    affectedByEventKeys: ['usa', 'americas'],
    greatNote: 'Dry season — lush wildlife, volcano hikes, and beach weather at a fraction of Caribbean prices.',
    peakNote: '',
    neutralNote: 'Rainy season (May–Nov) is green and beautiful; major tourist spots stay open year-round.',
    accessibleFrom: ['US'],
    avgHighC: [24, 25, 26, 27, 27, 26, 26, 26, 26, 25, 25, 24],
    dailyBudgetUSD: 70,
  },
  {
    key: 'mexico-city',
    region: 'Mexico (cities & culture)',
    flag: '🇲🇽',
    examples: ['Mexico City', 'Oaxaca', 'Mérida', 'San Miguel de Allende'],
    greatMonths: [1, 2, 3, 10, 11],
    peakMonths: [12],
    affectedByEventKeys: ['mexico-beach', 'usa'],
    greatNote: 'Off-peak for city and cultural travel — far less crowded than coastal resorts, with excellent food and history.',
    peakNote: 'December brings strong US tourist demand across Mexico.',
    neutralNote: 'Inland Mexico cities are a year-round gem with mild highland climates.',
    accessibleFrom: ['US'],
    avgHighC: [22, 24, 26, 27, 26, 24, 23, 23, 23, 22, 22, 21],
    dailyBudgetUSD: 75,
  },
  {
    key: 'south-america',
    region: 'South America',
    flag: '🌎',
    examples: ['Buenos Aires', 'Medellín', 'Lima', 'Santiago'],
    greatMonths: [10, 11, 12, 1, 2, 3],          // Southern hemisphere summer / northern hemisphere fall
    peakMonths: [],
    affectedByEventKeys: ['americas'],
    greatNote: 'Southern hemisphere summer (Dec–Mar) is peak season in Patagonia and the Andes — but budget-friendly year-round.',
    peakNote: '',
    neutralNote: 'Shoulder months April–August offer very competitive pricing and uncrowded cities.',
    accessibleFrom: ['US'],
    avgHighC: [30, 29, 26, 22, 18, 14, 15, 16, 18, 22, 25, 28],
    dailyBudgetUSD: 70,
  },
  {
    key: 'australia-nz',
    region: 'Australia & New Zealand',
    flag: '🦘',
    examples: ['Sydney', 'Melbourne', 'Queenstown', 'Cairns'],
    greatMonths: [4, 5, 6, 9, 10],               // Autumn and spring in Southern hemisphere
    peakMonths: [12, 1],                           // Southern summer / Christmas
    affectedByEventKeys: ['australia'],
    greatNote: 'Autumn or spring shoulder season — fewer tourists, lower prices, and comfortable weather.',
    peakNote: 'Southern summer (Dec–Jan) is peak for Australians and heavy with Christmas travellers.',
    neutralNote: 'Long-haul but a true bucket-list destination; shoulder season is well worth the flight.',
    accessibleFrom: ['US'],
    avgHighC: [26, 26, 25, 22, 19, 17, 16, 18, 20, 22, 24, 25],
    dailyBudgetUSD: 160,
  },
  {
    key: 'northern-europe',
    region: 'Scandinavia & Baltics',
    flag: '🇸🇪',
    examples: ['Copenhagen', 'Stockholm', 'Reykjavík', 'Tallinn'],
    greatMonths: [5, 6, 7, 8, 12],               // Summer (long days) + Christmas markets
    peakMonths: [7, 8],                            // Peak summer
    affectedByEventKeys: ['europe'],
    greatNote: 'Long summer days and shoulder pricing — ideal for outdoor adventures and coastal towns.',
    peakNote: 'July–August is expensive but the days are almost endless; trade off crowds for 20-hour daylight.',
    neutralNote: 'Winter darkness is dramatic; Northern Lights (Sep–Mar in Reykjavík) are a draw.',
    accessibleFrom: ['both'],
    avgHighC: [-1, 0, 4, 10, 16, 21, 23, 22, 17, 10, 5, 1],
    dailyBudgetUSD: 180,
  },
  {
    key: 'africa',
    region: 'East & Southern Africa',
    flag: '🦁',
    examples: ['Cape Town', 'Nairobi', 'Zanzibar', 'Victoria Falls'],
    greatMonths: [6, 7, 8, 9, 10],               // Dry season safari months
    peakMonths: [12, 1],
    affectedByEventKeys: [],
    greatNote: 'Dry season (Jun–Oct) is optimal for game viewing in East Africa and perfect Cape Town weather.',
    peakNote: 'December–January brings school holiday crowds to Cape Town.',
    neutralNote: 'Green season (Nov–May) means lower lodge prices and fewer vehicles on safari; ideal for photographers.',
    accessibleFrom: ['both'],
    avgHighC: [27, 28, 27, 25, 23, 20, 20, 21, 23, 25, 25, 26],
    dailyBudgetUSD: 90,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dominantMonths(startStr: string, endStr: string): number[] {
  // Returns the 1-based month numbers that are most represented in the window
  const months = new Set<number>();
  const s = new Date(startStr + 'T00:00:00');
  const e = new Date(endStr + 'T00:00:00');
  const cur = new Date(s);
  while (cur <= e) {
    months.add(cur.getMonth() + 1);
    cur.setDate(cur.getDate() + 1);
  }
  return [...months];
}

function priceOutlook(score: number): DestinationIdea['priceOutlook'] {
  if (score >= 70) return 'great';
  if (score >= 50) return 'good';
  if (score >= 30) return 'fair';
  return 'pricey';
}

// ─── Public API ──────────────────────────────────────────────────────────────
export function getDestinationSuggestions(
  startStr: string,
  endStr: string,
  homeCountry: 'US' | 'KR',
  crowdInsights: CrowdInsight[]
): DestinationIdea[] {
  const months = dominantMonths(startStr, endStr);
  const allAvoidKeys = new Set(crowdInsights.flatMap((ci) => ci.avoidRegionKeys));

  const scored = DESTINATIONS.map((dest) => {
    // Exclude destinations the user is already in
    if (homeCountry === 'US' && dest.key === 'mexico-city') {
      // Still show for US users — cross-border trip
    }
    if (homeCountry === 'KR' && dest.key === 'south-korea') {
      return null; // No point suggesting home country
    }

    // Seasonal base score
    const inGreat = months.some((m) => dest.greatMonths.includes(m));
    const inPeak = months.some((m) => dest.peakMonths.includes(m));
    let score = inGreat ? 80 : inPeak ? 40 : 60;

    // Crowd event penalties
    let crowdPenalty = 0;
    for (const key of dest.affectedByEventKeys) {
      if (allAvoidKeys.has(key)) {
        // Find the matching insight to get crowd level
        const insight = crowdInsights.find((ci) => ci.avoidRegionKeys.includes(key));
        if (insight) {
          crowdPenalty += insight.crowdLevel === 'peak' ? 30 : insight.crowdLevel === 'high' ? 20 : 10;
        }
      }
    }
    score = Math.max(0, score - crowdPenalty);

    // Accessibility bonus for home country
    if (dest.accessibleFrom.includes(homeCountry) || dest.accessibleFrom.includes('both')) {
      score += 5;
    } else if (!dest.accessibleFrom.includes('both')) {
      score -= 10; // Less accessible from this country
    }

    // Build reason string
    let reason: string;
    const effectiveCrowdEvent = crowdInsights.find((ci) =>
      ci.avoidRegionKeys.some((k) => dest.affectedByEventKeys.includes(k))
    );

    if (effectiveCrowdEvent && crowdPenalty > 0) {
      reason = `Crowded: ${effectiveCrowdEvent.eventName} affects this region. ${
        score >= 50 ? dest.neutralNote : dest.peakNote || dest.neutralNote
      }`;
    } else if (inGreat) {
      reason = dest.greatNote;
    } else if (inPeak) {
      reason = dest.peakNote || dest.neutralNote;
    } else {
      reason = dest.neutralNote;
    }

    // Compute average temp for the window months
    const avgTemp = months.length > 0
      ? Math.round(months.reduce((sum, m) => sum + dest.avgHighC[m - 1], 0) / months.length)
      : undefined;

    return {
      dest,
      score,
      idea: {
        region: dest.region,
        flag: dest.flag,
        exampleCities: dest.examples.slice(0, 3),
        priceOutlook: priceOutlook(score),
        reason,
        avgTempC: avgTemp,
        dailyBudgetUSD: dest.dailyBudgetUSD,
      } as DestinationIdea,
    };
  }).filter(Boolean) as { dest: DestinationTemplate; score: number; idea: DestinationIdea }[];

  // Sort by score descending, take top 5
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 5).map((s) => s.idea);
}
