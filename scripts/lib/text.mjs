// Markdown-to-plain-text helpers for the build pipelines. Airtable fields
// with rich text enabled deliver Markdown; anything that feeds cards, meta
// descriptions, or titles must be plain text.

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
