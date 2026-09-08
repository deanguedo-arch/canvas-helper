import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import { ACADEMIC_CORRECTION_BASELINE, ACADEMIC_CORRECTION_ID, assertTextbookLocator, correctPracticeItem } from "./practice-corrections.js";
import type { PracticeItem } from "./full-content.js";
import { buildPerformanceBehaviours } from "./contracts.js";

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
export const academicCorrectionBaselineDirectory = `raw/academic-correction-baselines/${ACADEMIC_CORRECTION_BASELINE}`;

export function buildAcademicCorrectionReport(beforeHtml: string, afterHtml: string, priorReview: any, generatedAt: string) {
  assert.equal(sha(beforeHtml), ACADEMIC_CORRECTION_BASELINE, "Correction baseline drift");
  assert.equal(priorReview.workspaceSha256, ACADEMIC_CORRECTION_BASELINE);
  const before = load(beforeHtml), after = load(afterHtml);
  const items = before("[data-practice-id]").map((_index, element) => {
    const node = before(element), id = node.attr("data-practice-id")!;
    const panel = node.find("[data-practice-feedback]");
    const textbook = panel.find("[data-open-textbook]");
    const original: PracticeItem = {
      id, number: Number(node.find(".practice-number").text().replace(/\D/g, "")),
      prompt: node.find("h3").text(),
      choices: Object.fromEntries(node.find(".choice-row").map((_i, choice) => [[before(choice).find("input").attr("value")!, before(choice).find("span").text()]]).get()),
      answer: panel.attr("data-answer")!, rationale: panel.attr("data-rationale")!, feedback: JSON.parse(panel.attr("data-feedback")!),
      textbook: { doc: textbook.attr("data-open-textbook") as PracticeItem["textbook"]["doc"], printed: Number(textbook.attr("data-printed-page")), physical: Number(textbook.attr("data-pdf-page")) },
      optional: node.attr("data-required") === "false",
    };
    const expected = correctPracticeItem(original);
    const current = after(`[data-practice-id="${id}"]`), feedback = current.find("[data-practice-feedback]");
    assert.equal(current.length, 1, `Stable question ID missing: ${id}`);
    assert.equal(current.find("h3").text(), original.prompt, `${id}: prompt changed`);
    assert.equal(feedback.attr("data-answer"), original.answer, `${id}: key changed`);
    assert.equal(feedback.attr("data-rationale"), original.rationale, `${id}: rationale changed`);
    assert.equal(current.attr("data-required"), node.attr("data-required"), `${id}: required status changed`);
    const choices = current.find(".choice-row").map((_i, choice) => [ [after(choice).find("input").attr("value")!, after(choice).find("span").text()] ]).get() as [string, string][];
    assert.deepEqual(choices, Object.entries(expected.choices), `${id}: authored choices/display order differ`);
    assert.deepEqual(JSON.parse(feedback.attr("data-feedback")!), expected.feedback);
    const actualPage = feedback.find("[data-open-textbook]");
    assert.deepEqual([actualPage.attr("data-open-textbook"), Number(actualPage.attr("data-printed-page")), Number(actualPage.attr("data-pdf-page"))], [expected.textbook.doc, expected.textbook.printed, expected.textbook.physical]);
    assertTextbookLocator(expected.textbook.doc, expected.textbook.printed, expected.textbook.physical);
    const target = expected.explanation.advancedId ? `#${expected.explanation.advancedId}-heading` : `#${expected.explanation.localTarget}`;
    assert.equal(after(target).length, 1, `${id}: exact local explanation is missing`);
    const sourceJudgment = priorReview.practices.find((entry: any) => entry.id === id);
    assert.ok(sourceJudgment, `${id}: no source-grounded baseline review`);
    return {
      id, routeId: current.closest(".course-page").attr("id"), outcomeIds: sourceJudgment.outcomeIds,
      prompt: original.prompt, answerKey: original.answer, correctAnswer: original.choices[original.answer],
      beforeTextbook: original.textbook, textbook: expected.textbook, support: expected.explanation.support,
      localExplanation: { routeId: expected.explanation.lessonId, selector: target, sha256: sha(after.html(after(target).closest(".learn-block,.advanced-learning-block"))) },
      concept: expected.concept, prerequisiteReview: "Revised alternatives use concepts taught before the corresponding question; optional items retain their Advanced Learning context.",
      choices: choices.map(([value, text]) => ({ value, text, feedback: value === original.answer ? original.rationale : expected.feedback[value] })),
      legacyChoices: expected.legacyChoices,
      correctDisplayPosition: choices.findIndex(([value]) => value === original.answer) + 1,
      preservation: "Question, key, rationale, attempt ID and correct-answer meaning retained. Changed distractors get new option values; earlier choices remain readable historical attempts without new saved fields.",
      sourceReview: "remaining-academic-review.json", teacherDecision: null,
    };
  }).get();
  assert.equal(items.length, 86);
  assert.equal(after("[data-practice-id]").length, 86);
  // Protect all teaching, media, advanced explanations, written tasks and response limits.
  const preserve = ["[data-core-zone]", "[data-media-checkpoint-id]", "[data-advanced-block-id]", "[data-study-task]", "[data-response-id]", "[data-textbook-review-route]", ".retrieve-block", ".evidence-block", "[data-investigation]"];
  for (const selector of preserve) {
    const earlier = before(selector).toArray(), later = after(selector).toArray();
    assert.equal(later.length, earlier.length, `${selector}: count changed`);
    earlier.forEach((node, index) => {
      assert.equal(after(later[index]).text(), before(node).text(), `${selector}: instructional text changed`);
      for (const attribute of ["data-response-id", "maxlength", "data-save-response", "data-complete-route"])
        assert.equal(after(later[index]).attr(attribute), before(node).attr(attribute), `${selector}: ${attribute} changed`);
    });
  }
  const keyPositions = items.reduce((counts: Record<number, number>, row) => { counts[row.correctDisplayPosition] = (counts[row.correctDisplayPosition] ?? 0) + 1; return counts; }, {});
  assert.ok(Object.keys(keyPositions).length === 4 && Math.max(...Object.values(keyPositions)) - Math.min(...Object.values(keyPositions)) <= 1, "Visible answer positions are unbalanced");
  return {
    schemaVersion: 1, project: "biology30-unit-a-pilot-2", iteration: ACADEMIC_CORRECTION_ID, generatedAt,
    baselineWorkspaceSha256: ACADEMIC_CORRECTION_BASELINE, baselineDirectory: academicCorrectionBaselineDirectory,
    workspaceSha256: sha(afterHtml), status: "awaiting-explicit-user-review", teacherDecision: null, transferReady: false,
    scope: "Corrective practice, page-content and source-column review. Not full academic clearance, student testing, transcript certification or teacher acceptance.",
    counts: { questions: 86, keyReversals: 0, changedPrompts: 0, invalidPracticeLocators: 0,
      changedTextbookLocators: items.filter((row) => JSON.stringify(row.beforeTextbook) !== JSON.stringify(row.textbook)).length,
      changedDistractors: items.reduce((sum, row) => sum + Object.keys(row.legacyChoices).length, 0),
      choiceSpecificFeedback: 258, keyPositions, acceptableExamples: 47, excellenceExamples: 5, localCriteria: 1 },
    preserved: { stateSchema: 6, newSavedFields: 0, practiceIds: 86, requiredQuestions: 80, optionalQuestions: 6,
      writtenWork: "All existing fields and limits retained", completionRules: "unchanged", requiredRoutes: 18, requiredMinutes: 1505, optionalMinutes: 295,
      instructionalSurfacesCompared: preserve },
    sourceCheck: { checkedAt: "2026-09-05", supportUrl: "https://www.alberta.ca/writing-diploma-exams", bulletinEditionObserved: "2025–2026",
      curriculumUrl: "https://education.alberta.ca/media/159727/bio203007.pdf", standardsUrl: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf",
      limitation: "Performance columns were visually inspected. Their examples are illustrative, not an exhaustive checklist or a reason to remove required curriculum teaching." },
    sourceStandards: buildPerformanceBehaviours().map(({ id, standard, sourceKind, authorityColumn, authorityUrl, authorityPdfPage }) => ({ id, standard, sourceKind, authorityColumn, authorityUrl, authorityPdfPage })),
    remaining: ["Thirteen complete transcript reviews and all fourteen illustrated-equivalent repairs", "Chapter 12/13 structure-function and hormone-source evidence gaps", "Practical-delivery and collaboration decisions", "Final Practice topic distribution and Diploma Challenge depth review; this batch preserves question meanings", "Measured workload, student comprehension, full exact-build teacher acceptance and later LMS validation"],
    items,
  };
}

