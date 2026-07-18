import { onMounted, onUnmounted, ref, type Ref } from 'vue'

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

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          visible.value = true
          observer?.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(target.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { target, visible }
}
