/**
 * AB30 Lesson 7 specimen suite — R08 (v2 package teaching specimen).
 *
 * Proves the frozen candidate pattern against the real production files
 * (workspace course-data.js + lesson-components.js + practice-data.js +
 * practice-engine.js + learning-store.js + main.js slices): the specimen
 * lesson structure and completed worked reasoning, the Source N narration
 * arbitration, the reviewed 6+2 bank with pinned identities, a full
 * supported select→first→feedback→revision→exposure session through the
 * real store adapter, and first-save gating on both written tasks.
 *
 * Live-browser halves (real click delivery, screenshots, 200% zoom,
 * screen reader) are NOT_RUN in this sandbox and recorded in
 * meta/ab30-v2/evidence/R08/; DOM event handlers here are asserted
 * present and syntax-checked, per the repo seam convention.
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
const bankPath = path.resolve(workspaceDir, "practice-data.js");
const enginePath = path.resolve(workspaceDir, "practice-engine.js");
const componentsPath = path.resolve(workspaceDir, "lesson-components.js");
const stylesPath = path.resolve(workspaceDir, "styles.css");

const mainSource = readFileSync(mainPath, "utf8");
const dataSource = readFileSync(dataPath, "utf8");
const adapterSource = readFileSync(adapterPath, "utf8");
const bankSource = readFileSync(bankPath, "utf8");
const engineSource = readFileSync(enginePath, "utf8");
const componentsSource = readFileSync(componentsPath, "utf8");
const stylesSource = readFileSync(stylesPath, "utf8");

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

console.log(
  `[ab30-lesson07] tested inputs: ${JSON.stringify({
    "course-data.js": sha256Hex(dataSource),
    "lesson-components.js": sha256Hex(componentsSource),
    "practice-data.js": sha256Hex(bankSource),
    "practice-engine.js": sha256Hex(engineSource),
    "learning-store.js": sha256Hex(adapterSource),
    "main.js": sha256Hex(mainSource),
  })}`
);

type JsonRecord = Record<string, unknown>;

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

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

function loadCourseData(): JsonRecord {
  const context = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: JsonRecord } };
  vm.createContext(context);
  vm.runInContext(dataSource, context, { filename: "course-data.js" });
  const data = context.window.ABORIGINAL_STUDIES_30_DATA;
  assert.ok(data && typeof data === "object", "course-data.js must assign window.ABORIGINAL_STUDIES_30_DATA");
  return plain(data);
}

function loadBlocks(): Record<string, (...args: unknown[]) => unknown> {
  const context = { window: {} as Record<string, unknown> };
  vm.createContext(context);
  vm.runInContext(componentsSource, context, { filename: "lesson-components.js" });
  const api = context.window["AB30LessonBlocks"] as Record<string, (...args: unknown[]) => unknown>;
  assert.ok(api, "AB30LessonBlocks global exposed");
  return api;
}

const DATA = loadCourseData();
const BLOCKS = loadBlocks();

function lesson7(): JsonRecord {
  const units = DATA["units"] as Array<{ lessons?: JsonRecord[] }>;
  for (const unit of units) {
    const found = (unit.lessons || []).find((lesson) => lesson["id"] === "t1-l07-numbered-treaties");
    if (found) return found;
  }
  assert.fail("Lesson 7 must exist in course data");
}

function lesson7Blocks(): JsonRecord[] {
  const blocks = lesson7()["blocks"];
  assert.ok(Array.isArray(blocks) && blocks.length > 0, "Lesson 7 must carry v2 blocks");
  return blocks as JsonRecord[];
}

function collectStrings(value: unknown, into: string[]): void {
  if (typeof value === "string") into.push(value);
  else if (Array.isArray(value)) value.forEach((entry) => collectStrings(entry, into));
  else if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      if (key === "editorial") continue;
      collectStrings(entry, into);
    }
  }
}

// ---- Real store + bank + engine + DOM-free main.js slices -----------------

const SESSION_SLICES = [
  "practiceStore",
  "practiceEngine",
  "practiceBank",
  "supportedSelectionItem",
  "ensureSupportedRun",
];

function buildSession() {
  const backing = new Map<string, string>();
  const stubStorage = {
    getItem: (key: string): string | null => (backing.has(String(key)) ? (backing.get(String(key)) as string) : null),
    setItem: (key: string, value: string): void => {
      backing.set(String(key), String(value));
    },
    removeItem: (key: string): void => {
      backing.delete(String(key));
    },
  };
  const context = {
    DATA: plain(DATA),
    console,
    TextEncoder,
    URL,
    URLSearchParams,
    localStorage: stubStorage,
  } as Record<string, unknown>;
  vm.createContext(context);
  const script = [
    adapterSource,
    bankSource,
    engineSource,
    ...SESSION_SLICES.map((name) => sliceTopLevel(mainSource, "function", name)),
    "AB30Store.init({ storage: localStorage });",
    `globalThis.__seam = {
      supportedSelectionItem, ensureSupportedRun,
      getStore() { return AB30Store; },
      getEngine() { return AB30PracticeEngine; },
      getBank() { return AB30PracticeData; },
    };`,
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-lesson07-session.js" });
  return (context as { __seam: Record<string, (...args: unknown[]) => unknown> }).__seam;
}

// ---------------- Structure ----------------

test("L7-STRUCT: specimen version, block order, completed worked reasoning", () => {
  const lesson = lesson7();
  assert.equal(lesson["contentVersion"], "ab30-v2-l7.1");
  const blocks = lesson7Blocks();
  assert.deepEqual(plain(BLOCKS["validateLessonBlocks"](blocks)), [], "specimen blocks validate clean");
  assert.deepEqual(
    blocks.map((block) => block["type"]),
    [
      "explanation", "comparison", "explanation", "source", "explanation",
      "source", "explanation", "workedExample", "explanation",
      "supportedSelection", "independentTask", "explanation", "source",
      "explanation", "explanation", "source", "independentTask",
      "explanation", "reflection",
    ],
    "frozen teaching order: teach → organize → sources → worked → supported → N → independent → assigned"
  );
  const worked = blocks.find((block) => block["type"] === "workedExample") as JsonRecord;
  const reasoning = worked["reasoning"] as string[];
  assert.equal(reasoning.length, 4, "four visible reasoning steps");
  assert.ok(reasoning[0].includes("Source A"), "step 1 states the Source A difference");
  assert.ok(reasoning[1].includes("Source B"), "step 2 selects the Source B detail");
  assert.ok(reasoning[2].toLowerCase().includes("connection"), "step 3 explains the connection");
  assert.ok(reasoning[3].toLowerCase().includes("should not"), "step 4 limits the conclusion");
  const evidence = worked["evidence"] as Array<{ ref: string; text: string }>;
  assert.equal(evidence.length, 2, "two short adjacent passages, not repeated cards");
  assert.ok(evidence[0].ref.includes("Source A"), "first passage is Source A");
  assert.ok(evidence[1].ref.includes("Source B"), "second passage is Source B");
  const response = String(worked["response"] || "");
  assert.ok(response.includes("Source A, p. 26"), "finished response cites Source A");
  assert.ok(response.includes("Source B, p. 27"), "finished response cites Source B");
  assert.ok(response.includes("does not establish"), "finished response states the limitation");
});

// ---------------- Sources ----------------

test("L7-SOURCES: N is textbook narration; B stays a retrospective account", () => {
  const blocks = lesson7Blocks();
  const byTitle = new Map(blocks.filter((b) => b["type"] === "source").map((b) => [b["title"], b]));
  assert.deepEqual([...byTitle.keys()], ["Source A", "Source B", "Source N", "Source C"]);
  const sourceN = byTitle.get("Source N") as JsonRecord;
  assert.equal(sourceN["sourceType"], "Textbook narration");
  assert.ok(!sourceN["speaker"], "Source N names no speaker (the Q79/narrator arbitration)");
  assert.ok(String(sourceN["creator"] || "").includes("narrator"), "Source N creator is the textbook narrator");
  assert.ok(
    String(sourceN["contextLimits"] || "").includes("outside Ahnassay"),
    "Source N limits state the quotation boundary"
  );
  const sourceB = byTitle.get("Source B") as JsonRecord;
  assert.equal(sourceB["speaker"], "James Ahnassay");
  assert.ok(String(sourceB["nation"] || "").includes("Tha"), "Source B names the Nation");
  assert.equal(sourceB["sourceType"], "Published retrospective account");
  assert.ok(
    String(sourceB["extract"] || "").includes("heard"),
    "Source B keeps the reported-memory marker"
  );
  assert.ok(
    String(sourceB["contextLimits"] || "").includes("not eyewitness"),
    "Source B limits deny eyewitness scope"
  );
  for (const title of ["Source A", "Source C"]) {
    const source = byTitle.get(title) as JsonRecord;
    assert.equal(source["sourceType"], "Textbook narration", `${title} is narration, not quotation`);
    assert.ok(!source["speaker"], `${title} names no speaker`);
  }
});

test("L7-LANGUAGE: no reconciliation narration or authoring shorthand on the learner surface", () => {
  const lesson = lesson7();
  const prose: string[] = [];
  collectStrings({ goal: lesson["goal"], terms: lesson["terms"], blocks: lesson["blocks"] }, prose);
  const text = prose.join("\n");
  for (const banned of [
    "Earlier notes",
    "answer key differs",
    "load-bearing",
    "classic drift",
    "Compare, do not despair",
    "read the source band",
    "gate packet",
    "source band",
    "drift",
  ]) {
    assert.ok(!text.includes(banned), `learner surface must not contain: ${banned}`);
  }
});

// ---------------- Bank ----------------

const EXPECTED_OBJECTIVE_IDS = [
  "ab30-v2-l7-concept-1",
  "ab30-v2-l7-concept-2",
  "ab30-v2-l7-evidence-1",
  "ab30-v2-l7-evidence-2",
  "ab30-v2-l7-application-1",
  "ab30-v2-l7-application-2",
];
const EXPECTED_WRITTEN_IDS = ["ab30-v2-l7-independent-1", "ab30-v2-l7-independent-2"];

function loadBank(): Record<string, (...args: unknown[]) => unknown> & { ITEMS: JsonRecord[]; MODES: JsonRecord[]; BANK_VERSION: string } {
  const context = { window: {} as Record<string, unknown> };
  vm.createContext(context);
  vm.runInContext(bankSource, context, { filename: "practice-data.js" });
  return context.window["AB30PracticeData"] as Record<string, (...args: unknown[]) => unknown> & {
    ITEMS: JsonRecord[]; MODES: JsonRecord[]; BANK_VERSION: string;
  };
}

test("L7-BANK: 6 objective + 2 written reviewed items with pinned identities", () => {
  const bank = loadBank();
  assert.equal(bank.BANK_VERSION, "ab30-practice-bank-v1");
  const l7Items = plain(bank["itemsForLesson"]("t1-l07-numbered-treaties")) as JsonRecord[];
  assert.deepEqual(
    l7Items.map((item) => item["id"]),
    [...EXPECTED_OBJECTIVE_IDS, ...EXPECTED_WRITTEN_IDS],
    "exactly the 8 specimen items, in specimen order"
  );
  for (const item of l7Items) {
    assert.equal(item["lessonId"], "t1-l07-numbered-treaties", `${item["id"]} lesson pinned`);
    assert.equal(item["contentVersion"], "1", `${item["id"]} content version pinned`);
    assert.equal(item["reviewed"], true, `${item["id"]} reviewed`);
    assert.equal(item["formalMarks"], null, `${item["id"]} carries no marks`);
    assert.equal(item["compulsory"], false, `${item["id"]} is formative`);
    assert.ok(
      Array.isArray(item["sourceIds"]) && (item["sourceIds"] as string[]).length > 0,
      `${item["id"]} pins its sources`
    );
  }
  const objective = l7Items.filter((item) => item["mode"] === "multipleChoice");
  assert.equal(objective.length, 6, "six objective items");
  for (const item of objective) {
    assert.equal(item["mode"], "multipleChoice");
    const options = item["options"] as Array<{ id: string; text: string }>;
    assert.deepEqual(
      plain(options.map((option) => option.id)),
      ["a", "b", "c"],
      `${item["id"]} pins option identities a/b/c`
    );
    assert.ok(["a", "b", "c"].includes(String(item["correctOptionId"])), `${item["id"]} key is a pinned option`);
    const feedback = item["feedbackByOption"] as Record<string, string>;
    for (const id of ["a", "b", "c"]) {
      assert.ok(typeof feedback[id] === "string" && feedback[id].trim().length > 0, `${item["id"]} feedback for ${id}`);
    }
  }
  const written = l7Items.filter((item) => item["mode"] === "written");
  assert.equal(written.length, 2, "two written items");
  for (const item of written) {
    assert.equal(item["mode"], "written");
    assert.equal(item["automaticScore"], false, `${item["id"]} is never auto-graded`);
    assert.ok(
      Array.isArray(item["criteria"]) && (item["criteria"] as string[]).length === 3,
      `${item["id"]} carries three criteria`
    );
  }
  const modes = bank.MODES as JsonRecord[];
  const selected = modes.find((mode) => mode["id"] === "selected-response") as JsonRecord;
  assert.equal(selected["offered"], false, "catalogue entry stays honestly not-offered until R29");
  assert.ok(String(selected["reason"] || "").includes("R29"), "reason names the owning ticket");
  const writtenMode = modes.find((mode) => mode["id"] === "written-comparison") as JsonRecord;
  assert.equal(writtenMode["offered"], false, "no model responses, no written-comparison offer");
});

test("L7-BANK-SYNC: the in-lesson selection copies the bank item exactly", () => {
  const bank = loadBank();
  const bankItem = plain(bank["itemById"]("ab30-v2-l7-evidence-2")) as JsonRecord;
  assert.ok(bankItem, "bank holds the supported item");
  const block = lesson7Blocks().find((entry) => entry["type"] === "supportedSelection") as JsonRecord;
  assert.ok(block, "lesson holds the supported selection");
  assert.equal(block["itemId"], "ab30-v2-l7-evidence-2");
  assert.equal(block["contentVersion"], "ab30-practice-bank-v1:1", "section pins the engine version");
  assert.equal(block["prompt"], bankItem["prompt"], "prompt in sync");
  assert.deepEqual(plain(block["options"]), plain(bankItem["options"]), "options in sync");
  assert.equal(block["key"], bankItem["correctOptionId"], "key in sync");
  assert.deepEqual(plain(block["feedbackByOption"]), plain(bankItem["feedbackByOption"]), "feedback in sync");
});

// ---------------- Session ----------------

test("L7-SESSION: wrong first → feedback → correct revision → exposure, first immutable", () => {
  const seam = buildSession();
  const store = seam["getStore"]() as Record<string, (...args: unknown[]) => unknown>;
  const engine = seam["getEngine"]() as Record<string, (...args: unknown[]) => unknown>;
  const bank = seam["getBank"]() as Record<string, (...args: unknown[]) => unknown>;
  const bankItem = plain(bank["itemById"]("ab30-v2-l7-evidence-2")) as JsonRecord;

  const item = plain(seam["supportedSelectionItem"]("ab30-v2-l7-evidence-2")) as JsonRecord;
  assert.ok(item, "production slice builds the engine item");
  assert.equal(item["id"], "ab30-v2-l7-evidence-2");
  assert.equal(item["mode"], "selected-response");
  assert.equal(item["version"], "ab30-practice-bank-v1:1");
  assert.deepEqual(item["optionOrder"], ["a", "b", "c"], "authored order pinned");
  assert.deepEqual((item["stimulus"] as JsonRecord)["sourceIds"], ["L7-B"], "source pinned");
  assert.equal((item["stimulus"] as JsonRecord)["stimulusId"], "l7-evidence-2");
  assert.deepEqual(
    plain((engine["eligibleItems"] as (items: unknown[]) => unknown)([item])) as { excluded: unknown[] },
    { eligible: [item], excluded: [] } as unknown,
    "reviewed specimen item is eligible"
  );

  const started = plain(seam["ensureSupportedRun"](store, engine, item)) as {
    ok: boolean; reused?: boolean; run: JsonRecord;
  };
  assert.equal(started.ok, true, "supported run starts");
  assert.equal(started.run["mode"], "selected-response");
  assert.equal(started.run["attemptMode"], "supported");
  assert.deepEqual(started.run["itemIds"], ["ab30-v2-l7-evidence-2"]);
  assert.deepEqual(started.run["optionOrders"], [["a", "b", "c"]], "run records what was shown");

  const taskId = String(engine["practiceTaskId"](item));
  assert.equal(taskId, "practice:ab30-practice-bank-v1:1:ab30-v2-l7-evidence-2");

  const first = plain(
    (engine["submitFirst"] as (store: unknown, run: unknown, item: unknown, input: unknown) => unknown)(
      store, started.run, item, { response: "", selectedOptions: ["a"] }
    )
  ) as { ok: boolean; attemptId: string; feedback: { correct: boolean; text: string } };
  assert.equal(first.ok, true, "intentionally wrong first persists");
  assert.equal(first.feedback.correct, false, "wrong choice judges wrong");
  assert.equal(
    first.feedback.text,
    (bankItem["feedbackByOption"] as Record<string, string>)["a"],
    "wrong choice gets its own reviewed feedback"
  );
  const exposed = plain(engine["recordExposure"](store, item["id"], `feedback:${first.attemptId}`)) as { ok: boolean };
  assert.equal(exposed.ok, true, "exposure recorded");

  const reused = plain(seam["ensureSupportedRun"](store, engine, item)) as { ok: boolean; reused: boolean; run: JsonRecord };
  assert.equal(reused.reused, true, "second check reuses the open run");
  assert.equal(reused.run["id"], started.run["id"], "same run, no duplicates");

  const firstAttemptId = ((reused.run["attemptIds"] as Record<string, string[]>)[taskId] || [])[0];
  assert.ok(firstAttemptId, "first attempt id recorded on the run");
  const revision = plain(
    (engine["submitRevision"] as (
      store: unknown, run: unknown, item: unknown, firstId: string, input: unknown
    ) => unknown)(store, reused.run, item, firstAttemptId, { response: "", selectedOptions: ["b"] })
  ) as { ok: boolean; attemptId: string; feedback: { correct: boolean; text: string } };
  assert.equal(revision.ok, true, "correct revision persists");
  assert.equal(revision.feedback.correct, true, "correct choice judges correct");
  assert.equal(
    revision.feedback.text,
    (bankItem["feedbackByOption"] as Record<string, string>)["b"],
    "correct choice gets its own reviewed feedback"
  );

  const storedFirst = plain(store["getPracticeAttempt"](firstAttemptId)) as {
    selectedOptions: string[]; role: string;
  };
  assert.deepEqual(storedFirst.selectedOptions, ["a"], "first attempt immutable after revision");
  assert.equal(storedFirst.role, "first");
  const exposure = plain(store["getPracticeExposure"]()) as Record<string, string>;
  assert.ok(exposure["ab30-v2-l7-evidence-2"], "item stays exposure-flagged");
});

test("L7-SESSION-GATE: unreviewed and written items never map to selections", () => {
  const seam = buildSession();
  const engine = seam["getEngine"]() as Record<string, (...args: unknown[]) => unknown>;
  const bank = seam["getBank"]() as Record<string, (...args: unknown[]) => unknown>;
  const build = engine["buildSelectedResponseItems"] as (
    items: unknown[], seed: unknown, version: string, exposed: Record<string, string>
  ) => JsonRecord[];
  const evidence2 = plain(bank["itemById"]("ab30-v2-l7-evidence-2")) as JsonRecord;
  const written1 = plain(bank["itemById"]("ab30-v2-l7-independent-1")) as JsonRecord;
  assert.equal(build([written1], "s", "v", {}).length, 0, "written items never become selections");
  assert.equal(
    build([{ ...evidence2, reviewed: false }], "s", "v", {}).length,
    0,
    "unreviewed items never map"
  );
  assert.equal(
    build([{ ...evidence2, feedbackByOption: { a: "only" } }], "s", "v", {}).length,
    1,
    "mapping is structural; the eligibility gate below still bites"
  );
  const gate = plain(
    (engine["eligibleItems"] as (items: unknown[]) => unknown)(
      build([{ ...evidence2, feedbackByOption: { a: "only" } }], "s", "v", {})
    )
  ) as { eligible: unknown[]; excluded: Array<{ reasons: string[] }> };
  assert.equal(gate.eligible.length, 0, "partial feedback is ineligible");
  assert.ok(gate.excluded[0].reasons.includes("missing-feedback"), "reason names the gap");
});

// ---------------- Gating ----------------

test("L7-GATING: both written tasks lock criteria until an explicit first save", () => {
  const blocks = lesson7Blocks();
  const tasks = blocks.filter((block) => block["type"] === "independentTask");
  assert.deepEqual(
    tasks.map((task) => task["responseKey"]),
    ["t1-l07-numbered-treaties::supported-repair", "t1-l07-numbered-treaties::independent-language-gap"],
    "repair plus independent keys, no duplicates"
  );
  for (const task of tasks) {
    assert.equal(task["contentVersion"], "ab30-v2-l7.1", `${task["responseKey"]} version pinned`);
    const locked = String(BLOCKS["renderBlock"](task, 0, {}));
    assert.ok(locked.includes("task-criteria-locked"), `${task["responseKey"]} locked before a save`);
    assert.ok(
      !locked.includes('data-testid="comparison-criteria"'),
      `${task["responseKey"]} reveals no criteria body before a save`
    );
    assert.ok(
      locked.includes("data-criteria="),
      `${task["responseKey"]} carries the no-rerender criteria payload`
    );
    const unlocked = String(
      BLOCKS["renderBlock"](task, 0, {
        formativeResponse: () => "SYNTH draft.",
        submissionsForTask: () => [{ id: "sub:1", text: "SYNTH first.", parentAttemptId: null }],
      })
    );
    assert.ok(unlocked.includes('data-testid="comparison-toggle"'), `${task["responseKey"]} toggle after save`);
    assert.ok(
      unlocked.includes(String(task["criteria"] || "").slice(0, 40)),
      `${task["responseKey"]} criteria rendered after save`
    );
    assert.ok(unlocked.includes('data-testid="save-revision"'), `${task["responseKey"]} revision offered`);
  }
  const repair = tasks[0];
  assert.equal(repair["sectionLabel"], "Supported practice", "repair reads as supported practice");
});

test("L7-WORKLOAD: repair and independent keys are formative, never compulsory", () => {
  const roleSource = [
    sliceTopLevel(mainSource, "const", "themeActivities"),
    sliceTopLevel(mainSource, "const", "assignments"),
    sliceTopLevel(mainSource, "const", "BOOKLET_SHELL_ASSIGNMENT_IDS"),
    sliceTopLevel(mainSource, "function", "roleForRequirement"),
    sliceTopLevel(mainSource, "function", "isKnownLegacyRequirement"),
    sliceTopLevel(mainSource, "function", "requirementItems"),
    "globalThis.__roleFor = roleForRequirement;",
  ].join("\n\n");
  const context = { window: {} as Record<string, unknown>, console } as Record<string, unknown>;
  vm.createContext(context);
  const courseContext = { window: {} as Record<string, unknown> };
  vm.createContext(courseContext);
  vm.runInContext(dataSource, courseContext, { filename: "course-data.js" });
  (context as Record<string, unknown>)["DATA"] = plain(
    (courseContext.window as { ABORIGINAL_STUDIES_30_DATA: unknown }).ABORIGINAL_STUDIES_30_DATA
  );
  // themeActivities derives from DATA in production; REQUIREMENT_ROLE_OVERRIDES
  // defaults to empty when the slice omits it.
  vm.runInContext("var REQUIREMENT_ROLE_OVERRIDES = {};", context, { filename: "ab30-lesson07-rolesetup.js" });
  const needsActivities = !mainSource.includes("const themeActivities =");
  if (needsActivities) {
    vm.runInContext("var themeActivities = [];", context, { filename: "ab30-lesson07-activitysetup.js" });
  }
  vm.runInContext(roleSource, context, { filename: "ab30-lesson07-role.js" });
  const roleFor = (context as { __roleFor: (id: string) => string }).__roleFor;
  assert.equal(roleFor("t1-l07-numbered-treaties::supported-repair"), "formative");
  assert.equal(roleFor("t1-l07-numbered-treaties::independent-language-gap"), "formative");
  assert.equal(roleFor("booklet:theme-1-online-booklet:q28"), "legacyAssigned", "assigned role preserved");
});

// ---------------- Handler presence ----------------

test("LESSON-FREEZE: R09-frozen pilot bytes unchanged", () => {
  const freezePath = path.resolve(
    "projects", "aboriginal-studies-30", "meta", "ab30-v2", "evidence", "R09", "pattern-freeze.json"
  );
  const freeze = JSON.parse(readFileSync(freezePath, "utf8")) as {
    files: Record<string, string>; records: Record<string, string>;
  };
  assert.equal(sha256Hex(componentsSource), freeze.files["lesson-components.js"], "components frozen");
  assert.equal(sha256Hex(engineSource), freeze.files["practice-engine.js"], "engine frozen");
  assert.equal(sha256Hex(mainSource), freeze.files["main.js"], "main frozen");
  assert.equal(sha256Hex(stylesSource), freeze.files["styles.css"], "styles frozen");
  assert.equal(
    sha256Hex(JSON.stringify(lesson7())),
    freeze.records["t1-l07-numbered-treaties"],
    "Lesson 7 record frozen (R10-R28 batches must not alter the pilot)"
  );
  const bank = loadBank();
  assert.equal(
    sha256Hex(JSON.stringify(bank["itemsForLesson"]("t1-l07-numbered-treaties"))),
    freeze.records["bank:l7-items"],
    "Lesson 7 bank items frozen"
  );
});

test("L7-HANDLERS: check wiring present, syntax-checked; styles cover the controls", () => {
  for (const name of ["supportedCheckReady", "supportedCheckFromSection", "bindSupportedSelections", "selectedResponseItemFromRun"]) {
    const slice = sliceTopLevel(mainSource, "function", name);
    assert.ok(slice.includes(name), `${name} slice non-trivial`);
  }
  assert.ok(mainSource.includes("bindSupportedSelections();"), "check binding runs with lesson binding");
  for (const selector of [".supported-options", ".supported-choice", ".supported-feedback", ".supported-review-note"]) {
    assert.ok(stylesSource.includes(selector), `stylesheet covers ${selector}`);
  }
  const open = (stylesSource.match(/{/g) || []).length;
  const close = (stylesSource.match(/}/g) || []).length;
  assert.equal(open, close, "stylesheet braces balance");
});
