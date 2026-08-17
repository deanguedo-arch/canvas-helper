# Studio Direct Editing rollout hardening

Date: 2026-08-12

Status: **GREEN / GO** on independently reviewed head `e7124143`. The requested transaction, contract, image, freshness, route-acceptance, and CI changes are implemented; controlled teacher rollout is now recommended.

Independent outcome: [Canvas Studio Direct Editing independent verdict](2026-08-13-studio-direct-editing-green-go-verdict.md).

## Outcome

The first 23 findings established the supported adapter boundary. A later independent audit correctly found additional defects in the real shared validator, lock publication, interrupted recovery, repeated identity, cleanup, image, export, and acceptance seams. The current branch addresses those later findings and keeps Edit fail-closed: a course must pass `course:doctor`, declare a supported driver, and explicitly set `authoring.studioEditing.enabled: true`.

## August 13 independent-audit follow-up

- `legacy-snapshot` is part of one exhaustive shared adapter predicate, and its draft now completes storage reload, JSON serialization, HTTP Apply, learner render, server restart, and HTTP Undo in the focused suite.
- Lock acquisition publishes a complete fsynced owner with atomic no-replace semantics; two independent Node processes race the claim in regression coverage.
- Recovery classifies exact before, exact after, known partial, and unknown boundaries. Unknown external work is preserved under `manual-recovery`; terminal states make cleanup idempotent.
- Identical repeated elements without a durable canonical key are Annotation only and stored replay fails closed. Distinct content and explicit durable keys remain supported.
- Direct publication rereads each source immediately before replacement. The remaining non-cooperating writer interval is explicitly unsupported and documented rather than described as fully protected.
- PNG/JPEG/GIF uploads use bounded full decoding, full SHA-256 names, retry-safe dual publication, and learner-browser natural-dimension checks.
- Export evidence schema V2 includes target identity, workspace, normalized manifest, Studio metadata, package state, recursive exporter implementation dependencies, and artifact bytes.
- Resolve, Rename, and Apply JSON bodies have explicit streaming byte ceilings; snapshot multi-page materialization loads each page's own source.
- Catalog acceptance uses the public HTTP handlers. Real Direct, English, Social, and snapshot pilots restart the route server before Undo.
- `.github/workflows/studio-direct-editing.yml` runs the exact PR revision and uploads the release digest plus pilot and catalog reports.

## Editability discovery follow-up

The initial hardened release still reused the blue inspection outline for Edit mode, so teachers could not tell whether a hovered element was actually editable until after clicking it. That usability gap is now closed. Each isolated workspace preview embeds a bounded server-authored map keyed by opaque inspection node IDs. The preview compares mapped source text and attribute fingerprints with the live DOM, outlines the visible supported regions, labels the available action, and reports a visible-area count with a show/hide toggle. Runtime-owned or unsupported content receives a dashed **Annotation only** selection and its reason. Safe nearby content can be selected from surrounding layout within a bounded distance; blocked selections can move directly into Annotate without being selected again. The map remains informational and cannot authorize a write.

## Finding closure

