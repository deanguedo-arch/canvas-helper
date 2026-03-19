# Handoff

- Project: forensics35
- Task: restore full lesson content rendering in workspace and Google Hosted export, then publish live
- Status: complete

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\forensics35\workspace\main.jsx
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\forensics35\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\scripts\lib\exports\google-hosted.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\forensics35\meta\google-hosted.deploy.json
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\publish-forensics35.bat
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\forensics35\meta\HANDOFF.md

## What changed
- Fixed exporter behavior that skipped reference asset copying, which caused hosted fallback cards and missing lesson bodies.
- Ensured Google Hosted export includes reference roots and encoding variants used by Brightspace content paths.
- Patched workspace runtime to resolve lesson source paths across `content`, Cyrillic `сontent`, and mojibake `Ñontent` roots so local preview also renders full content.
- Deployed updated `forensics35` site successfully after exporter/runtime fixes.

## Verification run
- `./publish-forensics35.bat` on 2026-03-19: export succeeded (778 files), Firebase deploy succeeded (773 files uploaded, live release complete for `forensics35`).

## What still needs validation
- Manual in-browser sanity pass across Modules 1-6 in workspace mode after hard refresh to confirm no snippet fallback remains.

## Known risks
- Content path encodings in future imports can still vary; this fallback logic should remain in place unless import normalization is standardized upstream.
- Cached browser assets can mask fixed behavior until hard refresh/incognito.

## Exact next command
`./publish-forensics35.bat`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\forensics35\meta\HANDOFF.md`

## Do not do next / warnings
- Do not edit `projects/forensics35/raw/**`.
- Do not hand-edit files under `projects/forensics35/exports/**`; regenerate with scripts.
