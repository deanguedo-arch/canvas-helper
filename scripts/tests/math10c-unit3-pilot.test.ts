// Blocked Math 10C Chapter 3 review candidate: focused boundary test.
//
// Covers the review contract only: blocked manifest, immutable source ZIP and
// raw baseline, active-route/SCORM agreement, full eight-lesson reachability,
// the eight required lesson-check IDs with the triangle lab excluded, route
// migration without evidence loss, the four-condition optional triangle gate,
// the eight-checkpoint progress denominator, unchanged
// response/history/state limits, and separation of the optional Chapter 3
// textbook notebooks into three bounded standalone courses.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const SLUG = "projects/math10c-unit3-pilot";
const ZIP = `${SLUG}/raw/Math10C_Repair_Candidate_v0.5.zip`;
const ZIP_SHA256 = "0d0597c864e8a705690c6ecaeb16f553073f79e30dd022afa791f467dd094a68";

// The workspace math assets are browser-first UMD scripts; execute the real
// sources with a minimal CommonJS shim instead of the ESM interop loader.
function loadAsset(absPath: string): any {
  const code = readFileSync(absPath, "utf8");
  const module: { exports: any } = { exports: {} };
  const localRequire = (request: string): any => {
    const resolved = request.endsWith(".js") ? request : `${request}.js`;
    return loadAsset(new URL(resolved, `file://${absPath}`).pathname);
  };
  new Function("module", "exports", "require", code)(module, module.exports, localRequire);
  return module.exports;
}
const asset = (name: string): any => loadAsset(new URL(`../../${SLUG}/workspace/assets/${name}`, import.meta.url).pathname);

const Pilot = asset("pilot-slice.js");
const Contracts = asset("contracts.js");
const MathState = asset("state.js");

const read = (rel: string) => readFileSync(rel, "utf8");
const sha256 = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const zipEntry = (name: string) => execFileSync("unzip", ["-p", ZIP, name]);
const hrefs = (html: string) => [...html.matchAll(/href="#(u3-[a-z0-9-]+)"/g)].map((m) => m[1]);
const pageSegment = (html: string, id: string) => {
  const start = html.indexOf(`id="${id}"`);
  assert.notEqual(start, -1, `missing page ${id}`);
  let next = html.length;
  for (const m of html.matchAll(/<(article|section)[^>]*id="(u3-[a-z0-9-]+)"/g)) {
    if (m.index > start) {
      next = m.index;
      break;
    }
  }
  return html.slice(start, next);
};

const project = JSON.parse(read(`${SLUG}/meta/project.json`));
const tracking = JSON.parse(read(`${SLUG}/workspace/scorm-tracking.json`));
const slice = JSON.parse(read(`${SLUG}/meta/pilot-slice.json`));
const html = read(`${SLUG}/workspace/index.html`);
const course = read(`${SLUG}/workspace/course.js`);

test("manifest remains blocked, proposal-only, Studio-disabled and non-exportable", () => {
  assert.equal(project.slug, "math10c-unit3-pilot");
  assert.equal(project.authoringStatus, "blocked");
  assert.equal(project.authoring.driverId, "proposal-only-v1");
  assert.equal(project.authoring.studioEditing.enabled, false);
  assert.equal(project.migrationState, "migrated");
  assert.equal(project.projectType, "generated-course");
  assert.ok(Array.isArray(project.exportTargets) && project.exportTargets.length > 0);
  for (const target of project.exportTargets) assert.equal(target.enabled, false, target.target);
});

test("source ZIP hash matches and raw baseline is byte-identical to the ZIP", () => {
  assert.equal(sha256(readFileSync(ZIP)), ZIP_SHA256);
  const imported = JSON.parse(read(`${SLUG}/meta/imported-source.json`));
  assert.equal(imported.sha256, ZIP_SHA256);
  assert.ok(project.importedFirstPassOrigin.notes.includes(ZIP_SHA256));
  assert.equal(slice.sourceZip.sha256, ZIP_SHA256);
  for (const [raw, entry] of [
    [`${SLUG}/raw/original.html`, "Math10C_Repair_Candidate_v0.5/workspace/index.html"],
    [`${SLUG}/raw/course.js`, "Math10C_Repair_Candidate_v0.5/workspace/course.js"],
    [`${SLUG}/raw/styles.css`, "Math10C_Repair_Candidate_v0.5/workspace/styles.css"],
  ]) {
    assert.ok(readFileSync(raw).equals(zipEntry(entry)), `${raw} differs from the ZIP`);
  }
  for (const name of ["save-controller.js", "unit-data.js", "state-v2-decoder.js", "algebra.js"]) {
    const disk = readFileSync(`${SLUG}/workspace/assets/${name}`);
    assert.ok(
      disk.equals(zipEntry(`Math10C_Repair_Candidate_v0.5/workspace/assets/${name}`)),
      `shared runtime asset ${name} was modified`,
    );
  }
});

test("checker and state are intentional canonical refinements with compatible provenance", () => {
  assert.equal(Contracts.VERSION, "unit3-contracts-2.2");
  assert.equal(MathState.ENGINE, "unit3-algebra-2|unit3-contracts-2.2|bounded-factors-v1");
  for (const name of ["contracts.js", "state.js"]) {
    const disk = readFileSync(`${SLUG}/workspace/assets/${name}`);
    assert.ok(
      !disk.equals(zipEntry(`Math10C_Repair_Candidate_v0.5/workspace/assets/${name}`)),
      `${name} must differ from the ZIP: the checker refinement is intentional`,
    );
  }
  assert.ok(!readFileSync(`${SLUG}/workspace/assets/contracts.js`, "utf8").includes("eval("), "checker must not use eval");
});

