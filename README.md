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

Rebuilds trigger on: every push to `main`, the Actions "Run workflow" button,
or an Airtable automation POSTing `{"event_type":"airtable-publish"}` to the
GitHub dispatches API (see `AIRTABLE-GUIDES.md` for the copy-paste script).

### Listings (Airtable table `Listings`, base `appZ9wP5ZlerVW3z8`)

- A row appears on the site when `status = Published`. `deal_type` (Buy/Rent)
  picks the page; `category = Project` shows on the Projects page instead.
- `district` must be one of the 11 canonical names (accents and casing are
  normalized automatically). `price` is USD; the site displays USD and VND.
- `code` is optional: blank rows get a stable auto-generated TH-nnn; a typed
  code wins. Codes are searchable and shown on cards and detail pages.
- Photos: `hero_image` (one) + `gallery` (several). Images are downloaded and
  optimized at build time; a listing without photos gets a styled placeholder.
- Languages: `title_en` + `long_desc_en` required; `_vi`, `_ru`, `_ko`
  variants optional (fall back to English). Card blurbs derive from the first
  paragraph of the long description.

**When real photos are uploaded:** remove the `FAKE_IMAGES: '1'` line from
`.github/workflows/deploy.yml` (it currently substitutes brand photos).

### Guides (blog) — table `Guides`

See `AIRTABLE-GUIDES.md` for the full schema and the rebuild automation. Key
rule: a guide builds for a language only when both `Title_*` and `Body_*` are
filled, so no thin translated pages ever exist.

## Configuration that may need updating

| What | Where |
|---|---|
| Phone numbers / channels per language | `CONTACTS` in `src/config/site.ts` |
| KakaoTalk link (currently falls back to a call + shows the ID) | `KAKAO_CHANNEL_URL` in `src/config/site.ts` |
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
