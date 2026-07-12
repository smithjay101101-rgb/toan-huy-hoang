# Toan Huy Hoang — Luxury Real Estate, Da Nang

Static, prerendered brand site for a Da Nang real estate agent. Four languages
(EN / VI / RU / KO), listings and guides managed in Airtable, deployed to
GitHub Pages at https://smithjay101101-rgb.github.io.

Stack: Vite + React + TypeScript + Tailwind, prerendered with vite-react-ssg.
No runtime backend: all data is fetched at build time and baked into HTML.

## How content publishing works

```
Airtable (edit + set status Published)
   -> GitHub Action "Build and deploy" (this repo)
   -> pushes built site to smithjay101101-rgb/smithjay101101-rgb.github.io
   -> GitHub Pages serves it (1 to 3 min end to end)
```

Publishing is automatic: the workflow polls Airtable **every 5 minutes** and
deploys only when content actually changed (fingerprint check), so edits go
live in roughly 5 to 8 minutes with no button pressing. Rebuilds also trigger
on every push to `main`, the Actions "Run workflow" button, and (optional,
needs Airtable's Business plan for the script action) an Airtable automation
POSTing `{"event_type":"airtable-publish"}` to the GitHub dispatches API.

### Listings (Airtable table `Listings`, base `appZ9wP5ZlerVW3z8`)

- A row appears on the site when `status = Published`. `deal_type` (Buy/Rent)
  picks the page; `category = Project` shows on the Projects page instead.
- `district` must be one of the 10 canonical names (accents and casing are
  normalized automatically). `price` may be entered in USD or VND — set the
  `currency` column accordingly; VND converts to USD at build time
  (`USD_TO_VND` in `scripts/fetch-airtable.mjs`, keep in sync with
  `src/lib/format.ts`). The site displays USD and VND.
- `code` is the property reference (e.g. TH-129), typed manually in the `code`
  column — it is NOT auto-generated. Searchable, and shown on cards + detail
  pages. Blank = the listing shows no reference.
- `slug_vi` / `slug_ru` / `slug_ko` (optional): localized URL slugs, e.g.
  `/vi/property/biet-thu-bien-non-nuoc` — keyworded URLs per language for SEO.
  Blank = that language uses the default `slug`. Values are normalized to
  lowercase-kebab automatically.
- Photos: `hero_image` (one) + `gallery` (several). Images are downloaded,
  resized into responsive variants, and **watermarked** ("TOAN HUY HOANG
  REALTY COMPANY", baked into the pixels) at build time; a listing without
  photos gets a styled placeholder.
- Languages: `title_en` + `long_desc_en` required; `_vi`, `_ru`, `_ko`
  variants optional (fall back to English). Card blurbs derive from the first
  paragraph of the long description (Markdown syntax is stripped).
- **Rich descriptions:** `long_desc_*` fields have rich text enabled — bold,
  bullet lists, links, and headings render on the site (`##` + space =
  Heading 2, `###` = Heading 3; headings can also be links:
  `## [words](/vi/property/slug)`).
- `heading2_en..ko` / `heading3_en..ko` (optional): plain-text section titles
  shown above the description — the no-Markdown way to add headings. Empty
  language cells fall back to English.
- `availability` (optional single select): `Rented` or `Sold` shows a
  localized badge in all four languages, moves the listing to the end of the
  grids, and excludes it from the homepage feature. Empty/`Available` =
  normal. To remove a listing from the site entirely, change `status`.
- `youtube_url` (optional): a YouTube link adds a "Video Tour" button on the
  listing page. Empty = no button.
- `old_url` (optional): the property's page URL on the previous website; the
  build generates a redirect from that old address to this listing (used at
  the domain cutover). Several links allowed, comma-separated.

### Guides (blog) — table `Guides`

See `AIRTABLE-GUIDES.md` for the full schema and the rebuild automation. Key
rule: a guide builds for a language only when both `Title_*` and `Body_*` are
filled, so no thin translated pages ever exist. `Body_*` fields are rich
text (same `##`/`###` heading rules as listings); `Old_URL` (optional) holds
the article's address on the previous website for the cutover redirects.

## Configuration that may need updating

| What | Where |
|---|---|
| Phone numbers / channels per language | `CONTACTS` in `src/config/site.ts` |
| KakaoTalk Open Profile link (client must create the profile in-app, handle `danangluxury`) | `KAKAO_CHANNEL_URL` in `src/config/site.ts` |
| YouTube channel | `YOUTUBE_URL` in `src/config/site.ts` |
| Old-site redirects not tied to a row (category pages etc.) | `scripts/redirects.json` |
| Telegram username | `TELEGRAM_USERNAME` in `src/config/site.ts` |
| USD to VND display rate | `USD_TO_VND` in `src/lib/format.ts` |
| Office address wording | `contact.officeValue` + `footer.officeValue` in `src/i18n/locales/*` |
| Live domain (when a custom domain is bought) | `SITE_URL` env in `.github/workflows/deploy.yml` (drives canonical, OG, sitemap, robots) |

## Repo secrets (Settings > Secrets and variables > Actions)

- `AIRTABLE_API_KEY` — read-only Airtable PAT (`data.records:read`, `schema.bases:read`)
- `DEPLOY_TOKEN` — GitHub PAT with `repo` scope, pushes the built site to the live repo

## Local development

```bash
npm install
npm run dev          # dev server at localhost:5173 (placeholder data)
npm run build        # full static build into dist/ (uses Airtable if env set)
npm run typecheck
```

Without Airtable env vars the build writes tasteful mock listings and guides,
so everything runs locally with no secrets.

## Troubleshooting

- **Site not updating after a green deploy:** GitHub Pages' own publisher on
  the live repo occasionally wedges ("Deployment failed, try again later").
  Re-run the failed "pages build and deployment" job in the live repo's
  Actions tab, or force a build:
  `gh api -X POST repos/smithjay101101-rgb/smithjay101101-rgb.github.io/pages/builds`
- **A listing vanished:** check its `status` and the Action logs. A broken
  photo attachment skips only that image; a malformed row skips that row and
  logs the record id. The rest of the catalog always builds.
