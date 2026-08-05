import { ref, type Ref } from 'vue'

export type ScrollDirection = 'left' | 'right'

interface UseHorizontalScroll {
  container: Ref<HTMLElement | null>
  scrollByAmount: (direction: ScrollDirection) => void
}

const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Scrolls a horizontally-overflowing container by roughly one "page" per
 * arrow click — used by TestimonialsSection.vue's quote carousel (only
 * shown once there are more quotes than fit without scrolling).
 */
export function useHorizontalScroll(): UseHorizontalScroll {
  const container = ref<HTMLElement | null>(null)

  const scrollByAmount = (direction: ScrollDirection) => {
    const el = container.value
    if (!el) return

    const amount = el.clientWidth * 0.9
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  return { container, scrollByAmount }
}
