#!/usr/bin/env bash
# Start the HPV Wiki Editor API server.
# Run from the web/ directory: bash start.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load .env if present
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
  echo "Loaded .env"
fi

# Default WIKI_REPO_PATH to parent directory if not set
export WIKI_REPO_PATH="${WIKI_REPO_PATH:-$(dirname "$SCRIPT_DIR")}"
echo "WIKI_REPO_PATH=$WIKI_REPO_PATH"

# Pick a Python >= 3.10 (the backend uses 3.10+ syntax)
PY=""
for cand in python3.13 python3.12 python3.11 python3.10 python3; do
  if command -v "$cand" >/dev/null 2>&1; then
    if "$cand" -c 'import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)' 2>/dev/null; then
      PY="$cand"; break
    fi
  fi
done
if [[ -z "$PY" ]]; then
  echo "ERROR: need Python 3.10 or newer on PATH." >&2
  exit 1
fi
echo "Using $($PY --version)"

# Create virtualenv if missing
if [[ ! -d venv ]]; then
  echo "Creating virtualenv…"
  "$PY" -m venv venv
fi

# Activate and install deps
# shellcheck disable=SC1091
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

HOST="${BIND_HOST:-0.0.0.0}"
PORT="${BIND_PORT:-8000}"
echo "Starting FastAPI on http://$HOST:$PORT"
# --proxy-headers: trust nginx's X-Forwarded-* so request URLs match the public host.
exec uvicorn backend.main:app \
  --host "$HOST" \
  --port "$PORT" \
  --proxy-headers \
  --forwarded-allow-ips "*" \
  --log-level info
