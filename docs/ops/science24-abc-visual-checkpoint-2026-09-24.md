# Science 24 A–C visual checkpoint · 2026-09-24

**Status:** Build candidate, blocked and previewable. This is a teacher review sheet, not export or LMS sign-off. Exact canonical file and asset hashes are in [visual-candidate JSON](science24-abc-visual-candidate-2026-09-24.json).

| Unit | Decision and local preview | Source record | Representative desktop / phone |
|---|---|---|---|
| A | [Lesson 1](http://127.0.0.1:4191/science24-unit-a/workspace/#lesson-01) now pairs the existing material photo with the polymer explanation; [Lesson 4](http://127.0.0.1:4191/science24-unit-a/workspace/#lesson-04) adds a five-clue textbook figure beside the alternative-explanation table. | [A visual source review](../../projects/science24-unit-a/meta/visual-source-review.md) | [L1 desktop](../../projects/science24-unit-a/meta/review-screenshots-visual/lesson-01-1440.png) / [phone](../../projects/science24-unit-a/meta/review-screenshots-visual/lesson-01-390.png); [L4 desktop](../../projects/science24-unit-a/meta/review-screenshots-visual/lesson-04-1440.png) / [phone](../../projects/science24-unit-a/meta/review-screenshots-visual/lesson-04-390.png) |
| B | [Lesson 14](http://127.0.0.1:4191/science24-unit-b/workspace/#lesson-14) now shows coal formation rather than the incorrect oil-reservoir visual; [Lesson 15](http://127.0.0.1:4191/science24-unit-b/workspace/#lesson-15) pairs the pump-jack photograph with its explanation. | [B figure provenance](../../projects/science24-unit-b/meta/source-figure-provenance.md) | [L14 desktop](../../projects/science24-unit-b/meta/review-screenshots-visual/lesson-14-1440.png) / [phone](../../projects/science24-unit-b/meta/review-screenshots-visual/lesson-14-390.png); [L15 desktop](../../projects/science24-unit-b/meta/review-screenshots-visual/lesson-15-1440.png) / [phone](../../projects/science24-unit-b/meta/review-screenshots-visual/lesson-15-390.png) |
| C | [Lesson 9](http://127.0.0.1:4191/science24-unit-c/workspace/#lesson-09) now places the textbook capillary/macrophage drawing beside the inflammation explanation. | [C visual source review](../../projects/science24-unit-c/meta/visual-source-review.md) | [Desktop](../../projects/science24-unit-c/meta/review-screenshots-visual/lesson-09-1440.png) / [phone](../../projects/science24-unit-c/meta/review-screenshots-visual/lesson-09-390.png) |

## Why these images

The chosen visuals answer a specific reading task. A's figure supplies observations that students must interpret, B's four panels reveal a geological sequence and correct a wrong image, B's photograph makes the well equipment concrete, and C's drawing locates the early immune response. Wide layouts put selected images beside explanatory prose; phones stack them in reading order. Textbook crops keep their original printed and physical PDF page references, alt text, source caption and enlargement control.

No direct CBE image was accepted for these placements. CBE source images had unresolved reuse rights or labels that could mislead. The p. 104 coal-power diagram and C p. 194 physical-defence diagram were inspected and excluded for crop quality and scientific clarity respectively. Images were not added simply to fill every lesson; some calculation and writing lessons remain text-led.

## Focused Build evidence

- Chromium inspected five changed sections at 1440 and 390 px, plus all five at 320 px. No horizontal page overflow was seen. Phone figure headers were adjusted after the first pass.
- All four new textbook source images decoded; their enlargement controls opened a dialog with the expected image. The C enlargement was repeated after the final PNG crop. No page errors were observed during the checked routes.
- Canonical data compilation succeeded for B and C. `node --check` passed for A, B and C `course-data.js`. Static checks found the new image, enlargement key, catalog entry and metadata source declaration aligned, with 863, 800 and 826 unique edit keys respectively. Activity/check IDs and save namespaces were not changed.
- The source ZIPs, project raw baselines and Unit D were not modified. Full course interaction, saving, Studio, export and Brightspace checks are deferred to the rollout checkpoint.

## Teacher sign-off

- [ ] Accept the image choices and lesson placement in the live local previews.
- [ ] Confirm that learner distribution of these textbook excerpts is permitted for the intended export or Brightspace use.
- [ ] Record any caption or teaching correction in the relevant unit source review before freezing a rollout candidate.

No sign-off has been recorded yet. Keep all three projects `blocked` while teacher review is open.