test("state decoder keeps pre-refinement work readable while new attempts use checker 2.2", () => {
  const previousEngine = "unit3-algebra-2|unit3-contracts-2.1|bounded-factors-v1";
  const current = MathState.catalog("unit3-catalog-v05");
  const blank = {
    v: current.contentVersion,
    rev: 0,
    route: "u3-overview",
    r: {},
    active: [],
    pos: 0,
    recent: [],
    pins: [],
    selectedTopic: "mixed",
    runMode: "learn",
    runSeed: 0,
    firsts: {},
    drafts: {},
    counts: {},
    trig: {},
    reasons: {},
    paper: {},
    done: [],
    notes: {},
    exposed: [],
    seen: [],
    summary: { attempts: 0, correct: 0, supported: 0 },
    skills: {},
    legacySummary: { attempts: 0, correct: 0, supported: 0 },
    summaryRevision: 0,
  };
  const packed = MathState.encode(blank);
  // The exact prior schema remains readable and begins with no inferred mastery.
  const prior = structuredClone(packed);
  prior.format = "unit3-state-3";
  delete prior.mastery;
  const priorDecoded = MathState.decode(prior, { pages: Pilot.ACTIVE_ROUTES, version: current.contentVersion });
  assert.deepEqual(priorDecoded.mastery, { session: "", receipts: [], gaps: {}, seen36: [], seen31: [], seen32: [], seen33: [], seen34: [], seen35: [], seen37: [], seen38: [], submissions: [], retiredCount: 0 });
  packed.engine = previousEngine;
  packed.provenances.push({
    engine: previousEngine,
    catalog: "unit3-catalog-v05",
    content: current.contentVersion,
    kind: "checked",
    detail: "retained pre-refinement attempt",
  });
  const decoded = MathState.decode(packed, { pages: Pilot.ACTIVE_ROUTES, version: current.contentVersion });
  assert.equal(decoded.route, "u3-overview");
  assert.equal(MathState.resultProvenance({ contentVersion: current.contentVersion }).engine, MathState.ENGINE);
});

test("bounded mastery evidence round-trips without changing completion", () => {
  const current = MathState.catalog("unit3-catalog-v05");
  const state = {
    v: current.contentVersion, rev: 1, route: "u3-practice", r: {}, active: [], pos: 0, recent: [], pins: [],
    selectedTopic: "3.6", runMode: "independent", runSeed: 7, firsts: {}, drafts: {}, counts: {}, trig: {}, book: {},
    reasons: {}, paper: {}, done: ["3.1"], notes: {}, exposed: [], seen: [], summary: { attempts: 0, correct: 0, supported: 0 },
    skills: {}, legacySummary: { attempts: 0, correct: 0, supported: 0 }, summaryRevision: 0,
    mastery: { session: "session-a", gaps: {}, seen36: [], submissions: [], workshop: { id: "m36-transfer-v1", index: 10, mode: "transfer", values: { "m36-a": "4", "m36-split": "draft equality" } }, receipts: [{
      target: "C3-36d", kind: "verification", instance: "r-1", variation: "practice-1", observedAt: 123,
      correct: true, support: 0, firstValid: true, fresh: true, policy: MathState.MASTERY_POLICY,
      checker: MathState.ENGINE, component: "final-answer", session: "session-a", originSession: "session-a",
    }] },
  };
  const decoded = MathState.decode(MathState.encode(state), { pages: Pilot.ACTIVE_ROUTES, version: current.contentVersion });
  assert.deepEqual(decoded.mastery, { ...state.mastery, seen31: [], seen32: [], seen33: [], seen34: [], seen35: [], seen37: [], seen38: [], retiredCount: 0 });
  assert.deepEqual(decoded.done, ["3.1"]);
});

test("active route contract and SCORM tracking agree on 22 mastery routes and eight IDs", () => {
  const expectedRoutes = [
    "u3-overview", "u3-ready",
    "u3-31", "u3-32", "u3-33", "u3-34", "u3-35", "u3-36", "u3-37", "u3-38",
    "u3-practice", "u3-mixed", "u3-errors", "u3-review",
    "u3-reference", "u3-number-lab", "u3-expansion-lab", "u3-vocab",
    "u3-work", "u3-resources", "u3-support-library", "u3-transfer",
  ];
  const expectedIds = [
    "u3-check-31", "u3-check-32", "u3-check-33", "u3-check-34",
    "u3-check-35", "u3-check-36", "u3-check-37", "u3-check-38",
  ];
  assert.deepEqual(Pilot.ACTIVE_ROUTES, expectedRoutes);
  assert.deepEqual(tracking.pageIds, Pilot.ACTIVE_ROUTES);
  assert.deepEqual(tracking.pageIds, slice.activeRoutes);
  assert.deepEqual(Pilot.INACTIVE_ROUTES, []);
  assert.deepEqual(Pilot.INACTIVE_ROUTES, slice.inactivePreservedRoutes);
  assert.equal(tracking.defaultPageId, "u3-overview");
  assert.deepEqual(tracking.completion.requiredIds, expectedIds);
  assert.deepEqual(tracking.completion.requiredIds, Pilot.REQUIRED_IDS);
  assert.deepEqual(tracking.completion.requiredIds, slice.completionCriteria.requiredIds);
  assert.equal(Pilot.TOTAL_CHECKPOINTS, 8);
  assert.equal(slice.completionCriteria.totalCheckpoints, 8);
  assert.ok(html.includes('<script src="assets/pilot-slice.js"></script>'));
  assert.ok(course.includes("window.MathPilotSlice"));
  assert.ok(!course.includes("u3-transfer-complete"), "triangle ID must not be a completion ID");
});

