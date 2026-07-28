import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import test from "node:test";
import vm from "node:vm";

import * as cheerio from "cheerio";

import {
  WRITING_FOUNDATIONS_LESSON_BLUEPRINTS,
  WRITING_FOUNDATIONS_PROFILE_CSS,
  WRITING_FOUNDATIONS_PROFILE_RUNTIME,
  WRITING_FOUNDATIONS_SOURCE_CONTRACT,
  WRITING_FOUNDATIONS_SOURCE_PAGE_IDS,
  assertWritingFoundationsSourcePageIds,
  decodeWritingFoundationsSource,
  normalizeWritingFoundationsSourceHtml,
  renderWritingFoundationsProfile
} from "./writing-foundations-profile-renderer.js";

function render() {
  return renderWritingFoundationsProfile({
    namespace: "ela10-2-writing-foundations",
    courseCode: "ELA 10-2",
    unitTitle: "Writing Foundations",
    evidenceBankRoute: "evidence-bank"
  });
}

function documentFor() {
  return cheerio.load(render().pages.map((page) => page.html).join("\n"));
}

test("source contract strictly allowlists module 3349, unit 3350, and pages 3351-3357", () => {
  assert.equal(WRITING_FOUNDATIONS_SOURCE_CONTRACT.moduleId, "3349");
  assert.equal(WRITING_FOUNDATIONS_SOURCE_CONTRACT.unitId, "3350");
  assert.deepEqual(
    WRITING_FOUNDATIONS_SOURCE_CONTRACT.pages.map((page) => page.id),
    [...WRITING_FOUNDATIONS_SOURCE_PAGE_IDS]
  );
  assert.deepEqual(
    WRITING_FOUNDATIONS_SOURCE_CONTRACT.pages.map((page) => page.href),
    [
      "foundations_of_writing/foundations_of_writing_intro.htm",
      "foundations_of_writing/test.html",
      "foundations_of_writing/paragraph_structure.htm",
      "M1 Paragraph/Paragraph Template #1.html",
      "M1 Paragraph/Paragraph Template #2.html",
      "M1 Paragraph/maburger test.html",
      "foundations_of_writing/organizing_a_paragraph.htm"
    ]
  );
  assert.deepEqual(
    WRITING_FOUNDATIONS_LESSON_BLUEPRINTS.map((lesson) => lesson.sourcePageIds),
    [["3351"], ["3352"], ["3353"], ["3353"], ["3354", "3355", "3356"], ["3357"], ["3353", "3357"]]
  );
  assert.deepEqual(WRITING_FOUNDATIONS_LESSON_BLUEPRINTS[4]?.tabLabels, ["Hamburger", "Graphic Organizer", "PEEL"]);
  assert.match(WRITING_FOUNDATIONS_SOURCE_CONTRACT.excludedAssets.map((asset) => asset.pattern).join("\n"), /Slide\*\.jpg/);
  assert.match(WRITING_FOUNDATIONS_SOURCE_CONTRACT.excludedAssets.map((asset) => asset.pattern).join("\n"), /Run-On Sentences\.ppsx/);

  assert.doesNotThrow(() => assertWritingFoundationsSourcePageIds(WRITING_FOUNDATIONS_SOURCE_PAGE_IDS));
  assert.throws(() => assertWritingFoundationsSourcePageIds(["3351", "3352"]), /requires source pages 3351, 3352, 3353, 3354, 3355, 3356, 3357/);
  assert.throws(() => assertWritingFoundationsSourcePageIds(["3351", "3353", "3352", "3354", "3355", "3356", "3357"]), /manifest order/);
  assert.throws(() => assertWritingFoundationsSourcePageIds([...WRITING_FOUNDATIONS_SOURCE_PAGE_IDS, "3358"]), /received/);
});

