#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo '[1/2] Exporting Google Hosted bundle for "forensicstudiesoption2"...'
npm run export:google-hosted -- --project forensicstudiesoption2

echo '[2/2] Deploying "forensicstudiesoption2" to Firebase Hosting...'
npm run deploy:google-hosted -- --project forensicstudiesoption2

echo 'Publish complete for "forensicstudiesoption2".'
