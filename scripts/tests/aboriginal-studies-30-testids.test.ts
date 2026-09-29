/**
 * AB30 DOM test-contract suite — R01 (v2 package DOM_TEST_CONTRACT.json).
 *
 * Proves the R01 test-ID attributes exist on the REAL shell HTML and the REAL
 * renderer output (executed in a vm seam, not string-matched from source).
 * Browser acceptance itself is NOT_RUN in this sandbox (Chrome cannot render
 * here); these are the static/structural preconditions for the Playwright
 * starter `tests/critical-paths.spec.cjs` (58 tests, --list verified).
 *
 * Pending-contract IDs (no production control exists yet; owned by later
 * tickets, asserted ABSENT here so silent drift is visible):
 * - save-first-response/comparison-toggle/revision-draft (R03 lifecycle),
 * - save-status announcer keeps id save-status-announcer (R03 names task-save-status),
 * - export-all-work (R29).
 *
 * R08-owned IDs (per-lesson guide, source disclosure, answerable supported
 * task) are asserted PRESENT in R08-TESTID06 from real renderer output.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const componentsPath = path.resolve(workspaceDir, "lesson-components.js");
const indexPath = path.resolve(workspaceDir, "index.html");

const mainSource = readFileSync(mainPath, "utf8");

function sliceTopLevel(kind: "const" | "function" | "let", name: string): string {
  const anchor = kind === "function" ? `function ${name}(` : `${kind} ${name} =`;
  const start = mainSource.indexOf(anchor);
  assert.ok(start >= 0, `seam "${name}" missing (production drift?)`);
  const lineStart = mainSource.lastIndexOf("\n", start) + 1;
  const boundary = /^(?:function|const|let|var) [A-Za-z_$][\w$]*/gm;
  boundary.lastIndex = start + anchor.length;
  const next = boundary.exec(mainSource);
  return (next ? mainSource.slice(lineStart, next.index) : mainSource.slice(lineStart)).trim();
}

const SLICE_CONSTS = ["units", "assignments", "BOOKLET_SHELL_ASSIGNMENT_IDS"];
const SLICE_FUNCTIONS = [
  "escapeHtml",
  "getUnitIndex",
  "completedUnitSet",
  "isUnitUnlocked",
  "isUnitComplete",
  "lessonRouteHref",
  "renderThemeSubnav",
];

function testIdOf(html: string, id: string): number {
  return (html.match(new RegExp(`data-testid="${id}"`, "g")) || []).length;
}

test("R01-TESTID01: shell exposes the DOM-contract test IDs", () => {
  const html = readFileSync(indexPath, "utf8");
  for (const id of [
    "course-header", "course-menu-toggle", "course-logo", "course-progress",
    "course-sidebar", "nav-overview", "nav-practice", "nav-all-my-work", "course-main",
  ]) {
    assert.equal(testIdOf(html, id), 1, `shell has exactly one ${id}`);
  }
});

test("R01-TESTID02: subnav lesson links carry stable IDs; active link is named", () => {
  const dataContext = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: unknown } };
  vm.createContext(dataContext);
  vm.runInContext(readFileSync(dataPath, "utf8"), dataContext, { filename: "course-data.js" });
  const subnavEl = { innerHTML: "", querySelectorAll: () => [] as unknown[] };
  const context = {
    DATA: JSON.parse(JSON.stringify(dataContext.window.ABORIGINAL_STUDIES_30_DATA)),
    refs: { themeSubnav: subnavEl },
    reviewUnlockAll: true,
    progress: { completedUnits: [], completedAssignments: [] },
    state: { section: "lesson", activeUnitId: "theme-2", activeLessonId: "t2-l05-land-values", themeTab: "lessons" },
    console, URL, URLSearchParams,
  } as Record<string, unknown>;
  vm.createContext(context);
  const script = [
    ...SLICE_CONSTS.map((n) => sliceTopLevel("const", n)),
    ...SLICE_FUNCTIONS.map((n) => sliceTopLevel("function", n)),
    "globalThis.__html = (renderThemeSubnav(), refs.themeSubnav.innerHTML);",
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-testid-seam.js" });
  const html = String((context as { __html: string }).__html);
  assert.ok(html.includes('data-testid="lesson-nav-t2-l01-'), "inactive lessons keep lesson-nav-<id>");
  assert.equal(testIdOf(html, "active-lesson-link"), 1, "exactly one active-lesson-link");
  assert.ok(
    html.includes('data-lesson-link="theme-2::t2-l05-land-values"') && html.includes('aria-current="page"'),
    "active link keeps lesson identity + aria-current"
  );
  assert.ok(!html.includes('data-testid="lesson-nav-t2-l05-land-values"'), "active link swaps to the named active ID");
});

