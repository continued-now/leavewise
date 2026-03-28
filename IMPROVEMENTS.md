# Leavewise — Improvement Plan

> Generated: 2026-03-28
> Priority: P0 (critical) → P1 (high) → P2 (medium) → P3 (nice-to-have)
> Each item has: problem, solution, files to touch, effort estimate, and success criteria.

---

## P0 — Critical (Do This Week)

### P0-01: Rate Limiter Breaks in Production

**Problem:** `lib/rate-limit.ts` uses in-memory Maps. On Vercel, each serverless invocation is a separate process — rate limits are never enforced. An attacker can hammer the flight/hotel APIs without throttling, burning through Kiwi API credits.

**Solution:** Replace with Upstash Redis rate limiting (`@upstash/ratelimit`). Upstash has a free tier (10K requests/day) that covers this use case.

**Files:**
- `lib/rate-limit.ts` — rewrite to use `@upstash/ratelimit`
- `.env.example` — add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

**Effort:** 1 hour
**Success criteria:** Rate limiting works across concurrent Vercel instances. Verify by hitting `/api/flights` 35 times rapidly — should get 429 after 30.

---

### P0-02: Sitemap & Robots.txt Missing

**Problem:** No `sitemap.xml` or `robots.txt` exists. Google and Naver cannot efficiently discover pages. Blog posts, the optimizer, and landing pages are invisible to crawlers beyond what they find through links.

**Solution:** Create dynamic sitemap and robots.txt using Next.js conventions.

**Files to create:**
- `app/sitemap.ts` — dynamic sitemap generating URLs for `/`, `/ko`, `/optimize`, `/blog`, `/ko/blog`, and all published blog post slugs
- `app/robots.ts` — allow all crawlers, point to sitemap URL

**Effort:** 30 minutes
**Success criteria:** `curl localhost:3000/sitemap.xml` returns valid XML with all public URLs. `curl localhost:3000/robots.txt` returns valid robots.txt with sitemap reference. Submit to Google Search Console and Naver Search Advisor.

---

### P0-03: Blog API fs.writeFileSync Not Error-Wrapped

