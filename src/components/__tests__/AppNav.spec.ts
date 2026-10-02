import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import type { SiteContent } from '@/services/api'
import navSource from '../AppNav.vue?raw'

const mockFetchSiteContent = vi.fn()
vi.mock('@/services/api', () => ({
  fetchSiteContent: (...args: unknown[]) => mockFetchSiteContent(...args),
}))

const SITE_CONTENT: SiteContent = {
  about_tabs: {
    anfang: { title: 'Der Anfang', body: 'Text.' },
    mkv: { title: 'MKV', body: 'Text.' },
    heute: { title: 'Heute', body: 'Text.' },
  },
  settings: {
    about_video_heading: 'Erfahre mehr',
    about_video_youtube_id: 'abcdefghijk',
    programm_calendar_id: 'abc@group.calendar.google.com',
    gallery_heading: 'Eindrücke',
  },
  programm_hints: [],
  quotes: [],
  // Only enabled links ever appear here - the backend already filters
  // (see public_site.py::get_site_content()). Facebook is seeded disabled,
  // so it deliberately does not appear.
  social_links: [
    {
      id: 2,
      platform: 'instagram',
      label: 'Instagram',
      url: 'http://www.instagram.com/vindobona2',
    },
  ],
}

describe('AppNav', () => {
  beforeEach(() => {
    mockFetchSiteContent.mockReset().mockResolvedValue(SITE_CONTENT)
    // useSiteContent.ts is a module-scoped singleton - each test needs a
    // fresh module instance, so both it and the component (which imports
    // it at module load time) must be re-imported after resetModules().
    vi.resetModules()
  })

  async function mountNav() {
    const { default: AppNav } = await import('../AppNav.vue')
    const w = mount(AppNav)
    await flushPromises()
    return w
  }

  it('renders a link for every section plus Intern and the enabled social links, in order', async () => {
    const w = await mountNav()
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
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

  it('does not render a disabled social link (Facebook)', async () => {
    const w = await mountNav()
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).not.toContain('https://www.facebook.com/vindobona2')
  })

  it('shows only the Intern link before the social links have loaded', async () => {
    mockFetchSiteContent.mockReturnValue(new Promise(() => {}))
    const { default: AppNav } = await import('../AppNav.vue')
    const w = mount(AppNav)
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('https://intern.vindobona2.at/')
    expect(hrefs).not.toContain('http://www.instagram.com/vindobona2')
  })

  it('opens external links in a new tab', async () => {
    const w = await mountNav()
    const internLink = w.find('a[href="https://intern.vindobona2.at/"]')
    expect(internLink.attributes('target')).toBe('_blank')
    expect(internLink.attributes('rel')).toBe('noopener')

    const socialLink = w.find('a[href="http://www.instagram.com/vindobona2"]')
    expect(socialLink.attributes('target')).toBe('_blank')
    expect(socialLink.attributes('rel')).toBe('noopener')
  })

  it('shows the brand name', async () => {
    const w = await mountNav()
    expect(w.text()).toContain('Vindobona II')
  })

  it('toggles the mobile menu panel open and closed via the hamburger button', async () => {
    const w = await mountNav()
    const toggle = w.find('.menu-toggle')
    const panel = w.find('#nav-panel')

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(panel.classes()).not.toContain('is-open')

    await toggle.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(panel.classes()).toContain('is-open')
  })

  it('closes the mobile menu after a section link is clicked', async () => {
    const w = await mountNav()
    await w.find('.menu-toggle').trigger('click')
    expect(w.find('#nav-panel').classes()).toContain('is-open')

    await w.find('a[href="#about"]').trigger('click')

    expect(w.find('#nav-panel').classes()).not.toContain('is-open')
  })

  // The stylesheet cannot run in jsdom, so its rules are read as text; the anchor jumps
  // themselves were measured in a browser.
  describe('the mobile menu panel layout', () => {
    const css = navSource.slice(navSource.indexOf('<style'))
    const rule = (selector: string, source = css) => {
      const start = source.indexOf(`${selector} {`)
      return start === -1 ? '' : source.slice(start, source.indexOf('}', start))
    }
    const desktop = css.slice(css.indexOf('@media (min-width: 700px)'))

    it('lays the panel over the page, so opening and closing it does not move the content', () => {
      expect(rule('.links')).toContain('position: absolute;')
      expect(rule('.links')).toContain('top: 100%;')
      expect(rule('.links', desktop)).toContain('position: static;')
    })

    it('gives the overlaid panel an opaque background, so the page does not show through', () => {
      expect(rule('.links')).toContain('background: rgb(var(--color-primary-rgb));')
      expect(rule('.links', desktop)).toContain('background: none;')
    })

    it('keeps the bar at the top of the screen while the page scrolls', () => {
      expect(rule('.app-nav')).toContain('position: sticky;')
    })
  })
})
