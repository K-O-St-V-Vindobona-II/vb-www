import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import type { SiteContent } from '@/services/api'

const mockFetchGalleryImages = vi.fn()
const mockFetchSiteContent = vi.fn()
vi.mock('@/services/api', () => ({
  fetchGalleryImages: (...args: unknown[]) => mockFetchGalleryImages(...args),
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
    gallery_heading: 'Bildergalerie',
  },
  programm_hints: [],
  quotes: [],
  social_links: [],
}

describe('GallerySection', () => {
  beforeEach(() => {
    mockFetchGalleryImages.mockReset()
    mockFetchSiteContent.mockReset().mockResolvedValue(SITE_CONTENT)
    // useSiteContent.ts is a module-scoped singleton - each test needs a
    // fresh module instance, so both it and the component (which imports
    // it at module load time) must be re-imported after resetModules().
    vi.resetModules()
  })

  async function mountSection(options?: Parameters<typeof mount>[1]) {
    const { default: GallerySection } = await import('../GallerySection.vue')
    const w = mount(GallerySection, options)
    await flushPromises()
    return w
  }

  it('shows the admin-configured section heading once loaded', async () => {
    mockFetchGalleryImages.mockResolvedValue([])
    const w = await mountSection()
    expect(w.find('h2').text()).toBe('Bildergalerie')
  })

  it('falls back to "Eindrücke" while the heading is still loading', async () => {
    mockFetchSiteContent.mockReturnValue(new Promise(() => {}))
    mockFetchGalleryImages.mockReturnValue(new Promise(() => {}))
    const { default: GallerySection } = await import('../GallerySection.vue')
    const w = mount(GallerySection)
    expect(w.find('h2').text()).toBe('Eindrücke')
  })

  it('shows a loading message while fetching images', async () => {
    mockFetchGalleryImages.mockReturnValue(new Promise(() => {}))
    const { default: GallerySection } = await import('../GallerySection.vue')
    const w = mount(GallerySection)
    expect(w.text()).toContain('Galerie wird geladen')
  })

  it('renders the images once loaded, without showing captions as visible text', async () => {
    mockFetchGalleryImages.mockResolvedValue([
      { id: '1', url: 'https://x/1.jpg', caption: 'DSC_0227', width: 800, height: 600 },
      { id: '2', url: 'https://x/2.jpg', caption: null, width: 400, height: 300 },
    ])
    const w = await mountSection()

    expect(w.findAll('img').map((img) => img.attributes('src'))).toEqual([
      'https://x/1.jpg',
      'https://x/2.jpg',
    ])
    expect(w.find('figcaption').exists()).toBe(false)
    // Caption is only used as alt text (accessibility), never shown as visible text.
    expect(w.text()).not.toContain('DSC_0227')
  })

  it('uses the caption as alt text for accessibility', async () => {
    mockFetchGalleryImages.mockResolvedValue([
      { id: '1', url: 'https://x/1.jpg', caption: 'Ostermesse', width: 800, height: 600 },
    ])
    const w = await mountSection()

    expect(w.find('img').attributes('alt')).toBe('Ostermesse')
  })

  it('shows an empty-state message when there are no images', async () => {
    mockFetchGalleryImages.mockResolvedValue([])
    const w = await mountSection()

    expect(w.text()).toContain('Noch keine Bilder vorhanden.')
  })

  it('shows an error message when loading images fails', async () => {
    mockFetchGalleryImages.mockRejectedValue(new Error('Netzwerkfehler'))
    const w = await mountSection()

    expect(w.text()).toContain('Netzwerkfehler')
  })

  it('opens a lightbox with the enlarged image when a tile is clicked', async () => {
    mockFetchGalleryImages.mockResolvedValue([
      { id: '1', url: 'https://x/1.jpg', caption: 'Ostermesse', width: 800, height: 600 },
    ])
    const w = await mountSection({ attachTo: document.body })

    expect(w.find('dialog').exists()).toBe(false)

    await w.find('.gallery-item-trigger').trigger('click')
    await flushPromises()

    const dialogImg = w.find('dialog img')
    expect(dialogImg.exists()).toBe(true)
    expect(dialogImg.attributes('src')).toBe('https://x/1.jpg')
    expect(dialogImg.attributes('alt')).toBe('Ostermesse')
    // The lightbox is not another place where captions leak out as visible text.
    expect(w.find('dialog').text()).not.toContain('Ostermesse')

    w.unmount()
  })

  it('closes the lightbox via the close button', async () => {
    mockFetchGalleryImages.mockResolvedValue([
      { id: '1', url: 'https://x/1.jpg', caption: null, width: 800, height: 600 },
    ])
    const w = await mountSection({ attachTo: document.body })
    await w.find('.gallery-item-trigger').trigger('click')
    await flushPromises()
    expect(w.find('dialog').exists()).toBe(true)

    await w.find('.lightbox-close').trigger('click')
    await flushPromises()

    expect(w.find('dialog').exists()).toBe(false)

    w.unmount()
  })

  it('closes the lightbox when the native dialog fires its own close event', async () => {
    // Covers Escape/backdrop-click closing, which the browser handles itself
    // and only notifies the app of via the dialog's native "close" event —
    // distinct from clicking .lightbox-close, which calls closeImage() directly.
    mockFetchGalleryImages.mockResolvedValue([
      { id: '1', url: 'https://x/1.jpg', caption: null, width: 800, height: 600 },
    ])
    const w = await mountSection({ attachTo: document.body })
    await w.find('.gallery-item-trigger').trigger('click')
    await flushPromises()
    expect(w.find('dialog').exists()).toBe(true)

    await w.find('dialog').trigger('close')
    await flushPromises()

    expect(w.find('dialog').exists()).toBe(false)

    w.unmount()
  })

  it.each([
    ['is missing', null],
    ['is empty', ''],
    ['is only blanks', '   '],
  ])('names the image by the fallback text when its caption %s', async (_case, caption) => {
    mockFetchGalleryImages.mockResolvedValue([
      { id: '1', url: 'https://x/1.jpg', caption, width: 800, height: 600 },
    ])
    const w = await mountSection()

    expect(w.find('.gallery-item-trigger img').attributes('alt')).toBe(
      'Impression von Vindobona II',
    )
  })

  it('gives every image its size, so the page does not jump when the image arrives', async () => {
    mockFetchGalleryImages.mockResolvedValue([
      { id: '1', url: 'https://x/1.jpg', caption: null, width: 800, height: 600 },
    ])
    const w = await mountSection()

    expect(w.find('.gallery-item-trigger img').attributes()).toMatchObject({
      width: '800',
      height: '600',
      loading: 'lazy',
    })
  })

  // jsdom has no <dialog>.showModal()/close(); these stand in for the browser's.
  describe('the lightbox dialog', () => {
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
      mockFetchGalleryImages.mockResolvedValue([
        { id: '1', url: 'https://x/1.jpg', caption: 'Ostermesse', width: 800, height: 600 },
        { id: '2', url: 'https://x/2.jpg', caption: null, width: 400, height: 300 },
      ])
    })

    afterEach(() => {
      Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
      Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
    })

    async function openFirstImage() {
      const w = await mountSection({ attachTo: document.body })
      await w.findAll('.gallery-item-trigger')[0]?.trigger('click')
      await flushPromises()
      return w
    }

    it('is opened as a modal, so it covers the page and traps the focus', async () => {
      const w = await openFirstImage()

      expect(showModal).toHaveBeenCalledOnce()
      expect(showModal.mock.contexts[0]).toBe(w.find('dialog').element)
      w.unmount()
    })

    it('shows the image that was clicked, not the first one', async () => {
      const w = await mountSection({ attachTo: document.body })

      await w.findAll('.gallery-item-trigger')[1]?.trigger('click')
      await flushPromises()

      expect(w.find('dialog img').attributes('src')).toBe('https://x/2.jpg')
      expect(w.find('dialog img').attributes('alt')).toBe('Impression von Vindobona II')
      w.unmount()
    })

    it('is closed by a click on the backdrop, which the browser reports as a click on the dialog itself', async () => {
      const w = await openFirstImage()

      await w.find('dialog').trigger('click')
      await flushPromises()

      expect(close).toHaveBeenCalledOnce()
      expect(w.find('dialog').exists()).toBe(false)
      w.unmount()
    })

    it('stays open when the enlarged image itself is clicked', async () => {
      const w = await openFirstImage()

      await w.find('dialog img').trigger('click')
      await flushPromises()

      expect(close).not.toHaveBeenCalled()
      expect(w.find('dialog').exists()).toBe(true)
      w.unmount()
    })

    it('has a close button that is labelled for screen readers', async () => {
      const w = await openFirstImage()

      expect(w.find('.lightbox-close').attributes('aria-label')).toBe('Schließen')
      await w.find('.lightbox-close').trigger('click')

      expect(close).toHaveBeenCalledOnce()
      w.unmount()
    })
  })
})
