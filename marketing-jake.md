# Leavewise — Marketing Execution Plan (OpenClaw)

> Structured for execution via OpenClaw + Codex 5.4
> Each task is a self-contained agent prompt — copy-paste directly into an agent session.
> Every instruction is literal. Do not interpret, infer, or improvise. Follow exactly.
>
> Source document: `marketing.md`
> Project root: `/Users/constantlee/PTO-optimizer`
> Stack: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS
> Product URL: https://leavewise.app
> Optimizer URL: https://leavewise.app/optimize
> Korean URL: https://leavewise.app/ko
> Generated: 2026-03-27

---

## How to Use This File

Each task below has a `### Agent Prompt` section. That section is the **exact text** you send to the Codex 5.4 agent via OpenClaw. The agent should:
1. Execute the prompt verbatim
2. Create/modify only the files listed
3. Run the verification commands
4. Report back with the verification output

**Do not** combine multiple tasks into one prompt. Run them sequentially in the order listed within each phase. Tasks across different phases can run in parallel if their dependencies are met.

---

## 2026 Traffic Spike Calendar

These dates create natural demand surges. All content should be published **4-6 weeks before** each spike.

| Spike Date | Event | Markets | Publish Window | Search Volume Surge |
|-----------|-------|---------|---------------|-------------------|
| Apr 13-17 | Easter / Spring break planning | US | **NOW - Mar 30** | "easter long weekend 2026" |
| May 5 | Children's Day (어린이날) | KR | Apr 1-15 | "어린이날 연차 황금연휴" |
| May 22-25 | Memorial Day weekend | US | Apr 15-May 1 | "memorial day 2026 long weekend" |
| Jul 1-6 | July 4th planning | US | May 15-Jun 1 | "july 4th 2026 vacation" |
| Jul 17 | Constitution Day (제헌절, new 2026) | KR | Jun 1-15 | "제헌절 대체공휴일 2026" |
| Aug 15 | Liberation Day (광복절) | KR | Jul 1-15 | "광복절 연차 2026" |
| Sep 1 | Labor Day planning | US | Aug 1-15 | "labor day 2026 long weekend" |
| Sep 24-28 | Chuseok (추석) - **biggest KR spike** | KR | Aug 1-20 | "추석 황금연휴 2026" |
| Oct 3-5 | National Foundation + substitute | KR | Sep 1-15 | "개천절 대체공휴일" |
| Nov 1 | Year-end PTO planning season begins | US+KR | Oct 1-15 | "how to use remaining PTO 2026" |
| Nov 26 | Thanksgiving | US | Oct 15-Nov 1 | "thanksgiving 2026 vacation" |
| Dec 15-Jan 5 | Christmas/NY planning | US+KR | Nov 1-15 | "christmas new years 2026 PTO" |
| Jan 2027 | New year resolution / Seollal planning | US+KR | Dec 1-15 | "2027 PTO calendar" |

---

## Phase 1: USA Foundation (Weeks 1-2)

---

### M-US-01: Write 3 SEO Blog Posts for US Market

**Files created:** `content/blog/en/maximize-pto-federal-holidays-2026.md`, `content/blog/en/holiday-bridge-days-usa-2026.md`, `content/blog/en/10-days-off-4-pto-days.md`
**Depends on:** Blog route exists at `/blog`
**Human action required after:** Review posts, add screenshots of optimizer output

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read the AGENTS.md file first — it warns that Next.js APIs may differ from your training data. Check node_modules/next/dist/docs/ for correct conventions before writing code.

TASK: Create 3 SEO-optimized blog posts for the US market. Each post should be in markdown format with frontmatter.

STEP 1: Create content/blog/en/maximize-pto-federal-holidays-2026.md with this structure:

---
title: "How to Maximize PTO Around Federal Holidays in 2026"
description: "A complete guide to stretching your vacation days around US federal holidays. Turn 15 PTO days into 35+ days off with strategic planning."
date: "2026-03-27"
slug: "maximize-pto-federal-holidays-2026"
locale: "en"
keywords: ["maximize PTO 2026", "federal holidays PTO", "vacation planning 2026", "PTO optimization"]
---

Write a 1,500-word post covering:
1. Hook: "If you have 15 PTO days in 2026, you could get 35+ days off. Here's the exact math."
2. Every US federal holiday in 2026 with the bridge opportunity (day-by-day table)
3. A ranked list of the top 5 most efficient bridge windows
4. The concept of "PTO multiplier" — days off per PTO day used
5. CTA: "Calculate your exact windows automatically at leavewise.app/optimize"
Tone: Data-driven, conversational, zero fluff.

STEP 2: Create content/blog/en/holiday-bridge-days-usa-2026.md with this structure:

---
title: "Holiday Bridge Days USA 2026: The Complete Calendar"
description: "Every holiday bridge day opportunity in 2026. See which single PTO days give you 4-day weekends and which combos give you 9+ days off."
date: "2026-03-27"
slug: "holiday-bridge-days-usa-2026"
locale: "en"
keywords: ["bridge days 2026", "holiday bridge days USA", "long weekend 2026", "PTO bridge days"]
---

Write a 1,200-word post covering:
1. What are bridge days and why they matter
2. Month-by-month table of every bridge opportunity in 2026
3. "Best bang for your buck" section: the top 3 single-day PTO plays
4. Visual: efficiency ratings (stars) for each window
5. CTA: "See your personalized bridge calendar at leavewise.app/optimize"

STEP 3: Create content/blog/en/10-days-off-4-pto-days.md with this structure:

---
title: "How to Get 10 Days Off Using Only 4 PTO Days in 2026"
description: "The best 4-day PTO combos that give you 10 consecutive days off in 2026. Multiple windows available throughout the year."
date: "2026-03-27"
slug: "10-days-off-4-pto-days"
locale: "en"
keywords: ["10 days off 4 PTO", "PTO hack 2026", "vacation hack", "maximize time off"]
---

Write a 1,000-word post covering:
1. Hook: "10 days off. 4 PTO days. It sounds too good to be true, but in 2026 there are multiple windows where this works."
2. Each window where 4 PTO = 10 days (Easter, Memorial Day, July 4th, Thanksgiving, Christmas)
3. Day-by-day breakdown for the best one (Easter: Apr 3-12)
4. "What if I only have 2 PTO days left?" — smaller windows section
5. CTA: "Plug in your exact PTO balance at leavewise.app/optimize"

