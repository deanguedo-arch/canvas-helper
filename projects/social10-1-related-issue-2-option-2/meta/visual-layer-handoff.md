# Option Two visual and tools handoff

## Summary
Applied the reviewed Social 30-1 Issue 1 Biology-style design and tools to social10-1-related-issue-2-option-2. Local Build candidate; not deployed, packaged or committed. Existing 12 lessons and completion requirements are unchanged.

## Files changed
- workspace/index.html: editable Overview, 12 lesson openings, sidebar, 32 sourced vocabulary entries, shared Frayer controls, 16 original textbook practice questions, media notes and collection controls.
- workspace/social-visual.css, social-lesson-tools.js, social-textbook-practice.js, social-tools-evidence.js; local fonts/licenses and original textbook question captures. Social 30 also receives needed textbook PDFs copied from sibling workspaces without changing the sources.
- meta/project.json, lesson-support.json, textbook-practice-sources.json, e2e-contract.json and this handoff.

## Verification run
- node scripts/tests/social-option2-tools.mjs: passed all 11 newly updated courses. Existing answer IDs/completion IDs, all five tool collections, shared page/popup controls, textbook practice collection, duplicate-free snapshots, reload retention, retained manual evidence, collapsed navigation and 390px overflow checks.
- node scripts/tests/social-option2-surfaces.mjs: passed all 11. Final support counts, source-file existence, legacy #lessons redirect, visible lesson navigation, vocabulary search/topic filters, repeated printed-page boundary jumps and correct tool source references.
- Git checkpoint comparison retained all original response IDs and teaching text across 240 newly updated lessons, allowing only the recorded Introduction label correction.
- Scoped JavaScript syntax and git diff --check passed. Local 12-course review picker and phone wrapper checked. Desktop/phone changed-area screenshots reviewed across the three course families.

## Known risks / follow-up
Broader course E2E, comprehensive responsive coverage, Studio edit map and reversible lifecycle, SCORM/state-size capacity, actual Brightspace save/resume/completion and teacher acceptance remain deferred to rollout. Native PDF embedding and external media depend on the browser; ordinary PDF links remain available. Saving uses the original browser-local stores.

## Source of truth
projects/social10-1-related-issue-2-option-2/workspace/index.html owns visible teaching, guidance, definitions and real form controls. Scoped CSS/JS attach presentation and behavior. Lesson-support and textbook-practice receipts record provenance; they are not replacement content owners. Retain legacy-snapshot-v1 and keep the historical Social builder quarantined.

## Fragile areas / what might drift
Preserve original route/response/completion/storage IDs. Frayer controls are loaned to the popup and restored on close; do not duplicate them. Printed pages use source-specific PDF offsets. Evidence collection explicitly snapshots writing; re-collect updates one stable entry, and removing evidence does not clear tool answers. Optional textbook practice adds no lesson gates.

## Next prompt assumptions
All 12 Option Two courses have the requested design/tools locally; the four older non-Option-Two courses, Biology/Chemistry and unrelated Sports Wellness work remain untouched by propagation. Branch codex/social-ela-updates; restore tag checkpoint-before-social-ela-2026-09-18 remains at 280aaf12. Only Social 30-1 Issue 1 has previously been deployed.

## Exact next action
Review this local candidate through projects/social30-1-related-issue-1-option-2/meta/option-two-review.html. If deployment is requested, first extend the established shared-review deployment owner for the agreed Option Two set and run the accumulated rollout batch; its current configuration publishes Social Issue 1 only.

## Exact next file to open
projects/social10-1-related-issue-2-option-2/workspace/index.html

