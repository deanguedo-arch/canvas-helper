# Approved course — canonical adoption

Dean approved Version B revision 4 as the only active course on October 5, 2026. Open http://127.0.0.1:4195/ . This server now serves `projects/calm10-2026-draft/workspace/` directly; old A/B URLs redirect there. All comparison material below is historical.

Future edits belong in canonical workspace HTML/CSS. Do not rerun review assemblies as a course build. Original A, Before snapshots, professional assets and archived review saves remain intact. Promotion record and focused save-compatibility evidence: `meta/implementation/version-b-adoption-2026-10-05/`.

---

# Revision 3 — whole-course review

All forty lessons are available in the native Version B review: seven career lessons retained and thirty-three remaining proposals authored with visible purpose, context, learning sequence and final expectations. Read the [current ownership, checks and rebuild instructions](course-wide/README.md). The older statuses and evidence below describe prior batches.

Open http://127.0.0.1:4195/review/b/index.html?revision=3#co1-03 or compare through http://127.0.0.1:4195/ . Canonical integration remains separate from this review build. Use course-wide/assemble.cjs for this continuation; the older parent assembler alone would revert B to the six-lesson batch.

---

# Revision 2 — visible opening and Alberta course context

Open http://127.0.0.1:4195/ to compare six career proposals. B gives purpose, situation, learning sequence and final product before technical teaching. CE1-05 uses Alberta courses and separates diploma rules from fictional practice-provider conditions.

Revision-1 proposals are retained under revision-1/. Original baseline, canonical and Before snapshots remain intact. A is the frozen course. Changed CE1-05 B tasks preserve earlier review wording/history. Current evidence: source-checks.json and revision-2-checks.json. render-checks.json and unaffected screenshots are revision-1 evidence. No broader rollout checks ran.

# CALM teacher-narrative standard and first review batch

## Status

- Project-local authoring and full-reading review standard recorded and linked from the CALM prompt-pack.
- Accepted CE1-03 remains canonical and the hash-bound exemplar.
- Remaining 39 lessons audited; findings are in `AUDIT.md`.
- Six complete career manuscripts and native A/B review copies prepared: CE1-01, 02, 04, 05, 06, 07.
- These six are **awaiting user review**, with no canonical integration or universal standard promotion.

Review: http://127.0.0.1:4195/

Current course: http://127.0.0.1:4193/after/index.html#ce1-03

## Files and ownership

- `projects/calm10-2026-draft/workspace/index.html` is the canonical learner course. Its 32 root-file hashes remain equal to the captured baseline.
- `meta/calm-teaching-standard.json` binds the accepted exemplar and two rule sets; `meta/prompt-pack.md` makes their reading mandatory for future CALM work. The generic scaffold renderer/checker has no CALM-shell adapter; no automatic generic enforcement is claimed.
- `STANDARD.md`, `authoring-rules.json`, `review-rules.json` are the project-local authoring/review contract. They do not approve other lessons automatically.
- `BASELINE.json` and `baseline/` preserve the current pre-batch course. Prior CE1-03/FL2-03 Before snapshots are untouched.
- `career-copy-1.cjs`, `career-copy-2.cjs` contain manually authored proposal prose. `assemble-review.cjs` assembles the complete static review fragments and learner manuscripts, preserving native controls, facts and media. These are operational proposal inputs, not a new course runtime or Studio ownership adapter.
- `manuscripts/*.html` and `*.md` are the complete review proposals. `review/a` and `review/b` are delivery copies, not canonical sources. Their JavaScript differs only in delivery namespace prefixes. Do not import their synthetic/review answers into the course.
- `REVIEW_MANIFEST.json` records candidate hashes and explicit model/date/media/control-wording corrections. `CONTENT_REVIEW.md`, `source-checks.json`, `render-checks.json` record bounded evidence and limits.
- `screens/` contains changed-area captures; these are review aids rather than full-course certification.

## Preview restart

Only if the 4195 review is stopped:

```sh
node projects/calm10-2026-draft/meta/teaching-overhaul/calm-standard-v1/preview.mjs
```

Run from `/Users/deanguedo/Documents/GitHub/canvas-helper`. The loopback server serves the frozen review copies and existing canonical assets without editing them. It supports video byte ranges. Port 4193 and its Before/After server are unchanged.

## Focused commands

These are proposal-specific checks, not release gates:

```sh
node projects/calm10-2026-draft/meta/teaching-overhaul/calm-standard-v1/check-source.cjs
node projects/calm10-2026-draft/meta/teaching-overhaul/calm-standard-v1/check-preview.cjs
```

The assembler is reproducible but overwrites review manuscripts and copies. Do not rerun it after a manual proposal edit without reconciling that edit into its authored inputs. After canonical integration, this old baseline check ceases to be a current-course gate. Capture a separate guarded integration baseline at approval time.

## Next action

Read each B lesson from its opening through final sign-off and compare A at the linked points. Record which lessons the user accepts and any requested changes. Then integrate only those exact accepted articles with a guarded replacement, preserving controls, task versions, history and source provenance. Do not widen to the later 33 lessons, package or publish as part of that integration.

## Deferred checks and routing

Whole-course E2E, comprehensive accessibility/media review, Studio lifecycle, SCORM/Brightspace and release proof remain deferred. `context:project` still hits its existing context-size cap (14,708 bytes versus 5,000); this task does not repair that tooling.

Routes actually used: lead pedagogical authoring/source decisions on a dirty boundary; deterministic local proposal assembly; existing independent read-only reader for audit and candidate review, with two bounded financial/security readers during the audit. No Muse implementation. Baseline/source reuse is not provider-cache telemetry. Usage savings are unknown, not measured.
