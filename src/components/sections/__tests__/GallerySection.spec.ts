import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GallerySection from '../GallerySection.vue'

const mockFetchGalleryImages = vi.fn()
vi.mock('@/services/api', () => ({
  fetchGalleryImages: (...args: unknown[]) => mockFetchGalleryImages(...args),
}))

describe('GallerySection', () => {
  beforeEach(() => {
    mockFetchGalleryImages.mockReset()
  })

  it('shows a loading message while fetching', () => {
    mockFetchGalleryImages.mockReturnValue(new Promise(() => {}))
    const w = mount(GallerySection)
    expect(w.text()).toContain('Galerie wird geladen')
  })

  it('renders images with captions once loaded', async () => {
    mockFetchGalleryImages.mockResolvedValue([
      { id: '1', url: 'https://x/1.jpg', caption: 'Ostermesse', width: 800, height: 600 },
      { id: '2', url: 'https://x/2.jpg', caption: null, width: 400, height: 300 },
    ])
    const w = mount(GallerySection)
    await flushPromises()

    expect(w.text()).toContain('Ostermesse')
    expect(w.findAll('img')).toHaveLength(2)
  })

  it('shows an empty-state message when there are no images', async () => {
    mockFetchGalleryImages.mockResolvedValue([])
    const w = mount(GallerySection)
    await flushPromises()

    expect(w.text()).toContain('Noch keine Bilder vorhanden.')
  })

  it('shows an error message when loading fails', async () => {
    mockFetchGalleryImages.mockRejectedValue(new Error('Netzwerkfehler'))
    const w = mount(GallerySection)
    await flushPromises()

    expect(w.text()).toContain('Netzwerkfehler')
  })
})