## SCORM integration before packaging — 2026-09-18
- Summary: explicit SCORM 2004 hash-page tracking contract uses existing required lesson IDs and completion store. The shared exporter supplies LMS save status, Save now/Save and Exit, answer/evidence restoration, resume, progress/completion and active session/page timing. Optional tools/practice do not add requirements or scores.
- Files changed: workspace/scorm-tracking.json and meta/project.json; shared focused test scripts/tests/social-option2-scorm.mts. No workspace bridge duplication or Social-builder run.
- Verification: course:doctor passed for all 12 projects; `node_modules/.bin/tsx scripts/tests/social-option2-scorm.mts` passed all 12 real canonical pages against the current shared exporter bridge. Clean browser contexts restored existing Study Guide answers/manual evidence, new Position Builder answers/collected evidence/Frayer notes, bookmarks and cumulative time. Exact required IDs drive partial/full completion. Representative overflow and failed-commit/retry checks passed. Simulated LMS only; no upload ZIPs created.
- Risks/follow-up: verify generated ZIP assets/manifest, accumulated learner E2E/Studio checks and a real Brightspace attempt before claiming LMS readiness. The current legacy localStorage transport retains the shared 60,000-character save guard; overflow preserves the prior LMS save and reports a retryable error. Some Social 30 workspace snapshots retain an older bridge; export replaces it with the current shared implementation. Hosted/local course previews are not LMS certification.
- Source of truth: workspace/index.html retains lessons and real form controls; workspace/scorm-tracking.json owns the export tracking contract; scripts/lib/exports/scorm-package.ts owns generated bridge injection and packaging.
- Fragile areas: retain route/response/completion/storage IDs and the three original stores. Never count optional tool work, visits or evidence collection as lesson completion; do not invent written-work grades. Keep legacy builders quarantined.
- Next prompt assumptions: integration request does not authorize packaging/upload/deployment; no commit/push performed.
- Exact next action: when packaging is requested, freeze the candidate, run the accumulated rollout batch and export SCORM 2004 with the owning exporter; validate the actual ZIP and then pilot in Brightspace.
- Exact next file: workspace/scorm-tracking.json.

## Detailed time/action reporting — 2026-09-18
Opted this Social course into shared SCORM 2004 ungraded interaction summaries. Native rows carry counts/first/latest timestamps for page access, answer-edit bursts, changed lesson completion, actual evidence collection/removal, vocabulary/textbook/practice use, topic/source filters, guide openings, media selection/native player events and resource access. Page-time summaries carry active, foreground-visible and idle seconds. Hidden/sleep gaps are excluded; foreground time continues during quiet reading after the active idle cutoff. Answer text/search queries are not copied into analytics. No score or completion requirements changed. Counts hydrate from native LMS interactions, keeping action histories out of suspend data.

Shared owners changed: scripts/lib/scorm-actions.ts, scorm-tracking.ts and scorm.ts; contract/unit coverage, focused Social integration harness and README/architecture/contributing/SCORM workflow docs updated. All 12 focused real-page simulated-LMS checks and course doctors passed; shared unit tests 30 passed; shared browser tests 18 passed/1 skipped (excluded remote Biology photo pilot). Rejected interaction-write retry, cumulative stable edit rows, no answer text in reports, actual collection/completion/access events, foreground/active/hidden time and prior save protections verified. No Social upload ZIPs/deployment/commit/push performed. Actual Brightspace interaction/report visibility still needs a pilot; external iframe access does not prove viewing. Exact next file: workspace/scorm-tracking.json. Exact next action: freeze and run remaining candidate rollout gates when packaging is requested, then export/inspect actual SCORM 2004 ZIPs and pilot Brightspace reports.


## SCORM download packaging — 2026-09-18
Production SCORM 2004 export and project E2E contract passed. Upload ZIP: `projects/social10-1-related-issue-2-option-2/exports/social10-1-related-issue-2-option-2-scorm-2004.zip`. Combined receipt: `projects/social30-1-related-issue-1-option-2/meta/option-two-scorm-release.json`. Outer download must be extracted; upload each inner ZIP individually. Final CRC, manifest, local-resource and analytics verification recorded in the receipt. Non-ASCII ZIP filename flags normalized after macOS packaging; verify again on subsequent exports. Actual Brightspace pilot and comprehensive Studio lifecycle remain deferred. Resource notes identify inherited missing materials; obtain teacher resources for dependent activities. No upload or deployment occurred.


### Replacement v2 — Brightspace reporting rejection
Optional action-report failure no longer blocks saved work or Save and Exit after successful required-state commit. Pending reports retry while the session remains open; exact rejected field/LMS diagnostic is logged. Required write and commit failures remain blocking. Replacement export and ZIP integrity/manifest/resource/bridge checks passed. Use the v2 combined download in option-two-scorm-release.json; earlier bundle is superseded. Focused rejected-report save/reopen/exit and shared unit checks passed. Actual Brightspace reporting availability remains unverified.


### Accepted family automatic-save rollout — 2026-09-18
Teacher confirmed Social 20 Issue 1 works and requested all 12 Option Two Social packages. This canonical body now opts into automatic saves with hidden success status and no manual Save and Exit; required save errors retain visible retry. Whole-second native SCORM interaction timestamps included. Real-course focused automatic/save/reopen/failure recovery checks passed for all 12. Production package and final archive checks recorded in projects/social30-1-related-issue-1-option-2/meta/option-two-scorm-release.json. Use the v5 family download; older packages superseded. Upload individual inner ZIPs; no agent LMS upload, deployment or commit performed. Actual sibling LMS reports and comprehensive Studio checks remain deferred.
