# Authoring Deviation Report

- Project: hss1010
- Generated: 2026-03-13T20:43:58.792Z
- Pass: yes
- Deviations: 3
- Accepted deviations: 0

## Deviations

### quality-max-consecutive-paragraph-blocks
- Severity: warn
- Surface: course-html
- Location: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\workspace\index.html
- Why: Detected 848 paragraph blocks but max allowed is 5.
- Evidence: <p> count = 848

### require-interactive-shell
- Severity: warn
- Surface: workspace-runtime
- Location: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\workspace/main.js
- Why: Required pattern "lesson-shell" is missing.
- Evidence: Missing pattern: lesson-shell

### forbid-visible-source-dump
- Severity: warn
- Surface: workspace-runtime
- Location: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\workspace/main.js
- Why: Forbidden pattern "source-support-panel" is present.
- Evidence: rt(panelId) { const panel = document.querySelector(`[data-source-support-panel="${panelId}"]`); const trigger = document.querySelector(`

