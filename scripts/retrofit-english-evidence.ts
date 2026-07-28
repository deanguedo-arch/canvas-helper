import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import {
  ELA30_EVIDENCE_PROJECT_SLUGS,
  ELA30_EVIDENCE_RETROFIT_VERSION,
  applyEnglishEvidenceRetrofitToHtml,
  createEnglishEvidenceRetrofitReport,
  type Ela30EvidenceProjectSlug,
} from "./lib/english-unit/ela30-evidence-retrofit.js";
import { parseEnglishEvidenceBankRetrofit } from "./lib/english-unit/schema.js";
import type { EnglishEvidenceBankRetrofitV1 } from "./lib/english-unit/types.js";

interface ProjectJson {
  [key: string]: unknown;
  canonicalEntry?: string;
  canonicalSources?: string[];
  injectedComponents?: Array<Record<string, unknown>>;
  migrationState?: string;
  projectType?: string;
  preferredWorkflows?: string[];
  sourceOfTruthNotes?: string;
  workspaceEntrypoint?: string;
  googleHosted?: {
    [key: string]: unknown;
    trackedStorageKeys?: unknown[];
  };
}

interface PreparedProject {
  slug: Ela30EvidenceProjectSlug;
  workspacePath: string;
  projectJsonPath: string;
  reportPath: string;
  html: string;
  projectJson: ProjectJson;
  report: EnglishEvidenceBankRetrofitV1;
  changed: boolean;
}

