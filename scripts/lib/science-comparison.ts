import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { load as loadHtml } from "cheerio";
import JSZip from "jszip";

import { validateProjectManifestPolicy } from "./project-manifest-policy.js";
import type { ProjectManifest } from "./types.js";

const SAFE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const REQUIRED_TREATMENTS = ["faithful", "optimized"] as const;

export type ScienceComparisonTreatment = (typeof REQUIRED_TREATMENTS)[number];
export type ScienceComparisonSynthesisStrategy = "outcome-led";
export type ScienceComparisonSourceRole = "primary" | "reference";

export type NamedBrightspaceResource = {
  id: string;
  label: string;
  kind: "brightspace-export";
  role: ScienceComparisonSourceRole;
  path: string;
  sha256: string;
  originalName: string;
  manifestPath: string;
  manifestIdentifier?: string;
  manifestTitle: string;
  verifiedAt: string;
};

export type ScienceComparisonVariant = {
  slug: string;
  label: string;
  treatment: ScienceComparisonTreatment | "synthesis";
  sourceResourceIds: string[];
  visibility: "blocked-preview";
};

export type ScienceComparisonRubricCriterion = {
  id: string;
  label: string;
  points: number;
  reviewPrompt: string;
};

export type ScienceComparisonContractV1 = {
  schemaVersion: 1;
  contractId: "science-comparison-v1";
  family: string;
  course: { code: string; title: string };
  unitBoundary: {
    title: string;
    include: string[];
    exclude: string[];
  };
  resources: NamedBrightspaceResource[];
  variants: ScienceComparisonVariant[];
  visibilityPolicy: {
    include: string[];
    exclude: string[];
    duplicateRule: string;
  };
  synthesisStrategy: ScienceComparisonSynthesisStrategy;
  optimizedOutcomeSequence: Array<{ id: string; label: string }>;
  evaluationRubric: {
    totalPoints: 100;
    criteria: ScienceComparisonRubricCriterion[];
    promotion: "manual-selection-only";
  };
  promotionPolicy: {
    comparisonStatus: "blocked";
    comparisonDriver: "proposal-only-v1";
    winnerDriver: "direct-workspace-v1";
    freezeWinnerBeforePromotion: true;
    nonWinnersBecome: "reference-only";
    exportOnlyWinner: true;
  };
  createdAt: string;
};

export type ScienceComparisonIntakeRequest = {
  repoRoot: string;
  family: string;
  courseCode: string;
  title: string;
  unitTitle: string;
  primaryId: string;
  primaryLabel: string;
  primaryZip: string;
  referenceId: string;
  referenceLabel: string;
  referenceZip: string;
  treatments: ScienceComparisonTreatment[];
  synthesis: ScienceComparisonSynthesisStrategy;
  /** Test-only fault injection. Production callers should omit this field. */
  testHooks?: {
    beforePromote?: (targetPath: string, index: number) => void | Promise<void>;
  };
};

export type ScienceComparisonIntakeResult = {
  family: string;
  resourceDir: string;
  resources: NamedBrightspaceResource[];
  variants: ScienceComparisonVariant[];
  projectDirs: string[];
};

export type BrightspaceArchiveInspection = {
  manifestPath: string;
  manifestIdentifier?: string;
  manifestTitle: string;
  entryCount: number;
};

export const BIOLOGY30_UNIT_A_OUTCOME_SEQUENCE = [
  { id: "unit-inquiry-homeostasis", label: "Unit inquiry and homeostasis" },
  { id: "nervous-system-organization", label: "Nervous-system organization and reflexes" },
  { id: "neuron-action-potential", label: "Neurons and the action potential" },
  { id: "synapses-disruption", label: "Synapses, communication, and disruption" },
  { id: "sensory-investigation", label: "Sensory systems and investigation" },
  { id: "endocrine-feedback", label: "Endocrine communication and feedback" },
  { id: "glands-imbalances", label: "Glands, hormones, and imbalances" },
  { id: "integrated-application-review", label: "Integrated application and review" }
] as const;

