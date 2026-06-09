import assert from "node:assert/strict";
import test from "node:test";

import JSZip from "jszip";

import {
  buildProjectManifest,
  buildWorkspaceHtml,
  decodeBrightspaceHtml,
  extractModernDramaUnit,
  resolveModernDramaAssetPath
} from "../lib/ela-modern-drama.js";

function utf16Html(value: string) {
  return Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(value, "utf16le")]);
}

test("decodeBrightspaceHtml handles UTF-16 Brightspace lesson files", () => {
  const decoded = decodeBrightspaceHtml(utf16Html("<h1>Modern Drama</h1><p>Critical response</p>"));

  assert.match(decoded, /Modern Drama/);
  assert.match(decoded, /Critical response/);
});

test("resolveModernDramaAssetPath normalizes encoded and malformed D2L image paths", () => {
  const zipEntries = new Set([
    "modern_drama/images/a Doll's house1.jpg",
    "modern_drama/images/streetcar.jpg"
  ]);

  assert.equal(
    resolveModernDramaAssetPath({
      lessonHref: "modern_drama/A Doll's House.html",
      rawSrc: "images/a%20Doll&#39;s%20house1.jpg",
      zipEntries
    }),
    "modern_drama/images/a Doll's house1.jpg"
  );

  assert.equal(
    resolveModernDramaAssetPath({
      lessonHref: "modern_drama/a_streetcar_named_desire_unit_intro.html",
      rawSrc:
        "modern_drama/streetcar_named_desire/%2Fcontent%2Fcbel%2Fela%2Fcbel07junela301baseline%2Fmodern_drama%2Fstreetcar_named_desire%2F..%2Fimages%2Fstreetcar.jpg",
      zipEntries
    }),
    "modern_drama/images/streetcar.jpg"
  );
});

test("extractModernDramaUnit reads the manifest sequence and lesson content", async () => {
  const zip = new JSZip();
  zip.file(
    "imsmanifest.xml",
    `<?xml version="1.0" encoding="utf-8"?>
    <manifest xmlns="http://www.imsglobal.org/xsd/imscp_v1p1">
      <organizations>
        <organization>
          <item identifierref="RES_CONTENT_3535">
            <title>Modern Drama</title>
            <item identifierref="RES_CONTENT_3536"><title>Modern Drama - Introduction</title></item>
            <item identifierref="RES_CONTENT_3537"><title>Lesson 1: Characteristics of Modern Drama</title></item>
          </item>
        </organization>
      </organizations>
      <resources>
        <resource identifier="RES_CONTENT_3535" type="webcontent" />
        <resource identifier="RES_CONTENT_3536" type="webcontent" href="modern_drama\\modern_drama_unit_introduction.html" />
        <resource identifier="RES_CONTENT_3537" type="webcontent" href="modern_drama\\characteristics_of_modern_drama.html" />
      </resources>
    </manifest>`
  );
  zip.file(
    "modern_drama/modern_drama_unit_introduction.html",
    utf16Html(`<!doctype html><html><body><h1>Modern Drama Introduction</h1><p>In this unit, you will read modern drama.</p></body></html>`)
  );
  zip.file(
    "modern_drama/characteristics_of_modern_drama.html",
    utf16Html(`<!doctype html><html><body><h1>Characteristics of Modern Drama</h1><p>Drama is meant to be seen or heard.</p><p><img src="images/drama_masks_jpg.jpg" alt="Drama masks" /></p><p><iframe width="500" height="375" src="https://www.youtube.com/embed/a9G7lU8J21Y?rel=0"></iframe></p><p><a href="https://www.youtube.com/watch?v=sr3nw7CZvO8">A Doll's House-Full Play</a></p></body></html>`)
  );
  zip.file("modern_drama/images/drama_masks_jpg.jpg", "image-bytes");

  const unit = await extractModernDramaUnit(await zip.generateAsync({ type: "nodebuffer" }));

  assert.equal(unit.title, "Modern Drama");
  assert.equal(unit.lessons.length, 2);
  assert.equal(unit.lessons[0].title, "Modern Drama - Introduction");
  assert.equal(unit.lessons[1].title, "Lesson 1: Characteristics of Modern Drama");
  assert.match(unit.lessons[1].text, /seen or heard/);
  assert.equal(unit.lessons[1].images[0]?.zipPath, "modern_drama/images/drama_masks_jpg.jpg");
  assert.match(unit.lessons[1].contentHtml, /assets\/source\/drama-masks-jpg\.jpg/);
  assert.deepEqual(
    unit.lessons[1].videos.map((video) => video.embedSrc),
    ["https://www.youtube.com/embed/a9G7lU8J21Y?rel=0", "https://www.youtube.com/embed/sr3nw7CZvO8"]
  );
  assert.match(unit.lessons[1].contentHtml, /source-video-frame/);
});

