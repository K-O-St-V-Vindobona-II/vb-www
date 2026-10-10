import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

function mountComposable(bindTarget = true) {
  let result!: ReturnType<typeof useScrollReveal>
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useScrollReveal()
        return { target: result.target, visible: result.visible }
      },
      template: bindTarget ? '<div ref="target" />' : '<div />',
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

  it('becomes visible immediately, without observing, when the visitor prefers reduced motion', () => {
    // The observer exists here, so only the reduced-motion check can make the element visible.
    const observer = vi.fn().mockImplementation(function () {
      return { observe: vi.fn(), disconnect: vi.fn() }
    })
    vi.stubGlobal('IntersectionObserver', observer)
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia,
    )
    const { result } = mountComposable()
    expect(result.visible.value).toBe(true)
    expect(observer).not.toHaveBeenCalled()
  })

  it('becomes visible immediately when the target ref was never bound to an element', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn().mockImplementation(function () {
        return { observe: vi.fn(), disconnect: vi.fn() }
      }),
    )
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))

    // bindTarget=false: no `ref="target"` in the template, so it stays null
    // through mount, hitting the composable's own "no element to observe"
    // guard rather than the IntersectionObserver path.
    const { result } = mountComposable(false)

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

  it('reveals an element as soon as any part is in view, however tall it is', () => {
    // A share of the element (a threshold above 0) can never be reached by an element taller than
    // the viewport divided by that share, so a long gallery would stay hidden for ever.
    const observer = vi.fn().mockImplementation(function () {
      return { observe: vi.fn(), disconnect: vi.fn() }
    })
    vi.stubGlobal('IntersectionObserver', observer)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))

    mountComposable()

    expect(observer).toHaveBeenCalledWith(expect.any(Function), {
      threshold: 0,
      rootMargin: '0px 0px -10% 0px',
    })
  })

  it('observes the bound element and stops observing when the component goes away', () => {
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn().mockImplementation(function () {
        return { observe, disconnect }
      }),
    )
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))

    const { wrapper } = mountComposable()

    expect(observe).toHaveBeenCalledWith(wrapper.element)
    expect(disconnect).not.toHaveBeenCalled()

    wrapper.unmount()

    expect(disconnect).toHaveBeenCalledOnce()
  })
})
