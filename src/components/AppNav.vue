<script setup lang="ts">
import { ref } from 'vue'

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

// Links stay in the DOM at all times (never v-if'd away) — only their
// visibility on narrow screens is CSS-driven. That way the mobile menu is
// purely a presentation toggle, not a structural one.
const isOpen = ref(false)
const closeMenu = () => {
  isOpen.value = false
}
</script>

<template>
  <nav class="app-nav">
    <div class="nav-bar">
      <a href="#" class="brand">K.Ö.St.V.<br />Vindobona II</a>
      <button
        type="button"
        class="menu-toggle"
        aria-controls="nav-panel"
        :aria-expanded="isOpen"
        aria-label="Menü öffnen/schließen"
        @click="isOpen = !isOpen"
      >
        <span class="menu-toggle-bar" />
        <span class="menu-toggle-bar" />
        <span class="menu-toggle-bar" />
      </button>
    </div>

    <div id="nav-panel" class="links" :class="{ 'is-open': isOpen }">
      <a v-for="link in sectionLinks" :key="link.href" :href="link.href" @click="closeMenu">{{
        link.label
      }}</a>
      <a
        v-for="link in externalLinks"
        :key="link.href"
        :href="link.href"
        target="_blank"
        rel="noopener"
        @click="closeMenu"
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
  background: rgba(var(--color-primary-rgb), 0.85);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  color: #fff;
  box-shadow: var(--shadow-sm);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
}

.brand {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.2;
  text-transform: uppercase;
  color: #fff;
  text-decoration: none;
}

.menu-toggle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.menu-toggle-bar {
  display: block;
  height: 2px;
  border-radius: 2px;
  background: #fff;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

/* Mobile: links live in a collapsible panel below the bar, hidden by
   default and slid open by toggling `.is-open` (height-animated so it
   works without a fixed pixel height and respects reduced-motion). */
.links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  max-height: 0;
  overflow: hidden;
  padding: 0 1rem;
  transition:
    max-height 0.3s ease,
    padding 0.3s ease;
}

.links.is-open {
  max-height: 20rem;
  padding: 0.25rem 1rem 1rem;
}

.links a {
  position: relative;
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding-bottom: 0.15rem;
}

.links a::after {
  content: '';
  position: absolute;
  left: 0;
  right: 100%;
  bottom: 0;
  height: 2px;
  background: var(--color-accent);
  transition: right 0.25s ease;
}

.links a:hover::after,
.links a:focus-visible::after {
  right: 0;
}

@media (prefers-reduced-motion: reduce) {
  .menu-toggle-bar,
  .links,
  .links a::after {
    transition: none;
  }
}

@media (min-width: 700px) {
  .nav-bar {
    padding: 0.75rem 2rem;
  }

  .menu-toggle {
    display: none;
  }

  .links {
    flex-direction: row;
    max-height: none;
    overflow: visible;
    padding: 0 2rem 0.75rem;
  }
}
</style>
