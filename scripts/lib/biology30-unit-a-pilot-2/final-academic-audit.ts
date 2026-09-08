import { createHash } from "node:crypto";
import { load } from "cheerio";
import type { Pilot2AtomicContractV1 } from "./atomic-contract.js";
import { videoReviewFor } from "./online-video-review.js";
import { PRACTICE_ACADEMIC_REVIEW, FINAL_PRACTICE_TOPIC_REVIEW } from "./practice-academic-review.js";

export const FINAL_ACADEMIC_BASELINE = "219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc";
export const FINAL_ACADEMIC_CHECKPOINT = "2ad72ec06b104c589f91e4b5afb8d86c322bc168";

export function buildFinalAcademicAudit(html: string, atomic: Pilot2AtomicContractV1, generatedAt: string) {
  const $ = load(html);
  const firstUseLinks = $("[data-lesson-term]").map((_index, element) => {
    const row = $(element);
    const control = row.find("[data-open-first-use]");
    const targetId = control.attr("data-open-first-use")!;
    if ($(`[id="${targetId}"]`).length !== 1) throw new Error(`First-use target does not resolve: ${targetId}`);
    return { lessonId: row.closest(".lesson-page").attr("id"), term: row.attr("data-lesson-term"), targetId, linkType: control.text() === "First use" ? "course-use" : "definition-only" };
  }).get();
  const practice = $("[data-practice-id]").map((_index, element) => {
    const node = $(element);
    const id = node.attr("data-practice-id")!;
    const components = atomic.components.filter((entry) => entry.practiceItemIds.includes(id));
    const review = PRACTICE_ACADEMIC_REVIEW[id.split(":practice:")[1]];
    if (!review || !atomic.components.some((entry) => entry.performanceBehaviourIds.includes(review[0]))) throw new Error(`Missing authored item-level review: ${id}`);
    const feedback = node.find("[data-practice-feedback]");
    const textbook = feedback.find("[data-open-textbook]");
    const choices = node.find(".choice-row").map((_choiceIndex, choice) => ({ id: $(choice).find("input").attr("value"), text: $(choice).find("span").text() })).get();
    const answerKey = feedback.attr("data-answer")!;
    const misconceptionFeedback = JSON.parse(feedback.attr("data-feedback") ?? "{}");
    if (!choices.some((choice) => choice.id === answerKey) || !feedback.attr("data-rationale") || choices.some((choice) => choice.id !== answerKey && !misconceptionFeedback[choice.id!]) || textbook.length !== 1) throw new Error(`Practice structure is incomplete: ${id}`);
    return { id, routeId: node.closest(".course-page").attr("id"), prompt: node.find("h3").text(), choices, answerKey, rationale: feedback.attr("data-rationale"), misconceptionFeedback, textbook: { documentId: textbook.attr("data-open-textbook"), printedPage: Number(textbook.attr("data-printed-page")), physicalPage: Number(textbook.attr("data-pdf-page")) }, focusTargetId: node.find("h3").attr("id"), renderedItemSha256: createHash("sha256").update($.html(element)).digest("hex"), outcomeIds: [review[0].split("-")[0]], performanceBehaviourIds: [review[0]], alignment: { scope: "supporting-concept-not-complete-behaviour-demonstration", operation: review[2], cognitiveDemand: review[1], source: "meta/curriculum-performance-map.json", fullSkillEvidence: "See the separate authored task bindings in the atomic map; no recognition-to-labelling fallback", existingAtomicBindings: components.map((entry) => entry.id) }, optional: node.attr("data-required") === "false", structuralReview: "passed", semanticReview: "source-reviewed-preserved-meaning-and-feedback" };
  }).get();
  const media = $("[data-media-checkpoint-id]").map((_index, element) => {
    const node = $(element);
    const reviewed=videoReviewFor(node.attr("data-video-entry")!);
    if(!reviewed||node.find(".walkthrough-panel figure").length!==3)throw new Error("A required media step lacks its reviewed transcript or three local visual panels.");
    return { id: node.attr("data-media-checkpoint-id"), lessonId: node.closest(".lesson-page").attr("id"), transcriptReview: "full-caption-text-reviewed-focused-excerpt-selected", durationAndPaceReview: "selected-excerpt-and-full-source-duration-recorded; learner pace not observed", localEquivalentAcademicParity: "three-visual-objective-map-and-worked-case-in-online-finalization.json", transcriptSha256:reviewed.sha256,checkpointExists: true };
  }).get();
  const gaps = atomic.components.filter((entry) => entry.remainingGap).map((entry) => ({ id: entry.id, tier: entry.tier, sourceStandard: entry.sourceStandard ?? "curriculum-outcome", outcomeIds: entry.outcomeIds, behaviourIds: entry.performanceBehaviourIds, reason: entry.remainingGap, evidence: [...entry.practiceItemIds, ...entry.taskSelectors] }));
  return {
    schemaVersion: 1,
    project: "biology30-unit-a-pilot-2",
    generatedAt,
    workspaceSha256: atomic.workspaceSha256,
    baselineWorkspaceSha256: FINAL_ACADEMIC_BASELINE,
    checkpointCommit: FINAL_ACADEMIC_CHECKPOINT,
    status: gaps.length?"academic-gaps-open":"awaiting-complete-teacher-review",
    teacherDecision: null,
    transferReady: false,
    scope: "Full authored evidence mapping and online adaptation. Item meanings retain their preserved source review; fourteen transcripts and local paths are reviewed separately in online-finalization.json. This is not teacher acceptance, observed student mastery, physical laboratory certification or LMS certification.",
    counts: { outcomeRecords: 25, behaviourRecords: 53, acceptableExamples: 47, excellenceExamples: 5, localCriteria: 1, gapRecords: gaps.length, requiredGapRecords: gaps.filter((entry) => entry.tier === "required-core").length, optionalGapRecords: gaps.filter((entry) => entry.tier === "advanced").length, firstUseLinks: firstUseLinks.length, practiceItems: practice.length, mediaCheckpoints: media.length },
    corrections: ["Removed unrelated-route and first-question evidence fallbacks.", "Graph behaviour points to the actual Lesson 2 graph item plus a saved lettered-graph, interval and voltage-change response; independent graph drawing is a distinct excellence example, while the online investigations now supply required data-analysis evidence.", "Six Chapter 11 study tasks now collect neuron, reflex, graph, membrane-transport, grey/white-matter and brain reasoning inside existing model records.", "The action-potential figure uses numeric time and voltage scales; approximate refractory shading begins with the upstroke and is explained through channel recovery.", "Collaboration is no longer mapped to a rods question.", "Lesson 1 introduces CNS, PNS, action potential, threshold, receptor and effector before mechanism prose uses them.", "First-use controls now target exact static passages; terms absent from core prose explicitly link to their definition.", "Rebuilds preserve later dated journal entries instead of truncating history."],
    gaps,
    firstUseLinks,
    practice,
    finalPracticeTopicReview: FINAL_PRACTICE_TOPIC_REVIEW,
    media,
    evidencePolicy: { staticPassMeans: "References resolve and contracts are internally consistent, not that every academic requirement is complete.", releaseRequires: ["close every behaviour/outcome gap", "item-by-item answer and prerequisite review", "transcript and local-equivalent parity review", "planning time-on-task audit, with actual learner pace explicitly unobserved", "fresh complete exact-build visual and interaction review", "explicit teacher acceptance of the complete build"] },
    authorityCheck: { checkedAt: "2026-09-05", supportPage: "https://www.alberta.ca/writing-diploma-exams", bulletinUrl: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology-30-info-bulletin.pdf", bulletinEditionObserved: "2025–2026", note: "The support-page Biology link still resolved to the 2025–2026 bulletin when checked. Recheck before final release; do not infer a 2026–2027 edition exists.", curriculumUrl: "https://education.alberta.ca/media/159727/bio203007.pdf", performanceStandardsUrl: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf" }
  };
}

export function assertAcademicReleaseReady(audit: ReturnType<typeof buildFinalAcademicAudit>) {
  if (!audit.transferReady || audit.gaps.length || !audit.teacherDecision) throw new Error("Academic release blocked: unresolved evidence gaps or missing exact-build teacher acceptance.");
}
