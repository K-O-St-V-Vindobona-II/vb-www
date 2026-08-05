import { describe, it, expect } from 'vitest'
import { parseParagraphs } from '@/utils/parseLinkedText'

describe('parseParagraphs', () => {
  it('returns a single text segment for plain text', () => {
    const result = parseParagraphs('Einfacher Text ohne Links.')
    expect(result).toEqual([[{ type: 'text', value: 'Einfacher Text ohne Links.' }]])
  })

  it('splits on blank lines into separate paragraphs', () => {
    const result = parseParagraphs('Erster Absatz.\n\nZweiter Absatz.')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual([{ type: 'text', value: 'Erster Absatz.' }])
    expect(result[1]).toEqual([{ type: 'text', value: 'Zweiter Absatz.' }])
  })

  it('collapses single newlines within a paragraph to a space', () => {
    const result = parseParagraphs('Zeile eins\nZeile zwei')
    expect(result).toEqual([[{ type: 'text', value: 'Zeile eins Zeile zwei' }]])
  })

  it('parses a [label](url) link in the middle of text', () => {
    const result = parseParagraphs('Schau [hier](https://example.com) vorbei.')
    expect(result[0]).toEqual([
      { type: 'text', value: 'Schau ' },
      { type: 'link', text: 'hier', url: 'https://example.com' },
      { type: 'text', value: ' vorbei.' },
    ])
  })

  it('parses a link at the very start and end of a paragraph', () => {
    const result = parseParagraphs('[Start](https://a.com) Mitte [Ende](https://b.com)')
    expect(result[0]).toEqual([
      { type: 'link', text: 'Start', url: 'https://a.com' },
      { type: 'text', value: ' Mitte ' },
      { type: 'link', text: 'Ende', url: 'https://b.com' },
    ])
  })

  it('supports multiple links in the same paragraph', () => {
    const result = parseParagraphs('[A](https://a.com) und [B](https://b.com).')
    const links = result[0]?.filter((s) => s.type === 'link')
    expect(links).toHaveLength(2)
  })

  it('ignores empty paragraphs from excess blank lines', () => {
    const result = parseParagraphs('Erster.\n\n\n\nZweiter.')
    expect(result).toHaveLength(2)
  })

  it('returns an empty array for empty input', () => {
    expect(parseParagraphs('')).toEqual([])
  })

  // Security: only http(s) links are ever recognized — anything else must
  // fall through as inert literal text, never become a clickable <a href>.
  it('does not linkify a javascript: URL', () => {
    const result = parseParagraphs('Klick [hier](javascript:alert(1)) für mehr.')
    expect(result[0]?.some((s) => s.type === 'link')).toBe(false)
    expect(result[0]).toEqual([
      { type: 'text', value: 'Klick [hier](javascript:alert(1)) für mehr.' },
    ])
  })

  it('does not linkify a data: URL', () => {
    const result = parseParagraphs('[x](data:text/html,<script>alert(1)</script>)')
    expect(result[0]?.some((s) => s.type === 'link')).toBe(false)
  })

  it('does not linkify a bare mailto: URL', () => {
    const result = parseParagraphs('[Mail](mailto:test@example.com)')
    expect(result[0]?.some((s) => s.type === 'link')).toBe(false)
  })
})
