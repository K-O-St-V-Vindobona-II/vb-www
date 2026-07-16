import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGallery } from '@/composables/useGallery'

const mockFetchGalleryImages = vi.fn()
vi.mock('@/services/api', () => ({
  fetchGalleryImages: (...args: unknown[]) => mockFetchGalleryImages(...args),
}))

describe('useGallery', () => {
  beforeEach(() => {
    mockFetchGalleryImages.mockReset()
  })

  it('starts in a loading state with no images', () => {
    const { images, loading, error } = useGallery()
    expect(loading.value).toBe(true)
    expect(images.value).toEqual([])
    expect(error.value).toBeNull()
  })

  it('load() populates images and clears the loading state', async () => {
    mockFetchGalleryImages.mockResolvedValue([
      { id: '1', url: 'https://x/1.jpg', caption: 'Bild 1', width: 100, height: 100 },
    ])

    const { images, loading, error, load } = useGallery()
    await load()

    expect(loading.value).toBe(false)
    expect(images.value).toHaveLength(1)
    expect(error.value).toBeNull()
  })

  it('load() exposes an error message on failure', async () => {
    mockFetchGalleryImages.mockRejectedValue(new Error('Netzwerkfehler'))

    const { images, error, load } = useGallery()
    await load()

    expect(images.value).toEqual([])
    expect(error.value).toBe('Netzwerkfehler')
  })

  it('load() falls back to a generic message for non-Error rejections', async () => {
    mockFetchGalleryImages.mockRejectedValue('boom')

    const { error, load } = useGallery()
    await load()

    expect(error.value).toBe('Galerie konnte nicht geladen werden.')
  })

  it('load() clears a previous error on a successful retry', async () => {
    mockFetchGalleryImages.mockRejectedValueOnce(new Error('Netzwerkfehler'))
    const { images, error, load } = useGallery()
    await load()
    expect(error.value).toBe('Netzwerkfehler')

    mockFetchGalleryImages.mockResolvedValueOnce([])
    await load()
    expect(error.value).toBeNull()
    expect(images.value).toEqual([])
  })
})
