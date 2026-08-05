import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import type { SiteContent } from '@/services/api'

const mockFetchSiteContent = vi.fn()
vi.mock('@/services/api', () => ({
  fetchSiteContent: (...args: unknown[]) => mockFetchSiteContent(...args),
}))

const SITE_CONTENT: SiteContent = {
  about_tabs: {
    anfang: {
      title: 'Der Anfang',
      body: 'Als Mittelschülerverbindung gegründet. Die Stolpersteine sind [hier zu finden](https://niemalswieder.at/Stolpersteine/Steine/1368).',
    },
    mkv: {
      title: 'MKV',
      body: 'Vindobona II ist Teil des Mittelschülerkartellverbandes.',
    },
    heute: {
      title: 'Heute',
      body: 'Nach dem Eintritt absolviert jedes Neumitglied eine Probezeit.',
    },
  },
  settings: {
    about_video_heading: 'Erfahre mehr über den MKV',
    about_video_youtube_id: 'Sh51ebB2G8A',
    programm_calendar_id: 'abc@group.calendar.google.com',
    gallery_heading: 'Eindrücke',
  },
  programm_hints: [],
  quotes: [],
  social_links: [],
}

describe('AboutSection', () => {
  beforeEach(() => {
    mockFetchSiteContent.mockReset()
    // useSiteContent.ts is a module-scoped singleton (shared fetch cache
    // across all consuming sections) - each test needs a fresh module
    // instance, so both it and the component (which imports it at module
    // load time) must be re-imported after resetModules().
    vi.resetModules()
  })

  async function mountSection() {
    const { default: AboutSection } = await import('../AboutSection.vue')
    const w = mount(AboutSection)
    await flushPromises()
    return w
  }

  it('shows a loading message while fetching', async () => {
    mockFetchSiteContent.mockReturnValue(new Promise(() => {}))
    const { default: AboutSection } = await import('../AboutSection.vue')
    const w = mount(AboutSection)
    expect(w.text()).toContain('Wird geladen')
  })

  it('shows the first tab by default', async () => {
    mockFetchSiteContent.mockResolvedValue(SITE_CONTENT)
    const w = await mountSection()
    expect(w.text()).toContain('Als Mittelschülerverbindung gegründet')
  })

  it('switches tab content when a tab button is clicked', async () => {
    mockFetchSiteContent.mockResolvedValue(SITE_CONTENT)
    const w = await mountSection()
    const buttons = w.findAll('button[role="tab"]')
    await buttons[1]?.trigger('click')

    expect(w.text()).toContain('Mittelschülerkartellverbandes')
    expect(w.text()).not.toContain('Als Mittelschülerverbindung gegründet')
  })

  it('marks the active tab with aria-selected', async () => {
    mockFetchSiteContent.mockResolvedValue(SITE_CONTENT)
    const w = await mountSection()
    const buttons = w.findAll('button[role="tab"]')
    expect(buttons[0]?.attributes('aria-selected')).toBe('true')
    expect(buttons[1]?.attributes('aria-selected')).toBe('false')

    await buttons[2]?.trigger('click')
    expect(buttons[2]?.attributes('aria-selected')).toBe('true')
  })

  it('shows the tab titles as button labels', async () => {
    mockFetchSiteContent.mockResolvedValue(SITE_CONTENT)
    const w = await mountSection()
    const buttons = w.findAll('button[role="tab"]')
    expect(buttons.map((b) => b.text())).toEqual(['Der Anfang', 'MKV', 'Heute'])
  })

  it('embeds the MKV YouTube video, independent of the active tab', async () => {
    mockFetchSiteContent.mockResolvedValue(SITE_CONTENT)
    const w = await mountSection()
    expect(w.text()).toContain('Erfahre mehr über den MKV')

    const iframe = w.find('iframe')
    expect(iframe.attributes('src')).toContain('youtube.com/embed/Sh51ebB2G8A')

    const buttons = w.findAll('button[role="tab"]')
    await buttons[1]?.trigger('click')
    expect(w.find('iframe').exists()).toBe(true)
  })

  it('links to the Stolpersteine page as a real <a>, not raw markup', async () => {
    mockFetchSiteContent.mockResolvedValue(SITE_CONTENT)
    const w = await mountSection()
    const link = w.find('a[href="https://niemalswieder.at/Stolpersteine/Steine/1368"]')
    expect(link.exists()).toBe(true)
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener')
  })

  it('shows an error message when loading fails', async () => {
    mockFetchSiteContent.mockRejectedValue(new Error('Netzwerkfehler'))
    const w = await mountSection()
    expect(w.text()).toContain('Netzwerkfehler')
  })
})
