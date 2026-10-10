import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
    about_video_youtube_id: 'abcdefghijk',
    programm_calendar_id: 'abc@group.calendar.google.com',
    gallery_heading: 'Eindrücke',
  },
  programm_hints: [],
  quotes: [],
  // Only enabled links ever appear here - the backend already filters
  // (see public_site.py::get_site_content()).
  social_links: [
    {
      id: 'item-uuid-2',
      platform: 'instagram',
      label: 'Instagram',
      url: 'https://www.instagram.com/vindobona2',
    },
  ],
}

describe('AppFooter', () => {
  beforeEach(() => {
    mockFetchSiteContent.mockReset().mockResolvedValue(SITE_CONTENT)
    // useSiteContent.ts is a module-scoped singleton - each test needs a
    // fresh module instance, so both it and the component (which imports
    // it at module load time) must be re-imported after resetModules().
    vi.resetModules()
  })

  async function mountFooter(options?: Parameters<typeof mount>[1]) {
    const { default: AppFooter } = await import('../AppFooter.vue')
    const w = mount(AppFooter, options)
    await flushPromises()
    return w
  }

  it('shows the copyright notice with the current year', async () => {
    const w = await mountFooter()
    expect(w.text()).toContain('K.Ö.St.V. Vindobona II Wien')
    expect(w.text()).toContain(String(new Date().getFullYear()))
  })

  it('shows the year of today, not the year of the build', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2031, 5, 15))

    const w = await mountFooter()

    vi.useRealTimers()
    expect(w.text()).toContain('Copyright 2031 K.Ö.St.V.')
  })

  it('renders only the enabled social links from the API', async () => {
    const w = await mountFooter()
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('https://www.instagram.com/vindobona2')
    expect(hrefs).not.toContain('https://www.facebook.com/vindobona2')
    expect(w.text()).toContain('Instagram')
  })

  it('shows no social links before the content has loaded', async () => {
    mockFetchSiteContent.mockReturnValue(new Promise(() => {}))
    const { default: AppFooter } = await import('../AppFooter.vue')
    const w = mount(AppFooter)
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).not.toContain('https://www.instagram.com/vindobona2')
  })

  it('opens a real Impressum dialog instead of a dead anchor', async () => {
    const w = await mountFooter()
    // Regression guard: make sure the Impressum link never becomes a dead
    // anchor again.
    expect(w.findAll('a').some((a) => a.text() === 'Impressum')).toBe(false)

    const trigger = w.find('.impressum-trigger')
    expect(trigger.text()).toBe('Impressum')

    expect(w.text()).toContain('K.Ö.St.V. Vindobona II Wien, Rooseveltplatz 8/Sout., 1090 Wien')
  })

  it('shows the confirmed ZVR-Zahl and a mailto contact link', async () => {
    const w = await mountFooter()
    expect(w.text()).toContain('828508820')

    const mailLink = w.find('a[href="mailto:vindoboneninfo@gmail.com"]')
    expect(mailLink.exists()).toBe(true)
    expect(mailLink.text()).toBe('vindoboneninfo@gmail.com')
  })

  // jsdom has no <dialog>.showModal()/close(); these stand in for the browser's.
  describe('the Impressum dialog', () => {
    const showModal = vi.fn()
    const close = vi.fn()

    beforeEach(() => {
      showModal.mockReset()
      close.mockReset()
      Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
        value: showModal,
        configurable: true,
        writable: true,
      })
      Object.defineProperty(HTMLDialogElement.prototype, 'close', {
        value: close,
        configurable: true,
        writable: true,
      })
    })

    afterEach(() => {
      Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
      Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
    })

    it('is opened as a modal by the Impressum button and not before', async () => {
      const w = await mountFooter()
      expect(showModal).not.toHaveBeenCalled()

      await w.find('.impressum-trigger').trigger('click')

      expect(showModal).toHaveBeenCalledOnce()
      expect(showModal.mock.contexts[0]).toBe(w.find('dialog.impressum-dialog').element)
    })

    it('is closed by its close button, which is labelled for screen readers', async () => {
      const w = await mountFooter()
      const closeButton = w.find('.dialog-close')

      await closeButton.trigger('click')

      expect(closeButton.attributes('aria-label')).toBe('Schließen')
      expect(close).toHaveBeenCalledOnce()
      expect(showModal).not.toHaveBeenCalled()
    })
  })

  it('opens the social links in a new tab without handing over the opener', async () => {
    const w = await mountFooter()
    const link = w.find('a[href="https://www.instagram.com/vindobona2"]')

    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener')
  })

  it('lists the Impressum data as labelled entries', async () => {
    const w = await mountFooter()

    expect(w.findAll('dt').map((dt) => dt.text())).toEqual([
      'Medieninhaber, Herausgeber und Vereinssitz',
      'ZVR-Zahl',
      'Kontakt',
    ])
  })
})
