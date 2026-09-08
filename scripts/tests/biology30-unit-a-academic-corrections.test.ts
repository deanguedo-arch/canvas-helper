import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { load } from "cheerio";
import { checkAcademicCorrections } from "../check-biology30-unit-a-academic-corrections.js";
import { assertTextbookLocator, ACADEMIC_CORRECTION_BASELINE } from "../lib/biology30-unit-a-pilot-2/practice-corrections.js";
import { academicCorrectionBaselineDirectory, buildAcademicCorrectionReport } from "../lib/biology30-unit-a-pilot-2/academic-corrections.js";
import { buildPerformanceBehaviours, EXCELLENCE_BEHAVIOUR_IDS } from "../lib/biology30-unit-a-pilot-2/contracts.js";
import { validateAtomicCurriculumContract } from "../lib/biology30-unit-a-pilot-2/atomic-contract.js";

const project = "projects/biology30-unit-a-pilot-2";
const html = await readFile(`${project}/workspace/index.html`, "utf8");
const $ = load(html);
const baselineHtml = await readFile(`${project}/${academicCorrectionBaselineDirectory}/workspace/index.html`, "utf8");
const historical = JSON.parse(await readFile(`${project}/${academicCorrectionBaselineDirectory}/meta/remaining-academic-review.json`, "utf8"));
const atomic = JSON.parse(await readFile(`${project}/meta/atomic-curriculum-map.json`, "utf8"));

test("the exact correction candidate preserves teaching, all questions/keys and source-grounded baseline evidence", async () => {
  const record = await checkAcademicCorrections();
  assert.equal(record.baselineWorkspaceSha256, ACADEMIC_CORRECTION_BASELINE);
  assert.equal(record.items.length, 86);
  assert.equal(record.counts.keyReversals, 0);
  assert.equal(record.counts.changedPrompts, 0);
  assert.equal(record.counts.choiceSpecificFeedback, 258);
  assert.equal(record.teacherDecision, null);
  assert.equal(record.transferReady, false);
  assert.throws(() => buildAcademicCorrectionReport(`${baselineHtml}\n`, html, historical, record.generatedAt), /baseline drift/);
  const changed = load(html);
  changed("[data-practice-id] [data-practice-feedback]").first().attr("data-answer", "h");
  assert.throws(() => buildAcademicCorrectionReport(baselineHtml, changed.html(), historical, record.generatedAt), /key changed/);
});

test("every textbook link has valid per-document bounds and every feedback panel offers direct local teaching", () => {
  $("[data-open-textbook]").each((_i, element) => assertTextbookLocator($(element).attr("data-open-textbook")!, Number($(element).attr("data-printed-page")), Number($(element).attr("data-pdf-page"))));
  assert.throws(() => assertTextbookLocator("chapter-13", 371, -62), /Invalid textbook/);
  assert.throws(() => assertTextbookLocator("chapter-12", 408, 0), /Invalid textbook/);
  assert.throws(() => assertTextbookLocator("chapter-11", 403, 45), /Invalid textbook/);
  $("[data-practice-feedback]").each((_i, element) => {
    const panel = $(element);
    assert.equal(panel.find("[data-open-first-use],a[href*=advanced]").length, 1);
    const button = panel.find("[data-open-first-use]");
    if (button.length) assert.equal($(`#${button.attr("data-open-first-use")}`).closest(".course-page").attr("id"), button.attr("data-first-use-route"));
  });
});

test("visible wrong choices have authored feedback; replacement values cannot reinterpret legacy answers", async () => {
  const registry = JSON.parse(await readFile(`${project}/meta/process-collection-index.json`, "utf8"));
  $("[data-practice-id]").each((_i, element) => {
    const node = $(element), id = node.attr("data-practice-id")!;
    const legacy = JSON.parse(node.find("[data-legacy-choices]").attr("data-legacy-choices")!);
    const feedback = JSON.parse(node.find("[data-practice-feedback]").attr("data-feedback")!);
    const correct = node.find("[data-practice-feedback]").attr("data-answer");
    const options = node.find("input[type=radio]").toArray().map((option) => $(option).attr("value")!);
    assert.equal(options.length, 4);
    for (const value of options.filter((v) => v !== correct)) {
      assert.ok(feedback[value].length >= 35);
      assert.doesNotMatch(feedback[value], /conflicts with the required structure|This choice identifies|Compare the selected structure/);
    }
    const evidence = registry.records.find((record: any) => record.stateRef.practiceId === id).courseEvidence;
    for (const [value, text] of Object.entries(legacy)) {
      assert.ok(!options.includes(value), `${id}: reused changed option value`);
      assert.equal(evidence.choices[value], text, `${id}: legacy choice lost in collection`);
    }
  });
});

test("source columns distinguish acceptable, excellence and locally authored criteria without dropping outcomes", () => {
  const behaviours = buildPerformanceBehaviours();
  assert.equal(behaviours.filter((b) => b.standard === "acceptable").length, 47);
  assert.deepEqual(behaviours.filter((b) => b.standard === "excellence").map((b) => b.id), [...EXCELLENCE_BEHAVIOUR_IDS]);
  const local = behaviours.find((b) => b.id === "A1.4s-01")!;
  assert.equal(local.sourceKind, "locally-authored-curriculum-paraphrase");
  assert.equal(local.authorityColumn, null);
  assert.match(local.authorityUrl, /bio203007/);
  validateAtomicCurriculumContract(html, atomic);
  for (const component of atomic.components.filter((c: any) => c.sourceStandard === "excellence")) {
    assert.equal(component.tier, "advanced");
    assert.equal(component.practiceItemIds.length, 0);
    assert.ok(component.taskSelectors.every((selector: string) => selector.includes("data-advanced-block-id") || (component.performanceBehaviourIds.includes("A2.3k-03") && selector.includes('data-online-investigation-step="endocrine-experiment"'))));
    // This excellence hypothesis uses the existing non-gating investigation, not a new core quiz.
    assert.equal(component.tier,"advanced");
  }
  assert.equal(atomic.components.filter((c: any) => c.id.startsWith("outcome-") && c.tier === "required-core").length, 25);
});
