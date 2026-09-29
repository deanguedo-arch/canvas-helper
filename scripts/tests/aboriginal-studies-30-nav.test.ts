/**
 * AB30 navigation/mobile/keyboard regression suite — R06.
 *
 * Guards the finished lesson navigation: stable query routes, display-order
 * eyebrows, active-link visibility without a nested scroll region, two-row
 * mobile header on a measured offset, menu Escape/focus/scrim wiring,
 * print exclusions, and draft-safe navigation. Structural + seam
 * preconditions only — the real keyboard/Back/Forward/resize path needs a
 * browser and is NOT_RUN in this sandbox (see R06 limitations).
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
const stylesPath = path.resolve(workspaceDir, "styles.css");
const indexPath = path.resolve(workspaceDir, "index.html");

const mainSource = readFileSync(mainPath, "utf8");
const stylesSource = readFileSync(stylesPath, "utf8");
const indexSource = readFileSync(indexPath, "utf8");

function sliceTopLevel(source: string, kind: "const" | "function", name: string): string {
  const anchor = kind === "function" ? `function ${name}(` : `${kind} ${name} =`;
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, `seam "${name}" missing (production drift?)`);
  const lineStart = source.lastIndexOf("\n", start) + 1;
  const boundary = /^(?:function|const|let|var) [A-Za-z_$][\w$]*/gm;
  boundary.lastIndex = start + anchor.length;
  const next = boundary.exec(source);
  const slice = (next ? source.slice(lineStart, next.index) : source.slice(lineStart)).trim();
  new vm.Script(slice, { filename: `seam-${name}.js` });
  return slice;
}

