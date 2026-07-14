import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import JSZip from "jszip";

import { intakeEnglishCourse, type EnglishCourseMappingReportV1 } from "../lib/english-unit/course-intake.js";
import { parseEnglishCourseManifest, parseEnglishUnitRecipe } from "../lib/english-unit/schema.js";

const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest>
  <organizations>
    <organization identifier="org">
      <item identifier="53033"><title>Short Stories</title><item identifier="53050" identifierref="res-short"><title>Short introduction</title></item></item>
      <item identifier="53034"><title>Modern Drama</title><item identifier="53068" identifierref="res-modern"><title>Modern Drama Introduction</title></item><item identifier="53070" identifierref="res-streetcar"><title>Streetcar</title></item></item>
      <item identifier="3448"><title>Shakespeare and Modern Play</title><item identifier="3450" identifierref="res-macbeth"><title>Terminology</title></item><item identifier="3454" identifierref="res-moonlodge"><title>Moonlodge</title></item></item>
      <item identifier="53037"><title>Hamlet</title><item identifier="53095" identifierref="res-hamlet"><title>Hamlet Introduction</title></item></item>
      <item identifier="53041"><title>Novel Study</title><item identifier="53127" identifierref="res-novel"><title>Novel Introduction</title></item></item>
      <item identifier="3465"><title>Legacy Novel Study</title><item identifier="3467" identifierref="res-novel-legacy"><title>Characteristics</title></item></item>
      <item identifier="53042"><title>Film Study</title><item identifier="53128" identifierref="res-film"><title>Film Introduction</title></item></item>
      <item identifier="66075"><title>Factors and Products</title><item identifier="66076" identifierref="res-math"><title>Math lesson</title></item></item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res-short" href="short_stories/introduction.html"><file href="short_stories/introduction.html" /></resource>
    <resource identifier="res-modern" href="modern_drama/introduction.html"><file href="modern_drama/introduction.html" /></resource>
    <resource identifier="res-streetcar" href="modern_drama/streetcar.html"><file href="modern_drama/streetcar.html" /></resource>
    <resource identifier="res-macbeth" href="Module 4/terminology.html"><file href="Module 4/terminology.html" /></resource>
    <resource identifier="res-moonlodge" href="Module 4/moonlodge.html"><file href="Module 4/moonlodge.html" /></resource>
    <resource identifier="res-hamlet" href="hamlet/introduction.html"><file href="hamlet/introduction.html" /></resource>
    <resource identifier="res-novel" href="novel_study/introduction.html"><file href="novel_study/introduction.html" /></resource>
    <resource identifier="res-novel-legacy" href="Module 5/characteristics.html"><file href="Module 5/characteristics.html" /></resource>
    <resource identifier="res-film" href="film_study/introduction.html"><file href="film_study/introduction.html" /></resource>
    <resource identifier="res-math" href="Factors_and_products/factors.html"><file href="Factors_and_products/factors.html" /></resource>
  </resources>
