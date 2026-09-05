import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  readlink,
  rename,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";

import { loadBiologySourceModel, classifyBiologySourceDisposition } from "../source.js";
import type { BiologySourceModel, ContentDisposition } from "../types.js";
import { validateProjectManifestPolicy } from "../../project-manifest-policy.js";
import {
  normalizeArchivePath,
  type NamedBrightspaceResource
} from "../../science-comparison.js";
import type { ProjectManifest } from "../../types.js";
import {
  BIOLOGY30_NOTES_SHA256,
  BIOLOGY30_V2_FAMILY,
  BIOLOGY30_V2_PROJECT,
  BIOLOGY30_V2_TITLE,
  buildPdfPageDisposition,
  createProductionContract,
  getCorrectionLedger,
  validateProductionContract,
  validateProductionSourceManifest
} from "./blueprint.js";
import type {
  BiologyGate0ReviewV1,
  BiologyPilotTreeHashV1,
  BiologyProductionContractV1,
  BiologySourceCatalogV1
} from "./types.js";

const RESOURCE_MANIFEST_PATH = "projects/resources/biology30-unit-a-pilot/resource-manifest.json";
const SUPPLIED_NOTES_PATH = "/Users/deanguedo/Downloads/Unit A Nervous and Endocrine Systems Notes.pdf";
const NOTES_ITEM_ID = "1498114";
const PILOT_SLUGS = [
  "biology30-unit-a-class-2026-faithful",
  "biology30-unit-a-class-2026-optimized",
  "biology30-unit-a-system-2020-faithful",
  "biology30-unit-a-system-2020-optimized",
  "biology30-unit-a-synthesis"
] as const;

type Gate0ContentGap = {
  id: string;
  lessonIds: string[];
  gap: string;
  supplementationPlan: string;
  requiredAuthorityIds: string[];
  status: "planned-before-gate-1" | "planned-during-gate-2";
};

export type Biology30V2IntakeRequest = {
  repoRoot: string;
  family: string;
  project: string;
  testHooks?: {
    afterStageWrite?: (stageResourceDir: string, stageProjectDir: string) => void | Promise<void>;
    beforePromote?: (targetPath: string, index: number) => void | Promise<void>;
  };
};

export type Biology30V2IntakeResult = {
  projectDir: string;
  resourceDir: string;
  contractSha256: string;
  sourceCatalog: BiologySourceCatalogV1;
  pilotTreeHashes: BiologyPilotTreeHashV1[];
};

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

async function sha256File(filePath: string) {
  const hash = createHash("sha256");
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return hash.digest("hex");
}

