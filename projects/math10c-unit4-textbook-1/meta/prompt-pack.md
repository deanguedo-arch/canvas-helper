# math10c-unit4-textbook-1 - Codex to Studio contract

- Workflow: generated-course
- Canonical learner page: projects/math10c-unit4-textbook-1/workspace/index.html
- Canonical presentation: projects/math10c-unit4-textbook-1/workspace/styles.css
- Canonical runtime: projects/math10c-unit4-textbook-1/workspace/course.js
- Boundary: Textbook sections 4.1-4.2; 28 optional, ungraded textbook questions
- Persistence: compact SCORM 2004 course-state adapter; 600 characters per question
- Completion and grading: deliberately absent
- Release status: private review only, pending source-use and accessibility approval

## Authoring rules

- Keep question choices, instructions, headings, links, and images in canonical HTML.
- Preserve package-local question order because saved answers use question indices.
- Keep complete source pages in the in-course reader; do not open a new tab.
- Preserve symbol-entry help, print/Save-as-PDF evidence, and automatic saving.
- Do not add solutions, answer keys, formal assessments, mastery scoring, or submission integration.

## Rollout checks

- npm run course:doctor -- --project math10c-unit4-textbook-1
- npm run verify -- --project math10c-unit4-textbook-1 --mode workspace
- npm run test:e2e:project -- --project math10c-unit4-textbook-1
- Export only as review-only SCORM until source-use and accessibility gates close.
