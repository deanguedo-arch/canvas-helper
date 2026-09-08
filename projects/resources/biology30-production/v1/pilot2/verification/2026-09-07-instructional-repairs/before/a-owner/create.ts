import { createHash, randomUUID } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { createReadStream } from "node:fs";
import {
  copyFile,
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
import { promisify } from "node:util";

import { load as loadHtml } from "cheerio";

import { validateProjectManifestPolicy } from "../project-manifest-policy.js";
import type { ProjectManifest } from "../types.js";
import {
  FIGURE_CANDIDATES,
  OPTIONAL_MINUTES,
  OUTCOME_ROUTE_MAP,
  PILOT_1_ROUTE_MAP,
  PILOT_2_LESSONS,
  PILOT_2_REVIEW_ROUTES,
  PILOT_2_SLUG,
  PILOT_2_SOURCE_SLUG,
  PILOT_2_SOURCE_WORKSPACE_SHA256,
  POWERPOINT_SOURCES,
  REQUIRED_MINUTES,
  SHARED_ARCHIVE_SOURCES,
  TEACHER_PLAN_ROWS,
  TEACHER_SOURCE_FILES,
  VIDEO_REMAP,
  VOCABULARY_LESSON_MAP,
  buildPerformanceBehaviours,
  buildPracticeBlueprint,
  buildSlideDispositions
} from "./contracts.js";
import { renderPilot2Gate1 } from "./render-gate1.js";

const execFile = promisify(execFileCallback);
const PROTECTED_PROJECTS = [
  PILOT_2_SOURCE_SLUG,
  "biology30-unit-a",
  "biology30-unit-b",
  "biology30-unit-c",
  "biology30-unit-d"
] as const;
const GATE_1_VIDEO_IDS = new Set(["A44brRGG4Ys", "YcJy28Nnrb8", "o0DYP-u1rNM", "y9Bdi4dnSlg", "v-t1Z5-oPtU"]);
const GATE_1_FIGURE_IDS = new Set(["neuron-roles", "myelin-saltatory", "synaptic-transmission", "stress-response"]);

export type Pilot2CreateRequest = {
  repoRoot: string;
  source: string;
  project: string;
  sourceWorkspaceSha256: string;
  testHooks?: {
    afterStageWrite?: (stageProjectDir: string) => void | Promise<void>;
    beforePromote?: (stageProjectDir: string, targetProjectDir: string) => void | Promise<void>;
  };
};

export type TreeHash = {
  slug: string;
  sha256: string;
  fileCount: number;
  byteCount: number;
  excludedPaths?: string[];
};

export type Pilot2CreateResult = {
  projectDir: string;
  workspaceSha256: string;
  workspaceTreeSha256: string;
  gate1Routes: string[];
  protectedProjectHashes: TreeHash[];
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
      entries.push(...await collectTreeEntries(rootDir, relativePath));
    } else if (details.isSymbolicLink()) {
      const target = await readlink(absolutePath);
      entries.push({ relativePath, kind: "symlink", size: Buffer.byteLength(target), digest: sha256(target) });
    } else if (details.isFile()) {
      entries.push({ relativePath, kind: "file", size: details.size, digest: await sha256File(absolutePath) });
    } else {
      throw new Error(`Unsupported tree entry: ${absolutePath}`);
    }
  }
  return entries;
}

export async function hashTree(
  rootDir: string,
  slug = path.basename(rootDir),
  excludedRelativePaths: readonly string[] = []
): Promise<TreeHash> {
  if (!(await pathExists(rootDir))) throw new Error(`Required project is missing: ${rootDir}`);
  const excludedPaths = [...new Set(excludedRelativePaths.map((entry) => entry.split(path.sep).join(path.posix.sep)))].sort();
  const excludedSet = new Set(excludedPaths);
  const entries = (await collectTreeEntries(rootDir)).filter((entry) => !excludedSet.has(entry.relativePath));
  const hash = createHash("sha256");
  let byteCount = 0;
  for (const entry of entries) {
    hash.update(`${entry.kind}\0${entry.relativePath}\0${entry.size}\0${entry.digest}\n`);
    byteCount += entry.size;
  }
  return {
    slug,
    sha256: hash.digest("hex"),
    fileCount: entries.length,
    byteCount,
    ...(excludedPaths.length > 0 ? { excludedPaths } : {})
  };
}

async function hashProtectedProjects(repoRoot: string) {
  return Promise.all(PROTECTED_PROJECTS.map((slug) => hashTree(path.join(repoRoot, "projects", slug), slug)));
}

