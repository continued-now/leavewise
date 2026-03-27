# Leavewise — Agent Action Plan (Granular)

> Structured for execution via OpenClaw + Codex 5.4
> Each task is a self-contained agent prompt — copy-paste directly into an agent session.
> Every instruction is literal. Do not interpret, infer, or improvise. Follow exactly.
>
> Source documents: `gtm.md`, `revenue-forecast.md`
> Project root: `/Users/constantlee/PTO-optimizer`
> Stack: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS
> Generated: 2026-03-24

---

## How to Use This File

Each task below has a `### Agent Prompt` section. That section is the **exact text** you send to the Codex 5.4 agent via OpenClaw. The agent should:
1. Execute the prompt verbatim
2. Create/modify only the files listed
3. Run the verification commands
4. Report back with the verification output

**Do not** combine multiple tasks into one prompt. Run them sequentially in the order listed. Each task assumes the previous tasks have been completed.

---

## Phase 0: Foundation (Months 1–2)

---

### P0-01: US Affiliate Signup Checklist

**Files created:** `docs/affiliate-signup-us.md`
**Depends on:** Nothing
**Human action required after:** Sign up for each program using the URLs and descriptions in the generated file

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/affiliate-signup-us.md with the EXACT content below. Create the docs/ directory if it does not exist.

---
BEGIN FILE CONTENT
---

# US Affiliate Program Signup Checklist

> Status: Use the checkboxes below to track progress. Update after each signup.

## 1. Skyscanner

- **Signup URL:** https://partners.skyscanner.net/affiliates/sign-up
- **Commission:** 30–50% of Skyscanner's revenue per booking (typically $0.50–$2.00 per click-out)
- **Cookie duration:** Session-based (no cookie — commission on click-out)
- **Payout minimum:** $10
- **Payout method:** PayPal or bank transfer
- **Application description to paste:**
  > Leavewise (https://leavewise.app) is a free PTO optimization tool that helps office workers maximize their time off by finding the best vacation windows around public holidays. When users see their optimized travel windows, we surface flight search links. We currently serve US and Korean markets. Our audience is high-intent: they have specific travel dates and are ready to search.
- **Status:** [ ] Applied  [ ] Approved  [ ] Links live
- **Account ID:** _(fill after approval)_

## 2. Booking.com

- **Signup URL:** https://www.booking.com/affiliate-program/v2/index.html
- **Commission:** 25–40% of Booking.com's commission (effectively 3–6% of booking value)
- **Cookie duration:** 30 days (varies by program tier)
- **Payout minimum:** €100
- **Payout method:** Bank transfer, PayPal
- **Application description to paste:**
  > Leavewise is a free vacation planning tool that optimizes PTO usage around public holidays. After generating optimized vacation windows with specific dates, we link users to hotel/flight search for those exact date ranges. Our audience consists of employed professionals with confirmed vacation dates — high conversion intent.
- **Status:** [ ] Applied  [ ] Approved  [ ] Links live
- **Account ID / aid parameter:** _(fill after approval)_

## 3. Hotels.com (Expedia Group)

- **Signup URL:** https://www.expediagroup.com/partners/affiliates
- **Commission:** 4–6% of booking value
- **Cookie duration:** 7 days
- **Payout minimum:** $50
- **Payout method:** Direct deposit, PayPal
- **Application description to paste:**
  > Leavewise is a free PTO optimizer that identifies the most efficient vacation windows for working professionals. After optimization, users receive specific travel date ranges. We link to Hotels.com for accommodation search on those exact dates. Our users have decided when to travel — they are looking for where to stay.
- **Status:** [ ] Applied  [ ] Approved  [ ] Links live
- **Account ID:** _(fill after approval)_

## 4. Expedia

- **Signup URL:** https://www.expediagroup.com/partners/affiliates
- **Commission:** 2–6% of booking value (varies by product: hotels, flights, packages)
- **Cookie duration:** 7 days
- **Payout minimum:** $50
- **Payout method:** Direct deposit, PayPal
- **Application description to paste:**
  > Leavewise helps users plan their PTO around public holidays to maximize consecutive days off. After generating an optimized vacation plan with specific date ranges, we direct users to book travel. Our audience is US office workers with confirmed PTO dates looking for flights and hotels.
- **Status:** [ ] Applied  [ ] Approved  [ ] Links live
- **Account ID:** _(fill after approval)_

---
END FILE CONTENT
---

VERIFICATION:
Run: cat docs/affiliate-signup-us.md | wc -l
Expected: The file should have approximately 55–65 lines.
Run: ls -la docs/affiliate-signup-us.md
Expected: File exists with non-zero size.
```

---

### P0-02: Korean Affiliate Signup Checklist

**Files created:** `docs/affiliate-signup-kr.md`
**Depends on:** Nothing

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/affiliate-signup-kr.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Korean Affiliate Program Signup Checklist

> Status: Use the checkboxes below to track progress. Update after each signup.

## 1. Naver 파트너스 (Naver Partners)

- **Signup URL:** https://partners.naver.com
- **Commission:** CPA model, ₩3,000–₩15,000 per booking (varies by category)
- **Cookie duration:** 30 days
- **Payout minimum:** ₩10,000
- **Payout method:** Naver Pay or Korean bank transfer
- **Application description to paste (Korean):**
  > Leavewise(리브와이즈)는 직장인들이 공휴일과 주말을 활용하여 연차를 최적으로 배치할 수 있도록 도와주는 무료 연차 최적화 도구입니다. 최적화된 휴가 일정이 생성되면, 해당 날짜에 맞는 여행 상품 검색 링크를 제공합니다. 주 사용자층은 확정된 휴가 일정을 가진 한국 직장인입니다.
- **Status:** [ ] Applied  [ ] Approved  [ ] Links live
- **Account ID:** _(fill after approval)_

## 2. Interpark Tours

- **Signup URL:** https://tour.interpark.com/ (파트너 프로그램 → 제휴 문의)
- **Commission:** ₩5,000–₩10,000 per tour/flight booking
- **Cookie duration:** 14 days
- **Payout minimum:** ₩30,000
- **Payout method:** Korean bank transfer
- **Application description to paste (Korean):**
  > Leavewise는 공휴일 기반 연차 최적화 도구입니다. 사용자가 최적화된 휴가 일정을 받은 후, 해당 날짜에 맞는 항공권과 투어 상품을 검색할 수 있도록 인터파크 투어 링크를 제공합니다.
- **Status:** [ ] Applied  [ ] Approved  [ ] Links live
- **Account ID:** _(fill after approval)_

## 3. 야놀자 (Yanolja)

- **Signup URL:** https://www.yanolja.com/ (비즈니스 제휴 → 제휴 신청)
- **Commission:** ₩3,000–₩8,000 per accommodation booking
- **Cookie duration:** 7 days
- **Payout minimum:** ₩30,000
- **Payout method:** Korean bank transfer
- **Application description to paste (Korean):**
  > Leavewise는 직장인 연차 최적화 무료 도구입니다. 최적 휴가 기간이 도출되면 해당 날짜의 숙소 검색 링크를 야놀자로 연결합니다. 사용자는 이미 여행 날짜가 확정된 상태이므로 예약 전환율이 높습니다.
- **Status:** [ ] Applied  [ ] Approved  [ ] Links live
- **Account ID:** _(fill after approval)_

## 4. 마이리얼트립 (MyRealTrip)

- **Signup URL:** https://www.myrealtrip.com/ (파트너 → 제휴 문의)
- **Commission:** 3–5% of booking value
- **Cookie duration:** 14 days
- **Payout minimum:** ₩50,000
- **Payout method:** Korean bank transfer
- **Application description to paste (Korean):**
  > Leavewise는 연차 최적화 도구로, 공휴일과 주말을 활용한 최적의 연차 사용 날짜를 추천합니다. 최적화 결과에서 마이리얼트립의 항공권 및 투어 상품 검색 링크를 제공하여, 여행 날짜가 확정된 고의향 사용자를 연결합니다.
- **Status:** [ ] Applied  [ ] Approved  [ ] Links live
- **Account ID:** _(fill after approval)_

## 5. CJ Affiliate Korea

- **Signup URL:** https://www.cj.com/ → Affiliate program
- **Commission:** Varies by advertiser (typically 2–5%)
- **Cookie duration:** Varies
- **Payout minimum:** $50
- **Payout method:** Wire transfer
- **Application description to paste (Korean):**
  > Leavewise는 한국과 미국 시장을 대상으로 하는 연차 최적화 도구입니다. 직장인 사용자에게 최적의 휴가 기간을 제안하고, 해당 날짜에 맞는 여행 상품 제휴 링크를 제공합니다.
- **Status:** [ ] Applied  [ ] Approved  [ ] Links live
- **Account ID:** _(fill after approval)_

---
END FILE CONTENT
---

VERIFICATION:
Run: cat docs/affiliate-signup-kr.md | wc -l
Expected: Approximately 60–75 lines.
Run: ls -la docs/affiliate-signup-kr.md
Expected: File exists with non-zero size.
```

---

### P0-03: Add Analytics Tracking to App

**Files created:** `lib/analytics.ts`
**Files modified:** `app/layout.tsx`, `components/WindowCard.tsx`, `app/optimize/page.tsx`
**Depends on:** Nothing (GA4 measurement ID will be added later by human)

#### Agent Prompt

```
You are working in the Next.js project at /Users/constantlee/PTO-optimizer.
The project uses Next.js 16 App Router with TypeScript and Tailwind CSS.

IMPORTANT: Read the AGENTS.md file first — it says "This is NOT the Next.js you know" and instructs you to read docs in node_modules/next/dist/docs/ before writing code. Follow that instruction.

TASK: Create an analytics utility and wire it into the app. Use Google Analytics 4 (gtag.js) with a placeholder measurement ID.

STEP 1: Create the file lib/analytics.ts with this EXACT content:

```typescript
/**
 * Google Analytics 4 event tracking for Leavewise.
 *
 * Measurement ID is injected via the GA_MEASUREMENT_ID constant below.
 * Set it to your real GA4 ID (G-XXXXXXXXXX) when ready.
 * While it is empty, all tracking calls are no-ops.
 */

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

type GtagCommand = 'config' | 'event' | 'set';

declare global {
  interface Window {
    gtag?: (...args: [GtagCommand, string, Record<string, unknown>?]) => void;
    dataLayer?: unknown[];
  }
}

function gtag(command: GtagCommand, targetOrEvent: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;
  window.gtag?.(command, targetOrEvent, params);
}

// ── Typed event helpers ──────────────────────────────────────────

/** User clicks "Optimize my leave" and results are generated. */
export function trackOptimize(country: string, ptoDays: number, windowCount: number): void {
  gtag('event', 'optimize', {
    event_category: 'engagement',
    country,
    pto_days: ptoDays,
    window_count: windowCount,
  });
}

/** User clicks an affiliate link (flight/hotel booking). */
export function trackAffiliateClick(provider: string, windowId: number, destination?: string): void {
  gtag('event', 'affiliate_click', {
    event_category: 'monetization',
    provider,
    window_id: windowId,
    destination: destination ?? 'unknown',
  });
}

/** User downloads a .ics calendar file. */
export function trackCalendarExport(windowCount: number): void {
  gtag('event', 'calendar_export', {
    event_category: 'engagement',
    window_count: windowCount,
  });
}

/** User copies dates to clipboard. */
export function trackCopyDates(windowId: number): void {
  gtag('event', 'copy_dates', {
    event_category: 'engagement',
    window_id: windowId,
  });
}

/** User clicks a premium upsell CTA (future). */
export function trackPremiumCTA(location: string): void {
  gtag('event', 'premium_cta_click', {
    event_category: 'monetization',
    location,
  });
}

/** User interacts with PTO calculator on landing page. */
export function trackCalculatorInteraction(ptoDays: number, estimatedDaysOff: number): void {
  gtag('event', 'calculator_interaction', {
    event_category: 'engagement',
    pto_days: ptoDays,
    estimated_days_off: estimatedDaysOff,
  });
}

/** Page view (called automatically by GA4, but useful for SPA navigation). */
export function trackPageView(url: string): void {
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
}
```

STEP 2: Modify app/layout.tsx to add the GA4 script tags.

Read the current app/layout.tsx first. Then add TWO script tags inside the <head> element, BEFORE the existing <script> tags. Add them as the first children of <head>:

```tsx
{/* Google Analytics 4 */}
{process.env.NEXT_PUBLIC_GA_ID && (
  <>
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
    />
    <script
      dangerouslySetInnerHTML={{
        __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}',{send_page_view:true});`,
      }}
    />
  </>
)}
```

Do NOT remove any existing content from layout.tsx. Only ADD these script tags.

STEP 3: Run the build to verify.

Run: npm run build
Expected: Build completes with no TypeScript errors. The analytics module should compile even without a GA_ID set.

VERIFICATION:
1. Run: grep -c "trackOptimize\|trackAffiliateClick\|trackCalendarExport\|trackCopyDates\|trackPremiumCTA\|trackCalculatorInteraction\|trackPageView" lib/analytics.ts
   Expected output: 7 (one definition per function)

2. Run: grep "googletagmanager" app/layout.tsx
   Expected output: One line containing the gtag script URL

3. Run: npm run build 2>&1 | tail -5
   Expected output: Build succeeds, no errors
```

