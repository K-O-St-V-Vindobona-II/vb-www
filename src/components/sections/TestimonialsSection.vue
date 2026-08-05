<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { useSiteContent } from '@/composables/useSiteContent'
import { useHorizontalScroll } from '@/composables/useHorizontalScroll'

const { content, loading, error, load } = useSiteContent()
onMounted(load)

const quotes = computed(() => content.value?.quotes ?? [])
// More than 2 quotes no longer fit side by side without feeling cramped —
// switch to a horizontally scrollable carousel with arrow controls instead
// of ever-shrinking grid columns.
const isCarousel = computed(() => quotes.value.length > 2)

// container, like target below, is bound via the template's `ref="container"`
// only, which vue-tsc's project-references build mode doesn't trace for
// noUnusedLocals purposes.
const { container, scrollByAmount } = useHorizontalScroll()
void container

// target is bound via the template's `ref="target"` only, which vue-tsc's
// project-references build mode doesn't trace for noUnusedLocals purposes.
const { target, visible } = useScrollReveal()
void target
</script>

<template>
  <section ref="target" class="testimonials-section reveal" :class="{ 'is-visible': visible }">
    <p v-if="loading" class="status-message">Wird geladen&hellip;</p>
    <p v-else-if="error" class="status-message">{{ error }}</p>

    <div v-else-if="quotes.length > 0" class="testimonials-wrapper">
      <button
        v-if="isCarousel"
        type="button"
        class="scroll-arrow"
        aria-label="Vorherige Zitate"
        @click="scrollByAmount('left')"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <div ref="container" class="testimonial-grid" :class="{ 'is-carousel': isCarousel }">
        <blockquote v-for="q in quotes" :key="q.id" class="testimonial-card">
          <span class="quote-mark" aria-hidden="true">&ldquo;</span>
          <p class="quote-text">{{ q.quote }}</p>
          <footer class="quote-author">{{ q.author }}</footer>
        </blockquote>
      </div>

      <button
        v-if="isCarousel"
        type="button"
        class="scroll-arrow"
        aria-label="Weitere Zitate"
        @click="scrollByAmount('right')"
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.testimonials-section {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.status-message {
  color: var(--color-text-muted);
  text-align: center;
}

.testimonials-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.testimonial-grid {
  display: grid;
  gap: 1.25rem;
  flex: 1;
  min-width: 0;
}

.testimonial-grid.is-carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding-bottom: 0.25rem;
}

.testimonial-grid.is-carousel .testimonial-card {
  flex: 0 0 min(320px, 85%);
  scroll-snap-align: start;
}

.testimonial-card {
  position: relative;
  margin: 0;
  padding: 1.75rem 1.5rem 1.5rem;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.quote-mark {
  position: absolute;
  top: -0.25rem;
  left: 1.25rem;
  font-family: var(--font-heading);
  font-size: 3.5rem;
  line-height: 1;
  color: var(--color-accent);
  opacity: 0.6;
}

.quote-text {
  margin: 1rem 0 1rem;
  font-style: italic;
  line-height: 1.6;
}

.quote-author {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 0.9rem;
}

/* Dezent: a small, unobtrusive round button, not a heavy carousel control. */
.scroll-arrow {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.scroll-arrow:hover,
.scroll-arrow:focus-visible {
  background: var(--color-accent);
  color: #fff;
}

@media (min-width: 700px) {
  .testimonial-grid:not(.is-carousel) {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .testimonial-grid.is-carousel {
    scroll-behavior: auto;
  }

  .scroll-arrow {
    transition: none;
  }
}
</style>
