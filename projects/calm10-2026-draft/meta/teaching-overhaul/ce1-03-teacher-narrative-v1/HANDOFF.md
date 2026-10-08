# Handoff

- Project: calm10-2026-draft
- Task: Integrate Dean's accepted CE1-03 Version B into the current course.
- Status: building — accepted lesson integrated and current preview usable; broader rollout proof deferred.

## Files changed

- projects/calm10-2026-draft/workspace/index.html: only the exact accepted CE1-03 article replaced.
- projects/calm10-2026-draft/meta/prompt-pack.md: scoped approval and ownership record.
- projects/calm10-2026-draft/meta/teaching-overhaul/ce1-03-teacher-narrative-v1/: integration scripts/evidence, decision manifest, README/content-review status and comparison landing acceptance notice.
- docs/ops/ACTIVE_HANDOFF.md; previous review checkpoint archived verbatim.

## What changed

Dean said “i really like it” after being offered A/B choice. Exact B teaching is now canonical: connected opening/purpose, Leah's document reading and Route A reasoning, supported Route B investigation and Owen's fresh application. Shared vocabulary presentation restored; the model correctly describes Owen's eight-month-or-less preference and states the trade-off. Review A/B pages and all Before snapshots remain preserved.

## Why this changed

Implement the teacher's acceptance of the complete CE1-03 pilot, within its explicit single-lesson boundary.

## Source of truth

Canonical: projects/calm10-2026-draft/workspace/index.html and unchanged existing runtime/styles. lesson-b.html and manuscript.md in the pilot folder are now accepted review snapshots, not ongoing canonical owners. Original index and root hashes immediately before integration are in canonical-integration/.

## Verification run

- integrate-approved.cjs passed guarded replacement: exact reviewed fragment; all bytes outside CE1-03 and 31 other root files unchanged; original controls/documents/feedback templates/media/IDs/edit keys/task versions/history registry retained. No runtime, storage namespace or migration changes.
- check-integration.cjs passed on the current 4193 After preview: exact article served; existing synthetic final/practice responses, signoffs, completion and earlier history survived reload; unknown prior save retained; keyboard vocabulary/focus worked; desktop/mobile opening captured, no phone overflow or page errors. Actual learner storage was untouched.
- Final integrated desktop/mobile opening screenshots inspected.
- Prior unchanged media/feedback/A-B checks remain historical passing proof; not repeated.
- context:project's existing context-size cap failure remains unresolved (14,708 bytes versus 5,000); no unrelated repair.

## Fragile areas / watchouts

- Do not rerun author-candidate.cjs, prepare-review.cjs or historical migration scripts over accepted/newer content. check-review.cjs checks the previous pre-integration boundary and is not a current canonical gate.
- Preserve all IDs, existing task versions, historical wording and completion contracts. Teaching/models changed; current questions/tasks did not, so no answer migration was introduced.
- Review saves on 4194 remain separate; 4193 After uses its existing review-after prefix. Do not migrate review answers into canonical storage.
- Older unrelated FL3-04 answer-key overlap remains separately scoped.

## Next prompt should assume

CE1-03 B is accepted and integrated. Other 39 lessons and all runtime/styles remain unchanged by this integration. Approval is scoped to this lesson; wider adoption needs a new decision.

## What still needs validation

Whole-course E2E, broader accessibility/media review, Studio lifecycle, SCORM/package and release proof remain deferred to a separately requested checkpoint.

## Known risks

Local browser compatibility proof is not LMS/release certification. context:project tooling remains above its pre-existing size cap.

## Routing

Lead retained this small dirty/state-sensitive canonical integration; deterministic guarded source replacement and a focused synthetic compatibility check. No new worker or Muse run. Local source reuse is not provider-cache telemetry; savings unknown.

## Exact next action

Await Dean's next scoped change. Current lesson: http://127.0.0.1:4193/after/index.html#ce1-03 . No preview restart required.

## Exact next file to open

/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm10-2026-draft/workspace/index.html

## Do not do next / warnings

Do not expand this rewrite to the remaining lessons, regenerate the course, promote a universal standard, package, deploy or publish without a new scoped decision.