---

### P0-04: Create Sitemap and Robots.txt

**Files created:** `app/sitemap.ts`, `app/robots.ts`
**Depends on:** Nothing

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read the AGENTS.md file first — it warns that Next.js APIs may differ from your training data. Check node_modules/next/dist/docs/ for the correct sitemap and robots API before writing code.

TASK: Create sitemap.xml and robots.txt using Next.js metadata file conventions.

STEP 1: Create app/sitemap.ts with this content:

```typescript
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://leavewise.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/optimize`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];
}
```

STEP 2: Create app/robots.ts with this content:

```typescript
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://leavewise.app/sitemap.xml',
  };
}
```

STEP 3: Verify the build passes.

Run: npm run build
Expected: Build completes successfully with no TypeScript errors.

STEP 4: Verify the files are generated correctly.

Run: npm run build 2>&1 | grep -E "sitemap|robots"
Expected: No errors related to sitemap or robots.

Also verify: ls -la app/sitemap.ts app/robots.ts
Expected: Both files exist.

NOTE: If Next.js 16 uses a different API for sitemap/robots than what is shown above, read the docs at node_modules/next/dist/docs/ and adapt the code to match the correct API. The important thing is that /sitemap.xml and /robots.txt are served correctly at build time.
```

---

### P0-05: Product Hunt Launch Assets

**Files created:** `docs/product-hunt/listing.md`, `docs/product-hunt/hunter-email.md`
**Depends on:** Nothing

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the directory docs/product-hunt/ if it doesn't exist, then create the following two files with EXACT content.

FILE 1: docs/product-hunt/listing.md

---
BEGIN FILE CONTENT
---

# Leavewise — Product Hunt Listing

## Launch Details
- **Best day:** Tuesday or Wednesday
- **Best time:** 12:01 AM PST (to maximize 24-hour voting window)
- **Category:** Productivity
- **Topics:** Productivity, Travel, Calendar, Planning

## Tagline (60 chars max)
Turn your vacation days into twice the time off

## One-liner
Leavewise optimizes your PTO around public holidays so you get maximum consecutive days off — for free.

## Description (for Product Hunt listing)

Most people don't realize they're leaving 4–6 vacation days worth of value on the table every year.

Here's what happens: you take a random week off in July, burn 5 PTO days, get 9 days off. But if you'd shifted that window by 3 days to wrap around July 4th, you'd get 10 days off for only 3 PTO days.

Leavewise does this math for your entire year. You tell it:
- Your country (100+ supported)
- How many PTO days you have
- Any days you've already booked

It scans every public holiday, weekend, and calendar gap, then returns the highest-efficiency vacation windows — ranked by days off per PTO day used.

**What makes it different from just looking at a calendar:**
- Finds non-obvious multi-holiday bridges (e.g., bridging Easter + a company holiday into a 12-day window for 3 PTO days)
- Shows real-time flight prices for each window
- Highlights crowd-level warnings (avoid booking during Chinese New Year if heading to Asia)
- One-click .ics export drops the plan into your work calendar
- Per-window PTO stepper: adjust one window, watch the rest rebalance

No account. No paywall. No data stored on servers. Everything runs in your browser.

We built this because we kept leaving vacation days on the table every December. Now we don't.

## Maker Comment (post as first comment after launch)

Hey PH! I'm the maker of Leavewise.

The idea came from a dumb realization: I'd been wasting 4–5 vacation days every year for a decade. Not by working through them — by spending them on random weeks that didn't line up with holidays.

When I actually mapped out the calendar, I found that strategic placement of 15 PTO days could give me 38 days off. That's more than double.

So I built a tool that does this automatically. It started as a spreadsheet, became a script, and now it's a full web app.

It's completely free — we make money through affiliate links when you click through to book flights. Your data never touches a server.

Try it out: https://leavewise.app/optimize

Happy to answer any questions!

## Screenshot Descriptions (for human to capture)

1. **Hero + Calculator** — Landing page showing the PTO calculator with slider set to 15, result showing "35 days off, 2.3x efficiency"
2. **Optimization Results** — Results page with 4 stat cards (total days off, leave used, vacation windows, leave remaining) and 3 window cards showing dates, efficiency, and flight deals
3. **Interactive Calendar** — Full-year calendar view with color-coded PTO days (coral), holidays (sage), weekends (stone), and today marker (teal ring)
4. **Window Card Detail** — Close-up of a single window card showing: label, days off, date range, PTO stepper (+/−), efficiency badge, flight deal with price, copy dates button, add-to-calendar button
5. **Mobile View** — Mobile screenshot of the landing page showing hero text and sticky bottom CTA bar

## Day-Of Response Templates

**Q: "How is this different from just looking at a calendar?"**
> Great question! A calendar shows you what's there, but Leavewise optimizes what to do with it. It ranks every possible vacation window by efficiency (days off per PTO day), handles multi-holiday bridges that span weeks, and rebalances when you adjust individual windows. Plus it shows flight prices and crowd warnings for each window — things you'd never get from a calendar alone.

**Q: "Will you add [country X]?"**
> We already support 100+ countries using official government holiday data! Head to the optimizer and try your country — it's probably there. If not, let me know and we'll add it.

**Q: "Is this really free? What's the catch?"**
> Truly free, no catch. Everything runs in your browser — we don't store any data. We earn affiliate commissions when you click through to book flights via our travel partners. The tool itself will always be free.

---
END FILE CONTENT
---

FILE 2: docs/product-hunt/hunter-email.md

---
BEGIN FILE CONTENT
---

# Hunter Outreach Email

**Subject:** Would you hunt a free PTO optimizer? (100+ countries, no account needed)

Hi [Hunter Name],

I built a free tool called Leavewise that optimizes PTO around public holidays — turning 15 vacation days into 38 days off by finding every bridge, gap, and long weekend in the calendar.

It works for 100+ countries, shows real-time flight deals for each window, and exports to calendar. No account, no paywall, everything runs client-side.

I think it'd do well on Product Hunt because:
- Universal appeal (everyone with a job has PTO to optimize)
- Immediately useful (you see results in 30 seconds)
- Free with clear revenue model (affiliate links, not user data)

Would you be open to hunting it? Happy to prep all assets and coordinate timing.

Here's a 30-second demo: https://leavewise.app/optimize

Thanks,
[Your name]

---
END FILE CONTENT
---

