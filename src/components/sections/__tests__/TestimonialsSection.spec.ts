import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import type { SiteContent } from '@/services/api'

const mockFetchSiteContent = vi.fn()
vi.mock('@/services/api', () => ({
  fetchSiteContent: (...args: unknown[]) => mockFetchSiteContent(...args),
}))

function buildContent(quotes: SiteContent['quotes']): SiteContent {
  return {
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
    quotes,
    social_links: [],
  }
}

const TWO_QUOTES = [
  {
    id: 'item-uuid-1',
    quote:
      'Als ich das erste Mal bei einer Verbindung war, war ich sofort begeistert und fühlte mich in der Gemeinschaft aufgehoben.',
    author: 'Ein Fuchs',
  },
  {
    id: 'item-uuid-2',
    quote: 'Durch die Verbindung hab ich herausgefunden, was mich interessiert.',
    author: 'Ein Junger Aktiver',
  },
]

const THREE_QUOTES = [
  ...TWO_QUOTES,
  { id: 'item-uuid-3', quote: 'Ein drittes Zitat.', author: 'Noch jemand' },
]

describe('TestimonialsSection', () => {
  beforeEach(() => {
    mockFetchSiteContent.mockReset()
    // useSiteContent.ts is a module-scoped singleton - each test needs a
    // fresh module instance, so both it and the component (which imports
    // it at module load time) must be re-imported after resetModules().
    vi.resetModules()
  })

  async function mountSection() {
    const { default: TestimonialsSection } = await import('../TestimonialsSection.vue')
    const w = mount(TestimonialsSection)
    await flushPromises()
    return w
  }

  it('shows both quotes with their authors when there are only 2', async () => {
    mockFetchSiteContent.mockResolvedValue(buildContent(TWO_QUOTES))
    const w = await mountSection()

    expect(w.text()).toContain('Als ich das erste Mal bei einer Verbindung war')
    expect(w.text()).toContain('Ein Fuchs')
    expect(w.text()).toContain('Ein Junger Aktiver')
    expect(w.findAll('blockquote')).toHaveLength(2)
  })

  it('does not show scroll arrows with only 2 quotes', async () => {
    mockFetchSiteContent.mockResolvedValue(buildContent(TWO_QUOTES))
    const w = await mountSection()

    expect(w.find('.scroll-arrow').exists()).toBe(false)
    expect(w.find('.testimonial-grid').classes()).not.toContain('is-carousel')
  })

  it('shows scroll arrows and switches to carousel mode with more than 2 quotes', async () => {
    mockFetchSiteContent.mockResolvedValue(buildContent(THREE_QUOTES))
    const w = await mountSection()

    expect(w.findAll('.scroll-arrow')).toHaveLength(2)
    expect(w.find('.testimonial-grid').classes()).toContain('is-carousel')
    expect(w.findAll('blockquote')).toHaveLength(3)
  })

  it('scrolls the container back with the left arrow and forward with the right one', async () => {
    mockFetchSiteContent.mockResolvedValue(buildContent(THREE_QUOTES))
    const w = await mountSection()
    const container = w.find('.testimonial-grid').element as HTMLElement
    Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true })
    container.scrollBy = vi.fn()

    await w.find('button[aria-label="Vorherige Zitate"]').trigger('click')
    await w.find('button[aria-label="Weitere Zitate"]').trigger('click')

    expect(container.scrollBy).toHaveBeenNthCalledWith(1, expect.objectContaining({ left: -450 }))
    expect(container.scrollBy).toHaveBeenNthCalledWith(2, expect.objectContaining({ left: 450 }))
  })

  it('shows quotes and authors in the order of the API, each author under its own quote', async () => {
    mockFetchSiteContent.mockResolvedValue(buildContent(THREE_QUOTES))
    const w = await mountSection()

    expect(
      w
        .findAll('blockquote')
        .map((q) => [q.find('.quote-text').text(), q.find('.quote-author').text()]),
    ).toEqual([
      [TWO_QUOTES[0]!.quote, 'Ein Fuchs'],
      [TWO_QUOTES[1]!.quote, 'Ein Junger Aktiver'],
      ['Ein drittes Zitat.', 'Noch jemand'],
    ])
  })

  it('shows nothing, not even an empty frame, when there are no quotes', async () => {
    mockFetchSiteContent.mockResolvedValue(buildContent([]))
    const w = await mountSection()

    expect(w.find('.testimonials-wrapper').exists()).toBe(false)
    expect(w.find('.status-message').exists()).toBe(false)
  })

  it('hides the decorative quote marks and the arrow glyphs from screen readers', async () => {
    mockFetchSiteContent.mockResolvedValue(buildContent(THREE_QUOTES))
    const w = await mountSection()

    expect(
      w.findAll('.quote-mark').every((mark) => mark.attributes('aria-hidden') === 'true'),
    ).toBe(true)
    expect(
      w.findAll('.scroll-arrow span').every((glyph) => glyph.attributes('aria-hidden') === 'true'),
    ).toBe(true)
  })

  it('shows a loading message while fetching', async () => {
    mockFetchSiteContent.mockReturnValue(new Promise(() => {}))
    const { default: TestimonialsSection } = await import('../TestimonialsSection.vue')
    const w = mount(TestimonialsSection)
    expect(w.text()).toContain('Wird geladen')
  })

  it('shows an error message when loading fails', async () => {
    mockFetchSiteContent.mockRejectedValue(new Error('Netzwerkfehler'))
    const w = await mountSection()
    expect(w.text()).toContain('Netzwerkfehler')
  })
})
