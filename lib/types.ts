export interface Holiday {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties?: string[] | null;
  launchYear?: number | null;
  types: string[];
}

export type DayType =
  | 'workday'
  | 'weekend'
  | 'public-holiday'
  | 'company-holiday'
  | 'pto'
  | 'comp'
  | 'floating'
  | 'prebooked';

export interface DayData {
  dateStr: string;
  date: Date;
  dayOfWeek: number; // 0=Sun, 6=Sat
  isWeekend: boolean;
  isHoliday: boolean;       // public / government holiday
  isCompanyHoliday: boolean; // company-specific holiday (also a free day)
  holidayName?: string;
  isPrebooked: boolean;
  isPTO: boolean;            // optimizer-assigned or prebooked
  isFree: boolean;           // weekend || isHoliday || isCompanyHoliday
  windowId?: number;
  leaveType?: DayType;       // which pool the day came from
}

export interface LeavePool {
  ptoDays: number;
  compDays: number;
  floatingHolidays: number;
}

export interface CompanyConfig {
  name: string;
  holidayDates: string[]; // YYYY-MM-DD — free days, don't cost PTO
}

export interface BookendRisk {
  holidayName: string;
  holidayDate: string; // YYYY-MM-DD
  riskBefore: boolean; // PTO falls on workday immediately before this holiday
  riskAfter: boolean;  // PTO falls on workday immediately after this holiday
}

export interface VacationWindow {
  id: number;
  startDate: Date;
  endDate: Date;
  startStr: string;
  endStr: string;
  totalDays: number;
  ptoDaysUsed: number;
  efficiency: number;
  holidays: string[];
  month: string;
  skyscannerUrl: string;
  label: string;
  bookendRisks?: BookendRisk[];  // US only: holidays where adjacent PTO forfeits holiday pay
  premiumPayDays?: string[];     // US only: holiday names where working beats taking PTO
  crowdInsights?: CrowdInsight[];
  destinationIdeas?: DestinationIdea[];
  travelValueScore?: number;     // 0–100, higher = better travel value
}

export interface FlightDeal {
  price: number;
  currency: string;
  deeplink: string;       // Kiwi booking deeplink (with affiliate param)
  destination: string;    // e.g. "Tokyo"
  cheaperAlternative?: {
    date: string;         // YYYY-MM-DD
    price: number;
    savingPct: number;    // percent cheaper, e.g. 23
  };
}

export interface CrowdInsight {
  eventName: string;
  crowdLevel: 'peak' | 'high' | 'moderate';
  affectedRegions: string[];
  avoidRegionKeys: string[];
  note: string;
  overlapDays: number;
}

export interface DestinationIdea {
  region: string;
  flag: string;
  exampleCities: string[];
  priceOutlook: 'great' | 'good' | 'fair' | 'pricey';
  reason: string;
  avgTempC?: number;       // average high temp during the window
  dailyBudgetUSD?: number; // rough per-day cost (hotel + food + transport)
}

export interface OptimizationResult {
  days: DayData[];
  windows: VacationWindow[];
  totalLeaveUsed: number;
  remainingLeave: number;
  totalDaysOff: number;
}
