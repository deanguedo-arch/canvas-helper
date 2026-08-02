# How Assessment Works Prompt Pack

- Mode: `CANVAS`
- Workflow: `generated-course`
- Project: `how-assessment-works`
- Canonical entry: `projects/how-assessment-works/workspace/index.html`
- Canonical sources: `workspace/index.html`, `workspace/styles.css`, `workspace/main.js`
- Target learner time: 15–20 minutes for the core experience; approximately 20–25 minutes when both optional videos are watched
- Delivery: one subject-neutral, ungraded SCORM 2004 learner item for Grades 10–12

## Boundary

Build one continuous student-facing section titled **How Assessment Works**. It is not a Brightspace-style course shell: do not add a sidebar, module list, separate lessons, staff resources, or decks.

The existing administration resources are reference-only:

- `projects/ai-course-building-resources/workspace/resources/dean-ai-assessment-pillars.html`
- `projects/ai-course-building-resources/workspace/resources/gatekeeping-architecture.html`

Use their visual identity and assessment concepts as inspiration, but do not edit them or copy their staff/board framing into the learner artifact. Do not add a separate automated-assistance resource or learner copy about automated assistance.

Two original videos are approved as optional local media because they directly support the learner experience:

- `workspace/assets/media/inspire-the-work.mp4`
- `workspace/assets/media/the-process-check-in.mp4`

They are copied from the reference project, never streamed, and do not gate progress or completion. Their source branding is an explicit exception to the no-automated-assistance-reference rule; all essential instructional information must also appear as accessible page text.

## Learner content contract

The page contains four sequential interactive beats:

1. **Your assessment journey:** Learn → Practise → Check readiness → Create → Submit → Explain → Revise if needed.
2. **Product, Process, Defence:** learner-centred explanations, an optional process-evidence video, and an example calculator. Students can change sample marks and assessment weights. Product, Process, and Defence always total 100%; Process is constrained to 0–25%. Each real assessment still provides its actual weights.
3. **Evidence and readiness:** students classify clear examples as Product, Process, or Defence, watch an optional process-check-in video, then complete a supportive readiness-checkpoint scenario.
4. **After you submit: Defence:** explain that Defence follows submission of Product and Process evidence, show oral, written, and recorded formats, then complete the final readiness checklist.

Use **readiness checkpoint**, **ready**, and **not ready yet** in learner copy. Do not use staff-facing gatekeeping, validation, or failure labels. Incorrect responses receive constructive guidance and remain retryable.

## Experience contract

- Retain light/dark themes and focus/presentation mode.
- Show visible progress through the single-page experience without creating route or module navigation.
- Support keyboard-only use, visible focus, semantic controls, screen-reader status updates, and reduced-motion preferences.
- Design desktop and 390 px mobile layouts together.
- Package all styles, scripts, icons, and approved videos locally. Do not add network dependencies, font CDNs, external images, streaming embeds, or additional media.

## State and completion contract

Persist one compact JSON record under `canvas-helper:how-assessment-works:state:v1`. It includes calculator marks and weights, activity answers, readiness-scenario state, checklist state, theme, last step, and completion timestamp.

Completion requires all three substantive gates:

- evidence classification completed successfully;
- readiness scenario completed successfully;
- every final checklist item confirmed.

The calculator and presentation preferences do not gate completion. On first completion, call `window.__canvasHelperScorm.markCompleted()` when available; also handle the `canvas-helper:scorm-ready` event so completion reconciles if the bridge initializes later. Report completion only—never a score or success status. Completion must not disable review, revision, or later Brightspace content.

Provide a visible **Save and Exit** control that calls `window.__canvasHelperScorm.saveAndExit()` when available and safely saves local state otherwise. Autosave every meaningful state change and restore the complete experience after reload or SCORM suspend-data hydration.

## Stable E2E hooks

Keep these hooks stable in the learner workspace:

- `[data-testid="assessment-root"]`
- `[data-testid="assessment-progress"]`
- `[data-testid="score-calculator"]`
- `[data-testid="evidence-activity"]`
- `[data-testid="readiness-scenario"]`
- `[data-testid="completion-checklist"]`
- `[data-testid="completion-status"]`

Dedicated project coverage must exercise incorrect-answer retry, successful completion, reload restoration, keyboard/focus behavior, a 390 px viewport, and an empty browser-console error log.

## Acceptance checks

- The learner sees one section and no course-shell navigation.
- Product, Process, and Defence are explained in subject-neutral language.
- The default weights are 50/25/25, all three weights can be edited, Process cannot exceed 25%, and the total remains exactly 100%.
- Both approved videos load from the packaged workspace, remain optional, and are accompanied by the essential instructional message in text.
- No external URL is required at runtime.
- SCORM completion occurs only after the three completion gates and never writes score or success status.
- The administration Firebase presentation and its canonical resources remain unchanged.