VERIFICATION:
Run: ls -la docs/product-hunt/listing.md docs/product-hunt/hunter-email.md
Expected: Both files exist with non-zero size.
Run: wc -l docs/product-hunt/listing.md
Expected: Approximately 80–100 lines.
```

---

### P0-06: Reddit Seeding Campaign Drafts

**Files created:** `docs/reddit/r-personalfinance.md`, `docs/reddit/r-travel.md`, `docs/reddit/r-digitalnomad.md`, `docs/reddit/r-sideproject.md`, `docs/reddit/schedule.md`
**Depends on:** Nothing

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the directory docs/reddit/ and create the following 5 files with EXACT content.

FILE 1: docs/reddit/r-personalfinance.md

---
BEGIN FILE CONTENT
---

# r/personalfinance Post

**Subreddit:** r/personalfinance
**Post type:** Text
**Scheduled:** Month 3, Week 1

## Title
I built a free tool that shows which days to take PTO for maximum time off — saved me 5 extra days this year

## Body
I used to just pick random weeks for vacation and burn through my PTO without thinking about it. Last year I sat down with a calendar and realized I'd wasted about 5 days by not aligning my time off with public holidays and weekends.

For example: I took a full week off in July (5 PTO days, 9 days off). But if I'd shifted it by 2 days to wrap around July 4th, I would have gotten 10 days off for only 3 PTO days. That's 2 extra days I could've used elsewhere.

I ended up building a tool that does this math automatically. You enter your country, how many PTO days you have, and it finds every high-efficiency window in the year.

Some real examples it found for 2026 (US):
- **Easter bridge:** 10 days off using only 4 PTO days (2.5x efficiency)
- **Thanksgiving:** 5 days off using only 2 PTO days (2.5x efficiency)
- **Memorial Day:** 10 days off using 6 PTO days (1.7x efficiency)

It also shows flight prices for each window, which was a nice bonus — I found a $380 round-trip to Lisbon for dates I wouldn't have considered otherwise.

No signup, no paywall, runs entirely in the browser. Here it is if anyone wants to try it: https://leavewise.app

Has anyone else found good strategies for stretching PTO?

---
END FILE CONTENT
---

FILE 2: docs/reddit/r-travel.md

---
BEGIN FILE CONTENT
---

# r/travel Post

**Subreddit:** r/travel
**Post type:** Text
**Scheduled:** Month 3, Week 2

## Title
Tool that finds the best travel windows based on your country's public holidays (free, 100+ countries)

## Body
I'm someone who plans trips around long weekends and holiday bridges. I got tired of manually checking calendars every year, so I built a tool that does it automatically.

You tell it your country and how many PTO/leave days you have. It finds every window where a few PTO days gets you the longest possible trip — ranked by efficiency (days off per PTO day used).

It covers 100+ countries with official holiday data, so it works whether you're in the US, Korea, Germany, Japan, Australia, wherever.

A few things that surprised me when I ran it for 2026:
- There's a window in late March where 4 PTO days around Easter gives you 10 consecutive days off
- The November Thanksgiving bridge is obvious, but the tool found a way to extend it to 9 days with just 3 PTO days
- It also flagged that flights during Golden Week are 40% more expensive — something I wouldn't have thought to check

It also shows real-time flight deals for each window and lets you export the whole plan to your calendar (.ics file).

Free, no account needed: https://leavewise.app

Anyone else obsessively optimize their vacation calendars or is it just me?

---
END FILE CONTENT
---

FILE 3: docs/reddit/r-digitalnomad.md

---
BEGIN FILE CONTENT
---

# r/digitalnomad Post

**Subreddit:** r/digitalnomad
**Post type:** Text
**Scheduled:** Month 3, Week 3

## Title
Free PTO optimizer — shows how to turn 10 leave days into 25+ days off by bridging holidays

## Body
For anyone still working a job with limited PTO (I know, I know — the goal is unlimited vacation from a beach), this might be useful.

I built a free tool that takes your country's public holidays and finds the optimal days to place your PTO for maximum consecutive time off. The idea: instead of burning 5 PTO days for a standard week, spend 3–4 PTO days bridging a public holiday and weekend to get 9–12 days.

Running it for 2026 with 15 PTO days, it found windows totaling 38 days off. That's enough for three solid trips.

Features that might be relevant for this sub:
- Works for 100+ countries (useful if you're planning around multiple holiday calendars)
- Shows flight prices for each window so you can optimize for cost too
- Highlights peak travel periods to avoid (Chinese New Year, European summer, etc.)
- Exports to calendar with one click

No signup, no data stored. Free because we earn from affiliate links when you search flights.

https://leavewise.app

---
END FILE CONTENT
---

FILE 4: docs/reddit/r-sideproject.md

---
BEGIN FILE CONTENT
---

# r/SideProject Post

**Subreddit:** r/SideProject
**Post type:** Text
**Scheduled:** Month 4, Week 1

## Title
I built a vacation day optimizer and it's been surprisingly useful — Leavewise

## Body
**What it does:** You enter your country, year, and how many PTO days you have. It finds the most efficient vacation windows by analyzing every public holiday, weekend, and calendar gap. Then it ranks them by "efficiency" — days off per PTO day used.

**Why I built it:** I realized I was wasting 4–5 vacation days every year by taking time off during random weeks instead of bridging holidays. When I mapped it out manually, 15 PTO days could give me 38 days off. That felt like a tool worth building.

**Tech stack:**
- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS
- No database — everything runs client-side
- Holiday data from Nager.Date API (100+ countries)
- Flight deals via Kiwi.com API

**Interesting features:**
- Per-window PTO stepper: adjust one window's PTO allocation, the rest rebalance automatically
- Crowd-level warnings (e.g., "Golden Week — Asia will be expensive")
- .ics calendar export
- Copy dates to clipboard
- Interactive 12-month calendar with today marker

**Revenue model:** Affiliate links to flight/hotel booking sites. The tool is free, no signup, no paywall.

Live at: https://leavewise.app

Happy to answer any technical questions. Feedback welcome!

---
END FILE CONTENT
---

FILE 5: docs/reddit/schedule.md

---
BEGIN FILE CONTENT
---

# Reddit Posting Schedule

| # | Subreddit | Post File | Target Date | Min Gap | Status |
|---|-----------|-----------|-------------|---------|--------|
| 1 | r/personalfinance | r-personalfinance.md | Month 3, Week 1 (Monday or Tuesday) | — | [ ] Posted |
| 2 | r/travel | r-travel.md | Month 3, Week 2 (Wednesday or Thursday) | 5 days after #1 | [ ] Posted |
| 3 | r/digitalnomad | r-digitalnomad.md | Month 3, Week 3 (Tuesday) | 5 days after #2 | [ ] Posted |
| 4 | r/SideProject | r-sideproject.md | Month 4, Week 1 (Wednesday) | 7 days after #3 | [ ] Posted |

## Rules
- Post from a personal account, not a brand account
- Space posts at least 4 days apart to avoid spam detection
- Best posting times: Tuesday–Thursday, 9–11 AM EST
- Do not cross-post — each sub gets a unique post
- Reply to every comment within 24 hours
- If a post gets removed by automod, do not repost — message the mods

## Post-Launch Tracking
After each post, record:
- Upvotes at 24h: ___
- Upvotes at 72h: ___
- Comments: ___
- Estimated click-throughs (check GA4 for reddit.com referrals): ___

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/reddit/
Expected: 5 files — r-personalfinance.md, r-travel.md, r-digitalnomad.md, r-sideproject.md, schedule.md
Run: wc -l docs/reddit/*.md
Expected: Each post file is 30–50 lines. Schedule is approximately 25 lines.
```

---

### P0-07: Blind Posts (US + Korean)

**Files created:** `docs/blind/en.md`, `docs/blind/kr.md`
**Depends on:** Nothing

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the directory docs/blind/ and create 2 files with EXACT content.

FILE 1: docs/blind/en.md

---
BEGIN FILE CONTENT
---

# Blind Post — English

**Platform:** Blind (English)
**Channel:** General / Salary & Compensation
**Scheduled:** Month 3–4

## Post

**Title:** Built a free PTO optimizer — shows the best days to take off each year

**Body:**

Anyone else realize they've been wasting PTO days?

I mapped out my calendar last year and found I could have gotten 38 days off instead of 25 if I'd placed my 15 PTO days strategically around holidays instead of taking random weeks.

So I built a tool for it. You put in your PTO balance and country, it finds every holiday bridge and long weekend opportunity for the year and ranks them by efficiency (days off per PTO day).

Example: 4 PTO days around Easter → 10 days off. That's 2.5x efficiency.

Also shows flight prices for each window and exports to your calendar.

Free, no login: https://leavewise.app

Curious if anyone's tried optimizing their PTO like this before.

---
END FILE CONTENT
---

FILE 2: docs/blind/kr.md

---
BEGIN FILE CONTENT
---

# Blind 게시글 — 한국어

**Platform:** 블라인드 (Korean)
**Channel:** 자유게시판 / 직장인 이야기
**Scheduled:** Month 3–4

## 게시글

**제목:** 연차 최적화 도구 만들었는데, 써보실 분?

**본문:**

혹시 연차를 그냥 아무 날이나 쓰시나요?

작년에 달력 한번 펴놓고 계산해봤는데, 연차 15일을 전략적으로 배치하면 38일을 쉴 수 있더라고요. 공휴일이랑 주말 사이에 연차를 끼워 넣으면 효율이 2~3배가 됩니다.

예를 들어:
- 추석 연휴 앞뒤로 연차 2일 → 9일 연속 휴가
- 설날 + 연차 3일 → 10일 연속 휴가
- 어린이날 주간 연차 2일 → 6일 연속 휴가

이걸 자동으로 계산해주는 도구를 만들었습니다. 나라와 연차 일수만 입력하면 최적의 연차 배치를 알려줍니다.

항공권 가격도 같이 보여주고, 캘린더 파일(.ics)로 다운로드 가능합니다.

무료, 가입 없음: https://leavewise.app

연차 계획 세우실 때 참고하세요!

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/blind/
Expected: 2 files — en.md, kr.md
Run: wc -l docs/blind/en.md docs/blind/kr.md
Expected: en.md approximately 25–35 lines, kr.md approximately 30–40 lines
```

---

### P0-08: Naver Blog Post Drafts (Korean)

**Files created:** `docs/naver-blog/post-01.md`, `docs/naver-blog/post-02.md`
**Depends on:** Nothing

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the directory docs/naver-blog/ and create 2 Korean-language blog post drafts. These will be published on a Naver Blog by a human.

Each post MUST:
- Be written entirely in natural, professional Korean (직장인 대상)
- Be 800+ words
- Include the tags: 연차, 직장인, 황금연휴, 연차계획, 휴가계획
- Include a CTA linking to https://leavewise.app at the end
- Include a meta description (네이버 블로그 설명)
- Include specific date examples for Korea 2026

FILE 1: docs/naver-blog/post-01.md

Write a complete Korean blog post with this structure:

```markdown
---
title: "2026년 연차 황금연휴 총정리 — 언제 쓰면 제일 길게 쉬나요?"
meta_description: "2026년 공휴일과 연차를 조합해 가장 긴 연휴를 만드는 방법. 월별 최적 연차 사용일 추천."
tags: [연차, 직장인, 황금연휴, 연차계획, 휴가계획, 2026연차, 공휴일]
target_length: 1000+ words
---

# 2026년 연차 황금연휴 총정리 — 언제 쓰면 제일 길게 쉬나요?

[Hook paragraph: Start with a relatable question for Korean office workers about PTO planning]

## 2026년 대한민국 공휴일 목록

