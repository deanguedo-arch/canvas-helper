# Exemplar QA notes — 2026-09-28

## What was verified

The exemplar (`exemplar-patterns.html`) was audited with a two-pass approach:

1. **Rendered visually** at desktop 1440px, phone 390px, and a forced desktop-grid
   pass, using a print-layout engine (WeasyPrint). Print-only CSS (`@media print`)
   was stripped for the screen renders; width media queries the engine ignores
   were unwrapped so the 390px render applies the real mobile CSS and the grid
   pass applies the real `@media(min-width:1150px)` two-column rule.
2. **Static checks**: HTML parsed for unclosed/stray tags (clean), focus-style
   rules present (16 `:focus-visible` rules from the course CSS), all four
   `s24x-*` pattern blocks inspected.

Evidence renders are in `evidence/`.

## Defects found and fixed

1. **Sankey demo figure** — the "wasted heat + sound" label overflowed its pink
   pill (text ~124px wide in a 112px pill). Fixed by widening the viewBox to
   360 and re-centering the diagram; label now sits fully inside its pill
   (`evidence/exemplar-margin-grid-desktop.png`).
2. **Opener at 390px** — `margin:0 -18px` combined with `.main`'s zero side
   padding at mobile put the opener text nearly flush with the viewport edge.
   Fixed to `margin:0; padding:40px 22px 34px` so the band stays full-bleed with
   a 22px text inset matching lesson body text.

## Deliberately not defects

- The Pattern 3 figure stacks below the practice questions in the plain 1440px
  render: the layout engine ignores `@media(min-width:1150px)`. The forced-grid
  pass proves the two-column sticky-rail layout works with no overflow.
- No topbar in the exemplar: intentional simplified demo chrome. The patterns
  do not interact with the topbar.

## What Codex must still verify in a real browser (per lesson)

Real Chromium was unavailable in this environment, so the following were **not**
verified here and remain Codex's responsibility under `CODEX-GUARDRAILS.md`:
actual `position:sticky` behavior while scrolling, 200% zoom, keyboard tab order
and visible focus on new controls, console errors, and real font rendering.
The patterns use standard CSS only (grid, sticky, gradients, transforms — no
JS), so risk is low, but the rubric requires the check anyway.

## Image dual-audit — 2026-09-28

All 7 generated illustrations in `assets/` passed **both** Muse's independent audit (full
resolution and a true proportional ~390px phone-width render) and ChatGPT's independent cold
audit. The 8th asset, the Dalecarlia drinking-water photograph, was verified as a real
potable-water treatment facility and passed both reviews as well.

The bar that drove the repair rounds: **every word of text must be comfortably legible at ~390px
phone width** — captions, sublabels, subtitles, and footers, not just titles. Content was
correct early on several images; typography at phone size was the recurring failure.

Per-image rounds:
- `gen-c-l03-transmission.png` — **8 rounds.** ChatGPT failed v5/v6/v7 on real grounds
  (contact-panel text, then body paragraphs, then a bottom-sentence meaning regression, then the
  two contact sublabels, then the title subtitle). Final v8: short large-type captions, enlarged
  subtitle and sublabels. ChatGPT: "Shipping verdict: PASS — ready to use."
- `gen-c-l18-defence-layers.png` — **3 rounds.** A regeneration dropped the entire Line 4 on
  immunological memory and vaccines; the fix restored it with the exact sentence "B lymphocytes
  produce antibodies that target specific pathogens." plus phone-width typography. ChatGPT:
  "Final shipping decision: PASS — ready to ship."
- `gen-d-l02-distraction.png` — **2 rounds.** The illustrative-values caveat was enlarged
  ~50–75% to phone-legible size.
- `gen-c-l01-germ-theory.png` — **2 rounds.** Era badge reworded to "MID-1800s (BEFORE GERM
  THEORY WAS WIDELY ACCEPTED)"; invented wall slogan removed.
- `gen-b-l01-energy-forms.png`, `gen-b-l13-energy-needs.png`, `gen-d-l01-reaction-zones.png` —
  **1 round each**; clean after the initial fix pass.

Audit-honesty note: the "cold" audit prompts never revealed prior outcomes, but they ran inside a
conversation whose earlier audit history the model could see — so the later audits were strict
rather than perfectly blind. Full per-round record: `internal/muse-audit-round2-repairs.md`
(audit trail, excluded from the shipping ZIP).
