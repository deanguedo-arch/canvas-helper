/**
 * AB30 source reconciliation suite — R07.
 *
 * Proves the Theme 2-4 booklet verification: all 281 expected homes
 * resolve to live prompts/fields in their home lessons, every record
 * carries exact source locators, subfield ids match the special-shapes
 * contract, the 4-3 versioned profile keeps legacy keys byte-stable while
 * exposing Halfbreed separately, and nothing discloses answer keys.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const mainPath = path.resolve(workspaceDir, "main.js");
const mainSource = readFileSync(mainPath, "utf8");
const evidenceDir = path.resolve("projects", "aboriginal-studies-30", "meta", "ab30-v2", "evidence", "R07");
const parityDir = path.resolve("projects", "aboriginal-studies-30", "meta", "ab30-parity");

type Prompt = {
  id: string;
  number?: string;
  kind: string;
  label: string;
  rows?: number | Array<{ id: string; label: string }>;
  columns?: Array<{ id: string; label: string }>;
  blanks?: Array<{ id: string; label: string }>;
  choices?: string[];
  locator?: { filePage: number; printedPage: number };
  marks?: string;
};
type Section = { id: string; prompts: Prompt[] };
type Activity = { id: string; unitId: string; sections: Section[] };
type Lesson = {
  id: string;
  bookletQuestionIds?: string[];
  assignmentIds?: string[];
  assignmentHomeIds?: string[];
};

function loadCourseData(): Record<string, unknown> {
  const context = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: Record<string, unknown> } };
  vm.createContext(context);
  vm.runInContext(readFileSync(dataPath, "utf8"), context, { filename: "course-data.js" });
  return JSON.parse(JSON.stringify(context.window.ABORIGINAL_STUDIES_30_DATA)) as Record<string, unknown>;
}

const DATA = loadCourseData();
const activities = DATA["themeActivities"] as Activity[];
const units = DATA["units"] as Array<{ id: string; lessons: Lesson[] }>;
const assignments = DATA["assignments"] as Array<Record<string, unknown>>;
const lessonsById = new Map(units.flatMap((unit) => unit.lessons.map((lesson) => [lesson.id, lesson])));

function sliceTopLevel(kind: "const" | "function", name: string): string {
  const anchor = kind === "function" ? `function ${name}(` : `${kind} ${name} =`;
  const start = mainSource.indexOf(anchor);
  assert.ok(start >= 0, `seam "${name}" missing (production drift?)`);
  const lineStart = mainSource.lastIndexOf("\n", start) + 1;
  const boundary = /^(?:function|const|let|var) [A-Za-z_$][\w$]*/gm;
  boundary.lastIndex = start + anchor.length;
  const next = boundary.exec(mainSource);
  const slice = (next ? mainSource.slice(lineStart, next.index) : mainSource.slice(lineStart)).trim();
  new vm.Script(slice, { filename: `seam-${name}.js` });
  return slice;
}

test("R07-REC01: all 281 expected homes resolve to live prompts in their home lessons", () => {
  const manifest = JSON.parse(readFileSync(path.resolve(evidenceDir, "field-manifest.json"), "utf8")) as Array<{
    themeId: string;
    sourceSet: string;
    sourceItem: string;
    promptId: string;
    fieldKey: string;
    primaryLessonId: string;
  }>;
  assert.equal(manifest.length, 281, "manifest covers every expected home");
  const promptsByActivity = new Map<string, Map<string, Prompt>>();
  for (const activity of activities) {
    const byId = new Map<string, Prompt>();
    for (const section of activity.sections) {
      for (const prompt of section.prompts) byId.set(prompt.id, prompt);
    }
    promptsByActivity.set(activity.id, byId);
  }
  const activityForTheme = new Map(activities.map((activity) => [activity.unitId, activity.id]));
  const assignmentIds = new Set(assignments.map((entry) => String(entry.id)));
  for (const row of manifest) {
    assert.ok(lessonsById.has(row.primaryLessonId), `${row.sourceItem}: home lesson exists`);
    if (row.sourceSet === "critical-response") {
      assert.ok(assignmentIds.has(row.promptId), `${row.sourceItem}: assignment record exists`);
      const lesson = lessonsById.get(row.primaryLessonId) as Lesson;
      assert.ok(
        lesson.assignmentIds?.includes(row.promptId) && lesson.assignmentHomeIds?.includes(row.promptId),
        `${row.sourceItem}: home lesson binds the assignment`
      );
      continue;
    }
    const activityId = activityForTheme.get(row.themeId === "theme-1" && row.promptId === "attawapiskat-report"
      ? "theme-3"
      : row.themeId) as string;
    const prompt = promptsByActivity.get(activityId)?.get(row.promptId);
    assert.ok(prompt, `${row.sourceItem}: prompt ${row.promptId} exists in ${activityId}`);
    if (row.sourceSet === "glossary" || row.sourceSet === "comparison-chart" ||
        row.sourceSet === "halfbreed-definitions" || row.sourceSet === "halfbreed-reading") {
      const [, ...cells] = row.fieldKey.split(".");
      const rows = (prompt?.rows ?? []) as Array<{ id: string }>;
      const columns = (prompt?.columns ?? []) as Array<{ id: string }>;
      const rowId = cells[0];
      const colId = cells[1];
      assert.ok(rows.some((entry) => entry.id === rowId), `${row.fieldKey}: row exists`);
      if (colId) assert.ok(columns.some((entry) => entry.id === colId), `${row.fieldKey}: column exists`);
    }
  }
});