VERIFICATION:
Run: ls content/blog/en/*.md | wc -l
Expected: At least 3 files
Run: grep -l "frontmatter" content/blog/en/*.md || grep -l "title:" content/blog/en/*.md
Expected: All 3 files contain frontmatter with title field
```

---

### M-US-02: Submit Site to Google Search Console

**Files created:** None (human action)
**Depends on:** Site is deployed at leavewise.app
**Human action required after:** Complete the verification process in Google Search Console

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/seo/google-search-console-setup.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Google Search Console Setup Checklist

## Steps

1. Go to https://search.google.com/search-console
2. Click "Add Property"
3. Choose "URL prefix" method
4. Enter: https://leavewise.app
5. Verify ownership via one of:
   - [ ] HTML tag (add meta tag to app/layout.tsx <head>)
   - [ ] DNS TXT record (add to your domain registrar)
   - [ ] HTML file upload (add to /public/)

## After Verification

- [ ] Submit sitemap: https://leavewise.app/sitemap.xml
- [ ] Submit Korean sitemap (if separate): https://leavewise.app/ko/sitemap.xml
- [ ] Request indexing for key pages:
  - [ ] https://leavewise.app
  - [ ] https://leavewise.app/optimize
  - [ ] https://leavewise.app/ko
  - [ ] https://leavewise.app/blog (once live)

## UTM Tracking Parameters

Use these consistently across all marketing:
- Blog to optimizer: `?utm_source=blog&utm_medium=content&utm_campaign=[post-slug]`
- Reddit: `?utm_source=reddit&utm_medium=community&utm_campaign=[subreddit]`
- Twitter: `?utm_source=twitter&utm_medium=social&utm_campaign=[topic]`
- KakaoTalk: `?utm_source=kakao&utm_medium=share&utm_campaign=[topic]`
- Product Hunt: `?utm_source=producthunt&utm_medium=launch&utm_campaign=launch2026`
- Email: `?utm_source=email&utm_medium=nurture&utm_campaign=[sequence-name]`

---
END FILE CONTENT
---

VERIFICATION:
Run: cat docs/seo/google-search-console-setup.md | wc -l
Expected: Approximately 35-45 lines
```

---

### M-US-03: Twitter/X Account Setup and First Posts

**Files created:** `docs/social/twitter-launch-plan.md`
**Depends on:** Nothing
**Human action required after:** Create the @leavewise Twitter account, post the pinned tweet

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/social/twitter-launch-plan.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Twitter/X Launch Plan — @leavewise

## Account Setup
- Handle: @leavewise
- Display name: Leavewise
- Bio: "Turn 15 PTO days into 35+ days off. Free vacation optimizer for US + Korea. No signup needed."
- Link: https://leavewise.app
- Header image: Screenshot of optimizer results showing "15 PTO → 38 days off"
- Profile pic: Leavewise logo on white background

## Pinned Tweet
"In 2026, if you have 15 PTO days, you can get 38 days off.

Here's how:
- Easter: 4 PTO → 10 days off
- Memorial Day: 4 PTO → 9 days off
- July 4th: 3 PTO → 9 days off
- Thanksgiving: 2 PTO → 5 days off
- Christmas-NYE: 3 PTO → 10 days off

Free calculator: leavewise.app/optimize

#PTO #VacationPlanning"

## First Week Tweets (1 per day)

Day 1: [Pinned tweet above]

Day 2: "The average American leaves 4.6 vacation days unused every year.

That's ~$2,500 in lost compensation.

The fix: plan PTO around holidays. One day next to a long weekend = 4 days off instead of 1.

→ leavewise.app/optimize"

Day 3: "Easter 2026 hack:
Take Apr 6-9 off (4 PTO days)
Get Apr 3-12 off (10 consecutive days)

That's a 2.5x return on your PTO.

→ leavewise.app/optimize"

Day 4: "If your company gives you 15 PTO days, you're not getting 15 days off.

You're getting 3 weeks + public holidays + weekends = at least 125 non-work days.

Add PTO strategically? That jumps to 140+.

Plan smarter → leavewise.app"

Day 5: "Korean office workers have it figured out:

추석 + 연차 2일 = 9일 연속 휴가

The concept: 황금연휴 (golden holiday).

We built a free tool that finds every golden holiday for both US and Korea → leavewise.app"

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/social/twitter-launch-plan.md
Expected: File exists
```

---

## Phase 2: USA Community Seeding (Week 2)

---

### M-US-04: Reddit Seeding — Prepare Post Templates

**Files created:** `docs/social/reddit-seeding-plan.md`
**Depends on:** Nothing
**Human action required after:** Post to Reddit from a personal account (not a brand account). Engage authentically in comments.

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/social/reddit-seeding-plan.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Reddit Seeding Plan

> RULES: Lead with value, not the tool. Mention leavewise only at the end, naturally. Never post more than 1 promotional post per subreddit per 14 days. Engage with every comment within 24 hours.

## Post 1: r/solotravel

**Title:** "I planned my whole 2026 travel around US federal holidays — here's how I got 28 days off with 15 PTO"

**Body:**
I have 15 PTO days at my job. Instead of taking random weeks off, I mapped every holiday and figured out the bridge days. Here's what I got:

- Easter (Apr): 4 PTO → 10 days off → enough for Southeast Asia
- Memorial Day (May): 4 PTO → 9 days off → road trip down the coast
- July 4th: 3 PTO → 9 days off → Europe (shoulder season deals)
- Thanksgiving: 2 PTO → 5 days off → domestic getaway
- Christmas-NYE: 3 PTO → 10 days off → wherever's cheapest

Total: 16 PTO used → 43 days of travel/rest

The trick is that PTO days next to holidays and weekends create a multiplier effect. 1 PTO day near a holiday can give you 3-4 days off.

I built a free calculator if anyone wants to run their own numbers: leavewise.app

What's your 2026 travel plan looking like?

**UTM link:** leavewise.app/optimize?utm_source=reddit&utm_medium=community&utm_campaign=solotravel

---

## Post 2: r/frugaltravel

**Title:** "You can get 3x your PTO value if you time trips around holidays — here's the math"

**Body:**
I did the math on my PTO for 2026. If I take random days off, I get 15 days of vacation. If I place them strategically around federal holidays, I get 43 days.

That's 2.87x efficiency.

In dollar terms: if your PTO is worth ~$500/day in compensation, strategic placement is worth $14,000/year more in time off vs taking random days.

Best single play: Christmas week. Take Dec 29-31 off (3 PTO) → get Dec 24 - Jan 2 off (10 days). That's a 3.3x multiplier.

Worst play: taking a random Monday-Friday off in February. 5 PTO → 9 days. Only 1.8x.

I automated this calculation if you want to try it with your specific holidays: leavewise.app

**UTM link:** leavewise.app/optimize?utm_source=reddit&utm_medium=community&utm_campaign=frugaltravel

---

## Post 3: r/personalfinance

**Title:** "Treating PTO like a financial asset — how to get the most days off per dollar of PTO"

**Body:**
I started thinking about PTO the way I think about investments — looking for the best return.

If you value each PTO day at your daily compensation rate (~$250-500 for most salaried workers), then:
- Taking a random week off = 5 days PTO → 9 days off (1.8x return)
- Taking 4 days around Easter = 4 PTO → 10 days off (2.5x return)
- Taking 3 days at Christmas = 3 PTO → 10 days off (3.3x return)

The "interest rate" on your PTO varies by when you spend it. Holiday-adjacent days compound.

Average American leaves 4.6 PTO days unused per year. At $400/day average, that's $1,840 you're donating to your employer.

Built a free tool that calculates the optimal allocation for your specific PTO balance: leavewise.app/optimize

Anyone else optimize their PTO this way?

**UTM link:** leavewise.app/optimize?utm_source=reddit&utm_medium=community&utm_campaign=personalfinance

---

## Post 4: r/travel

**Title:** Share as an image post — screenshot of the optimizer showing Easter window

**Body:** "Just figured out that taking 4 days off around Easter gets you 10 days off. Enough time for a proper trip instead of a long weekend. Anyone else plan trips around bridge days?"

**UTM link:** leavewise.app/optimize?utm_source=reddit&utm_medium=community&utm_campaign=travel

---

## Post 5: r/digitalnomad

**Title:** "Planning slow travel months around US holidays for max uninterrupted time"

**Body:**
For those of us who still have a W2 job but do the digital nomad thing with PTO — here's my 2026 plan:

1. April (Easter window): 10 days in Lisbon — 4 PTO used
2. Late May (Memorial Day): 9 days in Mexico City — 4 PTO used
3. Early July (July 4th): 9 days in Bali — 3 PTO used
4. Late Dec (Christmas-NYE): 10 days in Thailand — 3 PTO used

That's 38 days abroad with only 14 PTO. I still have 1 day left for a random mental health day.

The key is picking destinations where the PTO windows align with good weather/low season. April = perfect in Portugal. Late May = not yet monsoon in Mexico. Late Dec = peak Thailand.

Free planner I made to find the windows: leavewise.app

**UTM link:** leavewise.app/optimize?utm_source=reddit&utm_medium=community&utm_campaign=digitalnomad

---

## Engagement Protocol

When someone comments:
- If they share their own plan → "Nice! The [specific holiday] window is great for [their destination]"
- If they ask about other countries → "Right now it does US and Korea. Adding more based on demand — which country?"
- If they ask how it works → Explain the bridge day concept, then mention the tool
- If they're skeptical → Share the specific date math, no hard sell
- NEVER be defensive. Thank people for feedback.

---
END FILE CONTENT
---

VERIFICATION:
Run: wc -l docs/social/reddit-seeding-plan.md
Expected: Approximately 100-130 lines
```

---

## Phase 3: USA Product Hunt + Outreach (Weeks 3-4)

---

### M-US-05: Product Hunt Launch Kit

**Files created:** `docs/product-hunt/tagline-options.md`, `docs/product-hunt/maker-comment.md`, `docs/product-hunt/launch-day-checklist.md`
**Depends on:** Nothing
**Human action required after:** Schedule the Product Hunt launch (Tuesday-Thursday), line up 15-20 upvoters, execute launch day

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the following 3 files. Create the docs/product-hunt/ directory if it does not exist.

STEP 1: Create docs/product-hunt/tagline-options.md:

---
BEGIN FILE CONTENT
---

# Product Hunt Tagline Options

- **Primary:** "Turn 15 vacation days into 38 days off"
- **Alt 1:** "Stop wasting PTO. Start planning."
- **Alt 2:** "The smartest way to plan your time off"
- **Alt 3:** "Your PTO is worth more than you think"

## Category
Productivity / Travel

## Topics to select on PH
- Productivity
- Travel
- Work-Life Balance
- Calendar

---
END FILE CONTENT
---

STEP 2: Create docs/product-hunt/maker-comment.md:

---
BEGIN FILE CONTENT
---

# Maker's First Comment

Post this IMMEDIATELY after launch goes live (within 5 minutes):

---

Hey Product Hunt!

I built Leavewise after realizing I was leaving 5+ vacation days worth of value on the table every year. The concept is simple: your country already gives you public holidays, and most of them fall near weekends. If you strategically place your PTO days around those holidays, you can 2-3x your time off.

How it works:
1. Pick your country (US or Korea, more coming)
2. Enter how many PTO days you have
3. Hit optimize — see every vacation window in your year, ranked by efficiency

It's free, no account needed, runs entirely in your browser.

A few fun stats from testing:
- US workers with 15 PTO days can typically get 35-40 days off
- Korean workers can turn 15 연차 into 40+ days by stacking around Chuseok and Seollal
- The best single window in 2026: Christmas to New Year's (10 days off, 3 PTO)

Would love your feedback — especially if you're outside the US/Korea, since I'm adding more countries based on demand.

---
END FILE CONTENT
---

STEP 3: Create docs/product-hunt/launch-day-checklist.md:

---
BEGIN FILE CONTENT
---

# Product Hunt Launch Day Checklist

## Pre-Launch (1 week before)
- [ ] Schedule launch for a Tuesday, Wednesday, or Thursday
- [ ] Prepare all PH assets (logo, screenshots, tagline, description)
- [ ] DM 15-20 supporters with exact launch time + link
- [ ] Draft maker comment (see maker-comment.md)
- [ ] Set up UTM tracking: leavewise.app?utm_source=producthunt&utm_medium=launch&utm_campaign=launch2026

## Launch Day
- [ ] Post goes live at 12:01 AM PST
- [ ] Post maker comment within 5 minutes
- [ ] Share link on Twitter with "Just launched on Product Hunt" + link
- [ ] Share on LinkedIn with a personal story angle
- [ ] Send to WhatsApp/KakaoTalk groups
- [ ] Respond to every PH comment within 2 hours
- [ ] Post mid-day update: "Thank you for the incredible response! Here's what we're hearing..."
- [ ] Post end-of-day thank you with traffic stats

## Post-Launch (1 week after)
- [ ] Follow up with everyone who left detailed feedback
- [ ] Write a "lessons learned" post for Twitter
- [ ] If top 5: submit for PH newsletter feature
- [ ] Add "Featured on Product Hunt" badge to landing page

## Success Targets
- [ ] 200+ upvotes on launch day
- [ ] 2,000+ unique visitors from PH in launch week
- [ ] 20+ comments engaged with
- [ ] Featured in PH newsletter or "best of week" (bonus)

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/product-hunt/
Expected: 3 files — tagline-options.md, maker-comment.md, launch-day-checklist.md
```

---

### M-US-06: Newsletter and Creator Outreach Templates

**Files created:** `docs/outreach/newsletter-creator-outreach.md`
**Depends on:** Nothing
**Human action required after:** Identify 20 targets per category, send the emails/DMs

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/outreach/newsletter-creator-outreach.md with the EXACT content below. Create the docs/outreach/ directory if it does not exist.

---
BEGIN FILE CONTENT
---

# Newsletter + Creator Outreach Plan

## Target Categories (20 per category)

### 1. Travel Newsletters (10k-100k subscribers)
Offer: Guest post or exclusive "2026 Holiday Bridge Calendar" PDF

**Cold email template:**

Subject: Guest post idea: "How to get 38 days off with 15 PTO days"

Hi [Name],

I read [specific recent article] and loved the angle on [specific point].

I built a free tool (leavewise.app) that calculates the most efficient PTO windows around holidays. The results are pretty surprising — most US workers can get 2-3x their PTO in actual days off.

Would your readers be interested in a guest post breaking down the 2026 holiday calendar? I can provide:
- A complete "2026 Holiday Bridge Calendar" (exclusive to your newsletter)
- The specific math for each holiday window
- Cheap destination picks for each window

No strings attached — the tool is free and I'm not selling anything. Just think your audience would find it genuinely useful.

Best,
[Name]

---

### 2. Personal Finance Newsletters
Frame: "Maximizing your compensation" — PTO is money

**Cold email template:**

Subject: Your readers are leaving $2,500/year on the table

Hi [Name],

Quick stat: the average American leaves 4.6 PTO days unused every year. At average salaried compensation, that's ~$2,500 donated back to employers annually.

I built a free tool that treats PTO like a financial asset — it finds the highest-return "investment" for each vacation day based on holiday placement.

Would love to write a guest piece for [Newsletter Name] on "PTO ROI: treating vacation days like a portfolio." The data is genuinely interesting and I think your audience would run with it.

Happy to share the data in whatever format works for you.

Best,
[Name]

---

### 3. Work/Career TikTokers + Instagram Creators
Target: Creators with 10k-500k followers who post about career tips, work-life balance, or office culture

**DM template:**

Hey [Name]! I built a free tool your audience would love — it tells you exactly which days to take off to maximize your PTO around holidays. Most people can get 35-40 days off with just 15 PTO days.

Here's a 30-second explainer you can use however you want: [screen recording link]

No partnership needed — just thought it'd make great content for your audience. The tool is free at leavewise.app.

---

## Outreach Tracking

| # | Name | Category | Platform | Followers/Subs | Contacted | Response | Result |
|---|------|----------|----------|---------------|-----------|----------|--------|
| 1 | | Travel | | | [ ] | | |
| 2 | | Travel | | | [ ] | | |
| ... | | | | | | | |
| 20 | | Finance | | | [ ] | | |

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/outreach/newsletter-creator-outreach.md
Expected: File exists
```

---

## Phase 4: USA Content Sprint (Weeks 5-6)

---

### M-US-07: Easter Window Blog Post (URGENT — publish by Mar 30)

**Files created:** `content/blog/en/easter-long-weekend-2026.md`
**Depends on:** Blog route exists at `/blog`

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first.

TASK: Write a 1,200-word SEO blog post for Easter 2026.

Create content/blog/en/easter-long-weekend-2026.md with this frontmatter:

---
title: "Easter 2026: How to Turn 4 PTO Days Into 10 Days Off"
description: "Easter 2026 falls on April 5. Here's exactly how to take 4 PTO days and get 10 consecutive days off — plus the best destinations for an April trip."
date: "2026-03-27"
slug: "easter-long-weekend-2026"
locale: "en"
keywords: ["easter 2026 long weekend", "easter 2026 time off", "april 2026 vacation"]
---

Structure:
1. Hook: "Easter 2026 falls on April 5. With Good Friday not a federal holiday in most states, most workers think they only get a regular weekend. They're wrong."
2. The math: Take off Apr 6-9 (Mon-Thu) = 4 PTO days. Combined with weekends + Easter Sunday = 10 consecutive days (Apr 3-12).
3. Table showing the day-by-day breakdown (Fri Apr 3 through Sun Apr 12)
4. Note which US states observe Good Friday as a holiday (~11 states)
5. "Where to go" section with 3 travel suggestions for 10-day trips in April (cheap shoulder-season destinations)
6. CTA: "Calculate your exact windows at leavewise.app/optimize — it handles your state holidays automatically."
7. Brief mention: "The tool also finds every other bridge window in your year, not just Easter."

Tone: Conversational, data-driven, zero fluff. Like a smart coworker sharing a hack over coffee.

VERIFICATION:
Run: wc -w content/blog/en/easter-long-weekend-2026.md
Expected: Approximately 1,100-1,400 words
Run: grep "title:" content/blog/en/easter-long-weekend-2026.md
Expected: Contains "Easter 2026"
```

---

### M-US-08: Memorial Day Window Blog Post (publish by Apr 20)

**Files created:** `content/blog/en/memorial-day-2026-vacation.md`
**Depends on:** Blog route exists at `/blog`

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first.

TASK: Write a 1,000-word SEO blog post for Memorial Day 2026.

Create content/blog/en/memorial-day-2026-vacation.md with this frontmatter:

---
title: "Memorial Day 2026: Get 9 Days Off With Just 4 PTO Days"
description: "Memorial Day 2026 is May 25. Take 4 PTO days and get 9 consecutive days off. Here's the exact playbook."
date: "2026-04-15"
slug: "memorial-day-2026-vacation"
locale: "en"
keywords: ["memorial day 2026 long weekend", "memorial day 2026 vacation", "may 2026 days off"]
---

Structure:
1. Hook: Memorial Day 2026 is May 25 (Monday). Most people get a 3-day weekend. You can get 9 days.
2. The math: Take off May 19-22 (Tue-Fri before Memorial Day) = 4 PTO days → 9 days off (Sat May 16 through Sun May 25).
3. Day-by-day table.
4. Show the efficiency: 4 PTO → 9 days = 2.25x multiplier.
5. Destination picks: 3 beach/warm destinations cheap in late May.
6. CTA: "See all your 2026 windows calculated automatically → leavewise.app/optimize"

Tone: Same conversational, data-driven style as the Easter post.

VERIFICATION:
Run: wc -w content/blog/en/memorial-day-2026-vacation.md
Expected: Approximately 900-1,200 words
```

---

### M-US-09: Holiday-Specific Blog Posts (July 4th, Thanksgiving, Christmas)

**Files created:** `content/blog/en/july-4th-2026-vacation.md`, `content/blog/en/thanksgiving-2026-long-weekend.md`, `content/blog/en/christmas-new-year-2026-pto.md`
**Depends on:** Blog route exists at `/blog`

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first.

TASK: Write 3 more SEO blog posts for US holiday windows.

POST 1: Create content/blog/en/july-4th-2026-vacation.md

---
title: "July 4th 2026: Book Early, Bridge Friday for 9 Days Off"
description: "July 4th 2026 falls on a Saturday. Here's how to bridge the surrounding days for a 9-day vacation with just 3 PTO days."
date: "2026-05-15"
slug: "july-4th-2026-vacation"
locale: "en"
keywords: ["july 4th 2026 vacation", "july 4th 2026 long weekend", "independence day 2026"]
---

Content: July 4th is Saturday. Take Jul 1-3 (Wed-Fri) off = 3 PTO → Jun 28 - Jul 5 = 8 days. Or take Jun 29-Jul 3 = 5 PTO → 9 days. Show both options with day-by-day tables. 3 summer destination picks. CTA to optimizer.

POST 2: Create content/blog/en/thanksgiving-2026-long-weekend.md

---
title: "Thanksgiving 2026: How Many Days Can You Actually Get Off?"
description: "Thanksgiving 2026 is November 26. From a quick 5-day weekend to a full 9-day break — here's every option."
date: "2026-10-01"
slug: "thanksgiving-2026-long-weekend"
locale: "en"
keywords: ["thanksgiving 2026 long weekend", "thanksgiving 2026 vacation", "november 2026 days off"]
---

Content: Thanksgiving Nov 26 (Thu). Base = 4-day weekend (Thu-Sun). Take Mon-Wed off = 3 PTO → 9 days (Sat Nov 21 - Sun Nov 30). Show options for 1, 2, 3, and 5 PTO days with tables. CTA to optimizer.

POST 3: Create content/blog/en/christmas-new-year-2026-pto.md

---
title: "Christmas to New Year 2026: How to Take 2 Weeks Off With 3 PTO Days"
description: "Christmas 2026 falls on Friday. Here's how to turn 3 PTO days into a full 10-day break spanning Christmas to New Year's."
date: "2026-11-01"
slug: "christmas-new-year-2026-pto"
locale: "en"
keywords: ["christmas 2026 PTO", "new years 2026 vacation", "december 2026 days off", "christmas to new years 2026"]
---

Content: Christmas Dec 25 (Fri). Take Dec 28-30 (Mon-Wed) off = 3 PTO → Dec 24 - Jan 3 = 11 days. This is the highest efficiency window of the year (3.67x). Day-by-day table. Year-end travel tips. CTA to optimizer.

Each post should be approximately 1,000-1,200 words.

VERIFICATION:
Run: ls content/blog/en/*.md | wc -l
Expected: At least 6 blog post files total
```

---

### M-US-10: Year-End PTO Rush Blog Post (publish by Oct 15)

**Files created:** `content/blog/en/use-remaining-pto-2026.md`
**Depends on:** Blog route exists at `/blog`

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first.

TASK: Write a 1,200-word blog post targeting year-end PTO urgency.

Create content/blog/en/use-remaining-pto-2026.md with this frontmatter:

---
title: "You Have PTO Left? Here's How to Turn Your Remaining Days Into Actual Vacations Before December 31"
description: "55% of Americans leave PTO on the table. Here's exactly how to turn your remaining days into real vacations before year-end."
date: "2026-10-15"
slug: "use-remaining-pto-2026"
locale: "en"
keywords: ["use remaining PTO 2026", "how to use leftover vacation days", "end of year PTO"]
---

Structure:
1. Hook: "It's October. If you're like 55% of American workers, you have unused PTO sitting there. The average American leaves 4.6 vacation days on the table every year. That's ~$2,500 in lost compensation."
2. "The Remaining PTO Calculator": If you have X days left, here's what you can do:
   - 2 days left → Thanksgiving 5-day break
   - 3 days left → Christmas to NYE 10-day break
   - 5 days left → Both + a Friday off in November
   - 8+ days left → Full optimization run (link to tool)
3. Table for each scenario with exact dates
4. "Why you should use them now, not December 29" section (avoid use-or-lose panic)
5. Cheap November/December destinations (off-peak everywhere except ski)
6. CTA: "Plug in your remaining days → leavewise.app/optimize calculates every option instantly"

VERIFICATION:
Run: wc -w content/blog/en/use-remaining-pto-2026.md
Expected: Approximately 1,100-1,400 words
```

---

## Phase 5: USA TikTok / Reels (Week 6)

---

### M-US-11: TikTok and Reels Video Scripts

**Files created:** `docs/social/tiktok-reels-scripts.md`
**Depends on:** Nothing
**Human action required after:** Record the videos, post to TikTok + Instagram Reels + YouTube Shorts

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/social/tiktok-reels-scripts.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# TikTok / Reels / YouTube Shorts — Video Scripts

> Cross-post everything to all 3 platforms. Cadence: 2 per week for 8 weeks (16 total).

## Template 1 — "Did You Know?" (15-20 sec)

### Script
"Did you know in 2026, taking just 4 days off around Easter gives you 10 consecutive days?"

[Show screen recording: open leavewise.app/optimize, select US, enter 15 PTO, hit optimize. Point at the Easter window showing "4 PTO → 10 days off"]

"That's a 2.5x return on your PTO."

### CTA overlay
"Free calculator — link in bio"

### Hashtags
#PTO #VacationHack #Easter2026 #TimeOff #WorkLifeBalance #LifeHack

---

## Template 2 — "I Used to Waste My PTO" (30 sec)

### Script
"I used to just take random weeks off for vacation. Then I realized I was leaving money on the table.

Here's what I mean: if you take a random week off, 5 PTO days get you 9 days. But if you take those same 5 days around Thanksgiving and Christmas...

[Show optimizer: highlight Thanksgiving + Christmas windows]

...you get 15 days off. Same PTO, completely different result.

I built a free calculator to find every one of these windows."

### CTA overlay
"Link in bio — free, no signup"

### Hashtags
#PTO #VacationPlanning #CareerTips #WorkLifeBalance #2026 #TimeOff

---

## Template 3 — "Your Boss Doesn't Want You to Know This" (12-15 sec)

### Script
"[Holiday name] falls on a [day]. Take [day/day] off and you get a [X]-day vacation. You're welcome."

[Quick screen recording showing the optimizer result]

### CTA overlay
"More windows in bio"

### Hashtags
#[Holiday]2026 #PTO #VacationDays #LifeHack #WorkHack

---

## Production Calendar (fill specific holidays per week)

| Week | Video 1 | Video 2 |
|------|---------|---------|
| 1 | Template 1: Easter | Template 2: Personal story |
| 2 | Template 3: Memorial Day | Template 1: July 4th |
| 3 | Template 2: Year-end planning | Template 3: Thanksgiving |
| 4 | Template 1: Christmas-NYE | Template 3: Labor Day |
| 5 | Template 2: "55% stat" angle | Template 1: Best single day off |
| 6 | Template 3: Easter (repurpose) | Template 1: Full year overview |
| 7 | Template 2: Korean golden holidays | Template 3: Memorial Day (repurpose) |
| 8 | Template 1: "15 PTO = 38 days off" | Template 2: Wrap-up/best of |

## Success Targets
- 16 videos published over 8 weeks (100% cadence)
- Total views across all videos: ≥50,000
- ≥200 profile visits / link clicks from bio
- Identify which template performs best → double down in next cycle

---
END FILE CONTENT
---

VERIFICATION:
Run: wc -l docs/social/tiktok-reels-scripts.md
Expected: Approximately 80-100 lines
```

---

## Phase 6: Korea Foundation (Week 1 Korea)

---

### M-KR-01: Naver Blog Setup and First 3 Korean Posts

**Files created:** `docs/seo/naver-blog-setup.md`, `content/blog/ko/chuseok-2026-golden-holiday.md`, `content/blog/ko/seollal-2026-maximize-annual-leave.md`, `content/blog/ko/15-annual-leave-2026-analysis.md`
**Depends on:** Nothing
**Human action required after:** Create the Naver Blog account, submit sitemap to Naver Search Advisor, publish posts on Naver Blog

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first.

TASK: Create Naver Blog setup guide and 3 Korean blog posts.

STEP 1: Create docs/seo/naver-blog-setup.md:

---
BEGIN FILE CONTENT
---

# Naver Blog Setup Checklist

## Account Setup
- [ ] Create Naver account (or use existing one)
- [ ] Create Naver Blog: blog.naver.com
- [ ] Blog name: Leavewise 리브와이즈
- [ ] Blog description: "직장인 연차 최적화 — 공휴일과 주말을 활용해 최대한 쉬는 방법"
- [ ] Category: 여행/일상

## Naver Search Advisor
- [ ] Go to https://searchadvisor.naver.com
- [ ] Add property: leavewise.app
- [ ] Verify ownership (HTML tag or DNS)
- [ ] Submit sitemap: https://leavewise.app/sitemap.xml

## Naver Blog SEO Requirements
- Posts must be ≥1,200 characters (Korean characters)
- Use h2, h3 headers
- Include at least 2 images per post
- Naver rewards length and completeness — longer is better
- Tag every post with relevant keywords

## Blog Tags to Use
Primary: 연차, 황금연휴, 직장인, 여행, 공휴일
Holiday-specific: 추석, 설날, 어린이날, 개천절, 크리스마스

---
END FILE CONTENT
---

STEP 2: Create content/blog/ko/chuseok-2026-golden-holiday.md:

---
title: "2026년 추석 황금연휴 만드는 법 — 연차 2개로 9일 쉬기"
description: "추석 2026 연차 최적 배치법. 연차 2일로 9일 연속 휴가 만드는 구체적인 방법을 알려드립니다."
date: "2026-08-01"
slug: "chuseok-2026-golden-holiday"
locale: "ko"
keywords: ["추석 황금연휴 2026", "추석 연차 2026", "추석 연차 계획"]
---

Write a 1,500+ word Naver Blog post in Korean covering:
1. 2026 추석 일정: 9/24(목) - 9/26(토), 대체공휴일 9/28(월)
2. 전략 A: 앞으로 확장 — 9/22(월), 9/23(화) 연차 → 9/19(토)~9/28(월) = 10일
3. 전략 B: 뒤로 확장 — 9/29(화), 9/30(수) 연차 → 9/24(목)~10/5(월) = 12일
4. 전략 C: 풀코스 — 연차 4일 → 16일 연속
5. 비교 테이블 (연차 사용일, 총 휴가일, 효율 배수)
6. 추천 여행지 (동남아, 일본, 유럽 가을)
7. CTA: leavewise.app/ko

STEP 3: Create content/blog/ko/seollal-2026-maximize-annual-leave.md:

---
title: "2026년 설날 연휴 최대로 늘리는 방법"
description: "2026 설날 연차 최적 배치. 연차 1-2일로 최대 6-9일 쉬는 방법을 계산해봤습니다."
date: "2026-12-01"
slug: "seollal-2026-maximize-annual-leave"
locale: "ko"
keywords: ["설날 연차 2026", "설날 황금연휴", "설날 연차 팁"]
---

Write a 1,200+ word post in Korean about Seollal 2027 bridge strategies. (Note: Seollal planning content for 2027 should go up in late 2026.)

STEP 4: Create content/blog/ko/15-annual-leave-2026-analysis.md:

---
title: "연차 15개로 최대 몇 일을 쉴 수 있을까? (2026년 공휴일 분석)"
description: "2026년 한국 공휴일 기준, 연차 15개를 최적으로 배치하면 최대 며칠을 쉴 수 있는지 분석합니다."
date: "2026-03-27"
slug: "15-annual-leave-2026-analysis"
locale: "ko"
keywords: ["연차 효율 2026", "연차 최적화", "공휴일 연차 2026"]
---

Write a 1,500+ word post in Korean analyzing: every 2026 Korean public holiday, the optimal placement of 15 annual leave days, month-by-month recommendations, total days off achievable, CTA to leavewise.app/ko.

Tone for all Korean posts: Friendly, like a helpful 선배 sharing tips. 존댓말 base with casual 반말 energy.

VERIFICATION:
Run: ls content/blog/ko/*.md | wc -l
Expected: At least 3 Korean blog post files
Run: ls docs/seo/naver-blog-setup.md
Expected: File exists
```

---

## Phase 7: Korea Community Seeding (Weeks 2-3 Korea)

---

### M-KR-02: Blind (블라인드) Seeding Plan

**Files created:** `docs/social/blind-seeding-plan.md`
**Depends on:** Nothing
**Human action required after:** Post from a personal Blind account. Engage in comments authentically.

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/social/blind-seeding-plan.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Blind (블라인드) Seeding Plan

> RULES: Blind rewards posts with actual math and calculations. Be data-first. Mention the tool only in comments if someone asks, or in a follow-up reply. Never post more than 1 promotional post per channel per 2 weeks.

## Post 1: 직장인 라이프 channel

**Title:** "추석 전에 연차 쓰면 이득인 이유 (계산해봤더니 충격)"

**Body:**
2026 추석 캘린더 정리해봤습니다.

추석 연휴: 9/24(목) - 9/26(토)
대체공휴일: 9/28(월)

기본 연휴만 = 5일 (목~월)

여기서 9/22(월), 9/23(화) 연차 2일 쓰면?
→ 9/19(토) ~ 9/28(월) = 10일 연속 휴가

뒤로 붙이면? 9/29(화), 9/30(수) 연차 2일
→ 9/24(목) ~ 10/5(월, 개천절 대체공휴일) = 12일 연속

연차 4일이면 16일 가능합니다.

자동 계산기도 있어요 (무료, 로그인 없음): leavewise.app/ko

다들 추석 연차 언제 쓰실 건가요?

---

## Post 2: 여행 channel

**Title:** "연차 2개 → 9일 연속 휴가, 이게 말이 됩니까"

**Body:**
솔직히 처음에 믿기지 않아서 직접 계산해봤습니다.

2026년 연차 효율 TOP 3:

1위: 추석 — 연차 2일 → 10일 (효율 5.0배)
2위: 크리스마스-연말 — 연차 3일 → 10일 (효율 3.3배)
3위: 설날 — 연차 1일 → 6일 (효율 6.0배!)

연차 15개를 최적 배치하면 총 40일+ 쉴 수 있다는 결론.

공휴일 옆에 연차를 붙이는 게 핵심입니다.
주말 → 공휴일 → 연차 → 주말 이렇게 샌드위치 하면 1일당 2-3일 효과.

---

## Engagement Protocol (Korean)

When someone comments:
- 구체적인 날짜를 물어보면 → 정확한 계산 결과를 댓글로 공유
- "어떻게 계산했어?" → 공휴일 + 주말 + 연차 배치 로직 설명, 자연스럽게 도구 링크
- 비꼬는 댓글 → 무시하거나 유머로 대응. 절대 방어적이지 않게
- "다른 달도 알려줘" → 해당 월 계산 결과 공유 + leavewise.app/ko 링크

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/social/blind-seeding-plan.md
Expected: File exists
```

---

### M-KR-03: KakaoTalk Organic Spread Plan + Shareable Infographic Brief

**Files created:** `docs/social/kakao-spread-plan.md`
**Depends on:** Nothing
**Human action required after:** Join KakaoTalk open chats, create the infographic image, add KakaoTalk share button to results page

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/social/kakao-spread-plan.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# KakaoTalk Organic Spread Plan

## Open Chats to Join
- 여행 모임 (travel groups)
- 직장인 커뮤니티 (office worker communities)
- 재테크 오픈채팅 (financial tips open chats)

## What Spreads on KakaoTalk
- Infographics and screenshots — NOT links
- Clean, single-image format that looks good as a thumbnail
- Content that makes people say "이거 유용하다" (this is useful)

## Chuseok Infographic Design Brief

Format: 1080x1350px vertical image (KakaoTalk optimized)

Content:
Title: "2026 추석 황금연휴 계산기"
Subtitle: "연차 몇 일 쓰면 얼마나 쉴 수 있을까?"

3 rows:
Row 1: "연차 0일 → 5일 연휴" (9/24~28)
Row 2: "연차 2일 → 10일 연휴 ★" (9/19~28)
Row 3: "연차 4일 → 16일 연휴" (9/19~10/5)

Bottom CTA: "내 연차에 맞는 최적 계획 → leavewise.app/ko"

Design: Clean white background, teal (#2D6A4F) accent color, no gradients, no purple. Modern sans-serif Korean font. Leavewise logo small in bottom-right corner.

## Code Task: Add KakaoTalk Share Button

Add a KakaoTalk share button to the optimization results page. When clicked, it should share:
- Title: "내 2026 황금연휴 계획"
- Description: "연차 [X]일로 [Y]일 쉴 수 있어요"
- Image: OG image of the results
- Link: leavewise.app/ko?utm_source=kakao&utm_medium=share&utm_campaign=results

KakaoTalk JS SDK: https://developers.kakao.com/docs/latest/ko/message/js-link

## Sharing Protocol
- Share infographic in open chats 4-6 weeks before Chuseok
- Do NOT spam. Share once per chat, in context of travel planning discussion
- If people ask questions, respond helpfully with specific calculations
- Let the image do the work — don't push the link unless asked

## Success Targets
- Image shared ≥50 times via KakaoTalk
- ≥100 referral visits from KakaoTalk (track via UTM)
- At least 1 organic screenshot-share of the image

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/social/kakao-spread-plan.md
Expected: File exists
```

---

## Phase 8: Korea Content + Social (Weeks 4-5 Korea)

---

### M-KR-04: Children's Day Korean Blog Post (publish by Apr 5)

**Files created:** `content/blog/ko/children-day-2026-golden-holiday.md`
**Depends on:** Nothing

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first.

TASK: Write a Korean blog post about Children's Day 2026 PTO strategy.

Create content/blog/ko/children-day-2026-golden-holiday.md with this frontmatter:

---
title: "2026년 어린이날 황금연휴 만들기 — 연차 2일로 6일 쉬는 법"
description: "2026년 어린이날은 화요일. 연차 1-2일로 최대 6일 연속 쉬는 방법을 정리했습니다."
date: "2026-04-01"
slug: "children-day-2026-golden-holiday"
locale: "ko"
keywords: ["어린이날 연차 2026", "5월 황금연휴 2026", "어린이날 대체공휴일"]
---

Write a 1,500-word Naver Blog post in Korean covering:
1. Hook: 2026년 어린이날(5월 5일)이 화요일입니다.
2. 5월 전략 A: 어린이날 주간 — 5월 4일(월) 연차 1일 → 5일 연속
3. 5월 전략 B: 부처님오신날 연계
4. 두 전략 비교 테이블
5. 5월에 저렴한 여행지 추천 3곳 (일본, 동남아, 제주)
6. CTA: "내 연차 최적 날짜 자동 계산 → leavewise.app/ko"

Naver SEO: ≥1,200 characters, use h2/h3 headers, include image descriptions.
Tags: 연차, 어린이날, 황금연휴, 직장인, 여행

VERIFICATION:
Run: wc -c content/blog/ko/children-day-2026-golden-holiday.md
Expected: At least 3,000 bytes (Korean characters are multi-byte)
```

---

### M-KR-05: Chuseok Mega-Post (publish by Aug 10)

**Files created:** `content/blog/ko/chuseok-2026-complete-guide.md`
**Depends on:** Nothing

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first.

TASK: Write the definitive 2026 Chuseok golden holiday guide in Korean. This is the MOST IMPORTANT Korean content piece of the year.

Create content/blog/ko/chuseok-2026-complete-guide.md with this frontmatter:

---
title: "2026년 추석 황금연휴 완벽 가이드 — 연차 2일이면 9일 연속 휴가"
description: "2026 추석 연휴 완벽 정리. 연차 0일부터 4일까지 모든 전략을 비교합니다. 개천절 연계 최대 16일 연속 휴가."
date: "2026-08-01"
slug: "chuseok-2026-complete-guide"
locale: "ko"
keywords: ["추석 황금연휴 2026", "추석 연차 계획 2026", "추석 연차 몇 일"]
---

Write a 2,000-word definitive guide in Korean:

1. Hook: "올해 추석은 목~토입니다. 대체공휴일까지 합하면 목~월 5일 연속. 여기에 연차 2일만 더하면?"
2. Strategy breakdown:
   - 기본 연휴: Sep 24(목) - Sep 28(월) = 5일 (연차 0일)
   - 전략 A (앞으로 확장): Sep 22(월)-23(화) 연차 2일 → 9/20(토)~28(월) = 9일
   - 전략 B (뒤로 확장): Sep 29(화)-30(수) 연차 2일 → 9/24(목)~10/3(토, 개천절) = 10일
   - 전략 C (풀코스): 연차 4일 → 9/20(토)~10/5(월, 개천절 대체) = 16일
3. Day-by-day table for each strategy
4. 10월 개천절(10/3 토) + 대체공휴일(10/5 월) + 한글날(10/9 금) 연계 전략
5. 9-10월 해외여행 추천지 (동남아 우기 끝, 유럽 가을, 일본 단풍)
6. 항공권 예약 시기 조언
7. CTA: "나만의 최적 연차 계획 → leavewise.app/ko (무료, 회원가입 불필요)"

Tone: Authoritative but excited. This is every Korean office worker's dream content.

VERIFICATION:
Run: wc -c content/blog/ko/chuseok-2026-complete-guide.md
Expected: At least 5,000 bytes
```

---

### M-KR-06: Instagram and YouTube Shorts Korean Content Plan

**Files created:** `docs/social/korea-social-plan.md`
**Depends on:** Nothing
**Human action required after:** Create @leavewise.kr Instagram account, record video content

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/social/korea-social-plan.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Korea Social Media Plan — Instagram + YouTube Shorts

## Instagram Account Setup — @leavewise.kr
- Display name: 리브와이즈 | 연차 최적화
- Bio: "연차 15개로 40일 쉬는 법 🗓 무료 연차 최적화 계산기"
- Link: leavewise.app/ko
- Content format: "연차 ○개 → ○일 휴가" clean graphic for each holiday window

## Hashtags (use consistently)
#황금연휴 #연차활용 #직장인여행 #추석연휴 #여행꿀팁 #연차 #직장인일상 #워라밸

## Monthly Content Calendar

| Month | Holiday Window | Instagram Post | YouTube Short |
|-------|---------------|----------------|---------------|
| Apr | 어린이날 5/5 | "연차 1일 → 5일 연속" graphic | 30-sec app demo |
| May | 부처님오신날 | "5월 연차 전략" comparison | "5월에 연차 이렇게 쓰세요" |
| Jul | 광복절 8/15 | "연차 1일 → 4일" graphic | Quick calculation |
| Aug | 추석 9/24-26 | "추석 연차 전략 3가지" carousel | "추석에 연차 이렇게 쓰면 9일 쉽니다" |
| Sep | 개천절 10/3 | "추석+개천절 연계" graphic | "10월 16일 연속 휴가 가능?" |
| Nov | 크리스마스 | "연말 연차 마지막 기회" graphic | "남은 연차 이렇게 쓰세요" |

## YouTube Shorts Format
- Duration: 30 seconds max
- Content: Screen record of leavewise.app/ko calculating a specific window
- Script formula: "[Holiday]에 연차 이렇게 쓰면 [X]일 쉽니다" → show app → show result
- End card: "무료 계산기 → 프로필 링크"

## Naver Cafe Seeding

| Cafe | Post Angle |
|------|------------|
| 여행 카페 (travel cafes) | "2026년 추석 여행 계획 세우는 법 + 황금연휴 계산기 공유" |
| 직장인 카페 | "연차 관리 잘하는 법 — 공휴일 끼워서 최대한 쉬기" |
| 재테크/경제 카페 | "연차도 재테크다 — 가장 효율 높은 휴가 날짜 계산법" |

Important: Each Naver Cafe has its own rules. Read them first. Post value-first, not promotional.

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/social/korea-social-plan.md
Expected: File exists
```

---

## Phase 9: Korea Timing Attacks (Week 6 Korea)

---

### M-KR-07: Chuseok Timing Attack (4-6 weeks before Chuseok)

**Files created:** `docs/social/chuseok-timing-attack.md`
**Depends on:** M-KR-05 (Chuseok mega-post is published)
**Human action required after:** Execute the timing attack posts on each platform

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/social/chuseok-timing-attack.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Chuseok Timing Attack — Execute Aug 10-Sep 20

> Chuseok is the Super Bowl moment for the Korean market. This is the highest-traffic window of the year.

## Platform-by-Platform Execution

### Naver Blog (Aug 10)
Publish the definitive "2026 추석 황금연휴 가이드" post (M-KR-05).
- [ ] Published and tagged
- [ ] Indexed in Naver Search Advisor

### Threads/X (Aug 15)
Korean-language thread:
"추석에 연차 언제 써야 제일 이득인지 알아봤습니다 🧵

1/ 기본 연휴: 9/24(목)~9/28(월) = 5일
2/ 연차 2일 추가: 9일 연속
3/ 연차 4일 추가: 16일 연속
4/ 개천절까지 연계하면...

자세한 전략 → leavewise.app/ko"

### Korean Travel YouTubers (Aug 15-20)
DM template for YouTubers (구독자 1만-20만):

"안녕하세요! 황금연휴 콘텐츠 만드실 때 쓸 수 있는 무료 연차 최적화 계산기를 만들었습니다.

추석에 연차 2일만 쓰면 9일 연속 쉴 수 있다는 거 보여주면 조회수 나올 것 같아요.

도구 링크: leavewise.app/ko (무료, 회원가입 없음)
원하시면 영상에 쓸 수 있는 데이터나 스크린샷 보내드릴게요!

감사합니다."

### Blind 블라인드 (Aug 15-20)
Post the Chuseok calculation (see M-KR-02).

### 에브리타임 (Aug 20)
For younger demographic (university students):
"추석에 알바 연차 최적 배치하는 법" — angle toward part-time workers and interns

### KakaoTalk Infographic (Aug 20-Sep 15)
Distribute the Chuseok infographic (see M-KR-03) in open chats.

## Press Outreach (Week 7-8)

Submit press tips to:
- 한국경제 — frame as "직장인 연차 혁명"
- 직썰 — frame as "직장인 필수 도구"
- 허핑턴포스트코리아 — frame as lifestyle/travel hack

Press pitch template:
"2026년 추석 황금연휴를 자동으로 계산해주는 무료 도구가 화제입니다. 연차 2일만 쓰면 9일 연속 휴가가 가능하다는 사실을 직장인들이 직접 확인할 수 있습니다. (leavewise.app/ko)"

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/social/chuseok-timing-attack.md
Expected: File exists
```

---

## Phase 10: Cross-Market Recurring Tasks

---

### M-XM-01: Monthly "Window of the Month" Social Post Template

**Files created:** `docs/social/window-of-the-month-template.md`
**Depends on:** Nothing

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/social/window-of-the-month-template.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# "Window of the Month" — Monthly Social Post

> Cadence: 1st of every month. Post both English (Twitter) and Korean (Instagram) versions.

## Template

### English (Twitter/X @leavewise):

"[MONTH] 2026 window:
Take [X] PTO day(s) → Get [Y] days off
[Dates: Mon DD - Mon DD]
Efficiency: [Y/X]x return on your PTO
→ leavewise.app/optimize
#PTO #VacationPlanning #2026"

### Korean (Instagram @leavewise.kr):

"[MONTH Korean] 황금연휴
연차 [X]일 → [Y]일 연속 휴가
[날짜: M월 D일 ~ M월 D일]
효율: [Y/X]배
→ leavewise.app/ko
#황금연휴 #연차활용 #직장인여행"

### Image Design

Clean white card with large "[X] PTO → [Y] days off" in teal (#2D6A4F) text, month name at top, Leavewise logo at bottom right. No gradients, no purple.

## Pre-Computed Windows for 2026

| Month | US Best Window | KR Best Window |
|-------|---------------|----------------|
| Apr | Easter: 4 PTO → 10 days | 어린이날: 1 PTO → 5 days |
| May | Memorial Day: 4 PTO → 9 days | 부처님오신날: 1 PTO → 4 days |
| Jun | (no holiday — skip or use July 4th preview) | (no major holiday) |
| Jul | July 4th: 3 PTO → 8 days | 제헌절: TBD |
| Aug | Labor Day preview: 1 PTO → 4 days | 광복절: 1 PTO → 4 days |
| Sep | Labor Day: 1 PTO → 4 days | 추석: 2 PTO → 10 days |
| Oct | (Columbus Day: 1 PTO → 4 days) | 개천절+한글날: 2 PTO → 9 days |
| Nov | Thanksgiving: 2 PTO → 5 days | (no major holiday) |
| Dec | Christmas-NYE: 3 PTO → 10 days | 크리스마스: 3 PTO → 10 days |

## Success Targets
- Posted on the 1st of each month without fail
- ≥12 posts by end of year (100% execution rate)
- At least 2 posts achieve ≥500 impressions

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/social/window-of-the-month-template.md
Expected: File exists
```

---

### M-XM-02: Viral Asset — Annual Calendar PDF

**Files created:** `docs/assets/calendar-pdf-spec.md`
**Depends on:** Nothing
**Human action required after:** Design and generate the PDF

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/assets/calendar-pdf-spec.md with the EXACT content below. Create the docs/assets/ directory if it does not exist.

---
BEGIN FILE CONTENT
---

# 2026 Optimal PTO Calendar PDF — Specification

## Purpose
Create a downloadable single-page visual showing every bridge window in 2026, color-coded by efficiency. This asset will:
- Get shared in group chats (KakaoTalk, WhatsApp, Slack)
- Be used as a lead magnet for email list
- Rank on Google/Naver for "2026 holiday calendar"

## Two Versions Required

### US Version
- Title: "2026 Optimal PTO Calendar — USA"
- Format: Landscape A4 / Letter, single page
- Content: 12-month grid, holidays marked in teal, bridge windows highlighted
- Color coding:
  - Public holiday: teal (#2D6A4F) solid
  - Weekend: light gray (#F0F0F0)
  - Recommended PTO days: amber (#D4A574) solid
  - Resulting vacation block: light teal (#E8F5E9) background
- Legend showing efficiency rating for each window
- Footer: "Generated by Leavewise — leavewise.app/optimize"
- No gradients, no purple

### Korean Version
- Title: "2026년 최적 연차 캘린더 — 대한민국"
- Same format and color scheme
- Korean holiday names
- Footer: "Leavewise 리브와이즈 — leavewise.app/ko"

## Email Capture
Add to homepage: "Get the 2026 PTO Calendar for your country" → email input → sends PDF link
Start building the email list from Day 1.

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/assets/calendar-pdf-spec.md
Expected: File exists
```

---

### M-XM-03: Email List Nurture Sequence

**Files created:** `docs/email/nurture-sequence.md`
**Depends on:** Email provider is set up (Resend or similar)
**Human action required after:** Configure the email automation

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/email/nurture-sequence.md with the EXACT content below. Create the docs/email/ directory if it does not exist.

---
BEGIN FILE CONTENT
---

# Email Nurture Sequence

> Triggered when user signs up for PTO calendar PDF. Automated via Resend.

## Email 1 — Immediate (upon signup)

Subject: "Your 2026 PTO Calendar is here"

Body:
"Here's your personalized 2026 PTO calendar [PDF attachment].

Quick tip: The biggest efficiency window this year is [INSERT NEXT UPCOMING BEST WINDOW based on current date]. Take [X] PTO days and get [Y] days off.

→ Plan your exact dates: leavewise.app/optimize

— Leavewise"

---

## Email 2 — Day 7

Subject: "The PTO trick 55% of workers miss"

Body:
"Did you know the average American leaves 4.6 vacation days unused every year? That's ~$2,500 in lost compensation.

The fix is simple: plan your PTO around holidays. A single PTO day next to a holiday weekend gives you 4 days off instead of 1.

Your highest-efficiency windows this year:
[INSERT TOP 3 UPCOMING WINDOWS]

→ See all your windows: leavewise.app/optimize

— Leavewise"

---

## Email 3 — 4 weeks before next major holiday (dynamic send)

Subject: "[HOLIDAY NAME] is in [X] weeks — have you booked your time off?"

Body:
"[HOLIDAY] is coming up on [DATE].

If you take [X] PTO day(s), you get [Y] consecutive days off ([DATE RANGE]).

Pro tip: Flight prices start climbing 3-4 weeks before holiday weekends. If you're traveling, now is the time to search.

→ Search flights for your window: [Aviasales affiliate link with UTM]
→ See all your 2026 windows: leavewise.app/optimize

— Leavewise"

---

## Success Targets
- ≥30% open rate
- ≥5% click rate
- ≥100 emails sent in first month
- Unsubscribe rate <2%
- Email 3 (holiday-timed) achieves ≥8% CTR to affiliate or optimizer links

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/email/nurture-sequence.md
Expected: File exists
```

---

## Phase 11: SEO and Technical (Recurring)

---

### M-SEO-01: Monthly SEO Audit Prompt

**Files created:** `docs/recurring/seo-audit-prompt.md`
**Depends on:** Google Search Console + Naver Search Advisor are set up

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/recurring/seo-audit-prompt.md with the EXACT content below. Create the docs/recurring/ directory if it does not exist.

---
BEGIN FILE CONTENT
---

# Monthly SEO Audit — OpenClaw Recurring Prompt

> Run on the 1st of every month. Save output to docs/reports/seo/YYYY-MM.md

## Prompt

Run a monthly SEO audit for leavewise.app.

Steps:
1. Google Search Console: Pull top 20 queries, top 20 pages, avg position, CTR
2. Naver Search Advisor: Pull top queries, indexation status
3. Check Core Web Vitals (PageSpeed Insights for /optimize and / pages)
4. Check: Is sitemap.xml accessible and up-to-date?
5. Check: Are all blog posts indexed?
6. Identify: Top 3 queries where position is 4-10 (almost page 1 or top 3)

Action items based on findings:
- For queries at position 4-10: Improve the ranking page's title tag, add internal links
- For pages with high impressions but low CTR: Rewrite the meta description
- For unindexed pages: Request indexing via Search Console
- For Core Web Vitals issues: Flag specific metric (LCP, FID, CLS) and the page

Include a "Next month priorities" section with ≤3 specific actions.

## Targets
- Month-over-month organic traffic growth ≥15%
- ≥5 queries ranking in top 10 by Month 6
- Core Web Vitals "Good" on all pages
- ≥3 blog posts indexed and receiving traffic

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/recurring/seo-audit-prompt.md
Expected: File exists
```

---

### M-SEO-02: Seasonal Content Refresh Prompt

**Files created:** `docs/recurring/content-refresh-prompt.md`
**Depends on:** Blog posts exist

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/recurring/content-refresh-prompt.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Quarterly Content Refresh — OpenClaw Recurring Prompt

> Run at the start of each quarter. Save output to docs/reports/content-refresh/YYYY-QX.md

## Prompt

Review and update all existing blog content for the upcoming quarter.

For each existing blog post:
1. Check if the post targets a holiday/window in the NEXT 3 months
2. Update any outdated dates or calculations
3. Add internal links to any new blog posts published since original publication
4. Update meta descriptions if CTR < 3% in Search Console
5. Add "Related windows" section at the bottom linking to the optimizer with pre-filled params

For the Korean Naver Blog:
1. Update all posts with current-year dates
2. Re-tag with trending keywords from Naver Search Advisor
3. Add a "이번 달 추천" (this month's recommendation) section to the most recent post

Save change log to docs/reports/content-refresh/YYYY-QX.md

## Targets
- Updated posts see ≥10% traffic increase in following month
- All posts reviewed and updated within 1 week of quarter start
- No blog post has outdated year references

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/recurring/content-refresh-prompt.md
Expected: File exists
```

---

## Phase 12: Monetization Monitoring (Recurring)

---

### M-MON-01: Weekly Affiliate Link Health Check Prompt

**Files created:** `docs/recurring/affiliate-health-check-prompt.md`
**Depends on:** Affiliate links are live on the site

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/recurring/affiliate-health-check-prompt.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Weekly Affiliate Link Health Check — OpenClaw Recurring Prompt

> Run every Monday. Save output to docs/reports/link-health/YYYY-MM-DD.md

## Prompt

Perform a weekly affiliate link health check for Leavewise.

Steps:
1. Open leavewise.app/optimize in a browser
2. Run an optimization with US / 15 PTO days
3. Click each affiliate link in the first WindowCard:
   - Aviasales flight search → verify loads, marker param present
   - Hotellook hotel search → verify loads
   - Klook activities → verify loads via tp.media redirect
   - Tiqets attractions → verify loads
   - Airalo eSIM → verify loads
4. Run the same for Korea (KR country, ICN airport)
5. Check that UTM parameters are present on all links (utm_source=leavewise)

Report format:
| Link Type | US Status | KR Status | Marker Present | Notes |
|-----------|-----------|-----------|---------------|-------|
| Aviasales | OK/FAIL | OK/FAIL | OK/FAIL | |
| Hotellook | OK/FAIL | OK/FAIL | OK/FAIL | |
| Klook | OK/FAIL | OK/FAIL | OK/FAIL | |
| Tiqets | OK/FAIL | OK/FAIL | OK/FAIL | |
| Airalo | OK/FAIL | OK/FAIL | OK/FAIL | |

## Targets
- 100% affiliate link uptime
- Zero broken links for ≥4 consecutive weeks
- All marker/tracking params verified functional

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/recurring/affiliate-health-check-prompt.md
Expected: File exists
```

---

### M-MON-02: Monthly Affiliate Revenue Report Prompt

**Files created:** `docs/recurring/affiliate-revenue-prompt.md`
**Depends on:** Travelpayouts account is active

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/recurring/affiliate-revenue-prompt.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Monthly Affiliate Revenue Report — OpenClaw Recurring Prompt

> Run on the 1st of every month. Save output to docs/reports/affiliate/YYYY-MM.md

## Prompt

Generate a monthly affiliate revenue report for Leavewise.

Check:
1. Travelpayouts dashboard → total clicks, conversions, revenue for the month
2. Break down by program: Aviasales, Hotellook, Klook, Tiqets, Airalo
3. Calculate:
   - Click-through rate: affiliate clicks / total optimizer pageviews
   - Conversion rate: bookings / affiliate clicks
   - Revenue per 1,000 MAU (RPM)
   - Average booking value

Compare to targets:
- CTR target: 8-15%
- Booking CVR target: 2-4%
- RPM target: $200-$500/month per 1,000 MAU

Anomaly check:
- If CTR < 5%, flag for CTA copy/placement review
- If CVR < 1%, flag for landing page / deep-link quality review
- If any program has 0 clicks, flag as potentially broken

## Targets
- Positive affiliate revenue by Month 4
- CTR ≥8% by Month 6
- Revenue growing MoM for 3+ consecutive months
- RPM ≥$200 by Month 6

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/recurring/affiliate-revenue-prompt.md
Expected: File exists
```

---

## Phase 13: Competitive Intelligence (Recurring)

---

### M-CI-01: Monthly Competitive Check Prompt

**Files created:** `docs/recurring/competitive-check-prompt.md`
**Depends on:** Nothing

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/recurring/competitive-check-prompt.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Monthly Competitive Intelligence Check — OpenClaw Recurring Prompt

> Run on the 1st of every month. Save output to docs/reports/competitive/YYYY-MM.md

## Prompt

Check the following competitor sites for any new PTO/vacation optimization features:

1. Visit each URL:
   - Kayak Trip Planner: kayak.com/explore
   - Google Calendar: calendar.google.com
   - TimeAndDate.com: timeanddate.com/holidays
   - Naver Calendar: calendar.naver.com
   - Vacabot: vacabot.com
   - PlanMyLeave: planmyleave.com

2. Search for "PTO optimizer", "vacation planner", "holiday bridge" on each

3. Google search: "PTO optimizer" and "연차 최적화" — note any new entrants in top 20

4. Report format:
   | Competitor | New features found | Threat level (low/med/high) | Recommended response |

5. Save to docs/reports/competitive/YYYY-MM.md

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/recurring/competitive-check-prompt.md
Expected: File exists
```

---

## Phase 14: Growth Experiments (Months 4-6)

---

### M-GX-01: TikTok/Reels 8-Week Content Test

**Depends on:** M-US-11 (video scripts are created)
**Human action required:** Record and post 2 videos per week for 8 weeks

Refer to the scripts in `docs/social/tiktok-reels-scripts.md`. For each video, an OpenClaw agent should:
1. Pick the best upcoming holiday window for the template
2. Write the exact script with real dates and numbers
3. Describe the screen recording/visual needed
4. List all hashtags

**KPI:** ≥1 video achieves 10K+ views within 7 days
**Success criteria:**
- 16 videos published over 8 weeks (100% cadence)
- Total views ≥50,000
- ≥200 profile visits / link clicks from TikTok bio
- Identify best-performing template → double down

---

### M-GX-02: Product Hunt Launch Execution

**Depends on:** M-US-05 (launch kit created)
**Human action required:** Schedule and execute the launch

Refer to the launch kit in `docs/product-hunt/`. Execute the checklist in `launch-day-checklist.md`.

**KPI:** Top 5 Product of the Day
**Success criteria:**
- ≥200 upvotes on launch day
- ≥2,000 unique visitors from PH in launch week
- ≥20 comments engaged with

---

## Recurring Task Calendar (Master Schedule)

| Frequency | Task | Section Ref | Output |
|-----------|------|-------------|--------|
| Weekly (Mon) | Affiliate link health check | M-MON-01 | docs/reports/link-health/YYYY-MM-DD.md |
| Monthly (1st) | SEO audit | M-SEO-01 | docs/reports/seo/YYYY-MM.md |
| Monthly (1st) | Affiliate revenue report | M-MON-02 | docs/reports/affiliate/YYYY-MM.md |
| Monthly (1st) | "Window of the month" social post | M-XM-01 | Post to Twitter + Instagram |
| Monthly (1st) | Competitive intelligence check | M-CI-01 | docs/reports/competitive/YYYY-MM.md |
| Biweekly | Blog post (EN or KR, alternating) | M-US-07 through M-KR-05 | /blog or Naver Blog |
| Quarterly | Content refresh | M-SEO-02 | docs/reports/content-refresh/YYYY-QX.md |
| 4-6 weeks before spike | Spike-timed content | Spike Calendar | Blog + social + community |
| As needed | Community engagement | M-US-04, M-KR-02 | Reddit/Blind/KakaoTalk |

---

## Success Metrics Dashboard

| Metric | Month 3 Target | Month 6 Target | Month 12 Target | Data Source |
|--------|---------------|---------------|----------------|-------------|
| MAU | 2,500 | 7,500 | 30,000 | GA4 |
| Organic search clicks/mo | 500 | 3,000 | 15,000 | Search Console + Naver |
| Blog posts published | 3 | 10 | 24 | Content inventory |
| Naver Blog views/mo | 200 | 1,500 | 5,000 | Naver Blog stats |
| Email subscribers | 50 | 500 | 3,000 | Resend dashboard |
| Affiliate clicks/mo | 0 | 500 | 3,000 | Travelpayouts |
| Affiliate revenue/mo | $0 | $750 | $5,000 | Travelpayouts |
| Reddit referral clicks | 200 | 100 (maintenance) | 50 (SEO dominates) | UTM tracking |
| Social media followers | 50 | 300 | 1,500 | Twitter + Instagram |
| Premium subscribers | 0 | 0 | 200 | Stripe |

---

## SEO Keyword Targets

**USA:**
- "maximize PTO 2026" | "bridge days federal holidays" | "how to extend long weekend"
- "best weeks to take vacation 2026" | "holiday hacking PTO"

**Korea (Naver):**
- "황금연휴 2026" | "추석 연차 계획" | "설날 연차 팁" | "공휴일 끼워서 휴가"
- "연차 효율" | "직장인 여행 팁"

---

# PART 2: Viral Growth Playbook — Industry Best Practices

> Added 2026-03-30. Based on growth tactics from Wordle, Spotify Wrapped, Duolingo, Tally, Cal.com, Notion, Zapier, NerdWallet, and Korean viral app launches. Every tactic below is structured as an OpenClaw agent prompt.

---

## Viral Growth Principles

Before executing the tactics below, internalize these three principles that separate tools that grow linearly (through paid acquisition) from tools that grow exponentially (through product-led virality):

**Principle 1: Every user interaction should produce a shareable artifact.**
Wordle's colored grid squares, Spotify Wrapped cards, Duolingo streak screenshots — the output of using the tool IS the marketing. For Leavewise, every optimization result is a potential social media post. Design for this.

**Principle 2: The share flow must have zero friction.**
One tap to share, pre-written caption, pre-generated image. If a user has to screenshot, crop, and write a caption, 95% won't bother. If you hand them a beautiful card with a "Share" button, 10-20% will.

**Principle 3: Seasonal tools need seasonal re-engagement.**
Unlike SaaS with daily use, Leavewise has natural spike moments (New Year planning, pre-holiday, year-end "use it or lose it"). Build a systematic re-engagement engine that activates on every spike without manual effort.

---

## Phase 15: Product-Led Viral Loops (HIGHEST PRIORITY)

> These are the most impactful changes because they turn every user into a distribution channel. Implement before any paid spend.

---

### M-VL-01: Shareable Results Card (The "Spotify Wrapped" Mechanic)

**Files created/modified:** `components/ShareCard.tsx` (modify), `app/api/og/result/route.tsx` (create)
**Depends on:** Optimization results page exists
**Why this matters:** Spotify Wrapped generates 60M+ Instagram Stories shares annually. The mechanic is simple: give users a beautiful, identity-expressing card they WANT to share. "I turned 15 PTO days into 42 days off" is a status signal.

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first — Next.js APIs may differ from your training data. Check node_modules/next/dist/docs/ for correct conventions.

TASK: Build a shareable results card system that generates a branded image when users complete an optimization. This is the single most important viral mechanic.

REQUIREMENTS:

1. After optimization completes, show a "Share My Plan" button prominently (teal #1A6363, not hidden in a menu).

2. When clicked, generate a vertical (1080x1920 Stories) AND square (1080x1080 Feed) card containing:
   - Country flag emoji (🇺🇸 or 🇰🇷)
   - Large hero stat: "42 DAYS OFF" in Fraunces display font, teal color
   - Subline: "using only 15 PTO days" in DM Sans
   - Efficiency badge: "2.8x return on PTO"
   - Top 3 windows listed (e.g., "Easter: 4 PTO → 10 days")
   - Year: "2026"
   - Watermark bottom-right: "leavewise.app" in subtle gray
   - Background: cream (#FFFBF5), no gradients, no purple

3. Share flow — when user taps "Share":
   - On mobile: Use Web Share API (navigator.share) with the image file — this opens the native share sheet for Instagram Stories, KakaoTalk, iMessage, WhatsApp, etc.
   - Fallback: Copy image to clipboard + show a toast "Image copied! Paste on Instagram, Twitter, or KakaoTalk"
   - Also offer "Copy Link" which copies a URL like leavewise.app/optimize?s=[encoded-params] that recreates the results

4. Pre-written share captions (user can edit):
   - English: "I just turned [X] PTO days into [Y] days off in 2026. Plan yours free at leavewise.app 🗓 #PTOHack2026"
   - Korean: "연차 [X]일로 [Y]일 쉴 수 있다고?! 나도 계산해봄 → leavewise.app/ko #연차최적화2026"

5. The share card should also be generatable server-side as an OG image for shared URLs:
   - Create app/api/og/result/route.tsx that generates the card as a PNG via ImageResponse (next/og)
   - URL format: /api/og/result?country=US&pto=15&days=42&windows=Easter:4:10,July4:3:9

DESIGN CONSTRAINTS:
- Colors: teal (#1A6363), cream (#FFFBF5), charcoal (#1C1917) text. NO purple, NO gradients.
- Fonts: Fraunces for hero stat, DM Sans for body text
- Must look good as a raw screenshot too (users WILL screenshot instead of using share button)

VERIFICATION:
Run: npm run build
Expected: Build succeeds without errors
Check: The ShareCard component renders in the optimize page
```

---

### M-VL-02: "Challenge a Coworker" Viral Loop

**Files created:** `components/optimize/ChallengeCard.tsx`
**Depends on:** M-VL-01 (share card exists)
**Why this matters:** The most powerful viral channel for a PTO tool is the workplace. One person optimizing triggers coworkers to do the same. Formalizing this into a "challenge" mechanic (like Duolingo friend leagues) accelerates the loop.

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first.

TASK: Add a lightweight "Challenge a Coworker" prompt after optimization results.

STEP 1: Create components/optimize/ChallengeCard.tsx — a dismissible card that appears below the results:

Content:
- Headline: "Think you can beat your coworker's PTO efficiency?"
- Korean: "동료보다 연차를 더 효율적으로 쓸 수 있을까?"
- Body: "Share your score and challenge them to optimize theirs."
- Button: "Send Challenge" — opens share flow with text:
  "I got [Y] days off with [X] PTO days (efficiency: [ratio]x). Think you can beat that? → leavewise.app/optimize"
  Korean: "나 연차 [X]일로 [Y]일 쉰다 ㅋㅋ 너도 해봐 → leavewise.app/ko"
- Small dismiss "x" button, remembers dismissal in localStorage for 30 days

STEP 2: Add this card to the optimize page, shown after results load, positioned below the WindowCard list.

DESIGN:
- Light teal (#E8F5E9) background card with rounded corners
- No gradients, no purple
- Subtle, not intrusive — it should feel like a helpful suggestion, not a popup

VERIFICATION:
Run: npm run build
Expected: Build succeeds
```

---

### M-VL-03: Screenshot-Worthy Results Design Audit

**Files created:** `docs/design/screenshot-moment-spec.md`
**Depends on:** Nothing
**Why this matters:** BeReal, Wordle, and Duolingo streak screenshots go viral without ANY share button. If the results screen is visually distinctive and information-dense, users screenshot it naturally. The key: your domain must be visible in a raw screenshot.

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/design/screenshot-moment-spec.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Screenshot Moment — Design Specification

## Goal
Design the optimization results page so that a raw screenshot contains enough context AND branding that viewers understand what they're seeing AND know where to find the tool.

## Requirements

### Hero Stat (always visible in viewport)
- "42 DAYS OFF" — in large Fraunces display font (48px+), teal (#1A6363)
- "using only 15 PTO days" — DM Sans 18px, charcoal
- Efficiency badge: "2.8x" with a subtle icon
- This block should be visible even in a partial screenshot or Stories crop

### Persistent Branding
- "leavewise.app" should be visible in the results area (not just the header/footer)
- Position: subtle watermark or URL in the bottom-right of the results summary section
- It should survive cropping — place it INSIDE the results area, not in page chrome

### Visual Distinctiveness
- The cream (#FFFBF5) + teal (#1A6363) palette should be recognizable across social feeds
- The layout should look distinctive enough that someone scrolling Twitter/Instagram thinks "what is that?" (curiosity driver)
- Avoid generic card layouts — the visual should be unique to Leavewise

### Information Density
- A screenshot should contain: total days off, PTO used, efficiency ratio, top 3 windows, country, year
- Viewers should immediately understand the value proposition without visiting the site
- Include "your URL" so viewers know where to go

### Korean Version
- Same layout, Korean labels
- "42일 휴가" as hero stat, "연차 15일 사용" as subline
- "leavewise.app/ko" as watermark

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/design/screenshot-moment-spec.md
Expected: File exists
```

---

## Phase 16: LinkedIn Strategy (US Market — MISSING FROM ORIGINAL PLAN)

> LinkedIn is the most underexploited channel for Leavewise. The audience (working professionals who think about PTO) IS the target user. LinkedIn organic reach in 2025-2026 is still underpriced — a single post can reach 50K-500K impressions.

---

### M-LI-01: LinkedIn Content Plan

**Files created:** `docs/social/linkedin-strategy.md`
**Depends on:** Nothing
**Human action required after:** Create LinkedIn posts, engage with comments

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/social/linkedin-strategy.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# LinkedIn Strategy — @[Your Name] (Personal Account)

> CRITICAL: Post from a personal account, NOT a company page. LinkedIn's algorithm gives 5-10x more reach to personal posts. The founder/maker posting about their own tool is authentic and high-performing.

## Why LinkedIn Is the #1 Untapped Channel

- Leavewise's target user (employed professional with PTO) IS LinkedIn's user base
- PTO/work-life balance content consistently goes viral on LinkedIn
- Zero competition — no other PTO tool is active on LinkedIn
- Carousel/document posts get 2-3x reach vs text posts
- The link goes in the FIRST COMMENT (not post body) to avoid reach suppression

## Post Templates

### Post 1 — The Data Hook (Week 1)

Americans leave an average of 4.6 PTO days unused every year.

At average salaried compensation, that's ~$3,344 left on the table. Annually.

Across the US workforce, that's $272 billion in unused compensation.

Why?

Most people take random days off. But if you place PTO days strategically around public holidays, each day is worth 2-3x more:

- 1 PTO day next to Thanksgiving → 4 days off (4x)
- 3 PTO days at Christmas → 10 days off (3.3x)
- 4 PTO days at Easter → 10 days off (2.5x)

15 PTO days, placed optimally in 2026 → 42 days off.

I built a free tool that does this calculation automatically. No signup, runs in your browser.

Link in comments ↓

#PTO #WorkLifeBalance #CareerAdvice

---

### Post 2 — The Carousel (Week 2)

Create a 10-slide carousel PDF:
Slide 1: "2026 PTO Cheat Sheet"
Slide 2: "15 PTO days → 42 days off. Here's how."
Slide 3-8: One holiday per slide (Easter, Memorial Day, July 4th, Labor Day, Thanksgiving, Christmas) with the bridge strategy and efficiency ratio
Slide 9: "Total: 42 days off with 15 PTO"
Slide 10: "Plan yours free at leavewise.app"

Upload as a PDF document post for maximum reach.

---

### Post 3 — The Personal Story (Week 3)

Last year I wasted 5 PTO days.

Not "wasted" as in bad trips. I just took random weeks off when I felt burnt out.

This year I did the math. Instead of spreading PTO randomly, I mapped every holiday bridge:

→ 4 days around Easter = 10 days off (a real trip to Portugal)
→ 3 days at Christmas = 10 days off (time with family AND New Year's)
→ 3 days around July 4th = 9 days off (Europe in shoulder season)

Same 15 PTO days. Completely different year.

I automated the calculation into a free tool so anyone can do this: [link in comments]

What's your 2026 PTO strategy?

---

### Post 4 — The Poll (Week 4)

How many of your PTO days did you use in 2025?

🟢 All of them
🟡 Most (75%+)
🟠 About half
🔴 Less than half

(Polls get 3-5x engagement on LinkedIn)

Follow-up comment after 50+ responses: "For those in the 🟠🔴 camp — here's a free tool that finds the most efficient days to take off in 2026: [link]"

---

### Post 5 — The HR Angle (Week 5)

To every HR leader and manager:

Your employees are leaving an average of 4.6 PTO days unused per year. That's not discipline — it's poor planning.

The fix is shockingly simple: show them WHEN to take days off.

A single PTO day placed next to a public holiday gives 4 days off. A random Tuesday gives 1.

I built a free tool that calculates the optimal PTO placement for every employee: leavewise.app

Share it in your next all-hands. Your team's mental health (and your retention numbers) will thank you.

#HR #PeopleOps #EmployeeWellbeing #Leadership

---

## LinkedIn Best Practices for Leavewise

1. Post Tuesday-Thursday, 8-10 AM ET (peak LinkedIn engagement)
2. Link always in first comment, NEVER in post body
3. Engage with every comment in first hour (algorithmic boost)
4. Use line breaks liberally — LinkedIn rewards scannable formatting
5. Tag 2-3 relevant people per post (HR influencers, remote work advocates) — don't spam
6. Repost/reshare your best-performing post 30 days later (LinkedIn doesn't penalize reposts like Twitter)
7. If a post gets >10K impressions, boost it with $20-50 LinkedIn promotion

## Success Targets
- 4 posts in first month
- ≥1 post achieves 10K+ impressions
- ≥500 profile visits from LinkedIn in first month
- ≥200 referral visits to leavewise.app from LinkedIn (UTM: ?utm_source=linkedin&utm_medium=social&utm_campaign=[post-number])

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/social/linkedin-strategy.md
Expected: File exists
```

---

## Phase 17: Hacker News + Indie Hackers Launch

> HN front page = 20K-50K visits in 24 hours. Indie Hackers = long-tail community traffic. Neither is in the original plan.

---

### M-HN-01: Hacker News "Show HN" Launch Plan

**Files created:** `docs/launch/hacker-news-plan.md`
**Depends on:** Nothing
**Human action required after:** Post to HN, engage in comments for 3-4 hours

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/launch/hacker-news-plan.md with the EXACT content below. Create the docs/launch/ directory if it does not exist.

---
BEGIN FILE CONTENT
---

# Hacker News "Show HN" Launch Plan

## Post Details

**Title options (pick one):**
- "Show HN: I built a tool that turns 15 PTO days into 42 days off"
- "Show HN: Leavewise – optimize your PTO around public holidays (US + Korea)"
- "Show HN: I analyzed every holiday bridge opportunity in 2026"

**URL:** https://leavewise.app/optimize

**HN text (optional, for Show HN):**
"I built this because I realized I was wasting PTO by taking random days off. The concept is simple: public holidays create bridge opportunities where 1-2 PTO days give you 4-10 days off. The algorithm finds every optimal window for your country and PTO balance.

Currently supports US (with state-specific holidays) and Korea. Free, no signup, runs in your browser. Built with Next.js 16.

Would love feedback, especially from people outside the US/Korea — which country should I add next?"

## Timing
- Post Tuesday-Thursday, 8-9 AM ET (highest HN traffic, lower competition than Monday)
- Avoid major tech news days (Apple events, big launches)
- Best months: January (planning season), May-June (summer planning), September (year-end planning)

## Engagement Protocol (CRITICAL)
- Respond to EVERY comment in the first 4 hours. HN rewards active OP participation.
- Be technical, honest, and self-deprecating. Zero marketing-speak.
- If someone asks about the algorithm → explain the optimization logic genuinely
- If someone criticizes → thank them and engage with the substance
- If someone asks for other countries → "That's the #1 request. Which country would be most useful for you?"
- If someone calls it "trivial" → "You're right that any individual bridge is obvious. The value is seeing ALL bridges ranked by efficiency and automatically handling state holidays, substitute holidays, and edge cases."

## Pre-Launch Checklist
- [ ] Site loads in <2 seconds (HN users are ruthless about speed)
- [ ] Works without signup in <30 seconds (land → optimize → see results)
- [ ] Mobile works perfectly (30%+ of HN traffic is mobile)
- [ ] No analytics popups, cookie banners, or newsletter modals on first visit
- [ ] Rate limiting is configured (HN can send 1000+ concurrent users)

## Post-Launch
- If you hit front page: Screenshot and share on Twitter ("Just hit the HN front page!")
- Cross-post to Indie Hackers: "I launched a free PTO optimizer on HN — here's what happened"
- Write a retrospective blog post: "Building in public: How Leavewise got to X users" (seeds future launches)

## Success Targets
- Front page (top 30) for ≥4 hours
- ≥100 upvotes
- ≥20K unique visitors from HN in 48 hours
- ≥30 comments engaged with

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/launch/hacker-news-plan.md
Expected: File exists
```

---

### M-HN-02: Indie Hackers Launch + Build-in-Public Post

**Files created:** `docs/launch/indie-hackers-plan.md`
**Depends on:** Nothing

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/launch/indie-hackers-plan.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Indie Hackers Launch Plan

## Product Page
- Product name: Leavewise
- Tagline: "Turn 15 PTO days into 42 days off. Free, no signup."
- Description: PTO optimizer that finds every holiday bridge opportunity for US and Korea.
- Revenue: $0 (free tool with affiliate monetization)
- Stack: Next.js 16, TypeScript, Tailwind CSS, Vercel

## "How I Built This" Post

Title: "I built a free PTO optimizer — here's how it works and what I learned"

Content:
1. Problem: "I was wasting PTO by taking random days off"
2. Solution: "An algorithm that finds every holiday bridge for your country and PTO balance"
3. Technical decisions: Next.js 16, no auth, no database needed
4. Monetization: Affiliate links to travel booking (Aviasales, Hotellook, Klook)
5. Growth: SEO, Reddit, bilingual (English + Korean market)
6. Numbers: [X] users in first week, [Y] optimizer runs, $0 revenue so far
7. Lessons learned: "The Korean market responded faster than the US market because [reason]"
8. What's next: more countries, email list, seasonal content

## Milestone Posts (Recurring)
Post updates at:
- 100 users → "From 0 to 100 users with a free PTO tool"
- 1,000 users → "How a side project hit 1K users"
- First $1 revenue → "My free tool just made its first dollar"
- 10,000 users → Full breakdown with traffic sources

## Community Engagement
- Follow and engage with other IH founders building free/prosumer tools
- Answer questions in the "Growth" and "Marketing" categories
- Share genuine learnings, not just milestones (IH community values authenticity)

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/launch/indie-hackers-plan.md
Expected: File exists
```

---

## Phase 18: Programmatic SEO Pages

> Zapier has 5M+ programmatic pages. NerdWallet, Wise, and Nomad List all scaled through programmatic SEO. For Leavewise: every holiday × every year × every country = thousands of high-intent pages.

---

### M-PSEO-01: Generate Holiday-Specific Landing Pages

**Files created:** `app/holidays/[country]/[holiday]/page.tsx`, `lib/holiday-pages.ts`
**Depends on:** Holiday data exists in `lib/api.ts`

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first. Check node_modules/next/dist/docs/ for correct App Router conventions, especially generateStaticParams and dynamic route conventions.

TASK: Create programmatic SEO pages for every major holiday bridge opportunity. Each page targets a specific long-tail keyword like "memorial day 2026 days off" or "추석 2026 연차."

STEP 1: Create lib/holiday-pages.ts with data for all major holidays:

Export a function getHolidayPages(country: 'US' | 'KR', year: number) that returns an array of:
{
  slug: string,           // "memorial-day-2026" or "chuseok-2026"
  holiday: string,        // "Memorial Day" or "추석"
  date: string,           // "2026-05-25"
  ptoDays: number,        // optimal PTO days to use
  daysOff: number,        // total days off achieved
  efficiency: number,     // ratio
  dateRange: string,      // "May 16 - May 25" or "9월 19일 ~ 9월 28일"
  strategies: Array<{     // multiple PTO strategies
    pto: number,
    daysOff: number,
    range: string,
    description: string
  }>
}

Include ALL major US holidays (New Year's Day, MLK Day, Presidents' Day, Easter, Memorial Day, Juneteenth, July 4th, Labor Day, Columbus Day, Veterans Day, Thanksgiving, Christmas) and ALL major Korean holidays (설날, 삼일절, 어린이날, 부처님오신날, 현충일, 광복절, 추석, 개천절, 한글날, 크리스마스) for 2026 and 2027.

STEP 2: Create app/holidays/[country]/[holiday]/page.tsx:

This is a SERVER component (no 'use client'). It should:
1. Use generateStaticParams to pre-render all holiday pages at build time
2. Generate complete metadata (title, description, keywords, OG tags) targeting the long-tail keyword
3. Render a clean, SEO-optimized page with:
   - H1: "[Holiday] 2026: How to Get [X] Days Off with [Y] PTO Days"
   - Korean H1: "2026년 [Holiday]: 연차 [Y]일로 [X]일 쉬는 법"
   - A visual mini-calendar showing the bridge strategy
   - All strategy options in a comparison table
   - A "Calculate your full year" CTA linking to /optimize (US) or /ko (KR)
   - FAQ section targeting "People Also Ask" queries
   - Internal links to adjacent holidays
4. Use JSON-LD structured data (FAQPage schema + HowTo schema) for AI search optimization

STEP 3: Add to sitemap — ensure all holiday pages appear in the sitemap.

URL structure:
- /holidays/us/memorial-day-2026
- /holidays/us/thanksgiving-2026
- /holidays/kr/chuseok-2026
- /holidays/kr/seollal-2027

DESIGN: Cream background, teal accents, Fraunces headings, DM Sans body. No purple, no gradients. Clean, informational, optimized for readability and SEO.

VERIFICATION:
Run: npm run build
Expected: Build succeeds, holiday pages appear in static page output
Run: curl -s http://localhost:3000/holidays/us/memorial-day-2026 | grep "<h1" | head -1
Expected: Contains "Memorial Day 2026"
```

---

## Phase 19: Korean Platform Expansion

> The original plan covers Naver Blog, Blind, and KakaoTalk. These additions cover 지식iN, 에브리타임, 뽐뿌, 클리앙, Tistory, and Naver Search Ads — platforms that drive significant Korean traffic.

---

### M-KR-08: Naver 지식iN Q&A Seeding

**Files created:** `docs/social/naver-jisin-plan.md`
**Depends on:** Nothing
**Human action required after:** Answer questions on 지식iN

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/social/naver-jisin-plan.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Naver 지식iN Q&A Seeding Plan

> 지식iN is Korea's equivalent of Quora/Yahoo Answers. High-ranking answers drive long-term SEO traffic on Naver and are frequently cited in Naver SmartBlock AI answers.

## Why This Works
- Naver prioritizes 지식iN answers in search results for question-type queries
- "연차 언제 쓰면 좋을까?" and "추석 연차 며칠?" type queries appear constantly
- A well-written answer with calculations and a tool link becomes a permanent traffic source
- 지식iN answers also feed into Naver's AI-generated search summaries

## Target Questions to Answer

Search for and answer these question types on 지식iN:
- "2026 추석 연차 며칠 써야 하나요?"
- "연차 15일 어떻게 쓰면 좋을까요?"
- "황금연휴 만드는 법"
- "공휴일 끼워서 연차 쓰는 법"
- "설날 연차 전략"
- "어린이날 연차 몇 일"
- "올해 대체공휴일 언제"

## Answer Template

"2026년 [Holiday] 연차 전략 정리해드릴게요.

[Holiday] 연휴: [dates]
대체공휴일: [date] (if applicable)

전략 A: [description] — 연차 [X]일 → [Y]일 연속 휴가
전략 B: [description] — 연차 [X]일 → [Y]일 연속 휴가

가장 효율 좋은 건 전략 [A/B]입니다. (효율 [ratio]배)

참고로 자동으로 계산해주는 무료 사이트도 있어요: leavewise.app/ko
연차 수 입력하면 모든 황금연휴를 자동으로 찾아줍니다."

## Rules
- Always provide the FULL calculation first, then mention the tool as supplementary
- Never answer with just a link — that gets flagged as spam
- Answer within 24 hours of question being posted (fresh answers rank higher)
- Use polite 존댓말 (formal Korean)
- Include specific dates and calculations — vague answers don't rank

## Cadence
- Monitor 지식iN weekly for new PTO/연차 questions
- Aim for 3-5 answered questions per month
- Increase frequency 4-6 weeks before major holidays

## Success Targets
- 20+ 지식iN answers in first 3 months
- ≥5 answers selected as "채택" (accepted answer)
- ≥500 monthly views across all answers
- At least 3 answers appearing in Naver SmartBlock results

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/social/naver-jisin-plan.md
Expected: File exists
```

---

### M-KR-09: Korean Community Expansion (에브리타임, 뽐뿌, 클리앙, Tistory)

**Files created:** `docs/social/korea-community-expansion.md`
**Depends on:** Nothing
**Human action required after:** Post in each community following the plan

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/social/korea-community-expansion.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Korean Community Expansion Plan

## 1. 에브리타임 (Everytime) — University Students

> 500만+ 대학생 사용자. 졸업 예정자와 신입사원 타겟.

**Best timing:** February-March (졸업/입사 시즌), September (추석 전)

**Post angle:** "신입사원 연차 꿀팁 — 처음 받는 연차 알뜰하게 쓰는 법"

**Content:**
"곧 취업인데 연차 어떻게 써야 하는지 몰라서 정리해봤습니다.

2026년 기준:
- 입사 1년차: 월 1일씩 발생 (최대 11일)
- 11일로 최대 효율 내는 법:
  1순위: 추석 (연차 2일 → 10일 연휴)
  2순위: 크리스마스 (연차 3일 → 10일 연휴)
  3순위: 어린이날 (연차 1일 → 5일 연휴)

자동 계산기: leavewise.app/ko (무료, 회원가입 없음)"

---

## 2. 뽐뿌 (Ppomppu) — Deal/Life Hack Community

> 100만+ 활성 사용자. "꿀팁" 콘텐츠에 반응 좋음.

**Best timing:** 4-6 weeks before major holidays

**Post in:** 자유게시판

**Post angle:** "[정보] 2026 연차 효율 순위 정리 (추석 >> 크리스마스 >> 설날)"

**Content:**
"직접 계산해본 2026 연차 효율 랭킹입니다.

| 순위 | 연휴 | 연차 | 총 휴가 | 효율 |
|------|------|------|---------|------|
| 1 | 설날 | 1일 | 6일 | 6.0배 |
| 2 | 추석 | 2일 | 10일 | 5.0배 |
| 3 | 크리스마스 | 3일 | 10일 | 3.3배 |
| 4 | 어린이날 | 1일 | 5일 | 5.0배 |
| 5 | 광복절 | 1일 | 4일 | 4.0배 |

연차 15일 최적 배치하면 총 40일+ 쉴 수 있습니다.
자동 계산기 공유: leavewise.app/ko"

---

## 3. 클리앙 (Clien) — Tech-Savvy Community

> 기술에 관심 많은 사용자. "사이드 프로젝트" 각도.

**Post in:** 모두의공원

**Post angle:** "[공유] 연차 최적화 계산기 만들었습니다 (무료)"

**Content:**
"개발자인데 매년 연차 대충 쓰다가, 올해는 공휴일 데이터 분석해서 최적 배치를 계산하는 사이트를 만들어봤습니다.

기능:
- 한국/미국 공휴일 자동 반영 (대체공휴일 포함)
- 연차 수 입력하면 효율 순으로 황금연휴 추천
- 무료, 회원가입 없음

기술 스택: Next.js 16, TypeScript, Vercel
사이트: leavewise.app/ko

피드백 환영합니다!"

---

## 4. Tistory — Korean Blog Platform

> Naver Blog과 함께 한국 2대 블로그 플랫폼. Google Korea 검색에서 Tistory가 Naver Blog보다 잘 노출됨.

**Strategy:**
- Create a Tistory blog for "연차 최적화" content
- Cross-post Korean blog content from content/blog/ko/ to Tistory (with canonical URL pointing to leavewise.app)
- Tistory is indexed by Google Korea → complements Naver Blog which is indexed by Naver
- Target Google Korea traffic that Naver Blog misses

**Posts to create:**
Same content as Naver Blog Korean posts, reformatted for Tistory:
1. "2026년 연차 15개로 최대 며칠 쉴 수 있을까?"
2. "2026년 추석 황금연휴 완벽 가이드"
3. "신입사원 연차 활용 꿀팁"

**SEO Tags:** 연차, 황금연휴, 직장인, 2026, 공휴일

---

## 5. Naver Search Ads (Low Budget)

> Naver still holds ~55% of Korean search market. Naver Search Ads are cheaper than Google Ads for Korean keywords.

**Budget:** 3,000-5,000 KRW/day ($3-5/day)

**Keywords:**
| Keyword | Est. CPC | Search Volume | Priority |
|---------|----------|---------------|----------|
| 연차 계산기 | ~200 KRW | Medium | HIGH |
| 연차 최적화 | ~150 KRW | Low-Med | HIGH |
| 황금연휴 2026 | ~300 KRW | High (seasonal) | SEASONAL |
| 추석 연차 2026 | ~250 KRW | High (seasonal) | SEASONAL |
| 공휴일 연차 | ~180 KRW | Medium | MEDIUM |

**Ad copy:**
Title: "연차 15일로 42일 쉬는 법 | 무료 자동 계산"
Description: "2026 공휴일 기반 연차 최적화. 황금연휴 자동 추천. 회원가입 없이 바로 계산."
URL: leavewise.app/ko?utm_source=naver&utm_medium=search&utm_campaign=ads

**Schedule:** Always-on for core keywords, burst (10,000 KRW/day) for 2 weeks before 추석, 설날, 어린이날.

---

## Rules for ALL Korean Communities
1. Read each community's rules before posting. Every community has different norms.
2. Never post the same content across communities — customize for each.
3. Value first, tool second. Provide calculations, then mention the tool.
4. Respond to every comment within 24 hours.
5. If someone is negative, respond with humor or thank them. Never defensive.
6. Don't post more than once per community per 2 weeks.

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/social/korea-community-expansion.md
Expected: File exists
```

---

## Phase 20: Data-Driven PR & Media Outreach

> Tools like Calendly and Loom generate press coverage by publishing original data. "Americans leave $272B in PTO on the table" is the kind of stat journalists cite.

---

### M-PR-01: PR Data Package + Media Outreach Plan

**Files created:** `docs/pr/data-pr-strategy.md`
**Depends on:** Nothing
**Human action required after:** Pitch to journalists, submit to HARO/Connectively

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/pr/data-pr-strategy.md with the EXACT content below. Create the docs/pr/ directory if it does not exist.

---
BEGIN FILE CONTENT
---

# Data-Driven PR Strategy

## The Hook
"Americans leave an average of 4.6 PTO days unused every year — that's $272 billion in lost compensation across the US workforce. A free tool shows that strategic PTO placement can turn 15 days into 42 days off."

This is a story journalists at Business Insider, CNBC, Fast Company, and Forbes WANT to write. The data is compelling, the tool is free, and the angle is populist ("stick it to your employer by being smarter").

## Data Points to Cite (All Publicly Sourced)

| Stat | Source | Year |
|------|--------|------|
| Americans leave 4.6 PTO days unused/year | U.S. Travel Association / Qualtrics | 2024 |
| 55% of Americans don't use all their PTO | Pew Research | 2023 |
| Average PTO day is worth $580 in compensation | BLS median wage data | 2024 |
| $272B aggregate value of unused PTO | USTA estimate | 2024 |
| 768M vacation days go unused annually | USTA "Project: Time Off" | 2024 |
| Workers who use PTO are 6.5% more likely to get promoted | Harvard Business Review | 2023 |

Korean data:
| Stat | Source |
|------|--------|
| 한국 직장인 평균 연차 사용률: 73% | 한국경영자총협회 | 2024 |
| 미사용 연차: 평균 4.1일 | 고용노동부 | 2024 |
| 연차 미사용 보상금 평균: 89만원/년 | 직장인 설문 (잡코리아) | 2024 |

## Create an Annual "PTO Report" Blog Post

Title: "The 2026 PTO Efficiency Report: How Strategic Vacation Planning Could Save Americans $272 Billion"

Content:
1. The cost of unused PTO (national data)
2. PTO efficiency rankings by holiday (original analysis from your tool)
3. The best and worst days to take off in 2026 (original data)
4. Country comparison: US vs Korea PTO efficiency
5. Interactive element: embed the optimizer with pre-filled params
6. Downloadable PDF infographic with key stats

This blog post becomes a citable source that journalists, bloggers, and social media creators reference.

## Media Outreach — US

### HARO / Connectively / Qwoted
Sign up and monitor for journalist queries about:
- PTO, vacation, time off, work-life balance
- Holiday travel planning
- Workplace wellness, employee benefits
- Year-end planning

Response template:
"[Your name], creator of Leavewise, a free PTO optimization tool used by [X] users across the US and Korea. Our data shows that strategic PTO placement around public holidays can turn 15 vacation days into 42 days off — a 2.8x efficiency gain. The single most efficient window in 2026 is [window]. Happy to provide data, quotes, or a demo."

### Direct Pitches (Send 4-6 Weeks Before Major Holidays)

**Target publications:**
| Publication | Reporter Beat | Angle |
|------------|--------------|-------|
| Business Insider | Work/careers | "The PTO hack Wall Street interns are sharing" |
| CNBC Make It | Personal finance | "Americans leave $272B in PTO on the table" |
| Fast Company | Productivity | "This free tool uses an algorithm to maximize your time off" |
| Lifehacker | Life hacks | "Turn 15 vacation days into 42 days off" |
| The Points Guy | Travel | "The best days to book off for the cheapest flights in 2026" |
| Refinery29 | Work culture | "The quiet revolution in vacation planning" |

**Pitch template:**

Subject: Data: Americans waste $272B in unused PTO — here's the fix

Hi [Name],

Ahead of [upcoming holiday], I wanted to share some data your readers might find useful:

- The average American leaves 4.6 vacation days unused per year (~$2,680 in lost compensation)
- Strategic placement of PTO around holidays can 2-3x its value
- The most efficient PTO window in 2026 is [specific window]: [X] PTO days → [Y] days off

I built Leavewise (leavewise.app), a free tool that calculates optimal PTO placement for US and Korean workers. It's been used by [X] people since launch.

Happy to provide exclusive data, quotes, or a custom analysis for your audience. The tool is completely free — no catch, no paywall, no signup.

Best,
[Name]

## Media Outreach — Korea

**Target publications:**
| Publication | Angle |
|------------|-------|
| 한국경제 (Hankyung) | "직장인 연차 혁명 — 연차 15일로 42일 쉬는 시대" |
| 조선일보 / 중앙일보 | "올해 황금연휴, 연차 이렇게 쓰면 최대 [X]일" (timed to 추석) |
| 직썰 (JikSsul) | "직장인 필수 도구: 연차 최적화 계산기" |
| 위키트리 / 인사이트 | "연차 2일로 10일 쉬는 법 화제" |
| 서울경제 | "연차 미사용 보상금 vs 황금연휴: 뭐가 이득?" |

**Korean pitch:**

"기자님 안녕하세요,

2026년 추석 관련 기사 작성에 참고가 될 수 있는 데이터를 공유드립니다.

한국 직장인이 연차를 공휴일 주변에 전략적으로 배치하면, 연차 15일로 최대 42일을 쉴 수 있다는 분석 결과가 있습니다. 올해 추석의 경우 연차 2일만 쓰면 10일 연속 휴가가 가능합니다.

이를 자동으로 계산해주는 무료 도구를 만들었으며 (leavewise.app/ko), 현재 [X]명의 사용자가 이용 중입니다.

관련 데이터나 인터뷰가 필요하시면 말씀해주세요.

감사합니다.
[Name]"

## Success Targets
- 2+ media mentions in first 6 months
- 1+ HARO/Connectively responses picked up
- PTO Report blog post gets 5+ backlinks
- At least 1 Korean media mention before Chuseok

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/pr/data-pr-strategy.md
Expected: File exists
```

---

## Phase 21: Low-Budget Paid Acquisition

---

### M-ADS-01: Google Ads Micro-Budget Plan

**Files created:** `docs/paid/google-ads-plan.md`
**Depends on:** Nothing
**Human action required after:** Set up Google Ads account, create campaigns

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/paid/google-ads-plan.md with the EXACT content below. Create the docs/paid/ directory if it does not exist.

---
BEGIN FILE CONTENT
---

# Google Ads Micro-Budget Plan

> Budget: $5-10/day. Focus on high-intent, low-competition keywords. Because the tool is free with no signup, conversion from click to user is ~100%.

## Campaign 1: Core Keywords (Always-On)

Budget: $5/day

| Keyword | Match Type | Est. CPC |
|---------|-----------|----------|
| PTO optimizer | Phrase | $0.80 |
| PTO calculator | Phrase | $0.60 |
| maximize vacation days 2026 | Phrase | $0.40 |
| best days to take off 2026 | Phrase | $0.30 |
| holiday bridge days | Phrase | $0.25 |
| how to extend long weekend | Broad | $0.35 |

Ad copy:
Headline 1: "Turn 15 PTO Days Into 42 Days Off"
Headline 2: "Free PTO Optimizer — No Signup"
Headline 3: "Find Every Holiday Bridge in 2026"
Description: "The smartest way to plan your time off. See every efficient PTO window for US holidays. Free, instant, no account needed."
URL: leavewise.app/optimize?utm_source=google&utm_medium=cpc&utm_campaign=core

Negative keywords: PTO payout, PTO accrual, PTO policy, PTO tracker, time off request, HR software

## Campaign 2: Seasonal Burst (Before Major Holidays)

Budget: $10/day for 2 weeks before each holiday cluster

| Holiday | Keywords | Burst Window |
|---------|----------|-------------|
| Easter | "easter 2026 long weekend", "easter 2026 days off" | Mar 15 - Apr 5 |
| Memorial Day | "memorial day 2026 long weekend" | May 1-22 |
| July 4th | "july 4th 2026 vacation" | Jun 15 - Jul 3 |
| Labor Day | "labor day 2026 long weekend" | Aug 15 - Sep 1 |
| Thanksgiving | "thanksgiving 2026 vacation" | Nov 1-25 |
| Christmas | "christmas 2026 time off", "new years 2026 PTO" | Nov 15 - Dec 20 |

## Landing Page
- Send all traffic to /optimize (not homepage)
- The page should deliver value in <15 seconds (land → see optimizer → get results)
- No friction: no popup, no signup, no newsletter modal

## Targets
- CPC < $0.50 average
- CTR > 5% (indicates keyword-ad relevance)
- Monthly spend: $150-300
- Monthly clicks: 300-600
- Track which keywords drive users who share results (downstream viral value)

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/paid/google-ads-plan.md
Expected: File exists
```

---

## Phase 22: Partnerships & Cross-Promotion

---

### M-PART-01: Partnership Outreach Plan

**Files created:** `docs/partnerships/partnership-plan.md`
**Depends on:** Nothing
**Human action required after:** Send outreach emails/DMs

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/partnerships/partnership-plan.md with the EXACT content below. Create the docs/partnerships/ directory if it does not exist.

---
BEGIN FILE CONTENT
---

# Partnership & Cross-Promotion Plan

## Why Partnerships Work for Leavewise
Leavewise answers "WHEN to take time off." Travel sites answer "WHERE to go and HOW to get there." HR tools answer "HOW to request time off." This makes Leavewise a natural complement, not a competitor, to many established products.

## Tier 1: Travel Deal Newsletters

These newsletters have 100K-1M+ subscribers of exactly the right demographic.

| Newsletter | Subscribers | Pitch Angle |
|-----------|------------|-------------|
| Going (fka Scott's Cheap Flights) | 2M+ | "Embed our PTO optimizer in your annual planning guide" |
| Secret Flying | 1M+ | "When to take time off to catch the best flight deals" |
| The Points Guy | 5M+ | "The missing piece: which days to book off for award flights" |
| Thrifty Traveler | 500K+ | "Help your subscribers maximize their travel days" |

**Pitch template:**
"Hi [Name],

Your subscribers know where to go and how to get cheap flights. But they often miss the first step: knowing WHICH days to take off for maximum time away.

I built Leavewise (leavewise.app), a free tool that finds every holiday bridge opportunity in 2026. The math is compelling: 15 PTO days can become 42 days off.

Would you be open to:
- Mentioning it in a "plan your 2026 travel" edition
- Or letting me write a guest piece: "The Best Days to Book Off for Cheap Flights in 2026"

The tool is free — no affiliate split or revenue ask. Just think your readers would genuinely use it.

Best,
[Name]"

## Tier 2: HR & People Ops Tools

HR managers who share Leavewise with their companies create 100-1000 users per share.

| Tool | Angle |
|------|-------|
| Lattice (blog) | Guest post: "How to reduce Q4 PTO bottlenecks" |
| BambooHR (blog) | Guest post: "Why employees waste PTO and how to help" |
| Remote.co | "The remote worker's guide to maximizing PTO" |
| Gusto (blog) | "PTO planning for small business employees" |

## Tier 3: Korean Travel Platforms

| Platform | Users | Angle |
|----------|-------|-------|
| 마이리얼트립 | 1M+ | Co-branded "황금연휴 여행 가이드" with PTO calculator embed |
| 여기어때 | 5M+ | "연차 최적화 + 숙소 추천" seasonal feature |
| 트리플 | 2M+ | "여행 계획의 첫 단계: 연차 최적화" integration |
| 네이버 여행+ | Mass reach | Content partnership for 추석 planning season |

## Tier 4: Calendar & Productivity Tools

| Tool | Angle |
|------|-------|
| Google Calendar | Chrome extension that overlays optimal PTO days |
| Notion | "2026 PTO Planning" Notion template with embedded calculator link |
| Cron/Fantastical | Holiday bridge days calendar subscription (.ics) |

## Success Targets
- 3+ partnership conversations started in first 3 months
- 1+ guest post or mention in a major newsletter
- 1+ Korean platform partnership conversation
- Track referral traffic from each partner (UTM: utm_source=[partner]&utm_medium=partnership)

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/partnerships/partnership-plan.md
Expected: File exists
```

---

## Phase 23: Answer Engine Optimization (AI Search)

> By 2026, 30-40% of informational queries are answered by AI (ChatGPT, Perplexity, Google AI Overviews, Naver AI). Structure content so AI cites Leavewise.

---

### M-AEO-01: Structured Data + FAQ Schema for AI Search

**Files modified:** Blog pages, holiday pages
**Depends on:** Blog and holiday pages exist

#### Agent Prompt

```
You are working in the Next.js 16 project at /Users/constantlee/PTO-optimizer.

IMPORTANT: Read AGENTS.md first.

TASK: Add structured data (JSON-LD) to blog pages and the homepage to optimize for AI search engines (ChatGPT, Perplexity, Google AI Overviews, Naver SmartBlock).

STEP 1: Add FAQPage schema to the homepage (app/page.tsx or the LandingPageContent):

Create a FAQ section at the bottom of the landing page with these Q&As, AND add corresponding FAQPage JSON-LD:

Q: "How many days off can I get with 15 PTO days in 2026?"
A: "In the US, strategic placement of 15 PTO days around federal holidays can yield 35-42 days off in 2026. The most efficient windows are Christmas-New Year (3 PTO → 10 days off) and Easter (4 PTO → 10 days off)."

Q: "What are bridge days?"
A: "Bridge days are PTO days placed between a public holiday and a weekend to create a longer continuous break. For example, if a holiday falls on Thursday, taking Friday off (1 PTO day) gives you a 4-day weekend."

Q: "How does PTO optimization work?"
A: "PTO optimization analyzes your country's public holiday calendar and finds the most efficient placement for your available PTO days. Each PTO day is scored by how many total days off it creates. The algorithm prioritizes windows with the highest efficiency ratio."

Q: "연차 15일로 며칠 쉴 수 있나요?" (Korean)
A: "2026년 한국 공휴일 기준, 연차 15일을 최적으로 배치하면 40일 이상 쉴 수 있습니다. 가장 효율 좋은 연휴는 추석 (연차 2일 → 10일)과 설날 (연차 1일 → 6일)입니다."

STEP 2: Add HowTo schema to the "How it works" section of the landing page:

{
  "@type": "HowTo",
  "name": "How to Maximize Your PTO in 2026",
  "step": [
    { "name": "Select your country", "text": "Choose US or Korea to load the correct public holiday calendar." },
    { "name": "Enter your PTO balance", "text": "Input how many PTO/annual leave days you have available." },
    { "name": "Hit Optimize", "text": "The algorithm finds every efficient vacation window, ranked by days-off-per-PTO-day ratio." },
    { "name": "Book your time off", "text": "Use the results to request PTO from your employer for the most efficient windows." }
  ]
}

STEP 3: Add Dataset schema to the homepage:

{
  "@type": "Dataset",
  "name": "2026 PTO Efficiency Data",
  "description": "Public holiday bridge day analysis for US and Korean workers, showing optimal PTO placement strategies for maximum days off.",
  "url": "https://leavewise.app",
  "creator": { "@type": "Organization", "name": "Leavewise" }
}

STEP 4: Ensure blog post pages include the existing Article schema plus a FAQPage schema with 2-3 Q&As relevant to each post's topic.

DESIGN: FAQ section should match the existing landing page style — cream background, teal accents, Fraunces headings for questions, DM Sans for answers. Collapsible accordion format.

VERIFICATION:
Run: npm run build
Expected: Build succeeds without errors
Run: curl -s http://localhost:3000 | grep -c "FAQPage"
Expected: At least 1 match (JSON-LD is present)
```

---

## Phase 24: Seasonal Re-engagement System

> Unlike SaaS with daily use, Leavewise has natural spike moments. This phase builds a systematic re-engagement engine.

---

### M-RE-01: Annual Re-engagement Calendar + Automation Triggers

**Files created:** `docs/recurring/seasonal-reengagement-calendar.md`
**Depends on:** Email list exists, social accounts exist

#### Agent Prompt

```
You are working in the project at /Users/constantlee/PTO-optimizer.

Create the file docs/recurring/seasonal-reengagement-calendar.md with the EXACT content below.

---
BEGIN FILE CONTENT
---

# Seasonal Re-engagement Calendar

> PTO optimization is inherently seasonal. These are the 12+ annual activation moments where interest spikes. For each moment, activate ALL channels simultaneously.

## Full-Year Activation Calendar

### Q1: January-March

| Date | Trigger | US Action | KR Action | Channels |
|------|---------|-----------|-----------|----------|
| Jan 1-15 | New Year planning (BIGGEST spike) | "New year, new PTO plan" push. Refresh all 2027 content. | "2027년 연차 계획 세우셨나요?" | Email, social, Reddit, blog, ads burst |
| Jan 20 | MLK Day approaching | "MLK Day bridge: 1 PTO → 4 days" | — | Twitter, LinkedIn |
| Feb 1 | 설날 approaching (KR) | — | "설날 연차 전략 최종 정리" | Naver, Blind, KakaoTalk, ads burst |
| Feb 14 | Presidents' Day approaching | "Presidents' Day bridge" | — | Twitter, blog refresh |
| Mar 1 | 삼일절 (KR) | — | "삼일절 연차 팁" | Naver, Instagram |

### Q2: April-June

| Date | Trigger | US Action | KR Action | Channels |
|------|---------|-----------|-----------|----------|
| Mar 15 | Easter approaching | "Easter 2026: 4 PTO → 10 days" | — | All US channels, Google Ads burst |
| Apr 15 | 어린이날 approaching (KR) | — | "5월 황금연휴 최적 계획" | All KR channels, Naver Ads burst |
| May 1 | Memorial Day approaching | "Memorial Day bridge" | 부처님오신날 strategy | Twitter, LinkedIn, Reddit |
| Jun 1 | Summer planning season | "July 4th preview" | 광복절 preview | Blog, social |

### Q3: July-September

| Date | Trigger | US Action | KR Action | Channels |
|------|---------|-----------|-----------|----------|
| Jun 15 | July 4th approaching | "July 4th bridge days" | — | All US channels |
| Jul 15 | 제헌절 approaching (KR, new 2026) | — | "제헌절 대체공휴일 연차 전략" | All KR channels |
| Aug 1 | 추석 approaching (BIGGEST KR spike) | Labor Day preview | "추석 황금연휴 가이드" (TIMING ATTACK) | ALL channels, max budget |
| Aug 15 | 광복절 (KR) | — | "광복절 연차 활용" | Naver, Blind |
| Sep 1 | Year-end planning begins | "Q4 PTO planning starts NOW" | 추석 final push | Email, LinkedIn, blog |

### Q4: October-December

| Date | Trigger | US Action | KR Action | Channels |
|------|---------|-----------|-----------|----------|
| Sep 15 | 개천절/한글날 (KR) | Columbus Day preview | "10월 메가 연휴" | KR channels |
| Oct 1 | "Use it or lose it" season | "You have PTO left" urgency post | "남은 연차 활용법" | All channels, email blast |
| Oct 15 | Thanksgiving approaching | "Thanksgiving bridge" | — | All US channels |
| Nov 1 | Veterans Day + Thanksgiving combo | Full optimization push | — | Blog, Reddit, LinkedIn |
| Nov 15 | Christmas/NY approaching | "Christmas-NYE: 3 PTO → 10 days" | "크리스마스 연차 전략" | All channels |
| Dec 1 | Next year planning begins | "2027 PTO plans are ready" | "2027년 연차 미리 계획" | All channels |

## Activation Playbook (For Each Spike)

When a spike date approaches, execute ALL of the following within 1 week:

1. **Email blast** to subscriber list (holiday-specific, from nurture sequence)
2. **Social post** on all active accounts (Twitter, LinkedIn, Instagram)
3. **Blog post** refresh — update the relevant holiday post with current year
4. **Community post** on Reddit/Blind/에브리타임 (if >14 days since last post)
5. **Paid ads burst** — increase Google/Naver Ads budget for 2 weeks
6. **Infographic** — share holiday-specific visual on KakaoTalk, Instagram Stories
7. **Partner notification** — ping any active partnerships about the upcoming window

## Automated Triggers (OpenClaw Recurring)

Create OpenClaw recurring prompts that fire 4 weeks before each spike:
- Generate the holiday-specific social copy for all platforms
- Draft the email blast
- Update the blog post with any new data
- Create the KakaoTalk-optimized infographic brief
- Draft the community post

## Success Targets
- 100% activation rate (every spike gets a multi-channel push)
- Email open rate >30% on holiday-timed sends
- 2x traffic vs baseline week during each spike
- Year-over-year growth in spike traffic (2026 vs 2027)

---
END FILE CONTENT
---

VERIFICATION:
Run: ls docs/recurring/seasonal-reengagement-calendar.md
Expected: File exists
```

---

## Enhanced Recurring Task Calendar (Updated Master Schedule)

| Frequency | Task | Section Ref | Output |
|-----------|------|-------------|--------|
| Weekly (Mon) | Affiliate link health check | M-MON-01 | docs/reports/link-health/ |
| Monthly (1st) | SEO audit | M-SEO-01 | docs/reports/seo/ |
| Monthly (1st) | Affiliate revenue report | M-MON-02 | docs/reports/affiliate/ |
| Monthly (1st) | "Window of the month" social post | M-XM-01 | Twitter + Instagram + LinkedIn |
| Monthly (1st) | Competitive intelligence check | M-CI-01 | docs/reports/competitive/ |
| Monthly (1st) | LinkedIn post (new) | M-LI-01 | LinkedIn |
| Monthly (15th) | HARO/Connectively monitoring | M-PR-01 | Journalist responses |
| Biweekly | Blog post (EN or KR, alternating) | Phase 4-8 | /blog or Naver Blog |
| Biweekly | 지식iN Q&A answers (new) | M-KR-08 | Naver 지식iN |
| Quarterly | Content refresh | M-SEO-02 | docs/reports/content-refresh/ |
| 4 weeks before spike | Seasonal activation (ALL channels) | M-RE-01 | Multi-channel push |
| As needed | Community engagement | Various | Reddit/Blind/LinkedIn/뽐뿌/클리앙 |

---

## Updated Success Metrics Dashboard

| Metric | Month 3 Target | Month 6 Target | Month 12 Target | Data Source |
|--------|---------------|---------------|----------------|-------------|
| MAU | 2,500 | 10,000 | 50,000 | GA4 |
| Organic search clicks/mo | 500 | 5,000 | 25,000 | Search Console + Naver |
| Blog posts published | 6 | 15 | 30 | Content inventory |
| Programmatic SEO pages | 24 | 48 | 96 | Holiday pages |
| Naver Blog views/mo | 200 | 2,000 | 8,000 | Naver Blog stats |
| Email subscribers | 100 | 1,000 | 5,000 | Resend dashboard |
| Affiliate clicks/mo | 0 | 750 | 5,000 | Travelpayouts |
| Affiliate revenue/mo | $0 | $1,000 | $8,000 | Travelpayouts |
| LinkedIn impressions/mo | 5,000 | 50,000 | 200,000 | LinkedIn analytics |
| Share cards generated | 0 | 500 | 3,000 | Internal analytics |
| Media mentions | 0 | 2 | 6 | PR tracking |
| Social media followers | 100 | 500 | 3,000 | All platforms |
| Korean platform traffic/mo | 200 | 3,000 | 15,000 | UTM tracking |

---

## Viral Growth Priority Order (Implementation Sequence)

Execute these in order. Each builds on the previous:

| # | Task | Why First | Effort | Impact |
|---|------|-----------|--------|--------|
| 1 | Shareable Results Card (M-VL-01) | Turns every user into a distributor | Medium | Very High |
| 2 | Screenshot-Worthy Design (M-VL-03) | Free UGC engine | Low | High |
| 3 | LinkedIn Content (M-LI-01) | Biggest untapped channel | Low | High |
| 4 | HN "Show HN" (M-HN-01) | 20K+ visits in 24 hours | Low | High (spike) |
| 5 | Programmatic SEO Pages (M-PSEO-01) | Long-tail traffic at scale | Medium | Very High (long-term) |
| 6 | 지식iN Q&A (M-KR-08) | Naver SEO + AI search | Low | High (Korea) |
| 7 | Korean Community Expansion (M-KR-09) | 에브리타임, 뽐뿌, 클리앙 | Low | Medium-High |
| 8 | Data-Driven PR (M-PR-01) | Media multiplier | Medium | High (if picked up) |
| 9 | Google Ads Micro-Budget (M-ADS-01) | Consistent high-intent traffic | Low | Medium |
| 10 | Challenge-a-Coworker (M-VL-02) | Workplace viral loop | Medium | High |
| 11 | AEO / Structured Data (M-AEO-01) | AI search citations | Medium | High (long-term) |
| 12 | Partnerships (M-PART-01) | Distribution through established audiences | Medium | High |
| 13 | Seasonal System (M-RE-01) | Automates all future spikes | Low | Very High (compounding) |
| 14 | Indie Hackers (M-HN-02) | Community + long-tail traffic | Low | Medium |

---

## Additional SEO Keyword Targets (Expanded)

**USA (New additions):**
- "best days to take off 2026" | "PTO calculator" | "PTO optimizer"
- "how to get more days off" | "long weekends 2026 USA"
- "[holiday] 2026 days off" (for every holiday)
- "PTO hack" | "vacation hack 2026"

**Korea (New additions):**
- "연차 계산기" | "연차 최적 날짜" | "2026 대체공휴일 정리"
- "신입사원 연차 팁" | "연차 미사용 보상" | "직장인 여행 꿀팁"
- "[holiday Korean] 연차 며칠" (for every holiday)

**AI Search / AEO targets:**
- "how many days off can I get with 15 PTO days"
- "best PTO strategy for 2026"
- "연차 15일로 며칠 쉴 수 있나요"
- "what are bridge days PTO"