export const SCIENCE_COMPARISON_RUBRIC: ScienceComparisonRubricCriterion[] = [
  {
    id: "outcome-coverage",
    label: "Outcome coverage",
    points: 20,
    reviewPrompt: "Does the version teach and practise the complete Unit A outcome set?"
  },
  {
    id: "learner-coherence",
    label: "Learner coherence",
    points: 20,
    reviewPrompt: "Can a learner understand the sequence, purpose, and next step without teacher repair?"
  },
  {
    id: "accessibility",
    label: "Accessibility",
    points: 15,
    reviewPrompt: "Are structure, contrast, keyboard access, labels, and responsive reading usable?"
  },
  {
    id: "practice-persistence",
    label: "Practice and persistence",
    points: 15,
    reviewPrompt: "Are meaningful learner responses and self-checks available and restored reliably?"
  },
  {
    id: "source-fidelity-provenance",
    label: "Source fidelity and provenance",
    points: 10,
    reviewPrompt: "Can each instructional section be traced to authorized source material?"
  },
  {
    id: "asset-health",
    label: "Self-contained asset health",
    points: 10,
    reviewPrompt: "Are required assets local, resolvable, and independent of optional external services?"
  },
  {
    id: "maintainability-editability",
    label: "Maintainability and editability",
    points: 10,
    reviewPrompt: "Is the version understandable, rebuildable, and suitable for later Direct promotion?"
  }
];

function assertNonEmpty(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  return trimmed;
}

function assertSafeId(value: string, label: string) {
  if (!SAFE_ID_PATTERN.test(value)) {
    throw new Error(`${label} must be a lowercase, hyphen-delimited stable ID: ${JSON.stringify(value)}`);
  }
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

export function decodeD2lText(bytes: Uint8Array): string {
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes.subarray(2));
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    const swapped = new Uint8Array(bytes.length - 2);
    for (let index = 2; index + 1 < bytes.length; index += 2) {
      swapped[index - 2] = bytes[index + 1];
      swapped[index - 1] = bytes[index];
    }
    return new TextDecoder("utf-16le").decode(swapped);
  }

  const sampleLength = Math.min(bytes.length, 2048);
  let oddNulls = 0;
  let evenNulls = 0;
  for (let index = 0; index < sampleLength; index += 1) {
    if (bytes[index] !== 0) continue;
    if (index % 2 === 0) evenNulls += 1;
    else oddNulls += 1;
  }
  if (oddNulls > sampleLength / 8 && oddNulls > evenNulls * 3) {
    return new TextDecoder("utf-16le").decode(bytes);
  }
  return new TextDecoder("utf-8").decode(bytes).replace(/^\uFEFF/, "");
}

