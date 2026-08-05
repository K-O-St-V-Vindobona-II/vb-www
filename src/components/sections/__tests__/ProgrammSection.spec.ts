import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import type { SiteContent } from '@/services/api'

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
    about_video_youtube_id: 'Sh51ebB2G8A',
    programm_calendar_id: 'h7d2qp0jlg603cvq2aabdn2k5o@group.calendar.google.com',
    gallery_heading: 'Eindrücke',
  },
  programm_hints: [
    { id: 1, text: 'Alle Veranstaltungen beginnen c.t.' },
    { id: 2, text: 'Alle Veranstaltungen finden auf der Bude Vindobonae statt.' },
  ],
  quotes: [],
  social_links: [],
}

describe('ProgrammSection', () => {
  beforeEach(() => {
    mockFetchSiteContent.mockReset()
    // useSiteContent.ts is a module-scoped singleton - each test needs a
    // fresh module instance, so both it and the component (which imports
    // it at module load time) must be re-imported after resetModules().
    vi.resetModules()
  })

  async function mountSection() {
    const { default: ProgrammSection } = await import('../ProgrammSection.vue')
    const w = mount(ProgrammSection)
    await flushPromises()
    return w
  }

  it('shows a loading message while fetching', async () => {
    mockFetchSiteContent.mockReturnValue(new Promise(() => {}))
    const { default: ProgrammSection } = await import('../ProgrammSection.vue')
    const w = mount(ProgrammSection)
    expect(w.text()).toContain('Wird geladen')
  })

  it('embeds the admin-configured Google Calendar', async () => {
    mockFetchSiteContent.mockResolvedValue(SITE_CONTENT)
    const w = await mountSection()
    const iframe = w.find('iframe')
    expect(iframe.attributes('src')).toContain(
      encodeURIComponent('h7d2qp0jlg603cvq2aabdn2k5o@group.calendar.google.com'),
    )
  })

  it('shows the Hinweise text from the API', async () => {
    mockFetchSiteContent.mockResolvedValue(SITE_CONTENT)
    const w = await mountSection()
    expect(w.text()).toContain('c.t.')
    expect(w.text()).toContain('Bude Vindobonae')
  })

  it('links to the .ical download of the configured calendar', async () => {
    mockFetchSiteContent.mockResolvedValue(SITE_CONTENT)
    const w = await mountSection()
    const link = w.find('.ical-link')
    expect(link.text()).toContain('Kalender als .ical herunterladen')
    expect(link.attributes('href')).toBe(
      'https://calendar.google.com/calendar/ical/h7d2qp0jlg603cvq2aabdn2k5o%40group.calendar.google.com/public/basic.ics',
    )
  })

  it('shows an error message when loading fails', async () => {
    mockFetchSiteContent.mockRejectedValue(new Error('Netzwerkfehler'))
    const w = await mountSection()
    expect(w.text()).toContain('Netzwerkfehler')
  })
})
