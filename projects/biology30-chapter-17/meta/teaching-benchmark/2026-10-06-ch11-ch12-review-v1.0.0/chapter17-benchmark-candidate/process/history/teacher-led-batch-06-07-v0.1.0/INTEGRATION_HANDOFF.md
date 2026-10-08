# Lessons 6–7 isolated integration — 2026-10-06

## Summary

Downloaded the actual completed Pro return and integrated both exact teaching fragments for Dean's review. The new comparison is http://127.0.0.1:57240/?lesson=06 and the full candidate is http://127.0.0.1:57242/index.html#lesson-06. Earlier previews and live canonical are unchanged. Lessons 1–5 remain the earlier revisions; 8–15 remain previous copy.

## Files changed

New scripts: `scripts/build-biology30-ch17-batch2-comparison.mjs` and `scripts/serve-biology30-ch17-batch2-comparison.mjs`. This folder now retains immutable `pro-return/`, derived `evaluation/` with baseline/new/source/comparison/preservation report/screenshot, updated AUTHORING_STATUS and this handoff. No global ACTIVE_HANDOFF replacement or canonical edits.

## Verification run

Actual ZIP is 1,206,261 bytes, SHA256 b5783d56ff4f261affe67f158ccd0c15b85f519c4db6beacaf5fabd5930ef4f3. CRC, 68 safe members, 66 manifest payload hashes and checksum entries pass. Frozen owner matches; 837 protected file hashes pass before/after; 163 native non-index files exact; every other lesson, native data, assessment/note controls and locked ABO figure remain exact. Only the two authorized teaching intervals change. Full returned teaching fragments read by lead, quantitative tables recomputed and reconciled against independent Scout source/sequence findings and open issues. No additional clinical claims or generated images introduced.

Focused browser checks: both new routes render; comparison selector updates both native panels and matching source slides; lesson 6 vocabulary popup opens/closes; clickable vocabulary weight is 800; locked ABO enlargement opens/closes; all three lesson 7 images loaded after their sections were visited; course progress remains 0/15 in fresh QA origin. Existing saving code/IDs preserved statically; no new save-state compatibility claim from this batch. Screenshot inspected. Scoped whitespace diff check passes. No broad regression suite run.

## Known risks / follow-up

Independent Scout returned-copy review is still pending (source review is complete). Teacher exact-copy acceptance remains pending. Protected lesson 7 reader links still point to 596/598, while ABO source is 604–606. Existing foundation-check overlap, optional historical/clinical source gaps and typed-answer ambiguities remain in pro-return/OPEN_ISSUES.md. Broad E2E, accessibility/mobile, save-history migration, Studio, SCORM, Brightspace and deployment checks remain deferred, not passed.

## Source of truth

Frozen current owner SHA31447f72550c68ceb4a7cfd444f85651908a86782096dff4e4847cff4ab9e3e4 plus immutable returned teaching fragments. Candidate SHA480d60d752d717b9d947098695b043bf85776dff4fcb796725a6506c298f7262. Canonical workspace remains unchanged.

## Fragile areas

Protect raw return, exact replacement intervals, locked figure, existing IDs/keys/data, saved-note bindings, namespaces, progress, fonts/styles and earlier candidates. This is review integration, not canonical integration or release acceptance.

## Next prompt assumptions

Dean will review this newly opened comparison rather than ports 57200 or 57232. Acceptance of these lessons does not approve all Chapter17 or all course standards.

## Exact next action

Dean reviews lessons 6 and 7 using the comparison dropdown and supplies sign-off or corrections. Preserve this candidate; complete the separate returned-copy review and continue bounded authoring 8–15. Server is running via `node scripts/serve-biology30-ch17-batch2-comparison.mjs` (session29180).

## Exact next file to open

`evaluation/new/index.html`, or `pro-return/OPEN_ISSUES.md` for inherited limitations.

## Routes

Lead retained source-of-truth, complete teaching-fragment review and dirty-candidate compatibility boundaries. Deterministic scripts handled receipt checks and assembly; existing independent Scout source report reused. No new worker/Muse call. Provider-cache telemetry and usage savings unknown. UI-preservation skill kept existing layout, fonts, palette and controls.