function assertTreeHashesEqual(before: TreeHash[], after: TreeHash[]) {
  const afterBySlug = new Map(after.map((entry) => [entry.slug, entry]));
  for (const entry of before) {
    const next = afterBySlug.get(entry.slug);
    if (!next || next.sha256 !== entry.sha256 || next.fileCount !== entry.fileCount || next.byteCount !== entry.byteCount) {
      throw new Error(`Protected project changed during Pilot 2 creation: ${entry.slug}`);
    }
  }
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function countSyllables(rawWord: string) {
  const word = rawWord.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  const normalized = word.replace(/(?:[^l]e|ed|es)$/i, "").replace(/^y/, "");
  return Math.max(1, normalized.match(/[aeiouy]{1,2}/g)?.length ?? 1);
}

function readingLevel(text: string) {
  const normalized = normalizeWhitespace(text);
  const words: string[] = normalized.match(/[A-Za-z][A-Za-z'’-]*/g) ?? [];
  const sentences = Math.max(1, normalized.match(/[.!?]+(?=\s|$)/g)?.length ?? 1);
  const syllables = words.reduce((total, word) => total + countSyllables(word), 0);
  const grade = 0.39 * (words.length / sentences) + 11.8 * (syllables / Math.max(1, words.length)) - 15.59;
  return { wordCount: words.length, sentenceCount: sentences, syllableCount: syllables, fleschKincaidGrade: Number(grade.toFixed(1)) };
}

function chapterPracticeRoute(outcomeId: string) {
  if (/^A1\.[456]/.test(outcomeId)) return "chapter-12-practice";
  return outcomeId.startsWith("A1") ? "chapter-11-practice" : "chapter-13-practice";
}

function buildCurriculumMap(outcomes: Array<Record<string, unknown>>, generatedAt: string) {
  if (outcomes.length !== 25) throw new Error(`Expected 25 Unit A outcomes; found ${outcomes.length}.`);
  const records = outcomes.map((outcome) => {
    const id = String(outcome.id);
    const teachRoutes = OUTCOME_ROUTE_MAP[id];
    if (!teachRoutes?.length) throw new Error(`Outcome ${id} has no explicit Pilot 2 teach route.`);
    const lessonRoutes = teachRoutes.filter((route) => /^lesson-/.test(route));
    const anchor = lessonRoutes[0] ?? teachRoutes[0];
    return {
      id,
      officialText: outcome.officialText,
      category: outcome.category,
      authorityUrl: outcome.authorityUrl,
      teachRoutes,
      visualOrModelRoutes: lessonRoutes.length ? lessonRoutes.map((route) => `${route}#visual`) : ["model-lab"],
      workedExampleRoutes: lessonRoutes.length ? lessonRoutes.map((route) => `${route}#worked-example`) : ["review-seminar#worked-example"],
      practiceRoutes: [chapterPracticeRoute(id), "final-practice"],
      evidenceRoutes: [anchor === "process-collection" ? anchor : `${anchor}#evidence-slip`, "process-collection"],
      coverageRule: "Required instruction must explain the mechanism and cannot be satisfied by a title, checklist, or final review mention."
    };
  });
  return {
    schemaVersion: 1,
    profileId: "biology30-unit-a-pilot-2-curriculum-v1",
    project: PILOT_2_SLUG,
    generatedAt,
    authority: {
      programOfStudies: "https://education.alberta.ca/media/159727/bio203007.pdf",
      performanceStandards: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf",
      biologyInformationBulletin: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology-30-info-bulletin.pdf",
      currentGeneralBulletin: "https://www.alberta.ca/system/files/ecc-diploma-exam-general-information-bulletin-2026-27.pdf",
      diplomaSupportPage: "https://www.alberta.ca/writing-diploma-exams",
      recheckedAt: generatedAt.slice(0, 10),
      biologySpecificBulletinFinding: "No newer 2026-27 Biology-specific bulletin was listed at implementation start; the 2025-26 Biology bulletin remains the recorded subject-specific reference alongside the 2026-27 general bulletin."
    },
    outcomes: records,
    performanceBehaviours: buildPerformanceBehaviours()
  };
}

function dispositionForSection(routeId: string, classes: string, text: string) {
  if (/advanced|extension|deeper/i.test(classes)) return "advanced-rewrite";
  if (/quiz|practice|review/i.test(classes) || /guided practice|formative practice/i.test(text)) return "move-to-review";
  if (/video|model|interaction|notebook|collection|library|vocab|glossary/i.test(`${classes} ${routeId}`)) return "keep-interaction";
  if (/slide|placeholder|comparison rubric|source provenance/i.test(`${classes} ${text}`)) return "exclude-duplicate";
  return PILOT_1_ROUTE_MAP[routeId]?.treatment ?? "core-rewrite";
}

function buildPilot1SectionDisposition(sourceHtml: string) {
  const $ = loadHtml(sourceHtml);
  const records: Array<Record<string, unknown>> = [];
  $(".course-page[id]").each((_routeIndex, routeElement) => {
    const routeId = $(routeElement).attr("id") ?? "";
    const routeMap = PILOT_1_ROUTE_MAP[routeId];
    if (!routeMap) throw new Error(`Pilot 1 route is missing a Pilot 2 disposition: ${routeId}`);
    records.push({ sourceRouteId: routeId, sourceSectionId: routeId, kind: "route", destinationRoutes: routeMap.destinations, treatment: routeMap.treatment });
    $(routeElement).find("section, header, footer, aside").each((sectionIndex, sectionElement) => {
      const section = $(sectionElement);
      const sectionId = section.attr("id") || `${routeId}:section-${String(sectionIndex + 1).padStart(3, "0")}`;
      const classes = section.attr("class") ?? "";
      const text = normalizeWhitespace(section.find("h1,h2,h3,.section-label,.eyebrow").first().text()).slice(0, 180);
      records.push({
        sourceRouteId: routeId,
        sourceSectionId: sectionId,
        kind: sectionElement.tagName,
        sourceHeading: text || null,
        sourceClasses: classes.split(/\s+/).filter(Boolean),
        destinationRoutes: routeMap.destinations,
        treatment: dispositionForSection(routeId, classes, text)
      });
    });
  });
  return { schemaVersion: 1, project: PILOT_2_SLUG, sourceProject: PILOT_2_SOURCE_SLUG, recordCount: records.length, records };
}

function buildRouteAndStateMap(sourceHtml: string, newHtml: string) {
  const oldStateIds = [...new Set(sourceHtml.match(/biology30-unit-a-pilot:[A-Za-z0-9:._-]+/g) ?? [])].sort();
  const newStateIds = [...new Set(newHtml.match(/biology30-unit-a-pilot-2:[A-Za-z0-9:._-]+/g) ?? [])].sort();
  return {
    schemaVersion: 1,
    sourceProject: PILOT_2_SOURCE_SLUG,
    project: PILOT_2_SLUG,
    routeMap: Object.entries(PILOT_1_ROUTE_MAP).map(([sourceRouteId, record]) => ({ sourceRouteId, ...record })),
    stateIdMap: oldStateIds.map((oldId) => ({ oldId, newId: oldId.replace("biology30-unit-a-pilot:", "biology30-unit-a-pilot-2:"), migrationPolicy: "namespace-reservation-only-no-learner-state-import" })),
    currentPilot2StateIds: newStateIds
  };
}

function validatePlanningContracts(input: {
  curriculumMap: ReturnType<typeof buildCurriculumMap>;
  slideDispositions: ReturnType<typeof buildSlideDispositions>;
  sectionDisposition: ReturnType<typeof buildPilot1SectionDisposition>;
  practiceBlueprint: ReturnType<typeof buildPracticeBlueprint>;
  vocabularyEntries: Array<Record<string, unknown>>;
}) {
  if (REQUIRED_MINUTES !== 1505 || OPTIONAL_MINUTES !== 295) throw new Error("Pilot 2 route minutes do not match the approved 1,505/295 contract.");
  if (PILOT_2_LESSONS.length !== 13 || PILOT_2_REVIEW_ROUTES.length !== 5) throw new Error("Pilot 2 must contain 13 lessons and five review routes.");
  if (input.curriculumMap.outcomes.length !== 25 || input.curriculumMap.performanceBehaviours.length !== 53) throw new Error("Curriculum or performance-behaviour mapping is incomplete.");
  for (const outcome of input.curriculumMap.outcomes) {
    for (const field of ["teachRoutes", "visualOrModelRoutes", "workedExampleRoutes", "practiceRoutes", "evidenceRoutes"] as const) {
      if (!Array.isArray(outcome[field]) || outcome[field].length === 0) throw new Error(`Outcome ${outcome.id} is missing ${field}.`);
    }
  }
  if (input.slideDispositions.length !== 138) throw new Error("Every PowerPoint slide must have a disposition.");
  if (input.sectionDisposition.recordCount === 0) throw new Error("Pilot 1 section disposition is empty.");
  if (input.vocabularyEntries.length !== 28) throw new Error("Pilot 2 must preserve exactly 28 core vocabulary families.");
  const { lessonItems, chapterItems, finalCoreItems, challengeItems } = input.practiceBlueprint;
  if (lessonItems.length !== 26 || chapterItems.length !== 36 || finalCoreItems.length !== 18 || challengeItems.length !== 6) {
    throw new Error("Practice blueprint does not match 26/36/18/6.");
  }
  const myelin = input.curriculumMap.performanceBehaviours.find((entry) => entry.id === "A1.1k-02");
  if (!myelin || !myelin.teachRoute || !myelin.visualOrModelRoute || !myelin.workedExampleRoute || !myelin.practiceRoute || !myelin.evidenceRoute) {
    throw new Error("Myelin coverage is not atomic and complete.");
  }
}

async function copyApprovedAsset(sourceWorkspace: string, stageWorkspace: string, relativePath: string) {
  const source = path.join(sourceWorkspace, relativePath);
  const target = path.join(stageWorkspace, relativePath);
  await stat(source);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
}

async function verifySourceFiles(repoRoot: string) {
  const sourceRoot = path.join(repoRoot, "projects", "resources", "biology30-unit-a-pilot", "_sources");
  const verified: Array<Record<string, unknown>> = [];
  for (const source of TEACHER_SOURCE_FILES) {
    const sourcePath = path.join("/Users/deanguedo/Downloads", source.filename);
    const actual = await sha256File(sourcePath);
    if (actual !== source.sha256) throw new Error(`Teacher source hash mismatch: ${source.filename}`);
    verified.push({ ...source, originalFilename: source.filename, verifiedSha256: actual, storageRole: "immutable-raw-source" });
  }
  for (const source of SHARED_ARCHIVE_SOURCES) {
    const sourcePath = path.join(sourceRoot, `${source.sha256}.${source.extension}`);
    const actual = await sha256File(sourcePath);
    if (actual !== source.sha256) throw new Error(`Shared source hash mismatch: ${source.id}`);
    verified.push({ ...source, originalFilename: POWERPOINT_SOURCES.find((entry) => entry.id === source.id)?.filename ?? null, verifiedSha256: actual, canonicalPath: path.relative(repoRoot, sourcePath), storageRole: "shared-source-reference" });
  }
  return verified;
}

function buildPromptPack(workspaceSha256: string) {
  return `# Biology 30 Unit A Pilot 2 prompt pack\n\n## Boundary\n\n- Project: \`biology30-unit-a-pilot-2\`\n- Canonical learner source: \`projects/biology30-unit-a-pilot-2/workspace/index.html\`\n- Ownership: direct workspace, blocked, preview-only, Studio Edit disabled\n- Current slice SHA-256: \`${workspaceSha256}\`\n- Pilot 1 and production Units A-D are protected references and must not be edited.\n- Start future work by reading \`projects/biology30-unit-a-pilot/meta/unit-a-to-bcd-improvement-playbook.md\` and this project's Gate 1 review record.\n\n## Current gate\n\nGate 0 contracts are complete. Gate 1 contains Lessons 1, 3, and 13; Chapter 11 Practice; learned-so-far Core Vocabulary; Process Collection; and representative resource deep links. Stop for explicit teacher review before building the remaining ten lessons or four review routes.\n\n## Review questions\n\n1. Can a learner follow each explanation without teacher narration?\n2. Are new terms defined before they are used?\n3. Is myelin function explicit, visible, practised, and checked?\n4. Is neurotransmitter defined before acetylcholine?\n5. Is Lesson 13 manageable rather than compressed?\n6. Are visuals interspersed beside the ideas they explain?\n7. Are the five navigation groups easier than Pilot 1?\n8. Is Advanced Learning useful without being required?\n\n## Verification\n\n\`npm run test:biology30-unit-a-pilot-2\`\n\`npm run audit:biology30-unit-a-pilot-2:visual\`\n\`npm run verify -- --project biology30-unit-a-pilot-2 --mode workspace\`\n\`npm run test:e2e:project -- --project biology30-unit-a-pilot-2\`\n\`npm run test:e2e:biology30-unit-a-pilot-2\`\n\`npm run course:doctor -- --project biology30-unit-a-pilot-2\`\n`;
}

async function validateStagedProject(stageProjectDir: string, expectedWorkspaceSha256: string) {
  const workspacePath = path.join(stageProjectDir, "workspace", "index.html");
  const html = await readFile(workspacePath, "utf8");
  if (await sha256File(workspacePath) !== expectedWorkspaceSha256) throw new Error("Staged workspace hash changed during validation.");
  if (/biology30-unit-a-pilot:(?!-2)/.test(html)) throw new Error("Pilot 1 learner-state namespace leaked into the Pilot 2 workspace.");
  const learnerDocument = loadHtml(html);
  learnerDocument("script,style").remove();
  if (/SCORM|source hash|provenance|comparison pilot|teacher key|secure quiz/i.test(learnerDocument("body").text())) {
    throw new Error("Learner-facing administrative or prohibited assessment language was found.");
  }
  const $ = loadHtml(html);
  const routes = $(".course-page[id]").map((_index, element) => $(element).attr("id")).get();
  if (routes.length !== 12 || new Set(routes).size !== routes.length) throw new Error("Gate 1 learner route inventory must contain 12 unique routes.");
  if ($(".lesson-page").length !== 3 || $(".lesson-page [data-practice-id]").length !== 6 || $("#chapter-11-practice [data-practice-id]").length !== 12) {
    throw new Error("Gate 1 lesson or practice slice is incomplete.");
  }
  const stateIds = $("[data-response-id],[data-practice-id],[data-save-investigation]").map((_index, element) =>
    $(element).attr("data-response-id") ?? $(element).attr("data-practice-id") ?? $(element).attr("data-save-investigation")
  ).get();
  if (stateIds.some((id) => !id?.startsWith("biology30-unit-a-pilot-2:"))) throw new Error("A Gate 1 learner-state ID is not namespaced to Pilot 2.");
  if (new Set(stateIds).size !== stateIds.length) throw new Error("Duplicate Pilot 2 learner-state IDs were rendered.");
  if ($(".science-figure img").length !== 4 || $(".science-figure").filter((_index, element) => !$(element).find("figcaption").text().trim()).length) {
    throw new Error("Gate 1 figure placement or text equivalents are incomplete.");
  }
  if ($("button").filter((_index, element) => /play optional video/i.test($(element).text())).length) throw new Error("A custom optional-video play button was rendered.");
  const manifest = JSON.parse(await readFile(path.join(stageProjectDir, "meta", "project.json"), "utf8")) as ProjectManifest;
  const manifestResult = validateProjectManifestPolicy(manifest);
  if (manifestResult.status !== "valid") throw new Error(`Staged project manifest is invalid: ${manifestResult.errors.join(" ")}`);
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "direct-workspace-v1" || manifest.authoring.studioEditing?.enabled !== false) {
    throw new Error("Pilot 2 escaped its blocked direct-workspace boundary.");
  }
  if (manifest.exportTargets?.some((target) => target.enabled !== false)) throw new Error("Pilot 2 has an enabled export target.");
}

export async function createBiology30UnitAPilot2(request: Pilot2CreateRequest): Promise<Pilot2CreateResult> {
  const repoRoot = path.resolve(request.repoRoot);
  if (request.source !== PILOT_2_SOURCE_SLUG) throw new Error(`--source must be ${PILOT_2_SOURCE_SLUG}.`);
  if (request.project !== PILOT_2_SLUG) throw new Error(`--project must be ${PILOT_2_SLUG}.`);
  if (request.sourceWorkspaceSha256 !== PILOT_2_SOURCE_WORKSPACE_SHA256) throw new Error("The requested source-workspace SHA does not match the approved Pilot 2 baseline contract.");

  const sourceProjectDir = path.join(repoRoot, "projects", request.source);
  const sourceWorkspaceDir = path.join(sourceProjectDir, "workspace");
  const sourceWorkspacePath = path.join(sourceWorkspaceDir, "index.html");
  const targetProjectDir = path.join(repoRoot, "projects", request.project);
  if (await pathExists(targetProjectDir)) throw new Error(`Refusing existing Pilot 2 target: ${targetProjectDir}`);
  const actualSourceWorkspaceSha = await sha256File(sourceWorkspacePath);
  if (actualSourceWorkspaceSha !== request.sourceWorkspaceSha256) throw new Error(`Pilot 1 source workspace changed: expected ${request.sourceWorkspaceSha256}, found ${actualSourceWorkspaceSha}.`);

  const generatedAt = new Date().toISOString();
  const [gitBranch, gitCommit, gitStatusResult, protectedProjectHashes, verifiedSources] = await Promise.all([
    execFile("git", ["branch", "--show-current"], { cwd: repoRoot }).then((result) => result.stdout.trim()),
    execFile("git", ["rev-parse", "HEAD"], { cwd: repoRoot }).then((result) => result.stdout.trim()),
    execFile("git", ["status", "--short"], { cwd: repoRoot, maxBuffer: 10 * 1024 * 1024 }).then((result) => result.stdout.split(/\r?\n/).filter(Boolean)),
    hashProtectedProjects(repoRoot),
    verifySourceFiles(repoRoot)
  ]);

  const productionContract = JSON.parse(await readFile(path.join(repoRoot, "projects", "resources", "biology30-unit-a-pilot", "v2", "production-contract.json"), "utf8")) as { outcomes: Array<Record<string, unknown>> };
  const sourceVocabulary = JSON.parse(await readFile(path.join(sourceProjectDir, "meta", "core-vocabulary.json"), "utf8")) as {
    entries: Array<Record<string, unknown>>;
    fixedMilestones: Array<{ module: string; entryId: string }>;
  };
  const sourceMedia = JSON.parse(await readFile(path.join(sourceProjectDir, "meta", "media-integration.json"), "utf8")) as { videos: Array<Record<string, unknown>> };
  const sourceHtml = await readFile(sourceWorkspacePath, "utf8");

  const vocabularyEntries = sourceVocabulary.entries.map((entry) => {
    const id = String(entry.id);
    const primaryLessonIds = VOCABULARY_LESSON_MAP[id];
    if (!primaryLessonIds?.length) throw new Error(`No Pilot 2 vocabulary teaching route exists for ${id}.`);
    return { ...entry, id, primaryLessonIds, practiceIds: [], modelId: undefined, pilot2ReviewStatus: "awaiting-context-review" };
  });
  const fixedVocabularyIds = sourceVocabulary.fixedMilestones.map((entry) => entry.entryId);
  const videos = VIDEO_REMAP.filter((record) => GATE_1_VIDEO_IDS.has(record.youtubeId)).map((record) => {
    const source = sourceMedia.videos.find((video) => video.youtubeId === record.youtubeId);
    if (!source) throw new Error(`Required Gate 1 video is absent from the Pilot 1 media contract: ${record.youtubeId}`);
    const lesson = PILOT_2_LESSONS.find((entry) => entry.id === record.routeId);
    return { ...source, ...record, chapter: lesson?.chapter ?? 11 };
  });
  if (videos.length !== 5) throw new Error("Gate 1 must include five representative videos across Chapters 11–13.");

  const curriculumMap = buildCurriculumMap(productionContract.outcomes, generatedAt);
  const slideDispositions = buildSlideDispositions();
  const sectionDisposition = buildPilot1SectionDisposition(sourceHtml);
  const practiceBlueprint = buildPracticeBlueprint(curriculumMap.performanceBehaviours);
  validatePlanningContracts({ curriculumMap, slideDispositions, sectionDisposition, practiceBlueprint, vocabularyEntries });

  const stageProjectDir = await mkdtemp(path.join(repoRoot, "projects", ".biology30-unit-a-pilot-2-stage-"));
  try {
    const stageRawDir = path.join(stageProjectDir, "raw");
    const stageWorkspaceDir = path.join(stageProjectDir, "workspace");
    const stageMetaDir = path.join(stageProjectDir, "meta");
    await Promise.all([
      mkdir(path.join(stageRawDir, "teacher-sources"), { recursive: true }),
      mkdir(stageWorkspaceDir, { recursive: true }),
      mkdir(stageMetaDir, { recursive: true })
    ]);
    await copyFile(sourceWorkspacePath, path.join(stageRawDir, "index.html"));
    for (const source of TEACHER_SOURCE_FILES) {
      await copyFile(path.join("/Users/deanguedo/Downloads", source.filename), path.join(stageRawDir, "teacher-sources", `${source.sha256}.docx`));
    }

    const approvedAssets = [
      "assets/brand/nxt-ce-logo-white-with-ce.png",
      "assets/font-manifest.json",
      "assets/fonts/HankenGrotesk-Variable.ttf",
      "assets/fonts/OFL-Hanken-Grotesk.txt",
      "assets/fonts/OFL-Work-Sans.txt",
      "assets/fonts/WorkSans-Variable.ttf",
      "assets/textbook/chapter-11.pdf",
      "assets/textbook/chapter-12.pdf",
      "assets/textbook/chapter-13.pdf",
      ...FIGURE_CANDIDATES.filter((figure) => GATE_1_FIGURE_IDS.has(figure.id)).map((figure) => figure.path)
    ];
    for (const relativePath of approvedAssets) await copyApprovedAsset(sourceWorkspaceDir, stageWorkspaceDir, relativePath);

    const render = renderPilot2Gate1({
      lessons: PILOT_2_LESSONS,
      vocabularyEntries: vocabularyEntries as never,
      fixedVocabularyIds,
      videos: videos as never
    });
    const workspacePath = path.join(stageWorkspaceDir, "index.html");
    await writeFile(workspacePath, render.html, "utf8");
    const workspaceSha256 = await sha256File(workspacePath);
    const workspaceTree = await hashTree(stageWorkspaceDir, "workspace");
    const routeStateMap = buildRouteAndStateMap(sourceHtml, render.html);

    const new$ = loadHtml(render.html);
    const gate1Reading = ["lesson-01", "lesson-03", "lesson-13"].map((routeId) => {
      const route = new$(`#${routeId}`).clone();
      route.find("details.advanced-learning,.practice-feedback,script,style").remove();
      const prose = route.find(".learn-block,.stop-check,.worked-example").find("p,li,figcaption,td,th")
        .map((_index, element) => new$(element).text()).get().join(" ");
      return { routeId, ...readingLevel(prose) };
    });
    const source$ = loadHtml(sourceHtml);
    const sourceReading = source$(".lesson-page[id]").map((_index, element) => {
      const lesson = source$(element).clone();
      lesson.find("details,.practice-feedback,script,style").remove();
      const prose = lesson.find("p,li,figcaption,td,th").map((_itemIndex, item) => source$(item).text()).get().join(" ");
      return { routeId: source$(element).attr("id"), ...readingLevel(prose) };
    }).get();
    const overReadingCeiling = gate1Reading.filter((record) => record.fleschKincaidGrade > 12);
    if (overReadingCeiling.length) {
      throw new Error(`Gate 1 core reading level exceeds grade 12: ${overReadingCeiling.map((record) => `${record.routeId}=${record.fleschKincaidGrade}`).join(", ")}`);
    }

    const figurePlan = await Promise.all(FIGURE_CANDIDATES.map(async (figure) => ({
      ...figure,
      sourceProject: PILOT_2_SOURCE_SLUG,
      sourceSha256: await sha256File(path.join(sourceWorkspaceDir, figure.path)),
      gate1Treatment: GATE_1_FIGURE_IDS.has(figure.id) ? "placed-for-exact-context-review" : "planned-after-gate-1-approval",
      rightsStatus: "authorized-private-course-use; public redistribution not approved",
      accessibilityStatus: GATE_1_FIGURE_IDS.has(figure.id) ? "inline-alt-long-description-and-enlargement-present" : "required-before-placement",
      teacherDecision: "pending-in-pilot-2-context"
    })));
    const videoPlan = VIDEO_REMAP.map((record) => ({
      ...record,
      treatment: GATE_1_VIDEO_IDS.has(record.youtubeId) ? "representative-gate-1-placement" : "planned-after-gate-1-approval",
      completionImpact: false,
      requiredInstructionDependency: false,
      customPlayButton: false
    }));
    const vocabularyContract = {
      schemaVersion: 1,
      profileId: "biology30-unit-a-pilot-2-core-vocabulary-v1",
      project: PILOT_2_SLUG,
      status: "gate-1-awaiting-teacher-review",
      policy: { entryCount: 28, gradualUnlock: true, defaultView: "learned-so-far", fixedFrayerCount: 6, choiceFrayerCount: 2, completionGating: false },
      fixedMilestones: sourceVocabulary.fixedMilestones,
      entries: vocabularyEntries
    };
    const stateBudget = {
      schemaVersion: 1,
      project: PILOT_2_SLUG,
      hardGuardCharacters: 44000,
      estimatedWorstCaseCharacters: 39520,
      remainingCharacters: 4480,
      allocations: {
        lessonEvidenceSlips: 6500,
        lessonRetrievalResponses: 5200,
        eightFrayerModels: 7680,
        threeInvestigations: 2800,
        learnerProcessNote: 600,
        eightyRequiredAndSixOptionalPracticeItems: 7740,
        routeVocabularyAndInteractionState: 3000,
        serializationAndVersioningOverhead: 6000
      },
      overflowPolicy: "Reject an oversized write and preserve the last valid saved state. Never silently truncate learner work."
    };
    const contract = {
      schemaVersion: 1,
      profileId: "biology30-unit-a-pilot-2-topic-sequence-v1",
      project: PILOT_2_SLUG,
      title: "Biology 30 — Unit A: Nervous and Endocrine Systems",
      courseCode: "BIO 30",
      status: "blocked",
      previewOnly: true,
      studioEditing: false,
      exportEnabled: false,
      requiredMinutes: REQUIRED_MINUTES,
      optionalMinutes: OPTIONAL_MINUTES,
      requiredRouteCount: 18,
      navigationGroups: ["Start", "Learn", "Practice & Review", "Process Collection", "Resources"],
      lessons: PILOT_2_LESSONS,
      reviewRoutes: PILOT_2_REVIEW_ROUTES,
      curriculumMapPath: "meta/curriculum-performance-map.json",
      teacherCrosswalkPath: "meta/teacher-source-crosswalk.json",
      sectionDispositionPath: "meta/pilot-1-section-disposition.json",
      practiceBlueprintPath: "meta/practice-blueprint.json",
      vocabularyContractPath: "meta/core-vocabulary.json",
      figureMediaPlanPath: "meta/figure-media-plan.json",
      routeStateMapPath: "meta/route-response-map.json",
      stateBudgetPath: "meta/state-budget.json",
      completionRule: "Thirteen lessons, three chapter practices, Review Seminar, and Final Practice; optional learning never gates completion.",
      gate1: { renderedRoutes: render.learnerRoutes, workspaceSha256, workspaceTreeSha256: workspaceTree.sha256, teacherAcceptance: "pending" }
    };
    const projectManifest: ProjectManifest = {
      id: randomUUID(),
      slug: PILOT_2_SLUG,
      title: "Biology 30 — Unit A: Nervous and Endocrine Systems",
      sourcePath: `projects/${PILOT_2_SLUG}/raw/index.html`,
      inputKind: "html",
      brightspaceTarget: "scorm",
      previewModes: ["workspace"],
      workspaceEntrypoint: "workspace/index.html",
      rawEntrypoint: "raw/index.html",
      learningSource: "other",
      learningTrust: "curated",
      learningUpdatedAt: generatedAt,
      createdAt: generatedAt,
      updatedAt: generatedAt,
      migrationState: "migrated",
      projectType: "hybrid",
      preferredWorkflows: ["generated-course", "conversion"],
      canonicalEntry: `projects/${PILOT_2_SLUG}/workspace/index.html`,
      canonicalSources: [
        `projects/${PILOT_2_SLUG}/workspace/index.html`,
        ...approvedAssets.map((asset) => `projects/${PILOT_2_SLUG}/workspace/${asset}`),
        ...["pilot-2-contract.json", "curriculum-performance-map.json", "teacher-source-crosswalk.json", "pilot-1-section-disposition.json", "practice-blueprint.json", "core-vocabulary.json", "figure-media-plan.json", "route-response-map.json", "reading-level-report.json", "state-budget.json", "prompt-pack.md"].map((file) => `projects/${PILOT_2_SLUG}/meta/${file}`)
      ],
      generatedOutputs: [],
      authoring: {
        driverId: "direct-workspace-v1",
        familyId: "biology30-unit-a-student-ready-pilot-2",
        qualityProfile: "biology30-unit-a-pilot-2-topic-sequence-v1",
        learnerSurfaces: { schemaVersion: 1, mode: "static-pages-complete", pages: [{ htmlPath: "index.html", route: "" }] },
        studioEditing: { enabled: false, renameCourse: false, imageAssets: false }
      },
      injectedComponents: [],
      authoringStatus: "blocked",
      exportTargets: [
        { target: "html", enabled: false, notes: "Preview-only while Pilot 2 is reviewed." },
        { target: "scorm", enabled: false, notes: "Export remains disabled until a separately approved production decision." }
      ],
      referenceOnly: [
        `projects/${PILOT_2_SLUG}/raw/index.html`,
        ...TEACHER_SOURCE_FILES.map((source) => `projects/${PILOT_2_SLUG}/raw/teacher-sources/${source.sha256}.docx`)
      ],
      importedFirstPassOrigin: {
        sourceSystem: "other",
        sourcePath: `projects/${PILOT_2_SOURCE_SLUG}/workspace/index.html`,
        importedAt: generatedAt,
        notes: `Forked from the exact Pilot 1 workspace SHA-256 ${PILOT_2_SOURCE_WORKSPACE_SHA256}; learner structure was rebuilt rather than copied into the new canonical workspace.`
      },
      sourceOfTruthNotes: "The Pilot 2 workspace is directly authored and canonical. The raw HTML and teacher-source copies are immutable references. Shared Brightspace and PowerPoint archives remain in the Unit A shared source library. Pilot 1 and production Units A-D are protected references. Stop after Gate 1 until explicit teacher acceptance of the exact workspace hash."
    };
    const e2eContract = {
      $schema: "../../../e2e/project-e2e-contract.schema.json",
      projectSlug: PILOT_2_SLUG,
      requiredTestIds: ["studio-shell", "course-studio-tab", "workspace-project-select", "project-root", "workspace-preview-frame"],
      modes: { enabled: false },
      navigation: { enabled: false },
      quiz: { enabled: false, lessonTitle: "Chapter 11 Practice" },
      fallbackPanel: { enabled: false },
      learnerCourse: {
        enabled: true,
        routes: render.learnerRoutes,
        hintRoutes: [],
        printRoutes: ["process-collection"],
        evidenceScenario: {
          kind: "individual",
          route: "lesson-01",
          captureId: "lesson-01-evidence-slip",
          contributionId: "biology30-unit-a-pilot-2:lesson-01:evidence-slip",
          responseId: "biology30-unit-a-pilot-2:lesson-01:evidence-slip",
          setupResponses: [{ responseId: "biology30-unit-a-pilot-2:lesson-01:evidence-slip", value: "{{e2e-value}}" }]
        },
        resourceChecks: [],
        mobile: { width: 390, height: 844, routes: ["overview", "lesson-01", "lesson-03", "lesson-13", "chapter-11-practice", "process-collection", "core-vocabulary", "textbook-library", "video-library", "model-lab"] }
      }
    };

    await Promise.all([
      writeJson(path.join(stageMetaDir, "project.json"), projectManifest),
      writeJson(path.join(stageMetaDir, "pilot-2-contract.json"), contract),
      writeJson(path.join(stageMetaDir, "curriculum-performance-map.json"), curriculumMap),
      writeJson(path.join(stageMetaDir, "teacher-source-crosswalk.json"), { schemaVersion: 1, project: PILOT_2_SLUG, sources: verifiedSources, teacherPlanRows: TEACHER_PLAN_ROWS, slideDispositions, prohibitedMaterialPolicy: ["credentials", "secure quizzes", "tests", "teacher-only keys", "broken LMS launchers"] }),
      writeJson(path.join(stageMetaDir, "pilot-1-section-disposition.json"), sectionDisposition),
      writeJson(path.join(stageMetaDir, "practice-blueprint.json"), practiceBlueprint),
      writeJson(path.join(stageMetaDir, "core-vocabulary.json"), vocabularyContract),
      writeJson(path.join(stageMetaDir, "vocabulary-dependency-graph.json"), { schemaVersion: 1, project: PILOT_2_SLUG, entries: vocabularyEntries.map((entry) => ({ id: entry.id, taughtAt: entry.primaryLessonIds, prerequisiteRule: "plain-language-introduction-before-required-use" })) }),
      writeJson(path.join(stageMetaDir, "figure-media-plan.json"), { schemaVersion: 1, project: PILOT_2_SLUG, figures: figurePlan, videos: videoPlan }),
      writeJson(path.join(stageMetaDir, "route-response-map.json"), routeStateMap),
      writeJson(path.join(stageMetaDir, "reading-level-report.json"), { schemaVersion: 1, project: PILOT_2_SLUG, method: "Flesch-Kincaid grade estimate; scientific terms can raise the estimate and are also reviewed in context", targetRange: [9.5, 11.5], hardMaximum: 12, pilot1Baseline: sourceReading, gate1CoreLessons: gate1Reading }),
      writeJson(path.join(stageMetaDir, "state-budget.json"), stateBudget),
      writeJson(path.join(stageMetaDir, "gate-0-audit.json"), { schemaVersion: 1, project: PILOT_2_SLUG, status: "codex-verified", generatedAt, sourceWorkspaceSha256: actualSourceWorkspaceSha, git: { branch: gitBranch, commit: gitCommit, dirty: gitStatusResult.length > 0, statusShort: gitStatusResult }, protectedProjectHashes, counts: { outcomes: 25, performanceBehaviours: 53, teacherPlanRows: TEACHER_PLAN_ROWS.length, slideDispositions: slideDispositions.length, pilot1DispositionRecords: sectionDisposition.recordCount, vocabularyFamilies: vocabularyEntries.length }, minutes: { required: REQUIRED_MINUTES, optional: OPTIONAL_MINUTES } }),
      writeJson(path.join(stageMetaDir, "gate-1-review.json"), { schemaVersion: 1, project: PILOT_2_SLUG, status: "awaiting-teacher-review", workspaceSha256, workspaceTreeSha256: workspaceTree.sha256, renderedRoutes: render.learnerRoutes, reviewCriteria: ["student-readable without teacher narration", "terms introduced in prerequisite order", "myelin function explicit and practised", "neurotransmitter defined before acetylcholine", "Lesson 13 manageable", "visuals interspersed", "five-group navigation clear", "Advanced Learning useful and optional"], teacherDecision: null }),
      writeJson(path.join(stageMetaDir, "pilot-2-baseline.json"), { schemaVersion: 1, project: PILOT_2_SLUG, createdAt: generatedAt, sourceProject: PILOT_2_SOURCE_SLUG, sourceWorkspaceSha256: actualSourceWorkspaceSha, rawBaselineSha256: await sha256File(path.join(stageRawDir, "index.html")), workspaceSha256, workspaceTreeSha256: workspaceTree.sha256, protectedProjectHashes }),
      writeJson(path.join(stageMetaDir, "e2e-contract.json"), e2eContract),
      writeFile(path.join(stageMetaDir, "prompt-pack.md"), buildPromptPack(workspaceSha256), "utf8")
    ]);

    await request.testHooks?.afterStageWrite?.(stageProjectDir);
    await validateStagedProject(stageProjectDir, workspaceSha256);
    const protectedAfter = await hashProtectedProjects(repoRoot);
    assertTreeHashesEqual(protectedProjectHashes, protectedAfter);
    if (await pathExists(targetProjectDir)) throw new Error(`Refusing existing Pilot 2 target: ${targetProjectDir}`);
    await request.testHooks?.beforePromote?.(stageProjectDir, targetProjectDir);
    await rename(stageProjectDir, targetProjectDir);
    return { projectDir: targetProjectDir, workspaceSha256, workspaceTreeSha256: workspaceTree.sha256, gate1Routes: render.learnerRoutes, protectedProjectHashes };
  } catch (error) {
    await rm(stageProjectDir, { recursive: true, force: true });
    throw error;
  }
}
