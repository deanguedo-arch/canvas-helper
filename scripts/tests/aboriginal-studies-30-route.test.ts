/**
 * AB30 lesson-route suite — T07 (ROUTE01–ROUTE08).
 *
 * Asserts the T07 runbook behavior against the real production files
 * (workspace course-data.js + main.js + learning-store.js): validated lesson
 * routes, overview maps, array-order prev/next, host-param preservation,
 * dialog focus restore, per-route DOM-id uniqueness, and Studio preview URL
 * sync. Same execution model as the parity suite: real course data plus
 * mechanically sliced production functions in a node:vm context with stub
 * storage/document (every slice asserted present and syntax-checked, so
 * drift fails loudly instead of silently going green).
 *
 * Browser/host halves NOT RUN here by construction (no browser in this
 * sandbox; recorded for T23/T24): real Back/Forward button + reload
 * (ROUTE04), native Escape delivery + real focus (ROUTE05), mobile sidebar
 * (ROUTE07), real Studio preview/editing (ROUTE08), and practice views
 * (T09, do not exist yet). What IS proven here: the pure route core, the
 * full setActiveLesson→render() path through stubs (real mount HTML), the
 * dialog close→focus path, subnav aria-current, and the preview URL builder.
 * No mocks are presented as the deferred browser proofs.
 *
 * Runners: `node --test <this file>` (sandbox-usable, import-free) and
 * `npx tsx --test <this file>` (repo convention for lead/CI).
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const adapterPath = path.resolve(workspaceDir, "learning-store.js");

const mainSource = readFileSync(mainPath, "utf8");
const dataSource = readFileSync(dataPath, "utf8");
const adapterSource = readFileSync(adapterPath, "utf8");

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

console.log(
  `[ab30-route] tested inputs: ${JSON.stringify({
    "main.js": sha256Hex(mainSource),
    "course-data.js": sha256Hex(dataSource),
    "learning-store.js": sha256Hex(adapterSource),
  })}`
);

type JsonRecord = Record<string, unknown>;
type Lesson = JsonRecord & { id: string; title?: string };
type Unit = JsonRecord & { id: string; lessons?: Lesson[] };

function loadCourseData(source: string): JsonRecord {
  const context = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: JsonRecord } };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "course-data.js" });
  const data = context.window.ABORIGINAL_STUDIES_30_DATA;
  assert.ok(data && typeof data === "object", "course-data.js must assign window.ABORIGINAL_STUDIES_30_DATA");
  return data;
}

const DATA = JSON.parse(JSON.stringify(loadCourseData(dataSource))) as JsonRecord;
const units = DATA["units"] as Unit[];
const themeActivities = DATA["themeActivities"] as Array<JsonRecord & { id: string; unitId?: string }>;
const libraryItems = DATA["libraryItems"] as Array<{ id: string }>;
const filmRoomItems = DATA["filmRoomItems"] as Array<{ id: string }>;

function unitOf(unitId: string): Unit {
  const unit = units.find((item) => item.id === unitId);
  assert.ok(unit, `unit ${unitId} must exist`);
  return unit;
}

function activityOf(unitId: string): JsonRecord | null {
  return themeActivities.find((item) => item.unitId === unitId) ?? null;
}

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// ---------------------------------------------------------------------------
// Mechanical seam slicer (same contract as the parity suite).
// ---------------------------------------------------------------------------

function sliceTopLevel(source: string, kind: "function" | "const", name: string): string {
  const anchor = kind === "function" ? `function ${name}(` : `const ${name} =`;
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, `seam "${name}" must exist in main.js (production drift?)`);
  const lineStart = source.lastIndexOf("\n", start) + 1;
  const boundaryPattern = /^(?:function|const|let|var) [A-Za-z_$][\w$]*/gm;
  boundaryPattern.lastIndex = start + anchor.length;
  const next = boundaryPattern.exec(source);
  const slice = (next ? source.slice(lineStart, next.index) : source.slice(lineStart)).trim();
  assert.ok(slice.length > anchor.length, `seam "${name}" slice must be non-empty`);
  new vm.Script(slice, { filename: `seam-${name}.js` });
  return slice;
}

