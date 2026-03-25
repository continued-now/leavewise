import { Metadata } from 'next';
import Link from 'next/link';
import { CALENDAR_DATA, SOURCES, type CountryKey } from '@/lib/calendar-data';

export const metadata: Metadata = {
  title: '2026 PTO Calendar — Free Download — Leavewise',
  description:
    'Download your free 2026 PTO optimization calendar for the US or South Korea. Every holiday bridge and efficiency window pre-calculated.',
  openGraph: {
    title: '2026 PTO Calendar — Free Download — Leavewise',
    description:
      'Download your free 2026 PTO optimization calendar for the US or South Korea. Every holiday bridge pre-calculated.',
  },
  twitter: {
    title: '2026 PTO Calendar — Free Download — Leavewise',
    description:
      'Download your free 2026 PTO calendar for the US or South Korea. Holiday bridges pre-calculated.',
  },
};

const COUNTRY_VARIANTS: Record<CountryKey, { key: string; label: string }[]> = {
  us: [
    { key: 'web',     label: 'Direct link' },
    { key: 'reddit',  label: 'Reddit' },
    { key: 'twitter', label: 'Twitter / X' },
    { key: 'nl',      label: 'Newsletter' },
    { key: 'ph',      label: 'Product Hunt' },
    { key: 'insta',   label: 'Instagram' },
  ],
  kr: [
    { key: 'web',   label: 'Direct link' },
    { key: 'kakao', label: 'KakaoTalk' },
    { key: 'naver', label: 'Naver' },
    { key: 'blind', label: 'Blind' },
    { key: 'insta', label: 'Instagram' },
    { key: 'nl',    label: 'Newsletter' },
  ],
};

function efficiencyColor(e: number): string {
  if (e >= 3) return '#D95740';
  if (e >= 2) return '#1A6363';
  return '#78716C';
}

function efficiencyBg(e: number): string {
  if (e >= 3) return '#FEF0ED';
  if (e >= 2) return '#E8F3F3';
  return '#F7F6F2';
}

interface CountryCardProps {
  countryKey: CountryKey;
}

function CountryCard({ countryKey }: CountryCardProps) {
  const data = CALENDAR_DATA[countryKey];
  const variants = COUNTRY_VARIANTS[countryKey];
  const topWindows = data.windows.slice(0, 3);

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E2DA',
        borderRadius: '16px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '32px', lineHeight: 1 }}>{data.flag}</span>
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: '22px',
              fontWeight: 600,
              color: '#1C1917',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {data.countryName}
          </h2>
          <p style={{ fontSize: '13px', color: '#78716C', margin: '2px 0 0' }}>
            {data.year} · {data.holidays.length} public holidays · {data.windows.length} optimized windows
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
          Top windows
        </p>
        {topWindows.map((w) => (
          <div
            key={w.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '13px', color: '#44403C', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {countryKey === 'kr' ? w.labelLocal : w.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', color: '#78716C' }}>
                {w.totalDays}d · {w.ptoDays} PTO
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: efficiencyColor(w.efficiency),
                  background: efficiencyBg(w.efficiency),
                  borderRadius: '4px',
                  padding: '2px 6px',
                }}
              >
                {w.efficiency}x
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #E5E2DA', paddingTop: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
          Download calendar
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {variants.map(({ key, label }) => {
            const src = SOURCES[key];
            const href = `/calendar/print?country=${countryKey}&src=${key}`;
            const isPrimary = key === 'web';
            return (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: isPrimary ? '1.5px solid #1A6363' : '1px solid #E5E2DA',
                  background: isPrimary ? '#E8F3F3' : '#F7F6F2',
                  color: isPrimary ? '#1A6363' : '#44403C',
                  fontSize: '13px',
                  fontWeight: isPrimary ? 600 : 400,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <span>{label}</span>
                <span style={{ fontSize: '11px', color: '#78716C', fontFamily: 'monospace' }}>
                  {src.display}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F7F6F2',
        fontFamily: 'var(--font-dm-sans)',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: '8px' }}>
          <Link
            href="/"
            style={{
              fontSize: '13px',
              color: '#78716C',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Leavewise
          </Link>
        </div>

        <div style={{ marginBottom: '48px', marginTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#1A6363',
                background: '#E8F3F3',
                padding: '3px 8px',
                borderRadius: '4px',
              }}
            >
              Free download
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: 600,
              color: '#1C1917',
              margin: '0 0 12px',
              lineHeight: 1.15,
            }}
          >
            2026 PTO Calendar
          </h1>
          <p style={{ fontSize: '16px', color: '#78716C', margin: 0, maxWidth: '540px', lineHeight: 1.6 }}>
            Download your free 2026 PTO calendar — watermarked for sharing. Every holiday bridge and efficiency window pre-calculated.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          <CountryCard countryKey="us" />
          <CountryCard countryKey="kr" />
        </div>

        <div
          style={{
            marginTop: '48px',
            padding: '24px 28px',
            background: '#FFFFFF',
            border: '1px solid #E5E2DA',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#E8F3F3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A6363" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917', margin: '0 0 4px' }}>
              How to save as PDF
            </p>
            <p style={{ fontSize: '13px', color: '#78716C', margin: 0, lineHeight: 1.5 }}>
              Click any download button to open the print page, then use your browser's Save as PDF option (Ctrl+P or Cmd+P → Save as PDF). The calendar is optimized for A4 landscape.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
