#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

STUDIO_HOST="127.0.0.1"
STUDIO_PORT=""
STUDIO_URL=""
DRY_RUN=0
RUN_MIGRATE=0

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=1
      ;;
    --migrate)
      RUN_MIGRATE=1
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: bash scripts/codex-session.sh [--dry-run] [--migrate]"
      exit 1
      ;;
  esac
done

ensure_layout() {
  mkdir -p "projects/incoming" "projects/processed" "projects/resources"
}

ensure_npm() {
  if ! command -v npm >/dev/null 2>&1; then
    echo "npm was not found in PATH. Install Node.js and try again."
    exit 1
  fi
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

print_prompt_starters() {
  cat <<EOF

==============================================
  Codex Prompt Starters
==============================================

[UI edit]
Edit project: <slug>
Files: projects/<slug>/workspace/index.html, projects/<slug>/workspace/styles.css, projects/<slug>/workspace/main.js
Goal: <describe the visual/behavior change>
Acceptance checks:
- Keep course content structure intact
- Keep mobile and desktop layout usable
- Run npm run build:studio after edits

[Image generate/edit]
Project: <slug>
Task: <generate new image | edit existing image>
Output file: projects/<slug>/workspace/assets/images/<file-name>.webp
Also do:
1) update projects/<slug>/meta/images-manifest.json
2) run npm run sync:course-images -- --project <slug>
3) confirm image placement in Studio preview

Studio URL: $STUDIO_URL
EOF
}

start_browser() {
  if command -v open >/dev/null 2>&1; then
    open "$STUDIO_URL" >/dev/null 2>&1 || true
  fi
}

main() {
  ensure_layout
  ensure_npm

  if [[ "$RUN_MIGRATE" -eq 1 ]]; then
    echo "Normalizing project layout..."
    npm run migrate:projects
  else
    echo "Skipping migrate:projects (use --migrate when you want layout normalization)."
  fi

  resolve_studio_port
  print_prompt_starters

  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo
    echo "Dry run mode: Studio was not started."
    exit 0
  fi

  start_browser
  echo
  echo "Starting Studio on $STUDIO_URL ..."
  exec npm run studio -- --host "$STUDIO_HOST" --port "$STUDIO_PORT" --clearScreen false
}

main "$@"
