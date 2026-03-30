/**
 * Off-Peak Windows — computes month-by-month "sweet spot" scores for each
 * destination from a Korean traveler's perspective.
 *
 * Three scoring layers:
 *   1. Weather/season quality at the destination (35%)
 *   2. Korean outbound travel crowd avoidance (35%)
 *   3. Destination-local holiday crowd avoidance (30%)
 */

import { getCrowdEventsForYear } from './crowd-calendar';

// ─── Korean Peak Outbound Travel Periods ────────────────────────────────────
// These are the times when Korean travelers flood outbound routes en masse.
// Encoded as month-level intensities for the scoring algorithm.

interface KoreanPeakPeriod {
  id: string;
  name: string;
  nameKo: string;
  months: number[];            // 1-based months affected
  intensity: 'extreme' | 'high' | 'moderate';
  // Which destination keys are most affected by Korean tourist surges
  heavilyAffected: string[];
}

const KOREAN_PEAK_PERIODS: KoreanPeakPeriod[] = [
  {
    id: 'seollal',
    name: 'Seollal (Lunar New Year)',
    nameKo: '설날 연휴',
    months: [2],
    intensity: 'extreme',
    heavilyAffected: ['japan', 'southeast-asia', 'south-asia'],
  },
  {
    id: 'may-golden-week',
    name: 'May Golden Week',
    nameKo: '5월 황금연휴',
    months: [5],
    intensity: 'high',
    heavilyAffected: ['japan', 'southeast-asia'],
  },
  {
    id: 'summer-holidays',
    name: 'Summer Holidays',
    nameKo: '여름 휴가철',
    months: [7, 8],
    intensity: 'high',
    heavilyAffected: ['japan', 'southeast-asia', 'western-europe', 'eastern-europe', 'northern-europe'],
  },
  {
    id: 'chuseok',
    name: 'Chuseok',
    nameKo: '추석 연휴',
    months: [9, 10],  // Chuseok falls in Sep or Oct depending on the lunar calendar
    intensity: 'high',
    heavilyAffected: ['japan', 'southeast-asia'],
  },
  {
    id: 'christmas-new-year',
    name: 'Christmas & New Year',
    nameKo: '크리스마스·연말',
    months: [12, 1],
    intensity: 'high',
    heavilyAffected: ['japan', 'southeast-asia', 'western-europe', 'australia-nz'],
  },
];

// ─── Destination Data ───────────────────────────────────────────────────────
// Inline destination profiles for the 6 key destinations Korean travelers visit.
// This mirrors data from destinations.ts but adds Korea-specific context.

interface DestinationProfile {
  key: string;
  region: string;
  flag: string;
  exampleCities: string[];
  greatMonths: number[];
  peakMonths: number[];
  avgHighC: number[];
  dailyBudgetUSD: number;
  // Region keys from crowd-calendar events that affect this destination
  crowdEventKeys: string[];
}

const DESTINATIONS: DestinationProfile[] = [
  {
    key: 'japan',
    region: 'Japan',
    flag: '🇯🇵',
    exampleCities: ['Tokyo', 'Osaka', 'Kyoto', 'Fukuoka'],
    greatMonths: [2, 5, 6, 9, 10, 11],
    peakMonths: [4, 8],
    avgHighC: [10, 10, 14, 19, 24, 26, 30, 31, 27, 22, 17, 12],
    dailyBudgetUSD: 130,
    crowdEventKeys: ['japan', 'east-asia'],
  },
  {
    key: 'thailand',
    region: 'Thailand',
    flag: '🇹🇭',
    exampleCities: ['Bangkok', 'Chiang Mai', 'Phuket', 'Koh Samui'],
    greatMonths: [11, 12, 1, 2, 3],
    peakMonths: [4, 7, 8],
    avgHighC: [32, 33, 35, 36, 35, 33, 33, 32, 32, 32, 31, 31],
    dailyBudgetUSD: 55,
    crowdEventKeys: ['southeast-asia', 'thailand'],
  },
  {
    key: 'vietnam',
    region: 'Vietnam',
    flag: '🇻🇳',
    exampleCities: ['Da Nang', 'Ho Chi Minh', 'Hanoi', 'Hoi An'],
    greatMonths: [2, 3, 4, 11, 12],
    peakMonths: [7, 8],
    avgHighC: [25, 27, 30, 33, 34, 34, 34, 33, 32, 29, 27, 25],
    dailyBudgetUSD: 45,
    crowdEventKeys: ['southeast-asia', 'vietnam'],
  },
  {
    key: 'bali',
    region: 'Bali, Indonesia',
    flag: '🇮🇩',
    exampleCities: ['Ubud', 'Seminyak', 'Canggu', 'Nusa Dua'],
    greatMonths: [4, 5, 6, 9, 10],
    peakMonths: [7, 8, 12],
    avgHighC: [30, 30, 30, 30, 29, 28, 27, 28, 28, 29, 30, 30],
    dailyBudgetUSD: 60,
    crowdEventKeys: ['southeast-asia'],
  },
  {
    key: 'taiwan',
    region: 'Taiwan',
    flag: '🇹🇼',
    exampleCities: ['Taipei', 'Taichung', 'Tainan', 'Hualien'],
    greatMonths: [3, 4, 10, 11],
    peakMonths: [1, 2, 7, 8],
    avgHighC: [19, 19, 22, 26, 29, 32, 34, 33, 31, 27, 24, 20],
    dailyBudgetUSD: 70,
    crowdEventKeys: ['east-asia'],
  },
  {
    key: 'europe-med',
    region: 'Europe (Mediterranean)',
    flag: '🇪🇺',
    exampleCities: ['Barcelona', 'Lisbon', 'Rome', 'Dubrovnik'],
    greatMonths: [3, 4, 5, 9, 10, 11],
    peakMonths: [7, 8, 12],
    avgHighC: [12, 14, 18, 21, 25, 29, 32, 31, 27, 21, 15, 12],
    dailyBudgetUSD: 150,
    crowdEventKeys: ['europe', 'southern-europe', 'mediterranean', 'spain', 'italy', 'greece', 'croatia'],
  },
];

