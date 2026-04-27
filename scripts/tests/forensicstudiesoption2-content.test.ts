import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

// Generated source data is authored as browser/runtime JavaScript, not TypeScript.
// @ts-expect-error generated JS module has no declaration file
import d2lCourseMapDataRaw from "../../projects/forensics/workspace/d2l-map-data.js";

type CourseRecord = Record<string, any>;
type CourseData = {
  course?: CourseRecord;
  chapters?: CourseRecord[];
  quizzes?: CourseRecord[];
  assignments?: CourseRecord[];
  library?: CourseRecord[];
};
type ModuleNode = CourseRecord & {
  title?: string;
  kind?: string;
  resource?: { hrefs?: string[] };
  children?: ModuleNode[];
};

const d2lCourseMapData = d2lCourseMapDataRaw as { modules?: ModuleNode[] };

const workspaceDir = path.resolve("projects", "forensicstudiesoption2", "workspace");
const contentDir = path.join(workspaceDir, "content");
const dataPath = path.join(workspaceDir, "course-data.js");
const manifestPath = path.resolve("projects", "forensicstudiesoption2", "meta", "project.json");
const chapterTwoPath = path.join(workspaceDir, "content", "chapter-2", "index.html");
const chapterTenPath = path.join(workspaceDir, "content", "chapter-10", "index.html");
const moduleIndexCssPath = path.join(workspaceDir, "content", "module-index.css");
const moduleOneAppPath = path.join(workspaceDir, "assignments", "module1assignment-app.jsx");
const moduleTwoAppPath = path.join(workspaceDir, "assignments", "module2assignment-app.jsx");
const moduleTwoBundlePath = path.join(workspaceDir, "assignments", "module2assignment.bundle.js");
const moduleTwoAssetDir = path.join(workspaceDir, "assignments", "module2");
const moduleThreeAppPath = path.join(workspaceDir, "assignments", "module3assignment-app.jsx");
const moduleFourHtmlPath = path.join(workspaceDir, "assignments", "module4assignment.html");
const moduleFiveAppPath = path.join(workspaceDir, "assignments", "module5assignment.jsx");
const moduleSixAppPath = path.join(workspaceDir, "assignments", "module6assignment-app.jsx");
const moduleSevenAppPath = path.join(workspaceDir, "assignments", "module7assignment-app.jsx");
const moduleEightAppPath = path.join(workspaceDir, "assignments", "module8assignment-app.jsx");
const referenceRoot = path.join(workspaceDir, "references", "forensics");

function loadCourseData(source: string): CourseData {
  const context = { window: {} as { FORENSIC_STUDIES_OPTION2_DATA?: CourseData } };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.window.FORENSIC_STUDIES_OPTION2_DATA ?? {};
}

function authoredQuestionCount(quiz: CourseRecord) {
  const matching = quiz?.matching;
  const matchingItems = Array.isArray(matching?.items)
    ? matching.items.length
    : Array.isArray(matching?.questions)
      ? matching.questions.length
      : 0;

  return (Array.isArray(quiz?.multipleChoice) ? quiz.multipleChoice.length : 0)
    + (Array.isArray(quiz?.trueFalse) ? quiz.trueFalse.length : 0)
    + matchingItems
    + (Array.isArray(quiz?.writtenResponse) ? quiz.writtenResponse.length : 0);
}

