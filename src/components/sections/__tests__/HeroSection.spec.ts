import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '../HeroSection.vue'

describe('HeroSection', () => {
  it('shows the name and tagline', () => {
    const w = mount(HeroSection)
    expect(w.text()).toContain('Vindobona II')
    expect(w.text()).toContain('Deine Verbindung in Wien')
  })

  it('has the name as the one main heading of the page and shows the motto', () => {
    const w = mount(HeroSection)

    expect(w.findAll('h1')).toHaveLength(1)
    expect(w.find('h1').text()).toBe('Vindobona II')
    expect(w.text()).toContain('Numquam retro… ein Leben lang')
  })

  it('leads on to the first section with a hint that is hidden from assistive technology and skipped by the keyboard', () => {
    const hint = mount(HeroSection).find('.scroll-hint')

    // A link that is hidden from screen readers must not take keyboard focus either: the
    // focus would land on an element nothing announces.
    expect(hint.attributes('href')).toBe('#about')
    expect(hint.attributes('aria-hidden')).toBe('true')
    expect(hint.attributes('tabindex')).toBe('-1')
  })

  it('sets the photo as the background, behind the text', () => {
    const w = mount(HeroSection)

    expect(w.find('.hero-bg').attributes('style')).toMatch(
      /background-image: url\("?.*hero.*\.jpg"?\)/,
    )
  })
})
