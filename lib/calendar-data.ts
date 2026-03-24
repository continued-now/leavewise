export type CountryKey = 'us' | 'kr';

export interface CalendarHoliday {
  date: string;
  name: string;
  nameLocal: string;
}

export interface CalendarWindow {
  id: number;
  label: string;
  labelLocal: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  ptoDays: number;
  efficiency: number;
  holidays: string[];
  ptoDates: string[];
}

export interface CalendarData {
  country: CountryKey;
  countryName: string;
  flag: string;
  year: number;
  holidays: CalendarHoliday[];
  windows: CalendarWindow[];
}

// ─── US 2026 ──────────────────────────────────────────────────────────────────

const US_HOLIDAYS_2026: CalendarHoliday[] = [
  { date: '2026-01-01', name: "New Year's Day",         nameLocal: "New Year's Day" },
  { date: '2026-01-19', name: 'Martin Luther King Jr.', nameLocal: 'MLK Day' },
  { date: '2026-02-16', name: "Presidents' Day",         nameLocal: "Presidents' Day" },
  { date: '2026-05-25', name: 'Memorial Day',            nameLocal: 'Memorial Day' },
  { date: '2026-06-19', name: 'Juneteenth',              nameLocal: 'Juneteenth' },
  { date: '2026-07-03', name: 'Independence Day (obs.)', nameLocal: 'July 4th (obs.)' },
  { date: '2026-09-07', name: 'Labor Day',               nameLocal: 'Labor Day' },
  { date: '2026-10-12', name: 'Columbus Day',            nameLocal: 'Columbus Day' },
  { date: '2026-11-11', name: 'Veterans Day',            nameLocal: 'Veterans Day' },
  { date: '2026-11-26', name: 'Thanksgiving Day',        nameLocal: 'Thanksgiving' },
  { date: '2026-12-25', name: 'Christmas Day',           nameLocal: 'Christmas' },
];

const US_WINDOWS_2026: CalendarWindow[] = [
  {
    id: 1,
    label: 'MLK Day Weekend',
    labelLocal: 'MLK Day Weekend',
    startDate: '2026-01-17',
    endDate:   '2026-01-19',
    totalDays: 4,
    ptoDays: 1,
    efficiency: 4.0,
    holidays: ['Martin Luther King Jr.'],
    ptoDates: ['2026-01-16'],
  },
  {
    id: 2,
    label: "Presidents' Day Weekend",
    labelLocal: "Presidents' Day Weekend",
    startDate: '2026-02-14',
    endDate:   '2026-02-16',
    totalDays: 4,
    ptoDays: 1,
    efficiency: 4.0,
    holidays: ["Presidents' Day"],
    ptoDates: ['2026-02-13'],
  },
  {
    id: 3,
    label: 'Memorial Day Bridge',
    labelLocal: 'Memorial Day Bridge',
    startDate: '2026-05-23',
    endDate:   '2026-06-01',
    totalDays: 10,
    ptoDays: 4,
    efficiency: 2.5,
    holidays: ['Memorial Day'],
    ptoDates: ['2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29'],
  },
  {
    id: 4,
    label: 'Independence Day',
    labelLocal: 'Independence Day',
    startDate: '2026-06-27',
    endDate:   '2026-07-05',
    totalDays: 9,
    ptoDays: 4,
    efficiency: 2.25,
    holidays: ['Independence Day (obs.)'],
    ptoDates: ['2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02'],
  },
  {
    id: 5,
    label: 'Labor Day Bridge',
    labelLocal: 'Labor Day Bridge',
    startDate: '2026-09-05',
    endDate:   '2026-09-14',
    totalDays: 10,
    ptoDays: 4,
    efficiency: 2.5,
    holidays: ['Labor Day'],
    ptoDates: ['2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11'],
  },
  {
    id: 6,
    label: 'Thanksgiving Week',
    labelLocal: 'Thanksgiving Week',
    startDate: '2026-11-21',
    endDate:   '2026-11-30',
    totalDays: 10,
    ptoDays: 3,
    efficiency: 3.33,
    holidays: ['Thanksgiving Day'],
    ptoDates: ['2026-11-23', '2026-11-24', '2026-11-25'],
  },
  {
    id: 7,
    label: 'Christmas → New Year',
    labelLocal: 'Christmas → New Year',
    startDate: '2026-12-25',
    endDate:   '2027-01-01',
    totalDays: 8,
    ptoDays: 4,
    efficiency: 2.0,
    holidays: ['Christmas Day'],
    ptoDates: ['2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31'],
  },
];

// ─── KR 2026 ──────────────────────────────────────────────────────────────────