// ─── Scoring ────────────────────────────────────────────────────────────────

export interface MonthScore {
  month: number;
  weatherScore: number;
  koreanCrowdScore: number;
  localCrowdScore: number;
  compositeScore: number;
  label: 'sweet-spot' | 'good' | 'neutral' | 'avoid';
  avgTempC: number;
  reasons: string[];
  reasonsKo: string[];
}

export interface DestinationOffPeakProfile {
  destinationKey: string;
  region: string;
  flag: string;
  exampleCities: string[];
  dailyBudgetUSD: number;
  months: MonthScore[];
  bestMonths: number[];
  worstMonths: number[];
  summaryEn: string;
  summaryKo: string;
}

function scoreWeather(dest: DestinationProfile, month: number): { score: number; reasons: string[]; reasonsKo: string[] } {
  const reasons: string[] = [];
  const reasonsKo: string[] = [];

  if (dest.greatMonths.includes(month)) {
    reasons.push('Great weather and shoulder-season pricing');
    reasonsKo.push('좋은 날씨 + 비수기 가격');
    return { score: 90, reasons, reasonsKo };
  }
  if (dest.peakMonths.includes(month)) {
    reasons.push('Peak season — good weather but high demand');
    reasonsKo.push('성수기 — 날씨는 좋지만 수요가 높음');
    return { score: 55, reasons, reasonsKo };
  }

  // Neutral — check temperature for comfort
  const temp = dest.avgHighC[month - 1];
  if (temp >= 15 && temp <= 30) {
    reasons.push('Moderate weather, off-peak pricing');
    reasonsKo.push('적당한 날씨, 비수기 가격');
    return { score: 60, reasons, reasonsKo };
  }
  reasons.push('Off-season — lower prices but weather may be less ideal');
  reasonsKo.push('비수기 — 저렴하지만 날씨가 아쉬울 수 있음');
  return { score: 45, reasons, reasonsKo };
}

function scoreKoreanCrowd(dest: DestinationProfile, month: number): { score: number; reasons: string[]; reasonsKo: string[] } {
  let score = 100;
  const reasons: string[] = [];
  const reasonsKo: string[] = [];

  for (const period of KOREAN_PEAK_PERIODS) {
    if (!period.months.includes(month)) continue;

    const isHeavilyAffected = period.heavilyAffected.includes(dest.key);
    const penaltyMultiplier = isHeavilyAffected ? 1.0 : 0.4;

    let basePenalty: number;
    if (period.intensity === 'extreme') basePenalty = 55;
    else if (period.intensity === 'high') basePenalty = 40;
    else basePenalty = 20;

    const penalty = Math.round(basePenalty * penaltyMultiplier);
    score -= penalty;

    if (isHeavilyAffected) {
      reasons.push(`${period.name} — heavy Korean tourist surge`);
      reasonsKo.push(`${period.nameKo} — 한국인 여행객 대거 몰림`);
    } else {
      reasons.push(`${period.name} — some Korean travelers present`);
      reasonsKo.push(`${period.nameKo} — 일부 한국인 여행객`);
    }
  }

  if (score === 100) {
    reasons.push('No major Korean travel peak — fewer Korean tourists');
    reasonsKo.push('한국 연휴 비수기 — 한국인 여행객 적음');
  }

  return { score: Math.max(0, score), reasons, reasonsKo };
}

