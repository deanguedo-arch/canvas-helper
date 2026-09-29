/**
 * AB30 R23 batch suite — Theme 3 lessons 37-39 (v2 rebuilds). Homes 3.1.
 *
 * Proves per lesson against the real production files: versioned v2
 * structure with valid blocks, verbatim source extracts against the R23
 * textbook band (ch5-6 pp172-187), full attribution with named speakers
 * where the voice is the person's own (Habitant, Reilly, Scott, Elias),
 * completed worked reasoning, in-lesson/bank selection sync, the 6+2
 * reviewed bank with distinct stimuli/reasoning, first-save gating on
 * both written tasks, formative workload roles, evidence-language
 * feedback, and byte-pinned assigned records (3.1 plus Theme 3 q11-q17,
 * incl. the q13/q16 tables and the q15 choices).
 *
 * Booklet authority: 3.1 + q11-q17 labels/marks below were verified
 * first-hand against the staged official AB30Theme3Booklet.pdf (file
 * pp5,14-15) during R23 and match the R07 transcription. They are pinned
 * byte-identical, including the genuine q2/q12 repeated wording (print
 * repeats the Dumont question under Rural Communities) and the 3.1
 * instruction/lead-sentence split.
 *
 * Live-browser halves are NOT_RUN in this sandbox and recorded in
 * meta/ab30-v2/evidence/R23/; the as30-r08-browser.cjs script covers the
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
  "scripts", "tests", "fixtures", "ab30-parity", "textbook-ch5-6-pp172-187.txt"
);

const dataSource = readFileSync(dataPath, "utf8");
const bankSource = readFileSync(bankPath, "utf8");
const engineSource = readFileSync(enginePath, "utf8");
const componentsSource = readFileSync(componentsPath, "utf8");

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

console.log(
  `[ab30-r23] tested inputs: ${JSON.stringify({
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
  sourceCount: number;
  sourceBands: Record<string, "band-ch5b6a">;
  assignmentIds: string[];
  assignmentHomeIds: string[];
}

function l37Bands(): Record<string, "band-ch5b6a"> {
  const bands: Record<string, "band-ch5b6a"> = {};
  for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"]) {
    bands[`Source ${letter}`] = "band-ch5b6a";
  }
  return bands;
}

function l38Bands(): Record<string, "band-ch5b6a"> {
  const bands: Record<string, "band-ch5b6a"> = {};
  for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"]) {
    bands[`Source ${letter}`] = "band-ch5b6a";
  }
  return bands;
}

function l39Bands(): Record<string, "band-ch5b6a"> {
  const bands: Record<string, "band-ch5b6a"> = {};
  for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]) {
    bands[`Source ${letter}`] = "band-ch5b6a";
  }
  return bands;
}

const BATCH: BatchLesson[] = [
  {
    lessonId: "t3-l02-breaking-barriers",
    contentVersion: "ab30-v2-l37.1",
    bookletQuestionIds: [],
    supportedItemId: "ab30-v2-l37-recognition-1",
    sourceCount: 13,
    sourceBands: l37Bands(),
    assignmentIds: ["assignment-3-1-breaking-stereotypes"],
    assignmentHomeIds: ["assignment-3-1-breaking-stereotypes"],
  },
  {
    lessonId: "t3-l03-community-life",
    contentVersion: "ab30-v2-l38.1",
    bookletQuestionIds: ["q11", "q12", "q13", "q14"],
    supportedItemId: "ab30-v2-l38-diverse-1",
    sourceCount: 15,
    sourceBands: l38Bands(),
    assignmentIds: [],
    assignmentHomeIds: [],
  },
  {
    lessonId: "t3-l07-running-own-show",
    contentVersion: "ab30-v2-l39.1",
    bookletQuestionIds: ["q15", "q16", "q17"],
    supportedItemId: "ab30-v2-l39-alone-1",
    sourceCount: 14,
    sourceBands: l39Bands(),
    assignmentIds: [],
    assignmentHomeIds: [],
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

test("R23-STRUCT: versioned v2 lessons with valid frozen-pattern blocks", () => {
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
  const l37 = lessonById("t3-l02-breaking-barriers");
  const connection = (l37["blocks"] as JsonRecord[]).find(
    (block) => block["type"] === "assignmentConnection"
  ) as JsonRecord;
  assert.ok(connection, "t3-l02-breaking-barriers keeps its 3.1 home connection");
  assert.equal(
    connection?.["assignmentId"],
    "assignment-3-1-breaking-stereotypes",
    "3.1 home connection target"
  );
  for (const lessonId of ["t3-l03-community-life", "t3-l07-running-own-show"]) {
    const lesson = lessonById(lessonId);
    const other = (lesson["blocks"] as JsonRecord[]).find(
      (block) => block["type"] === "assignmentConnection"
    );
    assert.ok(!other, `${lessonId} links no assignment`);
  }
  const l38 = lessonById("t3-l03-community-life");
  assert.ok(
    String(l38["kicker"]).includes("Start Attawapiskat Report"),
    "t3-l03-community-life keeps its Start Attawapiskat kicker"
  );
  const l38close = (l38["blocks"] as JsonRecord[]).find(
    (block) => block["type"] === "explanation" && String(block["heading"]).includes("Two errands")
  ) as JsonRecord;
  assert.ok(l38close, "t3-l03-community-life hands q12 and the report forward without homing them");
  assert.ok(
    JSON.stringify(l38close["paragraphs"]).includes("Lesson 10"),
    "Attawapiskat handoff names the home lesson"
  );
});

// ---------------- Quotes ----------------

test("R23-QUOTES: every batch extract verifies verbatim against its band", () => {
  const bands = { "band-ch5b6a": TEXTBOOK_BAND };
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
  // Controls: tampered quotations must fail the same checks.
  const mutated = quoteNorm("The agent controlled the proceedings in the year 1901.");
  assert.ok(!TEXTBOOK_BAND.includes(mutated), "verification bites on invented wording");
  const swapped = quoteNorm("the word redskin was, and probably still is, racist");
  assert.ok(!TEXTBOOK_BAND.includes(swapped), "ch5b6a band must not contain R22-only wording");
});

// ---------------- Attribution ----------------

test("R23-SOURCES: full attribution; speakers only where the source names them", () => {
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
        sourceType === "Textbook narration with quotation" ||
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
  const l37cards = (lessonById("t3-l02-breaking-barriers")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  const habitant = l37cards.find((card) => card["title"] === "Source G") as JsonRecord;
  assert.equal(habitant["speaker"], "Dominique Habitant", "L37 Source G names Habitant");
  const reilly = l37cards.find((card) => card["title"] === "Source I") as JsonRecord;
  assert.equal(reilly["speaker"], "Judge John Reilly", "L37 Source I names Reilly");
  assert.ok(
    l37cards
      .filter((card) => card["title"] !== "Source G" && card["title"] !== "Source I")
      .every((card) => !card["speaker"]),
    "L37 narration cards name no speaker"
  );
  const l38cards = (lessonById("t3-l03-community-life")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  assert.ok(
    l38cards.every((card) => !card["speaker"]),
    "L38 carries narration + song documents only; no voiced source goes unnamed"
  );
  for (const letter of ["C", "D", "E", "F"]) {
    const card = l38cards.find((entry) => entry["title"] === `Source ${letter}`) as JsonRecord;
    assert.equal(card["sourceType"], "Published document extract", `L38 Source ${letter} is a Shingoose document`);
    assert.ok(
      String(card["creator"]).includes("Shingoose"),
      `L38 Source ${letter} credits Shingoose as creator`
    );
  }
  const l39cards = (lessonById("t3-l07-running-own-show")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  const scott = l39cards.find((card) => card["title"] === "Source D") as JsonRecord;
  assert.equal(scott["speaker"], "Andy Scott", "L39 Source D names Scott");
  const elias = l39cards.find((card) => card["title"] === "Source N") as JsonRecord;
  assert.equal(elias["speaker"], "Edna Elias", "L39 Source N names Elias");
  assert.ok(
    l39cards
      .filter((card) => card["title"] !== "Source D" && card["title"] !== "Source N")
      .every((card) => !card["speaker"]),
    "L39 narration cards name no speaker"
  );
});

// ---------------- Worked ----------------

test("R23-WORKED: each lesson completes its reasoning visibly", () => {
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

test("R23-SYNC: in-lesson selections copy their bank items exactly", () => {
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

// Theme 2+ source codes use course-absolute lesson numbers (24-33, 34+).
// Theme 1 codes stay theme-local (L01-L23). Later batches extend
// T2_LESSONS as they build.
const T2_LESSONS: Record<string, string> = {
  "24": "t2-l01-why-land-matters",
  "25": "t2-l05-land-values",
  "26": "t2-l02-two-kinds-of-claims",
  "27": "t2-l06-claims-machine",
  "28": "t2-l07-bigstone-specific",
  "29": "t2-l08-paths-resolution",
  "30": "t2-l03-metis-non-status-claims",
  "31": "t2-l09-first-modern-treaties",
  "32": "t2-l10-north-and-west",
  "33": "t2-l04-resolving-claims",
  "34": "t3-l01-stereotypes-media",
  "35": "t3-l05-words-that-wound",
  "36": "t3-l06-screens-punchlines",
  "37": "t3-l02-breaking-barriers",
  "38": "t3-l03-community-life",
  "39": "t3-l07-running-own-show",
};

function codeExists(code: string): boolean {
  const match = code.match(/^L0?([0-9]{1,2})-([A-Z0-9]+)$/);
  if (!match) return false;
  const units = DATA["units"] as Array<{ lessons?: JsonRecord[] }>;
  const lessons = units.flatMap((unit) => unit.lessons || []);
  const mapped = T2_LESSONS[String(Number(match[1]))];
  const lesson = mapped
    ? lessons.find((entry) => String(entry["id"]) === mapped)
    : lessons.find((entry) =>
        new RegExp(`-l0*${match[1]}-`).test(String(entry["id"]))
      );
  if (!lesson) return false;
  return ((lesson["blocks"] as JsonRecord[]) || []).some(
    (block) => block["type"] === "source" && block["title"] === `Source ${match[2]}`
  );
}

test("R23-BANK: 6+2 reviewed items per lesson with distinct stimuli and reasoning", () => {
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
        assert.match(sourceId as string, /^L0?[0-9]{1,2}-[A-Z0-9]+$/, `${item["id"]} source id well-formed`);
        assert.ok(codeExists(sourceId as string), `${item["id"]} ${sourceId} names a real card`);
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

test("R23-GATING: both written tasks lock criteria until an explicit first save", () => {
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

test("R23-LANGUAGE: clean learner teaching; feedback teaches evidence and reasoning", () => {
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

test("R23-RENDER: answerable controls and disclosures render per lesson", () => {
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

interface AssignedPin {
  id: string;
  label: string;
  marks: string;
  kind: string;
  number?: string;
  rows?: number;
}

const Q_PINS: AssignedPin[] = [
  { id: "assignment-3-1-breaking-stereotypes", label: "What are some realistic ways that we as a society, community and individuals can overcome and break stereotypes? Respond in paragraph form using the response criteria.", marks: "/16", kind: "shortAnswer", rows: 8 },
  { id: "q11", label: "What are some examples of the problems found in trying to be traditional in modern urban society as talked about in the song?", marks: "/4", kind: "shortAnswer", number: "11", rows: 4 },
  { id: "q12", label: "How did stereotypes affect Jenine Dumont's self-esteem and self-confidence?", marks: "/2", kind: "shortAnswer", number: "12", rows: 3 },
  { id: "q13", label: "Fill in the chart below to explore some of the benefits of living on a reserve:", marks: "/8", kind: "table", number: "13" },
  { id: "q14", label: "Why did Robert Smallboy leave his reserve in 1968?", marks: "/2", kind: "shortAnswer", number: "14", rows: 3 },
  { id: "q15", label: "What percentage of reserves still lack electricity?", marks: "/1", kind: "multipleChoice", number: "15" },
  { id: "q16", label: "Record how the following three problems affect reserve life:", marks: "/3", kind: "table", number: "16" },
  { id: "q17", label: "What is the difference between people from the Métis settlements in Alberta and other Métis communities near towns in other parts of the country?", marks: "/3", kind: "shortAnswer", number: "17", rows: 3 },
];

const SECTION_31_INSTRUCTIONS = "Take a moment to reflect on stereotypes and the harm they do. What are some realistic ways that we as a society, community and individuals can overcome and break stereotypes? Respond in paragraph form using the response criteria. /16";

const Q13_ROWS: Array<{ id: string; label: string }> = [
  { id: "family-friends", label: "Family/Friends" },
  { id: "pace", label: "Life's Pace" },
  { id: "children", label: "Children" },
  { id: "other-benefits", label: "Other Benefits" },
];

const Q15_CHOICES: string[] = ["15", "12", "10", "5"];

const Q16_ROWS: Array<{ id: string; label: string }> = [
  { id: "pollution", label: "Pollution" },
  { id: "youth-at-risk", label: "Youth at Risk" },
  { id: "television", label: "Television" },
];

function bookletPrompt(promptId: string): JsonRecord {
  const activities = DATA["themeActivities"] as Array<{ id: string; sections?: Array<{ prompts?: JsonRecord[] }> }>;
  const booklet = activities.find((activity) => activity.id === "theme-3-online-booklet");
  assert.ok(booklet, "theme-3 booklet exists");
  for (const section of booklet?.sections || []) {
    const found = (section.prompts || []).find((prompt) => prompt["id"] === promptId);
    if (found) return found;
  }
  assert.fail(`booklet prompt ${promptId} must exist`);
}

test("R23-ASSIGNED: 3.1 + Theme 3 q11-q17 byte-pinned; no duplicate compulsory response", () => {
  for (const pin of Q_PINS) {
    const prompt = bookletPrompt(pin.id);
    assert.equal(prompt["label"], pin.label, `${pin.id} label byte-identical`);
    assert.equal(prompt["marks"], pin.marks, `${pin.id} marks byte-identical`);
    assert.equal(prompt["kind"], pin.kind, `${pin.id} kind pinned`);
    assert.equal(prompt["number"], pin.number, `${pin.id} number pinned`);
    if (pin.rows !== undefined) {
      assert.equal(prompt["rows"], pin.rows, `${pin.id} rows pinned`);
    }
  }
  assert.equal(
    bookletPrompt("q2")["label"],
    bookletPrompt("q12")["label"],
    "q2/q12 repeat is genuine print wording, pinned twice"
  );
  const activities = DATA["themeActivities"] as Array<{ id: string; sections?: Array<{ id: string; instructions?: string }> }>;
  const booklet = activities.find((activity) => activity.id === "theme-3-online-booklet");
  const section31 = (booklet?.sections || []).find((section) => section.id === "assignment-3-1");
  assert.equal(section31?.instructions, SECTION_31_INSTRUCTIONS, "3.1 section instructions byte-identical");
  const q13 = bookletPrompt("q13");
  assert.deepEqual(plain(q13["rows"]), Q13_ROWS, "q13 chart rows byte-identical");
  const q15 = bookletPrompt("q15");
  assert.deepEqual(
    plain(q15["choices"]),
    Q15_CHOICES,
    "q15 choices byte-identical"
  );
  const q16 = bookletPrompt("q16");
  assert.deepEqual(plain(q16["rows"]), Q16_ROWS, "q16 problem rows byte-identical");
  const assignments = DATA["assignments"] as Array<{ id: string; title: string }>;
  for (const [id, title] of [
    ["assignment-3-1-breaking-stereotypes", "Assignment 3.1 Breaking Stereotypes"],
    ["attawapiskat-report", "Attawapiskat Report"],
  ]) {
    const assign = assignments.find((entry) => entry.id === id);
    assert.ok(assign, `${id} record exists`);
    assert.equal(assign?.title, title, `${id} title byte-identical`);
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
