/**
 * AB30 Theme 4 crosswalk suite — T18-partial (MAP06-adjacent, SRC02/COMP02-supporting, NOVEL-GATE).
 *
 * Mirrors the T14/T16 approach: the official Theme 4 booklet is unavailable,
 * so T18 restores STRUCTURE with every item explicitly blocked. Adds the 4.1
 * comparison-chart inventory (12 categories x both columns) and the novel
 * version gate (legacy preserved + live, Halfbreed staged but NOT activated).
 *
 * Runners: `node --test <this file>` (sandbox-usable, import-free) and
 * `npx tsx --test <this file>` (repo convention for lead/CI).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const manifestPath = path.resolve(
  "projects",
  "aboriginal-studies-30",
  "meta",
  "ab30-parity",
  "assignment-manifest.json"
);
const crosswalkPath = path.resolve(
  "projects",
  "aboriginal-studies-30",
  "meta",
  "ab30-parity",
  "theme-4-crosswalk.json"
);
const fixturePath = path.resolve("scripts", "tests", "fixtures", "ab30-parity", "theme4-workbook-prompts.txt");

type CrosswalkItem = {
  id: string;
  class: string;
  disposition: string;
  blockedReason?: string;
  owningTicket?: string;
  workbookAnalogue?: { paras: number[]; confidence: string; note: string } | null;
  runtimeKeyReservation?: string | null;
  lessonHome?: string | null;
  liveRecord?: string;
  verifiedSource?: string;
  candidateRecord?: string | null;
  categories?: Array<{ seq: string; para: number; label: string }>;
  columns?: string[];
};

type Crosswalk = {
  schemaVersion: number;
  dispositions: string[];
  gdoc: string;
  duplicatedPrompts: string;
  items: CrosswalkItem[];
};

function loadCrosswalk(): Crosswalk {
  return JSON.parse(readFileSync(crosswalkPath, "utf8")) as Crosswalk;
}

function loadFixtureParas(): Map<number, string> {
  const paras = new Map<number, string>();
  for (const line of readFileSync(fixturePath, "utf8").split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const match = /^\[(\d+)\] (.*)$/.exec(line);
    assert.ok(match, `fixture line must be [para] text: ${line.slice(0, 60)}`);
    paras.set(Number(match[1]), match[2]);
  }
  return paras;
}

function loadCourseData(): Record<string, unknown> {
  const context = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: Record<string, unknown> } };
  vm.createContext(context);
  vm.runInContext(readFileSync(dataPath, "utf8"), context, { filename: "course-data.js" });
  const data = context.window.ABORIGINAL_STUDIES_30_DATA;
  assert.ok(data && typeof data === "object", "course-data.js must assign window.ABORIGINAL_STUDIES_30_DATA");
  return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

test("T4XW01: R07 crosswalk carries Theme 4 items verified; workbook extras stay blocked", () => {
  const crosswalk = loadCrosswalk();
  assert.equal(crosswalk.schemaVersion, 1);
  assert.ok(crosswalk.gdoc.includes("docs.google.com"), "human fetch link recorded");
  assert.ok(
    crosswalk.duplicatedPrompts.includes("wb-q04a") && crosswalk.duplicatedPrompts.includes("wb-q04b"),
    "duplicated workbook Q4 tracked as two separate items"
  );
  const ids = crosswalk.items.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, "crosswalk ids must be unique");
  const expected = [
    ...Array.from({ length: 22 }, (_, n) => `t4-q${String(n + 1).padStart(2, "0")}`),
    "theme-4-comparison-4-1",
    "4-2-rabbit-proof-fence",
    "theme-4-novel-4-3",
    "workbook-extra-4-3-contemporary-issues",
    "workbook-extra-4-4-undrip",
  ];
  assert.deepEqual([...ids].sort(), [...expected].sort(), "Q1-22 + 4.1 + 4.2 + novel + 2 extras");
  assert.ok(crosswalk.dispositions.includes("booklet-verified"), "verified disposition in the allowed set");
  for (const item of crosswalk.items) {
    assert.ok(
      crosswalk.dispositions.includes(item.disposition),
      `${item.id} disposition must come from the allowed set`
    );
    assert.equal(item.owningTicket, "R07", `${item.id} owned by R07`);
    if (item.class === "unmapped-workbook-task") {
      assert.equal(item.disposition, "blocked", `${item.id} stays blocked with no booklet counterpart`);
      assert.ok(item.blockedReason && item.blockedReason.length > 50, `${item.id} must name a reason`);
      assert.equal(item.lessonHome, null, `${item.id} homeless until a teacher rules`);
      continue;
    }
    assert.equal(item.disposition, "booklet-verified", `${item.id} verified against the official booklet`);
    assert.ok(item.lessonHome, `${item.id} must name its verified lesson home`);
    assert.ok(item.liveRecord, `${item.id} must name its live record`);
    assert.ok(item.verifiedSource?.includes("AB30-T4"), `${item.id} must cite the official source`);
    assert.ok(!item.blockedReason, `${item.id} verified items carry no blocked reason`);
    if (item.runtimeKeyReservation) {
      assert.ok(
        item.runtimeKeyReservation.startsWith("theme-4-online-booklet::") ||
          item.runtimeKeyReservation.startsWith("written::"),
        `${item.id} reservation namespaced`
      );
    }
  }
  const reservations = crosswalk.items
    .map((item) => item.runtimeKeyReservation)
    .filter((key): key is string => !!key);
  assert.equal(new Set(reservations).size, reservations.length, "reservations must be unique");
});

test("T4XW02: workbook analogues resolve to the prompt-only fixture; fixture holds no student work", () => {
  const crosswalk = loadCrosswalk();
  const paras = loadFixtureParas();
  assert.ok(paras.size >= 120, `fixture must hold the curated prompts, got ${paras.size}`);
  for (const item of crosswalk.items) {
    for (const para of item.workbookAnalogue?.paras ?? []) {
      assert.ok(paras.has(para), `${item.id} analogue para ${para} must exist in the fixture`);
      assert.ok((paras.get(para) as string).length > 0, `${item.id} analogue para ${para} must hold prompt text`);
    }
    for (const entry of item.categories ?? []) {
      assert.ok(paras.has(entry.para), `${item.id} category ${entry.seq} para ${entry.para} must resolve`);
    }
  }
  const raw = readFileSync(fixturePath, "utf8");
  for (const banned of [
    "Daniel Petherick",
    "Date Due",
    "They did it for religious reasons",
    "They hated it, they wanted to die",
    "I would focus on forestry",
  ]) {
    assert.ok(!raw.includes(banned), `fixture must exclude student identity/answers: ${banned.slice(0, 40)}`);
  }
  assert.ok(
    (paras.get(230) as string).includes("COMPARISON") && (paras.get(230) as string).includes("CHART"),
    "4.1 chart header pinned at para 230"
  );
  assert.ok(
    (paras.get(121) as string).includes("geopolitical") && (paras.get(135) as string).includes("boundaries"),
    "duplicated Q4 halves pinned at paras 121 + 135"
  );
});

test("T4XW03: live 4.2 pinned to booklet wording; legacy 4.3 novel untouched", () => {
  const data = loadCourseData();
  const assignments = data["assignments"] as Array<{ id: string; summary: string }>;
  const byId = new Map(assignments.map((assignment) => [assignment.id, assignment]));
  const expected42 =
    "Based on what you have watched and read... What is their opinion on the Stolen Generations? Why do they think some " +
    "Australians deny the idea of the Stolen Generations? What do they think the impact of the Stolen Generations has been " +
    "on the Australian Aboriginal community? Respond in paragraph form (1-2 paragraphs) using the response criteria.";
  const expected43 =
    "Based on what you have watched and read... CHOOSE ONE to respond to. What can you identify in contemporary life and " +
    "pop culture that plays upon the stereotypes of the Dead Indian? Having read The Inconvenient Indian, have your perceptions " +
    "been challenged? Do you see what may have never before been noticed? In this course you have been confronted with story " +
    "upon story of injustices towards Indigenous Peoples. Having read The Inconvenient Indian, what part of this book has most " +
    "remained with you? How has reading The Inconvenient Indian influenced your idea about progress in North America, and how " +
    "things need to develop with Native and non-Native relations? In improving relations, respect for the rights and conditions " +
    "for life for Indigenous peoples in North America, what do you feel should be done? Respond in paragraph form using the " +
    "response criteria.";
  assert.equal(byId.get("4-2-rabbit-proof-fence")?.summary, expected42, "4.2 summary pinned (no silent drift)");
  assert.equal(byId.get("4-3-personal-response")?.summary, expected43, "4.3 summary pinned (no silent drift)");
  assert.ok(
    (byId.get("4-3-personal-response")?.summary as string).includes("The Inconvenient Indian"),
    "legacy novel stays the live 4.3 text"
  );
  assert.ok(
    !(byId.get("4-3-personal-response")?.summary as string).includes("Halfbreed"),
    "no Halfbreed activation without the teacher decision"
  );
});

test("T4XW04: R07 verified reservations resolve to live Theme 4 records; extras stay out", () => {
  const crosswalk = loadCrosswalk();
  assert.ok(
    crosswalk.items.every((item) => item.disposition !== "retained"),
    "R07 retains no unverified Theme 4 wording"
  );
  const data = loadCourseData();
  const activities = (data["themeActivities"] as Array<{ id: string }>) ?? [];
  const activity = activities.find((entry) => entry.id === "theme-4-online-booklet");
  assert.ok(activity, "verified Theme 4 booklet activity must exist");
  const liveKeys = new Set<string>();
  for (const section of (activity as unknown as { sections?: Array<{ prompts?: Array<{ id: string }> }> })
    .sections ?? []) {
    for (const prompt of section.prompts ?? []) {
      liveKeys.add(`theme-4-online-booklet::${prompt.id}`);
    }
  }
  assert.equal(liveKeys.size, 27, "Q1-22 plus 4.1, 4.2, Halfbreed definitions, Halfbreed chart, 4.3");
  const assignments = (data["assignments"] as Array<{ id: string }>).map((entry) => entry.id);
  for (const item of crosswalk.items) {
    if (item.class === "unmapped-workbook-task") {
      assert.ok(!item.runtimeKeyReservation, `${item.id} holds no live key`);
      continue;
    }
    if (!item.runtimeKeyReservation) continue;
    if (item.id === "theme-4-novel-4-3") {
      assert.ok(assignments.includes("4-3-personal-response"), "versioned 4-3 record must exist");
      for (const promptId of ["halfbreed-definitions", "halfbreed-chart", "4-3-personal-response"]) {
        assert.ok(liveKeys.has(`theme-4-online-booklet::${promptId}`), `novel prompt ${promptId} must be live`);
      }
      continue;
    }
    if (item.runtimeKeyReservation.startsWith("written::")) {
      assert.ok(
        assignments.includes(item.runtimeKeyReservation.slice("written::".length)),
        `${item.id} hand-in record must exist`
      );
    } else {
      assert.ok(liveKeys.has(item.runtimeKeyReservation), `${item.id} reservation must be live`);
    }
  }
});

test("CHART41-auto(T18): 4.1 comparison inventories 12 categories across both country columns", () => {
  const crosswalk = loadCrosswalk();
  const chart = crosswalk.items.find((item) => item.id === "theme-4-comparison-4-1");
  assert.ok(chart, "4.1 chart must be inventoried");
  assert.equal(chart?.categories?.length, 12, "12 workbook categories inventoried");
  const seqs = (chart?.categories ?? []).map((entry) => entry.seq);
  assert.deepEqual(
    seqs,
    Array.from({ length: 12 }, (_, n) => `cat-${String(n + 1).padStart(2, "0")}`),
    "category ids cat-01..cat-12 in workbook order"
  );
  assert.equal(chart?.columns?.length, 2, "both country columns recorded");
  assert.ok(
    (chart?.columns ?? []).some((column) => column.includes("AUSTRALIA")),
    "Australia column present"
  );
  assert.ok(
    (chart?.columns ?? []).some((column) => column.includes("CANADA")),
    "Canada column present"
  );
  const paras = loadFixtureParas();
  assert.ok(
    (paras.get(232) as string).includes("CATEGORY") &&
      (paras.get(233) as string).includes("STOLEN") &&
      (paras.get(234) as string).includes("RESIDENTIAL"),
    "chart frame (category + both columns) pinned at paras 232-234"
  );
});

test("NOVEL-GATE: legacy 4.3 preserved; Halfbreed active ONLY as a versioned profile", () => {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    versions: Record<string, {
      selectedVersion: string;
      newCandidateVersion: string;
      halfbreedCandidate: { status: string; teacherReview: string };
    }>;
  };
  assert.equal(
    manifest.versions["4-3-personal-response"]?.selectedVersion,
    "legacy-inconvenient-indian",
    "legacy stays the stored-data default"
  );
  assert.equal(
    manifest.versions["4-3-personal-response"]?.newCandidateVersion,
    "v2-halfbreed",
    "new-candidate default is the versioned Halfbreed profile"
  );
  assert.equal(
    manifest.versions["4-3-personal-response"]?.halfbreedCandidate?.status,
    "active-new-candidate",
    "candidate active as a versioned profile, never a separate record"
  );
  assert.ok(
    manifest.versions["4-3-personal-response"]?.halfbreedCandidate?.teacherReview.includes("pending"),
    "teacher review stays explicitly pending"
  );
  const crosswalk = loadCrosswalk();
  const novel = crosswalk.items.find((item) => item.id === "theme-4-novel-4-3");
  assert.equal(novel?.disposition, "booklet-verified");
  assert.ok(novel?.liveRecord?.includes("4-3"), "live record is the versioned 4-3 response");
  assert.equal(novel?.candidateRecord, null, "no separate candidate record exists");
  const data = loadCourseData();
  const assignments = (data["assignments"] as Array<{ id: string }>) ?? [];
  assert.ok(
    !assignments.some((assignment) => /halfbreed/i.test(assignment.id)),
    "no separate Halfbreed assignment record may exist"
  );
  const units = (data["units"] as Array<{ lessons?: Array<{ id: string }> }>) ?? [];
  const lessonIds = units.flatMap((unit) => (unit.lessons ?? []).map((lesson) => lesson.id));
  assert.ok(
    !lessonIds.some((id) => /halfbreed/i.test(id)),
    "no separate Halfbreed lesson page may exist"
  );
});
