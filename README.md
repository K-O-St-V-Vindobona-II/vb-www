# vb-www

[English](README.md) | [Deutsch](README.de.md)

The public website of the Vindobona II club. This README covers what is specific to this repository and assumes you know the [`vb-deploy` README](https://github.com/K-O-St-V-Vindobona-II/vb-deploy/blob/main/README.md), the leading document for how the whole system is built, run and restored. All four repositories live in the GitHub organization [K-O-St-V-Vindobona-II](https://github.com/K-O-St-V-Vindobona-II).

## 1. Purpose and naming

`vb-www` is the **public frontend**: the website that anyone can open without logging in (the club, how to become a member, the programme and event calendar, a gallery, a video, quotes, social links and a contact form). It is one long page with anchor navigation and no client-side routing library. The texts that the club edits are not part of this repository: they are maintained in the administration area of [`vb-intern`](https://github.com/K-O-St-V-Vindobona-II/vb-intern) ("www-Administration") and delivered by [`vb-api`](https://github.com/K-O-St-V-Vindobona-II/vb-api).

**Naming convention:** the repository name is the subdomain. `vb-www` is served at **`www.vindobona2.at`** (and `vb-api` at `api.vindobona2.at`, `vb-intern` at `intern.vindobona2.at`). On other stages the domains come from the stage's inventory file in the private repository `vb-access` (see `vb-deploy` [1.3](https://github.com/K-O-St-V-Vindobona-II/vb-deploy/blob/main/README.md#13-the-github-organization-and-the-repositories)).

Tech stack: Vue 3 (`<script setup>`, TypeScript), Vite, served by nginx in production. The site uses the visitor's system fonts, so there are no font files to host and no request to a font service.

## 2. Containers of this repository

One container: **`vb-www`**, in its own pod `vb-www-pod`. It has no database and no sidecar. On the local development stage the same name is a plain container with the Vite dev server instead of nginx.

| Container | Pod | Image | Runs code of this repository? |
|---|---|---|---|
| `vb-www` | `vb-www-pod` | `ghcr.io/k-o-st-v-vindobona-ii/vb-www` | **Yes**, the built website |

Quadlet definition, port and hardening are in `vb-deploy` (chapter [1.4](https://github.com/K-O-St-V-Vindobona-II/vb-deploy/blob/main/README.md#14-containers-and-pods)).

## 3. What the container does

`vb-www` serves the **pre-built static files** of the website with nginx (the unprivileged image, port 8080 in the container, port 21002 on `127.0.0.1` of the host, reached through Caddy). nginx caches `/assets/` for a year because file names carry a hash, makes browsers re-check `index.html` on every visit and never stores `config.js`.

The browser, not the container, fetches the dynamic content from the backend, without login:

| Content | Request |
|---|---|
| Texts, programme hints, quotes, social links, the video, the gallery heading | `GET /api/public/site-content` |
| The image gallery | `GET /api/public/gallery` |
| The contact form | `POST /api/public/contact` (a hidden honeypot field instead of a reCAPTCHA, so no external service is needed) |

The hero, membership and contact texts live in the section components (`src/components/sections/`). The event calendar is a plain Google Calendar iframe. The Content-Security-Policy that Caddy sets for `www` allows exactly these sources: the API, the object storage for images, and embeds from YouTube (privacy mode), Google Calendar and OpenStreetMap.

On start the container writes `config.js` from its environment and refuses to start when the value is missing or malformed. Health check: the root URL answers.

## 4. Where the code of this repository runs

The code is built **once**, in the `Dockerfile`: a Node stage runs `npm ci` and `npm run build`; a second stage copies the result into `nginx-unprivileged`. The CI publishes the image as `ghcr.io/k-o-st-v-vindobona-ii/vb-www:latest` and `...:<full commit sha>` (the image also carries the commit as the label `org.opencontainers.image.revision`), after a smoke test that boots the image read-only with all capabilities dropped. The same image runs on every stage: a start-up script (`docker/docker-entrypoint.d/40-generate-runtime-config.sh`) renders `config.js` on every start from **one** container variable, `API_BASE_URL`, and the site reads it through `src/runtimeConfig.ts`. The script refuses to start the container when `API_BASE_URL` is missing, is not a plain `http://` or `https://` address, or contains a character that could end the JavaScript string it is written into (quote, backslash, angle bracket, `$`, backtick, whitespace). The real value per stage lives in the private repository `vb-access`; the variable is described in `vb-deploy` ([Appendix A](https://github.com/K-O-St-V-Vindobona-II/vb-deploy/blob/main/README.md#appendix-a-secrets-and-required-variables)).

On the **development stage** nothing generates `config.js`: its request returns 404 (harmless) and the site reads `VITE_API_BASE_URL` instead. Without either source it throws, so a build that is not told which backend to use never talks to the production API by accident (`vite.env-check.ts` enforces the same rule at build time).

Layout of the source:

```
src/components/sections/   the sections of the page (hero, about, membership, programme, gallery, testimonials, contact)
src/components/            navigation, footer, shared pieces
src/composables/           data loading and page behavior (site content, gallery, scroll effects)
src/services/              the only place that calls the API
src/utils/                 helpers (for example linked text)
```

---

## Development

### Setup

- Podman with the `vb-www` development container running from the local development Quadlets ([`vb-deploy` 5.7](https://github.com/K-O-St-V-Vindobona-II/vb-deploy/blob/main/README.md#57-local-development-environment)). It runs `npm run dev` (Vite dev server with hot reload) with the source folder mounted, on `127.0.0.1:20002`. The API it talks to is configured by `VITE_API_BASE_URL`.
- Node `^22.18.0` or `>=24.12.0` (the container image uses Node 24).
- Run every command through `podman exec vb-www ...`; never run `npm install` on the host.

```bash
# once per clone: install the git hooks (they mirror the CI checks)
pre-commit install
```

Without the hooks, commits skip ESLint, Prettier, type checking and the tests, and the CI fails later.

### Commands

```bash
podman exec vb-www npm run dev            # dev server (already started by the container)
podman exec vb-www npm run build          # type check and production build
podman exec vb-www npm run type-check     # vue-tsc
podman exec vb-www npm run lint           # ESLint, no warnings allowed (`npm run lint:fix` to fix)
podman exec vb-www npm run format:check   # Prettier (use `npm run format` to fix)
podman exec vb-www npx vitest run         # all tests once
podman exec vb-www npm run test:coverage  # tests with the coverage gate
```

### Tests

Vitest with jsdom. Coverage is measured for statements, branches, functions and lines, and each must stay at **90 %** or above; `npm run test:coverage` fails below that, and so does the CI. New logic comes with tests.

### Environment variables

For local development copy `.env.example` to `.env` and fill in `VITE_APP_ENVIRONMENT` (only used by the build-time guard in `vite.env-check.ts`) and `VITE_API_BASE_URL` (the running `vb-api`). `VITE_*` variables are compiled into the bundle and are therefore public: never put a secret there. The production image ignores them and uses the runtime variable `API_BASE_URL`.

### Branching and conventions

- `main` is protected and takes pull requests only. Work happens on `development`.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`) and are written in English; so are code comments.
- Components use `<script setup lang="ts">` with typed props and emits, scoped styles, and a mobile-first layout (base styles for phones, `min-width` media queries for larger screens). The site stays deliberately lean: system fonts, no CSS framework.

### CI/CD

`.github/workflows/ci-cd.yml` runs on every push to and pull request against `main`, weekly (to refresh the CodeQL scan) and on manual trigger:

1. **Lint and format:** ESLint and Prettier.
2. **Typecheck and test:** `vue-tsc` and Vitest with the coverage thresholds.
3. **CodeQL** security scan.
4. **Read-only rootfs smoke test:** the image started read-only with all capabilities dropped, checking what it serves.
5. **Build and push the image:** only from `main` (push or manual trigger), and only after every other job passed; a run on another branch never publishes `:latest`.

The rollout is not part of the pipeline: the host's `podman-auto-update.timer` picks up the new `:latest` image overnight, or an operator deploys at once with `--tags deploy-www` (see `vb-deploy` [1.7](https://github.com/K-O-St-V-Vindobona-II/vb-deploy/blob/main/README.md#17-how-a-change-reaches-production)).