const SLICE_CONSTS = [
  "STORAGE_KEYS",
  "refs",
  "units",
  "assignments",
  "libraryItems",
  "filmRoomItems",
  "coreVocabulary",
  "themeActivities",
  "ASSIGNMENT_PROMPT_LESSONS",
  "LESSON_DRAFTS",
  "BOOKLET_SHELL_ASSIGNMENT_IDS",
  "REQUIREMENT_ROLE_OVERRIDES",
  "routeableSections",
  "ROUTE_QUERY_KEYS",
  "reviewUnlockAll",
  "pendingWrites",
  "NAV_PERSIST_PROPS",
  "PROGRESS_PERSIST_PROPS",
];
const SLICE_FUNCTIONS = [
  "parseRouteFromSearch",
  "resolveLessonRoute",
  "lessonNeighbors",
  "anchorToLessonRoute",
  "lessonRouteHref",
  "routeToSearch",
  "previewRouteUrl",
  "applyRouteToState",
  "pushRouteState",
  "syncStudioPreviewRoute",
  "setActiveLesson",
  "gotoLesson",
  "focusLessonHeading",
  "render",
  "announceRoute",
  "routeAnnouncementText",
  "lessonTitleFor",
  "renderLesson",
  "isV2Lesson",
  "lessonBlocksApi",
  "renderV2GoalStrip",
  "renderV2Blocks",
  "renderLessonGuide",
  "lessonEyebrow",
  "renderLessonArticle",
  "renderThemeLessons",
  "renderUnit",
  "renderHome",
  "renderResourceRow",
  "renderUnitActivity",
  "renderBookletReview",
  "lessonsForSection",
  "renderWorkExportControls",
  "renderThemeSubnav",
  "setActiveNav",
  "assignmentHasResponse",
  "assignmentVersions",
  "profiledWorkKey",
  "profiledDraftKey",
  "revealActiveNavLink",
  "closeMobileMenuOnNavigate",
  "isMobileMenuOpen",
  "isSidebarForcedCollapsed",
  "setMobileMenu",
  "applySidebarState",
  "syncMenuScrim",
  "requiredPromptFieldKeys",
  "promptExpectsSubfields",
  "getPromptCompletion",
  "promptAnswered",
  "sectionAnswerCount",
  "roleForRequirement",
  "isKnownLegacyRequirement",
  "requirementItems",
  "requirementDenominator",
  "isRequirementComplete",
  "requirementTotals",
  "updateProgress",
  "pickPersistProps",
  "storeAvailable",
  "saveJson",
  "readCourseResponse",
  "saveActivityResponse",
  "flushPendingWrites",
  "refreshSaveStatus",
  "openCourseDialog",
  "closeCourseDialog",
  "handleDialogClose",
  "taskForSection",
  "submissionCommandId",
  "setSectionStatus",
  "submissionTaskReady",
  "bindSubmissionLifecycle",
  "bindSupportedSelections",
  "submitFirstFromSection",
  "unlockSectionAfterFirstSubmit",
  "openComparisonFromSection",
  "submitRevisionFromSection",
  "appendRevisionToSection",
  "restoreSidebarAfterReader",
  "completedUnitSet",
  "isUnitComplete",
  "getUnitIndex",
  "isUnitUnlocked",
  "getUnitActivity",
  "activityResponseKey",
  "promptFieldKey",
  "fieldToken",
  "tableFieldId",
  "tableFieldLabel",
  "writtenWorkKey",
  "escapeHtml",
  "escapeRegExp",
  "toEmbedUrl",
  "renderConsentEmbed",
  "lessonStartPage",
  "linkLessonTerms",
  "findVocabularyTerm",
  "promptsForLesson",
  "renderLessonQuestions",
  "renderAssignmentDrafts",
  "renderActivityPromptLabel",
  "renderActivityPromptResources",
  "renderFillBlankPrompt",
  "renderMultipleChoicePrompt",
  "renderTablePrompt",
  "renderActivityPrompt",
  "conflictOriginLabel",
  "storeConflictsForKeys",
  "renderConflictPanelsForKeys",
  "bindActivityControls",
  "bindWrittenWorkFields",
];

const seamSource = [
  ...SLICE_CONSTS.map((name) => sliceTopLevel(mainSource, "const", name)),
  ...SLICE_FUNCTIONS.map((name) => sliceTopLevel(mainSource, "function", name)),
].join("\n\n");

// ---------------------------------------------------------------------------
// Stub runtime: storage + document with focus/dialog/body affordances.
// ---------------------------------------------------------------------------