export function academicCorrectionMarkdown(report: ReturnType<typeof buildAcademicCorrectionReport>) {
  return [`# Pilot 2 — practice, textbook and standards correction`, "", `Workspace SHA: \`${report.workspaceSha256}\`. Status: **awaiting explicit review**; academic gaps remain.`, "",
    `Preserved baseline: \`${report.baselineWorkspaceSha256}\` in [the content-addressed baseline](../${report.baselineDirectory}/workspace/index.html).`, "",
    "## What changed", "", `- ${report.counts.changedTextbookLocators} question locators corrected, including all twelve wrong-chapter Final Practice links. All 86 also link to an exact local explanation; background-only textbook support is labelled as background.`,
    `- ${report.counts.changedDistractors} weak alternatives replaced; all 258 visible incorrect choices now have specific explanatory feedback.`,
    `- Visible correct positions: ${Object.entries(report.counts.keyPositions).map(([position, count]) => `position ${position}: ${count}`).join("; ")}. No correct answer, question prompt or grading key changed.`,
    "- Changed alternatives receive fresh single-character option IDs. Old answers remain in the same saved records and are shown with their original wording in the question and Process Collection. This is compatibility for an earlier attempt, not a new response-history feature.",
    "- The source inventory now distinguishes 47 acceptable examples, five excellence examples and one local curriculum criterion. Excellence examples no longer become automatic core-gap requirements; required Program of Studies outcomes remain.", "",
    "## Reproduction and ownership", "", "Author in `scripts/lib/biology30-unit-a-pilot-2/practice-corrections.ts`, `contracts.ts`, `academic-evidence.ts` and `render-gate1.ts`. Never edit generated HTML. The contained final-academic builder snapshots the pre-correction HTML and metadata, rejects drift, validates authored changes and protected instruction, and promotes only a complete staged candidate.", "",
    "`npm run build:biology30-unit-a-pilot-2 -- --project biology30-unit-a-pilot-2 --gate final-academic-review --baseline-workspace-sha 219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc`", "",
    "`npx tsx scripts/check-biology30-unit-a-academic-corrections.ts`", "",
    "The historical [source-grounded review](remaining-academic-review.md) remains attached to its original SHA. Its defects must not be mistaken for a review of this new candidate. [Current machine contract](academic-corrections.json) records every before/after locator, alternative, feedback, source level and exact explanation.", "",
    "## Unchanged and not yet cleared", "", "Core instruction, media paths, all written work, 86 question IDs, 40 Advanced Learning blocks, schema 6, scoring, 18 required routes and 1,505/295 minutes are preserved. No deployment, export, commit, push or B–D transfer is authorized by this correction.", "",
    ...report.remaining.map((line) => `- ${line}`), "",
    "## Item-level map", "", "| Item | Textbook | Support | Correct position |", "| --- | --- | --- | --- |",
    ...report.items.map((row) => `| ${row.id.split(":practice:")[1]} | ${row.textbook.doc}, p.${row.textbook.printed}, PDF ${row.textbook.physical} | ${row.support}; local ${row.localExplanation.selector} | ${row.correctDisplayPosition} |`), ""].join("\n");
}
