/**
 * AB30 Theme 3 crosswalk suite — T16-partial (MAP06-adjacent, SRC-supporting, ASSET03-auto).
 *
 * Mirrors the T14 Theme 2 approach: the official Theme 3 booklet is
 * unavailable, so T16 restores STRUCTURE with every item explicitly blocked.
 * Adds the Reel Injun sequence inventory (16 workbook film questions) and the
 * ASSET03 automated half (film access recorded honestly, no synopsis
 * claimed equivalent).
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
  "theme-3-crosswalk.json"
);
const fixturePath = path.resolve("scripts", "tests", "fixtures", "ab30-parity", "theme3-workbook-prompts.txt");

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
  filmAccess?: { workbookPointer: string; status: string; note: string };
  sequence?: Array<{ seq: string; para: number; chapter: string }>;
};

type Crosswalk = {
  schemaVersion: number;
  dispositions: string[];
  gdoc: string;
  duplicatesWatchedFor: string;
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

test("T3XW01: R07 crosswalk carries Theme 3 items verified; workbook extras stay blocked", () => {
  const crosswalk = loadCrosswalk();
  assert.equal(crosswalk.schemaVersion, 1);
  assert.ok(crosswalk.gdoc.includes("docs.google.com"), "human fetch link recorded");
  assert.ok(
    crosswalk.duplicatesWatchedFor.includes("separately identified"),
    "duplicate-prompt policy recorded"
  );
  const ids = crosswalk.items.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, "crosswalk ids must be unique");
  const expected = [
    ...Array.from({ length: 30 }, (_, n) => `t3-q${String(n + 1).padStart(2, "0")}`),
    "theme-3-reel-injun-sequence",
    "assignment-3-1-breaking-stereotypes",
    "attawapiskat-report",
    "workbook-extra-3-4-protests",
    "workbook-extra-3-5-leaders",
  ];
  assert.deepEqual([...ids].sort(), [...expected].sort(), "Q1-30 + film sequence + 3.1 + report + 2 extras");
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
    assert.ok(item.verifiedSource?.includes("AB30-T3"), `${item.id} must cite the official source`);
    assert.ok(!item.blockedReason, `${item.id} verified items carry no blocked reason`);
    if (item.runtimeKeyReservation) {
      assert.ok(
        item.runtimeKeyReservation.startsWith("theme-3-online-booklet::") ||
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

test("T3XW02: workbook analogues resolve to the prompt-only fixture; fixture holds no student work", () => {
  const crosswalk = loadCrosswalk();
  const paras = loadFixtureParas();
  assert.ok(paras.size >= 150, `fixture must hold the curated prompts, got ${paras.size}`);
  for (const item of crosswalk.items) {
    for (const para of item.workbookAnalogue?.paras ?? []) {
      assert.ok(paras.has(para), `${item.id} analogue para ${para} must exist in the fixture`);
      assert.ok((paras.get(para) as string).length > 0, `${item.id} analogue para ${para} must hold prompt text`);
    }
    for (const entry of item.sequence ?? []) {
      assert.ok(paras.has(entry.para), `${item.id} sequence ${entry.seq} para ${entry.para} must resolve`);
    }
  }
  const raw = readFileSync(fixturePath, "utf8");
  for (const banned of [
    "Daniel Petherick",
    "Date Due",
    "I am a white, British, 17 year old",
    "Injun is the meaning of an Native American",
    "To find the true north on turtle island",
  ]) {
    assert.ok(!raw.includes(banned), `fixture must exclude student identity/answers: ${banned.slice(0, 40)}`);
  }
  assert.ok(
    (paras.get(58) as string).includes("types of discrimination"),
    "nine-category task pinned at para 58"
  );
});

test("T3XW03: live 3.1/report records pinned byte-exact to the official booklet wording", () => {
  const data = loadCourseData();
  const assignments = data["assignments"] as Array<{ id: string; summary: string }>;
  const byId = new Map(assignments.map((assignment) => [assignment.id, assignment]));
  const expected31 =
    "Take a moment to reflect on stereotypes and the harm they do. What are some realistic ways that we as a society, " +
    "community and individuals can overcome and break stereotypes? Respond in paragraph form using the response criteria.";
  const expectedReport =
    "Please visit the course document to learn about the issues in Attawapiskat. Read through the document, and use the additional links " +
    "on the document as you see fit to learn more about the issue. This document was made in 2011. The community has changed since then. " +
    "Therefore, part of your task is to also conduct additional research to learn more about Attawapiskat today. As part of your assignment, " +
    "you must provide links to at least three sources (news articles, videos, reports, photos, etc) that are dated from 2023 onwards. " +
    "Attawapiskat is now seen as a community in crisis that is living in poor conditions. Explain this description using information from the " +
    "document. Your report must include the following elements: current data dated at least 2015 and above; information regarding the suicide, " +
    "housing, health care, etc. crisis; what could the future hold?; what could help this community?; 3 current sources from 2023 or later. " +
    "Respond in any form you would like: paragraph form, letter, presentation, video, visual display.";
  assert.equal(
    byId.get("assignment-3-1-breaking-stereotypes")?.summary,
    expected31,
    "3.1 summary pinned (no silent drift)"
  );
  assert.equal(byId.get("attawapiskat-report")?.summary, expectedReport, "report summary pinned (no silent drift)");
  assert.ok(
    (byId.get("attawapiskat-report")?.summary as string).includes("dated from 2023 onwards"),
    "booklet 2023 recency requirement present (E-R07-03)"
  );
  assert.ok(
    !(byId.get("attawapiskat-report")?.summary as string).includes("third-world"),
    "workbook phrasing replaced by the booklet's own words (E-R07-03)"
  );
});

test("T3XW04: R07 verified reservations resolve to live Theme 3 records; extras stay out", () => {
  const crosswalk = loadCrosswalk();
  assert.ok(
    crosswalk.items.every((item) => item.disposition !== "retained"),
    "R07 retains no unverified Theme 3 wording"
  );
  const data = loadCourseData();
  const activities = (data["themeActivities"] as Array<{ id: string }>) ?? [];
  const activity = activities.find((entry) => entry.id === "theme-3-online-booklet");
  assert.ok(activity, "verified Theme 3 booklet activity must exist");
  const liveKeys = new Set<string>();
  for (const section of (activity as unknown as { sections?: Array<{ prompts?: Array<{ id: string }> }> })
    .sections ?? []) {
    for (const prompt of section.prompts ?? []) {
      liveKeys.add(`theme-3-online-booklet::${prompt.id}`);
    }
  }
  assert.equal(liveKeys.size, 46, "Q1-30 + 3.1 + R1-R14 + Attawapiskat prompts");
  const assignments = (data["assignments"] as Array<{ id: string }>).map((entry) => entry.id);
  for (const item of crosswalk.items) {
    if (item.class === "unmapped-workbook-task") {
      assert.ok(!item.runtimeKeyReservation, `${item.id} holds no live key`);
      continue;
    }
    if (!item.runtimeKeyReservation) continue;
    if (item.runtimeKeyReservation.startsWith("written::")) {
      assert.ok(
        assignments.includes(item.runtimeKeyReservation.slice("written::".length)),
        `${item.id} hand-in record must exist`
      );
    } else if (item.id === "theme-3-reel-injun-sequence") {
      for (let n = 1; n <= 14; n += 1) {
        assert.ok(liveKeys.has(`theme-3-online-booklet::R${n}`), `reel prompt R${n} must be live`);
      }
    } else {
      assert.ok(liveKeys.has(item.runtimeKeyReservation), `${item.id} reservation must be live`);
    }
  }
});

test("ASSET03-auto(T16): Reel Injun access recorded honestly; no synopsis claimed equivalent", () => {
  const crosswalk = loadCrosswalk();
  const film = crosswalk.items.find((item) => item.id === "theme-3-reel-injun-sequence");
  assert.ok(film, "film sequence must be inventoried");
  assert.equal(film?.sequence?.length, 16, "16 workbook film questions inventoried");
  const seqs = (film?.sequence ?? []).map((entry) => entry.seq);
  assert.deepEqual(
    seqs,
    Array.from({ length: 16 }, (_, n) => `ri-${String(n + 1).padStart(2, "0")}`),
    "sequence ids ri-01..ri-16 in workbook order"
  );
  const chapters = new Set((film?.sequence ?? []).map((entry) => entry.chapter));
  assert.deepEqual([...chapters].sort(), ["ch1", "ch3", "ch4", "ch5", "ch6", "ch8"], "chapters 2+7 omitted per para 214");
  assert.equal(film?.filmAccess?.status, "unverified", "viewing access must not be claimed");
  assert.ok(
    (film?.filmAccess?.note ?? "").includes("No synopsis claimed equivalent"),
    "synopsis-equivalence explicitly disclaimed"
  );
  const paras = loadFixtureParas();
  assert.ok(
    (paras.get(212) as string).includes("Moodle"),
    "Moodle viewing pointer preserved for the access check"
  );
});
