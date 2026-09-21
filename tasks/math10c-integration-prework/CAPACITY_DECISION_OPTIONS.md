# Capacity Decision Options — Math 10C v0.5 Pilot

Capacity is an owner policy decision, not a codec-only bug. The codec already refuses
oversize payloads without trimming (`LIMIT=1000000` encode/decode limit,
`buildScormStateCodecRuntime` in `scripts/lib/scorm-state-codec.ts`; corruption/size
tests in `scripts/tests/scorm-state-codec.test.ts`). The bridge already refuses
over-budget saves without truncating (`maxSuspendChars` 60000 for 2004 / 3500 for 1.2
in `buildScormBridgeScript`, `scripts/lib/scorm.ts` ~line 299; `persistStateToLms`
guard ~lines 619–624 preserves the last LMS save and warns). So exceeding budget is a
SAFE failure today — the decision is what the pilot should do instead of failing.

Constraints grounding every option:

- Repo envelope: 60,000 chars SCORM 2004 (`maxSuspendChars`), 3,500 chars SCORM 1.2.
  1.2 is unsuitable for written work (`resolveScormTracking` warns exactly this,
  `scripts/lib/scorm-tracking.ts`).
- Candidate application guard: 40,000 chars (candidate-side frozen fact; no repo
  constant found — do not treat the codec or bridge as its owner).
- Measured headroom on the full unit today: actual UI witness 19,211 application /
  12,475 bridge envelope — fits. Decoder-admitted adversarial witnesses (up to
  ~215,194 envelope for adversarial metadata) do NOT fit and must never be silently
  trimmed.
- Protected until the owner chooses otherwise: first attempts, current drafts,
  selected evidence, support flags, provenance, legacy recovery. No text/history limit
  change authorized. No tenant capacity invented. No silent truncation — ever.
- Tracking/completion contract: `ScormTrackingContract` (`hash-pages-v1`,
  `scripts/lib/scorm-tracking.ts`); completion needs explicit `storageKey` +
  `requiredIds`; progress measure exists only for 2004 with a completion contract.

## Option 1 — One SCO with bounded portable evidence (per-SCO budget discipline)

Shape: single SCO export (`exportProjectToScormPackage`,
`scripts/lib/exports/scorm-package.ts`); per-slice evidence budget set by owner policy
so the serialized slice (state + tracking + completion) stays under 60,000 envelope
chars with measured margin. The audited full-candidate UI witness fits, so the smaller
pilot slice is likely to fit, but it must be measured again after import; the full
eight-lesson unit is NOT promised in one SCO.

- Protected evidence: everything listed above stays complete inside the slice.
- What may be bounded/moved: the NUMBER of items/slices per SCO — scope per package,
  never fidelity per item. Out-of-slice lessons wait (reference-only), they are not
  summarized or shortened.
- Migration effect: none on existing courses; slice-scoped `scorm-tracking.json`
  (`pageIds` = slice routes, `completion.requiredIds` = slice IDs) authored fresh.
- Repository owners: `scripts/lib/exports/scorm-package.ts`,
  `scripts/lib/scorm-tracking.ts` (contract), pilot `meta/` + `e2e-contract.json`.
- Exact measurements required: serialized envelope length of the frozen pilot slice at
  worst-case learner input (max-length answers on every slice item); `completionProgress`
  == 1 path; resume roundtrip; margin to 60,000 recorded in `meta/capacity-decision.json`.
- Failure/recovery: over-budget save refuses safely (current behavior); learner keeps
  tab open, last LMS save intact, downloads backup/process report. No data loss, no trim.
- Rejection criteria: reject if worst-case slice serialization exceeds budget even for
  the minimal slice, or if the owner will not accept scoping the first rollout.

## Option 2 — Smaller SCO/package boundaries (one SCO per lesson or strand)

Shape: N SCOs (e.g. per-lesson or factoring-vs-trig strands), each with its own
suspend budget, tracking contract, and completion list; a package-level (or LMS-side)
sequence presents the unit. Same per-item fidelity as Option 1, multiplied budgets.

- Protected evidence: per-SCO evidence complete; cross-SCO provenance (which SCO holds
  which attempt) recorded in each SCO's state.
- What may be bounded/moved: SCO granularity and sequencing — more packages to publish
  and sequence in Brightspace; per-SCO `pageIds`/`requiredIds` split by owner.
