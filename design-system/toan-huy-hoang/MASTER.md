# Design System Master File — Toan Huy Hoang

> **LOGIC:** When building a specific page, first check `design-system/toan-huy-hoang/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file. Otherwise follow the rules below.
>
> **HARD OVERRIDE NOTICE:** The locked brand constraints in this file override any generic
> output from the generator. Palette and mood are non-negotiable. No em dashes anywhere.

**Project:** Toan Huy Hoang Luxury Real Estate (Da Nang, Vietnam)
**Category:** Luxury brand experience that happens to sell property. Reference: Aman, Six Senses, Apple, Architectural Digest, private wealth firms.
**Emotional read on landing:** luxury, trust, nature, opportunity, exclusivity, restraint.

---

## Brand North Star

Luxury comes from restraint. Large whitespace, minimal clutter, strong hierarchy, massive
confident headlines, minimal body text. Dark, cinematic, sophisticated, confident throughout.
The site should make a visitor think: "these people understand Da Nang, and I trust them."

This is NOT a real estate template, NOT a property listing grid, NOT a generic agency.

---

## Color Palette (LOCKED, non-negotiable)

Slate-teal dark family + a single cream light surface + gold. (Supersedes the
former emerald-green palette per the Da Nang homepage handoff.)

| Role | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Primary background | `#0D1A24` | `--bg` | Deep slate-teal. Default canvas, hero/scrim base. |
| Secondary background | `#1C2630` | `--bg-2` | Slate. Section bands, also the ink color on cream. |
| Cards / footer | `#243441` | `--card` | Lifted slate. Cards and the footer surface. |
| Accent gold | `#C9A24B` | `--gold` | Eyebrows, hairlines, hover, accents on dark. |
| Brighter gold | `#D8AF5B` | `--gold-2` | Footer accents, solid gold button fill. |
| Gold on light | `#B98F3E` | `--gold-ink` | Gold for eyebrows/accents over cream. |
| Cream surface | `#F4EFE6` | `--cream` | The one light section (Meet Toan). |
| Cream ink / muted / faint | `#1C2630` / `#3A4651` / `#6B7682` | `--cream-text` / `--cream-muted` / `--cream-faint` | Text tiers on cream. |
| Text | `#F4F4F1` | `--text` | Warm off-white on dark. |
| Text muted | `rgba(244,244,241,0.74)` | `--text-muted` | Body, captions on dark. |
| Hairline | `rgba(201,162,75,0.24)` | `--line` | Fine gold dividers. |

**Rules:**
- Darks stay deep slate-teal, never emerald, never pure black. The base is `#0D1A24`.
- Mostly dark, with cream used deliberately as a single tonal break (the Meet Toan section). The footer is slate, never black.
- Gold is primarily an accent (eyebrow, hairline, hover) but MAY be a solid fill on calm surfaces: the footer "Book a Consultation" button and the slate "Get in Touch" button. Keep gold fills rare and intentional.
- Frosted glass (`rgba(255,255,255,.12–.14)` + blur) for surfaces over photography (hero CTAs, Son Tra listing card).

---

## Typography

- **Heading font:** Cormorant Garamond (high-contrast editorial serif, refined, expensive). Weights 400/500/600.
- **Body / UI font:** Jost (geometric grotesque, clean, modern). Weights 300/400/500.
- **Mood:** real estate, luxury, elegant, sophisticated, editorial, premium.

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500&display=swap');
```

### Type Scale (fluid, expensive, generous)

| Token | clamp() | Use |
|-------|---------|-----|
| `--fs-eyebrow` | `0.75rem` (12px), tracking `0.32em`, uppercase | Eyebrows, labels |
| `--fs-body` | `clamp(1rem, 0.95rem + 0.3vw, 1.125rem)` | Body |
| `--fs-lead` | `clamp(1.125rem, 1rem + 0.6vw, 1.375rem)` | Subheads, leads |
| `--fs-h3` | `clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem)` | Card / section titles |
| `--fs-h2` | `clamp(2.25rem, 1.6rem + 3vw, 4rem)` | Section headlines |
| `--fs-h1` | `clamp(3rem, 2rem + 6vw, 7.5rem)` | Hero headline |

**Hierarchy intent (pressure-tested):** One dominant element per view. Hero headline is set in
Cormorant Garamond, very large, tight leading (0.96–1.02), with a hair of positive tracking
(0.01em). Body is Jost 300/400 at relaxed leading (1.7) and short measure (max 60ch). Eyebrows are
gold, uppercase, wide-tracked, small. The contrast between a tall high-contrast serif headline and a
quiet geometric sans body is the signature. Never let two large elements compete.

- Heading line-height: `0.96`–`1.1`. Body line-height: `1.6`–`1.75`.
- Body measure: 45–60ch desktop, 35–55ch mobile.
- Font preload the Cormorant Garamond heading font. `font-display: swap`.

---

## Spacing Rhythm (generous)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight |
| `--space-2` | `8px` | Inline |
| `--space-3` | `16px` | Standard |
| `--space-4` | `24px` | Group |
| `--space-5` | `40px` | Block |
| `--space-6` | `64px` | Sub-section |
| `--space-7` | `96px` | Section padding (mobile) |
| `--space-8` | `160px` | Section padding (desktop) |

Sections breathe. Vertical section padding is large (`--space-7` mobile, `--space-8` desktop).
Container max width `1320px`, gutters `24px` mobile / `48px`+ desktop.

---

## Effect Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `2px` | Restrained. Near-square. Luxury is not rounded. |
| `--radius-media` | `4px` | Images. |
| `--blur-glass` | `blur(16px) saturate(120%)` | Scrolled nav glass only. |
| `--elev-card` | `0 24px 60px -24px rgba(0,0,0,0.7)` | Featured media lift, subtle. |
| `--ring` | `0 0 0 2px rgba(199,169,107,0.7)` | Focus ring (gold). |

Shadows are deep and soft, never harsh. Elevation is used sparingly on featured media only.

---

## Motion System

- GSAP + ScrollTrigger for the signature scroll cinema and section reveals.
- Micro-interactions 150–300ms. Ease-out on enter, ease-in on exit. Never linear.
- Animate `transform` and `opacity` only.
- One or two key elements animate per view, never everything at once.
- Subtle. No flashy parallax, no gimmicks. Motion communicates luxury and intent.
- Respect `prefers-reduced-motion` everywhere: collapse the cinema to one static hero still,
  disable reveals, show content immediately.

---

## Component Specs

### Buttons
Restrained, rectangular, hairline-led. Gold is a hairline or text accent, never a fill.

```css
/* Primary: solid warm off-white text on a hairline gold outline over dark */
.btn-primary {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--gold);
  padding: 16px 32px;
  border-radius: var(--radius);
  font-family: 'Jost', sans-serif;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.8125rem;
  transition: background-color 220ms ease, color 220ms ease;
  cursor: pointer;
  min-height: 44px;
}
.btn-primary:hover { background: var(--gold); color: var(--bg); }
.btn-primary:focus-visible { outline: none; box-shadow: var(--ring); }

