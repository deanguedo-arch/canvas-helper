# Science 24 Unit C replacement candidate

- Project: `science24-unit-c`
- Workflow: Brightspace conversion; Pilot 3 presentation reference
- Status: blocked, previewable; Studio Edit and export disabled
- Canonical learner source: `workspace/index.html`, `course-data.json` (compile `course-data.js`), `main.js`, `state-store.js`, `styles.css`, `assets/**`
- Immutable source: `projects/resources/science24-unit-a/_sources/3d6a4d094ca3ebee56a750117dcbdc33a4e889ea1396bf2306bd544225b2de02.zip` (shared with Unit A to avoid three redundant archive copies)
- Supplemental source: the registered CBE System Science 24 (Winter 2020) ZIP. Its Unit C page and image dispositions are in `cbe-content-audit-v2.md`; class Brightspace content remains primary.
- Replacement evidence: `source-task-map-v2.json` maps 17 teaching lessons, 108 workbook question/subpart entries, printed textbook pages and physical PDF positions; `replacement-lesson-design-v2.md` defines the instructional design and review floor. The canonical workspace now serves the v3 refined learner candidate within the v2 saved-work namespace. Current evidence is `unit-c-v3-refinement-evidence.md`; `unit-c-v2-build-evidence.md` is an earlier checkpoint.
- Preserved first draft: `rejected-candidate-v1.zip` and `legacy-catalog-v1.json`. Earlier browser responses remain visible as read-only previous-draft work.

## Editing rules

Edit the canonical workspace. Preserve the original `science24-unit-c-review-v1` save namespace and `s24-c-*` question meanings as **previous-draft work** using the frozen original catalog. The replacement gets a new content version and new activity IDs; never reuse an ID with changed question/answer meaning or count old completions toward new checks. Static lesson copy is HTML with edit keys. The textbook page picker, vocabulary Frayer, saved-work list and checks are runtime rendered and marked Annotation only where appropriate. Brightspace quiz and hidden test remain outside learner pages. Online checks are authored formative work. Source mapping and limitations are in `source-task-map-v2.json` and `source-review.json`.

## Next review

The user authorized moving to C after establishing the B standard. Build the replacement from the source map, including the original workbook's diagram and calculation work, and keep the current preview available during construction. Guided notes are OCR-mapped by chapter in `guided-notes-ocr.json`; inspect the original PDF for exact diagrams and wording before making any native conversion claim. Inspect textbook practice, Frayer saving and mobile layout against Unit A and Biology 30 Pilot 3. Run rollout readiness and teacher review on an exact frozen candidate before activation.

Use the [visual teaching and placement plan](../../../docs/ops/science24-visual-pedagogy-plan-2026-09-25.md) for C's figure-by-figure layout and engagement review. The current diagram inventory is a triage record, not proof that source labels or responsive reading are finished.
