import Link from 'next/link';
import { CALENDAR_DATA, SOURCES, type CountryKey, type CalendarData } from '@/lib/calendar-data';
import PrintButton from './PrintButton';

// ─── Types ────────────────────────────────────────────────────────────────────

type DayType = 'holiday' | 'pto' | 'weekend' | 'workday';

interface CalendarDay {
  day: number;
  type: DayType;
}

// ─── Calendar logic ───────────────────────────────────────────────────────────

function buildMonthGrid(
  year: number,
  month: number,
  holidayDates: Set<string>,
  ptoDates: Set<string>,
): (CalendarDay | null)[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = new Date(year, month - 1, 1).getDay();

  const cells: (CalendarDay | null)[] = Array.from({ length: firstDow }, () => null);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dow = new Date(year, month - 1, d).getDay();
    const isWeekend = dow === 0 || dow === 6;

    let type: DayType;
    if (holidayDates.has(dateStr)) {
      type = 'holiday';
    } else if (isWeekend) {
      type = 'weekend';
    } else if (ptoDates.has(dateStr)) {
      type = 'pto';
    } else {
      type = 'workday';
    }

    cells.push({ day: d, type });
  }

  return cells;
}

function buildDataSets(data: CalendarData) {
  const holidayDates = new Set(data.holidays.map((h) => h.date));
  const ptoDates = new Set(data.windows.flatMap((w) => w.ptoDates));
  return { holidayDates, ptoDates };
}

// ─── Color map ────────────────────────────────────────────────────────────────

const DAY_STYLES: Record<DayType, { bg: string; color: string; fontWeight?: string }> = {
  holiday: { bg: '#4A7C5E', color: '#FFFFFF', fontWeight: '700' },
  pto:     { bg: '#D95740', color: '#FFFFFF', fontWeight: '700' },
  weekend: { bg: '#C6C1B9', color: '#44403C' },
  workday: { bg: '#FFFFFF', color: '#78716C' },
};

