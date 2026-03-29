# Leavewise Design Language

A comprehensive reference for visual design decisions across the Leavewise brand. Every component, graphic, and piece of content should feel like it belongs to the same hand.

---

## 1. Brand Voice & Aesthetic

**Personality:** Confident, calm, trustworthy. Leavewise helps people make smarter decisions about their time off — the design should feel like advice from a well-organized friend, not a corporate HR tool.

**Visual tone:** Warm minimalism. Clean layouts with generous whitespace. Nothing flashy, nothing cold. Every element earns its space.

**Key principles:**
- Clarity over cleverness — if it doesn't communicate instantly, simplify it
- Warmth over sterility — cream backgrounds, serif headings, rounded corners
- Restraint over decoration — fewer elements, more breathing room

---

## 2. Typography

### Font Stack

| Role | Family | Source | Fallback |
|------|--------|--------|----------|
| Display | **Fraunces** (variable, optical sizing) | Google Fonts | Georgia, serif |
| Body | **DM Sans** (400, 500) | Google Fonts | system-ui, sans-serif |

### Usage Rules

- **Fraunces** is reserved for headings (h1–h3), card titles, and any text that anchors a section. Never use it for body copy or UI labels.
- **DM Sans** handles everything else: body text, buttons, captions, metadata, navigation.
- Font smoothing is always on: `-webkit-font-smoothing: antialiased`.

### Type Scale

| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| Page title (h1) | 36–48px (`text-4xl` / `text-5xl`) | 600 (semibold) | Tight (`leading-tight`) |
| Section heading (h2) | 30–36px (`text-3xl` / `text-4xl`) | 600 | Tight |
| Subsection (h3) | 24px (`text-2xl`) | 600 | Default |
| Body | 14–16px (`text-sm` / `text-base`) | 400 | Default |
| Large body | 18px (`text-lg`) | 400 | Default |
| Caption / label | 12px (`text-xs`) | 600 | Wide (`tracking-wide`, uppercase) |
| Micro text | 10–11px (`text-[10px]` / `text-[11px]`) | 500–600 | Default |

### In SVG Graphics

- Headings: `font-family="Georgia, serif"` (approximates Fraunces in SVG context)
- Body/labels: `font-family="system-ui, sans-serif"` (approximates DM Sans)
- Never use generic `sans-serif` alone — always include `system-ui` first
- Minimum legible text in graphics: **10px** at intended display size
- Prefer `font-weight="600"` or `"700"` for labels that must read at small sizes

---

## 3. Color Palette

### Primary

| Token | Hex | Role |
|-------|-----|------|
| `teal` | `#1A6363` | Primary action, links, PTO days, brand anchor |
| `teal-hover` | `#144F4F` | Hover/active state for teal |
| `teal-light` | `#E8F3F3` | Teal tinted background |

### Accent

| Token | Hex | Role |
|-------|-----|------|
| `coral` | `#D95740` | Highlight, urgency, holidays, selection |
| `coral-light` | `#FEF0ED` | Coral tinted background |
| `coral-muted` | `#F2A897` | Soft coral for decorative use |
| `sage` | `#4A7C5E` | Success, holidays, positive states |
| `sage-light` | `#EEF6F1` | Sage tinted background |
| `amber` | `#C4872A` | Warnings, company holidays |
| `amber-light` | `#FDF4E7` | Amber tinted background |

### Neutral

| Token | Hex | Role |
|-------|-----|------|
| `cream` | `#F7F6F2` | Page background, default surface |
| `cream-dark` | `#EEECEA` | Subtle background variant, weekends |
| `white` | `#FFFFFF` | Card surfaces |
| `ink` | `#1C1917` | Primary text |
| `ink-soft` | `#44403C` | Secondary text |
| `ink-muted` | `#78716C` | Tertiary text, placeholders |
| `stone-warm` | `#C6C1B9` | Disabled, weekends |
| `border` | `#E5E2DA` | Borders, dividers |

### Color Rules

