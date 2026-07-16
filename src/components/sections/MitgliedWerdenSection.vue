<script setup lang="ts">
const cards = [
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
</script>

<template>
  <section id="mitglied-werden" class="mitglied-werden-section">
    <h2>Wie du Mitglied werden kannst&hellip;</h2>

    <div class="cards">
      <article v-for="card in cards" :key="card.title" class="card">
        <h3>{{ card.title }}</h3>
        <p>{{ card.text }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.mitglied-werden-section {
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  text-align: center;
}

.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  background: var(--color-bg-alt);
}

.card h3 {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
}

.card p {
  margin: 0;
  color: var(--color-text);
}

@media (min-width: 700px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
