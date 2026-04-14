#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"
NPM_CMD=""

resolve_node() {
  if command -v npm >/dev/null 2>&1; then
    NPM_CMD="$(command -v npm)"
    return 0
  fi

  local candidates=(
    "/opt/homebrew/bin/npm"
    "/usr/local/bin/npm"
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
  exit 1
}

ensure_platform_dependencies() {
  local npm_cmd="${1:-npm}"

  if [ ! -d node_modules ]; then
    return
  fi

  local node_arch
  node_arch="$(node -p "process.arch" 2>/dev/null || true)"

  if [ -z "$node_arch" ]; then
    return
  fi

  if [ "$node_arch" = "arm64" ]; then
    if [ -d "node_modules/@esbuild/darwin-x64" ] && [ ! -d "node_modules/@esbuild/darwin-arm64" ]; then
      echo "Detected ARM64 Node with x64-only esbuild binary installed."
      echo "Running npm install to repair platform-native dependency packages..."
      "$npm_cmd" install
    fi
  elif [ "$node_arch" = "x64" ]; then
    if [ -d "node_modules/@esbuild/darwin-arm64" ] && [ ! -d "node_modules/@esbuild/darwin-x64" ]; then
      echo "Detected x64 Node with ARM64-only esbuild binary installed."
      echo "Running npm install to repair platform-native dependency packages..."
      "$npm_cmd" install
    fi
  fi
}

prepare_tooling() {
  resolve_node
  ensure_platform_dependencies "$NPM_CMD"
}

if [ -x "./report-all-progress.sh" ]; then
  prepare_tooling
  exec ./report-all-progress.sh "$@"
fi

prepare_tooling
echo "Missing report-all-progress.sh helper and no direct args provided."
echo "Set GOOGLE_APPLICATION_CREDENTIALS and FIREBASE_PROJECT_ID (optional), then run:"
echo "npm run report:all -- --service-account <path> --firebase-project <project-id>"
exit 1