[List ALL 2026 Korean public holidays with dates and days of the week:
- 1월 1일 (목) 신정
- 1월 28일~30일 (수~금) 설날
- 3월 1일 (일) 삼일절
- 5월 5일 (화) 어린이날
- 5월 24일 (일) 부처님오신날
- 6월 6일 (토) 현충일
- 8월 15일 (토) 광복절
- 9월 24일~26일 (목~토) 추석
- 10월 3일 (토) 개천절
- 10월 9일 (금) 한글날
- 12월 25일 (금) 성탄절]

## 월별 황금연휴 만드는 법

[For each major holiday cluster, explain:
1. The dates of the public holidays
2. Which specific weekdays to take as 연차
3. How many 연차 days needed
4. Total consecutive days off achieved
5. Efficiency ratio

Cover at minimum: 설날, 어린이날, 추석, 한글날+개천절, 성탄절]

## 연차 15일로 최대 38일 쉬는 비결

[Summary section showing the total optimization potential]

## 직접 계산해보세요

지금 바로 나의 연차를 최적화해보세요. 나라와 연차 일수만 입력하면 최적의 휴가 계획을 자동으로 만들어드립니다.

무료, 가입 없음: [Leavewise 연차 최적화](https://leavewise.app)
```

FILE 2: docs/naver-blog/post-02.md

Write a complete Korean blog post with this structure:

```markdown
---
title: "연차 10일로 18일 쉬는 방법 (2026 달력 기준)"
meta_description: "연차 10일만으로 18일 이상 쉴 수 있는 전략적 연차 배치법. 2026년 달력 기반 실전 가이드."
tags: [연차, 직장인, 황금연휴, 연차계획, 휴가계획, 연차최적화]
target_length: 800+ words
---

# 연차 10일로 18일 쉬는 방법 (2026 달력 기준)

[Hook: "연차가 10일밖에 없다고 아쉬워하지 마세요..."]

## 핵심 원리: 공휴일 + 주말 + 연차 = 긴 연휴

[Explain the bridge day concept in simple Korean]

## 실전 배치: 10일 연차로 만드는 5개 연휴

[5 specific windows, each with:
- Window name (e.g., "설날 연장 연휴")
- Exact dates to take as 연차
- Total consecutive days off
- What holidays are included
- Efficiency (X배 효율)]

## 왜 '아무 날'에 쓰면 손해인가

[Compare: 5 random days = 5+4 = 9 days vs 5 strategic days = potentially 12-14 days]

## 무료 연차 최적화 도구

[CTA to https://leavewise.app]
```

IMPORTANT: The posts must be written in fluent, natural Korean appropriate for a Naver Blog audience (직장인, 20–40대). Do NOT write machine-translated Korean. Use natural conversational Korean with appropriate 존댓말.

VERIFICATION:
Run: ls docs/naver-blog/
Expected: 2 files — post-01.md, post-02.md
Run: wc -w docs/naver-blog/post-01.md
Expected: 800+ words (Korean word count — note that Korean words are often shorter, so character count may be a better measure. Target 2,000+ characters.)
Run: grep "leavewise.app" docs/naver-blog/post-01.md docs/naver-blog/post-02.md
Expected: At least one match per file
```

---

## Phase 1: Launch Push (Months 3–4)

_Tasks P1-01 through P1-04 use the content created in Phase 0._
_See P0-05 (Product Hunt), P0-06 (Reddit), P0-07 (Blind) for the pre-written content._

---

### P1-01: KakaoTalk Share Feature

**Files created:** `lib/kakao-share.ts`
**Files modified:** `app/optimize/page.tsx`
**Depends on:** None

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first. It warns about breaking changes in Next.js APIs.

TASK: Add a "Share on KakaoTalk" button for Korean users and a "Share results" copy-to-clipboard button for all users, visible after optimization results are shown.

STEP 1: Create lib/kakao-share.ts with this EXACT content:

```typescript
/**
 * KakaoTalk sharing utility for Leavewise.
 *
 * Uses Kakao JavaScript SDK to send a feed-type share message.
 * Falls back to clipboard copy if the SDK is not loaded or fails.
 */

interface ShareParams {
  daysUsed: number;
  daysOff: number;
  windowCount: number;
  shareUrl: string;
}

/** Try sharing via KakaoTalk SDK. Returns true if successful, false if fell back to clipboard. */
export async function shareViaKakao(params: ShareParams): Promise<boolean> {
  const { daysUsed, daysOff, windowCount, shareUrl } = params;

  const description = `연차 ${daysUsed}일로 ${daysOff}일 쉬는 계획을 짰어요! (${windowCount}개 휴가 윈도우)`;
  const fallbackText = `나 이번에 연차 ${daysUsed}일로 ${daysOff}일 쉬는 계획 짰어! 너도 해봐 👇 ${shareUrl}`;

  // Try Kakao SDK
  if (typeof window !== 'undefined' && window.Kakao) {
    try {
      if (!window.Kakao.isInitialized()) {
        // Kakao app key must be set in env
        const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
        if (appKey) window.Kakao.init(appKey);
      }

      if (window.Kakao.isInitialized()) {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: 'Leavewise 연차 최적화 결과',
            description,
            imageUrl: 'https://leavewise.app/og-image.png',
            link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
          },
          buttons: [
            {
              title: '나도 연차 최적화하기',
              link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
            },
          ],
        });
        return true;
      }
    } catch {
      // Fall through to clipboard
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(fallbackText);
  } catch {
    // Last resort: prompt
    window.prompt('Copy this link:', fallbackText);
  }
  return false;
}

/** Generic share for non-Korean users — copies summary + URL to clipboard. */
export async function shareViaClipboard(params: ShareParams): Promise<void> {
  const { daysUsed, daysOff, windowCount, shareUrl } = params;
  const text = `I turned ${daysUsed} PTO days into ${daysOff} days off (${windowCount} vacation windows). Try it: ${shareUrl}`;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    window.prompt('Copy this link:', text);
  }
}

// TypeScript declaration for Kakao SDK global
declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (params: Record<string, unknown>) => void;
      };
    };
  }
}
```

STEP 2: Add share buttons to the results section in app/optimize/page.tsx.

Read the current app/optimize/page.tsx. Find the results summary section — it's inside the `{result && (` block, after the 4 stat cards (grid with totalDaysOff, totalLeaveUsed, windows.length, remainingLeave).

After the stat cards grid (the `</div>` that closes `className="grid grid-cols-2 sm:grid-cols-4 gap-4"`), add this JSX block:

```tsx
{/* Share results */}
<div className="flex items-center gap-2">
  {form.country === 'KR' ? (
    <button
      type="button"
      onClick={async () => {
        const shared = await shareViaKakao({
          daysUsed: result.totalLeaveUsed,
          daysOff: result.totalDaysOff,
          windowCount: result.windows.length,
          shareUrl: window.location.href,
        });
        toast(shared ? 'KakaoTalk으로 공유했습니다' : '클립보드에 복사되었습니다');
      }}
      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#FEE500] text-[#3C1E1E] px-3 py-2 rounded-lg hover:bg-[#F5DC00] transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.04 5.907l-.727 2.68a.312.312 0 00.468.349l3.2-2.133c.987.15 2.003.197 2.995.197 5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
      </svg>
      카카오톡 공유
    </button>
  ) : (
    <button
      type="button"
      onClick={async () => {
        await shareViaClipboard({
          daysUsed: result.totalLeaveUsed,
          daysOff: result.totalDaysOff,
          windowCount: result.windows.length,
          shareUrl: window.location.href,
        });
        toast('Copied to clipboard');
      }}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-teal px-3 py-2 rounded-lg border border-border hover:border-teal/40 transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
      Share results
    </button>
  )}
</div>
```

Also add the import at the top of app/optimize/page.tsx:
```typescript
import { shareViaKakao, shareViaClipboard } from '@/lib/kakao-share';
```

Make sure the `toast` function is available — it should already be imported via `useToast` from `@/components/Toast`.

STEP 3: Build and verify.

Run: npm run build
Expected: Build completes with zero TypeScript errors.

VERIFICATION:
1. Run: grep "shareViaKakao\|shareViaClipboard" lib/kakao-share.ts | wc -l
   Expected: 2 (function definitions)
2. Run: grep "shareViaKakao\|shareViaClipboard" app/optimize/page.tsx | wc -l
   Expected: At least 3 (import + 2 usages)
3. Run: npm run build 2>&1 | tail -5
   Expected: Build succeeds
```

---

## Phase 2: SEO & Content (Months 5–6)

---

### P2-01: Blog Infrastructure

**Files created:** `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `content/blog/.gitkeep`
**Depends on:** P0-04 (sitemap)

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first. Check node_modules/next/dist/docs/ for the correct way to create dynamic routes, generateStaticParams, and generateMetadata in Next.js 16.

TASK: Create a blog system that reads markdown files from content/blog/ and renders them as pages.

STEP 1: Create content/blog/.gitkeep (empty file to ensure the directory is tracked by git)

STEP 2: Create lib/blog.ts:

```typescript
import fs from 'fs';
import path from 'path';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function parseFrontmatter(raw: string): { meta: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      meta[key] = value;
    }
  }
  return { meta, content: match[2].trim() };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const { meta, content } = parseFrontmatter(raw);
      return {
        slug: file.replace(/\.md$/, ''),
        title: meta.title || file.replace(/\.md$/, '').replace(/-/g, ' '),
        description: meta.description || '',
        date: meta.date || '',
        content,
      };
    })
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { meta, content } = parseFrontmatter(raw);
  return {
    slug,
    title: meta.title || slug.replace(/-/g, ' '),
    description: meta.description || '',
    date: meta.date || '',
    content,
  };
}
```

STEP 3: Create app/blog/page.tsx (blog index):

```tsx
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata = {
  title: 'Blog — Leavewise',
  description: 'PTO optimization tips, vacation planning guides, and travel insights.',
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-cream">
      <nav className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto">
        <Link href="/" className="text-xl font-display font-semibold text-ink tracking-tight hover:text-teal transition-colors">
          Leavewise
        </Link>
        <Link href="/optimize" className="text-sm font-medium text-teal hover:text-teal-hover transition-colors">
          Try it free →
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-display font-semibold text-ink mb-2">Blog</h1>
        <p className="text-ink-muted mb-10">PTO tips, vacation planning guides, and travel insights.</p>

        {posts.length === 0 ? (
          <p className="text-ink-muted text-sm">No posts yet. Check back soon!</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block bg-white rounded-2xl border border-border p-6 hover:shadow-sm transition-shadow"
              >
                <h2 className="text-lg font-semibold text-ink mb-1">{post.title}</h2>
                {post.description && (
                  <p className="text-sm text-ink-muted mb-2">{post.description}</p>
                )}
                {post.date && (
                  <span className="text-xs text-ink-muted">{post.date}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

STEP 4: Create app/blog/[slug]/page.tsx (individual post):

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/blog';

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Not Found' };
  return {
    title: `${post.title} — Leavewise`,
    description: post.description,
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-cream">
      <nav className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto">
        <Link href="/" className="text-xl font-display font-semibold text-ink tracking-tight hover:text-teal transition-colors">
          Leavewise
        </Link>
        <Link href="/blog" className="text-sm font-medium text-ink-muted hover:text-teal transition-colors">
          ← Blog
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-ink mb-3">{post.title}</h1>
          {post.date && (
            <p className="text-sm text-ink-muted mb-8">{post.date}</p>
          )}
          <div
            className="prose prose-stone max-w-none text-ink [&_h2]:font-display [&_h2]:text-ink [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-ink [&_a]:text-teal [&_a]:no-underline hover:[&_a]:underline"
            dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(post.content) }}
          />
        </article>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-ink-muted mb-4">Ready to optimize your PTO?</p>
          <Link
            href="/optimize"
            className="inline-flex items-center gap-2 bg-teal text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-hover transition-colors text-sm"
          >
            Plan my time off →
          </Link>
        </div>
      </main>
    </div>
  );
}

/** Minimal markdown → HTML converter. Handles headings, paragraphs, bold, links, lists. */
function simpleMarkdownToHtml(md: string): string {
  return md
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('### ')) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith('## ')) return `<h2>${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith('# ')) return `<h1>${trimmed.slice(2)}</h1>`;
      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').map((l) => `<li>${l.replace(/^- /, '')}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      // Inline formatting
      let html = trimmed
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        .replace(/\n/g, '<br>');
      return `<p>${html}</p>`;
    })
    .join('\n');
}
```

NOTE: If Next.js 16 has changed the API for generateStaticParams or generateMetadata (e.g., params is now a Promise, or the function signature changed), read the docs at node_modules/next/dist/docs/ and adapt accordingly. The important thing is that /blog and /blog/[slug] work correctly.

STEP 5: Update app/sitemap.ts to include /blog.

Read the current app/sitemap.ts. Add a new entry to the sitemap array:
```typescript
{
  url: `${BASE_URL}/blog`,
  lastModified: new Date(),
  changeFrequency: 'weekly' as const,
  priority: 0.7,
},
```

STEP 6: Build and verify.

Run: npm run build
Expected: Build completes with zero errors. /blog renders (even with 0 posts).

VERIFICATION:
1. Run: ls app/blog/page.tsx app/blog/\\[slug\\]/page.tsx lib/blog.ts content/blog/.gitkeep
   Expected: All 4 files exist
2. Run: npm run build 2>&1 | grep "/blog"
   Expected: /blog appears in the route list
3. Run: npm run build 2>&1 | tail -5
   Expected: Build succeeds
```

