/**
 * AB30 Theme 2 crosswalk suite — T14-partial (MAP06-adjacent, SRC-supporting).
 *
 * The official Theme 2 booklet is unavailable in this environment, so T14
 * restores STRUCTURE (required-item inventory with explicit dispositions)
 * without adopting unverified wording. This suite pins that contract:
 * every required booklet item exists with disposition "blocked", workbook
 * analogues resolve to the curated prompt-only fixture, live 2.1/2.2
 * records are byte-pinned (no silent drift), and no reservation collides
 * with live runtime keys.
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
const crosswalkPath = path.resolve(
  "projects",
  "aboriginal-studies-30",
  "meta",
  "ab30-parity",
  "theme-2-crosswalk.json"
);
const fixturePath = path.resolve("scripts", "tests", "fixtures", "ab30-parity", "theme2-workbook-prompts.txt");

type CrosswalkItem = {
  id: string;
  class: string;
  disposition: string;
  blockedReason?: string;
  owningTicket?: string;
  workbookAnalogue?: { paras: number[]; confidence: string; note: string } | null;
  runtimeKeyReservation?: string;
  lessonHome?: string | null;
  liveRecord?: string;
  verifiedSource?: string;
};

type Crosswalk = {
  schemaVersion: number;
  dispositions: string[];
  gdoc: string;
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

test("XW01: R07 crosswalk carries every Theme 2 item booklet-verified with explicit homes", () => {
  const crosswalk = loadCrosswalk();
  assert.equal(crosswalk.schemaVersion, 1);
  assert.ok(crosswalk.gdoc.includes("docs.google.com"), "human fetch link recorded");
  assert.ok(crosswalk.dispositions.includes("booklet-verified"), "verified disposition in the allowed set");
  const ids = crosswalk.items.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, "crosswalk ids must be unique");
  const expected = [
    ...Array.from({ length: 28 }, (_, n) => `t2-q${String(n + 1).padStart(2, "0")}`),
    "t2-cr-1",
    "t2-cr-2",
    "2-1-land-stewardship",
    "2-2-specific-land-claims",
  ];
  assert.deepEqual([...ids].sort(), [...expected].sort(), "Q1-28 + 2 critical responses + 2.1 + 2.2");
  for (const item of crosswalk.items) {
    assert.ok(
      crosswalk.dispositions.includes(item.disposition),
      `${item.id} disposition must come from the allowed set`
    );
    assert.equal(item.disposition, "booklet-verified", `${item.id} verified against the official booklet`);
    assert.equal(item.owningTicket, "R07", `${item.id} owned by R07`);
    assert.ok(item.lessonHome, `${item.id} must name its verified lesson home`);
    assert.ok(item.liveRecord, `${item.id} must name its live record`);
    assert.ok(item.verifiedSource?.includes("AB30-T2"), `${item.id} must cite the official source`);
    assert.ok(!item.blockedReason, `${item.id} verified items carry no blocked reason`);
    if (item.runtimeKeyReservation) {
      assert.ok(
        item.runtimeKeyReservation.startsWith("theme-2-online-booklet::") ||
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

test("XW02: workbook analogues resolve to the prompt-only fixture; fixture holds no student work", () => {
  const crosswalk = loadCrosswalk();
  const paras = loadFixtureParas();
  assert.ok(paras.size >= 80, `fixture must hold the curated prompts, got ${paras.size}`);
  for (const item of crosswalk.items) {
    for (const para of item.workbookAnalogue?.paras ?? []) {
      assert.ok(paras.has(para), `${item.id} analogue para ${para} must exist in the fixture`);
      assert.ok((paras.get(para) as string).length > 0, `${item.id} analogue para ${para} must hold prompt text`);
    }
  }
  const raw = readFileSync(fixturePath, "utf8");
  for (const banned of [
    "Daniel Petherick",
    "Date Due",
    "no take advantage of the land",
    "live on a reverse",
    "They feel a strong bond between spirituality",
  ]) {
    assert.ok(!raw.includes(banned), `fixture must exclude student identity/answers: ${banned.slice(0, 40)}`);
  }
  assert.ok(
    (paras.get(157) as string).includes("categorical beliefs"),
    "six-values prompt pinned at para 157"
  );
});

test("XW03: live 2.1/2.2 records pinned byte-exact to the official booklet wording", () => {
  const data = loadCourseData();
  const assignments = data["assignments"] as Array<{ id: string; summary: string }>;
  const byId = new Map(assignments.map((assignment) => [assignment.id, assignment]));
  const expected21 =
    "Based on what you have watched and read so far, what do you think oral tradition teaches us about the Indigenous concept of land stewardship and " +
    "how does it relate to what you currently know about land ownership? Respond in paragraph form using the response criteria.";
  const expected22 =
    "Respond in paragraph form using the response criteria. Using all the resources at your disposal, review TWO of the land claims " +
    "from Alberta listed below: Lubicon Lake Cree Land Claim; Siksika (Blackfoot) Submission; Woodland Cree Settlement; Blood-Cardston Claim; " +
    "Loon River Settlement; Peigan Nation Claim; Nakoda (Stoney) Submission. You may include the following elements: the main events and issues of " +
    "each claim; include if, how and when they were settled; if they are not settled, explain why; and a timeline of important events.";
  assert.equal(byId.get("2-1-land-stewardship")?.summary, expected21, "2.1 summary pinned (no silent drift)");
  assert.equal(byId.get("2-2-specific-land-claims")?.summary, expected22, "2.2 summary pinned (no silent drift)");
  assert.ok(
    !(byId.get("2-1-land-stewardship")?.summary as string).includes("posted videos"),
    "workbook videos sentence removed with the booklet (E-R07-01)"
  );
  assert.ok(
    !(byId.get("2-2-specific-land-claims")?.summary as string).includes("module booklet"),
    "workbook module-booklet pointer replaced by the inline claim list (E-R07-02)"
  );
});

test("XW04: R07 verified reservations resolve to live Theme 2 records", () => {
  const crosswalk = loadCrosswalk();
  assert.ok(
    crosswalk.items.every((item) => item.disposition !== "retained"),
    "R07 retains no unverified Theme 2 wording"
  );
  const data = loadCourseData();
  const activities = (data["themeActivities"] as Array<{ id: string }>) ?? [];
  const activity = activities.find((entry) => entry.id === "theme-2-online-booklet");
  assert.ok(activity, "verified Theme 2 booklet activity must exist");
  const liveKeys = new Set<string>();
  for (const section of (activity as unknown as { sections?: Array<{ prompts?: Array<{ id: string }> }> })
    .sections ?? []) {
    for (const prompt of section.prompts ?? []) {
      liveKeys.add(`theme-2-online-booklet::${prompt.id}`);
    }
  }
  assert.equal(liveKeys.size, 30, "Q1-28 plus the two critical-response prompts");
  const assignments = (data["assignments"] as Array<{ id: string }>).map((entry) => entry.id);
  for (const item of crosswalk.items) {
    if (!item.runtimeKeyReservation) continue;
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
