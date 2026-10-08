# Science 24 Visual Refresh — Codex Package
**For:** Codex (CLI agent on Dean's Mac), implementing the approved visual refresh of Science 24 Units A–D.
**Source of truth:** the live courses at `https://biology30pilot.web.app/#science24-unit-a` (B/C/D analogous)
and the canonical Mac folders `~/Documents/GitHub/canvas-helper/projects/science24-unit-{a,b,c,d}`.

## Status 2026-09-28
- **63/63 lessons** carry an explicit visual decision (`keep` · `generate` · `native diagram` ·
  `crop` · `reposition` · `video move` · `no visual needed`) — the ledger is in CHANGE-PLAN.md,
  audited against the actual course files on Dean's Mac. Totals: keep 35 · generate 7 ·
  native diagram 15 · crop 3 · reposition 2 · no visual needed 1 · video moves 20 (compound,
  13 videos stay optional).
- The **7 generated assets in `assets/` are dual-audited finals**: each passed Muse's audit
  (full resolution + ~390px phone width) and ChatGPT's independent cold audit (see QA-NOTES.md).
  The 8th asset is the verified Dalecarlia drinking-water photograph.
- B-L14's five references to `source-coal-formation-p136.jpg` were verified **intentional**
  (guided panel-reader reusing one textbook crop) — Codex must not deduplicate or "fix" them.

## Read in this order
1. **`CODEX-GUARDRAILS.md`** — invariants, what you may change, the per-lesson acceptance rubric.
   Read all of it before touching a file. It overrides everything else.
2. **`CHANGE-PLAN.md`** — per-lesson changes: which visual, from what source, with which pattern;
   which videos move in-flow and which stay optional. Includes the verified textbook/page-render inventory.
3. **`exemplar-patterns.html`** — working demos of the four new patterns (full-bleed opener, in-flow video,
   margin-anchored figure, sticker callout). Open in a browser. Copy the `s24x-*` CSS and markup; delete
   the yellow `.s24x-pattern-note` annotation blocks in production.
4. **`ASSET-PROVENANCE.md`** — every shipped asset's credit line (copy verbatim) and alt text.

## Package contents
```
sci24-codex-pack/
├── README.md                  ← this file
├── CODEX-GUARDRAILS.md        ← invariants + acceptance rubric (read first)
├── CHANGE-PLAN.md             ← per-lesson visual + video changes (63/63 lesson ledger)
├── ASSET-PROVENANCE.md        ← credit lines + alt text for every asset
├── QA-NOTES.md                ← exemplar QA + image dual-audit record
├── exemplar-body.html         ← full exemplar lesson body (reference)
├── exemplar-patterns.html     ← working pattern demos (self-contained; open in browser)
├── evidence/                  ← exemplar render evidence (1440px / 390px / forced-grid)
└── assets/                    ← final dual-audited shipping versions (do not regenerate)
    ├── gen-b-l01-energy-forms.png
    ├── gen-b-l13-energy-needs.png
    ├── gen-c-l01-germ-theory.png
    ├── gen-c-l03-transmission.png
    ├── gen-c-l18-defence-layers.png
    ├── gen-d-l01-reaction-zones.png
    ├── gen-d-l02-distraction.png
    └── photo-c-l08-water-treatment.jpg
```

## How to work (summary — the guardrails file is authoritative)
1. Copy ONE unit folder to a working copy. Never touch the live folders or `raw/`.
2. Do one lesson fully, then run the acceptance rubric on it in a real browser (desktop + 390px phone
   + 200% zoom + keyboard). Then the next lesson.
3. Copy new assets from this package's `assets/` into the unit's `workspace/assets/`.
   Crop textbook figures from the per-page renders (see CHANGE-PLAN.md §Source availability).
4. Hand back per unit: files changed, rubric results per lesson, before/after screenshots,
   and anything skipped with reasons.

## What success looks like
- The 26 new-visual slots (7 generated illustrations, 15 native SVG/HTML diagrams, 3 textbook
  crops, 1 verified photo) each gain exactly one key visual that does a teaching job; C-L17 is
  intentionally figureless (discussion-led, P4 sticker callout instead).
- 20 videos move to their point of need; the other 13 stay optional where they are.
- Four new patterns used where the plan says, never forced where they don't fit.
- Zero changes to IDs, save behavior, required checks, progress logic, or lesson copy.
- Every new figure: caption + credit + alt text + View larger, labels ≥14px at phone width.
