import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";
import { load } from "cheerio";
import { resolveAcademicEvidence } from "../lib/biology30-unit-a-pilot-2/atomic-contract.js";
import { BEHAVIOUR_EVIDENCE } from "../lib/biology30-unit-a-pilot-2/academic-evidence.js";
import { appendJournalEntry, replaceMarkdownSection } from "../lib/biology30-unit-a-pilot-2/review-history.js";
import { assertAcademicReleaseReady } from "../lib/biology30-unit-a-pilot-2/final-academic-audit.js";

const p1 = "projects/biology30-unit-a-pilot";
const p2 = "projects/biology30-unit-a-pilot-2";
const json = async (file: string) => JSON.parse(await readFile(file, "utf8"));

test("explicit academic targets reject unrelated questions and absent bindings", async () => {
  const $ = load(await readFile(`${p2}/workspace/index.html`, "utf8"));
  const graph = resolveAcademicEvidence($, "A1.1k-07", BEHAVIOUR_EVIDENCE["A1.1k-07"]);
  assert.deepEqual(graph.practiceItemIds, [], "A recognition question must not stand in for the new graph-labelling response");
  assert.equal(graph.taskSelectors.length, 1);
  const graphTask = $(graph.taskSelectors[0]);
  assert.equal(graphTask.attr("data-study-task"), "voltage-labels");
  assert.equal(graphTask.find("textarea").attr("data-response-id"), "biology30-unit-a-pilot-2:chapter-11-study:voltage-labels:v1");
  const collaboration = resolveAcademicEvidence($, "A1.4s-01", BEHAVIOUR_EVIDENCE["A1.4s-01"]);
  assert.deepEqual(collaboration.practiceItemIds, []);
  assert.match(collaboration.taskSelectors[0], /sensory-receptors/);
  assert.equal(collaboration.academicStatus, "mapped-awaiting-review");
  assert.match(collaboration.alignmentRationale, /independent|online|comparison/i);
  assert.throws(() => resolveAcademicEvidence($, "A1.1k-07", undefined), /Missing authored/);
  assert.throws(() => resolveAcademicEvidence($, "A1.1k-07", { practiceKeys: ["missing-graph"], taskSelectors: [], rationale: "No first-question fallback allowed" }), /Exact academic practice target is missing/);
});

test("first-use links resolve exact passages and Lesson 1 defines its early dependencies", async () => {
  const $ = load(await readFile(`${p2}/workspace/index.html`, "utf8"));
  $("[data-lesson-term]").each((_index, row) => {
    const control = $(row).find("[data-open-first-use]");
    const target = $(`[id="${control.attr("data-open-first-use")}"]`);
    assert.equal(target.length, 1);
    assert.equal(target.attr("tabindex"), "-1");
    assert.ok(control.text() === "First use" ? target.closest(".learn-block").length : target.is("dt"));
  });
  const opening = $('#lesson-01 [data-core-zone="lesson-01-part-1"]').text();
  for (const text of ["An action potential is", "threshold: the membrane voltage", "central nervous system (CNS) is the brain and spinal cord", "A receptor detects a change"]) assert.ok(opening.includes(text), text);
  assert.equal($('#lesson-01 [aria-labelledby="lesson-01-repeated-terms"]').length, 0);
});

test("rebuilding generated sections cannot erase later historical entries", () => {
  const original = "# Journal\n\n## Old cycle\n\nOriginal decision.\n\n## Generated current state\n\nOld hash.\n\n## Newer teacher feedback\n\nKeep this exactly.\n";
  const updated = replaceMarkdownSection(original, "## Generated current state", "## Generated current state\n\nNew hash.");
  assert.ok(updated.startsWith("# Journal\n\n## Old cycle\n\nOriginal decision."));
  assert.ok(updated.endsWith("## Newer teacher feedback\n\nKeep this exactly.\n"));
  assert.equal(replaceMarkdownSection(updated, "## Generated current state", "## Generated current state\n\nNew hash."), updated);
  assert.equal(appendJournalEntry(original, "## Old cycle", "Do not overwrite"), original);
});