test("UTF-16LE source decoding and normalization remove LMS noise while correcting instruction", () => {
  const source = `<!doctype html><html><head><style>.old{color:red}</style><script>alert('old')</script></head><body>
    <p>Demo of Lesson Template</p>
    <p>CBe-learn - Calgary Board of Education</p>
    <p>A sentence contains a complete idea, a verb and a noun.</p>
    <p>run-on sentences - they contain too many ideas!</p>
    <p>sentence fragments - they are missing information</p>
    <p>comma splices - too many commas in a sentence</p>
    <p>Each written assignment in the course MUST include a rough draft or outline.</p>
    <p>These 'wing it' writings, ARE your rough draft!</p>
    <p>Three different paragraph templates will be discussed over the next few pages.</p>
    <p>Please continue to the next page.</p>
    <p>This assignment is due Friday. Submit your rough draft to your teacher.</p>
    <p><a href="https://www.teacherspayteachers.com/item">Teacher slides</a></p>
    <p><a href="https://owl.english.purdue.edu/owl/resource/606/01">Old Purdue link</a></p>
    <p><a href="Run-On%20Sentences.ppsx">Run-on sentences PowerPoint</a></p>
    <iframe src="https://slideshare.net/legacy"></iframe>
    <object data="legacy.ppsx"></object>
    <img src="Slide1.jpg" alt="licensed diagram">
  </body></html>`;
  const utf16 = new Uint8Array(Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(source, "utf16le")]));
  const decoded = decodeWritingFoundationsSource(utf16);
  assert.equal(decoded, source);

  const normalized = normalizeWritingFoundationsSourceHtml(decoded);
  assert.match(normalized, /A complete sentence expresses a complete thought/);
  assert.match(normalized, /independent clauses joined without correct punctuation or a conjunction/);
  assert.match(normalized, /independent clauses joined only with a comma/);
  assert.match(normalized, /Strong writing usually begins with planning/);
  assert.match(normalized, /Three paragraph-planning models are available in this unit/);
  assert.doesNotMatch(normalized, /CBE|CBe|Calgary Board|Demo of Lesson|continue to the next page|assignment is due|submit your rough draft/i);
  assert.doesNotMatch(normalized, /teacherspayteachers|slideshare|owl\.english\.purdue|\.ppsx|<script|<style|<iframe|<object|<embed|<img/i);
});

test("renderer groups the four writing practices under one sidebar destination", () => {
  const output = render();
  assert.equal(output.kind, "writing-foundations");
  assert.deepEqual(output.pages.map((page) => page.id), ["sentence-lab", "paragraph-builder", "organization-lab", "final-paragraph"]);
  assert.ok(output.pages.every((page) => page.navigation === "lesson-linked"));
  assert.deepEqual(output.navGroups, [{
    id: "sentence-lab",
    label: "Writing Activities",
    icon: "edit_square",
    landingItemLabel: "Sentence Practice",
    itemPageIds: ["paragraph-builder", "organization-lab", "final-paragraph"]
  }]);
  assert.deepEqual(output.lessonBlueprints, WRITING_FOUNDATIONS_LESSON_BLUEPRINTS);
  assert.notEqual(output.lessonBlueprints, WRITING_FOUNDATIONS_LESSON_BLUEPRINTS, "renderer returns an integration-safe copy");
  assert.equal(output.sourceContract, WRITING_FOUNDATIONS_SOURCE_CONTRACT);
  assert.deepEqual(output.resourceLinks, [{
    id: "purdue-paragraphs-paragraphing",
    title: "Purdue OWL: Paragraphs and Paragraphing",
    kind: "link",
    description: "Current guidance for developing focused, coherent paragraphs.",
    href: "https://owl.purdue.edu/owl/general_writing/academic_writing/paragraphs_and_paragraphing/index.html",
    actionLabel: "Open Resource",
    downloadable: false,
    embeddable: false,
    status: "available"
  }]);

  const $ = documentFor();
  assert.equal($("section.course-page").length, 4);
  assert.equal($("[data-writing-foundations-page]").length, 4);
  assert.equal($("#sentence-lab").length, 1);
  assert.equal($("#paragraph-builder").length, 1);
  assert.equal($("#organization-lab").length, 1);
  assert.equal($("#final-paragraph").length, 1);
  assert.match($.text(), /ELA 10-2/);
  assert.doesNotMatch($.text(), /Critical Essay|ELA 10-1|CBE|Calgary Board|Teachers Pay Teachers|PPSX|continue to the next page/i);
  assert.equal($("img, iframe, object, embed").length, 0, "labs use native accessible HTML instead of legacy media");
});

