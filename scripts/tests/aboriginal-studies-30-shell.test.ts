import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import { listProjectSlugs, readStudioProjectBundle } from "../lib/projects.js";

const projectDir = path.resolve("projects", "aboriginal-studies-30");
const workspaceDir = path.resolve(projectDir, "workspace");
const metaDir = path.resolve(projectDir, "meta");
const projectJsonPath = path.resolve(metaDir, "project.json");
const auditPath = path.resolve(metaDir, "source-zip-audit.json");
const indexPath = path.resolve(workspaceDir, "index.html");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const stylesPath = path.resolve(workspaceDir, "styles.css");
const viewerPath = path.resolve(workspaceDir, "pdf-viewer.html");
const designAssetDir = path.resolve(workspaceDir, "assets", "design", "as30");

type CourseData = {
  course?: Record<string, unknown>;
  units?: Array<Record<string, unknown>>;
  themeActivities?: Array<Record<string, unknown>>;
  libraryItems?: Array<Record<string, unknown>>;
  filmRoomItems?: Array<Record<string, unknown>>;
  assignments?: Array<Record<string, unknown>>;
  quizzes?: Array<Record<string, unknown>>;
  sourceAudit?: Record<string, unknown>;
};

function loadCourseData(source: string): CourseData {
  const context = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: CourseData } };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.window.ABORIGINAL_STUDIES_30_DATA ?? {};
}

test("aboriginal studies 30 project metadata and workspace shell exist", async () => {
  await access(projectJsonPath);
  await access(auditPath);
  await access(indexPath);
  await access(mainPath);
  await access(dataPath);
  await access(stylesPath);
  await access(viewerPath);

  const [projectJsonSource, indexSource, mainSource] = await Promise.all([
    readFile(projectJsonPath, "utf8"),
    readFile(indexPath, "utf8"),
    readFile(mainPath, "utf8")
  ]);
  const manifest = JSON.parse(projectJsonSource) as {
    slug: string;
    migrationState: string;
    projectType: string;
    preferredWorkflows: string[];
    canonicalEntry: string;
    canonicalSources: string[];
    authoringStatus: string;
  };

  assert.equal(manifest.slug, "aboriginal-studies-30");
  assert.equal(manifest.migrationState, "migrated");
  assert.equal(manifest.projectType, "conversion");
  assert.deepEqual(manifest.preferredWorkflows, ["conversion"]);
  assert.equal(manifest.authoringStatus, "active");
  assert.match(manifest.canonicalEntry, /projects[\\/]aboriginal-studies-30[\\/]workspace[\\/]index\.html$/);
  assert.ok(manifest.canonicalSources.some((entry) => /workspace[\\/]course-data\.js$/.test(entry)));

  assert.match(indexSource, /<title>Aboriginal Studies 30<\/title>/);
  assert.match(indexSource, /data-project-slug="aboriginal-studies-30"/);
  assert.match(indexSource, /data-google-hosted-controls-host="true"/);
  assert.match(indexSource, /id="sidebar-toggle"/);
  assert.match(indexSource, /aria-controls="course-sidebar"/);
  assert.match(indexSource, />Units<\/span>/);
  assert.match(indexSource, />Quizzes<\/span>/);
  assert.match(indexSource, />Assignments<\/span>/);
  assert.match(indexSource, />Library<\/span>/);
  assert.match(indexSource, />Film Room<\/span>/);
  assert.doesNotMatch(indexSource, /Phases|Performance|Sports Wellness/i);
  assert.doesNotMatch(mainSource, /Phases|Performance|View Slides/);
});

