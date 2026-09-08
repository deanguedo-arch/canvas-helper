import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { academicReviewSourceDirectory, checkAcademicReviewFreshness, reviewRemainingGaps, reviewRenderedAcademicContent } from "../review-biology30-unit-a-pilot-2-academic.js";
import { REVIEWED_WORKSPACE_SHA } from "../lib/biology30-unit-a-pilot-2/remaining-academic-review.js";

const project = "projects/biology30-unit-a-pilot-2";
const sourceDirectory = await academicReviewSourceDirectory();
const html = await readFile(`${sourceDirectory}/workspace/index.html`, "utf8");
const report = JSON.parse(await readFile(`${project}/meta/remaining-academic-review.json`, "utf8"));
const rendered = reviewRenderedAcademicContent(html);

test("academic review binds every question and local media path to the exact unchanged build", async () => {
  const current = await checkAcademicReviewFreshness();
  assert.equal(current.workspaceSha256, REVIEWED_WORKSPACE_SHA);
  assert.equal(rendered.practices.length, 86);
  assert.equal(rendered.media.length, 14);
  assert.ok(rendered.practices.every((row) => row.outcomeIds.length && row.teaching.sha256 && row.keyReason && row.choices.length));
  assert.throws(() => reviewRenderedAcademicContent(`${html}\n`), /another learner build/);
});

test("review records actual incorrect locators instead of certifying arithmetic or button presence", () => {
  const invalid = rendered.practices.filter((row) => !row.textbook.locatorValid);
  assert.equal(invalid.length, 12);
  assert.ok(invalid.every((row) => row.id.includes("final-practice") && row.textbook.chapter === 13 && row.textbook.physicalPage < 0));
  assert.equal(rendered.practices.filter((row) => row.textbook.status === "wrong-teaching-page").length, 22);
  const adh = rendered.practices.find((row) => row.id.endsWith("lesson-11-guided-01"))!;
  assert.equal(adh.textbook.printedPage, 446);
  assert.ok(adh.textbook.recommendedPages.some((page) => page.printedPage === 441 && page.physicalPage === 8));
  for (const row of rendered.practices) {
    const max = ({ 11: 44, 12: 30, 13: 38 })[row.textbook.recommendedChapter as 11 | 12 | 13];
    assert.ok(row.textbook.recommendedPages.every((page) => page.physicalPage >= 1 && page.physicalPage <= max));
  }
});

test("answer-key correctness is distinct from weak feedback and key-position bias", () => {
  assert.equal(report.counts.keyChangesRecommended, 0);
  assert.deepEqual(report.counts.keyPositions, { 1: 62, 2: 21, 3: 3 });
  assert.equal(rendered.practices.filter((row) => row.feedbackReview === "revise-generic-feedback").length, 68);
  assert.ok(rendered.practices.filter((row) => row.id.includes("final-practice")).every((row) => row.displayedKeyPosition === 1));
  assert.ok(rendered.practices.every((row) => row.teacherDecision === null));
});

test("media review never treats empty caption responses or text boxes as verified illustrated parity", () => {
  assert.equal(report.media.length, 14);
  assert.ok(report.media.every((row: any) => row.localVisualCount === 0 && row.localStepCount === 4 && row.illustratedParity === "changes-required"));
  assert.ok(report.media.every((row: any) => row.acquisition.captionBytes === 0 && row.acquisition.playbackObserved === false));
  assert.equal(report.media.filter((row: any) => row.transcript).length, 1);
  assert.equal(report.media.find((row: any) => row.transcript).youtubeId, "0-8PvNOdByc");
  assert.equal(report.counts.transcriptsStillUnreviewed, 13);
  assert.equal(report.counts.fullVideoSeconds, 6131);
});

test("standards distinguish 47 acceptable examples, five excellence examples and one local criterion", () => {
  const rows = report.sourceLevels;
  assert.equal(rows.length, 53);
  assert.ok(rows.every((row: any) => Number.isInteger(row.sourcePage)));
  assert.equal(rows.filter((row: any) => row.reviewedSourceLevel === "acceptable-standard-example").length, 47);
  assert.deepEqual(rows.filter((row: any) => row.reviewedSourceLevel === "standard-of-excellence-example").map((row: any) => row.id), ["A1.3k-04", "A2.3k-02", "A2.3k-03", "A2.5k-02", "A2.6k-04"]);
  assert.equal(rows.find((row: any) => row.reviewedSourceLevel === "local-outcome-derived-criterion").id, "A1.4s-01");
});

test("every overlapping gap has an authored judgment; missing and unknown records fail closed", async () => {
  const { gaps } = JSON.parse(await readFile(`${sourceDirectory}/meta/final-academic-review.json`, "utf8"));
  assert.equal(report.gapReview.length, 36);
  assert.deepEqual(reviewRemainingGaps(gaps), report.gapReview);
  assert.throws(() => reviewRemainingGaps(gaps.slice(1)), /Every open gap/);
  assert.throws(() => reviewRemainingGaps([...gaps, { id: "unreviewed" }]), /Every open gap/);
  assert.equal(report.gapReview.find((row: any) => row.id === "behaviour-a1-3k-04").disposition, "excellence-example-reclassify");
  assert.equal(report.gapReview.find((row: any) => row.id === "behaviour-a1-4k-01").disposition, "core-evidence-repair");
});

test("report-only verification cannot become teacher acceptance or course-state changes", () => {
  assert.equal(report.teacherDecision, null);
  assert.equal(report.transferReady, false);
  assert.equal(report.status, "review-findings-recorded-not-academically-cleared");
  assert.equal(report.preservation.learnerChanged, false);
  assert.equal(report.preservation.stateSchema, 6);
  assert.equal(report.preservation.worstCaseEstimateCharacters, 42284);
  assert.equal(report.preservation.requiredRoutes, 18);
  assert.equal(report.preservation.requiredMinutes, 1505);
  assert.equal(report.preservation.optionalMinutes, 295);
});