- **Never use pure black** (`#000`) for text — use `ink` (`#1C1917`)
- **Never use pure white** (`#FFF`) for backgrounds — use `cream` (`#F7F6F2`)
- **Tinted backgrounds** (teal-light, coral-light, etc.) are for emphasis zones, not general backgrounds
- **Opacity overlays** for subtle tints: `teal/5`, `teal/10`, `teal/15` — never exceed `/20` for background tints
- **No purple.** Under any circumstances, unless explicitly specified in the prompt.

---

## 4. Spacing System

### Base Unit

The spacing system is built on a **4px base** (Tailwind default). The primary rhythm is **24px** (`px-6`) for horizontal page padding.

### Spacing Scale

| Value | Pixels | Common Use |
|-------|--------|------------|
| `1` | 4px | Tight gaps (icon + label) |
| `1.5` | 6px | Grid cell gaps |
| `2` | 8px | Inline spacing, small gaps |
| `3` | 12px | Compact card padding |
| `4` | 16px | Standard card padding, component gaps |
| `5` | 20px | Card padding, comfortable gaps |
| `6` | 24px | **Page horizontal padding**, section gaps |
| `8` | 32px | Section separator, header bottom margin |
| `10` | 40px | Large card padding (desktop) |
| `12` | 48px | Section vertical padding (mobile) |
| `16` | 64px | Section vertical padding (desktop) |
| `20` | 80px | Major section spacing |
| `24` | 96px | Hero bottom padding, maximum spacing |

### Spacing Principles

- **Horizontal page padding** is always `px-6` (24px). No exceptions.
- **Section vertical spacing** follows a `py-12` (mobile) → `py-16` to `py-20` (desktop) pattern.
- **Cards** use `p-5` (20px) or `p-6` (24px) internal padding. Never less than `p-4` (16px).
- **Between sibling cards:** `gap-4` (16px) minimum.
- **Whitespace is a feature.** When in doubt, add more space, not less.

---

## 5. Border Radius

| Value | Pixels | Use |
|-------|--------|-----|
| `rounded-md` | 6px | Small UI elements, calendar cells |
| `rounded-lg` | 8px | Buttons, tags, small interactive elements |
| `rounded-xl` | 12px | Input fields, secondary cards, badges |
| `rounded-2xl` | 16px | Primary cards, containers, CTA boxes |
| `rounded-3xl` | 24px | Hero sections, large containers |
| `rounded-full` | 50% | Badges, pills, circular elements |

### Rules

- Cards always use `rounded-xl` (12px) or `rounded-2xl` (16px) — never sharp corners.
- Buttons use `rounded-xl` (12px).
- SVG graphics use `rx="12"` to `rx="16"` for containers, `rx="8"` for inner elements.
- Nested elements should have a **smaller** radius than their parent to avoid visual tension.

---

## 6. Cards & Containers

### Standard Card

```
Background:  white
Border:      1px solid border (#E5E2DA)
Radius:      rounded-2xl (16px)
Padding:     p-5 (20px) or p-6 (24px)
Shadow:      none by default, shadow-md on hover
```

### Accent Card (left border)

```
Same as standard, plus:
Border-left: 4px solid [accent color]
```

### Emphasized Container

```
Background:  teal/5 or accent-light
Border:      1px solid teal/15
Radius:      rounded-2xl (16px)
Padding:     p-6 (mobile) → p-8 (desktop)
```

### Dark Container (CTA)

```
Background:  teal (#1A6363)
Text:        white
Radius:      rounded-2xl (16px)
Padding:     p-8 → p-10
```

---

## 7. Buttons

### Primary

```
Background:   teal (#1A6363)
Text:         white, font-semibold, text-sm (14px)
Padding:      px-6 py-3 (24px x 12px) to px-7 py-3.5
Radius:       rounded-xl (12px)
Hover:        teal-hover (#144F4F)
Transition:   transition-colors
```

### Secondary

```
Background:   cream or white
Border:       1px solid border
Text:         ink-soft, font-medium, text-sm
Padding:      px-4 py-2 to px-5 py-2.5
Radius:       rounded-lg (8px) or rounded-xl (12px)
Hover:        border-teal/40, text-teal
```

