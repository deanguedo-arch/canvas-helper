import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { load as loadHtml } from "cheerio";

import { validateProjectContract } from "../../../e2e/lib/project-contract-schema.js";
import { validateProjectManifestPolicy } from "../project-manifest-policy.js";
import type {
  NamedBrightspaceResource,
  ScienceComparisonContractV1,
  ScienceComparisonVariant
} from "../science-comparison.js";
import type { ProjectManifest } from "../types.js";
import { prepareBiologyNotesDeck } from "./notes.js";
import { renderBiologyVariant } from "./render.js";
import { loadBiologySourceModel } from "./source.js";
import type { BiologySourceModel, BiologyVariantBuildArtifacts } from "./types.js";

const GENERATED_META_FILES = [
  "source-map.json",
  "outcome-map.json",
  "asset-link-audit.json",
  "content-disposition.json",
  "provenance.json",
  "notes-content-report.json",
  "comparison-build.json",
  "build-summary.md",
  "e2e-contract.json",
  "project.json"
] as const;

export type Biology30UnitABuildRequest = {
  repoRoot: string;
  family: string;
  checkExternalLinks?: boolean;
  notesVisualMode?: "auto" | "text-svg";
};

export type Biology30UnitABuildResult = {
  family: string;
  generatedAt: string;
  variants: Array<{
    slug: string;
    treatment: ScienceComparisonVariant["treatment"];
    lessonCount: number;
    responseCount: number;
    copiedAssetCount: number;
    externalLinkCount: number;
  }>;
};

