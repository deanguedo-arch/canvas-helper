# Science 24 visual teaching and placement plan

**Status:** Design audit for the blocked A–C review candidates and the future Unit D rebuild. The first three calibration layouts (A01, B14, C09) are now implemented in the learner workspaces; see the [implementation checkpoint](science24-visual-calibration-2026-09-25.md). The remaining figure dispositions below are planned, not signed off. The [rendered inventory](science24-visual-placement-inventory-2026-09-25.json) records the pre-implementation scan and its original hashes. Re-run it with `node scripts/audit-science24-lesson-visuals.cjs --output docs/ops/science24-visual-placement-inventory-YYYY-MM-DD.json` while the local previews are running.

## The rule: an image must do a teaching job

For each candidate visual, record the **idea or source task**, what the learner should **notice**, what they must **do with that observation**, and why this image is a clearer route than prose or a native diagram. A context photo may start a question; a source figure may supply evidence; a process diagram may show sequence; a comparison may make two cases distinguishable. If none applies, omit the image. Do not add one to satisfy a per-lesson image quota.

| Decision | Course rule |
| --- | --- |
| Placement | Introduce the question or reading focus immediately before the visual. Put the interpretation or short learner action immediately after it. Keep a figure in the section where its evidence is used. |
| Size | Choose width by **information density**. A photo can be a modest inset; a labeled process, graph, table, pedigree or multi-panel source needs the reading width. Do not put an essential four-panel figure into half a column. |
| Legibility | House target: essential labels read at about **14 CSS px or more** in the default phone view. If the source cannot meet that target, crop meaningful panels, reflow as native HTML/SVG, or add a readable companion. “View larger” is useful support, not the only way to understand required evidence. |
| Layout | Use text wrapping only for short contextual photos with prose that directly discusses the photo. Place evidence diagrams and worked models below their setup at reading width. Flag aligned empty space over about 120 px; do not fill it with unrelated prose. |
| Source pages | Do not present a complete scanned textbook page as an inline lesson illustration. Crop the actual figure with its original context preserved through the reader link; keep the full page in Textbook Practice. |
| Caption | State the single takeaway or source limitation in one or two readable sentences. Put page credit/provenance in a separate small line. Do not repeat a paragraph of teaching text inside the caption. |
| Engagement | Use a precise action: trace A→D, compare two outcomes, identify evidence, predict the next stage, or explain a label. Do not use decorative reveal buttons or quizzes when a focused reading prompt suffices. |
| Responsive/access | Review at desktop, about 800 px and phone; include 200% zoom, keyboard focus and enlargement. Alt text identifies the learning evidence; a native text explanation remains available when labels are embedded in an image. |
| Provenance | Distinguish source evidence from illustration. Check scientific accuracy, source page, reuse rights and dated labels before learner release. Do not use AI art to depict a source observation or disguise a correction. |

Each visual gets a five-part review: **purpose, placement, default legibility, learner action, source/accessibility**. Score 0–2 per part for internal triage; a zero in purpose or default legibility sends it back for redesign regardless of total. The score is a planning aid, not teacher approval.

## Current scan: what the technical checks missed

The browser scan found **33 instructional figures** across A–C at 1594, 800 and 390 px. All loaded with alt text and captions; no tested page had horizontal overflow or a page error. Those results say nothing about whether learners can read or use the images.

- Five paired layouts leave **192–444 px** of aligned empty space on desktop: A L01 polymer (192), A L04 evidence (444), B L14 coal (278), B L15 pump jack (203), C L09 inflammation (392). The fixed columns are driving placement instead of the explanation length.
- All **15 inline SVG diagrams** have an estimated smallest embedded text below **12 px** at 800 and 390 px, based on SVG `viewBox`, authored font sizes and rendered widths. Some small text may be nonessential; each must be checked at actual size. Several horizontal flows need native responsive stages.
- Eleven figures lack their own enlargement control. Five A “source figures” are actually near-complete textbook pages with tiny printed text (L02, L07, L10, L12, L13). Their full pages belong in the reader; the lesson should show only a useful crop or no image.
- The supplied A L01 material comparison is a relevant **application photo**, but it sits beside a molecular-structure explanation and leaves empty space. The B L14 A–D coal figure is source evidence that should be read panel by panel; at phone width its four panels share a 344 px image. These are the two calibration examples provided by the teacher.

