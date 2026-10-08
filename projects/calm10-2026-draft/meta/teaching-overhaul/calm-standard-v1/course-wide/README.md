# Approved course — canonical adoption

Dean approved Version B revision 4 as the only active course on October 5, 2026. Open http://127.0.0.1:4195/ . This server now serves `projects/calm10-2026-draft/workspace/` directly; old A/B URLs redirect there. All comparison material below is historical.

Future edits belong in canonical workspace HTML/CSS. Do not rerun review assemblies as a course build. Original A, Before snapshots, professional assets and archived review saves remain intact. Promotion record and focused save-compatibility evidence: `meta/implementation/version-b-adoption-2026-10-05/`.

---

# Course-wide teaching review — revision 3

Dean authorized carrying the approved revision-2 approach throughout CALM. All forty lessons are now present in the native Version B course: the seven career lessons retained exactly and thirty-three new remaining proposals. This is a review build, not canonical integration.

Open [Version B](http://127.0.0.1:4195/review/b/index.html?revision=3#co1-03) or the [complete comparison](http://127.0.0.1:4195/).

## What changed

- Each new lesson visibly establishes the concept, first person/decision, learning sequence and expected final work before technical teaching or a case question.
- Topic-specific narration connects the method, completed example, supported practice and independent case. Detailed original reasoning remains available rather than being replaced by a short generic summary.
- The approved CO1-01, FL2-03 and FL3-04 pilot middles remain intact; their openings now provide the same visible orientation.
- Original professional videos, transcripts, handouts, source records, answer options, numeric answers, response IDs, task versions, histories, sign-offs and completion controls remain.
- Repairs remove CO1-02's author placeholder and CO1-03's nonexistent fourth practice field; CO2-02 now routes to the coworker practice rather than an optional video response. FL2-01's $40 allowance is visible before its choice. FL1-06 names all three updates. FL4-04 no longer invents Mina's budget in its feedback.

## Ownership and rebuilding

Canonical remains `projects/calm10-2026-draft/workspace/index.html` and its existing runtime/styles. No workspace file was written.

The five `*-copy.cjs` files here own the thirty-three authored proposals. `accepted-career-review-index.html` is the frozen continuation input. The `*-before.html` files preserve exact prior article bytes. Complete manuscripts are in `manuscripts/`; `MANIFEST.json` records hashes and coverage. Do not hand-edit delivery copies.

From the repository root, rebuild only this review with:

```sh
node projects/calm10-2026-draft/meta/teaching-overhaul/calm-standard-v1/course-wide/assemble.cjs
node projects/calm10-2026-draft/meta/teaching-overhaul/calm-standard-v1/course-wide/landing.cjs
```

The older parent `assemble-review.cjs` produces the six-lesson revision only. Running it alone would replace the course-wide B delivery with the earlier batch. The parent comparison and revision-2 metadata/evidence are historical; this directory's manifest/checks own revision 3.

Preview restart:

```sh
node projects/calm10-2026-draft/meta/teaching-overhaul/calm-standard-v1/preview.mjs
```

## Verification and boundaries

`source-checks.json` records manuscript-to-preview fidelity, all original controls/IDs/edit keys, unchanged tables and media, seven unchanged career articles and all thirty-two protected canonical root hashes. Mina's explicitly documented feedback correction is the sole model-text exception.

`preview-checks.json` records synthetic review save/restore, prior history, A/canonical storage isolation, selected numeric support feedback, vocabulary keyboard behaviour, media range samples and twelve selected desktop/mobile opening views. These are focused Build checks, not full-course learner E2E or pedagogical acceptance.

Lead authored the new copy from the actual case records and response fields and inspected representative rendered openings. Dean's whole-course teaching review remains the acceptance gate. No claim of independent second-reader approval, exhaustive link checking, Studio proof, curriculum certification or LMS readiness is made.

Review B keeps `calm10-2026-draft:career-standard-v1:b:`. No new task version or activity was introduced for these thirty-three unchanged tasks. CE1-05 retains its already-versioned Alberta review task and exact prior-prompt registry. Keep review answers separate from canonical learner work during later integration.

Deferred: full-course E2E, comprehensive accessibility/responsive/media and source-currentness checks, Studio lifecycle, packaging, SCORM/Brightspace and release verification. No deploy or universal course-standard promotion occurred.

## Stage-title presentation follow-up

`stage-headings.css` owns the larger, bold teal main stage labels in Version B. The assembler copies and links this stylesheet; nested activity labels retain their existing size. CO2-01 was visually inspected in the native preview (`stage-heading-preview.jpg`). Existing JSON check reports describe the preceding content build and were not rerun for this CSS-only refinement. Canonical and Version A remain unchanged.

## Math shell alignment

`course-shell.css` matches the Math 10C Unit 4 shell: centred 122×54 logo, 78px collapsed sidebar rail with the same panel icon and 40×44 control, 1050px/760px spacing breaks, and bottom save status. The existing menu button, navigation listeners, content, IDs and saved-work namespace are unchanged. The assembler copies and links this review-only source into B.

Inspected expanded/collapsed desktop and a 390px mobile opening in the native browser; navigation opened and closed at both sizes. Temporary viewport override was reset. Screenshot: `course-shell-preview.jpg`. Broad checks remain deferred. Review: http://127.0.0.1:4195/review/b/index.html?revision=3-shell#co2-01 .

## Alberta/Canada clarifications — revision 4

`jurisdiction-copy.cjs` owns the CAD notes, GST explanation, provincial regulator naming, official reference links and CE1-05 prerequisite source confirmation. `assemble.cjs` applies these explicit edits to the relevant B lesson sources and course opening; frozen inputs stay unchanged. See `ALBERTA-CANADA-AUDIT.md` for implementation evidence and current source checks. Review: http://127.0.0.1:4195/review/b/index.html?revision=4-alberta#ce1-05 .
