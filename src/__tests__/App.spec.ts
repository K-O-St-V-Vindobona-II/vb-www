import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import type { SiteContent } from '@/services/api'

const mockFetchSiteContent = vi.fn()
const mockFetchGalleryImages = vi.fn()
vi.mock('@/services/api', () => ({
  fetchSiteContent: (...args: unknown[]) => mockFetchSiteContent(...args),
  fetchGalleryImages: (...args: unknown[]) => mockFetchGalleryImages(...args),
  submitContactForm: vi.fn(),
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
  social_links: [],
}

describe('App', () => {
  // The console banner (ConsoleBanner.vue) prints on every mount; captured so it neither clutters
  // the test output nor goes unchecked.
  let log: MockInstance<typeof console.log>

  beforeEach(() => {
    log = vi.spyOn(console, 'log').mockImplementation(() => {})
    mockFetchSiteContent.mockReset().mockResolvedValue(SITE_CONTENT)
    mockFetchGalleryImages.mockReset().mockResolvedValue([])
    // useSiteContent.ts is a module-scoped singleton - a fresh module instance per test.
    vi.resetModules()
  })

  afterEach(() => {
    log.mockRestore()
  })

  async function mountApp() {
    const { default: App } = await import('@/App.vue')
    const wrapper = mount(App)
    await flushPromises()
    return wrapper
  }

  it('puts the sections on the page in the order the menu lists them', async () => {
    const wrapper = await mountApp()

    const sectionIds = wrapper
      .findAll('main > section[id]')
      .map((section) => section.attributes('id'))

    expect(sectionIds).toEqual(['about', 'eindruecke', 'programm', 'mitglied-werden', 'kontakt'])
  })

  it('has a target on the page for every anchor of the menu', async () => {
    const wrapper = await mountApp()

    const anchors = wrapper
      .findAll('nav a[href^="#"]')
      .map((link) => link.attributes('href') ?? '')
      .filter((href) => href !== '#')

    expect(anchors).toHaveLength(5)
    for (const anchor of anchors) {
      expect(wrapper.find(anchor).exists(), `no element for ${anchor}`).toBe(true)
    }
  })

  it('shows the menu, the start section, every content section and the footer once', async () => {
    const wrapper = await mountApp()

    expect(wrapper.findAll('nav')).toHaveLength(1)
    expect(wrapper.findAll('main > section.hero')).toHaveLength(1)
    expect(wrapper.findAll('main > section')).toHaveLength(7)
    expect(wrapper.findAll('footer')).toHaveLength(1)
  })

  it('prints the banner to the console once', async () => {
    await mountApp()

    expect(log).toHaveBeenCalledOnce()
    expect(log.mock.calls[0]?.[0]).toContain('Vindobona II')
  })
})
