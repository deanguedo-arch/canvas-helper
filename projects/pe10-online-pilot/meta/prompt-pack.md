# Physical Education 10 — Online contract

- Workflow: generated-course
- Canonical learner page: `projects/pe10-online-pilot/workspace/index.html`
- Canonical styles: `projects/pe10-online-pilot/workspace/styles.css`
- Canonical runtime: `projects/pe10-online-pilot/workspace/course.js`
- Studio authoring driver: `direct-workspace-v1`
- Status: blocked, preview-only, Studio Edit disabled, exports disabled
- State key: `canvas-helper:pe10-online-pilot:state:v1`

## Purpose

This course converts the familiar outreach PE10 activity-log-plus-assignments model into a complete self-paced learner experience. It uses one fixed 50-hour target, the Biology pilot's restrained Next Step visual language, five Alberta movement dimensions, ten five-hour reflections, five 10-point academic assignments, and a privacy-minimized portfolio workflow.

## Source ownership

- Edit learner behavior and content only in the three canonical workspace files and local assets declared in `meta/project.json`.
- Never edit `raw/**`; it preserves the required scaffold baseline.
- Supplied documents are content-addressed authoring references under `projects/resources/pe10-online-pilot/_sources/**`. They never belong in learner exports.
- `projects/resources/pe10-online-pilot/source-inventory.json` records source hashes, roles, rights status, and dispositions.
- `meta/curriculum-assessment-map.json` records adopted, rewritten, excluded, outdated, contradictory, and rights-restricted material.
- Do not create a PE builder or move ownership into `scripts/lib/next-step-course-shell.ts` for this pilot.
- Do not modify Biology, Sports Wellness, another course, or shared shell files while refining PE10.

## Fixed pilot decisions

- Learner-facing credit references are omitted.
- The activity target is 50 hours or 3,000 minutes.
- Activity evidence represents 50% of the familiar model.
- Five assignments worth 10 points each represent the other 50%.
- Brightspace remains authoritative for submissions, grades, and feedback. The course reports readiness and never calculates an official grade.
- Track alternative environments, dance, games, gymnastics/body control, and individual activities.
- Five hours in each dimension and no more than 30 hours in one dimension are readiness checks, not navigation locks.
- A teacher-approved alternate plan may satisfy one or more dimension breadth checks but never reduces the 50-hour total.

## Privacy and safety boundaries

- Do not add weight, calories, diagnoses, medical explanations, verifier phone numbers, or verifier email addresses.
- Store no uploads, photos, videos, or binary evidence in course state.
- Keep the optional verifier fields limited to name and role.
- Keep activity-specific approval with the teacher and current division guidance. Do not reintroduce the legacy contradictory high-risk activity lists.
- CPR/AED content is awareness only, never certification.
- Recheck current Alberta, EIPS, first-aid, nutrition, accessibility, privacy, and accommodation guidance before learner release.

## Persistence contract

- Keep the one versioned state key and the schema in `meta/state-contract.json` synchronized with `workspace/course.js`.
- Persist Portfolio membership as canonical assignment IDs only. Legacy schema-v1 state without `completion.portfolioAssignmentIds` must load with an empty saved-assignment collection.
- Keep maximum populated state below the 48,000-character guard.
- Preserve strict rejection of malformed, oversized, wrong-project, and future-schema backups.
- Never overwrite current state until a restore file passes complete validation.
- Preserve log CRUD, duplicate warning, future-date rejection, dimension calculations, checkpoint unlocking, assignment autosave, scoped printing, CSV, copy summary, and JSON backup/restore.
- Stable state identifiers and tuple order are learner-data compatibility contracts.

## Brightspace boundary

- Do not add guessed or placeholder submission URLs.
- Do not render learner submission controls until real HTTPS Brightspace locations are approved.
- Follow `meta/brightspace-setup-guide.md` for the five assignments and portfolio evidence.

## Review and promotion

- `meta/pilot-review.json` is the approval gate. Automated tests and Codex review never populate teacher decisions.
- Keep Studio Edit, HTML export, and SCORM export disabled while any required decision is pending.
- After explicit approval of the exact build, promotion is a separate task: enable Studio Edit and SCORM 2004, prove Apply/reload/Undo, run the exact-head gate, verify package integrity, and test save/restore in Brightspace with a learner account in both institutional browsers.

## Verification floor

- `npm run test:codex-course`
- `npm run test:new-course-readiness`
- `npm run verify -- --project pe10-online-pilot --mode workspace`
- `npm run test:e2e:project -- --project pe10-online-pilot`
- `npx playwright test -c e2e/playwright.config.ts e2e/specs/pe10-online-pilot.spec.ts`
- `npm run build:studio`
- `npm run course:doctor -- --project pe10-online-pilot` (expected refusal: `not-active` only)
