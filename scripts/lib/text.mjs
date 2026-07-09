// Markdown-to-plain-text helpers for the build pipelines. Airtable fields
// with rich text enabled deliver Markdown; anything that feeds cards, meta
// descriptions, or titles must be plain text.

/**
 * Airtable rich text quirk: heading/list lines that sat as literal text in
 * the editor (it auto-converts while typing in some locales, not in others)
 * can arrive with their markers escaped ("\## Title", "\- item"). The site's
 * contract is simple — ## IS a heading 2, ### IS a heading 3 — so un-escape
 * block markers at line starts before anything parses the markdown.
 */
export function normalizeAirtableMarkdown(md) {
  return String(md || '')
    .replace(/^([ \t]*)((?:\\#)+)(?=[ \t])/gm, (_, ws, h) => ws + h.replace(/\\/g, '')) // \#\# Title
    .replace(/^([ \t]*)\\(#{1,6})(?=[ \t])/gm, '$1$2') // \## Title
    .replace(/^([ \t]*)\\([-*+>])(?=[ \t])/gm, '$1$2') // \- item, \> quote
    .replace(/^([ \t]*\d+)\\\.(?=[ \t])/gm, '$1.') // 1\. item
}

/**
 * Old-site URLs pasted into the old_url / Old_URL columns, normalized to
 * paths for the redirect generator. Accepts full URLs or bare paths, several
 * per cell (comma/space/newline separated). New-site locale paths are
 * rejected so a pasted NEW link can't hijack a live route.
 */
export function oldPathsFrom(raw) {
  const out = []
  for (const token of String(raw || '').split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)) {
    // Full URL, scheme-less host paste ("olddomain.com/x"), or bare path.
    const asUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(token)
      ? token
      : /^[\w-]+(\.[\w-]+)+(\/|$)/.test(token)
        ? `https://${token}`
        : null
    let path = null
    if (asUrl) {
      try {
        path = decodeURIComponent(new URL(asUrl).pathname)
      } catch {
        path = null
      }
    } else if (token.startsWith('/')) {
      path = token.split(/[?#]/)[0]
      try {
        path = decodeURIComponent(path)
      } catch {
        // keep the raw path if it is not valid percent-encoding
      }
    }
    if (path) path = path.replace(/\/+$/, '')
    // Reject empty/root paths and anything that would shadow a live route.
    if (!path || path === '/' || /^\/(en|vi|ru|ko)(\/|$|\.)/.test(path)) {
      console.warn(`[redirects] old link skipped (not usable as an old path): ${token}`)
      continue
    }
    out.push(path)
  }
  return out
}

/** Strip Markdown syntax, keeping the words (headings keep their text). */
export function stripMarkdown(md) {
  return String(md || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> their text
    .replace(/^#{1,6}[ \t]+/gm, '') // heading markers ([ \t]: \s would cross lines)
    .replace(/^>\s?/gm, '') // blockquotes
    .replace(/^[ \t]*[-*+][ \t]+/gm, '') // bullet markers
    .replace(/^[ \t]*\d+\.[ \t]+/gm, '') // numbered-list markers
    // Emphasis only when flanked like real emphasis: "5* hotels and 4* spas"
    // and snake_case_words must survive untouched.
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '$1') // bold **
    .replace(/(^|\W)__(?=\S)([\s\S]*?\S)__(?=\W|$)/gm, '$1$2') // bold __
    .replace(/\*(?=\S)([\s\S]*?\S)\*/g, '$1') // italic *
    .replace(/(^|\W)_(?=\S)([^_]*\S)_(?=\W|$)/gm, '$1$2') // italic _
    .replace(/`+/g, '')
}

/**
 * Plain text for blurbs/meta derived from a BODY: heading lines are dropped
 * entirely first (a blurb wants sentences, not section titles), then inline
 * syntax is stripped.
 */
export function plainTextFromBody(md) {
  return stripMarkdown(String(md || '').replace(/^#{1,6}[ \t]+.*$/gm, ''))
}
