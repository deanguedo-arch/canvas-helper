# Science 24 Unit B rebuild candidate

- Workflow: Brightspace conversion; Unit B only.
- Canonical learner entry: `workspace/index.html`.
- Canonical data: `workspace/course-data.json`; compile with `node scripts/compile-science24-bcd-data.cjs --project science24-unit-b`.
- Canonical behavior and presentation: `workspace/main.js`, `state-store.js`, `styles.css`, `unit-b.css`, `asset-loader.js`, `assets/textbook-practice.css`.
- Original source: immutable Brightspace ZIP recorded in `source-review.json`; 2023 student workbook and its exact learner-visible key remain available as PDFs.
- Supplemental source: the CBE System Science 24 (Winter 2020) ZIP is registered as reference only. Use `cbe-supplement-review.md` for the accepted Lesson 5 figure and excluded dated or incorrect material; do not substitute it for the class source or original assessment.
- Rejected eight-lesson candidate: `rejected-candidate-v1.zip`; frozen catalog `legacy-catalog-v1.json`. Its IndexedDB namespace is read only in the new All My Work view.
- Reference: current refined Science 24 Unit A for lesson and interaction structure; Biology 30 Pilot 3 for presentation conventions.
- New sequence: 16 teaching lessons plus an integrated review. Chapter 5 has 3 lessons, Chapter 6 has 5, Chapter 7 has 5, Chapter 8 has 3.
- Saved-work namespace: `science24-unit-b-excellence-v2`. Keep all activity IDs stable once teacher review begins. Never reuse an earlier ID for a changed question.
- Static lesson copy, links, and diagrams are in HTML with edit keys. Runtime practice, textbook selectors, Frayer controls, and saved-work records are annotation-only until a supported adapter exists.
- Source task and visual figure mapping: `source-task-map-v2.json`. Instructional corrections: `source-review.json`.
- Authoring status remains `blocked` and previewable. Teacher approval of Unit B precedes any C/D propagation. Deployment, export, Studio activation, and LMS certification are separate.
- The [visual teaching and placement plan](../../../docs/ops/science24-visual-pedagogy-plan-2026-09-25.md) is the current B figure audit and layout gate. Review the A–D coal panels, source diagrams and phone label sizes against their learning tasks before visual sign-off.
