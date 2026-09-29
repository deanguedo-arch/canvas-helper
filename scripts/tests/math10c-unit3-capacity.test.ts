import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildScormStateCodecRuntime } from "../lib/scorm-state-codec.ts";

const ROOT = new URL("../../projects/math10c-unit3-pilot/workspace/assets/", import.meta.url).pathname;
function load(path: string): any {
  const code = readFileSync(path, "utf8");
  const module: { exports: any } = { exports: {} };
  const localRequire = (request: string) => load(new URL(request, `file://${path}`).pathname);
  new Function("module", "exports", "require", code)(module, module.exports, localRequire);
  return module.exports;
}
const State = load(`${ROOT}state.js`);
const Registry = load(`${ROOT}catalog-registry.js`);
const report = JSON.parse(readFileSync("projects/math10c-unit3-pilot/meta/mastery-capacity-report.json", "utf8"));
const stateCodec = new Function(`${buildScormStateCodecRuntime()}\nreturn stateCodec;`)();
const highEntropy = (seed: string, length = 600) => {
  let value = "";
  for (let i = 0; value.length < length; i += 1) value += createHash("sha256").update(`${seed}:${i}`).digest("base64url");
  return value.slice(0, length);
};
function envelope(projectSlug: string, data: unknown, completedIds: string[] = []) {
  const application = JSON.stringify(data);
  const compressed = stateCodec.encode(application);
  const outer = JSON.stringify({
    version: 1, projectSlug, savedAt: "2026-09-22T17:00:00.000Z", values: {}, scope: "course-scope", learnerId: "learner",
    course: { schemaVersion: 1, data: compressed, completedIds },
    tracking: { schemaVersion: 1, bookmark: "overview", activeMs: 99999999, pageMs: {} }, reason: "edited",
  });
  return { application, compressed, outer };
}
function maximumReceipts() {
  return Array.from({ length: State.MASTERY_RECEIPT_LIMIT }, (_, index) => ({
    target: `C3-3${Math.floor((index % 32) / 4) + 1}${"abcd"[index % 4]}`,
    kind: ["verification", "transfer", "reasoning", "retention"][index % 4],
    instance: `instance-${index}-${highEntropy(`instance:${index}`, 50)}`, variation: `variation-${index}`,
    observedAt: 1_700_000_000_000 + index, correct: index % 3 !== 0, support: 0, firstValid: true, fresh: true,
    policy: State.MASTERY_POLICY, checker: "c3-mastery-checker-version-1", component: "structured-work",
    session: `session-${index % 5}`, originSession: `session-${(index + 1) % 5}`,
    ...(index < 16 ? { source: `p31-${index % 12}`, raw: highEntropy(`answer:${index}`, 160) } : {}),
  }));
}

