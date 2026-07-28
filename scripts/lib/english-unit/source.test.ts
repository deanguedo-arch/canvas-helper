import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import JSZip from "jszip";

import { cleanEnglishLesson, collectVerifiedVideos, scrubEnglishLmsDeliveryScaffolding } from "./source.js";
import type { EnglishBuildReportItem, EnglishUnitRecipe } from "./types.js";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=",
  "base64"
);

function recipe(projectSlug: string, schemaVersion: 1 | 2 = 2) {
  return {
    schemaVersion,
    projectSlug,
    wordingCorrections: [],
    mediaPolicy: {
      allowedYouTubeIds: [],
      blockedYouTubeIds: [],
      approvedExternalUrls: [],
      externalUrlRewrites: {}
    }
  } as unknown as EnglishUnitRecipe;
}

async function withWorkspace(run: (workspaceDir: string) => Promise<void>) {
  const workspaceDir = await mkdtemp(path.join(tmpdir(), "english-source-test-"));
  try {
    await run(workspaceDir);
  } finally {
    await rm(workspaceDir, { recursive: true, force: true });
  }
}

test("lesson cleanup recovers a uniquely misaddressed image and supplies useful alt text", async () => {
  await withWorkspace(async (workspaceDir) => {
    const zip = new JSZip();
    zip.file("content/lesson.html", '<html><body><p><img src="images/cabinet-des-dr-caligari-01%20(1).jpg"></p><p>The distinctive mise-en-scene of The Cabinet of Dr. Caligari.</p></body></html>');
    zip.file("elsewhere/cabinet-des-dr-caligari-01 (1).jpg", onePixelPng);
    const reportItems: EnglishBuildReportItem[] = [];
    const cleaned = await cleanEnglishLesson({
      zip,
      sourceHref: "content/lesson.html",
      title: "Formal Elements of Film",
      workspaceDir,
      recipe: recipe("ela20-1-feature-film"),
      reportItems
    });

    assert.match(cleaned.html, /assets\/generated\/lessons\/formal-elements-of-film-cabinet-des-dr-caligari-01-1\.jpg/);
    assert.match(cleaned.html, /alt="Formal Elements of Film - cabinet des dr caligari 01 \(1\)"/);
    assert.ok(reportItems.some((item) => /Recovered a misaddressed image/.test(item.note)));
    await readFile(path.join(workspaceDir, "assets/generated/lessons/formal-elements-of-film-cabinet-des-dr-caligari-01-1.jpg"));
  });
});

test("ELA 20-1 cleanup replaces contaminated Student Samples content with a truthful model-review activity", async () => {
  await withWorkspace(async (workspaceDir) => {
    const zip = new JSZip();
    zip.file("content/student-samples.html", "<html><body><h1>Student Samples</h1><p>English Language Arts 30–1 examination samples rated Satisfactory, Proficient, and Excellent.</p></body></html>");
    const cleaned = await cleanEnglishLesson({
      zip,
      sourceHref: "content/student-samples.html",
      title: "Student Samples",
      workspaceDir,
      recipe: recipe("ela20-1-modern-play-crucible"),
      reportItems: []
    });

    assert.match(cleaned.html, /Using Response Models/);
    assert.match(cleaned.html, /Use the response model to study how an effective critical response is built/);
    assert.doesNotMatch(cleaned.html, /inherited|source page|unavailable|not included/i);
    assert.doesNotMatch(cleaned.html, /30[–-]1|examination labels|Satisfactory|Proficient|Excellent/);
  });
});

test("Macbeth Online cleanup removes orphaned link instructions and points learners to available unit surfaces", async () => {
  await withWorkspace(async (workspaceDir) => {
    const zip = new JSZip();
    zip.file("content/macbeth-online.html", "<html><body><h1>Macbeth Online</h1><h2>The sites found in the links above provide you with the following:</h2><p>Take some time to peruse the sites. Read the play through this site.</p></body></html>");
    const cleaned = await cleanEnglishLesson({
      zip,
      sourceHref: "content/macbeth-online.html",
      title: "Macbeth Online",
      workspaceDir,
      recipe: recipe("ela20-1-shakespeare-macbeth"),
      reportItems: []
    });

    assert.match(cleaned.html, /Use <strong>Macbeth Materials<\/strong>/);
    assert.doesNotMatch(cleaned.html, /links above|peruse the sites|through this site|verified MIT|external myShakespeare/i);
  });
});

