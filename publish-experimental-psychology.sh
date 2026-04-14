#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

SLUG="experimental-psych-30-per-1-a-b-sec-s-202632352"

echo "[1/2] Exporting Google Hosted bundle for \"$SLUG\"..."
npm run export:google-hosted -- --project "$SLUG"

echo "[2/2] Deploying \"$SLUG\" to Firebase Hosting..."
npm run deploy:google-hosted -- --project "$SLUG"

echo "Publish complete for \"$SLUG\"."
