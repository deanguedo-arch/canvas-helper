# R13 record — Theme 1 batch (Lessons 11–13) with full activities

## Implemented
- **L11 Métis Governance/Elders → `ab30-v2-l11.1`**: hunt-vs-parish
  law teaching, 12 cards (A–L incl. Pembina rules, crisis/formal/
  informal kinds, Theresa + Bob Cardinal), comparison panel +
  worked contrast with named Elder account, role-match selection +
  elected-leaders repair, formal/informal independent difference,
  q44–q47 bridge, reflection.
- **L12 First Nations/Inuit Relations → `ab30-v2-l12.1`**: separated
  historical lanes, 12 cards (A–L incl. avocations sentence,
  Breynat, Waquan, Opekokew, Ittinuar), two-readings panel +
  worked pp50–51 example, lane-marker selection + causal-chain
  repair, one-account-fails independent task, q48–q51 bridge,
  reflection.
- **L13 Scrip/Road Allowances → `ab30-v2-l13.1`**: Métis lane
  teaching, 13 cards (A–M incl. McGillivray, Riel, Manitoba Act
  excerpt, RCAP verdict, Ste Madeleine), mechanism/assessment
  panel + worked scrip example, chronology selection +
  sorting-story repair, chain-plus-detail independent task,
  q52–q56 bridge, reflection.
- **Bank +24** (104 items total): 6+2 per lesson, distinct stimuli +
  families, all reviewed/formative/no-marks; in-lesson selections
  deep-synced. No shared-component changes — R09 freeze holds
  (LESSON-FREEZE green).
- **vocab-24 reconciled**: the informal-leader meaning conflated
  informal with crisis leaders; corrected to the Source G
  definition in both the lesson term and the vocabulary bank.

## Verification
- Before-state recorded (`evidence/R13/before-state.json`).
- All 37 extracts verify verbatim against the R13 bands (new
  `textbook-ch2-pp45-49.txt`, `textbook-ch2-pp50-53.txt`,
  `textbook-ch2-pp54-57.txt`).
- New batch suite: 10/10. Full battery: 217/218 (only the pre-existing
  lead-owned shell file). Doctor PASS (legacy-snapshot-v1).
- CONTENT01 v2 map extended to 13 lessons; manifest versions bumped;
  asset manifest regened. q44–q56 byte-pinned.
- 3 lesson reviews at `meta/ab30-v2/lesson-reviews/`.

## Source findings
- Workcard homes verified exact against the workspace (L11 q44–47,
  L12 q48–51, L13 q52–56) — no question moves required.
- Page-boundary decisions (R11 p19 precedent): L11 label pp44-49 →
  pp45-49 (p44 stays with L10); L12 label pp50-55 → pp50-53 (Red
  River content stays with L13); L13 label pp55-60 → pp54-57 (q52–53
  live on p54; pp58–60 are Indian Act for L14).
- Display-layer caution: tool output redacts the “bearer could”
  span (p55) as “Bearer [REDACTED]”; the PDF bytes and fixtures
  hold the true lowercase wording, and verification runs against
  fixture bytes (boolean), immune to display filtering. Extracts
  use the true bytes.
- “Leadership r oles” (p47) and numeral-led rules (p45) handled per
  the R07 verbatim rule — clean contiguous spans only.
- M09/M10/M11 implemented as accessible equivalents (comparison
  panel, dated lanes, numbered stages + panel); no games, no
  impersonation, no unverified maps.
- Historical terminology (“said Indians”, “Half-breed”, “Indian
  Title”, “squatters”) confined to marked quotations with
  quoted-not-adopted limits (audited).

## Limitations / carry to R14
- Screenshots + live UI proof NOT_RUN in-sandbox (frozen pattern).
- Bank items keep AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW;
  lead integration review pending; no publish performed.