test("all 22 mastery pages are retained and every one is learner-reachable", () => {
  for (const id of Pilot.ACTIVE_ROUTES) {
    assert.ok(html.includes(`id="${id}"`), `preserved page missing: ${id}`);
    assert.ok(Pilot.isKnownRoute(id), `unknown route: ${id}`);
    assert.ok(Pilot.isActiveRoute(id), `unreachable route: ${id}`);
  }
  const nav = html.slice(html.indexOf("<nav"), html.indexOf("</nav>"));
  assert.deepEqual([...new Set(hrefs(nav))].sort(), [...Pilot.ACTIVE_ROUTES].sort());
  for (const id of Pilot.ACTIVE_ROUTES) {
    const leaked = hrefs(pageSegment(html, id)).filter((h) => !Pilot.isActiveRoute(h));
    assert.deepEqual(leaked, [], `${id} links to unreachable routes`);
  }
  assert.match(pageSegment(html, "u3-overview"), /review candidate/i);
  assert.ok(!/review pilot/i.test(html), "pilot-only learner label remains");
  assert.ok(!/pilot checkpoint/i.test(html), "pilot-only learner label remains");
  assert.ok(!course.includes("of 2 pilot checkpoints"));
  assert.ok(!html.includes("of 2 pilot checkpoints"));
});

test("the eight lesson checks are the only required IDs; triangle work is excluded", () => {
  assert.deepEqual(tracking.completion.requiredIds, [
    "u3-check-31", "u3-check-32", "u3-check-33", "u3-check-34",
    "u3-check-35", "u3-check-36", "u3-check-37", "u3-check-38",
  ]);
  assert.ok(course.includes("u3-check-'+x.replace('.','')"));
  const literals = [...course.matchAll(/u3-check-[0-9.]+/g)].map((m) => m[0]);
  assert.deepEqual(literals, [], `hardcoded lesson checks: ${literals}`);
  assert.ok(course.includes("isTriangleComplete"), "optional triangle gate must stay");
  assert.ok(!course.includes("u3-transfer-complete"), "triangle ID must not be completed");
  assert.deepEqual(Pilot.OPTIONAL_ROUTES, ["u3-transfer"]);
  assert.equal(Pilot.isOptionalRoute("u3-textbook-practice"), false);
  assert.equal(Pilot.isOptionalRoute("u3-transfer"), true);
  assert.equal(Pilot.isOptionalRoute("u3-35"), false);
  for (const id of tracking.completion.requiredIds) assert.equal(Pilot.isRequiredId(id), true);
  assert.equal(Pilot.isRequiredId("u3-transfer-complete"), false);
});

test("every preserved route passes through migration; unknown routes remap without dropping fields", () => {
  const provenance = {
    engine: MathState.ENGINE,
    catalog: "unit3-catalog-v05",
    content: "math10c-unit3-2.1-repair",
    kind: "checked",
    detail: "Both relationships must fit.",
  };
  const legacy = {
    v: "math10c-unit3-2.1-repair",
    rev: 7,
    route: "u3-34",
    r: {
      "s-c35": {
        q: "c35",
        d: "(x+3)(x+7)",
        a: [[1, "(x+3)(x+7)", "correct", 4, provenance]],
        n: 2,
        s: 4,
        reason: "pair 3 and 7",
        closed: false,
        firstSuccess: true,
        catalog: "unit3-catalog-v05",
      },
      "r-41": {
        q: "g351",
        d: "draft",
        a: [[2, "draft", "incorrect", 1, provenance]],
        n: 2,
        s: 1,
        reason: "",
        closed: false,
        firstSuccess: false,
        catalog: "unit3-catalog-v05",
      },
    },
    active: ["r-41"],
    pos: 0,
    recent: ["r-41"],
    pins: ["r-41"],
    selectedTopic: "3.5",
    runMode: "learn",
    runSeed: 42,
    firsts: { g351: [1, "first", "incorrect", 0, provenance] },
    drafts: { g351: "draft" },
    counts: { g351: 2 },
    trig: {
      side: "BC",
      adjacent: "AB",
      hypotenuse: "AC",
      ratio: "tan",
      angle: "correct",
      angleRaw: "26.6 degrees",
      aa: [[1, "26.6 degrees", "correct", 0, { checker: "c", instance: "i", relationship: "tan", setup: "correct", value: {} }]],
      an: 1,
      reason: "kept",
    },
    reasons: { "3.5": "pair sums to 10" },
    paper: { "3.5": true },
    done: ["3.5"],
    notes: { help: "need review" },
    exposed: ["g351"],
    seen: ["g351"],
    summary: { attempts: 5, correct: 3, supported: 1 },
    skills: { "3.5": { attempts: 5, correct: 3, supported: 1 } },
    legacySummary: { attempts: 0, correct: 0, supported: 0 },
    summaryRevision: 2,
  };
  const snapshot = JSON.parse(JSON.stringify(legacy));
  const next = Pilot.migrateRoute(legacy);
  assert.equal(next, legacy, "a preserved lesson route must pass through untouched");
  assert.equal(next.route, "u3-34");
  const transfer = { route: "u3-transfer", done: ["3.5"] };
  assert.equal(Pilot.migrateRoute(transfer), transfer, "the optional lab must pass through untouched");
  const unknown = { ...snapshot, route: "u3-legacy-unknown" };
  const remapped = Pilot.migrateRoute(unknown);
  assert.equal(remapped.route, "u3-overview");
  assert.equal(unknown.route, "u3-legacy-unknown", "migration must not mutate the input");
  const { route: _droppedNext, ...restNext } = remapped;
  const { route: _droppedLegacy, ...restLegacy } = unknown;
  assert.deepEqual(restNext, restLegacy);
  // Lesson 3.5 responses and triangle-lab evidence survive migration untouched.
  assert.deepEqual(remapped.r["s-c35"], unknown.r["s-c35"]);
  assert.deepEqual(remapped.trig, unknown.trig);
  assert.deepEqual(remapped.done, unknown.done);
  for (const route of Pilot.ACTIVE_ROUTES) {
    const kept = { route };
    assert.equal(Pilot.migrateRoute(kept), kept, `${route} must pass through untouched`);
  }
  assert.equal(Pilot.migrateRoute(null), null);
});