The SVG size calculation is a heuristic; the image-role and science decisions below are editorial judgments from the source assets, rendered measurements and representative section screenshots. They still need a final visual review at the exact revised candidate.

Representative current-state captures: [A polymer comparison](science24-visual-placement-samples/a-polymer-desktop.png), [B coal sequence](science24-visual-placement-samples/b-coal-desktop.png), [C inflammation](science24-visual-placement-samples/c-inflammation-desktop.png) and [C pedigree on phone](science24-visual-placement-samples/c-pedigree-phone.png). These illustrate placement problems; they are not proposed final layouts.

## Figure-by-figure disposition

**Priority:** P0 = evidence or labels difficult to use by default; P1 = placement or engagement repair; P2 = retain with a focused check. “Rebuild” means preserve source meaning and activity IDs, not replace the textbook page or change an assessment.

| Unit / lesson / figure | Learning job | Planned treatment |
| --- | --- | --- |
| A01 chemistry-in-our-lives | Familiar context | **P1:** Keep a restrained opening visual; move its tiny baked-in callouts into readable HTML or use a cleaner crop. Ask for one material-property observation. |
| A01 polymer-textiles | Compare material properties | **P1:** Place near the fabric-choice worked example, where water shedding versus absorption is used. Drop the fixed side pair; connect the photo to the decision rather than the molecular definition. |
| A02 HHPS/WHMIS symbol pair | Identify a hazard cue | **P2:** Keep both symbols at icon size with native names and a prompt to read the label; confirm historical versus current system wording. |
| A02 source-safety-symbols | Original historical source | **P0:** Remove the full-page inline scan; retain its textbook link and show only a relevant symbol crop if the lesson needs one. |
| A03 reaction-map | Trace reactants to products | **P1:** Reflow the horizontal model into readable stages on phone; ask what crosses the reaction arrow. |
| A04 source-chemical-evidence | Compare observation with alternative | **P1:** Put the figure below the evidence table at a useful reading width, then ask which clue alone is inconclusive. Remove the 444 px side-column gap. |
| A05 exo-endo-generated | Compare energy directions | **P1:** Keep the two-case comparison, but make each half readable on phone and connect the figure to system/surroundings reasoning. |
| A07 source-reaction-types | Source pattern examples | **P0:** Replace the full-page inline scan with a focused crop or native pattern examples; keep the original page in the reader. |
| A08 coefficient | Distinguish coefficient/subscript | **P1:** Use a native annotated equation at phone width; preserve the enlargement view. |
| A09 water-balance | Count atoms on each side | **P1:** Reflow the atom-count model into an accessible native comparison on phone. |
| A10 source-combustion | Original fuel context | **P0:** Remove the full-page inline scan; link the page and retain only a useful source figure if it supports the combustion task. |
| A11 greenhouse | Trace radiation transfers | **P1:** Reflow the horizontal arrows at phone width; prompt the learner to distinguish sunlight from outgoing infrared. |
| A12 source-acid-base | Source pH context | **P0:** Remove the full-page inline scan; use a focused pH/source crop only if it advances the neutralization explanation. |
| A13 source-acid-deposition | Trace emission to deposition | **P0:** Crop the causal diagram away from page text, verify every label, and link the original page. |
| A14 corrosion-protection | Compare protection strategies | **P2:** Keep the applied comparison; have the learner identify which method blocks water/oxygen and which can protect a scratch. |
| A14 corrosion | Explain exposed iron at a scratch | **P1:** Keep only if the native diagram adds the scratch mechanism beyond the photo; reflow its embedded labels for phone. |
| B02 energy-chain | Separate input, converter, outputs | **P1:** Turn the wide arrow diagram into responsive stages with an input/output reading task. |
| B04 source-generator | Read the original generator representation | **P1:** Check whether it adds evidence beyond the course model. If redundant, leave the source in the textbook reader and teach from one readable model. |
| B04 generator-model | Trace motion to electrical output | **P1:** Reflow labeled parts on phone; require the learner to identify the moving and electrical stages. |
| B05 water-turbine-cutaway | Read numbered equipment | **P1:** Enlarge the meaningful assembly and put a concise numbered key adjacent on desktop / below on phone. Keep source provenance and compare water versus steam input. |
| B08 efficiency-flow | Account for useful and other outputs | **P1:** Reflow to stacked input/outputs on phone; use its 100 J example to interpret efficiency. |
| B09 plant-energy | Connect photosynthesis and respiration | **P1:** Separate the two processes visually on phone; avoid implying a single unbroken reaction. |
| B11 food-pyramid | Compare energy available by level | **P1:** Use a readable responsive stack; ask why the upper level receives less energy. |
| B14 source-coal-formation | Read A–D sequence | **P0:** Make the source figure the main evidence, not a half-column illustration. Crop/present A–D as readable panels on phone, with a short step guide below and the original whole figure linked. |
| B15 source-oil-reservoir | Locate gas, oil, water and rock | **P1:** Crop out tiny source paragraph text; provide a readable labeled diagram and ask why the cap rock matters. |
| B15 source-pumpjack | Show surface extraction equipment | **P1:** Treat as a modest context photo after the extraction explanation; remove the fixed pair's 203 px gap. Do not imply this photo depicts the underground reservoir. |
| C02 transmission-diagram | Trace entry pathway | **P1:** Reflow the four labeled stages on phone; ask where a prevention measure interrupts transfer. |
| C07 water-diagram | Trace multiple public safeguards | **P1:** Present source, treatment, monitoring and tap as responsive panels with readable labels; use the diagram for the source-work recommendation. |
| C09 source-inflammation | Read capillary/macrophage evidence | **P1:** Put the source diagram below the explanation at a centered reading width; remove the 392 px side-column gap and use the A→B prompt. |
| C10 immune-diagram | Distinguish antigen, response and memory | **P1:** Reflow stages; keep the simplifying limitation explicit in text. |
| C13 dna-scale-diagram | Compare cell/chromosome/DNA scales | **P1:** Stack scales on phone without shrinking the explanatory labels. |
| C14 punnett-diagram | Interpret a worked cross | **P1:** Use a native labeled Punnett table on phone and keep the source diagram as optional enlargement. |
| C15 workbook-pedigree | Read exact source relationships | **P0:** Give the original diagram more default reading space on phone and a structured text key for relationships; keep the workbook page, uncertainty and saved response link. Do not redraw away ambiguous evidence. |

