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

  it('trims the blanks around a paragraph', () => {
    expect(parseParagraphs('   Erster.   \n\n\t Zweiter. \t')).toEqual([
      [{ type: 'text', value: 'Erster.' }],
      [{ type: 'text', value: 'Zweiter.' }],
    ])
  })

  it('drops a paragraph that holds only blanks', () => {
    expect(parseParagraphs('Erster.\n\n   \n\nZweiter.')).toHaveLength(2)
    expect(parseParagraphs('   \n\n  ')).toEqual([])
  })

  it.each([
    ['a line with spaces in between', 'Erster.\n  \nZweiter.'],
    ['Windows line endings', 'Erster.\r\n\r\nZweiter.'],
    ['a tab-only line', 'Erster.\n\t\nZweiter.'],
  ])('splits paragraphs at a blank line made of %s', (_name, raw) => {
    expect(parseParagraphs(raw)).toEqual([
      [{ type: 'text', value: 'Erster.' }],
      [{ type: 'text', value: 'Zweiter.' }],
    ])
  })

  it('reads the same links again in a second call (no state kept between calls)', () => {
    const raw = '[A](https://a.com) und [B](https://b.com)'

    expect(parseParagraphs(raw)).toEqual(parseParagraphs(raw))
  })

  it('links only the https and http forms, in any position of the text', () => {
    const result = parseParagraphs(
      '[a](http://a.com) [b](https://b.com) [c](ftp://c.com) [d](//d.com)',
    )
    const links = result[0]!.filter((segment) => segment.type === 'link')
    expect(links.map((link) => link.type === 'link' && link.url)).toEqual([
      'http://a.com',
      'https://b.com',
    ])
  })
})
