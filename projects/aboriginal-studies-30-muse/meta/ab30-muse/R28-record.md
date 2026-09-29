# R28-copy record — Muse lane, Theme 4 lessons 48–50 (v2)

## What was done
- Ported canonical L48 (`t4-l03-land-resources-un`, `ab30-v2-l48.1`, 11 blocks),
  L49 (`t4-l07-education-odds`, `ab30-v2-l49.1`, 11 blocks), L50
  (`t4-l04-youth-future-response`, `ab30-v2-l50.1`, 10 blocks) whole-object into the copy.
- Ported the 24 reviewed bank items (`ab30-v2-l48-*`, `l49-*`, `l50-*`); copy bank 376 → 400.
- Wrote copy-scoped suite `scripts/tests/aboriginal-studies-30-muse-lesson-batch28.test.ts`: **10/10 green first run**.
- Copy-lane micro-corrections (in copy only, canonical untouched):
  1. Three worked-evidence refs now resolve to exact card titles (were `Source A, textbook
     p. 226`, `Source A, textbook p. 231`, `Source B, Introduction, PDF p. 24`).
  2. All three worked responses cite their cards (`(Source A.)` ×2, `(Source B.)` ×1).
  3. L48 route criteria holds conclusions (`holds any conclusion about impact until it arrives`).
  4. L49 voice-1 option-a feedback names its source (`One profile (Source B) ...`, mirrored bank+lesson).
  5. L49 exchange criteria teaches detail (`with a concrete detail ...`).
  6. L49 repair criteria bounds inference (`avoids claiming ...`).
  7. L50 paragraph criteria names its source (`a specific sourced memoir moment`).

## Provenance
- Lesson/bank content derives from canonical R28 work, admitted as reference per the
  forward-port reconcile stance, then independently verified below.
- Corrections 1–7 are Muse-lane originals; canonical still carries the uncorrected forms
  (flagged for lead integration, not edited).

## Verification (all observed this session)
- `node --test scripts/tests/aboriginal-studies-30-muse-lesson-batch28.test.ts` → 10/10 pass.
- `node --check` on both copy data files → clean.
- Suite proves: versions, frozen-block validation, card titles+kinds pinned (incl. the
  Campbell memoir-voice exception), printed+PDF locator patterns, band-scoping control,
  evidence refs resolve, 6+2 bank shape with resolvable codes, engine eligibility + keys,
  first-save gating, evidence-language feedback, render hooks + disclosure-per-card,
  q18–q22 byte-pinned, 4-3 assignment asset present.
- Copy inventory: **50/50 lessons v2**, 400 bank items, 94 vocab.
- After-state: course-data `51ba8b7df3398899`, practice-data `19c2f127e1353707`,
  batch28 suite `ac884bb9db7faec6` (sha256-16).

## Recorded variances and gaps (not hidden)
- V1 (carried): 3-step worked reasoning pinned, not 4-step.
- G1: no fixture band covers ch7 pp226-233, booklet p.21, or the Halfbreed excerpt —
  live-text byte-verification of R28 quotes is a rollout gap (staged-source pass only).
- G2/G3 (carried): doctor unrunnable in sandbox (tsx IPC EPERM); live browser NOT_RUN.