test("R07-REC02: every booklet prompt carries exact locators, marks, and stable subfield ids", () => {
  for (const activity of activities) {
    for (const section of activity.sections) {
      for (const prompt of section.prompts) {
        assert.ok(["shortAnswer", "fillBlank", "multipleChoice", "table"].includes(prompt.kind),
          `${activity.id}::${prompt.id}: known kind`);
        if (activity.id === "theme-1-online-booklet" && prompt.id !== "t1-glossary") continue; // frozen T00 wording
        assert.ok(prompt.locator && Number.isInteger(prompt.locator.filePage),
          `${activity.id}::${prompt.id}: exact file-page locator`);
        assert.ok(prompt.locator && Number.isInteger(prompt.locator.printedPage),
          `${activity.id}::${prompt.id}: exact printed-page locator`);
        assert.ok(prompt.marks, `${activity.id}::${prompt.id}: booklet marks recorded`);
        for (const row of (Array.isArray(prompt.rows) ? prompt.rows : [])) {
          // Halfbreed chapter numbers mirror the source's own stable numbering
          // (intro, 1-24); every other row id must be a non-numeric slug.
          const chapterNumber = prompt.id === "halfbreed-chart" && /^(intro|\d{1,2})$/.test(row.id);
          assert.ok(row.id && (chapterNumber || !/^\d+$/.test(row.id)),
            `${prompt.id}: stable row id, never a bare index`);
        }
        for (const blank of prompt.blanks ?? []) {
          assert.ok(blank.id && !/^\d+$/.test(blank.id), `${prompt.id}: stable blank id`);
        }
      }
    }
  }
});

test("R07-REC03: special field shapes match the contract tags exactly", () => {
  const byKey = new Map<string, Prompt>();
  for (const activity of activities) {
    for (const section of activity.sections) {
      for (const prompt of section.prompts) byKey.set(`${activity.id}::${prompt.id}`, prompt);
    }
  }
  const rowsOf = (key: string): string[] =>
    ((byKey.get(key)?.rows ?? []) as Array<{ id: string }>).map((entry) => entry.id);
  const colsOf = (key: string): string[] =>
    ((byKey.get(key)?.columns ?? []) as Array<{ id: string }>).map((entry) => entry.id);
  assert.deepEqual(rowsOf("theme-2-online-booklet::q2"),
    ["economic", "cultural", "spiritual", "educational", "social", "political"]);
  assert.equal(rowsOf("theme-3-online-booklet::q8").length, 9, "discrimination rows stay nine, no Language row");
  assert.ok(!rowsOf("theme-3-online-booklet::q8").includes("language"), "Q9 heading is not a chart row");
  assert.deepEqual(rowsOf("theme-3-online-booklet::q13"), ["family-friends", "pace", "children", "other-benefits"]);
  assert.deepEqual(rowsOf("theme-4-online-booklet::q4"),
    ["spirituality-and-land", "oral-traditions", "extended-family", "respect-for-diversity", "community", "colonial-history"]);
  assert.deepEqual(rowsOf("theme-4-online-booklet::q6"),
    ["land-resources", "environment", "war", "language-culture", "education", "self-determination", "health", "human-rights"]);
  assert.equal(rowsOf("theme-4-online-booklet::4-1-comparison-chart").length, 12, "comparison chart keeps 12 rows");
  assert.deepEqual(colsOf("theme-4-online-booklet::4-1-comparison-chart"), ["australia", "canada"]);
  assert.equal(rowsOf("theme-4-online-booklet::halfbreed-chart").length, 25, "intro plus 24 chapters");
  assert.deepEqual(colsOf("theme-4-online-booklet::halfbreed-chart"), ["words-images-questions", "why"]);
  assert.equal(rowsOf("theme-4-online-booklet::halfbreed-definitions").length, 6);
  assert.equal(rowsOf("theme-1-online-booklet::t1-glossary").length, 12, "glossary keeps 12 terms");
  const blanks = (byKey.get("theme-2-online-booklet::q22")?.blanks ?? []).map((entry) => entry.id);
  assert.equal(blanks.length, 6, "chronology keeps 6 blanks");
});

