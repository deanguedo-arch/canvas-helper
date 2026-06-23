import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import { listProjectSlugs, readStudioProjectBundle } from "../lib/projects.js";

const courses = [
  {
    slug: "learning-strategies-15",
    globalName: "LEARNING_STRATEGIES_15_DATA",
    title: "Learning Strategies 15",
    expectedChapters: 3
  },
  {
    slug: "learning-strategies-25",
    globalName: "LEARNING_STRATEGIES_25_DATA",
    title: "Learning Strategies 25",
    expectedChapters: 3,
    assetZipPattern: /D2LExport_149442_24-25/,
    expectedLocalizedImages: [/newschoolcartoon-[a-f0-9]+\.(?:jpg|png|svg)/i]
  },
  {
    slug: "learning-strategies-35",
    globalName: "LEARNING_STRATEGIES_35_DATA",
    title: "Learning Strategies 35",
    expectedChapters: 5,
    assetZipPattern: /D2LExport_149441_24-25/,
    expectedLocalizedImages: [/dialog-[a-f0-9]+\.(?:jpg|png|svg)/i]
  }
] as const;

type CourseData = {
  course?: Record<string, unknown>;
  chapters?: Array<Record<string, unknown>>;
  quizzes?: Array<Record<string, unknown>>;
  assignments?: Array<Record<string, unknown>>;
  library?: Array<Record<string, unknown>>;
};

function loadCourseData(source: string, globalName: string): CourseData {
  const context = { window: {} as Record<string, CourseData | undefined> };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.window[globalName] ?? {};
}

async function readAllChapterSources(projectDir: string, chapterCount: number): Promise<string> {
  const sources = await Promise.all(
    Array.from({ length: chapterCount }, (_, index) =>
      readFile(path.resolve(projectDir, "workspace", "content", `chapter-${index + 1}`, "index.html"), "utf8")
    )
  );
  return sources.join("\n");
}