## Implementation sequence and review gate

1. **Calibrate three layouts:** A01 application photo, B14 four-panel evidence and C09 single source diagram. Make desktop/tablet/phone screenshots and check the attached teacher examples against the revised layouts. These cover the three recurring placement patterns.
2. **Remove page-as-image use:** audit A02/07/10/12/13 against the original PDF, crop only the needed figure or leave a textbook link, and keep printed/PDF page mapping. Preserve learner source access.
3. **Reflow diagram text:** start with required source tasks and the smallest mobile labels (B04, C07, C14, C15), then the remaining SVG flows. Avoid a shared scale-only CSS fix; each diagram has a different reading order.
4. **Check all 33 again:** source accuracy, figure/action proximity, default label readability, empty space, mobile/tablet/200% zoom, captions, alt text, focus/enlargement and no saved-work changes. Bind screenshots and results to the exact revised file and asset hashes. Keep teacher sign-off separate from automated success.
5. **Apply before Unit D authoring:** classify each potential D visual during its source map. Record source, learning job, panel count, smallest necessary label, intended desktop/phone placement, learner action, rights and accept/adapt/exclude decision. Its motion graphs and calculation figures need special visual and numeric review before they enter a lesson.

**Agent route:** the lead owns pedagogic roles, source interpretation and acceptance. The checked-in scanner is a deterministic inventory tool. Luna/Muse are optional only for later bounded source inventories or clean mechanical asset preparation after admission checks; neither decides whether an image teaches the lesson. Usage savings were not measured.