type StubElement = {
  innerHTML: string;
  textContent: string;
  value: string;
  style: Record<string, string>;
  dataset: Record<string, string>;
  isConnected: boolean;
  open: boolean;
  focused: boolean;
  focusCount: number;
  focus: () => void;
  blur: () => void;
  showModal: () => void;
  close: () => void;
  addEventListener: () => void;
  querySelector: () => null;
  setAttribute: (name: string, value: string) => void;
  removeAttribute: (name: string) => void;
  closest: () => null;
  querySelectorAll: () => unknown[];
  classList: { toggle: () => void; add: () => void; remove: () => void };
};

function makeElement(): StubElement {
  const element: StubElement = {
    innerHTML: "",
    textContent: "",
    value: "",
    style: {},
    dataset: {},
    isConnected: true,
    open: false,
    focused: false,
    focusCount: 0,
    focus: (): void => {
      element.focused = true;
      element.focusCount += 1;
    },
    blur: (): void => {
      element.focused = false;
    },
    showModal: (): void => {
      element.open = true;
    },
    close: (): void => {
      element.open = false;
    },
    addEventListener: () => undefined,
    querySelector: () => null,
    setAttribute: () => undefined,
    removeAttribute: () => undefined,
    closest: () => null,
    querySelectorAll: () => [],
    classList: { toggle: () => undefined, add: () => undefined, remove: () => undefined },
  };
  return element;
}

type RouteState = {
  section: string;
  unitId: string | null;
  lessonId: string | null;
  assignmentId: string | null;
  libraryId: string | null;
  filmId: string | null;
};

type Seam = {
  parseRouteFromSearch: (search: string) => RouteState;
  resolveLessonRoute: (
    unitId: string,
    lessonId: string
  ) => { ok: boolean; unit?: Unit; lesson?: Lesson; index?: number; fallback?: Partial<RouteState> };
  lessonNeighbors: (unitId: string, lessonId: string) => { prevId: string | null; nextId: string | null };
  anchorToLessonRoute: (hash: string) => { unitId: string; lessonId: string } | null;
  lessonRouteHref: (unitId: string, lessonId: string) => string;
  routeToSearch: (route: Partial<RouteState> & { section: string }, currentSearch: string) => string;
  previewRouteUrl: (href: string, route: Partial<RouteState> & { section: string }) => string;
  applyRouteToState: (route: Partial<RouteState> & { section: string }) => void;
  setActiveLesson: (unitId: string, lessonId: string) => { ok: boolean };
  renderLessonArticle: (activity: unknown, lesson: unknown, index: number) => string;
  renderThemeLessons: (unit: unknown) => string;
  renderThemeSubnav: () => void;
  openCourseDialog: (options: Record<string, unknown>) => void;
  closeCourseDialog: () => void;
  handleDialogClose: () => void;
  readLogicalResponse: (viewKey: string) => string;
  writeLogicalResponse: (viewKey: string, value: string) => void;
  setStatePatch: (patch: Record<string, unknown>) => void;
  getState: () => Record<string, unknown>;
  setProgress: (value: unknown) => void;
  setResponses: (value: Record<string, string>) => void;
};

function buildRuntime(): { seam: Seam; elements: Map<string, StubElement>; store: Map<string, string> } {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (key: string): string | null => (store.has(String(key)) ? (store.get(String(key)) as string) : null),
    setItem: (key: string, value: string): void => {
      store.set(String(key), String(value));
    },
    removeItem: (key: string): void => {
      store.delete(String(key));
    },
    clear: (): void => {
      store.clear();
    },
  };
  const elements = new Map<string, StubElement>();
  const elementFor = (id: string): StubElement => {
    if (!elements.has(id)) elements.set(id, makeElement());
    return elements.get(id) as StubElement;
  };
  const document = {
    getElementById: (id: string): StubElement => elementFor(`id:${id}`),
    querySelector: (selector: string): StubElement => elementFor(`q:${selector}`),
    querySelectorAll: (): unknown[] => [],
    createElement: (): StubElement => makeElement(),
    addEventListener: (): void => undefined,
    activeElement: null as unknown,
    body: { classList: { toggle: () => undefined } },
  };
  // URL/URLSearchParams/TextEncoder are standard platform globals present in
  // every browser and Node runtime the course ships to (same precedent as the
  // state suite's TextEncoder provisioning).
  const context = { DATA, localStorage, document, console, TextEncoder, URL, URLSearchParams } as Record<
    string,
    unknown
  >;
  vm.createContext(context);
  const script = [
    adapterSource,
    "let progress = { completedUnits: [], completedAssignments: [] };",
    "let activityResponses = {};",
    "let storeBoot = { ok: true, mode: 'envelope' };",
    "let dialogReturnFocus = null;",
    "let sidebarCollapsedBeforeReader = null;",
    "let sidebarForcedCollapseQuery = null;",
    `let state = {
      section: 'home', activeUnitId: null, activeLessonId: null,
      activeLibraryId: null, activeAssignmentId: null, activeFilmId: null,
      sidebarCollapsed: false, mobileSidebarExpanded: false,
      libraryReaderOpen: true, libraryReaderFullscreen: false,
      librarySearch: '', librarySort: 'default', themeTab: 'lessons'
    };`,
    seamSource,
    "storeBoot = AB30Store.init({ storage: localStorage });",
    `globalThis.__seam = {
      parseRouteFromSearch, resolveLessonRoute, lessonNeighbors, anchorToLessonRoute,
      lessonRouteHref, routeToSearch, previewRouteUrl, applyRouteToState,
      setActiveLesson, renderLessonArticle, renderThemeLessons, renderThemeSubnav,
      openCourseDialog, closeCourseDialog, handleDialogClose,
      readLogicalResponse, writeLogicalResponse,
      setStatePatch(patch) { Object.assign(state, patch); },
      getState() { return { ...state }; },
      setProgress(v) { progress = v; },
      setResponses(v) {
        activityResponses = { ...(v || {}) };
        for (const [key, value] of Object.entries(activityResponses)) writeLogicalResponse(key, value);
      }
    };`,
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-route-seam.js" });
  return { seam: (context as { __seam: Seam }).__seam, elements, store };
}

