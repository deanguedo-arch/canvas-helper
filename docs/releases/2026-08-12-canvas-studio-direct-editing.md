# Canvas Studio 2026.08 — Safe course editing

Released August 12, 2026.

Catalog rollout updated August 13, 2026.

Eligible courses can now collect, review, apply, and undo routine teacher changes directly in Studio or Full Preview.

## Independent release decision

The August 13 independent follow-up returned **GREEN / GO** on exact reviewed head `e7124143`. The prior release-blocking findings are closed, exact-head and PR-merge workflows passed, and the recommended next step is controlled teacher editing on real courses.

The accepted boundaries remain explicit: arbitrary external writers must not race Studio Apply, local rendered validation is bounded, edited-target checks are not full WCAG, and Brightspace/deployed-host/cross-browser SCORM behavior remains separate export acceptance.

See [the recorded verdict](../audits/2026-08-13-studio-direct-editing-green-go-verdict.md) and [the measured real-time editability rollout plan](../plans/2026-08-13-studio-real-time-editability-and-rollout.md).

## What’s new

- **See and edit in place:** Edit mode outlines visible supported regions, labels the available action on hover, counts mapped areas, and lets teachers change supported text, links, images, alt text, captions, curated visual styles, or the synchronized course name without leaving Studio. Runtime-owned or unsupported selections use a dashed Annotation-only state with the exact reason.
- **Move blocked work directly to Codex:** A rejected selection can switch into Annotate without making the teacher find and select it again.
- **Review before applying:** Draft Changes persist per course across Studio and Full Preview and can be edited, removed, reordered, and compared before one batch is applied.
- **Apply safely and undo:** Studio rechecks targets, checkpoints the course, rebuilds generated courses when needed, validates the result, and can undo the last batch.
- **Protect newer work:** An atomic complete-owner filesystem lock coordinates Studio processes, fingerprint-aware recovery preserves unknown external bytes, terminal journals make cleanup retry-safe, and Undo refuses after later drift.
- **Validate the learner result:** Every successful batch is loaded in an isolated browser after bounded local settlement and checked for the requested rendered result plus edited-target visibility, image decoding/alt-text, control-name, heading, and contrast heuristics. This is not a full WCAG or delayed-interaction runtime audit.
- **Use teacher-friendly tools:** Rich text, selected-text links, visual comparisons, persistent draft backups, safe image upload, and a dedicated multi-surface Rename course workflow replace raw HTML and URL-only editing.
- **Trust export status:** Freshness is tied to the target-specific manifest/metadata/workspace/exporter input graph and actual artifact bytes, with separate SCORM 1.2 and SCORM 2004 evidence.
- **Keep ownership clear:** Every edit is course-only; unsupported or unmapped content stays annotation-only, and existing exports are marked out of date until republished.
- **Start new Codex courses ready:** `npm run course:create` creates a validated Direct project that appears in an already-open Studio with its visual Edit map enabled.
- **Bring the source-backed catalog forward:** transactional onboarding classified all 66 project directories in a clean GitHub checkout; 63 active source-backed projects are explicitly Studio-enabled, one remains blocked, one remains reference-only, and one tracked package-only archive is accounted for without treating exports as source. Eighteen local-only package directories found during the first working-copy inventory are explicitly excluded from GitHub evidence.
- **Keep Studio responsive across the repository:** Course-page discovery starts from declared entrypoints, ignores duplicate copied resource trees, and uses a bounded fallback scan so one accidental archive cannot freeze the picker.

## Safety boundary

Edit mode is enabled only when `course:doctor` passes and the manifest explicitly enables a supported Direct, English factory, Social factory, or preserved legacy-snapshot adapter. Unclassified inferred projects are `not-onboarded`; package-only directories remain non-authorable. The preview sends an opaque target identity and an approved operation; it never chooses a filesystem path. Before applying, the server preflights each draft, safely rebases only unchanged selected elements, sanitizes delta-only changes, acquires the cross-process lock, creates a durable journal and complete checkpoint, updates the canonical course input, and performs the bounded rebuild or snapshot materialization when required. Static verification and a real learner render must both pass. Any failure restores the previous state, and Undo refuses if the applied boundary later drifts.

The reversible acceptance command `npm run verify:course-editing-pilots` covers one real Direct course, one real English factory course, one real Social factory course, and one real preserved legacy snapshot. Each temporary edit must survive its applicable rebuild or materialization, learner render, reload, and HTTP server restart before route-level Undo restores the complete boundary byte-for-byte.

The catalog acceptance command `npm run verify:course-onboarding -- --all` passed 63/63 explicitly enabled projects. Fifty completed a reversible rendered text pilot; twelve correctly exposed no source-owned text target; Aboriginal Studies 30 exposed no learner-stable sampled text target after six safely restored runtime/contrast rejections. See `docs/audits/2026-08-13-course-catalog-onboarding.md` for the complete outcome.

New JavaScript activities, assessment logic, navigation redesigns, arbitrary HTML/CSS, complex section moves, family-wide changes, and publishing remain Codex or explicit export workflows. Annotate and Review Set remain available as a separate workflow for those changes.

The lock coordinates Canvas Helper writers that participate in its protocol. A non-cooperating writer in a Direct adapter's final source-read-to-atomic-rename interval remains unsupported because the current Node filesystem APIs provide no portable conditional replace. Do not run manual, Codex, Git, or standalone builder writes concurrently with Apply.

## Release gate

Run `npm run test:studio-release`. The command uses only installed repository tools, allocates a fresh loopback port, refuses an occupied requested port, disables Playwright `test.only`, runs the focused contracts, production build, complete Studio inspection and direct-edit E2E, platform smoke, and strict neutral project contract in order, and stops on the first failure.

It writes the ignored machine-readable result to `.runtime/studio-release-report.json`, including branch, commit, bounded directory-level dirty-tree status, an exact Studio source fingerprint, runtime/tool versions, commands, timing, exit codes, and test counts. A source change during the run fails the gate.