async function pathExists(targetPath: string) {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function writeJson(targetPath: string, value: unknown) {
  await writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function collectTreeEntries(rootDir: string, relativeDir = ""): Promise<Array<{
  relativePath: string;
  kind: "file" | "symlink";
  size: number;
  digest: string;
}>> {
  const absoluteDir = path.join(rootDir, relativeDir);
  const names = (await readdir(absoluteDir)).sort((left, right) => left.localeCompare(right));
  const entries: Array<{ relativePath: string; kind: "file" | "symlink"; size: number; digest: string }> = [];
  for (const name of names) {
    const relativePath = path.posix.join(relativeDir.split(path.sep).join(path.posix.sep), name);
    const absolutePath = path.join(rootDir, relativePath);
    const details = await lstat(absolutePath);
    if (details.isDirectory()) {
      entries.push(...(await collectTreeEntries(rootDir, relativePath)));
      continue;
    }
    if (details.isSymbolicLink()) {
      const target = await readlink(absolutePath);
      entries.push({ relativePath, kind: "symlink", size: Buffer.byteLength(target), digest: sha256(target) });
      continue;
    }
    if (!details.isFile()) throw new Error(`Unsupported pilot tree entry: ${absolutePath}`);
    entries.push({ relativePath, kind: "file", size: details.size, digest: await sha256File(absolutePath) });
  }
  return entries;
}

export async function hashProjectTree(repoRoot: string, slug: string): Promise<BiologyPilotTreeHashV1> {
  const projectDir = path.join(repoRoot, "projects", slug);
  if (!(await pathExists(projectDir))) throw new Error(`Required comparison pilot is missing: ${slug}`);
  const entries = await collectTreeEntries(projectDir);
  const treeHash = createHash("sha256");
  let byteCount = 0;
  for (const entry of entries) {
    treeHash.update(`${entry.kind}\0${entry.relativePath}\0${entry.size}\0${entry.digest}\n`);
    byteCount += entry.size;
  }
  return { slug, sha256: treeHash.digest("hex"), fileCount: entries.length, byteCount };
}

async function hashAllPilots(repoRoot: string) {
  return Promise.all(PILOT_SLUGS.map((slug) => hashProjectTree(repoRoot, slug)));
}

function assertPilotHashesUnchanged(before: BiologyPilotTreeHashV1[], after: BiologyPilotTreeHashV1[]) {
  const afterBySlug = new Map(after.map((record) => [record.slug, record]));
  for (const record of before) {
    const next = afterBySlug.get(record.slug);
    if (!next || next.sha256 !== record.sha256 || next.fileCount !== record.fileCount || next.byteCount !== record.byteCount) {
      throw new Error(`Comparison pilot changed during V2 Gate 0 intake: ${record.slug}`);
    }
  }
}

function buildSourceCatalog(models: BiologySourceModel[], generatedAt: string): BiologySourceCatalogV1 {
  const dispositions = models.flatMap((model) => classifyBiologySourceDisposition(model));
  const dispositionByItem = new Map(dispositions.map((record) => [`${record.sourceId}:${record.itemId}`, record]));
  const items = models.flatMap((model) =>
    model.items.map((item) => {
      const disposition = dispositionByItem.get(`${model.resource.id}:${item.identifier}`);
      if (!disposition) throw new Error(`No content disposition exists for ${model.resource.id}:${item.identifier}.`);
      return {
        sourceId: model.resource.id,
        itemId: item.identifier,
        parentId: item.parentId,
        title: item.title,
        pathTitles: [...item.pathTitles],
        visible: item.visible,
        explicitlyHidden: item.explicitlyHidden,
        descriptionPresent: Boolean(item.descriptionHtml.trim()),
        resource: item.resource
          ? {
              identifier: item.resource.identifier,
              href: item.resource.href,
              type: item.resource.type,
              materialType: item.resource.materialType,
              resourceCode: item.resource.resourceCode
            }
          : undefined,
        disposition: disposition.disposition,
        dispositionReason: disposition.reason
      };
    })
  );
  return {
    schemaVersion: 1,
    family: BIOLOGY30_V2_FAMILY,
    generatedAt,
    sources: models.map((model) => ({
      id: model.resource.id,
      label: model.resource.label,
      role: model.resource.role,
      path: model.resource.path,
      sha256: model.resource.sha256,
      originalName: model.resource.originalName,
      manifestIdentifier: model.manifestIdentifier,
      manifestTitle: model.manifestTitle,
      unitRootId: model.unitRoot.identifier,
      unitRootTitle: model.unitRoot.title,
      itemCount: model.items.length,
      visibleQuizCount: model.quizzes.length,
      visibleQuizQuestionCount: model.quizzes.reduce((total, quiz) => total + quiz.questions.length, 0),
      utf16HtmlCount: model.utf16HtmlPaths.length
    })),
    items,
    visibleQuizzes: models.flatMap((model) =>
      model.quizzes.map((quiz) => ({
        sourceId: model.resource.id,
        id: quiz.id,
        title: quiz.title,
        sourceItemId: quiz.sourceItemId,
        sourceXmlPath: quiz.sourceXmlPath,
        questionCount: quiz.questions.length
      }))
    ),
    contentDispositions: dispositions.map((record) => ({
      sourceId: record.sourceId,
      itemId: record.itemId,
      title: record.title,
      pathTitles: [...record.pathTitles],
      visibleInSource: record.visibleInSource,
      disposition: record.disposition,
      reason: record.reason
    }))
  };
}

function findDisposition(catalog: BiologySourceCatalogV1, sourceId: string, itemId: string) {
  return catalog.contentDispositions.find((record) => record.sourceId === sourceId && record.itemId === itemId);
}

export function validateContractSourceLocators(contract: BiologyProductionContractV1, catalog: BiologySourceCatalogV1) {
  const sourceIds = new Set(contract.sources.map((source) => source.id));
  for (const sourceRef of contract.sourceRefs) {
    if (!sourceIds.has(sourceRef.sourceId)) throw new Error(`Source reference ${sourceRef.id} uses unknown source ${sourceRef.sourceId}.`);
    if (!sourceRef.rightsStatus.trim()) throw new Error(`Source reference ${sourceRef.id} has no rights status.`);
    const hasBrightspaceLocator = Boolean(sourceRef.itemId && sourceRef.sourcePath);
    const hasPdfLocator = Boolean(sourceRef.pdfPages?.length && sourceRef.sourcePath);
    const hasUrlLocator = Boolean(sourceRef.url);
    if (!hasBrightspaceLocator && !hasPdfLocator && !hasUrlLocator) {
      throw new Error(`Source reference ${sourceRef.id} has no explicit item/path/page/URL locator.`);
    }
    if (sourceRef.sourceId === "class-2026-27" || sourceRef.sourceId === "system-2020") {
      if (!sourceRef.itemId || !sourceRef.sourcePath) throw new Error(`Brightspace reference ${sourceRef.id} must declare itemId and sourcePath.`);
      const item = catalog.items.find((candidate) => candidate.sourceId === sourceRef.sourceId && candidate.itemId === sourceRef.itemId);
      if (!item) throw new Error(`Brightspace reference ${sourceRef.id} points to missing item ${sourceRef.sourceId}:${sourceRef.itemId}.`);
      const actualPath = item.pathTitles.join(" > ");
      if (actualPath !== sourceRef.sourcePath) {
        throw new Error(`Brightspace reference ${sourceRef.id} path drift: expected ${sourceRef.sourcePath}, received ${actualPath}.`);
      }
      const disposition = findDisposition(catalog, sourceRef.sourceId, sourceRef.itemId);
      if (!disposition || disposition.disposition.startsWith("excluded-")) {
        throw new Error(`Brightspace reference ${sourceRef.id} selects excluded source material.`);
      }
    }
    if (sourceRef.sourceId === "unit-a-notes") {
      if (!sourceRef.pdfPages?.length || sourceRef.pdfPages.some((page) => !Number.isInteger(page) || page < 1 || page > 139)) {
        throw new Error(`Notes reference ${sourceRef.id} must identify valid pages 1-139.`);
      }
    }
  }
  const teacherTest = findDisposition(catalog, "class-2026-27", "1498117");
  if (!teacherTest || teacherTest.disposition !== "excluded-teacher-assessment") {
    throw new Error("The hidden Unit A test is not explicitly excluded from the V2 source contract.");
  }
}

function validateRealSourceShape(catalog: BiologySourceCatalogV1) {
  const classSource = catalog.sources.find((source) => source.id === "class-2026-27");
  const systemSource = catalog.sources.find((source) => source.id === "system-2020");
  if (!classSource || !systemSource) throw new Error("Both named Brightspace sources are required.");
  if (classSource.visibleQuizCount !== 3 || classSource.visibleQuizQuestionCount !== 75) {
    throw new Error(`Expected three visible class quizzes and 75 questions; received ${classSource.visibleQuizCount} quizzes and ${classSource.visibleQuizQuestionCount} questions.`);
  }
  if (systemSource.utf16HtmlCount < 1) throw new Error("The system source UTF-16 HTML path was not exercised.");
  if (classSource.unitRootId !== "1498071" || systemSource.unitRootId !== "2240") {
    throw new Error("Biology Unit A root identifiers drifted from the approved source boundary.");
  }
}

function buildContentGapLedger(): Gate0ContentGap[] {
  return [
    {
      id: "current-biology-bulletin-refresh",
      lessonIds: ["lesson-17"],
      gap: "Alberta has not published a discoverable Biology-specific 2026-27 bulletin at Gate 0; the current subject bulletin is 2025-26.",
      supplementationPlan: "Repeat the Alberta-domain search immediately before Gate 1 authoring and reconcile terminology, blueprint, or cognitive-demand changes before writing lessons.",
      requiredAuthorityIds: ["alberta-biology-bulletin-2025-26", "alberta-diploma-general-2026-27"],
      status: "planned-before-gate-1"
    },
    {
      id: "native-first-teach-explanations",
      lessonIds: Array.from({ length: 17 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`),
      gap: "The supplied notes and course pages do not consistently provide independent, readable first-teach explanations.",
      supplementationPlan: "Rewrite each lesson as 900-1,600 words of native web instruction with worked models, scaffolded vocabulary, data, feedback, and local sources; never reproduce the slide sequence.",
      requiredAuthorityIds: ["alberta-program-of-studies", "alberta-performance-standards", "openstax-anatomy-physiology-2e"],
      status: "planned-during-gate-2"
    },
    {
      id: "current-health-and-disorder-accuracy",
      lessonIds: ["lesson-05", "lesson-09", "lesson-10", "lesson-13", "lesson-14", "lesson-15", "lesson-16"],
      gap: "Several source-era disorder, treatment, regeneration, glucose, and technology statements require current authoritative cross-checking.",
      supplementationPlan: "Register page-specific official health sources with retrieval dates and rights status, then paraphrase and record every resulting claim in the factual-review ledger.",
      requiredAuthorityIds: ["ninds-health-information", "niddk-diabetes", "nei-how-eyes-work", "nidcd-how-hearing-works", "health-canada"],
      status: "planned-before-gate-1"
    },
    {
      id: "safe-investigation-equivalents",
      lessonIds: ["lesson-07", "lesson-08", "lesson-09", "lesson-10", "lesson-11", "lesson-15", "lesson-16"],
      gap: "Required investigation evidence needs safe independent procedures and complete local alternatives when materials, supervision, audio, or participation are unavailable.",
      supplementationPlan: "Author low-material procedures plus locally stored, clearly labelled synthetic instructional datasets and static/printable fallbacks for every required investigation.",
      requiredAuthorityIds: ["alberta-performance-standards"],
      status: "planned-during-gate-2"
    },
    {
      id: "original-figures-and-models",
      lessonIds: Array.from({ length: 17 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`),
      gap: "The source deck relies on crowded, clipped, linked, or rights-unclear presentation graphics rather than accessible course-native figures.",
      supplementationPlan: "Create the contracted original SVG/semantic figure inventory with title, description, equivalent text/table, provenance, contrast, keyboard behavior, and static fallback.",
      requiredAuthorityIds: ["alberta-program-of-studies", "openstax-anatomy-physiology-2e"],
      status: "planned-during-gate-2"
    },
    {
      id: "qti-practice-quality-audit",
      lessonIds: Array.from({ length: 17 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`),
      gap: "The 75 visible source-QTI items are source material, not a validated 100-item practice bank.",
      supplementationPlan: "Deduplicate, fact-check, align, rewrite distractors, tag outcomes/cognitive level, and add rationales and misconception-specific feedback before any item enters learner practice.",
      requiredAuthorityIds: ["alberta-program-of-studies", "alberta-performance-standards", "alberta-biology-bulletin-2025-26"],
      status: "planned-during-gate-2"
    },
    {
      id: "indigenous-neurotoxin-source-boundary",
      lessonIds: ["lesson-11"],
      gap: "No Indigenous-led, rights-safe source has yet been approved for an Indigenous neurotoxin example.",
      supplementationPlan: "Include such an example only if an Indigenous-led source and appropriate use rights are documented; otherwise satisfy the outcome with sourced neurotoxin and sensory-technology evidence without appropriation.",
      requiredAuthorityIds: ["alberta-program-of-studies"],
      status: "planned-during-gate-2"
    }
  ];
}

function renderCurriculumMap(contract: BiologyProductionContractV1) {
  const outcomeRows = contract.outcomes
    .map(
      (outcome) =>
        `| ${outcome.id} | ${outcome.category} | ${outcome.officialText.replace(/\|/g, "\\|")} | ${outcome.teachRoutes.join(", ")} | ${outcome.practiceRoutes.join(", ")} | ${outcome.evidenceRoutes.join(", ")} |`
    )
    .join("\n");
  const lessonRows = contract.lessons
    .map(
      (lesson) =>
        `| ${lesson.order} | ${lesson.id} | ${lesson.title} | ${lesson.requiredMinutes} | ${lesson.optionalMinutes} | ${lesson.outcomeIds.join(", ")} | ${lesson.sourceRefIds.join(", ")} |`
    )
    .join("\n");
  return `# Biology 30 Unit A V2 — Gate 0 Curriculum Map

Status: **awaiting user approval**. This document approves curriculum scope and source/correction strategy only. No learner lessons have been rendered.

## Authority baseline

- Alberta Biology 20–30 Program of Studies: exact Unit A outcome authority.
- Biology 30 Student-based Performance Standards: evidence, investigation, model, and data expectations.
- Current Biology-specific information bulletin found at Gate 0: 2025–26.
- 2026–27 diploma general bulletin: current general examination context.
- A renewed Alberta-site check is mandatory immediately before Gate 1.

## Course boundary

- Required: ${contract.delivery.requiredMinutes.toLocaleString("en-CA")} minutes (${(contract.delivery.requiredMinutes / 60).toFixed(1)} hours).
- Optional: ${contract.delivery.optionalMinutes.toLocaleString("en-CA")} minutes.
- Full experience: ${((contract.delivery.requiredMinutes + contract.delivery.optionalMinutes) / 60).toFixed(0)} hours.
- Formative learning and seven submission-ready artifacts are local; secure graded tests remain in Brightspace.
- Required completion has no internet, synchronous-teacher, or peer-availability dependency.

## Exact 25-outcome coverage

| Outcome | Category | Official wording | Teach routes | Practice routes | Evidence routes |
| --- | --- | --- | --- | --- | --- |
${outcomeRows}

## Seventeen-lesson sequence

| # | ID | Lesson | Required min | Optional min | Outcomes | Exact source-reference IDs |
| ---: | --- | --- | ---: | ---: | --- | --- |
${lessonRows}

## Approval decision

Approve only if the official wording, lesson sequence, teach/practice/evidence mapping, page dispositions, correction strategy, and supplementation boundaries are acceptable. Approval does not authorize promotion, export, upload, or a commit.
`;
}

function renderPageDisposition(dispositions: ReturnType<typeof buildPdfPageDisposition>) {
  const rows = dispositions
    .map((entry) => `| ${entry.page} | ${entry.status} | ${entry.lessonIds.join(", ") || "—"} | ${entry.reason.replace(/\|/g, "\\|")} |`)
    .join("\n");
  return `# Unit A Notes — 139-page Disposition

The PDF is an authoring and QA source only. Rendered pages, screenshots, and slide controls are prohibited from learner delivery.

| Page | Status | Lesson destination | Reason |
| ---: | --- | --- | --- |
${rows}
`;
}

function renderCorrectionLedger(records: ReturnType<typeof getCorrectionLedger>) {
  return `# Biology 30 Unit A — Factual Correction Ledger

These corrections are release blockers. Gate 1 and Gate 2 authoring must prove that each source issue was corrected rather than inherited.

${records
  .map(
    (record) => `## ${record.id}

- Pages: ${record.sourcePages.join(", ")}
- Severity: ${record.severity}
- Source problem: ${record.sourceProblem}
- Required treatment: ${record.requiredTreatment}
- Regression proof: ${record.verification}
`
  )
  .join("\n")}`;
}

function renderSourceSummary(catalog: BiologySourceCatalogV1) {
  const rows = catalog.sources
    .map(
      (source) =>
        `| ${source.label} | ${source.itemCount} | ${source.visibleQuizCount} | ${source.visibleQuizQuestionCount} | ${source.utf16HtmlCount} | ${source.unitRootTitle} (${source.unitRootId}) |`
    )
    .join("\n");
  return `# Biology 30 Unit A V2 — Source Catalogue Summary

| Source | Unit items | Visible quizzes | Questions | UTF-16 HTML | Unit root |
| --- | ---: | ---: | ---: | ---: | --- |
${rows}

The complete machine-readable catalogue records exact manifest paths, visibility, resource metadata, and dispositions for every selected Unit A item. Hidden tests, printable/key material, unrelated units, and broken launchers remain excluded by policy.
`;
}

function renderGate0ProjectPreview(contract: BiologyProductionContractV1) {
  const moduleCounts = new Map<string, number>();
  for (const lesson of contract.lessons) moduleCounts.set(lesson.moduleId, (moduleCounts.get(lesson.moduleId) ?? 0) + 1);
  const modules = [...moduleCounts.entries()]
    .map(([moduleId, count], index) => `<li><span>Module ${index + 1}</span><strong>${count} lesson${count === 1 ? "" : "s"}</strong></li>`)
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${BIOLOGY30_V2_TITLE} — Curriculum review</title>
  <style>
    :root { color-scheme: light; --ink: #171b1b; --muted: #5b635d; --green: #154212; --teal: #146c60; --paper: #f7f8f5; --surface: #fff; --border: #d9ded8; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--paper); color: var(--ink); font-family: "Work Sans", system-ui, sans-serif; font-size: 17px; line-height: 1.65; }
    header { border-bottom: 1px solid var(--border); background: var(--surface); }
    .bar, main { width: min(920px, calc(100% - 40px)); margin: 0 auto; }
    .bar { min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .brand { color: var(--green); font-weight: 760; letter-spacing: -.02em; }
    .code { color: var(--muted); font-size: .88rem; }
    main { padding: 64px 0 80px; }
    .eyebrow { color: var(--teal); font-size: .82rem; font-weight: 760; letter-spacing: .08em; text-transform: uppercase; }
    h1 { max-width: 18ch; margin: 10px 0 20px; font-family: "Hanken Grotesk", system-ui, sans-serif; font-size: clamp(2rem, 5vw, 2.625rem); line-height: 1.08; letter-spacing: -.035em; }
    .lede { max-width: 66ch; color: var(--muted); font-size: 1.08rem; }
    .notice { margin: 36px 0; padding: 22px 24px; border-left: 4px solid var(--teal); background: var(--surface); }
    .notice strong { display: block; margin-bottom: 4px; }
    dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; overflow: hidden; border: 1px solid var(--border); background: var(--border); }
    dl div { min-height: 112px; padding: 20px; background: var(--surface); }
    dt { color: var(--muted); font-size: .82rem; text-transform: uppercase; letter-spacing: .06em; }
    dd { margin: 6px 0 0; font-family: "Hanken Grotesk", system-ui, sans-serif; font-size: 1.55rem; font-weight: 720; }
    h2 { margin: 48px 0 16px; font-size: 1.35rem; }
    ul { margin: 0; padding: 0; border-top: 1px solid var(--border); list-style: none; }
    li { display: flex; justify-content: space-between; gap: 24px; padding: 13px 2px; border-bottom: 1px solid var(--border); }
    li strong { color: var(--muted); font-size: .9rem; font-weight: 600; }
    @media (max-width: 680px) { .bar { min-height: 56px; } main { padding-top: 42px; } dl { grid-template-columns: 1fr; } dl div { min-height: 0; } }
  </style>
</head>
<body>
  <header><div class="bar"><span class="brand">Next Step</span><span class="code">BIO 30</span></div></header>
  <main>
    <p class="eyebrow">Curriculum review</p>
    <h1>${BIOLOGY30_V2_TITLE}</h1>
    <p class="lede">The curriculum, source, and correction map is ready for review. Learner lessons have not been rendered yet.</p>
    <div class="notice"><strong>Course remains blocked.</strong>Approval of Gate 0 is required before the two-lesson production slice begins.</div>
    <dl>
      <div><dt>Required learning</dt><dd>25.1 hours</dd></div>
      <div><dt>Curriculum outcomes</dt><dd>25 mapped</dd></div>
      <div><dt>Planned evidence</dt><dd>7 artifacts</dd></div>
    </dl>
    <h2>Planned course structure</h2>
    <ul>${modules}</ul>
  </main>
</body>
</html>
`;
}

function buildProjectManifest(generatedAt: string, resources: NamedBrightspaceResource[]): ProjectManifest {
  const projectPath = `projects/${BIOLOGY30_V2_PROJECT}`;
  const v2Path = `projects/resources/${BIOLOGY30_V2_FAMILY}/v2`;
  return {
    id: BIOLOGY30_V2_PROJECT,
    slug: BIOLOGY30_V2_PROJECT,
    title: BIOLOGY30_V2_TITLE,
    sourcePath: RESOURCE_MANIFEST_PATH,
    inputKind: "brightspace-zip",
    brightspaceTarget: "scorm",
    previewModes: ["workspace"],
    workspaceEntrypoint: `${projectPath}/workspace/index.html`,
    rawEntrypoint: `${projectPath}/raw/intake.json`,
    learningSource: "other",
    learningTrust: "curated",
    learningUpdatedAt: generatedAt,
    createdAt: generatedAt,
    updatedAt: generatedAt,
    migrationState: "migrated",
    projectType: "hybrid",
    preferredWorkflows: ["conversion", "generated-course"],
    canonicalEntry: `${v2Path}/production-contract.json`,
    canonicalSources: [
      `${v2Path}/production-contract.json`,
      `${v2Path}/curriculum-map.json`,
      `${v2Path}/source-and-rights-register.json`,
      `${v2Path}/notes-page-disposition.json`,
      `${v2Path}/factual-correction-ledger.json`,
      `${v2Path}/content-gap-ledger.json`
    ],
    generatedOutputs: [],
    authoring: {
      driverId: "proposal-only-v1",
      familyId: BIOLOGY30_V2_FAMILY,
      sourceResourceIds: resources.map((resource) => resource.id),
      qualityProfile: "biology30-unit-a-production-v1",
      studioEditing: { enabled: false }
    },
    authoringStatus: "blocked",
    exportTargets: [
      { target: "html", enabled: false, notes: "Gate 0 curriculum-review preview only." },
      { target: "scorm", enabled: false, notes: "SCORM 2004 export requires accepted Gate 3 review and Gate 4 promotion." }
    ],
    referenceOnly: [RESOURCE_MANIFEST_PATH, ...resources.map((resource) => resource.path), `${projectPath}/raw/intake.json`],
    sourceOfTruthNotes:
      "The versioned V2 production contract and explicit maps under the shared Biology resource root govern this blocked proposal. The workspace is review-only, Studio editing is disabled, and no build, promotion, export, or LMS upload is authorized at Gate 0."
  };
}

async function verifyNotesSources(repoRoot: string, classModel: BiologySourceModel) {
  const notesItem = classModel.items.find((item) => item.identifier === NOTES_ITEM_ID);
  const href = notesItem?.resource?.href;
  if (!href) throw new Error(`The canonical notes entry ${NOTES_ITEM_ID} is missing from the class archive.`);
  const archivePath = normalizeArchivePath(href.split(/[?#]/, 1)[0]);
  const archiveEntry = classModel.archive.file(archivePath);
  if (!archiveEntry) throw new Error(`The class archive notes entry cannot be opened: ${archivePath}`);
  const archiveBytes = await archiveEntry.async("nodebuffer");
  const archiveHash = sha256(archiveBytes);
  if (archiveHash !== BIOLOGY30_NOTES_SHA256) {
    throw new Error(`Notes PDF hash drift inside the class archive: expected ${BIOLOGY30_NOTES_SHA256}, received ${archiveHash}.`);
  }
  const suppliedAbsolutePath = path.resolve(SUPPLIED_NOTES_PATH);
  if (!(await pathExists(suppliedAbsolutePath))) throw new Error(`The supplied notes PDF is missing: ${suppliedAbsolutePath}`);
  const suppliedHash = await sha256File(suppliedAbsolutePath);
  if (suppliedHash !== archiveHash) {
    throw new Error(`The supplied notes PDF is not byte-identical to the canonical archive entry: received ${suppliedHash}.`);
  }
  return {
    canonicalStorage: `${classModel.resource.path}#${archivePath}`,
    canonicalSha256: archiveHash,
    canonicalBytes: archiveBytes.byteLength,
    suppliedOrigin: suppliedAbsolutePath,
    suppliedSha256: suppliedHash,
    byteIdentical: true
  };
}

function buildPromptPack(contractSha256: string) {
  return `# Biology 30 Unit A Production V2 — Gate 0

- Project: ${BIOLOGY30_V2_PROJECT}
- Status: blocked
- Authoring driver: proposal-only-v1
- Contract hash: ${contractSha256}
- Studio editing: disabled
- Export: disabled

## Current boundary

Gate 0 approves only the exact curriculum map, source locators, 139-page notes disposition, factual correction strategy, content-gap plan, 17-lesson sequence, and outcome/evidence architecture.

Do not render learner lessons, introduce a generic Science factory, invoke the five-pilot builder, promote the project, export SCORM, commit, or upload to Brightspace until the required gate authorization is recorded.

## Next authorized implementation after approval

Gate 1 is limited to Overview, Lesson 4, Lesson 15, Model Lab/Notebook/Practice Hub skeletons, local fonts, the shared visual system, and the persistence foundation. Any substantive change to the accepted Gate 1 build invalidates its visual approval.
`;
}

function buildGate0Summary(contract: BiologyProductionContractV1, contractSha256: string) {
  return `# Biology 30 Unit A V2 — Gate 0 Summary

## Status

- Awaiting explicit user approval.
- Contract SHA-256: ${contractSha256}
- Project remains blocked and preview-only.
- Studio editing and export are disabled.

## Contracted scope

- ${contract.outcomes.length} exact Unit A outcomes with teach, practice, and evidence routes.
- ${contract.lessons.length} planned lessons totalling ${contract.delivery.requiredMinutes.toLocaleString("en-CA")} required and ${contract.delivery.optionalMinutes} optional minutes.
- ${contract.artifacts.length} portfolio artifacts.
- ${contract.practiceBlueprint.total} planned practice items.
- ${contract.interactions.length} planned substantive local interactions.
- 139 source-PDF pages explicitly dispositioned.

## Review files

- Shared curriculum map: projects/resources/${BIOLOGY30_V2_FAMILY}/v2/curriculum-map.md
- Page disposition: projects/resources/${BIOLOGY30_V2_FAMILY}/v2/notes-page-disposition.md
- Correction ledger: projects/resources/${BIOLOGY30_V2_FAMILY}/v2/factual-correction-ledger.md
- Content gaps: projects/resources/${BIOLOGY30_V2_FAMILY}/v2/content-gap-ledger.json

Approval authorizes Gate 1 only. It does not authorize full production, promotion, commit, SCORM export, or Brightspace upload.
`;
}

async function writeGate0Stages(input: {
  stageResourceDir: string;
  stageProjectDir: string;
  contract: BiologyProductionContractV1;
  contractJson: string;
  contractSha256: string;
  sourceCatalog: BiologySourceCatalogV1;
  sourceHashVerification: unknown;
  pilotTreeHashReport: unknown;
  contentGaps: Gate0ContentGap[];
  generatedAt: string;
  resources: NamedBrightspaceResource[];
}) {
  const dispositions = buildPdfPageDisposition();
  const corrections = getCorrectionLedger();
  const projectManifest = buildProjectManifest(input.generatedAt, input.resources);
  const manifestValidation = validateProjectManifestPolicy(projectManifest);
  if (manifestValidation.status !== "valid") {
    throw new Error(`Biology 30 V2 Gate 0 project manifest is invalid: ${manifestValidation.errors.join(" ")}`);
  }
  const gate0Review: BiologyGate0ReviewV1 = {
    schemaVersion: 1,
    gateId: "gate-0",
    projectSlug: BIOLOGY30_V2_PROJECT,
    contractSha256: input.contractSha256,
    status: "awaiting-user",
    decision: null,
    generatedAt: input.generatedAt,
    approvalRequirements: [
      "Approve the exact 25-outcome wording and teach/practice/evidence routes.",
      "Approve the 17-lesson sequence and 1,505-minute required boundary.",
      "Approve all 139 notes-page dispositions.",
      "Approve the factual correction and authoritative supplementation strategy.",
      "Authorize Gate 1 only; no promotion, export, upload, or commit is implied."
    ]
  };
  const curriculumMapJson = {
    schemaVersion: 1,
    projectSlug: BIOLOGY30_V2_PROJECT,
    generatedAt: input.generatedAt,
    authority: input.contract.curriculum,
    outcomes: input.contract.outcomes,
    lessons: input.contract.lessons,
    artifactBlueprint: input.contract.artifacts,
    interactionBlueprint: input.contract.interactions,
    practiceBlueprint: input.contract.practiceBlueprint
  };
  const sourceAndRightsRegister = {
    schemaVersion: 1,
    projectSlug: BIOLOGY30_V2_PROJECT,
    generatedAt: input.generatedAt,
    rule: "No external factual content enters learner instruction without a registered source, retrieval date, rights status, exact lesson locator, and usage treatment.",
    sources: input.contract.sources,
    explicitSelections: input.contract.sourceRefs
  };
  const productionCandidate = {
    schemaVersion: 1,
    projectSlug: BIOLOGY30_V2_PROJECT,
    gate: "gate-0",
    status: "blocked-awaiting-user",
    ownership: "proposal-only-v1",
    contractPath: `projects/resources/${BIOLOGY30_V2_FAMILY}/v2/production-contract.json`,
    contractSha256: input.contractSha256,
    lessonRenderingStarted: false,
    studioEditingEnabled: false,
    exportEnabled: false,
    generatedAt: input.generatedAt
  };
  const rawIntake = {
    schemaVersion: 1,
    family: BIOLOGY30_V2_FAMILY,
    projectSlug: BIOLOGY30_V2_PROJECT,
    receivedAt: input.generatedAt,
    sourceResources: input.resources.map((resource) => ({ id: resource.id, path: resource.path, sha256: resource.sha256 })),
    sharedCanonicalSourceOnly: true,
    sourceArchivesCopiedIntoProject: false
  };

  await Promise.all([
    mkdir(path.join(input.stageProjectDir, "workspace"), { recursive: true }),
    mkdir(path.join(input.stageProjectDir, "meta"), { recursive: true }),
    mkdir(path.join(input.stageProjectDir, "raw"), { recursive: true })
  ]);
  await Promise.all([
    writeFile(path.join(input.stageResourceDir, "production-contract.json"), input.contractJson, "utf8"),
    writeJson(path.join(input.stageResourceDir, "curriculum-map.json"), curriculumMapJson),
    writeFile(path.join(input.stageResourceDir, "curriculum-map.md"), renderCurriculumMap(input.contract), "utf8"),
    writeJson(path.join(input.stageResourceDir, "source-catalog.json"), input.sourceCatalog),
    writeFile(path.join(input.stageResourceDir, "source-catalog.md"), renderSourceSummary(input.sourceCatalog), "utf8"),
    writeJson(path.join(input.stageResourceDir, "source-and-rights-register.json"), sourceAndRightsRegister),
    writeJson(path.join(input.stageResourceDir, "notes-page-disposition.json"), { schemaVersion: 1, pageCount: 139, dispositions }),
    writeFile(path.join(input.stageResourceDir, "notes-page-disposition.md"), renderPageDisposition(dispositions), "utf8"),
    writeJson(path.join(input.stageResourceDir, "factual-correction-ledger.json"), { schemaVersion: 1, records: corrections }),
    writeFile(path.join(input.stageResourceDir, "factual-correction-ledger.md"), renderCorrectionLedger(corrections), "utf8"),
    writeJson(path.join(input.stageResourceDir, "content-gap-ledger.json"), { schemaVersion: 1, gaps: input.contentGaps }),
    writeJson(path.join(input.stageResourceDir, "source-hash-verification.json"), input.sourceHashVerification),
    writeJson(path.join(input.stageResourceDir, "pilot-tree-hashes.json"), input.pilotTreeHashReport),
    writeJson(path.join(input.stageResourceDir, "gate-0-review.json"), gate0Review),
    writeJson(path.join(input.stageProjectDir, "meta", "project.json"), projectManifest),
    writeJson(path.join(input.stageProjectDir, "meta", "production-candidate.json"), productionCandidate),
    writeFile(path.join(input.stageProjectDir, "meta", "prompt-pack.md"), buildPromptPack(input.contractSha256), "utf8"),
    writeFile(path.join(input.stageProjectDir, "meta", "gate-0-summary.md"), buildGate0Summary(input.contract, input.contractSha256), "utf8"),
    writeJson(path.join(input.stageProjectDir, "raw", "intake.json"), rawIntake),
    writeFile(path.join(input.stageProjectDir, "workspace", "index.html"), renderGate0ProjectPreview(input.contract), "utf8")
  ]);
}

async function validateGate0Stage(input: {
  stageResourceDir: string;
  stageProjectDir: string;
  expectedContractSha256: string;
  sourceCatalog: BiologySourceCatalogV1;
}) {
  const contractText = await readFile(path.join(input.stageResourceDir, "production-contract.json"), "utf8");
  if (sha256(contractText) !== input.expectedContractSha256) throw new Error("The staged production contract hash changed during intake.");
  const contract = JSON.parse(contractText) as BiologyProductionContractV1;
  validateProductionContract(contract);
  validateContractSourceLocators(contract, input.sourceCatalog);
  validateRealSourceShape(input.sourceCatalog);
  const dispositions = JSON.parse(await readFile(path.join(input.stageResourceDir, "notes-page-disposition.json"), "utf8")) as {
    pageCount: number;
    dispositions: Array<{ page: number }>;
  };
  if (dispositions.pageCount !== 139 || dispositions.dispositions.length !== 139 || new Set(dispositions.dispositions.map((record) => record.page)).size !== 139) {
    throw new Error("The staged notes disposition is incomplete.");
  }
  const review = JSON.parse(await readFile(path.join(input.stageResourceDir, "gate-0-review.json"), "utf8")) as BiologyGate0ReviewV1;
  if (review.status !== "awaiting-user" || review.decision !== null || review.contractSha256 !== input.expectedContractSha256) {
    throw new Error("The staged Gate 0 review record is stale or pre-approved.");
  }
  const manifest = JSON.parse(await readFile(path.join(input.stageProjectDir, "meta", "project.json"), "utf8")) as ProjectManifest;
  const manifestValidation = validateProjectManifestPolicy(manifest);
  if (manifestValidation.status !== "valid") throw new Error(`Staged project manifest is invalid: ${manifestValidation.errors.join(" ")}`);
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "proposal-only-v1" || manifest.authoring.studioEditing?.enabled !== false) {
    throw new Error("The staged project escaped its blocked proposal boundary.");
  }
  const workspace = await readFile(path.join(input.stageProjectDir, "workspace", "index.html"), "utf8");
  if (/https?:\/\/|fonts\.googleapis\.com|material symbols/i.test(workspace)) {
    throw new Error("The Gate 0 workspace contains a remote runtime dependency.");
  }
  if (/slide-source|slide viewer|data-canvas-helper-edit-key/i.test(workspace)) {
    throw new Error("The Gate 0 workspace contains slide controls or premature Direct-edit ownership.");
  }
  await Promise.all([
    stat(path.join(input.stageResourceDir, "curriculum-map.md")),
    stat(path.join(input.stageResourceDir, "source-catalog.json")),
    stat(path.join(input.stageResourceDir, "factual-correction-ledger.json")),
    stat(path.join(input.stageResourceDir, "content-gap-ledger.json")),
    stat(path.join(input.stageResourceDir, "pilot-tree-hashes.json")),
    stat(path.join(input.stageProjectDir, "meta", "gate-0-summary.md"))
  ]);
}

export async function promoteStagedDirectories(input: {
  pairs: Array<{ stagePath: string; finalPath: string }>;
  beforePromote?: (targetPath: string, index: number) => void | Promise<void>;
}) {
  for (const pair of input.pairs) {
    if (await pathExists(pair.finalPath)) throw new Error(`Refusing to overwrite existing target: ${pair.finalPath}`);
  }
  const promoted: string[] = [];
  try {
    for (let index = 0; index < input.pairs.length; index += 1) {
      const pair = input.pairs[index];
      await input.beforePromote?.(pair.finalPath, index);
      await rename(pair.stagePath, pair.finalPath);
      promoted.push(pair.finalPath);
    }
  } catch (error) {
    for (const promotedPath of promoted.reverse()) await rm(promotedPath, { recursive: true, force: true });
    throw error;
  } finally {
    for (const pair of input.pairs) await rm(pair.stagePath, { recursive: true, force: true });
  }
}

export async function intakeBiology30UnitAV2(request: Biology30V2IntakeRequest): Promise<Biology30V2IntakeResult> {
  const repoRoot = path.resolve(request.repoRoot);
  if (request.family !== BIOLOGY30_V2_FAMILY) throw new Error(`--family must be ${BIOLOGY30_V2_FAMILY}.`);
  if (request.project !== BIOLOGY30_V2_PROJECT) throw new Error(`--project must be ${BIOLOGY30_V2_PROJECT}.`);
  const resourceManifestAbsolute = path.join(repoRoot, RESOURCE_MANIFEST_PATH);
  const finalResourceDir = path.join(repoRoot, "projects", "resources", request.family, "v2");
  const finalProjectDir = path.join(repoRoot, "projects", request.project);
  if (await pathExists(finalResourceDir)) throw new Error(`Refusing existing Biology V2 resource target: ${finalResourceDir}`);
  if (await pathExists(finalProjectDir)) throw new Error(`Refusing existing Biology V2 project target: ${finalProjectDir}`);

  const manifest = JSON.parse(await readFile(resourceManifestAbsolute, "utf8")) as {
    schemaVersion: number;
    family: string;
    resources: NamedBrightspaceResource[];
  };
  if (manifest.schemaVersion !== 2 || manifest.family !== request.family) {
    throw new Error(`Invalid named-resource manifest at ${RESOURCE_MANIFEST_PATH}.`);
  }
  validateProductionSourceManifest(manifest.resources);
  const pilotHashesBefore = await hashAllPilots(repoRoot);
  const models = await Promise.all(
    manifest.resources.map((resource) => loadBiologySourceModel({ repoRoot, resource, unitTitle: "Unit A" }))
  );
  const generatedAt = new Date().toISOString();
  const sourceCatalog = buildSourceCatalog(models, generatedAt);
  validateRealSourceShape(sourceCatalog);
  const classModel = models.find((model) => model.resource.id === "class-2026-27");
  if (!classModel) throw new Error("The class-2026-27 source model is missing.");
  const notesVerification = await verifyNotesSources(repoRoot, classModel);
  const contract = createProductionContract({ resources: manifest.resources, generatedAt });
  validateProductionContract(contract);
  validateContractSourceLocators(contract, sourceCatalog);
  const contractJson = `${JSON.stringify(contract, null, 2)}\n`;
  const contractSha256 = sha256(contractJson);
  const contentGaps = buildContentGapLedger();
  let stageResourceDir = "";
  let stageProjectDir = "";
  try {
    stageResourceDir = await mkdtemp(path.join(path.dirname(finalResourceDir), ".v2-stage-"));
    stageProjectDir = await mkdtemp(path.join(path.dirname(finalProjectDir), ".biology30-unit-a-stage-"));
    await writeGate0Stages({
      stageResourceDir,
      stageProjectDir,
      contract,
      contractJson,
      contractSha256,
      sourceCatalog,
      sourceHashVerification: {
        schemaVersion: 1,
        generatedAt,
        resources: manifest.resources.map((resource) => ({
          id: resource.id,
          path: resource.path,
          expectedSha256: resource.sha256,
          actualSha256: resource.sha256,
          verified: true
        })),
        notes: notesVerification
      },
      pilotTreeHashReport: { schemaVersion: 1, generatedAt, status: "pending-second-pass", before: pilotHashesBefore },
      contentGaps,
      generatedAt,
      resources: manifest.resources
    });
    const pilotHashesAfter = await hashAllPilots(repoRoot);
    assertPilotHashesUnchanged(pilotHashesBefore, pilotHashesAfter);
    await writeJson(path.join(stageResourceDir, "pilot-tree-hashes.json"), {
      schemaVersion: 1,
      generatedAt,
      status: "unchanged",
      before: pilotHashesBefore,
      after: pilotHashesAfter
    });
    await request.testHooks?.afterStageWrite?.(stageResourceDir, stageProjectDir);
    await validateGate0Stage({ stageResourceDir, stageProjectDir, expectedContractSha256: contractSha256, sourceCatalog });
    await promoteStagedDirectories({
      pairs: [
        { stagePath: stageResourceDir, finalPath: finalResourceDir },
        { stagePath: stageProjectDir, finalPath: finalProjectDir }
      ],
      beforePromote: request.testHooks?.beforePromote
    });
    stageResourceDir = "";
    stageProjectDir = "";
    return {
      projectDir: finalProjectDir,
      resourceDir: finalResourceDir,
      contractSha256,
      sourceCatalog,
      pilotTreeHashes: pilotHashesAfter
    };
  } catch (error) {
    if (stageResourceDir) await rm(stageResourceDir, { recursive: true, force: true });
    if (stageProjectDir) await rm(stageProjectDir, { recursive: true, force: true });
    throw error;
  }
}