---

## 8. Shadows & Elevation

Leavewise is intentionally **flat**. Shadows are used only for interactive feedback, never for static depth.

| Level | Shadow | Use |
|-------|--------|-----|
| Rest | none | Default card state |
| Hover | `shadow-md` | Cards on hover, interactive elements |
| Focus | `ring-2 ring-teal/30` | Keyboard focus indicator |
| Elevated | `shadow-lg` | Dropdowns, modals (rare) |

---

## 9. Blog & Prose Content

### Container

- Max-width: `max-w-3xl` (article column), within `max-w-6xl` page container
- Horizontal padding: `px-6`
- Vertical padding: `py-12` (mobile) → `py-16` (desktop)

### Prose Styling

```
prose prose-stone max-w-none
prose-headings:font-display
prose-a:text-teal prose-a:no-underline hover:prose-a:underline
```

### Blog Post Header

- Date: 12px, uppercase, semibold, wide tracking, `ink-muted`
- Title: Fraunces, 30–36px, semibold, tight leading, 8px below date

---

## 10. SVG & Inline Graphics

This section governs all visual assets created for blog posts and marketing content.

### File Optimization

- Remove all unnecessary attributes (`xmlns:xlink`, editor metadata, empty groups)
- Use `fill="none"` on root `<svg>` only when the graphic has no background
- Combine overlapping shapes where possible
- Use `opacity` on elements rather than creating near-identical colors
- Prefer `<rect>`, `<circle>`, `<path>` over `<polygon>` or `<line>` for consistency
- Target: **under 4KB** per graphic for simple illustrations, **under 8KB** for complex ones
- Always set `viewBox` — never use fixed `width`/`height` on the root element (let CSS control sizing)

### Dimensions & Aspect Ratios

| Graphic Type | Recommended viewBox | Aspect Ratio |
|-------------|---------------------|--------------|
| Full-width banner | `0 0 800 140–200` | ~4:1 to 6:1 |
| Calendar / data visual | `0 0 800 320–400` | ~2:1 to 2.5:1 |
| Card grid | `0 0 800 200–260` | ~3:1 to 4:1 |
| Inline icon / spot | `0 0 48 48` | 1:1 |

### Internal Spacing

SVG graphics must feel integrated with the blog's prose typography. Apply generous internal spacing:

- **Outer padding:** Minimum 24px (`24` units in viewBox) on all sides from content to SVG edge
- **Inner element gaps:** Minimum 12px between distinct content blocks
- **Text-to-edge clearance:** Minimum 16px from any text to the nearest container edge
- **Between label and data:** 8–12px vertical gap
- **Card-to-card gap:** 16px minimum in multi-card layouts
- **Section dividers:** Use 1px lines with `border` color (`#E5E2DA`) and 16px vertical margin

### Color Usage in SVGs

- Use the exact hex values from the palette — no approximations
- Background fills: `#F7F6F2` (cream) for light containers, `#1A6363` (teal) for dark
- Text on cream: `#1C1917` (ink) for headings, `#44403C` (ink-soft) for body, `#78716C` (ink-muted) for secondary
- Text on teal: `#FFFFFF` for primary, `rgba(255,255,255,0.7–0.8)` for secondary
- Decorative elements: use palette colors at 30–60% opacity for lightness without introducing new colors
- Icon fills: use semantic color at 50–60% opacity for a softer, illustrative feel

### Rounded Corners in SVGs

- Outer container: `rx="16"` (matches `rounded-2xl`)
- Inner cards: `rx="12"` (matches `rounded-xl`)
- Small elements (badges, pills): `rx="6"` to `rx="8"`
- Nested elements always use a smaller radius than their parent

### Typography in SVGs

- Heading text: `font-family="Georgia, serif"`, `font-weight="700"` or `"600"`
- Body text: `font-family="system-ui, sans-serif"`, `font-weight="400"` or `"500"`
- Label text: `font-family="system-ui, sans-serif"`, `font-weight="600"`
- Always use `text-anchor="middle"` for centered text — avoid manual x-offset calculations
- Line height: approximate with 16–18px vertical spacing between text lines

