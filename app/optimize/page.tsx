'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { WindowCard } from '@/components/WindowCard';
import { InteractiveCalendar } from '@/components/InteractiveCalendar';
import { HolidayPanel } from '@/components/HolidayPanel';
import { optimizePTO, buildCalendarBase, LockedWindow } from '@/lib/optimizer';
import { getBridgeSuggestions, BridgeOption } from '@/lib/bridge-suggestions';
import { US_STATES } from '@/lib/countries';
import { getStateHolidays } from '@/lib/state-holidays';
import { Holiday, DayData, LeavePool, OptimizationResult, FlightDeal } from '@/lib/types';
import { inferAirport } from '@/lib/airports';
import { computeLongWeekends, formatPreviewDate, LongWeekendPreview } from '@/lib/longWeekends';
import { TimelineBar } from '@/components/TimelineBar';
import { useToast } from '@/components/Toast';
import { downloadAllICS } from '@/lib/ics';
import { ShareCard } from '@/components/ShareCard';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2];

const t = {
  en: {
    hideSettings: 'Hide settings',
    showSettings: 'Show settings',
    used: 'used',
    daysOff: 'days off',
    windows: 'windows',
    remaining: 'remaining',
    leaveDays: 'leave days',
    manuallyAdded: 'manually added',
    lightMode: 'Switch to light mode',
    darkMode: 'Switch to dark mode',
    sharePlanLink: 'Share plan link',
    share: 'Share',
    printPlan: 'Print plan',
    print: 'Print',
    langToggle: 'KO',
    welcomeTitle: 'Welcome to Leavewise',
    welcomeBody: 'Start by setting your country, year, and PTO days — everything else is optional.',
    dismissWelcome: 'Dismiss welcome',
    planHeading: 'Plan your time off',
    planSubheading: "Fill in your details and we'll find the best windows.",
    resetAll: 'Reset all settings',
    reset: 'Reset',
    budget: 'Budget',
    preBooked: 'pre-booked',
    ptoSelected: 'PTO selected',
    selected: 'selected',
    remainingBadge: 'remaining',
    location: 'Location',
    countryUS: '🇺🇸 United States',
    countryKR: '🇰🇷 South Korea',
    homeAirport: 'Home airport',
    airportPlaceholder: 'e.g. ICN',
    airportHint: 'ICN for international · GMP for Japan / China routes',
    state: 'State',
    year: 'Year',
    leavePool: 'Your leave pool',
    ptoDays: 'PTO days',
    compDays: 'Comp days earned',
    compDaysSub: 'Days owed to you for overtime / working holidays',
    compDaysHelp: 'What are comp days?',
    compDaysHelpText: "Comp days are time off earned by working overtime, holidays, or weekends. If your employer doesn't offer these, leave it at 0.",
    floatingHolidays: 'Floating holidays',
    floatingHolidaysSub: 'Company-assigned flexible days',
    floatingHolidaysHelp: 'What are floating holidays?',
    floatingHolidaysHelpText: 'Floating holidays are extra days off that some companies give you to use on any date you choose (e.g., your birthday, a religious holiday). If unsure, leave at 0.',
    totalAvailable: 'Total available',
    day: 'day',
    days: 'days',
    daysToplan: 'Days to plan',
    allDaysWillBePlanned: 'All days will be planned · adjust to hold some back',
    dayHeldBack: 'day held back',
    daysHeldBack: 'days held back',
    companySetup: 'Company setup',
    set: 'set',
    companyName: 'Company name',
    optional: '(optional)',
    companyPlaceholder: 'e.g. Acme Corp',
    companyHolidays: 'Company holidays',
    companyHolidaysDesc: "Free days your company gives — shown in amber and won't cost any leave.",
    onePerLine: 'One per line · YYYY-MM-DD',
    alreadyPlanned: 'Already planned',
    alreadyPlannedDesc: 'Dates already committed — deducted from your budget.',
    maxTripLength: 'Max trip length',
    maxTripLengthSub: 'Max days in any single window',
    optimizeFor: 'Optimize for',
    ptoEfficiency: 'PTO efficiency',
    maxDaysOff: 'Max days off',
    balanced: 'Balanced',
    both: 'Both',
    travelValue: 'Travel value',
    cheapTravel: 'Cheap travel',
    advanced: 'Advanced',
    findingWindows: 'Finding windows…',
    optimizeMyLeave: 'Optimize my leave',
    settings: 'Settings',
    optimizedWindows: 'Optimized windows',
    sortBy: 'Sort by',
    date: 'Date',
    efficiency: 'Efficiency',
    length: 'Length',
    copyPlanClipboard: 'Copy plan summary to clipboard',
    copyPlan: 'Copy plan',
    exportAllCalendar: 'Export all windows to calendar',
    exportAll: 'Export all',
    pricesFrom: 'Prices from Kiwi.com · also search Trip.com & Booking.com',
    noWindowsFound: 'No windows found',
    noWindowsFoundDesc: 'Try increasing your leave pool, adjusting the max trip length, or selecting a different year.',
    daysOffLabel: 'Days off',
    leaveUsed: 'Leave used',
    windowsLabel: 'Windows',
    remainingLabel: 'Remaining',
    countryUSContext: 'United States · ',
    southKorea: 'South Korea',
    upcomingLongWeekends: 'Upcoming long weekends',
    alreadyFree: 'Already free',
    noPTONeeded: '· no PTO needed',
    addAFewDays: 'Add a few days',
    use1to3PTO: '· use 1–3 PTO to extend',
    hitOptimize: 'Hit Optimize my leave to find the best multi-day windows using your full PTO budget.',
    hitOptimizeHighlight: 'Optimize my leave',
    calendar: 'calendar',
    clickHolidayInstruction: 'Click a public holiday to see bridge suggestions, or click any workday to manually toggle PTO.',
    clickHolidayHighlight: 'public holiday',
    daysUnallocated: 'days',
    unallocated: 'unallocated',
    readyWhenYouAre: 'Ready when you are',
    fillInLocation: 'Fill in your location and leave pool — the calendar loads automatically.',
    bridgeSuggestionsFor: 'Bridge suggestions for',
    usPayInsights: 'US pay insights',
    usPayInsightsDesc: "Based on common US employment practices. Verify with your employer's policy.",
    holidayPayRisk: '⚠ Holiday pay risk',
    premiumPayOpportunity: '$ Premium pay opportunity',
    miniWeekAbbr: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    noPTONeededBadge: 'No PTO needed',
    ptoDaySingular: 'PTO day',
    ptoDayPlural: 'PTO days',
    daysTotal: 'days total',
    toBridge: 'to bridge',
    holidayLabel: 'Holiday',
    clickToRemovePTO: 'Click to remove PTO',
    clickToAddPTO: 'Click to add PTO',
    weekend: 'Weekend',
    ptoSelectedLabel: 'PTO selected',
    suggestedBridge: 'Suggested bridge',
    clickDashedDays: 'Click the dashed days to add PTO and bridge this window',
    dMax: 'd max',
  },
  ko: {
    hideSettings: '설정 숨기기',
    showSettings: '설정 보기',
    used: '사용',
    daysOff: '일 휴가',
    windows: '구간',
    remaining: '잔여',
    leaveDays: '연차',
    manuallyAdded: '수동 추가',
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
    sharePlanLink: '플랜 링크 공유',
    share: '공유',
    printPlan: '플랜 인쇄',
    print: '인쇄',
    langToggle: 'EN',
    welcomeTitle: 'Leavewise에 오신 것을 환영합니다',
    welcomeBody: '국가, 연도, 연차 일수를 입력하세요 — 나머지는 선택사항입니다.',
    dismissWelcome: '닫기',
    planHeading: '휴가 계획하기',
    planSubheading: '정보를 입력하면 최적의 휴가 구간을 찾아드립니다.',
    resetAll: '설정 초기화',
    reset: '초기화',
    budget: '예산',
    preBooked: '사전 예약',
    ptoSelected: '연차 선택',
    selected: '선택됨',
    remainingBadge: '잔여',
    location: '위치',
    countryUS: '🇺🇸 미국',
    countryKR: '🇰🇷 대한민국',
    homeAirport: '출발 공항',
    airportPlaceholder: '예: ICN',
    airportHint: '국제선: ICN · 일본/중국: GMP',
    state: '주(State)',
    year: '연도',
    leavePool: '연차 현황',
    ptoDays: '연차 일수',
    compDays: '보상 휴가',
    compDaysSub: '초과근무·공휴일 근무에 대한 보상 휴가',
    compDaysHelp: '보상 휴가란?',
    compDaysHelpText: '초과근무, 공휴일, 주말 근무 시 지급되는 대체 휴가입니다. 해당 없으면 0으로 두세요.',
    floatingHolidays: '자유 휴가',
    floatingHolidaysSub: '회사가 부여하는 자유 사용 휴가',
    floatingHolidaysHelp: '자유 휴가란?',
    floatingHolidaysHelpText: '생일, 종교 기념일 등 원하는 날짜에 사용하는 회사 지급 휴가입니다. 모르면 0으로 두세요.',
    totalAvailable: '총 가용 일수',
    day: '일',
    days: '일',
    daysToplan: '계획할 일수',
    allDaysWillBePlanned: '전체 연차를 계획합니다 · 일부 보류하려면 조절하세요',
    dayHeldBack: '일 보류',
    daysHeldBack: '일 보류',
    companySetup: '회사 설정',
    set: '설정됨',
    companyName: '회사 이름',
    optional: '(선택)',
    companyPlaceholder: '예: 삼성전자',
    companyHolidays: '회사 휴일',
    companyHolidaysDesc: '회사가 지정한 추가 휴일입니다 — 연차 차감 없이 사용 가능합니다.',
    onePerLine: '한 줄에 하나씩 · YYYY-MM-DD',
    alreadyPlanned: '사전 계획',
    alreadyPlannedDesc: '이미 확정된 날짜 — 연차에서 차감됩니다.',
    maxTripLength: '최대 여행 기간',
    maxTripLengthSub: '단일 구간 최대 일수',
    optimizeFor: '최적화 기준',
    ptoEfficiency: '연차 효율',
    maxDaysOff: '최대 휴가',
    balanced: '균형',
    both: '균형',
    travelValue: '여행 가성비',
    cheapTravel: '저렴한 항공',
    advanced: '고급 설정',
    findingWindows: '구간 탐색 중…',
    optimizeMyLeave: '휴가 최적화',
    settings: '설정',
    optimizedWindows: '최적화된 휴가 구간',
    sortBy: '정렬 기준',
    date: '날짜',
    efficiency: '효율',
    length: '기간',
    copyPlanClipboard: '플랜 요약 복사',
    copyPlan: '복사',
    exportAllCalendar: '전체 구간 캘린더 내보내기',
    exportAll: '전체 내보내기',
    pricesFrom: 'Kiwi.com 항공권 · Trip.com & Booking.com도 검색 가능',
    noWindowsFound: '구간을 찾지 못했습니다',
    noWindowsFoundDesc: '연차를 늘리거나, 최대 여행 기간을 조정하거나, 다른 연도를 선택해 보세요.',
    daysOffLabel: '휴가 일수',
    leaveUsed: '연차 사용',
    windowsLabel: '구간',
    remainingLabel: '잔여',
    countryUSContext: '미국 · ',
    southKorea: '대한민국',
    upcomingLongWeekends: '다가오는 긴 주말',
    alreadyFree: '이미 무료',
    noPTONeeded: '· 연차 불필요',
    addAFewDays: '연차 추가',
    use1to3PTO: '· 연차 1–3일로 연장',
    hitOptimize: "'휴가 최적화'를 눌러 최적의 다일 구간을 찾아보세요.",
    hitOptimizeHighlight: '휴가 최적화',
    calendar: '캘린더',
    clickHolidayInstruction: '공휴일을 클릭하면 징검다리 제안이, 평일을 클릭하면 연차를 수동으로 추가/제거할 수 있습니다.',
    clickHolidayHighlight: '공휴일',
    daysUnallocated: '일',
    unallocated: '미배정',
    readyWhenYouAre: '준비가 되면 시작하세요',
    fillInLocation: '위치와 연차를 입력하면 캘린더가 자동으로 로드됩니다.',
    bridgeSuggestionsFor: '징검다리 제안:',
    usPayInsights: 'US pay insights',
    usPayInsightsDesc: "Based on common US employment practices. Verify with your employer's policy.",
    holidayPayRisk: '⚠ 공휴일 급여 리스크',
    premiumPayOpportunity: '$ 추가 급여 기회',
    miniWeekAbbr: ['일', '월', '화', '수', '목', '금', '토'],
    dayNames: ['일', '월', '화', '수', '목', '금', '토'],
    noPTONeededBadge: '연차 불필요',
    ptoDaySingular: '연차',
    ptoDayPlural: '연차',
    daysTotal: '일 합계',
    toBridge: '브릿지',
    holidayLabel: '공휴일',
    clickToRemovePTO: '연차 제거',
    clickToAddPTO: '연차 추가',
    weekend: '주말',
    ptoSelectedLabel: '연차 선택',
    suggestedBridge: '징검다리 제안',
    clickDashedDays: '점선 날짜를 클릭해 연차를 추가하고 이 구간을 연결하세요',
    dMax: '일 최대',
  },
} as const;
type Locale = keyof typeof t;
type TranslationBundle = {
  [K in keyof typeof t['en']]: typeof t['en'][K] extends readonly string[] ? readonly string[] : string;
};

