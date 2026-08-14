# Canvas Studio Direct Editing independent verdict

- Date recorded: 2026-08-13
- Reviewed head: e71241433e173c7617dbf5ea5e5ddcc5bf712c11
- Focused PR: https://github.com/deanguedo-arch/canvas-helper/pull/1
- Verdict supplied by the independent ChatGPT auditor: **GREEN / GO**
- Release disposition: no remaining release-blocking P0 from the prior audit; controlled real-world rollout recommended

## Scope of this record

This document records the independent follow-up verdict supplied by the user after the auditor inspected the current implementation and exact-head evidence. It is an audit outcome, not a substitute for the linked code, CI reports, or external Brightspace acceptance.

The auditor stated that the reviewed head is materially different from the previously rejected version and approved PR #1 for merge followed by controlled teacher use.

## Independently accepted closures

### Legacy snapshot contract

One canonical adapter predicate includes legacy-snapshot and the shared identity validator uses it. Serialized draft, HTTP Apply, server restart, HTTP Undo, and multi-page snapshot coverage close the earlier gap where snapshot courses appeared supported internally but failed at storage or API boundaries.

### Cross-process lock publication

The complete owner document is written and fsynced before an atomic no-replace hard-link claim publishes the final lock. Stale-lock retirement includes identity checks that prevent an ABA-style stale-owner race.

### Crash recovery

Recovery classifies the live write boundary as before, after, known-partial, or unknown. Unknown external bytes enter manual recovery and are not overwritten. The auditor accepted this as closing the prior silent-data-loss risk.

### Repeated generated identities

Ambiguous identical siblings are marked replay-unsafe and remain Annotation only without a durable canonical key. Stored overrides refuse to replay onto an ambiguous target.

### Image validation

PNG, JPEG, and GIF uploads are fully decoded with Sharp under byte, pixel, channel, frame, and dimension bounds. Learner-render validation additionally checks complete, naturalWidth, and naturalHeight.

### Export freshness

Export evidence fingerprints target identity, workspace bytes, normalized manifest, Studio metadata, package dependencies, recursive exporter implementation dependencies, and artifact bytes. SCORM 1.2 and SCORM 2004 remain independent targets.

### HTTP request limits

Resolve, Apply, and Rename enforce streaming request-body ceilings.

### Public-boundary acceptance

Focused coverage includes serialized draft through HTTP Apply, restart, and HTTP Undo for legacy snapshot, plus multi-page materialization and unknown-crash-state preservation.

The real-course runner exercises Direct, English factory, Social factory, and legacy snapshot through public HTTP handlers. It rebuilds or materializes through the owning adapter, reloads the learner result, restarts the server, performs Undo, and fingerprints the write boundary for exact restoration.

### Exact-head CI

The exact branch-head workflow completed successfully on e71241433e173c7617dbf5ea5e5ddcc5bf712c11. It ran focused editing tests, export contracts, the complete Studio release gate, all four real adapter pilots, and the full enabled catalog through public routes, then uploaded SHA-bearing reports.

The PR-triggered synthetic-merge workflow passed the same complete gate.

## Accepted boundaries

The auditor explicitly did not treat these as merge blockers because the repository states them accurately:

- the filesystem lock coordinates participating Studio processes, not arbitrary manual, Git, Codex, or standalone-builder writers;
- Node does not provide a portable filesystem compare-and-swap for the tiny final Direct reread-to-rename interval;
- local rendered-result validation observes a bounded settlement window;
- edited-target accessibility checks are not full WCAG acceptance;
- Brightspace, deployed-host, and cross-browser SCORM behavior remain external release checks.

The operating rule remains: do not run a non-participating writer against the same Direct course while Studio Apply is active.

## Non-blocking cleanup

A stale pre-fix directory-format lock left by an old Studio crash may fail closed under the new file/hard-link lock protocol and require manual cleanup. The auditor classified this as an upgrade/recovery nuisance, not a silent-corruption path, and did not block release on it.

If the old lock format was never broadly deployed, this has little practical rollout impact. A future doctor or recovery command may add a read-only diagnosis and explicit operator cleanup path without delaying teacher pilots.

## Decision

The prior NO-GO is superseded for the reviewed head.

**GREEN / GO:** PR #1 is approved by the independent auditor. The recommended next evidence is controlled teacher editing on real courses, with Brightspace/export acceptance retained as a separate release gate.

Merge remains a repository-owner action. This verdict removes the independent-audit blocker; it does not silently perform the merge.

## Next plan

Continue with the [measured real-time editability and controlled rollout plan](../plans/2026-08-13-studio-real-time-editability-and-rollout.md).