- Migration effect: none on existing courses; new export/sequencing work per SCO;
  manifest per SCO via `buildScormManifest` (`scripts/lib/scorm.ts`); multi-SCO
  completion aggregation must be defined (LMS-side or explicit, never inferred from
  visits — `resolveScormTracking` only recognizes declared required IDs).
- Repository owners: same as Option 1 plus whoever owns package sequencing/publishing
  scripts at integration time.
- Exact measurements required: per-SCO worst-case envelope lengths; aggregation rule
  demonstrated end-to-end (complete every SCO → unit complete); per-SCO resume proof.
- Failure/recovery: per-SCO safe refusal as today; a full SCO fails closed without
  affecting sibling SCOs' saved work.
- Rejection criteria: reject if Brightspace/manifest multi-SCO sequencing cost exceeds
  the pilot's value, or if completion aggregation cannot be stated explicitly.

## Option 3 — Lossless representation / provenance-reference optimization

Shape: keep one SCO and the full protected set, but shrink the SERIALIZED bytes without
losing information: e.g. store stable item IDs + compact answer encodings with the
question bank reproducible from the deterministic generator (seed + parameters) rather
than duplicating prompts; keep hashes/checks (`CH10LZ1|` hash field) so corruption is
still detected; keep provenance pointers (attempt → item version → catalog ID, covering
the v0.4 + 10 appended v0.5 IDs). Any scheme must still roundtrip through
`stateCodec.encode`/`decode` losslessly and pass the extended codec tests
(see `SHARED_SCORM_TEST_PLAN.md` §3).

- Protected evidence: lossless — every protected field recoverable byte-identical;
  provenance references resolvable, not dangling.
- What may be bounded/moved: representation efficiency only — duplicate prompt text,
  verbose history envelopes, redundant metadata may move to referenced (versioned,
  bundled or LMS-accessible) stores IF the reference is total (resolves offline in the
  exported package context or its declared dependency) — never to a best-effort URL.
- Migration effect: HIGHEST of the three — touches the shared codec path and therefore
  every SCORM course; requires the full receipt/codec test plan green BEFORE and AFTER
  (baseline §2 + regressions §3), plus the existing-course regression boundary.
- Repository owners: `scripts/lib/scorm-state-codec.ts`, `scripts/lib/scorm.ts`
  (bridge), `scripts/tests/scorm-state-codec.test.ts`, `scorm-export.test.ts`,
  `scorm-tracking.test.ts`, new receipt test file.
- Exact measurements required: byte counts before/after on the REAL pilot slice AND
  on the adversarial witness set (211,276/215,194 metadata class must still be
  refused safely, not newly "fit" by lossy means); decode integrity failures still
  throw; Chemistry-format compatibility (codec header comment) still holds.
- Failure/recovery: any unresolvable reference or hash mismatch fails closed with the
  current "keep this tab open" messaging; last-good LMS save preserved.
- Rejection criteria: reject if any protected field is not byte-recoverable, if a
  reference can dangle, or if the shared-codec blast radius cannot be fully regression-
  proven. This option MUST NOT be combined with the pending receipt/codec patch in one
  change — sequence them.

## Recommendation for the first pilot

**Option 1** for the first pilot (factoring slice + right-triangle contrast in one SCO).

Why: the audited full-candidate UI witness fits today (19,211 / 12,475 vs 60,000
envelope), which makes the smaller slice a reasonable low-risk starting point; the
imported slice still needs a fresh worst-case measurement. It needs no shared-codec
change (smallest blast radius — the pending
receipt/codec patch already carries the shared-path risk); it honors every protection
(no limits reduced, nothing truncated); and it defers the multi-SCO sequencing cost
(Option 2) and the shared-codec redesign risk (Option 3) until real slice measurements
demand them. Keep Option 2 as the fallback if the slice grows; keep Option 3 as a
later, separately reviewed optimization.

## Decision form (Dean — plain language, no jargon)

1. The first pilot covers one factoring set plus the small right-triangle contrast,
   with the rest of the unit waiting untouched for later. OK? (yes / no / change scope to: ___)
2. If a learner's saved work ever gets too big for Brightspace, the course must REFUSE
   to save and keep the last good save — never quietly shorten their work. OK? (yes / no)
3. One package for the first pilot (simplest), or split into smaller packages per
   lesson if the work grows? (one package / split later if needed / split now)
4. May later work shrink the technical packaging of saved work to fit more, as long as
   every word of learner work comes back exactly? (yes, if proven / no)
5. Who confirms the pilot is classroom-ready before any learner rollout? (name/role: ___)