function attributeValues(html: string, name: string): string[] {
  const values: string[] = [];
  const pattern = new RegExp(`${name}="([^"]+)"`, "g");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) values.push(match[1]);
  return values;
}

test("ROUTE01: lesson URLs mount only that lesson; old URLs unchanged", () => {
  const { seam } = buildRuntime();
  assert.deepEqual(plain(seam.parseRouteFromSearch("?section=lesson&unit=theme-1&lesson=t1-l07-numbered-treaties")), {
    section: "lesson",
    unitId: "theme-1",
    lessonId: "t1-l07-numbered-treaties",
    assignmentId: null,
    libraryId: null,
    filmId: null,
  });
  const empty: RouteState = {
    section: "home",
    unitId: null,
    lessonId: null,
    assignmentId: null,
    libraryId: null,
    filmId: null,
  };
  assert.deepEqual(plain(seam.parseRouteFromSearch("?section=unit&unit=theme-2")), {
    ...empty,
    section: "unit",
    unitId: "theme-2",
  });
  assert.deepEqual(plain(seam.parseRouteFromSearch("?section=assignment&assignment=oral-tradition")), {
    ...empty,
    section: "assignment",
    assignmentId: "oral-tradition",
  });
  assert.deepEqual(plain(seam.parseRouteFromSearch(`?section=library&library=${libraryItems[0].id}`)), {
    ...empty,
    section: "library",
    libraryId: libraryItems[0].id,
  });
  assert.deepEqual(plain(seam.parseRouteFromSearch(`?section=film&film=${filmRoomItems[0].id}`)), {
    ...empty,
    section: "film",
    filmId: filmRoomItems[0].id,
  });
  assert.deepEqual(plain(seam.parseRouteFromSearch("")), empty);
  assert.deepEqual(plain(seam.parseRouteFromSearch("?section=quizzes")), { ...empty, section: "quizzes" });

  const mounted = buildRuntime();
  const result = mounted.seam.setActiveLesson("theme-1", "t1-l07-numbered-treaties");
  assert.equal(result.ok, true);
  assert.equal(mounted.seam.getState()["section"], "lesson");
  const html = mounted.elements.get("id:content-body")?.innerHTML ?? "";
  assert.ok(html.includes('id="lesson-t1-l07-numbered-treaties"'), "mounted lesson article present");
  const sibling = (unitOf("theme-1").lessons ?? [])[5];
  assert.ok(sibling, "sibling lesson must exist for the isolation check");
  assert.ok(!html.includes(`id="lesson-${sibling.id}"`), "sibling lesson must not mount");
  assert.equal(
    (html.match(/class="social-document theme-lesson(?: teacher-pilot)?"/g) || []).length,
    1,
    "exactly one lesson article mounts"
  );
  assert.ok(html.includes("lesson-pager"), "prev/next pager present");
  assert.ok(html.includes("data-lesson-heading"), "focus hook present");
});