function scoreLocalCrowd(dest: DestinationProfile, month: number, year: number): { score: number; reasons: string[]; reasonsKo: string[] } {
  let score = 100;
  const reasons: string[] = [];
  const reasonsKo: string[] = [];

  // Check crowd events for both the given year and next year (for Dec → Jan overlap)
  const events = [
    ...getCrowdEventsForYear(year),
    ...(year < 2032 ? getCrowdEventsForYear(year + 1) : []),
  ];

  // Determine the month's date range for overlap checking
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  for (const ev of events) {
    // Check if event affects this destination
    const affectsThis = ev.avoidRegionKeys.some((k: string) => dest.crowdEventKeys.includes(k));
    if (!affectsThis) continue;

    // Check date overlap with this month
    const overlapStart = monthStart > ev.startStr ? monthStart : ev.startStr;
    const overlapEnd = monthEnd < ev.endStr ? monthEnd : ev.endStr;
    if (overlapStart > overlapEnd) continue;

    const overlapMs = new Date(overlapEnd + 'T00:00:00').getTime() - new Date(overlapStart + 'T00:00:00').getTime();
    const overlapDays = Math.floor(overlapMs / 86_400_000) + 1;
    const overlapWeight = Math.min(overlapDays / 10, 1);

    let penalty: number;
    if (ev.crowdLevel === 'peak') penalty = Math.round(45 * overlapWeight);
    else if (ev.crowdLevel === 'high') penalty = Math.round(30 * overlapWeight);
    else penalty = Math.round(15 * overlapWeight);

    score -= penalty;
    reasons.push(`${ev.name} — local crowds and price spikes`);
    reasonsKo.push(`${ev.name} — 현지 혼잡 및 가격 상승`);
  }

  if (score === 100) {
    reasons.push('No major local holidays — normal prices and crowds');
    reasonsKo.push('현지 공휴일 없음 — 정상 가격');
  }

  return { score: Math.max(0, score), reasons, reasonsKo };
}

function assignLabel(score: number): MonthScore['label'] {
  if (score >= 72) return 'sweet-spot';
  if (score >= 55) return 'good';
  if (score >= 38) return 'neutral';
  return 'avoid';
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function getOffPeakProfile(destinationKey: string, year: number): DestinationOffPeakProfile | null {
  const dest = DESTINATIONS.find((d) => d.key === destinationKey);
  if (!dest) return null;

  const months: MonthScore[] = [];

  for (let m = 1; m <= 12; m++) {
    const weather = scoreWeather(dest, m);
    const korean = scoreKoreanCrowd(dest, m);
    const local = scoreLocalCrowd(dest, m, year);

    const composite = Math.round(
      weather.score * 0.35 +
      korean.score * 0.35 +
      local.score * 0.30
    );

    // Deduplicate and merge reasons (top 2 most relevant)
    const allReasons = [...weather.reasons, ...korean.reasons.slice(0, 1), ...local.reasons.slice(0, 1)];
    const allReasonsKo = [...weather.reasonsKo, ...korean.reasonsKo.slice(0, 1), ...local.reasonsKo.slice(0, 1)];

    months.push({
      month: m,
      weatherScore: weather.score,
      koreanCrowdScore: korean.score,
      localCrowdScore: local.score,
      compositeScore: composite,
      label: assignLabel(composite),
      avgTempC: dest.avgHighC[m - 1],
      reasons: allReasons,
      reasonsKo: allReasonsKo,
    });
  }

  const bestMonths = months
    .filter((m) => m.label === 'sweet-spot')
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .map((m) => m.month);

  const worstMonths = months
    .filter((m) => m.label === 'avoid')
    .sort((a, b) => a.compositeScore - b.compositeScore)
    .map((m) => m.month);

  const bestNames = bestMonths.map((m) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]);
  const bestNamesKo = bestMonths.map((m) => `${m}월`);

  return {
    destinationKey: dest.key,
    region: dest.region,
    flag: dest.flag,
    exampleCities: dest.exampleCities,
    dailyBudgetUSD: dest.dailyBudgetUSD,
    months,
    bestMonths,
    worstMonths,
    summaryEn: bestMonths.length > 0
      ? `Best months: ${bestNames.join(', ')}. Avoid Korean holidays and local peak periods for 20–40% savings.`
      : `No standout sweet spots — plan around Korean holiday dates for the best value.`,
    summaryKo: bestMonths.length > 0
      ? `추천 시기: ${bestNamesKo.join(', ')}. 한국 연휴와 현지 성수기를 피하면 20~40% 절약 가능.`
      : `뚜렷한 비수기가 없음 — 한국 연휴 전후로 일정을 조정하세요.`,
  };
}

export function getOffPeakProfiles(year: number): DestinationOffPeakProfile[] {
  return DESTINATIONS
    .map((d) => getOffPeakProfile(d.key, year))
    .filter(Boolean) as DestinationOffPeakProfile[];
}
