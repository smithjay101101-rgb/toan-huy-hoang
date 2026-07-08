// Legacy-URL redirects for the static host. GitHub Pages cannot serve real
// 301s, so each mapping in scripts/redirects.json becomes a tiny prerendered
// page at the OLD path that instantly forwards to the new one (meta refresh 0
// + rel=canonical — the same pattern the site root uses for / -> /en, and the
// static-host convention Google treats as a permanent move).
//
// Fill redirects.json at domain cutover with the old WordPress paths.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')

const { redirects = {} } = JSON.parse(await readFile(join(__dirname, 'redirects.json'), 'utf8'))
const entries = Object.entries(redirects)
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
  // /old/article -> dist/old/article/index.html (pretty-URL shape WP used).
  const dir = join(DIST, ...oldPath.split('/').filter(Boolean))
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
}
console.log(`[redirects] wrote ${n} forward pages`)
