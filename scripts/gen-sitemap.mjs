// Generates public/sitemap.xml with hreflang alternates for EN, VI and RU
// across all static pages and every published listing. Runs before the SSG
// build so the file is copied into dist.
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SITE_URL = process.env.SITE_URL || 'https://toanhuyhoang.com'
const LOCALES = ['en', 'vi', 'ru']

const STATIC = ['', 'buy', 'rent', 'projects', 'about', 'contact']

function urlEntry(path, alternates) {
  const links = alternates
    .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${SITE_URL}${a.path}"/>`)
    .join('\n')
  return `  <url>
    <loc>${SITE_URL}${path}</loc>
${links}
  </url>`
}

async function main() {
  let slugs = []
  try {
    const raw = await readFile(join(ROOT, 'src', 'data', 'listings.json'), 'utf8')
    slugs = JSON.parse(raw).map((l) => l.slug)
  } catch {
    // no data yet, sitemap will contain static pages only
  }

  const paths = [
    ...STATIC.map((s) => (s ? `/${s}` : '')),
    ...slugs.map((slug) => `/property/${slug}`),
  ]

  const entries = []
  for (const sub of paths) {
    for (const locale of LOCALES) {
      const localized = `/${locale}${sub}`
      const alternates = [
        ...LOCALES.map((l) => ({ lang: l, path: `/${l}${sub}` })),
        { lang: 'x-default', path: `/en${sub}` },
      ]
      entries.push(urlEntry(localized, alternates))
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`
  await writeFile(join(ROOT, 'public', 'sitemap.xml'), xml, 'utf8')
  console.log(`[sitemap] Wrote ${entries.length} URLs to public/sitemap.xml`)
}

main()
