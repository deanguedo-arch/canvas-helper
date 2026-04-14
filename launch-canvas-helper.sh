#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

STUDIO_HOST="127.0.0.1"
STUDIO_PORT=""
STUDIO_URL=""
MODE="${1:-studio}"
MODE_LOWER="${MODE,,}"

warn_if_no_projects() {
  local has_project=0
  if [ -d projects ]; then
    for project_dir in projects/*; do
      [ -d "$project_dir" ] || continue
      local base_name
      base_name="$(basename "$project_dir")"
      case "$base_name" in
        incoming|processed|resources) ;;
        *) has_project=1 ;;
      esac
    done
  fi

  if [ "$has_project" -eq 0 ]; then
    echo
    echo "No imported projects were found under projects/."
    echo "Drop a folder into projects/incoming/ and run '\''$0 refresh'\''."
    echo
  fi
}

ensure_deps() {
  mkdir -p projects/incoming projects/processed projects/resources

  if ! command -v npm >/dev/null 2>&1; then
    echo "npm was not found in PATH."
    exit 1
  fi

  if [ ! -d node_modules ]; then
    echo
    echo "Installing dependencies first (node_modules missing)..."
    npm install
  fi

  echo
  echo "Normalizing project layout..."
  npm run migrate:projects
}

is_port_free() {
  local port="$1"

  if command -v lsof >/dev/null 2>&1; then
    ! lsof -n -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1
    return
  fi

  python3 - <<'PY' "$port" || return $?
import socket, sys
port = int(sys.argv[1])
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    sock.settimeout(0.25)
    try:
        sock.bind(("127.0.0.1", port))
        sock.close()
    except OSError:
        sys.exit(1)
PY
}

resolve_studio_port() {
  for port in {5173..5193}; do
    if is_port_free "$port"; then
      STUDIO_PORT="$port"
      STUDIO_URL="http://$STUDIO_HOST:$STUDIO_PORT"
      return
    fi
  done

  echo "Could not find a free Studio port between 5173 and 5193."
  exit 1
}

open_studio_when_ready() {
  local url="$1"
  (
    for _ in {1..120}; do
      if command -v curl >/dev/null 2>&1 && curl -fsS "$url" >/dev/null 2>&1; then
        command -v open >/dev/null 2>&1 && open "$url"
        exit 0
      fi
      sleep 0.5
    done
  ) &
}

show_help() {
  cat <<HELP
Usage:
  ./launch-canvas-helper.sh             Start Studio only (default)
  ./launch-canvas-helper.sh studio       Start Studio only
  ./launch-canvas-helper.sh refresh      Run one intake refresh and exit
  ./launch-canvas-helper.sh watch        Start incoming watcher only
  ./launch-canvas-helper.sh help         Show this help text
HELP
}

run_studio() {
  ensure_deps
  warn_if_no_projects
  resolve_studio_port

  echo
  echo "=============================================="
  echo "  Canvas Helper Launcher"
  echo "=============================================="
  if [ -n "${LEARNER_MODE:-}" ]; then
    echo "Learner Mode override: $LEARNER_MODE"
  else
    echo "Learner Mode: repo/project policy"
  fi
  echo "Studio URL: $STUDIO_URL"
  echo "If a browser tab does not open, manually visit: $STUDIO_URL"
  echo

  open_studio_when_ready "$STUDIO_URL"
  echo "Starting stable Studio session..."
  npm run studio -- --host "$STUDIO_HOST" --port "$STUDIO_PORT" --open --clearScreen false
}

run_refresh() {
  ensure_deps
  echo
  echo "Refreshing incoming and resources once..."
  npm run incoming:refresh
}

run_watch() {
  ensure_deps
  echo
  echo "Starting incoming watcher (optional mode)..."
  npm run watch:incoming
}

case "$MODE_LOWER" in
  studio) run_studio ;;
  refresh) run_refresh ;;
  watch) run_watch ;;
  help|--help|-h) show_help ;;
  "") run_studio ;;
  *)
    echo "Unknown mode: $MODE"
    show_help
    exit 1
    ;;
esac