// ─── Month names ──────────────────────────────────────────────────────────────

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_NAMES_KR = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function getMonthLabel(monthIdx: number, country: CountryKey): string {
  if (country === 'kr') {
    return `${MONTH_ABBR[monthIdx]} · ${MONTH_NAMES_KR[monthIdx]}`;
  }
  return MONTH_NAMES_EN[monthIdx];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const DOW_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function MiniMonth({
  year,
  month,
  country,
  holidayDates,
  ptoDates,
}: {
  year: number;
  month: number;
  country: CountryKey;
  holidayDates: Set<string>;
  ptoDates: Set<string>;
}) {
  const cells = buildMonthGrid(year, month, holidayDates, ptoDates);
  const label = getMonthLabel(month - 1, country);

  const weeks: (CalendarDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7).concat(Array(7).fill(null)).slice(0, 7));
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E2DA',
        borderRadius: '8px',
        padding: '10px',
        breakInside: 'avoid',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-fraunces)',
          fontSize: '11px',
          fontWeight: 600,
          color: '#1A6363',
          marginBottom: '7px',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '3px' }}>
        {DOW_LABELS.map((d) => (
          <div
            key={d}
            style={{
              fontSize: '8px',
              color: '#78716C',
              textAlign: 'center',
              fontWeight: 500,
              padding: '1px 0',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
        {weeks.flat().map((cell, idx) => {
          if (!cell) {
            return <div key={idx} style={{ aspectRatio: '1', borderRadius: '3px' }} />;
          }
          const s = DAY_STYLES[cell.type];
          return (
            <div
              key={idx}
              style={{
                aspectRatio: '1',
                borderRadius: '3px',
                background: s.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                color: s.color,
                fontWeight: s.fontWeight ?? '400',
                border: cell.type === 'workday' ? '1px solid #E5E2DA' : 'none',
              }}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EfficiencyBadge({ value }: { value: number }) {
  let bg = '#F7F6F2';
  let color = '#78716C';
  if (value >= 3) { bg = '#FEF0ED'; color = '#D95740'; }
  else if (value >= 2) { bg = '#E8F3F3'; color = '#1A6363'; }

  return (
    <span
      style={{
        fontSize: '10px',
        fontWeight: 700,
        color,
        background: bg,
        borderRadius: '4px',
        padding: '2px 5px',
        whiteSpace: 'nowrap',
      }}
    >
      {value}x
    </span>
  );
}

function Sidebar({ data }: { data: CalendarData }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        height: '100%',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          color: '#78716C',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          marginBottom: '10px',
        }}
      >
        Top Windows
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {data.windows.map((w) => (
          <div
            key={w.id}
            style={{
              padding: '9px 10px',
              background: '#FFFFFF',
              border: '1px solid #E5E2DA',
              borderRadius: '7px',
              breakInside: 'avoid',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', marginBottom: '3px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#1C1917',
                  lineHeight: 1.3,
                  flex: 1,
                }}
              >
                {data.country === 'kr' ? w.labelLocal : w.label}
                {data.country === 'kr' && w.label !== w.labelLocal && (
                  <div style={{ fontSize: '9px', color: '#78716C', fontWeight: 400 }}>{w.label}</div>
                )}
              </div>
              <EfficiencyBadge value={w.efficiency} />
            </div>

            <div style={{ fontSize: '9px', color: '#78716C', marginBottom: '4px' }}>
              {w.totalDays} days · {w.ptoDays} PTO
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
              {w.holidays.slice(0, 2).map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: '8px',
                    color: '#4A7C5E',
                    background: '#EEF6F1',
                    borderRadius: '3px',
                    padding: '1px 5px',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '12px',
          padding: '10px',
          background: '#FFFFFF',
          border: '1px solid #E5E2DA',
          borderRadius: '7px',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            color: '#78716C',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: '8px',
          }}
        >
          Legend
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {(
            [
              { type: 'pto',     label: 'Suggested PTO' },
              { type: 'holiday', label: 'Public holiday' },
              { type: 'weekend', label: 'Weekend' },
              { type: 'workday', label: 'Work day' },
            ] as { type: DayType; label: string }[]
          ).map(({ type, label }) => {
            const s = DAY_STYLES[type];
            return (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    background: s.bg,
                    border: type === 'workday' ? '1px solid #E5E2DA' : 'none',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '9px', color: '#44403C' }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CalendarPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; src?: string }>;
}) {
  const { country: countryParam, src: srcParam } = await searchParams;

  const countryKey: CountryKey =
    countryParam === 'kr' ? 'kr' : 'us';
  const data = CALENDAR_DATA[countryKey];
  const { holidayDates, ptoDates } = buildDataSets(data);

  const srcKey = srcParam && SOURCES[srcParam] ? srcParam : 'web';
  const srcEntry = SOURCES[srcKey];
  const footerWatermark =
    srcKey === 'web'
      ? 'leavewise.com'
      : `leavewise.com/calendar/${srcKey}`;

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 1cm; }
          * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          body { background: #FFFFFF !important; }
        }
        @media screen {
          body { background: #F7F6F2; }
        }
      `}</style>

      <div
        className="no-print"
        style={{
          position: 'fixed',
          top: '12px',
          right: '16px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        <Link
          href="/calendar"
          style={{
            fontSize: '13px',
            color: '#78716C',
            textDecoration: 'none',
            padding: '9px 14px',
            border: '1px solid #E5E2DA',
            borderRadius: '8px',
            background: '#FFFFFF',
          }}
        >
          ← Back
        </Link>
        <PrintButton />
      </div>

      <div
        style={{
          width: '277mm',
          minHeight: '190mm',
          margin: '0 auto',
          padding: '12mm 10mm 8mm',
          background: '#FFFFFF',
          fontFamily: 'var(--font-dm-sans)',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10mm',
            paddingBottom: '5mm',
            borderBottom: '2px solid #E5E2DA',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{data.flag}</span>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1C1917',
                  lineHeight: 1.1,
                }}
              >
                Leavewise {data.year} · {data.countryName}
              </div>
              <div style={{ fontSize: '10px', color: '#78716C', marginTop: '1px' }}>
                {data.holidays.length} public holidays · {data.windows.length} optimized windows
              </div>
            </div>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: '13px',
              color: '#78716C',
              fontStyle: 'italic',
            }}
          >
            Make every PTO day count
          </div>
        </div>

        {/* Body: calendar grid + sidebar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '68% 32%',
            gap: '6mm',
            marginBottom: '8mm',
          }}
        >
          {/* 12-month grid: 4 cols × 3 rows */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(3, auto)',
              gap: '4px',
            }}
          >
            {months.map((m) => (
              <MiniMonth
                key={m}
                year={data.year}
                month={m}
                country={data.country}
                holidayDates={holidayDates}
                ptoDates={ptoDates}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div>
            <Sidebar data={data} />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #E5E2DA',
            paddingTop: '4mm',
          }}
        >
          <div style={{ fontSize: '9px', color: '#78716C' }}>
            Free at{' '}
            <span style={{ color: '#1A6363', fontWeight: 600 }}>leavewise.com</span>
            {' '}— plan your year in 30 seconds
          </div>
          <div style={{ fontSize: '9px', color: '#C6C1B9', letterSpacing: '0.02em' }}>
            {footerWatermark}
          </div>
        </div>
      </div>
    </>
  );
}