export function normalizeArchivePath(value: string): string {
  const normalized = value.replace(/\\/g, "/").replace(/^\.\//, "");
  const segments = normalized.split("/");
  if (
    !normalized ||
    normalized.includes("\0") ||
    normalized.startsWith("/") ||
    /^[a-zA-Z]:\//.test(normalized) ||
    segments.some((segment) => segment === "..")
  ) {
    throw new Error(`Unsafe Brightspace archive path: ${JSON.stringify(value)}`);
  }
  return path.posix.normalize(normalized);
}

function isSymlinkEntry(entry: JSZip.JSZipObject) {
  const permissions = typeof entry.unixPermissions === "number" ? entry.unixPermissions : 0;
  return (permissions & 0o170000) === 0o120000;
}

export async function inspectBrightspaceArchiveBuffer(buffer: Buffer): Promise<BrightspaceArchiveInspection> {
  let archive: JSZip;
  try {
    archive = await JSZip.loadAsync(buffer, { createFolders: false });
  } catch (error) {
    throw new Error(`Brightspace source is not a readable ZIP archive: ${error instanceof Error ? error.message : String(error)}`);
  }

  const entries = Object.values(archive.files);
  for (const entry of entries) {
    const originalName = entry.unsafeOriginalName ?? entry.name;
    normalizeArchivePath(originalName);
    if (isSymlinkEntry(entry)) {
      throw new Error(`Brightspace archive contains a symbolic link: ${originalName}`);
    }
  }

  const manifestEntries = entries
    .filter((entry) => !entry.dir && entry.name.toLowerCase().endsWith("imsmanifest.xml"))
    .sort((left, right) => left.name.length - right.name.length);
  if (manifestEntries.length === 0) {
    throw new Error("Brightspace source does not contain imsmanifest.xml.");
  }
  const manifestEntry = manifestEntries[0];
  const manifestText = decodeD2lText(await manifestEntry.async("uint8array"));
  const $ = loadHtml(manifestText, { xmlMode: true });
  const manifestIdentifier = $("manifest").first().attr("identifier")?.trim() || undefined;
  const organization = $("organizations > organization").first();
  const metadata = $("manifest").first().children("metadata").first();
  let metadataTitle = "";
  metadata.find("*").each((_index, element) => {
    if (metadataTitle) return false;
    const name = (element as { name?: string }).name?.toLowerCase() ?? "";
    if (name !== "title" && !name.endsWith(":title")) return;
    metadataTitle = $(element).text().replace(/\s+/g, " ").trim();
  });
  const manifestTitle = metadataTitle || organization.children("title").first().text().trim() || $("title").first().text().trim();
  if (!manifestTitle) {
    throw new Error("Brightspace manifest does not declare a course title.");
  }
  return {
    manifestPath: normalizeArchivePath(manifestEntry.name),
    manifestIdentifier,
    manifestTitle,
    entryCount: entries.filter((entry) => !entry.dir).length
  };
}

async function sha256File(filePath: string): Promise<string> {
  const hash = createHash("sha256");
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return hash.digest("hex");
}

function sourceSlugSegment(resourceId: string) {
  return resourceId.replace(/-(\d{4})-\d{2}$/, "-$1");
}

export function deriveScienceComparisonVariants(input: {
  family: string;
  primaryId: string;
  primaryLabel: string;
  referenceId: string;
  referenceLabel: string;
}): ScienceComparisonVariant[] {
  const familyBase = input.family.replace(/-pilot$/, "");
  const sources = [
    { id: input.primaryId, label: input.primaryLabel },
    { id: input.referenceId, label: input.referenceLabel }
  ];
  const variants: ScienceComparisonVariant[] = sources.flatMap((source) =>
    REQUIRED_TREATMENTS.map((treatment) => ({
      slug: `${familyBase}-${sourceSlugSegment(source.id)}-${treatment}`,
      label: `${source.label} — ${treatment === "faithful" ? "Faithful" : "Optimized"}`,
      treatment,
      sourceResourceIds: [source.id],
      visibility: "blocked-preview" as const
    }))
  );
  variants.push({
    slug: `${familyBase}-synthesis`,
    label: "Outcome-led synthesis",
    treatment: "synthesis",
    sourceResourceIds: [input.primaryId, input.referenceId],
    visibility: "blocked-preview"
  });
  return variants;
}

function assertTreatments(treatments: ScienceComparisonTreatment[]) {
  const normalized = [...new Set(treatments)].sort();
  const required = [...REQUIRED_TREATMENTS].sort();
  if (normalized.length !== required.length || normalized.some((value, index) => value !== required[index])) {
    throw new Error("--treatments must contain exactly faithful,optimized for the five-version comparison contract.");
  }
}

async function copyNamedResource(input: {
  sourcePath: string;
  stageResourceDir: string;
  family: string;
  id: string;
  label: string;
  role: ScienceComparisonSourceRole;
  now: string;
}): Promise<NamedBrightspaceResource> {
  const absoluteSourcePath = path.resolve(input.sourcePath);
  const stats = await lstat(absoluteSourcePath);
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new Error(`Named Brightspace source must be a real file: ${input.sourcePath}`);
  }
  if (path.extname(absoluteSourcePath).toLowerCase() !== ".zip") {
    throw new Error(`Named Brightspace source must be a .zip archive: ${input.sourcePath}`);
  }

  const sourceSha256 = await sha256File(absoluteSourcePath);
  if (!SHA256_PATTERN.test(sourceSha256)) throw new Error(`Could not hash Brightspace source: ${input.sourcePath}`);
  const inspection = await inspectBrightspaceArchiveBuffer(await readFile(absoluteSourcePath));
  const destinationPath = path.join(input.stageResourceDir, "_sources", `${sourceSha256}.zip`);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  if (!(await pathExists(destinationPath))) await copyFile(absoluteSourcePath, destinationPath);
  const copiedSha256 = await sha256File(destinationPath);
  if (copiedSha256 !== sourceSha256) {
    throw new Error(`Checksum verification failed while copying ${input.label}.`);
  }

  return {
    id: input.id,
    label: input.label,
    kind: "brightspace-export",
    role: input.role,
    path: `projects/resources/${input.family}/_sources/${sourceSha256}.zip`,
    sha256: sourceSha256,
    originalName: path.basename(absoluteSourcePath),
    manifestPath: inspection.manifestPath,
    manifestIdentifier: inspection.manifestIdentifier,
    manifestTitle: inspection.manifestTitle,
    verifiedAt: input.now
  };
}

