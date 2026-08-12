# Canvas Studio 2026.08 — Safe course editing

Released August 12, 2026.

Eligible courses can now collect, review, apply, and undo routine teacher changes directly in Studio or Full Preview.

## What’s new

- **Edit the course in place:** Change supported text, links, images, alt text, captions, and curated visual styles without leaving Studio.
- **Review before applying:** Draft Changes persist per course across Studio and Full Preview and can be edited, removed, reordered, and compared before one batch is applied.
- **Apply safely and undo:** Studio rechecks targets, checkpoints the course, rebuilds generated courses when needed, validates the result, and can undo the last batch.
- **Keep ownership clear:** Every edit is course-only; unsupported or unmapped content stays annotation-only, and existing exports are marked out of date until republished.
- **Keep Studio responsive across the repository:** Course-page discovery starts from declared entrypoints, ignores duplicate copied resource trees, and uses a bounded fallback scan so one accidental archive cannot freeze the picker.

## Safety boundary

Edit mode is enabled only when `course:doctor` passes and the project resolves to a supported direct, English factory, or explicitly onboarded Social adapter. The preview sends an opaque target identity and an approved operation; it never chooses a filesystem path. Before applying, the server re-resolves every target, rejects stale source digests, sanitizes rich text and URLs, creates a recoverable local checkpoint, updates the canonical course input, performs the bounded rebuild when required, and runs focused validation. Any failure restores the previous state.

New JavaScript activities, assessment logic, navigation redesigns, arbitrary HTML/CSS, complex section moves, family-wide changes, and publishing remain Codex or explicit export workflows. Annotate and Review Set remain available as a separate workflow for those changes.

## Release gate

Run `npm run test:studio-release`. The command uses only installed repository tools, allocates a fresh loopback port, refuses an occupied requested port, disables Playwright `test.only`, runs the focused contracts, production build, complete Studio inspection and direct-edit E2E, platform smoke, and strict neutral project contract in order, and stops on the first failure.

It writes the ignored machine-readable result to `.runtime/studio-release-report.json`, including branch, commit, bounded directory-level dirty-tree status, an exact Studio source fingerprint, runtime/tool versions, commands, timing, exit codes, and test counts. A source change during the run fails the gate.
