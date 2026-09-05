import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, appendFile, copyFile, mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { load as loadHtml } from "cheerio";
import pdf from "pdf-parse";

import {
  BIOLOGY30_PILOT_APPROVED_ASSETS,
  BIOLOGY30_PILOT_PRIMARY_SHA256,
  BIOLOGY30_PILOT_REFERENCE_SHA256,
  prepareBiology30UnitAPilotTextbook
} from "../lib/biology30-unit-a/pilot-textbook.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const projectDir = path.join(repoRoot, "projects/biology30-unit-a-pilot");
const workspacePath = path.join(projectDir, "workspace/index.html");
const rawPath = path.join(projectDir, "raw/index.html");
const contractPath = path.join(projectDir, "meta/textbook-integration.json");
const reportPath = path.join(projectDir, "meta/textbook-resource-report.json");
const ledgerPath = path.join(projectDir, "meta/improvement-ledger.json");
const playbookPath = path.join(projectDir, "meta/unit-a-to-bcd-improvement-playbook.md");
const imagePromptPath = path.join(projectDir, "meta/image-generation-prompts.md");
const generatedVisualPath = path.join(projectDir, "meta/generated-visual-integration.json");
const teacherFigureDecisionPath = path.join(projectDir, "meta/visual-comparison/teacher-decisions.json");
const comparisonManifestPath = path.join(projectDir, "meta/visual-comparison/manifest.json");
const projectMetadataPath = path.join(projectDir, "meta/project.json");
const reviewDeploymentPath = path.join(projectDir, "meta/review-deployment.json");

type LessonMapping = {
  lessonId: string;
  chapterId: string;
  location: string;
  printedPages: number[][];
  physicalPages?: number[][];
  physicalPagesByChapter?: Record<string, number[][]>;
  recommendedPractice: string;
  answerSourceIds: string[];
  supportLabel?: string;
};

type PracticeFeedbackMapping = {
  practiceId: string;
  chapterId: "chapter-11" | "chapter-12" | "chapter-13";
  printedPage: number;
  physicalPage: number;
  support: "direct" | "closest";
};

type IntegrationContract = {
  project: string;
  status: string;
  sourceArchives: Array<{ sourceId: string; sha256: string }>;
  resources: Array<Record<string, unknown>>;
  lessonMappings: LessonMapping[];
  practiceFeedbackMappings: PracticeFeedbackMapping[];
  reviewDestinations: Array<{ routeId: string; requiredForCompletion: boolean }>;
  finalIntegrationDestination: {
    routeId: string;
    title: string;
    navigationGroup: string;
    subgroupTitle: string;
    requiredForCompletion: boolean;
    completionBehavior: string;
  };
  correctionNotes: Array<{ id: string }>;
  learnerPolicy: Record<string, unknown>;
  exclusions: string[];
};

type ResourceReport = {
  learnerAssets: Array<{ id: string; outputPath: string; normalizedSha256: string; pageCount: number }>;
  authoringSources: Array<{ id: string }>;
  exclusions: string[];
  validation: Record<string, boolean>;
};

type ImprovementLedger = {
  projectSlug: string;
  currentWorkspaceSha256: string;
  status: string;
  visualInspection: {
    workspaceSha256: string;
    reportPath: string;
    reportSha256: string;
    contactSheetCount: number;
    allContactSheetsOpened: boolean;
    sourceVisualViewportCount: number;
    practiceFeedbackViewportCount: number;
    feedbackFigureViewportCount: number;
    geometryFindingCount: number;
    userAcceptance: string;
  };
  coreVocabularyVisualInspection: {
    workspaceSha256: string;
    workspaceTreeSha256: string;
    reportPath: string;
    reportSha256: string;
    contactSheetCount: number;
    allContactSheetsOpened: boolean;
    conceptEntryViewportCount: number;
    conceptStateViewportCount: number;
    wordLensViewportCount: number;
    zoomViewportCount: number;
    geometryFindingCount: number;
    blockedExternalRequestCount: number;
    blockedExternalRequestExplanation: string;
    teacherAcceptance: string;
  };
  entries: Array<{
    id: string;
    owner: string;
    reviewStatus: string;
    automatedTests: string[];
    manualCheck: string;
    applicabilityToUnitsBD: { status: string; adaptation: string };
  }>;
  rolloutPolicy: { status: string };
};

function digest(bytes: Buffer | string) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function exists(target: string) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function responseIds(html: string) {
  const $ = loadHtml(html);
  return $("[data-bio-response-id]")
    .map((_index, node) => $(node).attr("data-bio-response-id") ?? "")
    .get();
}

function inlineJsonConstant<T>(html: string, name: string): T {
  const marker = `const ${name} = `;
  const start = html.indexOf(marker);
  assert.notEqual(start, -1, `${name} must exist in the canonical workspace`);
  const valueStart = start + marker.length;
  const valueEnd = html.indexOf(";\n", valueStart);
  assert.notEqual(valueEnd, -1, `${name} must end with a semicolon`);
  return JSON.parse(html.slice(valueStart, valueEnd)) as T;
}

async function setupResourceFixture() {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-unit-a-textbook-"));
  const fixtureProject = path.join(fixtureRoot, "projects/biology30-unit-a-pilot");
  const fixtureSources = path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot/_sources");
  await Promise.all([
    mkdir(path.join(fixtureProject, "workspace/assets"), { recursive: true }),
    mkdir(path.join(fixtureProject, "meta"), { recursive: true }),
    mkdir(fixtureSources, { recursive: true })
  ]);
  await Promise.all([
    copyFile(workspacePath, path.join(fixtureProject, "workspace/index.html")),
    copyFile(path.join(projectDir, "meta/project.json"), path.join(fixtureProject, "meta/project.json")),
    copyFile(
      path.join(repoRoot, `projects/resources/biology30-unit-a-pilot/_sources/${BIOLOGY30_PILOT_PRIMARY_SHA256}.zip`),
      path.join(fixtureSources, `${BIOLOGY30_PILOT_PRIMARY_SHA256}.zip`)
    ),
    copyFile(
      path.join(repoRoot, `projects/resources/biology30-unit-a-pilot/_sources/${BIOLOGY30_PILOT_REFERENCE_SHA256}.zip`),
      path.join(fixtureSources, `${BIOLOGY30_PILOT_REFERENCE_SHA256}.zip`)
    )
  ]);
  return { fixtureRoot, fixtureProject, fixtureSources };
}

