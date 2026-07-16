# vb-www

Öffentlicher, unauthentifizierter Web-Auftritt von `www.vindobona2.at` — löst die
bisherige WordPress-Installation ab. Vue 3 (`<script setup>`, TypeScript, Vite),
kein Login, keine Client-seitige Routing-Bibliothek (Long-Page mit Anchor-Nav).

## Architektur

- Statischer Aufbau, Text/CTA-Inhalte hartcodiert in den Sektions-Komponenten
  (`src/components/sections/`) — analog zur alten, seit Jahren unveränderten Seite.
- Die Bildergalerie (`GallerySection.vue`) wird zur Laufzeit aus `vb-api`
  geladen (`GET /api/public/gallery`, unauthentifiziert). Verwaltet wird sie
  über einen Mini-CMS-Bereich in `vb-intern` ("www-Administration" → "Galerie").
- Der Veranstaltungskalender ist ein einfaches Google-Calendar-iframe-Embed
  (kein Custom-Styling, kein Backend-Proxy nötig).
- Das Kontaktformular postet an `POST /api/public/contact` (Honeypot-Feld statt
  reCAPTCHA — kein externer Dienst nötig).
- Fonts (Catamaran, PT Sans) sind selbst gehostet (`src/assets/fonts/`), nicht
  von Google Fonts CDN geladen (vermeidet die DSGVO-Diskussion um
  fonts.gstatic.com).

## Projekt-Setup

```sh
npm install
```

### Nach dem Klonen

```sh
# Git-Hooks installieren — einmalig pro Klon nötig, verhindert CI-Fehlschläge durch Formatierungs-Abweichungen
pre-commit install
```

### Entwicklung (Hot-Reload)

```sh
npm run dev
```

Braucht `VITE_API_BASE_URL` (siehe `.env.example`) — zeigt auf die laufende
`vb-api`-Instanz.

### Type-Check, Build für Produktion

```sh
npm run build
```

### Tests

```sh
npm run test:unit        # Watch-Modus
npm run test:coverage    # Einmaliger Lauf mit Coverage-Report
```

### Linting

```sh
npm run lint
npm run lint:fix
```

## Deployment

`Dockerfile` baut ein statisches Nginx-Image (`VITE_API_BASE_URL` als Build-Arg,
siehe Kommentar im Dockerfile — bewusst Build-Zeit statt Runtime-Config wie bei
`vb-intern`, da hier keine deploymentspezifischen Secrets im Bundle landen).