test("extractModernDramaUnit imports the Streetcar branch including scenes and PDF lessons", async () => {
  const zip = new JSZip();
  zip.file(
    "imsmanifest.xml",
    `<?xml version="1.0" encoding="utf-8"?>
    <manifest xmlns="http://www.imsglobal.org/xsd/imscp_v1p1">
      <organizations>
        <organization>
          <item identifierref="RES_CONTENT_3544">
            <title>A Steetcar Named Desire</title>
            <item identifierref="RES_CONTENT_3545"><title>A Streetcar Named Desire - Introduction</title></item>
            <item identifierref="RES_CONTENT_3546"><title>Lesson 1: Tennessee Williams</title></item>
            <item identifierref="RES_CONTENT_3549"><title>Lesson 4: A Streetcar Named Desire questions</title></item>
            <item identifierref="RES_CONTENT_3557">
              <title>Scene Overviews</title>
              <item identifierref="RES_CONTENT_3558"><title>Scene 1 Overview</title></item>
            </item>
          </item>
        </organization>
      </organizations>
      <resources>
        <resource identifier="RES_CONTENT_3544" type="webcontent" />
        <resource identifier="RES_CONTENT_3545" type="webcontent" href="streetcar_named_desire\\a_streetcar_named_desire_unit_intro.html" />
        <resource identifier="RES_CONTENT_3546" type="webcontent" href="streetcar_named_desire\\Tennessee Williams.html" />
        <resource identifier="RES_CONTENT_3549" type="webcontent" href="streetcar_named_desire\\assets\\A Streetcar Named Desire questions.pdf" />
        <resource identifier="RES_CONTENT_3557" type="webcontent" />
        <resource identifier="RES_CONTENT_3558" type="webcontent" href="streetcar_named_desire\\Scene 1 Overview.html" />
      </resources>
    </manifest>`
  );
  zip.file(
    "streetcar_named_desire/a_streetcar_named_desire_unit_intro.html",
    utf16Html(`<!doctype html><html><body><h1>Streetcar Introduction</h1><p>Begin studying the play.</p></body></html>`)
  );
  zip.file(
    "streetcar_named_desire/Tennessee Williams.html",
    utf16Html(`<!doctype html><html><body><h1>Tennessee Williams</h1><p>Learn about the playwright.</p><img src="images/tennessee_williams_pjoto.jpg" alt="Tennessee Williams" /></body></html>`)
  );
  zip.file(
    "streetcar_named_desire/Scene 1 Overview.html",
    utf16Html(`<!doctype html><html><body><h1>Scene 1 Overview</h1><p>Blance arrives in New Orleans.</p><p><a href="https://www.cliffsnotes.com/literature/s/a-streetcar-named-desire/summary-and-analysis/scene-1">Scene 1 Cliffnotes overview</a></p></body></html>`)
  );
  zip.file("streetcar_named_desire/assets/A Streetcar Named Desire questions.pdf", "%PDF-1.4");
  zip.file("streetcar_named_desire/images/tennessee_williams_pjoto.jpg", "image-bytes");

  const unit = await extractModernDramaUnit(await zip.generateAsync({ type: "nodebuffer" }));

  assert.equal(unit.title, "A Streetcar Named Desire");
  assert.deepEqual(
    unit.lessons.map((lesson) => lesson.title),
    [
      "A Streetcar Named Desire - Introduction",
      "Lesson 1: Tennessee Williams",
      "Lesson 4: A Streetcar Named Desire questions",
      "Scene 1 Overview"
    ]
  );
  assert.equal(unit.lessons[1].images[0]?.zipPath, "streetcar_named_desire/images/tennessee_williams_pjoto.jpg");
  assert.equal(unit.lessons[2].sourceKind, "pdf");
  assert.match(unit.lessons[2].contentHtml, /source-document-frame/);
  assert.match(unit.lessons[2].contentHtml, /assets\/source\/A-Streetcar-Named-Desire-questions\.pdf/);
  assert.match(unit.lessons[3].contentHtml, /Blanche arrives/);
  assert.match(unit.lessons[3].contentHtml, /CliffsNotes overview/);
  assert.doesNotMatch(unit.lessons[3].contentHtml, /Blance|Cliffnotes/);
});

