import type { Metadata } from 'next';
import Link from 'next/link';
import { TrueCostCalculator } from '@/components/tools/TrueCostCalculator';

export const metadata: Metadata = {
  title: 'True Cost Airport Calculator — Is the Cheaper Flight Actually Cheaper? | Leavewise',
  description:
    'Compare the real cost of flying from different airports. Factor in Uber, train, taxi costs and travel time to find out if the "cheaper" flight is actually a better deal.',
  keywords: [
    'airport comparison calculator',
    'true cost of flights',
    'alternative airport calculator',
    'is a cheaper flight worth it',
    'airport transport cost comparison',
  ],
  openGraph: {
    title: 'Is the Cheaper Flight Actually Cheaper?',
    description: 'Factor in Ubers, trains, and your time to find out.',
  },
};

export default function AirportComparePage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://leavewise.app' },
      { '@type': 'ListItem', position: 2, name: 'True Cost Airport Calculator', item: 'https://leavewise.app/tools/airport-compare' },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen py-10 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-ink-muted mb-6">
          <Link href="/" className="hover:text-teal transition-colors">Leavewise</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-soft">True Cost Calculator</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-ink tracking-tight leading-tight">
            Is the cheaper flight <span className="text-coral">actually</span> cheaper?
          </h1>
          <p className="mt-3 text-ink-soft leading-relaxed">
            A $130 savings on a flight means nothing if you spend $60 on an Uber and lose 2 hours
            sitting in traffic to a farther airport. This calculator factors in ground transportation
            costs, travel time, and how much you value your time to show you the <strong>true cost</strong> of
            each option.
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            The question isn&apos;t just &ldquo;which flight is cheapest?&rdquo; &mdash; it&apos;s &ldquo;how much do I value my time?&rdquo;
          </p>
        </header>

        {/* Calculator */}
        <TrueCostCalculator locale="en" />

        {/* Guide content */}
        <section className="mt-12 space-y-8">
          <h2 className="text-xl font-display font-bold text-ink">When alternative airports make sense (and when they don&apos;t)</h2>

          <div className="space-y-6 text-sm text-ink-soft leading-relaxed">
            <div className="p-4 rounded-xl border border-border bg-cream">
              <h3 className="font-display font-semibold text-sage text-base mb-2">It&apos;s worth it when...</h3>
              <ul className="space-y-2 list-disc list-inside marker:text-sage">
                <li><strong>The ticket savings exceed $150+ per person</strong> &mdash; enough to absorb transport costs and still come out ahead</li>
                <li><strong>Public transit connects both airports</strong> &mdash; a $5 train vs a $50 Uber changes everything</li>
                <li><strong>You&apos;re traveling with a group</strong> &mdash; transport costs are shared but ticket savings multiply per person</li>
                <li><strong>The alternative airport is actually closer to your destination</strong> &mdash; e.g., Burbank for visiting Hollywood vs LAX</li>
                <li><strong>You&apos;re not on a tight schedule</strong> &mdash; if you have all day, the extra hour matters less</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-border bg-cream">
              <h3 className="font-display font-semibold text-coral text-base mb-2">Skip the &ldquo;deal&rdquo; when...</h3>
              <ul className="space-y-2 list-disc list-inside marker:text-coral">
                <li><strong>Savings are under $80 per person</strong> &mdash; almost always eaten by transport and time</li>
                <li><strong>You need a rideshare to get there</strong> &mdash; Uber/Lyft surge pricing near airports can double the quoted price</li>
                <li><strong>You&apos;re arriving late at night</strong> &mdash; limited transit, surge pricing, and safety concerns at remote airports</li>
                <li><strong>You have a tight connection or early morning flight</strong> &mdash; the extra commute time adds real stress</li>
                <li><strong>You&apos;re traveling with kids or heavy luggage</strong> &mdash; the convenience tax of a longer transfer is much higher</li>
                <li><strong>Car rental is part of the plan</strong> &mdash; rental prices can vary wildly between airports in the same metro</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-border bg-cream">
              <h3 className="font-display font-semibold text-ink text-base mb-2">The &ldquo;time value&rdquo; mindset</h3>
              <p>
                Most budget travel advice ignores the cost of time. But time has real value, especially on vacation.
              </p>
              <p className="mt-2">
                Think of it this way: if someone offered you $30 to sit in a shuttle bus for 2 extra hours
                during your vacation, would you take it? That&apos;s effectively what you&apos;re doing when you fly
                into a cheaper, farther airport to save $30.
              </p>
              <p className="mt-2">
                The slider above lets you decide what your time is worth. Set it to $0 if you genuinely
                don&apos;t mind the extra travel. Set it higher if every vacation hour matters to you.
                There&apos;s no wrong answer &mdash; just an honest one.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-cream">
              <h3 className="font-display font-semibold text-ink text-base mb-2">Pro tips</h3>
              <ul className="space-y-2 list-disc list-inside marker:text-teal">
                <li><strong>Check ground transport BEFORE booking</strong> &mdash; Google Maps the route at your expected arrival time</li>
                <li><strong>Factor in both directions</strong> &mdash; the calculator doubles transport costs automatically</li>
                <li><strong>Check rental car prices at both airports</strong> &mdash; sometimes the &ldquo;cheaper&rdquo; airport has more expensive rentals</li>
                <li><strong>Consider parking if you&apos;re driving to the airport</strong> &mdash; alternative airports often have free/cheaper parking</li>
                <li><strong>Look at airline quality</strong> &mdash; budget carriers at alternative airports may charge for bags, seats, and changes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 p-5 rounded-xl bg-teal-light/40 border border-teal/10 text-center">
          <p className="text-sm font-semibold text-ink">
            Already know your travel dates?
          </p>
          <p className="text-xs text-ink-muted mt-1">
            Leavewise finds every efficient PTO window in your year and shows flight prices for each one.
          </p>
          <Link
            href="/optimize"
            className="mt-3 inline-block px-5 py-2.5 bg-teal text-white text-sm font-semibold rounded-lg hover:bg-teal-hover transition-colors"
          >
            Optimize your PTO
          </Link>
        </div>

        <footer className="mt-8 text-center text-xs text-ink-muted">
          <p>Transport costs and times are estimates based on typical fares. Always verify current prices.</p>
        </footer>
      </div>
    </main>
  );
}