test("ROUTE02: anchors resolve; bad params fall back without state loss", () => {
  const { seam } = buildRuntime();
  assert.deepEqual(plain(seam.anchorToLessonRoute("#lesson-t1-l07-numbered-treaties")), {
    unitId: "theme-1",
    lessonId: "t1-l07-numbered-treaties",
  });
  assert.equal(plain(seam.anchorToLessonRoute("#lesson-")), null);
  assert.equal(plain(seam.anchorToLessonRoute("#nope")), null);
  assert.equal(plain(seam.anchorToLessonRoute("")), null);
  const mismatch = seam.resolveLessonRoute("theme-2", "t1-l07-numbered-treaties");
  assert.equal(mismatch.ok, false);
  assert.deepEqual(plain(mismatch.fallback), { section: "unit", unitId: "theme-2" });
  const unknownUnit = seam.resolveLessonRoute("theme-9", "t1-l07-numbered-treaties");
  assert.equal(unknownUnit.ok, false);
  assert.deepEqual(plain(unknownUnit.fallback), { section: "home" });
  const unknownLesson = seam.resolveLessonRoute("theme-1", "t1-l99-nope");
  assert.equal(unknownLesson.ok, false);
  assert.deepEqual(plain(unknownLesson.fallback), { section: "unit", unitId: "theme-1" });
  const parsed = plain(seam.parseRouteFromSearch("?section=lesson&unit=theme-1&lesson=t1-l99-nope"));
  assert.equal(parsed.section, "unit");
  assert.equal(parsed.lessonId, null);

  const run = buildRuntime();
  run.seam.writeLogicalResponse("theme-1-online-booklet::q1.blank-1", "SYNTH_AB30_ROUTE02_KEPT");
  const bad = run.seam.setActiveLesson("theme-1", "t1-l99-nope");
  assert.equal(bad.ok, false);
  assert.equal(run.seam.getState()["section"], "unit");
  assert.equal(run.seam.readLogicalResponse("theme-1-online-booklet::q1.blank-1"), "SYNTH_AB30_ROUTE02_KEPT");
  const worse = run.seam.setActiveLesson("theme-9", "whatever");
  assert.equal(worse.ok, false);
  assert.equal(run.seam.getState()["section"], "home");
  assert.equal(run.seam.readLogicalResponse("theme-1-online-booklet::q1.blank-1"), "SYNTH_AB30_ROUTE02_KEPT");
});

test("ROUTE03: prev/next follow array order across nonsequential IDs", () => {
  const { seam } = buildRuntime();
  assert.deepEqual(plain(seam.lessonNeighbors("theme-2", "t2-l05-land-values")), {
    prevId: "t2-l01-why-land-matters",
    nextId: "t2-l02-two-kinds-of-claims",
  });
  for (const unit of units) {
    const lessons = unit.lessons ?? [];
    for (let i = 0; i < lessons.length; i += 1) {
      const { prevId, nextId } = plain(seam.lessonNeighbors(unit.id, lessons[i].id));
      assert.equal(prevId, i === 0 ? null : lessons[i - 1].id, `${lessons[i].id} prev`);
      assert.equal(nextId, i === lessons.length - 1 ? null : lessons[i + 1].id, `${lessons[i].id} next`);
    }
  }
  assert.deepEqual(plain(seam.lessonNeighbors("theme-9", "whatever")), { prevId: null, nextId: null });
});

test("ROUTE04-partial: route URLs preserve unrelated host params (Back/Forward/reload need a browser)", () => {
  const { seam } = buildRuntime();
  const search = seam.routeToSearch(
    { section: "lesson", unitId: "theme-1", lessonId: "t1-l07-numbered-treaties" },
    "?foo=bar&section=home&unit=theme-9"
  );
  assert.ok(search.includes("foo=bar"), "host param preserved");
  assert.ok(search.includes("section=lesson"), "new section set");
  assert.ok(search.includes("unit=theme-1"), "new unit set");
  assert.ok(search.includes("lesson=t1-l07-numbered-treaties"), "lesson set");
  assert.ok(!search.includes("theme-9"), "stale route param replaced");
  assert.ok(!search.includes("section=home"), "stale section replaced");
});

