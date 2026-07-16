<script setup lang="ts">
// Order matches the original page's section order (About -> Eindrücke ->
// Programm -> Mitglied werden -> Kontakt), plus the two external links the
// legacy nav also carried (Intern-Login, Facebook, Instagram).
const sectionLinks = [
  { href: '#about', label: 'Über uns' },
  { href: '#eindruecke', label: 'Eindrücke' },
  { href: '#programm', label: 'Programm' },
  { href: '#mitglied-werden', label: 'Mitglied werden' },
  { href: '#kontakt', label: 'Kontakt' },
]

const externalLinks = [
  { href: 'https://intern.vindobona2.at/', label: 'Intern' },
  { href: 'https://www.facebook.com/vindobona2', label: 'Facebook' },
  { href: 'http://www.instagram.com/vindobona2', label: 'Instagram' },
]
</script>

<template>
  <nav class="app-nav">
    <a href="#" class="brand">K.Ö.St.V.<br />Vindobona II</a>
    <div class="links">
      <a v-for="link in sectionLinks" :key="link.href" :href="link.href">{{ link.label }}</a>
      <a
        v-for="link in externalLinks"
        :key="link.href"
        :href="link.href"
        target="_blank"
        rel="noopener"
        >{{ link.label }}</a
      >
    </div>
  </nav>
</template>

<style scoped>
.app-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-primary);
  color: #fff;
}

.brand {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.2;
  text-transform: uppercase;
  color: #fff;
  text-decoration: none;
  text-align: center;
}

.links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem 1.1rem;
}

.links a {
  color: #fff;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
}

.links a:hover {
  color: var(--color-accent);
}

@media (min-width: 700px) {
  .app-nav {
    flex-direction: row;
    justify-content: space-between;
    padding: 0.75rem 2rem;
  }

  .brand {
    text-align: left;
  }
}
</style>
