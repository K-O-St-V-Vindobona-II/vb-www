<script setup lang="ts">
import heroImage from '@/assets/images/hero.jpg'
</script>

<template>
  <section class="hero">
    <div class="hero-bg" :style="{ backgroundImage: `url(${heroImage})` }" />
    <div class="overlay" />
    <div class="content">
      <h1>Vindobona II</h1>
      <p class="subtitle">Deine Verbindung in Wien</p>
      <p class="motto">Numquam retro&hellip; ein Leben lang</p>
    </div>
    <a href="#about" class="scroll-hint" aria-hidden="true">
      <span class="scroll-chevron" />
    </a>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 45svh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* Slow, subtle "Ken Burns" drift — purely decorative, so it's skipped
     entirely when the visitor prefers reduced motion. */
  animation: hero-drift 20s ease-in-out infinite alternate;
}

@keyframes hero-drift {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.12);
  }
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(var(--color-primary-rgb), 0.55) 0%,
    rgba(0, 0, 0, 0.65) 100%
  );
}

.content {
  position: relative;
  width: 100%;
  max-width: 900px;
  text-align: center;
  padding: 3rem 1.5rem;
}

h1 {
  font-size: clamp(2.2rem, 8vw, 4.5rem);
  margin-bottom: 0.25rem;
  color: #fff;
  letter-spacing: 0.02em;
}

.subtitle {
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  color: #fff;
  margin: 0 0 1rem;
}

.motto {
  font-style: italic;
  color: #e6e6e6;
  margin: 0;
}

.scroll-hint {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: block;
  width: 1.75rem;
  height: 1.75rem;
}

.scroll-chevron {
  display: block;
  width: 0.9rem;
  height: 0.9rem;
  margin: 0 auto;
  border-right: 3px solid #fff;
  border-bottom: 3px solid #fff;
  transform: rotate(45deg);
  animation: hero-bounce 1.8s ease-in-out infinite;
}

@keyframes hero-bounce {
  0%,
  100% {
    transform: rotate(45deg) translate(0, 0);
  }
  50% {
    transform: rotate(45deg) translate(0.35rem, 0.35rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-bg {
    animation: none;
  }
  .scroll-chevron {
    animation: none;
  }
}

@media (min-width: 700px) {
  .hero {
    min-height: 60svh;
  }
}
</style>