test("transfer records cover both ledgers and never turn slice approval into complete-course acceptance", async () => {
  const [one, two, transfer, materials, audit, html, playbook] = await Promise.all([
    json(`${p1}/meta/improvement-ledger.json`), json(`${p2}/meta/pilot-2-improvement-ledger.json`),
    json(`${p1}/meta/biology30-improvement-transfer-contract.json`), json(`${p1}/meta/bcd-material-readiness.json`),
    json(`${p2}/meta/final-academic-review.json`), readFile(`${p2}/workspace/index.html`), readFile(`${p1}/meta/unit-a-to-bcd-improvement-playbook.md`, "utf8")
  ]);
  const sha = createHash("sha256").update(html).digest("hex");
  assert.equal(transfer.sourceWorkspaceSha256, sha);
  assert.equal(materials.sourceWorkspaceSha256, sha);
  assert.equal(audit.workspaceSha256, sha);
  assert.ok(playbook.includes(sha), "Playbook must name the current learner hash");
  assert.equal(transfer.rules.length, one.entries.length + two.rules.length);
  assert.equal(new Set(transfer.rules.map((rule: any) => rule.id)).size, transfer.rules.length);
  for (const rule of transfer.rules) {
    assert.ok(playbook.includes(rule.sourceRuleId), rule.sourceRuleId);
    for (const field of ["owner", "procedureLink", "recovery", "evidence"]) assert.ok(rule[field]);
    for (const field of ["inputs", "outputs", "checks"]) assert.ok(rule[field].length);
    for (const file of [rule.evidence, ...rule.implementationFiles, ...Object.values(rule.unitOwners), rule.procedureLink.split("#")[0]]) await access(file as string);
    assert.equal(rule.transferEligibility, "awaiting-complete-unit-a-acceptance");
    assert.deepEqual(Object.values(rule.unitReadiness), ["not-applied", "not-applied", "not-applied"]);
  }
  assert.equal(transfer.executionChoice, "full-unit-build-then-review");
  const chapter11 = transfer.rules.find((rule: any) => rule.sourceRuleId === "explicit-academic-evidence-without-route-fallbacks");
  assert.equal(chapter11.sourceIterations[0].workspaceSha256, sha);
  assert.equal(chapter11.sourceIterations[0].teacherDecision, null);
  assert.equal(chapter11.sourceIterations[0].status, "awaiting-explicit-user-review");
  assert.ok(chapter11.implementationFiles.includes("scripts/lib/biology30-unit-a-pilot-2/chapter-11-study.ts"));
  assert.equal(chapter11.academicReview.workspaceSha256, "21363490e611251c01101cee0bc5925583d1b856b8285a87ee74838ddd1341e5");
  assert.equal(chapter11.academicReview.teacherDecision, null);
  assert.equal(chapter11.academicReview.learnerChanged, false);
  assert.equal(chapter11.academicReview.status, "review-findings-recorded-not-academically-cleared");
  assert.ok(chapter11.implementationFiles.includes(`${p2}/meta/remaining-academic-review.json`));
  assert.equal(chapter11.academicCorrections.workspaceSha256, "f39669f01779f98a1c8d7d3ec5fe7e1524100d9d55f0b9286c01f4de5603e865");
  assert.equal(chapter11.academicCorrections.baselineWorkspaceSha256, chapter11.academicReview.workspaceSha256);
  assert.equal(chapter11.academicCorrections.teacherDecision, null);
  assert.equal(chapter11.academicCorrections.status, "awaiting-explicit-user-review");
  assert.ok(chapter11.implementationFiles.includes("scripts/lib/biology30-unit-a-pilot-2/practice-corrections.ts"));
  assert.equal(transfer.rules.find((rule: any) => rule.sourceRuleId === "exact-build-visual-contact-sheet-gate").procedure, "verification");
  assert.equal(transfer.rules.find((rule: any) => rule.sourceRuleId === "three-document-library-and-exact-page-links").procedure, "textbook");
  assert.deepEqual(materials.units.map((unit: any) => unit.unit), ["B", "C", "D"]);
  assert.ok(materials.units.every((unit: any) => !unit.readyForOnePassBuild && unit.presentNotes.length && unit.needBeforeBuild.length));
  assert.equal(materials.status, "sources-prepared-academic-contracts-incomplete");
  assert.equal(materials.availabilityOverlay.suppliedChecks.length, 15);
  assert.deepEqual(materials.availabilityOverlay.counts, { slides: 399, embeddedMediaFiles: 442, youtubeOccurrences: 82, distinctYoutubeIds: 80 });
  assert.ok(materials.units.every((unit: any) => unit.needBeforeBuild.find((entry: any) => entry.material === "Original editable PowerPoints").status.startsWith("supplied-preserved")));
  assert.equal(audit.practice.length, 86);
  assert.equal(audit.media.length, 14);
  assert.equal(audit.gaps.length, 0, "Prior recorded implementation gaps now have explicit online tasks; this is not teacher acceptance");
  const online = transfer.rules.find((rule: any) => rule.sourceRuleId === "complete-online-investigation-and-media-paths");
  assert.equal(online.sourceStatus, "awaiting-explicit-user-review");
  assert.ok(online.implementationFiles.includes("scripts/lib/biology30-unit-a-pilot-2/online-investigations.ts"));
  assert.deepEqual(audit.finalPracticeTopicReview.preservedCandidate, [6,3,7,2]);
  assert.deepEqual(audit.finalPracticeTopicReview.originallyPlanned, [6,4,6,2]);
  assert.ok(audit.practice.every((item: any) => item.performanceBehaviourIds.length && item.outcomeIds.length && item.alignment.scope === "supporting-concept-not-complete-behaviour-demonstration"));
  assert.throws(() => assertAcademicReleaseReady(audit), /Academic release blocked/);
  const verification = await json(`${p2}/meta/final-academic-verification.json`);
  assert.equal(verification.workspaceSha256, sha);
  assert.equal(verification.teacherDecision, null);
  assert.equal(verification.transferReady, false);
  const visualBytes = await readFile(verification.visual.report);
  assert.equal(createHash("sha256").update(visualBytes).digest("hex"), verification.visual.reportSha256);
  const visual = JSON.parse(visualBytes.toString("utf8"));
  assert.equal(visual.workspaceSha256, sha);
  assert.equal(visual.manualInspection.allContactSheetsOpened, true);
  assert.match(visual.manualInspection.scope, /not certify/);
});
