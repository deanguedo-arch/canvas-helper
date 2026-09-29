/**
 * AB30 R25 batch suite — Theme 3 lessons 42-43 (v2 rebuilds). Devolution + proof/report.
 *
 * Proves per lesson against the real production files: versioned v2
 * structure with valid blocks, verbatim source extracts against the R25
 * textbook band (ch6 pp198-207), full attribution with named speakers
 * where the voice is the person's own (Zoe, Johnson, Francis),
 * completed worked reasoning, in-lesson/bank selection sync, the 6+2
 * reviewed bank with distinct stimuli/reasoning, first-save gating on
 * both written tasks, formative workload roles, evidence-language
 * feedback, and byte-pinned assigned records (Theme 3 q25-q30 plus the
 * Attawapiskat report prompt).
 *
 * Booklet authority: q25-q30 labels/marks and the 3.3 report wording
 * below were verified first-hand against the staged official
 * AB30Theme3Booklet.pdf (file pp17-20) during R25 and match the R07
 * transcription. They are pinned byte-identical, including print's
 * capital-S Services in q28.
 *
 * Live-browser halves are NOT_RUN in this sandbox and recorded in
 * meta/ab30-v2/evidence/R25/; the as30-r08-browser.cjs script covers the
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
  "scripts", "tests", "fixtures", "ab30-parity", "textbook-ch6-pp198-207.txt"
);

const dataSource = readFileSync(dataPath, "utf8");
const bankSource = readFileSync(bankPath, "utf8");
const engineSource = readFileSync(enginePath, "utf8");
const componentsSource = readFileSync(componentsPath, "utf8");

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

console.log(
  `[ab30-r25] tested inputs: ${JSON.stringify({
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
  sourceBands: Record<string, "band-ch6c">;
  assignmentIds: string[];
  assignmentHomeIds: string[];
}

function l42Bands(): Record<string, "band-ch6c"> {
  const bands: Record<string, "band-ch6c"> = {};
  for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"]) {
    bands[`Source ${letter}`] = "band-ch6c";
  }
  return bands;
}

function l43Bands(): Record<string, "band-ch6c"> {
  const bands: Record<string, "band-ch6c"> = {};
  for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"]) {
    bands[`Source ${letter}`] = "band-ch6c";
  }
  return bands;
}

const BATCH: BatchLesson[] = [
  {
    lessonId: "t3-l10-devolution",
    contentVersion: "ab30-v2-l42.1",
    bookletQuestionIds: ["q25", "q26", "q27", "q28"],
    supportedItemId: "ab30-v2-l42-blind-1",
    sourceCount: 16,
    sourceBands: l42Bands(),
    assignmentIds: [],
    assignmentHomeIds: [],
  },
  {
    lessonId: "t3-l04-urban-life-services",
    contentVersion: "ab30-v2-l43.1",
    bookletQuestionIds: ["q29", "q30"],
    supportedItemId: "ab30-v2-l43-proof-1",
    sourceCount: 15,
    sourceBands: l43Bands(),
    assignmentIds: ["attawapiskat-report"],
    assignmentHomeIds: ["attawapiskat-report"],
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

test("R25-STRUCT: versioned v2 lessons with valid frozen-pattern blocks", () => {
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
  const l42 = lessonById("t3-l10-devolution");
  assert.ok(
    !(l42["blocks"] as JsonRecord[]).some((block) => block["type"] === "assignmentConnection"),
    "t3-l10-devolution links no assignment"
  );
  const l43 = lessonById("t3-l04-urban-life-services");
  const connections = (l43["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "assignmentConnection"
  );
  assert.equal(connections.length, 1, "t3-l04-urban-life-services holds exactly one assignment connection");
  assert.equal(connections[0]["assignmentId"], "attawapiskat-report", "L43 homes the Attawapiskat report");
  assert.equal(
    (l42["textbook"] as JsonRecord)["label"],
    "Textbook Chapter 6, pages 198-202",
    "L42 keeps the argument pages (AHRDS, capacity, controversies, health)"
  );
  assert.equal(
    (l43["textbook"] as JsonRecord)["label"],
    "Textbook Chapter 6, pages 203-207",
    "L43 absorbs p203 (NCSA/Sivuniksavut proof opens the proof lesson)"
  );
  const l42close = (l42["blocks"] as JsonRecord[]).find(
    (block) => block["type"] === "explanation" && String(block["heading"]).includes("Lesson 10")
  ) as JsonRecord;
  assert.ok(l42close, "t3-l10-devolution hands the proof forward to Lesson 10");
});

// ---------------- Quotes ----------------

test("R25-QUOTES: every batch extract verifies verbatim against its band", () => {
  const bands = { "band-ch6c": TEXTBOOK_BAND };
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
  const swapped = quoteNorm("We represent all our people, regardless of where they live");
  assert.ok(!TEXTBOOK_BAND.includes(swapped), "ch6c band must not contain R24-only wording");
});

// ---------------- Attribution ----------------

test("R25-SOURCES: full attribution; speakers only where the source names them", () => {
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
      if (sourceType === "Textbook narration") {
        assert.ok(!source["speaker"], `${label}: narration names no speaker`);
        assert.ok(
          typeof source["creator"] === "string" && (source["creator"] as string).trim().length > 0,
          `${label}: narration names its creator voice`
        );
      } else if (sourceType === "Published quotation" || sourceType === "Published poem") {
        assert.ok(
          typeof source["speaker"] === "string" && (source["speaker"] as string).trim().length > 0,
          `${label}: voiced sources name a speaker`
        );
        assert.ok(
          typeof source["creator"] === "string" && (source["creator"] as string).trim().length > 0,
          `${label}: voiced sources name a creator`
        );
        assert.ok(
          typeof source["contextLimits"] === "string" && (source["contextLimits"] as string).trim().length > 0,
          `${label}: voiced sources state limits`
        );
      } else {
        assert.fail(`${label}: unexpected sourceType ${sourceType}`);
      }
    }
  }
  const l42cards = (lessonById("t3-l10-devolution")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  const zoe = l42cards.find((card) => card["title"] === "Source C") as JsonRecord;
  assert.equal(zoe["speaker"], "Henry Zoe", "L42 Source C names Zoe");
  assert.equal(zoe["sourceType"], "Published quotation", "L42 Source C is a published quotation");
  assert.ok(
    l42cards.filter((card) => card["title"] !== "Source C").every((card) => !card["speaker"]),
    "L42 narration cards name no speaker"
  );
  const l43cards = (lessonById("t3-l04-urban-life-services")["blocks"] as JsonRecord[]).filter(
    (block) => block["type"] === "source"
  );
  const johnsonI = l43cards.find((card) => card["title"] === "Source I") as JsonRecord;
  assert.equal(johnsonI["speaker"], "Lee Ann Johnson", "L43 Source I names Johnson");
  const johnsonJ = l43cards.find((card) => card["title"] === "Source J") as JsonRecord;
  assert.equal(johnsonJ["speaker"], "Lee Ann Johnson", "L43 Source J names Johnson");
  const francis = l43cards.find((card) => card["title"] === "Source N") as JsonRecord;
  assert.equal(francis["speaker"], "Marvin Francis", "L43 Source N names Francis");
  assert.equal(francis["sourceType"], "Published poem", "L43 Source N is a published poem");
  assert.ok(
    l43cards
      .filter(
        (card) => card["title"] !== "Source I" && card["title"] !== "Source J" && card["title"] !== "Source N"
      )
      .every((card) => !card["speaker"]),
    "L43 narration cards name no speaker"
  );
});

// ---------------- Worked ----------------

test("R25-WORKED: each lesson completes its reasoning visibly", () => {
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

test("R25-SYNC: in-lesson selections copy their bank items exactly", () => {
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
  "40": "t3-l08-city-test",
  "41": "t3-l09-friendship-success",
  "42": "t3-l10-devolution",
  "43": "t3-l04-urban-life-services",
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

test("R25-BANK: 6+2 reviewed items per lesson with distinct stimuli and reasoning", () => {
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

test("R25-GATING: both written tasks lock criteria until an explicit first save", () => {
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

test("R25-LANGUAGE: clean learner teaching; feedback teaches evidence and reasoning", () => {
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

test("R25-RENDER: answerable controls and disclosures render per lesson", () => {
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
  { id: "q25", label: "What is AHRDS and what does it do?", marks: "/1", kind: "shortAnswer", number: "25", rows: 2 },
  { id: "q26", label: "Why might Aboriginal services require significant time to develop?", marks: "/1", kind: "shortAnswer", number: "26", rows: 2 },
  { id: "q27", label: "What is the problem with assuming that Aboriginal services place an unfair tax burden on the average citizen?", marks: "/2", kind: "shortAnswer", number: "27", rows: 3 },
  { id: "q28", label: "What is the difference between non-Aboriginal and Aboriginal health care Services?", marks: "/2", kind: "shortAnswer", number: "28", rows: 3 },
  { id: "q29", label: "How did the Nunavut Sivuniksavut program begin and what does it do now?", marks: "/2", kind: "shortAnswer", number: "29", rows: 3 },
  { id: "q30", label: "What are two examples given in the textbook of Aboriginal services being provided by Aboriginal people?", marks: "/2", kind: "shortAnswer", number: "30", rows: 3 },
  { id: "attawapiskat-report", label: "Community report: explain why Attawapiskat is seen as a community in crisis living in poor conditions, using the 2011 document plus your own research (current data from 2015 onwards, suicide/housing/health care crisis, what the future could hold, what could help, and 3 current sources from 2023 or later).", marks: "/16", kind: "shortAnswer", rows: 8 },
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

test("R25-ASSIGNED: Theme 3 q25-q30 and report byte-pinned; no duplicate compulsory response", () => {
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
  assert.ok(
    String(bookletPrompt("q28")["label"]).includes("health care Services"),
    "q28 keeps print's capital-S Services"
  );
  assert.ok(
    String(bookletPrompt("attawapiskat-report")["label"]).includes("2023 or later"),
    "report keeps the booklet's 2023 recency requirement"
  );
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

