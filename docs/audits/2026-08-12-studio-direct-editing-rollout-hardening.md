# Studio Direct Editing rollout hardening

Date: 2026-08-12

Status: complete for the explicitly onboarded pilot boundary. Broad legacy-course enablement remains prohibited.

## Outcome

The 23 findings from the independent Direct Editing audit are closed inside the supported adapter boundary. Edit mode is now fail-closed: a course must pass `course:doctor`, declare a supported driver, and explicitly set `authoring.studioEditing.enabled: true`. `course:list -- --all` reports every inferred legacy course as `not-onboarded`; only the real Direct, English, and Social pilots plus the neutral E2E fixture are ready.

## Editability discovery follow-up

The initial hardened release still reused the blue inspection outline for Edit mode, so teachers could not tell whether a hovered element was actually editable until after clicking it. That usability gap is now closed. Each isolated workspace preview embeds a bounded server-authored map keyed by opaque inspection node IDs. The preview compares mapped source text and attribute fingerprints with the live DOM, outlines the visible supported regions, labels the available action, and reports a visible-area count with a show/hide toggle. Runtime-owned or unsupported content receives a dashed **Annotation only** selection and its reason. Safe nearby content can be selected from surrounding layout within a bounded distance; blocked selections can move directly into Annotate without being selected again. The map remains informational and cannot authorize a write.

## Finding closure

1. Undo fingerprints the full post-batch write boundary and refuses after newer manual, Codex, or builder work.
2. A per-course filesystem lock coordinates separate Studio server processes; lock ownership includes PID and host evidence.
3. Inference never enables Edit mode. Readiness requires an explicitly declared driver and Studio-editing flag.
4. Every applied batch loads the finished learner page in isolated Chromium and asserts the requested rendered postcondition.
5. Runtime-overwrite detection compares bounded rendered fingerprints, full bounded text length, and decoded `href`, `src`, `alt`, and `title` values, including empty and long content.
6. Real Direct, English, and Social apply/rebuild-as-applicable/reload/render/undo pilots passed and restored their complete boundaries byte-for-byte.
7. Explicitly onboarded Social courses resolve as factory editing, not simultaneously as proposal-only.
8. Multi-file mutations use atomic file replacement plus a durable phase journal; the next mutation recovers an interrupted transaction first. Directory recovery reconciles files in place instead of replacing a watched root, preventing macOS Documents sync from creating conflict copies.
9. Generated checkpoints include the builder-owned workspace, metadata, and English resource-library write set.
10. Timed-out rebuilds terminate the whole process group with bounded TERM/KILL escalation before recovery.
11. Generated edit IDs prefer declared keys and semantic content signatures, so distinct siblings survive reordering.
12. Drafts rebase across unrelated page changes only when the selected element digest is unchanged.
13. The editor emits changed fields only, the server rejects no-ops, and text-only generated edits do not inject Studio style CSS.
14. Drafts show sandboxed visual before/after results with accessible text captions.
15. Every draft stores its complete baseline, so text-, link-, image-, title-, and style-only drafts can be reopened in Studio and Full Preview.
16. Content-editable rich text renders entities normally and supplies bold, italic, list, and selected-text link controls.
17. Apply performs an item-labelled read-only preflight before checkpointing or writing, so one bad draft names the item and leaves all course files untouched.
18. Drafts no longer expire after seven days. Bounded eviction is reported, and strict per-course JSON export/import supports backup and restore.
19. Project-scoped operation tokens prevent late apply, Undo, upload, or Rename responses from mutating a newly selected project's UI state.
20. PNG, JPEG, and GIF uploads validate signature, size, and dimensions, use content-addressed canonical resource storage, and materialize through generated rebuilds. Unsupported background images and responsive source sets remain annotation-only.
21. Visual controls are restricted by semantic tag. Render validation checks visibility, image alt text, control names, heading text, and contrast; semantic heading-level and layout changes remain annotation-only.
22. Rename course is a dedicated checkpointed operation over marked sidebar/overview headings, browser title, project metadata, stored course metadata, and declared runtime title strings.
23. Export freshness hashes workspace and artifact bytes. Brightspace directory/package, HTML, Google Hosted, Apps Script, SCORM 2004, and SCORM 1.2 are independent evidence targets recorded by their owning exporters.

## Real-course pilot evidence

- `mental-health-wellness` (`direct-workspace-v1`): apply, learner render, reload, Undo, and byte-for-byte restore passed across 48 files / 8,229,340 bytes. A manual legacy regeneration now refuses to overwrite marked Studio edits unless the operator supplies the explicit destructive override flag.
- `ela20-1-short-stories-pilot` (`english-factory-v1`): apply, factory rebuild, learner render, reload, Undo, and byte-for-byte restore passed across 64 files / 31,614,939 bytes.
- `social30-1-related-issue-1-option-2` (`social-related-issues-v1`): apply, factory rebuild, learner render, reload, Undo, and byte-for-byte restore passed across 107 files / 137,467,882 bytes.

After the pilots, none of the three projects retained `meta/studio-edits.json`, an active transaction journal, or an Undo checkpoint.

## Intentional boundaries

- Edit mode is not approved for every course. Onboard each additional course independently only after its source ownership, runtime behavior, builder write set, rendered checks, and reversible pilot pass.
- Studio keeps one local Undo batch per course. Draft JSON backup is separate from applied-course recovery.
- Background images, responsive `<picture>`/`srcset` changes, semantic heading-level changes, arbitrary CSS/HTML, layout work, activities, assessments, and publishing stay in Annotate/Codex or explicit commands.
- Learner-render validation proves the local finished workspace. Brightspace upload, LMS runtime, and cross-browser package acceptance remain export-stage checks.
- Existing packages are expected to report stale until their matching exporter runs and records artifact evidence; this hardening pass did not republish course exports.

## Repeatable verification

```sh
npm run test:course-editing
npm run verify:course-editing-pilots
npm run test:exports
npm run test:studio-release
```
