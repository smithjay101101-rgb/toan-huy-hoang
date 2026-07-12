// Legacy-URL redirects for the static host. GitHub Pages cannot serve real
// 301s, so each mapping becomes a tiny prerendered page at the OLD path that
// instantly forwards to the new one (meta refresh 0 + rel=canonical — the
// same pattern the site root uses for / -> /en, and the static-host
// convention Google treats as a permanent move).
//
// Mappings come from two places:
//  1. The Airtable columns old_url (Listings/Projects) and Old_URL (Guides):
//     each row's old WordPress link redirects to that row's new page. The
//     client fills these as content is migrated — zero cutover-day work.
//  2. scripts/redirects.json, for old pages that are not a row (category
//     pages, the old contact page, …). Manual entries win on conflict.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, sep } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')

async function loadJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch {
    return fallback
  }
}

const { redirects: manual = {} } = await loadJson(join(__dirname, 'redirects.json'), {})
const listings = await loadJson(join(ROOT, 'src', 'data', 'listings.json'), [])
const guides = await loadJson(join(ROOT, 'src', 'data', 'guides.json'), [])

// Old articles/pages were Vietnamese; guides fall back to whichever locale
// exists when there is no VI version.
const auto = {}
for (const l of listings) {
  for (const p of l.oldPaths ?? []) auto[p] = `/vi/property/${l.slugs?.vi ?? l.slug}`
}
for (const g of guides) {
  const loc = g.locales?.vi ? 'vi' : g.locales?.en ? 'en' : Object.keys(g.locales ?? {})[0]
  if (!loc) continue
  for (const p of g.oldPaths ?? []) auto[p] = `/${loc}/guides/${g.slugs?.[loc] ?? g.slug}`
}

// 3. A row that gains a localized slug AFTER going live must not 404 its
//    already-indexed base URL in that locale: /vi/property/<base> forwards to
//    the localized address. Safe to write because the fetch scripts enforce
//    one global slug namespace, so no other row can own <base> in any locale.
//    These are the only redirects allowed under a locale prefix; the
//    live-route guard below exempts them (plus a shadow check on disk).
const localeAllowed = new Set()
for (const l of listings) {
  for (const [loc, s] of Object.entries(l.slugs ?? {})) {
    if (s === l.slug) continue
    const from = `/${loc}/property/${l.slug}`
    auto[from] = `/${loc}/property/${s}`
    localeAllowed.add(from)
  }
}
for (const g of guides) {
  for (const [loc, s] of Object.entries(g.slugs ?? {})) {
    if (s === g.slug || !g.locales?.[loc]) continue
    const from = `/${loc}/guides/${g.slug}`
    auto[from] = `/${loc}/guides/${s}`
    localeAllowed.add(from)
  }
}

const entries = Object.entries({ ...auto, ...manual })
if (entries.length === 0) {
  console.log('[redirects] none configured, skipping')
  process.exit(0)
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

let n = 0
for (const [oldPath, newPath] of entries) {
  if (!oldPath.startsWith('/') || !newPath.startsWith('/')) {
    console.warn(`[redirects] skipped (paths must start with /): ${oldPath} -> ${newPath}`)
    continue
  }
  // Never shadow a live route (applies to manual redirects.json entries too;
  // row-derived paths are pre-filtered in oldPathsFrom). Base-slug fallbacks
  // computed above are the one sanctioned exception.
  if (/^\/(en|vi|ru|ko)(\/|$|\.)/.test(oldPath) && !localeAllowed.has(oldPath)) {
    console.warn(`[redirects] skipped (would overwrite a live page): ${oldPath}`)
    continue
  }
  // /old/article -> dist/old/article/index.html (pretty-URL shape WP used).
  // resolve + containment check: '..' segments must never escape dist.
  const dir = resolve(DIST, '.' + oldPath)
  if (dir === DIST || !dir.startsWith(DIST + sep)) {
    console.warn(`[redirects] skipped (path escapes the site root): ${oldPath}`)
    continue
  }
  // Belt and braces for the locale-prefixed fallbacks: if a live page exists
  // at <oldPath>.html (the SSG's flat-file shape), the stub would shadow it
  // on the static host — skip instead.
  if (localeAllowed.has(oldPath) && existsSync(dir + '.html')) {
    console.warn(`[redirects] skipped (live page exists at ${oldPath}.html)`)
    continue
  }
  // One bad cell (e.g. a path colliding with an existing FILE like
  // /media/hero-city.jpg) must skip that entry, never fail the build.
  try {
    await mkdir(dir, { recursive: true })
    await writeFile(
      join(dir, 'index.html'),
      `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${esc(newPath)}">
<link rel="canonical" href="${esc(newPath)}">
<title>Toan Huy Hoang</title>
<meta name="robots" content="noindex">
</head><body><a href="${esc(newPath)}">${esc(newPath)}</a></body></html>`,
      'utf8',
    )
    n++
  } catch (err) {
    console.warn(`[redirects] skipped ${oldPath}: ${err.message}`)
  }
}
console.log(`[redirects] wrote ${n} forward pages`)
