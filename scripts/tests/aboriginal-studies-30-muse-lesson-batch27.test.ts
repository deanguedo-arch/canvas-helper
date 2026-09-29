/**
 * AB30-MUSE R27 batch suite — copy-lane Theme 4 lessons 46-47 (v2).
 *
 * Proves per lesson against the Muse copy production files: versioned v2
 * structure with valid blocks, L47 textbook extracts byte-verified against
 * the ch7 pp218-225 fixture band, web-source cards (L46 A/B, L47-B Rio)
 * structurally pinned with dated locators (live web byte-verification is
 * NOT_RUN in this sandbox: no network egress; recorded in the R27-copy
 * record), full attribution incl. creator and context limits, completed
 * worked reasoning with evidence refs resolving to exact card titles, the
 * 6+2 reviewed bank with resolvable source codes, first-save gating on
 * both written tasks, formative workload roles, evidence-language
 * feedback, and byte-pinned assigned records (Theme 4 q7-q17).
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
  `[ab30-muse-r27] tested inputs: ${JSON.stringify({
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
  textbookLabel: string;
  assignmentIds: string[];
  assignmentHomeIds: string[];
}

const BATCH: BatchLesson[] = [
  {
    lessonId: "t4-l02-colonial-wounds",
    contentVersion: "ab30-v2-l46.1",
    bookletQuestionIds: ["q7", "q8", "q9", "q10", "q11", "q12", "q13", "q14"],
    supportedItemId: "ab30-v2-l46-application-1",
    sourceTitles: ["Source A · Australian fact sheet", "Source B · Canadian residential school history"],
    textbookLabel: "Textbook Chapter 7, pages 218–222",
    assignmentIds: ["4-2-rabbit-proof-fence"],
    assignmentHomeIds: ["4-2-rabbit-proof-fence"],
  },
  {
    lessonId: "t4-l06-resources-conflict",
    contentVersion: "ab30-v2-l47.1",
    bookletQuestionIds: ["q15", "q16", "q17"],
    supportedItemId: "ab30-v2-l47-rio-1",
    sourceTitles: [
      "Source A · Great Bear Lake uranium",
      "Source B · Rio Declaration, Principle 22",
      "Source C · the textbook’s Syncrude account",
    ],
    textbookLabel: "Textbook Chapter 7, pages 220–225",
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

test("M27-STRUCT: versioned v2 lessons with valid frozen-pattern blocks", () => {
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
    assert.deepEqual(
      (lesson["blocks"] as JsonRecord[])
        .filter((block) => block["type"] === "source")
        .map((block) => block["title"]),
      spec.sourceTitles,
      `${spec.lessonId} card titles pinned`
    );
    assert.equal(
      (lesson["textbook"] as JsonRecord)["label"],
      spec.textbookLabel,
      `${spec.lessonId} keeps its v1 page range`
    );
  }
  const l46 = lessonById("t4-l02-colonial-wounds");
  assert.ok(
    existsSync(path.resolve(workspaceDir, "assets", "assignments", "docx", "4-2-rabbit-proof-fence.docx")),
    "L46 assignment asset exists in the copy"
  );
  assert.ok(l46, "L46 loads");
});

// ---------------- Quotes ----------------

// L47 textbook-account extracts verify against the ch7 pp218-225 band.
// L46 web cards and the Rio card cannot byte-verify offline (no network
// egress in this sandbox); they are pinned structurally with dated
// locators and the gap is recorded in the R27-copy record.
const TEXTBOOK_VERIFIED_TITLES = [
  "Source A · Great Bear Lake uranium",
  "Source C · the textbook’s Syncrude account",
];

test("M27-QUOTES: textbook extracts verify verbatim; web cards pinned with dated locators", () => {
  for (const spec of BATCH) {
    for (const source of sourceCards(spec.lessonId)) {
      const title = String(source["title"]);
      const extract = quoteNorm(String(source["extract"] || ""));
      assert.ok(extract.length > 40, `${spec.lessonId} ${title} extract is substantial`);
      if (TEXTBOOK_VERIFIED_TITLES.includes(title)) {
        assert.ok(
          TEXTBOOK_BAND.includes(extract),
          `${spec.lessonId} ${title} verifies against textbook ch7 pp218-225`
        );
      } else {
        const locator = String(source["locator"] || "");
        assert.ok(
          /accessed 24 September 2026|linked in Theme 4 Resources|Rio Declaration \(1992\)/.test(locator),
          `${spec.lessonId} ${title} locator pins its live source`
        );
      }
    }
  }
  // Controls: tampered quotations must fail the same band check.
  const mutated = quoteNorm("The agent controlled the proceedings in the year 1901.");
  assert.ok(!TEXTBOOK_BAND.includes(mutated), "verification bites on invented wording");
  const swapped = quoteNorm("Eldorado’s primary customer was the Canadian Pacific Railway.");
  assert.ok(!TEXTBOOK_BAND.includes(swapped), "band must not contain altered customer wording");
});

// ---------------- Attribution ----------------

test("M27-SOURCES: full attribution; creator and limits on every card", () => {
  for (const spec of BATCH) {
    for (const source of sourceCards(spec.lessonId)) {
      const label = `${spec.lessonId} ${source["title"]}`;
      for (const field of ["extract", "sourceType", "locator", "attribution", "creator", "contextLimits"]) {
        assert.ok(
          typeof source[field] === "string" && (source[field] as string).trim().length > 0,
          `${label} needs ${field}`
        );
      }
      assert.ok(!source["speaker"], `${label}: institutional/textbook cards name no speaker`);
    }
  }
  const l46cards = sourceCards("t4-l02-colonial-wounds");
  assert.equal(l46cards[0]["creator"], "NSW Department of Education", "L46 Source A names its creator");
  assert.ok(
    String(l46cards[1]["creator"]).includes("National Centre for Truth and Reconciliation"),
    "L46 Source B names the NCTR"
  );
  const l47cards = sourceCards("t4-l06-resources-conflict");
  assert.equal(
    l47cards[0]["sourceType"],
    "Textbook historical account",
    "L47 Source A stays a textbook account"
  );
  assert.equal(l47cards[1]["sourceType"], "United Nations declaration", "L47 Source B is the Rio declaration");
  assert.ok(
    /printed pp?\. 22[0-5]/.test(String(l47cards[0]["locator"])),
    "L47 Source A locator pins printed pages"
  );
  assert.ok(
    String(l47cards[2]["locator"]).includes("printed p. 224"),
    "L47 Source C locator pins printed p. 224"
  );
});

// ---------------- Worked ----------------

test("M27-WORKED: each lesson completes its reasoning visibly with resolvable refs", () => {
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
    // R27 variance (recorded): repair-oriented 3-step reasoning, not the
    // 4-step tour pattern of R25/R26.
    assert.equal(reasoning.length, 3, `${spec.lessonId}: three visible steps`);
    const response = String(worked["response"] || "");
    assert.ok(response.length > 200, `${spec.lessonId}: finished response is substantial`);
    assert.ok(/Sources? [A-Z]/.test(response), `${spec.lessonId}: response cites its sources`);
  }
});

// ---------------- Supported sync ----------------

test("M27-SYNC: in-lesson selections copy their bank items exactly", () => {
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

// Copy-lane source-code registry. Card codes (L46-A) resolve to lesson
// source cards by letter prefix; booklet page codes (L46-booklet-pN)
// resolve to the Theme 4 booklet; textbook page codes
// (L47-textbook-pN) must fall inside the lesson's textbook page range.
const T2_LESSONS: Record<string, string> = {
  "44": "t4-l01-one-world-many-peoples",
  "45": "t4-l05-nine-issues",
  "46": "t4-l02-colonial-wounds",
  "47": "t4-l06-resources-conflict",
};

function textbookRange(lessonId: string): [number, number] {
  const label = String((lessonById(lessonId)["textbook"] as JsonRecord)["label"] || "");
  const match = label.match(/pages (\d+)[–-](\d+)/);
  assert.ok(match, `${lessonId} textbook label carries a page range`);
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
    const [lo, hi] = textbookRange(lessonId);
    return Number(page[2]) >= lo && Number(page[2]) <= hi;
  }
  return false;
}

test("M27-BANK: 6+2 reviewed items per lesson with resolvable sources", () => {
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

test("M27-GATING: both written tasks lock criteria until an explicit first save", () => {
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

test("M27-LANGUAGE: clean learner teaching; feedback teaches evidence and reasoning", () => {
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

test("M27-RENDER: answerable controls and disclosures render per lesson", () => {
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
  { id: "q7", label: "Why do you think when referring to a PERSON you should NOT call them ATSI or FNMI?", marks: "/2", kind: "shortAnswer", number: "7", rows: 3 },
  { id: "q8", label: "Think back to Aboriginal Studies 20, what reasons do you think a colonizer would give for separating indigenous children from their families? Consider several factors, including the impacts this separation would have had on indigenous cultures.", marks: "/3", kind: "shortAnswer", number: "8", rows: 4 },
  { id: "q9", label: "What are some similarities and differences between Australia and Canada's forced assimilation policies and beliefs.", marks: "/5", kind: "shortAnswer", number: "9", rows: 5 },
  { id: "q10", label: "Describe how you felt witnessing the girl's forceful removal.", marks: "/4", kind: "shortAnswer", number: "10", rows: 4 },
  { id: "q11", label: "Share examples of how Molly used her traditional knowledge to find her way over 1000 miles to get home.", marks: "/2", kind: "shortAnswer", number: "11", rows: 3 },
  { id: "q12", label: "Explain the role of the Aboriginal tracker and why he tracked students who ran away.", marks: "/2", kind: "shortAnswer", number: "12", rows: 3 },
  { id: "q13", label: "Discuss the extreme lengths Mr. Neville, aka the Devil, went to in order to find the girls.", marks: "/3", kind: "shortAnswer", number: "13", rows: 3 },
  { id: "q14", label: "Discuss how Molly and her daughter were impacted again and again.", marks: "/3", kind: "shortAnswer", number: "14", rows: 3 },
  { id: "q15", label: "What is the connection between Hiroshima and the Dene people of Great Bear Lake?", marks: "/2", kind: "shortAnswer", number: "15", rows: 3 },
  { id: "q16", label: "What does the Rio Declaration of 1992 state?", marks: "/2", kind: "shortAnswer", number: "16", rows: 3 },
  { id: "q17", label: "What is the nature of the relationship between Syncrude and many of Canada's Aboriginal people?", marks: "/2", kind: "shortAnswer", number: "17", rows: 3 },
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

test("M27-ASSIGNED: Theme 4 q7-q17 byte-pinned; no duplicate compulsory response", () => {
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
