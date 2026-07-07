// Workaround for vite-react-ssg 0.7.x: it emits static-loader-data-manifest-<hash>.json
// but does not inject window.__VITE_REACT_SSG_HASH__ into the prerendered HTML. The
// client then requests static-loader-data-manifest-undefined.json on in-app navigation,
// which 404s on a static host (GitHub Pages) and returns an HTML page, so the app throws
// "Unexpected token '<', '<!DOCTYPE'... is not valid JSON". Injecting the real hash makes
// the client load the correct (empty) loader-data manifest.
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DIST = 'dist'

async function findManifestHash() {
  const files = await readdir(DIST)
  const m = files.find((f) => /^static-loader-data-manifest-.+\.json$/.test(f))
  return m ? m.replace('static-loader-data-manifest-', '').replace('.json', '') : null
}

async function walkHtml(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walkHtml(p)))
    else if (entry.name.endsWith('.html')) out.push(p)
  }
  return out
}

// Content-Security-Policy, injected at build time only (a CSP in the source
// index.html would break the Vite dev server's HMR). script/style use
// 'unsafe-inline': the app relies on inline style attributes throughout, and the
// prerendered HTML carries inline bootstrap scripts (the hash below + per-page
// router hydration data) whose content varies, so a single hash is not viable.
// The high-value restrictions still apply: no plugins, locked base URI, frames
// limited to the map embed, and everything else same-origin.
const CSP = [
  "default-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  // Map embed + per-listing YouTube video tours (privacy-enhanced host).
  'frame-src https://www.openstreetmap.org https://www.youtube-nocookie.com',
  "object-src 'none'",
  "base-uri 'self'",
  // FormSubmit receives the contact form POST and emails it to the client.
  "form-action 'self' https://formsubmit.co",
].join('; ')

async function main() {
  const hash = await findManifestHash()
  if (!hash) {
    console.log('[fix-ssg-hash] no manifest found, skipping')
    return
  }
  const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${CSP}">`
  const tag = `${cspMeta}<script>window.__VITE_REACT_SSG_HASH__=${JSON.stringify(hash)}</script>`
  let n = 0
  for (const file of await walkHtml(DIST)) {
    let html = await readFile(file, 'utf8')
    if (html.includes('__VITE_REACT_SSG_HASH__')) continue
    html = html.replace(/<head>/i, `<head>${tag}`)
    await writeFile(file, html)
    n++
  }
  console.log(`[fix-ssg-hash] injected CSP + hash ${hash} into ${n} HTML files`)
}

main()
