/**
 * AB30 R16 batch suite — Theme 1 lessons 20-22 (v2 rebuilds).
 *
 * Proves per lesson against the real production files: versioned v2
 * structure with valid blocks, verbatim source extracts against the R16
 * textbook bands (ch3 pp92-97, pp98-103, pp104-105, plus the reused
 * R15 pp86-91 band for the Lesson 20 rights-test card), full attribution with
 * named speakers where the source names them, completed worked reasoning,
 * in-lesson/bank selection sync, the 6+2 reviewed bank with distinct
 * stimuli/reasoning, first-save gating on both written tasks, formative
 * workload roles, evidence-language feedback, and byte-pinned assigned
 * records (q44-q56).
 *
 * Live-browser halves are NOT_RUN in this sandbox and recorded in
 * meta/ab30-v2/evidence/R16/; the as30-r08-browser.cjs script covers the
 * Lesson 7 interaction pattern these lessons reuse (frozen components).
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
const dataPath = path.resolve(workspaceDir, "course-data.js");
const bankPath = path.resolve(workspaceDir, "practice-data.js");
const enginePath = path.resolve(workspaceDir, "practice-engine.js");
const componentsPath = path.resolve(workspaceDir, "lesson-components.js");
const textbookBandPath = path.resolve(
  "scripts", "tests", "fixtures", "ab30-parity", "textbook-ch3-pp86-91.txt"
);
const textbookBand2Path = path.resolve(
  "scripts", "tests", "fixtures", "ab30-parity", "textbook-ch3-pp92-97.txt"
);
const textbookBand3Path = path.resolve(
  "scripts", "tests", "fixtures", "ab30-parity", "textbook-ch3-pp98-103.txt"
);
const textbookBand4Path = path.resolve(
  "scripts", "tests", "fixtures", "ab30-parity", "textbook-ch3-pp104-105.txt"
);

const dataSource = readFileSync(dataPath, "utf8");
const bankSource = readFileSync(bankPath, "utf8");
const engineSource = readFileSync(enginePath, "utf8");
const componentsSource = readFileSync(componentsPath, "utf8");

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

console.log(
  `[ab30-r16] tested inputs: ${JSON.stringify({
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
const TEXTBOOK_BAND2 = quoteNorm(readFileSync(textbookBand2Path, "utf8"));
const TEXTBOOK_BAND3 = quoteNorm(readFileSync(textbookBand3Path, "utf8"));
const TEXTBOOK_BAND4 = quoteNorm(readFileSync(textbookBand4Path, "utf8"));

interface BatchLesson {
  lessonId: string;
  contentVersion: string;
  bookletQuestionIds: string[];
  supportedItemId: string;
  sourceCount: number;
  sourceBands: Record<string, "band0" | "band1" | "band2" | "band3">;
  assignmentIds: string[];
  assignmentHomeIds: string[];
}

function fullBand(count: number, band: "band0" | "band1" | "band2" | "band3"): Record<string, "band0" | "band1" | "band2" | "band3"> {
  const titles = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA"];
  const out: Record<string, "band0" | "band1" | "band2" | "band3"> = {};
  for (let i = 0; i < count; i += 1) out[`Source ${titles[i]}`] = band;
  return out;
}

function l20Bands(): Record<string, "band0" | "band1" | "band2" | "band3"> {
  const out = fullBand(25, "band1");
  out["Source Y"] = "band0";
  return out;
}

const BATCH: BatchLesson[] = [
  {
    lessonId: "t1-l20-harvesting-rights",
    contentVersion: "ab30-v2-l20.1",
    bookletQuestionIds: ["q79", "q80"],
    supportedItemId: "ab30-v2-l20-paraphrase-1",
    sourceCount: 25,
    sourceBands: l20Bands(),
    assignmentIds: [],
    assignmentHomeIds: [],
  },
  {
    lessonId: "t1-l21-rebuilding-goals",
    contentVersion: "ab30-v2-l21.1",
    bookletQuestionIds: ["q81", "q82", "q83"],
    supportedItemId: "ab30-v2-l21-link-1",
    sourceCount: 27,
    sourceBands: fullBand(27, "band2"),
    assignmentIds: ["rebuilding-self-government"],
    assignmentHomeIds: [],
  },
  {
    lessonId: "t1-l22-models",
    contentVersion: "ab30-v2-l22.1",
    bookletQuestionIds: ["q84", "q85", "q86", "q87"],
    supportedItemId: "ab30-v2-l22-match-1",
    sourceCount: 15,
    sourceBands: fullBand(15, "band3"),
    assignmentIds: ["rebuilding-self-government"],
    assignmentHomeIds: ["rebuilding-self-government"],
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

test("R16-STRUCT: three versioned v2 lessons with valid frozen-pattern blocks", () => {
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
      "comparison",
      "workedExample",
      "supportedSelection",
      "independentTask",
      "reflection",
    ]) {
      assert.ok(types.includes(needed), `${spec.lessonId} must include a ${needed} block`);
    }
    assert.ok(!types.includes("supportedPractice"), `${spec.lessonId}: no static reveal`);
    assert.ok(!types.includes("figure"), `${spec.lessonId}: no figure without reviewed media`);
    const tasks = blocks.filter((block) => block["type"] === "independentTask");
    assert.equal(tasks.length, 2, `${spec.lessonId}: repair plus independent tasks`);
    assert.deepEqual(
      plain(lesson["bookletQuestionIds"]),
      spec.bookletQuestionIds,
      `${spec.lessonId} assigned homes intact`
    );
    assert.deepEqual(plain(lesson["assignmentIds"]), spec.assignmentIds, `${spec.lessonId} assignment links intact`);
    assert.deepEqual(plain(lesson["assignmentHomeIds"]), spec.assignmentHomeIds, `${spec.lessonId} assignment homes intact`);
  }
  for (const lessonId of ["t1-l21-rebuilding-goals", "t1-l22-models"]) {
    const lesson = lessonById(lessonId);
    const connection = (lesson["blocks"] as JsonRecord[]).find((block) => block["type"] === "assignmentConnection") as JsonRecord;
    assert.ok(connection, `${lessonId} links its assignment`);
    assert.equal(connection?.["assignmentId"], "rebuilding-self-government");
  }
});

// ---------------- Quotes ----------------

test("R16-QUOTES: every batch extract verifies verbatim against its band", () => {
  const bands = { band0: TEXTBOOK_BAND, band1: TEXTBOOK_BAND2, band2: TEXTBOOK_BAND3, band3: TEXTBOOK_BAND4 };
  for (const spec of BATCH) {
    const lesson = lessonById(spec.lessonId);
    const sources = (lesson["blocks"] as JsonRecord[]).filter((block) => block["type"] === "source");
    assert.equal(sources.length, spec.sourceCount, `${spec.lessonId} card count`);
    for (const source of sources) {
      const title = String(source["title"]);
      const bandName = spec.sourceBands[title];
      assert.ok(bandName, `${spec.lessonId} ${title} has a declared band`);
      const band = bands[bandName];
      const extract = quoteNorm(String(source["extract"] || ""));
      assert.ok(extract.length > 40, `${spec.lessonId} ${title} extract is substantial`);
      assert.ok(band.includes(extract), `${spec.lessonId} ${title} verifies against textbook ${bandName}`);
    }
  }
  // Control: a tampered quotation must fail the same check.
  const mutated = quoteNorm("The agent controlled the proceedings in the year 1901.");
  assert.ok(!TEXTBOOK_BAND.includes(mutated), "verification bites on invented wording");
});

// ---------------- Attribution ----------------

test("R16-SOURCES: full attribution; speakers only where the source names them", () => {
  for (const spec of BATCH) {
    const lesson = lessonById(spec.lessonId);
    const sources = (lesson["blocks"] as JsonRecord[]).filter((block) => block["type"] === "source");
    for (const source of sources) {
      const label = `${spec.lessonId} ${source["title"]}`;
      for (const field of ["extract", "sourceType", "locator", "attribution"]) {
        assert.ok(
          typeof source[field] === "string" && (source[field] as string).trim().length > 0,
          `${label} needs ${field}`
        );
      }
      const sourceType = String(source["sourceType"]);
      if (
        sourceType === "Textbook narration" ||
        sourceType === "Course-reading explanation" ||
        sourceType === "Textbook narration with document quotation" ||
        sourceType === "Published document extract" ||
        sourceType === "Textbook narration with treaty quotation" ||
        sourceType === "Textbook narration with act quotation" ||
        sourceType === "Textbook powers list"
      ) {
        assert.ok(!source["speaker"], `${label}: narration names no speaker`);
        assert.ok(
          typeof source["creator"] === "string" && (source["creator"] as string).trim().length > 0,
          `${label}: narration names its creator voice`
        );
      } else if (sourceType === "Published teaching story") {
        assert.ok(
          typeof source["creator"] === "string" && (source["creator"] as string).trim().length > 0,
          `${label}: teaching story names its telling`
        );
        assert.ok(
          /(unattributed|no single teller|many versions)/i.test(String(source["contextLimits"] || "")),
          `${label}: teaching story records its telling history`
        );
      } else {
        assert.ok(
          typeof source["speaker"] === "string" && (source["speaker"] as string).trim().length > 0,
          `${label}: voiced sources name a speaker`
        );
        assert.ok(
          typeof source["contextLimits"] === "string" && (source["contextLimits"] as string).trim().length > 0,
          `${label}: voiced sources state limits`
        );
      }
    }
  }
  const l20cards = (lessonById("t1-l20-harvesting-rights")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  const sharpe = l20cards.find((card) => card["title"] === "Source T") as JsonRecord;
  assert.ok(String(sharpe["speaker"]).includes("Sharpe"), "L20 Source T names Mr. Justice Sharpe");
  const chartrand = l20cards.find((card) => card["title"] === "Source V") as JsonRecord;
  assert.ok(String(chartrand["speaker"]).includes("Chartrand"), "L20 Source V names Paul Chartrand");
  const ubcic = l20cards.find((card) => card["title"] === "Source X") as JsonRecord;
  assert.ok(
    String(ubcic["speaker"]).includes("British Columbia Indian Chiefs"),
    "L20 Source X names the Union of British Columbia Indian Chiefs"
  );
  const l21cards = (lessonById("t1-l21-rebuilding-goals")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  const cardinal = l21cards.find((card) => card["title"] === "Source C") as JsonRecord;
  assert.ok(String(cardinal["speaker"]).includes("Cardinal"), "L21 Source C names Harold Cardinal");
  assert.ok(
    String(cardinal["creator"] || "").includes("Rebirth of Canada"),
    "L21 Source C traces the excerpt to The Rebirth of Canada's Indians"
  );
  const l22cards = (lessonById("t1-l22-models")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  assert.ok(
    l22cards.every((card) => !card["speaker"]),
    "L22 carries narration only; no voiced source goes unnamed"
  );
});

// ---------------- Worked ----------------

test("R16-WORKED: each lesson completes its reasoning visibly", () => {
  for (const spec of BATCH) {
    const lesson = lessonById(spec.lessonId);
    const worked = (lesson["blocks"] as JsonRecord[]).find((block) => block["type"] === "workedExample") as JsonRecord;
    assert.ok(worked, `${spec.lessonId} has a worked example`);
    const evidence = worked["evidence"] as Array<{ ref: string; text: string }>;
    assert.ok(evidence.length >= 1 && evidence.length <= 2, `${spec.lessonId}: one or two short passages`);
    for (const item of evidence) {
      assert.ok(item.ref && item.text, `${spec.lessonId}: evidence carries ref and text`);
    }
    const reasoning = worked["reasoning"] as string[];
    assert.equal(reasoning.length, 4, `${spec.lessonId}: four visible steps`);
    const response = String(worked["response"] || "");
    assert.ok(response.length > 200, `${spec.lessonId}: finished response is substantial`);
    assert.ok(/Source [A-Z0-9]+/.test(response), `${spec.lessonId}: response cites its sources`);
  }
});

// ---------------- Supported sync ----------------

test("R16-SYNC: in-lesson selections copy their bank items exactly", () => {
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

test("R16-BANK: 6+2 reviewed items per lesson with distinct stimuli and reasoning", () => {
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
        assert.match(sourceId as string, /^L(20|21|22)-[A-Z0-9]+$/, `${item["id"]} source id well-formed`);
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

test("R16-GATING: all six written tasks lock criteria until an explicit first save", () => {
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

test("R16-LANGUAGE: clean learner teaching; feedback teaches evidence and reasoning", () => {
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
      feedback.includes("evidence") || feedback.includes("Detail") || feedback.includes("detail".toLowerCase()),
      `${spec.lessonId} feedback teaches evidence or detail`
    );
    assert.ok(
      feedback.includes("inference") || feedback.includes("conclusion") || feedback.includes("claim"),
      `${spec.lessonId} feedback bounds the inference`
    );
  }
});

// ---------------- Rendered controls ----------------

test("R16-RENDER: answerable controls and disclosures render per lesson", () => {
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
    assert.equal(disclosures.length, spec.sourceCount, `${spec.lessonId}: disclosure per card`);
    assert.ok(!html.includes('data-testid="comparison-criteria"'), `${spec.lessonId}: no criteria pre-save`);
  }
});

// ---------------- Assigned records ----------------

const Q_PINS: Record<string, { label: string; rows: number; kind: string; number: string }> = {
  q79: { label: "True or False: First Nations people can hunt, fish and trap year-round outside of their province.", rows: 1, kind: "multipleChoice", number: "79" },
  q80: { label: "For an Aboriginal group to sell or use the resources of the land in a modern way, what must the practice be part of?", rows: 4, kind: "shortAnswer", number: "80" },
  q81: { label: "What makes a one-size-fits-all self-government impossible for Canada's Aboriginal Peoples?", rows: 5, kind: "shortAnswer", number: "81" },
  q82: { label: "What did the government response to the Commission pledge to do for First Nations?", rows: 4, kind: "shortAnswer", number: "82" },
  q83: { label: "Who are the three partners in self-government negotiations?", rows: 4, kind: "shortAnswer", number: "83" },
  q84: { label: "What are some benefits of enshrining self-government in the Constitution?", rows: 5, kind: "shortAnswer", number: "84" },
  q85: { label: "What is a current example of an Aboriginal public government in Canada?", rows: 4, kind: "shortAnswer", number: "85" },
  q86: { label: "Which bill created the first Aboriginal municipal-style government in Canada?", rows: 4, kind: "shortAnswer", number: "86" },
  q87: { label: "Urban-living First Nations individuals without a land base might benefit best from which type of government?", rows: 4, kind: "shortAnswer", number: "87" },
};

const ASSIGN_PIN = {
  id: "rebuilding-self-government",
  title: "Rebuilding Self-Government",
  summary: "Choose one of the 4 advantages of the self-government promises on page 98 and discuss reasons why you think this might be a good thing for a First Nation. Respond in paragraph form using the response criteria.",
};

test("R16-ASSIGNED: q79-q87 byte-pinned; assignment record intact; no duplicate compulsory response", () => {
  const activities = DATA["themeActivities"] as Array<{
    id: string;
    sections?: Array<{ prompts?: JsonRecord[] }>;
  }>;
  const booklet = activities.find((activity) => activity.id === "theme-1-online-booklet");
  assert.ok(booklet, "theme 1 booklet exists");
  const prompts = (booklet?.sections || []).flatMap((section) => section.prompts || []);
  for (const [id, pin] of Object.entries(Q_PINS)) {
    const prompt = prompts.find((entry) => entry["id"] === id) as JsonRecord;
    assert.ok(prompt, `${id} exists`);
    assert.equal(prompt["label"], pin.label, `${id} label byte-identical`);
    assert.equal(prompt["rows"], pin.rows, `${id} rows pinned`);
    assert.equal(prompt["kind"], pin.kind, `${id} kind pinned`);
    assert.equal(prompt["number"], pin.number, `${id} number pinned`);
  }
  const assignments = DATA["assignments"] as Array<{ id: string; title: string; summary: string }>;
  const assign = assignments.find((entry) => entry.id === ASSIGN_PIN.id);
  assert.ok(assign, "rebuilding-self-government record exists");
  assert.equal(assign?.title, ASSIGN_PIN.title, "assignment title byte-identical");
  assert.equal(assign?.summary, ASSIGN_PIN.summary, "assignment summary byte-identical");
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