test("R07-REC04: versioned 4-3 keys keep legacy text byte-stable and expose Halfbreed separately", () => {
  const store: Record<string, string> = {
    "written::4-3-personal-response": "SYNTH legacy hand-in.",
    "assignment-draft::4-3-personal-response": "SYNTH legacy draft.",
  };
  const context = {
    console,
    __store: store,
    readCourseResponse: (key: string): string => store[key] ?? "",
    isAssignmentUnlocked: (): boolean => true,
  } as Record<string, unknown>;
  vm.createContext(context);
  const script = [
    "function readCourseResponse(key) { return globalThis.__store[key] || ''; }",
    "function isAssignmentUnlocked() { return true; }",
    ...["writtenWorkKey", "assignmentVersions", "activeAssignmentVersion", "profiledWorkKey",
      "profiledDraftKey", "profiledSummary", "profiledInstructions", "escapeHtml",
      "renderWrittenWorkField", "renderLegacyProfileHistory"].map((name) => sliceTopLevel("function", name)),
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-r07-profile-seam.js" });
  const seam = context as unknown as Record<string, (...args: never[]) => unknown>;
  const assignment = assignments.find((entry) => entry.id === "4-3-personal-response") as unknown as Record<string, never>;
  assert.equal(
    (seam["profiledWorkKey"] as (a: unknown, v: string) => string)(assignment, "legacy-inconvenient-indian"),
    "written::4-3-personal-response", "legacy hand-in key unsuffixed");
  assert.equal(
    (seam["profiledDraftKey"] as (a: unknown, v: string) => string)(assignment, "legacy-inconvenient-indian"),
    "assignment-draft::4-3-personal-response", "legacy draft key unsuffixed");
  assert.equal(
    (seam["profiledWorkKey"] as (a: unknown, v: string) => string)(assignment, "v2-halfbreed"),
    "written::4-3-personal-response::v2-halfbreed", "Halfbreed hand-in key separated");
  assert.equal(
    (seam["activeAssignmentVersion"] as (a: unknown) => string)(assignment), "v2-halfbreed");
  const field = String((seam["renderWrittenWorkField"] as (a: unknown) => string)(assignment));
  assert.ok(field.includes('data-written-key="written::4-3-personal-response::v2-halfbreed"'),
    "active field binds the Halfbreed key");
  assert.ok(!field.includes("SYNTH legacy"), "legacy text never renders in the Halfbreed field");
  const history = String((seam["renderLegacyProfileHistory"] as (a: unknown) => string)(assignment));
  assert.ok(history.includes("SYNTH legacy hand-in."), "legacy hand-in stays readable");
  assert.ok(history.includes("SYNTH legacy draft."), "legacy draft stays writable");
  assert.ok(history.includes('data-written-key="assignment-draft::4-3-personal-response"'),
    "legacy draft binds the original key");
  store["written::4-3-personal-response"] = "";
  store["assignment-draft::4-3-personal-response"] = "  ";
  assert.equal(String((seam["renderLegacyProfileHistory"] as (a: unknown) => string)(assignment)), "",
    "no legacy history without legacy work");
});

test("R07-REC05: booklet prompts render inside their contract home lessons", () => {
  const dataContext = { window: {} as Record<string, unknown> };
  vm.createContext(dataContext);
  vm.runInContext(readFileSync(dataPath, "utf8"), dataContext, { filename: "course-data.js" });
  const courseData = JSON.parse(JSON.stringify(dataContext.window.ABORIGINAL_STUDIES_30_DATA)) as {
    units: Array<{ id: string; lessons: Lesson[] }>;
  };
  const context = {
    DATA: courseData, console, URL, URLSearchParams,
    AB30LessonBlocks: { renderBlock: () => "", renderGoalStrip: () => "" },
  } as Record<string, unknown>;
  vm.createContext(context);
  const consts = ["units", "assignments", "themeActivities", "ASSIGNMENT_PROMPT_LESSONS"];
  const fns = ["getUnitActivity", "promptsForLesson", "escapeHtml"];
  const script = [
    ...consts.map((name) => sliceTopLevel("const", name)),
    ...fns.map((name) => sliceTopLevel("function", name)),
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-r07-homes-seam.js" });
  const seam = context as unknown as {
    getUnitActivity: (unitId: string) => unknown;
    promptsForLesson: (activity: unknown, lesson: unknown) => Prompt[];
  };
  const homes: Array<[string, string, string[]]> = [
    ["theme-2", "t2-l05-land-values", ["q2", "2-1-land-stewardship"]],
    ["theme-2", "t2-l04-resolving-claims", ["2-2-specific-land-claims"]],
    ["theme-3", "t3-l06-screens-punchlines", ["R1", "R14"]],
    ["theme-4", "t4-l02-colonial-wounds", ["4-1-comparison-chart"]],
    ["theme-4", "t4-l04-youth-future-response", ["halfbreed-chart", "4-3-personal-response"]],
    ["theme-4", "t4-l01-one-world-many-peoples", ["halfbreed-definitions"]],
    ["theme-1", "t1-l03-rights-distinctions", ["t1-glossary"]],
  ];
  for (const [unitId, lessonId, promptIds] of homes) {
    const unit = courseData.units.find((entry) => entry.id === unitId) as { lessons: Lesson[] };
    const lesson = unit.lessons.find((entry) => entry.id === lessonId) as Lesson;
    const woven = seam.promptsForLesson(seam.getUnitActivity(unitId), lesson);
    const wovenIds = woven.map((entry) => entry.id);
    for (const promptId of promptIds) {
      assert.ok(wovenIds.includes(promptId), `${promptId} renders in ${lessonId}`);
    }
  }
});

test("R07-REC06: no booklet record discloses answer keys or correctness marking", () => {
  const dump = JSON.stringify(DATA["themeActivities"]);
  assert.ok(!/answer[\s-]?key/i.test(dump), "no answer-key content");
  const names: string[] = [];
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        names.push(key);
        walk(item);
      }
    }
  };
  walk(DATA["themeActivities"]);
  const keyish = names.filter((name) => /^(answer|correct|key|solution|marking)[A-Z_]|^(answer|correct|key|solution|marking)$/i.test(name));
  assert.deepEqual(keyish, [], `no key fields: ${keyish.join(",")}`);
  for (const activity of activities) {
    for (const section of activity.sections) {
      for (const prompt of section.prompts) {
        if (prompt.kind !== "multipleChoice") continue;
        assert.ok((prompt.choices ?? []).length >= 2, `${prompt.id}: choices present`);
        assert.ok(!(prompt as Prompt & { correct?: unknown }).correct, `${prompt.id}: no correctness marking`);
      }
    }
  }
});

