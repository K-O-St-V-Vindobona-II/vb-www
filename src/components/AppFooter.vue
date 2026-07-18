<script setup lang="ts">
import { ref } from 'vue'

const year = new Date().getFullYear()

// The legacy WordPress footer's "Impressum" link was already a dead `href="#"`
// with no recoverable modal content (confirmed against the live production
// HTML) — this dialog replaces it with real, confirmed content instead of
// another dead anchor.
const impressumRef = ref<HTMLDialogElement | null>(null)

const openImpressum = () => {
  impressumRef.value?.showModal?.()
}

const closeImpressum = () => {
  impressumRef.value?.close?.()
}
</script>

<template>
  <footer class="app-footer">
    <p>&copy; Copyright {{ year }} K.Ö.St.V. Vindobona II Wien | Alle Rechte vorbehalten</p>
    <div class="footer-links">
      <a href="https://www.facebook.com/vindobona2" target="_blank" rel="noopener">Facebook</a>
      <button type="button" class="impressum-trigger" @click="openImpressum">Impressum</button>
    </div>

    <dialog ref="impressumRef" class="impressum-dialog">
      <button type="button" class="dialog-close" aria-label="Schließen" @click="closeImpressum">
        &times;
      </button>
      <h2>Impressum</h2>
      <dl>
        <dt>Medieninhaber, Herausgeber und Vereinssitz</dt>
        <dd>K.Ö.St.V. Vindobona II Wien, Rooseveltplatz 8/Sout., 1090 Wien</dd>

        <dt>ZVR-Zahl</dt>
        <dd>828508820</dd>

        <dt>Kontakt</dt>
        <dd>
          <a href="mailto:vindoboneninfo@gmail.com">vindoboneninfo@gmail.com</a>
        </dd>
      </dl>
    </dialog>
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
  align-items: center;
  gap: 1.5rem;
}

.footer-links a {
  color: var(--color-text-muted);
}

.impressum-trigger {
  font: inherit;
  color: var(--color-text-muted);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
}

.impressum-trigger:hover,
.impressum-trigger:focus-visible {
  color: var(--color-primary);
}

.impressum-dialog {
  position: relative;
  max-width: min(90vw, 560px);
  max-height: 85vh;
  overflow-y: auto;
  border: none;
  border-radius: var(--radius-lg);
  padding: 2rem 1.75rem 1.75rem;
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-lg);
  text-align: left;
}

.impressum-dialog::backdrop {
  background: rgba(0, 0, 0, 0.6);
}

.impressum-dialog dt {
  font-weight: 700;
  margin-top: 1rem;
}

.impressum-dialog dd {
  margin: 0.15rem 0 0;
}

.dialog-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 50%;
  background: var(--color-bg-alt);
  color: var(--color-text);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}
</style>
