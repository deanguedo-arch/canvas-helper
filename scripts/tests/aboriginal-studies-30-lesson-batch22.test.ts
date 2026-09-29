/**
 * AB30 R22 batch suite — Theme 3 lessons 34-36 (v2 rebuilds). Opens Theme 3.
 *
 * Proves per lesson against the real production files: versioned v2
 * structure with valid blocks, verbatim source extracts against the R22
 * textbook band (ch5 pp158-171), full attribution with named speakers
 * where the voice is the person's own (Littlechild profile, Isadore and
 * Brave Rock quotations), completed worked reasoning, in-lesson/bank
 * selection sync, the 6+2 reviewed bank with distinct stimuli/reasoning,
 * first-save gating on both written tasks, formative workload roles,
 * evidence-language feedback, and byte-pinned assigned records (Theme 3
 * q1-q10 plus R1-R14, incl. the q8 table and the restored R14 home).
 *
 * Booklet authority: q1-q10 + R1-R14 labels/marks below were verified
 * first-hand against the staged official AB30Theme3Booklet.pdf (file
 * pp3-13) during R22 and match the R07 transcription. They are pinned
 * byte-identical, including the genuine q7/q9 repeated wording, the
 * 9-row q8 table (the bold "Language" line is q9's header, proven by
 * font analysis), and the unnumbered Atanarjuat question as R14.
 *
 * Live-browser halves are NOT_RUN in this sandbox and recorded in
 * meta/ab30-v2/evidence/R22/; the as30-r08-browser.cjs script covers the
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
  "scripts", "tests", "fixtures", "ab30-parity", "textbook-ch5-pp158-171.txt"
);

const dataSource = readFileSync(dataPath, "utf8");
const bankSource = readFileSync(bankPath, "utf8");
const engineSource = readFileSync(enginePath, "utf8");
const componentsSource = readFileSync(componentsPath, "utf8");

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

console.log(
  `[ab30-r22] tested inputs: ${JSON.stringify({
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
  sourceBands: Record<string, "band-ch5a">;
  assignmentIds: string[];
  assignmentHomeIds: string[];
}

function l34Bands(): Record<string, "band-ch5a"> {
  const bands: Record<string, "band-ch5a"> = {};
  for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]) {
    bands[`Source ${letter}`] = "band-ch5a";
  }
  return bands;
}

function l35Bands(): Record<string, "band-ch5a"> {
  const bands: Record<string, "band-ch5a"> = {};
  for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"]) {
    bands[`Source ${letter}`] = "band-ch5a";
  }
  return bands;
}

function l36Bands(): Record<string, "band-ch5a"> {
  const bands: Record<string, "band-ch5a"> = {};
  for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"]) {
    bands[`Source ${letter}`] = "band-ch5a";
  }
  return bands;
}

const BATCH: BatchLesson[] = [
  {
    lessonId: "t3-l01-stereotypes-media",
    contentVersion: "ab30-v2-l34.1",
    bookletQuestionIds: ["q1", "q2", "q3", "q4", "q5", "q6"],
    supportedItemId: "ab30-v2-l34-blend-1",
    sourceCount: 14,
    sourceBands: l34Bands(),
    assignmentIds: [],
    assignmentHomeIds: [],
  },
  {
    lessonId: "t3-l05-words-that-wound",
    contentVersion: "ab30-v2-l35.1",
    bookletQuestionIds: ["q7", "q8", "q9"],
    supportedItemId: "ab30-v2-l35-landlord-1",
    sourceCount: 17,
    sourceBands: l35Bands(),
    assignmentIds: [],
    assignmentHomeIds: [],
  },
  {
    lessonId: "t3-l06-screens-punchlines",
    contentVersion: "ab30-v2-l36.1",
    bookletQuestionIds: ["q10", "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12", "R13", "R14"],
    supportedItemId: "ab30-v2-l36-guardian-1",
    sourceCount: 17,
    sourceBands: l36Bands(),
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

test("R22-STRUCT: versioned v2 lessons with valid frozen-pattern blocks", () => {
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
  for (const spec of BATCH) {
    const lesson = lessonById(spec.lessonId);
    const connection = (lesson["blocks"] as JsonRecord[]).find(
      (block) => block["type"] === "assignmentConnection"
    );
    assert.ok(!connection, `${spec.lessonId} links no assignment (3.1 home is Lesson 4)`);
  }
  const l34 = lessonById("t3-l01-stereotypes-media");
  assert.ok(
    String(l34["kicker"]).includes("Start 3.1"),
    "t3-l01-stereotypes-media keeps its Start 3.1 kicker"
  );
  const l34close = (l34["blocks"] as JsonRecord[]).find(
    (block) => block["type"] === "explanation" && String(block["heading"]).includes("Carry it to Assignment 3.1")
  ) as JsonRecord;
  assert.ok(l34close, "t3-l01-stereotypes-media hands 3.1 forward without homing it");
  assert.ok(
    JSON.stringify(l34close["paragraphs"]).includes("Lesson 4"),
    "3.1 handoff names the home lesson"
  );
});

// ---------------- Quotes ----------------

test("R22-QUOTES: every batch extract verifies verbatim against its band", () => {
  const bands = { "band-ch5a": TEXTBOOK_BAND };
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
  const swapped = quoteNorm("To the Nisga'a people, a treaty is a sacred instrument");
  assert.ok(!TEXTBOOK_BAND.includes(swapped), "ch5a band must not contain R21-only wording");
});

// ---------------- Attribution ----------------

test("R22-SOURCES: full attribution; speakers only where the source names them", () => {
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
  const l34cards = (lessonById("t3-l01-stereotypes-media")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  assert.ok(
    l34cards.every((card) => !card["speaker"]),
    "L34 carries narration + essay documents only; no voiced source goes unnamed"
  );
  for (const letter of ["B", "C", "D", "E", "F", "G"]) {
    const card = l34cards.find((entry) => entry["title"] === `Source ${letter}`) as JsonRecord;
    assert.equal(card["sourceType"], "Published document extract", `L34 Source ${letter} is a Dumont document`);
    assert.ok(
      String(card["creator"]).includes("Dumont"),
      `L34 Source ${letter} credits Dumont as creator`
    );
  }
  const l35cards = (lessonById("t3-l05-words-that-wound")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  for (const letter of ["N", "O"]) {
    const card = l35cards.find((entry) => entry["title"] === `Source ${letter}`) as JsonRecord;
    assert.equal(card["speaker"], "Willie Littlechild", `L35 Source ${letter} names Littlechild`);
    assert.equal(card["sourceType"], "Published profile with quotation", `L35 Source ${letter} is a voiced profile`);
  }
  assert.ok(
    l35cards
      .filter((card) => card["title"] !== "Source N" && card["title"] !== "Source O")
      .every((card) => !card["speaker"]),
    "L35 narration cards name no speaker"
  );
  const l36cards = (lessonById("t3-l06-screens-punchlines")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  const isadore = l36cards.find((card) => card["title"] === "Source C") as JsonRecord;
  assert.equal(isadore["speaker"], "Stan Isadore", "L36 Source C names Isadore");
  const braveRock = l36cards.find((card) => card["title"] === "Source Q") as JsonRecord;
  assert.equal(braveRock["speaker"], "Carl Brave Rock", "L36 Source Q names Brave Rock");
  const burnstick = l36cards.find((card) => card["title"] === "Source P") as JsonRecord;
  assert.equal(
    burnstick["sourceType"],
    "Textbook narration with quotation",
    "L36 Source P stays textbook narration quoting Burnstick"
  );
  assert.ok(!burnstick["speaker"], "L36 Source P names no speaker");
  assert.ok(
    l36cards
      .filter((card) => card["title"] !== "Source C" && card["title"] !== "Source Q")
      .every((card) => !card["speaker"]),
    "L36 narration cards name no speaker"
  );
});

// ---------------- Worked ----------------

test("R22-WORKED: each lesson completes its reasoning visibly", () => {
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

test("R22-SYNC: in-lesson selections copy their bank items exactly", () => {
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

test("R22-BANK: 6+2 reviewed items per lesson with distinct stimuli and reasoning", () => {
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

test("R22-GATING: both written tasks lock criteria until an explicit first save", () => {
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

test("R22-LANGUAGE: clean learner teaching; feedback teaches evidence and reasoning", () => {
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

test("R22-RENDER: answerable controls and disclosures render per lesson", () => {
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
  { id: "q1", label: "What are two examples of stereotypes that Jenine Dumont experienced?", marks: "/2", kind: "shortAnswer", number: "1", rows: 3 },
  { id: "q2", label: "How did stereotypes affect Jenine Dumont's self-esteem and self-confidence?", marks: "/2", kind: "shortAnswer", number: "2", rows: 3 },
  { id: "q3", label: "Define multiculturalism in your own words?", marks: "/1", kind: "shortAnswer", number: "3", rows: 2 },
  { id: "q4", label: "Define assimilation in your own words?", marks: "/1", kind: "shortAnswer", number: "4", rows: 2 },
  { id: "q5", label: "How do stereotypes form?", marks: "/1", kind: "shortAnswer", number: "5", rows: 2 },
  { id: "q6", label: "What harm can stereotypes do?", marks: "/1", kind: "shortAnswer", number: "6", rows: 2 },
  { id: "q7", label: "How does language contribute to stereotypes?", marks: "/1", kind: "shortAnswer", number: "7", rows: 2 },
  { id: "q8", label: "Describe the following types of discrimination (page 164-166)", marks: "/18", kind: "table", number: "8" },
  { id: "q9", label: "How does language contribute to stereotypes?", marks: "/1", kind: "shortAnswer", number: "9", rows: 2 },
  { id: "q10", label: "What roles do the mass media play in reinforcing stereotypes?", marks: "/1", kind: "shortAnswer", number: "10", rows: 2 },
  { id: "R1", label: "What are the consequences of distorted representations of Indigenous people with regard to their identity, self-esteem and social and cultural development?", marks: "/6", kind: "shortAnswer", number: "R1", rows: 5 },
  { id: "R2", label: "Why would western culture treat Indians as myths or dinosaurs?", marks: "/1", kind: "shortAnswer", number: "R2", rows: 2 },
  { id: "R3", label: "The silent era portrayed Native people as noble; how did that come to be?", marks: "/1", kind: "shortAnswer", number: "R3", rows: 2 },
  { id: "R4", label: "Do you think that the kids in the summer camp sequence in Reel Injun were only encountered Native people in Hollywood movies?", marks: "/2", kind: "shortAnswer", number: "R4", rows: 3 },
  { id: "R5", label: "According to Hollywood's criteria, what does it take to be a good or noble Indian?", marks: "/1", kind: "shortAnswer", number: "R5", rows: 2 },
  { id: "R6", label: "By developing the Tonto speech, did Hollywood harm the existing Native languages spoken by US tribes?", marks: "/2", kind: "shortAnswer", number: "R6", rows: 3 },
  { id: "R7", label: "What are some of the misguided notions surrounding the Indian princess Pocahontas?", marks: "/3", kind: "shortAnswer", number: "R7", rows: 3 },
  { id: "R8", label: "When John Wayne shoots a dead Indian that was dug up from a burial ground in the eyes to make sure he will not be going to the spirit world, what kind of message is Hollywood sending?", marks: "/2", kind: "shortAnswer", number: "R8", rows: 3 },
  { id: "R9", label: "What about the use of Native languages in the movies: Is it desirable in order to improve the pride and self-esteem of First Nations people?", marks: "/2", kind: "shortAnswer", number: "R9", rows: 3 },
  { id: "R10", label: "Retrace the history and the meaning of this famously racist pronouncement by General Philip Sheridan: “A Good Injun . . . is a Dead Injun.” Why would Hollywood use such neo-colonialist propaganda to confuse the feelings of young Native people?", marks: "/2", kind: "shortAnswer", number: "R10", rows: 3 },
  { id: "R11", label: "Regarding the notion of human beings, why does John Trudell place so much emphasis on language as an instrument of war?", marks: "/2", kind: "shortAnswer", number: "R11", rows: 3 },
  { id: "R12", label: "In the 1970s, the US government infiltrated a tribal council (on the Pine Ridge Indian Reservation in the town of Wounded Knee) and in 1973 AIM activists seized the town. Retrace the framework of events that led to the uprising.", marks: "/3", kind: "shortAnswer", number: "R12", rows: 4 },
  { id: "R13", label: "Director Neil Diamond mentioned that he found the answers he was looking for in the North. What exactly was the object of his quest?", marks: "/2", kind: "shortAnswer", number: "R13", rows: 3 },
  { id: "R14", label: "On what basis can we say that Atanarjuat is the “most Native” movie ever made?", marks: "/2", kind: "shortAnswer", rows: 3 },
];

const Q8_ROWS: Array<{ id: string; label: string }> = [
  { id: "overt", label: "Overt" },
  { id: "covert", label: "Covert" },
  { id: "conscious", label: "Conscious" },
  { id: "unconscious", label: "Unconscious" },
  { id: "institutional", label: "Institutional" },
  { id: "subtle", label: "Subtle" },
  { id: "blatant", label: "Blatant" },
  { id: "verbal", label: "Verbal" },
  { id: "non-verbal", label: "Non-verbal" },
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

test("R22-ASSIGNED: Theme 3 q1-q10 + R1-R14 byte-pinned; no duplicate compulsory response", () => {
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
    bookletPrompt("q7")["label"],
    bookletPrompt("q9")["label"],
    "q7/q9 repeat is genuine print wording, pinned twice"
  );
  const q8 = bookletPrompt("q8");
  assert.deepEqual(
    plain(q8["rows"]),
    Q8_ROWS,
    "q8 table rows byte-identical (9 rows; Language is q9's header, not a row)"
  );
  assert.deepEqual(
    plain(q8["columns"]),
    [{ id: "description", label: "Description" }],
    "q8 table column pinned"
  );
  assert.equal(bookletPrompt("R14")["number"], undefined, "R14 stays numberless as in print");
  const l36 = lessonById("t3-l06-screens-punchlines");
  assert.ok(
    (plain(l36["bookletQuestionIds"]) as string[]).includes("R14"),
    "L36 restores the R07 R14 home"
  );
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