const KR_HOLIDAYS_2026: CalendarHoliday[] = [
  { date: '2026-01-01', name: "New Year's Day",            nameLocal: '신정' },
  { date: '2026-02-16', name: 'Seollal Holiday',           nameLocal: '설날 연휴' },
  { date: '2026-02-17', name: 'Seollal',                   nameLocal: '설날' },
  { date: '2026-02-18', name: 'Seollal Holiday',           nameLocal: '설날 연휴' },
  { date: '2026-03-01', name: 'Independence Movement Day', nameLocal: '삼일절' },
  { date: '2026-03-02', name: 'Substitute Holiday',        nameLocal: '대체공휴일' },
  { date: '2026-05-05', name: "Children's Day",            nameLocal: '어린이날' },
  { date: '2026-06-06', name: 'Memorial Day',              nameLocal: '현충일' },
  { date: '2026-08-15', name: 'Liberation Day',            nameLocal: '광복절' },
  { date: '2026-08-17', name: 'Substitute Holiday',        nameLocal: '대체공휴일' },
  { date: '2026-09-24', name: 'Chuseok Holiday',           nameLocal: '추석 연휴' },
  { date: '2026-09-25', name: 'Chuseok',                   nameLocal: '추석' },
  { date: '2026-09-26', name: 'Chuseok Holiday',           nameLocal: '추석 연휴' },
  { date: '2026-09-28', name: 'Substitute Holiday',        nameLocal: '대체공휴일' },
  { date: '2026-10-03', name: 'National Foundation Day',   nameLocal: '개천절' },
  { date: '2026-10-05', name: 'Substitute Holiday',        nameLocal: '대체공휴일' },
  { date: '2026-10-09', name: 'Hangul Day',                nameLocal: '한글날' },
  { date: '2026-12-25', name: 'Christmas Day',             nameLocal: '크리스마스' },
];

const KR_WINDOWS_2026: CalendarWindow[] = [
  {
    id: 1,
    label: 'Seollal Golden Week',
    labelLocal: '설날 황금연휴',
    startDate: '2026-02-14',
    endDate:   '2026-02-22',
    totalDays: 9,
    ptoDays: 2,
    efficiency: 4.5,
    holidays: ['Seollal', 'Seollal Holiday'],
    ptoDates: ['2026-02-19', '2026-02-20'],
  },
  {
    id: 2,
    label: 'Independence Day Bridge',
    labelLocal: '삼일절 연결',
    startDate: '2026-02-28',
    endDate:   '2026-03-02',
    totalDays: 4,
    ptoDays: 1,
    efficiency: 4.0,
    holidays: ['Independence Movement Day', 'Substitute Holiday'],
    ptoDates: ['2026-02-27'],
  },
  {
    id: 3,
    label: "Children's Day Bridge",
    labelLocal: '어린이날 연결',
    startDate: '2026-05-02',
    endDate:   '2026-05-10',
    totalDays: 9,
    ptoDays: 4,
    efficiency: 2.25,
    holidays: ["Children's Day"],
    ptoDates: ['2026-05-04', '2026-05-06', '2026-05-07', '2026-05-08'],
  },
  {
    id: 4,
    label: 'Liberation Day Week',
    labelLocal: '광복절 연휴',
    startDate: '2026-08-15',
    endDate:   '2026-08-23',
    totalDays: 9,
    ptoDays: 4,
    efficiency: 2.25,
    holidays: ['Liberation Day', 'Substitute Holiday'],
    ptoDates: ['2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21'],
  },
  {
    id: 5,
    label: 'Chuseok Golden Week',
    labelLocal: '추석 황금연휴',
    startDate: '2026-09-19',
    endDate:   '2026-09-28',
    totalDays: 10,
    ptoDays: 3,
    efficiency: 3.33,
    holidays: ['Chuseok', 'Chuseok Holiday', 'Substitute Holiday'],
    ptoDates: ['2026-09-21', '2026-09-22', '2026-09-23'],
  },
  {
    id: 6,
    label: 'Foundation + Hangul Bridge',
    labelLocal: '개천절·한글날 연결',
    startDate: '2026-10-03',
    endDate:   '2026-10-11',
    totalDays: 9,
    ptoDays: 3,
    efficiency: 3.0,
    holidays: ['National Foundation Day', 'Hangul Day', 'Substitute Holiday'],
    ptoDates: ['2026-10-06', '2026-10-07', '2026-10-08'],
  },
  {
    id: 7,
    label: 'Christmas → New Year',
    labelLocal: '크리스마스 → 신정',
    startDate: '2026-12-25',
    endDate:   '2027-01-01',
    totalDays: 8,
    ptoDays: 4,
    efficiency: 2.0,
    holidays: ['Christmas Day'],
    ptoDates: ['2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31'],
  },
];

export const CALENDAR_DATA: Record<CountryKey, CalendarData> = {
  us: {
    country: 'us',
    countryName: 'United States',
    flag: '🇺🇸',
    year: 2026,
    holidays: US_HOLIDAYS_2026,
    windows: US_WINDOWS_2026,
  },
  kr: {
    country: 'kr',
    countryName: 'South Korea',
    flag: '🇰🇷',
    year: 2026,
    holidays: KR_HOLIDAYS_2026,
    windows: KR_WINDOWS_2026,
  },
};

export const SOURCES: Record<string, { label: string; display: string }> = {
  web:     { label: 'web',         display: 'leavewise.com' },
  reddit:  { label: 'reddit',      display: 'leavewise.com • reddit' },
  twitter: { label: 'twitter',     display: 'leavewise.com • twitter' },
  kakao:   { label: 'kakao',       display: 'leavewise.com • kakaotalk' },
  naver:   { label: 'naver',       display: 'leavewise.com • naver' },
  blind:   { label: 'blind',       display: 'leavewise.com • blind' },
  nl:      { label: 'newsletter',  display: 'leavewise.com • newsletter' },
  ph:      { label: 'producthunt', display: 'leavewise.com • product hunt' },
  insta:   { label: 'instagram',   display: 'leavewise.com • instagram' },
};
