#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo '[1/2] Exporting Google Hosted bundle for "general-psychology-20-independent-studies-202633108"...'
npm run export:google-hosted -- --project general-psychology-20-independent-studies-202633108

echo '[2/2] Deploying "general-psychology-20-independent-studies-202633108" to Firebase Hosting...'
npm run deploy:google-hosted -- --project general-psychology-20-independent-studies-202633108

echo 'Publish complete for "general-psychology-20-independent-studies-202633108".'