test("Sentence Lab uses stable autosave fields, optional hints, scoped printing, collection save, and individual evidence", () => {
  const $ = documentFor();
  const page = $("#sentence-lab");
  assert.equal(page.find("[data-wf-sentence-practice]").length, 6);
  assert.equal(page.find("[data-wf-sentence-classification]").length, 6);
  assert.equal(page.find("textarea[data-response-id$=':repair']").length, 6);
  assert.equal(page.find("[data-question-hint]").length, 12);
  assert.equal(page.find("[data-worksheet-toggle-hints]").length, 1);
  assert.equal(page.find("[data-worksheet-print]").length, 1);
  assert.equal(page.find("[data-save-response-collection]").length, 1);
  assert.equal(page.find("[data-evidence-collection-id='ela10-2-writing-foundations:writing-foundations:sentence-lab:collection']").length, 1);
  assert.equal(page.find("[data-evidence-notebook-panel]").length, 1);
  assert.equal(page.find("[data-save-evidence-note]").length, 1);
  assert.equal(page.find("[data-page-target='evidence-bank']").length, 1);
  assert.match(page.text(), /Save Corrected Sentence Set/);
  assert.match(page.text(), /Save Example to Evidence Bank/);
});

test("Paragraph Builder keeps Hamburger, Graphic Organizer, and PEEL plans isolated and previews them natively", () => {
  const $ = documentFor();
  const page = $("#paragraph-builder");
  assert.equal(page.find("[role='tab']").length, 3);
  assert.deepEqual(page.find("[role='tab']").map((_index, element) => $(element).text()).get(), ["Hamburger", "Graphic Organizer", "PEEL"]);
  assert.equal(page.find("[role='tabpanel']").length, 3);
  assert.equal(page.find("[data-response-collection]").length, 3);
  assert.deepEqual(
    page.find("[data-evidence-collection-id]").map((_index, element) => $(element).attr("data-evidence-collection-id")).get(),
    [
      "ela10-2-writing-foundations:writing-foundations:paragraph-builder:hamburger:collection",
      "ela10-2-writing-foundations:writing-foundations:paragraph-builder:graphic:collection",
      "ela10-2-writing-foundations:writing-foundations:paragraph-builder:peel:collection"
    ]
  );
  assert.equal(page.find("[data-wf-model-field]").length, 14);
  assert.equal(page.find("figure.wf-model-diagram").length, 3);
  assert.equal(page.find("[data-wf-model-preview]").length, 3);
  assert.equal(page.find("[data-save-response-collection]").length, 3);
  assert.equal(page.find("img").length, 0);
});

test("Organization Lab exposes keyboard move controls, a native bee preview, structural labels, and one upserted collection", () => {
  const $ = documentFor();
  const page = $("#organization-lab");
  assert.equal(page.find("[data-wf-order-item]").length, 6);
  assert.equal(page.find("button[data-wf-move='up']").length, 6);
  assert.equal(page.find("button[data-wf-move='down']").length, 6);
  assert.equal(page.find("[data-wf-order-state][data-response-id]").length, 1);
  assert.equal(page.find("[data-wf-organized-response][data-response-id]").length, 1);
  assert.equal(page.find("[data-wf-check-order]").length, 1);
  assert.equal(page.find("[data-wf-correct-order='topic,round-dance,waggle-dance,direction-detail,distance-detail,conclusion']").length, 1);
  assert.match(page.text(), /Topic sentence/);
  assert.match(page.text(), /Details or evidence/);
  assert.match(page.text(), /Transitions and connections/);
  assert.match(page.text(), /Concluding sentence/);
  assert.match(page.text(), /Why this order works/);
  assert.equal(page.find("[data-save-response-collection]").length, 1);
  assert.equal(page.find("[data-evidence-collection-id='ela10-2-writing-foundations:writing-foundations:organization-lab:collection']").length, 1);
});

