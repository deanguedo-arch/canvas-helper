import assert from "node:assert/strict";
import test from "node:test";

import JSZip from "jszip";

import {
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
    utf16Html(`<!doctype html><html><body><h1>Scene 1 Overview</h1><p>Blanche arrives in New Orleans.</p></body></html>`)
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
  assert.match(html, /const staticPages = \["overview","lessons","writing","readings","library","film-room","resources"\]/);
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

  assert.match(header, /top-progress-shell/);
  assert.match(header, /id="top-progress-fill"/);
  assert.match(header, /id="top-progress-count"/);
  assert.match(header, /id="top-progress-percent"/);
  assert.match(header, /aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"/);
  assert.doesNotMatch(header, /id="sidebar-toggle"/);
  assert.match(aside, /id="sidebar-toggle"/);
  assert.match(html, /const totalLessons = 2;/);
  assert.match(html, /const progressPercent = totalLessons \? Math\.round\(\(complete\.size \/ totalLessons\) \* 100\) : 0;/);
  assert.match(html, /progressFill\.style\.width = `\$\{progressPercent\}%`;/);
  assert.match(html, /progressBar\.setAttribute\("aria-valuenow", String\(progressPercent\)\);/);
});
