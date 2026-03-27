'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { trackEmailSignup } from '@/lib/analytics';

// ── i18n ──────────────────────────────────────────────────────────

type Locale = 'en' | 'ko';

const t = {
  en: {
    navCta: 'Try it free',
    badge: '100+ countries · Free forever',
    heroTitle1: 'Work less.',
    heroTitle2: 'Be gone',
    heroTitle3: 'longer.',
    heroSub: 'Leavewise finds every holiday bridge, long weekend, and calendar gap in your year — so you spend fewer PTO days and get more life.',
    heroCta: 'Plan my time off',
    heroNote: 'No signup required',
    heroAccountNote: 'No account, no password, no drama. Only sign up if you want us to keep track of your PTO.',

    calcTitle: 'How far can your PTO stretch?',
    calcSub: 'Drag the slider to see what Leavewise can do with your days.',
    calcPrefix: 'I have',
    calcSuffix: 'PTO days',
    calcResult: 'You could get up to',
    calcDaysOff: 'days off',
    calcEfficiency: 'efficiency',
    calcCta: 'See my personalized plan',

    trustBrowser: 'Runs in your browser',
    trustBrowserSub: 'Nothing stored on servers',
    trustNoAccount: 'No account needed',
    trustNoAccountSub: 'Start planning instantly',
    trustFree: 'Free forever',
    trustFreeSub: 'No premium tier, no paywall',
    trustCountries: '100+ countries',
    trustCountriesSub: 'Official holiday data',

    howTitle: 'How it works',
    howSub: 'Three inputs. One plan. Maximum life.',
    how1Title: 'Tell us your situation',
    how1Desc: 'Enter your country, the year you\'re planning, and how many PTO days you have available.',
    how2Title: 'We find the sweet spots',
    how2Desc: 'Our algorithm scans every public holiday, weekend, and calendar gap to find where a few PTO days gets you the most consecutive time off.',
    how3Title: 'Book the trip',
    how3Desc: 'For each optimized window we surface flight deals for those exact dates — already aligned to your schedule.',

    featTitle: 'Everything you need to plan smarter',
    featSub: 'More than a calculator — a complete planning toolkit.',
    feat1Title: 'Smart optimization',
    feat1Desc: 'Every holiday bridge, gap, and long weekend found automatically. Our algorithm maximizes time off per PTO day.',
    feat2Title: 'Real-time flight deals',
    feat2Desc: 'See live flight prices for your exact windows. Spot cheaper departure dates and book directly.',
    feat3Title: 'Calendar export',
    feat3Desc: 'One-click .ics download drops your PTO plan straight into Outlook, Google Calendar, or Apple Calendar.',
    feat4Title: 'Per-window control',
    feat4Desc: 'Adjust PTO on individual windows and watch the rest rebalance in real time. You stay in charge.',

    perfectTitle: 'Perfect for',
    perfect1: 'Office workers who want more life with less PTO',
    perfect2: 'Remote teams coordinating time off across time zones',
    perfect3: 'Expats and immigrants navigating new holiday calendars',
    perfect4: 'Families planning school-break trips without burning all PTO',
    perfect5: 'Frequent travelers who want flights aligned to PTO windows',
    perfect6: 'Anyone who feels guilty taking time off but shouldn\'t',

    sampleTitle: 'Sample optimized windows',
    sampleSub: 'Real suggestions Leavewise generates for the US in 2026.',
    sampleDaysOff: 'days off',
    samplePto: 'PTO',

    proofTitle: 'People love this',
    proofSub: 'Office workers who stopped leaving PTO on the table.',

    faqTitle: 'Common questions',
    faqSub: 'Everything you want to know before you start.',
    faq1Q: 'Is this really free?',
    faq1A: 'Yes, completely free — no account, no paywall, no "premium tier". The tool runs entirely in your browser. We make money through affiliate links when you choose to book flights.',
    faq2Q: 'What countries are supported?',
    faq2A: 'We pull official public holiday data for 100+ countries including US (with state-level holidays), South Korea, Canada, UK, Germany, Japan, Australia, and many more. Company-specific holidays can be added manually.',
    faq3Q: 'How accurate is the optimization?',
    faq3A: 'The optimizer considers every public holiday, weekend, and bridge opportunity in your year. It ranks windows by PTO efficiency (days off per PTO day) and respects your total budget. You can fine-tune individual windows after.',
    faq4Q: 'Does it store my data?',
    faq4A: 'Your settings are saved locally in your browser so they persist across sessions. Nothing is ever sent to a server. There is no database, no login, no tracking.',
    faq5Q: 'Can I use this for my whole team?',
    faq5A: 'Currently Leavewise is designed for individual planning. You can share your optimized plan via a link or by downloading the calendar file (.ics).',

    ctaTitle: 'Stop wasting PTO days',
    ctaSub: 'The average office worker leaves 3-5 bonus vacation days on the table every year by not aligning PTO with holidays.',
    ctaNote: 'Takes 30 seconds. No account. No catch.',
    ctaBtn: 'Plan my time off',
    mobileCta: 'Plan my time off — it\'s free',

    footerData: 'Holiday data from',
    footerFlights: 'Flight links via affiliate programs.',

    // Testimonials
    t1Quote: 'I had 12 PTO days. Leavewise turned them into 5 separate trips by finding bridge days I never would have spotted.',
    t1Name: 'Jamie K.', t1Role: 'Product Manager',
    t2Quote: 'Saved me 2 PTO days on our family Thanksgiving trip just by shifting the window one day. That\'s a free long weekend.',
    t2Name: 'Priya S.', t2Role: 'Engineering Lead',
    t3Quote: 'The flight deals for each window are clutch. Booked a round-trip to Lisbon for $380 on dates I wouldn\'t have considered.',
    t3Name: 'Marcus T.', t3Role: 'Designer',

    // US sample windows
    sw1Label: 'Mar 28 – Apr 6 · Around Easter',
    sw2Label: 'May 23 – Jun 1 · Long weekend',
    sw3Label: 'Nov 26 – Nov 30 · Thanksgiving',

    // KR sample windows
    krSw1Label: 'Feb 14 – 22 · Seollal (Lunar New Year)',
    krSw2Label: 'Sep 23 – 27 · Chuseok',
    krSw3Label: 'Oct 3 – 11 · Foundation Day & Hangul Day',
    krSampleSub: 'Real suggestions Leavewise generates for South Korea in 2026.',

    calMonth: 'April 2026',
    calPto: 'PTO', calHol: 'Holiday', calWknd: 'Weekend',
    calDaysOff: 'days off', calPtoUsed: 'PTO used',

    emailTitle: 'Get your free 2026 PTO calendar',
    emailSub: 'A printable calendar with every holiday and optimized window highlighted. No spam, unsubscribe anytime.',
    emailPlaceholder: 'you@company.com',
    emailCta: 'Get it free',
    emailSuccess: 'Check your inbox — your calendar is on its way!',
    emailError: 'Something went wrong. Please try again.',
  },
  ko: {
    navCta: '무료로 시작하기',
    badge: '100개국 이상 · 영원히 무료',
    heroTitle1: '소중한 내 휴가,',
    heroTitle2: '징검다리로',
    heroTitle3: '더 길게 떠나세요.',
    heroSub: 'Leavewise가 공휴일 사이 모든 징검다리를 찾아 드립니다 — 연차는 덜 쓰고, 더 길고 풍성한 휴가를 만들어 드립니다.',
    heroCta: '내 휴가 최적화하기',
    heroNote: '가입 없이 바로 시작',
    heroAccountNote: '계정도, 비밀번호도, 복잡함도 없어요. 연차 기록을 저장하고 싶을 때만 가입하면 돼요.',

    calcTitle: '내 연차, 얼마나 늘릴 수 있을까?',
    calcSub: '슬라이더를 움직여 Leavewise가 만들어 주는 최적의 플랜을 확인하세요.',
    calcPrefix: '연차',
    calcSuffix: '일 보유',
    calcResult: '최대',
    calcDaysOff: '일 휴가 가능',
    calcEfficiency: '효율',
    calcCta: '내 맞춤 플랜 확인하기',

    trustBrowser: '브라우저에서 실행',
    trustBrowserSub: '서버에 데이터 저장 없음',
    trustNoAccount: '계정 불필요',
    trustNoAccountSub: '바로 시작하세요',
    trustFree: '영원히 무료',
    trustFreeSub: '유료 요금제 없음',
    trustCountries: '100개국 이상',
    trustCountriesSub: '공식 공휴일 데이터',

    howTitle: '사용 방법',
    howSub: '3가지 입력. 하나의 플랜. 최대한의 삶.',
    how1Title: '상황을 알려주세요',
    how1Desc: '국가, 계획하는 연도, 사용 가능한 연차 일수를 입력하세요.',
    how2Title: '최적의 구간을 찾습니다',
    how2Desc: '알고리즘이 모든 공휴일, 주말, 캘린더 빈틈을 분석해 적은 연차로 가장 긴 연속 휴가를 찾아냅니다.',
    how3Title: '여행을 예약하세요',
    how3Desc: '최적화된 각 구간에 맞는 항공편 딜을 바로 확인할 수 있습니다.',

    featTitle: '스마트한 계획을 위한 모든 것',
    featSub: '단순 계산기 그 이상 — 완벽한 플래닝 툴킷.',
    feat1Title: '스마트 최적화',
    feat1Desc: '모든 공휴일 브릿지, 빈틈, 긴 주말을 자동으로 찾아냅니다. 연차 1일당 최대 휴가를 만들어요.',
    feat2Title: '실시간 항공편 딜',
    feat2Desc: '최적화된 날짜에 맞는 실시간 항공권 가격을 확인하고 바로 예약하세요.',
    feat3Title: '캘린더 내보내기',
    feat3Desc: '원클릭으로 .ics 파일을 다운로드해 Outlook, Google 캘린더, Apple 캘린더에 바로 추가하세요.',
    feat4Title: '구간별 세밀한 조절',
    feat4Desc: '각 구간의 연차를 조절하면 나머지가 실시간으로 재배분됩니다.',

    perfectTitle: '이런 분들을 위한 서비스',
    perfect1: '적은 연차로 더 많은 여행을 원하는 직장인',
    perfect2: '시차를 넘어 휴가를 조율하는 원격 근무 팀',
    perfect3: '새로운 나라의 공휴일에 적응 중인 해외 거주자',
    perfect4: '방학에 맞춰 가족 여행을 계획하는 부모님',
    perfect5: '연차 기간에 맞는 항공편을 찾는 여행 애호가',
    perfect6: '쉬는 게 미안하지만, 그래도 쉬어야 하는 모든 분',

    sampleTitle: '샘플 최적화 구간',
    sampleSub: '2026년 미국 기준 Leavewise가 생성한 실제 추천.',
    sampleDaysOff: '일 휴가',
    samplePto: '연차',

    proofTitle: '사용자 후기',
    proofSub: '연차를 허투루 쓰지 않게 된 직장인들.',

    faqTitle: '자주 묻는 질문',
    faqSub: '시작하기 전에 궁금한 모든 것.',
    faq1Q: '정말 무료인가요?',
    faq1A: '네, 완전히 무료입니다 — 계정도, 유료 벽도, "프리미엄" 등급도 없습니다. 모든 것이 브라우저에서 실행됩니다. 항공편 예약 시 제휴 링크를 통해 수익을 얻습니다.',
    faq2Q: '어떤 나라를 지원하나요?',
    faq2A: '미국(주별 공휴일 포함), 한국, 캐나다, 영국, 독일, 일본, 호주 등 100개국 이상의 공식 공휴일 데이터를 제공합니다. 회사 자체 휴일도 수동으로 추가 가능합니다.',
    faq3Q: '최적화가 얼마나 정확한가요?',
    faq3A: '모든 공휴일, 주말, 브릿지 기회를 분석합니다. 연차 효율(연차 1일당 휴가 일수)로 구간을 순위 매기고, 총 예산을 준수합니다. 이후 세부 조정도 가능합니다.',
    faq4Q: '데이터가 저장되나요?',
    faq4A: '설정은 브라우저에만 로컬 저장되어 세션 간 유지됩니다. 서버로 전송되는 것은 없습니다. 데이터베이스도, 로그인도, 추적도 없습니다.',
    faq5Q: '팀 전체가 사용할 수 있나요?',
    faq5A: '현재 Leavewise는 개인 플래닝용입니다. 링크 공유나 캘린더 파일(.ics) 다운로드로 최적화 결과를 공유할 수 있습니다.',

    ctaTitle: '연차 낭비, 이제 그만',
    ctaSub: '평균 직장인은 매년 공휴일과 연차를 맞추지 않아 3-5일의 보너스 휴가를 놓칩니다.',
    ctaNote: '30초면 됩니다. 계정 불필요. 함정 없음.',
    ctaBtn: '내 휴가 최적화하기',
    mobileCta: '무료로 내 휴가 최적화하기',

    footerData: '공휴일 데이터:',
    footerFlights: '항공편 링크는 제휴 프로그램을 통해 제공됩니다.',

    t1Quote: '12일 연차로 5번의 여행을 만들었어요. 혼자서는 절대 찾지 못했을 브릿지 데이를 찾아줬습니다.',
    t1Name: 'Jamie K.', t1Role: '프로덕트 매니저',
    t2Quote: '추수감사절 가족 여행에서 하루만 옮겨도 연차 2일을 아꼈어요. 공짜 긴 주말이죠.',
    t2Name: 'Priya S.', t2Role: '엔지니어링 리드',
    t3Quote: '각 구간에 맞는 항공편 딜이 정말 좋아요. 생각도 못한 날짜에 리스본 왕복 $380에 예약했습니다.',
    t3Name: 'Marcus T.', t3Role: '디자이너',

    // US sample windows
    sw1Label: '3/28 – 4/6 · 부활절 전후',
    sw2Label: '5/23 – 6/1 · 긴 주말',
    sw3Label: '11/26 – 11/30 · 추수감사절',

    // KR sample windows
    krSw1Label: '2/14 – 2/22 · 설날 연휴',
    krSw2Label: '9/23 – 9/27 · 추석 연휴',
    krSw3Label: '10/3 – 10/11 · 개천절·한글날',
    krSampleSub: '2026년 한국 기준 Leavewise가 생성한 실제 추천.',

    calMonth: '2026년 4월',
    calPto: '연차', calHol: '공휴일', calWknd: '주말',
    calDaysOff: '일 휴가', calPtoUsed: '연차 사용',

    emailTitle: '2026 연차 캘린더 무료 다운로드',
    emailSub: '모든 공휴일과 최적화된 구간이 표시된 인쇄용 캘린더입니다. 스팸 없음, 언제든 구독 취소 가능.',
    emailPlaceholder: '이메일을 입력하세요',
    emailCta: '무료로 받기',
    emailSuccess: '받은 편지함을 확인하세요 — 캘린더가 전송되었습니다!',
    emailError: '문제가 발생했습니다. 다시 시도해 주세요.',
  },
};

