# Toan Huy Hoang. Luxury Real Estate, Da Nang.

A dark, cinematic luxury brand site that happens to sell property. Built custom:
Vite + React + TypeScript + Tailwind, statically prerendered to crawlable HTML with
`vite-react-ssg`, bilingual EN and VI, GSAP scroll motion, Airtable at build time,
deployed to Cloudflare Pages.

## Commands

```bash
npm install
npm run dev        # local dev (uses existing data + placeholders)
npm run build      # fetch data, generate sitemap, prerender every page to dist/
npm run preview    # serve the built dist/
npm run typecheck  # tsc --noEmit
```

## Design DNA

The locked design system lives in `design-system/toan-huy-hoang/MASTER.md` with per page
overrides under `pages/`. Palette and mood are non-negotiable (deep slate-teal darks, a single
cream tonal-break section, gold accents with rare intentional gold fills, Cormorant Garamond +
Jost, generous whitespace, no em dashes).

## Architecture

- Routing and locales: `src/routes.tsx`. Path-prefixed locales (`/en`, `/vi`), root
  redirects to `/en` at the Cloudflare edge (`public/_redirects`). One prerendered detail
  page per published listing per locale.
- Copy: `src/i18n/locales/en.ts` and `vi.ts`. Both languages fully written, not inferred.
- Data: pulled at build by `scripts/fetch-airtable.mjs` into `src/data/listings.json`.
  With Airtable credentials it downloads attachments and optimizes them to AVIF + WebP
  (no runtime hotlinking). Without credentials it writes tasteful placeholders.
- SEO: `src/components/Seo.tsx` (title, description, OG, canonical, full hreflang set),
  `src/lib/schema.ts` (RealEstateAgent, Organization, RealEstateListing, Residence,
  BreadcrumbList, FAQPage). Sitemap by `scripts/gen-sitemap.mjs`, `public/robots.txt`.
- Motion: `src/lib/motion.ts`, `src/components/Reveal.tsx`, and the centerpiece
  `src/components/ScrollCinema.tsx`. All respect `prefers-reduced-motion`.

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables (never commit): `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`,
  `AIRTABLE_TABLE_LISTINGS`, `AIRTABLE_TABLE_PROJECTS`, and optionally `SITE_URL`.
- Publish flow: an Airtable automation calls a Pages deploy hook when a listing is set to
  Published. A one to two minute lag from publish to live is expected.

## Airtable Listings fields

`title_en`, `title_vi`, `slug`, `status` (Draft or Published), `deal_type` (Buy or Rent),
`category` (Villa, Apartment, Land, Project), `district`, `price`, `currency`, `bedrooms`,
`bathrooms`, `area_m2`, `short_desc_en`, `short_desc_vi`, `long_desc_en`, `long_desc_vi`,
`hero_image` (attachment), `gallery` (attachments), `lat`, `lng`, `featured` (checkbox),
`date_published`. Only `status = Published` is fetched.

## Swap points (placeholders to replace before launch)

These are clearly marked in code with the word SWAP:

1. Cinematic source for the scroll cinema. The site ships with a stills crossfade fallback
   (`public/placeholders/cinema-*.svg`). When the Higgsfield clip is exported as a frame
   sequence, pass `sequence={{ count, src: (i) => ... }}` to `ScrollCinema` in
   `src/pages/Home.tsx`. The canvas image-sequence path is already implemented behind the
   same component API. Asset spec is in the build brief.
2. Founder portrait: `public/placeholders/founder.svg`.
3. Hero still: `public/placeholders/hero.svg` (the LCP element).
4. Real contact details and Zalo number: `src/config/site.ts`.
5. Production domain: `SITE.url` in `src/config/site.ts` and `SITE_URL` env for the sitemap.
6. Contact form endpoint: `src/pages/Contact.tsx` (currently captures intent locally; wire
   a Cloudflare Pages Function or form service).
7. OG image: `public/og/og-default.jpg` (referenced by `SITE.ogImage`).

## Verified

- Static build emits crawlable HTML for all 6 pages plus every listing, in both locales.
- hreflang alternates (en, vi, x-default), canonical, OG, and JSON-LD present per page.
- `sitemap.xml` (28 URLs) and `robots.txt` shipped. Single `<title>` per page.
- EN and VI both render. `prefers-reduced-motion` collapses the cinema to a static still.
- `tsc --noEmit` clean.
