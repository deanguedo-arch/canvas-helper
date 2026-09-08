import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { load } from "cheerio";
import { CONCEPT_REVIEWS, FINDINGS, GAP_REVIEW_GROUPS, ITEM_REVIEWS, LINK_JUDGMENTS, MEDIA_REVIEWS, REVIEW_DATE, REVIEWED_WORKSPACE_SHA } from "./lib/biology30-unit-a-pilot-2/remaining-academic-review.js";

const project = "projects/biology30-unit-a-pilot-2";
const reportPath = `${project}/meta/remaining-academic-review.json`;
const reviewSource = "scripts/lib/biology30-unit-a-pilot-2/remaining-academic-review.ts";
const prefix = "biology30-unit-a-pilot-2:practice:";
const digest = (text: string | Buffer) => createHash("sha256").update(text).digest("hex");
const clean = (text: string) => text.replace(/\s+/g, " ").trim();
const pad = (n: number) => String(n).padStart(2, "0");
const md = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
const reviewedInputPaths = [
  "scripts/review-biology30-unit-a-pilot-2-academic.ts",
  "scripts/lib/biology30-unit-a-pilot-2/review-academic-source-evidence.py",
  `${project}/meta/final-academic-review.json`,
  `${project}/meta/curriculum-performance-map.json`,
  `${project}/meta/reading-level-report.json`,
];

export function reviewRemainingGaps(gaps: Array<{ id: string; [key: string]: unknown }>) {
  const authoredIds = GAP_REVIEW_GROUPS.flatMap((group) => group.ids);
  assert.equal(new Set(authoredIds).size, authoredIds.length, "Duplicate authored gap disposition");
  assert.deepEqual([...authoredIds].sort(), gaps.map((g) => g.id).sort(), "Every open gap needs a current authored judgment");
  return gaps.map((gap) => {
    const group = GAP_REVIEW_GROUPS.find((entry) => entry.ids.includes(gap.id))!;
    return { ...gap, disposition: group.status, reviewedJudgment: group.judgment, findingIds: group.findingIds, teacherDecision: null };
  });
}

