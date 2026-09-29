# Ticket T07 completion record

Status: IMPLEMENTED (queue reviewGate: no extra approval beyond the master contract)
Baseline commit/source hashes: dirty overlay continues from the T06 record; this ticket edits workspace/main.js (route core, navigation, lesson render, subnav, dialog-close extract, bindings), workspace/styles.css (scoped lesson-map/pager/nav-group rules), and adds scripts/tests/aboriginal-studies-30-route.test.ts. git diff --check clean on all touched paths.
Dirty-overlay/diff digest: cumulative working-tree overlay covers T01–T07 (uncommitted by contract). No Biology/Chemistry/brand files touched. No lesson/prompt/assessment content touched. index.html untouched (no static-shell change needed; nav renders from main.js).
Writer/approved scope: main.js routing/rendering; index.html nav (no change required); scoped styles.css (queue allowedScope). No teacher/lead gate in this ticket.

## Changed files and actual changes

- workspace/main.js:
  - Pure route core: `parseRouteFromSearch` (same precedence/semantics as the old init block, plus validated `lesson`), `resolveLessonRoute` (membership-validated, safe fallbacks, never throws), `lessonNeighbors` (array order), `anchorToLessonRoute` (`#lesson-<id>` alias), `lessonRouteHref`, `routeToSearch` (unknown host params preserved), `previewRouteUrl` (pure Studio-URL builder incl. lesson), `applyRouteToState`, `pushRouteState` (guarded), `applyRouteFromUrl` (init + popstate entry; replaces the old inline init block).
  - Navigation: `setActiveLesson` (validate → state → persist resume via ui save → push → render → focus; fallback path on bad routes), `gotoLesson` now routes instead of scrolling (same signature; existing callers unchanged), `focusLessonHeading` (guarded scroll + heading focus), pushState added to `setSection`/`setActiveUnit`, popstate listener (re-parse + render, never blanks the page). Other setters (library/assignment/film) unchanged.
  - Render: `renderLessonArticle` extracted verbatim from renderThemeLessons plus the `tabindex`/`data-lesson-heading` focus hook; `renderThemeLessons` is now the overview map (guide + deep-linkable lesson links); new `renderLesson` mounts exactly one article + prev/next pager (array order; overview links at boundaries) + back-to-overview; dispatch added to `render()`; invalid lesson state falls back to unit overview/home inside `renderLesson`.
  - `renderThemeSubnav`: per-theme lesson group for the active unit (expanded on lesson routes), current lesson link carries `aria-current="page"` (exactly one), unit button keeps active state. Lesson links use real hrefs + one delegated `[data-lesson-link]` handler (preventDefault + SPA nav; hrefs work without JS).
  - Dialog: extracted `handleDialogClose` (same body as the old anonymous close handler; `closeCourseDialog` delegates to it — idempotent, no behavior change). Native-Esc→close→focus chain preserved.
- workspace/styles.css: `.lesson-map`, `.lesson-map-link`, `.lesson-map-kicker`, `.lesson-pager`, `.lesson-nav-group`, `.nav-lesson-link` rules only; no redline/banned-pattern contact (shell suite green).
- scripts/tests/aboriginal-studies-30-route.test.ts (new): own vm seam (adapter + ~90 production slices + focus/dialog/body stubs). ROUTE01 (lesson URL parses; full setActiveLesson→render mounts exactly one article, sibling absent, pager + focus hook; old unit/assignment/library/film/home/quizzes URLs parse to regression literals), ROUTE02 (anchor map + malformed anchors null; mismatch/unknown fallbacks; query-level fallback; fallback renders keep saved work), ROUTE03 (t2-l05 array neighbors l01/l02 against numeric l04/l06; all 50 lessons array-adjacent; boundaries null; unknown null), ROUTE04-partial (host params preserved, stale route params replaced), ROUTE05-partial (open→close restores opener focus; close-event path identical), ROUTE06 (all 50 articles: per-article DOM-id uniqueness + every radio name equals its saved key), ROUTE07-partial (exactly one aria-current on the active lesson; active group expanded), ROUTE08-partial (preview URL syncs lesson routes, preserves host params, in-sync untouched, lesson param dropped off-route).

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-route.test.ts`: 8/8 pass. Log: meta/ab30-parity/T07-run.log.
- Regression battery same session: parity 22/22, state 18/18, source 10/10 (58/58 with route), shell file-scope 10/10.
- `node --check` main.js: SYNTAX_OK. `npx tsc --noEmit`: ZERO errors in touched files.
- Caught and fixed during T07: (1) vm seam needed host URL/URLSearchParams globals (platform-global precedent, not app mocks); (2) vm-realm returns need JSON normalization before strict deepEqual (parity-DATA precedent); (3) only theme-1 has a theme activity — test helper mirrors production's null-tolerant getUnitActivity (themes 2–4 lessons render question-free exactly as production does).

## Learner-work impact

Navigation-only: no keys, IDs, answers, flags, locks, or completion semantics changed. Old unit/assignment/library/film URLs and `#lesson-` anchors keep working (ROUTE01 regression literals + ROUTE02). Fallbacks touch ui state only; responses provably survive bad routes (ROUTE02).

## Content/source review

No content touched. novel-4-3-activation and outcomes-mapping holds carried forward. Sidebar scroll persists by construction (sidebar shell is static; lesson nav never re-renders it). No new locks (lock code untouched; reviewUnlockAll path preserved).

## Not run / failed / blocked

- Real Back/Forward button + reload (ROUTE04), native Escape delivery + real focus (ROUTE05), mobile sidebar (ROUTE07), live Studio preview/editing (ROUTE08): NOT RUN — no browser in this sandbox. Proven instead: URL builders/parsers, full render path through stubs, close→focus path, subnav markup, preview URL builder. Browser proofs stay with T23/T24; practice views with T09 (do not exist yet).
- npx tsx --test: same environmental EPERM; lead/CI verification needed (expect route 8/8, parity 22/22, state 18/18, source 10/10, shell 11/11).
- Nothing failed; nothing blocked.

## Next safe step

T08 (structured teaching blocks, gates CONTENT01–CONTENT04 + UI01–UI05) is next in queue order and needs a human prose review plus the learning-contract block work — larger than T05–T07. Per the contract the writer stops at ticket boundaries: LEAD confirms this record, then authorizes T08.