test("R01-TESTID03: lesson article, heading, goal, prose, source, task hooks exist", () => {
  const context = { window: {} as Record<string, unknown> };
  vm.createContext(context);
  vm.runInContext(readFileSync(componentsPath, "utf8"), context, { filename: "lesson-components.js" });
  const api = (context.window as any).AB30LessonBlocks as any;
  assert.ok(api, "AB30LessonBlocks global exposed");
  const goal = api.renderGoalStrip({ goal: "G", prerequisite: "P", essentialQuestion: "Q" });
  assert.ok(goal.includes('data-testid="learning-goal"'), "goal strip hook");
  assert.ok(goal.includes('data-testid="before-you-begin"'), "prerequisite hook");
  const ctx = { formativeResponse: () => "saved draft" };
  const prose = api.renderBlock({ type: "explanation", heading: "H", paragraphs: ["p"] }, 0, ctx);
  assert.ok(prose.includes('data-testid="lesson-prose"'), "explanation hook");
  const source = api.renderBlock({ type: "source", extract: "E", speaker: "S" }, 1, ctx);
  assert.ok(source.includes('data-testid="source-card"'), "source card hook");
  const supported = api.renderBlock({ type: "supportedPractice", title: "T", task: "do", feedback: "fb" }, 2, ctx);
  assert.ok(supported.includes('data-testid="supported-task"'), "supported task hook");
  const independent = api.renderBlock(
    { type: "independentTask", title: "T", task: "do", responseKey: "k", criteria: "C" }, 3, ctx);
  assert.ok(independent.includes('data-testid="independent-task"'), "independent task hook");
  assert.ok(independent.includes('data-testid="independent-draft"'), "draft hook");
  assert.ok(independent.includes('data-testid="save-first-response"'), "first-save hook when unsubmitted");
  assert.ok(independent.includes("task-criteria-locked"), "criteria locked before first save (R03: draft presence no longer unlocks)");
  assert.ok(!independent.includes('data-testid="comparison-criteria"'), "no criteria body before first save");
  assert.ok(independent.includes('data-testid="task-save-status"'), "per-section status hook");
});

test("R03-TESTID05: submitted state freezes first, unlocks toggle, offers revision", () => {
  const context = { window: {} as Record<string, unknown> };
  vm.createContext(context);
  vm.runInContext(readFileSync(componentsPath, "utf8"), context, { filename: "lesson-components.js" });
  const api = (context.window as any).AB30LessonBlocks as any;
  const block = { type: "independentTask", title: "T", task: "do", responseKey: "k",
    contentVersion: "v2", criteria: "CRITERIA-TEXT" };
  const first = { id: "sub:1", text: "FIRST-TEXT", parentAttemptId: null };
  const submittedCtx = {
    formativeResponse: () => "draft text",
    submissionsForTask: (key: string) => (key === "k" ? [first,
      { id: "sub:2", text: "REVISION-TEXT", parentAttemptId: "sub:1" }] : []),
  };
  const html = api.renderBlock(block, 3, submittedCtx);
  assert.ok(html.includes('data-task-id="k"'), "task identity on section");
  assert.ok(html.includes('data-content-version="v2"'), "content version on section");
  assert.ok(html.includes('data-testid="first-submission-text"'), "frozen first hook");
  assert.ok(html.includes("FIRST-TEXT"), "frozen first text rendered");
  assert.ok(!html.includes('data-testid="save-first-response"'), "save-first gone after submit");
  assert.ok(html.includes('data-testid="comparison-toggle"'), "comparison toggle hook");
  assert.ok(html.includes('data-testid="comparison-criteria"'), "criteria body hook");
  assert.ok(html.includes("CRITERIA-TEXT"), "criteria text rendered");
  assert.ok(html.includes('data-testid="revision-draft"'), "revision draft hook");
  assert.ok(html.includes('data-testid="save-revision"'), "save revision hook");
  assert.ok(html.includes('data-testid="latest-revision-text"'), "revision display hook");
  assert.ok(html.includes("REVISION-TEXT"), "revision text rendered");
});

test("R01-TESTID04: future-contract IDs are absent (pending, not silently present)", () => {
  const html = readFileSync(indexPath, "utf8");
  const combined = html + "\n" + mainSource + "\n" + readFileSync(componentsPath, "utf8");
  for (const id of ["export-all-work"]) {
    assert.ok(!combined.includes(`data-testid="${id}"`), `${id} pending its owning ticket`);
  }
});

test("R08-TESTID06: guide, disclosure, and answerable-task hooks exist", () => {
  const context = { window: {} as Record<string, unknown> };
  vm.createContext(context);
  vm.runInContext(readFileSync(componentsPath, "utf8"), context, { filename: "lesson-components.js" });
  const api = (context.window as any).AB30LessonBlocks as any;
  const source = api.renderBlock({
    type: "source", extract: "SYNTH extract.", speaker: "SYNTH Speaker",
    sourceType: "SYNTH type", locator: "SYNTH p. 1", attribution: "SYNTH archive",
  }, 0, {});
  assert.ok(source.includes('data-testid="source-details"'), "disclosure hook on the details element");
  const selection = api.renderBlock({
    type: "supportedSelection", itemId: "SYNTH-item", prompt: "SYNTH prompt?",
    options: [
      { id: "a", text: "SYNTH A." },
      { id: "b", text: "SYNTH B." },
      { id: "c", text: "SYNTH C." },
    ],
    key: "b",
    feedbackByOption: { a: "SYNTH fa.", b: "SYNTH fb.", c: "SYNTH fc." },
  }, 1, {});
  for (const id of ["supported-choice-a", "supported-choice-b", "supported-choice-c"]) {
    assert.ok(selection.includes(`data-testid="${id}"`), `${id} on its radio`);
  }
  assert.ok(selection.includes('data-testid="supported-check"'), "check hook on the button");
  assert.ok(selection.includes('data-testid="supported-feedback"'), "feedback region hook");
  assert.ok(selection.includes('data-supported-item="SYNTH-item"'), "bank item pinned on the section");
  // The per-lesson guide hook lives in main.js template markup (executed by
  // the article renderer, pinned end to end in the lesson07 suite).
  assert.ok(
    mainSource.includes('<details class="page-guide lesson-guide" data-testid="lesson-guide">'),
    "lesson-guide hook on the guide disclosure"
  );
});
