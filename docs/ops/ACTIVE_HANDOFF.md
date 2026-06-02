# Handoff

- Project: `ai-course-building-resources`
- Task: Layer district student engagement language into the readiness/gatekeeping Gemini handoff design and prototype.
- Status: `Completed as reference artifact refinement; not integrated or deployed`

## Files changed
- `projects/ai-course-building-resources/meta/gemini-handoff/readiness-architecture-design.md`
- `projects/ai-course-building-resources/meta/gemini-handoff/readiness-architecture-code.html`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`

## What changed
- Added a `District Engagement Lens` section to the design brief.
- Added the district engagement language: Teacher Clarity, Cognitive Load Management, Cognitive Engagement and High-Leverage Feedback, Metacognition and Ownership, and Emotional Engagement.
- Updated the Gemini prompt seed so Gemini treats student engagement as the strategic frame for the next two years.
- Added a `Student Engagement Lens` section to the standalone HTML prototype.
- Added an `Engagement alignment` metric and model-specific engagement explanation to the architecture explorer.
- Updated the closing discussion prompt to connect gate architecture, staff capacity, and student engagement.

## Why this changed
- The user said district leadership is prioritizing student engagement and asked to layer the pasted district language into the presentation concept.

## Source of truth
- Gemini handoff design:
  - `projects/ai-course-building-resources/meta/gemini-handoff/readiness-architecture-design.md`
- Gemini handoff code:
  - `projects/ai-course-building-resources/meta/gemini-handoff/readiness-architecture-code.html`
- District language source:
  - `C:\Users\dean.guedo\.codex\attachments\de88768b-a33f-4362-8269-ebc5e7c289a9\pasted-text.txt`

## Fragile areas / watchouts
- These files are reference artifacts, not canonical workspace presentation pages.
- No deploy/export was run for this task.
- The engagement alignment meter is a conceptual discussion aid, not measured district data.
- The active STAX status still references a prior deploy-proof rejection and was not corrected by this task.

## Next prompt should assume
- The readiness prototype now has district engagement language layered into it.
- The prototype should be treated as a Gemini prompt/input artifact unless the user explicitly asks to integrate it into the live digital presentation.
- If integrated later, source-of-truth rules require editing canonical workspace files, not generated exports.

## What still needs validation
- Optional browser preview of `readiness-architecture-code.html`.
- Optional Gemini pass to generate a more polished engagement-forward version.
- If this becomes district-facing, confirm exact wording against the official district engagement document.

## Known risks
- The district wording came from pasted text and may need final policy-language review.
- The standalone prototype may need CSS/JS normalization before becoming part of the canonical project page.

## Exact next command
`Start-Process "projects\ai-course-building-resources\meta\gemini-handoff\readiness-architecture-code.html"`

## Exact next file to open
`projects/ai-course-building-resources/meta/gemini-handoff/readiness-architecture-design.md`

## Do not do next / warnings
- Do not edit `projects/ai-course-building-resources/raw/**`.
- Do not patch `projects/ai-course-building-resources/exports/**` as source.
- Do not assume the previous STAX deploy proof rejection is fixed.
