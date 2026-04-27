# Single HTML Standalone Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the shared single-HTML exporter so complex workspace runtimes with local iframe pages, runtime-fetched HTML/JS, and JS-held asset paths export as one self-contained HTML file.

**Architecture:** Extend the shared single-HTML build path into a recursive standalone bundler. Local HTML documents should be converted into fully inlined standalone HTML and then embedded as `data:` URLs when referenced from iframes or JS strings. Local JS string literals that resolve to real workspace files should be rewritten to inlined `data:` URLs so runtime `fetch()` and dynamic script loading still work after export.

**Tech Stack:** TypeScript, Node.js, Cheerio, existing export helpers in `scripts/lib/exports/shared.ts`

---

### Task 1: Add regression tests for recursive single-HTML bundling

**Files:**
- Create: `scripts/tests/single-html-export.test.ts`
- Modify: none
- Test: `scripts/tests/single-html-export.test.ts`

**Step 1: Write the failing test**

- Add a fixture-style test that creates a temporary workspace with:
  - `index.html` referencing local CSS and JS
  - a local iframe HTML page
  - a runtime-loaded HTML file fetched from JS
  - a runtime-loaded JS file appended with `script.src`
  - a local image or PDF path stored in JS
- Assert `buildSingleHtmlOutput(...)` returns HTML that:
  - no longer contains raw local refs like `./child.html`, `./runtime.html`, `./runtime.js`
  - does contain `data:text/html`, `data:text/javascript`, and `data:image` or `data:application`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/single-html-export.test.ts`
Expected: FAIL because the current bundler does not rewrite nested HTML or JS-held local asset paths.

**Step 3: Write minimal implementation**

- Extend the shared export helper to support:
  - recursive standalone HTML document building
  - local iframe `src` rewriting
  - JS string literal rewriting for local workspace files

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/single-html-export.test.ts`
Expected: PASS

### Task 2: Upgrade the shared single-HTML bundler

**Files:**
- Modify: `scripts/lib/exports/shared.ts`
- Modify: `scripts/lib/exports/single-html.ts`
- Test: `scripts/tests/single-html-export.test.ts`

**Step 1: Implement recursive document bundling**

- Refactor `buildSingleHtmlOutput(...)` to use a recursive helper that can:
  - inline local stylesheets and scripts for any HTML file
  - inline local HTML iframe targets as `data:text/html`
  - preserve external URLs untouched

**Step 2: Implement JS string literal asset rewriting**

- Add a helper that scans JS text for quoted local paths.
- Only rewrite values that resolve to actual files inside the workspace.
- Convert:
  - local HTML to recursively bundled `data:text/html`
  - local JS to `data:text/javascript`
  - local assets like images, PDFs, and other files to standard `data:` URIs

**Step 3: Expand direct HTML asset coverage**

- Add support for inlining local `iframe[src]` and any other low-risk embedded file refs needed by the fixture.

**Step 4: Run tests**

Run: `npx tsx --test scripts/tests/single-html-export.test.ts`
Expected: PASS

### Task 3: Verify the real sportswellness export

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Modify: `docs/ops/ARCHIVED_HANDOFFS.md`
- Optional docs if behavior changes materially: `ARCHITECTURE.md`

**Step 1: Export sportswellness as single HTML**

Run: `npm.cmd run export:html -- --project sportswellness`
Expected: PASS with an output file under `projects/sportswellness/exports/single-html/`

**Step 2: Inspect exported output for old broken refs**

Run: `rg -n "\./performance/|\./assignment-runtime|viewerSrc|ASSIGNMENT_RUNTIME_HTML_SRC" projects/sportswellness/exports/single-html/sportswellness.html`
Expected: no remaining local runtime refs for those exported dependencies

**Step 3: Re-run the closest existing export/shell checks**

Run: `npx tsx --test scripts/tests/sportswellness-ui-state.test.ts`
Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`
Run: `npm.cmd run test:e2e:project -- --project sportswellness`
Expected: PASS

**Step 4: Record the known unrelated failure**

Run: `npx tsx --test scripts/tests/sportswellness-phase3-content.test.ts`
Expected: still FAIL on the existing `Multiple-choice review` expectation unless separately fixed