export function reviewRenderedAcademicContent(html: string) {
  assert.equal(digest(html), REVIEWED_WORKSPACE_SHA, "Review judgments belong to another learner build; repeat the affected review.");
  const $ = load(html);
  assert.equal(ITEM_REVIEWS.length, 86);
  assert.equal(new Set(ITEM_REVIEWS.map(([id]) => id)).size, 86);
  assert.equal(Object.keys(MEDIA_REVIEWS).length, 14);
  const practices = ITEM_REVIEWS.map(([suffix, expectedKey, conceptId, cognitiveDemand, itemNote]) => {
    const concept = CONCEPT_REVIEWS[conceptId];
    assert.ok(concept, `Unknown concept ${conceptId}`);
    const id = prefix + suffix;
    const node = $(`[data-practice-id="${id}"]`);
    assert.equal(node.length, 1, `Missing practice ${id}`);
    const feedback = node.find("[data-practice-feedback]");
    assert.equal(feedback.attr("data-answer"), expectedKey, `Key differs from reviewer judgment: ${id}`);
    const teachSelector = `#lesson-${pad(concept.lesson)} [data-core-zone="lesson-${pad(concept.lesson)}-part-${concept.part}"]`;
    assert.equal($(teachSelector).length, 1, `Teaching target missing: ${teachSelector}`);
    const link = feedback.find("[data-open-textbook]");
    assert.equal(link.length, 1);
    const printedPage = Number(link.attr("data-printed-page"));
    const physicalPage = Number(link.attr("data-pdf-page"));
    const chapter = Number(link.attr("data-open-textbook")?.match(/(11|12|13)/)?.[1]);
    const locatorValid = chapter === concept.textbookChapter && physicalPage >= 1 && physicalPage <= { 11: 44, 12: 30, 13: 38 }[chapter as 11 | 12 | 13];
    const pageJudgment = LINK_JUDGMENTS[`${conceptId}:${printedPage}`] ?? (concept.preferredPages.includes(printedPage)
      ? { status: concept.sourceCaution ? "supported-with-qualification" : "direct-support", reason: concept.sourceCaution ?? "The linked page supports this question's concept." }
      : null);
    assert.ok(pageJudgment, `No manual page judgment for ${conceptId}:${printedPage} (${id})`);
    const options = node.find(".choice-row").map((_, el) => ({ value: $(el).find("input").attr("value")!, text: clean($(el).find("span").text()) })).get();
    const generic = (feedback.attr("data-feedback") ?? "").includes("conflicts with the required structure");
    return {
      id, routeId: node.closest(".course-page").attr("id"), prompt: clean(node.find("h3").text()), choices: options,
      displayedKeyPosition: options.findIndex((row) => row.value === expectedKey) + 1,
      answerKey: expectedKey, keyReview: "no-key-change-recommended", keyReason: concept.keyReason,
      rationale: feedback.attr("data-rationale"), outcomeIds: [concept.outcome], cognitiveDemand,
      teaching: { selector: teachSelector, sha256: digest($.html($(teachSelector))), prerequisiteTerms: concept.prerequisiteTerms, review: "core-key-concept-taught-before-practice; see item notes for distractor and extension concerns" },
      feedbackReview: generic ? "revise-generic-feedback" : "item-specific-feedback-present",
      optionReview: itemNote ?? "Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance.",
      textbook: { chapter, printedPage, physicalPage, locatorValid, ...pageJudgment, locatorFinding: locatorValid ? "in-range-correct-chapter; content relevance judged separately" : "wrong-chapter-and-invalid-physical-page", recommendedChapter: concept.textbookChapter, recommendedPages: concept.preferredPages.map((p) => ({ printedPage: p, physicalPage: p - { 11: 359, 12: 403, 13: 433 }[concept.textbookChapter as 11 | 12 | 13] })) },
      itemSha256: digest($.html(node)), optional: node.attr("data-required") === "false", teacherDecision: null,
    };
  });
  assert.equal($("[data-practice-id]").length, practices.length, "Unreviewed rendered question");
  const media = $("[data-media-checkpoint-id]").map((_, el) => {
    const node = $(el), id = node.attr("data-video-entry")!;
    const judgment = MEDIA_REVIEWS[id];
    assert.ok(judgment, `Unreviewed media ${id}`);
    const local = node.find("[data-local-equivalent]");
    const text = clean(load((local.html() ?? "").replace(/(<\/[^>]+>)/g, "$1 ")).text());
    return { youtubeId: id, lessonId: node.closest(".lesson-page").attr("id"), checkpointId: node.attr("data-media-checkpoint-id"),
      checkpointPrompt: clean(node.find(".media-checkpoint legend").text()), checkpointKey: node.find("[data-media-check-feedback]").attr("data-answer"),
      localWords: text.split(/\s+/).length, localVisualCount: local.find("img,svg,canvas,table,video").length,
      localStepCount: local.find("ol>li").length, localSha256: digest($.html(local)),
      localCheckpointSupport: "reviewed-supports-key", illustratedParity: "changes-required", ...judgment,
      transcriptReview: judgment.transcript?.status ?? "not-completed-caption-text-unavailable", teacherDecision: null };
  }).get();
  assert.equal(media.length, 14);
  return { practices, media };
}

export async function academicReviewSourceDirectory() {
  const current = await readFile(`${project}/workspace/index.html`, "utf8");
  return digest(current) === REVIEWED_WORKSPACE_SHA ? project : `${project}/raw/academic-correction-baselines/${REVIEWED_WORKSPACE_SHA}`;
}

export async function checkAcademicReviewFreshness() {
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  const sourceDirectory = await academicReviewSourceDirectory();
  const historical = sourceDirectory !== project;
  if (historical) assert.equal(await readFile(`${sourceDirectory}/meta/remaining-academic-review.json`, "utf8"), await readFile(reportPath, "utf8"), "Historical review was changed after the correction baseline was saved");
  const html = await readFile(`${sourceDirectory}/workspace/index.html`, "utf8");
  const current = reviewRenderedAcademicContent(html);
  assert.equal(report.workspaceSha256, digest(html));
  assert.equal(report.reviewSourceSha256, digest(await readFile(reviewSource)));
  assert.deepEqual(report.practices, current.practices);
  for (const row of current.media) {
    const persisted = report.media.find((entry: any) => entry.youtubeId === row.youtubeId);
    assert.ok(persisted);
    for (const [key, value] of Object.entries(row)) assert.deepEqual(persisted[key], value);
  }
  for (const file of report.localSources) assert.equal(digest(await readFile(file.path)), file.sha256, `Source drift: ${file.path}`);
  assert.deepEqual(report.reviewedInputs.map((file: { path: string }) => file.path), reviewedInputPaths);
  for (const file of report.reviewedInputs) {
    const sourcePath = historical && file.path.startsWith(`${project}/meta/`) ? file.path.replace(project, sourceDirectory) : file.path;
    // The checker itself has gained historical-baseline support. Its recorded old hash
    // remains evidence, not a claim that today's checker is the previous implementation.
    if (historical && file.path === "scripts/review-biology30-unit-a-pilot-2-academic.ts") continue;
    assert.equal(digest(await readFile(sourcePath)), file.sha256, `Review input drift: ${sourcePath}`);
  }
  assert.deepEqual(report.gapReview, reviewRemainingGaps(JSON.parse(await readFile(`${sourceDirectory}/meta/final-academic-review.json`, "utf8")).gaps));
  assert.equal(report.teacherDecision, null);
  assert.equal(report.transferReady, false);
  assert.deepEqual(report.findings, FINDINGS);
  return report;
}

