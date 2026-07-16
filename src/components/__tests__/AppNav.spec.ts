import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppNav from '../AppNav.vue'

describe('AppNav', () => {
  it('renders a link for every section, in page order', () => {
    const w = mount(AppNav)
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toEqual([
      '#',
      '#about',
      '#eindruecke',
      '#programm',
      '#mitglied-werden',
      '#kontakt',
      'https://intern.vindobona2.at/',
      'https://www.facebook.com/vindobona2',
      'http://www.instagram.com/vindobona2',
    ])
  })

  it('opens external links in a new tab', () => {
    const w = mount(AppNav)
    const internLink = w.find('a[href="https://intern.vindobona2.at/"]')
    expect(internLink.attributes('target')).toBe('_blank')
    expect(internLink.attributes('rel')).toBe('noopener')
  })

  it('shows the brand name', () => {
    const w = mount(AppNav)
    expect(w.text()).toContain('Vindobona II')
  })
})