// ── Data ──────────────────────────────────────────────────────────

const US_SAMPLE_WINDOWS = [
  { days: 10, pto: 4, efficiency: 2.5, holidays: ['Good Friday', 'Easter Monday'] },
  { days: 10, pto: 6, efficiency: 1.7, holidays: ['Memorial Day'] },
  { days: 5, pto: 2, efficiency: 2.5, holidays: ['Thanksgiving'] },
];

const KR_SAMPLE_WINDOWS = [
  { days: 9, pto: 2, efficiency: 4.5, holidays: ['설날 (Seollal)'] },
  { days: 5, pto: 1, efficiency: 5.0, holidays: ['추석 (Chuseok)'] },
  { days: 9, pto: 4, efficiency: 2.25, holidays: ['개천절', '한글날'] },
];

const MINI_CALENDAR = [
  ['w', 'w', 'r', 'h', 'p', 'p', 'w'],
  ['w', 'p', 'p', 'p', 'h', 'w', 'w'],
  ['w', 'r', 'r', 'r', 'r', 'r', 'w'],
  ['w', 'r', 'r', 'r', 'r', 'r', 'w'],
];

const DAY_STYLES: Record<string, string> = {
  w: 'bg-stone-warm',
  h: 'bg-sage',
  p: 'bg-coral',
  r: 'bg-white border border-border',
};