function buildComparisonContract(input: {
  family: string;
  courseCode: string;
  title: string;
  unitTitle: string;
  resources: NamedBrightspaceResource[];
  variants: ScienceComparisonVariant[];
  synthesis: ScienceComparisonSynthesisStrategy;
  now: string;
}): ScienceComparisonContractV1 {
  return {
    schemaVersion: 1,
    contractId: "science-comparison-v1",
    family: input.family,
    course: { code: input.courseCode, title: input.title },
    unitBoundary: {
      title: input.unitTitle,
      include: [
        "Unit A learner-visible lessons and descriptions",
        "Source-visible self-checks and check-your-work answers",
        "Complete visible chapter quizzes converted to non-graded practice",
        "Local files required to complete Unit A"
      ],
      exclude: [
        "Units B-D",
        "Diploma preparation",
        "Hidden unit tests, printable quizzes, hidden quiz keys, and teacher-only assessment material",
        "Unrelated files and broken D2L launchers"
      ]
    },
    resources: input.resources,
    variants: input.variants,
    visibilityPolicy: {
      include: [
        "learner-visible instruction",
        "learner-visible self-checks",
        "learner-visible check-your-work answers",
        "complete visible chapter quizzes as ungraded practice"
      ],
      exclude: [
        "hidden unit tests",
        "printable quizzes",
        "hidden quiz keys",
        "teacher-only assessment material",
        "broken D2L launchers"
      ],
      duplicateRule:
        "A hidden instructional duplicate may be used only when source evidence proves that it replaces the same visible external lesson."
    },
    synthesisStrategy: input.synthesis,
    optimizedOutcomeSequence: BIOLOGY30_UNIT_A_OUTCOME_SEQUENCE.map((stage) => ({ ...stage })),
    evaluationRubric: {
      totalPoints: 100,
      criteria: SCIENCE_COMPARISON_RUBRIC.map((criterion) => ({ ...criterion })),
      promotion: "manual-selection-only"
    },
    promotionPolicy: {
      comparisonStatus: "blocked",
      comparisonDriver: "proposal-only-v1",
      winnerDriver: "direct-workspace-v1",
      freezeWinnerBeforePromotion: true,
      nonWinnersBecome: "reference-only",
      exportOnlyWinner: true
    },
    createdAt: input.now
  };
}

