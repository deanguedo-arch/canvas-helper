# Bake-off record — Aboriginal Studies 30 Muse (Muse lane)

## What this is
A byte-copy of canonical `aboriginal-studies-30` taken at v2 R27-in-flight
(45/50 lessons v2, 360 bank items, battery 352/353, freeze green, doctor
PASS, plus the source-locator-links enhancement). Retitled to
"Aboriginal Studies 30 Muse". All Muse reconciliation work happens here;
canonical is untouched by this lane.

## Baseline pin (creation)
- workspace/: 99 files, byte-identical to canonical except
  `course-data.js` (one-line title retitle) and the excluded `.DS_Store`
  files. Loads: 50 lessons, 360 bank items.
- meta/: project.json (new slug) + e2e-contract.json only. Canonical
  evidence (ab30-v2/), parity manifests, visual-checks, exports/ NOT
  copied. Bake-off records live in meta/ab30-muse/.
- Studio discovery: directory-scan + meta/project.json, so this slug is
  servable without touching shared config.

## Lane rules
- Canonical `aboriginal-studies-30/` belongs to the Codex/Sol lane as of
  2026-09-24 (concurrent L46 v2 work detected there mid-copy). This lane
  never writes canonical paths or shared suites/manifests again.
- Copy-scoped tests carry distinct filenames; shared battery/manifests
  are canonical's and are not regenerated from this lane.
- The v2 reconciliation plan (`.agents/plans/2026-09-24-ab30-candidate-reconciliation.md`)
  executes here, adapted: "canonical" reads as "this copy's baseline".

## Excluded from copy (by design)
- exports/ (1.2G generated output), meta/ab30-v2/* (canonical history),
  meta/ab30-parity/* (canonical manifests), meta/visual-checks (38M),
  raw/ included (4K import baseline, read-only reference).
