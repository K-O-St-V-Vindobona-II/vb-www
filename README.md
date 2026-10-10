# vb-www

Public, unauthenticated web presence of `www.vindobona2.at`. Vue 3
(`<script setup>`, TypeScript, Vite), no login, no client-side routing
library (long page with anchor navigation).

## Architecture

- The hero, membership and contact sections keep their text in the section
  components (`src/components/sections/`). Everything the club edits — the about
  tabs, programme hints and calendar, quotes, social links, the video and the
  gallery heading — is loaded from `vb-api` at runtime
  (`GET /api/public/site-content`, unauthenticated) and managed in the
  mini-CMS area of `vb-intern` ("www administration").
- The image gallery (`GallerySection.vue`) is loaded from `vb-api` at
  runtime (`GET /api/public/gallery`, unauthenticated). It's managed via a
  mini-CMS area in `vb-intern` ("www administration" → "Gallery").
- The event calendar is a simple Google Calendar iframe embed (no custom
  styling, no backend proxy needed).

> All related repos live in the [K-O-St-V-Vindobona-II](https://github.com/K-O-St-V-Vindobona-II) GitHub organization.

- The contact form posts to `POST /api/public/contact` (a honeypot field
  instead of reCAPTCHA — no external service needed).
- The site uses the visitor's system fonts (`--font-body` in `src/style.css`):
  no font files to host or license, and no request to a font service.

## Project Setup

```sh
npm install
```

### After cloning

```sh
# Install git hooks — required once per clone, prevents CI failures from formatting mismatches
pre-commit install
```

### Development (hot reload)

```sh
npm run dev
```

Needs `VITE_APP_ENVIRONMENT` and `VITE_API_BASE_URL` (see `.env.example`) —
the latter points at the running `vb-api` instance.

### Type-check, build for production

```sh
npm run build
```

### Tests

```sh
npm run test:unit        # watch mode
npm run test:coverage    # single run with coverage report
```

### Linting

```sh
npm run lint
npm run lint:fix
```

## Environment Variables

- `VITE_APP_ENVIRONMENT` (see `.env.example`) — which stage this instance
  represents, only controls the build-time guard in `vite.env-check.ts`.
- `VITE_API_BASE_URL` (see `.env.example`) — base URL of the backend used
  for the gallery (`GET /api/public/gallery`), the site content
  (`GET /api/public/site-content`), and the contact form
  (`POST /api/public/contact`). Only applies to `npm run dev` or a local
  build; the production image no longer uses it (see Deployment below).

## Deployment

`Dockerfile` builds a static nginx image on `nginx-unprivileged`: nginx runs
as an unprivileged user (uid 101) and listens on port **8080**, not 80, so the
container needs no capabilities at all. The backend URL — just like in
`vb-intern` — is read as runtime configuration rather than baked into the
bundle at build time: an nginx entrypoint script
(`docker/docker-entrypoint.d/40-generate-runtime-config.sh`) generates
`config.js` (`window.__APP_CONFIG__`) on every container start from the
unprefixed container environment variable `API_BASE_URL` (see
`src/runtimeConfig.ts`). The same `:latest` image thus runs unchanged on
every stage — the respective API URL comes exclusively from the container
environment, no stage-specific rebuild needed. The hook refuses to start the
container when `API_BASE_URL` is missing, is not a plain `http://`/`https://`
URL, or contains a character that could end the JavaScript string it is
written into (quote, backslash, angle bracket, `$`, backtick, whitespace).

The CI/CD pipeline (`.github/workflows/ci-cd.yml`) builds this image
automatically on every merge to `main` and pushes it to `ghcr.io` (only from
`main`; a run on another branch never publishes `:latest`), after a smoke test
that boots the image read-only with all capabilities dropped and checks what it
serves. The
rollout itself happens outside this pipeline: the target system's own
`podman-auto-update.timer` picks up the new `:latest` image automatically,
or an immediate deploy is triggered manually via `--tags deploy-www` — see
[`vb-deploy`'s Phase 2 — Day-2 Operations](../vb-deploy/README.md#phase-2--day-2-operations).

---

# Deutsch

Öffentlicher, unauthentifizierter Web-Auftritt von `www.vindobona2.at`. Vue 3
(`<script setup>`, TypeScript, Vite), kein Login, keine Client-seitige
Routing-Bibliothek (Long-Page mit Anchor-Nav).

## Architektur

- Die Sektionen Hero, Mitglied werden und Kontakt halten ihren Text in den
  Sektions-Komponenten (`src/components/sections/`). Alles, was der Verein
  selbst pflegt — About-Tabs, Programm-Hinweise und -Kalender, Zitate,
  Social-Links, das Video und die Galerie-Überschrift — wird zur Laufzeit aus
  `vb-api` geladen (`GET /api/public/site-content`, unauthentifiziert) und im
  Mini-CMS-Bereich von `vb-intern` ("www-Administration") verwaltet.
- Die Bildergalerie (`GallerySection.vue`) wird zur Laufzeit aus `vb-api`
  geladen (`GET /api/public/gallery`, unauthentifiziert). Verwaltet wird sie
  über einen Mini-CMS-Bereich in `vb-intern` ("www-Administration" → "Galerie").
- Der Veranstaltungskalender ist ein einfaches Google-Calendar-iframe-Embed
  (kein Custom-Styling, kein Backend-Proxy nötig).

> Alle zugehörigen Repos liegen in der GitHub-Organisation
> [K-O-St-V-Vindobona-II](https://github.com/K-O-St-V-Vindobona-II).

- Das Kontaktformular postet an `POST /api/public/contact` (Honeypot-Feld statt
  reCAPTCHA — kein externer Dienst nötig).
- Die Seite verwendet die Systemschriften der Besucher (`--font-body` in
  `src/style.css`): keine Font-Dateien zu hosten oder zu lizenzieren und keine
  Anfrage an einen Schriftendienst.

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

`Dockerfile` baut ein statisches Nginx-Image auf `nginx-unprivileged`: nginx
läuft als unprivilegierter Benutzer (uid 101) und lauscht auf Port **8080**,
nicht 80, der Container braucht daher keinerlei Capabilities. Die Backend-URL
wird — genau wie bei `vb-intern` — als Laufzeit-Konfiguration gelesen, nicht mehr zur Build-Zeit
ins Bundle eingebrannt: ein nginx-Entrypoint-Skript
(`docker/docker-entrypoint.d/40-generate-runtime-config.sh`) generiert bei
jedem Container-Start `config.js` (`window.__APP_CONFIG__`) aus der
unpräfixierten Container-Umgebungsvariable `API_BASE_URL` (siehe
`src/runtimeConfig.ts`). Dasselbe `:latest`-Image läuft damit unverändert auf
jeder Stage — die jeweilige API-URL kommt ausschließlich über die
Container-Umgebung, kein stage-spezifischer Rebuild nötig. Das Skript
verweigert den Container-Start, wenn `API_BASE_URL` fehlt, keine einfache
`http://`/`https://`-URL ist oder ein Zeichen enthält, das den JavaScript-String,
in den sie geschrieben wird, beenden könnte (Anführungszeichen, Backslash,
spitze Klammer, `$`, Backtick, Leerraum).

Die CI/CD-Pipeline (`.github/workflows/ci-cd.yml`) baut dieses Image bei jedem
Merge nach `main` automatisch und pusht es nach `ghcr.io` (nur von `main`; ein
Lauf auf einem anderen Branch veröffentlicht nie `:latest`), nach einem
Smoke-Test, der das Image schreibgeschützt und ohne jede Capability startet und
prüft, was es ausliefert. Das Rollout selbst
läuft außerhalb dieser Pipeline: `podman-auto-update.timer` auf dem Zielsystem
holt das neue `:latest`-Image automatisch, oder ein sofortiger Deploy wird
manuell per `--tags deploy-www` ausgelöst — siehe
[`vb-deploy`s Phase 2 — Tag-2-Betrieb](../vb-deploy/README.md#phase-2--tag-2-betrieb).