type CountryCode = 'US' | 'KR';

const COUNTRY_CURRENCY: Record<CountryCode, string> = {
  US: 'USD',
  KR: 'KRW',
};

interface FormState {
  country: CountryCode;
  usState: string;
  year: number;
  leavePool: LeavePool;
  daysToAllocate: number;
  maxDaysPerWindow: number;
  companyName: string;
  companyHolidaysRaw: string;
  prebookedRaw: string;
  homeAirport: string;
  airportManuallySet: boolean;
  travelValueWeight: 0 | 0.4 | 0.8;
}

function parseDates(raw: string): string[] {
  return raw
    .split(/[\n,;\s]+/)
    .map((s) => s.trim().slice(0, 10))
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
}

async function fetchHolidaysForSettings(
  year: number,
  country: CountryCode,
  usState: string
): Promise<Holiday[]> {
  const res = await fetch(`/api/holidays?year=${year}&country=${country}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to fetch holiday data');
  }
  let holidays: Holiday[] = await res.json();
  if (country === 'US') {
    holidays = holidays.filter(
      (h) =>
        h.global ||
        h.counties === null ||
        (Array.isArray(h.counties) && h.counties.includes(usState))
    );
    const stateHols = getStateHolidays(year, usState).map((sh) => ({
      date: sh.date,
      localName: sh.name,
      name: sh.name,
      countryCode: 'US',
      fixed: true,
      global: false,
      counties: [usState],
      types: ['Public'],
    }));
    holidays = [...holidays, ...stateHols];
  }
  return holidays;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold tracking-widest uppercase text-ink-muted/70 mb-3 flex items-center gap-2">
      <span className="flex-1 h-px bg-border" />
      {children}
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 60,
  sublabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  sublabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1">
        <div className="text-xs font-semibold text-ink-soft">{label}</div>
        {sublabel && <div className="text-[10px] text-ink-muted mt-0.5">{sublabel}</div>}
      </div>
      <div className="flex items-center gap-1.5" role="group" aria-label={label}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="w-8 h-8 rounded-lg border border-border bg-cream text-ink-muted hover:border-teal/40 hover:text-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-display font-semibold text-ink" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="w-8 h-8 rounded-lg border border-border bg-cream text-ink-muted hover:border-teal/40 hover:text-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
        >
          +
        </button>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 group"
      >
        <span className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-ink-muted/70 group-hover:text-ink-muted transition-colors flex items-center gap-1.5 shrink-0">
          {title}
          {!open && badge && (
            <span className="bg-teal/10 text-teal text-[9px] font-semibold px-1.5 py-0.5 rounded-full tracking-normal normal-case border border-teal/15">
              {badge}
            </span>
          )}
        </span>
        <span className="flex-1 h-px bg-border" />
        <svg
          className={`w-3 h-3 shrink-0 text-ink-muted/50 group-hover:text-ink-muted transition-all duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

// MINI_WEEK_ABBR and DAY_NAMES are now locale-aware — sourced from l.miniWeekAbbr / l.dayNames inside the component

function MiniWeekStrip({ lw, miniWeekAbbr }: { lw: LongWeekendPreview; miniWeekAbbr: readonly string[] }) {
  // Build the 7 days of the Sunday-anchored week containing the main holiday
  const holidayDate = new Date(lw.id + 'T00:00:00');
  const dow = holidayDate.getDay();
  const sunday = new Date(holidayDate);
  sunday.setDate(sunday.getDate() - dow);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return (
    <div className="flex gap-0.5 mt-3">
      {weekDays.map((dateStr, i) => {
        const isWeekend = i === 0 || i === 6;
        const isBridge = lw.bridgeDates.includes(dateStr);
        const isHoliday = dateStr === lw.id;
        const inWindow = dateStr >= lw.startStr && dateStr <= lw.endStr;

        let cell = 'bg-cream border border-border/60 text-ink-muted/40';
        if (inWindow) {
          if (isHoliday)       cell = 'bg-sage text-white';
          else if (isBridge)   cell = 'bg-coral text-white';
          else if (isWeekend)  cell = 'bg-stone-warm text-ink-muted';
          else                 cell = 'bg-coral-light border border-coral/20 text-ink';
        }

        return (
          <div
            key={dateStr}
            className={`flex-1 aspect-square flex items-center justify-center text-[8px] font-semibold rounded-sm ${cell}`}
          >
            {miniWeekAbbr[i]}
          </div>
        );
      })}
    </div>
  );
}

function LongWeekendCard({ lw, onClick, l }: { lw: LongWeekendPreview; onClick?: () => void; l: TranslationBundle }) {
  const isFree = lw.ptoCost === 0;
  const accentClass = isFree ? 'border-l-sage' : 'border-l-coral';
  const badgeClass = isFree ? 'bg-sage-light text-sage' : 'bg-coral-light text-coral';
  const badgeLabel = isFree ? l.noPTONeededBadge : `${lw.ptoCost} ${lw.ptoCost > 1 ? l.ptoDayPlural : l.ptoDaySingular}`;

  return (
    <div
      className={`bg-white rounded-2xl border border-border border-l-4 ${accentClass} p-4 cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onClick}
    >
      <div className="text-[10px] text-ink-muted font-medium truncate leading-snug">
        {lw.holidayNames.join(' · ')}
      </div>
      <div className="flex items-baseline gap-1.5 mt-1 mb-1">
        <span className="text-2xl font-display font-semibold text-ink">{lw.totalDays}</span>
        <span className="text-xs text-ink-muted">{l.daysOff}</span>
      </div>
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
        {badgeLabel}
      </span>
      <MiniWeekStrip lw={lw} miniWeekAbbr={l.miniWeekAbbr} />
      <div className="text-[10px] text-ink-muted mt-2">
        {formatPreviewDate(lw.startStr)} – {formatPreviewDate(lw.endStr)}
      </div>
    </div>
  );
}

/** Build the full range of dates for a long weekend preview, with some padding */
function buildLWDateRange(lw: LongWeekendPreview): string[] {
  const start = new Date(lw.startStr + 'T00:00:00');
  const end = new Date(lw.endStr + 'T00:00:00');
  // Pad to include surrounding context (extend to nearest Sun before and Sat after)
  const padStart = new Date(start);
  padStart.setDate(padStart.getDate() - padStart.getDay()); // back to Sunday
  const padEnd = new Date(end);
  padEnd.setDate(padEnd.getDate() + (6 - padEnd.getDay())); // forward to Saturday

  const dates: string[] = [];
  const cur = new Date(padStart);
  while (cur <= padEnd) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function ExpandedLongWeekendModal({
  lw,
  days,
  selectedPTO,
  onTogglePTO,
  onClose,
  l,
}: {
  lw: LongWeekendPreview;
  days: DayData[];
  selectedPTO: Set<string>;
  onTogglePTO: (dateStr: string) => void;
  onClose: () => void;
  l: TranslationBundle;
}) {
  const isFree = lw.ptoCost === 0;
  const dateRange = buildLWDateRange(lw);
  const dayMap = useMemo(() => {
    const m = new Map<string, DayData>();
    for (const d of days) m.set(d.dateStr, d);
    return m;
  }, [days]);

  // Count how many PTO days selected within this window's bridge dates
  const selectedInWindow = lw.bridgeDates.filter((d) => selectedPTO.has(d)).length;
  const totalPossibleOff =
    lw.totalDays - lw.ptoCost + selectedInWindow; // base free + any selected bridges

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-ink">
              {lw.holidayNames.join(' · ')}
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {formatPreviewDate(lw.startStr)} – {formatPreviewDate(lw.endStr)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink transition-colors p-1 -mr-1 -mt-1"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-display font-semibold text-ink">{lw.totalDays}</span>
            <span className="text-xs text-ink-muted">{l.daysTotal}</span>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full self-center ${
            isFree ? 'bg-sage-light text-sage' : 'bg-coral-light text-coral'
          }`}>
            {isFree ? l.noPTONeededBadge : `${lw.ptoCost} ${lw.ptoCost > 1 ? l.ptoDayPlural : l.ptoDaySingular} ${l.toBridge}`}
          </span>
        </div>

        {/* Day grid header */}
        <div className="grid grid-cols-7 gap-1">
          {l.dayNames.map((d, i) => (
            <div key={i} className="text-[10px] text-ink-muted font-medium text-center py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {dateRange.map((dateStr) => {
            const day = dayMap.get(dateStr);
            const d = new Date(dateStr + 'T00:00:00');
            const dayNum = d.getDate();
            const inWindow = dateStr >= lw.startStr && dateStr <= lw.endStr;
            const isHoliday = day?.isHoliday ?? false;
            const isWeekend = day?.isWeekend ?? (d.getDay() === 0 || d.getDay() === 6);
            const isCompanyHoliday = day?.isCompanyHoliday ?? false;
            const isBridge = lw.bridgeDates.includes(dateStr);
            const isPTOSelected = selectedPTO.has(dateStr);
            const isPrebooked = day?.isPrebooked ?? false;
            const isWorkday = !isWeekend && !isHoliday && !isCompanyHoliday && !isPrebooked;
            const canToggle = isWorkday && inWindow;

            // Cell styling
            let cellClass = 'text-ink-muted/30 bg-cream'; // outside window default
            if (inWindow) {
              if (isHoliday) {
                cellClass = 'bg-sage text-white';
              } else if (isCompanyHoliday) {
                cellClass = 'bg-sage/70 text-white';
              } else if (isPTOSelected) {
                cellClass = 'bg-coral text-white';
              } else if (isBridge && !isPTOSelected) {
                cellClass = 'bg-coral/20 border-2 border-dashed border-coral text-coral';
              } else if (isWeekend) {
                cellClass = 'bg-stone-warm text-ink-muted';
              } else {
                cellClass = 'bg-cream border border-border text-ink-muted';
              }
            } else if (isWeekend || isHoliday) {
              cellClass = 'text-ink-muted/20 bg-transparent';
            }

            return (
              <button
                key={dateStr}
                disabled={!canToggle}
                onClick={() => canToggle && onTogglePTO(dateStr)}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold
                  transition-all
                  ${cellClass}
                  ${canToggle ? 'cursor-pointer hover:ring-2 hover:ring-coral/40 active:scale-95' : 'cursor-default'}
                `}
                title={
                  isHoliday ? day?.holidayName ?? l.holidayLabel
                  : isPTOSelected ? l.clickToRemovePTO
                  : canToggle ? l.clickToAddPTO
                  : undefined
                }
              >
                <span>{dayNum}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-sage" />
            <span className="text-[10px] text-ink-muted">{l.holidayLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-stone-warm" />
            <span className="text-[10px] text-ink-muted">{l.weekend}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-coral" />
            <span className="text-[10px] text-ink-muted">{l.ptoSelectedLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-coral/20 border border-dashed border-coral" />
            <span className="text-[10px] text-ink-muted">{l.suggestedBridge}</span>
          </div>
        </div>

        {/* Tip */}
        {!isFree && selectedInWindow < lw.ptoCost && (
          <p className="text-[11px] text-ink-muted">
            {l.clickDashedDays}
          </p>
        )}
      </div>
    </div>
  );
}

const DEFAULT_FORM: FormState = {
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

// ── Persistence helpers ──
const STORAGE_KEY = 'leavewise_state_v1';

interface StoredState {
  version: 1;
  form: FormState;
  selectedPTO: string[];
  timestamp: number;
}

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

interface ShareableSnapshot {
  v: 1;
  c: string; s: string; y: number;
  lp: [number, number, number];
  da: number; mx: number;
  ch: string; pb: string;
  tw: number; ha: string;
}

function encodeShareURL(form: FormState): string {
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

function generatePlanSummary(
  result: OptimizationResult,
  form: FormState,
  stateName: string
): string {
  const country = form.country === 'US' ? `United States · ${stateName}` : 'South Korea';
  const lines: string[] = [
    `Leavewise PTO Plan — ${form.year}`,
    `${country} · ${result.totalLeaveUsed} PTO days`,
    '',
    `→ ${result.totalDaysOff} days off across ${result.windows.length} window${result.windows.length === 1 ? '' : 's'}`,
    '',
  ];

  result.windows
    .sort((a, b) => a.startStr.localeCompare(b.startStr))
    .forEach((w, i) => {
      const start = new Date(w.startStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = new Date(w.endStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const holidays = w.holidays.length > 0 ? ` · ${w.holidays.join(', ')}` : '';
      lines.push(`${i + 1}. ${start} – ${end} (${w.totalDays} days, ${w.ptoDaysUsed} PTO) · ${w.efficiency.toFixed(1)}x${holidays}`);
    });

  lines.push('', 'Plan your own at leavewise.com/optimize');
  return lines.join('\n');
}

export default function OptimizePage() {
  // Decode URL hash once and cache (avoid double-call)
  const urlFormRef = useRef<FormState | null | undefined>(undefined);
  function getURLForm(): FormState | null {
    if (urlFormRef.current === undefined) {
      urlFormRef.current = typeof window !== 'undefined' ? decodeShareURL() : null;
      if (urlFormRef.current && typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
    return urlFormRef.current;
  }

  // Lazy init from URL hash → localStorage → query params → defaults
  const [form, setForm] = useState<FormState>(() => {
    const fromURL = getURLForm();
    if (fromURL) return fromURL;
    const saved = loadSavedState()?.form;
    if (saved) return saved;
    // Check query params (?country=KR) and localStorage for country default
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
  const { toast } = useToast();
  const restoredFromStorage = useRef(false);

  // Locale state — persisted in localStorage under 'leavewise_locale'
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    try {
      const saved = localStorage.getItem('leavewise_locale');
      if (saved === 'ko' || saved === 'en') return saved;
      // Default to KR locale when country param is KR and no locale saved
      const qc = new URLSearchParams(window.location.search).get('country')?.toUpperCase();
      if (qc === 'KR') return 'ko';
      const lsc = localStorage.getItem('leavewise_default_country');
      if (lsc === 'KR') return 'ko';
    } catch { /* ok */ }
    return 'en';
  });
  const l = t[locale];

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next: Locale = prev === 'en' ? 'ko' : 'en';
      try { localStorage.setItem('leavewise_locale', next); } catch { /* ok */ }
      return next;
    });
  }, []);

  // Restore selectedPTO from localStorage on mount
  const [initialPTO] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    if (getURLForm()) return []; // URL share doesn't include PTO selection
    const saved = loadSavedState();
    if (saved?.selectedPTO?.length) {
      restoredFromStorage.current = true;
      return saved.selectedPTO;
    }
    return [];
  });

  // Optimizer state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const resultRef = useRef<OptimizationResult | null>(null);
  const resultsAreaRef = useRef<HTMLDivElement>(null);
  const [hoveredWindow, setHoveredWindow] = useState<number | null>(null);
  const [windowSort, setWindowSort] = useState<'date' | 'efficiency' | 'length'>('date');
  const [flightDeals, setFlightDeals] = useState<Record<number, FlightDeal | 'loading' | 'error'>>({});
  const [windowAllocations, setWindowAllocations] = useState<Record<number, number>>({});
  const windowAllocationsRef = useRef<Record<number, number>>({});
  const [showShareCard, setShowShareCard] = useState(false);

  // Strategy comparison state
  type Strategy = 'short' | 'balanced' | 'long';
  const [strategies, setStrategies] = useState<Record<Strategy, OptimizationResult | null>>({
    short: null,
    balanced: null,
    long: null,
  });
  const [activeStrategy, setActiveStrategy] = useState<Strategy>('balanced');

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // First-visit & onboarding state
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return !localStorage.getItem('leavewise_visited'); } catch { return false; }
  });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showCompHelp, setShowCompHelp] = useState(false);
  const [showFloatingHelp, setShowFloatingHelp] = useState(false);
  const [lwGuideDismissed, setLwGuideDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem('leavewise_lw_guide_dismissed') === '1'; } catch { return false; }
  });

  // Theme state (opt-in dark mode)
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

  // Interactive calendar state
  const [baseCalendar, setBaseCalendar] = useState<DayData[] | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [selectedPTO, setSelectedPTO] = useState<Set<string>>(() => new Set(initialPTO));
  const [previewDates, setPreviewDates] = useState<Set<string>>(new Set());
  const [activeHoliday, setActiveHoliday] = useState<DayData | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<BridgeOption[]>([]);
  const [expandedLW, setExpandedLW] = useState<LongWeekendPreview | null>(null);

  // Derived values
  const totalLeave =
    form.leavePool.ptoDays + form.leavePool.compDays + form.leavePool.floatingHolidays;
  const prebookedCount = baseCalendar?.filter((d) => d.isPrebooked).length ?? 0;
  const remainingPTO = Math.max(0, totalLeave - prebookedCount - selectedPTO.size);

  // Long weekends preview — computed from baseCalendar whenever it changes
  const longWeekends = useMemo(() => {
    if (!baseCalendar) return [];
    const today = new Date().toISOString().slice(0, 10);
    return computeLongWeekends(baseCalendar, today);
  }, [baseCalendar]);

  const freeWeekends = useMemo(() => longWeekends.filter((w) => w.ptoCost === 0), [longWeekends]);
  const boostWeekends = useMemo(() => longWeekends.filter((w) => w.ptoCost > 0), [longWeekends]);

  // Sorted windows for the results grid
  const sortedWindows = useMemo(() => {
    if (!result) return [];
    const ws = [...result.windows];
    if (windowSort === 'efficiency') ws.sort((a, b) => b.efficiency - a.efficiency);
    else if (windowSort === 'length') ws.sort((a, b) => b.totalDays - a.totalDays);
    else ws.sort((a, b) => a.startStr.localeCompare(b.startStr));
    return ws;
  }, [result, windowSort]);

  // Best window: highest efficiency, tiebreak by total days
  const bestWindowId = useMemo(() => {
    if (!result || result.windows.length === 0) return null;
    const best = result.windows.reduce((a, b) =>
      b.efficiency > a.efficiency || (b.efficiency === a.efficiency && b.totalDays > a.totalDays) ? b : a
    );
    return best.id;
  }, [result]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const calendarDays = result?.days ?? baseCalendar ?? [];
  const defaultStartMonth = form.year === CURRENT_YEAR ? new Date().getMonth() : 0;

  // Map windowId → label for calendar hover tooltips
  const windowLabels = useMemo(() => {
    const m = new Map<number, string>();
    if (result?.windows) {
      for (const w of result.windows) {
        m.set(w.id, `${w.label} · ${w.totalDays} days off`);
      }
    }
    return m;
  }, [result]);
  const hasCompanyHolidays = parseDates(form.companyHolidaysRaw).length > 0;
  const selectedStateName = US_STATES.find((s) => s.code === form.usState)?.name ?? '';
  const remainingBudget = result?.remainingLeave ?? 0;

  // Show restore toast on mount
  useEffect(() => {
    if (restoredFromStorage.current) {
      toast('Restored your previous settings', 'info');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save to localStorage
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveState(form, selectedPTO);
    }, 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [form, selectedPTO]);

  // Switch displayed result when active strategy changes
  useEffect(() => {
    const s = strategies[activeStrategy];
    if (s) {
      setResult(s);
      resultRef.current = s;
      // Update calendar PTO markers to match the selected strategy
      const ptoDates = new Set(
        s.days.filter((d) => d.isPTO && !d.isPrebooked).map((d) => d.dateStr)
      );
      setSelectedPTO(ptoDates);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStrategy, strategies]);

  // Track first user interaction (for CTA pulse).
  // We detect interaction by listening for pointer/keyboard events on the sidebar form.
  const handleSidebarInteraction = useCallback(() => {
    if (!hasInteracted) setHasInteracted(true);
  }, [hasInteracted]);

  // Auto-load base calendar when location / year / company settings change
  useEffect(() => {
    let cancelled = false;
    setCalendarLoading(true);

    (async () => {
      try {
        const holidays = await fetchHolidaysForSettings(form.year, form.country, form.usState);
        if (cancelled) return;
        const companyHolidayDates = parseDates(form.companyHolidaysRaw);
        const prebookedDates = parseDates(form.prebookedRaw);
        const base = buildCalendarBase(form.year, holidays, companyHolidayDates, prebookedDates);
        setBaseCalendar(base);
      } catch {
        // silent — user can still use the optimizer
      } finally {
        if (!cancelled) setCalendarLoading(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country, form.usState, form.year, form.companyHolidaysRaw, form.prebookedRaw]);

  // Clear interactive state when fundamental settings change
  useEffect(() => {
    setSelectedPTO(new Set());
    setActiveHoliday(null);
    setActiveSuggestions([]);
    setPreviewDates(new Set());
    setResult(null);
    resultRef.current = null;
    setFlightDeals({});
    windowAllocationsRef.current = {};
    setWindowAllocations({});
    setStrategies({ short: null, balanced: null, long: null });
    setActiveStrategy('balanced');
  }, [form.country, form.usState, form.year]);

  // Keep bridge suggestions fresh whenever activeHoliday or selection changes
  useEffect(() => {
    if (!activeHoliday || !baseCalendar) return;
    const suggestions = getBridgeSuggestions(
      activeHoliday.dateStr,
      baseCalendar,
      remainingPTO,
      selectedPTO
    );
    setActiveSuggestions(suggestions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHoliday, baseCalendar, remainingPTO, selectedPTO]);

  const setLeave = (key: keyof LeavePool, value: number) =>
    setForm((f) => {
      const newPool = { ...f.leavePool, [key]: value };
      const oldTotal = f.leavePool.ptoDays + f.leavePool.compDays + f.leavePool.floatingHolidays;
      const newTotal = newPool.ptoDays + newPool.compDays + newPool.floatingHolidays;
      const newDaysToAllocate =
        f.daysToAllocate >= oldTotal ? newTotal : Math.min(f.daysToAllocate, newTotal);
      return { ...f, leavePool: newPool, daysToAllocate: newDaysToAllocate };
    });

  const handleCountryChange = (code: CountryCode) => {
    setForm((f) => ({
      ...f,
      country: code,
      homeAirport: f.airportManuallySet ? f.homeAirport : inferAirport(code),
    }));
  };

  const handleDayClick = useCallback(
    (day: DayData) => {
      if (day.isHoliday) {
        if (activeHoliday?.dateStr === day.dateStr) {
          setActiveHoliday(null);
          setPreviewDates(new Set());
        } else {
          setActiveHoliday(day);
          setPreviewDates(new Set());
        }
      } else if (!day.isFree && !day.isPrebooked) {
        setSelectedPTO((prev) => {
          const next = new Set(prev);
          if (next.has(day.dateStr)) next.delete(day.dateStr);
          else next.add(day.dateStr);
          return next;
        });
      }
    },
    [activeHoliday]
  );

  const handleApplyBridge = useCallback((daysToAdd: string[]) => {
    setSelectedPTO((prev) => {
      const next = new Set(prev);
      daysToAdd.forEach((d) => next.add(d));
      return next;
    });
  }, []);

  const handlePreviewEnter = useCallback((dates: string[]) => {
    setPreviewDates(new Set(dates));
  }, []);

  const handlePreviewLeave = useCallback(() => {
    setPreviewDates(new Set());
  }, []);

  const fetchFlightDeals = async (
    windows: OptimizationResult['windows'],
    origin: string,
    currency: string
  ) => {
    const initial: Record<number, 'loading'> = {};
    windows.forEach((w) => { initial[w.id] = 'loading'; });
    setFlightDeals(initial);

    await Promise.all(
      windows.map(async (w) => {
        try {
          const params = new URLSearchParams({
            origin,
            dateFrom: w.startStr,
            dateTo: w.endStr,
            currency,
          });
          const res = await fetch(`/api/flights?${params.toString()}`);
          const deal: FlightDeal | null = await res.json();
          setFlightDeals((prev) => ({ ...prev, [w.id]: deal ?? 'error' }));
        } catch {
          setFlightDeals((prev) => ({ ...prev, [w.id]: 'error' }));
        }
      })
    );
  };

  const handleOptimize = useCallback(
    async (isAllocationAdjustment = false) => {
      setLoading(true);
      setError(null);
      if (!isAllocationAdjustment) {
        setResult(null);
        resultRef.current = null;
        setFlightDeals({});
        windowAllocationsRef.current = {};
        setWindowAllocations({});
      }

      try {
        const holidays = await fetchHolidaysForSettings(form.year, form.country, form.usState);
        const companyHolidayDates = parseDates(form.companyHolidaysRaw);
        const prebookedDates = parseDates(form.prebookedRaw);

        const currentAllocations = windowAllocationsRef.current;
        const currentResult = resultRef.current;
        const lockedWindows: LockedWindow[] =
          isAllocationAdjustment && currentResult
            ? Object.entries(currentAllocations)
                .map(([id, pto]) => {
                  const w = currentResult.windows.find((win) => win.id === Number(id));
                  return w ? { startStr: w.startStr, endStr: w.endStr, targetPTO: pto } : null;
                })
                .filter((x): x is LockedWindow => x !== null)
            : [];

        const baseOpts = {
          budgetCap: form.daysToAllocate,
          lockedWindows,
          travelValueWeight: form.travelValueWeight,
          homeCountry: form.country,
        };

        // Run balanced strategy (the default / main result)
        const optimized = optimizePTO(
          form.year,
          form.leavePool,
          holidays,
          companyHolidayDates,
          prebookedDates,
          form.country,
          { ...baseOpts, maxWindowDays: form.maxDaysPerWindow }
        );

        // Run short breaks and long trips strategies for comparison
        const shortResult = optimizePTO(
          form.year,
          form.leavePool,
          holidays,
          companyHolidayDates,
          prebookedDates,
          form.country,
          { ...baseOpts, maxWindowDays: 5 }
        );
        const longResult = optimizePTO(
          form.year,
          form.leavePool,
          holidays,
          companyHolidayDates,
          prebookedDates,
          form.country,
          { ...baseOpts, maxWindowDays: 28 }
        );

        setStrategies({ short: shortResult, balanced: optimized, long: longResult });
        setActiveStrategy('balanced');

        resultRef.current = optimized;
        setResult(optimized);

        // Reflect optimizer results on the interactive calendar
        const ptoDates = new Set(
          optimized.days.filter((d) => d.isPTO && !d.isPrebooked).map((d) => d.dateStr)
        );
        setSelectedPTO(ptoDates);
        setActiveHoliday(null);
        setPreviewDates(new Set());

        const currency = COUNTRY_CURRENCY[form.country] ?? 'USD';
        fetchFlightDeals(optimized.windows, form.homeAirport, currency);

        // Scroll to results on mobile
        setTimeout(() => {
          resultsAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);

        // Close sidebar on mobile after optimization
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        }

        // Celebration toast for exceptional windows
        const bestW = optimized.windows.reduce((a, b) =>
          b.efficiency > a.efficiency ? b : a, optimized.windows[0]
        );
        if (bestW && bestW.efficiency >= 3) {
          toast(`${bestW.efficiency.toFixed(1)}x efficiency — ${bestW.ptoDaysUsed} PTO days → ${bestW.totalDays} days off!`);
        } else {
          toast(`Found ${optimized.windows.length} optimized window${optimized.windows.length === 1 ? '' : 's'}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form]
  );

  const handleAdjustAllocation = useCallback(
    (windowId: number, delta: number) => {
      const currentWindow = resultRef.current?.windows.find((w) => w.id === windowId);
      if (!currentWindow) return;
      const currentPTO = windowAllocationsRef.current[windowId] ?? currentWindow.ptoDaysUsed;
      const newPTO = Math.max(1, currentPTO + delta);
      const updated = { ...windowAllocationsRef.current, [windowId]: newPTO };
      windowAllocationsRef.current = updated;
      setWindowAllocations(updated);
      handleOptimize(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleOptimize]
  );

  const handleReset = useCallback(() => {
    setForm(DEFAULT_FORM);
    setSelectedPTO(new Set());
    setActiveHoliday(null);
    setPreviewDates(new Set());
    setResult(null);
    resultRef.current = null;
    setFlightDeals({});
    windowAllocationsRef.current = {};
    setWindowAllocations({});
    setStrategies({ short: null, balanced: null, long: null });
    setActiveStrategy('balanced');
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ok */ }
    toast('Form reset to defaults', 'info');
  }, [toast]);

  const handleExportAll = useCallback(() => {
    if (!result || result.windows.length === 0) return;
    downloadAllICS(result.windows);
    toast(`Exported ${result.windows.length} windows to calendar`);
  }, [result, toast]);

  const handleSharePlan = useCallback(() => {
    const url = encodeShareURL(form);
    navigator.clipboard.writeText(url).then(() => {
      toast('Share link copied to clipboard');
    });
  }, [form, toast]);

  const handleCopyPlan = useCallback(() => {
    if (!result) return;
    const stateName = US_STATES.find((s) => s.code === form.usState)?.name ?? '';
    const summary = generatePlanSummary(result, form, stateName);
    navigator.clipboard.writeText(summary).then(() => {
      toast('Plan summary copied to clipboard');
    });
  }, [result, form, toast]);

  const handleDismissWelcome = useCallback(() => {
    setShowWelcome(false);
    try { localStorage.setItem('leavewise_visited', '1'); } catch { /* ok */ }
  }, []);

  // Keyboard shortcut: ⌘↵ / Ctrl+↵ to optimize
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!loading && totalLeave > 0) handleOptimize();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleOptimize, loading, totalLeave]);

  return (
    <div className="min-h-screen bg-cream">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-border" role="navigation" aria-label="Main">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-ink-muted hover:text-teal hover:bg-cream transition-colors"
              aria-label={sidebarOpen ? l.hideSettings : l.showSettings}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
            <Link
              href={locale === 'ko' ? '/ko' : '/'}
              className="font-display font-semibold text-ink text-lg tracking-tight hover:text-teal transition-colors"
            >
              Leavewise
            </Link>
          </div>

          {/* Summary stats in nav */}
          <div className="hidden sm:flex items-center gap-4 text-sm">
            {result ? (
              <>
                <span className="text-ink-muted"><span className="font-semibold text-ink">{result.totalLeaveUsed}</span> {l.used}</span>
                <span className="text-ink-muted"><span className="font-semibold text-coral">{result.totalDaysOff}</span> {l.daysOff}</span>
                <span className="text-ink-muted"><span className="font-semibold text-sage">{result.windows.length}</span> {l.windows}</span>
                <span className="text-ink-muted"><span className="font-semibold text-teal">{result.remainingLeave}</span> {l.remaining}</span>
              </>
            ) : (
              <span className="text-ink-muted">
                <span className="font-semibold text-teal">{totalLeave}</span> {l.leaveDays} · {form.year}
                {selectedPTO.size > 0 && <span className="ml-3"><span className="font-semibold text-coral">{selectedPTO.size}</span> {l.manuallyAdded}</span>}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language toggle */}
            <button
              onClick={toggleLocale}
              className="print:hidden h-8 px-2 text-[11px] font-semibold text-ink-muted hover:text-teal transition-colors rounded-lg hover:bg-cream border border-border hover:border-teal/40"
              aria-label={locale === 'en' ? 'Switch to Korean' : 'Switch to English'}
            >
              {l.langToggle}
            </button>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="print:hidden flex items-center justify-center w-8 h-8 text-ink-muted hover:text-teal transition-colors rounded-lg hover:bg-cream"
              aria-label={theme === 'dark' ? l.lightMode : l.darkMode}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            {/* Share plan link */}
            <button
              onClick={handleSharePlan}
              className="print:hidden flex items-center gap-1 text-xs text-ink-muted hover:text-teal transition-colors border border-border rounded-lg px-2.5 py-1.5 hover:border-teal/40"
              aria-label={l.sharePlanLink}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.886-3.497l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              <span className="hidden sm:inline">{l.share}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="print:hidden flex items-center gap-1 text-xs text-ink-muted hover:text-teal transition-colors border border-border rounded-lg px-2.5 py-1.5 hover:border-teal/40"
              aria-label={l.printPlan}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              <span className="hidden sm:inline">{l.print}</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── SIDEBAR FORM ── */}
          <aside
            className={`lg:w-80 xl:w-88 shrink-0 transition-all duration-300 ${
              sidebarOpen ? 'block' : 'hidden lg:block'
            }`}
            role="complementary"
            aria-label="Optimization settings"
          >
            <div
              className="bg-white rounded-2xl border border-border p-5 sm:p-6 sticky top-20 space-y-5 max-h-[calc(100vh-6rem)] overflow-y-auto"
              onPointerDown={handleSidebarInteraction}
            >
              {/* Welcome banner — first visit only */}
              {showWelcome && (
                <div className="bg-teal-light border border-teal/20 rounded-xl p-4 flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-teal mb-1">{l.welcomeTitle}</p>
                    <p className="text-[11px] text-teal/80 leading-relaxed">
                      {l.welcomeBody}
                    </p>
                  </div>
                  <button
                    onClick={handleDismissWelcome}
                    className="text-teal/50 hover:text-teal transition-colors shrink-0 mt-0.5"
                    aria-label={l.dismissWelcome}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-display font-semibold text-ink">
                    {l.planHeading}
                  </h1>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    {l.planSubheading}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[10px] font-semibold text-ink-muted hover:text-coral transition-colors px-2 py-1 rounded-lg hover:bg-coral-light shrink-0 mt-0.5"
                  aria-label={l.resetAll}
                >
                  {l.reset}
                </button>
              </div>

              {/* PTO Budget Visualization */}
              {totalLeave > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-ink-muted/70">{l.budget}</span>
                    <span className="text-xs font-semibold text-ink">
                      {selectedPTO.size + prebookedCount} / {totalLeave} {l.used}
                    </span>
                  </div>
                  <div className="h-2 bg-border/60 rounded-full overflow-hidden flex">
                    {prebookedCount > 0 && (
                      <div
                        className="bg-ink-muted/40 h-full transition-all duration-300"
                        style={{ width: `${(prebookedCount / totalLeave) * 100}%` }}
                        title={`${prebookedCount} ${l.preBooked}`}
                      />
                    )}
                    {selectedPTO.size > 0 && (
                      <div
                        className="bg-coral h-full transition-all duration-300"
                        style={{ width: `${(selectedPTO.size / totalLeave) * 100}%` }}
                        title={`${selectedPTO.size} ${l.ptoSelected}`}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    {prebookedCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-ink-muted">
                        <span className="w-2 h-2 rounded-sm bg-ink-muted/40" />
                        {prebookedCount} {l.preBooked}
                      </span>
                    )}
                    {selectedPTO.size > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-ink-muted">
                        <span className="w-2 h-2 rounded-sm bg-coral" />
                        {selectedPTO.size} {l.selected}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-ink-muted">
                      <span className="w-2 h-2 rounded-sm bg-border/60" />
                      {remainingPTO} {l.remainingBadge}
                    </span>
                  </div>
                </div>
              )}

              {/* ── LOCATION ── */}
              <div>
                <SectionLabel>{l.location}</SectionLabel>

                <div className="flex gap-2 mb-3">
                  {([
                    { code: 'US' as CountryCode, label: l.countryUS },
                    { code: 'KR' as CountryCode, label: l.countryKR },
                  ] as { code: CountryCode; label: string }[]).map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => handleCountryChange(code)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        form.country === code
                          ? 'bg-teal text-white border-teal'
                          : 'bg-cream text-ink-muted border-border hover:border-teal/40'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                    {l.homeAirport}
                  </label>
                  <input
                    type="text"
                    value={form.homeAirport}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
                      setForm((f) => ({ ...f, homeAirport: val, airportManuallySet: true }));
                    }}
                    placeholder={l.airportPlaceholder}
                    maxLength={3}
                    className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink font-mono uppercase placeholder:text-ink-muted/50 placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                  />
                  {form.country === 'KR' && (
                    <p className="text-[10px] text-ink-muted mt-1">
                      {l.airportHint}
                    </p>
                  )}
                </div>

                {form.country === 'US' && (
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                      {l.state}
                    </label>
                    <select
                      value={form.usState}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, usState: e.target.value }))
                      }
                      className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                    >
                      {US_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* ── YEAR ── */}
              <div>
                <SectionLabel>{l.year}</SectionLabel>
                <div className="flex gap-2">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      onClick={() => setForm((f) => ({ ...f, year: y }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        form.year === y
                          ? 'bg-teal text-white border-teal'
                          : 'bg-cream text-ink-muted border-border hover:border-teal/40'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── LEAVE POOL ── */}
              <div>
                <SectionLabel>{l.leavePool}</SectionLabel>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-ink-soft">{l.ptoDays}</label>
                      <span className="text-base font-display font-semibold text-teal">
                        {form.leavePool.ptoDays}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={form.leavePool.ptoDays}
                      onChange={(e) => setLeave('ptoDays', parseInt(e.target.value, 10))}
                      className="w-full accent-teal"
                    />
                    <div className="flex justify-between text-[10px] text-ink-muted mt-0.5">
                      <span>0</span><span>40</span>
                    </div>
                    {/* Quick-select presets */}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {[5, 10, 15, 20, 25].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setLeave('ptoDays', n)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                            form.leavePool.ptoDays === n
                              ? 'bg-teal text-white border-teal'
                              : 'bg-cream text-ink-muted border-border hover:border-teal/40 hover:text-teal'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <NumberStepper
                        label={l.compDays}
                        sublabel={l.compDaysSub}
                        value={form.leavePool.compDays}
                        onChange={(v) => setLeave('compDays', v)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCompHelp((v) => !v)}
                        className="text-[10px] text-ink-muted/50 hover:text-teal transition-colors shrink-0"
                        aria-label={l.compDaysHelp}
                      >
                        (?)
                      </button>
                    </div>
                    {showCompHelp && (
                      <p className="text-[10px] text-ink-muted leading-relaxed bg-cream rounded-lg px-2.5 py-2 border border-border mt-1">
                        {l.compDaysHelpText}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <NumberStepper
                        label={l.floatingHolidays}
                        sublabel={l.floatingHolidaysSub}
                        value={form.leavePool.floatingHolidays}
                        onChange={(v) => setLeave('floatingHolidays', v)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowFloatingHelp((v) => !v)}
                        className="text-[10px] text-ink-muted/50 hover:text-teal transition-colors shrink-0"
                        aria-label={l.floatingHolidaysHelp}
                      >
                        (?)
                      </button>
                    </div>
                    {showFloatingHelp && (
                      <p className="text-[10px] text-ink-muted leading-relaxed bg-cream rounded-lg px-2.5 py-2 border border-border mt-1">
                        {l.floatingHolidaysHelpText}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between bg-teal-light rounded-lg px-3 py-2 border border-teal/10">
                    <span className="text-xs font-semibold text-teal">{l.totalAvailable}</span>
                    <span className="text-base font-display font-semibold text-teal">
                      {totalLeave} {l.days}
                    </span>
                  </div>

                  {/* Days to use */}
                  {totalLeave > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-ink-soft">{l.daysToplan}</label>
                        <span className="text-sm font-display font-semibold text-ink">
                          {Math.min(form.daysToAllocate, totalLeave)}
                          {form.daysToAllocate < totalLeave && (
                            <span className="text-ink-muted font-normal text-xs"> of {totalLeave}</span>
                          )}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={totalLeave}
                        value={Math.min(form.daysToAllocate, totalLeave)}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, daysToAllocate: parseInt(e.target.value, 10) }))
                        }
                        className="w-full accent-teal"
                      />
                      <p className="text-[10px] text-ink-muted mt-0.5">
                        {form.daysToAllocate >= totalLeave
                          ? l.allDaysWillBePlanned
                          : `${totalLeave - form.daysToAllocate} ${totalLeave - form.daysToAllocate === 1 ? l.dayHeldBack : l.daysHeldBack}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── COMPANY SETUP (collapsible) ── */}
              <CollapsibleSection
                title={l.companySetup}
                defaultOpen={!!(form.companyName || form.companyHolidaysRaw)}
                badge={form.companyName || parseDates(form.companyHolidaysRaw).length > 0 ? l.set : undefined}
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                      {l.companyName} <span className="text-ink-muted font-normal">{l.optional}</span>
                    </label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                      placeholder={l.companyPlaceholder}
                      className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">
                      {l.companyHolidays}
                    </label>
                    <p className="text-[10px] text-ink-muted mb-1.5 leading-snug">
                      {l.companyHolidaysDesc}
                    </p>
                    <textarea
                      value={form.companyHolidaysRaw}
                      onChange={(e) => setForm((f) => ({ ...f, companyHolidaysRaw: e.target.value }))}
                      placeholder={`${form.year}-12-24 Christmas Eve\n${form.year}-12-26 Boxing Day`}
                      rows={3}
                      className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-xs text-ink font-mono placeholder:text-ink-muted/40 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
                    />
                    <p className="text-[10px] text-ink-muted mt-1">{l.onePerLine}</p>
                  </div>
                </div>
              </CollapsibleSection>

              {/* ── ALREADY PLANNED (collapsible) ── */}
              <CollapsibleSection
                title={l.alreadyPlanned}
                defaultOpen={!!form.prebookedRaw}
                badge={parseDates(form.prebookedRaw).length > 0 ? `${parseDates(form.prebookedRaw).length}d` : undefined}
              >
                <div>
                  <p className="text-[10px] text-ink-muted mb-2 leading-snug">
                    {l.alreadyPlannedDesc}
                  </p>
                  <textarea
                    value={form.prebookedRaw}
                    onChange={(e) => setForm((f) => ({ ...f, prebookedRaw: e.target.value }))}
                    placeholder={`${form.year}-06-14\n${form.year}-06-15`}
                    rows={3}
                    className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-xs text-ink font-mono placeholder:text-ink-muted/40 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
                  />
                  <p className="text-[10px] text-ink-muted mt-1">{l.onePerLine}</p>
                </div>
              </CollapsibleSection>

              {/* ── ADVANCED (collapsible) ── */}
              <CollapsibleSection
                title={l.advanced}
                defaultOpen={form.maxDaysPerWindow !== 14}
                badge={form.maxDaysPerWindow !== 14 ? `${form.maxDaysPerWindow}${l.dMax}` : undefined}
              >
                <NumberStepper
                  label={l.maxTripLength}
                  sublabel={l.maxTripLengthSub}
                  value={form.maxDaysPerWindow}
                  min={3}
                  max={28}
                  onChange={(v) => setForm((f) => ({ ...f, maxDaysPerWindow: v }))}
                />
              </CollapsibleSection>

              {/* ── OPTIMIZE FOR ── */}
              <div>
                <SectionLabel>{l.optimizeFor}</SectionLabel>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { weight: 0 as const, label: l.ptoEfficiency, sublabel: l.maxDaysOff },
                    { weight: 0.4 as const, label: l.balanced, sublabel: l.both },
                    { weight: 0.8 as const, label: l.travelValue, sublabel: l.cheapTravel },
                  ] as { weight: 0 | 0.4 | 0.8; label: string; sublabel: string }[]).map(({ weight, label, sublabel }) => (
                    <button
                      key={weight}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, travelValueWeight: weight }))}
                      className={`py-2 px-1 rounded-xl text-center border transition-all ${
                        form.travelValueWeight === weight
                          ? 'bg-teal text-white border-teal'
                          : 'bg-cream text-ink-muted border-border hover:border-teal/40'
                      }`}
                    >
                      <div className="text-[10px] font-semibold leading-tight">{label}</div>
                      <div className={`text-[9px] leading-tight mt-0.5 ${form.travelValueWeight === weight ? 'text-white/70' : 'text-ink-muted/60'}`}>{sublabel}</div>
                    </button>
                  ))}
                </div>
                {form.travelValueWeight > 0 && (
                  <p className="text-[10px] text-ink-muted mt-2 leading-snug">
                    {form.travelValueWeight === 0.8
                      ? 'Prefers windows when most destinations have low crowds and cheap flights — avoids Lunar New Year, Golden Week, European summer, etc.'
                      : 'Blends PTO efficiency with travel value — avoids the worst peak periods while still maximizing days off.'}
                  </p>
                )}
              </div>

              {/* ── SUBMIT ── */}
              <button
                onClick={() => { handleOptimize(); handleSidebarInteraction(); }}
                disabled={loading || totalLeave === 0}
                className={`w-full bg-teal text-white font-semibold py-3 rounded-xl hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 ${
                  !hasInteracted && !result && totalLeave > 0 ? 'animate-pulse' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {l.findingWindows}
                  </>
                ) : (
                  <>
                    {l.optimizeMyLeave}
                    <span className="ml-1 text-white/50 text-xs font-normal hidden sm:inline">⌘↵</span>
                  </>
                )}
              </button>

              {error && (
                <div className="bg-coral-light border border-coral/20 rounded-lg px-4 py-3 text-sm text-coral flex items-start gap-2" role="alert">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </aside>

          {/* Mobile sticky optimize CTA — shown when sidebar is hidden */}
          {!sidebarOpen && !result && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-sm border-t border-border px-4 py-3 safe-area-pb">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-xs font-semibold text-ink-muted border border-border rounded-xl px-3 py-2.5 hover:border-teal/40 transition-colors"
                >
                  {l.settings}
                </button>
                <button
                  onClick={() => handleOptimize()}
                  disabled={loading || totalLeave === 0}
                  className="flex-1 bg-teal text-white font-semibold py-2.5 rounded-xl hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  {loading ? l.findingWindows : l.optimizeMyLeave}
                </button>
              </div>
            </div>
          )}

          {/* ── MAIN CONTENT (two-pane) ── */}
          <main className="flex-1 min-w-0" role="main" aria-label="Calendar and results">
          <div className="flex flex-col xl:flex-row gap-6 items-start">

            {/* ── LEFT PANE: scrollable results ── */}
            <div ref={resultsAreaRef} className="w-full xl:w-[480px] shrink-0 space-y-8">

            {/* Optimizer results */}
            {result && (
              <div className="space-y-8">
                {/* Summary stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: result.totalDaysOff, label: l.daysOffLabel, color: 'text-coral' },
                    { value: result.totalLeaveUsed, label: l.leaveUsed, color: 'text-teal' },
                    { value: result.windows.length, label: l.windowsLabel, color: 'text-sage' },
                    { value: result.remainingLeave, label: l.remainingLabel, color: 'text-ink-muted' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white rounded-xl border border-border p-4 text-center"
                    >
                      <div className={`text-3xl font-display font-semibold ${s.color}`}>
                        {s.value}
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Location context */}
                <div className="flex items-center gap-2 text-sm text-ink-muted">
                  <span className="text-base">{form.country === 'US' ? '🇺🇸' : '🇰🇷'}</span>
                  <span>
                    {form.country === 'US'
                      ? `${l.countryUSContext}${selectedStateName}`
                      : l.southKorea}
                  </span>
                  <span>·</span>
                  <span>{form.year}</span>
                  {form.companyName && (
                    <>
                      <span>·</span>
                      <span className="text-amber font-medium">{form.companyName}</span>
                    </>
                  )}
                </div>

                {/* Strategy comparison bar */}
                {result && strategies.balanced && (
                  <div className="bg-white rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-ink">Compare strategies</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { key: 'short' as Strategy, label: 'Short breaks', desc: 'Many mini-trips', icon: String.fromCodePoint(0x26A1) },
                        { key: 'balanced' as Strategy, label: 'Balanced', desc: 'Mix of short & long', icon: String.fromCodePoint(0x2696, 0xFE0F) },
                        { key: 'long' as Strategy, label: 'Long trips', desc: 'Fewer, bigger vacations', icon: String.fromCodePoint(0x1F334) },
                      ]).map(({ key, label, desc, icon }) => {
                        const s = strategies[key];
                        const isActive = activeStrategy === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setActiveStrategy(key)}
                            className={`text-left p-3 rounded-xl border transition-all ${
                              isActive
                                ? 'border-teal bg-teal/5 shadow-sm'
                                : 'border-border hover:border-teal/30'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-sm">{icon}</span>
                              <span className={`text-xs font-semibold ${isActive ? 'text-teal' : 'text-ink'}`}>{label}</span>
                            </div>
                            <p className="text-[10px] text-ink-muted mb-2">{desc}</p>
                            {s && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-ink-muted">Windows</span>
                                  <span className="font-semibold text-ink">{s.windows.length}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-ink-muted">Days off</span>
                                  <span className="font-semibold text-ink">{s.totalDaysOff}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-ink-muted">Avg efficiency</span>
                                  <span className="font-semibold text-sage">
                                    {(s.windows.reduce((a, w) => a + w.efficiency, 0) / Math.max(s.windows.length, 1)).toFixed(1)}x
                                  </span>
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Vacation windows */}
                {result.windows.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                      <h2 className="text-lg font-display font-semibold text-ink shrink-0">
                        {l.optimizedWindows}
                      </h2>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {(['date', 'efficiency', 'length'] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setWindowSort(s)}
                              aria-label={`${l.sortBy} ${s}`}
                              className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-colors ${
                                windowSort === s
                                  ? 'bg-teal text-white border-teal'
                                  : 'bg-cream text-ink-muted border-border hover:border-teal/40'
                              }`}
                            >
                              {s === 'date' ? l.date : s === 'efficiency' ? l.efficiency : l.length}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyPlan}
                          className="text-[10px] font-semibold text-ink-muted hover:text-teal transition-colors flex items-center gap-1 px-2 py-1 rounded-lg border border-border hover:border-teal/40"
                          aria-label={l.copyPlanClipboard}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {l.copyPlan}
                        </button>
                        <button
                          type="button"
                          onClick={handleExportAll}
                          className="text-[10px] font-semibold text-teal hover:text-teal-hover transition-colors flex items-center gap-1 px-2 py-1 rounded-lg border border-teal/20 hover:border-teal/40 bg-teal-light"
                          aria-label={l.exportAllCalendar}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          {l.exportAll}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowShareCard(true)}
                          className="text-[10px] font-semibold text-teal hover:text-teal-hover transition-colors flex items-center gap-1 px-2 py-1 rounded-lg border border-teal/20 hover:border-teal/40 bg-teal-light"
                          aria-label="Share plan as image"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                          </svg>
                          Share plan
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sortedWindows.map((w) => (
                        <WindowCard
                          key={w.id}
                          window={w}
                          isHighlighted={hoveredWindow === w.id}
                          onHover={setHoveredWindow}
                          flightDeal={flightDeals[w.id]}
                          origin={form.homeAirport}
                          currency={COUNTRY_CURRENCY[form.country] ?? 'USD'}
                          tpMarker={
                            process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? ''
                          }
                          onAdjustPTO={handleAdjustAllocation}
                          remainingBudget={remainingBudget}
                          isBestWindow={w.id === bestWindowId}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-ink-muted mt-3 text-right">
                      {l.pricesFrom}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-border p-8 text-center">
                    <div className="text-3xl mb-3 opacity-40">
                      <svg className="w-10 h-10 mx-auto text-ink-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-ink mb-1">{l.noWindowsFound}</p>
                    <p className="text-ink-muted text-xs leading-relaxed max-w-xs mx-auto">
                      {l.noWindowsFoundDesc}
                    </p>
                  </div>
                )}

                {/* US Pay Insights */}
                {form.country === 'US' &&
                  result.windows.length > 0 &&
                  (() => {
                    const allBookendRisks = result.windows.flatMap((w) =>
                      (w.bookendRisks ?? []).map((r) => ({ ...r, windowLabel: w.label }))
                    );
                    const allPremiumDays = result.windows.flatMap((w) =>
                      (w.premiumPayDays ?? []).map((d) => ({ holiday: d, windowLabel: w.label }))
                    );

                    if (allBookendRisks.length === 0 && allPremiumDays.length === 0) return null;

                    return (
                      <div className="bg-white rounded-2xl border border-border p-6">
                        <h2 className="text-lg font-display font-semibold text-ink mb-1">
                          {l.usPayInsights}
                        </h2>
                        <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                          {l.usPayInsightsDesc}
                        </p>
                        <div className="space-y-4">
                          {allBookendRisks.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                  {l.holidayPayRisk}
                                </span>
                              </div>
                              <p className="text-xs text-ink-muted mb-2 leading-relaxed">
                                Many US employers require you to work the day{' '}
                                <strong>before and after</strong> a paid holiday to receive holiday
                                pay. The windows below include PTO on those adjacent days.
                              </p>
                              <ul className="space-y-1.5">
                                {allBookendRisks.map((r, i) => (
                                  <li key={i} className="text-xs text-ink flex items-start gap-2">
                                    <span className="mt-0.5 text-amber-500 shrink-0">•</span>
                                    <span>
                                      <span className="font-semibold">{r.holidayName}</span>
                                      {' — '}
                                      {r.riskBefore && r.riskAfter
                                        ? 'PTO falls both the day before and after'
                                        : r.riskBefore
                                          ? 'PTO falls the workday before'
                                          : 'PTO falls the workday after'}
                                      {'. You may forfeit holiday pay for this day.'}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {allPremiumDays.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-light text-teal border border-teal/20 px-2 py-0.5 rounded-full">
                                  {l.premiumPayOpportunity}
                                </span>
                              </div>
                              <p className="text-xs text-ink-muted mb-2 leading-relaxed">
                                These holidays fall on weekdays inside your windows. If your
                                employer offers <strong>holiday premium pay (1.5×–2×)</strong>,
                                working the day and using PTO another time could earn more.
                              </p>
                              <ul className="space-y-1.5">
                                {allPremiumDays.map((d, i) => (
                                  <li key={i} className="text-xs text-ink flex items-start gap-2">
                                    <span className="mt-0.5 text-teal shrink-0">•</span>
                                    <span>
                                      <span className="font-semibold">{d.holiday}</span>
                                      {
                                        ' — working this day may qualify for double or premium pay instead of using PTO.'
                                      }
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            )}

            {/* Long weekends preview — shown before optimization */}
            {!result && !calendarLoading && longWeekends.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-display font-semibold text-ink">
                    {l.upcomingLongWeekends}
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {form.country === 'US' ? selectedStateName : l.southKorea} · {form.year}
                    {' · '}based on public holidays
                  </p>
                </div>

                {/* How-to guide */}
                {!lwGuideDismissed && (
                  <div className="relative bg-teal/5 border border-teal/15 rounded-2xl p-4 space-y-3">
                    <button
                      onClick={() => {
                        setLwGuideDismissed(true);
                        try { localStorage.setItem('leavewise_lw_guide_dismissed', '1'); } catch {}
                      }}
                      className="absolute top-3 right-3 text-ink-muted/50 hover:text-ink-muted transition-colors"
                      aria-label="Dismiss guide"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                    <p className="text-xs font-semibold text-teal">How to use</p>
                    <ol className="space-y-2 text-xs text-ink-soft pr-4">
                      <li className="flex gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal/10 text-teal text-[10px] font-bold flex items-center justify-center">1</span>
                        <span><span className="font-medium text-ink">Tap a card</span> below to open a window and see all its days</span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal/10 text-teal text-[10px] font-bold flex items-center justify-center">2</span>
                        <span><span className="font-medium text-ink">Click the days</span> you want off — they'll be marked as PTO</span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal/10 text-teal text-[10px] font-bold flex items-center justify-center">3</span>
                        <span>Or hit <span className="font-medium text-teal">Optimize my leave</span> and let us pick the best days for you</span>
                      </li>
                    </ol>
                  </div>
                )}

                {freeWeekends.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-sage">{l.alreadyFree}</span>
                      <span className="text-[10px] text-ink-muted">{l.noPTONeeded}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {freeWeekends.map((lw) => (
                        <LongWeekendCard key={lw.id} lw={lw} onClick={() => setExpandedLW(lw)} l={l} />
                      ))}
                    </div>
                  </div>
                )}

                {boostWeekends.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-ink-soft">{l.addAFewDays}</span>
                      <span className="text-[10px] text-ink-muted">{l.use1to3PTO}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {boostWeekends.map((lw) => (
                        <LongWeekendCard key={lw.id} lw={lw} onClick={() => setExpandedLW(lw)} l={l} />
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-ink-muted">
                  {l.hitOptimize}
                </p>
              </div>
            )}

            </div>

            {/* ── RIGHT PANE: sticky calendar ── */}
            <div className="flex-1 min-w-0 xl:sticky xl:top-24 space-y-4">

            {/* Calendar */}
            {calendarLoading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-40 bg-border/50 rounded-lg animate-skeleton" />
                  <div className="h-5 w-16 bg-border/50 rounded-lg animate-skeleton" />
                </div>
                <div className="h-4 w-full bg-border/40 rounded-lg animate-skeleton" />
                <div className="bg-white rounded-2xl border border-border p-6">
                  <div className="grid grid-cols-3 gap-5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 w-16 bg-border/50 rounded animate-skeleton" />
                        <div className="grid grid-cols-7 gap-px">
                          {Array(35).fill(0).map((_, j) => (
                            <div key={j} className="aspect-square rounded bg-border/30 animate-skeleton" style={{ animationDelay: `${j * 30}ms` }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : calendarDays.length > 0 ? (
              <div>
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-display font-semibold text-ink">
                      {form.year} {l.calendar}
                      {form.country === 'US' && ` · ${selectedStateName}`}
                      {form.companyName && (
                        <span className="text-amber"> · {form.companyName}</span>
                      )}
                    </h2>
                    {!result && (
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                        {l.clickHolidayInstruction}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-display font-semibold text-teal">
                      {remainingPTO}
                    </div>
                    <div className="text-[10px] text-ink-muted leading-tight">
                      {l.daysUnallocated}<br />{l.unallocated}
                    </div>
                  </div>
                </div>
                <TimelineBar
                  days={calendarDays}
                  hoveredWindow={hoveredWindow}
                  onHoverWindow={setHoveredWindow}
                  today={todayStr}
                />
                <div className="bg-white rounded-2xl border border-border p-6">
                  <InteractiveCalendar
                    days={calendarDays}
                    selectedPTO={selectedPTO}
                    previewDates={previewDates}
                    activeHolidayDateStr={activeHoliday?.dateStr ?? null}
                    onDayClick={handleDayClick}
                    showCompanyHolidays={hasCompanyHolidays}
                    hoveredWindow={hoveredWindow}
                    onHoverWindow={setHoveredWindow}
                    windowLabels={windowLabels}
                    today={todayStr}
                    defaultStartMonth={defaultStartMonth}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🗓</div>
                <h2 className="text-2xl font-display font-semibold text-ink mb-2">
                  {l.readyWhenYouAre}
                </h2>
                <p className="text-ink-muted text-sm max-w-sm leading-relaxed">
                  {l.fillInLocation}
                </p>
              </div>
            )}
            </div>

          </div>
          </main>
        </div>
      </div>

      {/* ── SHARE CARD MODAL ── */}
      {showShareCard && result && (
        <ShareCard
          year={form.year}
          totalLeave={result.totalLeaveUsed}
          totalDaysOff={result.totalDaysOff}
          windows={result.windows.map((w) => ({
            label: w.label,
            totalDays: w.totalDays,
            ptoDaysUsed: w.ptoDaysUsed,
            startStr: w.startStr,
            endStr: w.endStr,
          }))}
          onClose={() => setShowShareCard(false)}
        />
      )}

      {/* ── HOLIDAY PANEL (fixed right drawer) ── */}
      {/* ── EXPANDED LONG WEEKEND MODAL ── */}
      {expandedLW && baseCalendar && (
        <ExpandedLongWeekendModal
          lw={expandedLW}
          days={baseCalendar}
          selectedPTO={selectedPTO}
          onTogglePTO={(dateStr) => {
            setSelectedPTO((prev) => {
              const next = new Set(prev);
              if (next.has(dateStr)) next.delete(dateStr);
              else next.add(dateStr);
              return next;
            });
          }}
          onClose={() => setExpandedLW(null)}
          l={l}
        />
      )}

      {activeHoliday && baseCalendar && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/20 animate-fade-in"
            onClick={() => {
              setActiveHoliday(null);
              setPreviewDates(new Set());
            }}
            aria-hidden="true"
          />
          {/* Panel — capped to screen width on small phones */}
          <div
            className="fixed right-0 top-[57px] bottom-0 w-full max-w-80 z-40 shadow-2xl animate-slide-in-right"
            role="dialog"
            aria-label={`Bridge suggestions for ${activeHoliday.holidayName ?? 'holiday'}`}
          >
            <HolidayPanel
              holiday={activeHoliday}
              suggestions={activeSuggestions}
              appliedDates={selectedPTO}
              remainingPTO={remainingPTO}
              onApply={handleApplyBridge}
              onPreviewEnter={handlePreviewEnter}
              onPreviewLeave={handlePreviewLeave}
              onClose={() => {
                setActiveHoliday(null);
                setPreviewDates(new Set());
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
