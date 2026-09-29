/**
 * AB30-MUSE acceptance suite — whole-copy integrity for the Muse lane.
 *
 * Cross-batch invariants against the Muse copy production files: 50/50
 * lessons carry v2 content versions, every lesson's blocks validate
 * against the frozen renderer, the bank holds exactly 8 reviewed
 * formative mark-free items per lesson (400 total, unique ids), every
 * objective item maps through the engine and passes eligibility with a
 * judging key, and the Theme 4 assigned surface is intact (q1-q22,
 * assignment links, assets on disk).
 *
 * Scoped to projects/aboriginal-studies-30-muse. Runners: `node --test <this file>`.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30-muse", "workspace");
const dataSource = readFileSync(path.resolve(workspaceDir, "course-data.js"), "utf8");
const bankSource = readFileSync(path.resolve(workspaceDir, "practice-data.js"), "utf8");
const engineSource = readFileSync(path.resolve(workspaceDir, "practice-engine.js"), "utf8");
const componentsSource = readFileSync(path.resolve(workspaceDir, "lesson-components.js"), "utf8");

console.log(
  `[ab30-muse-accept] inputs: ${JSON.stringify({
    "course-data.js": createHash("sha256").update(dataSource, "utf8").digest("hex").slice(0, 16),
    "practice-data.js": createHash("sha256").update(bankSource, "utf8").digest("hex").slice(0, 16),
  })}`
);

type JsonRecord = Record<string, unknown>;
function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
function loadGlobal(source: string, name: string, file: string): JsonRecord {
  const context = { window: {} as Record<string, unknown> };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: file });
  const value = context.window[name];
  assert.ok(value && typeof value === "object", `${name} must load`);
  return plain(value) as JsonRecord;
}

function loadLive(source: string, name: string, file: string): Record<string, (...args: unknown[]) => unknown> {
  const context = { window: {} as Record<string, unknown> };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: file });
  const value = context.window[name] as Record<string, (...args: unknown[]) => unknown>;
  assert.ok(value && typeof value === "object", `${name} must load`);
  return value;
}

const DATA = loadGlobal(dataSource, "ABORIGINAL_STUDIES_30_DATA", "course-data.js");
const BANK = loadGlobal(bankSource, "AB30PracticeData", "practice-data.js");
const ENGINE = loadLive(engineSource, "AB30PracticeEngine", "practice-engine.js");
const BLOCKS = loadLive(componentsSource, "AB30LessonBlocks", "lesson-components.js");

function allLessons(): JsonRecord[] {
  return (DATA["units"] as Array<{ lessons?: JsonRecord[] }>).flatMap((unit) => unit.lessons || []);
}

test("MUSE-ACCEPT-STRUCT: 50/50 lessons v2 with validating blocks", () => {
  const lessons = allLessons();
  assert.equal(lessons.length, 50, "fifty lessons");
  for (const lesson of lessons) {
    assert.match(
      String(lesson["contentVersion"] || ""),
      /^ab30-v2-l\d+\.1$/,
      `${lesson["id"]} versioned v2`
    );
    assert.deepEqual(
      plain((BLOCKS["validateLessonBlocks"] as (...a: unknown[]) => unknown)(lesson["blocks"])),
      [],
      `${lesson["id"]} blocks validate clean`
    );
  }
});

test("MUSE-ACCEPT-BANK: 400 reviewed formative items, 8 per lesson, unique ids", () => {
  const items = BANK["ITEMS"] as JsonRecord[];
  assert.equal(items.length, 400, "bank total");
  assert.equal(new Set(items.map((item) => item["id"])).size, 400, "ids unique");
  const byLesson = new Map<string, number>();
  for (const item of items) {
    assert.equal(item["reviewed"], true, `${item["id"]} reviewed`);
    assert.equal(item["formalMarks"], null, `${item["id"]} carries no marks`);
    assert.equal(item["compulsory"], false, `${item["id"]} is formative`);
    byLesson.set(String(item["lessonId"]), (byLesson.get(String(item["lessonId"])) || 0) + 1);
  }
  for (const lesson of allLessons()) {
    assert.equal(byLesson.get(String(lesson["id"])), 8, `${lesson["id"]}: exactly 8 items`);
  }
});

test("MUSE-ACCEPT-ENGINE: every objective item maps, passes eligibility, judges", () => {
  const items = BANK["ITEMS"] as JsonRecord[];
  const objective = items.filter((item) => item["mode"] === "multipleChoice");
  assert.equal(objective.length, 300, "300 objective items");
  const build = ENGINE["buildSelectedResponseItems"] as (
    items: unknown[], seed: string, version: string, exposed: Record<string, string>
  ) => JsonRecord[];
  const eligible = ENGINE["eligibleItems"] as (items: unknown[]) => { eligible: unknown[]; excluded: unknown[] };
  const feedbackFor = ENGINE["feedbackFor"] as (
    item: unknown, optionId: string
  ) => { correct: boolean; text: string };
  for (const lesson of allLessons()) {
    const six = objective.filter((item) => item["lessonId"] === lesson["id"]);
    assert.equal(six.length, 6, `${lesson["id"]}: six objective items`);
    const mapped = plain(build(six, String(lesson["id"]), "ab30-practice-bank-v1", {}));
    const gate = plain(eligible(mapped));
    assert.equal(gate.eligible.length, 6, `${lesson["id"]}: all eligible`);
    assert.equal(gate.excluded.length, 0, `${lesson["id"]}: none excluded`);
    for (const item of mapped) {
      const key = String((six.find((entry) => entry["id"] === item["id"]) as JsonRecord)["correctOptionId"]);
      assert.equal(feedbackFor(item, key).correct, true, `${item["id"]} key judges correct`);
    }
  }
});

test("MUSE-ACCEPT-ASSIGNED: Theme 4 booklet q1-q22 and assignment surface intact", () => {
  const activities = DATA["themeActivities"] as Array<{
    id: string; sections?: Array<{ prompts?: JsonRecord[] }>;
  }>;
  const booklet = activities.find((activity) => activity.id === "theme-4-online-booklet");
  assert.ok(booklet, "theme-4 booklet exists");
  const prompts = (booklet?.sections || []).flatMap((section) => section.prompts || []);
  for (let n = 1; n <= 22; n++) {
    assert.ok(prompts.some((prompt) => prompt["id"] === `q${n}`), `booklet prompt q${n} exists`);
  }
  for (const asset of ["4-2-rabbit-proof-fence.docx", "4-3-personal-response.docx"]) {
    assert.ok(
      existsSync(path.resolve(workspaceDir, "assets", "assignments", "docx", asset)),
      `assignment asset ${asset} on disk`
    );
  }
  assert.ok(
    existsSync(path.resolve(workspaceDir, "assets", "library", "chapter-7.pdf")),
    "chapter-7 source PDF staged"
  );
  assert.ok(
    existsSync(path.resolve(workspaceDir, "assets", "library", "halfbreed-maria-campbell.pdf")),
    "halfbreed source PDF staged"
  );
});
