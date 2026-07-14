import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { chromium } from "@playwright/test";

import {
  createEla20ShortStoriesPilotRecipe,
  ELA20_SHORT_STORY_ANALYSIS_TERMS
} from "../lib/english-unit/pilot-recipe.js";
import {
  ENGLISH_LITERARY_TERMS,
  ENGLISH_LITERARY_TERMS_SECTIONS,
  renderEnglishLiteraryTermsReference
} from "../lib/english-unit/literary-terms.js";
import { isJpeg2000Buffer, parseNumberedQuestions } from "../lib/english-unit/source.js";
import type { EnglishBuildReport, EnglishUnitRecipeV1 } from "../lib/english-unit/types.js";

const ROOT = process.cwd();
const SLUG = "ela20-1-short-stories-pilot";
const PROJECT = path.join(ROOT, "projects", SLUG);
const WORKSPACE = path.join(PROJECT, "workspace");
const META = path.join(PROJECT, "meta");
const WORKBENCH_TERM_IDS = ELA20_SHORT_STORY_ANALYSIS_TERMS.map((term) => term.id);

test("pilot recipe locks the intended unit, texts, and assessment exclusions", () => {
  const recipe = createEla20ShortStoriesPilotRecipe({
    projectSlug: SLUG,
    brightspaceRawFile: "brightspace.zip",
    teacherRawFile: "teacher.zip",
    unitId: "53033"
  });
  assert.equal(recipe.lessonOrder.length, 14);
  assert.equal(recipe.readings.length, 5);
  assert.equal(recipe.excludedFiles.length, 3);
  assert.equal(recipe.source.brightspaceUnitId, "53033");
  assert.equal(recipe.analysisTerms.length, 9);
  assert.equal(recipe.analysisExamples.filter((example) => example.termId).length, 90);
  assert.deepEqual(
    recipe.analysisTerms.map((term) => term.label),
    [
      "Characters and Characterization",
      "Irony",
      "Point of View",
      "Plot",
      "Setting",
      "Symbols and Motifs",
      "Tone and Mood",
      "Diction",
      "Theme"
    ]
  );
  assert.equal(recipe.fictionElementsHub.hubLesson, "Lesson 2: Introduction to Elements of Fiction");
  assert.equal(recipe.fictionElementsHub.contextLesson, undefined);
  assert.deepEqual(recipe.topLevelLessonOrder, [
    "Short Stories - Introduction",
    "Lesson 1: Characters and Characterization",
    "Lesson 2: Introduction to Elements of Fiction",
    "Lesson 12: Literary Terms",
    "Lesson 11: Suggestions for Reading Short Stories",
    "Lesson 13: Writing a Personal Response to Text(s)"
  ]);
  assert.deepEqual(
    recipe.readings.map((reading) => reading.group),
    ["Short Fiction", "Short Fiction", "Visual Narrative", "Paired Perspectives", "Paired Perspectives"]
  );
  assert.equal(recipe.readings.find((reading) => reading.id === "lamp-at-noon")?.questionPrompts?.length, 8);
  for (const reading of recipe.readings) {
    for (const term of recipe.analysisTerms) {
      assert.equal(
        recipe.analysisExamples.filter((example) => example.readingId === reading.id && example.termId === term.id).length,
        2,
        `${reading.id} should have two ${term.id} analysis examples`
      );
    }
  }
});

test("numbered question extraction preserves multiline prompts", () => {
  const questions = parseNumberedQuestions("Heading\n1. First line\ncontinues here.\n\n2. Second prompt?\nwith support.");
  assert.deepEqual(questions, [
    { id: "1", prompt: "First line continues here." },
    { id: "2", prompt: "Second prompt? with support." }
  ]);
});

test("JPEG 2000 lesson images are detected before browser export", () => {
  assert.equal(isJpeg2000Buffer(Buffer.from([0x00, 0x00, 0x00, 0x0c, 0x6a, 0x50, 0x20, 0x20, 0x0d, 0x0a, 0x87, 0x0a])), true);
  assert.equal(isJpeg2000Buffer(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), false);
});