</manifest>`;

async function writeFixtureZips(root: string) {
  const brightspace = new JSZip();
  brightspace.file("imsmanifest.xml", manifestXml);
  for (const file of [
    "short_stories/introduction.html",
    "modern_drama/introduction.html",
    "modern_drama/streetcar.html",
    "Module 4/terminology.html",
    "Module 4/moonlodge.html",
    "hamlet/introduction.html",
    "novel_study/introduction.html",
    "Module 5/characteristics.html",
    "film_study/introduction.html",
    "Factors_and_products/factors.html"
  ]) {
    brightspace.file(file, `<html><body>${file}</body></html>`);
  }
  brightspace.file("diploma_prep/Part A.html", "Diploma content");
  brightspace.file("Factors_and_products/assets/review answers.pdf", "answers");

  const teacher = new JSZip();
  teacher.file("UNIT 2 Modern Play/#001 Crucible Act 1.pdf", "act one");
  teacher.file("UNIT 2 Modern Play/MODERN PLAY UNIT HARD GATE- CRUCIBLE Critical Response to Text.doc", "gate");
  teacher.file("UNIT 3 Shakespeare/MACBETH Act Questions.pdf", "questions");
  teacher.file("UNIT 4 Novel/Major Works Data Sheet.docx", "data sheet");
  teacher.file("UNIT 5 Film Study/FILM UNIT 20-1 HARD GATE Personal Response to Text Essay Prompt.docx", "gate");
  teacher.file("ELA 20 Soft Gate Anwsers RC.docx", "answer key");
  teacher.file("Unmapped teacher note.txt", "review me");

  const brightspacePath = path.join(root, "brightspace.zip");
  const teacherPath = path.join(root, "teacher.zip");
  await Promise.all([
    writeFile(brightspacePath, await brightspace.generateAsync({ type: "nodebuffer" })),
    writeFile(teacherPath, await teacher.generateAsync({ type: "nodebuffer" }))
  ]);
  return {
    brightspacePath,
    teacherPath,
    brightspaceEntryCount: Object.keys(brightspace.files).length,
    teacherEntryCount: Object.keys(teacher.files).length
  };
}

test("ELA 20-1 intake inventories, classifies, seeds, deduplicates, and preserves recipes", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "canvas-helper-english-intake-"));
  try {
    const fixture = await writeFixtureZips(root);
    const first = await intakeEnglishCourse({
      repoRoot: root,
      courseId: "ela20-1",
      brightspaceZip: fixture.brightspacePath,
      teacherResourcesZip: fixture.teacherPath,
      now: new Date("2026-07-14T12:00:00-06:00")
    });

    assert.equal(first.recipes.filter((recipe) => recipe.status === "created").length, 4);
    assert.equal(first.recipes.find((recipe) => recipe.projectSlug === "ela20-1-short-stories-pilot")?.status, "missing-existing");
    assert.equal((await readdir(path.join(root, "projects/resources/ela20-1/_sources"))).length, 2);

    const manifest = parseEnglishCourseManifest(
      JSON.parse(await readFile(path.join(root, first.manifestPath), "utf8"))
    );
    assert.deepEqual(
      manifest.units.map((unit) => unit.projectSlug),
      [
        "ela20-1-short-stories-pilot",
        "ela20-1-modern-play-crucible",
        "ela20-1-shakespeare-macbeth",
        "ela20-1-novel-study-clean",
        "ela20-1-feature-film"
      ]
    );
    assert.equal(manifest.archives.every((archive) => /^[a-f\d]{64}$/.test(archive.sha256)), true);

    const inventory = JSON.parse(await readFile(path.join(root, first.inventoryPath), "utf8")) as {
      archives: Array<{ archiveId: string; entries: unknown[] }>;
    };
    assert.equal(inventory.archives.find((archive) => archive.archiveId === "brightspace")?.entries.length, fixture.brightspaceEntryCount);
    assert.equal(inventory.archives.find((archive) => archive.archiveId === "teacher-resources")?.entries.length, fixture.teacherEntryCount);

    const cruciblePath = path.join(root, "projects/ela20-1-modern-play-crucible/meta/english-unit.json");
    const crucible = parseEnglishUnitRecipe(JSON.parse(await readFile(cruciblePath, "utf8")));
    assert.deepEqual(
      crucible.source.lessonSelectors.filter((selector) => selector.disposition === "include").map((selector) => selector.itemId),
      ["53068", "53069", "53074", "53075"]
    );
    assert.deepEqual(
      crucible.source.lessonSelectors.filter((selector) => selector.disposition === "exclude").map((selector) => selector.itemId),
      ["53070", "53071", "53072", "53073"]
    );

    const macbeth = parseEnglishUnitRecipe(
      JSON.parse(await readFile(path.join(root, "projects/ela20-1-shakespeare-macbeth/meta/english-unit.json"), "utf8"))
    );
    assert.equal(macbeth.activityProfile.kind, "shakespeare-drama");
    assert.equal(macbeth.activityProfile.kind === "shakespeare-drama" && macbeth.activityProfile.sceneCount, 28);
    assert.deepEqual(
      macbeth.source.lessonSelectors.filter((selector) => selector.disposition === "exclude").map((selector) => selector.itemId),
      ["3454", "53037", "53038", "53039"]
    );

    const novel = parseEnglishUnitRecipe(
      JSON.parse(await readFile(path.join(root, "projects/ela20-1-novel-study-clean/meta/english-unit.json"), "utf8"))
    );
    assert.deepEqual(
      novel.activityProfile.kind === "novel-study" ? novel.activityProfile.novels.map((item) => item.title) : [],
      ["Lord of the Flies", "The Book Thief"]
    );
    const film = parseEnglishUnitRecipe(
      JSON.parse(await readFile(path.join(root, "projects/ela20-1-feature-film/meta/english-unit.json"), "utf8"))
    );
    assert.deepEqual(film.activityProfile.kind === "film-study" ? film.activityProfile.filmSelection : null, { mode: "pending" });

    const mapping = JSON.parse(await readFile(path.join(root, first.mappingJsonPath), "utf8")) as EnglishCourseMappingReportV1;
    const findMapping = (source: string) => mapping.entries.find((entry) => entry.path === source);
    assert.equal(findMapping("modern_drama/introduction.html")?.status, "placed");
    assert.equal(findMapping("modern_drama/streetcar.html")?.classification, "alternate-content");
    assert.equal(findMapping("hamlet/introduction.html")?.classification, "alternate-content");
    assert.equal(findMapping("Factors_and_products/factors.html")?.classification, "unrelated-math");
    assert.equal(findMapping("ELA 20 Soft Gate Anwsers RC.docx")?.status, "excluded");
    assert.equal(findMapping("UNIT 2 Modern Play/#001 Crucible Act 1.pdf")?.status, "placed");
    assert.equal(findMapping("(not supplied)/film-selection")?.status, "missing");
    assert.match(await readFile(path.join(root, first.mappingMarkdownPath), "utf8"), /Source disposition/);

    const customRecipe = JSON.parse(await readFile(cruciblePath, "utf8"));
    customRecipe.status = "ready-for-export";
    customRecipe.customComponents.push({
      id: "teacher-extension",
      slot: "custom:teacher-extension",
      mode: "extend",
      source: "workspace/components/teacher-extension/component.html",
      assetRoot: "workspace/assets/custom/teacher-extension",
      enabled: false
    });
    await writeFile(cruciblePath, `${JSON.stringify(customRecipe, null, 2)}\n`);
    const beforeRefresh = await readFile(cruciblePath, "utf8");

    const second = await intakeEnglishCourse({
      repoRoot: root,
      courseId: "ela20-1",
      brightspaceZip: fixture.brightspacePath,
      teacherResourcesZip: fixture.teacherPath,
      now: new Date("2026-07-14T13:00:00-06:00")
    });
    assert.equal(await readFile(cruciblePath, "utf8"), beforeRefresh);
    assert.equal(second.recipes.find((recipe) => recipe.projectSlug === "ela20-1-modern-play-crucible")?.status, "preserved-existing");
    assert.equal((await readdir(path.join(root, "projects/resources/ela20-1/_sources"))).length, 2);

    const filmPath = path.join(root, "projects/ela20-1-feature-film/meta/english-unit.json");
    await writeFile(filmPath, "invalid but user-owned\n");
    const third = await intakeEnglishCourse({
      repoRoot: root,
      courseId: "ela20-1",
      brightspaceZip: fixture.brightspacePath,
      teacherResourcesZip: fixture.teacherPath,
      now: new Date("2026-07-14T14:00:00-06:00")
    });
    assert.equal(await readFile(filmPath, "utf8"), "invalid but user-owned\n");
    assert.equal(third.recipes.find((recipe) => recipe.projectSlug === "ela20-1-feature-film")?.status, "preserved-invalid");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("ELA intake rejects unsupported course families before writing", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "canvas-helper-english-intake-unsupported-"));
  try {
    await mkdir(path.join(root, "input"), { recursive: true });
    await assert.rejects(
      intakeEnglishCourse({
        repoRoot: root,
        courseId: "ela10-1",
        brightspaceZip: path.join(root, "input/brightspace.zip"),
        teacherResourcesZip: path.join(root, "input/teacher.zip")
      }),
      /Unsupported English course/
    );
    await assert.rejects(readFile(path.join(root, "config/english/families/ela10-1.json")), /ENOENT/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
