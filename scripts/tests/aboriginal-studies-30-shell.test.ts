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
const brandLogoPath = path.resolve(workspaceDir, "assets", "brand", "nxt-ce-logo-white-with-ce.png");
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
  await access(brandLogoPath);

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
  assert.match(indexSource, />Course Overview<\/button>/);
  assert.match(indexSource, />Themes<\/summary>/);
  assert.match(indexSource, />Quizzes<\/button>/);
  assert.match(indexSource, />Assignments<\/button>/);
  assert.match(indexSource, />Library<\/button>/);
  assert.match(indexSource, />Film Room<\/button>/);
  assert.match(indexSource, />Core Vocabulary<\/button>/);
  assert.match(indexSource, /class="brand-logo"/);
  assert.match(indexSource, /nxt-ce-logo-white-with-ce\.png/);
  assert.match(indexSource, />ABS 30<\/p>/);
  assert.doesNotMatch(indexSource, /Phases|Performance|Sports Wellness/i);
  assert.doesNotMatch(mainSource, /Phases|Performance|View Slides/);
});

test("aboriginal studies 30 shell uses the shared social-shell visual system", async () => {
  const [indexSource, mainSource, stylesSource] = await Promise.all([
    readFile(indexPath, "utf8"),
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);

  assert.match(indexSource, /Work\+Sans/);
  assert.match(indexSource, /Hanken\+Grotesk/);
  assert.match(indexSource, /course-topbar/);
  assert.match(indexSource, /course-sidebar/);
  assert.match(indexSource, /course-nav/);
  assert.match(indexSource, /<details class="nav-group"/);
  assert.match(indexSource, /<summary>/);
  assert.match(indexSource, /theme-subnav/);
  assert.doesNotMatch(indexSource, /social-nav-group/);
  assert.match(indexSource, /course-main/);
  assert.match(indexSource, /content-body/);
  assert.match(indexSource, /top-progress-shell/);
  assert.doesNotMatch(indexSource, /sidebar-pattern/);
  assert.doesNotMatch(indexSource, /brand-medallion/);
  assert.doesNotMatch(indexSource, /Barlow\+Condensed/);
  assert.doesNotMatch(indexSource, /Playfair\+Display/);

  assert.match(mainSource, /sidebarCollapsed/);
  assert.match(mainSource, /toggleSidebar/);
  assert.match(mainSource, /renderThemeSubnav/);
  assert.match(mainSource, /social-roadmap/);
  assert.match(mainSource, /lesson-document-header/);
  assert.match(mainSource, /lesson-jump/);
  assert.match(mainSource, /social-overview-hero/);
  assert.doesNotMatch(mainSource, /unit-badge/);
  assert.doesNotMatch(mainSource, /unit-arrow/);
  assert.doesNotMatch(mainSource, /sectionTitle/);

  assert.match(stylesSource, /--sidebar-width:\s*270px/);
  assert.match(stylesSource, /--topbar-height:\s*64px/);
  assert.match(stylesSource, /--primary:\s*#154212/);
  assert.match(stylesSource, /--teal:\s*#146c60/);
  assert.match(stylesSource, /\.course-topbar\s*{[^}]*position:\s*fixed/s);
  assert.match(stylesSource, /\.course-sidebar\s*{[^}]*position:\s*fixed/s);
  assert.match(stylesSource, /\.course-sidebar\s*{[^}]*width:\s*var\(--sidebar-width\)/s);
  assert.match(stylesSource, /\.course-main\s*{[^}]*margin-left:\s*var\(--sidebar-width\)/s);
  assert.match(stylesSource, /\.course-page\s*{[^}]*border-top:\s*3px solid var\(--primary\)/s);
  assert.match(stylesSource, /\.course-nav details\.nav-group\s*>\s*summary/s);
  assert.match(stylesSource, /summary::after\s*{\s*content:\s*"\+"[^}]*font-size:\s*22px/s);
  assert.match(stylesSource, /\.nav-link\s*{[^}]*border-left:\s*2px solid transparent/s);
  assert.match(stylesSource, /\.nav-link\s*{[^}]*color:\s*#dbe2d8/s);
  assert.match(stylesSource, /\.nav-link\.active\s*{[^}]*font-weight:\s*800/s);
  assert.match(stylesSource, /\.brand-logo\s*{[^}]*width:\s*112px/s);
  assert.match(stylesSource, /\.sidebar-course-label\s*{[^}]*color:\s*#bfc8bd/s);
  assert.doesNotMatch(stylesSource, /\.course-nav-link/);
  assert.doesNotMatch(stylesSource, /\.social-nav-group/);
  assert.doesNotMatch(stylesSource, /pdf-viewer/);
  assert.match(stylesSource, /\.social-overview-hero/);
  assert.match(stylesSource, /\.social-roadmap/);
  assert.match(stylesSource, /\.lesson-document-header/);
  assert.match(stylesSource, /\.goal-strip/);
  assert.match(stylesSource, /\.top-progress-fill/);
  assert.doesNotMatch(stylesSource, /--as-sidebar-width/);
  assert.doesNotMatch(stylesSource, /#061014/);
  assert.doesNotMatch(stylesSource, /#19C1B7/);
  assert.doesNotMatch(stylesSource, /\.app-shell/);
  assert.doesNotMatch(stylesSource, /\.unit-card/);
  assert.doesNotMatch(stylesSource, /\.progress-panel/);
  assert.match(stylesSource, /@media \(max-width:\s*760px\)[\s\S]*?\.course-main[\s\S]*?margin-left:\s*0/);
  assert.match(stylesSource, /prefers-reduced-motion/);

  // Legacy pixel-redline reference art stays on disk for history, but the
  // social shell must not depend on it.
  for (const fileName of ["unit-card-right-texture.png", "sidebar-brand-mark.png"]) {
    await access(path.resolve(designAssetDir, fileName));
  }
  assert.doesNotMatch(stylesSource, /unit-card-right-texture\.png/);
  assert.doesNotMatch(stylesSource, /sidebar-brand-mark\.png/);
});

test("aboriginal studies 30 library embeds chapter PDFs directly and excludes answer keys", async () => {
  const [dataSource, mainSource, stylesSource] = await Promise.all([
    readFile(dataPath, "utf8"),
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8")
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
  assert.match(mainSource, /\$\{selected\.file\}#page=1/);
  assert.doesNotMatch(mainSource, /pdf-viewer/);
  assert.doesNotMatch(mainSource, /View Slides/);
  assert.match(stylesSource, /\.pdf-reader-frame iframe/);
  assert.match(stylesSource, /\.chapter-frame\s*{[^}]*height:\s*80vh/s);
  assert.match(stylesSource, /\.course-dialog\s*{[^}]*width:\s*min\(1400px,\s*98vw\)/s);
  assert.match(stylesSource, /\.course-frame\s*{[^}]*width:\s*min\(1120px/s);
  assert.match(stylesSource, /body\.sidebar-collapsed \.course-frame/);
  assert.doesNotMatch(dataSource, /pdf-viewer/);
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
    const isBookletShell = /^aboriginal-studies-30-theme-\d-assignment$/.test(String(assignment.id));
    if (!isBookletShell) {
      assert.doesNotMatch(String(assignment.summary), /\.\.\.$/);
      const textbook = (assignment.textbook ?? {}) as Record<string, unknown>;
      assert.match(String(textbook.label), /^Textbook Chapter \d+, pages \d+-\d+$/);
      assert.match(String(textbook.file), /^\.\/assets\/library\/chapter-\d\.pdf$/);
      await access(path.resolve(workspaceDir, String(textbook.file).replace(/^\.\//, "")));
    }
    await access(path.resolve(workspaceDir, docxPath.replace(/^\.\//, "")));
  }
});

test("aboriginal studies 30 houses written assignments inside theme 1", async () => {
  const [mainSource, stylesSource] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);

  assert.match(mainSource, /BOOKLET_SHELL_ASSIGNMENT_IDS/);
  assert.match(mainSource, /!BOOKLET_SHELL_ASSIGNMENT_IDS\.has\(assignment\.id\)/);
  assert.match(mainSource, /function themeAssignments/);
  assert.match(mainSource, /function renderWrittenAssignmentCard/);
  assert.match(mainSource, /assignment\.textbook/);
  assert.match(mainSource, /lessonStartPage\(assignment\)/);
  assert.match(mainSource, /function assignmentDescription/);
  assert.match(mainSource, /function gotoThemeWritten/);
  assert.match(mainSource, /state\.themeTab === 'written'/);
  assert.match(mainSource, /data-theme-lessons/);
  assert.match(mainSource, /data-theme-written/);
  assert.match(mainSource, /data-theme-written-open/);
  assert.match(mainSource, /How to complete a written assignment/);
  assert.match(mainSource, /WRITTEN_RUBRIC/);
  assert.match(mainSource, /Critical Response Rubric/);
  assert.match(mainSource, /Comprehension ×2/);
  assert.match(mainSource, /Restating the quote is not interpreting/);
  assert.match(mainSource, /function renderWrittenSteps/);
  assert.match(mainSource, /Steps to follow/);
  assert.match(mainSource, /data-written-assignment/);
  assert.match(mainSource, /data-written-response/);
  assert.match(mainSource, /data-view-local-doc/);
  assert.match(mainSource, /data-view-external-doc/);
  assert.match(mainSource, /function openDocumentViewer/);
  assert.match(mainSource, /\/preview/);
  assert.match(mainSource, /data-mark-assignment/);
  assert.match(mainSource, /Written Assignments section/);
  assert.match(mainSource, /function renderAssignmentDetail/);
  assert.match(stylesSource, /\.written-assignments/);
  assert.match(stylesSource, /\.nav-sub-link/);
  assert.match(stylesSource, /\.rubric-table/);
  assert.match(stylesSource, /\.written-work/);
  assert.match(stylesSource, /\.link-button/);
  assert.match(stylesSource, /\.assignment-status/);
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
  assert.equal(prompts.length, 90, "Theme 1 activity should include all numbered questions plus assignments 1.1 and 1.2 and the R07 glossary table");

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
  // T02 (lead-authorized): rows/columns carry explicit stable ids so saved
  // keys survive label edits and reordering; labels render as before.
  assert.deepEqual(
    Array.from(q37?.columns as Array<{ id: string; label: string }>, (column) => column.label),
    ["Environmental challenges", "Resources"]
  );
  assert.deepEqual(
    Array.from(q37?.columns as Array<{ id: string; label: string }>, (column) => column.id),
    ["environmental-challenges", "resources"]
  );
  assert.deepEqual(
    Array.from(q37?.rows as Array<{ id: string; label: string }>, (row) => row.label),
    ["Pacific Northwest", "Plateau", "Plains", "Eastern Woodlands", "Subarctic", "Arctic"]
  );
  assert.deepEqual(
    Array.from(q37?.rows as Array<{ id: string; label: string }>, (row) => row.id),
    ["pacific-northwest", "plateau", "plains", "eastern-woodlands", "subarctic", "arctic"]
  );
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
  assert.match(mainSource, /choice-letter/);
  assert.match(mainSource, /String\.fromCharCode\(65 \+ index\)/);
  assert.doesNotMatch(mainSource, /Taught in /);
  assert.match(stylesSource, /\.choice-letter\s*{/);
  assert.match(stylesSource, /\.activity-choice:has\(input:checked\)/);
  assert.match(stylesSource, /\.activity-choice-list\s*{[^}]*grid-template-columns:\s*1fr/s);
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
  assert.match(mainSource, /data-activity-save-status/);
  assert.match(mainSource, /data-save-state/);
  assert.doesNotMatch(mainSource, /status\.textContent\s*=/);
  assert.match(stylesSource, /\.activity-shell/);
  assert.match(stylesSource, /\[data-activity-save-status\]\[data-save-state="saved"\]::after/s);
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
  assert.match(stylesSource, /\.stack-card\.is-complete/);
  assert.match(stylesSource, /\.stack-card\.is-locked/);
  assert.match(stylesSource, /\.sidebar-save-host/);
  assert.match(stylesSource, /\.sidebar-save-host\s*{[^}]*margin-top:\s*auto/s);
  assert.match(stylesSource, /body\.sidebar-collapsed\s+\.course-sidebar/);
  assert.match(stylesSource, /body\.sidebar-collapsed\s+\.course-main\s*{[^}]*margin-left:\s*var\(--sidebar-rail\)/s);
  assert.match(stylesSource, /body\.is-library-reader-fullscreen\s*{[^}]*overflow:\s*hidden/s);
  assert.match(stylesSource, /\.top-progress-fill/);
  assert.match(stylesSource, /\.nav-link:disabled/);
  assert.doesNotMatch(stylesSource, /\.sublesson-link/);
});

test("aboriginal studies 30 theme lessons teach the booklet before practice", async () => {
  const [dataSource, mainSource, stylesSource] = await Promise.all([
    readFile(dataPath, "utf8"),
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);
  const data = loadCourseData(dataSource);
  const expectedLessons: Record<string, number> = {
    "theme-1": 23,
    "theme-2": 4,
    "theme-3": 4,
    "theme-4": 4
  };
  const lessons: Array<Record<string, unknown>> = [];
  for (const [unitId, minimum] of Object.entries(expectedLessons)) {
    const unit = (data.units ?? []).find((entry) => String(entry.id) === unitId);
    const unitLessons = (unit?.lessons as Array<Record<string, unknown>> | undefined) ?? [];
    assert.ok(
      unitLessons.length >= minimum,
      `${unitId} should teach at least ${minimum} lessons ahead of its practice work`
    );
    lessons.push(...unitLessons);
  }
  for (const lesson of lessons) {
    assert.ok(String(lesson.id ?? "").length > 0);
    assert.ok(String(lesson.title ?? "").length > 0);
    assert.ok(String(lesson.intro ?? "").length > 0);
    const terms = lesson.terms as Array<Record<string, unknown>> | undefined;
    assert.ok(Array.isArray(terms) && terms.length >= 1, "Every lesson should define its key terms");
    const body = lesson.body as string[] | undefined;
    assert.ok(Array.isArray(body) && body.length >= 2, "Every lesson should teach in complete paragraphs");
    const check = lesson.check as Record<string, unknown> | undefined;
    assert.ok(String(check?.prompt ?? "").length > 0, "Every lesson should end with a retrieval check");
    assert.ok(String(check?.sample ?? "").length > 0, "Every check should carry a sample response");
    const textbook = lesson.textbook as Record<string, unknown> | undefined;
    assert.match(String(textbook?.file ?? ""), /^\.\/assets\/library\/chapter-\d\.pdf$/);
    await access(path.resolve(workspaceDir, String(textbook?.file).replace(/^\.\//, "")));
  }

  assert.match(mainSource, /function renderThemeLessons/);
  assert.match(mainSource, /renderThemeLessons\(unit\)/);
  assert.match(mainSource, /theme-lesson/);
  assert.match(mainSource, /key-terms/);
  assert.match(mainSource, /<summary>Vocabulary help<\/summary>/);
  assert.match(mainSource, /Words for this lesson/);
  assert.match(mainSource, /lesson-term-strip/);
  assert.match(mainSource, /<strong>Key terms:<\/strong>/);
  assert.match(mainSource, /class="bio-term"/);
  assert.match(mainSource, /data-vocab-term/);
  assert.match(mainSource, /function linkLessonTerms/);
  assert.match(mainSource, /page-guide/);
  assert.match(mainSource, /check-source/);
  assert.match(mainSource, /word-more/);
  assert.match(mainSource, /drawer-frayer-disclosure/);
  assert.match(mainSource, /function renderVocabFrayer/);
  assert.match(mainSource, /FRAYER_LABELS/);
  assert.match(mainSource, /data-goto-vocab/);
  assert.match(mainSource, /stop-check/);
  assert.match(mainSource, /Check your understanding/);
  assert.match(mainSource, /Show the explanation/);
  assert.match(mainSource, /function renderVocabulary/);
  assert.match(mainSource, /vocabulary-layout/);
  assert.match(mainSource, /vocabulary-index/);
  assert.match(mainSource, /vocabulary-reader/);
  assert.match(mainSource, /data-vocab-select/);
  assert.match(mainSource, /course-dialog-word-select/);
  assert.match(mainSource, /function openVocabularyViewer/);
  assert.match(mainSource, /function openChapterViewer/);
  assert.doesNotMatch(mainSource, /lesson-check/);
  assert.doesNotMatch(mainSource, /vocab-term-button/);
  assert.doesNotMatch(mainSource, /vocab-row/);
  assert.match(stylesSource, /\.theme-lesson-body/);
  assert.match(stylesSource, /\.textbook-band/);
  assert.match(stylesSource, /\.key-terms/);
  assert.match(stylesSource, /\.key-terms > summary/);
  assert.match(stylesSource, /\.terms-line\s*{/);
  assert.match(stylesSource, /\.lesson-words dl/);
  assert.match(stylesSource, /\.lesson-words h2/);
  assert.match(stylesSource, /\.page-guide > summary span/);
  assert.match(stylesSource, /\.page-guide/);
  assert.match(stylesSource, /\.page-guide > summary/);
  assert.match(stylesSource, /\.key-terms\.vocab-help\[open\]/);
  assert.match(stylesSource, /\.page-guide > summary strong::before/);
  assert.match(stylesSource, /\.page-guide\[open\] > summary::after/);
  assert.match(mainSource, /guide-body/);
  assert.match(mainSource, /sidebarCollapsedBeforeReader/);
  assert.match(mainSource, /function restoreSidebarAfterReader/);
  assert.match(stylesSource, /\.check-source/);
  assert.match(stylesSource, /\.word-parts/);
  assert.match(stylesSource, /\.drawer-frayer-disclosure/);
  assert.match(stylesSource, /\.frayer-grid/);
  assert.match(stylesSource, /\.frayer-model/);
  assert.match(stylesSource, /\.stop-check/);
  assert.match(stylesSource, /\.stop-check summary/);
  assert.match(stylesSource, /\.terms-line button\.bio-term/);
  assert.match(stylesSource, /\.vocabulary-layout/);
  assert.match(stylesSource, /\.vocabulary-index button\[aria-pressed="true"\]/);
  assert.match(stylesSource, /\.vocabulary-reader article > h2/);
  assert.match(stylesSource, /\.popup-word-select/);
  assert.match(stylesSource, /\.course-dialog\s*{[^}]*border-radius:\s*8px/s);
  assert.match(stylesSource, /\.social-reading-link/);
});

test("aboriginal studies 30 vocabulary enrichment covers every core term", async () => {
  const dataSource = await readFile(dataPath, "utf8");
  const mainSource = await readFile(mainPath, "utf8");
  assert.match(dataSource, /AS30_VOCAB_ENRICHMENT/);
  const termCount = (dataSource.match(/"term": "/g) || []).length;
  const frayerCount = (dataSource.match(/frayer: \[/g) || []).length;
  assert.equal(frayerCount, 94);
  assert.ok(termCount >= 94);
  assert.match(mainSource, /function vocabEnrichmentFor/);
  assert.doesNotMatch(dataSource, /See it in the booklet/);
  assert.doesNotMatch(dataSource, /Supports booklet/);
  assert.match(dataSource, /are answered in this lesson/);
});

test("aboriginal studies 30 is discoverable by the studio project picker", async () => {
  const slugs = await listProjectSlugs();
  assert.ok(slugs.includes("aboriginal-studies-30"));

  const bundle = await readStudioProjectBundle("aboriginal-studies-30");
  assert.equal(bundle.manifest.slug, "aboriginal-studies-30");
  assert.match(bundle.paths.workspaceEntrypoint, /projects[\\/]aboriginal-studies-30[\\/]workspace[\\/]index\.html$/);
});