/* Ghost: text + animated underline, for secondary */
.btn-ghost {
  background: transparent; color: var(--text); border: none;
  padding: 16px 8px; letter-spacing: 0.18em; text-transform: uppercase;
  font-size: 0.8125rem; cursor: pointer; min-height: 44px;
}
```

### Cards (property feature)
Editorial, not a grid tile. Large photography, minimal overlay, generous spacing.
```css
.feature {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-media);
  overflow: hidden;
  transition: transform 260ms ease, box-shadow 260ms ease;
}
.feature:hover { transform: translateY(-4px); box-shadow: var(--elev-card); }
```

### Inputs
```css
.input {
  background: var(--bg-2); color: var(--text);
  border: 1px solid var(--line); border-radius: var(--radius);
  padding: 14px 16px; font-size: 16px; font-family: 'Jost', sans-serif;
  transition: border-color 200ms ease;
}
.input:focus { border-color: var(--gold); outline: none; box-shadow: var(--ring); }
```

### Hairline divider (signature)
```css
.hairline { height: 1px; background: var(--line); }
.hairline-gold { height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
```

---

## Iconography
- SVG icons only, Lucide set. Stroke width 1.5. Never emojis as icons.
- Icon color inherits `--text` or `--text-muted`; gold reserved for accent marks.

---

## Landing Section Structure (home)

1. Hero (full viewport, cinematic, transparent nav over it).
2. Signature scroll cinema (pinned, scroll-driven, the centerpiece). Golden Bridge through fog,
   along the bridge, into modern Da Nang coastline and skyline, gentle descent into the city.
3. Transition to founder (the city resolves into the founder reveal).
4. Founder section (portrait, stats, quote, gold signature mark).
5. Property showcase (curated editorial features, not an inventory grid).
6. Closing CTA / contact invitation.

---

## Anti-Patterns (Do NOT Use)

- No bright or saturated greens. No teal, no blue, no orange.
- No gold fills, no gold blocks, no loud gold. Gold is a hairline accent.
- No em dashes anywhere, in copy or code comments. Use periods, commas, colons, parentheses.
- No emojis as icons. SVG (Lucide) only.
- No real estate template look, no agency clutter, no postcard saturation, no touristy imagery.
- No rounded, bubbly UI. No drop-shadow-heavy cards. No decorative-only animation.
- No bright-on-bright low-contrast text.
- No horizontal scroll on mobile. Touch targets >= 44px.

---

## Pre-Delivery Checklist

- [ ] Palette matches locked tokens exactly. Gold used only as accent/hairline.
- [ ] No em dashes anywhere.
- [ ] SVG icons only (Lucide), stroke 1.5.
- [ ] One dominant element per view, generous whitespace.
- [ ] Text contrast >= 4.5:1 against dark surfaces.
- [ ] Focus states visible (gold ring), keyboard navigable.
- [ ] `prefers-reduced-motion` respected (cinema collapses to still).
- [ ] Responsive: 375 / 768 / 1024 / 1440. No horizontal scroll.
- [ ] Both EN and VI rendered and tested, not inferred.
- [ ] Hero poster / first frame is the LCP element. Cinema engine inits after.