test("textbook integration contract is exact and complete", async () => {
  const contract = JSON.parse(await readFile(contractPath, "utf8")) as IntegrationContract;
  assert.equal(contract.project, "biology30-unit-a-pilot");
  assert.equal(contract.status, "blocked-preview-only");
  assert.deepEqual(contract.sourceArchives.map((source) => source.sha256), [BIOLOGY30_PILOT_PRIMARY_SHA256, BIOLOGY30_PILOT_REFERENCE_SHA256]);
  assert.equal(contract.lessonMappings.length, 16);
  assert.equal(new Set(contract.lessonMappings.map((mapping) => mapping.lessonId)).size, 16);
  assert.deepEqual(contract.lessonMappings.map((mapping) => mapping.lessonId), Array.from({ length: 16 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`));
  assert.equal(contract.reviewDestinations.length, 6);
  assert.deepEqual(contract.reviewDestinations.map((route) => route.routeId), [
    "review-overview",
    "chapter-11-review",
    "chapter-12-review",
    "chapter-13-review",
    "review-seminar",
    "textbook-unit-review"
  ]);
  assert.equal(contract.reviewDestinations.filter((route) => route.requiredForCompletion).length, 0);
  assert.deepEqual(contract.finalIntegrationDestination, {
    routeId: "lesson-17",
    title: "Integrated Regulation and Unit Mastery",
    navigationGroup: "lessons",
    subgroupTitle: "Integration and Mastery",
    requiredForCompletion: true,
    completionBehavior: "unchanged-existing-final-practice"
  });
  assert.equal(contract.learnerPolicy.libraryDocumentCount, 3);
  assert.equal(contract.learnerPolicy.lessonTextbookBandCount, 16);
  assert.equal(contract.learnerPolicy.practiceFeedbackTextbookLinkCount, 75);
  assert.equal(contract.learnerPolicy.attemptAffectsCompletion, false);
  assert.equal(contract.learnerPolicy.attemptAffectsScore, false);
  assert.equal(contract.learnerPolicy.secureAssessmentExposure, false);
  assert.ok(contract.correctionNotes.some((note) => note.id === "chapter-12-choice-range"));
  assert.ok(contract.correctionNotes.some((note) => note.id === "unit-review-page-range"));
  assert.ok(contract.correctionNotes.some((note) => note.id === "meninges-blood-brain-barrier"));
  assert.ok(contract.correctionNotes.some((note) => note.id === "myelin-cns-pns"));
  assert.ok(contract.correctionNotes.some((note) => note.id === "lesson-17-review-deduplication"));
  assert.ok(contract.correctionNotes.some((note) => note.id === "lesson-17-navigation-separation"));
  assert.ok(contract.exclusions.includes("Unit A test and test answers"));

  const expectedPracticeIds = [
    ...Array.from({ length: 17 }, (_value, lessonIndex) => Array.from(
      { length: 3 },
      (_itemValue, itemIndex) => `lesson-${String(lessonIndex + 1).padStart(2, "0")}-check-${itemIndex + 1}`
    )).flat(),
    ...Array.from({ length: 24 }, (_value, index) => `final-practice-${String(index + 1).padStart(2, "0")}`)
  ];
  assert.equal(contract.practiceFeedbackMappings.length, 75);
  assert.deepEqual(contract.practiceFeedbackMappings.map((mapping) => mapping.practiceId), expectedPracticeIds);
  assert.equal(new Set(contract.practiceFeedbackMappings.map((mapping) => mapping.practiceId)).size, 75);
  const pageOffsets = { "chapter-11": 359, "chapter-12": 403, "chapter-13": 433 } as const;
  for (const mapping of contract.practiceFeedbackMappings) {
    assert.equal(mapping.physicalPage, mapping.printedPage - pageOffsets[mapping.chapterId], mapping.practiceId);
    assert.ok(mapping.support === "direct" || mapping.support === "closest", mapping.practiceId);
    assert.doesNotMatch(mapping.practiceId, /^module-/, mapping.practiceId);
  }

  const resourceIds = new Set(contract.resources.map((resource) => String(resource.id)));
  assert.equal(resourceIds.size, BIOLOGY30_PILOT_APPROVED_ASSETS.length);
  for (const approved of BIOLOGY30_PILOT_APPROVED_ASSETS) {
    const resource = contract.resources.find((candidate) => candidate.id === approved.id);
    assert.ok(resource, approved.id);
    assert.equal(resource.sourceId, approved.sourceId, approved.id);
    assert.equal(resource.itemId, approved.itemId, approved.id);
    assert.equal(resource.archivePath, approved.archiveEntry, approved.id);
    assert.equal(resource.originalFilename, approved.originalFilename, approved.id);
    assert.equal(resource.sourceSha256 ?? resource.sha256, approved.expectedSha256, approved.id);
    assert.equal(resource.rightsStatus, approved.rightsStatus, approved.id);
    if (approved.outputPath) assert.equal(resource.outputPath, `projects/biology30-unit-a-pilot/${approved.outputPath}`, approved.id);
  }

  for (const mapping of contract.lessonMappings) {
    assert.ok(mapping.location.trim(), mapping.lessonId);
    assert.ok(mapping.printedPages.length, mapping.lessonId);
    assert.ok(mapping.recommendedPractice.trim(), mapping.lessonId);
    assert.ok(mapping.answerSourceIds.length, mapping.lessonId);
    for (const sourceId of mapping.answerSourceIds) assert.ok(resourceIds.has(sourceId), `${mapping.lessonId}:${sourceId}`);
  }
});

test("learner workspace exposes the chapter library, textbook bands, and student-facing reviews without secure assessment files", async () => {
  const [html, contractText] = await Promise.all([readFile(workspacePath, "utf8"), readFile(contractPath, "utf8")]);
  const contract = JSON.parse(contractText) as IntegrationContract;
  const $ = loadHtml(html);
  const inlinePracticeMap = inlineJsonConstant<Record<string, { documentId: string; printedPage: number; physicalPage: number; support: string }>>(html, "BIO_PRACTICE_TEXTBOOK");
  assert.deepEqual(
    inlinePracticeMap,
    Object.fromEntries(contract.practiceFeedbackMappings.map((mapping) => [mapping.practiceId, {
      documentId: mapping.chapterId,
      printedPage: mapping.printedPage,
      physicalPage: mapping.physicalPage,
      support: mapping.support
    }]))
  );
  assert.match(html, /data-practice-textbook-link/);
  assert.match(html, /Closest textbook support/);
  assert.match(html, /Find this in the textbook/);
  assert.match(html, /renderPracticeFeedback\(article, bioState\.practice\[id\], true\)/);
  assert.match(html, /renderPracticeFeedback\(article, choice\);/);

  assert.equal($(".course-page").length, 32);
  assert.equal($("[data-page-target='investigation-notebook'] .sidebar-label").text().trim(), "Process Collection");
  assert.equal($("#investigation-notebook h1").text().trim(), "Process Collection");
  assert.equal($("#investigation-notebook [data-exit-slip-list]").length, 1);
  assert.equal($("#investigation-notebook [data-exit-slip-count]").text().trim(), "0 of 17 saved");
  assert.equal($("#investigation-notebook [data-notebook-list]").length, 1);
  assert.equal($("#investigation-notebook [data-artifact-index]").length, 1);
  assert.match(html, /function exitSlipRecords\(\)/);
  assert.match(html, /data-collected-exit-slip/);
  assert.match(html, /renderExitSlips\(\)/);
  const learnerFacingText = $("body").clone().find("script, style").remove().end().text().replace(/\s+/g, " ");
  assert.doesNotMatch(learnerFacingText, /Investigation Notebook/i);
  assert.equal($("#library [data-library-doc-panel]").length, 3);
  assert.deepEqual(
    $("#library [data-library-doc-panel]").map((_index, node) => $(node).attr("data-library-doc-panel")).get(),
    ["chapter-11", "chapter-12", "chapter-13"]
  );
  assert.equal($("#library iframe[data-library-pdf-frame]").length, 3);
  assert.equal($("#library [data-library-reader-title][tabindex='-1']").length, 3);
  assert.equal($("#library [data-library-page-status][aria-live='polite']").length, 3);
  assert.equal($("#library [data-library-open-pdf][target='_blank']").length, 3);
  assert.equal($("#library [data-library-doc-select] option").length, 3);
  assert.equal($("#library [data-library-doc-target]").length, 3);
  assert.equal($("#library a[download]").length, 3);
  assert.equal($("#library a[target='_blank']").length, 3);
  $("#library [data-library-open-pdf]").each((_index, node) => {
    const href = $(node).attr("href") ?? "";
    assert.match($(node).text(), /Open chapter PDF full screen/);
    assert.match(href, /^assets\/textbook\/chapter-(?:11|12|13)\.pdf$/);
    assert.doesNotMatch(href, /#/);
  });
  $("#library iframe[data-library-pdf-frame]").each((_index, node) => {
    assert.equal($(node).attr("data-library-frame-revision"), "0");
  });
  assert.match(html, /const replacement = frame\.cloneNode\(false\)/);
  assert.match(html, /frame\.replaceWith\(replacement\)/);

  assert.equal($("[data-textbook-band]").length, 16);
  assert.equal($("#lesson-17 [data-textbook-band]").length, 0);
  for (const mapping of contract.lessonMappings) {
    const lesson = $(`#${mapping.lessonId}`);
    const band = lesson.find("[data-textbook-band]");
    assert.equal(band.length, 1, mapping.lessonId);
    assert.equal(band.attr("data-textbook-band"), mapping.lessonId, mapping.lessonId);
    assert.match(band.text(), new RegExp(mapping.recommendedPractice.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), mapping.lessonId);
    const open = band.find("[data-textbook-doc]").first();
    assert.equal(open.length, 1, mapping.lessonId);
    assert.equal(open.attr("data-textbook-doc"), mapping.chapterId, mapping.lessonId);
    assert.equal(open.attr("data-textbook-pdf-page"), String(mapping.physicalPages?.[0]?.[0]), mapping.lessonId);
    assert.equal(open.attr("data-textbook-print-page"), String(mapping.printedPages[0][0]), mapping.lessonId);
    const attempt = band.find("[data-textbook-attempt]");
    const answer = band.find("[data-textbook-answer]");
    assert.equal(attempt.length, 1, mapping.lessonId);
    assert.equal(answer.length, 1, mapping.lessonId);
    assert.ok(answer.attr("hidden") !== undefined, mapping.lessonId);
    assert.match(attempt.attr("data-textbook-attempt") ?? "", /^biology30-unit-a-pilot:textbook:lesson-\d{2}:attempt$/);
    assert.equal(attempt.attr("aria-expanded"), "false");
  }

  assert.equal($("[data-nav-group='review-overview'] #review-subnav [data-page-target]").length, 6);
  assert.equal($("#review-subnav [data-page-target='lesson-17']").length, 0);
  assert.equal($("#review-overview [data-page-target='lesson-17']").length, 0);
  assert.equal($("#lesson-subnav [data-page-target='lesson-17']").length, 1);
  assert.equal($("#lesson-subnav [data-page-target='lesson-17']").closest(".sublesson-group").find(".sublesson-heading").text().trim(), "Integration and Mastery");
  assert.deepEqual(
    $("#review-overview [data-review-reader-jump]").map((_index, node) => ({
      document: $(node).attr("data-textbook-doc"),
      physical: $(node).attr("data-textbook-pdf-page"),
      printed: $(node).attr("data-textbook-print-page"),
      route: $(node).attr("data-page-target")
    })).get(),
    [
      { document: "chapter-11", physical: "42", printed: "401", route: "library" },
      { document: "chapter-12", physical: "28", printed: "431", route: "library" },
      { document: "chapter-13", physical: "30", printed: "463", route: "library" },
      { document: "chapter-13", physical: "35", printed: "468", route: "library" }
    ]
  );
  assert.deepEqual(
    $("#lesson-subnav .sublesson-heading").map((_index, node) => $(node).text().trim()).get(),
    [
      "Unit A Foundations · Systems and Signals",
      "Chapter 11 · The Nervous System",
      "Chapter 12 · Sensory Reception",
      "Chapter 13 · Hormonal Regulation of Homeostasis",
      "Integration and Mastery"
    ]
  );
  assert.match($("#chapter-12-review").text(), /two of Q26–30/);
  assert.doesNotMatch($("#chapter-12-review").text(), /two from 25–30/i);
  assert.match($("#textbook-unit-review").text(), /Unit A — Textbook Unit 5 Review/);
  assert.match($("#textbook-unit-review").text(), /Q1–51 on printed pp\. 468–471/i);
  assert.equal($("#practice-final-title").text().trim(), "Final Practice");
  assert.equal($("[data-submit-final-practice]").text().trim(), "Submit Final Practice");
  assert.equal($(".bio-practice-list h3").filter((_index, node) => /^0\./.test($(node).text().trim())).length, 0);
  $(".bio-practice-list").each((_listIndex, list) => {
    const numbers = $(list).children(".bio-practice-item").map((_itemIndex, item) => {
      const match = $(item).children("h3").first().text().trim().match(/^(\d+)\./);
      return match ? Number(match[1]) : Number.NaN;
    }).get();
    assert.deepEqual(numbers, numbers.map((_number, index) => index + 1), "practice numbering must be one-based within each list");
  });
  assert.equal($("#review-seminar [data-bio-response-id^='biology30-unit-a-pilot:review-seminar:']").length, 5);
  assert.equal($("#review-seminar a[href='assets/review/unit-a-review-seminar-source.pdf']").length, 2);
  assert.equal($("#review-seminar iframe").length, 0);

  const learnerLinks = $("a[href],iframe[src],script[src],link[href]")
    .map((_index, node) => $(node).attr("href") ?? $(node).attr("src") ?? "")
    .get();
  assert.ok(learnerLinks.every((value) => !/(?:quiz|answer.?key|test.?answer|seminar.?key)/i.test(value)), learnerLinks.join("\n"));
  assert.equal($("script[src^='http'],link[href^='http'],img[src^='http'],iframe[src^='http']").length, 0);
  assert.equal($("#chapter-11-review [data-textbook-answer][hidden]").length, 1);
  assert.equal($("#chapter-12-review [data-textbook-answer][hidden]").length, 1);
  assert.equal($("#chapter-13-review [data-textbook-answer][hidden]").length, 1);
  assert.equal($("#textbook-unit-review [data-textbook-answer][hidden]").length, 1);

  const feedbackFigures = $("[data-figure-slot='figure-generic-feedback-loop']");
  assert.equal(feedbackFigures.length, 2);
  feedbackFigures.each((_index, node) => {
    const figure = $(node);
    assert.equal(figure.hasClass("bio-figure--responsive"), true);
    assert.equal(figure.find("[data-open-figure-dialog]").length, 1);
    assert.equal(figure.find("svg[data-feedback-diagram]").length, 1);
    assert.equal(figure.find("[data-feedback-card]").length, 5);
    assert.equal(figure.find("[data-feedback-connector]").length, 5);
    assert.equal(figure.find("[data-feedback-return-path]").length, 1);
    assert.equal(figure.find("[data-feedback-principle]").length, 1);
    assert.match(figure.find("figcaption").text(), /feeds an updated state back to the sensor/i);
  });
  assert.doesNotMatch(html, /<text[^>]*>opposes<\/text>\s*<text[^>]*>the original change<\/text>/i);

  const learnerText = $("body").clone().find("script, style").remove().end().text().replace(/\s+/g, " ");
  assert.doesNotMatch(learnerText, /24[- ]item(?:s)?\s+(?:final\s+)?practice/i);
  const administrativePhrases = [
    /\bUnit A Pilot\b/i,
    /§/,
    /required 1,505-minute course path/i,
    /lesson completion, scoring/i,
    /presentation-era/i,
    /current course version/i,
    /source key title/i,
    /source wording overlaps/i,
    /learner completes the reasoning prompt/i,
    /does not count toward required completion/i,
    /completion dependenc/i,
    /no learner download is required/i,
    /project review package/i
  ];
  for (const phrase of administrativePhrases) assert.doesNotMatch(learnerText, phrase);
  assert.doesNotMatch(contractText, /§/);
});

test("Lesson 4 uses the reviewed resting-membrane image in the correct lesson and retains its accessible equivalent", async () => {
  const [html, prompt, generatedVisual] = await Promise.all([
    readFile(workspacePath, "utf8"),
    readFile(imagePromptPath, "utf8"),
    readFile(generatedVisualPath, "utf8").then((value) => JSON.parse(value))
  ]);
  const $ = loadHtml(html);
  const figure = $("[data-figure-slot='resting-membrane']");
  assert.equal(figure.length, 1);
  assert.equal(figure.attr("data-media-treatment"), "reviewed-generated-visual");
  assert.equal(figure.attr("data-generated-visual"), "lesson-04-resting-membrane");
  const image = figure.children("img");
  assert.equal(image.length, 1);
  assert.equal(image.attr("src"), "assets/generated-visuals/lesson-04-resting-membrane-1014f22e.png");
  assert.equal(image.attr("width"), "1586");
  assert.equal(image.attr("height"), "992");
  assert.match(image.attr("alt") ?? "", /higher sodium concentration outside/i);
  assert.equal(figure.children("svg[hidden][data-replaced-by-generated-visual='lesson-04-resting-membrane']").length, 1);
  assert.equal(figure.find("[data-open-figure-dialog]").length, 1);
  assert.equal($("[aria-label='Resting membrane model as text'] table").length, 1);
  const asset = generatedVisual.assets.find((candidate: { id: string }) => candidate.id === "lesson-04-resting-membrane");
  assert.equal(asset.lessonId, "lesson-04");
  assert.equal(asset.outputSha256, digest(await readFile(path.join(repoRoot, asset.outputPath))));
  assert.match(asset.scientificReview.localContextRequired, /trapped intracellular anions/i);
  assert.equal(generatedVisual.placementPolicy.lesson03.includes("not placed in Lesson 3"), true);
  assert.match(prompt, /unlabeled visual base/i);
  assert.match(prompt, /many sodium particles outside and very few inside/i);
  assert.match(prompt, /many potassium particles inside and very few outside/i);
  assert.match(prompt, /Do not include any words, letters, ion symbols, numbers/i);
  assert.match(prompt, /current adjacent explanation, equivalent table, alt text, and keyboard enlargement are preserved/i);
});

test("Lesson 12 uses the reviewed endocrine map with an explicit posterior-parathyroid clarification", async () => {
  const [html, prompt, generatedVisual] = await Promise.all([
    readFile(workspacePath, "utf8"),
    readFile(imagePromptPath, "utf8"),
    readFile(generatedVisualPath, "utf8").then((value) => JSON.parse(value))
  ]);
  const $ = loadHtml(html);
  const figure = $("[data-figure-slot='figure-endocrine-body-map']");
  assert.equal(figure.length, 1);
  assert.equal(figure.attr("data-media-treatment"), "reviewed-generated-visual");
  assert.equal(figure.attr("data-generated-visual"), "lesson-12-endocrine-map");
  const image = figure.children("img");
  assert.equal(image.attr("src"), "assets/generated-visuals/lesson-12-endocrine-map-2dd61d4a.png");
  assert.match(image.attr("alt") ?? "", /posterior parathyroid glands/i);
  assert.equal(figure.children("svg[hidden][data-replaced-by-generated-visual='lesson-12-endocrine-map']").length, 1);
  assert.match(figure.find("figcaption").text(), /posterior inset is the anatomically authoritative view/i);
  const asset = generatedVisual.assets.find((candidate: { id: string }) => candidate.id === "lesson-12-endocrine-map");
  assert.equal(asset.lessonId, "lesson-12");
  assert.equal(asset.outputSha256, digest(await readFile(path.join(repoRoot, asset.outputPath))));
  assert.match(asset.scientificReview.localContextRequired, /posterior inset as anatomically authoritative/i);
  assert.match(prompt, /Lesson 12 — Unit A endocrine body map base illustration/);
  assert.match(prompt, /unlabeled anatomical base beneath separately authored web labels/i);
  assert.match(prompt, /hypothalamus inside the brain, directly superior to the pituitary/i);
  assert.match(prompt, /infundibulum or pituitary stalk/i);
  assert.match(prompt, /parathyroid glands accurately as several small glands on the posterior surface of the thyroid/i);
  assert.match(prompt, /adrenal glands resting on the superior poles of the kidneys/i);
  assert.match(prompt, /pancreatic islets as multiple small cell clusters within the pancreatic tissue/i);
  assert.match(prompt, /Do not include any words, letters, gland names, hormone names, symbols, numbers, arrows/i);
  assert.match(prompt, /current text equivalent, alt text, exact semantic labels, and keyboard enlargement are preserved/i);
});

test("all ten teacher-selected comparison figures replace their exact diagrams with accessible local originals", async () => {
  const [html, generatedVisual, teacherDecisions] = await Promise.all([
    readFile(workspacePath, "utf8"),
    readFile(generatedVisualPath, "utf8").then((value) => JSON.parse(value)),
    readFile(teacherFigureDecisionPath, "utf8").then((value) => JSON.parse(value))
  ]);
  const $ = loadHtml(html);
  const selected = [
    ["lesson-01-integrated-control", "figure-integrated-control-overview", "lesson-01-integrated-control-selected.png"],
    ["lesson-02-control-comparison", "figure-control-system-comparison", "lesson-02-control-comparison-selected.png"],
    ["lesson-03-neuron-roles", "figure-neuron-types", "lesson-03-neuron-roles-selected.png"],
    ["lesson-03-myelin-saltatory", "figure-myelin-saltatory-conduction", "lesson-03-myelin-saltatory-selected.png"],
    ["lesson-05-synaptic-transmission", "figure-synaptic-transmission", "lesson-05-synaptic-transmission-selected.png"],
    ["lesson-08-sensory-receptors", "figure-sensory-receptor-families", "lesson-08-sensory-receptor-families-selected.png"],
    ["lesson-09-retina-pathway", "figure-retina-light-pathway", "lesson-09-retina-pathway-selected.png"],
    ["lesson-10-equilibrium", "figure-equilibrium-apparatus", "lesson-10-equilibrium-selected.png"],
    ["lesson-16-stress-response", "figure-stress-response-comparison", "lesson-16-stress-response-selected.png"],
    ["lesson-17-integrated-regulation", "figure-integrated-nervous-endocrine-case", "lesson-17-integrated-regulation-selected.png"]
  ] as const;
  assert.equal(teacherDecisions.decisionCount, 10);
  assert.ok(Object.values(teacherDecisions.decisions).every((decision) => decision === "use-candidate"));
  assert.equal(generatedVisual.assets.length, 12);
  for (const [id, figureSlot, filename] of selected) {
    const figure = $(`[data-figure-slot="${figureSlot}"][data-generated-visual="${id}"]`);
    assert.equal(figure.length, 1, id);
    assert.equal(figure.children(`svg[hidden][data-replaced-by-generated-visual="${id}"]`).length, 1, id);
    assert.equal(figure.find("[data-open-figure-dialog]").length, 1, id);
    assert.match(figure.find("figcaption").text(), /Text equivalent\./, id);
    const image = figure.children("img.bio-source-figure__image");
    assert.equal(image.length, 1, id);
    assert.equal(image.attr("src"), `assets/generated-visuals/selected/${filename}`, id);
    assert.ok(Number(image.attr("width")) >= 1500, id);
    assert.ok(Number(image.attr("height")) >= 992, id);
    assert.ok((image.attr("alt") ?? "").trim().length >= 80, id);
    const asset = generatedVisual.assets.find((candidate: { id: string }) => candidate.id === id);
    assert.ok(asset, id);
    assert.equal(asset.outputSha256, digest(await readFile(path.join(repoRoot, asset.outputPath))), id);
  }
  assert.match(teacherDecisions.implementationNotes.lesson09, /corrected retinal-layer version/i);
  assert.match(teacherDecisions.implementationNotes.lesson10, /incorrect saccule-to-ampulla connection/i);
  assert.match(teacherDecisions.implementationNotes.lesson16, /workable range/i);
  assert.match(teacherDecisions.implementationNotes.lesson17, /ADH synthesis, release, and kidney action/i);
});

test("the complete ChatGPT Images prompt, decision, provenance, placement, and exact-build trail is durable", async () => {
  const [html, prompt, generatedVisual, teacherDecisions, comparisonManifest, projectMetadata, deployment, ledger] = await Promise.all([
    readFile(workspacePath, "utf8"),
    readFile(imagePromptPath, "utf8"),
    readFile(generatedVisualPath, "utf8").then((value) => JSON.parse(value)),
    readFile(teacherFigureDecisionPath, "utf8").then((value) => JSON.parse(value)),
    readFile(comparisonManifestPath, "utf8").then((value) => JSON.parse(value)),
    readFile(projectMetadataPath, "utf8").then((value) => JSON.parse(value)),
    readFile(reviewDeploymentPath, "utf8").then((value) => JSON.parse(value)),
    readFile(ledgerPath, "utf8").then((value) => JSON.parse(value) as ImprovementLedger)
  ]);
  const workspaceSha256 = digest(await readFile(workspacePath));

  assert.equal(generatedVisual.status, "integrated-exact-build-reviewed-awaiting-teacher-acceptance");
  assert.equal(generatedVisual.generator.provider, "ChatGPT Images");
  assert.match(generatedVisual.generator.model, /exact model version not provided/i);
  assert.equal(generatedVisual.workflow.promptRecord, "projects/biology30-unit-a-pilot/meta/image-generation-prompts.md");
  assert.equal(generatedVisual.workflow.teacherDecisionRecord, "projects/biology30-unit-a-pilot/meta/visual-comparison/teacher-decisions.json");
  assert.match(generatedVisual.workflow.retrievalMethod, /passwords, cookies, session tokens, and browser-profile data were not read or stored/i);
  assert.match(generatedVisual.workflow.privateChatPolicy, /must never enter learner content/i);
  assert.match(generatedVisual.workflow.regenerationPolicy, /no automatic repository regeneration command/i);
  assert.equal(generatedVisual.exactBuildReview.workspaceSha256, ledger.visualInspection.workspaceSha256);
  assert.equal(generatedVisual.exactBuildReview.reportSha256, ledger.visualInspection.reportSha256);
  assert.equal(generatedVisual.exactBuildReview.contactSheetCount, 54);
  assert.equal(generatedVisual.exactBuildReview.allContactSheetsOpened, true);
  assert.equal(generatedVisual.exactBuildReview.geometryFindingCount, 0);
  assert.equal(generatedVisual.exactBuildReview.teacherAcceptance, "pending");

  assert.equal(comparisonManifest.purpose, "Authoring-only side-by-side review of current course-native figures and ChatGPT-generated candidates.");
  assert.equal(comparisonManifest.items.length, 10);
  assert.ok(comparisonManifest.items.every((item: { chatUrl: string }) => item.chatUrl.startsWith("https://chatgpt.com/c/")));
  assert.doesNotMatch(html, /chatgpt\.com\/c\//i, "private comparison chats must never be learner-facing");
  assert.equal(teacherDecisions.decisionCount, 10);

  for (const phrase of [
    "Recorded ChatGPT Images comparison prompts",
    "Integrated nervous and endocrine control",
    "Nervous and endocrine control: shared logic, different delivery",
    "Sensory, interneuron, and motor neuron roles",
    "Myelin and saltatory conduction",
    "Chemical synaptic transmission",
    "Sensory receptor families",
    "Correct the retinal cross-section before regenerating this image",
    "The lower-left red angular-acceleration inset is incorrectly connected to the saccule",
    "Return toward a workable range",
    "Hypothalamic osmoreceptors detect increased plasma osmotic concentration"
  ]) assert.ok(prompt.includes(phrase), phrase);

  const canonicalSources = new Set(projectMetadata.canonicalSources as string[]);
  for (const required of [
    "projects/biology30-unit-a-pilot/meta/generated-visual-integration.json",
    "projects/biology30-unit-a-pilot/meta/image-generation-prompts.md",
    "projects/biology30-unit-a-pilot/meta/visual-comparison/manifest.json",
    "projects/biology30-unit-a-pilot/meta/visual-comparison/index.html",
    "projects/biology30-unit-a-pilot/meta/visual-comparison/teacher-decisions.json",
    "projects/biology30-unit-a-pilot/meta/improvement-ledger.json",
    "projects/biology30-unit-a-pilot/meta/core-vocabulary.json",
    "projects/biology30-unit-a-pilot/meta/unit-a-to-bcd-improvement-playbook.md"
  ]) assert.ok(canonicalSources.has(required), required);
  for (const asset of generatedVisual.assets as Array<{ outputPath: string }>) {
    assert.ok(canonicalSources.has(asset.outputPath), asset.outputPath);
  }
  assert.match(deployment.source.indexSha256, /^[a-f0-9]{64}$/);
  assert.equal(deployment.source.currentLocalIndexSha256, workspaceSha256);
  assert.equal(deployment.source.deploymentFresh, false);
  assert.match(
    deployment.source.freshnessNote,
    /redeployment was not authorized|replaced by Biology 30 Unit A Pilot 2/i
  );
  assert.equal(deployment.scope.learnerRelease, false);
});

test("lesson identity, saved responses, required time, completion gates, and practice remain unchanged", async () => {
  const [html, raw] = await Promise.all([readFile(workspacePath, "utf8"), readFile(rawPath, "utf8")]);
  const $ = loadHtml(html);
  const expectedLessons = Array.from({ length: 17 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`);
  assert.deepEqual($("[data-biology-lesson]").map((_index, node) => $(node).attr("data-biology-lesson")).get(), expectedLessons);
  assert.equal($("[data-practice-id]").length, 100);
  assert.equal($("[data-practice-id^='final-practice-']").length, 24);
  assert.equal($("[data-artifact-id]").length, 7);

  const originalPilotIds = responseIds(raw).map((id) => id.replace(/^biology30-unit-a:/, "biology30-unit-a-pilot:"));
  const currentIds = responseIds(html);
  assert.equal(new Set(currentIds).size, currentIds.length, "response IDs must remain unique");
  for (const id of originalPilotIds) assert.equal(currentIds.filter((candidate) => candidate === id).length, 1, id);
  const vocabularyIds = currentIds.filter((id) => id.startsWith("biology30-unit-a-pilot:core-vocabulary:"));
  assert.equal(vocabularyIds.length, 112, "the complete 28-family route exposes four stable Frayer fields per family");
  assert.equal(new Set(vocabularyIds).size, 112, "all vocabulary response IDs must be unique");
  assert.equal(currentIds.length, originalPilotIds.length + 117, "only five seminar and 112 vocabulary responses are new");

  const requiredMinutes = $("[data-biology-lesson]").map((_index, lesson) => {
    const term = $(lesson).find(".bio-lesson-meta dt").filter((_termIndex, node) => $(node).text().trim() === "Required time").first();
    const minutes = Number.parseInt(term.next("dd").text(), 10);
    assert.ok(Number.isFinite(minutes), $(lesson).attr("id"));
    return minutes;
  }).get();
  assert.equal(requiredMinutes.reduce((total, minutes) => total + Number(minutes), 0), 1505);
  assert.match(html, /const BIO_REQUIRED_LESSONS = \["lesson-01"(?:,"lesson-\d{2}"){16}\];/);
  assert.match(html, /const BIO_REQUIRED_ARTIFACTS = \["regulation-systems-map","action-potential-evidence","reflex-investigation","sensory-investigation","sensory-evidence-case","glucose-urinalysis","hormone-technology-case"\];/);
  assert.doesNotMatch(html.match(/const BIO_REQUIRED_LESSONS = .*?;/)?.[0] ?? "", /textbook|review/);
  assert.doesNotMatch(html.match(/const BIO_REQUIRED_ARTIFACTS = .*?;/)?.[0] ?? "", /textbook|review/);

  assert.equal($("[data-biology-lesson] .bio-callout--safety").length, 0);
  assert.doesNotMatch(html, /No special materials/i);
  assert.equal($(".bio-retrieval").length, 17);
  assert.equal($(".bio-retrieval > .bio-retrieval-response").length, 17);
  for (const retrieval of $(".bio-retrieval").toArray()) {
    const response = $(retrieval).children(".bio-retrieval-response");
    assert.equal(response.find("label").length, 1);
    assert.equal(response.find("textarea").length, 1);
    assert.equal(response.find(".bio-save-status").length, 1);
  }
  assert.doesNotMatch(html, /\.bio-retrieval[^{}]*\{[^{}]*grid-row/s);

  const ids = $("[id]").map((_index, node) => $(node).attr("id") ?? "").get();
  assert.equal(new Set(ids).size, ids.length, "HTML IDs must remain unique");
  for (const script of $("script:not([src])").toArray()) assert.doesNotThrow(() => new Function($(script).html() ?? ""));
});

test("prepared learner PDFs are normalized, renderable, and exactly match the resource report", async () => {
  const report = JSON.parse(await readFile(reportPath, "utf8")) as ResourceReport;
  assert.equal(report.learnerAssets.length, 4);
  assert.equal(report.authoringSources.length, 18);
  assert.deepEqual(report.validation, {
    sourceHashesVerified: true,
    pdfHeadersNormalized: true,
    pageCountsVerified: true,
    textExtractionVerified: true,
    secureAssessmentMaterialIncluded: false
  });
  assert.ok(report.exclusions.includes("printable chapter quizzes"));
  assert.ok(report.exclusions.includes("Unit A test and test answers"));

  const expectedPages = new Map([
    ["textbook-chapter-11", 44],
    ["textbook-chapter-12", 30],
    ["textbook-chapter-13", 38],
    ["review-seminar-learner-copy", 35]
  ]);
  for (const asset of report.learnerAssets) {
    const bytes = await readFile(path.join(repoRoot, asset.outputPath));
    assert.equal(bytes.subarray(0, 5).toString("ascii"), "%PDF-", asset.id);
    assert.equal(digest(bytes), asset.normalizedSha256, asset.id);
    const parsed = await pdf(bytes);
    assert.equal(parsed.numpages, expectedPages.get(asset.id), asset.id);
    assert.ok(parsed.text.replace(/\s+/g, " ").trim().length > 80, asset.id);
  }
});

test("improvement rules record exact-build evidence without claiming user acceptance or automatic B-D rollout", async () => {
  const ledger = JSON.parse(await readFile(ledgerPath, "utf8")) as ImprovementLedger;
  const workspaceSha256 = digest(await readFile(workspacePath));
  assert.equal(ledger.projectSlug, "biology30-unit-a-pilot");
  assert.equal(ledger.status, "stage-2-core-vocabulary-awaiting-teacher-review");
  assert.equal(ledger.currentWorkspaceSha256, workspaceSha256);
  assert.notEqual(ledger.visualInspection.workspaceSha256, workspaceSha256, "the prior full-course audit must remain bound to its historical build");
  assert.match(ledger.visualInspection.reportPath, /^\.runtime\/biology30-unit-a-improvement-pilot-visual-audit\//);
  assert.match(ledger.visualInspection.reportSha256, /^[a-f0-9]{64}$/);
  assert.equal(ledger.visualInspection.contactSheetCount, 54);
  assert.equal(ledger.visualInspection.allContactSheetsOpened, true);
  assert.equal(ledger.visualInspection.textbookBandViewportCount, 32);
  assert.equal(ledger.visualInspection.sourceVisualViewportCount, 18);
  assert.equal(ledger.visualInspection.generatedVisualViewportCount, 24);
  assert.equal(ledger.visualInspection.practiceFeedbackViewportCount, 4);
  assert.equal(ledger.visualInspection.feedbackFigureViewportCount, 4);
  assert.equal(ledger.visualInspection.mediaSurfaceViewportCount, 30);
  assert.equal(ledger.visualInspection.videoLibraryStateViewportCount, 70);
  assert.equal(ledger.visualInspection.geometryFindingCount, 0);
  assert.equal(ledger.visualInspection.userAcceptance, "pending");
  assert.equal(ledger.coreVocabularyVisualInspection.workspaceSha256, workspaceSha256);
  assert.match(ledger.coreVocabularyVisualInspection.reportPath, /^\.runtime\/biology30-unit-a-core-vocabulary-pilot-visual-audit\//);
  assert.match(ledger.coreVocabularyVisualInspection.reportSha256, /^[a-f0-9]{64}$/);
  assert.equal(ledger.coreVocabularyVisualInspection.contactSheetCount, 7);
  assert.equal(ledger.coreVocabularyVisualInspection.allContactSheetsOpened, true);
  assert.equal(ledger.coreVocabularyVisualInspection.workspaceTreeSha256, "61396aee1fec5e4c35fd408a2629ca05abda82df584a2db47e46444c37e361dc");
  assert.equal(ledger.coreVocabularyVisualInspection.conceptEntryViewportCount, 84);
  assert.equal(ledger.coreVocabularyVisualInspection.conceptStateViewportCount, 30);
  assert.equal(ledger.coreVocabularyVisualInspection.wordLensViewportCount, 51);
  assert.equal(ledger.coreVocabularyVisualInspection.zoomViewportCount, 2);
  assert.equal(ledger.coreVocabularyVisualInspection.geometryFindingCount, 0);
  assert.equal(ledger.coreVocabularyVisualInspection.blockedExternalRequestCount, 12);
  assert.match(ledger.coreVocabularyVisualInspection.blockedExternalRequestExplanation, /12 blocked requests.*optional YouTube previews/i);
  assert.equal(ledger.coreVocabularyVisualInspection.teacherAcceptance, "pending");
  assert.equal(ledger.entries.length, 21);
  assert.equal(new Set(ledger.entries.map((entry) => entry.id)).size, ledger.entries.length);
  for (const entry of ledger.entries) {
    assert.ok(entry.owner.trim(), entry.id);
    assert.equal(entry.reviewStatus, "awaiting-explicit-user-review", entry.id);
    assert.ok(entry.automatedTests.length, entry.id);
    assert.ok(entry.manualCheck.trim(), entry.id);
    assert.equal(entry.applicabilityToUnitsBD.status, "conditional", entry.id);
    assert.ok(entry.applicabilityToUnitsBD.adaptation.trim(), entry.id);
  }
  assert.equal(ledger.rolloutPolicy.status, "deferred-until-unit-a-acceptance");
});

test("living Unit A to B-D playbook stays synchronized with the improvement ledger", async () => {
  const [playbook, ledger] = await Promise.all([
    readFile(playbookPath, "utf8"),
    readFile(ledgerPath, "utf8").then((value) => JSON.parse(value) as ImprovementLedger)
  ]);

  assert.match(playbook, /^# Biology 30 Unit Improvement Journal and B-D Transfer Playbook/m);
  assert.ok(playbook.includes(`Ledger status: \`${ledger.status}\``));
  assert.ok(playbook.includes(`Current workspace SHA-256: \`${ledger.currentWorkspaceSha256}\``));

  const indexStart = playbook.indexOf("## Rolling transfer index");
  const indexEnd = playbook.indexOf("## Principles established by the pilot");
  assert.ok(indexStart >= 0 && indexEnd > indexStart, "rolling transfer index must have stable section boundaries");
  const transferRows = playbook
    .slice(indexStart, indexEnd)
    .split("\n")
    .filter((line) => line.startsWith("| `"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));

  assert.equal(transferRows.length, ledger.entries.length);
  const rowsById = new Map(transferRows.map((cells) => [cells[0].replaceAll("`", ""), cells]));
  assert.equal(rowsById.size, ledger.entries.length);
  for (const entry of ledger.entries) {
    const row = rowsById.get(entry.id);
    assert.ok(row, `${entry.id} must appear in the rolling transfer index`);
    assert.equal(row?.[2], "`awaiting-teacher-review`", entry.id);
    assert.equal(row?.[3], "`conditional-not-applied`", entry.id);
  }

  for (const slug of ["biology30-unit-b", "biology30-unit-c", "biology30-unit-d"]) {
    assert.ok(playbook.includes(`\`${slug}\``), `${slug} must be identified`);
  }
  assert.ok(playbook.includes("scripts/lib/biology30-course/v1/build.ts"));
  for (const required of [
    "## Complete repeatable operating procedure",
    "### Phase 0 — preflight, source ownership, and immutable baseline",
    "### Phase 5 — Canvas Helper annotation and review-set loop",
    "### Phase 6 — textbook intake, exact-page navigation, and native review",
    "### Phase 7 — PowerPoint media intake and Video Library",
    "### Phase 9 — ChatGPT Images generation, comparison, correction, and integration",
    "### Phase 9A — Core Vocabulary, morphology, Frayer evidence, and Process Collection",
    "### Phase 10 — persistence, identity, and completion invariants",
    "### Phase 11 — exact verification and visual evidence",
    "### Phase 13 — update this living record after every cycle",
    "### Failure and rollback table",
    "### Per-cycle completion checklist",
    "98f481b06ce304ccc79e236f3b45b6ffcd99bb41",
    "f4fdf1e95aa3e80681b8aff15c2fb1af65705d28e663ea1ad2c3a2dbb8ae610d",
    "ef0b900b880cb705fd9b4e8000738b52fcf324ac2ba373d5d60aaf8760d3bf2a",
    "128-byte Brightspace `PDF CARO` prefix",
    "physical = printed - 359",
    "youtube-nocookie.com/embed/<video-id>?rel=0",
    "No password, cookie, session token, or browser profile was read or stored",
    "48,000 characters",
    "95/100"
  ]) assert.ok(playbook.includes(required), required);
  for (const command of [
    "npm run intake:science-comparison",
    "npm run prepare:biology30-unit-a-pilot:textbook",
    "npm run prepare:biology30-unit-a-pilot:media",
    "npm run prepare:biology30-unit-a-pilot:visuals",
    "npm run test:biology30-unit-a-core-vocabulary-pilot",
    "npm run audit:biology30-unit-a-core-vocabulary-pilot:visual",
    "npm run audit:biology30-unit-a-improvement-pilot:visual",
    "npm run test:e2e:biology30-unit-a-improvement-pilot",
    "npm run course:doctor -- --project biology30-unit-a-pilot"
  ]) assert.ok(playbook.includes(command), command);
  assert.doesNotMatch(playbook, /\]\([^)]*(?:improvement-ledger 2|source-visual-resource-report [23])\.json\)/);

  const links = [...playbook.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);
  assert.ok(links.length > 10);
  for (const link of links) {
    if (/^(?:https?:|mailto:|#)/.test(link)) continue;
    const target = decodeURIComponent(link.split("#", 1)[0]);
    assert.equal(await exists(path.resolve(path.dirname(playbookPath), target)), true, link);
  }
});

test("pilot textbook preparation is transactional, idempotent, and never rewrites canonical HTML", async () => {
  const fixture = await setupResourceFixture();
  try {
    const fixtureWorkspace = path.join(fixture.fixtureProject, "workspace/index.html");
    const beforeHtml = await readFile(fixtureWorkspace);
    const first = await prepareBiology30UnitAPilotTextbook({ repoRoot: fixture.fixtureRoot });
    assert.equal(first.changed, true);
    const firstHashes = await Promise.all(first.files.map(async (relative) => digest(await readFile(path.join(fixture.fixtureProject, relative)))));
    const second = await prepareBiology30UnitAPilotTextbook({ repoRoot: fixture.fixtureRoot });
    assert.equal(second.changed, false);
    const secondHashes = await Promise.all(second.files.map(async (relative) => digest(await readFile(path.join(fixture.fixtureProject, relative)))));
    assert.deepEqual(secondHashes, firstHashes);
    assert.deepEqual(await readFile(fixtureWorkspace), beforeHtml);
    assert.deepEqual((await readdir(fixture.fixtureProject)).filter((entry) => entry.startsWith(".textbook-resource-stage-")), []);
  } finally {
    await rm(fixture.fixtureRoot, { recursive: true, force: true });
  }
});

test("pilot textbook preparation rolls back partial promotion and rejects source drift", async () => {
  const rollback = await setupResourceFixture();
  try {
    await assert.rejects(
      prepareBiology30UnitAPilotTextbook({ repoRoot: rollback.fixtureRoot, failAfterPromotion: 1 }),
      /Simulated resource promotion failure/
    );
    assert.equal(await exists(path.join(rollback.fixtureProject, "workspace/assets/textbook")), false);
    assert.equal(await exists(path.join(rollback.fixtureProject, "workspace/assets/review")), false);
    assert.equal(await exists(path.join(rollback.fixtureProject, "meta/textbook-resource-report.json")), false);
    assert.deepEqual((await readdir(rollback.fixtureProject)).filter((entry) => entry.startsWith(".textbook-resource-stage-")), []);
  } finally {
    await rm(rollback.fixtureRoot, { recursive: true, force: true });
  }

  const drift = await setupResourceFixture();
  try {
    await appendFile(path.join(drift.fixtureSources, `${BIOLOGY30_PILOT_PRIMARY_SHA256}.zip`), "unexpected drift");
    await assert.rejects(prepareBiology30UnitAPilotTextbook({ repoRoot: drift.fixtureRoot }), /Source archive hash mismatch/);
    assert.equal(await exists(path.join(drift.fixtureProject, "workspace/assets/textbook")), false);
    assert.equal(await exists(path.join(drift.fixtureProject, "workspace/assets/review")), false);
    assert.equal(await exists(path.join(drift.fixtureProject, "meta/textbook-resource-report.json")), false);
  } finally {
    await rm(drift.fixtureRoot, { recursive: true, force: true });
  }
});