function buildVariantManifest(input: {
  family: string;
  courseCode: string;
  title: string;
  variant: ScienceComparisonVariant;
  resources: NamedBrightspaceResource[];
  now: string;
}): ProjectManifest {
  const projectPath = `projects/${input.variant.slug}`;
  const resourcePath = `projects/resources/${input.family}`;
  const variantContractPath = `${projectPath}/meta/science-comparison.json`;
  const sharedContractPath = `${resourcePath}/comparison-contract.json`;
  const selectedResources = input.resources.filter((resource) => input.variant.sourceResourceIds.includes(resource.id));
  const isSynthesis = input.variant.treatment === "synthesis";
  return {
    id: input.variant.slug,
    slug: input.variant.slug,
    title: `${input.courseCode} ${input.title} — ${input.variant.label}`,
    sourcePath: `${resourcePath}/resource-manifest.json`,
    inputKind: "brightspace-zip",
    brightspaceTarget: "scorm",
    previewModes: ["workspace"],
    workspaceEntrypoint: `${projectPath}/workspace/index.html`,
    rawEntrypoint: `${projectPath}/raw/intake.json`,
    learningSource: "other",
    learningTrust: "curated",
    learningUpdatedAt: input.now,
    createdAt: input.now,
    updatedAt: input.now,
    migrationState: "migrated",
    projectType: isSynthesis ? "hybrid" : "conversion",
    preferredWorkflows: isSynthesis ? ["conversion", "generated-course"] : ["conversion"],
    canonicalEntry: variantContractPath,
    canonicalSources: [variantContractPath, sharedContractPath, `${projectPath}/meta/prompt-pack.md`, `${projectPath}/meta/decision-log.md`],
    generatedOutputs: [],
    authoring: {
      driverId: "proposal-only-v1",
      familyId: input.family,
      sourceResourceIds: input.variant.sourceResourceIds,
      qualityProfile: "biology30-unit-a-comparison-v1",
      studioEditing: { enabled: false }
    },
    authoringStatus: "blocked",
    exportTargets: [
      { target: "html", enabled: false, notes: "Preview-only until this version is manually selected." },
      { target: "scorm", enabled: false, notes: "Only the manually selected winner may be exported." }
    ],
    referenceOnly: [
      `${resourcePath}/resource-manifest.json`,
      ...selectedResources.map((resource) => resource.path),
      `${projectPath}/raw/intake.json`
    ],
    sourceOfTruthNotes:
      "This is a blocked comparison prototype. The shared comparison contract and this variant contract drive rebuilds. Studio editing and export remain disabled until the user manually selects and promotes one winner."
  };
}

function renderVariantPromptPack(input: {
  family: string;
  title: string;
  unitTitle: string;
  variant: ScienceComparisonVariant;
  resources: NamedBrightspaceResource[];
}) {
  const selected = input.resources.filter((resource) => input.variant.sourceResourceIds.includes(resource.id));
  return `# ${input.title} — ${input.variant.label}

- Family: ${input.family}
- Unit boundary: ${input.unitTitle}
- Treatment: ${input.variant.treatment}
- Status: blocked comparison prototype
- Studio mode: preview and Annotation only; direct editing disabled
- Sources: ${selected.map((resource) => `${resource.label} (${resource.sha256})`).join(", ")}

## Build boundary

- Follow projects/resources/${input.family}/comparison-contract.json.
- Preserve section-level provenance and source isolation.
- Keep required learner material local; external Google or YouTube links are optional checked references only.
- Include learner-visible self-checks and answers. Exclude hidden tests, printable quizzes, hidden quiz keys, and teacher-only assessment material.
- Do not enable export, Direct editing, or winner promotion during comparison builds.
`;
}