function estimateDaysOff(pto: number): number {
  if (pto <= 0) return 0;
  const eff = Math.max(1.6, 2.8 - pto * 0.03);
  return Math.round(pto * eff);
}

// ── Components ────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-sm font-semibold text-ink">{q}</span>
        <svg
          className={`w-4 h-4 shrink-0 text-ink-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-ink-muted leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

const FEAT_ICONS = [
  <svg key="1" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>,
  <svg key="2" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>,
  <svg key="3" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
  <svg key="4" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>,
];

const TRUST_ICONS = [
  <svg key="1" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  <svg key="2" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>,
  <svg key="3" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  <svg key="4" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 10-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036" /></svg>,
];

// ── Props ─────────────────────────────────────────────────────────

interface LandingPageContentProps {
  initialLocale?: Locale;
  country?: 'US' | 'KR';
}

// ── Page ──────────────────────────────────────────────────────────

export function LandingPageContent({ initialLocale, country = 'US' }: LandingPageContentProps) {
  const [ptoDays, setPtoDays] = useState(15);
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locale, setLocale] = useState<Locale>(() => {
    if (initialLocale) return initialLocale;
    if (typeof window === 'undefined') return 'en';
    try {
      const saved = localStorage.getItem('leavewise_locale');
      if (saved === 'ko') return 'ko';
    } catch { /* ok */ }
    return 'en';
  });
  const daysOff = estimateDaysOff(ptoDays);
  const l = t[locale];

  const isKR = country === 'KR';
  const optimizeHref = isKR ? '/optimize?country=KR' : '/optimize';
  const sampleWindows = isKR ? KR_SAMPLE_WINDOWS : US_SAMPLE_WINDOWS;
  const sampleSubText = isKR ? (locale === 'ko' ? l.krSampleSub : t.en.krSampleSub) : l.sampleSub;
  const swLabels = isKR
    ? [l.krSw1Label, l.krSw2Label, l.krSw3Label]
    : [l.sw1Label, l.sw2Label, l.sw3Label];

  // Persist locale & country preferences
  useEffect(() => {
    try {
      localStorage.setItem('leavewise_locale', locale);
      if (isKR) {
        localStorage.setItem('leavewise_default_country', 'KR');
      }
    } catch { /* ok */ }
  }, [locale, isKR]);

  const cycleTheme = () => {
    try {
      const current = localStorage.getItem('leavewise_theme');
      const next = !current ? 'light' : current === 'light' ? 'dark' : null;
      if (next) {
        localStorage.setItem('leavewise_theme', next);
        document.documentElement.dataset.theme = next;
      } else {
        localStorage.removeItem('leavewise_theme');
        delete document.documentElement.dataset.theme;
      }
    } catch { /* ok */ }
  };

  const toggleLocale = () => {
    const next: Locale = locale === 'en' ? 'ko' : 'en';
    setLocale(next);
    try { localStorage.setItem('leavewise_locale', next); } catch { /* ok */ }
  };

  const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || emailStatus === 'loading') return;
    setEmailStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), locale }),
      });
      if (res.ok) {
        trackEmailSignup();
        setEmailStatus('success');
      } else {
        setEmailStatus('error');
      }
    } catch {
      setEmailStatus('error');
    }
  }, [emailInput, emailStatus, locale]);

  const trustItems = [
    { label: l.trustBrowser, sub: l.trustBrowserSub },
    { label: l.trustNoAccount, sub: l.trustNoAccountSub },
    { label: l.trustFree, sub: l.trustFreeSub },
    { label: l.trustCountries, sub: l.trustCountriesSub },
  ];
  const howSteps = [
    { step: '01', title: l.how1Title, desc: l.how1Desc },
    { step: '02', title: l.how2Title, desc: l.how2Desc },
    { step: '03', title: l.how3Title, desc: l.how3Desc },
  ];
  const features = [
    { title: l.feat1Title, desc: l.feat1Desc },
    { title: l.feat2Title, desc: l.feat2Desc },
    { title: l.feat3Title, desc: l.feat3Desc },
    { title: l.feat4Title, desc: l.feat4Desc },
  ];
  const faqItems = [
    { q: l.faq1Q, a: l.faq1A }, { q: l.faq2Q, a: l.faq2A },
    { q: l.faq3Q, a: l.faq3A }, { q: l.faq4Q, a: l.faq4A },
    { q: l.faq5Q, a: l.faq5A },
  ];
  const testimonials = [
    { quote: l.t1Quote, name: l.t1Name, role: l.t1Role },
    { quote: l.t2Quote, name: l.t2Name, role: l.t2Role },
    { quote: l.t3Quote, name: l.t3Name, role: l.t3Role },
  ];
  const perfectForItems = [
    l.perfect1, l.perfect2, l.perfect3,
    l.perfect4, l.perfect5, l.perfect6,
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href={isKR ? '/ko' : '/'} className="text-xl font-display font-semibold text-ink tracking-tight">
          Leavewise
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLocale}
            className="flex items-center justify-center h-8 px-2 text-[11px] font-semibold text-ink-muted hover:text-teal transition-colors rounded-lg hover:bg-cream-dark border border-border"
            aria-label="Switch language"
          >
            {locale === 'en' ? '한국어' : 'EN'}
          </button>
          <button
            onClick={cycleTheme}
            className="flex items-center justify-center w-8 h-8 text-ink-muted hover:text-teal transition-colors rounded-lg hover:bg-cream-dark"
            aria-label="Toggle theme"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          </button>
          <Link
            href={optimizeHref}
            className="text-sm font-medium text-teal hover:text-teal-hover transition-colors hidden sm:inline"
          >
            {l.navCta} →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-sage-light text-sage text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-sage/20">
              <span className="w-1.5 h-1.5 bg-sage rounded-full" />
              {l.badge}
            </div>

            <h1 className="text-5xl md:text-6xl font-display font-semibold text-ink leading-[1.08] tracking-tight mb-6">
              {l.heroTitle1}
              <br />
              <span className="text-coral">{l.heroTitle2}</span>
              <br />
              {l.heroTitle3}
            </h1>

            <p className="text-lg text-ink-muted leading-relaxed mb-10 max-w-md">
              {l.heroSub}
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href={optimizeHref}
                className="inline-flex items-center gap-2 bg-teal text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-teal-hover transition-colors text-sm"
              >
                {l.heroCta}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <span className="text-sm text-ink-muted">{l.heroNote}</span>
            </div>
            <p className="text-xs text-ink-muted/70 mt-3 max-w-sm leading-relaxed">
              {l.heroAccountNote}
            </p>
          </div>

          {/* Calendar preview — desktop */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-ink font-display">{l.calMonth}</span>
                <div className="flex gap-3">
                  {[
                    { color: 'bg-coral', label: l.calPto },
                    { color: 'bg-sage', label: l.calHol },
                    { color: 'bg-stone-warm', label: l.calWknd },
                  ].map((item) => (
                    <span key={item.label} className="flex items-center gap-1 text-[10px] text-ink-muted font-medium">
                      <span className={`w-2 h-2 rounded-sm ${item.color}`} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {(locale === 'ko' ? ['일', '월', '화', '수', '목', '금', '토'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']).map((d) => (
                  <div key={d} className="text-[10px] font-medium text-ink-muted text-center py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {MINI_CALENDAR.flat().map((type, i) => (
                  <div key={i} className={`aspect-square rounded-md ${DAY_STYLES[type] ?? ''}`} />
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-display font-semibold text-ink">10</div>
                  <div className="text-[10px] text-ink-muted font-medium">{l.calDaysOff}</div>
                </div>
                <div>
                  <div className="text-2xl font-display font-semibold text-coral">4</div>
                  <div className="text-[10px] text-ink-muted font-medium">{l.calPtoUsed}</div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-xs font-semibold text-sage bg-sage-light px-2 py-1 rounded-full">
                    2.5x {l.calcEfficiency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PTO CALCULATOR */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl border border-border p-8 md:p-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-ink mb-2">{l.calcTitle}</h2>
            <p className="text-sm text-ink-muted mb-8">{l.calcSub}</p>
            <div className="mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-sm font-medium text-ink-soft">{l.calcPrefix}</span>
                <span className="text-3xl font-display font-semibold text-teal min-w-[2.5rem] text-center">{ptoDays}</span>
                <span className="text-sm font-medium text-ink-soft">{l.calcSuffix}</span>
              </div>
              <input type="range" min={1} max={40} value={ptoDays} onChange={(e) => setPtoDays(parseInt(e.target.value, 10))} className="w-full max-w-sm accent-teal" />
              <div className="flex justify-between max-w-sm mx-auto text-[10px] text-ink-muted mt-1"><span>1</span><span>40</span></div>
            </div>
            <div className="bg-cream rounded-xl p-6 border border-border mb-6">
              <div className="text-sm text-ink-muted mb-1">{l.calcResult}</div>
              <div className="text-5xl md:text-6xl font-display font-semibold text-coral mb-1">{daysOff}</div>
              <div className="text-sm text-ink-muted">
                {l.calcDaysOff} · <span className="font-semibold text-sage">{(daysOff / ptoDays).toFixed(1)}x {l.calcEfficiency}</span>
              </div>
            </div>
            <Link href={optimizeHref} className="inline-flex items-center gap-2 bg-teal text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-teal-hover transition-colors text-sm">
              {l.calcCta}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {trustItems.map((item, i) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="mt-0.5 text-teal shrink-0">{TRUST_ICONS[i]}</div>
              <div>
                <div className="text-xs font-semibold text-ink">{item.label}</div>
                <div className="text-[10px] text-ink-muted">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PERFECT FOR */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-display font-semibold text-ink mb-2 text-center">{l.perfectTitle}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-10 max-w-4xl mx-auto">
          {perfectForItems.map((item) => (
            <div key={item} className="flex items-start gap-3 bg-white rounded-xl border border-border p-4">
              <svg className="w-4 h-4 text-sage mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-ink leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-display font-semibold text-ink mb-2 text-center">{l.howTitle}</h2>
        <p className="text-ink-muted text-center mb-12 text-sm">{l.howSub}</p>
        <div className="grid md:grid-cols-3 gap-5">
          {howSteps.map((item) => (
            <div key={item.step} className="bg-white rounded-2xl border border-border p-7">
              <div className="text-3xl font-display font-semibold text-coral/25 mb-4">{item.step}</div>
              <h3 className="text-base font-semibold text-ink mb-2">{item.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-display font-semibold text-ink mb-2 text-center">{l.featTitle}</h2>
        <p className="text-ink-muted text-center text-sm mb-10">{l.featSub}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div key={f.title} className="bg-white rounded-2xl border border-border p-6 flex gap-4">
              <div className="shrink-0 w-10 h-10 bg-teal-light text-teal rounded-xl flex items-center justify-center">{FEAT_ICONS[i]}</div>
              <div>
                <h3 className="text-sm font-semibold text-ink mb-1">{f.title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SAMPLE WINDOWS */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-display font-semibold text-ink mb-2 text-center">{l.sampleTitle}</h2>
        <p className="text-ink-muted text-center text-sm mb-10">{sampleSubText}</p>
        <div className="grid md:grid-cols-3 gap-4">
          {sampleWindows.map((w, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-6">
              <div className="text-xs text-ink-muted mb-3 font-medium">{swLabels[i]}</div>
              <div className="text-3xl font-display font-semibold text-ink mb-1">
                {w.days} {l.sampleDaysOff}
              </div>
              <div className="text-sm text-coral font-medium mb-4">
                {w.pto} {l.samplePto} {locale === 'en' && (w.pto === 1 ? 'day' : 'days')} {locale === 'ko' && '사용'}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {w.holidays.map((h) => (
                  <span key={h} className="text-[11px] bg-sage-light text-sage px-2 py-0.5 rounded-full font-medium border border-sage/10">{h}</span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1 bg-sage-light text-sage text-xs font-semibold px-2.5 py-1 rounded-full">
                {w.efficiency.toFixed(1)}x {l.calcEfficiency}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-display font-semibold text-ink mb-2 text-center">{l.proofTitle}</h2>
        <p className="text-ink-muted text-center text-sm mb-10">{l.proofSub}</p>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((item) => (
            <div key={item.name} className="bg-white rounded-2xl border border-border p-6">
              <p className="text-sm text-ink leading-relaxed mb-4">&ldquo;{item.quote}&rdquo;</p>
              <div>
                <div className="text-xs font-semibold text-ink">{item.name}</div>
                <div className="text-[10px] text-ink-muted">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-display font-semibold text-ink mb-2 text-center">{l.faqTitle}</h2>
        <p className="text-ink-muted text-center text-sm mb-10">{l.faqSub}</p>
        <div className="bg-white rounded-2xl border border-border px-6">
          {faqItems.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* EMAIL CAPTURE */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl border border-border p-8 text-center">
          <h2 className="text-2xl font-display font-semibold text-ink mb-2">{l.emailTitle}</h2>
          <p className="text-sm text-ink-muted mb-6 leading-relaxed">{l.emailSub}</p>
          {emailStatus === 'success' ? (
            <p className="text-sm font-semibold text-sage">{l.emailSuccess}</p>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={l.emailPlaceholder}
                className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-border bg-cream text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/50"
              />
              <button
                type="submit"
                disabled={emailStatus === 'loading'}
                className="px-5 py-2.5 bg-teal text-white text-sm font-semibold rounded-xl hover:bg-teal-hover transition-colors disabled:opacity-60"
              >
                {emailStatus === 'loading' ? '...' : l.emailCta}
              </button>
            </form>
          )}
          {emailStatus === 'error' && (
            <p className="text-xs text-coral mt-2">{l.emailError}</p>
          )}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-teal rounded-3xl p-10 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-3 text-white">{l.ctaTitle}</h2>
          <p className="text-white/70 mb-3 text-sm max-w-md mx-auto leading-relaxed">{l.ctaSub}</p>
          <p className="text-white/50 mb-8 text-xs">{l.ctaNote}</p>
          <Link href={optimizeHref} className="inline-flex items-center gap-2 bg-white text-teal font-semibold px-7 py-3.5 rounded-xl hover:bg-cream transition-colors text-sm">
            {l.ctaBtn}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-display font-semibold text-ink-muted text-sm">Leavewise</span>
            <a href={locale === 'ko' ? '/ko/blog' : '/blog'} className="text-xs text-ink-muted hover:text-teal transition-colors">
              {locale === 'ko' ? '블로그' : 'Blog'}
            </a>
          </div>
          <p className="text-xs text-ink-muted text-center md:text-right">
            {l.footerData}{' '}
            <a href="https://date.nager.at" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal transition-colors">Nager.Date</a>
            . {l.footerFlights}
          </p>
        </div>
      </footer>

      {/* STICKY MOBILE CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border p-3 md:hidden z-40">
        <Link href={optimizeHref} className="flex items-center justify-center gap-2 bg-teal text-white font-semibold py-3 rounded-xl text-sm w-full">
          {l.mobileCta}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </Link>
      </div>
    </div>
  );
}