**Problem:** `app/api/blog/route.ts` line 92 and `app/api/blog/[slug]/route.ts` lines 113–116 call `fs.writeFileSync` and `fs.unlinkSync` without try-catch. On read-only filesystems (like Vercel's production runtime), these will throw unhandled exceptions.

**Solution:** Wrap all file-system writes in try-catch with proper error responses. Note: blog CRUD will only work in development or on a server with a writable filesystem — add a clear error message for production.

**Files:**
- `app/api/blog/route.ts` — wrap POST handler fs calls
- `app/api/blog/[slug]/route.ts` — wrap PUT and DELETE handler fs calls

**Effort:** 20 minutes
**Success criteria:** API returns `500` with `"Blog editing is not available in this environment"` when filesystem is read-only, instead of crashing.

---

## P1 — High Priority (This Month)

### P1-01: SEO Structured Data (Schema.org)

**Problem:** No structured data beyond the basic WebApplication schema on the root layout. Blog posts lack Article schema. The optimizer lacks FAQ schema. Missing structured data means no rich snippets in Google results.

**Solution:** Add JSON-LD structured data to key pages.

**Files:**
- `app/blog/[slug]/page.tsx` — add `Article` schema with author, datePublished, description
- `app/ko/blog/[slug]/page.tsx` — same for Korean
- `components/LandingPageContent.tsx` — add `FAQPage` schema from the existing FAQ section
- `app/optimize/page.tsx` — add `SoftwareApplication` schema with offers (free)

**Effort:** 2 hours
**Success criteria:** Google Rich Results Test (search.google.com/test/rich-results) passes for all page types. Blog posts show publication date in search results. FAQ section may display as expandable FAQ snippet.

---

### P1-02: Dynamic OG Images for Blog Posts

**Problem:** All blog posts share the same generic OpenGraph image (or none). When shared on Twitter, LinkedIn, or KakaoTalk, they look identical and generic.

**Solution:** Generate per-post OG images using Next.js `ImageResponse` (built-in, no external service needed). Each image shows the post title, a key stat ("4 PTO → 10 days off"), and the Leavewise brand.

**Files to create:**
- `app/blog/[slug]/opengraph-image.tsx` — dynamic OG image generator
- `app/ko/blog/[slug]/opengraph-image.tsx` — Korean version

**Effort:** 2 hours
**Success criteria:** Sharing any blog post URL on Twitter/LinkedIn shows a custom card with the post title and stats. Verify with Twitter Card Validator.

---

### P1-03: Skip-to-Content & Focus Management

**Problem:** No skip-to-main-content link exists. Screen reader users must tab through the entire nav and sidebar to reach the calendar. After optimization, focus doesn't move to results.

**Solution:**
1. Add a visually-hidden skip link as the first focusable element on each page
2. After optimization completes, programmatically focus the results area
3. Add `aria-live="polite"` to the results summary so screen readers announce it

**Files:**
- `app/layout.tsx` — add skip link
- `app/blog/layout.tsx`, `app/ko/blog/layout.tsx` — add skip link
- `hooks/useOptimizerResults.ts` — add `focus()` call after results load
- `app/optimize/page.tsx` — add `aria-live` to results summary

**Effort:** 1 hour
**Success criteria:** Tab from page load → first press goes to "Skip to main content" → pressing Enter jumps to main. After optimization, VoiceOver/NVDA announces the results summary.

---

### P1-04: Canonical Tags & hreflang

**Problem:** English and Korean pages serve similar content at `/` and `/ko`, `/blog` and `/ko/blog`. Without `hreflang` tags, Google may treat them as duplicates or show the wrong language version to users.

**Solution:** Add `hreflang` alternate links and canonical tags to all pages.

**Files:**
- `app/layout.tsx` — add `alternates` metadata with hreflang for en/ko
- `app/ko/page.tsx` — add canonical pointing to self + hreflang
- `app/blog/[slug]/page.tsx` — canonical for blog posts
- `app/ko/blog/[slug]/page.tsx` — canonical + hreflang cross-link

**Effort:** 1 hour
**Success criteria:** `<link rel="alternate" hreflang="ko" href="/ko" />` present on English pages. Google Search Console shows no "duplicate without canonical" warnings.

---

### P1-05: Enhanced Analytics — User Engagement Events

**Problem:** Current analytics track conversions (optimize, affiliate click, export) but miss engagement depth. No data on: how many days users click in the calendar, how long they spend on the page, whether they compare strategies, or how far they scroll on blog posts.

**Solution:** Add lightweight engagement events without bloating the bundle.

**Events to add:**
- `calendar_day_click` — when user toggles a PTO day (count per session)
- `strategy_switch` — when user switches between short/balanced/long
- `blog_scroll_depth` — 25%, 50%, 75%, 100% scroll milestones
- `sidebar_section_toggle` — which collapsible sections users open
- `flight_cta_view` — when a flight search message box becomes visible (impression tracking)

**Files:**
- `lib/analytics.ts` — add new event functions
- `app/optimize/page.tsx` — wire strategy switch and sidebar toggles
- `components/InteractiveCalendar.tsx` — wire day click and flight CTA impression
- `app/blog/[slug]/page.tsx` — add scroll tracking

**Effort:** 2 hours
**Success criteria:** GA4 shows new events within 24 hours. Can answer: "What % of users switch strategies?" and "What % of blog readers scroll past 50%?"

---

### P1-06: Multi-Country Expansion Foundation

**Problem:** The app supports US and KR only. The architecture hardcodes these two countries in multiple places. Adding a third country (e.g., Japan, UK, Germany) requires touching 10+ files.

**Solution:** Refactor country-specific logic into a single configuration module.

**Files to create:**
- `lib/countries-config.ts` — central config per country: holidays API, default airport, currency, locale, avg PTO days, substitute holiday rules

**Files to modify:**
- `hooks/useFormState.ts` — use config instead of hardcoded defaults
- `lib/api.ts` — use config for substitute holiday lookup
- `app/optimize/page.tsx` — country selector from config
- `components/LandingPageContent.tsx` — sample windows from config

**Effort:** 4 hours
**Success criteria:** Adding Japan (JP) as a third country requires editing only `lib/countries-config.ts` and adding a holiday data entry. No other files need changes.

---

## P2 — Medium Priority (Next 2 Months)

### P2-01: Onboarding Tour for First-Time Users

**Problem:** Current onboarding is a static text banner that most users dismiss without reading. First-time users don't know: (1) they can click calendar days directly, (2) the optimizer finds windows automatically, (3) they can switch strategies after optimizing.

**Solution:** Build a 4-step guided tour using a lightweight popover system (no external library — just absolute-positioned divs with backdrop).

**Steps:**
1. "Pick your country and PTO days" → highlight sidebar top
2. "Hit Optimize" → highlight the optimize button
3. "Compare strategies" → highlight the strategy cards (after first optimization)
4. "Click any day to add/remove PTO" → highlight a calendar cell

**Files to create:**
- `components/OnboardingTour.tsx` — tour overlay with step progression
- `hooks/useOnboarding.ts` — step state, localStorage persistence

**Files to modify:**
- `app/optimize/page.tsx` — mount the tour component

**Effort:** 4 hours
**Success criteria:** First-time visitors see the tour. Returning visitors don't. Tour completion rate tracked via analytics. Users who complete the tour have higher optimization rates (measurable in GA4 funnel).

---

### P2-02: Blog Post Table of Contents

**Problem:** Blog posts are 800–2000 words. Longer posts lack navigation — users can't jump to the section they care about (e.g., "Where to Go" or "Booking Strategy").

**Solution:** Auto-generate a table of contents from `## ` headings in the markdown. Display as a sticky sidebar on desktop and a collapsible toggle on mobile.

**Files to create:**
- `components/blog/TableOfContents.tsx` — extract headings from HTML, render linked list

**Files to modify:**
- `lib/blog.ts` — extract heading IDs during markdown processing (add `rehype-slug` for heading anchors)
- `app/blog/[slug]/page.tsx` — render TOC alongside content
- `app/ko/blog/[slug]/page.tsx` — same

**Effort:** 3 hours
**Success criteria:** Blog posts with 3+ headings show a TOC. Clicking a TOC entry smooth-scrolls to that section. Active section highlighted as user scrolls.

---

### P2-03: "Compare My Plan" Social Feature

**Problem:** Users optimize their PTO and see results, but there's no social proof or comparison. "Did I do well? How does my plan compare to others?"

**Solution:** After optimization, show an anonymous comparison: "Your plan is more efficient than 73% of Leavewise users." Based on aggregated (not individual) efficiency scores stored in a simple KV store.

**Implementation:**
1. After optimization, send `{ efficiency, country, ptoDays }` to an API endpoint
2. API stores in Upstash Redis as a sorted set
3. Return the user's percentile rank
4. Display as a small badge: "Top 27% efficiency"

**Files to create:**
- `app/api/benchmark/route.ts` — store and retrieve percentile
- `components/EfficiencyBadge.tsx` — display component

**Files to modify:**
- `hooks/useOptimizerResults.ts` — call benchmark API after optimization
- `app/optimize/page.tsx` — render badge in results

**Effort:** 3 hours
**Success criteria:** Badge appears after optimization. Users share screenshots of their percentile (trackable via share analytics). Benchmark data populates after 100+ optimizations.

---

### P2-04: Email Re-engagement Automation

**Problem:** Users who signed up for the PTO calendar PDF receive it, then never hear from Leavewise again. No re-engagement before major holidays.

**Solution:** Build a scheduled email system using Resend's batch API. Trigger emails 4 weeks before each major holiday window.

**Email triggers:**
- 4 weeks before Easter: "Easter window opens in 4 weeks — have you booked?"
- 4 weeks before Memorial Day, July 4th, Thanksgiving, Christmas
- Korean equivalents: 설날, 어린이날, 추석, 크리스마스

**Files to create:**
- `app/api/email/trigger/route.ts` — accepts holiday name, sends batch email to subscribed users
- `lib/email-templates.ts` — email HTML templates per holiday

**Files to modify:**
- `app/api/subscribe/route.ts` — store subscriber locale for targeted sends

**Effort:** 6 hours (including template design)
**Success criteria:** Emails sent 4 weeks before each major holiday. Open rate ≥30%. CTR to optimizer ≥5%. Unsubscribe rate <2%.

---

### P2-05: Performance — Lazy Load Below-Fold Components

**Problem:** The optimize page loads everything at once: the full calendar (12 months), all window cards, the share modal, the holiday panel. On mobile with slow connections, initial paint is delayed.

**Solution:** Lazy load components that aren't visible on initial render.

**Components to lazy load:**
- `ShareCard` — only rendered when user clicks "Share plan"
- `ExpandedLongWeekendModal` — only rendered on click
- `HolidayPanel` — only rendered on holiday click
- Calendar months beyond the first 3 visible

**Files to modify:**
- `app/optimize/page.tsx` — wrap with `dynamic(() => import(...), { ssr: false })`

**Effort:** 1 hour
**Success criteria:** Lighthouse performance score improves by ≥5 points. Time to Interactive drops by ≥200ms on 3G throttled connection.

---

## P3 — Nice to Have (Quarter 2+)

### P3-01: Dark Mode Blog Support

**Problem:** The optimizer supports dark mode via theme toggle, but blog pages don't respect the theme. Switching to dark mode on the optimizer, then navigating to the blog, shows a jarring white page.

**Solution:** Apply the existing dark mode CSS variables to blog layouts and prose content.

**Files:**
- `app/blog/layout.tsx` — inherit theme from cookie/localStorage
- `app/ko/blog/layout.tsx` — same
- `app/globals.css` — add dark mode prose overrides

**Effort:** 1 hour

---

### P3-02: PWA / Add to Home Screen

**Problem:** No service worker or web app manifest exists. Users can't add Leavewise to their phone's home screen for quick access.

**Solution:** Add a `manifest.json` and basic service worker for offline support of the landing page and cached calendar data.

**Files to create:**
- `public/manifest.json`
- `public/sw.js` — cache landing page + optimize page shell

**Effort:** 2 hours

---

### P3-03: Calendar Sync (Google Calendar / Apple Calendar)

**Problem:** After optimizing, users manually add PTO dates to their calendar. This is friction that reduces follow-through.

**Solution:** Add "Add to Google Calendar" and "Add to Apple Calendar" buttons per window. Google Calendar uses a URL scheme (`calendar.google.com/calendar/event?action=TEMPLATE&...`), Apple Calendar uses the existing ICS download.

**Files to modify:**
- `components/WindowCard.tsx` — add Google Calendar link button
- `lib/affiliates.ts` — already has `buildGoogleCalendarLink()`, just needs to be wired in

**Effort:** 30 minutes (the function already exists, just not exposed in the UI)

---

### P3-04: Estimated Travel Cost Per Window

**Problem:** Users see vacation windows ranked by PTO efficiency, but have no sense of travel cost. A 10-day window in December is efficient but expensive.

**Solution:** Show estimated travel cost range per window using the flight/hotel deal data already being fetched.

**Display:** Small badge on each WindowCard: "Est. $800–$1,200" based on:
- Flight deal price (already fetched)
- Hotel deal nightly rate × nights (already fetched)
- Simple daily budget from `destinations.ts` data

**Files to modify:**
- `components/WindowCard.tsx` — add cost estimate badge
- `hooks/useOptimizerResults.ts` — compute estimate from existing deal data

**Effort:** 2 hours

---

### P3-05: Blog RSS Feed

**Problem:** No RSS feed exists. Travel bloggers, newsletter curators, and power users who use RSS readers can't subscribe to new posts.

**Solution:** Generate an RSS/Atom feed from blog posts.

**Files to create:**
- `app/blog/feed.xml/route.ts` — dynamic RSS feed from `getAllPosts('en')`
- `app/ko/blog/feed.xml/route.ts` — Korean feed

**Effort:** 1 hour

---

### P3-06: Admin Authentication

**Problem:** `/blog/admin` has no authentication. Anyone who finds the URL can create, edit, or delete blog posts.

**Solution:** Add a simple password gate using an environment variable. Not a full auth system — just a password prompt that stores a session cookie.

**Files to create:**
- `app/blog/admin/layout.tsx` — check for auth cookie, show password form if missing
- `app/api/admin/auth/route.ts` — validate password against `ADMIN_PASSWORD` env var, set httpOnly cookie

**Effort:** 1 hour

---

## Implementation Priority Order

| Week | Items | Total Effort |
|------|-------|-------------|
| 1 | P0-01, P0-02, P0-03 | ~2 hours |
| 2 | P1-01, P1-03, P1-04 | ~4 hours |
| 3 | P1-02, P1-05 | ~4 hours |
| 4 | P1-06 | ~4 hours |
| 5–6 | P2-01, P2-02 | ~7 hours |
| 7–8 | P2-03, P2-04, P2-05 | ~10 hours |
| Q2 | P3-01 through P3-06 | ~8 hours |

---

## Metrics to Track After Implementation

| Improvement | Metric | Target |
|------------|--------|--------|
| Sitemap/robots | Pages indexed in GSC | All public pages within 2 weeks |
| Structured data | Rich snippets appearing | ≥1 page showing rich result within 30 days |
| OG images | Social CTR | ≥2x improvement in click-through from social shares |
| Skip-to-content | Accessibility score | Lighthouse accessibility ≥95 |
| Enhanced analytics | Engagement visibility | Can answer "what % switch strategies" within 1 week |
| Onboarding tour | Optimization rate | First-time user optimization rate ≥40% (up from ~25%) |
| Email re-engagement | Re-visit rate | ≥15% of email recipients return to optimizer |
| Social comparison | Share rate | ≥5% of optimizations result in a share action |
| Lazy loading | Performance | LCP <2.5s on mobile 3G |
