import { describe, it, expect } from 'vitest'
import css from '../style.css?raw'
import contactSource from '../components/sections/ContactSection.vue?raw'

// The colour pairs the components really put on top of each other, checked for the contrast
// WCAG 1.4.3 asks for (4.5:1 for normal text). The stylesheet is read as text (it reaches the
// test through test.css.include in vitest.config.ts), resolved the way the browser does it (the
// dark scheme overrides the light values), and every pair is computed. An empty stylesheet makes
// every case fail instead of pass.

const source = css.replace(/\/\*[\s\S]*?\*\//g, '')

function tokensOf(block: string): Map<string, string> {
  const tokens = new Map<string, string>()
  for (const match of block.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens.set(match[1]!, match[2]!)
  }
  return tokens
}

const darkStart = source.indexOf('@media (prefers-color-scheme: dark)')
const light = tokensOf(source.slice(source.indexOf(':root'), darkStart))
const darkOverrides = tokensOf(source.slice(darkStart, source.indexOf('* {', darkStart)))
const dark = new Map([...light, ...darkOverrides])

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

function contrast(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (lighter! + 0.05) / (darker! + 0.05)
}

// [foreground, background]; '#ffffff' is the literal white the components use on the red.
const PAIRS: [string, string][] = [
  ['--color-text', '--color-bg'],
  ['--color-text', '--color-bg-alt'],
  ['--color-text', '--color-surface'],
  ['--color-text-muted', '--color-bg'],
  ['--color-text-muted', '--color-bg-alt'],
  ['--color-text-muted', '--color-surface'],
  ['--color-primary', '--color-bg'],
  ['--color-primary', '--color-bg-alt'],
  ['--color-primary-dark', '--color-bg'],
  ['--color-success', '--color-bg'],
  ['--color-success', '--color-bg-alt'],
  ['#ffffff', '--color-primary-solid'],
  ['#ffffff', '--color-primary-solid-dark'],
]

const resolve = (tokens: Map<string, string>, name: string): string =>
  name.startsWith('#') ? name : (tokens.get(name) ?? '')

describe.each([
  ['light', light],
  ['dark', dark],
])('the %s colour scheme', (_scheme, tokens) => {
  it.each(PAIRS)('%s on %s reaches 4.5:1', (foreground, background) => {
    const fg = resolve(tokens, foreground)
    const bg = resolve(tokens, background)

    expect(fg, foreground).toMatch(/^#[0-9a-f]{6}$/i)
    expect(bg, background).toMatch(/^#[0-9a-f]{6}$/i)
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('the shared gradient', () => {
  it('is built from the tokens that keep their value in the dark scheme', () => {
    expect(source).toMatch(
      /--gradient-primary:\s*linear-gradient\(\s*135deg,\s*var\(--color-primary-solid\) 0%,\s*var\(--color-primary-solid-dark\) 100%\s*\)/,
    )
    expect(darkOverrides.has('--color-primary-solid')).toBe(false)
    expect(darkOverrides.has('--color-primary-solid-dark')).toBe(false)
  })
})

describe('the confirmation of the contact form', () => {
  it('uses the text colour that reaches the contrast, not the light accent', () => {
    expect(contactSource).toMatch(/\.form-message\.success \{\s*color: var\(--color-success\);/)
  })
})
