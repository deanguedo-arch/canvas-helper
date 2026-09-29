/**
 * AB30 Bio-parity regression suite — T01 (tests only).
 *
 * Asserts the DESIRED behavior from 05_TEST_AND_RELEASE_MATRIX.md against the
 * real production files (workspace course-data.js + main.js). Red assertions
 * reproduce live defects; they turn green only through production changes in
 * T02 (mapping), T05 (store) and T06 (completion).
 *
 * Execution model (no browser in this sandbox; see T00 record):
 * - Real course data is loaded by executing course-data.js in a node:vm
 *   context (same precedent as aboriginal-studies-30-shell.test.ts).
 * - Real mapping/save/completion functions are sliced mechanically out of
 *   main.js (balanced top-level declaration scan — every slice is asserted
 *   present and syntax-checked, so drift fails loudly instead of silently
 *   going green) and executed in a vm context with stub localStorage/document.
 * - View reads use the exact production expression `activityResponses[key]`
 *   (verified by structural guard against renderWrittenWorkField).
 *
 * Future-seam contract (documented for T02/T05/T06; the suite resolves these
 * when present and falls back to the legacy path otherwise, so production
 * changes flip red tests green WITHOUT test edits):
 * - T02: lessons may carry `bookletQuestionIds: string[]`; the suite prefers
 *   the explicit list over lessonQuestionNumbers/promptsForLesson when present.
 * - T05: runtime may provide `readLogicalResponse(viewKey)` /
 *   `writeLogicalResponse(viewKey, value)`; otherwise the suite uses the real
 *   saveActivityResponse plus the exact production read expression.
 * - T06: runtime may provide `getPromptCompletion(activity, prompt)` returning
 *   a status string or { status }; otherwise the suite uses promptAnswered.
 *   T06 must keep `updateProgress` writing refs.progressPercent/progressCount.
 *
 * Runners: `node --test <this file>` (sandbox-usable, import-free) and
 * `npx tsx --test <this file>` (repo convention for lead/CI).
 *
 * T02 amendment: MAP01/MAP02 now assert the explicit-data world (green after
 * T02); lessonQuestionNumbers was deleted from production so it left the
 * slice set. Added MAP04-DOM (within-view DOM-id uniqueness through the real
 * renderer), MAP05 (explicit row/column/blank IDs preserve keys across label
 * edits and reordering), and MAP06 (coverage-manifest schema + live-data
 * cross-check). MAP04's same-logical-record half stays red until T05; MAP06's
 * source-backing half completes in T03/T13.
 *
 * T05 amendment: the seam now loads the real production adapter
 * (learning-store.js) before the main.js slices and boots AB30Store against
 * the stub storage, so the T01 future-seam contract resolves: view reads and
 * writes go through the production `readLogicalResponse` /
 * `writeLogicalResponse`, and `setResponses` seeds the adapter (the real
 * store) instead of only the legacy memory var. Slice set gains
 * `pendingWrites`, `readCourseResponse`, and `refreshSaveStatus`, which the
 * T05-routed production functions require. STATE02-keys now guards the
 * `readCourseResponse` production read expression plus its delegation to the
 * adapter. No red assertion was edited to go green: STATE02-F02/F03 flip via
 * the adapter's alias resolution; COMP01/COMP02 stay red for T06.
 *
 * T06 amendment: production gained getPromptCompletion (not-started/partial/
 * fields-complete/needs-review + counts), the requirement manifest
 * (legacyAssigned denominator only; new work defaults formative), and
 * requirements-based progress with flags shown as legacy self-report. Slice
 * set gains the completion/manifest functions and the `assignments`,
 * BOOKLET_SHELL_ASSIGNMENT_IDS, and REQUIREMENT_ROLE_OVERRIDES consts; the
 * seam exposes getPromptCompletion/requirement* for direct assertions. New
 * tests COMP03 (Q73 blanks), COMP04 (legacy-unstructured needs-review),
 * COMP05 (denominator stability + counted-once), COMP06 (no mastery/
 * correctness/review/grade claims, dynamic + static). COMP01/COMP02 flip
 * green unedited via the new completion semantics.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const fixtureDir = path.resolve("scripts", "tests", "fixtures", "ab30-parity");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");

type JsonRecord = Record<string, unknown>;
type Lesson = JsonRecord & {
  id: string;
  kicker?: string;
  bookletQuestionIds?: string[];
  assignmentIds?: string[];
  assignmentHomeIds?: string[];
};
type TableField = { id: string; label: string };
type Prompt = JsonRecord & { id: string; number?: number };
type Activity = JsonRecord & { id: string; sections?: Array<JsonRecord & { id: string; prompts?: Prompt[] }> };

// ---------------------------------------------------------------------------
// Real-input loading + evidence logging.
// ---------------------------------------------------------------------------

const adapterPath = path.resolve(workspaceDir, "learning-store.js");
const mainSource = readFileSync(mainPath, "utf8");
const dataSource = readFileSync(dataPath, "utf8");
const adapterSource = readFileSync(adapterPath, "utf8");

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

const inputHashes = {
  "main.js": sha256Hex(mainSource),
  "course-data.js": sha256Hex(dataSource),
  "learning-store.js": sha256Hex(adapterSource),
};
console.log(`[ab30-parity] tested inputs: ${JSON.stringify(inputHashes)}`);

function loadCourseData(source: string): JsonRecord {
  const context = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: JsonRecord } };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "course-data.js" });
  const data = context.window.ABORIGINAL_STUDIES_30_DATA;
  assert.ok(data && typeof data === "object", "course-data.js must assign window.ABORIGINAL_STUDIES_30_DATA");
  return data;
}

// Normalize across the vm realm boundary: arrays built from vm-loaded objects
// carry the vm Array prototype, which strict deepEqual rejects. The course
// data is a pure JSON literal, so this round-trip is lossless.
const DATA = JSON.parse(JSON.stringify(loadCourseData(dataSource))) as JsonRecord;
const units = DATA["units"] as Array<JsonRecord & { id: string; lessons?: Lesson[] }>;
const themeActivities = DATA["themeActivities"] as Activity[];
const booklet = themeActivities.find((activity) => activity.id === "theme-1-online-booklet");
assert.ok(booklet, "theme-1-online-booklet activity must exist");

const questionMap = JSON.parse(readFileSync(path.resolve(fixtureDir, "theme1-question-map.json"), "utf8")) as {
  activityId: string;
  lessons: Array<{
    lessonId: string;
    questionIds: string[];
    assignmentIds: string[];
    formalAssignmentHome: string[];
  }>;
};
const aliases = JSON.parse(
  readFileSync(path.resolve(fixtureDir, "assignment-aliases.json"), "utf8")
) as Array<{ assignmentId: string; legacyKeys: string[]; logicalRecordId: string; sourceHold: boolean }>;
const markers = JSON.parse(
  readFileSync(path.resolve(fixtureDir, "state-fixtures.json"), "utf8")
) as Record<string, string>;

// ---------------------------------------------------------------------------
// Mechanical seam slicer: extracts exact top-level declarations from the real
// main.js. Any missing/unparseable slice throws — never a silent green.
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
  new vm.Script(slice, { filename: `seam-${name}.js` }); // syntax-check the exact slice
  return slice;
}

const SLICE_CONSTS = [
  "STORAGE_KEYS",
  "refs",
  "units",
  "assignments",
  "themeActivities",
  "ASSIGNMENT_PROMPT_LESSONS",
  "BOOKLET_SHELL_ASSIGNMENT_IDS",
  "REQUIREMENT_ROLE_OVERRIDES",
  "pendingWrites",
];
const SLICE_FUNCTIONS = [
  "saveJson",
  "completedUnitSet",
  "isUnitComplete",
  "updateProgress",
  "activityResponseKey",
  "readCourseResponse",
  "saveActivityResponse",
  "refreshSaveStatus",
  "promptsForLesson",
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
  "assignmentHasResponse",
  "assignmentVersions",
  "profiledWorkKey",
  "profiledDraftKey",
  "requirementTotals",
  "promptFieldKey",
  "fieldToken",
  "tableFieldId",
  "tableFieldLabel",
  "writtenWorkKey",
  "escapeHtml",
  "toEmbedUrl",
  "renderConsentEmbed",
  "renderActivityPromptLabel",
  "renderActivityPromptResources",
  "renderFillBlankPrompt",
  "renderMultipleChoicePrompt",
  "renderTablePrompt",
  "renderActivityPrompt",
  "activityPromptResponseLines",
];

const seamSource = [
  ...SLICE_CONSTS.map((name) => sliceTopLevel(mainSource, "const", name)),
  ...SLICE_FUNCTIONS.map((name) => sliceTopLevel(mainSource, "function", name)),
].join("\n\n");

// ---------------------------------------------------------------------------
// Minimal browser stub runtime: fresh localStorage + document per test.
// ---------------------------------------------------------------------------

type StubElement = {
  innerHTML: string;
  textContent: string;
  value: string;
  style: Record<string, string>;
  dataset: Record<string, string>;
  addEventListener: () => void;
  querySelector: () => null;
  querySelectorAll: () => unknown[];
  classList: { toggle: () => void; add: () => void; remove: () => void };
};

function makeElement(): StubElement {
  return {
    innerHTML: "",
    textContent: "",
    value: "",
    style: {},
    dataset: {},
    addEventListener: () => undefined,
    querySelector: () => null,
    querySelectorAll: () => [],
    classList: { toggle: () => undefined, add: () => undefined, remove: () => undefined },
  };
}

type Seam = {
  saveActivityResponse: (key: string, value: string) => void;
  promptsForLesson: (activity: unknown, lesson: unknown) => Prompt[];
  promptAnswered: (activity: unknown, prompt: unknown) => boolean;
  updateProgress: () => void;
  activityResponseKey: (activityId: string, promptId: string) => string;
  promptFieldKey: (activity: unknown, prompt: unknown, suffix?: string) => string;
  fieldToken: (value: unknown) => string;
  tableFieldId: (entry: unknown) => string;
  tableFieldLabel: (entry: unknown) => string;
  writtenWorkKey: (assignmentId: string) => string;
  renderActivityPrompt: (activity: unknown, prompt: unknown) => string;
  renderTablePrompt: (activity: unknown, prompt: unknown, promptText: string) => string;
  activityPromptResponseLines: (activity: unknown, prompt: unknown) => string[];
  getPromptCompletion?: (
    activity: unknown,
    prompt: unknown
  ) => { status: string; filled: number; expected: number; detail?: string };
  requirementItems?: () => Array<{ id: string; role: string; kind: string }>;
  requirementDenominator?: (items?: Array<{ id: string; role: string; kind: string }>) => number;
  requirementTotals?: () => { done: number; total: number };
  roleForRequirement?: (id: string) => string;
  readLogicalResponse?: (viewKey: string) => string;
  writeLogicalResponse?: (viewKey: string, value: string) => void;
  setProgress: (value: unknown) => void;
  setResponses: (value: Record<string, string>) => void;
  getResponses: () => Record<string, string>;
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
    createElement: (): StubElement => makeElement(),
    addEventListener: (): void => undefined,
  };
  const context = { DATA, localStorage, document, console, TextEncoder } as Record<string, unknown>;
  vm.createContext(context);
  const script = [
    adapterSource,
    "let progress = { completedUnits: [], completedAssignments: [] };",
    "let activityResponses = {};",
    "let storeBoot = { ok: true, mode: 'envelope' };",
    seamSource,
    "storeBoot = AB30Store.init({ storage: localStorage });",
    `globalThis.__seam = {
      saveActivityResponse, promptsForLesson, promptAnswered, updateProgress,
      activityResponseKey, promptFieldKey, fieldToken, tableFieldId, tableFieldLabel, writtenWorkKey,
      renderActivityPrompt, renderTablePrompt, activityPromptResponseLines,
      getPromptCompletion: (typeof getPromptCompletion !== "undefined") ? getPromptCompletion : undefined,
      requirementItems: (typeof requirementItems !== "undefined") ? requirementItems : undefined,
      requirementDenominator: (typeof requirementDenominator !== "undefined") ? requirementDenominator : undefined,
      requirementTotals: (typeof requirementTotals !== "undefined") ? requirementTotals : undefined,
      roleForRequirement: (typeof roleForRequirement !== "undefined") ? roleForRequirement : undefined,
      readLogicalResponse: (typeof readLogicalResponse !== "undefined") ? readLogicalResponse : undefined,
      writeLogicalResponse: (typeof writeLogicalResponse !== "undefined") ? writeLogicalResponse : undefined,
      setProgress(v) { progress = v; },
      setResponses(v) {
        activityResponses = { ...(v || {}) };
        if (typeof writeLogicalResponse === "function") {
          for (const [key, value] of Object.entries(activityResponses)) writeLogicalResponse(key, value);
        }
      },
      getResponses() { return activityResponses; }
    };`,
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-seam.js" });
  return { seam: (context as { __seam: Seam }).__seam, elements, store };
}

// Resolved seams: explicit/future production wins when present, otherwise the
// real legacy function. Production changes flip red tests green unedited.

function membershipIds(seam: Seam, activity: Activity, lesson: Lesson): string[] {
  if (Array.isArray(lesson.bookletQuestionIds)) return [...lesson.bookletQuestionIds];
  return seam.promptsForLesson(activity, lesson).map((prompt) => prompt.id);
}

function completionState(
  seam: Seam,
  activity: Activity,
  prompt: Prompt
): { complete: boolean; detail: string } {
  if (typeof seam.getPromptCompletion === "function") {
    const result = seam.getPromptCompletion(activity, prompt) as string | { status?: string };
    const status = typeof result === "string" ? result : String(result?.status ?? "");
    assert.ok(
      status !== "correct" && status !== "reviewed" && status !== "mastered",
      `completion must never claim correctness/mastery (got "${status}")`
    );
    return { complete: status === "fields-complete", detail: `status=${status}` };
  }
  return { complete: seam.promptAnswered(activity, prompt), detail: "legacy-boolean" };
}

function writeViewResponse(seam: Seam, viewKey: string, value: string): void {
  if (typeof seam.writeLogicalResponse === "function") seam.writeLogicalResponse(viewKey, value);
  else seam.saveActivityResponse(viewKey, value);
}

function readViewResponse(seam: Seam, viewKey: string): string {
  if (typeof seam.readLogicalResponse === "function") return seam.readLogicalResponse(viewKey) ?? "";
  return seam.getResponses()[viewKey] ?? "";
}

// ---------------------------------------------------------------------------
// MAP03 — lesson identity/order guard. Green on the T00 baseline; must STAY
// green through every later ticket (T02 gate includes MAP03).
// ---------------------------------------------------------------------------

const FROZEN_LESSON_ORDER = [
  "t1-l01-oral-tradition", "t1-l02-nations-peoples", "t1-l03-rights-distinctions",
  "t1-l04-worldview", "t1-l05-early-treaties", "t1-l06-colonization-proclamation",
  "t1-l07-numbered-treaties", "t1-l08-treaty-promises-alberta", "t1-l09-geography-governance",
  "t1-l10-land-law-knowledge", "t1-l11-metis-governance-elders", "t1-l12-first-nations-inuit-relations",
  "t1-l13-scrip-road-allowances", "t1-l14-indian-act", "t1-l15-resistance-1951",
  "t1-l16-policy-councils-devolution", "t1-l17-land-knowledge-constitution",
  "t1-l18-constitutional-negotiations", "t1-l19-title-treaties-constraints",
  "t1-l20-harvesting-rights", "t1-l21-rebuilding-goals", "t1-l22-models", "t1-l23-synthesis",
  "t2-l01-why-land-matters", "t2-l05-land-values", "t2-l02-two-kinds-of-claims",
  "t2-l06-claims-machine", "t2-l07-bigstone-specific", "t2-l08-paths-resolution",
  "t2-l03-metis-non-status-claims", "t2-l09-first-modern-treaties", "t2-l10-north-and-west",
  "t2-l04-resolving-claims",
  "t3-l01-stereotypes-media", "t3-l05-words-that-wound", "t3-l06-screens-punchlines",
  "t3-l02-breaking-barriers", "t3-l03-community-life", "t3-l07-running-own-show",
  "t3-l08-city-test", "t3-l09-friendship-success", "t3-l10-devolution", "t3-l04-urban-life-services",
  "t4-l01-one-world-many-peoples", "t4-l05-nine-issues", "t4-l02-colonial-wounds",
  "t4-l06-resources-conflict", "t4-l03-land-resources-un", "t4-l07-education-odds",
  "t4-l04-youth-future-response",
];

test("MAP03: all 50 lesson IDs survive in array display order (T00 baseline guard)", () => {
  assert.equal(units.length, 4);
  const perTheme = units.map((unit) => (unit.lessons ?? []).length);
  assert.deepEqual(perTheme, [23, 10, 10, 7]);
  const liveOrder = units.flatMap((unit) => (unit.lessons ?? []).map((lesson) => lesson.id));
  assert.deepEqual(liveOrder, FROZEN_LESSON_ORDER);
  assert.equal(new Set(liveOrder).size, 50, "lesson IDs must be unique");
  const theme1 = units[0].lessons ?? [];
  assert.equal(theme1[6].id, "t1-l07-numbered-treaties", "T10 exemplar slice anchor");
});

// ---------------------------------------------------------------------------
// Fixture self-consistency guards (green now; validate the contract inputs).
// ---------------------------------------------------------------------------

test("fixtures: reviewed Theme 1 map covers q1..q87 exactly once", () => {
  assert.equal(questionMap.activityId, "theme-1-online-booklet");
  assert.equal(questionMap.lessons.length, 23);
  const theme1Ids = new Set((units[0].lessons ?? []).map((lesson) => lesson.id));
  for (const entry of questionMap.lessons) {
    assert.ok(theme1Ids.has(entry.lessonId), `map lesson ${entry.lessonId} must be a real lesson`);
  }
  const covered = questionMap.lessons.flatMap((entry) => entry.questionIds);
  assert.equal(covered.length, 87);
  assert.equal(new Set(covered).size, 87, "each question must appear exactly once in the map");
  const expectedIds = Array.from({ length: 87 }, (_, index) => `q${index + 1}`);
  assert.deepEqual(
    [...covered].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))),
    expectedIds,
    "map must cover exactly q1..q87 as a set (per-lesson grouping order is pedagogical, not a contract)"
  );
});

test("fixtures: assignment aliases pair exactly one formal key with one lesson key", () => {
  assert.equal(aliases.length, 8);
  for (const alias of aliases) {
    assert.equal(alias.legacyKeys.length, 2, alias.assignmentId);
    const formal = alias.legacyKeys.filter((key) => key.startsWith("written::"));
    assert.equal(formal.length, 1, `${alias.assignmentId} must pair exactly one written:: key`);
  }
});

// ---------------------------------------------------------------------------
// MAP01 — explicit single-home question mapping. RED on the T00 baseline
// (no bookletQuestionIds; q1/q2 triple-homed via kicker parsing). T02 turns
// these green by adding the explicit membership.
// ---------------------------------------------------------------------------

test("MAP01-data: every Theme 1 lesson carries explicit bookletQuestionIds matching the reviewed map", () => {
  const expected = new Map(questionMap.lessons.map((entry) => [entry.lessonId, [...entry.questionIds].sort()]));
  const expectedAsg = new Map(
    questionMap.lessons.map((entry) => [entry.lessonId, [...entry.assignmentIds].sort()] as const)
  );
  const expectedHome = new Map(
    questionMap.lessons.map((entry) => [entry.lessonId, [...entry.formalAssignmentHome].sort()] as const)
  );
  const missing: string[] = [];
  const mismatched: string[] = [];
  for (const lesson of units[0].lessons ?? []) {
    if (
      !Array.isArray(lesson.bookletQuestionIds) ||
      !Array.isArray(lesson.assignmentIds) ||
      !Array.isArray(lesson.assignmentHomeIds)
    ) {
      missing.push(lesson.id);
      continue;
    }
    const live = [...(lesson.bookletQuestionIds ?? [])].sort();
    const liveAsg = [...(lesson.assignmentIds ?? [])].sort();
    const liveHome = [...(lesson.assignmentHomeIds ?? [])].sort();
    if (
      JSON.stringify(live) !== JSON.stringify(expected.get(lesson.id) ?? null) ||
      JSON.stringify(liveAsg) !== JSON.stringify(expectedAsg.get(lesson.id) ?? null) ||
      JSON.stringify(liveHome) !== JSON.stringify(expectedHome.get(lesson.id) ?? null)
    ) {
      mismatched.push(lesson.id);
    }
  }
  assert.deepEqual(missing, [], `lessons lacking explicit membership fields: ${missing.join(", ")}`);
  assert.deepEqual(mismatched, [], `lessons diverging from the reviewed map: ${mismatched.join(", ")}`);
  for (const unit of units.slice(1)) {
    for (const lesson of unit.lessons ?? []) {
      assert.ok(
        Array.isArray(lesson.bookletQuestionIds),
        `${lesson.id} must declare explicit booklet membership (empty when none)`
      );
    }
  }
});

test("MAP01-homes: q1..q87 each resolve to exactly one primary lesson home", () => {
  const { seam } = buildRuntime();
  const homes = new Map<string, string[]>();
  for (const lesson of units[0].lessons ?? []) {
    for (const id of membershipIds(seam, booklet as Activity, lesson)) {
      if (!/^q\d+$/.test(id)) continue;
      homes.set(id, [...(homes.get(id) ?? []), lesson.id]);
    }
  }
  const multiHomed = [...homes.entries()].filter(([, lessons]) => lessons.length !== 1);
  const expectedIds = Array.from({ length: 87 }, (_, index) => `q${index + 1}`);
  const unhomed = expectedIds.filter((id) => !homes.has(id));
  assert.deepEqual(unhomed, [], `questions with no primary home: ${unhomed.join(", ")}`);
  assert.deepEqual(
    multiHomed,
    [],
    `questions with != 1 home: ${multiHomed.map(([id, lessons]) => `${id}->[${lessons.join(",")}]`).join("; ")}`
  );
  assert.deepEqual(homes.get("q1"), ["t1-l02-nations-peoples"]);
  assert.deepEqual(homes.get("q2"), ["t1-l02-nations-peoples"]);
  assert.deepEqual(homes.get("q81"), ["t1-l21-rebuilding-goals"]);
  assert.deepEqual(homes.get("q82"), ["t1-l21-rebuilding-goals"]);
  assert.deepEqual(homes.get("q83"), ["t1-l21-rebuilding-goals"]);
  assert.deepEqual(homes.get("q84"), ["t1-l22-models"]);
  assert.deepEqual(homes.get("q87"), ["t1-l22-models"]);
});

// ---------------------------------------------------------------------------
// MAP02 — kicker/title text must not alter membership. RED on the T00
// baseline (numbers in display text leak into membership). T02 green.
// ---------------------------------------------------------------------------

test("MAP02: mutating kicker text with Assignment 1.2 wording and numbers changes no membership", () => {
  const { seam } = buildRuntime();
  const changed: string[] = [];
  for (const lesson of units[0].lessons ?? []) {
    const before = membershipIds(seam, booklet as Activity, lesson).sort();
    const mutated = JSON.parse(JSON.stringify(lesson)) as Lesson;
    mutated.kicker = `${mutated.kicker ?? ""} · Assignment 1.2 bonus round 99, 100-102!`;
    const after = membershipIds(seam, booklet as Activity, mutated).sort();
    if (JSON.stringify(before) !== JSON.stringify(after)) changed.push(lesson.id);
  }
  assert.deepEqual(changed, [], `kicker-sensitive membership in: ${changed.join(", ")}`);
});

// ---------------------------------------------------------------------------
// STATE02 — lesson/formal draft visibility. F02/F03 RED on the T00 baseline
// (disconnected keys); F04 green. T05 (after lead-approved T04 design)
// unifies the logical record.
// ---------------------------------------------------------------------------

function aliasKeys(alias: { assignmentId: string; legacyKeys: string[] }): { formalKey: string; lessonKey: string } {
  const formalKey = alias.legacyKeys.find((key) => key.startsWith("written::")) as string;
  const lessonKey = alias.legacyKeys.find((key) => !key.startsWith("written::")) as string;
  return { formalKey, lessonKey };
}

test("STATE02-F02: lesson-only draft restores in the formal assignment view", () => {
  const invisible: string[] = [];
  for (const alias of aliases) {
    const { seam: run } = buildRuntime();
    const { formalKey, lessonKey } = aliasKeys(alias);
    writeViewResponse(run, lessonKey, `${markers["F02_lessonOnlyDraft"]}::${alias.assignmentId}`);
    if (readViewResponse(run, formalKey) !== `${markers["F02_lessonOnlyDraft"]}::${alias.assignmentId}`) {
      invisible.push(alias.assignmentId);
    }
  }
  assert.deepEqual(invisible, [], `lesson-only drafts invisible formally: ${invisible.join(", ")}`);
});

test("STATE02-F03: formal-only draft restores in the lesson view", () => {
  const invisible: string[] = [];
  for (const alias of aliases) {
    const { seam: run } = buildRuntime();
    const { formalKey, lessonKey } = aliasKeys(alias);
    writeViewResponse(run, formalKey, `${markers["F03_formalOnlyDraft"]}::${alias.assignmentId}`);
    if (readViewResponse(run, lessonKey) !== `${markers["F03_formalOnlyDraft"]}::${alias.assignmentId}`) {
      invisible.push(alias.assignmentId);
    }
  }
  assert.deepEqual(invisible, [], `formal-only drafts invisible in lessons: ${invisible.join(", ")}`);
});

test("STATE02-F04: identical dual drafts stay consistent in both views (baseline guard)", () => {
  for (const alias of aliases) {
    const { seam: run, store } = buildRuntime();
    const { formalKey, lessonKey } = aliasKeys(alias);
    const value = `${markers["F04_identicalDualDraft"]}::${alias.assignmentId}`;
    writeViewResponse(run, lessonKey, value);
    writeViewResponse(run, formalKey, value);
    assert.equal(readViewResponse(run, lessonKey), value, `${alias.assignmentId} lesson view`);
    assert.equal(readViewResponse(run, formalKey), value, `${alias.assignmentId} formal view`);
    if (typeof run.writeLogicalResponse !== "function") {
      const persisted = store.get("aboriginal-studies-30.activityResponses") ?? "";
      assert.ok(persisted.includes(value), `${alias.assignmentId} write must reach durable storage, not just memory`);
    }
  }
});

test("STATE02-keys: alias fixture keys match the real production key builders", () => {
  const { seam } = buildRuntime();
  const promptIds = new Set(
    (booklet as Activity).sections?.flatMap((section) => (section.prompts ?? []).map((prompt) => prompt.id)) ?? []
  );
  for (const alias of aliases) {
    const { formalKey, lessonKey } = aliasKeys(alias);
    assert.equal(seam.writtenWorkKey(alias.assignmentId), formalKey, `${alias.assignmentId} formal key`);
    const [, lessonSide] = lessonKey.split("::");
    if (lessonKey.startsWith("theme-1-online-booklet::")) {
      assert.equal(seam.activityResponseKey("theme-1-online-booklet", lessonSide), lessonKey);
      assert.ok(promptIds.has(lessonSide), `${lessonSide} must be a real booklet prompt`);
    } else {
      assert.ok(lessonKey.startsWith("assignment-draft::"), lessonKey);
    }
  }
  const draftsSlice = sliceTopLevel(mainSource, "function", "renderAssignmentDrafts");
  assert.ok(
    draftsSlice.includes("assignment-draft::${draft.assignmentId}"),
    "lesson draft key model must match renderAssignmentDrafts"
  );
  const writtenSlice = sliceTopLevel(mainSource, "function", "renderWrittenWorkField");
  assert.ok(
    writtenSlice.includes("readCourseResponse("),
    "formal read model must match renderWrittenWorkField"
  );
  const readSlice = sliceTopLevel(mainSource, "function", "readCourseResponse");
  assert.ok(
    readSlice.includes("readLogicalResponse(viewKey)"),
    "readCourseResponse must delegate to the adapter logical read"
  );
});

// ---------------------------------------------------------------------------
// COMP01 — no verified-mastery display from flags alone. RED on the T00
// baseline (four flags render 100%). T06 implements legacy self-report.
// ---------------------------------------------------------------------------

test("COMP01: four legacy Mark Complete flags with an empty answer store must not display 100% mastery", () => {
  const { seam, elements } = buildRuntime();
  seam.setProgress({
    completedUnits: units.map((unit) => unit.id),
    completedAssignments: [],
  });
  seam.setResponses({});
  seam.updateProgress();
  const percent = elements.get("id:progress-percent")?.textContent;
  const count = elements.get("id:progress-count")?.textContent;
  assert.notEqual(percent, "100%", `flags-only state must not render verified mastery (count: ${count})`);
});

test("COMP01-zero: empty flags with an empty store render 0% (baseline guard)", () => {
  const { seam, elements } = buildRuntime();
  seam.setProgress({ completedUnits: [], completedAssignments: [] });
  seam.setResponses({});
  seam.updateProgress();
  assert.equal(elements.get("id:progress-percent")?.textContent, "0%");
});

// ---------------------------------------------------------------------------
// COMP02 — structured completion is per-field. One-cell RED on the T00
// baseline (any-cell prefix match counts as answered); full-structure green.
// T06 introduces fields-complete/partial states.
// ---------------------------------------------------------------------------

function findPrompt(id: string): Prompt {
  for (const section of booklet?.sections ?? []) {
    for (const prompt of section.prompts ?? []) {
      if (prompt.id === id) return prompt;
    }
  }
  throw new Error(`prompt ${id} missing from theme-1-online-booklet`);
}

function q37Keys(seam: Seam): string[] {
  const q37 = findPrompt("q37");
  const rows = q37["rows"] as TableField[];
  const columns = q37["columns"] as TableField[];
  assert.equal(rows.length * columns.length, 12, "Q37 must be a 12-cell table (matrix COMP02 premise)");
  return rows.flatMap((row) =>
    columns.map((column) => seam.promptFieldKey(booklet, q37, `${row.id}.${column.id}`))
  );
}

test("COMP02: one Q37 cell is not complete; twelve cells are fields-complete, never auto-correct", () => {
  const q37 = findPrompt("q37");
  const keys = q37Keys(buildRuntime().seam);
  assert.equal(new Set(keys).size, 12, "Q37 cell keys must be distinct");

  const one = buildRuntime();
  one.seam.setResponses({ [keys[0]]: markers["F08_q37OneCell"] });
  const partial = completionState(one.seam, booklet as Activity, q37);
  assert.equal(partial.complete, false, `one filled cell must not count as answered (${partial.detail})`);

  const full = buildRuntime();
  const responses: Record<string, string> = {};
  keys.forEach((key, index) => {
    responses[key] = `${markers["F08_q37FullCellPrefix"]}${index}`;
  });
  full.seam.setResponses(responses);
  const done = completionState(full.seam, booklet as Activity, q37);
  assert.equal(done.complete, true, `twelve filled cells must be fields-complete (${done.detail})`);
});

test("COMP03: one Q73 blank is partial; both blanks are fields-complete", () => {
  const q73 = findPrompt("q73");
  assert.equal(q73.kind, "fillBlank", "Q73 must be the two-blank fill-in task");
  const run = buildRuntime();
  assert.equal(typeof run.seam.getPromptCompletion, "function", "T06 must provide getPromptCompletion");
  const complete = run.seam.getPromptCompletion as (
    activity: unknown,
    prompt: unknown
  ) => { status: string; filled: number; expected: number };
  const blank1 = run.seam.promptFieldKey(booklet, q73, "blank-1");
  const blank2 = run.seam.promptFieldKey(booklet, q73, "blank-2");
  assert.notEqual(blank1, blank2, "blank keys must be distinct");
  writeViewResponse(run.seam, blank1, `${markers["F08_q37OneCell"]}-q73-blank-1`);
  const partial = complete(booklet, q73);
  assert.equal(partial.status, "partial");
  assert.equal(partial.filled, 1);
  assert.equal(partial.expected, 2);
  writeViewResponse(run.seam, blank2, `${markers["F08_q37OneCell"]}-q73-blank-2`);
  const fields = complete(booklet, q73);
  assert.equal(fields.status, "fields-complete");
  assert.equal(fields.filled, 2);
  assert.equal(fields.expected, 2);
});

test("COMP04: unstructured legacy text on a structured task is needs-review, never blank", () => {
  const q37 = findPrompt("q37");
  const run = buildRuntime();
  const complete = run.seam.getPromptCompletion as (
    activity: unknown,
    prompt: unknown
  ) => { status: string; filled: number; expected: number };
  const base = run.seam.activityResponseKey("theme-1-online-booklet", "q37");
  const legacyText = `${markers["F08_q37OneCell"]}-legacy-unstructured-paragraph`;
  writeViewResponse(run.seam, base, legacyText);
  const state = complete(booklet, q37);
  assert.equal(state.status, "needs-review");
  assert.equal(state.filled, 0);
  assert.equal(state.expected, 12);
  assert.equal(readViewResponse(run.seam, base), legacyText, "legacy raw text must stay visible, not blank");
});

test("COMP05: formative practice changes no denominator; one canonical response counts once", () => {
  const run = buildRuntime();
  assert.equal(typeof run.seam.requirementItems, "function", "T06 must provide requirementItems");
  assert.equal(typeof run.seam.requirementDenominator, "function", "T06 must provide requirementDenominator");
  assert.equal(typeof run.seam.requirementTotals, "function", "T06 must provide requirementTotals");
  assert.equal(typeof run.seam.roleForRequirement, "function", "T06 must provide roleForRequirement");
  const items = (run.seam.requirementItems as () => Array<{ id: string; role: string; kind: string }>)();
  assert.ok(items.length > 90, `manifest must cover booklet + assignment requirements (got ${items.length})`);
  assert.ok(
    items.every((item) => !("gradeWeight" in (item as Record<string, unknown>))),
    "no grade weights anywhere in the manifest"
  );
  const denominator = (run.seam.requirementDenominator as () => number)();
  assert.equal(
    denominator,
    items.filter((item) => item.role === "legacyAssigned").length,
    "denominator must count legacyAssigned items only"
  );
  assert.equal(
    (run.seam.roleForRequirement as (id: string) => string)("practice:new-concept-1"),
    "formative",
    "new activities default to formative/non-grade"
  );
  const withFormative = [...items, { id: "practice:new-concept-1", role: "formative", kind: "practice" }];
  assert.equal(
    (run.seam.requirementDenominator as (list: typeof withFormative) => number)(withFormative),
    denominator,
    "formative items must not move the legacy denominator"
  );
  const before = (run.seam.requirementTotals as () => { done: number; total: number })();
  assert.equal(before.done, 0, "empty store must complete zero requirements");
  assert.equal(before.total, denominator);
  const { formalKey } = aliasKeys(aliases[0]);
  writeViewResponse(run.seam, formalKey, `${markers["F04_identicalDualDraft"]}-comp05-dual`);
  const after = (run.seam.requirementTotals as () => { done: number; total: number })();
  assert.equal(after.total, denominator, "completing work must not move the denominator");
  assert.equal(
    after.done - before.done,
    2,
    "one canonical response completes the two linked requirements, counted once each"
  );
  const solo = buildRuntime();
  const soloBefore = (solo.seam.requirementTotals as () => { done: number; total: number })();
  const q74 = findPrompt("q74");
  writeViewResponse(
    solo.seam,
    solo.seam.promptFieldKey(booklet, q74),
    `${markers["F08_q37OneCell"]}-comp05-solo`
  );
  const soloAfter = (solo.seam.requirementTotals as () => { done: number; total: number })();
  assert.equal(soloAfter.done - soloBefore.done, 1, "a solo response completes exactly one requirement");
});

test("COMP06: completion UI never claims mastery, correctness, review, or grades", () => {
  const banned = /\b(master|mastered|mastery|correct|reviewed|teacher-approved|approved|grade|graded)\b/i;
  const { seam, elements } = buildRuntime();
  const keys = q37Keys(seam);
  keys.forEach((key, index) => {
    writeViewResponse(seam, key, `${markers["F08_q37FullCellPrefix"]}${index}`);
  });
  const { formalKey } = aliasKeys(aliases[0]);
  writeViewResponse(seam, formalKey, `${markers["F04_identicalDualDraft"]}-comp06-dual`);
  seam.setProgress({
    completedUnits: units.map((unit) => unit.id),
    completedAssignments: [],
  });
  seam.updateProgress();
  for (const [name, node] of elements) {
    if (!name.startsWith("id:progress-")) continue;
    assert.ok(!banned.test(node.textContent ?? ""), `${name} must not claim review/mastery/grades`);
  }
  const completion = seam.getPromptCompletion as (
    activity: unknown,
    prompt: unknown
  ) => { status: string; filled: number; expected: number };
  for (const prompt of allBookletPrompts()) {
    const state = completion(booklet, prompt);
    assert.ok(!banned.test(state.status), `${prompt.id} status must not claim review/mastery/grades`);
  }
  for (const name of [
    "getPromptCompletion",
    "sectionAnswerCount",
    "updateProgress",
    "renderBookletReview",
    "renderHome",
    "requirementTotals",
  ]) {
    const slice = sliceTopLevel(mainSource, "function", name)
      .replace(/\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    assert.ok(!banned.test(slice), `${name} code must not contain a review/mastery/grade claim`);
  }
});

// ---------------------------------------------------------------------------
// MAP04-DOM — within-view DOM-id uniqueness through the REAL renderer.
// A view renders each prompt at most once, so rendering all 89 prompts must
// yield pairwise-unique DOM ids while sharing one saved key per record.
// (MAP04's same-logical-record half stays red until T05; browser coexistence
// of multiple views is proven in T23. The two `copy-activity-responses`
// branches are mutually exclusive by construction.)
// ---------------------------------------------------------------------------

function allBookletPrompts(): Prompt[] {
  return (booklet as Activity).sections?.flatMap((section) => section.prompts ?? []) ?? [];
}

function attributeValues(html: string, name: string): string[] {
  const values: string[] = [];
  const pattern = new RegExp(`${name}="([^"]+)"`, "g");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) values.push(match[1]);
  return values;
}

test("MAP04-DOM: real renders emit unique DOM ids and shared saved keys per record", () => {
  const { seam } = buildRuntime();
  seam.setResponses({});
  const domIds: string[] = [];
  for (const prompt of allBookletPrompts()) {
    const html = seam.renderActivityPrompt(booklet, prompt);
    for (const id of attributeValues(html, "id")) {
      assert.ok(
        id.startsWith(`activity-${(booklet as Activity).id}-${prompt.id}`),
        `DOM id ${id} must be scoped to its prompt record`
      );
      domIds.push(id);
    }
    const keys = attributeValues(html, "data-activity-response");
    assert.ok(keys.length > 0, `${prompt.id} must render at least one response control`);
    if (prompt.kind === "multipleChoice") {
      const names = attributeValues(html, "name");
      assert.ok(names.length > 0, `${prompt.id} radio group must share one record name`);
      assert.equal(new Set(names).size, 1, `${prompt.id} choices must share one saved key`);
      assert.equal(names[0], keys[0], `${prompt.id} record name must equal its saved key`);
    }
  }
  const duplicates = domIds.filter((id, index) => domIds.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicates)], [], `duplicate DOM ids: ${[...new Set(duplicates)].join(", ")}`);
});

// ---------------------------------------------------------------------------
// MAP05 — explicit row/column/blank IDs preserve saved keys across label
// edits and reordering. Proven through the REAL key builders, the REAL table
// renderer, and the REAL review-line builder.
// ---------------------------------------------------------------------------

function tablePrompts(): Prompt[] {
  return allBookletPrompts().filter((prompt) => prompt.kind === "table");
}

test("MAP05-ids: explicit row/column ids equal the legacy token derivation (zero-migration proof)", () => {
  const { seam } = buildRuntime();
  assert.ok(tablePrompts().length >= 1, "at least one table prompt must exist");
  for (const prompt of tablePrompts()) {
    for (const entry of [...((prompt["rows"] as TableField[]) ?? []), ...((prompt["columns"] as TableField[]) ?? [])]) {
      assert.equal(typeof entry, "object", `${prompt.id} rows/columns must be { id, label } records`);
      assert.ok(entry.id && entry.label, `${prompt.id} rows/columns must carry id and label`);
      assert.equal(
        seam.tableFieldId(entry),
        seam.fieldToken(entry.label),
        `${prompt.id} explicit id must preserve the legacy saved key`
      );
    }
  }
});

test("MAP05-render: relabelled and reordered tables keep keys, show new labels (real renderer)", () => {
  const q37 = findPrompt("q37");
  const mutated = JSON.parse(JSON.stringify(q37)) as Prompt;
  const rows = (mutated["rows"] as TableField[]).map((row) => ({ ...row, label: `${row.label} (rev)` })).reverse();
  const columns = (mutated["columns"] as TableField[]).map((column) => ({
    ...column,
    label: `${column.label} (rev)`,
  })).reverse();
  mutated["rows"] = rows;
  mutated["columns"] = columns;

  const { seam } = buildRuntime();
  seam.setResponses({});
  const beforeHtml = seam.renderTablePrompt(booklet, q37, "Q37");
  const afterHtml = seam.renderTablePrompt(booklet, mutated, "Q37");
  const beforeKeys = attributeValues(beforeHtml, "data-activity-response").sort();
  const afterKeys = attributeValues(afterHtml, "data-activity-response").sort();
  assert.equal(beforeKeys.length, 12);
  assert.deepEqual(afterKeys, beforeKeys, "saved keys must survive label edits and reordering");
  assert.ok(afterHtml.includes("(rev)"), "new labels must reach the visible table");
  assert.ok(!beforeKeys.some((key) => key.includes("(rev)")), "labels must not leak into saved keys");

  const responses: Record<string, string> = {};
  beforeKeys.forEach((key, index) => {
    responses[key] = `SYNTH_AB30_MAP05_${index}`;
  });
  seam.setResponses(responses);
  const beforeLines = seam.activityPromptResponseLines(booklet, q37);
  const afterLines = seam.activityPromptResponseLines(booklet, mutated);
  const lineValue = (line: string): string => line.slice(line.indexOf(": ") + 2);
  const beforeValues = beforeLines.filter((line) => line.includes("SYNTH_AB30_MAP05_")).map(lineValue).sort();
  const afterValues = afterLines.filter((line) => line.includes("SYNTH_AB30_MAP05_")).map(lineValue).sort();
  assert.equal(beforeValues.length, 12);
  assert.deepEqual(afterValues, beforeValues, "review lines must read the same saved values after relabel/reorder");
});

test("MAP05-blanks: every fill-in blank carries an explicit stable id", () => {
  for (const prompt of allBookletPrompts().filter((item) => item.kind === "fillBlank")) {
    const blanks = prompt["blanks"] as Array<{ id?: string; label?: string }>;
    assert.ok(Array.isArray(blanks) && blanks.length > 0, `${prompt.id} must declare blanks`);
    for (const [index, blank] of blanks.entries()) {
      assert.ok(blank.id, `${prompt.id} blank ${index} must carry an explicit id`);
    }
    const ids = blanks.map((blank) => blank.id as string);
    assert.equal(new Set(ids).size, ids.length, `${prompt.id} blank ids must be unique`);
  }
});

// ---------------------------------------------------------------------------
// MAP06 — coverage manifest schema + live-data cross-check. Every required
// item class must be present with an allowed disposition; blocked items must
// name a reason and owning ticket (no silent exclusions). Source-backing of
// retained wording completes in T03/T13.
// ---------------------------------------------------------------------------

type ManifestItem = {
  id: string;
  class: string;
  theme?: string;
  lessonHome?: string;
  runtimeKeys?: string[];
  disposition: string;
  blockedReason?: string;
  owningTicket?: string;
  count?: number;
};

test("MAP06: coverage manifest accounts for every required item with an allowed disposition", () => {
  const manifest = JSON.parse(
    readFileSync(path.resolve("projects", "aboriginal-studies-30", "meta", "ab30-parity", "coverage-manifest.json"), "utf8")
  ) as { schemaVersion: number; dispositions: string[]; rules: Record<string, string>; items: ManifestItem[] };
  assert.equal(manifest.schemaVersion, 1);
  assert.ok(manifest.rules.domNamespace && manifest.rules.savedVsDom, "namespace rules must be recorded");
  const ids = manifest.items.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, "manifest ids must be unique");
  for (const item of manifest.items) {
    assert.ok(
      manifest.dispositions.includes(item.disposition),
      `${item.id} disposition must come from the allowed set`
    );
    if (item.disposition === "blocked") {
      assert.ok(item.blockedReason, `${item.id} blocked items must name a reason`);
      assert.ok(item.owningTicket, `${item.id} blocked items must name an owning ticket`);
    }
  }

  // Cross-check 1: all 87 live numbered prompts listed exactly once with the
  // same home the live lesson data declares.
  const liveNumbered = allBookletPrompts().filter((prompt) => prompt.number);
  assert.equal(liveNumbered.length, 87);
  const liveHomes = new Map<string, string>();
  for (const lesson of units[0].lessons ?? []) {
    for (const qid of lesson.bookletQuestionIds ?? []) liveHomes.set(qid, lesson.id);
  }
  const manifestQuestions = manifest.items.filter((item) => item.class === "booklet-question");
  assert.equal(manifestQuestions.length, 87);
  for (const question of manifestQuestions) {
    assert.ok(
      liveNumbered.some((prompt) => prompt.id === question.id),
      `${question.id} must be a live numbered prompt`
    );
    assert.equal(question.lessonHome, liveHomes.get(question.id), `${question.id} home must match live lesson data`);
  }

  // Cross-check 2: every live assignment record (visible + shell) listed.
  const liveAssignments = (DATA["assignments"] as Array<{ id: string }>).map((assignment) => assignment.id);
  for (const id of liveAssignments) {
    assert.ok(
      manifest.items.some((item) => item.id === id && (item.class === "formal-assignment" || item.class === "booklet-shell")),
      `assignment ${id} must have a manifest entry`
    );
  }

  // Cross-check 3: definition terms, later-theme sets, and special tasks are
  // recorded (blocked with owners) rather than silently absent.
  for (const id of [
    "theme-1-definition-terms",
    "theme-2-questions",
    "theme-3-questions",
    "theme-4-world-issues-questions",
    "theme-4-comparison-4-1",
    "theme-3-reel-injun-sequence",
    "theme-4-novel-4-3",
  ]) {
    const item = manifest.items.find((entry) => entry.id === id);
    assert.ok(item, `${id} must be recorded, never silently excluded`);
    assert.equal(item?.disposition, "blocked");
  }
  const defs = manifest.items.find((item) => item.id === "theme-1-definition-terms");
  assert.equal(defs?.count, 12);

  // Cross-check 4: Q37 manifest keys equal the keys the real builders derive.
  const { seam } = buildRuntime();
  const q37Entry = manifest.items.find((item) => item.id === "q37");
  assert.deepEqual([...(q37Entry?.runtimeKeys ?? [])].sort(), q37Keys(seam).sort());
});