### Iconography in SVGs

- Icons are **illustrative**, not literal — simplified shapes that suggest rather than depict
- Use 2–4 basic shapes maximum per icon (circles, paths, rects)
- Keep icons at 30–50px visual size within the graphic
- Apply accent color at 40–60% opacity for softness
- No outlines/strokes on icons — fill only

### Containment & Alignment (Critical)

Every visual element must stay fully within its parent container. No clipping, no bleeding.

**Bounding box verification:** Before finalizing any SVG icon or decorative element placed inside a container (e.g., a card header), manually verify that every point of the element — including radii, stroke widths, and negative coordinate offsets — falls within the parent's bounds.

- Calculate the **absolute extent** of every shape: `translate_y + local_cy - radius` for the top, `translate_y + local_cy + radius` for the bottom. Same for x.
- Add a **minimum 8px inset** from the parent container edge on all sides (the "safe zone"). No shape should enter this inset.
- For a card header zone of height `H` starting at `y_start`, the safe zone is `y_start + 8` to `y_start + H - 8`.

**Vertical centering of icons within card headers:**

Given a header zone from `y_start` to `y_start + H`:
1. Determine the icon's local bounding box: `local_top` to `local_bottom` (including radii)
2. Icon height = `local_bottom - local_top`
3. Icon visual center = `(local_top + local_bottom) / 2`
4. Target center = `y_start + H / 2`
5. `translate_y` = `target_center - icon_visual_center`
6. Verify: `translate_y + local_top >= y_start + 8` and `translate_y + local_bottom <= y_start + H - 8`

**Multi-card icon consistency:**

When a row of cards each contains an icon, all icons must:
- Share the same `translate_y` calculation method (centered in the header)
- Have a consistent visual weight (similar total bounding area, +-20%)
- Sit at the same optical center line — check by eye after calculation, since irregular shapes (like a palm tree) may need 2–4px nudge to *feel* centered even when mathematically centered

**Common mistakes to avoid:**
- Circles with negative `cy` values that extend above the translate origin — always add the radius to check the absolute top
- Stroke widths that extend beyond the fill boundary — a 2px stroke adds 1px in each direction
- Path commands with coordinates outside the expected local bounds — trace the path mentally or compute min/max

### Responsiveness

SVGs are fluid by default (no fixed width/height on root element). The blog prose container handles sizing. In prose context:

- Images render at 100% width of the prose column
- Alt text is mandatory and should describe the **content and purpose**, not the visual style
- Format: `![Descriptive alt text explaining the data shown](/blog/filename.svg)`

---

## 11. Responsive Design

### Breakpoints

| Name | Width | Purpose |
|------|-------|---------|
| `sm` | 640px | Small tablets, landscape phones |
| `md` | 768px | Tablets, primary layout shift |
| `lg` | 1024px | Desktop, sidebar visibility |
| `xl` | 1280px | Wide desktop |

### Mobile-First Rules

- Default styles target mobile (< 640px)
- Touch targets: minimum 36x36px on `pointer: coarse` devices
- Page padding: always `px-6` (never tighter on mobile)
- Single column by default; multi-column only at `md` or `lg`

---

## 12. Accessibility

- All interactive elements have visible focus states (`ring-2 ring-teal/30`)
- Color is never the only means of conveying information
- Text contrast meets WCAG AA against its background
- Images and SVGs always carry descriptive `alt` text
- Reduced motion: `prefers-reduced-motion` disables animations
- Safe area insets respected for notched devices

---

## 13. Anti-Patterns

Things that do **not** belong in Leavewise designs:

- Gradients (unless serving an explicit, justified purpose)
- Drop shadows on static elements
- Pure black (`#000`) or pure white (`#FFF`) as primary colors
- Purple in any form
- Stock photography or generic placeholder imagery
- Overly decorative icons or illustrations
- Tight spacing that makes content feel cramped
- Text smaller than 10px at intended display size
- More than 3 accent colors in a single view
