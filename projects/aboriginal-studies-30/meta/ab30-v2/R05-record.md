# R05 record — Bio visual components (not approximations)

- Contract: match Biology component rules with actual local Work Sans /
  Hanken assets, semantic headings, compact truthful sources, guide
  position. Donor (`projects/biology30-unit-a-pilot-3/workspace/`) read
  only; content and runtime NOT imported.

## Find/fix

- **Found:** AB30 declared `Work Sans`/`Hanken Grotesk` in font stacks but
  shipped no faces and no binaries — "declaring font-family alone,"
  exactly the gap V-01 names. Remote fonts were already removed (T21).
- **Fixed:** OFL variable binaries + license texts copied from the donor
  (byte-identical, hashes in `reference-lock.json`), wired via `@font-face`
  (100–900, swap). Zero network dependency preserved; manifest +4.
- **Found:** single-column all-bold goal card with the essential question
  buried inside; h4 on every teaching block; no per-lesson guide; source
  metadata rendered as an undifferentiated wall.
- **Fixed:** two-column `Learning goal` / `Before you begin` strip with
  normal-weight text (solo variant when no prerequisite — nothing
  invented); EQ below the new lesson h1; block headings h2 with h3
  subheads; `How to complete this lesson` after the goal strip in all 50
  lessons with steps generated from the controls each lesson actually
  renders; source head line + bare-extract blockquote + `Source details`
  disclosure (bare extracts render no dl, no disclosure).
- **Fixed:** T08 placeholder rules replaced by one owned Bio-parity set:
  h1 clamp(34px,4.4vw,50px), h2 30px/26px mobile, 760px narrative measure,
  goal stacking ≤980px, source dl stacking ≤640px, 16px sides ≤360px
  (explicit adaptation, recorded in CSS). Frame was already 1120px.
- **Not changed:** theme-level `.goal-strip`, sidebar/topbar, v1 teaching
  path, submission lifecycle, every shell-pinned selector (VIS08 guards
  the masked ones). `lesson-guide`/`source-details` data-testids NOT
  added — R08-owned, absence still asserted. Eyebrow format → R06.

## Evidence

- `evidence/R05/reference-lock.json` — donor paths + font/donor-style hashes.
- `evidence/R05/same-text-fixture.json` + `fixture-candidate.html` (real
  renderer output) + `fixture-donor.html` (same frozen text, donor
  stylesheet). Deterministic regen via `scripts/lib/as30-r05-fixture.cjs`.
- Tests: 8/8 visual suite; 26/26 content/testids/route; battery 155/158
  (same 3 lead-owned shell); postcss parse OK both sheets; doctor PASS.
- Browser proof: `scripts/lib/as30-r05-browser.cjs` written but NOT_RUN —
  headless-shell SEGV, full chromium exits, firefox fails, listen EPERM.
  Run outside the sandbox for fonts/geometry/screenshots at 5 widths.
  No screenshots exist; none claimed.