---

## Phase 3–4: Monetization (Months 7–12)

_These phases involve more complex features (Stripe, PDF export, premium gating). Each task below is a self-contained prompt._

---

### P3-01: Premium Tier Feature Specification (Document Only)

**Files created:** `docs/premium/spec.md`
**Depends on:** Nothing
**Note:** This task produces a DOCUMENT, not code. Code implementation is a separate task.

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create docs/premium/spec.md with the following EXACT content. Create the docs/premium/ directory if it doesn't exist.

---
BEGIN FILE CONTENT
---

# Leavewise Premium — Feature Specification

## Pricing
- **US:** $6/month or $49/year
- **Korea:** ₩7,900/month or ₩59,000/year
- **Trial:** No free trial. Free tier is generous enough.
- **Payment processor:** Stripe (US), Stripe + local payment methods (Korea)

## Free vs Premium Feature Matrix

| Feature | Free | Premium |
|---------|------|---------|
| PTO optimization (unlimited runs) | Yes | Yes |
| Interactive calendar | Yes | Yes |
| Per-window PTO adjustment | Yes | Yes |
| Flight deal links | Yes | Yes |
| Copy dates to clipboard | Yes | Yes |
| Single window .ics export | Yes | Yes |
| **All windows .ics export (bulk)** | No | **Yes** |
| **Google Calendar direct sync** | No | **Yes** |
| **PDF export (branded report)** | No | **Yes** |
| **Custom flight price alerts** | No | **Yes** |
| **Multi-destination comparison** | No | **Yes** |
| **Team view (shared PTO calendar)** | No | **Year 2** |

## Feature Details

### 1. Google Calendar Direct Sync
- **Implementation:** OAuth2 flow with Google Calendar API
- **Behavior:** Creates a "Leavewise PTO" calendar in user's Google Calendar, adds all optimized windows as all-day events
- **UI:** "Sync to Google Calendar" button in results section
- **Refresh:** User can re-sync after re-optimizing
- **Scope needed:** `https://www.googleapis.com/auth/calendar.events`
- **Estimated effort:** 3–5 days

### 2. PDF Export
- **Implementation:** Client-side PDF generation using browser print-to-PDF or jsPDF library
- **Content:** Branded PDF with:
  - Leavewise logo + generation date
  - Summary stats (days used, days off, windows, remaining)
  - Each window card with dates, efficiency, holidays
  - Full-year calendar view with PTO highlighted
  - Footer with "Generated by Leavewise"
- **File name:** `leavewise-pto-plan-{year}.pdf`
- **UI:** "Download PDF" button in results section
- **Estimated effort:** 2–3 days

### 3. Custom Flight Price Alerts
- **Implementation:** Requires backend + email service
  - User saves window with destination preference
  - Backend polls flight API daily
  - Email notification when price drops below threshold
- **UI:** "Set price alert" button on window card (after flight deal shown)
- **Dependencies:** Email service (Resend or SendGrid), database (Supabase or PlanetScale), cron job
- **Estimated effort:** 5–7 days

### 4. Multi-destination Comparison
- **Implementation:** For each window, show flight prices to 3–5 destinations simultaneously
- **UI:** Expandable "Compare destinations" section on window card
- **Data:** Uses same Kiwi.com API, queries multiple destinations per window
- **Estimated effort:** 2–3 days

### 5. Bulk .ics Export (All Windows)
- **Implementation:** Already partially built — lib/ics.ts has `downloadAllICS` function
- **Gate:** Just wrap the "Export all" button behind premium check
- **Estimated effort:** 0.5 days

## Upsell Copy — 3 Touchpoints

### Touchpoint 1: After optimization results (inline card)
> **Get more from your plan** — Export all windows to your calendar, download a PDF report, and set flight price alerts. [Upgrade to Premium →]

### Touchpoint 2: When user clicks "Export all to calendar" (gated action)
> **This is a Premium feature** — Exporting all windows at once requires Leavewise Premium. Individual window exports are always free. [Upgrade for $6/mo →]

### Touchpoint 3: Below the results summary
> **Save and share your plan** — Download a branded PDF of your optimized schedule, perfect for sharing with your manager or travel buddy. [Try Premium →]

## Stripe Integration Approach
1. Create Stripe products: "Leavewise Premium Monthly" ($6) and "Leavewise Premium Yearly" ($49)
2. Checkout flow: `POST /api/checkout` creates a Stripe Checkout session, redirects to Stripe hosted page
3. Webhook: `POST /api/webhooks/stripe` receives `checkout.session.completed`, `customer.subscription.deleted`, etc.
4. Premium status: After successful checkout, set a signed JWT in a cookie. Check this cookie client-side and server-side.
5. Cancel flow: Link to Stripe Customer Portal from a `/account` page