test("ELA 10-1 cleanup replaces Brightspace-only directions with the real course workflow", () => {
  const novel = scrubEnglishLmsDeliveryScaffolding({
    courseCode: "ELA 10-1",
    title: "Synopsis and What to Consider Before Reading",
    html: '<div class="card"><p>Make sure to access the assignment prior to starting to read your novel so you do not miss any pre-reading questions.</p></div><p><span class="sr-only">(this link opens in a new window/tab)</span></p>'
  });
  assert.match(novel.html, /Review the Critical Essay, Reading Guide, and Novel Study Questions/);
  assert.doesNotMatch(novel.html, /access the assignment|new window\/tab/i);

  const shortStory = scrubEnglishLmsDeliveryScaffolding({
    courseCode: "ELA 10-1",
    title: "Writing a Short Story Analysis",
    html: '<p>Click the link to watch the video.</p><p>You can make a copy of this template by clicking on the following link:</p><div class="card">Short Story Analysis Template</div><p>Read The Visitor (provided on the next page). This is the story that you will use to write a short story analysis as part of your unit 2 assignment.</p>'
  });
  assert.match(shortStory.html, /Use the Short Story Bank/);
  assert.doesNotMatch(shortStory.html, /Click the link|copy of this template|provided on the next page|unit 2 assignment/i);

  const literaryTerms = scrubEnglishLmsDeliveryScaffolding({
    courseCode: "ELA 10-1",
    title: "Literary Terms Review",
    html: "<p>For a printable version, you can make a copy by clicking the following link: ELA 10-2 U4 Reading Comprehension Review</p>"
  });
  assert.match(literaryTerms.html, /Use this glossary as a course reference/);
  assert.doesNotMatch(literaryTerms.html, /printable version|make a copy|ELA 10-2/i);

  const film = scrubEnglishLmsDeliveryScaffolding({
    courseCode: "ELA 10-1",
    title: "Lion",
    html: "<h4>OPEN the following google doc if you are watching Lion and complete the assignment.</h4>"
  });
  assert.match(film.html, /Viewing Guide/);
  assert.match(film.html, /Film Study Questions/);
  assert.doesNotMatch(film.html, /google doc|complete the assignment/i);
});

test("ELA 10-2 cleanup removes donor LMS scaffolding without reintroducing Critical Essay", () => {
  const novel = scrubEnglishLmsDeliveryScaffolding({
    courseCode: "ELA 10-2",
    title: "Synopsis and What to Consider Before Reading",
    html: '<div class="card"><p>Make sure to access the assignment prior to starting to read your novel so you do not miss any pre-reading questions.</p></div><p><span class="sr-only">(this link opens in a new window/tab)</span></p><img src="cover.jpg" data-d2l-editor-default-img-style="true">'
  });
  assert.match(novel.html, /Review the Literary Exploration, Reading Guide, and Novel Study Questions/);
  assert.doesNotMatch(novel.html, /Critical Essay|access the assignment|new window\/tab|data-d2l-editor-default-img-style/i);

  const response = scrubEnglishLmsDeliveryScaffolding({
    courseCode: "ELA 10-2",
    title: "How to Respond to Literature",
    html: "<p><strong>Remember to use this format</strong> when responding. If you choose not to, you may have to re-submit your work in the proper format.</p>"
  });
  assert.match(response.html, /Use this response structure/);
  assert.doesNotMatch(response.html, /re-submit|work returned/i);
});

test("supporting irony helper reports the same generated path used by the learner link", async () => {
  await withWorkspace(async (workspaceDir) => {
    const zip = new JSZip();
    zip.file("content/lesson.html", '<html><body><p><a href="rhw_irony.html">Check your answer.</a></p></body></html>');
    zip.file("content/rhw_irony.html", "<html><body><p>Irony helper.</p></body></html>");
    const reportItems: EnglishBuildReportItem[] = [];
    const cleaned = await cleanEnglishLesson({
      zip,
      sourceHref: "content/lesson.html",
      title: "Irony",
      workspaceDir,
      recipe: recipe("ela20-1-short-stories-pilot", 1),
      reportItems
    });

    assert.match(cleaned.html, /href="resources\/generated\/rhw-irony\.html"/);
    assert.ok(reportItems.some((item) => item.destination === "workspace/resources/generated/rhw-irony.html"));
    await readFile(path.join(workspaceDir, "resources/generated/rhw-irony.html"));
  });
});

test("Film Room labels use the nearby concept heading and distinguish repeated videos", () => {
  const mediaRecipe = recipe("ela20-1-feature-film") as EnglishUnitRecipe;
  mediaRecipe.mediaPolicy.allowedYouTubeIds = ["videoOne", "videoTwo"];
  const videos = collectVerifiedVideos([{
    id: "lesson-editing-sound",
    title: "Editing and Sound",
    sourceHref: "content/film.html",
    text: "Editing videos",
    supportingResources: [],
    html: '<h2>Editing</h2><p><iframe src="https://www.youtube.com/embed/videoOne"></iframe></p><p><iframe src="https://www.youtube.com/embed/videoTwo"></iframe></p>'
  }], mediaRecipe);

  assert.deepEqual(videos.map((video) => video.lessonTitle), [
    "Editing and Sound - Editing",
    "Editing and Sound - Editing (2)"
  ]);
});
