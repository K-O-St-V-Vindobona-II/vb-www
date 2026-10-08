import { onMounted, onUnmounted, ref, type Ref } from 'vue'

// The element counts as "in view" as soon as any part of it is inside the viewport, minus a strip
// at the bottom edge so the fade-in is seen rather than happening below the fold. A share of the
// element (`threshold: 0.15`) is not an option: the visible part can never exceed the viewport, so
// an element taller than about 6.7 viewports (a long gallery on a phone) would never reveal.
const REVEAL_OPTIONS: IntersectionObserverInit = { threshold: 0, rootMargin: '0px 0px -10% 0px' }

// Fades/slides an element in once it scrolls into view. Falls back to
// immediately visible when IntersectionObserver isn't available (older
// browsers, jsdom in tests) or the visitor prefers reduced motion —
// the effect is purely decorative, never a prerequisite for reading content.
export function useScrollReveal(): { target: Ref<HTMLElement | null>; visible: Ref<boolean> } {
  const target = ref<HTMLElement | null>(null)
  const visible = ref(false)

  const prefersReducedMotion = (): boolean =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) {
      visible.value = true
      return
    }
    if (!target.value) {
      visible.value = true
      return
    }

    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        visible.value = true
        observer?.disconnect()
      }
    }, REVEAL_OPTIONS)
    observer.observe(target.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { target, visible }
}