async function generate(evidencePath: string) {
  const html = await readFile(`${project}/workspace/index.html`, "utf8");
  const current = reviewRenderedAcademicContent(html);
  const evidence = JSON.parse(await readFile(evidencePath, "utf8"));
  assert.equal(evidence.workspaceSha256, digest(html));
  const priorAudit = JSON.parse(await readFile(`${project}/meta/final-academic-review.json`, "utf8"));
  const standards = JSON.parse(await readFile(`${project}/meta/curriculum-performance-map.json`, "utf8"));
  const reading = JSON.parse(await readFile(`${project}/meta/reading-level-report.json`, "utf8"));
  const gapReview = reviewRemainingGaps(priorAudit.gaps);
  const reviewedInputs = await Promise.all(reviewedInputPaths.map(async (path) => ({ path, sha256: digest(await readFile(path)) })));
  const media = current.media.map((row) => {
    const acquisition = evidence.videos.find((v: any) => v.youtubeId === row.youtubeId);
    assert.ok(acquisition, `Missing source acquisition ${row.youtubeId}`);
    const { captionText: _privateReviewText, ...publicEvidence } = acquisition;
    publicEvidence.captionTracks = publicEvidence.captionTracks.filter((track: any) => track.language.startsWith("en"));
    return { ...row, acquisition: publicEvidence };
  });
  const localSources = [];
  for (const source of evidence.textbooks) {
    assert.equal(digest(await readFile(source.path)), source.sha256);
    localSources.push({ path: source.path, sha256: source.sha256, pages: source.pages.length });
  }
  const keyPositions = current.practices.reduce((totals, row) => { totals[row.displayedKeyPosition] = (totals[row.displayedKeyPosition] ?? 0) + 1; return totals; }, {} as Record<number, number>);
  const wrongPageCount = current.practices.filter((row) => row.textbook.status === "wrong-teaching-page").length;
  const excellent = ["A1.3k-04", "A2.3k-02", "A2.3k-03", "A2.5k-02", "A2.6k-04"];
  const sourceLevels = standards.performanceBehaviours.map((row: any) => ({ id: row.id, sourcePage: row.authorityPdfPage, storedStandard: row.standard,
    reviewedSourceLevel: excellent.includes(row.id) ? "standard-of-excellence-example" : row.id === "A1.4s-01" ? "local-outcome-derived-criterion" : "acceptable-standard-example",
    mandatoryStatus: "Interpret the Program of Studies outcome separately; performance examples are neither exhaustive nor prescriptive." }));
  assert.equal(sourceLevels.length, 53);
  assert.ok(sourceLevels.every((row: { sourcePage: number }) => Number.isInteger(row.sourcePage)));
  const report = {
    schemaVersion: 1, project: "biology30-unit-a-pilot-2", reviewDate: REVIEW_DATE, workspaceSha256: digest(html), reviewSourceSha256: digest(await readFile(reviewSource)),
    scope: "Academic review only. No learner file, question, response, completion rule, export or deployment changed. This supplements the earlier generated audit's pending item/media observations on this exact build.",
    status: "review-findings-recorded-not-academically-cleared", teacherDecision: null, transferReady: false,
    reviewedBy: "Codex source-grounded review; not independent teacher acceptance, student performance or live LMS certification",
    counts: { practiceItems: current.practices.length, keyChangesRecommended: 0, genericFeedbackItems: current.practices.filter((p) => p.feedbackReview === "revise-generic-feedback").length, wrongTeachingPageItems: wrongPageCount, wrongChapterAndInvalidPageItems: current.practices.filter((p) => !p.textbook.locatorValid).length, keyPositions,
      mediaCheckpoints: media.length, textOnlyLocalEquivalents: media.filter((m) => m.localVisualCount === 0).length, publisherTranscriptsReviewed: media.filter((m) => m.transcript).length,
      transcriptsStillUnreviewed: media.filter((m) => !m.transcript).length, fullVideoSeconds: media.reduce((s, m) => s + m.acquisition.durationSeconds, 0), priorOverlappingGapRecords: priorAudit.gaps.length,
      officialAcceptableExamplesInStoredInventory: sourceLevels.filter((r: any) => r.reviewedSourceLevel === "acceptable-standard-example").length, excellenceExamplesMisclassified: excellent.length, locallyAuthoredCriteria: 1 },
    authority: { checkedAt: REVIEW_DATE, curriculum: "https://education.alberta.ca/media/159727/bio203007.pdf", curriculumPages: [52, 53, 54, 55], standards: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf", standardsPhysicalPagesInspected: [6, 7, 8, 9, 10], support: "https://www.alberta.ca/writing-diploma-exams", bulletin: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology-30-info-bulletin.pdf", bulletinEditionObserved: "2025–2026", note: "Keep rechecking the Biology-specific bulletin. Newer generic exam announcements do not establish a newer Biology bulletin or alter this blocked course's release status." },
    factualQualificationSources: ["https://openstax.org/books/anatomy-and-physiology-2e/pages/12-5-communication-between-neurons", "https://openstax.org/books/anatomy-and-physiology-2e/pages/17-2-hormones"],
    localSources, reviewedInputs, findings: FINDINGS, practices: current.practices, media, sourceLevels,
    readingReview: { rows: reading.revisionGateBCoreLessons, finding: "The core is materially more accessible and descriptive than the original high-level draft. Repeated local explanations and accurate caveats are strengths. Numerical readability is not a comprehension or academic-completeness test." },
    gapReview,
    pendingDecisions: ["Teacher confirms online/supervised/mixed practical delivery and safe alternatives.", "Obtain or access the remaining 13 actual transcripts/captions; review segment content and pace, not only metadata.", "Approve corrective course work, then perform a fresh exact-build academic and visual review.", "Observe representative students and timed routes before full teacher acceptance or B–D transfer."],
    preservation: { learnerChanged: false, stateSchema: 6, worstCaseEstimateCharacters: 42284, targetCharacters: 44000, headroom: 1716, requiredMinutes: 1505, optionalMinutes: 295, requiredRoutes: 18, advancedBlocks: 40, processRegistryParents: 178 },
  };
  const lines = [
    "# Unit A Pilot 2 — Remaining Academic Review", "", `Review date: ${REVIEW_DATE}. Learner SHA: \`${report.workspaceSha256}\`.`, "",
    "The readable teaching direction is sound, but Unit A is not ready for academic sign-off or automatic B–D transfer. This was a review-only pass: the learner course, saved-state contract and previous visual build are unchanged.", "",
    "## What was actually checked", "",
    `- All 86 practice prompts, keys, choices and rationales against their exact local teaching; no key change is recommended. This is not a claim that all 86 are well-designed assessments.`,
    `- Actual textbook folios and relevant passages: 12 Final Practice links point to Chapter 13 with negative PDF pages. Separately, ${wrongPageCount} printed-page selections target unrelated teaching content (overlapping findings, not additive counts). Other links provide only background; see every item below.`,
    "- All 14 local media paths and their checkpoints. All are four-step text summaries, not the illustrated alternatives promised in the plan.",
    "- Public metadata for all 14 videos: titles, providers, durations, reported embedding and English tracks. This is not playback or transcript proof. Full clips total 102 min 11 sec.",
    "- One complete publisher transcript (NIH brain video), with qualifications required. Thirteen transcript reviews remain unfinished: direct YouTube timed-text responses were empty, and title/summary pages are not transcripts.",
    "- Official standards pages were rendered and opened to check the two columns; 47 stored rows match acceptable examples, five match excellence examples, and one is a locally authored skills criterion.",
    "- Remaining outcome/evidence records, all 13 core lesson explanations, their readability report, and the saved-state headroom.", "",
    "## Findings and exact repair criteria", "",
    ...FINDINGS.flatMap((f) => [`### ${f.id} — ${f.title}`, "", `Priority: ${f.priority}. Scope: ${f.scope}.`, "", f.finding, "", `Next change: ${f.remedy}`, "", `Acceptance: ${f.acceptance}`, "", `Owner: [${f.owner.split("/").pop()}](../../../${f.owner})`, ""]),
    "## Question-by-question review", "", "R = recognition/understanding; A = qualitative application; H = multi-step interpretation. These are reviewer judgments, not measured item difficulty or provincial certifications. Every row retains its key; the linked JSON includes prompt, all choices, exact teaching selector/hash, prerequisites and page recommendations.", "",
    "| Item | Key / demand | Textbook review | Recommendation |", "| --- | --- | --- | --- |",
    ...current.practices.map((p) => `| ${p.id.slice(prefix.length)} | ${p.answerKey} / ${p.cognitiveDemand} | ${p.textbook.locatorValid ? "" : `INVALID Chapter ${p.textbook.chapter}/PDF ${p.textbook.physicalPage}; `}p.${p.textbook.printedPage}: ${p.textbook.status} | ${md(p.optionReview)} Preferred support: Chapter ${p.textbook.recommendedChapter}, ${p.textbook.recommendedPages.map((r) => `p.${r.printedPage} (PDF ${r.physicalPage})`).join(", ")}. |`), "",
    "## Video and local-path review", "", "English-track metadata does not prove caption accuracy, pace or scientific suitability. Automatic/generated English tracks need especially careful term checking. No YouTube audio/video file was downloaded or redistributed.", "",
    "| Lesson / video | Full duration | Local objective review | Transcript status |", "| --- | --- | --- | --- |",
    ...media.map((m) => `| ${m.lessonId} / [${m.youtubeId}](https://www.youtube.com/watch?v=${m.youtubeId}) | ${Math.floor(m.acquisition.durationSeconds / 60)}:${pad(m.acquisition.durationSeconds % 60)} | ${md(m.localFinding)} | ${m.transcript ? `[Publisher text reviewed](${m.transcript.url}) — ${md(m.transcript.finding)}` : "Not completed; caption endpoint returned no text. Do not mark passed."} |`), "",
    "## Every remaining structural gap", "", "These judgments supersede the earlier gap reasons only where explicitly corrected below. The original records remain intact. An outcome roll-up and its detailed example are not separate activities to add.", "",
    "| Gap record(s) | Reviewed disposition | Evidence and next operation |", "| --- | --- | --- |",
    ...GAP_REVIEW_GROUPS.map((group) => `| ${group.ids.join("; ")} | ${group.status} | ${md(group.judgment)} (${group.findingIds.join(", ")}) |`), "",
    "## Sources, limits and continuation", "",
    "Required content comes from the [Program of Studies](https://education.alberta.ca/media/159727/bio203007.pdf). The [performance examples](https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf) are illustrative and must retain their source column. Independent action-potential graph construction appears in the excellence column; that does not remove the broader core data-analysis outcome or the teacher's request for graph work.", "",
    "The [Biology bulletin linked by Alberta](https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology-30-info-bulletin.pdf) still identifies itself as 2025–2026. Recheck through the [official support page](https://www.alberta.ca/writing-diploma-exams) before release.", "",
    "The book is not infallible. Its p.440 thyroxine classification and simplified pump/autonomic descriptions must not override corrected science. Use the local correction and primary textbook explanations such as [OpenStax synaptic communication](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-5-communication-between-neurons) and [hormone mechanisms](https://openstax.org/books/anatomy-and-physiology-2e/pages/17-2-hormones).", "",
    "The previous 36 gap records overlap. They are retained, not all promoted to mandatory lab requirements or dismissed because a few rows were misclassified. Distinguish missing teaching, missing response opportunities, actual practical performance, optional depth and teacher decisions.", "",
    "State has only 1,716 characters of ordinary-text estimator headroom. Do not add a large set of response fields, truncate prior writing, or raise limits as an academic repair shortcut. Escaping/non-ASCII cases and the last-valid-state guard still require appropriate engineering review before new state is introduced.", "",
    "No new visual/E2E run is needed for these report-only changes; the previously inspected learner hash is unchanged. This does not certify live Brightspace, full-clip pacing, student comprehension or teacher acceptance.", "",
    "Machine record: [remaining-academic-review.json](./remaining-academic-review.json). Earlier evidence inventory: [final-academic-review.json](./final-academic-review.json). Reproduction and future B–D precautions: [canonical playbook](../../biology30-unit-a-pilot/meta/unit-a-to-bcd-improvement-playbook.md).", "",
    "Freshness check: `npx tsx scripts/review-biology30-unit-a-pilot-2-academic.ts --check`. A learner or reviewed-source change invalidates these exact-build judgments.", "",
  ];
  await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
  await writeFile(`${project}/meta/remaining-academic-review.md`, lines.join("\n"));
  console.log(JSON.stringify(report.counts, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--check") { await checkAcademicReviewFreshness(); console.log(`Academic review verified against ${await academicReviewSourceDirectory()}; this is not clearance of a newer correction candidate.`); }
  else if (args.length === 2 && args[0] === "--evidence") await generate(args[1]);
  else throw new Error("Use --check or --evidence <scratch/source-evidence.json>. No learner build or deployment is performed.");
}