1. Undo fingerprints the full post-batch write boundary and refuses after newer manual, Codex, or builder work.
2. A per-course complete-owner lock is atomically published and coordinates separate Studio server processes; lock ownership includes a random ID, PID, host, operation, and start time.
3. Inference never enables Edit mode. Readiness requires an explicitly declared driver and Studio-editing flag.
4. Every applied batch loads the finished learner page in isolated Chromium and asserts the requested rendered postcondition after bounded local settlement.
5. Runtime-overwrite detection compares bounded rendered fingerprints, full bounded text length, and decoded `href`, `src`, `alt`, and `title` values, including empty and long content.
6. Real Direct, English, Social, and legacy-snapshot route-level apply/rebuild-or-materialize/reload/render/server-restart/undo pilots cover all four adapters and require byte-for-byte restoration.
7. Explicitly onboarded Social courses resolve as factory editing, not simultaneously as proposal-only.
8. Multi-file mutations use atomic file replacement plus a durable phase journal; the next mutation recovers only a recorded before/after/known-partial boundary. Unknown external bytes remain untouched for manual recovery. Directory recovery reconciles files in place instead of replacing a watched root.
9. Generated checkpoints include the builder-owned workspace, metadata, and English resource-library write set.
10. Timed-out rebuilds terminate the whole process group with bounded TERM/KILL escalation before recovery.
11. Generated edit IDs prefer declared keys and semantic content signatures. Distinct siblings survive reordering; ambiguous identical siblings require a durable canonical key and otherwise fail closed.
12. Drafts rebase across unrelated page changes only when the selected element digest is unchanged.
13. The editor emits changed fields only, the server rejects no-ops, and text-only generated edits do not inject Studio style CSS.
14. Drafts show sandboxed visual before/after results with accessible text captions.
15. Every draft stores its complete baseline, so text-, link-, image-, title-, and style-only drafts can be reopened in Studio and Full Preview.
16. Content-editable rich text renders entities normally and supplies bold, italic, list, and selected-text link controls.
17. Apply performs an item-labelled read-only preflight before checkpointing or writing, so one bad draft names the item and leaves all course files untouched.
18. Drafts no longer expire after seven days. Bounded eviction is reported, and strict per-course JSON export/import supports backup and restore.
19. Project-scoped operation tokens prevent late apply, Undo, upload, or Rename responses from mutating a newly selected project's UI state.
20. PNG, JPEG, and GIF uploads validate signature, fully decode within byte/channel/frame/pixel bounds, use full-digest content-addressed canonical storage, complete safely on retry, and materialize through generated rebuilds. Unsupported background images and responsive source sets remain annotation-only.
21. Visual controls are restricted by semantic tag. Render validation applies edited-target visibility, image decoding/alt, control-name, heading, and contrast heuristics after bounded settlement; this is not page-wide WCAG or delayed-interaction acceptance.
22. Rename course is a dedicated checkpointed operation over marked sidebar/overview headings, browser title, project metadata, stored course metadata, and declared runtime title strings.
23. Export freshness hashes each target's relevant manifest/metadata/workspace/dependency/exporter graph and artifact bytes. Brightspace directory/package, HTML, Google Hosted, Apps Script, SCORM 2004, and SCORM 1.2 remain independent evidence targets.

## Real-course pilot evidence

- `mental-health-wellness` (`direct-workspace-v1`): apply, learner render, reload, Undo, and byte-for-byte restore passed across 48 files / 8,229,340 bytes. A manual legacy regeneration now refuses to overwrite marked Studio edits unless the operator supplies the explicit destructive override flag.
- `ela20-1-short-stories-pilot` (`english-factory-v1`): apply, factory rebuild, learner render, reload, Undo, and byte-for-byte restore passed across 64 files / 31,614,939 bytes.
- `social30-1-related-issue-1-option-2` (`social-related-issues-v1`): apply, factory rebuild, learner render, reload, Undo, and byte-for-byte restore passed across 107 files / 137,467,882 bytes.

The current gate adds `ela10-2-writing-foundations` as the real legacy-snapshot pilot and restarts the HTTP server before Undo for every adapter. No pilot may retain a new `meta/studio-edits.json`, active journal, lock owner, or latest Undo checkpoint.

## Intentional boundaries

- Edit mode is not approved for every course. Onboard each additional course independently only after its source ownership, runtime behavior, builder write set, rendered checks, and reversible pilot pass.
- Studio keeps one local Undo batch per course. Draft JSON backup is separate from applied-course recovery.
- Background images, responsive `<picture>`/`srcset` changes, semantic heading-level changes, arbitrary CSS/HTML, layout work, activities, assessments, and publishing stay in Annotate/Codex or explicit commands.
- Learner-render validation proves the local finished workspace. Brightspace upload, LMS runtime, and cross-browser package acceptance remain export-stage checks.
- Learner-render validation observes bounded local settlement and edited-target heuristics; it does not prove later lazy, route, visibility, or interaction-triggered behavior and is not full accessibility acceptance.
- The lock is cooperative. Manual, Git, Codex, and standalone builder writes must not race Direct Apply inside its final read-to-rename interval.
- Existing packages are expected to report stale until their matching exporter runs and records artifact evidence; this hardening pass did not republish course exports.

## Repeatable verification

```sh
npm run test:course-editing
npm run verify:course-editing-pilots
npm run test:exports
npm run test:studio-release
```