test("main mastery course fits after textbook notebook state is separated", () => {
  const state = {
    v: Registry.catalogs[Registry.current].contentVersion, rev: 1, route: "u3-review", r: {}, active: [], pos: 0,
    recent: [], pins: [], selectedTopic: "mixed", runMode: "learn", runSeed: 0, firsts: {}, drafts: {}, counts: {},
    trig: {}, book: {}, reasons: {}, paper: {}, done: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"],
    notes: {}, exposed: [], seen: [], summary: { attempts: 0, correct: 0, supported: 0 }, skills: {},
    legacySummary: { attempts: 0, correct: 0, supported: 0 }, summaryRevision: 0,
    mastery: { session: "current-session", receipts: maximumReceipts(), gaps: {}, seen36: Array.from({ length: 240 }, (_, index) => index), seen31: Array.from({ length: 240 }, (_, index) => index), seen32: Array.from({ length: 168 }, (_, index) => index), seen33: Array.from({ length: 240 }, (_, index) => index), seen34: Array.from({ length: 240 }, (_, index) => index), seen35: Array.from({ length: 240 }, (_, index) => index), seen37: Array.from({ length: 240 }, (_, index) => index), seen38: Array.from({ length: 240 }, (_, index) => index), submissions: Array.from({ length: State.MASTERY_SUBMISSION_LIMIT }, (_, index) => ({
      id: `m36-verification-v${index + 1}`, index, mode: "verification", problem: `2x^2+${index + 3}x+3`,
      values: { "m36-g": "1", "m36-a": "2", "m36-b": String(index + 3), "m36-c": "3", "m36-m": "2", "m36-n": "1", "m36-split": highEntropy(`split:${index}`, 80), "m36-factor": highEntropy(`factor:${index}`, 80), "m36-expand": highEntropy(`expand:${index}`, 80) },
      observedAt: 1_700_000_000_000 + index, support: 0, fresh: true, firstValid: true, checks: 4, result: "4 of 4 components correct", repair: "none", policy: State.MASTERY_POLICY, checker: "m36-contract-3",
    })), workshop: {
      id: "m36-transfer-v1", index: 10, mode: "transfer",
      values: Object.fromEntries(["m36-g", "m36-a", "m36-b", "m36-c", "m36-m", "m36-n", "m36-split", "m36-factor", "m36-expand"].map((key, index) => [key, highEntropy(key, index < 6 ? 20 : 160)])),
    }, workshop31: { id: "m31-transfer-v121", index: 120, mode: "transfer", values: { "m31-prime-a": highEntropy("m31-prime-a", 80), "m31-prime-b": highEntropy("m31-prime-b", 80), "m31-prime-c": highEntropy("m31-prime-c", 80), "m31-gcf": "12", "m31-lcm": "360", "m31-method": "GCF", "m31-value": "12", "m31-counts": "1,2,3" }, fresh: true, support: 0 },
    workshop32: { id: "m32-transfer-v85", index: 84, mode: "transfer", values: { "m32-square": "8", "m32-cube": "3", "m32-lower": "7", "m32-upper": "8", "m32-lower-power": "49", "m32-upper-power": "64", "m32-estimate": "7.6", "m32-dimension": "8", "m32-unit": "cm", "m32-relationship": highEntropy("m32-relationship", 160) }, fresh: true, support: 0 },
    workshop33: { id: "m33-transfer-v121", index: 120, mode: "transfer", values: { "m33-gcf": "6xy", "m33-factor": highEntropy("m33-factor", 100), "m33-candidate": "equivalent-incomplete", "m33-candidate-expand": highEntropy("m33-candidate-expand", 100), "m33-expand": highEntropy("m33-expand", 100) }, fresh: true, support: 0 },
    workshop34: { id: "m34-transfer-v121", index: 120, mode: "transfer", values: { "m34-total": highEntropy("m34-total", 100), "m34-cell-1": highEntropy("m34-cell-1", 80), "m34-cell-2": highEntropy("m34-cell-2", 80), "m34-cell-3": highEntropy("m34-cell-3", 80), "m34-cell-4": highEntropy("m34-cell-4", 80), "m34-factors": highEntropy("m34-factors", 100), "m34-cross": highEntropy("m34-cross", 100) }, fresh: true, support: 0 },
    workshop35: { id: "m35-transfer-v121", index: 120, mode: "transfer", values: { "m35-pair": "-3,4", "m35-sum": "1", "m35-product": "-12", "m35-monic": highEntropy("m35-monic", 100), "m35-gcf": "3", "m35-full": highEntropy("m35-full", 100), "m35-status": "equivalent-incomplete", "m35-expand": highEntropy("m35-expand", 100) }, fresh: true, support: 0 },
    workshop37: { id: "m37-transfer-v121", index: 120, mode: "transfer", values: { "m37-cell1": highEntropy("m37-cell1", 80), "m37-cell2": highEntropy("m37-cell2", 80), "m37-cell3": highEntropy("m37-cell3", 80), "m37-cell4": highEntropy("m37-cell4", 80), "m37-expanded": highEntropy("m37-expanded", 100), "m37-multi": highEntropy("m37-multi", 100), "m37-value": "48", "m37-unit": "cm^2", "m37-check": highEntropy("m37-check", 100) }, fresh: true, support: 0 },
    workshop38: { id: "m38-transfer-v121", index: 120, mode: "transfer", values: { "m38-square": highEntropy("m38-square", 100), "m38-middle": "8", "m38-perfect": highEntropy("m38-perfect", 100), "m38-difference": highEntropy("m38-difference", 100), "m38-gcf": "2", "m38-complete": highEntropy("m38-complete", 100), "m38-expand": highEntropy("m38-expand", 100) }, fresh: true, support: 0 } },
  };
  for (const key of ["workshop", "workshop31", "workshop32", "workshop33", "workshop34", "workshop35", "workshop37", "workshop38"])
    Object.assign(state.mastery[key], { checks: 3, wrongMask: 15 });
  const packed = State.encode(state);
  const measured = envelope("math10c-unit3-pilot", packed, ["u3-check-31", "u3-check-32", "u3-check-33", "u3-check-34", "u3-check-35", "u3-check-36", "u3-check-37", "u3-check-38"]);
  const fullLength = structuredClone(state);
  for (const [index, row] of fullLength.mastery.submissions.entries()) for (const key of ["m36-split", "m36-factor", "m36-expand"])
    row.values[key] = highEntropy(`full:${index}:${key}`, 160);
  const peak = envelope("math10c-unit3-pilot", State.encode(fullLength), ["u3-check-31", "u3-check-32", "u3-check-33", "u3-check-34", "u3-check-35", "u3-check-36", "u3-check-37", "u3-check-38"]);
  if (process.env.CAPACITY_PROBE) console.log(JSON.stringify({ normal: [measured.application.length, measured.compressed.length, measured.outer.length], peak: [peak.application.length, peak.compressed.length, peak.outer.length] }));
  assert.doesNotThrow(() => State.checkCapacity(packed));
  assert.equal(measured.application.length, report.mainCourse.applicationPayloadCharacters);
  assert.equal(measured.compressed.length, report.mainCourse.losslessCodecOutputCharacters);
  assert.equal(measured.outer.length, report.mainCourse.scorm2004EnvelopeCharacters);
  assert.ok(measured.application.length < State.APP_LIMIT);
  assert.ok(measured.outer.length < 60_000);
  assert.equal(peak.application.length, report.mainCourse.fullFieldPeak.applicationPayloadCharacters);
  assert.equal(peak.compressed.length, report.mainCourse.fullFieldPeak.losslessCodecOutputCharacters);
  assert.equal(peak.outer.length, report.mainCourse.fullFieldPeak.scorm2004EnvelopeCharacters);
  assert.throws(() => State.checkCapacity(State.encode(fullLength)), /budget/i, "oversized full-field work must be refused before save");
  assert.ok(peak.application.length > State.APP_LIMIT);
  assert.ok(peak.outer.length > 60_000, "maximum-field work would also exceed the SCORM 2004 envelope and must be refused before save");
});

for (const part of [1, 2, 3]) test(`textbook practice part ${part} fits its SCORM 2004 save envelope`, () => {
  const slug = `math10c-unit3-textbook-${part}`;
  const html = readFileSync(`projects/${slug}/workspace/index.html`, "utf8");
  const source = html.match(/<script type="application\/json" id="question-data">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(source);
  const questions = JSON.parse(source);
  const state = { v: 1, rev: 999, route: "overview", selected: [], answers: questions.map((_: unknown, index: number) => [index, highEntropy(`${slug}:${index}`)]) };
  const measured = envelope(slug, state);
  const expected = report.textbookPackages[slug];
  assert.equal(questions.length, expected.questionCount);
  assert.equal(measured.application.length, expected.applicationPayloadCharacters);
  assert.equal(measured.outer.length, expected.scorm2004EnvelopeCharacters);
  assert.ok(measured.application.length < expected.applicationLimitCharacters);
  assert.ok(measured.outer.length < expected.scorm2004SuspendDataLimitCharacters);
});