## Dev Priority Order
1. Bulk .ics export gating (0.5 days) — easiest, tests the premium gate flow
2. PDF export (2–3 days) — high perceived value, no backend needed
3. Google Calendar sync (3–5 days) — high value, moderate complexity
4. Multi-destination comparison (2–3 days) — enhances affiliate revenue
5. Flight price alerts (5–7 days) — requires backend, do last

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/premium/spec.md
Expected: File exists
Run: wc -l docs/premium/spec.md
Expected: Approximately 100–120 lines
```

---

### P3-02: Sponsor Outreach Templates

**Files created:** `docs/sponsorship/outreach-en.md`, `docs/sponsorship/outreach-kr.md`, `docs/sponsorship/tracker.md`
**Depends on:** Nothing

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the directory docs/sponsorship/ and create 3 files with EXACT content.

FILE 1: docs/sponsorship/outreach-en.md

---
BEGIN FILE CONTENT
---

# Sponsor Outreach — English Template

## Initial Email

**Subject:** Sponsorship opportunity: Leavewise PTO Optimizer ({MAU} monthly users)

Hi {Name},

I'm reaching out about a sponsorship opportunity on Leavewise, a free PTO optimization tool used by {MAU} working professionals monthly.

**Why it's relevant for {Company}:**
Our users are employed professionals who have just identified their ideal vacation dates. They're actively looking for flights, hotels, and travel experiences. This is the highest-intent travel audience you can reach — they have specific dates and PTO approved.

**Audience profile:**
- 70% US, 25% Korea, 5% other
- 85% employed professionals aged 25–45
- Average 3.5 page views per session (results page has highest engagement)
- Users see your placement at the moment they're deciding where to travel

**Sponsorship tiers:**

| Tier | Placement | Price |
|------|-----------|-------|
| Logo | Logo in footer + "Sponsored by" badge | $500/month |
| Featured | Logo + featured link on every window card | $1,000/month |
| Co-branded | Custom integration + co-branded content | $2,000/month |

**Metrics we provide monthly:**
- Impressions on your placement
- Click-throughs to your site
- Estimated bookings attributed (via UTM tracking)

I'd love to set up a quick call to discuss. Would next week work?

Best,
{Your name}
Founder, Leavewise

---

## Follow-Up Email (send 7 days after initial, if no response)

**Subject:** Re: Sponsorship opportunity: Leavewise PTO Optimizer

Hi {Name},

Just following up on my note about Leavewise sponsorship. Quick summary: {MAU} monthly active users, all employed professionals planning their next vacation with specific dates in hand.

Happy to send over traffic data or hop on a quick call. What works for you?

Best,
{Your name}

---
END FILE CONTENT
---

FILE 2: docs/sponsorship/outreach-kr.md

---
BEGIN FILE CONTENT
---

# 스폰서 제안 — 한국어 템플릿

## 최초 이메일

**제목:** Leavewise 연차 최적화 도구 스폰서십 제안 (월간 사용자 {MAU}명)

{Name}님, 안녕하세요.

직장인 연차 최적화 도구 Leavewise의 스폰서십 기회에 대해 연락드립니다.

**Leavewise 소개:**
Leavewise는 공휴일과 주말을 활용해 최적의 연차 사용 날짜를 추천하는 무료 도구입니다. 현재 월 {MAU}명의 직장인이 사용하고 있습니다.

**{Company}에 적합한 이유:**
저희 사용자는 이미 휴가 날짜가 확정된 상태에서 여행 상품을 검색합니다. 항공권, 숙소, 투어 상품에 대한 구매 의향이 매우 높은 사용자층입니다.

**스폰서십 옵션:**

| 옵션 | 노출 위치 | 가격 |
|------|-----------|------|
| 로고 | 하단 로고 + "협찬" 뱃지 | ₩600,000/월 |
| 피처드 | 로고 + 모든 휴가 카드에 추천 링크 | ₩1,200,000/월 |
| 커스텀 | 맞춤 통합 + 공동 브랜딩 콘텐츠 | ₩2,500,000/월 |

자세한 내용은 간단한 통화로 말씀드리겠습니다. 다음 주 가능하신 시간이 있으실까요?

감사합니다.
{Your name}
Leavewise 대표

---

## 후속 이메일 (7일 후, 미응답 시)

**제목:** Re: Leavewise 스폰서십 제안

{Name}님,

지난번 Leavewise 스폰서십 제안 건으로 다시 연락드립니다. 월 {MAU}명의 여행 의향이 높은 직장인 사용자에게 {Company} 브랜드를 노출할 수 있는 기회입니다.

트래픽 데이터를 보내드리거나 간단한 통화를 진행할 수 있습니다. 편하신 방법으로 알려주세요.

감사합니다.
{Your name}

---
END FILE CONTENT
---

FILE 3: docs/sponsorship/tracker.md

---
BEGIN FILE CONTENT
---

# Sponsor Outreach Tracker

## Active Outreach

| # | Company | Contact Name | Email | Date Sent | Follow-Up Sent | Response | Status | Deal Value |
|---|---------|-------------|-------|-----------|----------------|----------|--------|------------|
| 1 | | | | | | | [ ] No response [ ] Interested [ ] Declined [ ] Closed | |
| 2 | | | | | | | | |
| 3 | | | | | | | | |
| 4 | | | | | | | | |
| 5 | | | | | | | | |

## Target Companies

### US Market
1. Hotels.com — partners@hotels.com (or find via LinkedIn)
2. Agoda — partnerships@agoda.com
3. Hopper — partnerships@hopper.com
4. TripAdvisor — affiliates@tripadvisor.com

### Korean Market
1. Jeju Air (제주항공) — marketing@jejuair.net
2. 야놀자 — partnership@yanolja.com
3. 마이리얼트립 — biz@myrealtrip.com
4. 에어서울 — marketing@airseoul.com

## Metrics to Include in Outreach
- Current MAU: {fill from GA4}
- MoM growth rate: {fill from monthly report}
- Average session duration: {fill from GA4}
- Affiliate CTR (proves user intent): {fill from analytics}

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/sponsorship/
Expected: 3 files — outreach-en.md, outreach-kr.md, tracker.md
```

---

## Recurring Programs (OpenClaw Standing Orders)

_These are cron-triggered agent tasks. Each prompt is what the OpenClaw cron job sends to the agent._

---

### R-01: Weekly SEO Health Check

**Cron:** `0 9 * * 1` (every Monday 9am PT)
**Session:** isolated

#### OpenClaw Cron Definition

```json
{
  "name": "Weekly SEO Health Check",
  "schedule": { "kind": "cron", "expr": "0 9 * * 1", "tz": "America/Los_Angeles" },
  "sessionTarget": "isolated",
  "wakeMode": "now",
  "payload": {
    "kind": "agentTurn",
    "message": "You are the SEO health check agent for the Leavewise project at /Users/constantlee/PTO-optimizer.\n\nPerform the following checks and write a report to docs/reports/seo/{today's date in YYYY-MM-DD format}.md:\n\n1. Run: npx next build 2>&1 | tail -20\n   Record: Did the build succeed? List all routes.\n\n2. Run: curl -s -o /dev/null -w '%{http_code}' https://leavewise.app/sitemap.xml\n   Record: HTTP status code. Expected: 200.\n\n3. Run: curl -s -o /dev/null -w '%{http_code}' https://leavewise.app/robots.txt\n   Record: HTTP status code. Expected: 200.\n\n4. Run: npx lighthouse https://leavewise.app --output=json --quiet --chrome-flags='--headless' | jq '.categories.performance.score, .categories.seo.score, .categories.accessibility.score'\n   Record: Performance, SEO, and Accessibility scores (0–1 scale).\n   If lighthouse is not installed, skip this step and note it.\n\n5. Check if any new pages have been added since last report by running: git log --oneline --since='7 days ago' -- 'app/**/*.tsx' 'content/blog/**'\n   Record: Any new pages that need to be added to sitemap.\n\nWrite the report in this EXACT format:\n\n```markdown\n# SEO Health Check — {YYYY-MM-DD}\n\n## Build Status\n- Status: PASS / FAIL\n- Routes: {list all routes}\n\n## Endpoint Checks\n| URL | Status | Expected |\n|-----|--------|----------|\n| /sitemap.xml | {code} | 200 |\n| /robots.txt | {code} | 200 |\n\n## Lighthouse Scores\n| Metric | Score | Target |\n|--------|-------|--------|\n| Performance | {score} | > 0.90 |\n| SEO | {score} | > 0.90 |\n| Accessibility | {score} | > 0.90 |\n\n## New Pages This Week\n{list or 'None'}\n\n## Action Items\n{list any issues found, or 'None — all healthy'}\n```",
    "lightContext": true,
    "timeoutSeconds": 120
  }
}
```

---

### R-02: Monthly Metrics Compilation

**Cron:** `0 10 1 * *` (1st of each month, 10am PT)
**Session:** isolated

#### OpenClaw Cron Definition

```json
{
  "name": "Monthly Metrics Report",
  "schedule": { "kind": "cron", "expr": "0 10 1 * *", "tz": "America/Los_Angeles" },
  "sessionTarget": "isolated",
  "wakeMode": "now",
  "payload": {
    "kind": "agentTurn",
    "message": "You are the monthly metrics agent for Leavewise at /Users/constantlee/PTO-optimizer.\n\nCreate a monthly metrics report at docs/reports/monthly/{YYYY-MM}.md using the template below.\n\nYou CANNOT access Google Analytics or Stripe directly. Instead, create the report template with placeholders that the human will fill in. Mark each placeholder with {FILL: description}.\n\nUse this EXACT template:\n\n```markdown\n# Monthly Metrics Report — {Month Year}\n\n## Traffic\n| Metric | This Month | Last Month | Delta | Target |\n|--------|-----------|-----------|-------|--------|\n| MAU | {FILL: from GA4} | {FILL: from last report} | {calculate} | See revenue-forecast.md |\n| New users | {FILL: from GA4} | | | |\n| Returning users | {FILL: from GA4} | | | |\n| Bounce rate | {FILL: from GA4} | | < 45% |\n| Avg session duration | {FILL: from GA4} | | > 90s |\n\n## Top Traffic Sources\n| # | Source | Users | % of Total |\n|---|--------|-------|------------|\n| 1 | {FILL} | {FILL} | {FILL} |\n| 2 | {FILL} | {FILL} | {FILL} |\n| 3 | {FILL} | {FILL} | {FILL} |\n\n## Engagement Events\n| Event | Count | Per Session |\n|-------|-------|-------------|\n| optimize | {FILL: from GA4 events} | |\n| affiliate_click | {FILL} | |\n| calendar_export | {FILL} | |\n| copy_dates | {FILL} | |\n| calculator_interaction | {FILL} | |\n\n## Revenue\n| Stream | This Month | Last Month | Delta |\n|--------|-----------|-----------|-------|\n| Affiliate revenue | {FILL: from affiliate dashboards} | | |\n| Premium MRR | {FILL: from Stripe, or N/A if not launched} | | |\n| Sponsorship | {FILL: or N/A} | | |\n| **Total** | | | |\n\n## Affiliate Breakdown\n| Provider | Clicks | Conversions | Revenue | CVR |\n|----------|--------|-------------|---------|-----|\n| Skyscanner | {FILL} | {FILL} | {FILL} | |\n| Booking.com | {FILL} | {FILL} | {FILL} | |\n| Hotels.com | {FILL} | {FILL} | {FILL} | |\n| Kiwi | {FILL} | {FILL} | {FILL} | |\n| Trip.com | {FILL} | {FILL} | {FILL} | |\n\n## vs Targets (from revenue-forecast.md)\n| Metric | Actual | Target | Status |\n|--------|--------|--------|--------|\n| MAU | {FILL} | {look up month target} | {GREEN if >= 60% of target, YELLOW if 40-60%, RED if < 40%} |\n| Affiliate revenue | {FILL} | {look up} | |\n| Premium subs | {FILL} | {look up} | |\n\n## Action Items\n1. {Based on data above}\n2. {Based on data above}\n3. {Based on data above}\n```\n\nAlso read revenue-forecast.md in the project root to look up the monthly targets for comparison.",
    "lightContext": false,
    "timeoutSeconds": 120
  }
}
```

---

### R-03: Biweekly Blog Content Drafting

**Cron:** `0 9 1,15 * *` (1st and 15th of each month, 9am PT)
**Session:** isolated

#### OpenClaw Cron Definition

```json
{
  "name": "Blog Content Pipeline",
  "schedule": { "kind": "cron", "expr": "0 9 1,15 * *", "tz": "America/Los_Angeles" },
  "sessionTarget": "isolated",
  "wakeMode": "now",
  "payload": {
    "kind": "agentTurn",
    "message": "You are the content writer for Leavewise at /Users/constantlee/PTO-optimizer.\n\nTASK: Draft one English blog post and one Korean Naver blog post.\n\nFOR THE ENGLISH POST:\n1. Check what posts already exist in content/blog/ to avoid duplicating topics\n2. Choose a topic related to PTO optimization, vacation planning, or travel timing for the current year\n3. Target a long-tail keyword that someone planning PTO would search for\n4. Write a 1,200+ word post in markdown format with this frontmatter:\n   ```\n   ---\n   title: \"Your Title Here\"\n   description: \"Meta description under 160 chars\"\n   date: \"{today's date YYYY-MM-DD}\"\n   keyword: \"target keyword phrase\"\n   ---\n   ```\n5. Include at least 3 internal links to https://leavewise.app/optimize using anchor text like 'try the optimizer', 'plan your time off', 'see your personalized plan'\n6. Use H2 and H3 headings that match search intent\n7. Include specific date examples for the current year\n8. End with a CTA section linking to the optimizer\n9. Save to content/blog/{slug}.md where slug is the kebab-case title\n\nFOR THE KOREAN POST:\n1. Check what posts already exist in docs/naver-blog/ to avoid duplicating topics\n2. Choose a topic relevant to Korean office workers (직장인) and their 연차\n3. Write an 800+ word post in natural Korean with this frontmatter:\n   ```\n   ---\n   title: \"한국어 제목\"\n   meta_description: \"네이버 블로그 설명 160자 이내\"\n   tags: [연차, 직장인, 황금연휴, 연차계획, 휴가계획]\n   date: \"{today's date YYYY-MM-DD}\"\n   ---\n   ```\n4. Include a CTA linking to https://leavewise.app\n5. Include specific Korean holiday dates for the current year\n6. Save to docs/naver-blog/post-{NN}.md where NN is the next sequential number\n\nAfter writing both posts, run: npm run build\nThe build must succeed.\n\nReport back with: file paths created, word counts, target keywords.",
    "lightContext": false,
    "timeoutSeconds": 300
  }
}
```

---

### R-04: Weekly Affiliate Link Health Check

**Cron:** `0 8 * * 3` (every Wednesday 8am PT)
**Session:** isolated

#### OpenClaw Cron Definition

```json
{
  "name": "Affiliate Link Health Check",
  "schedule": { "kind": "cron", "expr": "0 8 * * 3", "tz": "America/Los_Angeles" },
  "sessionTarget": "isolated",
  "wakeMode": "now",
  "payload": {
    "kind": "agentTurn",
    "message": "You are the link health check agent for Leavewise at /Users/constantlee/PTO-optimizer.\n\nTASK: Verify all affiliate link builder functions produce valid URLs.\n\nSTEP 1: Read lib/affiliates.ts and identify all exported link builder functions.\n\nSTEP 2: For each function, generate a test URL using realistic sample parameters:\n- buildKiwiLink: use deeplink='https://www.kiwi.com/deep?from=JFK&to=CDG', affiliateId='test123'\n- buildTripComLink: use origin='JFK', dateStr='2026-06-01', currency='USD', affiliateId='test456'\n- buildBookingComLink: use origin='JFK', dateFrom='2026-06-01', dateTo='2026-06-10', affiliateId='test789'\n- Any other link builders that exist in the file\n\nSTEP 3: For each generated URL, verify:\n- The URL is syntactically valid (parseable by new URL())\n- Contains utm_source=leavewise\n- Contains utm_medium=affiliate\n- Contains the affiliate ID parameter\n\nSTEP 4: Use curl to test each base domain (HEAD request, follow redirects):\n- curl -sI -o /dev/null -w '%{http_code}' 'https://www.kiwi.com'\n- curl -sI -o /dev/null -w '%{http_code}' 'https://www.trip.com'\n- curl -sI -o /dev/null -w '%{http_code}' 'https://www.booking.com'\n\nSTEP 5: Write report to docs/reports/link-health/{YYYY-MM-DD}.md:\n\n```markdown\n# Affiliate Link Health — {YYYY-MM-DD}\n\n| Provider | Test URL Valid | UTM Params | Affiliate ID | Domain Reachable | Status |\n|----------|---------------|------------|--------------|------------------|--------|\n| Kiwi | Yes/No | Yes/No | Yes/No | {HTTP code} | OK/BROKEN |\n| Trip.com | Yes/No | Yes/No | Yes/No | {HTTP code} | OK/BROKEN |\n| Booking.com | Yes/No | Yes/No | Yes/No | {HTTP code} | OK/BROKEN |\n\n## Issues Found\n{list any issues, or 'None'}\n```\n\nIf any link is broken (domain unreachable or URL invalid), flag it clearly in the report.",
    "lightContext": true,
    "timeoutSeconds": 60
  }
}
```

---

## Decision Milestones

| Milestone | Expected | Decision Unlocked | Verification Command |
|-----------|----------|-------------------|---------------------|
| First $1K affiliate month | Month 7 | No changes needed — keep executing | Check affiliate dashboards |
| 10K MAU | Month 7 | Begin sponsor outreach (P3-02) | GA4: `audiences > overview > 28-day active` |
| $5K/month total revenue | Month 11 | Launch premium tier (P3-01 → implementation) | Sum affiliate + sponsor revenue |
| 30K MAU | Month 12 | Year 1 base case achieved | GA4 monthly active users |

---

## File Output Map (Complete)

| Task | Files Created | Files Modified |
|------|--------------|----------------|
| P0-01 | `docs/affiliate-signup-us.md` | — |
| P0-02 | `docs/affiliate-signup-kr.md` | — |
| P0-03 | `lib/analytics.ts` | `app/layout.tsx` |
| P0-04 | `app/sitemap.ts`, `app/robots.ts` | — |
| P0-05 | `docs/product-hunt/listing.md`, `docs/product-hunt/hunter-email.md` | — |
| P0-06 | `docs/reddit/r-personalfinance.md`, `docs/reddit/r-travel.md`, `docs/reddit/r-digitalnomad.md`, `docs/reddit/r-sideproject.md`, `docs/reddit/schedule.md` | — |
| P0-07 | `docs/blind/en.md`, `docs/blind/kr.md` | — |
| P0-08 | `docs/naver-blog/post-01.md`, `docs/naver-blog/post-02.md` | — |
| P1-01 | `lib/kakao-share.ts` | `app/optimize/page.tsx` |
| P2-01 | `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `lib/blog.ts`, `content/blog/.gitkeep` | `app/sitemap.ts` |
| P3-01 | `docs/premium/spec.md` | — |
| P3-02 | `docs/sponsorship/outreach-en.md`, `docs/sponsorship/outreach-kr.md`, `docs/sponsorship/tracker.md` | — |
| R-01 | `docs/reports/seo/{date}.md` (weekly) | — |
| R-02 | `docs/reports/monthly/{month}.md` (monthly) | — |
| R-03 | `content/blog/*.md`, `docs/naver-blog/*.md` (biweekly) | — |
| R-04 | `docs/reports/link-health/{date}.md` (weekly) | — |