test("the optional triangle gate still requires all four conditions", () => {
  const complete = {
    side: "BC",
    adjacent: "AB",
    hypotenuse: "AC",
    ratio: "tan",
    angle: "correct",
    angleRaw: "26.6 degrees",
    aa: [[1, "26.6 degrees", "correct", 0, {}]],
    length: "sin",
    lengthStatus: "correct",
    lengthRaw: "5 m",
    la: [[1, "5 m", "correct", 0, {}]],
    reason: "Sine uses opposite over hypotenuse.",
  };
  assert.equal(Pilot.isTriangleComplete(complete), true);
  assert.equal(Pilot.isTriangleComplete({ ...complete, side: "AB" }), false);
  assert.equal(Pilot.isTriangleComplete({ ...complete, ratio: "cos" }), false);
  assert.equal(Pilot.isTriangleComplete({ ...complete, angle: "incorrect" }), false);
  assert.equal(Pilot.isTriangleComplete({ ...complete, length: "cos" }), false);
  assert.equal(Pilot.isTriangleComplete({ ...complete, lengthStatus: "precision" }), false);
  assert.equal(Pilot.isTriangleComplete({ ...complete, angleRaw: "27 degrees" }), false);
  assert.equal(Pilot.isTriangleComplete({ ...complete, lengthRaw: "6 m" }), false);
  assert.equal(Pilot.isTriangleComplete({ ...complete, aa: [] }), false);
  assert.equal(Pilot.isTriangleComplete({ ...complete, la: [] }), false);
  assert.equal(Pilot.isTriangleComplete({ ...complete, reason: "   " }), false);
  assert.equal(Pilot.isTriangleComplete({ ...complete, reason: "" }), false);
  assert.equal(Pilot.isTriangleComplete({}), false);
  assert.equal(Contracts.trig("26.6 degrees", {}).status, "correct");
  assert.equal(Contracts.trig("5 m", { kind: "length" }).status, "correct");
});

