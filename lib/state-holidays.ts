// Computes government-mandated state-specific holidays for US states.
// Federal holidays come from Nager.Date; this adds what they miss.

function dateToStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** nth weekday (0=Sun…6=Sat) of given month (0-based). n=1 means first. */
function nthWeekday(year: number, month: number, weekday: number, n: number): string {
  const d = new Date(year, month, 1);
  while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
  d.setDate(d.getDate() + (n - 1) * 7);
  return dateToStr(d);
}

/** Last weekday occurrence in the month. */
function lastWeekday(year: number, month: number, weekday: number): string {
  const d = new Date(year, month + 1, 0); // last day of month
  while (d.getDay() !== weekday) d.setDate(d.getDate() - 1);
  return dateToStr(d);
}

/** Fixed date — returns as-is if valid, else undefined. */
function fixed(year: number, month: number, day: number): string {
  return dateToStr(new Date(year, month - 1, day));
}

/** Easter Sunday via the Anonymous Gregorian algorithm. */
function easter(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 1-based
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** Fat Tuesday (Mardi Gras): 47 days before Easter. */
function mardiGras(year: number): string {
  const e = easter(year);
  e.setDate(e.getDate() - 47);
  return dateToStr(e);
}

export interface StateHoliday {
  date: string;
  name: string;
}

export function getStateHolidays(year: number, stateCode: string): StateHoliday[] {
  switch (stateCode) {
    case 'US-AL': // Alabama
      return [
        { date: nthWeekday(year, 3, 1, 4), name: 'Confederate Memorial Day' },
        { date: nthWeekday(year, 5, 1, 1), name: "Jefferson Davis's Birthday" },
      ];

    case 'US-AK': // Alaska
      return [
        { date: lastWeekday(year, 2, 1), name: "Seward's Day" }, // last Monday of March
        { date: fixed(year, 10, 18), name: 'Alaska Day' },
      ];

    case 'US-CA': // California
      return [
        { date: fixed(year, 3, 31), name: 'Cesar Chavez Day' },
      ];

    case 'US-CO': // Colorado
      return [
        { date: fixed(year, 9, 24), name: 'Frances Xavier Cabrini Day' },
      ];

    case 'US-DE': // Delaware
      return [
        { date: fixed(year, 11, 2), name: 'Election Day' },
      ];

    case 'US-HI': // Hawaii
      return [
        { date: fixed(year, 3, 26), name: 'Prince Kūhiō Day' },
        { date: fixed(year, 6, 11), name: 'Kamehameha Day' },
        // Election Day (1st Tuesday after 1st Monday in November)
        { date: nthWeekday(year, 10, 2, 1), name: 'Election Day' },
      ];

    case 'US-IL': // Illinois
      return [
        { date: nthWeekday(year, 2, 1, 1), name: 'Casimir Pulaski Day' }, // 1st Monday of March
      ];

    case 'US-IN': // Indiana
      return [
        { date: nthWeekday(year, 3, 1, 3), name: 'Primary Election Day' },
      ];

    case 'US-KY': // Kentucky
      return [
        { date: fixed(year, 11, 2), name: 'Election Day' },
      ];

    case 'US-LA': // Louisiana
      return [
        { date: mardiGras(year), name: 'Mardi Gras' },
        { date: fixed(year, 11, 1), name: "All Saints' Day" },
      ];

    case 'US-MA': // Massachusetts
      return [
        { date: nthWeekday(year, 3, 1, 3), name: "Patriots' Day" }, // 3rd Monday of April
      ];

    case 'US-MD': // Maryland
      return [
        { date: nthWeekday(year, 10, 5, 4), name: 'American Indian Heritage Day' }, // 4th Friday of November
      ];

    case 'US-MS': // Mississippi
      return [
        { date: nthWeekday(year, 3, 1, 4), name: 'Confederate Memorial Day' },
      ];

    case 'US-MT': // Montana
      return [
        { date: fixed(year, 11, 2), name: 'Election Day' },
      ];

    case 'US-NJ': // New Jersey
      return [
        { date: fixed(year, 11, 2), name: 'Election Day' },
      ];

    case 'US-NY': // New York
      return [
        { date: fixed(year, 11, 2), name: 'Election Day' },
      ];

    case 'US-OH': // Ohio
      return [
        { date: fixed(year, 11, 2), name: 'Election Day' },
      ];

    case 'US-SC': // South Carolina
      return [
        { date: fixed(year, 5, 10), name: 'Confederate Memorial Day' },
      ];

    case 'US-TN': // Tennessee
      return [
        { date: fixed(year, 11, 2), name: 'Election Day' },
      ];

    case 'US-TX': // Texas
      return [
        { date: fixed(year, 3, 2), name: 'Texas Independence Day' },
        { date: fixed(year, 4, 21), name: 'San Jacinto Day' },
        { date: fixed(year, 8, 27), name: 'Lyndon B. Johnson Day' },
        { date: fixed(year, 12, 24), name: 'Christmas Eve (State)' },
        { date: fixed(year, 12, 26), name: 'Day After Christmas (State)' },
      ];

    case 'US-VA': // Virginia
      return [
        { date: fixed(year, 11, 2), name: 'Election Day' },
      ];

    case 'US-WV': // West Virginia
      return [
        { date: fixed(year, 6, 20), name: 'West Virginia Day' },
      ];

    case 'US-WI': // Wisconsin
      return [
        { date: fixed(year, 12, 24), name: 'Christmas Eve (State)' },
        { date: fixed(year, 12, 31), name: "New Year's Eve (State)" },
      ];

    default:
      return [];
  }
}
