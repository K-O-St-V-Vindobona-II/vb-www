# vb-www

[English](README.md) | [Deutsch](README.de.md)

Die öffentliche Website des Vereins Vindobona II. Dieses README behandelt, was für dieses Repository spezifisch ist, und setzt das [`vb-deploy`-README](https://github.com/K-O-St-V-Vindobona-II/vb-deploy/blob/main/README.de.md) voraus, das führende Dokument dafür, wie das ganze System aufgebaut ist, betrieben und wiederhergestellt wird. Alle vier Repositories liegen in der GitHub-Organisation [K-O-St-V-Vindobona-II](https://github.com/K-O-St-V-Vindobona-II).

## 1. Aufgabe und Namenskonvention

`vb-www` ist das **öffentliche Frontend**: die Website, die jeder ohne Anmeldung öffnen kann (der Verein, wie man Mitglied wird, das Programm und der Veranstaltungskalender, eine Galerie, ein Video, Zitate, Social-Media-Verweise und ein Kontaktformular). Sie ist eine lange Seite mit Anker-Navigation und ohne Routing-Bibliothek im Browser. Die Texte, die der Verein pflegt, gehören nicht zu diesem Repository: Sie werden im Verwaltungsbereich von [`vb-intern`](https://github.com/K-O-St-V-Vindobona-II/vb-intern) ("www-Administration") gepflegt und von [`vb-api`](https://github.com/K-O-St-V-Vindobona-II/vb-api) ausgeliefert.

**Namenskonvention:** Der Repository-Name ist die Subdomain. `vb-www` wird unter **`www.vindobona2.at`** ausgeliefert (und `vb-api` unter `api.vindobona2.at`, `vb-intern` unter `intern.vindobona2.at`). Auf anderen Stages kommen die Domains aus dem Inventory der Stage in `vb-deploy`.

Tech-Stack: Vue 3 (`<script setup>`, TypeScript), Vite, in Produktion von nginx ausgeliefert. Die Seite nutzt die Systemschriften des Besuchers, es gibt also keine Schriftdateien zu hosten und keine Anfrage an einen Schriftdienst.

## 2. Container dieses Repositories

Ein Container: **`vb-www`**, in einem eigenen Pod `vb-www-pod`. Er hat keine Datenbank und kein Sidecar. Auf der lokalen Entwicklungs-Stage ist derselbe Name ein einfacher Container mit dem Vite-Dev-Server statt nginx.

| Container | Pod | Image | Führt Code dieses Repositories aus? |
|---|---|---|---|
| `vb-www` | `vb-www-pod` | `ghcr.io/k-o-st-v-vindobona-ii/vb-www` | **Ja**, die gebaute Website |

Quadlet-Definition, Port und Härtung stehen in `vb-deploy` (Kapitel [1.4](https://github.com/K-O-St-V-Vindobona-II/vb-deploy/blob/main/README.de.md#14-container-und-pods)).

## 3. Was der Container tut

`vb-www` liefert die **fertig gebauten statischen Dateien** der Website mit nginx aus (das unprivilegierte Image, Port 8080 im Container, Port 21002 auf `127.0.0.1` des Hosts, erreichbar über Caddy). nginx cached `/assets/` ein Jahr lang, weil die Dateinamen einen Hash tragen, lässt Browser `index.html` bei jedem Besuch neu prüfen und speichert `config.js` nie.

Die dynamischen Inhalte holt der Browser, nicht der Container, ohne Anmeldung vom Backend:

| Inhalt | Anfrage |
|---|---|
| Texte, Programm-Hinweise, Zitate, Social-Media-Verweise, das Video, die Galerie-Überschrift | `GET /api/public/site-content` |
| Die Bildergalerie | `GET /api/public/gallery` |
| Das Kontaktformular | `POST /api/public/contact` (ein verstecktes Honeypot-Feld statt reCAPTCHA, es braucht also keinen externen Dienst) |

Die Texte von Hero, Mitgliedschaft und Kontakt liegen in den Abschnitts-Komponenten (`src/components/sections/`). Der Veranstaltungskalender ist ein schlichtes Google-Calendar-iframe. Die Content-Security-Policy, die Caddy für `www` setzt, erlaubt genau diese Quellen: die API, den Objektspeicher für Bilder und Einbettungen von YouTube (Datenschutzmodus), Google Calendar und OpenStreetMap.

Beim Start schreibt der Container `config.js` aus seiner Umgebung und verweigert den Start, wenn der Wert fehlt oder fehlerhaft ist. Health-Check: Die Root-URL antwortet.

## 4. Wo der Code dieses Repositories läuft

Der Code wird **einmal** gebaut, im `Dockerfile`: Eine Node-Stufe führt `npm ci` und `npm run build` aus; eine zweite Stufe kopiert das Ergebnis in `nginx-unprivileged`. Die CI veröffentlicht das Image als `ghcr.io/k-o-st-v-vindobona-ii/vb-www:latest` und `...:<voller Commit-SHA>`, nach einem Smoke-Test, der das Image schreibgeschützt und ohne Capabilities hochfährt. Dasselbe Image läuft auf jeder Stage: Ein Start-Skript (`docker/docker-entrypoint.d/40-generate-runtime-config.sh`) erzeugt bei jedem Start `config.js` aus **einer** Container-Variable, `API_BASE_URL`, und die Seite liest sie über `src/runtimeConfig.ts`. Das Skript verweigert den Start, wenn `API_BASE_URL` fehlt, keine schlichte `http://`- oder `https://`-Adresse ist oder ein Zeichen enthält, das den JavaScript-String beenden könnte, in den sie geschrieben wird (Anführungszeichen, Backslash, spitze Klammer, `$`, Backtick, Leerzeichen). Der echte Wert je Stage liegt in `vb-deploy` ([Anhang A](https://github.com/K-O-St-V-Vindobona-II/vb-deploy/blob/main/README.de.md#anhang-a-secrets-und-pflichtvariablen)).

Auf der **Entwicklungs-Stage** erzeugt nichts eine `config.js`: Ihre Anfrage liefert 404 (harmlos), und die Seite liest stattdessen `VITE_API_BASE_URL`. Ohne eine der beiden Quellen wirft sie einen Fehler, damit ein Build, dem nicht gesagt wurde, welches Backend er nutzen soll, nie versehentlich mit der Produktions-API spricht (`vite.env-check.ts` erzwingt dieselbe Regel zur Build-Zeit).

Aufbau des Quellcodes:

```
src/components/sections/   die Abschnitte der Seite (Hero, Über uns, Mitgliedschaft, Programm, Galerie, Zitate, Kontakt)
src/components/            Navigation, Footer, gemeinsame Teile
src/composables/           Daten laden und Seitenverhalten (Site-Inhalte, Galerie, Scroll-Effekte)
src/services/              die einzige Stelle, die die API aufruft
src/utils/                 Helfer (zum Beispiel verlinkter Text)
```

---

## Entwicklung

### Einrichtung

- Podman mit laufendem `vb-www`-Entwicklungs-Container aus den lokalen Entwicklungs-Quadlets ([`vb-deploy` 5.7](https://github.com/K-O-St-V-Vindobona-II/vb-deploy/blob/main/README.de.md#57-lokale-entwicklungsumgebung)). Er führt `npm run dev` (Vite-Dev-Server mit Hot-Reload) mit eingehängtem Quellordner aus, auf `127.0.0.1:20002`. Die API, mit der er spricht, wird über `VITE_API_BASE_URL` festgelegt.
- Node `^22.18.0` oder `>=24.12.0` (das Container-Image nutzt Node 24).
- Führe jeden Befehl über `podman exec vb-www ...` aus; führe `npm install` nie auf dem Host aus.

```bash
# einmal pro Klon: die Git-Hooks installieren (sie spiegeln die CI-Prüfungen)
pre-commit install
```

Ohne die Hooks überspringen Commits ESLint, Prettier, Typprüfung und die Tests, und die CI schlägt später fehl.

### Befehle

```bash
podman exec vb-www npm run dev            # Dev-Server (vom Container bereits gestartet)
podman exec vb-www npm run build          # Typprüfung und Produktions-Build
podman exec vb-www npm run type-check     # vue-tsc
podman exec vb-www npm run lint           # ESLint, keine Warnungen erlaubt (`npm run lint:fix` zum Beheben)
podman exec vb-www npm run format:check   # Prettier (zum Beheben `npm run format`)
podman exec vb-www npx vitest run         # alle Tests einmal
podman exec vb-www npm run test:coverage  # Tests mit Coverage-Gate
```

### Tests

Vitest mit jsdom. Die Abdeckung wird für Statements, Branches, Funktionen und Zeilen gemessen, und jede muss bei **90 %** oder darüber bleiben; `npm run test:coverage` schlägt darunter fehl, ebenso die CI. Neue Logik kommt mit Tests.

### Umgebungsvariablen

Kopiere für die lokale Entwicklung `.env.example` nach `.env` und trage `VITE_APP_ENVIRONMENT` (nur von der Build-Zeit-Prüfung in `vite.env-check.ts` genutzt) und `VITE_API_BASE_URL` (das laufende `vb-api`) ein. `VITE_*`-Variablen werden ins Bundle einkompiliert und sind damit öffentlich: Lege nie ein Secret dort ab. Das Produktions-Image ignoriert sie und nutzt die Laufzeit-Variable `API_BASE_URL`.

### Branching und Konventionen

- `main` ist geschützt und nimmt nur Pull Requests an. Gearbeitet wird auf `development`.
- Commit-Nachrichten folgen Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`) und sind auf Englisch geschrieben; ebenso Code-Kommentare.
- Komponenten nutzen `<script setup lang="ts">` mit typisierten Props und Emits, scoped Styles und ein Mobile-First-Layout (Basis-Styles für Handys, `min-width`-Media-Queries für größere Bildschirme). Die Seite bleibt bewusst schlank: Systemschriften, kein CSS-Framework.

### CI/CD

`.github/workflows/ci-cd.yml` läuft bei jedem Push auf und Pull Request gegen `main`, wöchentlich (um den CodeQL-Scan aufzufrischen) und bei manuellem Start:

1. **Lint und Format:** ESLint und Prettier.
2. **Typprüfung und Tests:** `vue-tsc` und Vitest mit den Coverage-Schwellen.
3. **CodeQL**-Sicherheitsscan.
4. **Read-only-Rootfs-Smoke-Test:** das Image, schreibgeschützt und ohne Capabilities gestartet, mit Prüfung dessen, was es ausliefert.
5. **Image bauen und veröffentlichen:** nur von `main` (Push oder manueller Start) und nur nachdem jeder andere Job bestanden hat; ein Lauf auf einem anderen Branch veröffentlicht nie `:latest`.

Der Rollout ist nicht Teil der Pipeline: Der `podman-auto-update.timer` des Hosts holt das neue `:latest`-Image über Nacht, oder ein Betreiber deployt sofort mit `--tags deploy-www` (siehe `vb-deploy` [1.7](https://github.com/K-O-St-V-Vindobona-II/vb-deploy/blob/main/README.de.md#17-wie-eine-änderung-in-produktion-kommt)).
