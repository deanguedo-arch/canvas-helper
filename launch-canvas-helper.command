#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

STUDIO_HOST="127.0.0.1"
STUDIO_PORT=""
STUDIO_URL=""
NPM_CMD=""

show_help() {
  cat <<'EOF'

Usage:
  launch-canvas-helper.command             Start Studio only (default)
  launch-canvas-helper.command studio      Start Studio only
  launch-canvas-helper.command refresh     Run one intake refresh and exit
  launch-canvas-helper.command watch       Run incoming watcher only

EOF
}

ensure_layout() {
  mkdir -p "projects/incoming" "projects/processed" "projects/resources"
}

resolve_node() {
  if [[ -n "${NPM_CMD}" ]] && [[ -x "${NPM_CMD}" ]]; then
    return 0
  fi

  if command -v npm >/dev/null 2>&1; then
    NPM_CMD="$(command -v npm)"
    return 0
  fi

  local candidates=(
    "/opt/homebrew/bin/npm"
    "/usr/local/bin/npm"
    "${HOME}/.nvm/versions/node"
  )

  for path in "${candidates[@]}"; do
    if [[ -x "${path}" ]]; then
      NPM_CMD="${path}"
      return 0
    fi
  done

  if [[ -d "${HOME}/.nvm/versions/node" ]]; then
    local latest
    latest="$(find "${HOME}/.nvm/versions/node" -maxdepth 2 -type f -name npm | sort | tail -n 1 || true)"
    if [[ -n "${latest}" && -x "${latest}" ]]; then
      NPM_CMD="${latest}"
      return 0
    fi
  fi

  echo
  echo "Node.js / npm was not found."
  echo "Install Node LTS and ensure npm is in your PATH."
  return 1
}

ensure_deps() {
  ensure_layout
  resolve_node

  if [[ ! -d "node_modules" ]]; then
    echo
    echo "Installing dependencies first (node_modules missing)..."
    "${NPM_CMD}" install
  fi

  echo
  echo "Normalizing project layout..."
  "${NPM_CMD}" run migrate:projects
}

warn_if_no_projects() {
  if find "projects" -mindepth 1 -maxdepth 1 -type d \
    ! -name incoming ! -name processed ! -name resources \
    | grep -q .; then
    return 0
  fi

  echo
  echo "No imported projects were found under projects/."
  echo "Drop a folder into projects/incoming/ and run './launch-canvas-helper.command refresh'."
  echo
}

is_port_free() {
  local port="$1"
  if lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; then
    return 1
  fi
  return 0
}

resolve_studio_port() {
  local port
  for port in 5173 5174 5175 5176 5177 5178 5179 5180 5181 5182 5183 5184 5185 5186 5187 5188 5189 5190 5191 5192 5193; do
    if is_port_free "${port}"; then
      STUDIO_PORT="${port}"
      STUDIO_URL="http://${STUDIO_HOST}:${STUDIO_PORT}"
      return 0
    fi
  done

  echo
  echo "Could not find a free Studio port between 5173 and 5193."
  return 1
}

open_studio_when_ready() {
  (
    local i
    for i in $(seq 1 120); do
      if curl -fsS --max-time 1 "${STUDIO_URL}" >/dev/null 2>&1; then
        open "${STUDIO_URL}" >/dev/null 2>&1 || true
        exit 0
      fi
      sleep 0.5
    done
    open "${STUDIO_URL}" >/dev/null 2>&1 || true
  ) &
}

run_studio() {
  ensure_deps
  warn_if_no_projects
  resolve_studio_port
  open_studio_when_ready

  echo
  echo "=============================================="
  echo "  Canvas Helper Launcher"
  echo "=============================================="
  echo
  if [[ -n "${LEARNER_MODE:-}" ]]; then
    echo "Learner Mode override: ${LEARNER_MODE}"
  else
    echo "Learner Mode: repo/project policy"
  fi
  echo "Studio URL: ${STUDIO_URL}"
  echo
  echo "Starting stable Studio session..."
  "${NPM_CMD}" run studio -- --host "${STUDIO_HOST}" --port "${STUDIO_PORT}"
}

run_refresh() {
  ensure_deps
  echo
  echo "Refreshing incoming and resources once..."
  "${NPM_CMD}" run incoming:refresh
}

run_watch() {
  ensure_deps
  echo
  echo "Starting incoming watcher (optional mode)..."
  "${NPM_CMD}" run watch:incoming
}

MODE="${1:-studio}"
case "${MODE}" in
  studio)
    run_studio
    ;;
  refresh)
    run_refresh
    ;;
  watch)
    run_watch
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "Unknown command: ${MODE}"
    show_help
    exit 1
    ;;
esac
