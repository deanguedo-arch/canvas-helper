# World Religions 30 Option 1 Chapter 1 Assignment Design

## Goal

Replace the empty Chapter 1 assignment placeholder in `worldreligions30-option1` with a real in-site interactive assignment based on the provided `chapter1interactive` source, while keeping all work scoped to the World Religions Option 1 project.

## Scope

- Convert the provided Chapter 1 assignment source into a local runtime under `projects/worldreligions30-option1/workspace/assignments/`
- Wire Chapter 1 assignment metadata so `Assignment 1` is no longer a placeholder lane
- Render the assignment as part of the course site instead of sending the learner to an unrelated surface
- Add targeted regression coverage for Assignment 1 wiring and launch behavior
- Keep all changes inside `projects/worldreligions30-option1/**` plus project-local tests and plan docs

## Out of Scope

- Changes to `sportswellness`
- Full React build-pipeline adoption for `worldreligions30-option1`
- Reauthoring Chapter 2-10 assignments in this pass
- Converting the other World Religions option variant
- Large shell redesigns outside the Chapter 1 assignment integration

## Recommended Approach

Use a project-local assignment runtime page rather than trying to mount the raw React source directly into the current plain HTML/JS shell.

1. Treat the provided `chapter1interactive` file as the source concept and content contract
2. Rebuild it as a self-contained HTML/CSS/JS assignment runtime inside `projects/worldreligions30-option1/workspace/assignments/`
3. Update Assignment 1 metadata in `projects/worldreligions30-option1/workspace/main.js`
4. Replace the current Assignment 1 placeholder detail with a real assignment detail that can launch the interactive inside the course site
5. Persist assignment progress with a `worldreligions30-option1`-scoped storage key

This keeps the assignment in the course site, avoids introducing a React runtime into a non-React project, and preserves clean project boundaries.

## Runtime Design

### Assignment source model

The provided `chapter1interactive` file is a React component with:

- a six-step flow
- local form state
- a final folio summary view
- a strong visual direction already aligned with the archival shell

The new runtime should preserve those same instructional sections:

1. Artifact Identification
2. The Depiction
3. Critical Evaluation
4. Cultural Impact
5. Bibliography
6. The Final Folio

### Delivery inside the course site

Assignment 1 should remain inside the `worldreligions30-option1` course shell.

Recommended delivery pattern:

- Assignment 1 detail card becomes a real authored page instead of placeholder copy
- the detail view includes:
  - assignment title
  - a short archival summary
  - a launch action such as `Open interactive assignment`
  - an embedded assignment frame or in-site assignment panel
- the assignment itself runs from a local project file under `workspace/assignments/`

The course shell should still own navigation, while the assignment runtime owns its own step flow and student input.

### File structure

Recommended local files:

- `projects/worldreligions30-option1/workspace/assignments/chapter1interactive.html`
- `projects/worldreligions30-option1/workspace/assignments/chapter1interactive.css`
- `projects/worldreligions30-option1/workspace/assignments/chapter1interactive.js`

This keeps the assignment isolated, editable, and easy to re-open without contaminating the main course runtime.

### Data and persistence

The assignment runtime should use a project-scoped localStorage key, for example:

- `worldreligions30-option1.assignment.chapter1interactive`

Persist:

- current step
- text inputs
- selected analytical stance

This should be separate from the quiz progress object already used by `main.js`.

## Course-Shell Integration Design

### Assignment metadata

`getAssignments()` in `projects/worldreligions30-option1/workspace/main.js` should stop returning identical placeholder summaries for every chapter.

For Chapter 1 specifically, define:

- authored title/summary
- assignment launch path
- maybe a status flag like `interactive: true`

Other assignments can remain placeholders for now.

### Assignment detail view

`renderAssignmentDetail()` should branch:

- Chapter 1 renders the real assignment experience
- everything else can continue using placeholder copy until those assignments are authored

The Assignment 1 detail should include:

- contextual copy tied to religion in popular culture
- `Open chapter PDF`
- `Open quiz`
- `Open interactive assignment`
- `Back to assignments`

If an embedded frame is used, it should sit below the actions with a clear frame shell and enough height to avoid cramped scrolling.

## Styling Design

The assignment runtime should visually harmonize with Option 1:

- `Noto Serif` + `Manrope`
- warm paper background
- gold archival accents
- same general card language and spacing rhythm

The goal is not to force the main shell inside the assignment runtime, but to make the assignment feel like it belongs to the same course.

No broad shell redesign is needed.

## Verification

- Add a failing project-local assignment regression test before implementation
- Run targeted World Religions tests after implementation
- Run `node --check` on touched JS files
- Run `npm.cmd run build:studio`
- Run `npm.cmd run test:e2e:project -- --project worldreligions30-option1`

## Risks

- The source file is React-only, so rebuilding it as plain HTML/JS must preserve behavior carefully rather than copying syntax directly
- If the assignment is over-embedded in the existing shell, it could feel cramped; if it is too separate, it will feel disconnected
- Assignment persistence must use its own key so it does not collide with quiz progress
