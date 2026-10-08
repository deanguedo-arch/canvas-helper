# Science 24 Visual Refresh — Change Plan
**Companion to:** `CODEX-GUARDRAILS.md` (read first) and `exemplar-patterns.html` (copy the patterns).
**Scope:** Add one key visual per zero-image lesson + reposition core videos in-flow. Nothing else changes.

**How to read each entry:** `Lesson — recommended visual (source type → pattern)`.
Source types: `SVG` = build native SVG/HTML (preferred for labeled processes) · `CROP` = exact crop
of a textbook/workbook figure (record page in credit line) · `GEN` = generate in the existing two-panel
house style (clean conceptual comparison only — never a source observation) · `PHOTO` = real photography
(real phenomena only).
Patterns: `P1` = full-bleed opener · `P2` = in-flow video beat · `P3` = margin-anchored figure · `P4` = sticker callout.
Full-width `.science-figure` = default for evidence diagrams that need reading width.

**Tiers:** Tier 1 = lessons with no image AND no video (do first). Tier 2 = lessons with video but no
image. Tier 3 = review lessons (do last; a single summary visual each).

---

## Source availability (verified 2026-09-28 on Dean's Mac)
- Every unit has its textbook PDF **plus a complete per-page JPEG render set** — Codex crops figures
  from these, never from full-page scans inline:
  - A: `science24-unit-a/workspace/assets/science24-unit-a-textbook.pdf` (54 pp.) + `textbook-01.jpg`…`textbook-54.jpg`
  - B: `science24-unit-b/workspace/assets/textbook.pdf` (~51 pp.) + `textbook-page-01.jpg`…`textbook-page-51.jpg`
  - C: `science24-unit-c/workspace/assets/textbook.pdf` (~49 pp.) + `textbook-page-01.jpg`…`textbook-page-49.jpg`
  - D: `science24-unit-d/workspace/assets/textbook.pdf` (~44 pp.) + renders in `reader-pages/textbook-page-01.jpg`…`-44.jpg`
    (D's renders live ONLY in `reader-pages/`, not the assets root)
- Workbook + workbook-key + guided-notes PDFs exist per unit for additional figure mining.
- A's `source-*` images carry textbook-page provenance in their filenames (e.g. `source-chemical-evidence-p34.jpg`).
- Brightspace export ZIPs (source of truth): `resources/science24-unit-a/_sources/` (87 MB + 51 MB archives).
- Generated images for this plan ship in this package's `assets/` folder, named `gen-[unit]-l[NN]-[slug].png`.

## UNIT A — Matter and Chemical Change (2 gaps)

### Tier 1
- **L06 Writing and reading word equations** — `SVG → full-width figure`: anatomy of a word equation —
  labeled reactants, plus sign ("reacts with"), reaction arrow ("produces"), products. This is the lesson's
  core notation; it needs reading width, not the margin. Also add `P1` opener reusing the same SVG large.
- **L05 Energy changes in reactions** — already has the HTML/CSS energy-direction figure (keep it).
  Add `P1` opener using the existing unused `assets/exo-endo-generated.png` (house style, already on disk).

### Tier 2 video moves (`P2` — move to point of need with a "watch-for" prompt)
- L05: ACS Energy Foundations exothermic/endothermic → place right after the energy-direction figure.
- L09: Tyler DeWitt balancing equations → place after the first worked example.
- L04: ACS Inquiry in Action evidence of change → place after the evidence list, before practice.
- All other Unit A videos stay as end-of-lesson optional.

---

## UNIT B — Energy Transformations (9 gaps)

### Tier 1 (no image, no video)
- **L06 Power, energy and time** — `SVG → full-width figure`: the power relationship triangle (P = E ÷ t)
  with a worked numeric example embedded (e.g. 1000 J in 20 s → 50 W). Learners compute from this figure.
- **L07 Electrical energy and electricity use** — `CROP → full-width figure`: textbook figure of home
  electricity use / power meter. If no clean figure exists, `GEN` a house-style two-panel: same home,
  day vs night usage.
- **L12 Homeostasis and metabolism** — `SVG → full-width figure`: body-temperature feedback loop
  (sensor → control → effector → back to sensor). Labeled process → SVG, no exceptions.
- **L13 Nutrients and changing energy needs** — `GEN → full-width figure`: two-panel energy comparison —
  same teenager, rest day vs game day, with food-energy inputs labeled. Conceptual comparison → house style.
  Lesson-copy note: the game-day panel includes a water bottle — surrounding prose must explicitly
  distinguish hydration from food energy so students do not read water as an energy source. "Lower" and
  "higher" energy needs stay relative (rest day vs game day), not absolute values.

### Tier 2 (video, no image)
- **L01 Energy forms in everyday life** — `GEN → P1 opener`: everyday street scene with energy forms
  labeled where they occur (moving car = kinetic, stretched bow = elastic potential, sun = radiant…).
  Move Cognito "Energy stores and transfers" `P2` into the "moving vs stored energy" section.
- **L03 Conservation and useful output** — `SVG → P3 margin figure`: input → useful + wasted flow
  (the exemplar's demo figure is the template — redraw for this lesson's numbers). Sticky beside the
  practice set that references it. Move Cognito "Conservation of energy" `P2` after the worked example.
- **L10 Cellular respiration** — `SVG → full-width figure`: glucose + oxygen → carbon dioxide + water +
  usable energy, as a flow with the energy "released" arrow emphasized. Keep the video optional (it covers
  photosynthesis+respiration broadly; the lesson needs its own diagram, not the video).
- **L16 Combustion and environmental consequences** — `CROP → full-width figure`: textbook combustion/
  emissions figure with page credit. Keep FuseSchool climate video optional at end.

### Tier 3
- **L17 Review** — single `SVG → full-width figure`: energy-pathways summary map linking the unit's
  conversion chains (panels from L02, L09, L14 as thumbnails with arrows). Do not build new content —
  compose from existing figures.

### Tier 2 video moves (`P2`)
- L08: FuseSchool "Energy efficiency" → after the efficiency worked example (this is the exemplar's demo case).
- L09: FuseSchool "Photosynthesis and respiration" → before the plant-energy diagram.
- L11: FuseSchool "Food chains and food webs" → inside the food-chain section, before the pyramid figure.
- L05, L15 videos stay optional (they support, not carry, those lessons).

---

## UNIT C — Disease Defence and Human Health (11 gaps — largest)

### Tier 1 (no image, no video)
- **L01 Disease causes and germ theory** — `GEN → P1 opener`: two-panel then/now — 1850s hospital ward
  vs modern ward, same viewpoint. Sets the unit's tone; lesson 1 matters most. Caption must state it is
  illustrative, not a historical record.
- **L03 Communicable disease and unequal risk** — `GEN → full-width figure`: transmission routes
  (air, water, touch, vector) as four labeled mini-panels in house style.
- **L05 Sanitation, sterilization and aseptic practice** — `CROP → full-width figure`: textbook aseptic-technique
  figure; if none, `SVG` redraw of the sterile-field setup (labeled process).
- **L06 Outbreaks, epidemics and historical impact** — `SVG → full-width figure`: epidemic curve
  (cases over time) with the three phases labeled — learners read data off this figure in practice.
- **L08 Walkerton case** — `PHOTO → full-width figure`: real photo of the Dalecarlia drinking-water
  treatment plant, Washington D.C. (Washington Aqueduct drinking-water supply — verified potable-water
  facility, not a wastewater plant). Caption must name it as a generic drinking-water treatment plant
  and state explicitly it is not the Walkerton system.
- **L16 Mutations, mutagens and genetic disorders** — `SVG → full-width figure`: three mutation types
  (substitution, insertion, deletion) on a short DNA strip, before/after.
- **L17 Genetic research and ethical decisions** — no figure. Use `P4` sticker callout instead: an ethical
  dilemma decision point ("Who should be able to see your genetic test results?"). This lesson is
  discussion-led; a diagram would be decoration.

### Tier 2 (video, no image)
- **L04 Food safety** — `SVG → full-width figure`: the four FDA steps (clean, separate, cook, chill) as a
  4-step flow. Keep the FDA video optional (it IS the four steps; the figure is the quick reference).
- **L11 Blood compatibility, vaccines** — `SVG → full-width figure`: ABO compatibility chart
  (donor rows × recipient columns, ✓/✗). Learners use it directly in practice — `P3` margin figure candidate.
- **L12 Medicines, antibiotics** — `SVG → full-width figure`: antibiotic-resistance selection diagram
  (bacteria population before/after antibiotic, resistant survivors labeled).

### Tier 3
- **L18 Review** — single `GEN → P1 opener`: the unit's "defence in depth" — skin → inflammation →
  immune response → public health as four layered panels. Illustrative, labeled as such.

### Tier 2 video moves (`P2`)
- L09: TED-Ed immune system → after the inflammation figure, before the immune-response section.
- L10: Amoeba Sisters immune system → immediately before the 4-step immune diagram (learners watch,
  then trace the diagram — the diagram is the `P3` sticky figure beside practice).
- L13: Amoeba Sisters DNA → at the point DNA structure is introduced.
- L14: Amoeba Sisters Punnett squares → after the first worked example.
- L15: Amoeba Sisters pedigrees → before the pedigree practice set.
- L04, L11, L12 videos stay optional.

---

## UNIT D — Safety in Transportation (6 gaps)

### Tier 1 (no image, no video)
- **L01 Reaction time, road risk and injury** — `GEN → P1 opener`: driver viewpoint — hazard appears,
  split panel showing thinking distance vs braking distance zones on the road ahead. This is the unit's
  key mental model; it deserves the strongest opener in Unit D.
- **L02 Fatigue, distraction and impairment** — `GEN → full-width figure`: two-panel comparison —
  alert driver vs distracted driver, same road scene, with reaction-time numbers labeled. Caption states
  numbers are illustrative.
- **L09 Stopping time, force and injury** — `SVG → full-width figure`: force-vs-time graphs —
  short sharp peak (rigid barrier) vs long low curve (crumple zone), same area (same impulse).
  This graph IS the injury insight; learners read values off it.

### Tier 2 (video, no image)
- **L04 Distance, displacement and average speed** — `SVG → full-width figure`: distance vs displacement
  on the same round-trip path (path length vs straight-line arrow, labeled). Move Khan Academy
  "Average speed, graphs and velocity" `P2` after the worked example.
- **L07 Momentum** — `SVG → full-width figure`: momentum comparison — same velocity, different masses
  (bike vs truck) with p = mv values labeled. Move Khan "Introduction to momentum" `P2` after this figure.
- **L08 Friction, braking and impulse** — `SVG → P3 margin figure`: braking force over stopping time,
  linked to the L09 graph style (visual continuity across lessons). Sticky beside practice. Move Khan
  "Impulse and stopping time" `P2` right after the braking worked example.

### Tier 3
- **L13 Review** — reuse: compose the L01 distance-zones visual + L09 force-time graph as a two-panel
  summary figure. No new art.

### Tier 2 video moves (`P2`)
- L05: Khan "Position–time graphs" → inside the graph-construction section, before learners draw.
- L10: Khan "Conservation of momentum" → after the collision figure.
- L11: Khan "Newton's first law and inertia" → before the barriers figure.
- L12: IIHS restraints video → after the retractor figure (it shows what the figure explains).
- L06 video stays optional.

---

## Cross-unit notes
- **B-L14 anomaly — RESOLVED 2026-09-28 (intentional, do not touch):** `source-coal-formation-p136.jpg`
  is referenced 5× by design: 1× as the main overview figure ("Follow the layers from A to D", with the
  "View larger" trigger) + 4× inside `<aside class="coal-panel-guide">`, one thumbnail per panel
  (A · Wetland plants, B · Burial begins, C · Layers build, D · Coal seam), each with its own distinct
  alt text. This is a guided panel-reader, not a copy-paste error. Do not deduplicate, do not "fix",
  and do not add another reference nearby. Full evidence in `internal/lesson-visual-decisions.md`.
- **A-L05:** `assets/exo-endo-generated.png` exists but is unreferenced — wire it as the P1 opener (Tier 1, above).
- **Continuity:** D-L08 and D-L09 graphs must share axis style and color language (same impulse story).
  B-L03 and the exemplar's efficiency figure must share the input→useful+wasted visual language.
- **Credit lines:** every `CROP` gets `Textbook figure, p. [N]` (or workbook); every `GEN` gets
  `Original course illustration generated for Science 24`; every `PHOTO` gets source + what it shows.
- **Alt text** names the learning evidence, not the decoration ("Flow diagram: 100 J electrical in;
  30 J useful light and 70 J wasted heat out" — not "diagram of a light bulb").

---

## Per-lesson decision ledger — 63/63 lessons (audit 2026-09-28)

Every lesson now carries one explicit decision. The detailed evidence ledger (current visual state,
video placement, rationale, asset filenames) is `internal/lesson-visual-decisions.md`; this table
matches it exactly. Decisions: `keep` · `generate` (one of the 7 dual-audited `final-assets/`) ·
`native diagram` · `crop` · `reposition` (review summary composed from existing figures, no new art) ·
`video move` (compound: relocate the optional end-card video in-flow, P2) · `no visual needed`.
`(+V)` = video move also applies. `(photo)` = place the already-verified photo, no generation.

**UNIT A — Matter and Chemical Change (15)**
| L01 keep | L02 keep | L03 keep | L04 keep (+V) | L05 keep (+V; wire on-disk `exo-endo-generated.png` as P1 opener) |
| L06 native diagram | L07 keep | L08 keep | L09 keep (+V) | L10 keep |
| L11 keep | L12 keep | L13 keep | L14 keep | L15 reposition (summary strip from existing figures) |

**UNIT B — Energy Transformations (17)**
| L01 generate (+V) `gen-b-l01-energy-forms.png` | L02 keep | L03 native diagram (+V) | L04 keep | L05 keep |
| L06 native diagram | L07 crop | L08 keep (+V) | L09 keep (+V) | L10 native diagram |
| L11 keep (+V) | L12 native diagram | L13 generate `gen-b-l13-energy-needs.png` | L14 keep (5× coal-formation refs verified intentional) | L15 keep |
| L16 crop | L17 native diagram (review summary map) |

**UNIT C — Disease Defence and Human Health (18)**
| L01 generate `gen-c-l01-germ-theory.png` | L02 keep | L03 generate `gen-c-l03-transmission.png` | L04 native diagram | L05 crop |
| L06 native diagram | L07 keep | L08 keep (photo) `photo-c-l08-water-treatment.jpg` | L09 keep (+V) | L10 keep (+V) |
| L11 native diagram | L12 native diagram | L13 keep (+V) | L14 keep (+V) | L15 keep (+V) |
| L16 native diagram | L17 no visual needed (discussion-led; P4 sticker callout instead) | L18 generate `gen-c-l18-defence-layers.png` |

**UNIT D — Safety in Transportation (13)**
| L01 generate `gen-d-l01-reaction-zones.png` | L02 generate `gen-d-l02-distraction.png` | L03 keep | L04 native diagram (+V) | L05 keep (+V) |
| L06 keep | L07 native diagram (+V) | L08 native diagram (+V) | L09 native diagram | L10 keep (+V) |
| L11 keep (+V) | L12 keep (+V) | L13 reposition (compose L01 + L09 visuals) |

**Totals:** keep 35 · generate 7 · native diagram 15 · crop 3 · reposition 2 · no visual needed 1 · video moves 20 (compound).
New-visual slots reconcile with the plan header: 7 generated + 15 native + 3 crops + 1 photo = 26.
Videos staying optional (13): A-L02, A-L07, A-L08, A-L11, A-L12, A-L14; B-L05, B-L15, B-L16; C-L04, C-L11, C-L12; D-L06.
