import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SiteContent } from '@/services/api'

const mockFetchSiteContent = vi.fn()
vi.mock('@/services/api', () => ({
  fetchSiteContent: (...args: unknown[]) => mockFetchSiteContent(...args),
}))

const SOME_CONTENT: SiteContent = {
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
  programm_hints: [{ id: 1, text: 'Hinweis' }],
  quotes: [{ id: 1, quote: 'Zitat', author: 'Jemand' }],
  social_links: [{ id: 1, platform: 'instagram', label: 'Instagram', url: 'https://x' }],
}

describe('useSiteContent', () => {
  beforeEach(() => {
    mockFetchSiteContent.mockReset()
    // Module-scoped singleton state (see useSiteContent.ts) — each test
    // needs a fresh module instance, not just a reset mock.
    vi.resetModules()
  })

  it('starts in a loading state with no content', async () => {
    const { useSiteContent } = await import('@/composables/useSiteContent')
    const { content, loading, error } = useSiteContent()
    expect(loading.value).toBe(true)
    expect(content.value).toBeNull()
    expect(error.value).toBeNull()
  })

  it('load() populates content and clears the loading state', async () => {
    mockFetchSiteContent.mockResolvedValue(SOME_CONTENT)
    const { useSiteContent } = await import('@/composables/useSiteContent')
    const { content, loading, error, load } = useSiteContent()
    await load()

    expect(loading.value).toBe(false)
    expect(content.value).toEqual(SOME_CONTENT)
    expect(error.value).toBeNull()
  })

  it('load() exposes an error message on failure', async () => {
    mockFetchSiteContent.mockRejectedValue(new Error('Netzwerkfehler'))
    const { useSiteContent } = await import('@/composables/useSiteContent')
    const { error, load } = useSiteContent()
    await load()

    expect(error.value).toBe('Netzwerkfehler')
  })

  it('load() falls back to a generic message for non-Error rejections', async () => {
    mockFetchSiteContent.mockRejectedValue('boom')
    const { useSiteContent } = await import('@/composables/useSiteContent')
    const { error, load } = useSiteContent()
    await load()

    expect(error.value).toBe('Inhalte konnten nicht geladen werden.')
  })

  it('shares one fetch across independent load() callers', async () => {
    mockFetchSiteContent.mockResolvedValue(SOME_CONTENT)
    const { useSiteContent } = await import('@/composables/useSiteContent')

    const consumerA = useSiteContent()
    const consumerB = useSiteContent()
    await Promise.all([consumerA.load(), consumerB.load()])

    expect(mockFetchSiteContent).toHaveBeenCalledTimes(1)
    expect(consumerA.content.value).toEqual(SOME_CONTENT)
    expect(consumerB.content.value).toEqual(SOME_CONTENT)
  })

  it('does not refetch on a second load() call after success', async () => {
    mockFetchSiteContent.mockResolvedValue(SOME_CONTENT)
    const { useSiteContent } = await import('@/composables/useSiteContent')
    const { load } = useSiteContent()

    await load()
    await load()

    expect(mockFetchSiteContent).toHaveBeenCalledTimes(1)
  })
})
