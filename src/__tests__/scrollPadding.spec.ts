import { describe, it, expect } from 'vitest'
import styles from '../style.css?raw'

// Vitest replaces the content of a stylesheet import with an empty string unless the file is
// listed in `test.css.include` (vitest.config.ts); the first case fails if that listing is lost,
// so the rule checks below can never pass blind.

const rule = (selector: string, source: string) => {
  const start = source.indexOf(`${selector} {`)
  return start === -1 ? '' : source.slice(start, source.indexOf('}', start))
}

// An anchor jump must leave the target's heading below the sticky bar. The bar is about 3.9rem
// high on a phone and about 6.1rem with the link row on a wide screen.
describe('anchor scroll padding', () => {
  it('reads a non-empty stylesheet', () => {
    expect(styles).toContain('scroll-behavior: smooth;')
  })

  it('leaves room for the bar of a phone', () => {
    expect(rule('html', styles)).toContain('scroll-padding-top: 4.5rem;')
  })

  it('leaves room for the taller bar with the link row on wide screens', () => {
    const wide = styles.slice(styles.indexOf('@media (min-width: 700px)'))
    expect(rule('html', wide)).toContain('scroll-padding-top: 6.5rem;')
  })
})