test("aboriginal studies 30 shell uses the supplied pixel-redline visual system", async () => {
  const [indexSource, mainSource, stylesSource] = await Promise.all([
    readFile(indexPath, "utf8"),
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);

  const requiredDesignAssets = [
    "sidebar-top-pattern-band.png",
    "sidebar-lower-texture.png",
    "sidebar-brand-mark.png",
    "progress-track-reference.png",
    "unit-badge-reference.png",
    "unit-badge-t1.png",
    "unit-badge-t2.png",
    "unit-badge-t3.png",
    "unit-badge-t4.png",
    "unit-card-left-t1.png",
    "unit-card-left-t2.png",
    "unit-card-left-t3.png",
    "unit-card-left-t4.png",
    "unit-card-right-texture.png"
  ];

  for (const fileName of requiredDesignAssets) {
    await access(path.resolve(designAssetDir, fileName));
  }

  assert.match(indexSource, /Barlow\+Condensed/);
  assert.match(indexSource, /Playfair\+Display/);
  assert.match(indexSource, /Inter:wght/);
  assert.match(indexSource, /sidebar-pattern/);
  assert.match(indexSource, /brand-medallion/);
  assert.match(indexSource, /brand-panel/);
  assert.doesNotMatch(indexSource, /brand-mark/);
  assert.doesNotMatch(indexSource, />AS<\/div>/);
  assert.match(indexSource, /Learning\. Respect\. Reciprocity\./);
  assert.match(indexSource, /section-title-row/);

  assert.match(mainSource, /sidebarCollapsed/);
  assert.match(mainSource, /toggleSidebar/);
  assert.match(mainSource, /unit-badge/);
  assert.match(mainSource, /unit-badge-shell--\$\{escapeHtml\(unit\.code\.toLowerCase\(\)\)\}/);
  assert.match(mainSource, /unit-badge--\$\{escapeHtml\(unit\.code\.toLowerCase\(\)\)\}/);
  assert.doesNotMatch(mainSource, /unit-badge-label/);
  assert.match(mainSource, /unit-arrow/);

  assert.match(stylesSource, /--as-sidebar-width:\s*336px/);
  assert.match(stylesSource, /--as-content-max:\s*1256px/);
  assert.match(stylesSource, /--font-brand:\s*"Barlow Condensed"/);
  assert.match(stylesSource, /--font-display:\s*"Playfair Display"/);
  assert.match(stylesSource, /#061014/);
  assert.match(stylesSource, /#19C1B7/);
  assert.match(stylesSource, /#B87347/);
  assert.match(stylesSource, /#F2E9D8/);
  assert.match(stylesSource, /grid-template-columns:\s*var\(--as-sidebar-width\) minmax\(0,\s*1fr\)/);
  assert.match(stylesSource, /--as-sidebar-collapsed-width:\s*88px/);
  assert.match(stylesSource, /\.app-shell\.is-sidebar-collapsed/);
  assert.match(stylesSource, /sidebar-brand-mark\.png/);
  assert.doesNotMatch(stylesSource, /\.brand-medallion\s*{[^}]*conic-gradient/s);
  assert.doesNotMatch(stylesSource, /sidebar-brand-block\.png/);
  assert.match(stylesSource, /\.progress-panel\s*{[^}]*min-height:\s*271px/s);
  assert.match(stylesSource, /\.progress-panel\s*{[^}]*border-radius:\s*18px/s);
  assert.doesNotMatch(stylesSource, /progress-hero-reference\.png/);
  assert.doesNotMatch(stylesSource, /sidebar-active-nav-slice\.png/);
  await assert.rejects(access(path.resolve(designAssetDir, "sidebar-active-nav-slice.png")));
  await assert.rejects(access(path.resolve(designAssetDir, "sidebar-brand-block.png")));
  assert.match(stylesSource, /\.progress-track\s*{[^}]*height:\s*39px/s);
  assert.doesNotMatch(stylesSource, /\.content-body\s*>\s*\.stack-list\s*{[^}]*max-width:\s*980px/s);
  assert.match(stylesSource, /\.unit-card\s*{[^}]*min-height:\s*107px/s);
  assert.match(stylesSource, /\.unit-card\s*{[^}]*grid-template-columns:\s*128px minmax\(0,\s*1fr\) 48px/s);
  assert.match(stylesSource, /\.unit-card::before/);
  assert.match(stylesSource, /\.unit-card::before\s*{[^}]*unit-card-right-texture/s);
  assert.match(stylesSource, /\.unit-card::after\s*{[^}]*left:\s*126px/s);
  assert.doesNotMatch(stylesSource, /\.unit-badge-shell\s*{[^}]*linear-gradient/s);
  assert.match(stylesSource, /\.unit-badge-shell\s*{[^}]*unit-card-left-t1\.png/s);
  assert.match(stylesSource, /unit-card-left-t2\.png/);
  assert.match(stylesSource, /unit-card-left-t3\.png/);
  assert.match(stylesSource, /unit-card-left-t4\.png/);
  assert.match(stylesSource, /\.unit-badge/);
  assert.match(stylesSource, /\.unit-badge\s*{[^}]*display:\s*none/s);
  assert.doesNotMatch(stylesSource, /\.unit-badge-label/);
  assert.match(stylesSource, /\.unit-arrow/);
  assert.doesNotMatch(stylesSource, /\.brand-mark/);
  assert.match(stylesSource, /@media \(max-width:\s*860px\)[\s\S]*?\.unit-card\s*{[\s\S]*?grid-template-columns:\s*104px minmax\(0,\s*1fr\) 24px[\s\S]*?height:\s*88px/);
  assert.match(stylesSource, /@media \(max-width:\s*860px\)[\s\S]*?\.unit-card \.unit-card-content span\s*{[\s\S]*?display:\s*none/);
  assert.match(stylesSource, /@media \(max-width:\s*640px\)[\s\S]*?\.unit-card\s*{[\s\S]*?grid-template-columns:\s*92px minmax\(0,\s*1fr\) 18px[\s\S]*?height:\s*78px/);
});

test("aboriginal studies 30 library uses chapter viewer cards and excludes answer keys", async () => {
  const [dataSource, mainSource, viewerSource] = await Promise.all([
    readFile(dataPath, "utf8"),
    readFile(mainPath, "utf8"),
    readFile(viewerPath, "utf8")
  ]);
  const data = loadCourseData(dataSource);
  const libraryItems = data.libraryItems ?? [];

  assert.equal(data.course?.title, "Aboriginal Studies 30");
  assert.equal(data.course?.enableLibrary, true);
  assert.equal(libraryItems.filter((item) => String(item.kind) === "chapter").length, 7);
  assert.deepEqual(
    Array.from(libraryItems.filter((item) => String(item.kind) === "chapter"), (item) => item.title),
    [
      "Chapter 1",
      "Chapter 2",
      "Chapter 3",
      "Chapter 4",
      "Chapter 5",
      "Chapter 6",
      "Chapter 7"
    ]
  );
  assert.ok(libraryItems.some((item) => String(item.title) === "Textbook"));
  assert.ok(libraryItems.some((item) => String(item.title) === "Glossary"));

  for (const item of libraryItems) {
    const file = String(item.file);
    assert.match(file, /^\.\/assets\/library\/.+\.pdf$/);
    assert.doesNotMatch(file, /Key\.pdf|Theme-\d-Key/i);
    await access(path.resolve(workspaceDir, file.replace(/^\.\//, "")));
  }

  assert.match(mainSource, /View Chapter/);
  assert.match(mainSource, /Download PDF/);
  assert.match(mainSource, /pdf-viewer\.html\?file=/);
  assert.doesNotMatch(mainSource, /View Slides/);
  assert.match(viewerSource, /Chapter Viewer/);
  assert.match(viewerSource, /Rendering in app/);
  assert.doesNotMatch(dataSource, /AB-Studies-30-Theme-\d-Key\.pdf/);
});

test("aboriginal studies 30 units and film room are generated from Brightspace resources", async () => {
  const [dataSource, mainSource, stylesSource] = await Promise.all([
    readFile(dataPath, "utf8"),
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);
  const data = loadCourseData(dataSource);

  assert.deepEqual(
    Array.from(data.units ?? [], (unit) => unit.title),
    [
      "Theme 1 - Aboriginal Rights & Self-Government",
      "Theme 2 - Aboriginal Land Claims",
      "Theme 3 - Aboriginal Peoples in Canadian Society",
      "Theme 4 - Aboriginal World Issues"
    ]
  );
  assert.ok((data.units ?? []).every((unit) => Array.isArray(unit.items)));
  const themeOne = (data.units ?? []).find((unit) => String(unit.id) === "theme-1");
  const themeOneItems = (themeOne?.items as Array<Record<string, unknown>> | undefined) ?? [];
  assert.equal(String(themeOneItems[0]?.title), "Chapter 1");
  assert.ok(themeOneItems.some((item) => String(item.title) === "Chapter 1" && String(item.kind) === "chapter" && /chapter-1\.pdf/.test(String(item.url))));
  assert.ok(themeOneItems.some((item) => /Walking Together: The Oral Tradition/.test(String(item.title)) && String(item.url) === "./assets/theme-1/readings/indigenous-worldviews.pdf"));
  assert.match(mainSource, /<h3>Resources<\/h3>/);
  assert.match(mainSource, /item\.kind === 'chapter' \? 'Open Chapter'/);

  const filmUrls = (data.filmRoomItems ?? []).map((item) => String(item.url));
  assert.ok(filmUrls.some((url) => /youtube\.com/.test(url)));
  assert.ok(filmUrls.some((url) => /archive\.org/.test(url)));
  assert.ok(filmUrls.some((url) => /cbc\.ca/.test(url)));
  assert.ok((data.filmRoomItems ?? []).length >= 10);
  assert.match(mainSource, /film-room-shell/);
  assert.match(mainSource, /film-room-tv/);
  assert.match(mainSource, /film-room-screen/);
  assert.match(mainSource, /data-film-room-select/);
  assert.match(mainSource, /Video catalog/);
  assert.match(mainSource, /videos loaded/);
  assert.match(mainSource, /moduleLabelFor/);
  assert.match(mainSource, /Now loaded/);
  assert.doesNotMatch(mainSource, /Tape catalog|Tape \$\{|tapes loaded/);
  assert.match(stylesSource, /\.film-room-tv-wrap/);
  assert.match(stylesSource, /\.film-room-antenna/);
  assert.match(stylesSource, /\.film-room-screen iframe/);
  assert.match(stylesSource, /\.film-room-sidebar/);

  const filmItems = data.filmRoomItems ?? [];
  assert.ok(filmItems.some((item) => String(item.moduleLabel) === "Theme 1 - Aboriginal Rights & Self-Government"));
  assert.ok(filmItems.some((item) => String(item.moduleCode) === "T4"));
});

test("aboriginal studies 30 assignments import Dropbox folders and generated DOCX handouts", async () => {
  const dataSource = await readFile(dataPath, "utf8");
  const data = loadCourseData(dataSource);
  const assignments = data.assignments ?? [];

  assert.ok(assignments.length >= 12);
  assert.ok(assignments.some((item) => String(item.title) === "Aboriginal Studies 30 Theme 1 Assignment"));
  assert.ok(assignments.some((item) => String(item.title) === "Oral Tradition"));
  assert.ok(assignments.some((item) => String(item.title) === "Attawapiskat Report"));
  assert.ok(assignments.some((item) => String(item.title) === "4.3 Personal Response"));
  assert.ok(assignments.some((item) => Array.isArray(item.links) && item.links.some((link: { url?: string }) => /docs\.google\.com/.test(String(link.url)))));

  for (const assignment of assignments) {
    const docxPath = String(assignment.docxPath);
    assert.match(docxPath, /^\.\/assets\/assignments\/docx\/.+\.docx$/);
    assert.doesNotMatch(String(assignment.title), /hidden/i);
    assert.doesNotMatch(String(assignment.summary), /BrightSpace|Brightspace page|source package/i);
    await access(path.resolve(workspaceDir, docxPath.replace(/^\.\//, "")));
  }
});

test("aboriginal studies 30 theme 1 preserves all numbered booklet questions without answer keys", async () => {
  const [dataSource, mainSource, stylesSource] = await Promise.all([
    readFile(dataPath, "utf8"),
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);
  const data = loadCourseData(dataSource);
  const activities = data.themeActivities ?? [];
  const activity = activities.find((item) => String(item.unitId) === "theme-1");

  assert.ok(activity, "Theme 1 activity should be generated");
  assert.equal(activity?.id, "theme-1-online-booklet");
  assert.equal(activity?.title, "Theme 1 Questions");

  const sections = activity?.sections as Array<Record<string, unknown>>;
  const resources = activity?.resources as Array<Record<string, unknown>>;
  assert.equal(resources.length, 0, "The online booklet should not repeat the unit-level Resources cards");
  const prompts = sections.flatMap((section) => section.prompts as Array<Record<string, unknown>> | undefined ?? []);
  const numberedPrompts = prompts.filter((prompt) => /^\d+$/.test(String(prompt.number ?? "")));
  const numberedLabels = new Map(numberedPrompts.map((prompt) => [String(prompt.number), String(prompt.label)]));

  assert.ok(sections.length >= 5, "Theme 1 activity should preserve the major booklet sections");
  assert.equal(activity?.sourceQuestionCount, 87);
  assert.equal(numberedPrompts.length, 87, "Theme 1 activity should preserve every numbered source question");
  assert.equal(prompts.length, 89, "Theme 1 activity should include all numbered questions plus assignments 1.1 and 1.2");

  const q1 = numberedPrompts.find((prompt) => String(prompt.number) === "1");
  const q11 = numberedPrompts.find((prompt) => String(prompt.number) === "11");
  const q37 = numberedPrompts.find((prompt) => String(prompt.number) === "37");
  const q40 = numberedPrompts.find((prompt) => String(prompt.number) === "40");
  const q56 = numberedPrompts.find((prompt) => String(prompt.number) === "56");
  const q73 = numberedPrompts.find((prompt) => String(prompt.number) === "73");
  const q79 = numberedPrompts.find((prompt) => String(prompt.number) === "79");
  const assignment11 = prompts.find((prompt) => String(prompt.id) === "assignment-1-1");
  const assignment12 = prompts.find((prompt) => String(prompt.id) === "assignment-1-2");

  assert.equal(q1?.kind, "fillBlank");
  assert.equal((q1?.blanks as unknown[] | undefined)?.length, 1);
  assert.equal(q11?.kind, "multipleChoice");
  assert.deepEqual(Array.from(q11?.choices as string[]), ["WWI", "Metis land settlements", "Battle of Seven Oaks", "Six Nations Confederacy"]);
  assert.equal(q37?.kind, "table");
  assert.deepEqual(Array.from(q37?.columns as string[]), ["Environmental challenges", "Resources"]);
  assert.deepEqual(Array.from(q37?.rows as string[]), ["Pacific Northwest", "Plateau", "Plains", "Eastern Woodlands", "Subarctic", "Arctic"]);
  assert.equal(q40?.kind, "fillBlank");
  assert.equal((q40?.blanks as unknown[] | undefined)?.length, 2);
  assert.equal(q73?.kind, "fillBlank");
  assert.equal((q73?.blanks as unknown[] | undefined)?.length, 2);
  assert.equal(q79?.kind, "multipleChoice");
  assert.deepEqual(Array.from(q79?.choices as string[]), ["True", "False"]);
  const assignment11Resources = (assignment11?.resources as Array<Record<string, unknown>> | undefined) ?? [];
  const oralTraditionResource = assignment11Resources.find((resource) => /Walking Together: The Oral Tradition/.test(String(resource.title)));
  assert.ok(oralTraditionResource);
  assert.equal(oralTraditionResource.url, "./assets/theme-1/readings/indigenous-worldviews.pdf");
  await access(path.resolve(workspaceDir, "assets", "theme-1", "readings", "indigenous-worldviews.pdf"));
  assert.ok((q56?.resources as Array<Record<string, unknown>> | undefined)?.some((resource) => /Road Allowance People/.test(String(resource.title)) && /youtube\.com\/embed/.test(String(resource.url))));
  assert.ok((assignment12?.resources as Array<Record<string, unknown>> | undefined)?.some((resource) => /M.tis Self-Governance/.test(String(resource.title)) && /youtube\.com\/embed/.test(String(resource.url))));

  const inlineImages = sections.flatMap((section) => Array.from((section.images as Array<Record<string, unknown>> | undefined) ?? []));
  assert.ok(sections.some((section) => /Textbook pages/i.test(String(section.sourceRef))));
  assert.equal(inlineImages.length, 0, "Theme 1 activity should not render booklet image grids in the written assignment surface");
  assert.match(numberedLabels.get("1") ?? "", /Colonization.*ancient civilizations/i);
  assert.match(numberedLabels.get("34") ?? "", /Did the treaties include all groups/i);
  assert.match(numberedLabels.get("35") ?? "", /sweetgrass.*stone.*fire/i);
  assert.match(numberedLabels.get("68") ?? "", /three roles of a Tribal Council/i);
  assert.match(numberedLabels.get("69") ?? "", /lifestyle of the bush/i);
  assert.match(numberedLabels.get("87") ?? "", /Urban-living First Nations/i);
  assert.ok(sections.some((section) => /Assignment 1\.1: Oral Tradition/.test(String(section.title))));
  assert.ok(sections.some((section) => /Assignment 1\.2: Rebuilding Self-Government/.test(String(section.title))));

  assert.match(mainSource, /aboriginal-studies-30\.activityResponses/);
  assert.match(mainSource, /function renderUnitActivity/);
  assert.match(mainSource, /data-activity-response/);
  assert.match(mainSource, /activity-blank-input/);
  assert.match(mainSource, /activity-choice-list/);
  assert.match(mainSource, /activity-table/);
  assert.match(mainSource, /renderActivitySectionImages/);
  assert.match(mainSource, /activity-prompt-resources/);
  assert.match(mainSource, /activity-fill-heading/);
  assert.match(mainSource, /function autoGrowActivityTextarea/);
  assert.match(mainSource, /textarea\[data-activity-response\]/);
  assert.match(mainSource, /autoGrowActivityTextarea\(field\)/);
  assert.doesNotMatch(mainSource, /figcaption/);
  assert.doesNotMatch(mainSource, /Booklet page \$\{escapeHtml/);
  assert.match(mainSource, /activity-question-number/);
  assert.match(mainSource, /copy-activity-responses/);
  assert.match(stylesSource, /\.activity-shell/);
  assert.match(stylesSource, /\.activity-question-number/);
  assert.match(stylesSource, /\.activity-blank-input/);
  assert.match(stylesSource, /\.activity-choice-list/);
  assert.match(stylesSource, /\.activity-table/);
  assert.match(stylesSource, /\.activity-section-image/);
  assert.match(stylesSource, /\.activity-prompt-resources/);
  assert.doesNotMatch(stylesSource, /\.activity-section-image figcaption/);
  assert.match(stylesSource, /\.activity-response\s*{[^}]*resize:\s*none;/s);
  assert.match(stylesSource, /\.activity-response\s*{[^}]*max-height:\s*360px;/s);
  assert.match(stylesSource, /\.activity-response\s*{[^}]*overflow-y:\s*auto;/s);
  assert.match(stylesSource, /\.activity-table-response\s*{[^}]*resize:\s*none;/s);
  assert.match(stylesSource, /\.activity-table-response\s*{[^}]*max-height:\s*260px;/s);
  assert.match(stylesSource, /\.activity-table-response\s*{[^}]*overflow-y:\s*auto;/s);

  assert.doesNotMatch(dataSource, /Answer Key|AB_Studies_30_Combined_Answer_Key|Theme-\d-Key|teacher answer/i);
  assert.doesNotMatch(dataSource, /learnalberta\.ca\/content\/aswt\/oral_tradition\/documents\/oral_tradition\.pdf/i);
  assert.doesNotMatch(mainSource, /Answer Key|AB_Studies_30_Combined_Answer_Key|Theme-\d-Key|teacher answer/i);
});

test("aboriginal studies 30 runtime preserves progress locks and section labels", async () => {
  const [mainSource, stylesSource] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);

  assert.match(mainSource, /aboriginal-studies-30\.progress/);
  assert.match(mainSource, /aboriginal-studies-30\.ui/);
  assert.match(mainSource, /function markUnitComplete/);
  assert.match(mainSource, /const reviewUnlockAll = true/);
  assert.match(mainSource, /function isUnitUnlocked/);
  assert.match(mainSource, /if \(reviewUnlockAll\) return true;/);
  assert.match(mainSource, /function isAssignmentUnlocked/);
  assert.match(mainSource, /renderLibrary/);
  assert.match(mainSource, /renderFilmRoom/);
  assert.match(mainSource, /renderAssignments/);
  assert.match(stylesSource, /\.unit-card\.is-locked/);
  assert.match(stylesSource, /filter:\s*blur\(2px\)/);
  assert.match(stylesSource, /\.sidebar-save-host/);
  assert.match(stylesSource, /\.sidebar-save-host\s*{[^}]*margin-top:\s*auto/s);
  assert.match(stylesSource, /\.app-shell\.is-sidebar-collapsed\s+\.sidebar-save-host/);
  assert.match(stylesSource, /grid-template-columns:\s*var\(--as-sidebar-width\) minmax\(0,\s*1fr\)/);
  assert.match(stylesSource, /\.content-inner\s*{[^}]*height:\s*100vh/s);
  assert.match(stylesSource, /\.content-inner\s*{[^}]*overflow-y:\s*auto/s);
  assert.match(stylesSource, /\.progress-inner/);
  assert.match(stylesSource, /\.nav-item\.active\s*{[^}]*linear-gradient\(90deg,\s*rgba\(25,\s*193,\s*183,\s*0\.54\)/s);
});

test("aboriginal studies 30 is discoverable by the studio project picker", async () => {
  const slugs = await listProjectSlugs();
  assert.ok(slugs.includes("aboriginal-studies-30"));

  const bundle = await readStudioProjectBundle("aboriginal-studies-30");
  assert.equal(bundle.manifest.slug, "aboriginal-studies-30");
  assert.match(bundle.paths.workspaceEntrypoint, /projects[\\/]aboriginal-studies-30[\\/]workspace[\\/]index\.html$/);
});
