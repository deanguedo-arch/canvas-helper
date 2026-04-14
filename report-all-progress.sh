#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

SERVICE_ACCOUNT="${GOOGLE_APPLICATION_CREDENTIALS:-}"
FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID:-}"

if [ -z "$SERVICE_ACCOUNT" ]; then
  echo "Missing service account path."
  echo "Set GOOGLE_APPLICATION_CREDENTIALS or pass it as --service-account below."
  echo "Example: ./report-all-progress.sh --service-account path/to/key.json --firebase-project calm-module-one"
  exit 1
fi

EXTRA_ARGS=()

EXTRA_ARGS+=(--service-account "$SERVICE_ACCOUNT")
if [ -n "$FIREBASE_PROJECT_ID" ]; then
  EXTRA_ARGS+=(--firebase-project "$FIREBASE_PROJECT_ID")
fi

mkdir -p reports

if [ "$#" -gt 0 ]; then
  # shellcheck disable=SC2206
  EXTRA_ARGS+=("$@")
fi

npm run report:all -- "${EXTRA_ARGS[@]}"
