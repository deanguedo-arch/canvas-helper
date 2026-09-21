// Blocked Math 10C factoring + triangle pilot slice: focused boundary test.
//
// Covers the pilot contract only: blocked manifest, immutable source ZIP and
// raw baseline, active-route/SCORM agreement, inactive-link absence, the two
// required completion IDs, legacy route remapping without evidence loss, the
// four-condition triangle gate, the two-checkpoint progress denominator, and
// unchanged response/history/state limits.
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

test("active route contract and SCORM tracking agree on seven routes and two IDs", () => {
  assert.deepEqual(tracking.pageIds, Pilot.ACTIVE_ROUTES);
  assert.deepEqual(tracking.pageIds, slice.activeRoutes);
  assert.deepEqual(Pilot.INACTIVE_ROUTES, slice.inactivePreservedRoutes);
  assert.equal(tracking.defaultPageId, "u3-overview");
  assert.deepEqual(tracking.completion.requiredIds, ["u3-check-35", "u3-transfer-complete"]);
  assert.deepEqual(tracking.completion.requiredIds, Pilot.REQUIRED_IDS);
  assert.deepEqual(tracking.completion.requiredIds, slice.completionCriteria.requiredIds);
  assert.ok(html.includes('<script src="assets/pilot-slice.js"></script>'));
  assert.ok(course.includes("window.MathPilotSlice"));
  assert.ok(course.includes("Pilot.isTriangleComplete(S.trig)?['u3-transfer-complete']:[]"));
});

test("all 22 pages are retained but inactive lesson links are absent from learner paths", () => {
  for (const id of [...Pilot.ACTIVE_ROUTES, ...Pilot.INACTIVE_ROUTES]) {
    assert.ok(html.includes(`id="${id}"`), `preserved page missing: ${id}`);
    assert.ok(Pilot.isKnownRoute(id), `unknown route: ${id}`);
  }
  const nav = html.slice(html.indexOf("<nav"), html.indexOf("</nav>"));
  assert.deepEqual([...new Set(hrefs(nav))].sort(), [...Pilot.ACTIVE_ROUTES].sort());
  for (const id of Pilot.ACTIVE_ROUTES) {
    const leaked = hrefs(pageSegment(html, id)).filter((h) => !Pilot.isActiveRoute(h));
    assert.deepEqual(leaked, [], `${id} links to inactive routes`);
  }
  assert.match(pageSegment(html, "u3-overview"), /review pilot/i);
  assert.ok(!course.includes("of 8 lesson checks"));
  assert.ok(!html.includes("of 8 lesson checks"));
});

test("factoring and triangle completion IDs are the only required IDs", () => {
  assert.deepEqual(tracking.completion.requiredIds, ["u3-check-35", "u3-transfer-complete"]);
  assert.ok(course.includes("u3-check-'+x.replace('.','')"));
  const literals = [...course.matchAll(/u3-check-[0-9.]+/g)].map((m) => m[0]);
  assert.deepEqual(literals, [], `hardcoded lesson checks: ${literals}`);
});

test("legacy inactive-route state is remapped without dropping protected fields", () => {
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
  assert.equal(next.route, "u3-overview");
  assert.equal(legacy.route, "u3-34", "migration must not mutate the input");
  const { route: _droppedNext, ...restNext } = next;
  const { route: _droppedLegacy, ...restLegacy } = snapshot;
  assert.deepEqual(restNext, restLegacy);
  for (const route of Pilot.ACTIVE_ROUTES) {
    const kept = { route };
    assert.equal(Pilot.migrateRoute(kept), kept, `${route} must pass through untouched`);
  }
});

test("triangle completion requires all four conditions", () => {
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

test("visible progress denominator is two pilot checkpoints", () => {
  assert.equal(Pilot.TOTAL_CHECKPOINTS, 2);
  assert.deepEqual(Pilot.pilotProgress([], {}), { factoring: false, transfer: false, count: 0, total: 2 });
  assert.equal(Pilot.pilotProgress(["3.1", "3.4"], {}).count, 0);
  assert.equal(Pilot.pilotProgress(["3.5"], {}).count, 1);
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
  assert.equal(Pilot.pilotProgress(["3.5"], trig).count, 2);
  assert.ok(course.includes("of 2 pilot checkpoints"));
  assert.ok(course.includes("Pilot checkpoints recorded:"));
  assert.ok(course.includes("syncSaving();updateProgress();return ok"));
  assert.ok(html.includes("0 of 2 pilot checkpoints"));
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
    applicationCharacters: 40000,
  });
  assert.equal(MathState.APP_LIMIT, 40000);
  assert.equal(MathState.VERSION, "unit3-state-3");
  assert.ok(course.includes("key:'math10c-unit3-pilot:review:v2'"));
  assert.ok(course.includes("const rawLimit=160"));
  assert.ok(html.includes('maxlength="160"'));
  assert.ok(html.includes('id="trig-reason"'));
});

test("teacher-review UI fixes keep gutters, collapsed control, launcher, and desktop reference hooks", () => {
  const css = read(`${SLUG}/workspace/styles.css`);
  // 1. The direct .lesson-section child of #check-3.5 shares lesson-block gutters.
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
  // 4. The desktop panel is draggable/resizable and clamped; mobile stays an inset sheet.
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
    course.includes("addEventListener('resize',()=>clampReferencePanel())"),
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
