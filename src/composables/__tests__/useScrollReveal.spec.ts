import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

function mountComposable() {
  let result!: ReturnType<typeof useScrollReveal>
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useScrollReveal()
        return { target: result.target, visible: result.visible }
      },
      template: '<div ref="target" />',
    }),
  )
  return { wrapper, result }
}

describe('useScrollReveal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('becomes visible immediately when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { result } = mountComposable()
    expect(result.visible.value).toBe(true)
  })

  it('becomes visible immediately when the visitor prefers reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia,
    )
    const { result } = mountComposable()
    expect(result.visible.value).toBe(true)
  })

  it('stays hidden until the observed element intersects, then reveals and disconnects', () => {
    let capturedCallback: IntersectionObserverCallback | null = null
    const disconnect = vi.fn()
    const observe = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      // A regular function, not an arrow function: `new IntersectionObserver(...)`
      // requires the mock implementation itself to be constructible.
      vi.fn().mockImplementation(function (callback: IntersectionObserverCallback) {
        capturedCallback = callback
        return { observe, disconnect }
      }),
    )
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))

    const { result } = mountComposable()

    expect(result.visible.value).toBe(false)
    expect(observe).toHaveBeenCalledOnce()

    capturedCallback!([{ isIntersecting: true } as IntersectionObserverEntry], {} as never)

    expect(result.visible.value).toBe(true)
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('ignores non-intersecting entries', () => {
    let capturedCallback: IntersectionObserverCallback | null = null
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn().mockImplementation(function (callback: IntersectionObserverCallback) {
        capturedCallback = callback
        return { observe: vi.fn(), disconnect: vi.fn() }
      }),
    )
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))

    const { result } = mountComposable()
    capturedCallback!([{ isIntersecting: false } as IntersectionObserverEntry], {} as never)

    expect(result.visible.value).toBe(false)
  })
})
