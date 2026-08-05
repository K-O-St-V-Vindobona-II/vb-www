export type ParsedSegment =
  | { type: 'text'; value: string }
  | { type: 'link'; text: string; url: string }

// Only http(s) links match — anything else ([x](javascript:...), [x](data:...))
// falls through as literal text instead of becoming a clickable link. This is
// the actual XSS defense (on top of the backend's own validator on save):
// there is no code path here that ever builds an href from an unmatched
// scheme, and this component never uses v-html (forbidden by this repo's
// ESLint config) — segments are rendered as plain text nodes or real <a>
// elements, never raw markup.
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g

function parseSegments(paragraph: string): ParsedSegment[] {
  const segments: ParsedSegment[] = []
  let lastIndex = 0
  LINK_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = LINK_PATTERN.exec(paragraph)) !== null) {
    const [full, text, url] = match
    // Both groups are non-optional in LINK_PATTERN, so this is always
    // true when the regex matched at all — satisfies noUncheckedIndexedAccess
    // without a non-null assertion.
    if (text === undefined || url === undefined) continue

    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: paragraph.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'link', text, url })
    lastIndex = match.index + full.length
  }
  if (lastIndex < paragraph.length) {
    segments.push({ type: 'text', value: paragraph.slice(lastIndex) })
  }
  return segments
}

/**
 * Splits admin-authored body text into paragraphs (blank line = new
 * paragraph, matching Markdown) and parses each into text/link segments
 * (`[label](url)` mini-syntax). A single `\n` within a paragraph collapses
 * to a space — no manual <br> markup is supported.
 */
export function parseParagraphs(raw: string): ParsedSegment[][] {
  return raw
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => parseSegments(paragraph.replace(/\s*\n\s*/g, ' ')))
}
