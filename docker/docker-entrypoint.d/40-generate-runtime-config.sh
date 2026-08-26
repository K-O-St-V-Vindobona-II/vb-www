#!/bin/sh
set -eu

# Renders public/config.template.js (copied verbatim into dist/ by Vite, then
# into /usr/share/nginx/html by the Dockerfile's final COPY) into config.js
# using the container's real runtime env vars, then removes the template so
# it is never accidentally served. Runs automatically because nginx:1-alpine's
# own /docker-entrypoint.sh executes every executable *.sh file in
# /docker-entrypoint.d/ before starting nginx.
#
# Fails loudly (nonzero exit + clear stderr message) if the required
# variable is missing, instead of silently defaulting — the same fail-fast
# principle as vite.env-check.ts's validateViteEnv() at build time.

HTML_ROOT="/usr/share/nginx/html"
TEMPLATE="$HTML_ROOT/config.template.js"
OUTPUT="$HTML_ROOT/config.js"

require_env() {
  var_name="$1"
  eval "value=\${$var_name:-}"
  if [ -z "$value" ]; then
    echo "FATAL: required environment variable $var_name is not set. Aborting." >&2
    exit 1
  fi
}

require_env API_BASE_URL

if [ ! -f "$TEMPLATE" ]; then
  echo "FATAL: $TEMPLATE not found. Aborting." >&2
  exit 1
fi

export API_BASE_URL

envsubst '${API_BASE_URL}' < "$TEMPLATE" > "$OUTPUT"

rm -f "$TEMPLATE"

echo "Generated runtime config.js from container environment."
