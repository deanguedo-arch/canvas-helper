#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo '[1/2] Exporting Google Hosted bundle for "forensics"...'
npm run export:google-hosted -- --project forensics

echo '[2/2] Deploying "forensics" to Firebase Hosting...'
npm run deploy:google-hosted -- --project forensics

echo 'Publish complete for "forensics".'
