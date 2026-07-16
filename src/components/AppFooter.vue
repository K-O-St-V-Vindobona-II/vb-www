<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <p>&copy; Copyright {{ year }} K.Ö.St.V. Vindobona II Wien | Alle Rechte vorbehalten</p>
    <div class="footer-links">
      <a href="https://www.facebook.com/vindobona2" target="_blank" rel="noopener">Facebook</a>
      <a href="#impressum">Impressum</a>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  text-align: center;
  padding: 2rem 1rem;
  background: var(--color-bg-alt);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.footer-links {
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.footer-links a {
  color: var(--color-text-muted);
}
</style>
