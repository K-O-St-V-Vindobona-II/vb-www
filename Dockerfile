FROM docker.io/library/node:22-slim AS builder

WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_BASE_URL is baked in at build time (unlike vb-intern's runtime-config
# approach) - this is a public marketing site with no per-deployment secrets,
# and api.vindobona2.at is a fixed, known origin per stage.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build


FROM docker.io/library/nginx:1-alpine

COPY --from=builder /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD ["wget", "-qO-", "http://127.0.0.1/"]
