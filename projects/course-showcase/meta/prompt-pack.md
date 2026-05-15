# Course Showcase Prompt Pack

## Objective

Build a professional live course showcase for administration and stakeholder walkthroughs.

## Visual Direction

- Use the Next Step Narrative palette from `C:\Users\dean.guedo\Downloads\DESIGN (4).md`.
- Use `projects/course-showcase/workspace/assets/reference/premium_course_showcase_portfolio.png` as the current visual reference.
- Keep the reference image structure: centered title/filter stack, macOS-style browser frame, left live preview, right selected-course details, and bottom circular selector rail.
- Use course selector circles as the primary navigation.

## Interaction Contract

- Single-click a course circle to load that live course into the main preview.
- Double-click a course circle or the monitor to enter browser fullscreen.
- Keep direct live links available when a hosted course does not render inside an iframe.
- Course circle images live under `projects/course-showcase/workspace/assets/course-icons/` and can be replaced by OpenAI-generated PNGs when `OPENAI_API_KEY` is available.

## Source Of Truth

- Canonical entry: `projects/course-showcase/workspace/index.html`
- Course registry: `projects/course-showcase/workspace/main.js`
- Visual system: `projects/course-showcase/workspace/styles.css`
