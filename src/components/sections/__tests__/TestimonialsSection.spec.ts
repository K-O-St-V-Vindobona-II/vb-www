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
    id: 1,
    quote:
      'Als ich das erste Mal bei einer Verbindung war, war ich sofort begeistert und fühlte mich in der Gemeinschaft aufgehoben.',
    author: 'Ein Fuchs',
  },
  {
    id: 2,
    quote: 'Durch die Verbindung hab ich herausgefunden, was mich interessiert.',
    author: 'Ein Junger Aktiver',
  },
]

const THREE_QUOTES = [...TWO_QUOTES, { id: 3, quote: 'Ein drittes Zitat.', author: 'Noch jemand' }]

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

  it('scrolls the container when an arrow is clicked', async () => {
    mockFetchSiteContent.mockResolvedValue(buildContent(THREE_QUOTES))
    const w = await mountSection()

    const container = w.find('.testimonial-grid').element as HTMLElement
    container.scrollBy = vi.fn()

    await w.findAll('.scroll-arrow')[1]?.trigger('click')

    expect(container.scrollBy).toHaveBeenCalledOnce()
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
