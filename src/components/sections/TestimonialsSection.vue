<script setup lang="ts">
import { useScrollReveal } from '@/composables/useScrollReveal'

// Restored content: these two quotes existed on the legacy WordPress site
// (between Programm and Mitglied werden) but were missed in the initial
// migration to this SPA.
const testimonials = [
  {
    quote:
      'Als ich das erste Mal bei einer Verbindung war, war ich sofort begeistert und fühlte mich in der Gemeinschaft aufgehoben.',
    author: 'Ein Fuchs',
  },
  {
    quote: 'Durch die Verbindung hab ich herausgefunden, was mich interessiert.',
    author: 'Ein Junger Aktiver',
  },
]

const { target, visible } = useScrollReveal()
</script>

<template>
  <section ref="target" class="testimonials-section reveal" :class="{ 'is-visible': visible }">
    <div class="testimonial-grid">
      <blockquote v-for="t in testimonials" :key="t.author" class="testimonial-card">
        <span class="quote-mark" aria-hidden="true">&ldquo;</span>
        <p class="quote-text">{{ t.quote }}</p>
        <footer class="quote-author">{{ t.author }}</footer>
      </blockquote>
    </div>
  </section>
</template>

<style scoped>
.testimonials-section {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.testimonial-grid {
  display: grid;
  gap: 1.25rem;
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

@media (min-width: 700px) {
  .testimonial-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