test("R07-REC07: editorial ledger records every R07 correction with before/after/source", () => {
  const ledger = JSON.parse(readFileSync(path.resolve(parityDir, "editorial-log.json"), "utf8")) as {
    entries: Array<Record<string, string>>;
  };
  for (let n = 1; n <= 9; n += 1) {
    const id = `E-R07-0${n}`;
    const entry = ledger.entries.find((row) => row.id === id);
    assert.ok(entry, `ledger contains ${id}`);
    for (const field of ["date", "area", "before", "after", "source", "reason"]) {
      assert.ok(entry?.[field], `${id} records ${field}`);
    }
  }
});

test("R07-REC08: Theme 1 booklet records stay frozen except the additive glossary", () => {
  const activity = activities.find((entry) => entry.id === "theme-1-online-booklet") as Activity & {
    sourceQuestionCount: number;
    responsePromptCount: number;
  };
  const numbered = activity.sections.flatMap((section) => section.prompts).filter((prompt) => prompt.number);
  assert.equal(numbered.length, 87, "Q1-87 intact");
  assert.equal(activity.sourceQuestionCount, 87);
  assert.equal(activity.responsePromptCount, 90, "89 frozen prompts plus the glossary table");
  const glossary = activity.sections.find((section) => section.id === "t1-glossary");
  assert.ok(glossary, "glossary section appended");
});