for (const course of courses) {
  test(`${course.slug} is a migrated content-only student course shell`, async () => {
    const projectDir = path.resolve("projects", course.slug);
    const projectJsonPath = path.resolve(projectDir, "meta", "project.json");
    const auditPath = path.resolve(projectDir, "meta", "source-zip-audit.json");
    const indexPath = path.resolve(projectDir, "workspace", "index.html");
    const mainPath = path.resolve(projectDir, "workspace", "main.js");
    const stylesPath = path.resolve(projectDir, "workspace", "styles.css");
    const dataPath = path.resolve(projectDir, "workspace", "course-data.js");
    const moduleCssPath = path.resolve(projectDir, "workspace", "content", "module-index.css");
    const buildScriptPath = path.resolve(projectDir, "meta", "build_forensics_style_course.py");

    await access(projectJsonPath);
    await access(auditPath);
    await access(indexPath);
    await access(mainPath);
    await access(stylesPath);
    await access(dataPath);
    await access(moduleCssPath);
    await access(buildScriptPath);

    const [projectJsonSource, indexSource, mainSource, stylesSource, dataSource, moduleCssSource, buildScriptSource, chapterSource] = await Promise.all([
      readFile(projectJsonPath, "utf8"),
      readFile(indexPath, "utf8"),
      readFile(mainPath, "utf8"),
      readFile(stylesPath, "utf8"),
      readFile(dataPath, "utf8"),
      readFile(moduleCssPath, "utf8"),
      readFile(buildScriptPath, "utf8"),
      readAllChapterSources(projectDir, course.expectedChapters)
    ]);
    const manifest = JSON.parse(projectJsonSource) as { slug: string; migrationState: string; projectType: string };
    const audit = JSON.parse(await readFile(auditPath, "utf8")) as {
      assetZip?: string;
      imagesCopied?: Array<Record<string, unknown>>;
      unresolvedAssets?: Array<{ kind?: string }>;
    };
    const data = loadCourseData(dataSource, course.globalName);

    assert.equal(manifest.slug, course.slug);
    assert.equal(manifest.migrationState, "migrated");
    assert.equal(manifest.projectType, "conversion");
    assert.equal(data.course?.title, course.title);
    assert.equal(data.course?.enableLibrary, false);
    assert.equal(data.chapters?.length, course.expectedChapters);
    assert.ok((data.chapters ?? []).every((chapter) => Number(chapter.componentCount) > 0));
    assert.deepEqual(Array.from(data.quizzes ?? []), []);
    assert.deepEqual(Array.from(data.assignments ?? []), []);
    assert.deepEqual(Array.from(data.library ?? []), []);

    assert.match(indexSource, new RegExp(course.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(indexSource, /Complete each unit in order and track your progress\./);
    assert.doesNotMatch(indexSource, /Brightspace|conversion|converted|source unit|original course package/i);
    assert.match(mainSource, new RegExp(`${course.slug}\\.progress`));
    assert.match(mainSource, new RegExp(`${course.slug}-module-progress-ready`));
    assert.match(stylesSource, /\.locked-card > :not\(\.status-chip\)[\s\S]*?filter:\s*blur\(2px\);/i);
    assert.match(chapterSource, /<link rel="stylesheet" href="\.\.\/module-index\.css" \/>/i);
    assert.match(chapterSource, /class="sequence-kind"[^>]*>Reading<\/span>/);
    assert.match(chapterSource, /Mark Complete/);
    assert.match(chapterSource, /const reviewUnlockAll = true/);
    assert.match(chapterSource, /Mark complete when you finish reviewing this card\./);
    assert.match(chapterSource, /button\.disabled = !cardUnlocked \|\| complete/);
    assert.match(chapterSource, /if \(!complete && !reviewUnlockAll\) unlocked = false/);
    assert.doesNotMatch(chapterSource, /Course Information|Assignment Booklet|Teacher Guide|Contact Assignment/i);
    assert.doesNotMatch(chapterSource, /Retained content from the original|Brightspace module|Brightspace export|Source image unavailable/i);
    assert.doesNotMatch(chapterSource, /Includes \d+ content items|starting with Lesson|starting with Section|class="module-summary"/i);
    assert.doesNotMatch(mainSource, /class="card-summary"|class="detail-summary"/i);
    assert.doesNotMatch(dataSource, /Includes \d+ content items|starting with Lesson|starting with Section/i);
    assert.doesNotMatch(buildScriptSource, /Includes \{len\(components\)\} content items|class="module-summary"|card-summary|detail-summary/i);
    assert.doesNotMatch(chapterSource, /Complete this component to unlock the next lesson card\./);
    assert.doesNotMatch(chapterSource, />\s*Next Steps\s*</i);
    assert.doesNotMatch(chapterSource, /class="sequence-title"|class="sequence-note"/);
    assert.match(moduleCssSource, /filter:\s*blur\(2px\)/);
    assert.match(buildScriptSource, /filter:\s*blur\(2px\)/);
    assert.match(moduleCssSource, /\.lesson-body a:not\(:has\(img\)\)/);

    const expectedAssetZipPattern =
      "assetZipPattern" in course ? course.assetZipPattern : course.slug === "learning-strategies-15" ? /D2LExport_68818_22-23/ : undefined;
    const expectedLocalizedImages =
      "expectedLocalizedImages" in course ? course.expectedLocalizedImages : course.slug === "learning-strategies-15" ? [/studentbook-[a-f0-9]+\.png/, /mindset-[a-f0-9]+\.png/] : [];
    if (expectedAssetZipPattern) {
      assert.match(String(audit.assetZip), expectedAssetZipPattern);
      assert.ok((audit.imagesCopied ?? []).length > 0);
      assert.equal((audit.unresolvedAssets ?? []).filter((asset) => asset.kind === "image").length, 0);
      for (const expectedImage of expectedLocalizedImages) {
        assert.match(chapterSource, expectedImage);
      }
    }
  });
}

test("learning strategies shells are discoverable by the studio project picker", async () => {
  const slugs = await listProjectSlugs();
  for (const course of courses) {
    assert.ok(slugs.includes(course.slug));
    const bundle = await readStudioProjectBundle(course.slug);
    assert.equal(bundle.manifest.slug, course.slug);
    assert.match(bundle.paths.workspaceEntrypoint, new RegExp(`projects[\\\\/]${course.slug}[\\\\/]workspace[\\\\/]index\\.html$`));
  }
});
