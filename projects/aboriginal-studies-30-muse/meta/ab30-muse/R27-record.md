# R27-copy record — Muse lane, Theme 4 lessons 46–47 (v2)

## What was done
- Ported canonical L46 (`t4-l02-colonial-wounds`, `ab30-v2-l46.1`, 11 blocks) and L47
  (`t4-l06-resources-conflict`, `ab30-v2-l47.1`, 12 blocks) whole-object into the copy.
- Ported the 16 reviewed bank items (`ab30-v2-l46-*`, `ab30-v2-l47-*`); copy bank 360 → 376.
- Wrote copy-scoped suite `scripts/tests/aboriginal-studies-30-muse-lesson-batch27.test.ts`: **10/10 green**.
- Copy-lane micro-corrections (in copy only, canonical untouched):
  1. Worked-evidence refs now resolve to exact card titles (was `Source B · NCTR history`,
     `Source A, printed p. 220` ×2).
  2. L47 worked response cites its card (`Source A; Chapter 7, p. 220`).
  3. rio-1 option-a feedback names its source (`Source B (Principle 22) ...`, mirrored bank+lesson).
  4. rio-1 option-b feedback teaches evidence (`checking the evidence about ...`, mirrored bank+lesson).
  5. syncrude criteria names its textbook source (`its 2005 textbook source`).

## Provenance
- Before-state (copy at cut time): `evidence/R27/before-state.json` (mirrored from canonical cut).
- Lesson/bank content derives from canonical post-cut work (L46 refinements + full L47),
  admitted as reference per the forward-port reconcile stance, then independently verified below.
- Corrections 1–5 are Muse-lane originals; canonical still carries the uncorrected forms
  (flagged for lead integration, not edited: canonical is the other lane's working tree).

## Verification (all observed this session)
- `node --test scripts/tests/aboriginal-studies-30-muse-lesson-batch27.test.ts` → 10/10 pass.
- `node --check` on both copy data files → clean.
- Suite proves: versions, frozen-block validation, L47 textbook extracts byte-verified vs
  `textbook-ch7-pp218-225.txt`, attribution+creator+limits on all 5 cards, evidence refs resolve,
  6+2 bank shape with resolvable source codes, engine eligibility + key judging, first-save
  gating, evidence-language feedback, render hooks + disclosure-per-card, q7–q17 byte-pinned.
- Copy inventory: 50 lessons, 376 bank items, 94 vocab.
- After-state: course-data `6010d2ce59b53a24`, practice-data `745c84f98bf8e1f0`,
  batch27 suite `0078cdb741630c04` (sha256-16).

## Recorded variances and gaps (not hidden)
- V1: R27 worked reasoning is 3-step (repair-oriented), not the 4-step tour pattern of
  R25/R26. Pinned at 3 in M27-WORKED with this note.
- G1: L46 web quotes (Racism No Way, NCTR) and the Rio card cannot byte-verify offline —
  sandbox has no network egress (curl timeout, confirmed). Dated locators pinned instead;
  live-source check deferred to rollout.
- G2: `npm run course:doctor` cannot run in this sandbox (tsx IPC socket EPERM) — deferred.
- G3: live-browser halves NOT_RUN (standard sandbox exclusion).
- EXT (other lane, not mine): canonical `aboriginal-studies-30-content.test.ts`
  CONTENT05-auto(T10) is red; that suite reads canonical files only, which I did not touch.
  Suspected concurrent-lane edit; flagged, not fixed (canonical is not my tree).
