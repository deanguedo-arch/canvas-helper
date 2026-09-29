/**
 * AB30-MUSE R28 batch suite — copy-lane Theme 4 lessons 48-50 (v2).
 *
 * Proves per lesson against the Muse copy production files: versioned v2
 * structure with valid blocks, source extracts structurally pinned with
 * printed+PDF locators (no fixture band covers ch7 pp226-233, the booklet
 * p.21, or the Halfbreed excerpt, so live-text byte-verification is
 * recorded as a rollout gap in the R28-copy record), full attribution
 * incl. creator and context limits with the memoir voice named,
 * completed worked reasoning with evidence refs resolving to exact card
 * titles, the 6+2 reviewed bank with resolvable source codes, first-save
 * gating on both written tasks, formative workload roles,
 * evidence-language feedback, and byte-pinned assigned records
 * (Theme 4 q18-q22 plus the 4-3 assignment link).
 *
 * This suite is scoped to projects/aboriginal-studies-30-muse and never
 * touches canonical files. Runners: `node --test <this file>`.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30-muse", "workspace");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const bankPath = path.resolve(workspaceDir, "practice-data.js");
const enginePath = path.resolve(workspaceDir, "practice-engine.js");
const componentsPath = path.resolve(workspaceDir, "lesson-components.js");
const textbookBandPath = path.resolve(
  "scripts", "tests", "fixtures", "ab30-parity", "textbook-ch7-pp218-225.txt"
);

const dataSource = readFileSync(dataPath, "utf8");
const bankSource = readFileSync(bankPath, "utf8");
const engineSource = readFileSync(enginePath, "utf8");
const componentsSource = readFileSync(componentsPath, "utf8");

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

console.log(
  `[ab30-muse-r28] tested inputs: ${JSON.stringify({
    "course-data.js": sha256Hex(dataSource),
    "practice-data.js": sha256Hex(bankSource),
  })}`
);

type JsonRecord = Record<string, unknown>;

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function quoteNorm(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’"“”«»"'']/g, "")
    .replace(/[–—]/g, " ")
    .replace(/-\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function loadCourseData(): JsonRecord {
  const context = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: JsonRecord } };
  vm.createContext(context);
  vm.runInContext(dataSource, context, { filename: "course-data.js" });
  const data = context.window.ABORIGINAL_STUDIES_30_DATA;
  assert.ok(data && typeof data === "object", "course data must load");
  return plain(data);
}

function loadBlocks(): Record<string, (...args: unknown[]) => unknown> {
  const context = { window: {} as Record<string, unknown> };
  vm.createContext(context);
  vm.runInContext(componentsSource, context, { filename: "lesson-components.js" });
  return context.window["AB30LessonBlocks"] as Record<string, (...args: unknown[]) => unknown>;
}

function loadBank(): Record<string, (...args: unknown[]) => unknown> & { ITEMS: JsonRecord[] } {
  const context = { window: {} as Record<string, unknown> };
  vm.createContext(context);
  vm.runInContext(bankSource, context, { filename: "practice-data.js" });
  return context.window["AB30PracticeData"] as Record<string, (...args: unknown[]) => unknown> & {
    ITEMS: JsonRecord[];
  };
}

function loadEngine(): Record<string, (...args: unknown[]) => unknown> {
  const context = { window: {} as Record<string, unknown> };
  vm.createContext(context);
  vm.runInContext(engineSource, context, { filename: "practice-engine.js" });
  return context.window["AB30PracticeEngine"] as Record<string, (...args: unknown[]) => unknown>;
}

const DATA = loadCourseData();
const BLOCKS = loadBlocks();
const TEXTBOOK_BAND = quoteNorm(readFileSync(textbookBandPath, "utf8"));

interface BatchLesson {
  lessonId: string;
  contentVersion: string;
  bookletQuestionIds: string[];
  supportedItemId: string;
  sourceTitles: string[];
  sourceTypes: string[];
  textbookLabel: string;
  assignmentIds: string[];
  assignmentHomeIds: string[];
}

const BATCH: BatchLesson[] = [
  {
    lessonId: "t4-l03-land-resources-un",
    contentVersion: "ab30-v2-l48.1",
    bookletQuestionIds: ["q18", "q19", "q20"],
    supportedItemId: "ab30-v2-l48-route-1",
    sourceTitles: [
      "Source A · response to UN findings",
      "Source B · UN purposes and limits",
      "Source C · Indigenous participation",
    ],
    sourceTypes: [
      "Textbook historical account",
      "Textbook institutional summary",
      "Textbook institutional summary",
    ],
    textbookLabel: "Textbook Chapter 7, pages 226–229",
    assignmentIds: [],
    assignmentHomeIds: [],
  },
  {
    lessonId: "t4-l07-education-odds",
    contentVersion: "ab30-v2-l49.1",
    bookletQuestionIds: ["q21", "q22"],
    supportedItemId: "ab30-v2-l49-voice-1",
    sourceTitles: [
      "Source A · textbook education figures",
      "Source B · Perkins’s organizing",
      "Source C · international learning exchange",
    ],
    sourceTypes: ["Dated textbook summary", "Textbook profile", "Textbook program example"],
    textbookLabel: "Textbook Chapter 7, pages 230–233",
    assignmentIds: [],
    assignmentHomeIds: [],
  },
  {
    lessonId: "t4-l04-youth-future-response",
    contentVersion: "ab30-v2-l50.1",
    bookletQuestionIds: [],
    supportedItemId: "ab30-v2-l50-plan-1",
    sourceTitles: ["Source A · the official Assignment 4.3", "Source B · Campbell’s Introduction"],
    sourceTypes: ["Theme 4 booklet prompt", "Memoir excerpt"],
    textbookLabel: "Theme 4 booklet, Assignment 4.3, p. 21; Halfbreed (2019 edition supplied)",
    assignmentIds: ["4-3-personal-response"],
    assignmentHomeIds: ["4-3-personal-response"],
  },
];

function lessonById(lessonId: string): JsonRecord {
  const units = DATA["units"] as Array<{ lessons?: JsonRecord[] }>;
  for (const unit of units) {
    const found = (unit.lessons || []).find((lesson) => lesson["id"] === lessonId);
    if (found) return found;
  }
  assert.fail(`lesson ${lessonId} must exist`);
}

function sourceCards(lessonId: string): JsonRecord[] {
  return (lessonById(lessonId)["blocks"] as JsonRecord[]).filter((block) => block["type"] === "source");
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

// ---------------- Structure ----------------

test("M28-STRUCT: versioned v2 lessons with valid frozen-pattern blocks", () => {
  for (const spec of BATCH) {
    const lesson = lessonById(spec.lessonId);
    assert.equal(lesson["contentVersion"], spec.contentVersion, `${spec.lessonId} version`);
    const blocks = lesson["blocks"] as JsonRecord[];
    assert.ok(Array.isArray(blocks) && blocks.length >= 10, `${spec.lessonId} carries v2 blocks`);
    assert.deepEqual(plain(BLOCKS["validateLessonBlocks"](blocks)), [], `${spec.lessonId} blocks validate clean`);
    const types = blocks.map((block) => block["type"]);
    for (const needed of [
      "explanation",
      "source",
      "workedExample",
      "supportedSelection",
      "independentTask",
      "reflection",
    ]) {
      assert.ok(types.includes(needed), `${spec.lessonId} must include a ${needed} block`);
    }
    assert.ok(!types.includes("supportedPractice"), `${spec.lessonId}: no static reveal`);
    assert.ok(!types.includes("figure"), `${spec.lessonId}: no figure without reviewed media`);
    assert.ok(!types.includes("assignmentConnection"), `${spec.lessonId}: assignment links ride on ids, not blocks`);
    const tasks = blocks.filter((block) => block["type"] === "independentTask");
    assert.equal(tasks.length, 2, `${spec.lessonId}: repair plus independent tasks`);
    assert.deepEqual(
      plain(lesson["bookletQuestionIds"]),
      spec.bookletQuestionIds,
      `${spec.lessonId} assigned homes intact`
    );
    assert.deepEqual(plain(lesson["assignmentIds"]), spec.assignmentIds, `${spec.lessonId} assignment links intact`);
    assert.deepEqual(
      plain(lesson["assignmentHomeIds"]),
      spec.assignmentHomeIds,
      `${spec.lessonId} assignment homes intact`
    );
    const cards = sourceCards(spec.lessonId);
    assert.deepEqual(
      cards.map((block) => block["title"]),
      spec.sourceTitles,
      `${spec.lessonId} card titles pinned`
    );
    assert.deepEqual(
      cards.map((block) => block["sourceType"]),
      spec.sourceTypes,
      `${spec.lessonId} card kinds pinned`
    );
    assert.equal(
      (lesson["textbook"] as JsonRecord)["label"],
      spec.textbookLabel,
      `${spec.lessonId} source label pinned`
    );
  }
  assert.ok(
    existsSync(path.resolve(workspaceDir, "assets", "assignments", "docx", "4-3-personal-response.docx")),
    "L50 assignment asset exists in the copy"
  );
});

// ---------------- Quotes ----------------

// No fixture band covers the R28 sources (ch7 pp226-233, booklet p.21,
// Halfbreed intro), so extracts pin structurally: substantial quotes
// with printed+PDF locators. The ch7 band is wired only as a scoping
// control: R28 quotes must NOT match it (wrong-band detection).
test("M28-QUOTES: extracts substantial with printed+PDF locators; band scoping holds", () => {
  assert.ok(TEXTBOOK_BAND.length > 1000, "textbook band fixture loads");
  for (const spec of BATCH) {
    for (const source of sourceCards(spec.lessonId)) {
      const title = String(source["title"]);
      const extract = quoteNorm(String(source["extract"] || ""));
      assert.ok(extract.length > 40, `${spec.lessonId} ${title} extract is substantial`);
      assert.ok(!TEXTBOOK_BAND.includes(extract), `${spec.lessonId} ${title} is outside the pp218-225 band`);
      const locator = String(source["locator"] || "");
      if (spec.lessonId === "t4-l04-youth-future-response") {
        assert.ok(
          /Theme 4 booklet, printed p\. 21|Halfbreed.*PDF pp\. 23–24/.test(locator),
          `${spec.lessonId} ${title} locator pins booklet/Halfbreed pages`
        );
      } else {
        assert.ok(
          /Chapter 7, printed p\. \d+ \(supplied PDF p\. \d+\)/.test(locator),
          `${spec.lessonId} ${title} locator pins printed+PDF pages`
        );
      }
    }
  }
  // Controls: tampered quotations must fail band checks the same way.
  const mutated = quoteNorm("The agent controlled the proceedings in the year 1901.");
  assert.ok(!TEXTBOOK_BAND.includes(mutated), "verification bites on invented wording");
});

// ---------------- Attribution ----------------

test("M28-SOURCES: full attribution; memoir voice named, others speaker-free", () => {
  for (const spec of BATCH) {
    for (const source of sourceCards(spec.lessonId)) {
      const label = `${spec.lessonId} ${source["title"]}`;
      for (const field of ["extract", "sourceType", "locator", "attribution", "creator", "contextLimits"]) {
        assert.ok(
          typeof source[field] === "string" && (source[field] as string).trim().length > 0,
          `${label} needs ${field}`
        );
      }
    }
  }
  const campbell = sourceCards("t4-l04-youth-future-response").find(
    (card) => card["title"] === "Source B · Campbell’s Introduction"
  ) as JsonRecord;
  assert.equal(campbell["speaker"], "Maria Campbell", "L50 Source B names Campbell");
  assert.equal(campbell["creator"], "Maria Campbell", "L50 Source B names its creator");
  for (const spec of BATCH) {
    for (const source of sourceCards(spec.lessonId)) {
      if (source["title"] === "Source B · Campbell’s Introduction") continue;
      assert.ok(!source["speaker"], `${spec.lessonId} ${source["title"]} names no speaker`);
    }
  }
});

// ---------------- Worked ----------------

test("M28-WORKED: each lesson completes its reasoning visibly with resolvable refs", () => {
  for (const spec of BATCH) {
    const lesson = lessonById(spec.lessonId);
    const worked = (lesson["blocks"] as JsonRecord[]).find((block) => block["type"] === "workedExample") as JsonRecord;
    assert.ok(worked, `${spec.lessonId} has a worked example`);
    const evidence = worked["evidence"] as Array<{ ref: string; text: string }>;
    assert.ok(evidence.length >= 1 && evidence.length <= 2, `${spec.lessonId}: one or two short passages`);
    const titles = new Set(spec.sourceTitles);
    for (const item of evidence) {
      assert.ok(item.ref && item.text, `${spec.lessonId}: evidence carries ref and text`);
      assert.ok(titles.has(item.ref), `${spec.lessonId}: evidence ref resolves to a card (${item.ref})`);
    }
    const reasoning = worked["reasoning"] as string[];
    // R27/R28 variance (recorded): repair-oriented 3-step reasoning.
    assert.equal(reasoning.length, 3, `${spec.lessonId}: three visible steps`);
    const response = String(worked["response"] || "");
    assert.ok(response.length > 200, `${spec.lessonId}: finished response is substantial`);
    assert.ok(/Sources? [A-Z]/.test(response), `${spec.lessonId}: response cites its sources`);
  }
});

// ---------------- Supported sync ----------------

test("M28-SYNC: in-lesson selections copy their bank items exactly", () => {
  const bank = loadBank();
  for (const spec of BATCH) {
    const bankItem = plain(bank["itemById"](spec.supportedItemId)) as JsonRecord;
    assert.ok(bankItem, `bank holds ${spec.supportedItemId}`);
    const lesson = lessonById(spec.lessonId);
    const block = (lesson["blocks"] as JsonRecord[]).find(
      (entry) => entry["type"] === "supportedSelection"
    ) as JsonRecord;
    assert.ok(block, `${spec.lessonId} holds its supported selection`);
    assert.equal(block["itemId"], spec.supportedItemId);
    assert.equal(block["contentVersion"], "ab30-practice-bank-v1:1", `${spec.lessonId} pins the engine version`);
    assert.equal(block["prompt"], bankItem["prompt"], `${spec.lessonId} prompt in sync`);
    assert.deepEqual(plain(block["options"]), plain(bankItem["options"]), `${spec.lessonId} options in sync`);
    assert.equal(block["key"], bankItem["correctOptionId"], `${spec.lessonId} key in sync`);
    assert.deepEqual(
      plain(block["feedbackByOption"]),
      plain(bankItem["feedbackByOption"]),
      `${spec.lessonId} feedback in sync`
    );
  }
});

// ---------------- Bank ----------------

// Copy-lane source-code registry extended through R28. Card codes
// (L48-A) resolve to lesson source cards by letter prefix; booklet and
// textbook page codes resolve as in the R27 suite.
const T2_LESSONS: Record<string, string> = {
  "44": "t4-l01-one-world-many-peoples",
  "45": "t4-l05-nine-issues",
  "46": "t4-l02-colonial-wounds",
  "47": "t4-l06-resources-conflict",
  "48": "t4-l03-land-resources-un",
  "49": "t4-l07-education-odds",
  "50": "t4-l04-youth-future-response",
};

function textbookRange(lessonId: string): [number, number] | null {
  const label = String((lessonById(lessonId)["textbook"] as JsonRecord)["label"] || "");
  const match = label.match(/pages (\d+)[–-](\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

function bookletExists(): boolean {
  const activities = DATA["themeActivities"] as Array<{ id: string }>;
  return activities.some((activity) => activity.id === "theme-4-online-booklet");
}

function codeExists(code: string, lessonId: string): boolean {
  const card = code.match(/^L0?([0-9]{1,2})-([A-Z])$/);
  if (card) {
    const mapped = T2_LESSONS[String(Number(card[1]))];
    if (mapped !== lessonId) return false;
    return sourceCards(lessonId).some((entry) => String(entry["title"]).startsWith(`Source ${card[2]}`));
  }
  const booklet = code.match(/^L0?([0-9]{1,2})-booklet-p(\d+)$/);
  if (booklet) {
    return T2_LESSONS[String(Number(booklet[1]))] === lessonId && bookletExists();
  }
  const page = code.match(/^L0?([0-9]{1,2})-textbook-p(\d+)$/);
  if (page) {
    if (T2_LESSONS[String(Number(page[1]))] !== lessonId) return false;
    const range = textbookRange(lessonId);
    if (!range) return false;
    return Number(page[2]) >= range[0] && Number(page[2]) <= range[1];
  }
  return false;
}

test("M28-BANK: 6+2 reviewed items per lesson with resolvable sources", () => {
  const bank = loadBank();
  const engine = loadEngine();
  for (const spec of BATCH) {
    const items = plain(bank["itemsForLesson"](spec.lessonId)) as JsonRecord[];
    assert.equal(items.length, 8, `${spec.lessonId}: exactly 8 items`);
    const objective = items.filter((item) => item["mode"] === "multipleChoice");
    const written = items.filter((item) => item["mode"] === "written");
    assert.equal(objective.length, 6, `${spec.lessonId}: six objective items`);
    assert.equal(written.length, 2, `${spec.lessonId}: two written items`);
    assert.equal(
      new Set(objective.map((item) => item["stimulusId"])).size,
      6,
      `${spec.lessonId}: six distinct stimuli, not shuffles`
    );
    assert.equal(
      new Set(objective.map((item) => item["familyId"])).size,
      6,
      `${spec.lessonId}: six distinct reasoning families`
    );
    for (const item of items) {
      assert.equal(item["reviewed"], true, `${item["id"]} reviewed`);
      assert.equal(item["formalMarks"], null, `${item["id"]} carries no marks`);
      assert.equal(item["compulsory"], false, `${item["id"]} is formative`);
      assert.ok(
        Array.isArray(item["sourceIds"]) && (item["sourceIds"] as string[]).length > 0,
        `${item["id"]} pins its sources`
      );
      for (const sourceId of item["sourceIds"] as string[]) {
        assert.ok(codeExists(sourceId as string, spec.lessonId), `${item["id"]} ${sourceId} resolves`);
      }
    }
    for (const item of objective) {
      const options = item["options"] as Array<{ id: string }>;
      assert.deepEqual(
        options.map((option) => option.id),
        ["a", "b", "c"],
        `${item["id"]} pins option identities`
      );
      assert.ok(["a", "b", "c"].includes(String(item["correctOptionId"])), `${item["id"]} key is a pinned option`);
    }
    for (const item of written) {
      assert.equal(item["automaticScore"], false, `${item["id"]} never auto-graded`);
      assert.equal((item["criteria"] as string[]).length, 3, `${item["id"]} carries three criteria`);
    }
    const mapped = (
      engine["buildSelectedResponseItems"] as (
        items: unknown[], seed: string, version: string, exposed: Record<string, string>
      ) => JsonRecord[]
    )(objective, spec.lessonId, "ab30-practice-bank-v1", {});
    const gate = plain(
      (engine["eligibleItems"] as (items: unknown[]) => unknown)(mapped)
    ) as { eligible: unknown[]; excluded: unknown[] };
    assert.equal(gate.eligible.length, 6, `${spec.lessonId}: all six map and pass eligibility`);
    assert.equal(gate.excluded.length, 0, `${spec.lessonId}: nothing excluded`);
    for (const item of mapped) {
      const key = String((objective.find((entry) => entry["id"] === item["id"]) as JsonRecord)["correctOptionId"]);
      const judged = (
        engine["feedbackFor"] as (item: unknown, optionId: string) => { correct: boolean; text: string }
      )(item, key);
      assert.equal(judged.correct, true, `${item["id"]} key judges correct`);
      const wrongId = ["a", "b", "c"].find((id) => id !== key) as string;
      const missed = (
        engine["feedbackFor"] as (item: unknown, optionId: string) => { correct: boolean; text: string }
      )(item, wrongId);
      assert.equal(missed.correct, false, `${item["id"]} distractor judges wrong`);
      assert.ok(missed.text && missed.text !== judged.text, `${item["id"]} feedback differs by option`);
    }
  }
});

// ---------------- Gating ----------------

test("M28-GATING: both written tasks lock criteria until an explicit first save", () => {
  for (const spec of BATCH) {
    const lesson = lessonById(spec.lessonId);
    const tasks = (lesson["blocks"] as JsonRecord[]).filter((block) => block["type"] === "independentTask");
    assert.equal(tasks.length, 2, `${spec.lessonId}: repair plus independent`);
    for (const task of tasks) {
      assert.equal(task["contentVersion"], spec.contentVersion, `${task["responseKey"]} version pinned`);
      assert.ok(
        String(task["responseKey"]).startsWith(`${spec.lessonId}::`),
        `${task["responseKey"]} keyed to its lesson`
      );
      const locked = String(BLOCKS["renderBlock"](task, 0, {}));
      assert.ok(locked.includes("task-criteria-locked"), `${task["responseKey"]} locked before a save`);
      assert.ok(
        !locked.includes('data-testid="comparison-criteria"'),
        `${task["responseKey"]} reveals no criteria body before a save`
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
    }
  }
});

// ---------------- Language ----------------

test("M28-LANGUAGE: clean learner teaching; feedback teaches evidence and reasoning", () => {
  for (const spec of BATCH) {
    const lesson = lessonById(spec.lessonId);
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
      assert.ok(!text.includes(banned), `${spec.lessonId} must not contain: ${banned}`);
    }
    const feedback = (lesson["blocks"] as JsonRecord[])
      .filter((block) => block["type"] === "supportedSelection" || block["type"] === "independentTask")
      .map((block) => {
        const optionFeedback =
          block["type"] === "supportedSelection" && block["feedbackByOption"]
            ? Object.values(block["feedbackByOption"] as Record<string, string>).join(" ")
            : "";
        return `${optionFeedback} ${block["criteria"] ?? ""}`;
      })
      .join("\n")
      .toLowerCase();
    assert.ok(feedback.includes("source"), `${spec.lessonId} feedback names sources`);
    assert.ok(
      feedback.includes("evidence") || feedback.includes("detail"),
      `${spec.lessonId} feedback teaches evidence or detail`
    );
    assert.ok(
      feedback.includes("inference") || feedback.includes("conclusion") || feedback.includes("claim"),
      `${spec.lessonId} feedback bounds the inference`
    );
  }
});

// ---------------- Rendered controls ----------------

test("M28-RENDER: answerable controls and disclosures render per lesson", () => {
  for (const spec of BATCH) {
    const lesson = lessonById(spec.lessonId);
    const html = String(
      BLOCKS["renderBlocks"](lesson["blocks"], {
        formativeResponse: () => "",
        submissionsForTask: () => [],
      })
    );
    assert.ok(html.includes('data-testid="supported-choice-a"'), `${spec.lessonId} choice hooks`);
    assert.ok(html.includes('data-testid="supported-check"'), `${spec.lessonId} check hook`);
    assert.ok(html.includes('data-testid="supported-feedback"'), `${spec.lessonId} feedback hook`);
    const firstSaves = html.match(/data-testid="save-first-response"/g) || [];
    assert.equal(firstSaves.length, 2, `${spec.lessonId}: two first-save buttons`);
    const disclosures = html.match(/data-testid="source-details"/g) || [];
    assert.equal(disclosures.length, spec.sourceTitles.length, `${spec.lessonId}: disclosure per card`);
    assert.ok(!html.includes('data-testid="comparison-criteria"'), `${spec.lessonId}: no criteria pre-save`);
  }
});

// ---------------- Assigned records ----------------

interface AssignedPin {
  id: string;
  label: string;
  marks: string;
  kind: string;
  number?: string;
  rows?: number;
}

const Q_PINS: AssignedPin[] = [
  { id: "q18", label: "What was the response of the Government of Canada to the UN Human Rights Committee report?", marks: "/1", kind: "shortAnswer", number: "18", rows: 2 },
  { id: "q19", label: "What are the four main purposes of the United Nations?", marks: "/4", kind: "shortAnswer", number: "19", rows: 4 },
  { id: "q20", label: "How can the United Nations help indigenous Peoples in their causes?", marks: "/4", kind: "shortAnswer", number: "20", rows: 4 },
  { id: "q21", label: "True or False. Of the one hundred and thirty million children world-wide who do not finish school, the vast majority of them are Aboriginal.", marks: "/1", kind: "multipleChoice", number: "21" },
  { id: "q22", label: "How does education make it easier for Aboriginal Peoples across the world to make their concerns heard?", marks: "/2", kind: "shortAnswer", number: "22", rows: 3 },
];

function bookletPrompt(promptId: string): JsonRecord {
  const activities = DATA["themeActivities"] as Array<{ id: string; sections?: Array<{ prompts?: JsonRecord[] }> }>;
  const booklet = activities.find((activity) => activity.id === "theme-4-online-booklet");
  assert.ok(booklet, "theme-4 booklet exists");
  for (const section of booklet?.sections || []) {
    const found = (section.prompts || []).find((prompt) => prompt["id"] === promptId);
    if (found) return found;
  }
  assert.fail(`booklet prompt ${promptId} must exist`);
}

test("M28-ASSIGNED: Theme 4 q18-q22 byte-pinned; no duplicate compulsory response", () => {
  for (const pin of Q_PINS) {
    const prompt = bookletPrompt(pin.id);
    assert.equal(prompt["label"], pin.label, `${pin.id} label byte-identical`);
    assert.equal(prompt["marks"], pin.marks, `${pin.id} marks byte-identical`);
    assert.equal(prompt["kind"], pin.kind, `${pin.id} kind pinned`);
    if (pin.number !== undefined) {
      assert.equal(prompt["number"], pin.number, `${pin.id} number pinned`);
    }
    if (pin.rows !== undefined) {
      assert.equal(prompt["rows"], pin.rows, `${pin.id} rows pinned`);
    }
  }
  for (const spec of BATCH) {
    const lesson = lessonById(spec.lessonId);
    for (const block of (lesson["blocks"] as JsonRecord[]).filter((entry) => entry["type"] === "independentTask")) {
      assert.ok(
        !String(block["responseKey"]).startsWith("booklet:"),
        `${block["responseKey"]} is not a second compulsory record`
      );
    }
  }
});