---
---

# Phase 4: Openclaw Autonomous Execution Tasks (March 2026+)

> Added: 2026-03-26
> These tasks are designed for fully autonomous agent execution.
> Each task includes exact success criteria so the agent can self-verify.
> Refer to `marketing.md` Section "Part 2: Openclaw Execution Playbook" for the content copy, prompts, and spike calendar.

---

## P4-01: Easter Blog Post — URGENT (Deadline: Mar 30, 2026)

**Files created:** `content/blog/easter-long-weekend-2026.md` or equivalent blog route
**Depends on:** P2-01 (blog infrastructure)
**Priority:** CRITICAL — Easter is Apr 5, publish window closing

### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.
Read AGENTS.md first. Read marketing.md Section A-01 for the exact content brief.

TASK: Create the Easter 2026 blog post.

1. Read the content brief in marketing.md under "A-01: Easter Window Blog Post"
2. Follow the exact structure and tone described
3. Write the post as a .md file at content/blog/easter-long-weekend-2026.md
4. Include frontmatter: title, date (2026-03-28), slug, description, keywords
5. Embed a link to /optimize with UTM params: ?utm_source=blog&utm_medium=content&utm_campaign=easter2026
6. Include the day-by-day table as a markdown table
7. Include meta description in frontmatter

VERIFICATION:
- File exists and has ≥800 words (run: wc -w content/blog/easter-long-weekend-2026.md)
- Contains the UTM-tagged link to /optimize
- Contains a markdown table showing the day-by-day breakdown
- Contains at least 3 travel destination suggestions
```

**KPI:** Published by Mar 30. Indexed in Google by Apr 3.
**Success criteria:** ≥200 organic clicks in 30 days. ≥5% CTR from post to /optimize.

---

## P4-02: Reddit Easter Seeding (Deadline: Mar 28, 2026)

**Files created:** `docs/reddit/easter-2026-r-travel.md`
**Depends on:** Nothing
**Priority:** CRITICAL — must post before Easter week

### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.
Read marketing.md Section B-01 for the exact Reddit post copy.

TASK: Prepare the Reddit post for r/travel.

1. Create docs/reddit/easter-2026-r-travel.md with the exact post content from marketing.md B-01
2. At the top of the file, add posting instructions:
   - Subreddit: r/travel
   - Post date: March 28, 2026
   - Post type: Text post
   - Flair: "Trip Reports / Discussion" (or whatever r/travel allows)
   - UTM link to use: leavewise.app/optimize?utm_source=reddit&utm_medium=community&utm_campaign=easter2026
3. Add engagement rules at the bottom:
   - Reply to every comment within 24 hours
   - If asked about other holidays, calculate and share the specific bridge window
   - Never be defensive if someone says "this is an ad" — just say "yeah I built it, happy to answer questions about the math"
   - Do not post to another subreddit within 5 days

VERIFICATION:
- File exists at docs/reddit/easter-2026-r-travel.md
- Contains the full post text
- Contains the UTM-tagged link
- Contains engagement rules
```

**KPI:** ≥20 upvotes, ≥100 referral clicks
**Success criteria:** Post not removed. ≥5 comments. ≥3 organic reply threads.

---

## P4-03: Children's Day Korean Content (Deadline: Apr 5, 2026)

**Files created:** `docs/naver-blog/childrens-day-2026.md`
**Depends on:** Nothing
**Priority:** HIGH — Children's Day is May 5

### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.
Read marketing.md Section A-03 for the exact Naver Blog content brief.

TASK: Create the Children's Day Korean blog post draft.

1. Follow the content brief in marketing.md A-03 exactly
2. Write the full post in Korean at docs/naver-blog/childrens-day-2026.md
3. Include: Naver Blog tags, image placeholder descriptions, and CTA links
4. Ensure post is ≥1,200 characters (Korean character count, not word count)
5. Include the UTM link: leavewise.app/ko?utm_source=naver&utm_medium=blog&utm_campaign=childrens_day_2026

