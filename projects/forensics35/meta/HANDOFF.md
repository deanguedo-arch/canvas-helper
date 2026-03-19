# Handoff

- Project: forensics35
- Task: restore full lesson content rendering in workspace and Google Hosted export, keep assignment/module filters, and publish stable hosting build
- Status: complete

## Files changed
- projects/forensics35/workspace/main.jsx
- projects/forensics35/workspace/main.js
- scripts/lib/exports/google-hosted.ts
- projects/forensics35/meta/google-hosted.deploy.json
- publish-forensics35.bat

## What changed
- Fixed Google Hosted exporter reference copying so deploys include course reference assets (assignment/quiz/content roots, Cyrillic `сontent` handling, manifest copy) instead of shipping only app shell files.
- Published `forensics35` after exporter fix; export included full reference payload and hosting release completed successfully on 2026-03-19.
- Updated workspace runtime path resolution to try `content`, Cyrillic `сontent`, and mojibake `Ñontent` variants so local workspace loads full lesson bodies instead of snippet fallback.
- Kept module cleanup behavior already requested in this session (excluded sections/extra assignment noise/final exam and removed broken progress UI).

## Verification run
- `./publish-forensics35.bat` (2026-03-19): export succeeded with 778 files; Firebase Hosting deploy succeeded with 773 hosted files and live release for site `forensics35`.

## What still needs validation
- Manual click-through in Studio workspace for Modules 1-6 to confirm each content page renders full body text (not snippet-only fallback) after hard refresh.
- Spot-check one assignment and one quiz per module for expected render mode and source loading.

## Known risks
- Legacy source paths still include mixed encodings in Brightspace exports; future imports may require the same root-variant fallback logic.
- Browser cache can present old bundle behavior until hard refresh/incognito reload.

## Exact next command
`./publish-forensics35.bat`

## Exact next file to open
`projects/forensics35/workspace/main.jsx`

## Do not do next / warnings
- Do not edit `projects/forensics35/raw/**`.
- Do not manually edit generated files under `projects/forensics35/exports/**`; regenerate via export/deploy scripts.