test("extractModernDramaUnit combines multiple scene overviews into one dropdown lesson", async () => {
  const zip = new JSZip();
  zip.file(
    "imsmanifest.xml",
    `<?xml version="1.0" encoding="utf-8"?>
    <manifest xmlns="http://www.imsglobal.org/xsd/imscp_v1p1">
      <organizations>
        <organization>
          <item identifierref="RES_CONTENT_3544">
            <title>A Steetcar Named Desire</title>
            <item identifierref="RES_CONTENT_3545"><title>A Streetcar Named Desire - Introduction</title></item>
            <item identifierref="RES_CONTENT_3557">
              <title>Scene Overviews</title>
              <item identifierref="RES_CONTENT_3558"><title>Scene 1 Overview</title></item>
              <item identifierref="RES_CONTENT_3559"><title>Scene 2 Overview</title></item>
            </item>
            <item identifierref="RES_CONTENT_3560"><title>Lesson 12: Writing a Critical and Analytical Response to Text(s)</title></item>
          </item>
        </organization>
      </organizations>
      <resources>
        <resource identifier="RES_CONTENT_3544" type="webcontent" />
        <resource identifier="RES_CONTENT_3545" type="webcontent" href="streetcar_named_desire\\a_streetcar_named_desire_unit_intro.html" />
        <resource identifier="RES_CONTENT_3557" type="webcontent" />
        <resource identifier="RES_CONTENT_3558" type="webcontent" href="streetcar_named_desire\\Scene 1 Overview.html" />
        <resource identifier="RES_CONTENT_3559" type="webcontent" href="streetcar_named_desire\\Scene 2 Overview.html" />
        <resource identifier="RES_CONTENT_3560" type="webcontent" href="streetcar_named_desire\\writing.html" />
      </resources>
    </manifest>`
  );
  zip.file(
    "streetcar_named_desire/a_streetcar_named_desire_unit_intro.html",
    utf16Html(`<!doctype html><html><body><h1>Streetcar Introduction</h1><p>Begin studying the play.</p></body></html>`)
  );
  zip.file(
    "streetcar_named_desire/Scene 1 Overview.html",
    utf16Html(`<!doctype html><html><body><h1>Scene 1 Overview</h1><p>Blanche arrives.</p></body></html>`)
  );
  zip.file(
    "streetcar_named_desire/Scene 2 Overview.html",
    utf16Html(`<!doctype html><html><body><h1>Scene 2 Overview</h1><p>Stanley checks the papers.</p></body></html>`)
  );
  zip.file(
    "streetcar_named_desire/writing.html",
    utf16Html(`<!doctype html><html><body><h1>Writing Response</h1><p>Prepare the essay.</p></body></html>`)
  );

  const unit = await extractModernDramaUnit(await zip.generateAsync({ type: "nodebuffer" }));

  assert.deepEqual(
    unit.lessons.map((lesson) => lesson.title),
    [
      "A Streetcar Named Desire - Introduction",
      "Scene Overviews",
      "Lesson 12: Writing a Critical and Analytical Response to Text(s)"
    ]
  );
  assert.equal(unit.lessons[1].id, "scene-overviews");
  assert.equal(unit.lessons[1].sequence, 2);
  assert.match(unit.lessons[1].contentHtml, /data-scene-overview-select/);
  assert.match(unit.lessons[1].contentHtml, /<option value="scene-1-overview" selected>Scene 1 Overview<\/option>/);
  assert.match(unit.lessons[1].contentHtml, /<option value="scene-2-overview">Scene 2 Overview<\/option>/);
  assert.match(unit.lessons[1].contentHtml, /data-scene-overview-panel="scene-1-overview"/);
  assert.match(unit.lessons[1].contentHtml, /data-scene-overview-panel="scene-2-overview" hidden/);
  assert.match(unit.lessons[1].contentHtml, /Blanche arrives/);
  assert.match(unit.lessons[1].contentHtml, /Stanley checks the papers/);
});

