# Handoff

- Project: all 12 Social 10-1, 20-1 and 30-1 Related Issues 1–4, Option Two.
- Task: Apply the accepted automatic-save pilot and deliver a combined SCORM download.
- Status: all 12 production packages and combined download built and archive-verified. On 2026-09-19, the teacher explicitly authorized committing and pushing the current repository checkpoint so the online Git repository is current for ChatGPT review. This does not authorize LMS upload or deployment.
- Download: /Users/deanguedo/Downloads/Social-Option-Two-SCORM-2004-2026-09-18-v5.zip (2,693,970,093 bytes; 12 inner upload ZIPs).

## What changed / why
The teacher confirmed the Social 20 Issue 1 pilot works and explicitly requested all Social courses packaged with it. All 12 canonical bodies now opt into data-scorm-save-mode="automatic". Successful status banners stay hidden; the manual Save and Exit control is omitted. Debounced edit saves, heartbeat, navigation/visibility saves and unload termination remain active. Required save failures expose Save now retry and hide after recovery. Native interaction timestamps use whole-second UTC precision to correct the actual Brightspace error 406 seen on three-digit milliseconds. Optional reporting failures remain logged/retryable and do not block learner saves.

## Files changed
- Eleven sibling projects/<slug>/workspace/index.html body attributes; Social 20 Issue 1 already opted in.
- scripts/tests/social-option2-scorm.mts: automatic-mode save/reopen and failure/retry coverage now applies to every opted-in course.
- docs/workflows/scorm-tracking.md: accepted family opt-in.
- All 12 generated exports/scorm-2004 trees and individual upload ZIPs.
- projects/social30-1-related-issue-1-option-2/meta/option-two-scorm-integration.json and option-two-scorm-release.json.
- Per-course meta/visual-layer-handoff.md and operational active/archive handoffs.

## Verification run
All 12 current real-Social-HTML simulated-LMS checks passed: retained legacy answers/Evidence Bank/new vocabulary notes, required completion, resume, timing, strict whole-second interaction timestamps, automatic edit saves, reopen, no early termination, hidden successful status, and visible failed-commit retry/recovery. All 12 production export gates passed. Final ZIP CRCs, manifest-file presence, binary assets versus LFS pointers, local resource references, automatic-save opt-ins and current bridge checks passed, followed by combined archive CRC and SHA-256. Prior project E2E contracts all passed during initial packaging; shared exporter/tracking unit checks 26 passed during the pilot. Passing unrelated suites were not repeated.

## Source of truth
Legacy-snapshot-v1 canonical workspace HTML and scoped support/tracking contracts remain owners. scripts/lib/scorm-actions.ts, scorm-tracking.ts and scorm.ts own shared bridge behavior; scripts/lib/exports/scorm-package.ts owns injection/manifests. No quarantined builder ran. Branch codex/social-ela-updates; restore checkpoint commit 280aaf12249982ffab1a63172d519b39f2d4c171 remains the pre-update recovery point. The current checkpoint is committed and pushed on this branch under the teacher's 2026-09-19 authorization.

## Fragile areas / watchouts
Preserve all route/response/completion/storage IDs and shared canonical Frayer controls. Optional analytics are neutral/ungraded; external media access is not proof of watching. macOS zip omits UTF-8 flags for inherited non-ASCII names; archive headers are normalized without changing compressed contents, then CRC/manifest checks verify them. Recheck encoding on future exports. Large inherited course asset bundles remain intact. No Biology/Chemistry setting changes.

## Known risks / what still needs validation
The teacher reported the Social 20 Issue 1 pilot works; the agent did not independently certify all LMS reports or sibling attempts. Actual sibling upload/reopen/report checks and comprehensive Studio lifecycle remain deferred. Some Social 10 source materials are unavailable; lessons and download resource notes identify them. Earlier teacher-review deployment is unchanged.

## Next prompt should assume
The user authorizes family packaging with the accepted automatic mode and, on 2026-09-19, explicitly authorized committing and pushing the current repository checkpoint for online review. No LMS uploads or deployment are authorized. Prior v2 family and v4 single-course packages are superseded by the new family download.

## Exact next action
Extract the combined download and upload individual inner ZIPs to Brightspace; verify normal saved work and reports before broad assignment.

## Exact next file to open
projects/social30-1-related-issue-1-option-2/meta/option-two-scorm-release.json

## Do not do next / warnings
Do not upload the outer download ZIP as a SCORM activity. Do not run quarantined Social builders or publish unrelated changes.
