import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppNav from '../AppNav.vue'

describe('AppNav', () => {
  it('renders a link for every section, in page order', () => {
    const w = mount(AppNav)
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    // Facebook is temporarily hidden (FACEBOOK_LINK_ENABLED = false in
    // AppNav.vue) until the association clarifies why the page is
    // unreachable - not expected here on purpose, see that flag's comment.
    expect(hrefs).toEqual([
      '#',
      '#about',
      '#eindruecke',
      '#programm',
      '#mitglied-werden',
      '#kontakt',
      'https://intern.vindobona2.at/',
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

  it('toggles the mobile menu panel open and closed via the hamburger button', async () => {
    const w = mount(AppNav)
    const toggle = w.find('.menu-toggle')
    const panel = w.find('#nav-panel')

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(panel.classes()).not.toContain('is-open')

    await toggle.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(panel.classes()).toContain('is-open')
  })

  it('closes the mobile menu after a section link is clicked', async () => {
    const w = mount(AppNav)
    await w.find('.menu-toggle').trigger('click')
    expect(w.find('#nav-panel').classes()).toContain('is-open')

    await w.find('a[href="#about"]').trigger('click')

    expect(w.find('#nav-panel').classes()).not.toContain('is-open')
  })
})
