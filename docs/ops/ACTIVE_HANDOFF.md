# Active Handoff

## Summary
Rebuilt the Forensics Module 1 static package generator so the exported learner shell matches the Forensic Studies 25 Option Two layout and visual language while keeping the static stripped behavior.

## Files changed
- scripts/build-forensics-module1-static.ts
- projects/forensics-module1/workspace/module-1-static/index.html
- projects/forensics-module1/workspace/module-1-static/styles.css
- projects/forensics-module1/workspace/module-1-static/module-1.js
- projects/forensics-module1/workspace/module-1-static/module-1-data.js
- projects/forensics-module1/workspace/module-1-static/lesson.html
- projects/forensics-module1/workspace/module-1-static.zip
- .stax/codex-report.md
- docs/ops/ACTIVE_HANDOFF.md

## Verification run
- npx tsx scripts/build-forensics-module1-static.ts: exit 0, rebuilt projects\forensics-module1\workspace\module-1-static.
- Compress-Archive for module-1-static.zip: exit 0.
- Invoke-WebRequest http://127.0.0.1:8801/: HTTP 200.
- rg stripped-feature residue check against index.html, module-1.js, styles.css, lesson.html: clean.
- Image count in assets/images: 19.
- STAX observer preflight from STAX checkout: exit 0, observer verdict Reject, non-blocking, reason approval artifact missing.

## Known risks / follow-up
The shell is now Option Two-style, but visual acceptance still needs the user's browser review. STAX observer remains rejected because approval.json is missing, not because the local package failed the targeted checks.

## Source-of-truth location
Generator source of truth is scripts/build-forensics-module1-static.ts. Generated package is projects/forensics-module1/workspace/module-1-static/. ZIP is projects/forensics-module1/workspace/module-1-static.zip.

## Fragile areas / what might drift
The static package depends on authoritative Module 1 data from projects/forensicstudiesoption2/workspace/course-data.js and assignment files under projects/forensics-module1/workspace/assets/. If those change, rebuild with the generator rather than hand-editing generated output.

## Next prompt assumptions
Assume the user wants visual tweaks inside the static Option Two-style shell only, not changes to the original forensicstudiesoption2 project.

## Exact next command
npx tsx scripts/build-forensics-module1-static.ts

## Exact next file to open
scripts/build-forensics-module1-static.ts
