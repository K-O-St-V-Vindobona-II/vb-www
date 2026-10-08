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
    { id: 'item-uuid-1', text: 'Alle Veranstaltungen beginnen c.t.' },
    { id: 'item-uuid-2', text: 'Alle Veranstaltungen finden auf der Bude Vindobonae statt.' },
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
    expect(iframe.attributes('src')).toBe(
      'https://calendar.google.com/calendar/embed?src=h7d2qp0jlg603cvq2aabdn2k5o%40group.calendar.google.com&ctz=Europe%2FVienna',
    )
    expect(iframe.attributes('title')).toBe('Veranstaltungskalender')
    expect(iframe.attributes('loading')).toBe('lazy')
  })

  it('titles the section and its notes', async () => {
    mockFetchSiteContent.mockResolvedValue(SITE_CONTENT)
    const w = await mountSection()

    expect(w.find('h2').text()).toBe('Programm')
    expect(w.find('.hinweise h3').text()).toBe('Hinweise')
  })

  it('sends an explicit referrer policy with the calendar frame', async () => {
    mockFetchSiteContent.mockResolvedValue(SITE_CONTENT)
    const w = await mountSection()
    expect(w.find('iframe').attributes('referrerpolicy')).toBe('strict-origin-when-cross-origin')
  })

  it('escapes the calendar id in the address of the frame and of the download', async () => {
    mockFetchSiteContent.mockResolvedValue({
      ...SITE_CONTENT,
      settings: { ...SITE_CONTENT.settings, programm_calendar_id: 'a&b=c/d' },
    })
    const w = await mountSection()

    expect(w.find('iframe').attributes('src')).toContain('src=a%26b%3Dc%2Fd&ctz=')
    expect(w.find('.ical-link').attributes('href')).toContain('/ical/a%26b%3Dc%2Fd/public/')
  })

  it('shows no calendar and no download link when no calendar is configured', async () => {
    mockFetchSiteContent.mockResolvedValue({
      ...SITE_CONTENT,
      settings: { ...SITE_CONTENT.settings, programm_calendar_id: '' },
    })
    const w = await mountSection()

    expect(w.find('iframe').exists()).toBe(false)
    expect(w.find('.ical-link').exists()).toBe(false)
    expect(w.text()).toContain('c.t.')
  })

  it('shows the Hinweise text from the API, one list entry per hint, in order', async () => {
    mockFetchSiteContent.mockResolvedValue(SITE_CONTENT)
    const w = await mountSection()

    expect(w.findAll('.hinweise-list li').map((li) => li.text())).toEqual([
      '✓Alle Veranstaltungen beginnen c.t.',
      '✓Alle Veranstaltungen finden auf der Bude Vindobonae statt.',
    ])
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
