# Biology 30 Units B-D — Human 95+ Review Guide

## Review boundary

These three candidates are blocked, preview-only builds. This review does not promote, export, upload, publish, or enable Studio editing.

| Unit | Project | Exact build SHA-256 |
| --- | --- | --- |
| B | `biology30-unit-b` | `c810dd85af4ba82dc7f08ddf28ace20a7abe2cc5b731234f245b266e2111d23c` |
| C | `biology30-unit-c` | `0814f93c4d74bb6411045d649625ba2bd6c664cf6e98d8147a215c7014f9354a` |
| D | `biology30-unit-d` | `dcb35045a3a82d8be75b81f24c2649a38f3cbd21efbbcb53c9efafc530847392` |

Any substantive rebuild changes the build hash and invalidates the review.

## What has already been verified

- Every official outcome has explicit teaching, practice, and evidence routes.
- Every learner route was visually inspected at 1440x900, 1024x768, and 390x844: 67 routes and 201 route-viewports in total.
- All 49 scientific models were inspected for fit, sequence, arrows, and legibility. Their explicit lesson-level grammar uses nine forms across the family—pathway, feedback, timeline, cycle, layers, comparison, calculation, evidence, and network—with at least seven forms in every unit.
- All 49 Model Lab activities were rebuilt from the repeated generic dropdown into lesson-owned case boards using the same nine-form scientific grammar. Their 147 interaction-viewports were checked for text fit, overlap, touch targets, keyboard operation, explanatory feedback, and scoped reset behavior.
- All 318 practice prompts are unique. Module and final practice cross lesson boundaries; cognitive labels match the actual task; higher-mental-activity items integrate two evidence streams; and targeted feedback names the exact evidence or reasoning error.
- Unit C now gives each of its 24 lessons a specific materials list and a lesson-appropriate safety, privacy, rights, or non-diagnostic boundary rather than repeating one generic notice.
- All 40 exact-build route, figure, and interaction contact sheets were opened and inspected; no unresolved visual finding remains.
- Every route passed the automated axe scan in Chromium; representative routes passed in Firefox and WebKit.
- Route inventory, mobile reflow, direct Model Lab and Practice Hub landing, offline operation, and compact LMS-state restoration passed in Chromium, Firefox, and WebKit: 9 of 9 tests.
- No required remote asset, unresolved local asset, unresolved rights status, teacher-only assessment exposure, or detected binary blocker remains.

Automated checks establish readiness for review. They do not assign a human score or authorize promotion.

## Efficient review route

Use Studio Preview, not Edit. Spend approximately 15-20 minutes per unit.

### Unit B

1. Overview — judge course promise, sequence, and learner directions.
2. Lesson 6, *Menstrual and Ovarian Cycle Data Lab* — judge data reasoning and feedback.
3. Lesson 9, *Extra-embryonic Membranes and the Placenta* — judge scientific explanation and visual clarity.
4. Lesson 14, *Integrated Reproduction and Development Case* — judge transfer and integration.
5. Model Lab and Practice Hub — open one card from each and confirm it lands at the activity.

### Unit C

1. Overview — judge scope and the 24-lesson progression.
2. Lesson 3, *Cell-Cycle Investigation and Cancer* — judge evidence limits and health-language accuracy.
3. Lesson 12, *Dihybrid Crosses and Independent Assortment* — judge quantitative scaffolding.
4. Lesson 18, *Transcription* — judge molecular explanation.
5. Lesson 22, *DNA Evidence, Relationships, and Biotechnology* — judge STS/rights reasoning.
6. Lesson 24, *Integrated Genetics and Molecular Biology Case* — judge transfer and integration.
7. Model Lab and Practice Hub — open one card from each and confirm it lands at the activity.

### Unit D

1. Overview — judge scope and progression.
2. Lesson 3, *Hardy-Weinberg Calculations* — judge worked reasoning and feedback.
3. Lesson 6, *Predation, Competition, and Defence* — judge ecological evidence and safety.
4. Lesson 9, *Growth Rates, Carrying Capacity, and Curves* — judge graph and model reasoning.
5. Lesson 11, *Integrated Population and Community Case* — judge transfer and management decisions.
6. Model Lab and Practice Hub — open one card from each and confirm it lands at the activity.