test("literary terms reference preserves the complete ELA lesson glossary", () => {
  assert.equal(ENGLISH_LITERARY_TERMS_SECTIONS.length, 7);
  assert.equal(ENGLISH_LITERARY_TERMS.length, 44);
  const html = renderEnglishLiteraryTermsReference();
  for (const heading of ["The Basics", "Types of Prose Texts", "Terms for Interpreting Authorial Voice", "Terms for Interpreting Layers of Meaning"]) {
    assert.equal(html.includes(`>${heading}<`), true);
  }
  for (const forbidden of ["English 30-1", "Diploma Exam", "Part A"]) assert.equal(html.includes(forbidden), false);
});

test("generated pilot accounts for sources and renders all required learner surfaces", async () => {
  const recipe = JSON.parse(await readFile(path.join(META, "english-unit.json"), "utf8")) as EnglishUnitRecipeV1;
  const report = JSON.parse(await readFile(path.join(META, "english-unit-mapping.json"), "utf8")) as EnglishBuildReport;
  const html = await readFile(path.join(WORKSPACE, "index.html"), "utf8");

  assert.equal(recipe.source.brightspaceUnitId, "53033");
  assert.equal(report.selectedUnit.title, "Short Stories");
  assert.equal(report.selectedUnit.lessonCount, 14);
  assert.equal(report.summary.excluded, 3);
  assert.equal(report.summary.missing, 0);
  assert.equal(report.items.filter((item) => item.role === "lesson" && item.status === "placed").length, 14);
  assert.equal(report.items.some((item) => item.source.includes("Module 3 - Short Stories")), false);
  assert.equal(report.items.some((item) => /Math/i.test(item.source)), false);
  assert.equal(
    report.items.some((item) => item.source.endsWith("Lamp at Noon.pdf#page=9") && item.note.includes("eight prompts")),
    true
  );
  assert.equal(html.includes("short-stories-introduction-photo-old-type-writer-focus-260nw-1198882.png"), true);
  assert.equal(html.includes("short-stories-introduction-photo-old-type-writer-focus-260nw-1198882.jpg"), false);
  assert.equal(
    report.items.some((item) => item.destination?.endsWith(".png") && item.note.includes("JPEG 2000")),
    true
  );

  for (const heading of ["Short Story Bank", "Short Story Questions", "Personal Response Workspace", "Analysis Explorer", "Evidence Bank", "Media Room", "Source Resources"]) {
    assert.match(html, new RegExp(`>${heading}<`));
  }
  for (const referencePattern of ["library-browser story-bank-browser", "worksheet-document-header", "analysis-shell", "analysis-term-list", "film-room-shell", 'id="resources"']) {
    assert.equal(html.includes(referencePattern), true, `missing ELA 30-1 reference pattern: ${referencePattern}`);
  }
  assert.equal(html.includes('id="library"'), false);
  assert.equal(html.includes('id="analysis-explorer" class="course-page"'), false);
  assert.equal(html.includes('data-page-target="analysis-explorer"'), false);
  assert.equal((html.match(/<button type="button" data-worksheet-toggle-hints/g) ?? []).length, 6);
  assert.equal(html.includes("data-worksheet-print data-print-writing"), true);
  assert.equal((html.match(/<p class="writing-studio-hint" data-writing-hint/g) ?? []).length, 6);
  assert.equal(
    (html.match(/<div class="worksheet-hint" data-question-hint/g) ?? []).length,
    (html.match(/<div class="worksheet-question"/g) ?? []).length
  );
  assert.equal(html.includes(">Original Questions</a>"), false);
  assert.equal(html.includes('data-page-target="evidence-bank"'), true);
  assert.equal(html.includes("Save evidence from this text"), false);
  assert.equal((html.match(/data-evidence-capture=/g) ?? []).length, 3);
  assert.equal((html.match(/<button[^>]+data-save-evidence-note/g) ?? []).length, 3);
  assert.equal(html.includes('data-evidence-capture="literary-terms"'), true);
  assert.equal((html.match(/data-literary-term-option/g) ?? []).length, 44);
  assert.equal((html.match(/<button[^>]+data-save-response-evidence/g) ?? []).length, 0);
  assert.equal((html.match(/<button[^>]+data-save-response-collection/g) ?? []).length, 6);
  assert.equal((html.match(/<button[^>]+class="[^"]*evidence-bank-save-action[^"]*"[^>]+data-save-(?:evidence-note|response-collection)/g) ?? []).length, 9);
  assert.equal(html.includes('data-evidence-collection-id="english-writing-studio:build-response"'), true);
  assert.match(html, /data-save-response-collection[^>]*>.*?Save Response to Evidence Bank<\/button>/);
  assert.equal(html.includes("data-manual-evidence-list"), true);
  assert.equal(recipe.analysisTerms.length, 9);
  assert.equal((html.match(/data-element-complete-for=/g) ?? []).length, 8);
  assert.equal((html.match(/class="element-selector/g) ?? []).length, 8);
  assert.equal((html.match(/class="course-page lesson-page lesson-page--ela30"/g) ?? []).length, 6);
  assert.equal((html.match(/<header class="lesson-document-header"/g) ?? []).length, 0);
  assert.equal((html.match(/<div class="lesson-reader-panel"/g) ?? []).length, 0);
  assert.equal(html.includes('<div class="source-content"><div class="source-content">'), false);
  assert.equal(html.includes("<h2>Lesson 2: Characters and Characterization</h2>"), true);
  assert.equal(html.includes("<h1>Characters and Characterization</h1>"), true);
  assert.equal(html.includes("Types of Prose Texts"), true);
  assert.equal(html.includes("Terms for Interpreting Layers of Meaning"), true);
  assert.equal(html.includes('class="lesson-source-links--ela30"'), true);
  assert.equal(html.includes('data-complete-label="Mark Complete">Mark Complete</button>'), true);
  assert.equal(html.includes('data-page-target="lesson-1-short-stories-introduction"'), true);
  assert.equal(html.includes('data-page-target="lesson-3-lesson-2-introduction-to-elements-of-fiction"'), true);
  assert.equal(html.includes('<span class="sublesson-unit-heading">'), false);
  assert.equal(html.includes('<span class="sublesson-heading">'), false);
  assert.equal(html.includes("0 / 14 lessons"), true);
  const characterLessonIndex = html.indexOf('id="lesson-2-lesson-1-characters-and-characterization"');
  const elementsLessonIndex = html.indexOf('id="lesson-3-lesson-2-introduction-to-elements-of-fiction"');
  const workbenchIndex = html.indexOf("Elements of Fiction Checklist", elementsLessonIndex);
  const literaryTermsLessonIndex = html.indexOf('id="lesson-13-lesson-12-literary-terms"');
  const suggestionsLessonIndex = html.indexOf('id="lesson-12-lesson-11-suggestions-for-reading-short-stories"');
  assert.equal(
    characterLessonIndex >= 0 && elementsLessonIndex > characterLessonIndex && workbenchIndex > elementsLessonIndex && literaryTermsLessonIndex > workbenchIndex && suggestionsLessonIndex > literaryTermsLessonIndex,
    true
  );
  for (const reading of recipe.readings) {
    for (const term of recipe.analysisTerms) {
      assert.equal(
        recipe.analysisExamples.filter((example) => example.readingId === reading.id && example.termId === term.id).length,
        2,
        `generated recipe is missing full ${reading.id}/${term.id} coverage`
      );
    }
  }
  for (const forbidden of ["English 30-1", "Diploma Exam", "diploma exam", "Part A (Written)", "SOFT GATE", "HARD GATE"]) {
    assert.equal(html.includes(forbidden), false, `learner workspace contains ${forbidden}`);
  }
  assert.equal((html.match(/data-film-panel=/g) ?? []).length, 8);
  assert.equal((html.match(/data-response-id="english-question:lamp-at-noon:1"/g) ?? []).length > 1, true);
  assert.match(html, /data-reader-fullscreen="assets\/readings\/lamp-at-noon\.pdf"/);
  assert.match(html, /canvas-helper:ela20-1-short-stories-pilot:responses/);

  for (const reading of recipe.readings) {
    await stat(path.join(WORKSPACE, "assets", "readings", path.basename(reading.readingFile).toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+\./g, ".")));
  }
});

test("pilot interactions support routing, reader overlay, shared responses, restore, and mobile layout", async () => {
  const server = createServer(async (request, response) => {
    try {
      const requestPath = decodeURIComponent((request.url ?? "/").split("?")[0]);
      const relative = requestPath === "/" ? "index.html" : requestPath.replace(/^\//, "");
      const absolute = path.resolve(WORKSPACE, relative);
      if (!absolute.startsWith(`${WORKSPACE}${path.sep}`) && absolute !== path.join(WORKSPACE, "index.html")) {
        response.writeHead(403).end();
        return;
      }
      const body = await readFile(absolute);
      const extension = path.extname(absolute).toLowerCase();
      const contentType = extension === ".html" ? "text/html" : extension === ".pdf" ? "application/pdf" : "application/octet-stream";
      response.writeHead(200, { "content-type": contentType }).end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`http://127.0.0.1:${address.port}/index.html`);

    const imageResults = await page.locator("img").evaluateAll(async (images) =>
      Promise.all(
        images.map(async (image) => {
          const browserImage = image as HTMLImageElement;
          try {
            if (!browserImage.complete || browserImage.naturalWidth === 0) await browserImage.decode();
          } catch {
            // The assertion below reports the failed source with its decode dimensions.
          }
          return {
            src: browserImage.getAttribute("src"),
            complete: browserImage.complete,
            width: browserImage.naturalWidth,
            height: browserImage.naturalHeight
          };
        })
      )
    );
    assert.deepEqual(
      imageResults.filter((image) => !image.complete || image.width === 0 || image.height === 0),
      []
    );
    assert.equal(await page.locator("#lesson-subnav .sublesson-link").count(), 6);
    assert.equal(await page.locator("#lesson-subnav .sublesson-unit-heading, #lesson-subnav .sublesson-heading").count(), 0);

    await page.goto(`http://127.0.0.1:${address.port}/index.html#lesson-2-lesson-1-characters-and-characterization`);
    const referenceLesson = page.locator(".lesson-page--ela30:visible");
    assert.equal(await referenceLesson.count(), 1);
    assert.equal(await referenceLesson.locator(":scope > .lesson-detail-panel--ela30 > .source-content").count(), 1);
    assert.equal(await referenceLesson.locator(":scope > .lesson-detail-panel--ela30 > .source-content > .source-content").count(), 0);
    assert.deepEqual(
      await referenceLesson.locator(":scope > .lesson-detail-panel--ela30").evaluate((panel) => {
        const style = getComputedStyle(panel);
        return {
          background: style.backgroundColor,
          borderTop: style.borderTopWidth,
          padding: style.padding,
          radius: style.borderRadius
        };
      }),
      { background: "rgb(243, 244, 245)", borderTop: "4px", padding: "40px", radius: "8px" }
    );
    assert.deepEqual(
      await referenceLesson.locator(".lesson-heading-row--ela30 h2").evaluate((heading) => {
        const style = getComputedStyle(heading);
        return { fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight };
      }),
      { fontSize: "32px", fontWeight: "700", lineHeight: "38.4px" }
    );

    await page.goto(`http://127.0.0.1:${address.port}/index.html#lesson-3-lesson-2-introduction-to-elements-of-fiction`);
    const elementsChecklist = page.locator("[data-elements-checklist]:visible");
    assert.equal(await elementsChecklist.count(), 1);
    assert.equal(await elementsChecklist.locator("[data-element-complete-for]").count(), 8);
    await elementsChecklist.getByRole("button", { name: "Point of View", exact: true }).click();
    const pointOfViewPanel = elementsChecklist.locator('[data-element-panel="lesson-5-lesson-4-point-of-view"]:visible');
    assert.equal(await pointOfViewPanel.count(), 1);
    await pointOfViewPanel.getByRole("button", { name: "Mark Complete", exact: true }).click();
    assert.equal(await elementsChecklist.locator('[data-element-complete-for="lesson-5-lesson-4-point-of-view"]').innerText(), "✓");
    assert.match(await page.locator("[data-progress-count]").innerText(), /1 \/ 14 lessons/i);

    await page.getByRole("link", { name: "Short Story Bank", exact: true }).click();
    await page.locator('[data-library-doc-target="sea-devil"]').click();
    await page.locator('[data-library-doc-panel="sea-devil"] [data-reader-fullscreen]').click();
    await assert.doesNotReject(page.locator("[data-reader-overlay]").waitFor({ state: "visible" }));
    await page.getByRole("button", { name: "Close full-screen reader" }).click();

    await page.goto(`http://127.0.0.1:${address.port}/index.html#story-questions`);
    const visiblePageIds = await page.locator(".course-page:visible").evaluateAll((pages) => pages.map((page) => page.id));
    assert.deepEqual(visiblePageIds, ["story-questions"]);
    await page.selectOption("#question-bank-select", "sea-devil");
    const visibleQuestionPanel = page.locator("[data-question-panel]:visible");
    assert.equal(await visibleQuestionPanel.count(), 1);
    assert.equal(await visibleQuestionPanel.locator(".worksheet-toolbar-link").count(), 0);
    assert.equal(await visibleQuestionPanel.locator("[data-question-hint]:visible").count(), 0);
    const questionHintButton = visibleQuestionPanel.locator("[data-worksheet-toggle-hints]");
    await questionHintButton.click();
    assert.equal(await questionHintButton.getAttribute("aria-pressed"), "true");
    assert.equal((await questionHintButton.innerText()).replace(/\s+/g, " ").trim(), "lightbulb Hide Hints");
    assert.equal(
      await visibleQuestionPanel.locator("[data-question-hint]:visible").count(),
      await visibleQuestionPanel.locator(".worksheet-question").count()
    );
    await questionHintButton.click();
    assert.equal(await visibleQuestionPanel.locator("[data-question-hint]:visible").count(), 0);
    const shared = page.locator('[data-response-id="english-question:sea-devil:3"]');
    await page.locator('[data-response-id="english-question:sea-devil:3"]:visible').fill("Persistence and adaptability help the fisherman survive.");
    const values = await shared.evaluateAll((fields) => fields.map((field) => (field as HTMLTextAreaElement).value));
    assert.equal(values.every((value) => value === values[0]), true);
    await page.reload();
    assert.equal(await shared.first().inputValue(), "Persistence and adaptability help the fisherman survive.");

    await page.selectOption("#question-bank-select", "men-must-pay");
    const blankCollection = page.locator('[data-study-topic-id="men-must-pay"]:visible');
    await blankCollection.getByRole("button", { name: "Save Story Answers to Evidence Bank", exact: true }).click();
    assert.equal(await blankCollection.locator("[data-response-collection-status]").innerText(), "Write at least one answer before saving.");

    await page.selectOption("#question-bank-select", "sea-devil");
    const visibleAnswer = page.locator('[data-response-id="english-question:sea-devil:3"]:visible');
    const storyCollection = page.locator('[data-study-topic-id="sea-devil"]:visible');
    const saveStoryAnswers = storyCollection.getByRole("button", { name: "Save Story Answers to Evidence Bank", exact: true });
    await saveStoryAnswers.click();
    assert.equal(await storyCollection.locator("[data-response-collection-status]").innerText(), "Story answers saved to Evidence Bank");
    await visibleAnswer.fill("The fisherman changes tactics under pressure, showing persistence and practical intelligence.");
    await saveStoryAnswers.click();
    assert.equal(await storyCollection.locator("[data-response-collection-status]").innerText(), "Story answers updated in Evidence Bank");

    await page.goto(`http://127.0.0.1:${address.port}/index.html#evidence-bank`);
    assert.deepEqual(
      await page.locator(".course-page:visible").evaluateAll((pages) => pages.map((visiblePage) => visiblePage.id)),
      ["evidence-bank"]
    );
    assert.equal(await page.locator("[data-manual-evidence-list] .social-manual-evidence-card").count(), 1);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /The Sea Devil \| Short Story Questions/);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /The Sea Devil Question Collection/);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /1 of 6 guided responses saved/);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /Question 3:/);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /Saved responses/);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /changes tactics under pressure/);
    await page.reload();
    assert.equal(await page.locator("[data-manual-evidence-list] .social-manual-evidence-card").count(), 1);

    await page.goto(`http://127.0.0.1:${address.port}/index.html#lesson-13-lesson-12-literary-terms`);
    const literaryTermsEvidence = page.locator('[data-evidence-capture="literary-terms"]');
    assert.equal(await literaryTermsEvidence.count(), 1);
    assert.equal(await literaryTermsEvidence.locator("[data-literary-term-option]").count(), 44);
    await literaryTermsEvidence.locator('[data-evidence-draft="source"]').selectOption("do-not-fall");
    await literaryTermsEvidence.locator('[data-evidence-draft="concept"]').selectOption({ label: "Metaphor" });
    await literaryTermsEvidence.locator('[data-evidence-draft="detail"]').fill("The falling figure becomes a visual metaphor for isolation and instability.");
    await literaryTermsEvidence.locator('[data-evidence-draft="connection"]').fill("The metaphor turns emotional disconnection into a repeated physical image the reader can track.");
    await literaryTermsEvidence.getByRole("button", { name: "Save to Evidence Bank", exact: true }).click();
    assert.equal(await literaryTermsEvidence.locator("[data-save-status]").innerText(), "Saved to Evidence Bank");
    await page.goto(`http://127.0.0.1:${address.port}/index.html#evidence-bank`);
    assert.equal(await page.locator("[data-manual-evidence-list] .social-manual-evidence-card").count(), 2);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /Do Not Fall in New York City \| Literary Terms/);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /Metaphor/);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /visual metaphor for isolation and instability/);

    await page.goto(`http://127.0.0.1:${address.port}/index.html#writing-studio`);
    assert.deepEqual(
      await page.locator(".course-page:visible").evaluateAll((pages) => pages.map((visiblePage) => visiblePage.id)),
      ["writing-studio"]
    );
    assert.equal(await page.getByRole("link", { name: "Analysis Explorer", exact: true }).count(), 0);
    const evidenceSaveStyles = await page.locator("[data-save-evidence-note], [data-save-response-collection]").evaluateAll((buttons) =>
      buttons.map((button) => ({
        className: button.className,
        backgroundColor: getComputedStyle(button).backgroundColor,
        color: getComputedStyle(button).color
      }))
    );
    assert.equal(evidenceSaveStyles.length, 9);
    assert.equal(evidenceSaveStyles.every((button) => button.className.includes("evidence-bank-save-action")), true);
    assert.equal(evidenceSaveStyles.every((button) => button.backgroundColor === "rgb(21, 66, 18)"), true);
    assert.equal(evidenceSaveStyles.every((button) => button.color === "rgb(255, 255, 255)"), true);
    assert.equal(await page.locator("[data-analysis-term-id]").count(), 9);
    assert.equal(await page.locator("[data-analysis-story-select] option").count(), 5);
    for (const termId of WORKBENCH_TERM_IDS) {
      await page.locator(`[data-analysis-term-id="${termId}"]`).click();
      for (const readingId of ["lamp-at-noon", "sea-devil", "do-not-fall", "men-must-pay", "we-must-not-return"]) {
        await page.selectOption("[data-analysis-story-select]", readingId);
        assert.equal(await page.locator(".analysis-example-card").count(), 2, `${termId}/${readingId} should render two examples`);
      }
    }
    const planner = page.locator('[data-response-id="personal-response:idea"]');
    await planner.fill("The text shows how pressure reveals what a person values.");
    await page.reload();
    assert.equal(await planner.inputValue(), "The text shows how pressure reveals what a person values.");

    const hintButton = page.getByRole("button", { name: "Show Hints", exact: true });
    assert.equal(await page.locator("[data-writing-hint]:visible").count(), 0);
    await hintButton.click();
    assert.equal(await page.getByRole("button", { name: "Hide Hints", exact: true }).getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator("[data-writing-hint]:visible").count(), 6);
    await page.getByRole("button", { name: "Hide Hints", exact: true }).click();
    assert.equal(await page.locator("[data-writing-hint]:visible").count(), 0);

    const writingEvidence = page.locator('[data-evidence-capture="writing-studio"]');
    await writingEvidence.locator('[data-evidence-draft="source"]').selectOption("lamp-at-noon");
    await writingEvidence.locator('[data-evidence-draft="concept"]').selectOption("setting");
    await writingEvidence.locator('[data-evidence-draft="detail"]').fill("The dust erases the horizon and traps the family inside the storm.");
    await writingEvidence.locator('[data-evidence-draft="connection"]').fill("The setting externalizes the pressure and isolation shaping Paul and Ellen's conflict.");
    await writingEvidence.getByRole("button", { name: "Save to Evidence Bank", exact: true }).click();
    await page.goto(`http://127.0.0.1:${address.port}/index.html#evidence-bank`);
    assert.equal(await page.locator("[data-manual-evidence-list] .social-manual-evidence-card").count(), 3);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /The Lamp at Noon \| Writing Studio/);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /Setting/);
    await page.reload();
    assert.equal(await page.locator("[data-manual-evidence-list] .social-manual-evidence-card").count(), 3);

    await page.goto(`http://127.0.0.1:${address.port}/index.html#writing-studio`);

    const responsePlanner = page.locator("#personal-response-planner");
    assert.equal(await responsePlanner.locator("[data-evidence-question-number]").count(), 6);
    assert.equal(await responsePlanner.locator(".writing-studio-evidence-actions [data-save-response-collection]").count(), 1);
    assert.equal(
      await responsePlanner.evaluate((element) => {
        const finalField = element.querySelector('[data-response-id="personal-response:draft"]');
        const actions = element.querySelector(".writing-studio-evidence-actions");
        return Boolean(finalField && actions && finalField.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING);
      }),
      true
    );
    await responsePlanner.getByRole("button", { name: "Save Response to Evidence Bank", exact: true }).click();
    assert.equal(await responsePlanner.locator("[data-response-collection-status]").innerText(), "Response saved to Evidence Bank");
    assert.equal(await planner.inputValue(), "The text shows how pressure reveals what a person values.");
    await page.goto(`http://127.0.0.1:${address.port}/index.html#evidence-bank`);
    assert.equal(await page.locator("[data-manual-evidence-list] .social-manual-evidence-card").count(), 4);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /Writing Studio \| Build Your Response/);
    assert.match(await page.locator("[data-manual-evidence-list]").innerText(), /The text shows how pressure reveals what a person values/);
    await page.goto(`http://127.0.0.1:${address.port}/index.html#writing-studio`);
    assert.equal(await planner.inputValue(), "The text shows how pressure reveals what a person values.");

    await page.evaluate(() => {
      (window as Window & { __englishPrintCalls?: number }).__englishPrintCalls = 0;
      window.print = () => {
        (window as Window & { __englishPrintCalls?: number }).__englishPrintCalls =
          ((window as Window & { __englishPrintCalls?: number }).__englishPrintCalls ?? 0) + 1;
      };
    });
    await page.locator("[data-worksheet-print]").click();
    await page.waitForTimeout(20);
    assert.equal(await page.locator(".print-job-root").count(), 1);
    assert.equal(await page.locator(".print-job-root [data-writing-activity-panel]").count(), 1);
    assert.equal(await page.locator(".print-job-root [data-analysis-explorer]").count(), 0);
    assert.equal(await page.locator('.print-job-root [data-response-id="personal-response:idea"]').inputValue(), "The text shows how pressure reveals what a person values.");
    assert.equal(await page.evaluate(() => (window as Window & { __englishPrintCalls?: number }).__englishPrintCalls), 1);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`http://127.0.0.1:${address.port}/index.html#writing-studio`);
    assert.equal(await page.locator("[data-analysis-term-list]").isVisible(), false);
    assert.equal(await page.locator("[data-analysis-term-select]").isVisible(), true);
    const sizes = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
    assert.equal(sizes.scrollWidth <= sizes.innerWidth + 1, true);
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
