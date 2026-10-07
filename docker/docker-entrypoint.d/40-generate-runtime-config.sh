#!/bin/sh
set -eu

# Renders config.template.js (moved out of the webroot by the Dockerfile,
# see /etc/vb-www/config.template.js) into config.js using the container's
# real runtime env vars, writing the result to a tmpfs path served via
# nginx.conf's "alias" directive instead of into the webroot itself - the
# webroot is read-only in production (ReadOnly=true), so nothing can be
# written there at runtime. Runs automatically because nginx:1-alpine's own
# /docker-entrypoint.sh executes every executable *.sh file in
# /docker-entrypoint.d/ before starting nginx.
#
# Fails loudly (nonzero exit + clear stderr message) if the required
# variable is missing, instead of silently defaulting - the same fail-fast
# principle as vite.env-check.ts's validateViteEnv() at build time.

TEMPLATE="/etc/vb-www/config.template.js"
OUTPUT="/run/vb-config/config.js"

require_env() {
  var_name="$1"
  eval "value=\${$var_name:-}"
  if [ -z "$value" ]; then
    echo "FATAL: required environment variable $var_name is not set. Aborting." >&2
    exit 1
  fi
}

require_env API_BASE_URL

# config.template.js writes the value between single quotes into JavaScript, so it has to be a
# plain http(s) URL: a quote, backslash, angle bracket, dollar sign, backtick, whitespace or
# line break in it would end the string or the script and break, or take over, config.js.
case "$API_BASE_URL" in
  http://?* | https://?*) ;;
  *)
    echo "FATAL: API_BASE_URL must start with http:// or https:// and name a host. Aborting." >&2
    exit 1
    ;;
esac
case "$API_BASE_URL" in
  *[!A-Za-z0-9:/._~%@+,=?\&#-]*)
    echo "FATAL: API_BASE_URL contains a character that is not allowed in a plain URL. Aborting." >&2
    exit 1
    ;;
esac

if [ ! -f "$TEMPLATE" ]; then
  echo "FATAL: $TEMPLATE not found. Aborting." >&2
  exit 1
fi

export API_BASE_URL

mkdir -p "$(dirname "$OUTPUT")"

envsubst '${API_BASE_URL}' < "$TEMPLATE" > "$OUTPUT"

echo "Generated runtime config.js from container environment."
