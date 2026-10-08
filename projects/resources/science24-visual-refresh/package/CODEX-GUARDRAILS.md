# Science 24 Visual Refresh — Codex Guardrails
**Read this entire file before touching any course file. These rules override any other instruction.**

## 0. Prime directive
You are working on a **COPY** of the course, never the original. The live course files are the ground truth
for "what working looks like." If your change breaks something that currently works, the change is wrong —
revert it, do not "fix" the original behavior.

## 1. INVARIANTS — never change these
1. **IDs.** Every `id="lesson-NN"`, every `data-canvas-helper-edit-key`, every `data-*` hook
   (`data-video-card`, `data-required`, `data-exercise`, `data-note-*`, `data-term-id`, `data-check-status`,
   `data-open-reading`), and every save namespace / localStorage key stays byte-identical.
2. **Assessment boundary.** Required checks, practice items, worked examples, written-response save flows,
   and the progress bar logic are untouched. New visuals are formative only. Nothing you add may affect
   progress, completion, or "Check not completed" states.
3. **Copy.** Do not rewrite lesson text, questions, hints, or explanations. You may not "improve" wording.
4. **Format & styling system.** The existing design system (sidebar, content column, guide cards, buttons,
   `.science-figure`, video cards) is not open for redesign. You ADD the four `s24x-*` patterns from the
   exemplar; you do not restyle existing components.
5. **JS.** Do not modify `main.js`, `state-store.js`, or `asset-loader.js`. The `data-video-card` div is
   hydrated by existing JS — include it verbatim, never hand-write the hydrated card markup.
6. **`raw/` and source archives.** Never modify anything under `raw/` or any original textbook/workbook PDF.
   Crops are new files in `workspace/assets/`; the sources stay pristine.

## 2. What you ARE changing (and only this)
1. **Per-lesson visual additions** exactly as listed in `change-plan.md` — one key visual per listed lesson,
   placed per the exemplar patterns.
2. **Video repositioning** exactly as listed in `change-plan.md` — move the named videos to in-flow
   position using Pattern 2. Videos NOT on the move list stay where they are.
3. **The four new patterns** from `exemplar-patterns.html` (full-bleed opener, in-flow video beat,
   margin-anchored figure, sticker callout). Copy the `s24x-*` CSS into the unit stylesheet verbatim;
   do not rename classes. Delete all `.s24x-pattern-note` blocks in production.

## 3. Image rules (from the course's visual pedagogy plan — non-negotiable)
- Every visual must do a teaching job: it shows the lesson's key phenomenon, process, or comparison.
  No decoration, no stock-photo filler, no image quotas.
- **Source selection, in order:** (1) exact crop of a textbook/workbook figure (keep the page reference
  in the credit line); (2) native SVG/HTML diagram for labeled processes (preferred for anything with
  labels — stays crisp, zooms cleanly); (3) generated illustration in the existing two-panel house style
  for clean conceptual comparisons; (4) real photography for real phenomena.
- **Never** use AI-generated imagery to depict a source observation or to disguise a correction to source material.
- **Never** show a complete scanned textbook page as an inline lesson illustration. Crop the relevant figure.
- Every inline figure keeps: `<figcaption>` with a one-to-two sentence takeaway, `<small class="figure-credit">`
  with provenance (source + page, or "Original course illustration generated for Science 24"), descriptive
  `alt` text naming the learning evidence, and the existing "View larger" affordance.
- Essential labels **≥14px at the default phone width (390px)**. Verify, don't assume.
- Reading question immediately BEFORE the image; learner action/interpretation immediately AFTER it.

## 4. Acceptance rubric — self-verify every lesson before handing back
For each lesson you touched, confirm ALL of these:
- [ ] No invariant from §1 changed (diff IDs and data-hooks against the original copy).
- [ ] Every new figure has caption + credit + alt text + View larger.
- [ ] Labels ≥14px at 390px width (test, don't eyeball at desktop).
- [ ] No horizontal scroll at 390px; opener/sticker/figure stack cleanly.
- [ ] 200% browser zoom: no clipped or overlapping text.
- [ ] Keyboard: every new control (View larger, video play, sticker disclosures) reachable by Tab with visible focus.
- [ ] `data-video-card` divs included verbatim; no hand-written video card markup.
- [ ] Max one sticky margin figure per lesson; max one sticker per lesson section; one opener per lesson.
- [ ] No console errors introduced (compare against the original page's console).
- [ ] All `.s24x-pattern-note` annotation blocks removed from production files.

## 5. How to work
1. Copy ONE unit folder to a working copy. Finish it completely before starting the next.
2. Within a unit, do ONE lesson fully (all its changes), then run the §4 rubric on that lesson in a real
   browser before moving to the next lesson. Do not batch all lessons then check at the end.
3. If a pattern doesn't fit a lesson cleanly, SKIP the pattern for that lesson and note it in your
   handoff — do not force it, do not invent a fifth pattern.
4. Your handoff per unit must include: the list of files changed, the §4 rubric results per lesson,
   screenshots (desktop + 390px) of every changed lesson, and anything you skipped with reasons.

## 6. If you are unsure
Prefer the smaller change. Prefer the existing component. Ask in your handoff — do not guess on
anything touching §1.
