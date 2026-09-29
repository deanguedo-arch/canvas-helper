# CALM 10 source-spine implementation · 2026-09-26

## Standard

Every named official source now supports the complete learner sequence:

1. The opening asks a question the source can help answer.
2. Learners open the source before the main explanation.
3. Teaching identifies the source field, claim, data or decision step to use.
4. The complete example tells learners how the source evidence connects to the model.
5. Practice returns learners to a specific source detail before feedback.
6. The independent response uses one dated source detail and identifies a limit.

Essential teaching, fictional case facts and calculations remain in editable HTML so a temporary external outage does not remove the explanation.

## Implementation result

All 40 lessons now use the source-spine sequence. Each lesson contains a content-specific opening question, a three-step reading guide, required checkpoint, model cue, practice cue and collapsed scope-limit tip. The reading guide names the page and tells learners where to look, what to record, and how the evidence will be used next. The official-source disclosure remains collapsed directly after `How to complete this lesson`; it states that the page is required and links directly to the official page. The larger source task appears after the opening decision, before teaching. CE1-02 uses three staged checkpoints and links directly to **Graphic Designer — alis** rather than the general occupation directory. CE1-04 now links directly to **Database Analyst — alis** and identifies the exact Employment & Advancement forecast fields used in the labour-market lesson.

The exact 40-lesson cue set is recorded in `source-spine-cues-2026-09-26.json`. The source titles, owners, URLs, timing and lesson roles are recorded in `source-access-plan-2026-09-26.json`.

## Resolved source mismatches

| Lesson | Earlier mismatch | Corrected official source and role |
|---|---|---|
| FL1-04 | CRTC mobile-plan guidance did not support the laptop and calculator purchase comparison. | Office of Consumer Affairs, **Research products before you buy**. Learners compare price, service and warranty while keeping fictional prices separate. |
| FL1-06 | FCAC car financing did not support moving, setup and bicycle costs. | FCAC, **Making a budget**. Learners sort upfront, recurring and irregular costs and verify current local amounts separately. |
| FL3-04 | The CRA future-savings page did not teach the lesson's inflation and purchasing-power skill. | Bank of Canada, **Inflation Calculator**. Learners interpret fixed-basket CPI comparisons while keeping the lesson figures labelled as a fictional scenario. |

All three corrected pages returned HTTP 200 on September 26, 2026. Their final task versions advanced to `2026-09-26.3`; prior `2026-09-26.2` responses remain visible in task history. The other 37 final tasks remain at `2026-09-26.2`.

## Focused verification

- Static verification: 40 source disclosures, 40 source-throughout bands, 40 page-specific reading guides with 120 directions, 42 unique required checkpoints, 40 collapsed scope-limit quick tips, and 40 each of opening, model and practice cues.
- Layout order: 37 standard lessons place the source after the opening; the three calibrated pilots place it before the teach stage.
- Browser check: all 40 routes at desktop width and six module samples at 390 px showed the complete source spine, no horizontal overflow and no page errors.
- Checkpoint state: a checked CE1-02 checkpoint survived reload under `calm10-2026-draft:source-checkpoints:v1`; the lesson indicator remained `0 of 40 drafted`.
- State compatibility: a seeded FL1-04 response from `2026-09-26.2` appeared under **Previous response retained** while the corrected `2026-09-26.3` field started clean.

These are focused Build-mode checks. Full source currency review, keyboard and screen-reader testing, Studio edit/reload/Undo, project E2E, SCORM and Brightspace validation remain rollout work.