VERIFICATION:
- File exists and contains Korean text
- Contains UTM-tagged link to leavewise.app/ko
- Contains at least 2 strategy breakdowns with day-by-day tables
- Contains Naver Blog tags section
```

**KPI:** ≥500 Naver views in April. Top 10 for "어린이날 연차 2026".
**Success criteria:** ≥50 clicks to leavewise.app/ko. ≥3 이웃 additions.

---

## P4-04: Monthly Social Post Generator (Recurring — 1st of each month)

**Files created:** `docs/social/YYYY-MM-window.md`
**Depends on:** Nothing
**Priority:** MEDIUM — consistency is key

### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.
Read marketing.md Section A-06 for the post template.

TASK: Generate the Window of the Month post for [CURRENT MONTH + 1].

1. Check the 2026 holiday calendar for the target month
2. Find the best PTO bridge opportunity (highest efficiency: days off / PTO cost)
3. Write both English and Korean versions using the template in A-06
4. Save to docs/social/YYYY-MM-window.md
5. Include: exact post copy, hashtags, image description, posting channels

The file must contain:
- English Twitter/X post (≤280 characters)
- Korean Instagram caption
- Image design brief for the accompanying graphic
- Posting date: 1st of the target month

VERIFICATION:
- File exists at docs/social/YYYY-MM-window.md
- English post is ≤280 characters
- Both posts contain a link to leavewise.app
- Image description specifies teal color scheme, no gradients, no purple
```

**KPI:** ≥50 impressions per post (Twitter), ≥100 (Instagram)
**Success criteria:** 100% monthly posting cadence maintained.

---

## P4-05: Chuseok Mega-Campaign Preparation (Deadline: Jul 15, 2026)

**Files created:** `docs/naver-blog/chuseok-2026-guide.md`, `docs/social/chuseok-infographic-brief.md`, `docs/blind/chuseok-2026.md`, `docs/kakao/chuseok-2026-card.md`
**Depends on:** Nothing
**Priority:** HIGH — this is the single biggest traffic event for Korea

### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.
Read marketing.md Sections A-04, B-03, and B-04 for all Chuseok content briefs.

TASK: Prepare the complete Chuseok 2026 campaign kit.

Create ALL of the following files:

1. docs/naver-blog/chuseok-2026-guide.md — The 2,000-word definitive guide per A-04
2. docs/blind/chuseok-2026.md — The Blind post per B-03, with engagement rules
3. docs/kakao/chuseok-2026-card.md — The KakaoTalk infographic design brief per B-04
4. docs/social/chuseok-instagram.md — Instagram carousel post (5 slides):
   - Slide 1: "추석 황금연휴 2026"
   - Slide 2: Strategy A (연차 0일 → 5일)
   - Slide 3: Strategy B (연차 2일 → 10일)
   - Slide 4: Strategy C (연차 4일 → 16일)
   - Slide 5: CTA with leavewise.app/ko link

All files must include:
- Publishing date (Naver: Aug 10, Blind: Aug 15-20, KakaoTalk: Aug 20-Sep 15, Instagram: Aug 10)
- UTM-tagged links appropriate to each channel
- Success criteria from marketing.md

VERIFICATION:
- All 4 files exist in their respective directories
- Naver post is ≥1,500 words in Korean
- Blind post is ≤500 characters (Blind has a character limit)
- All files contain UTM-tagged links
- All files reference the correct Chuseok 2026 dates (Sep 24-26, substitute Sep 28)
```

**KPI:** Combined Chuseok campaign: ≥5,000 visits to leavewise.app/ko in Aug–Sep.
**Success criteria:** #1 Naver result for "추석 황금연휴 2026". ≥200 Blind clicks. ≥50 KakaoTalk shares.

---

## P4-06: Memorial Day Blog Post (Deadline: Apr 20, 2026)

**Files created:** `content/blog/memorial-day-2026-vacation.md`
**Depends on:** P2-01

### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.
Read marketing.md Section A-02 for the exact content brief.

TASK: Create the Memorial Day 2026 blog post following A-02 exactly.
Save to content/blog/memorial-day-2026-vacation.md with frontmatter.
Include UTM link: ?utm_source=blog&utm_medium=content&utm_campaign=memday2026

VERIFICATION:
- File exists, ≥800 words
- Contains day-by-day markdown table
- Contains UTM-tagged optimizer link
- Contains ≥3 travel destination suggestions
```

**KPI:** Page 1 for "memorial day 2026 vacation" within 45 days.
**Success criteria:** ≥300 organic clicks in May.

---

## P4-07: Year-End PTO Rush Post (Deadline: Oct 15, 2026)

**Files created:** `content/blog/use-remaining-pto-2026.md`
**Depends on:** P2-01

### Agent Prompt

```
Read marketing.md Section A-05. Create the year-end PTO blog post.
Save to content/blog/use-remaining-pto-2026.md.
UTM: ?utm_source=blog&utm_medium=content&utm_campaign=yearend2026

VERIFICATION:
- ≥1,000 words
- Contains "2 days left / 3 days left / 5 days left / 8+ days left" scenarios
- Contains the $2,500 stat with source attribution
```

**KPI:** ≥1,000 organic clicks in Oct–Dec.
**Success criteria:** ≥12% CTR to /optimize.

---

## P4-08: Reddit Year-End Push (Deadline: Oct 20–25, 2026)

**Files created:** `docs/reddit/yearend-pto-r-personalfinance.md`
**Depends on:** Nothing

### Agent Prompt

```
Read marketing.md Section B-02. Create the Reddit post for r/personalfinance.
Save to docs/reddit/yearend-pto-r-personalfinance.md with post copy, engagement rules.
UTM: ?utm_source=reddit&utm_medium=community&utm_campaign=yearend2026

VERIFICATION:
- File exists with full post copy
- Includes the "$2,500 in lost compensation" hook
- Includes 4 scenarios (2/3/5/8+ days remaining)
```

**KPI:** ≥100 upvotes. ≥500 clicks.
**Success criteria:** ≥20 comments. Cross-shared by at least 1 user.

---

## P4-09: Email Nurture Sequence Setup (Deadline: Apr 15, 2026)

**Files created:** `docs/email/nurture-sequence.md`
**Depends on:** Resend API configured

### Agent Prompt

```
Read marketing.md Section C-03. Create the email nurture sequence spec.
Save to docs/email/nurture-sequence.md.

Include:
1. All 3 email templates with subject lines and body copy
2. Send timing: Email 1 = immediate, Email 2 = Day 7, Email 3 = 4 weeks before next holiday
3. Dynamic content rules: how to determine the "next upcoming best window" based on current date
4. Resend API integration notes (reference existing .env.example RESEND_API_KEY)
5. Unsubscribe compliance requirements (CAN-SPAM / Korean 정보통신망법)

VERIFICATION:
- File contains 3 complete email templates
- Each template has subject line, body, CTA with UTM link
- Contains dynamic content logic for date-based personalization
```

**KPI:** ≥30% open rate, ≥5% click rate on affiliate links.
**Success criteria:** Sequence live within 2 weeks. ≥100 emails sent in first month.

---

## P4-10: TikTok/Reels Script Batch (Deadline: Apr 30, 2026)

**Files created:** `docs/video/scripts/batch-01.md`
**Depends on:** Nothing

### Agent Prompt

```
Read marketing.md Section E-01. Generate the first batch of 8 video scripts.

For each of the 3 templates (The Math, Did You Know, Holiday Bridge), write scripts for the next 8 upcoming holiday windows. Distribute templates so the batch has variety:
- 3 × "The Math" scripts
- 3 × "Did You Know" scripts
- 2 × "Holiday Bridge" scripts

Each script must include:
1. Template type
2. Duration (12/15/20 seconds)
3. Exact spoken script with [PAUSES] marked
4. Screen recording description (what the viewer sees)
5. Text overlay copy
6. Hashtags (≤10 per video)
7. Target holiday/window and dates

Save all 8 scripts in docs/video/scripts/batch-01.md.

VERIFICATION:
- File contains 8 complete scripts
- Each script has all 7 required fields
- Scripts use real 2026 dates (verify against holiday calendar)
- No two scripts target the same holiday window
```

**KPI:** ≥1 video reaches 10K views within 7 days.
**Success criteria:** All 8 videos produced and posted over 4 weeks (2/week cadence).

---

## Updated File Output Map (Phase 4)

| Task | Files Created | Deadline |
|------|--------------|----------|
| P4-01 | `content/blog/easter-long-weekend-2026.md` | Mar 30 |
| P4-02 | `docs/reddit/easter-2026-r-travel.md` | Mar 28 |
| P4-03 | `docs/naver-blog/childrens-day-2026.md` | Apr 5 |
| P4-04 | `docs/social/YYYY-MM-window.md` (monthly) | 1st of month |
| P4-05 | `docs/naver-blog/chuseok-2026-guide.md`, `docs/blind/chuseok-2026.md`, `docs/kakao/chuseok-2026-card.md`, `docs/social/chuseok-instagram.md` | Jul 15 |
| P4-06 | `content/blog/memorial-day-2026-vacation.md` | Apr 20 |
| P4-07 | `content/blog/use-remaining-pto-2026.md` | Oct 15 |
| P4-08 | `docs/reddit/yearend-pto-r-personalfinance.md` | Oct 20 |
| P4-09 | `docs/email/nurture-sequence.md` | Apr 15 |
| P4-10 | `docs/video/scripts/batch-01.md` | Apr 30 |

---

## Phase 4 Milestone Checkpoints

| Checkpoint | Date | Criteria | Action if NOT Met |
|-----------|------|----------|-------------------|
| Easter content live | Mar 30 | Blog + Reddit posted | Deprioritize everything else until done |
| May content pipeline | Apr 20 | Memorial Day + Children's Day posts ready | Extend deadline by 1 week max |
| Social cadence established | May 1 | First 2 "Window of Month" posts published | Simplify to text-only posts, drop image requirement |
| Video pilot complete | May 31 | ≥4 TikTok/Reels posted | Switch to static image carousel format |
| Chuseok kit ready | Jul 15 | All 4 Chuseok files created | This is non-negotiable — Chuseok is the biggest KR event |
| Email sequence live | Apr 15 | 3 emails configured in Resend | Start with email 1 only, add 2-3 later |
| H2 content calendar set | Jul 1 | Jul–Dec blog posts planned with titles + keywords | Use marketing.md spike calendar as-is |
