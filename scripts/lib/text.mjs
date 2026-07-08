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

/** Strip Markdown syntax, keeping the words (headings keep their text). */
export function stripMarkdown(md) {
  return String(md || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> their text
    .replace(/^#{1,6}\s+/gm, '') // heading markers
    .replace(/^>\s?/gm, '') // blockquotes
    .replace(/^\s*[-*+]\s+/gm, '') // bullet markers
    .replace(/^\s*\d+\.\s+/gm, '') // numbered-list markers
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italic
    .replace(/`+/g, '')
}

/**
 * Plain text for blurbs/meta derived from a BODY: heading lines are dropped
 * entirely first (a blurb wants sentences, not section titles), then inline
 * syntax is stripped.
 */
export function plainTextFromBody(md) {
  return stripMarkdown(String(md || '').replace(/^#{1,6}\s+.*$/gm, ''))
}
