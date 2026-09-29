# Muse bounded work packet
Read the master contract first. This packet does not override repository safety or authorize publication. Work only on the specified ticket.

# R05 — Match the Biology visual components rather than approximate them

**Depends on:** R04. **Owner:** Muse implementation; existing lead integration.

## Read for this ticket
- `03_VISUAL_AND_NAVIGATION_SPEC.md`
- `references/VISUAL_REVIEW.html`
- `references/bio/EXTRACTED_REFERENCE_NO_FONTS.css`
- `references/bio/REFERENCE_LESSON_MARKUP.html`

## Production targets
- `styles.css`: tokens, header/sidebar, lesson headings/body, goal strip, source/worked/practice/print components.
- `lesson-components.js` semantic h1/h2/h3 and component markup; `main.js` rendering.
- Authorized local donor font/logo assets and build asset manifest.

## Execute in this order
1. Freeze a same-text comparison fixture using actual authorized Biology styles and this contract. Extract the component rules and local assets with provenance; do not import its course content or runtime.
2. Apply Work Sans/Hanken with actual local font loading; restore h1/h2 hierarchy, body rhythm,760px narrative measure, 1120px content frame, goal two-column strip and guide position. Keep AB30 identity and reading bands.
3. Replace accumulated conflicting overrides with one owned component rule set. Use semantic headings; visual styling must not depend on using h4 for every teaching block.
4. Present source author/type/date/page compactly; expanded metadata and optional transcript are accessible. Keep actual source evidence adjacent to its use. Build worked/supported/independent components with distinct but restrained labels.
5. Verify loaded font faces and computed geometry in browser; save same-environment component and actualLesson 7 comparisons at widths 1440/1024/768/390/320. Review screenshots before accepting candidate baselines.

## Evidence required to pass
- Actual local fonts loaded; no base64/remote font dependency invented. h1/h2/body/reading width match locked tolerances.
- No giant source-metadata wall, all-bold goal paragraphs, or tiny body-sized teaching headings.
- Developer screenshots are explicitly current candidate evidence, not a teacher-approved golden.

## Return
Write the completion record from `templates/TICKET_COMPLETION.json` into the evidence directory. Record actual changed file paths/hashes, commands, test results, screenshots and unresolved issues. Include the next ticket. Do not substitute a tests-only repair, weaken acceptance assertions, fabricate a review signature, publish or change provider settings. Run the relevant prior regressions after shared changes.