test("ROUTE05-partial: dialog close restores focus to the opener (native Esc needs a browser)", () => {
  const run = buildRuntime();
  const opener = run.elements.get("id:content-body");
  assert.ok(opener, "opener stub must exist");
  run.seam.openCourseDialog({ kicker: "Reader", title: "T", bodyHtml: "<p>x</p>", returnFocus: opener });
  const dialog = run.elements.get("id:course-dialog");
  const dialogBody = run.elements.get("id:course-dialog-body");
  assert.equal(dialog?.open, true, "dialog must open");
  run.seam.closeCourseDialog();
  assert.equal(dialog?.open, false, "dialog must close");
  assert.equal(dialogBody?.innerHTML, "", "dialog body must clear");
  assert.equal(opener.focusCount, 1, "focus must return to the opener");
  run.seam.openCourseDialog({ kicker: "R", title: "T2", bodyHtml: "<p>y</p>", returnFocus: opener });
  run.seam.handleDialogClose();
  assert.equal(opener.focusCount, 2, "close-event path must also restore focus");
  assert.equal(dialogBody?.innerHTML, "", "close-event path must clear the body");
});

test("ROUTE06: all 50 lesson routes mount unique DOM ids and shared radio names", () => {
  const { seam } = buildRuntime();
  let articleCount = 0;
  for (const unit of units) {
    const activity = activityOf(unit.id);
    for (const [index, lesson] of (unit.lessons ?? []).entries()) {
      const html = seam.renderLessonArticle(activity, lesson, index);
      articleCount += 1;
      const ids = attributeValues(html, "id");
      assert.deepEqual([...new Set(ids)].sort(), [...ids].sort(), `${lesson.id}: duplicate DOM ids`);
      assert.ok(ids.includes(`lesson-${lesson.id}`), `${lesson.id}: article id present`);
      const names = attributeValues(html, "name");
      const keys = attributeValues(html, "data-activity-response");
      for (const name of new Set(names)) {
        assert.ok(keys.includes(name), `${lesson.id}: radio group ${name} must equal its saved key`);
      }
    }
  }
  assert.equal(articleCount, 50, "all 50 lesson routes covered");
});

test("ROUTE07-partial: subnav exposes the current lesson link with aria-current (mobile/focus need a browser)", () => {
  const run = buildRuntime();
  run.seam.setStatePatch({ section: "lesson", activeUnitId: "theme-2", activeLessonId: "t2-l05-land-values" });
  run.seam.renderThemeSubnav();
  const html = run.elements.get("id:theme-subnav")?.innerHTML ?? "";
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1, "exactly one current link");
  const activeAnchor = (html.match(/<a\b[^>]*data-lesson-link="theme-2::t2-l05-land-values"[^>]*>/) || [])[0] || "";
  assert.ok(activeAnchor.includes('aria-current="page"'), "current link is the active lesson");
  assert.ok(activeAnchor.includes('data-testid="active-lesson-link"'), "active link carries the DOM-contract ID");
  assert.ok(html.includes('data-unit-id="theme-2"'), "theme button rendered");
  assert.match(html, /<details class="nav-theme" data-theme-nav="theme-2" open>/, "active theme disclosure opens");
  assert.match(html, /class="nav-theme-contents lesson-nav-group"/, "lessons live directly inside a theme");
  assert.doesNotMatch(html, /class="nav-lessons"|<summary>Lessons/, "no redundant Lessons disclosure");
  assert.equal((html.match(/data-theme-nav=/g) || []).length, 4, "all four themes are discoverable");

});

test("ROUTE08-partial: Studio preview URL sync covers lesson routes (live Studio needs a browser)", () => {
  const { seam } = buildRuntime();
  const base = "http://localhost/preview/workspace/aboriginal-studies-30/index.html?section=home&host=1";
  const lesson = seam.previewRouteUrl(base, {
    section: "lesson",
    unitId: "theme-1",
    lessonId: "t1-l07-numbered-treaties",
  });
  assert.ok(
    lesson.includes("section=lesson") &&
      lesson.includes("unit=theme-1") &&
      lesson.includes("lesson=t1-l07-numbered-treaties"),
    "lesson route synced"
  );
  assert.ok(lesson.includes("host=1"), "host params preserved");
  const synced = seam.previewRouteUrl(lesson, {
    section: "lesson",
    unitId: "theme-1",
    lessonId: "t1-l07-numbered-treaties",
  });
  assert.equal(synced, lesson, "in-sync URLs are untouched");
  const unit = seam.previewRouteUrl(lesson, { section: "unit", unitId: "theme-2" });
  assert.ok(!unit.includes("lesson="), "leaving a lesson drops the lesson param");
  assert.ok(unit.includes("unit=theme-2"), "unit route synced");
});