async function pathExists(targetPath: string) {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    throw new Error(`Could not read JSON ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function assertStableId(value: string, label: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new Error(`${label} is not a stable ID: ${JSON.stringify(value)}`);
}

function validateResourceManifest(input: {
  family: string;
  raw: { schemaVersion?: unknown; family?: unknown; resources?: unknown };
}) {
  if (input.raw.schemaVersion !== 2 || input.raw.family !== input.family || !Array.isArray(input.raw.resources)) {
    throw new Error(`Invalid named Science resource manifest for ${input.family}.`);
  }
  const resources = input.raw.resources as NamedBrightspaceResource[];
  if (resources.length !== 2) throw new Error(`Biology 30 comparison requires exactly two named Brightspace resources.`);
  const ids = new Set<string>();
  const roles = new Set<string>();
  for (const resource of resources) {
    assertStableId(resource.id, "Resource ID");
    if (!resource.label?.trim()) throw new Error(`Named resource ${resource.id} is missing a label.`);
    if (resource.kind !== "brightspace-export") throw new Error(`Named resource ${resource.id} is not a Brightspace export.`);
    if (!["primary", "reference"].includes(resource.role)) throw new Error(`Named resource ${resource.id} has an invalid role.`);
    if (!/^projects\/resources\/[a-z0-9-]+\/_sources\/[a-f0-9]{64}\.zip$/.test(resource.path)) {
      throw new Error(`Named resource ${resource.id} has an unsafe or unstable path.`);
    }
    if (!/^[a-f0-9]{64}$/.test(resource.sha256) || !resource.path.endsWith(`/${resource.sha256}.zip`)) {
      throw new Error(`Named resource ${resource.id} has an invalid checksum contract.`);
    }
    if (!resource.originalName?.toLowerCase().endsWith(".zip") || !resource.manifestTitle?.trim() || !resource.manifestPath?.trim()) {
      throw new Error(`Named resource ${resource.id} is missing archive identity metadata.`);
    }
    if (ids.has(resource.id)) throw new Error(`Duplicate named resource ID: ${resource.id}`);
    ids.add(resource.id);
    roles.add(resource.role);
  }
  if (!roles.has("primary") || !roles.has("reference")) {
    throw new Error("Biology 30 comparison requires one primary and one reference resource.");
  }
  return resources;
}

function validateComparisonContract(input: {
  family: string;
  contract: ScienceComparisonContractV1;
  resources: NamedBrightspaceResource[];
}) {
  const { contract } = input;
  if (contract.schemaVersion !== 1 || contract.contractId !== "science-comparison-v1" || contract.family !== input.family) {
    throw new Error(`Invalid Science comparison contract for ${input.family}.`);
  }
  if (contract.synthesisStrategy !== "outcome-led") throw new Error("Biology 30 Unit A supports only outcome-led synthesis.");
  if (contract.variants.length !== 5) throw new Error("Biology 30 Unit A comparison must define exactly five variants.");
  const slugs = new Set(contract.variants.map((variant) => variant.slug));
  if (slugs.size !== 5) throw new Error("Science comparison variant slugs must be unique.");
  const treatments = contract.variants.reduce<Record<string, number>>((counts, variant) => {
    counts[variant.treatment] = (counts[variant.treatment] ?? 0) + 1;
    return counts;
  }, {});
  if (treatments.faithful !== 2 || treatments.optimized !== 2 || treatments.synthesis !== 1) {
    throw new Error("Science comparison contract must contain two faithful, two optimized, and one synthesis version.");
  }
  if (contract.evaluationRubric.totalPoints !== 100) throw new Error("Science comparison rubric must total 100 points.");
  const points = contract.evaluationRubric.criteria.reduce((sum, criterion) => sum + criterion.points, 0);
  if (points !== 100) throw new Error(`Science comparison rubric criteria total ${points}, not 100.`);
  const manifestById = new Map(input.resources.map((resource) => [resource.id, resource]));
  for (const resource of contract.resources) {
    const manifestResource = manifestById.get(resource.id);
    if (!manifestResource || manifestResource.sha256 !== resource.sha256 || manifestResource.path !== resource.path) {
      throw new Error(`Comparison contract resource drift for ${resource.id}.`);
    }
  }
  for (const variant of contract.variants) {
    assertStableId(variant.slug, "Variant slug");
    if (variant.visibility !== "blocked-preview") throw new Error(`${variant.slug} is not blocked-preview.`);
    const expectedSourceCount = variant.treatment === "synthesis" ? 2 : 1;
    if (variant.sourceResourceIds.length !== expectedSourceCount) {
      throw new Error(`${variant.slug} has an invalid source selection.`);
    }
    for (const sourceId of variant.sourceResourceIds) {
      if (!manifestById.has(sourceId)) throw new Error(`${variant.slug} references unknown source ${sourceId}.`);
    }
  }
}

function validateBiologySourceExpectations(sources: Map<string, BiologySourceModel>) {
  const primary = [...sources.values()].find((source) => source.resource.role === "primary");
  const reference = [...sources.values()].find((source) => source.resource.role === "reference");
  if (!primary || !reference) throw new Error("Biology 30 source roles could not be resolved.");
  const primaryTitles = primary.items.map((item) => item.title).join("\n");
  for (const chapter of [11, 12, 13]) {
    if (!new RegExp(`chapter\\s+${chapter}`, "i").test(primaryTitles)) {
      throw new Error(`Current class source is missing Unit A Chapter ${chapter}.`);
    }
    if (!primary.quizzes.some((quiz) => new RegExp(`chapter\\s+${chapter}\\s+quiz`, "i").test(quiz.title))) {
      throw new Error(`Current class source is missing a convertible visible Chapter ${chapter} quiz.`);
    }
  }
  if (
    !primary.items.some(
      (item) => item.explicitlyHidden && /unit\s+a.*nervous.*endocrine.*notes/i.test(item.title) && /\.pdf$/i.test(item.resource?.href ?? "")
    )
  ) {
    throw new Error("Current class source is missing the verified complete local Unit A notes deck.");
  }
  for (const moduleTitle of ["Module 1", "Module 2"]) {
    if (!reference.unitRoot.children.some((item) => item.title.toLowerCase() === moduleTitle.toLowerCase())) {
      throw new Error(`System source is missing ${moduleTitle}.`);
    }
  }
  if (reference.utf16HtmlPaths.length === 0) {
    throw new Error("System source did not exercise the required UTF-16 HTML recovery path.");
  }
}

async function assertRebuildableProposal(input: {
  repoRoot: string;
  family: string;
  variant: ScienceComparisonVariant;
}) {
  const projectDir = path.join(input.repoRoot, "projects", input.variant.slug);
  if (!(await pathExists(projectDir))) throw new Error(`Missing comparison project: ${input.variant.slug}`);
  if (await pathExists(path.join(projectDir, "meta", "comparison-freeze.json"))) {
    throw new Error(`Comparison rebuild refused because ${input.variant.slug} has been frozen for promotion.`);
  }
  const variantContract = await readJson<{
    schemaVersion?: number;
    contractId?: string;
    family?: string;
    slug?: string;
    treatment?: string;
    sourceResourceIds?: string[];
  }>(path.join(projectDir, "meta", "science-comparison.json"));
  if (
    variantContract.schemaVersion !== 1 ||
    variantContract.contractId !== "science-comparison-variant-v1" ||
    variantContract.family !== input.family ||
    variantContract.slug !== input.variant.slug ||
    variantContract.treatment !== input.variant.treatment ||
    JSON.stringify(variantContract.sourceResourceIds) !== JSON.stringify(input.variant.sourceResourceIds)
  ) {
    throw new Error(`Variant contract drift for ${input.variant.slug}.`);
  }
  const manifest = await readJson<ProjectManifest>(path.join(projectDir, "meta", "project.json"));
  if (
    manifest.authoringStatus !== "blocked" ||
    manifest.authoring?.driverId !== "proposal-only-v1" ||
    manifest.authoring?.studioEditing?.enabled !== false ||
    manifest.authoring?.familyId !== input.family
  ) {
    throw new Error(`Comparison rebuild refused because ${input.variant.slug} is no longer a blocked proposal.`);
  }
  return manifest;
}

function sampledRoutes(lessonIds: string[]) {
  if (!lessonIds.length) return [];
  return [...new Set([lessonIds[0], lessonIds[Math.floor(lessonIds.length / 2)], lessonIds[lessonIds.length - 1]])];
}

function buildE2eContract(artifacts: BiologyVariantBuildArtifacts) {
  const hasLocalNotes = /<section id="local-notes"/.test(artifacts.html);
  const sampleLessons = sampledRoutes(artifacts.lessonIds);
  const routes = ["overview", "lessons", ...sampleLessons, ...(hasLocalNotes ? ["local-notes"] : []), "review-matrix", "source-provenance"];
  const firstLesson = artifacts.lessonIds[0];
  const contract = {
    $schema: "../../../e2e/project-e2e-contract.schema.json",
    projectSlug: artifacts.variant.slug,
    requiredTestIds: [
      "studio-shell",
      "course-studio-tab",
      "workspace-project-select",
      "project-root",
      "workspace-preview-frame"
    ],
    modes: { enabled: false },
    navigation: { enabled: false },
    quiz: { enabled: false, lessonTitle: "Local practice" },
    fallbackPanel: { enabled: false },
    learnerCourse: {
      enabled: true as const,
      routes,
      hintRoutes: [],
      printRoutes: [],
      evidenceScenario: {
        kind: "collection" as const,
        route: firstLesson,
        collectionId: `${artifacts.variant.slug}:biology-reflection`,
        responseId: `${artifacts.variant.slug}:biology-reflection:response`
      },
      resourceChecks: hasLocalNotes
        ? [{ route: "local-notes", kind: "document-reader" as const, minimumPrimary: 1, minimumFallback: 1 }]
        : [],
      mobile: {
        width: 390,
        height: 844,
        routes: [...new Set(["overview", firstLesson, artifacts.lessonIds[artifacts.lessonIds.length - 1], "review-matrix"])]
      }
    }
  };
  validateProjectContract(contract, `projects/${artifacts.variant.slug}/meta/e2e-contract.json`, { requireDeepTargets: true });
  const $ = loadHtml(artifacts.html);
  for (const route of routes) {
    if ($(`section#${route}`).length !== 1) throw new Error(`E2E route #${route} is not unique in ${artifacts.variant.slug}.`);
    if (!$(`[data-page-target="${route}"]`).length) throw new Error(`E2E route #${route} has no navigation target in ${artifacts.variant.slug}.`);
  }
  return contract;
}