function renderDecisionLog(variant: ScienceComparisonVariant) {
  const rows = SCIENCE_COMPARISON_RUBRIC.map(
    (criterion) => `| ${criterion.label} | ${criterion.points} |  | ${criterion.reviewPrompt} |`
  ).join("\n");
  return `# Biology 30 Unit A Comparison Review

Version: ${variant.label}

This scorecard supports human review. A score never promotes a course automatically.

| Criterion | Available | Reviewer score | Evidence / notes |
| --- | ---: | ---: | --- |
${rows}
| **Total** | **100** |  |  |

## Decision notes

- Strengths:
- Gaps:
- Required repair before selection:
- Reviewer recommendation:
`;
}

async function writeVariantStage(input: {
  stageProjectDir: string;
  family: string;
  courseCode: string;
  title: string;
  unitTitle: string;
  variant: ScienceComparisonVariant;
  resources: NamedBrightspaceResource[];
  now: string;
}) {
  await Promise.all([
    mkdir(path.join(input.stageProjectDir, "meta"), { recursive: true }),
    mkdir(path.join(input.stageProjectDir, "raw"), { recursive: true })
  ]);
  const selectedResources = input.resources.filter((resource) => input.variant.sourceResourceIds.includes(resource.id));
  const variantContract = {
    schemaVersion: 1,
    contractId: "science-comparison-variant-v1",
    family: input.family,
    slug: input.variant.slug,
    unitTitle: input.unitTitle,
    treatment: input.variant.treatment,
    sourceResourceIds: input.variant.sourceResourceIds,
    visibility: input.variant.visibility,
    synthesisStrategy: input.variant.treatment === "synthesis" ? "outcome-led" : null,
    sharedContract: `projects/resources/${input.family}/comparison-contract.json`
  };
  const projectManifest = buildVariantManifest({
    family: input.family,
    courseCode: input.courseCode,
    title: input.title,
    variant: input.variant,
    resources: input.resources,
    now: input.now
  });
  const validation = validateProjectManifestPolicy(projectManifest);
  if (validation.status !== "valid") {
    throw new Error(`Science comparison manifest is invalid for ${input.variant.slug}: ${validation.errors.join(" ")}`);
  }

  await Promise.all([
    writeFile(path.join(input.stageProjectDir, "meta", "science-comparison.json"), `${JSON.stringify(variantContract, null, 2)}\n`, "utf8"),
    writeFile(
      path.join(input.stageProjectDir, "meta", "prompt-pack.md"),
      renderVariantPromptPack({
        family: input.family,
        title: input.title,
        unitTitle: input.unitTitle,
        variant: input.variant,
        resources: input.resources
      }),
      "utf8"
    ),
    writeFile(path.join(input.stageProjectDir, "meta", "decision-log.md"), renderDecisionLog(input.variant), "utf8"),
    writeFile(path.join(input.stageProjectDir, "meta", "project.json"), `${JSON.stringify(projectManifest, null, 2)}\n`, "utf8"),
    writeFile(
      path.join(input.stageProjectDir, "raw", "intake.json"),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          family: input.family,
          projectSlug: input.variant.slug,
          receivedAt: input.now,
          sourceResources: selectedResources.map((resource) => ({ id: resource.id, sha256: resource.sha256 }))
        },
        null,
        2
      )}\n`,
      "utf8"
    )
  ]);
}

export async function intakeScienceComparison(
  request: ScienceComparisonIntakeRequest
): Promise<ScienceComparisonIntakeResult> {
  const repoRoot = path.resolve(request.repoRoot);
  const family = assertNonEmpty(request.family, "--family");
  const courseCode = assertNonEmpty(request.courseCode, "--course-code");
  const title = assertNonEmpty(request.title, "--title");
  const unitTitle = assertNonEmpty(request.unitTitle, "--unit-title");
  const primaryId = assertNonEmpty(request.primaryId, "--primary-id");
  const primaryLabel = assertNonEmpty(request.primaryLabel, "--primary-label");
  const referenceId = assertNonEmpty(request.referenceId, "--reference-id");
  const referenceLabel = assertNonEmpty(request.referenceLabel, "--reference-label");
  assertSafeId(family, "--family");
  assertSafeId(primaryId, "--primary-id");
  assertSafeId(referenceId, "--reference-id");
  if (primaryId === referenceId) throw new Error("Primary and reference resource IDs must be distinct.");
  assertTreatments(request.treatments);
  if (request.synthesis !== "outcome-led") {
    throw new Error(`Unsupported science comparison synthesis strategy: ${request.synthesis}`);
  }

  const variants = deriveScienceComparisonVariants({ family, primaryId, primaryLabel, referenceId, referenceLabel });
  const slugs = variants.map((variant) => variant.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error("Science comparison variant slugs are not unique.");
  slugs.forEach((slug) => assertSafeId(slug, "derived variant slug"));

  const projectsRoot = path.join(repoRoot, "projects");
  const resourceDir = path.join(projectsRoot, "resources", family);
  const projectDirs = slugs.map((slug) => path.join(projectsRoot, slug));
  const finalTargets = [resourceDir, ...projectDirs];
  for (const target of finalTargets) {
    if (await pathExists(target)) {
      throw new Error(`Science comparison target already exists: ${path.relative(repoRoot, target)}`);
    }
  }

  await Promise.all([mkdir(projectsRoot, { recursive: true }), mkdir(path.dirname(resourceDir), { recursive: true })]);
  const transactionDir = await mkdtemp(path.join(projectsRoot, ".science-comparison-intake-"));
  const stageResourceDir = path.join(transactionDir, "resource");
  const stageProjectsRoot = path.join(transactionDir, "projects");
  const promotedTargets: string[] = [];
  try {
    const now = new Date().toISOString();
    const resources = [
      await copyNamedResource({
        sourcePath: request.primaryZip,
        stageResourceDir,
        family,
        id: primaryId,
        label: primaryLabel,
        role: "primary",
        now
      }),
      await copyNamedResource({
        sourcePath: request.referenceZip,
        stageResourceDir,
        family,
        id: referenceId,
        label: referenceLabel,
        role: "reference",
        now
      })
    ];
    const contract = buildComparisonContract({
      family,
      courseCode,
      title,
      unitTitle,
      resources,
      variants,
      synthesis: request.synthesis,
      now
    });
    await Promise.all([
      writeFile(
        path.join(stageResourceDir, "resource-manifest.json"),
        `${JSON.stringify({ schemaVersion: 2, family, resources }, null, 2)}\n`,
        "utf8"
      ),
      writeFile(path.join(stageResourceDir, "comparison-contract.json"), `${JSON.stringify(contract, null, 2)}\n`, "utf8")
    ]);

    for (const variant of variants) {
      await writeVariantStage({
        stageProjectDir: path.join(stageProjectsRoot, variant.slug),
        family,
        courseCode,
        title,
        unitTitle,
        variant,
        resources,
        now
      });
    }

    const promotions = [
      { staged: stageResourceDir, final: resourceDir },
      ...variants.map((variant) => ({
        staged: path.join(stageProjectsRoot, variant.slug),
        final: path.join(projectsRoot, variant.slug)
      }))
    ];
    for (let index = 0; index < promotions.length; index += 1) {
      const promotion = promotions[index];
      await request.testHooks?.beforePromote?.(promotion.final, index);
      await rename(promotion.staged, promotion.final);
      promotedTargets.push(promotion.final);
    }

    return { family, resourceDir, resources, variants, projectDirs };
  } catch (error) {
    for (const promotedTarget of promotedTargets.reverse()) {
      await rm(promotedTarget, { recursive: true, force: true });
    }
    throw error;
  } finally {
    await rm(transactionDir, { recursive: true, force: true });
  }
}