function buildArticleRuntime(): {
  renderLessonArticle: (activity: unknown, lesson: unknown, index: number) => string;
  getUnitActivity: (unitId: string) => unknown;
  lessonEyebrow: (lesson: unknown) => string;
  units: Array<{ id: string; lessons: Array<Record<string, unknown>> }>;
} {
  const dataContext = { window: {} as Record<string, unknown> };
  vm.createContext(dataContext);
  vm.runInContext(readFileSync(dataPath, "utf8"), dataContext, { filename: "course-data.js" });
  const DATA = JSON.parse(JSON.stringify(dataContext.window.ABORIGINAL_STUDIES_30_DATA)) as {
    units: Array<{ id: string; lessons: Array<Record<string, unknown>> }>;
  };
  const context = { DATA, window: {} as Record<string, unknown>, console, URL, URLSearchParams } as Record<
    string,
    unknown
  >;
  vm.createContext(context);
  vm.runInContext(readFileSync(componentsPath, "utf8"), context, { filename: "lesson-components.js" });
  context.AB30LessonBlocks = (context.window as Record<string, unknown>).AB30LessonBlocks;
  const consts = [
    "units", "assignments", "coreVocabulary", "themeActivities",
    "ASSIGNMENT_PROMPT_LESSONS", "LESSON_DRAFTS", "REQUIREMENT_ROLE_OVERRIDES", "BOOKLET_SHELL_ASSIGNMENT_IDS",
  ];
  const fns = [
    "lessonContentVersion", "isV2Lesson", "storeAvailable", "lessonBlocksApi",
    "renderV2GoalStrip", "renderV2Blocks", "renderLessonGuide", "lessonEyebrow", "renderLessonArticle",
    "getUnitActivity", "lessonStartPage", "linkLessonTerms", "findVocabularyTerm", "escapeRegExp",
    "promptsForLesson", "renderLessonQuestions", "renderAssignmentDrafts", "activityResponseKey",
    "promptFieldKey", "tableFieldId", "tableFieldLabel", "escapeHtml", "toEmbedUrl", "renderConsentEmbed",
    "readCourseResponse", "renderActivityPromptLabel", "renderActivityPromptResources",
    "renderFillBlankPrompt", "renderMultipleChoicePrompt", "renderTablePrompt", "renderActivityPrompt",
    "conflictOriginLabel", "storeConflictsForKeys", "renderConflictPanelsForKeys",
    "roleForRequirement", "isKnownLegacyRequirement", "requirementItems", "requirementDenominator",
  ];
  const script = [
    ...consts.map((n) => sliceTopLevel(mainSource, "const", n)),
    ...fns.map((n) => sliceTopLevel(mainSource, "function", n)),
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-nav-seam.js" });
  const seam = context as unknown as Record<string, (...args: never[]) => never>;
  return {
    renderLessonArticle: seam.renderLessonArticle as unknown as (
      activity: unknown, lesson: unknown, index: number) => string,
    getUnitActivity: seam.getUnitActivity as unknown as (unitId: string) => unknown,
    lessonEyebrow: seam.lessonEyebrow as unknown as (lesson: unknown) => string,
    units: DATA.units,
  };
}

test("R06-NAV01: all 50 lesson routes render exactly one article with unique DOM ids", () => {
  const { renderLessonArticle, getUnitActivity, units } = buildArticleRuntime();
  let count = 0;
  for (const unit of units) {
    unit.lessons.forEach((lesson, index) => {
      const html = renderLessonArticle(getUnitActivity(unit.id), lesson, index);
      count += 1;
      assert.equal((html.match(/<article/g) || []).length, 1, `${lesson.id}: exactly one article`);
      const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(new Set(ids).size, ids.length, `${lesson.id}: unique DOM ids`);
      assert.ok(
        html.includes(`data-lesson-id="${lesson.id}"`),
        `${lesson.id}: article carries its lesson identity`
      );
    });
  }
  assert.equal(count, 50, "all 50 lessons covered");
});

test("R06-NAV02: eyebrows follow display order, never ID suffixes", () => {
  const { lessonEyebrow, units } = buildArticleRuntime();
  assert.equal(
    lessonEyebrow({ id: "t1-l07-numbered-treaties" }),
    "Learn · Theme 1 · Lesson 7 of 23"
  );
  const theme2 = units.find((u) => u.id === "theme-2") as { lessons: Array<Record<string, unknown>> };
  const last = theme2.lessons[theme2.lessons.length - 1];
  assert.equal(
    lessonEyebrow({ id: last.id }),
    `Learn · Theme 2 · Lesson ${theme2.lessons.length} of ${theme2.lessons.length}`
  );
  assert.equal(lessonEyebrow({ id: "nope-missing", kicker: "Block X · Custom" }), "Block X · Custom");
  assert.equal(lessonEyebrow({}), "");
});

test("R06-NAV03: sidebar shows individual lessons for the active unit, one aria-current", () => {
  const dataContext = { window: {} as Record<string, unknown> };
  vm.createContext(dataContext);
  vm.runInContext(readFileSync(dataPath, "utf8"), dataContext, { filename: "course-data.js" });
  const runSection = (section: string, unitId: string | null, lessonId: string | null): string => {
    const subnavEl = { innerHTML: "", querySelectorAll: () => [] as unknown[] };
    const context = {
      DATA: JSON.parse(JSON.stringify(dataContext.window.ABORIGINAL_STUDIES_30_DATA)),
      refs: { themeSubnav: subnavEl },
      reviewUnlockAll: true,
      progress: { completedUnits: [], completedAssignments: [] },
      state: { section, activeUnitId: unitId, activeLessonId: lessonId, themeTab: "lessons" },
      console, URL, URLSearchParams,
    } as Record<string, unknown>;
    vm.createContext(context);
    const script = [
      ...["units", "assignments", "BOOKLET_SHELL_ASSIGNMENT_IDS"].map((n) => sliceTopLevel(mainSource, "const", n)),
      ...["escapeHtml", "getUnitIndex", "completedUnitSet", "isUnitUnlocked", "isUnitComplete",
        "lessonRouteHref", "renderThemeSubnav"].map((n) => sliceTopLevel(mainSource, "function", n)),
      "globalThis.__html = (renderThemeSubnav(), refs.themeSubnav.innerHTML);",
    ].join("\n\n");
    vm.runInContext(script, context, { filename: "ab30-nav-subnav-seam.js" });
    return String((context as { __html: string }).__html);
  };
  const html = runSection("lesson", "theme-1", "t1-l07-numbered-treaties");
  assert.equal((html.match(/data-testid="lesson-nav-t1-/g) || []).length, 22, "inactive lessons keep stable IDs");
  assert.equal((html.match(/data-testid="active-lesson-link"/g) || []).length, 1, "exactly one active link");
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1, "exactly one aria-current=page");
  assert.ok(html.includes("lesson-nav-t2-"), "other themes contain their lessons for expansion");
  assert.match(html, /data-theme-nav="theme-1" open/, "current theme opens");
  assert.doesNotMatch(html, /data-theme-nav="theme-2" open/, "other themes start collapsed");
  assert.doesNotMatch(html, /class="nav-lessons"/, "no nested Lessons disclosure");
});

test("R06-NAV04: no nested sidebar scroll region; active link scrolls into view", () => {
  const navGroup = stylesSource.match(/\.lesson-nav-group\s*{[^}]*}/s);
  assert.ok(navGroup, ".lesson-nav-group rule exists");
  assert.doesNotMatch(navGroup?.[0] ?? "", /max-height|overflow/, "no fixed-height nested scroll");
  const setActiveNav = sliceTopLevel(mainSource, "function", "setActiveNav");
  assert.ok(setActiveNav.includes("revealActiveNavLink()"), "every nav paint reveals the active link");
  const reveal = sliceTopLevel(mainSource, "function", "revealActiveNavLink");
  assert.ok(reveal.includes('active-lesson-link'), "reveals the named active link");
  assert.ok(reveal.includes("block: 'nearest'"), "scrolls within the sidebar only");

  const context = { document: {} as Record<string, unknown> };
  vm.createContext(context);
  vm.runInContext(reveal, context, { filename: "seam-reveal.js" });
  let scrolledWith: unknown = null;
  (context.document as Record<string, unknown>).querySelector = () => ({
    scrollIntoView: (opts: unknown) => {
      scrolledWith = opts;
    },
  });
  const ran = vm.runInContext("revealActiveNavLink()", context);
  assert.equal(ran, true);
  assert.equal((scrolledWith as { block: string }).block, "nearest");
});

test("R06-NAV05: mobile header is two-row on a measured offset", () => {
  const mobile = stylesSource.match(/@media \(max-width:\s*760px\)\s*{[\s\S]*?\.course-sidebar\s*{[^}]*}/);
  assert.ok(mobile, "760px mobile block exists");
  assert.match(stylesSource, /\.course-topbar\s*{[^}]*flex-wrap:\s*wrap[^}]*height:\s*auto/s);
  assert.match(
    stylesSource,
    /\.top-progress-shell\s*{[^}]*position:\s*static[^}]*flex:\s*1 1 100%/s
  );
  assert.match(stylesSource, /\.course-sidebar\s*{[^}]*top:\s*var\(--topbar-actual/s);
  assert.match(stylesSource, /padding:\s*calc\(var\(--topbar-actual[\s\S]*?\+\s*20px\) 12px 60px/);
  assert.match(stylesSource, /scroll-padding-top:\s*calc\(var\(--topbar-actual/s);
  const sync = sliceTopLevel(mainSource, "function", "syncTopbarOffset");
  assert.ok(sync.includes("--topbar-actual"), "measured height feeds the offset variable");
  assert.ok(mainSource.includes("window.addEventListener('resize'"), "offset re-syncs on resize");

  const context = {
    document: {
      documentElement: { style: { setProperty: (k: string, v: string): void => {
        (context as Record<string, unknown>).__set = [k, v];
      } } },
    },
    refs: { topbar: { getBoundingClientRect: () => ({ height: 108.4 }) } },
  } as Record<string, unknown>;
  vm.createContext(context);
  vm.runInContext(sync, context, { filename: "seam-offset.js" });
  assert.equal(vm.runInContext("syncTopbarOffset()", context), 108);
  assert.deepEqual((context as Record<string, unknown>).__set, ["--topbar-actual", "108px"]);
});

test("R06-NAV06: menu opens/closes by button, scrim, Escape, and selection with correct focus", () => {
  assert.ok(indexSource.includes('<div id="menu-scrim" class="menu-scrim" hidden></div>'), "scrim element");
  assert.match(stylesSource, /\.menu-scrim:not\(\[hidden\]\)\s*{[^}]*position:\s*fixed[^}]*z-index:\s*35/s);
  const setter = sliceTopLevel(mainSource, "function", "setMobileMenu");
  assert.ok(setter.includes("state.mobileSidebarExpanded = open === true"), "single menu-state writer");
  assert.ok(setter.includes("syncMenuScrim") || setter.includes("applySidebarState"), "scrim follows state");
  assert.ok(setter.includes(".course-nav button"), "opening moves focus into the menu");
  assert.ok(setter.includes("refs.topbarMenuToggle.focus()"), "closing returns focus to the menu button");
  assert.ok(mainSource.includes("refs.menuScrim?.addEventListener('click'"), "scrim click closes");
  assert.ok(mainSource.includes("if (isMobileMenuOpen()) {\n    setMobileMenu(false);"), "Escape closes the menu");
  for (const name of ["setSection", "setActiveUnit", "setActiveLesson"]) {
    assert.ok(
      sliceTopLevel(mainSource, "function", name).includes("closeMobileMenuOnNavigate()"),
      `${name} closes the menu on selection`
    );
  }
  const sync = sliceTopLevel(mainSource, "function", "syncMenuScrim");
  assert.ok(sync.includes("isMobileMenuOpen()"), "scrim shows only for the open mobile menu");
});

test("R06-NAV07: print hides navigation aids but keeps teaching", () => {
  const print = stylesSource.match(/@media print\s*{[\s\S]*?}\n}/);
  assert.ok(print, "print block exists");
  for (const selector of [".page-guide", ".lesson-pager", ".menu-scrim", ".course-sidebar", ".course-topbar"]) {
    assert.ok(print?.[0].includes(selector), `print hides ${selector}`);
  }
  assert.ok(!print?.[0].includes(".lesson-goal-strip"), "learning goal still prints");
  assert.ok(!print?.[0].includes(".source-card"), "sources still print");
});

test("R06-NAV08: navigation and reload paths never wipe drafts", () => {
  for (const name of ["setSection", "setActiveUnit", "setActiveLesson", "applyRouteFromUrl", "applyRouteToState"]) {
    const slice = sliceTopLevel(mainSource, "function", name);
    assert.doesNotMatch(slice, /removeItem|clear\(\)|clearStorage/, `${name} wipes nothing`);
  }
  assert.ok(mainSource.includes("window.addEventListener('beforeunload'"), "unload flushes drafts");
  assert.ok(
    sliceTopLevel(mainSource, "function", "render").includes("flushPendingWrites()"),
    "every render flushes before painting"
  );
});

test("R06-NAV09: sidebar groups run overview, themes, work, resources", () => {
  const order = [">Start</summary>", "nav-home", ">Learn</h2>", ">Practice &amp; Review</summary>", ">My Work</summary>", ">Resources</summary>"];
  let at = -1;
  for (const needle of order) {
    const found = indexSource.indexOf(needle);
    assert.ok(found > at, `${needle} follows the locked order`);
    at = found;
  }
});

test("R06-NAV10: overview summarizes; lessons keep previous/next links", () => {
  const home = sliceTopLevel(mainSource, "function", "renderHome");
  assert.doesNotMatch(home, /renderLesson\(\)|renderLessonArticle\(/, "overview mounts no lesson articles");
  assert.ok(home.includes("Course Overview"), "overview keeps its summary");
  const lesson = sliceTopLevel(mainSource, "function", "renderLesson");
  assert.ok(lesson.includes("lesson-pager"), "every lesson route renders the pager");
  assert.ok(lesson.includes("lessonNeighbors("), "pager follows array-order neighbors");
});