function updateProjectManifest(input: {
  manifest: ProjectManifest;
  family: string;
  variant: ScienceComparisonVariant;
  generatedAt: string;
}) {
  const projectPath = `projects/${input.variant.slug}`;
  const generatedOutputs = [
    `${projectPath}/workspace/index.html`,
    `${projectPath}/workspace/assets`,
    ...GENERATED_META_FILES.filter((file) => file !== "project.json").map((file) => `${projectPath}/meta/${file}`)
  ];
  const manifest: ProjectManifest = {
    ...input.manifest,
    updatedAt: input.generatedAt,
    generatedOutputs,
    regenerateCommand: `npm run build:biology30-unit-a-pilots -- --family ${input.family}`,
    authoringStatus: "blocked",
    authoring: {
      ...input.manifest.authoring!,
      driverId: "proposal-only-v1",
      familyId: input.family,
      sourceResourceIds: input.variant.sourceResourceIds,
      qualityProfile: "biology30-unit-a-comparison-v1",
      studioEditing: { enabled: false }
    },
    exportTargets: [
      { target: "html", enabled: false, notes: "Preview-only until this version is manually selected." },
      { target: "scorm", enabled: false, notes: "Only the manually selected winner may be exported." }
    ],
    sourceOfTruthNotes:
      "This blocked comparison workspace is generated by the Biology 30 Unit A builder from the checksum-pinned shared source library and versioned comparison contract. Direct editing and export remain disabled. Select and freeze one winner before promotion."
  };
  const validation = validateProjectManifestPolicy(manifest);
  if (validation.status !== "valid") {
    throw new Error(`Generated project manifest is invalid for ${input.variant.slug}: ${validation.errors.join(" ")}`);
  }
  return manifest;
}

