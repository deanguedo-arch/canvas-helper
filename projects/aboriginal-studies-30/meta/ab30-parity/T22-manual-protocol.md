# T22 manual responsive/accessibility protocol (HUMAN ONLY — executor must not fill results)

Status: PROTOCOL ISSUED. No manual check below has been performed. Automated halves are green
in `aboriginal-studies-30-a11y.test.ts` + the content/route suites; they are NOT a conformance
certificate and this file must not be cited as one.

Serve the workspace over HTTP (file:// misrepresents storage + navigation), e.g.
`npx http-server projects/aboriginal-studies-30/workspace -p 8080`, then open the local URL.

## Widths (each surface: shell, one v1 lesson, Lesson 7 v2, source pair, comparison chart, practice run, conflict panel, All My Work)

- [ ] 1440px desktop — result: `________________`
- [ ] 768px tablet — result: `________________`
- [ ] 390px narrow — result: `________________`
- [ ] 320px narrow — result: `________________`
- [ ] 200% zoom + 400% reflow (no two-dimensional scroll for reading) — result: `________________`

Check at each width: no clipped controls, comparison tables scroll inside their figure (never trap
the page), sidebar collapses/overlays sanely, consent buttons + mywork chips wrap, print preview
shows the full collection.

## Keyboard (no mouse)

- [ ] Tab order follows reading order on every surface above — result: `________________`
- [ ] Focus always visible (:focus-visible) — result: `________________`
- [ ] Dialog (chapter/vocab/document): focus enters on open, Escape closes, focus returns to the trigger — result: `________________`
- [ ] Practice radios + order controls fully operable; consent Load-video buttons operable — result: `________________`
- [ ] Skip path to main content exists and works — result: `________________` (note: executor did not add one; file as defect if missing)

## Screen reader (NVDA/VoiceOver/JAWS — name the tool + browser)

- Tool/browser used: `________________`
- [ ] Route changes announce (Course overview / Theme / Lesson / Assignment / All my work) — result: `________________`
- [ ] Save status + conflict counts announce politely without chatter — result: `________________`
- [ ] Practice save failures announce assertively once — result: `________________`
- [ ] Tables announce headers (comparison scope=col; Q37 rows/columns) — result: `________________`
- [ ] Glyph icons stay silent (aria-hidden) with no loss of meaning — result: `________________`

## Motion

- [ ] prefers-reduced-motion: transitions/animations off, nothing essential depends on motion — result: `________________`

## Defects found (bounded fixes return to the worker with surface + width + tool)

1. `________________`
2. `________________`
