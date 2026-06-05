# Handoff

- Project: `finlit101-money-basics`
- Task: Wire Money Basics into separate course pages with lesson subpages, Readings viewer, Quizzes assessment page, Extra Resources placeholder, and collapsible sidebar.
- Status: `Fixed and browser/behavior-verified`

## Summary
The Money Basics shell now treats Introduction, Lessons, Quizzes, Readings, and Extra Resources as separate routed pages instead of one long intro page. Lessons houses two selectable sublesson pages. Readings uses an Aboriginal Studies 30-style selector/viewer pattern adapted to the Money Basics green/white/dark design. Quizzes uses a full assessment-style page with quiz selection, status/submitted metadata, final evaluation counter, action buttons, section breakdown, and question cards. Extra Resources is wired as its own folder page with placeholder folders for future files.

Preview:
`http://127.0.0.1:5174/preview/workspace/finlit101-money-basics/index.html?rev=1780625062009#quizzes`

## Files changed
- `projects/finlit101-money-basics/workspace/index.html`
- `docs/ops/ACTIVE_HANDOFF.md`
- `.stax/codex-report.md`
- `.stax/status.json`
- `.stax/next-codex-prompt.md`
- `.stax/proof_strength.json`
- `.stax/reports/latest-proof-report.md`
- `.stax/reports/latest-confidence-report.md`
- `.stax/visual-proofs/visual_2026-06-05T02_04_45_994Z_72fe2d9f763d.png`
- `.stax/visual-proofs/manifest.json`

## Verification run
- `npm run verify -- --project finlit101-money-basics --mode workspace`
  - exit 0
  - metadata policy passed
  - no missing local assets
  - no missing workspace embeds
  - known warnings remain for external Tailwind, fonts, icons, remote images, and remote PDF/article links
- Playwright routed-page interaction check
  - exit 0
  - `#lesson-characteristics` opens the Lessons page and selects the 1.2 lesson panel
  - sidebar collapse toggles successfully
  - `#readings` opens as its own page with 3 readings
  - selecting the Beavers to Bears article switches from PDF viewer to text preview
  - `#quizzes` opens as its own page; answering Q1, checking answers, and marking complete updates the counter to `1/4`
  - selecting Quiz 2 renders `Quiz 2: Characteristics of Money` with 4 question cards
  - `#resources` opens as its own page with Worksheets, Glossary, and External Tools folders
  - screenshot saved to `/tmp/finlit101-routed-pages.png`
- In-app browser refresh
  - refreshed to `#quizzes`
  - DOM assertions confirmed visible page `quizzes`, 4 quiz questions, 2 lesson panels, 3 readings, and `#resources` route
- STAX visual proof
  - `visual_2026-06-05T02_04_45_994Z_72fe2d9f763d`
- `npm run test:e2e:smoke`
  - exit 0
  - 1 Playwright smoke test passed
- STAX observer preflight from `/Users/deanguedo/Documents/GitHub/STAX`
  - exit 0 in observer mode
  - recorded a non-blocking Reject because the repo-level approval artifact is missing and the STAX task still references an older `ai-course-building-resources` objective

## Known risks / follow-up
- The two lessons, two quizzes, and three readings are starter/sample content rather than imported final course banks.
- Extra Resources is wired structurally, but the actual resource files are not loaded yet.
- Quiz state is in-page/session-only and does not persist.
- Mobile was covered by responsive structure and desktop browser proof, but not a deep device matrix pass.
- STAX status remains noisy because the sidecar task text is stale relative to the current FinLit work.

## Source-of-truth location
- `projects/finlit101-money-basics/workspace/index.html`

## Fragile areas / what might drift
- Hash routes: `#introduction`, `#lessons`, `#lesson-what-is-money`, `#lesson-characteristics`, `#quizzes`, `#readings`, and `#resources`.
- Remote dependencies: Tailwind CDN, Google fonts/icons, Google image asset, Bank of Canada PDF, and external article URL.
- Future imports may need quiz and reading data moved out of inline JavaScript once the course standard stabilizes.

## Next prompt assumptions
- Continue iterating visually on `finlit101-money-basics` as the first standard for the course.
- Keep changes inside `projects/finlit101-money-basics/**` unless asked otherwise.
- Preserve the current dark sidebar, centered top logo, white content canvas, and green accent system.

## Exact next command
`npm run verify -- --project finlit101-money-basics --mode workspace`

## Exact next file to open
`projects/finlit101-money-basics/workspace/index.html`
