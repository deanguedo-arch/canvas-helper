# Codex-to-Studio Course Workflow

Use this workflow for a net-new learner course authored from scratch in Codex. The outcome is a canonical course that opens in Studio immediately and keeps routine teacher changes directly editable.

Do not use it to ingest an existing Brightspace course or to create an English/Social factory unit. Those workflows have separate source ownership and rebuild contracts.

## 1. Create the project contract first

```bash
npm run course:create -- \
  --slug <slug> \
  --title "<course title>" \
  --course-code "<course code>" \
  --summary "<one-sentence learner-facing summary>"
```

The command refuses unsafe slugs and existing projects. It stages the complete project, validates its manifest and authoring doctor, then atomically promotes:

- `projects/<slug>/workspace/index.html` — canonical learner page
- `projects/<slug>/workspace/styles.css` — canonical presentation source
- `projects/<slug>/workspace/course.js` — canonical progressive-enhancement runtime with its generated practice control explicitly marked Annotation only
- `projects/<slug>/raw/**` — immutable starting baseline/reference
- `projects/<slug>/meta/project.json` — `codex-studio-direct-v1` ownership contract
- `projects/<slug>/meta/prompt-pack.md` — course-specific continuation rules

If Studio is running, the promoted course appears automatically in its picker.

## 2. Author for both learners and teachers

Develop the actual course only in its canonical workspace and declared assets. Preserve these conditions:

- Visible text, ordinary links, and normal image elements that teachers should change stay in HTML.
- JavaScript attaches interactions instead of replacing routine content after load.
- Every visible course-name surface that Rename should synchronize has `data-canvas-helper-course-title`.
- Repeated or reorderable content has semantic, durable `data-canvas-helper-edit-key` values.
- New assets live under `workspace/assets/**` or enter through Studio's validated image workflow.
- Raw baselines, runtime bundles, and exports never become editable source.
- Standard headings, prose, lists, links, images, captions, and synchronized course-name surfaces must satisfy the fresh-course coverage contract; intentionally runtime-owned controls are marked `data-canvas-helper-studio-edit="annotation-only"` rather than hidden from measurement.

Interactive course code is allowed. The boundary is visible: source-owned supported elements show an Edit action, while runtime-created or replaced elements show **Annotation only** and can move directly into a Codex Review Set.

## 3. Verify source ownership

```bash
npm run course:doctor -- --project <slug>
npm run verify -- --project <slug> --mode workspace
npm run report:course-editability -- --project <slug>
```

The doctor must report `direct-ready`, declared `direct-workspace-v1` ownership, and Studio editing enabled. The coverage report must have a complete learner inventory and retain the new-course block/text/category/capability floors exercised by `npm run test:codex-course`. Fix the canonical contract rather than forcing eligibility.

## 4. Prove the real Studio lifecycle

1. Open the course in Studio.
2. Select **Edit** and inspect the visual map for the actual current page.
3. Confirm course-name surfaces show **Rename course** and routine content shows its supported action.
4. Change one supported value and confirm the inert preview overlay updates before Save while the learner element and course files remain unchanged.
5. Save the canonical draft, reopen it on its real page, and apply it.
6. Reload the course and confirm the rendered learner result survived.
7. Use **Undo last batch** and confirm the exact original result returns.

Do not use Undo after Codex, a builder, or another tool changes the course; Studio will disable it when the boundary drifts.

## 5. Add interaction acceptance when needed

When the course gains navigation, assessments, stored responses, conditional content, or other learner behavior, create `projects/<slug>/meta/e2e-contract.json` and run:

```bash
npm run test:e2e:project -- --project <slug>
```

Package and cross-browser persistence acceptance remain separate export-stage gates.

## Changing ownership later

If the course eventually becomes generated output from a builder, stop treating workspace HTML as Direct source. Declare the factory/adapter, move durable edits into owning recipes or course-only overrides, define the transactional rebuild write set, and pass a reversible real-course pilot before re-enabling Studio Edit. Preview and Annotate can remain available while that onboarding is incomplete.
