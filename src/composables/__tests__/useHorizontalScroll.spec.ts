import { describe, it, expect, vi, afterEach } from 'vitest'
import { useHorizontalScroll } from '@/composables/useHorizontalScroll'

function fakeElement(clientWidth: number) {
  const el = document.createElement('div')
  Object.defineProperty(el, 'clientWidth', { value: clientWidth, configurable: true })
  el.scrollBy = vi.fn()
  return el
}

describe('useHorizontalScroll', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does nothing when the container ref is not set', () => {
    const { scrollByAmount } = useHorizontalScroll()
    expect(() => scrollByAmount('left')).not.toThrow()
  })

  it('scrolls right by roughly 90% of the container width', () => {
    const { container, scrollByAmount } = useHorizontalScroll()
    const el = fakeElement(400)
    container.value = el

    scrollByAmount('right')

    expect(el.scrollBy).toHaveBeenCalledWith({ left: 360, behavior: 'smooth' })
  })

  it('scrolls left with a negative offset', () => {
    const { container, scrollByAmount } = useHorizontalScroll()
    const el = fakeElement(400)
    container.value = el

    scrollByAmount('left')

    expect(el.scrollBy).toHaveBeenCalledWith({ left: -360, behavior: 'smooth' })
  })

  it('uses instant scrolling when the visitor prefers reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia,
    )

    const { container, scrollByAmount } = useHorizontalScroll()
    const el = fakeElement(400)
    container.value = el

    scrollByAmount('right')

    expect(el.scrollBy).toHaveBeenCalledWith({ left: 360, behavior: 'auto' })
  })
})