test("mastery is learner-facing while eight private completion IDs remain stable", () => {
  const trig = {
    side: "BC",
    adjacent: "AB",
    hypotenuse: "AC",
    ratio: "tan",
    angle: "correct",
    angleRaw: "26.6 degrees",
    aa: [[1, "26.6 degrees", "correct", 0, {}]],
    length: "sin",
    lengthStatus: "correct",
    lengthRaw: "5 m",
    la: [[1, "5 m", "correct", 0, {}]],
    reason: "Sine uses opposite over hypotenuse.",
  };
  assert.equal(Pilot.TOTAL_CHECKPOINTS, 8);
  assert.deepEqual(Pilot.COMPLETION_LESSONS, ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"]);
  assert.deepEqual(Pilot.pilotProgress([], {}), {
    factoring: false, transfer: false, lessons: [], count: 0, total: 8,
  });
  assert.deepEqual(Pilot.recordedLessons(["3.1", "3.4", "unknown"]), ["3.1", "3.4"]);
  assert.equal(Pilot.pilotProgress(["3.1", "3.4"], {}).count, 2);
  assert.equal(Pilot.pilotProgress(["3.5"], {}).count, 1);
  // A complete triangle lab alone records no Chapter progress.
  assert.equal(Pilot.pilotProgress([], trig).count, 0);
  assert.equal(Pilot.pilotProgress([], trig).transfer, true);
  // All eight recorded lesson checks complete Chapter progress; triangle adds nothing.
  const all = ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"];
  assert.equal(Pilot.pilotProgress(all, {}).count, 8);
  assert.equal(Pilot.pilotProgress(all, trig).count, 8);
  assert.equal(Pilot.pilotProgress(all, {}).factoring, true);
  // Additive aliases report the same Chapter progress without breaking the public API.
  assert.equal(Pilot.chapterProgress(all, trig).count, 8);
  assert.equal(Pilot.unitProgress(["3.1"], {}).count, 1);
  assert.ok(course.includes("Mastery evidence"));
  assert.ok(course.includes("fixed 32-target denominator"));
  assert.ok(course.includes("Private lesson work records preserved:"));
  assert.ok(course.includes("syncSaving();updateProgress();return ok"));
  // Static fallback text is replaced as soon as the learner runtime opens.
  assert.ok(html.includes("0 of 8 lesson checkpoints"));
  assert.ok(html.includes("Chapter progress"));
  assert.ok(html.includes('id="transfer-check-status"'));
});

test("no response, history, retention or state limit is reduced", () => {
  assert.deepEqual(MathState.POLICY, {
    raw: 160,
    recordReason: 120,
    lessonReason: 160,
    note: 240,
    trigReason: 160,
    trigRaw: 80,
    active: 6,
    recent: 2,
    selected: 4,
    attemptDetails: 4,
    applicationCharacters: 52000,
  });
  assert.equal(MathState.APP_LIMIT, 52000);
  assert.equal(MathState.VERSION, "unit3-state-14");
  assert.equal(MathState.PREVIOUS_VERSION, "unit3-state-13");
  assert.ok(course.includes("key:'math10c-unit3-pilot:review:v2'"));
  assert.ok(course.includes("const rawLimit=160"));
  assert.ok(html.includes('maxlength="160"'));
  assert.ok(html.includes('id="trig-reason"'));
});

test("teacher-review UI fixes keep gutters, collapsed control, launcher, and desktop reference hooks", () => {
  const css = read(`${SLUG}/workspace/styles.css`);
  // 1. Every exceptional top-level activity shares lesson-block gutters.
  assert.ok(css.includes(".course-page>section.lesson-section"), "named top-level activity gutter");
  assert.ok(css.includes(".course-page>section:not([class])"), "unclassified top-level activity gutter");
  assert.ok(pageSegment(html, "u3-32").includes('class="lesson-section"'), "root-estimation activity covered");
  assert.match(pageSegment(html, "u3-errors"), /<section data-canvas-helper-edit-key="repair-error-catalog">/, "error catalog covered");
  // The direct .lesson-section child of #check-3.5 shares lesson-block gutters.
  assert.ok(css.includes("#check-3\\.5>.lesson-section{padding:36px 54px"), "desktop gutter");
  assert.ok(css.includes("#check-3\\.5>.lesson-section{padding:30px 32px"), "<=1050px gutter");
  assert.ok(css.includes("#check-3\\.5>.lesson-section{padding:28px 22px"), "<=760px gutter");
  assert.ok(
    css.includes("#check-3\\.5>.lesson-section>section{padding:0;border:0}"),
    "nested practice sections keep natural spacing without doubled gutters",
  );
  assert.ok(!css.includes("#check-3.5"), "unescaped #check-3.5 selector would never match");
  // 2. The collapsed-rail toggle is centered; mobile behavior and expanded state stay.
  assert.ok(
    css.includes(".sidebar-collapsed .sidebar-header{justify-content:center"),
    "collapsed toggle centered",
  );
  assert.ok(css.includes(".sidebar-toggle{display:none}"), "mobile toggle behavior unchanged");
  assert.ok(course.includes("aria-expanded"), "accessible expanded state preserved");
  // 3. The launcher leaves lesson, navigation, and save-bar content alone.
  assert.ok(
    css.includes(".reference-button{position:absolute;left:12px;top:10px"),
    "desktop launcher sits in the top bar",
  );
  assert.ok(!css.includes("bottom:16px"), "launcher no longer covers sidebar links or the save bar");
  assert.ok(!css.includes("content:'ƒ'"), "icon-only collapsed treatment removed");
  assert.ok(!css.includes("font-size:0"), "collapsed launcher label stays readable");
  assert.ok(css.includes("right:12px;top:12px"), "mobile header action preserved");
  assert.ok(css.includes(".topbar{padding-right:150px}"), "mobile top-bar clearance preserved");
  // 4. Emergency recovery stays outside the fixed sidebar and hides raw state by default.
  assert.ok(
    css.includes("calc(var(--side) + 1rem)"),
    "desktop recovery content clears the current sidebar width",
  );
  assert.ok(
    css.includes("@media(max-width:760px){#recovery-panel{margin:1rem 1rem"),
    "mobile recovery content uses the full available width",
  );
  assert.ok(course.includes("Show technical recovery data"), "raw recovery data is collapsed by default");
  assert.ok(course.includes("Restore this copy"), "recovery uses plain learner-facing actions");
  assert.match(html, /This appears only when saving is interrupted or two tabs contain different work/);
  // 5. The desktop panel is draggable/resizable and clamped; mobile stays an inset sheet.
  assert.ok(css.includes("resize:both"), "resizable with native controls");
  assert.ok(css.includes("#reference-panel>header{cursor:move"), "clearly indicated drag handle");
  assert.ok(css.includes("max-height:calc(100vh - 120px)"), "resized panel stays above the fixed save bar");
  assert.ok(css.includes("max-width:calc(100vw - 24px)"), "resized panel stays inside the viewport");
  assert.ok(css.includes(".reference-panel{inset:75px 12px 60px"), "mobile inset sheet preserved");
  assert.ok(css.includes(".table-wrap{overflow:auto"), "panel table keeps scrolling inside");
  assert.ok(course.includes("dataset.referenceHandle"), "drag-handle hook");
  assert.ok(course.includes("clampReferencePanel"), "movement/size clamp hook");
  assert.ok(course.includes("(min-width: 761px)"), "drag and clamp are desktop-only");
  assert.ok(
    course.includes("closest('button,a,input,select,textarea,summary"),
    "close button and panel content never start a drag",
  );
  assert.ok(course.includes("document.addEventListener('pointermove',move)"), "drag tracking");
  assert.ok(course.includes("removeEventListener('pointerup',stop)"), "listener cleanup on pointer end");
  assert.ok(course.includes("removeEventListener('pointercancel',stop)"), "listener cleanup on cancel");
  assert.ok(course.includes("hidden=false;clampReferencePanel()"), "close/reopen leaves a usable panel");
  assert.ok(course.includes("ResizeObserver"), "native resizing re-clamps the full panel");
  assert.ok(course.includes("window.innerWidth-width-inset"), "panel right edge stays reachable");
  assert.ok(course.includes("window.innerHeight-saveBar-height"), "panel bottom stays above save status");
  assert.ok(course.includes("resetReferencePanel"), "desktop drag styles reset for the mobile inset sheet");
  assert.ok(
    course.includes("addEventListener('resize',()=>{clampReferencePanel();clampTextbookDialog();})"),
    "viewport changes re-clamp the panel",
  );
  for (const id of ["reference-open", "reference-close", "reference-panel", "sidebar-toggle", "check-3.5"]) {
    assert.ok(html.includes(`id="${id}"`), `lost stable id: ${id}`);
  }
});

test("retained content keeps unique stable edit keys", () => {
  const keys = [...html.matchAll(/data-canvas-helper-edit-key="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(keys).size, keys.length, "duplicate edit keys");
  for (const key of [
    "u3-source-0000",
    "u3-source-0007",
    "u3-source-0008",
    "u3-source-0014",
    "u3-source-0034",
    "u3-source-0040",
    "u3-source-0041",
    "u3-source-0042",
    "u3-source-0047",
    "u3-source-0071",
    "u3-source-0443",
    "u3-source-0445",
    "u3-source-0446",
    "lesson-boundary-u3-31",
    "lesson-boundary-u3-38",
    "u3-transfer-text-0",
    "u3-transfer-text-8",
    "u3-transfer-text-20",
    "repair-canonical-5",
    "navigation-u3-transfer",
    "navigation-u3-support-library",
  ]) {
    assert.ok(keys.includes(key), `lost edit key: ${key}`);
  }
});

test("split-mode equality chains record a supported intermediate attempt", () => {
  const split = { mode: "split", answer: "x^2+7*x+12", contract: "core-quadratic-v1" };
  // 1. The exact learner chain is supported, intermediate, and never correct.
  const exact = Contracts.check("x(x + 3) + 4(x + 3) = (x + 3)(x + 4)", split);
  assert.equal(exact.status, "intermediate");
  assert.notEqual(exact.status, "correct");
  assert.notEqual(exact.status, "unsupported");
  assert.ok(typeof exact.detail === "string" && exact.detail.length > 0);
  // 2. Whitespace and implicit multiplication do not change the verdict.
  const spaced = Contracts.check("  x^2 + 3x + 4x + 12 = (x+3)(x+4)  ", split);
  assert.equal(spaced.status, "intermediate");
  // 3. A side that misses the authored target is incorrect.
  assert.equal(Contracts.check("x(x + 3) + 4(x + 3) = (x + 3)(x + 5)", split).status, "incorrect");
  assert.equal(Contracts.check("x^2+3*x+4*x+13 = (x+3)(x+4)", split).status, "incorrect");
  // 4. Empty sides and multiple equals signs are never accepted.
  for (const raw of ["x^2+7x+12 = ", " = (x+3)(x+4)", "x^2+7x+12 = (x+3)(x+4) = x^2+7x+12"]) {
    const result = Contracts.check(raw, split);
    assert.ok(["input", "unsupported"].includes(result.status), `${raw} was accepted as ${result.status}`);
    assert.notEqual(result.status, "intermediate");
    assert.notEqual(result.status, "correct");
  }
  // 5. Equality stays unsupported outside split mode.
  const factor = { mode: "factor", answer: "(x-4)(x+3)", contract: "core-quadratic-v1" };
  const expand = { mode: "expand", answer: "x^2+9*x+20", contract: "core-quadratic-v1" };
  assert.equal(Contracts.check("x^2+7x+12 = (x+3)(x+4)", factor).status, "unsupported");
  assert.equal(Contracts.check("x^2+9x+20 = (x+4)(x+5)", expand).status, "unsupported");
  // 6. Ordinary split-expression checking is unchanged.
  const requestedSplit = Contracts.check("x^2+3*x+4*x+12", split);
  assert.equal(requestedSplit.status, "intermediate");
  assert.match(requestedSplit.detail, /correct for this step/i);
  assert.equal(Contracts.check("x^2+3*x+4*x+13", split).status, "incorrect");
  assert.equal(Contracts.check("(x+3)(x+4)", split).status, "ungraded");
  // 7. The whole submitted chain stays within the existing entry bound.
  const overlong = `${"1+".repeat(80)}1=(x+3)(x+4)`;
  assert.ok(overlong.length > 160, "overlong fixture must exceed the entry bound");
  assert.equal(Contracts.check(overlong, split).status, "unsupported");
  // Bounded per-side failures keep their existing input/unsupported style.
  assert.equal(Contracts.check("x^2+7x+12 = 1/2", split).status, "unsupported");
  assert.equal(Contracts.check("x^2+7x+12 = y+1", split).status, "unsupported");
  assert.equal(Contracts.check("x^7 = x^7", split).status, "unsupported");
});

test("a newly checked supported response immediately replaces stale history metadata", () => {
  assert.ok(course.includes("intermediate:'Correct for this step'"));
  assert.ok(
    course.includes("showFeedback(task,result);if(!['input','unsupported'].includes(result.status))draftFeedback(task,r);"),
    "supported results must refresh their checked-response feedback and history immediately",
  );
});

test("textbook practice is removed from mastery and owned by three optional standalone courses", () => {
  assert.ok(!Pilot.ACTIVE_ROUTES.includes("u3-textbook-practice"));
  assert.equal(Pilot.ACTIVE_ROUTES.length, 22);
  assert.equal(Pilot.isOptionalRoute("u3-textbook-practice"), false);
  assert.deepEqual(Pilot.REQUIRED_IDS, [
    "u3-check-31", "u3-check-32", "u3-check-33", "u3-check-34",
    "u3-check-35", "u3-check-36", "u3-check-37", "u3-check-38",
  ]);
  assert.ok(!html.includes('id="u3-textbook-practice"'));
  assert.ok(!html.includes("data-textbook-page"));
  assert.ok(!html.includes('id="textbook-dialog"'));
  assert.ok(!pageSegment(html, "u3-resources").includes("Textbook library"));
  const expected = [
    ["math10c-unit3-textbook-1", 54],
    ["math10c-unit3-textbook-2", 43],
    ["math10c-unit3-textbook-3", 81],
  ] as const;
  let total = 0;
  for (const [slug, count] of expected) {
    const standalone = read(`projects/${slug}/workspace/index.html`);
    const manifest = JSON.parse(read(`projects/${slug}/meta/project.json`));
    assert.match(standalone, /Optional and ungraded/i);
    assert.match(standalone, /does not report a grade/i);
    assert.equal((standalone.match(/data-question-index=/g) || []).length, count);
    assert.ok(standalone.includes("data-reader-file"), `${slug} needs inline full-page readers`);
    assert.equal(manifest.textbookPractice.questionCount, count);
    assert.equal(manifest.textbookPractice.graded, false);
    assert.equal(manifest.textbookPractice.completion, false);
    total += count;
  }
  assert.equal(total, 178);
});

test("individual textbook questions retain auditable crop provenance", () => {
  const manifest = JSON.parse(read(`${SLUG}/meta/textbook-question-crops.json`));
  assert.equal(manifest.schemaVersion, 2);
  assert.equal(manifest.distributionStatus, "private-local-review-pending-source-approval");
  assert.equal(manifest.generatedBy, "scripts/build-math10c-unit3-question-crops.py");
  assert.equal(manifest.entries.length, 178);
  assert.equal(Pilot.TEXTBOOK_QUESTIONS.length, 178);
  assert.deepEqual(Pilot.textbookQuestion("3.1", "q3"), { section: "3.1", id: "q3", label: "Q3", number: 3, printed: 140, image: "assets/textbook-crops/3-1-q3.png" });
  assert.deepEqual(Pilot.textbookQuestion("review", "review-q35"), { section: "review", id: "review-q35", label: "Review 35", number: 35, printed: 200, image: "assets/textbook-crops/review-q35.png" });
  assert.deepEqual(Pilot.textbookQuestion("review", "test-q9"), { section: "review", id: "test-q9", label: "Practice test 9", number: 9, printed: 201, image: "assets/textbook-crops/test-q9.png" });
  assert.equal(Pilot.textbookQuestion("3.1", "q2"), null);
  assert.equal(new Set(manifest.entries.map((entry: any) => `${entry.section}:${entry.questionId}`)).size, 178);
  for (const entry of manifest.entries) {
    assert.ok(/^assets\/textbook-crops\/(?:3-[1-8]|review|test)-q\d+\.png$/.test(entry.image));
    assert.ok(/^assets\/textbook\/.+\.pdf$/.test(entry.sourceFile));
    assert.ok(Number.isSafeInteger(entry.pdfPage) && entry.pdfPage >= 1);
    assert.equal(entry.crop.length, 4);
    assert.ok(entry.crop.every((value: number) => Number.isFinite(value)));
  }
  const css = read(`${SLUG}/workspace/styles.css`);
  assert.ok(css.includes(".textbook-question-preview"));
  assert.ok(css.includes('.textbook-pages button[aria-pressed="true"]'));
});

test("printed-page mapping covers 134-201 with exact file boundaries", () => {
  assert.equal(Pilot.TEXTBOOK.length, 11);
  const at = (printed: number) => Pilot.textbookForPrintedPage(printed);
  assert.deepEqual(at(134), { key: "3.1", title: "3.1 Factors and multiples", file: "assets/textbook/math10c-3-1.pdf", printed: 134, pdfPage: 1, pdfPages: 8 });
  assert.equal(at(141).pdfPage, 8);
  assert.equal(at(141).file, "assets/textbook/math10c-3-1.pdf");
  assert.deepEqual([at(142).key, at(142).pdfPage], ["3.2", 1]);
  assert.deepEqual([at(195).key, at(195).pdfPage, at(195).pdfPages], ["3.8", 8, 8]);
  assert.deepEqual([at(196).key, at(196).pdfPage], ["study-guide", 1]);
  assert.deepEqual([at(200).key, at(200).pdfPage, at(200).pdfPages], ["review", 3, 3]);
  assert.deepEqual(at(201), { key: "practice-test", title: "Chapter 3 practice test", file: "assets/textbook/math10c-practice-test-3.pdf", printed: 201, pdfPage: 1, pdfPages: 1 });
  for (const bad of [133, 202, 0, -1, NaN, 134.5, "134"]) assert.equal(at(bad as number), null, `printed page ${String(bad)} must not map`);
});

test("all 11 textbook PDFs are referenced and no solutions PDF is referenced", () => {
  const expected = [
    "assets/textbook/math10c-3-1.pdf",
    "assets/textbook/math10c-3-2.pdf",
    "assets/textbook/math10c-3-3.pdf",
    "assets/textbook/math10c-3-4.pdf",
    "assets/textbook/math10c-3-5.pdf",
    "assets/textbook/math10c-3-6.pdf",
    "assets/textbook/math10c-3-7.pdf",
    "assets/textbook/math10c-3-8.pdf",
    "assets/textbook/math10c-study-guide-3.pdf",
    "assets/textbook/math10c-review-3.pdf",
    "assets/textbook/math10c-practice-test-3.pdf",
  ];
  const pilotSlice = read(`${SLUG}/workspace/assets/pilot-slice.js`);
  for (const file of expected) {
    assert.ok(html.includes(file) || course.includes(file) || pilotSlice.includes(file), `missing reference: ${file}`);
  }
  const found = new Set(
    [html, course, pilotSlice]
      .flatMap((src) => [...src.matchAll(/assets\/textbook\/[A-Za-z0-9-]+\.pdf/g)].map((m) => m[0])),
  );
  assert.deepEqual([...found].sort(), [...expected].sort());
  assert.ok(!/solution/i.test([...found].join(" ")), "a solutions PDF must never be referenced");
  assert.ok(!/textbook[^"'<>]*solution/i.test(html + course), "no solutions-adjacent textbook reference");
  const sourceMap = JSON.parse(read(`${SLUG}/meta/textbook-source-map.json`));
  assert.equal(sourceMap.distributionStatus, "private-local-review-pending-source-approval");
  assert.equal(sourceMap.sourceArchive.sha256, "26c85da37b10c6745495eceb54ded50dc3d5e9a27429d477742cb413b2da128b");
  assert.equal(sourceMap.items.length, 11);
  assert.deepEqual(sourceMap.items.map((item: any) => item.file).sort(), [...expected].sort());
  assert.ok(/solution/i.test(sourceMap.excluded.join(" ")), "the solutions exclusion must be explicit");
});

const bookBlank = () => {
  const current = MathState.catalog("unit3-catalog-v05");
  return {
    v: current.contentVersion,
    rev: 0,
    route: "u3-overview",
    r: {},
    active: [],
    pos: 0,
    recent: [],
    pins: [],
    selectedTopic: "mixed",
    runMode: "learn",
    runSeed: 0,
    firsts: {},
    drafts: {},
    counts: {},
    trig: {},
    reasons: {},
    paper: {},
    done: [],
    notes: {},
    exposed: [],
    seen: [],
    summary: { attempts: 0, correct: 0, supported: 0 },
    skills: {},
    legacySummary: { attempts: 0, correct: 0, supported: 0 },
    summaryRevision: 0,
  };
};
const bookDecodeOptions = () => ({
  pages: Pilot.ACTIVE_ROUTES,
  version: MathState.catalog("unit3-catalog-v05").contentVersion,
});

test("saved state without book decodes to empty textbook records", () => {
  const packed = MathState.encode(bookBlank());
  assert.ok(!("book" in packed), "older payloads carry no book field");
  const decoded = MathState.decode(packed, bookDecodeOptions());
  assert.deepEqual(decoded.book, {});
});

test("valid bounded textbook state round-trips at its range edges", () => {
  const book = {
    "3.1": { page: 140, selected: "q3", answers: { q3: "Multiples listed and checked." }, ref: "Earlier Q4-6", work: "Earlier section note." },
    "3.6": { page: 181, work: "x".repeat(600) },
    review: { page: 201, selected: "test-q9", answers: { "review-q35": "Review work", "test-q9": "Timed attempt kept on paper." } },
  };
  const packed = MathState.encode({ ...bookBlank(), book });
  const decoded = MathState.decode(packed, bookDecodeOptions());
  assert.deepEqual(decoded.book, book);
  assert.ok("book" in packed, "textbook records must persist through the saved payload");
});

test("invalid textbook key, page, control character, or oversized response is rejected", () => {
  const current = bookDecodeOptions();
  const rejects = [
    { book: { "9.9": {} } },
    { book: { "3.1": { page: 142 } } },
    { book: { "3.1": { page: 133 } } },
    { book: { review: { page: 195 } } },
    { book: { "3.1": { ref: "x".repeat(81) } } },
    { book: { "3.1": { work: "x".repeat(601) } } },
    { book: { "3.1": { work: "kept\u0007on paper" } } },
    { book: { "3.1": { selected: "q2" } } },
    { book: { review: { selected: "q1" } } },
    { book: { "3.1": { answers: { q23: "outside section range" } } } },
    { book: { review: { answers: { "test-q10": "outside test range" } } } },
    { book: { "3.1": { answers: { q3: "x".repeat(601) } } } },
    { book: { "3.1": { page: 134, extra: 1 } } },
    { book: { "3.1": {}, "3.2": {}, "3.3": {}, "3.4": {}, "3.5": {}, "3.6": {}, "3.7": {}, "3.8": {}, review: {}, surplus: {} } },
  ];
  for (const [index, patch] of rejects.entries()) {
    const packed = { ...MathState.encode(bookBlank()), ...patch };
    assert.throws(() => MathState.decode(packed, current), `invalid textbook payload ${index} was accepted`);
  }
});

test("textbook edits do not change completion or progress", () => {
  assert.equal(Pilot.pilotProgress(["3.1"], {}).count, 1);
  assert.equal(Pilot.pilotProgress(["3.1"], { reason: "textbook drafting never feeds the gate" } as any).count, 1);
  const completedLine = course.split("\n").find((line: string) => line.includes("completedIds:"));
  assert.ok(completedLine && !completedLine.includes("book"), "completion must derive from lesson checks only");
  assert.ok(course.includes("completedIds:()=>[...S.done.map(x=>'u3-check-'+x.replace('.',''))]"));
  assert.ok(course.includes("syncBookInputs"), "textbook drafts must sync through the shared saver path");
  const withBook = MathState.decode(
    MathState.encode({ ...bookBlank(), book: { "3.1": { page: 140, selected: "q3", answers: { q3: "draft" } } }, done: ["3.1"] }),
    bookDecodeOptions(),
  );
  assert.deepEqual(withBook.done, ["3.1"]);
  assert.deepEqual(withBook.summary, { attempts: 0, correct: 0, supported: 0 });
  assert.equal(Pilot.pilotProgress(withBook.done, withBook.trig).count, 1);
});
