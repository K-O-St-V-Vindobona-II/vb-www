<script setup lang="ts">
import { useScrollReveal } from '@/composables/useScrollReveal'

const steps = [
  {
    title: 'Komm vorbei',
    text: 'Komm vorbei und erlebe eine coleurstudentische Veranstaltung!',
  },
  {
    title: 'Lerne uns als Fuchs kennen',
    text: 'Als Fuchs eröffnet sich die Möglichkeit, die Verbindung mit allem Für und Wider kennenzulernen.',
  },
  {
    title: 'Werde aktiver Bursch bei uns',
    text: 'Nach deiner Zeit als Fuchs fällt die Entscheidung über die offizielle Vollaufnahme.',
  },
]

const { target, visible } = useScrollReveal()
</script>

<template>
  <section
    id="mitglied-werden"
    ref="target"
    class="mitglied-werden-section reveal"
    :class="{ 'is-visible': visible }"
  >
    <h2>Wie du Mitglied werden kannst&hellip;</h2>

    <ol class="timeline">
      <li v-for="(step, index) in steps" :key="step.title" class="step">
        <div class="step-marker">
          <span class="step-number">{{ index + 1 }}</span>
        </div>
        <div class="step-body">
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.mitglied-werden-section {
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  text-align: center;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  align-items: stretch;
  gap: 1rem;
  text-align: left;
}

.step-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.step-number {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: #fff;
  font-family: var(--font-heading);
  font-weight: 700;
  box-shadow: var(--shadow-sm);
}

.step-marker::after {
  content: '';
  flex: 1;
  width: 2px;
  margin-top: 0.35rem;
  background: var(--color-border);
}

.step:last-child .step-marker::after {
  display: none;
}

.step-body {
  padding-bottom: 0.25rem;
}

.step-body h3 {
  font-size: 1.05rem;
  margin-bottom: 0.35rem;
}

.step-body p {
  margin: 0;
  color: var(--color-text);
}

@media (min-width: 700px) {
  .timeline {
    flex-direction: row;
  }

  .step {
    flex: 1;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  /* The number is centered in its own column; the connector is drawn as a
     full-width line behind it (center-to-center across columns) instead of
     living inside the same flex row, which is what previously pushed the
     circle to the left edge of the column. */
  .step-marker {
    position: relative;
    justify-content: center;
    width: 100%;
  }

  .step-marker::after {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 2px;
    margin: 0;
    transform: translateY(-50%);
  }

  .step-body {
    padding: 0 0.5rem;
  }
}
</style>
