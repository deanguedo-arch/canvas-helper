# Math 10C — Chapter 3 Textbook Practice 1 — Codex to Studio contract

- Workflow: generated-course
- Canonical learner page: projects/math10c-unit3-textbook-1/workspace/index.html
- Canonical presentation: projects/math10c-unit3-textbook-1/workspace/styles.css
- Canonical runtime: projects/math10c-unit3-textbook-1/workspace/course.js
- Boundary: Lessons 3.1–3.3; 54 optional, ungraded textbook questions
- Persistence: compact SCORM 2004 course-state adapter; 600 characters per question
- Completion and grading: deliberately absent

## Authoring rules

- Keep question choices, instructions, headings, links, and image elements in canonical HTML.
- JavaScript may attach selection, inline reader, and saving behavior but must not replace the authored question inventory.
- Preserve question indices and image/PDF mappings because saved answers use the package-local question order.
- Keep full textbook pages in the in-course reader; do not open a new tab.
- Raw and exports are protected generated boundaries.

## Rollout checks

- npm run course:doctor -- --project math10c-unit3-textbook-1
- npm run verify -- --project math10c-unit3-textbook-1 --mode workspace
- npm run test:e2e:project -- --project math10c-unit3-textbook-1
- Run the Math 10C textbook browser scenario in e2e/specs/math10c-unit3-pilot.spec.ts.
- Confirm the maximum-state line in projects/math10c-unit3-pilot/meta/mastery-capacity-report.json before packaging.
