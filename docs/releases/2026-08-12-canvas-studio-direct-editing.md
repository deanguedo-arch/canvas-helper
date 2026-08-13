# Canvas Studio 2026.08 — Safe course editing

Released August 12, 2026.

Catalog rollout updated August 13, 2026.

Eligible courses can now collect, review, apply, and undo routine teacher changes directly in Studio or Full Preview.

## What’s new

- **See and edit in place:** Edit mode outlines visible supported regions, labels the available action on hover, counts mapped areas, and lets teachers change supported text, links, images, alt text, captions, curated visual styles, or the synchronized course name without leaving Studio. Runtime-owned or unsupported selections use a dashed Annotation-only state with the exact reason.
- **Move blocked work directly to Codex:** A rejected selection can switch into Annotate without making the teacher find and select it again.
- **Review before applying:** Draft Changes persist per course across Studio and Full Preview and can be edited, removed, reordered, and compared before one batch is applied.
- **Apply safely and undo:** Studio rechecks targets, checkpoints the course, rebuilds generated courses when needed, validates the result, and can undo the last batch.
- **Protect newer work:** A filesystem lock and durable journal recover interrupted batches, while Undo refuses after Codex, a builder, or a teacher changes the course again.
- **Validate the learner result:** Every successful batch is loaded in an isolated browser and checked for the requested rendered result plus core visibility, alt-text, accessible-name, heading, and contrast requirements.
- **Use teacher-friendly tools:** Rich text, selected-text links, visual comparisons, persistent draft backups, safe image upload, and a dedicated multi-surface Rename course workflow replace raw HTML and URL-only editing.
- **Trust export status:** Freshness is tied to actual workspace and artifact bytes, with separate SCORM 1.2 and SCORM 2004 evidence.
- **Keep ownership clear:** Every edit is course-only; unsupported or unmapped content stays annotation-only, and existing exports are marked out of date until republished.
- **Start new Codex courses ready:** `npm run course:create` creates a validated Direct project that appears in an already-open Studio with its visual Edit map enabled.
- **Bring the source-backed catalog forward:** transactional onboarding classified all 84 project directories; 63 active source-backed projects are explicitly Studio-enabled, one remains blocked, one remains reference-only, and 19 package-only archives are accounted for without treating exports as source.
- **Keep Studio responsive across the repository:** Course-page discovery starts from declared entrypoints, ignores duplicate copied resource trees, and uses a bounded fallback scan so one accidental archive cannot freeze the picker.

## Safety boundary

Edit mode is enabled only when `course:doctor` passes and the manifest explicitly enables a supported Direct, English factory, Social factory, or preserved legacy-snapshot adapter. Unclassified inferred projects are `not-onboarded`; package-only directories remain non-authorable. The preview sends an opaque target identity and an approved operation; it never chooses a filesystem path. Before applying, the server preflights each draft, safely rebases only unchanged selected elements, sanitizes delta-only changes, acquires the cross-process lock, creates a durable journal and complete checkpoint, updates the canonical course input, and performs the bounded rebuild or snapshot materialization when required. Static verification and a real learner render must both pass. Any failure restores the previous state, and Undo refuses if the applied boundary later drifts.

The reversible acceptance command `npm run verify:course-editing-pilots` passed on one real Direct course, one real English factory course, and one real Social factory course. Each temporary edit survived its applicable rebuild and reload, passed the learner-render check, and restored its complete checkpoint boundary byte-for-byte with no `studio-edits.json`, active journal, or Undo checkpoint left behind.

The catalog acceptance command `npm run verify:course-onboarding -- --all` passed 63/63 explicitly enabled projects. Forty-nine completed a reversible rendered text pilot; twelve correctly exposed no source-owned text target; Aboriginal Studies 30 and Sports Wellness safely rejected sampled changes because of runtime ownership or existing contrast and restored their files exactly. See `docs/audits/2026-08-13-course-catalog-onboarding.md` for the complete outcome.

New JavaScript activities, assessment logic, navigation redesigns, arbitrary HTML/CSS, complex section moves, family-wide changes, and publishing remain Codex or explicit export workflows. Annotate and Review Set remain available as a separate workflow for those changes.

## Release gate

Run `npm run test:studio-release`. The command uses only installed repository tools, allocates a fresh loopback port, refuses an occupied requested port, disables Playwright `test.only`, runs the focused contracts, production build, complete Studio inspection and direct-edit E2E, platform smoke, and strict neutral project contract in order, and stops on the first failure.

It writes the ignored machine-readable result to `.runtime/studio-release-report.json`, including branch, commit, bounded directory-level dirty-tree status, an exact Studio source fingerprint, runtime/tool versions, commands, timing, exit codes, and test counts. A source change during the run fails the gate.