function extractMirroredReferenceUrls(source: string): string[] {
  return Array.from(source.matchAll(/(?:(?:\.\.\/)|(?:\.\/))*references\/forensics\/[^"'\s>]+/g)).map((match) =>
    match[0].replace(/\\+$/, "")
  );
}

function toWorkspaceReferencePath(url: string, sourceFile: string) {
  const normalized = decodeURIComponent(String(url || "").split(/[?#]/, 1)[0]).replace(/\//g, path.sep);
  return path.resolve(path.dirname(sourceFile), normalized);
}

async function loadChapterSources(): Promise<Array<{ id: string; source: string }>> {
  const entries = await readdir(contentDir, { withFileTypes: true });
  const chapterDirs = entries
    .filter((entry) => entry.isDirectory() && /^chapter-\d+$/.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));

  return Promise.all(
    chapterDirs.map(async (entry) => ({
      id: entry.name,
      source: await readFile(path.join(contentDir, entry.name, "index.html"), "utf8")
    }))
  );
}

function flattenNodes(nodes: ModuleNode[] = []): ModuleNode[] {
  const results: ModuleNode[] = [];
  for (const node of nodes) {
    results.push(node);
    if (Array.isArray(node?.children) && node.children.length) {
      results.push(...flattenNodes(node.children));
    }
  }
  return results;
}

function getVisibleForensicsModules(): ModuleNode[] {
  return Array.isArray(d2lCourseMapData?.modules)
    ? d2lCourseMapData.modules.filter(
        (module) =>
          module?.kind === "module"
          && module?.title !== "Course Information"
          && module?.title !== "Extra Credits"
          && module?.title !== "Teacher Resources (KEEP HIDDEN)"
      )
    : [];
}

function filterForensicsNodesForWorkspace(moduleTitle: string, nodes: ModuleNode[] = []): ModuleNode[] {
  const titleLower = String(moduleTitle || "").toLowerCase();
  const isModuleOne = titleLower.includes("introduction to crime scenes");
  const isModuleTwo = titleLower.includes("types of evidence and fingerprint analysis");
  const isModuleThree = titleLower.includes("trace evidence");
  const isModuleFour = titleLower.includes("body fluid evidence");
  const isModuleFive = titleLower.includes("forensic detection of impaired driving");
  const isModuleSix = titleLower.includes("polygraphing and document analysis");
  const isModuleSeven = titleLower.includes("forensic genetics");
  const isModuleEight = titleLower.includes("careers in forensic science");

  return nodes
    .filter((node) => !String(node?.title || "").trim().toLowerCase().includes("unit assessment"))
    .filter((node) => {
      const normalizedTitle = String(node?.title || "").trim().toLowerCase();
      if (isModuleOne) return normalizedTitle !== "introduction to crime scenes assignment";
      if (isModuleTwo) {
        return ![
          "evidence and fingerprints online activity (optional)",
          "types of evidence and fingerprint analysis assignment",
          "fingerprint case studies assignment"
        ].includes(normalizedTitle);
      }
      if (isModuleThree) return !["trace evidence assignment", "trace evidence case studies assignment"].includes(normalizedTitle);
      if (isModuleFour) return !["body fluid assignment", "body fluid evidence case studies assignment"].includes(normalizedTitle);
      if (isModuleFive) return normalizedTitle !== "impaired driving assignment";
      if (isModuleSix) {
        return ![
          "polygraphing and forensic writing analysis assignment",
          "polygraphing and forensic writing case studies assignment"
        ].includes(normalizedTitle);
      }
      if (isModuleSeven) return normalizedTitle !== "forensic dna evidence assignment";
      if (isModuleEight) return normalizedTitle !== "careers in forensic science assignment";
      return true;
    });
}

function getExpectedContentTitles(moduleTitle: string) {
  const module = getVisibleForensicsModules().find((entry) => entry.title === moduleTitle);
  const flatNodes = filterForensicsNodesForWorkspace(moduleTitle, flattenNodes(module?.children || []));

  return flatNodes
    .filter((node) => Array.isArray(node?.resource?.hrefs) && node.resource.hrefs.length > 0)
    .filter((node) => node.kind !== "assignment" && node.kind !== "quiz")
    .map((node) => String(node.title || "").trim())
    .filter(Boolean)
    .filter((title) => !/unit assessments/i.test(title));
}

function getExcludedAssignmentTitles(moduleTitle: string) {
  const module = getVisibleForensicsModules().find((entry) => entry.title === moduleTitle);
  const flatNodes = flattenNodes(module?.children || []);

  return flatNodes
    .filter((node) => node.kind === "assignment")
    .map((node) => String(node.title || "").trim())
    .filter(Boolean);
}

function getExpectedSyntheticAssignmentTitle(moduleTitle: string) {
  const titleLower = String(moduleTitle || "").toLowerCase();
  if (titleLower.includes("introduction to crime scenes")) return "Crime Scene Certification Lab";
  if (titleLower.includes("types of evidence and fingerprint analysis")) return "Fingerprint Analysis Interactive Assignment";
  if (titleLower.includes("trace evidence")) return "Trace Evidence Lab Assignment";
  if (titleLower.includes("body fluid evidence")) return "Body Fluid Analysis Lab Assignment";
  if (titleLower.includes("forensic detection of impaired driving")) return "Impaired Driving Assignment Lab";
  if (titleLower.includes("polygraphing and document analysis")) return "Polygraph and Document Analysis Lab";
  if (titleLower.includes("forensic genetics")) return "Forensic Genetics Lab Assignment";
  if (titleLower.includes("careers in forensic science")) return "Career Path Simulation Lab";
  return "";
}

function toHtmlSafeTitlePattern(title: string) {
  return new RegExp(
    escapeRegExp(title)
      .replace(/'/g, "(?:'|&#39;)")
      .replace(/&/g, "(?:&|&amp;)"),
    "i"
  );
}

test("forensic studies option2 quizzes are authored instead of source-link only", async () => {
  const dataSource = await readFile(dataPath, "utf8");
  const data = loadCourseData(dataSource);
  const quizzes = Array.isArray(data?.quizzes) ? data.quizzes : [];

  assert.ok(quizzes.length > 0, "expected quizzes in course data");
  quizzes.forEach((quiz) => {
    assert.ok(
      authoredQuestionCount(quiz) > 0,
      `expected authored quiz content for ${quiz?.id || quiz?.title || "unknown quiz"}`
    );
  });
});

test("forensic studies option2 assignments collapse old multi-brief wrappers into original forensics intro blocks", async () => {
  const dataSource = await readFile(dataPath, "utf8");
  const data = loadCourseData(dataSource);
  const assignments = Array.isArray(data?.assignments) ? data.assignments : [];
  const moduleTwo = assignments.find((entry) => entry.id === "assignment-2");

  assert.ok(moduleTwo, "expected module 2 assignment lane");
  assert.ok(Array.isArray(moduleTwo.briefs), "expected assignment briefs array");
  assert.equal(moduleTwo.briefs.length, 1, "expected module 2 to keep only the original Forensics assignment lane");
  assert.equal(moduleTwo.briefs[0]?.title, "Fingerprint Analysis Interactive Assignment");
  assert.equal(moduleTwo.briefs[0]?.individualized, undefined);
  assert.equal(moduleTwo.briefs[0]?.identified, undefined);
  assert.match(String(moduleTwo.briefs[0]?.instructionHtml || ""), /<p[\s>]/i);
});

test("forensic studies option2 assignment lanes mirror original forensics assignment titles and intro content", async () => {
  const dataSource = await readFile(dataPath, "utf8");
  const data = loadCourseData(dataSource);
  const chapters = Array.isArray(data?.chapters) ? data.chapters : [];
  const assignments = Array.isArray(data?.assignments) ? data.assignments : [];

  const expectedTitles = chapters
    .map((chapter) => getExpectedSyntheticAssignmentTitle(chapter.title))
    .filter(Boolean);
  const actualTitles = assignments.map((assignment) => String(assignment?.title || ""));

  assert.deepEqual(actualTitles, expectedTitles);

  const moduleOne = assignments.find((entry) => entry.id === "assignment-1");
  const moduleTwo = assignments.find((entry) => entry.id === "assignment-2");

  assert.equal(moduleOne?.title, "Crime Scene Certification Lab");
  assert.match(String(moduleOne?.briefs?.[0]?.instructionHtml || ""), /Locard'?s Exchange Principle/i);
  assert.match(String(moduleOne?.briefs?.[0]?.instructionHtml || ""), /Locard Research/i);

  assert.equal(moduleTwo?.title, "Fingerprint Analysis Interactive Assignment");
  assert.match(String(moduleTwo?.briefs?.[0]?.instructionHtml || ""), /Individualized Physical Evidence/i);
  assert.match(String(moduleTwo?.briefs?.[0]?.instructionHtml || ""), /Identified Physical Evidence/i);
  assert.equal(moduleTwo?.briefs?.length || 0, 1);
});

test("forensic studies option2 does not surface the extra credits module from the raw export", async () => {
  const dataSource = await readFile(dataPath, "utf8");
  const data = loadCourseData(dataSource);
  const chapterTitles = (Array.isArray(data?.chapters) ? data.chapters : []).map((chapter) => String(chapter?.title || ""));
  const quizTitles = (Array.isArray(data?.quizzes) ? data.quizzes : []).map((quiz) => String(quiz?.title || ""));

  assert.ok(!chapterTitles.some((title) => /extra credits?/i.test(title)), "expected chapters to exclude Extra Credits");
  assert.ok(
    !quizTitles.some((title) => /student centred learning self reflection|extra credit/i.test(title)),
    "expected quizzes to exclude the extra-credit assessment"
  );
  await assert.rejects(() => access(chapterTenPath), /ENOENT/, "expected stale chapter-10 page to be removed");
});

test("forensic studies option2 generated course copy uses forensics wording instead of generic shell filler", async () => {
  const dataSource = await readFile(dataPath, "utf8");
  const data = loadCourseData(dataSource);
  const quizzes = Array.isArray(data?.quizzes) ? data.quizzes : [];
  const assignments = Array.isArray(data?.assignments) ? data.assignments : [];
  const assignmentOne = assignments.find((entry) => entry.id === "assignment-1");
  const assignmentTwo = assignments.find((entry) => entry.id === "assignment-2");
  const assignmentFive = assignments.find((entry) => entry.id === "assignment-5");

  assert.ok(assignmentOne, "expected module 1 assignment lane");
  assert.ok(assignmentTwo, "expected module 2 assignment lane");
  assert.ok(assignmentFive, "expected module 5 assignment lane");

  assert.equal(data?.course?.subtitle, "Forensic Studies 25 content, assignments, and quizzes.");
  assert.match(String(assignmentOne.summary || ""), /Locard'?s Exchange Principle/i);
  assert.match(String(assignmentTwo.summary || ""), /scientific techniques and\/or forensic science experts/i);
  assert.match(String(assignmentFive.summary || ""), /kills and injures too many Canadians each year/i);

  quizzes.forEach((quiz) => {
    assert.doesNotMatch(String(quiz?.summary || ""), /Open the original exported quiz source/i);
    assert.doesNotMatch(String(quiz?.summary || ""), /option 2 shell/i);
  });

  assignments.forEach((assignment) => {
    assert.doesNotMatch(String(assignment?.summary || ""), /option 2 shell/i);
    (Array.isArray(assignment?.briefs) ? assignment.briefs : []).forEach((brief) => {
      assert.doesNotMatch(String(brief?.sourceNote || ""), /export map still references this assignment/i);
      assert.doesNotMatch(String(brief?.summary || ""), /embedded workspace below is the active surface/i);
    });
  });
});

test("forensic studies option2 chapter pages contain imported lesson content", async () => {
  const chapterTwoSource = await readFile(chapterTwoPath, "utf8");

  assert.match(chapterTwoSource, /lesson-card/);
  assert.match(chapterTwoSource, /A person cannot be convicted of a crime simply because the police believe/i);
  assert.match(chapterTwoSource, /fingerprints\.jpg/i);
  assert.doesNotMatch(chapterTwoSource, /Mapped directly from the original Forensics export so the module order stays traceable\./i);
  assert.doesNotMatch(chapterTwoSource, /Assignments and quizzes/i);
  assert.doesNotMatch(chapterTwoSource, /Assessment Lane/i);
  assert.doesNotMatch(chapterTwoSource, /metric-card/);
});

test("forensic studies option2 chapter pages expose module component progression hooks", async () => {
  const [dataSource, chapterTwoSource] = await Promise.all([
    readFile(dataPath, "utf8"),
    readFile(chapterTwoPath, "utf8")
  ]);
  const data = loadCourseData(dataSource);
  const chapterTwo = (Array.isArray(data?.chapters) ? data.chapters : []).find((chapter) => chapter.id === "chapter-2");

  assert.ok(Array.isArray(chapterTwo?.componentIds), "expected chapter component ids in generated course data");
  assert.ok((chapterTwo?.componentIds?.length || 0) > 0, "expected generated component ids for chapter 2");
  assert.equal(chapterTwo?.componentCount, chapterTwo?.componentIds?.length);

  assert.match(chapterTwoSource, /data-module-component-id=/);
  assert.match(chapterTwoSource, /Mark Complete/i);
  assert.match(chapterTwoSource, /Mark Complete \+ Next/i);
  assert.match(chapterTwoSource, /forensicstudiesoption2-module-progress-ready/);
  assert.match(chapterTwoSource, /forensicstudiesoption2-module-progress-update/);
  assert.match(chapterTwoSource, /forensicstudiesoption2-module-progress-sync/);
  assert.match(chapterTwoSource, /is-locked|data-progress-state="locked"/i);
  assert.match(chapterTwoSource, /lesson-progress-complete/);
  assert.match(chapterTwoSource, /footer\.hidden\s*=\s*complete\s*&&\s*!isLast/);
  assert.match(chapterTwoSource, /actions\.hidden\s*=\s*state\s*!==\s*"active"/);
  assert.match(chapterTwoSource, /completeBadge\.hidden\s*=\s*!\(complete\s*&&\s*isLast\)/);
});

test("forensic studies option2 chapter css honors hidden progression elements", async () => {
  const cssSource = await readFile(moduleIndexCssPath, "utf8");

  assert.match(cssSource, /\[hidden\]\s*\{[\s\S]*display:\s*none\s*!important\s*;/i);
});

test("forensic studies option2 chapter pages mirror original forensics case-module cards", async () => {
  const [dataSource, chapterSources] = await Promise.all([
    readFile(dataPath, "utf8"),
    loadChapterSources()
  ]);
  const data = loadCourseData(dataSource);
  const chapters = Array.isArray(data?.chapters) ? data.chapters : [];

  chapters.forEach((chapter) => {
    const chapterSource = chapterSources.find((entry) => entry.id === path.basename(path.dirname(chapter.contentPath || "")));
    assert.ok(chapterSource, `expected generated chapter page for ${chapter.id}`);

    const expectedTitles = getExpectedContentTitles(chapter.title);
    expectedTitles.forEach((title) => {
      assert.match(
        chapterSource.source,
        toHtmlSafeTitlePattern(title),
        `expected ${chapter.id} to keep source content card "${title}"`
      );
    });

    assert.doesNotMatch(chapterSource.source, /Unit Assessments/i);

    const excludedAssignmentTitles = getExcludedAssignmentTitles(chapter.title);
    excludedAssignmentTitles.forEach((title) => {
      assert.doesNotMatch(
        chapterSource.source,
        new RegExp(escapeRegExp(title), "i"),
        `expected ${chapter.id} to drop assignment title "${title}" from the case-module content page`
      );
    });
  });
});

test("forensic studies option2 generated content does not contain studio-only raw preview urls", async () => {
  const [dataSource, chapterTwoSource] = await Promise.all([
    readFile(dataPath, "utf8"),
    readFile(chapterTwoPath, "utf8")
  ]);

  assert.doesNotMatch(dataSource, /\/preview\/references\/raw\/forensics\//);
  assert.doesNotMatch(chapterTwoSource, /\/preview\/references\/raw\/forensics\//);
});

test("forensic studies option2 mirrored reference urls resolve to workspace files", async () => {
  const [dataSource, chapterSources] = await Promise.all([
    readFile(dataPath, "utf8"),
    loadChapterSources()
  ]);

  const urls = [
    ...extractMirroredReferenceUrls(dataSource).map((url) => ({ url, sourceFile: dataPath })),
    ...chapterSources.flatMap(({ id, source }) =>
      extractMirroredReferenceUrls(source).map((url) => ({
        url,
        sourceFile: path.join(contentDir, id, "index.html")
      }))
    )
  ];

  assert.ok(urls.length > 0, "expected mirrored reference urls in generated option2 content");

  for (const { url, sourceFile } of urls) {
    const absolutePath = toWorkspaceReferencePath(url, sourceFile);
    assert.ok(
      absolutePath.startsWith(referenceRoot),
      `expected mirrored reference to stay under workspace reference root: ${absolutePath}`
    );
    await access(absolutePath);
  }
});

test("forensic studies option2 module 2 uses local assignment image assets instead of remote hotlinks", async () => {
  const requiredAssets = [
    "Whorl.png",
    "Loop.png",
    "PlainArch.png",
    "suspect-lyons.svg",
    "suspect-banes.svg",
    "suspect-chapman.svg",
    "suspect-atkins.svg"
  ];

  await Promise.all(requiredAssets.map((file) => access(path.join(moduleTwoAssetDir, file))));

  const [appSource, bundleSource] = await Promise.all([
    readFile(moduleTwoAppPath, "utf8"),
    readFile(moduleTwoBundlePath, "utf8")
  ]);

  assert.match(appSource, /MODULE2_ASSET_ROOT\s*=\s*['"]\.\/module2['"]/);
  assert.match(bundleSource, /MODULE2_ASSET_ROOT\s*=\s*['"]\.\/module2['"]/);

  requiredAssets.forEach((file) => {
    const filePattern = new RegExp(escapeRegExp(file));
    assert.match(appSource, filePattern);
    assert.match(bundleSource, filePattern);
  });

  assert.doesNotMatch(appSource, /upload\.wikimedia\.org|images\.unsplash\.com/);
  assert.doesNotMatch(bundleSource, /upload\.wikimedia\.org|images\.unsplash\.com/);
  assert.doesNotMatch(bundleSource, /IMG_ERROR/);
});

function escapeRegExp(value: string) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("forensicstudiesoption2 manifest declares the full explicit Google-hosted tracked storage key set", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const trackedStorageKeys = manifest?.googleHosted?.trackedStorageKeys;

  assert.deepEqual(trackedStorageKeys, [
    "forensicstudiesoption2.progress",
    "forensicstudiesoption2.ui",
    "forensics::module1assignment::v1",
    "forensics::module2assignment::v1",
    "forensics::module3assignment::v1",
    "forensics::module4assignment::v1",
    "forensics::module5assignment::v1",
    "forensics::module6assignment::v1",
    "forensics::module7assignment::v1",
    "forensics::module8assignment::v1"
  ]);
});

test("forensicstudiesoption2 assignments 1-8 all declare incremental persistence hooks", async () => {
  const [
    moduleOneSource,
    moduleTwoSource,
    moduleThreeSource,
    moduleFourSource,
    moduleFiveSource,
    moduleSixSource,
    moduleSevenSource,
    moduleEightSource
  ] = await Promise.all([
    readFile(moduleOneAppPath, "utf8"),
    readFile(moduleTwoAppPath, "utf8"),
    readFile(moduleThreeAppPath, "utf8"),
    readFile(moduleFourHtmlPath, "utf8"),
    readFile(moduleFiveAppPath, "utf8"),
    readFile(moduleSixAppPath, "utf8"),
    readFile(moduleSevenAppPath, "utf8"),
    readFile(moduleEightAppPath, "utf8")
  ]);

  assert.match(moduleOneSource, /forensics::module1assignment::v1/);
  assert.match(moduleOneSource, /localStorage\.(?:getItem|setItem)/);

  assert.match(moduleTwoSource, /forensics::module2assignment::v1/);
  assert.match(moduleTwoSource, /localStorage\.(?:getItem|setItem)/);

  assert.match(moduleThreeSource, /forensics::module3assignment::v1/);
  assert.match(moduleThreeSource, /localStorage\.(?:getItem|setItem)/);

  assert.match(moduleFourSource, /forensics::module4assignment::v1/);
  assert.match(moduleFourSource, /localStorage\.(?:getItem|setItem)/);

  assert.match(moduleFiveSource, /forensics::module5assignment::v1/);
  assert.match(moduleFiveSource, /localStorage\.(?:getItem|setItem)/);

  assert.match(moduleSixSource, /forensics::module6assignment::v1/);
  assert.match(moduleSixSource, /localStorage\.(?:getItem|setItem)/);

  assert.match(moduleSevenSource, /forensics::module7assignment::v1/);
  assert.match(moduleSevenSource, /localStorage\.(?:getItem|setItem)/);

  assert.match(moduleEightSource, /forensics::module8assignment::v1/);
  assert.match(moduleEightSource, /localStorage\.(?:getItem|setItem)/);
});
