/**
 * AB30 R18 batch suite — Theme 2 lessons 24-26 (v2 rebuilds).
 *
 * Proves per lesson against the real production files: versioned v2
 * structure with valid blocks, verbatim source extracts against the R18
 * textbook bands (ch4 pp108-117 for L24/L25, ch4 pp118-121 for L26),
 * full attribution with named speakers where the source names them
 * (Gosnell speech cards; Willier quotation), completed worked reasoning,
 * in-lesson/bank selection sync, the 6+2 reviewed bank with distinct
 * stimuli/reasoning, first-save gating on both written tasks, formative
 * workload roles, evidence-language feedback, and byte-pinned assigned
 * records (q1-q5 plus the 2.1 assignment home).
 *
 * Booklet authority: q1-q5 labels/marks below were verified first-hand
 * against the staged official AB30theme2Booklet.pdf (file pp8-10) during
 * R18 and match the R07 transcription. They are pinned byte-identical;
 * the R18 record carries the workcard-pin observation for the lead.
 *
 * Live-browser halves are NOT_RUN in this sandbox and recorded in
 * meta/ab30-v2/evidence/R18/; the as30-r08-browser.cjs script covers the
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
  "scripts", "tests", "fixtures", "ab30-parity", "textbook-ch4-pp108-117.txt"
);
const textbookBand2Path = path.resolve(
  "scripts", "tests", "fixtures", "ab30-parity", "textbook-ch4-pp118-121.txt"
);

const dataSource = readFileSync(dataPath, "utf8");
const bankSource = readFileSync(bankPath, "utf8");
const engineSource = readFileSync(enginePath, "utf8");
const componentsSource = readFileSync(componentsPath, "utf8");

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

console.log(
  `[ab30-r18] tested inputs: ${JSON.stringify({
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

interface BatchLesson {
  lessonId: string;
  contentVersion: string;
  bookletQuestionIds: string[];
  supportedItemId: string;
  sourceCount: number;
  sourceBands: Record<string, "band-ch4a" | "band-ch4b">;
  assignmentIds: string[];
  assignmentHomeIds: string[];
}

function l24Bands(): Record<string, "band-ch4a" | "band-ch4b"> {
  return {
    "Source A": "band-ch4a",
    "Source B": "band-ch4a",
    "Source C": "band-ch4a",
    "Source D": "band-ch4a",
    "Source E": "band-ch4a",
  };
}

function l25Bands(): Record<string, "band-ch4a" | "band-ch4b"> {
  return {
    "Source A": "band-ch4a",
    "Source B": "band-ch4a",
    "Source C": "band-ch4a",
    "Source D": "band-ch4a",
    "Source E": "band-ch4a",
    "Source F": "band-ch4a",
    "Source G": "band-ch4a",
    "Source H": "band-ch4a",
    "Source I": "band-ch4a",
  };
}

function l26Bands(): Record<string, "band-ch4a" | "band-ch4b"> {
  return {
    "Source A": "band-ch4b",
    "Source B": "band-ch4b",
    "Source C": "band-ch4b",
    "Source D": "band-ch4b",
    "Source E": "band-ch4b",
    "Source F": "band-ch4b",
    "Source G": "band-ch4b",
    "Source H": "band-ch4b",
  };
}

const BATCH: BatchLesson[] = [
  {
    lessonId: "t2-l01-why-land-matters",
    contentVersion: "ab30-v2-l24.1",
    bookletQuestionIds: ["q1"],
    supportedItemId: "ab30-v2-l24-emphasis-1",
    sourceCount: 5,
    sourceBands: l24Bands(),
    assignmentIds: [],
    assignmentHomeIds: [],
  },
  {
    lessonId: "t2-l05-land-values",
    contentVersion: "ab30-v2-l25.1",
    bookletQuestionIds: ["q2"],
    supportedItemId: "ab30-v2-l25-value-1",
    sourceCount: 9,
    sourceBands: l25Bands(),
    assignmentIds: ["2-1-land-stewardship"],
    assignmentHomeIds: ["2-1-land-stewardship"],
  },
  {
    lessonId: "t2-l02-two-kinds-of-claims",
    contentVersion: "ab30-v2-l26.1",
    bookletQuestionIds: ["q3", "q4", "q5"],
    supportedItemId: "ab30-v2-l26-calder-1",
    sourceCount: 8,
    sourceBands: l26Bands(),
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

test("R18-STRUCT: versioned v2 lessons with valid frozen-pattern blocks", () => {
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
  const l25 = lessonById("t2-l05-land-values");
  const connection = (l25["blocks"] as JsonRecord[]).find((block) => block["type"] === "assignmentConnection");
  assert.ok(connection, "t2-l05-land-values keeps its 2.1 home connection");
  assert.equal(connection?.["assignmentId"], "2-1-land-stewardship", "2.1 home connection target");
  for (const lessonId of ["t2-l01-why-land-matters", "t2-l02-two-kinds-of-claims"]) {
    const lesson = lessonById(lessonId);
    const other = (lesson["blocks"] as JsonRecord[]).find((block) => block["type"] === "assignmentConnection");
    assert.ok(!other, `${lessonId} links no assignment`);
  }
});

// ---------------- Quotes ----------------

test("R18-QUOTES: every batch extract verifies verbatim against its band", () => {
  const bands = { "band-ch4a": TEXTBOOK_BAND, "band-ch4b": TEXTBOOK_BAND2 };
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
  assert.ok(!TEXTBOOK_BAND.includes(mutated), "verification bites on invented wording (band ch4a)");
  assert.ok(!TEXTBOOK_BAND2.includes(mutated), "verification bites on invented wording (band ch4b)");
  const swapped = quoteNorm("Royal Proclamation recognizes Aboriginal title to land in the West");
  assert.ok(!TEXTBOOK_BAND.includes(swapped), "ch4a must not contain ch4b-only wording");
});

// ---------------- Attribution ----------------

test("R18-SOURCES: full attribution; speakers only where the source names them", () => {
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
  const l24cards = (lessonById("t2-l01-why-land-matters")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  assert.ok(
    l24cards.every((card) => card["speaker"] === "Dr. Joseph Gosnell"),
    "L24 carries Gosnell speech cards only, every one voiced by name"
  );
  assert.ok(
    l24cards.every((card) => card["sourceType"] === "Published speech extract"),
    "L24 cards share the speech-extract source type"
  );
  const l25cards = (lessonById("t2-l05-land-values")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  const willier = l25cards.find((card) => card["title"] === "Source I") as JsonRecord;
  assert.equal(willier["speaker"], "Russell Willier", "L25 Source I names Elder Willier");
  assert.ok(
    String(willier["creator"] || "").includes("Cry of the Eagle"),
    "L25 Source I traces the quotation to Cry of the Eagle"
  );
  assert.ok(
    l25cards
      .filter((card) => card["title"] !== "Source I")
      .every((card) => !card["speaker"]),
    "L25 narration cards name no speaker"
  );
  const l26cards = (lessonById("t2-l02-two-kinds-of-claims")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  assert.ok(
    l26cards.every((card) => !card["speaker"]),
    "L26 carries narration only; no voiced source goes unnamed"
  );
});

// ---------------- Worked ----------------

test("R18-WORKED: each lesson completes its reasoning visibly", () => {
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

test("R18-SYNC: in-lesson selections copy their bank items exactly", () => {
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

// Theme 2 source codes use course-absolute lesson numbers (24-33):
// L24 = t2-l01, L25 = t2-l05, L26 = t2-l02. Theme 1 codes stay
// theme-local (L01-L23). Later batches extend T2_LESSONS as they build.
const T2_LESSONS: Record<string, string> = {
  "24": "t2-l01-why-land-matters",
  "25": "t2-l05-land-values",
  "26": "t2-l02-two-kinds-of-claims",
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

test("R18-BANK: 6+2 reviewed items per lesson with distinct stimuli and reasoning", () => {
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

test("R18-GATING: both written tasks lock criteria until an explicit first save", () => {
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

test("R18-LANGUAGE: clean learner teaching; feedback teaches evidence and reasoning", () => {
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

test("R18-RENDER: answerable controls and disclosures render per lesson", () => {
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
  { id: "q1", label: "What three things does the Nisga'a treaty emphasize?", marks: "/3", kind: "shortAnswer", number: "1", rows: 3 },
  {
    id: "q2",
    label:
      "Describe the value Indigenous Peoples place on their land into the following categorical beliefs - give an example of each:",
    marks: "/12",
    kind: "table",
    number: "2",
  },
  { id: "q3", label: "Why is the Nisga'a petition such an important event in Canada's history?", marks: "/1", kind: "shortAnswer", number: "3", rows: 2 },
  {
    id: "q4",
    label:
      "How did the Canadian Federal Government change the laws to make it difficult for First Nations to pursue land claims until 1955?",
    marks: "/3",
    kind: "shortAnswer",
    number: "4",
    rows: 3,
  },
  { id: "q5", label: "In the Calder case, what did the Supreme Court declare about Aboriginal title?", marks: "/2", kind: "shortAnswer", number: "5", rows: 3 },
];

const Q2_ROWS: Array<{ id: string; label: string }> = [
  { id: "economic", label: "Economic Value" },
  { id: "cultural", label: "Cultural Value" },
  { id: "spiritual", label: "Spiritual Value" },
  { id: "educational", label: "Educational Value" },
  { id: "social", label: "Social Value" },
  { id: "political", label: "Political Value" },
];

function bookletPrompt(promptId: string): JsonRecord {
  const activities = DATA["themeActivities"] as Array<{ id: string; sections?: Array<{ prompts?: JsonRecord[] }> }>;
  const booklet = activities.find((activity) => activity.id === "theme-2-online-booklet");
  assert.ok(booklet, "theme-2 booklet exists");
  for (const section of booklet?.sections || []) {
    const found = (section.prompts || []).find((prompt) => prompt["id"] === promptId);
    if (found) return found;
  }
  assert.fail(`booklet prompt ${promptId} must exist`);
}

test("R18-ASSIGNED: q1-q5 byte-pinned; 2.1 home intact; no duplicate compulsory response", () => {
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
  const q2 = bookletPrompt("q2");
  assert.deepEqual(
    plain(q2["rows"]),
    Q2_ROWS,
    "q2 rows byte-identical"
  );
  const assign21 = bookletPrompt("2-1-land-stewardship");
  assert.equal(
    assign21["label"],
    "Based on what you have watched and read so far, what do you think oral tradition teaches us about the Indigenous concept of land stewardship and how does it relate to what you currently know about land ownership? Respond in paragraph form using the response criteria.",
    "2.1 label byte-identical"
  );
  assert.equal(assign21["marks"], "/16", "2.1 marks byte-identical");
  assert.equal(assign21["rows"], 8, "2.1 rows pinned");
  assert.equal(assign21["kind"], "shortAnswer", "2.1 kind pinned");
  const assignments = DATA["assignments"] as Array<{ id: string; title: string }>;
  for (const [id, title] of [
    ["2-1-land-stewardship", "2.1 Land Stewardship"],
    ["2-2-specific-land-claims", "2.2 Specific Land Claims"],
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