function requestedProjects(argv = process.argv.slice(2)): { projects: Ela30EvidenceProjectSlug[]; check: boolean } {
  const args = parseArgs(argv);
  const requested = getStringFlag(args, "project");
  if (!requested) return { projects: [...ELA30_EVIDENCE_PROJECT_SLUGS], check: hasFlag(args, "check") };
  if (!ELA30_EVIDENCE_PROJECT_SLUGS.includes(requested as Ela30EvidenceProjectSlug)) {
    throw new Error(`Unsupported ELA 30-1 project: ${requested}. Expected one of: ${ELA30_EVIDENCE_PROJECT_SLUGS.join(", ")}`);
  }
  return { projects: [requested as Ela30EvidenceProjectSlug], check: hasFlag(args, "check") };
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function readExistingReport(reportPath: string): Promise<EnglishEvidenceBankRetrofitV1 | undefined> {
  try {
    return parseEnglishEvidenceBankRetrofit(await readJson<unknown>(reportPath));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

function appendSourceNote(current: unknown): string {
  const note = `Evidence Bank retrofit ${ELA30_EVIDENCE_RETROFIT_VERSION} is applied deterministically with npm run retrofit:english-evidence -- --project <slug>. The canonical workspace remains the source of truth; do not rerun a destructive legacy builder to reproduce this feature.`;
  const existing = typeof current === "string" ? current.trim() : "";
  return existing.includes(`Evidence Bank retrofit ${ELA30_EVIDENCE_RETROFIT_VERSION}`) ? existing : [existing, note].filter(Boolean).join(" ");
}

function updateProjectJson(input: ProjectJson, slug: Ela30EvidenceProjectSlug, workspacePath: string): ProjectJson {
  const component = {
    id: "ela30-evidence-bank-v2",
    source: "scripts/lib/english-unit/ela30-evidence-retrofit.ts",
    target: `projects/${slug}/workspace/index.html#evidence-bank`,
    status: "active",
    notes: "Shared central Evidence Bank, deliberate activity saves, stable contribution IDs, and SCORM-compatible learner-state storage.",
  };
  const existingComponents = Array.isArray(input.injectedComponents) ? input.injectedComponents : [];
  const injectedComponents = [
    ...existingComponents.filter((entry) => entry?.id !== component.id),
    component,
  ].sort((left, right) => String(left.id ?? "").localeCompare(String(right.id ?? "")));
  const evidenceStorageKey = `canvas-helper:${slug}:manual-evidence-notes`;
  const googleHosted = input.googleHosted && typeof input.googleHosted === "object"
    ? input.googleHosted
    : {};
  const trackedStorageKeys = Array.from(new Set([
    ...(Array.isArray(googleHosted.trackedStorageKeys)
      ? googleHosted.trackedStorageKeys.filter((key): key is string => typeof key === "string" && key.trim().length > 0)
      : []),
    evidenceStorageKey,
  ]));
  return {
    ...input,
    migrationState: "migrated",
    projectType: input.projectType || "conversion",
    preferredWorkflows: Array.from(new Set([...(input.preferredWorkflows || []), "conversion", "injection/integration"])),
    workspaceEntrypoint: workspacePath,
    canonicalEntry: workspacePath,
    canonicalSources: Array.from(new Set([workspacePath, ...(input.canonicalSources || []).filter((source) => !/^[A-Za-z]:\\/.test(source))])),
    injectedComponents,
    googleHosted: {
      ...googleHosted,
      trackedStorageKeys,
    },
    sourceOfTruthNotes: appendSourceNote(input.sourceOfTruthNotes),
  };
}

async function atomicWrite(filePath: string, contents: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp-${process.pid}`;
  await writeFile(temporaryPath, contents, "utf8");
  await rename(temporaryPath, filePath);
}

async function prepareProject(slug: Ela30EvidenceProjectSlug): Promise<PreparedProject> {
  const projectDir = path.resolve("projects", slug);
  const workspacePath = path.join(projectDir, "workspace", "index.html");
  const projectJsonPath = path.join(projectDir, "meta", "project.json");
  const reportPath = path.join(projectDir, "meta", "evidence-bank-retrofit.json");
  const [sourceHtml, sourceProjectJson, existingReport] = await Promise.all([
    readFile(workspacePath, "utf8"),
    readJson<ProjectJson>(projectJsonPath),
    readExistingReport(reportPath),
  ]);
  const applied = applyEnglishEvidenceRetrofitToHtml({ projectSlug: slug, html: sourceHtml });
  const appliedAt = existingReport && existingReport.sourceSha256 === applied.baseHash && existingReport.outputSha256 === applied.outputHash
    ? existingReport.appliedAt
    : new Date().toISOString();
  const report = parseEnglishEvidenceBankRetrofit(createEnglishEvidenceRetrofitReport(applied, appliedAt));
  const projectJson = updateProjectJson(sourceProjectJson, slug, workspacePath);
  return {
    slug,
    workspacePath,
    projectJsonPath,
    reportPath,
    html: applied.html,
    projectJson,
    report,
    changed: applied.changed,
  };
}

async function assertCheck(project: PreparedProject): Promise<void> {
  const [currentHtml, currentProjectJson, currentReport] = await Promise.all([
    readFile(project.workspacePath, "utf8"),
    readJson<ProjectJson>(project.projectJsonPath),
    readExistingReport(project.reportPath),
  ]);
  const failures: string[] = [];
  if (currentHtml !== project.html) failures.push("workspace output differs from the deterministic retrofit");
  if (!currentReport) failures.push("evidence-bank-retrofit.json is missing");
  else if (JSON.stringify(currentReport) !== JSON.stringify(project.report)) failures.push("mapping report is stale");
  if (JSON.stringify(currentProjectJson) !== JSON.stringify(project.projectJson)) failures.push("project metadata is stale");
  if (failures.length) throw new Error(`${project.slug}: ${failures.join("; ")}. Run npm run retrofit:english-evidence -- --project ${project.slug}`);
}

async function main(): Promise<void> {
  const { projects, check } = requestedProjects();
  // Prepare and validate every project before writing any project. This keeps a
  // missing selector in one legacy workspace from causing a partial batch.
  const prepared = await Promise.all(projects.map((slug) => prepareProject(slug)));
  if (check) {
    for (const project of prepared) await assertCheck(project);
    console.log(`ELA 30-1 Evidence Bank retrofit check passed for ${prepared.length} project(s).`);
    return;
  }
  for (const project of prepared) {
    await atomicWrite(project.workspacePath, project.html);
    await atomicWrite(project.projectJsonPath, `${JSON.stringify(project.projectJson, null, 2)}\n`);
    await atomicWrite(project.reportPath, `${JSON.stringify(project.report, null, 2)}\n`);
    console.log(`${project.slug}: ${project.changed ? "retrofitted" : "already current"}; ${project.report.adapters.length} activity adapters; ${project.report.outputSha256}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

export { prepareProject, requestedProjects, updateProjectJson };