function assertSourceIsolation(input: {
  artifacts: BiologyVariantBuildArtifacts;
  resources: NamedBrightspaceResource[];
}) {
  if (input.artifacts.variant.treatment === "synthesis") return;
  const selected = new Set(input.artifacts.variant.sourceResourceIds);
  for (const resource of input.resources) {
    if (selected.has(resource.id)) continue;
    const markers = [resource.id, resource.label, resource.sha256, resource.originalName, resource.manifestTitle].filter(Boolean);
    for (const marker of markers) {
      if (input.artifacts.html.includes(marker)) {
        throw new Error(`Cross-source leakage in ${input.artifacts.variant.slug}: found ${JSON.stringify(marker)}.`);
      }
    }
    if (input.artifacts.assetAudit.copiedAssets.some((asset) => asset.sourceId === resource.id)) {
      throw new Error(`Cross-source asset leakage in ${input.artifacts.variant.slug}: ${resource.id}.`);
    }
  }
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function renderBuildSummary(input: {
  artifacts: BiologyVariantBuildArtifacts;
  generatedAt: string;
}) {
  const externalStatuses = input.artifacts.assetAudit.externalLinks.reduce<Record<string, number>>((counts, link) => {
    counts[link.checkStatus] = (counts[link.checkStatus] ?? 0) + 1;
    return counts;
  }, {});
  return `# Biology 30 Unit A Comparison Build

- Version: ${input.artifacts.variant.label}
- Slug: ${input.artifacts.variant.slug}
- Treatment: ${input.artifacts.variant.treatment}
- Status: blocked comparison prototype
- Generated: ${input.generatedAt}
- Lessons / outcome stages: ${input.artifacts.lessonIds.length}
- Persistent learner response IDs: ${input.artifacts.responseIds.length}
- Copied local assets: ${input.artifacts.assetAudit.copiedAssets.length}
- Notes recreated inside lessons: ${input.artifacts.notesContentReport.included ? "yes" : "no (source-isolated system variant)"}
- Semantic notes pages: ${input.artifacts.notesContentReport.semanticPageCount ?? 0}
- Optional source-slide references: ${input.artifacts.notesContentReport.sourceSlideReferenceCount ?? 0}
- Unique notes pages mapped into lessons: ${input.artifacts.notesContentReport.mappedUniquePageCount ?? 0}
- Notes lesson mappings: ${input.artifacts.notesContentReport.mappings.length}
- External optional references: ${input.artifacts.assetAudit.externalLinks.length}
- External check statuses: ${JSON.stringify(externalStatuses)}
- Unresolved workspace assets: ${input.artifacts.assetAudit.unresolvedWorkspaceAssets.length}
- D2L launchers remaining: ${input.artifacts.assetAudit.d2lLaunchersRemaining.length}

This build cannot be edited directly or exported. Human review in the 100-point matrix is required before one winner is frozen and promoted.
`;
}

async function writeVariantStage(input: {
  stageProjectDir: string;
  artifacts: BiologyVariantBuildArtifacts;
  manifest: ProjectManifest;
  family: string;
  generatedAt: string;
}) {
  const workspaceDir = path.join(input.stageProjectDir, "workspace");
  const metaDir = path.join(input.stageProjectDir, "meta");
  await mkdir(metaDir, { recursive: true });
  const e2eContract = buildE2eContract(input.artifacts);
  const comparisonBuild = {
    schemaVersion: 1,
    family: input.family,
    projectSlug: input.artifacts.variant.slug,
    treatment: input.artifacts.variant.treatment,
    sourceResourceIds: input.artifacts.variant.sourceResourceIds,
    status: "blocked",
    driverId: "proposal-only-v1",
    studioEditing: false,
    exportEnabled: false,
    frozen: false,
    generatedAt: input.generatedAt,
    workspaceSha256: digest(input.artifacts.html),
    lessonIds: input.artifacts.lessonIds,
    persistentResponseIds: input.artifacts.responseIds
  };
  await Promise.all([
    writeFile(path.join(workspaceDir, "index.html"), input.artifacts.html, "utf8"),
    writeFile(path.join(metaDir, "source-map.json"), `${JSON.stringify(input.artifacts.sourceMap, null, 2)}\n`, "utf8"),
    writeFile(
      path.join(metaDir, "outcome-map.json"),
      `${JSON.stringify({ schemaVersion: 1, generatedAt: input.generatedAt, stages: input.artifacts.outcomeMap }, null, 2)}\n`,
      "utf8"
    ),
    writeFile(
      path.join(metaDir, "asset-link-audit.json"),
      `${JSON.stringify(input.artifacts.assetAudit, null, 2)}\n`,
      "utf8"
    ),
    writeFile(
      path.join(metaDir, "content-disposition.json"),
      `${JSON.stringify({ schemaVersion: 1, generatedAt: input.generatedAt, records: input.artifacts.dispositions }, null, 2)}\n`,
      "utf8"
    ),
    writeFile(
      path.join(metaDir, "provenance.json"),
      `${JSON.stringify({ schemaVersion: 1, generatedAt: input.generatedAt, sections: input.artifacts.provenance }, null, 2)}\n`,
      "utf8"
    ),
    writeFile(
      path.join(metaDir, "notes-content-report.json"),
      `${JSON.stringify({ ...input.artifacts.notesContentReport, generatedAt: input.generatedAt }, null, 2)}\n`,
      "utf8"
    ),
    writeFile(path.join(metaDir, "comparison-build.json"), `${JSON.stringify(comparisonBuild, null, 2)}\n`, "utf8"),
    writeFile(path.join(metaDir, "build-summary.md"), renderBuildSummary(input), "utf8"),
    writeFile(path.join(metaDir, "e2e-contract.json"), `${JSON.stringify(e2eContract, null, 2)}\n`, "utf8"),
    writeFile(path.join(metaDir, "project.json"), `${JSON.stringify(input.manifest, null, 2)}\n`, "utf8")
  ]);
}

async function commitGeneratedOutputs(input: {
  repoRoot: string;
  transactionDir: string;
  variants: ScienceComparisonVariant[];
}) {
  const backupRoot = path.join(input.transactionDir, "backups");
  const operations = input.variants.flatMap((variant) => {
    const stageProject = path.join(input.transactionDir, "generated", variant.slug);
    const finalProject = path.join(input.repoRoot, "projects", variant.slug);
    return [
      { relative: "workspace", staged: path.join(stageProject, "workspace"), final: path.join(finalProject, "workspace") },
      ...GENERATED_META_FILES.map((file) => ({
        relative: path.join("meta", file),
        staged: path.join(stageProject, "meta", file),
        final: path.join(finalProject, "meta", file)
      }))
    ];
  });
  const promoted: string[] = [];
  const backups: Array<{ backup: string; final: string }> = [];
  try {
    for (const operation of operations) {
      if (!(await pathExists(operation.staged))) throw new Error(`Missing staged Biology output: ${operation.staged}`);
      if (await pathExists(operation.final)) {
        const backup = path.join(backupRoot, path.relative(path.join(input.repoRoot, "projects"), operation.final));
        await mkdir(path.dirname(backup), { recursive: true });
        await rename(operation.final, backup);
        backups.push({ backup, final: operation.final });
      }
      await mkdir(path.dirname(operation.final), { recursive: true });
      await rename(operation.staged, operation.final);
      promoted.push(operation.final);
    }
  } catch (error) {
    for (const final of promoted.reverse()) await rm(final, { recursive: true, force: true });
    for (const entry of backups.reverse()) {
      await mkdir(path.dirname(entry.final), { recursive: true });
      await rename(entry.backup, entry.final);
    }
    throw error;
  }
}

export async function buildBiology30UnitAPilots(request: Biology30UnitABuildRequest): Promise<Biology30UnitABuildResult> {
  const repoRoot = path.resolve(request.repoRoot);
  const family = request.family.trim();
  assertStableId(family, "--family");
  const resourceDir = path.join(repoRoot, "projects", "resources", family);
  const resourceManifest = await readJson<{ schemaVersion?: unknown; family?: unknown; resources?: unknown }>(
    path.join(resourceDir, "resource-manifest.json")
  );
  const resources = validateResourceManifest({ family, raw: resourceManifest });
  const contract = await readJson<ScienceComparisonContractV1>(path.join(resourceDir, "comparison-contract.json"));
  validateComparisonContract({ family, contract, resources });

  const currentManifests = new Map<string, ProjectManifest>();
  for (const variant of contract.variants) {
    currentManifests.set(variant.slug, await assertRebuildableProposal({ repoRoot, family, variant }));
  }

  const sources = new Map<string, BiologySourceModel>();
  for (const resource of resources) {
    sources.set(
      resource.id,
      await loadBiologySourceModel({ repoRoot, resource, unitTitle: contract.unitBoundary.title })
    );
  }
  validateBiologySourceExpectations(sources);

  const projectsRoot = path.join(repoRoot, "projects");
  const transactionDir = await mkdtemp(path.join(projectsRoot, ".biology30-unit-a-build-"));
  const generatedAt = new Date().toISOString();
  const artifactsBySlug = new Map<string, BiologyVariantBuildArtifacts>();
  try {
    const primarySource = [...sources.values()].find((source) => source.resource.role === "primary");
    if (!primarySource) throw new Error("Biology 30 comparison is missing its primary class source.");
    const preparedNotesDeck = await prepareBiologyNotesDeck({
      source: primarySource,
      workingDir: path.join(transactionDir, "prepared-notes"),
      visualMode: request.notesVisualMode
    });
    for (const variant of contract.variants) {
      const stageProjectDir = path.join(transactionDir, "generated", variant.slug);
      const stageWorkspaceDir = path.join(stageProjectDir, "workspace");
      await mkdir(stageWorkspaceDir, { recursive: true });
      const artifacts = await renderBiologyVariant({
        repoRoot,
        contract,
        variant,
        sources,
        preparedNotesDeck,
        stageWorkspaceDir,
        generatedAt,
        checkExternalLinks: request.checkExternalLinks === true
      });
      assertSourceIsolation({ artifacts, resources });
      const currentManifest = currentManifests.get(variant.slug);
      if (!currentManifest) throw new Error(`Missing current manifest for ${variant.slug}.`);
      const updatedManifest = updateProjectManifest({ manifest: currentManifest, family, variant, generatedAt });
      await writeVariantStage({
        stageProjectDir,
        artifacts,
        manifest: updatedManifest,
        family,
        generatedAt
      });
      artifactsBySlug.set(variant.slug, artifacts);
    }
    if (artifactsBySlug.size !== 5) throw new Error(`Biology comparison rendered ${artifactsBySlug.size} workspaces instead of five.`);
    await commitGeneratedOutputs({ repoRoot, transactionDir, variants: contract.variants });

    return {
      family,
      generatedAt,
      variants: contract.variants.map((variant) => {
        const artifacts = artifactsBySlug.get(variant.slug)!;
        return {
          slug: variant.slug,
          treatment: variant.treatment,
          lessonCount: artifacts.lessonIds.length,
          responseCount: artifacts.responseIds.length,
          copiedAssetCount: artifacts.assetAudit.copiedAssets.length,
          externalLinkCount: artifacts.assetAudit.externalLinks.length
        };
      })
    };
  } finally {
    await rm(transactionDir, { recursive: true, force: true });
  }
}