At mobile width, spot-check one long lesson title, one scientific model, and one Practice Hub card in each unit.

## Scoring contract

Score each unit separately.

| Category | Available | Minimum |
| --- | ---: | ---: |
| Academic alignment and accuracy | 25 | 20 |
| Instructional coherence | 20 | 16 |
| Visual and editorial quality | 15 | 12 |
| Practice and investigations | 15 | 12 |
| Accessibility | 10 | 8 |
| Local-first runtime and persistence | 10 | 8 |
| Maintainability and Studio readiness | 5 | 4 |
| **Total** | **100** | **95 for this release target** |

A unit is not accepted if it scores below 95, falls below any category minimum, or has a binary blocker.

## AI-assisted score recommendation

The exact-build evidence supports the following conservative recommendation. This is not a human score, acceptance, promotion, or export authorization; the teacher must confirm or revise it after the representative review above.

| Category | Unit B | Unit C | Unit D |
| --- | ---: | ---: | ---: |
| Academic alignment and accuracy | 24/25 | 24/25 | 24/25 |
| Instructional coherence | 19/20 | 19/20 | 19/20 |
| Visual and editorial quality | 14/15 | 14/15 | 14/15 |
| Practice and investigations | 15/15 | 15/15 | 15/15 |
| Accessibility | 9/10 | 9/10 | 9/10 |
| Local-first runtime and persistence | 10/10 | 10/10 | 10/10 |
| Maintainability and Studio readiness | 4/5 | 4/5 | 4/5 |
| **Recommended total** | **95/100** | **95/100** | **95/100** |

Points remain deliberately reserved for final teacher content judgment, hands-on assistive-technology review, and the post-acceptance Direct Studio editing lifecycle. The detailed rationale is recorded in each project's `meta/agent-score-recommendation.json`; every human-acceptance field remains blank.

The exact-build evidence packets are:

- `projects/biology30-unit-b/meta/quality-readiness-evidence.json`
- `projects/biology30-unit-c/meta/quality-readiness-evidence.json`
- `projects/biology30-unit-d/meta/quality-readiness-evidence.json`

## Decision language

An acceptance must name the unit, exact build hash, seven category scores, total score, confirmation that no binary blocker was found, and an explicit accept or revise decision.

Example format:

```text
Unit B — build c810dd85af4ba82dc7f08ddf28ace20a7abe2cc5b731234f245b266e2111d23c
Academic __/25; Coherence __/20; Visual __/15; Practice __/15;
Accessibility __/10; Runtime __/10; Maintainability __/5; Total __/100.
No binary blocker found: yes/no. Decision: accept/revise.
```

The existing human-acceptance templates remain blank until the reviewer supplies this decision. Acceptance alone does not authorize SCORM export or Brightspace upload.

After the reviewer supplies the exact confirmation, Codex records each unit through `record:biology30-course-acceptance`. That command rechecks the exact workspace and evidence, rejects a score below 95 or any blocker, and writes the human record transactionally. It deliberately leaves the project blocked and does not authorize promotion, Studio editing, export, upload, publication, or commit.

If the representative review agrees with the recommendation, the teacher can use this exact confirmation:

```text
I reviewed the representative routes and confirm these exact blocked candidates:

Unit B — build c810dd85af4ba82dc7f08ddf28ace20a7abe2cc5b731234f245b266e2111d23c
Unit C — build 0814f93c4d74bb6411045d649625ba2bd6c664cf6e98d8147a215c7014f9354a
Unit D — build dcb35045a3a82d8be75b81f24c2649a38f3cbd21efbbcb53c9efafc530847392

For each unit: Academic 24/25; Coherence 19/20; Visual 14/15;
Practice 15/15; Accessibility 9/10; Runtime 10/10;
Maintainability 4/5; Total 95/100.

No binary blocker found: yes. Decision: accept the scores and exact candidates.
Do not promote, export, upload, or publish yet.
```