test("buildWorkspaceHtml keeps the lesson library separate from individual lesson pages", () => {
  const html = buildWorkspaceHtml({
    title: "Modern Drama",
    localResources: [],
    lessons: [
      {
        id: "lesson-one",
        sequence: 1,
        title: "Lesson One",
        sourceKind: "html",
        sourceHref: "modern_drama/lesson-one.html",
        contentHtml: "<h1>Lesson One</h1><p>Full lesson content.</p>",
        text: "Lesson One Full lesson content.",
        images: [],
        videos: [],
        links: []
      },
      {
        id: "lesson-two",
        sequence: 2,
        title: "Lesson Two",
        sourceKind: "html",
        sourceHref: "modern_drama/lesson-two.html",
        contentHtml: "<h1>Lesson Two</h1><p>Second full lesson content.</p>",
        text: "Lesson Two Second full lesson content.",
        images: [],
        videos: [],
        links: []
      }
    ]
  });

  const lessonsSection = html.match(/<section id="lessons"[\s\S]*?<\/section>\s*<section id="lesson-one"/)?.[0] ?? "";

  assert.match(lessonsSection, /<a class="lesson-card[\s\S]*href="#lesson-one"/);
  assert.doesNotMatch(lessonsSection, /data-lesson-panel=/);
  assert.match(html, /<section id="lesson-one" class="course-page" data-page="lesson-one" hidden>/);
  assert.match(html, /function route\(\) \{[\s\S]*showPage\(hash\)/);
  assert.doesNotMatch(html, /if \(page === "lessons"\) \{\s*showLesson/);
});

test("buildWorkspaceHtml separates PDFs, videos, and external sources into dedicated routes", () => {
  const pdfHref = "./assets/source/A-Streetcar-Named-Desire-questions.pdf";
  const videoHref = "https://www.youtube.com/watch?v=abc123";
  const externalHref =
    "https://www.cliffsnotes.com/literature/s/a-streetcar-named-desire/summary-and-analysis/scene-1";
  const html = buildWorkspaceHtml({
    title: "A Streetcar Named Desire",
    localResources: [],
    lessons: [
      {
        id: "scene-one-overview",
        sequence: 1,
        title: "Scene 1 Overview",
        sourceKind: "html",
        sourceHref: "streetcar_named_desire/Scene 1 Overview.html",
        contentHtml: `<h1>Scene 1 Overview</h1><p>Blanche arrives.</p><p><a href="${externalHref}">Scene 1 Overview</a></p>`,
        text: "Scene 1 Overview Blanche arrives.",
        images: [],
        videos: [
          {
            title: "Streetcar staging clip",
            originalSrc: videoHref,
            embedSrc: "https://www.youtube.com/embed/abc123",
            origin: "link"
          },
          {
            title: "Streetcar performance clip",
            originalSrc: "https://www.youtube.com/watch?v=def456",
            embedSrc: "https://www.youtube.com/embed/def456",
            origin: "link"
          },
          {
            title: "Embedded video",
            originalSrc: "https://www.youtube.com/watch?v=ghi789",
            embedSrc: "https://www.youtube.com/embed/ghi789",
            origin: "iframe"
          }
        ],
        links: [
          {
            text: "Scene 1 Overview",
            href: externalHref,
            kind: "external",
            workspaceHref: externalHref
          },
          {
            text: "Streetcar staging clip",
            href: videoHref,
            kind: "external",
            workspaceHref: videoHref
          }
        ]
      },
      {
        id: "streetcar-questions",
        sequence: 2,
        title: "A Streetcar Named Desire questions",
        sourceKind: "pdf",
        sourceHref: "streetcar_named_desire/assets/A Streetcar Named Desire questions.pdf",
        contentHtml: `<h1>A Streetcar Named Desire questions</h1><iframe class="source-document-frame" src="${pdfHref}" title="A Streetcar Named Desire questions"></iframe>`,
        text: "A Streetcar Named Desire questions Local PDF.",
        images: [],
        videos: [],
        links: [
          {
            text: "Open A Streetcar Named Desire questions",
            href: "streetcar_named_desire/assets/A Streetcar Named Desire questions.pdf",
            kind: "local",
            workspaceHref: pdfHref,
            zipPath: "streetcar_named_desire/assets/A Streetcar Named Desire questions.pdf"
          }
        ],
        document: {
          title: "A Streetcar Named Desire questions",
          zipPath: "streetcar_named_desire/assets/A Streetcar Named Desire questions.pdf",
          workspaceHref: pdfHref,
          kind: "pdf"
        }
      }
    ]
  });

  const sliceRoute = (id: string, next: string) => {
    const start = html.indexOf(`<section id="${id}"`);
    const end = html.indexOf(next, start + 1);
    assert.notEqual(start, -1, `${id} route should exist`);
    assert.notEqual(end, -1, `${id} route should have a following boundary`);
    return html.slice(start, end);
  };

  const librarySection = sliceRoute("library", `<section id="film-room"`);
  const filmRoomSection = sliceRoute("film-room", `<section id="resources"`);
  const resourcesSection = sliceRoute("resources", "</main>");

  assert.match(html, /data-page-target="library"[\s\S]*>Library</);
  assert.match(html, /data-page-target="film-room"[\s\S]*>Film Room</);
  assert.doesNotMatch(html, /data-page-target="readings"/);
  assert.doesNotMatch(html, /<section id="readings"/);
  assert.match(html, /const staticPages = \["overview","lessons","writing","library","film-room","resources"\]/);
  assert.doesNotMatch(html, /purchase a copy of the play/);
  assert.doesNotMatch(html, /email your instructor for assistance/);
  assert.match(librarySection, /A-Streetcar-Named-Desire-questions\.pdf/);
  assert.match(librarySection, /Download PDF/);
  assert.match(filmRoomSection, /https:\/\/www\.youtube\.com\/embed\/abc123/);
  assert.match(filmRoomSection, /Open Source/);
  assert.match(filmRoomSection, /<select id="film-room-select" class="film-room-select" data-film-select>/);
  assert.match(filmRoomSection, /<option value="film-1-streetcar-staging-clip" selected>Streetcar staging clip<\/option>/);
  assert.match(filmRoomSection, /<option value="film-2-streetcar-performance-clip">Streetcar performance clip<\/option>/);
  assert.match(filmRoomSection, /<option value="film-3-scene-1-overview">Scene 1 Overview<\/option>/);
  assert.match(filmRoomSection, /data-film-now-panel="film-1-streetcar-staging-clip"/);
  assert.match(filmRoomSection, /Now loaded/);
  assert.match(filmRoomSection, /1 \/ 3/);
  assert.doesNotMatch(filmRoomSection, /data-film-target|film-playlist-item/);
  assert.match(html, /document\.querySelector\("\[data-film-select\]"\)\?\.addEventListener\("change"/);
  assert.match(resourcesSection, /Scene 1 Overview/);
  assert.match(resourcesSection, /Open Resource/);
  assert.doesNotMatch(resourcesSection, /A-Streetcar-Named-Desire-questions\.pdf/);
  assert.doesNotMatch(resourcesSection, /youtube\.com\/embed\/abc123/);
});

test("buildWorkspaceHtml wires top-bar lesson progress and keeps collapse control in the sidebar", () => {
  const html = buildWorkspaceHtml({
    title: "A Streetcar Named Desire",
    localResources: [],
    lessons: [
      {
        id: "lesson-one",
        sequence: 1,
        title: "Lesson One",
        sourceKind: "html",
        sourceHref: "streetcar_named_desire/lesson-one.html",
        contentHtml: "<h1>Lesson One</h1>",
        text: "Lesson One",
        images: [],
        videos: [],
        links: []
      },
      {
        id: "lesson-two",
        sequence: 2,
        title: "Lesson Two",
        sourceKind: "html",
        sourceHref: "streetcar_named_desire/lesson-two.html",
        contentHtml: "<h1>Lesson Two</h1>",
        text: "Lesson Two",
        images: [],
        videos: [],
        links: []
      }
    ]
  });

  const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? "";
  const aside = html.match(/<aside[\s\S]*?<\/aside>/)?.[0] ?? "";

  assert.match(header, /class="topbar-logo-link"/);
  assert.match(header, /<img class="next-step-logo" src="assets\/brand\/nxt-ce-logo-white-with-ce\.png" alt="Next Step">/);
  assert.match(html, /\.course-topbar \{[^}]*grid-template-columns: minmax\(0, 1fr\) auto minmax\(0, 1fr\)/);
  assert.match(html, /\.topbar-logo-link \{[^}]*grid-column: 2;[^}]*justify-self: center;/);
  assert.doesNotMatch(header, /theater_comedy/);
  assert.doesNotMatch(header, /<span class="font-label-md text-label-md">ELA 30-1<\/span>/);
  assert.doesNotMatch(html, /\.next-step-logo \{[^}]*background: #fff/);
  assert.doesNotMatch(html, /\.next-step-logo \{[^}]*padding:/);
  assert.doesNotMatch(header, /course-header-title/);
  assert.doesNotMatch(header, /A Streetcar Named Desire/);
  assert.match(header, /top-progress-shell/);
  assert.match(header, /id="top-progress-fill"/);
  assert.match(header, /id="top-progress-count"/);
  assert.match(header, /id="top-progress-percent"/);
  assert.match(header, /aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"/);
  assert.match(html, /\.top-progress-shell \{[^}]*position: absolute;[^}]*right: 24px;[^}]*top: 16px;/);
  assert.doesNotMatch(header, /id="sidebar-toggle"/);
  assert.match(aside, /id="sidebar-toggle"/);
  assert.match(html, /\.course-sidebar \.sidebar-header \{[^}]*padding-right: 76px;/);
  assert.match(html, /body\.sidebar-collapsed \.sidebar-header \{[^}]*padding: 16px 8px 12px;/);
  assert.match(aside, /data-lessons-toggle aria-expanded="false" aria-controls="lesson-subnav"/);
  assert.match(aside, /id="lesson-subnav" class="lesson-subnav/);
  assert.match(html, /\.lesson-subnav \{ display: none; \}/);
  assert.match(html, /\.lessons-nav\.is-open \.lesson-subnav \{ display: block; \}/);
  assert.match(html, /function setLessonsOpen\(open\)/);
  assert.match(html, /const lessonToggle = event\.target\.closest\("\[data-lessons-toggle\]"\);/);
  assert.match(html, /const totalLessons = 2;/);
  assert.match(html, /const progressPercent = totalLessons \? Math\.round\(\(complete\.size \/ totalLessons\) \* 100\) : 0;/);
  assert.match(html, /progressFill\.style\.width = `\$\{progressPercent\}%`;/);
  assert.match(html, /progressBar\.setAttribute\("aria-valuenow", String\(progressPercent\)\);/);
});

test("buildWorkspaceHtml integrates the critical response activity into Writing Studio", () => {
  const html = buildWorkspaceHtml({
    title: "A Streetcar Named Desire",
    localResources: [],
    lessons: [
      {
        id: "lesson-one",
        sequence: 1,
        title: "Lesson One",
        sourceKind: "html",
        sourceHref: "streetcar_named_desire/lesson-one.html",
        contentHtml: "<h1>Lesson One</h1>",
        text: "Lesson One",
        images: [],
        videos: [],
        links: []
      }
    ]
  });

  const writingSection = html.match(/<section id="writing"[\s\S]*?<\/section>\s*<section id="library"/)?.[0] ?? "";

  assert.match(writingSection, /data-critical-response-activity/);
  assert.match(writingSection, /data-workshop-tab="textKnowledge"/);
  assert.match(writingSection, /data-workshop-tab="thesisControl"/);
  assert.match(writingSection, /data-workshop-tab="evidenceCollector"/);
  assert.match(writingSection, /data-workshop-tab="paragraphArchitect"/);
  assert.doesNotMatch(writingSection, /data-workshop-tab="evidenceQuality"/);
  assert.match(writingSection, /data-question-group-tab="textKnowledge"/);
  assert.match(writingSection, /data-question-group-tab="thesisControl"/);
  assert.match(writingSection, /data-question-group-tab="evidenceQuality"/);
  assert.match(writingSection, /data-workshop-panel/);
  assert.match(html, /const criticalResponseQuestionGroups = \[/);
  assert.match(html, /const thesisBuilderActivity = \{/);
  assert.match(html, /const evidenceCollectorActivity = \{/);
  assert.match(html, /const paragraphArchitectActivity = \{/);
  assert.match(html, /Rule #1: Choosing Your Text/);
  assert.match(html, /Text Knowledge Question Bank: A Streetcar Named Desire/);
  assert.match(html, /Thesis Builder Workshop: A Streetcar Named Desire/);
  assert.match(html, /Evidence Collector: A Streetcar Named Desire/);
  assert.match(html, /Paragraph Architect: PETAL Builder/);
  assert.match(html, /Learn the Framework/);
  assert.match(html, /Master the P\.E\.T\.A\.L\. Framework/);
  assert.match(html, /data-paragraph-mode="learn"/);
  assert.match(html, /data-paragraph-mode="build"/);
  assert.match(html, /Literary Tool/);
  assert.match(html, /Collected Evidence Sentence/);
  assert.match(html, /data-evidence-collector/);
  assert.match(html, /data-evidence-choice/);
  assert.match(html, /data-evidence-copy/);
  assert.match(html, /data-evidence-restart/);
  assert.match(html, /data-paragraph-architect/);
  assert.match(html, /data-paragraph-scenario/);
  assert.match(html, /data-paragraph-choice/);
  assert.match(html, /data-paragraph-copy/);
  assert.match(html, /data-paragraph-restart/);
  assert.match(html, /Completed PETAL Paragraph/);
  assert.match(html, /the impact of illusions on reality/);
  assert.match(html, /data-workshop-option/);
  assert.match(html, /data-workshop-next/);
  assert.match(html, /data-workshop-restart/);
  assert.match(html, /data-thesis-builder/);
  assert.match(html, /data-thesis-choice/);
  assert.match(html, /data-thesis-restart/);
  assert.match(html, /data-thesis-copy/);
  assert.match(html, /function renderCriticalResponseActivity\(\)/);
  assert.match(html, /function renderThesisBuilderActivity\(\)/);
  assert.match(html, /function renderEvidenceCollectorActivity\(\)/);
  assert.match(html, /function renderParagraphArchitectActivity\(\)/);
  assert.match(html, /thesis-step-check/);
  assert.match(html, /aria-label="Completed"/);
  assert.doesNotMatch(html, /const marker = criticalResponseState\.thesisStep > number \? "check" : String\(number\);/);
  assert.match(html, /criticalResponseRoot\?\.addEventListener\("click"/);
  assert.doesNotMatch(html, /createRoot|ReactDOM|critical_response_activity\.tsx|thesis_builder_activity\.tsx|evidence_collector_activity\.tsx|petal_paragraph_architect\.tsx/);
});

test("buildWorkspaceHtml keeps imported lessons while exposing Streetcar library and film assets", () => {
  const html = buildWorkspaceHtml({
    title: "A Streetcar Named Desire",
    localResources: [],
    lessons: [
      {
        id: "streetcar-introduction",
        sequence: 1,
        title: "A Streetcar Named Desire - Introduction",
        sourceKind: "html",
        sourceHref: "streetcar_named_desire/a_streetcar_named_desire_unit_intro.html",
        contentHtml: "<h1>Streetcar Introduction</h1><p>Imported CBE lesson content.</p>",
        text: "Streetcar Introduction Imported CBE lesson content.",
        images: [],
        videos: [],
        links: []
      },
      {
        id: "scene-1-overview",
        sequence: 2,
        title: "Scene 1 Overview",
        sourceKind: "html",
        sourceHref: "streetcar_named_desire/Scene 1 Overview.html",
        contentHtml: "<h1>Scene 1 Overview</h1><p>Blanche arrives in New Orleans.</p>",
        text: "Scene 1 Overview Blanche arrives in New Orleans.",
        images: [],
        videos: [],
        links: []
      }
    ],
    libraryDocuments: [
      {
        id: "primary-text",
        group: "Primary Text",
        title: "A Streetcar Named Desire",
        sourceLabel: "Next Step",
        description: "Canonical student reading copy.",
        workspaceHref: "./assets/source/a-streetcar-named-desire.pdf",
        zipPath: "English 30-1/ELA 30-1 Readings/A Streetcar Named Desire pdf.pdf",
        kind: "pdf"
      },
      {
        id: "essay-how-to",
        group: "Essay Supports",
        title: "Critical/Analytical Essay HOW TO",
        sourceLabel: "Next Step",
        description: "Essay planning support.",
        workspaceHref: "./assets/source/critical-analytical-essay-how-to.pdf",
        zipPath: "English 30-1/LA30-1 Summative assessments/Unit 5- Modern Drama/Critical_Analytical Essay HOW TO.pdf",
        kind: "pdf"
      }
    ],
    filmResources: [
      {
        id: "streetcar-full-film",
        title: "Streetcar Named Desire Movie",
        originalSrc: "./assets/media/streetcar-named-desire-movie.mp4",
        embedSrc: "./assets/media/streetcar-named-desire-movie.mp4",
        origin: "local",
        sourceTitle: "Film Room",
        mediaType: "video/mp4"
      }
    ]
  });

  assert.match(html, /const totalLessons = 2;/);
  assert.match(html, /Imported CBE lesson content/);
  assert.match(html, /Scene 1 Overview/);
  assert.doesNotMatch(html, /authored-lesson|Learning Target|Required Output|Mini-write/);
  assert.match(html, /Primary Text/);
  assert.match(html, /Essay Supports/);
  assert.match(html, /a-streetcar-named-desire\.pdf/);
  assert.match(html, /critical-analytical-essay-how-to\.pdf/);
  assert.match(html, /streetcar-named-desire-movie\.mp4/);
  assert.match(html, /<video class="film-room-frame"/);
  assert.match(html, /href="#lesson-22-film-adaptation-lab"/);
  assert.doesNotMatch(html, /file:\/\/|encodedsrc|Blance|Cliffnotes|@2019 CBe-learn/);
});

test("buildProjectManifest tracks the critical response activity as an active injection", () => {
  const manifest = buildProjectManifest({
    slug: "ela30-1-modern-drama",
    zipPath: "C:\\Users\\dean.guedo\\Downloads\\D2LExport_6670_CBE System ELA 30-1 (Winter 2020)_20266815.zip",
    generatedAt: "2026-06-08T00:00:00.000Z"
  });

  assert.deepEqual(manifest.preferredWorkflows, ["conversion", "injection/integration"]);
  assert.deepEqual(manifest.injectedComponents, [
    {
      id: "critical-response-workshop",
      source: "C:\\Users\\dean.guedo\\Downloads\\critical_response_activity.tsx",
      target: "projects/ela30-1-modern-drama/workspace/index.html#writing",
      status: "active",
      notes: "Converted from the external TSX activity into the static Writing Studio shell."
    },
    {
      id: "thesis-builder-workshop",
      source: "C:\\Users\\dean.guedo\\Downloads\\thesis_builder_activity.tsx",
      target: "projects/ela30-1-modern-drama/workspace/index.html#writing",
      status: "active",
      notes: "Converted from the external thesis builder TSX into the static Thesis Workshop panel."
    },
    {
      id: "evidence-collector-workshop",
      source: "C:\\Users\\dean.guedo\\Downloads\\evidence_collector_activity.tsx",
      target: "projects/ela30-1-modern-drama/workspace/index.html#writing",
      status: "active",
      notes: "Converted from the external evidence collector TSX into the static Writing Studio shell."
    },
    {
      id: "paragraph-architect-workshop",
      source: "C:\\Users\\dean.guedo\\Downloads\\petal_paragraph_architect.tsx",
      target: "projects/ela30-1-modern-drama/workspace/index.html#writing",
      status: "active",
      notes: "Converted from the external PETAL paragraph architect TSX into the static Writing Studio shell."
    }
  ]);
});
