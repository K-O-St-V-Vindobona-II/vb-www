# vb-www

Öffentlicher, unauthentifizierter Web-Auftritt von `www.vindobona2.at`. Vue 3
(`<script setup>`, TypeScript, Vite), kein Login, keine Client-seitige
Routing-Bibliothek (Long-Page mit Anchor-Nav).

## Architektur

- Statischer Aufbau, Text/CTA-Inhalte hartcodiert in den Sektions-Komponenten
  (`src/components/sections/`) — analog zur alten, seit Jahren unveränderten Seite.
- Die Bildergalerie (`GallerySection.vue`) wird zur Laufzeit aus `vb-api`
  geladen (`GET /api/public/gallery`, unauthentifiziert). Verwaltet wird sie
  über einen Mini-CMS-Bereich in `vb-intern` ("www-Administration" → "Galerie").
- Der Veranstaltungskalender ist ein einfaches Google-Calendar-iframe-Embed
  (kein Custom-Styling, kein Backend-Proxy nötig).

> Alle zugehörigen Repos liegen in der GitHub-Organisation
> [K-O-St-V-Vindobona-II](https://github.com/K-O-St-V-Vindobona-II).

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

Braucht `VITE_APP_ENVIRONMENT` und `VITE_API_BASE_URL` (siehe `.env.example`) —
Letztere zeigt auf die laufende `vb-api`-Instanz.

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

## Umgebungsvariablen

- `VITE_APP_ENVIRONMENT` (siehe `.env.example`) — welche Stage diese Instanz
  darstellt, steuert nur den Build-Time-Guard in `vite.env-check.ts`.
- `VITE_API_BASE_URL` (siehe `.env.example`) — Basis-URL des Backends, das für
  die Galerie (`GET /api/public/gallery`), die Site-Inhalte
  (`GET /api/public/site-content`) und das Kontaktformular
  (`POST /api/public/contact`) angesprochen wird. Gilt nur für `npm run dev`
  bzw. einen lokalen Build; im Produktions-Image wird sie nicht mehr
  verwendet (siehe Deployment unten).

## Deployment

`Dockerfile` baut ein statisches Nginx-Image. Die Backend-URL wird — genau wie
bei `vb-intern` — als Laufzeit-Konfiguration gelesen, nicht mehr zur Build-Zeit
ins Bundle eingebrannt: ein nginx-Entrypoint-Skript
(`docker/docker-entrypoint.d/40-generate-runtime-config.sh`) generiert bei
jedem Container-Start `config.js` (`window.__APP_CONFIG__`) aus der
unpräfixierten Container-Umgebungsvariable `API_BASE_URL` (siehe
`src/runtimeConfig.ts`). Dasselbe `:latest`-Image läuft damit unverändert auf
jeder Stage — die jeweilige API-URL kommt ausschließlich über die
Container-Umgebung, kein stage-spezifischer Rebuild nötig.

Die CI/CD-Pipeline (`.github/workflows/ci-cd.yml`) baut dieses Image bei jedem
Merge nach `main` automatisch und pusht es nach `ghcr.io`. Das Rollout selbst
läuft außerhalb dieser Pipeline: `podman-auto-update.timer` auf dem Zielsystem
holt das neue `:latest`-Image automatisch, oder ein sofortiger Deploy wird
manuell per `--tags deploy-www` ausgelöst — siehe
[`vb-deploy`s Phase 2 — Tag-2-Betrieb](../vb-deploy/README.md#phase-2--tag-2-betrieb).
