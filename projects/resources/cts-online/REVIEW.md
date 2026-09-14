# Five CTS online review courses

Implemented as five separately scaffolded, directly authored local workspaces. The 42 supplied CTS module identities are retained, including 11 distinct project courses. There are 126 lesson sections and 84 retryable practice decisions, original fictional data, external-product tasks, rubric guidance, autosaved short records and live-linked saved Portfolios.

## Open a course

- [Marketing 10–20 — Online](../../marketing-10-20-online/workspace/index.html) — 9 modules
- [Marketing 30 — Online](../../marketing-30-online/workspace/index.html) — 7 modules
- [Legal Studies 30 — Online](../../legal-studies-30-online/workspace/index.html) — 7 modules
- [Tourism 10–20 — Online](../../tourism-10-20-online/workspace/index.html) — 12 modules
- [Tourism 30 — Online](../../tourism-30-online/workspace/index.html) — 7 modules

## Review boundary — not curriculum certification

The authorized course-code list and CTS structural/project guidance were retrieved from current official sources on 2026-09-09. The detailed LGS/MAM/TOU references returned website migration notices; indexed historical text is not sufficient to certify current outcomes. Each course therefore has an authored learning/evidence map with an explicit unresolved official outcome reconciliation. No official specific-outcome count or complete coverage is invented. These are working review candidates, not fully curriculum-verified learner courses.

Obtain current detailed official course documents for all three occupational areas. Reconcile every general and specific outcome, prerequisite and parameter; add missing teaching/evidence and re-review depth. Teacher review must also validate the approximately 25-hour workload per CTS code and any solo performance alternatives. Event simulation does not establish actual facilitation. Project prerequisites require successful eligible prior courses and teacher confirmation, not saved drafts.

All courses remain blocked, Studio Edit disabled, exports disabled. No hosting, commits, push, SCORM or Brightspace deployment was performed. Existing donor courses and shared-shell sources were not edited.

## Files and proof

- Original ZIP, five PDFs and rubric: content-addressed _sources/ with SHA-256 inventory; authoring-only, not learner exports.
- Per course meta/: curriculum-assessment-map.json, teacher-assessment-guide.md, brightspace-setup-guide.md, state-contract.json, project.json, e2e-contract.json, review.json, verification.json and visual-review/.
- Source inventory: source-inventory.json. Current learner links: link-check.json.
- Re-run checks: `npx tsx --test scripts/tests/cts-online.test.ts`, `npx playwright test -c e2e/playwright.config.ts e2e/specs/cts-online.spec.ts`, `npx tsx scripts/verify-cts-online.ts`.
- Project E2E contracts validate Studio discovery. The dedicated CTS suite supplies the interaction-level coverage; disabled shell-specific quiz contracts are not a claim of deep coverage.
- Exact-head new-course gate reported PASS with zero required active courses. That is the expected blocked-review disposition, NOT proof of reversible Studio editing or promotion readiness.

## Fragile areas

Learner records are capped at 400 UTF-16 units per field; full posters, recordings, presentations and long written work are external files. The largest fully escaped state is below 48,000 characters. Different browsers/devices keep separate storage. A saved Portfolio item reflects current writing and can later become incomplete without disappearing. Prices and locations in the core datasets are fictional, while live research needs source dates.

Canonical teaching remains in each workspace/index.html; course.js only attaches behaviour. No retained PE/CTS course builder exists. Intake and verification scripts manage source records and diagnostic reports, never regenerate learner content.
