<script setup lang="ts">
import heroImage from '@/assets/images/hero.jpg'
</script>

<template>
  <section class="hero" :style="{ backgroundImage: `url(${heroImage})` }">
    <div class="overlay">
      <h1>Vindobona II</h1>
      <p class="subtitle">Deine Verbindung in Wien</p>
      <p class="motto">Numquam retro&hellip; ein Leben lang</p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 40vh;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.overlay {
  width: 100%;
  text-align: center;
  padding: 3rem 1.5rem;
  background: rgba(0, 0, 0, 0.55);
}

h1 {
  font-size: 2.2rem;
  margin-bottom: 0.25rem;
  color: #fff;
}

.subtitle {
  font-size: 1.1rem;
  color: #fff;
  margin: 0 0 1rem;
}

.motto {
  font-style: italic;
  color: #e6e6e6;
  margin: 0;
}

@media (min-width: 700px) {
  .hero {
    min-height: 50vh;
  }

  h1 {
    font-size: 3rem;
  }
}
</style>
