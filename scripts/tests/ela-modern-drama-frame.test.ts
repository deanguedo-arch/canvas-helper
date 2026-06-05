import assert from "node:assert/strict";
import test from "node:test";

import JSZip from "jszip";

import {
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
