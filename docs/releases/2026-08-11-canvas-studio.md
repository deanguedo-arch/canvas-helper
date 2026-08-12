# Canvas Studio 2026.08 — Precision review workflow

Released August 11, 2026.

Canvas Studio now provides a faster, steadier way to inspect any course, collect visual feedback, and hand one verified review to Codex.

## What’s new

- **Annotate in place:** Select course content with a pointer or keyboard, add a plain-language note, and keep up to three marked screenshots with it.
- **Keep the review together:** Review Sets stay with each course, survive Studio and Full Preview changes, and can be named, reorganized, exported, or restored.
- **Recover instead of guessing:** Blank, delayed, or unsupported pages show a useful recovery path instead of appearing to work.
- **Move with confidence:** Keyboard focus, narrow windows, large pages, and screenshot work share explicit accessibility and performance checks.

The matching in-product view is generated from `app/studio/src/lib/studio-release-notes.ts`; a focused contract test keeps these headings aligned.

## Release gate

Run `npm run test:studio-release`. The command uses only installed repository tools, allocates a fresh loopback port, refuses an occupied requested port, disables Playwright `test.only`, runs the focused contracts, production build, complete Studio inspection E2E, platform smoke, and strict neutral project contract in order, and stops on the first failure.

It writes the ignored machine-readable result to `.runtime/studio-release-report.json`, including branch, commit, dirty-tree status, an exact Studio source fingerprint, runtime/tool versions, commands, timing, exit codes, and test counts. A source change during the run fails the gate.
