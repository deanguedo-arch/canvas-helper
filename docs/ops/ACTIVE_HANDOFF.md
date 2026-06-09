# Active Handoff

## Summary
Continued the Forensics 25 Google Sites path by proving a no-`clasp` browser-based Apps Script route for Module 1. The Apps Script shell serves the uploaded Module 1 static package from Drive, with lessons and quiz working and assignment delivery moving to a same-tab Apps Script route.

## Files changed
- docs/ops/ACTIVE_HANDOFF.md
- docs/ops/ARCHIVED_HANDOFFS.md
- projects/forensics-module-builder/meta/module-1-apps-script-google-sites.md

## Verification run
- Manual Apps Script browser iteration only.
- Main Apps Script `/exec` shell loaded.
- Lesson content loaded after Drive `.html` upload conversion was disabled and files were re-uploaded as real files.
- Lesson images rendered after switching to base64 Drive `data:` URLs.
- Quiz rendered and worked in the shell.
- Assignment rendered from the standalone Apps Script route `?view=assignment`.
- Embedded assignment iframe remained unreliable inside the parent Apps Script shell, so the current direction is same-tab assignment navigation with a `Back to module` link.

## Known risks / follow-up
- The final same-tab assignment `Code.gs` needs one more live browser verification after deployment.
- Google Sites adds another iframe layer, so avoid relying on nested assignment iframes.
- Drive upload conversion can turn `.html` into Google Docs; disable conversion and upload real `.html` files.
- If Drive files are replaced, rerun `rebuildDriveAssetIndex`.
- If Apps Script is redeployed, ensure Google Sites points to the intended `/exec` URL or redeploys the existing embedded deployment ID.

## Source-of-truth location
- Manual Apps Script handoff: `projects/forensics-module-builder/meta/module-1-apps-script-google-sites.md`
- Module 1 static package: `projects/forensics-module1/workspace/module-1-static/`
- Module 1 generator: `scripts/build-forensics-module1-static.ts`
- Broader Modules 2-8 Google Sites handoff: `projects/forensics-module-builder/meta/google-sites-conversion.md`

## Fragile areas / what might drift
- Apps Script `Code.gs` currently lives in the browser editor, not as an executable repo source file.
- The Drive folder ID for Module 1 is `1h6FwBN3GbDn0Swxyv-S1ZwIzehijTPAw`.
- Assignment delivery is stable as `?view=assignment`; nested iframe delivery was not stable.
- Lesson images rely on base64 embedding from Drive blobs, which is acceptable for Module 1 but may need a generated asset strategy for Modules 2-8.

## Next prompt assumptions
- Continue Module 1 Google Sites proof first.
- Preserve the current Option Two styling and static module structure.
- Do not redesign the module.
- Use browser-based Apps Script steps because `clasp` may be blocked by district permissions.

## Exact next command
`git status --short --branch`

## Exact next file to open
`projects/forensics-module-builder/meta/module-1-apps-script-google-sites.md`
