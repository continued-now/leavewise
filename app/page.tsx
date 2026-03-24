import Link from 'next/link';

const SAMPLE_WINDOWS = [
  {
    label: 'Mar 28 – Apr 6 · Around Easter',
    days: 10,
    pto: 4,
    bonus: 150,
    holidays: ['Good Friday', 'Easter Monday'],
  },
  {
    label: 'May 23 – Jun 1 · Long weekend',
    days: 10,
    pto: 6,
    bonus: 67,
    holidays: ['Memorial Day'],
  },
  {
    label: 'Nov 26 – Nov 30 · Thanksgiving',
    days: 5,
    pto: 2,
    bonus: 150,
    holidays: ['Thanksgiving'],
  },
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-display font-semibold text-ink tracking-tight">
          Leavewise
        </span>
        <Link
          href="/optimize"
          className="text-sm font-medium text-teal hover:text-teal-hover transition-colors"
        >
          Try it free →
        </Link>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-sage-light text-sage text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-sage/20">
              <span className="w-1.5 h-1.5 bg-sage rounded-full" />
              100+ countries · Free forever
            </div>

            <h1 className="text-5xl md:text-6xl font-display font-semibold text-ink leading-[1.08] tracking-tight mb-6">
              Work less.
              <br />
              <span className="text-coral">Be gone</span>
              <br />
              longer.
            </h1>

            <p className="text-lg text-ink-muted leading-relaxed mb-10 max-w-md">
              Leavewise finds every holiday bridge, long weekend, and calendar
              gap in your year — so you spend fewer PTO days and get more life.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/optimize"
                className="inline-flex items-center gap-2 bg-teal text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-teal-hover transition-colors text-sm"
              >
                Plan my time off
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <span className="text-sm text-ink-muted">No signup required</span>
            </div>
          </div>

          {/* Calendar preview */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-ink font-display">April 2026</span>
                <div className="flex gap-3">
                  {[
                    { color: 'bg-coral', label: 'PTO' },
                    { color: 'bg-sage', label: 'Holiday' },
                    { color: 'bg-stone-warm', label: 'Weekend' },
                  ].map((l) => (
                    <span key={l.label} className="flex items-center gap-1 text-[10px] text-ink-muted font-medium">
                      <span className={`w-2 h-2 rounded-sm ${l.color}`} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="text-[10px] font-medium text-ink-muted text-center py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {MINI_CALENDAR.flat().map((type, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-md ${DAY_STYLES[type] ?? ''}`}
                  />
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-display font-semibold text-ink">10</div>
                  <div className="text-[10px] text-ink-muted font-medium">days off</div>
                </div>
                <div>
                  <div className="text-2xl font-display font-semibold text-coral">4</div>
                  <div className="text-[10px] text-ink-muted font-medium">PTO used</div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-xs font-semibold text-sage bg-sage-light px-2 py-1 rounded-full">
                    +150% bonus
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STAT BAR */}
      <section className="border-y border-border bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center md:justify-between gap-8">
          {[
            { value: '10 days PTO', label: 'can become 28 days off' },
            { value: '100+', label: 'countries with holiday data' },
            { value: 'Free', label: 'no signup, no paywall, ever' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-display font-semibold text-ink">{s.value}</div>
              <div className="text-sm text-ink-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-display font-semibold text-ink mb-2 text-center">
          How it works
        </h2>
        <p className="text-ink-muted text-center mb-12 text-sm">Three inputs. One plan. Maximum life.</p>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              step: '01',
              title: 'Tell us your situation',
              desc: 'Enter your country, the year you\'re planning, and how many PTO days you have available.',
            },
            {
              step: '02',
              title: 'We find the sweet spots',
              desc: 'Our algorithm scans every public holiday, weekend, and calendar gap to find where a few PTO days gets you the most consecutive time off.',
            },
            {
              step: '03',
              title: 'Book the trip',
              desc: 'For each optimized window we surface flight deals for those exact dates — already aligned to your schedule.',
            },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl border border-border p-7">
              <div className="text-3xl font-display font-semibold text-coral/25 mb-4">{item.step}</div>
              <h3 className="text-base font-semibold text-ink mb-2">{item.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SAMPLE WINDOWS */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-display font-semibold text-ink mb-2 text-center">
          Sample optimized windows
        </h2>
        <p className="text-ink-muted text-center text-sm mb-10">
          Real suggestions Leavewise generates for the US in 2026.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {SAMPLE_WINDOWS.map((w) => (
            <div key={w.label} className="bg-white rounded-2xl border border-border p-6">
              <div className="text-xs text-ink-muted mb-3 font-medium">{w.label}</div>
              <div className="text-3xl font-display font-semibold text-ink mb-1">
                {w.days} days off
              </div>
              <div className="text-sm text-coral font-medium mb-4">
                {w.pto} PTO {w.pto === 1 ? 'day' : 'days'} used
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {w.holidays.map((h) => (
                  <span
                    key={h}
                    className="text-[11px] bg-sage-light text-sage px-2 py-0.5 rounded-full font-medium border border-sage/10"
                  >
                    {h}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1 bg-sage-light text-sage text-xs font-semibold px-2.5 py-1 rounded-full">
                +{w.bonus}% bonus days
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-teal rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-display font-semibold mb-3 text-white">
            Ready to stretch your time off?
          </h2>
          <p className="text-white/60 mb-8 text-sm">
            Takes 30 seconds. No account needed.
          </p>
          <Link
            href="/optimize"
            className="inline-flex items-center gap-2 bg-white text-teal font-semibold px-7 py-3.5 rounded-xl hover:bg-cream transition-colors text-sm"
          >
            Start planning →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display font-semibold text-ink-muted text-sm">Leavewise</span>
          <p className="text-xs text-ink-muted">
            Holiday data from{' '}
            <a
              href="https://date.nager.at"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-teal transition-colors"
            >
              Nager.Date
            </a>
            . Flight links via Skyscanner affiliate program.
          </p>
        </div>
      </footer>
    </div>
  );
}