test("Final Paragraph provides one polished draft, a seven-part revision checklist, reflection, and deliberate collection save", () => {
  const $ = documentFor();
  const page = $("#final-paragraph");
  assert.equal(page.find("[data-response-id$=':planning-note']").length, 1);
  assert.equal(page.find("[data-response-id$=':polished-paragraph']").length, 1);
  assert.equal(page.find(".wf-final-check input[type='checkbox'][data-response-id]").length, 7);
  assert.equal(page.find("[data-response-id$=':revision-reflection']").length, 1);
  assert.equal(page.find("[data-save-response-collection]").length, 1);
  assert.equal(page.find("[data-evidence-collection-id='ela10-2-writing-foundations:writing-foundations:final-paragraph:collection']").length, 1);
  assert.match(page.text(), /Save Final Paragraph/);
});

test("all response IDs are stable and unique, and profile CSS/runtime are standalone integration fragments", () => {
  const $ = documentFor();
  const responseIds = $("[data-response-id]").map((_index, element) => $(element).attr("data-response-id")).get();
  assert.equal(responseIds.length, 47);
  assert.equal(new Set(responseIds).size, responseIds.length);
  assert.ok(responseIds.every((id) => id.startsWith("ela10-2-writing-foundations:writing-foundations:")));
  assert.match(WRITING_FOUNDATIONS_PROFILE_CSS, /#161a17/);
  assert.match(WRITING_FOUNDATIONS_PROFILE_CSS, /#154212/);
  assert.match(WRITING_FOUNDATIONS_PROFILE_CSS, /\.wf-graphic-support span:last-child\s*\{\s*grid-column:\s*1\s*\/\s*-1;/);
  assert.match(WRITING_FOUNDATIONS_PROFILE_CSS, /@media \(max-width: 1100px\)[\s\S]*\.wf-model-layout\s*\{\s*grid-template-columns:\s*1fr;/);
  assert.match(WRITING_FOUNDATIONS_PROFILE_CSS, /@media \(max-width: 840px\)/);
  assert.match(WRITING_FOUNDATIONS_PROFILE_CSS, /@media print/);
  assert.doesNotMatch(WRITING_FOUNDATIONS_PROFILE_CSS, /gradient\(/i);
  assert.match(WRITING_FOUNDATIONS_PROFILE_RUNTIME, /data-wf-model-tab/);
  assert.match(WRITING_FOUNDATIONS_PROFILE_RUNTIME, /data-wf-move/);
  assert.match(WRITING_FOUNDATIONS_PROFILE_RUNTIME, /data-wf-check-sentences/);
  assert.doesNotThrow(() => new vm.Script(WRITING_FOUNDATIONS_PROFILE_RUNTIME, { filename: "writing-foundations-runtime.js" }));
});

test("renderer validates namespaces and honors a custom Evidence Bank route", () => {
  assert.throws(() => renderWritingFoundationsProfile({ namespace: "" }), /non-empty namespace/);
  assert.throws(() => renderWritingFoundationsProfile({ namespace: "unsafe namespace" }), /unsupported characters/);
  const custom = renderWritingFoundationsProfile({ namespace: "wf-safe", evidenceBankRoute: "learner-evidence" });
  const $ = cheerio.load(custom.pages.find((page) => page.id === "sentence-lab")?.html ?? "");
  assert.equal($("a[href='#learner-evidence'][data-page-target='learner-evidence']").length, 1);
});
