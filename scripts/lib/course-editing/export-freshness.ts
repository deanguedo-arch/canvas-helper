import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type CourseExportEvidenceTarget =
  | "brightspace"
  | "brightspace-package"
  | "scorm2004"
  | "scorm12"
  | "google-hosted"
  | "apps-script"
  | "html";

type CourseExportEvidenceRecord = {
  target: CourseExportEvidenceTarget;
  sourceSha256: string;
  inputSha256: string;
  artifactRepoRelativePath: string;
  artifactSha256: string;
  recordedAt: string;
};

type CourseExportEvidence = {
  schemaVersion: 2;
  projectSlug: string;
  updatedAt: string;
  records: CourseExportEvidenceRecord[];
};

const EXPORT_ENTRYPOINTS: Record<CourseExportEvidenceTarget, string> = {
  brightspace: "scripts/lib/exports/brightspace.ts",
  "brightspace-package": "scripts/lib/exports/brightspace.ts",
  scorm2004: "scripts/lib/exports/scorm-package.ts",
  scorm12: "scripts/lib/exports/scorm-package.ts",
  "google-hosted": "scripts/lib/exports/google-hosted.ts",
  "apps-script": "scripts/lib/exports/apps-script.ts",
  html: "scripts/lib/exports/single-html.ts"
};
const implementationRepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function evidencePath(repoRoot: string, projectSlug: string) {
  return path.join(repoRoot, "projects", projectSlug, "meta", "studio-export-evidence.json");
}

function contained(repoRoot: string, targetPath: string) {
  const relative = path.relative(repoRoot, targetPath);
  return Boolean(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function updateHash(hash: ReturnType<typeof createHash>, filePath: string) {
  for await (const chunk of createReadStream(filePath)) hash.update(chunk as Buffer);
}

export async function fingerprintCourseExportArtifact(repoRoot: string, targetPath: string) {
  const absolute = path.resolve(targetPath);
  if (!contained(path.resolve(repoRoot), absolute)) throw new Error("Export evidence path escaped this checkout.");
  const hash = createHash("sha256");
  const rootStats = await lstat(absolute);
  if (rootStats.isSymbolicLink()) throw new Error("Export evidence does not follow symbolic links.");
  if (rootStats.isFile()) {
    hash.update(`file\0${rootStats.size}\0`);
    await updateHash(hash, absolute);
    return hash.digest("hex");
  }
  if (!rootStats.isDirectory()) throw new Error("Export evidence supports only files and directories.");
  const visit = async (directory: string, relativeDirectory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const child = path.join(directory, entry.name);
      const relative = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
      const stats = await lstat(child);
      if (stats.isSymbolicLink()) throw new Error("Export evidence does not follow symbolic links.");
      if (stats.isDirectory()) {
        hash.update(`directory\0${relative}\0`);
        await visit(child, relative);
      } else if (stats.isFile()) {
        hash.update(`file\0${relative}\0${stats.size}\0`);
        await updateHash(hash, child);
        hash.update("\0");
      }
    }
  };
  await visit(absolute, "");
  return hash.digest("hex");
}

async function existingLocalModulePath(repoRoot: string, importerPath: string, specifier: string) {
  const base = path.resolve(path.dirname(importerPath), specifier);
  const extension = path.extname(base);
  const candidates = extension
    ? [base, `${base.slice(0, -extension.length)}.ts`, `${base.slice(0, -extension.length)}.tsx`]
    : [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")];
  for (const candidate of candidates) {
    if (!contained(repoRoot, candidate)) throw new Error("Exporter implementation dependency escaped this checkout.");
    try {
      const stats = await lstat(candidate);
      if (stats.isFile() && !stats.isSymbolicLink()) return candidate;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  throw new Error(`Exporter implementation dependency could not be resolved: ${specifier}`);
}

async function collectExporterImplementationFiles(repoRoot: string, target: CourseExportEvidenceTarget) {
  const pending = [path.join(repoRoot, ...EXPORT_ENTRYPOINTS[target].split("/"))];
  const files = new Set<string>();
  while (pending.length) {
    const filePath = pending.pop()!;
    if (files.has(filePath)) continue;
    files.add(filePath);
    const source = await readFile(filePath, "utf8");
    const specifiers = [
      ...source.matchAll(/\bfrom\s*["']([^"']+)["']/g),
      ...source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)
    ].map((match) => match[1]).filter((value) => value.startsWith("."));
    for (const specifier of specifiers) pending.push(await existingLocalModulePath(repoRoot, filePath, specifier));
  }
  return [...files].sort((left, right) => left.localeCompare(right));
}

async function addOptionalFileToHash(hash: ReturnType<typeof createHash>, repoRoot: string, filePath: string) {
  const relative = path.relative(repoRoot, filePath).split(path.sep).join("/");
  try {
    const stats = await lstat(filePath);
    if (!stats.isFile() || stats.isSymbolicLink()) throw new Error(`Export input is not a safe file: ${relative}`);
    hash.update(`file\0${relative}\0${stats.size}\0`);
    await updateHash(hash, filePath);
    hash.update("\0");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    hash.update(`missing\0${relative}\0`);
  }
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

async function addProjectManifestToHash(hash: ReturnType<typeof createHash>, repoRoot: string, filePath: string) {
  const relative = path.relative(repoRoot, filePath).split(path.sep).join("/");
  const manifest = JSON.parse(await readFile(filePath, "utf8")) as Record<string, unknown>;
  // Export commands refresh these approval timestamps immediately before
  // evidence is recorded. They are operational provenance, not package input.
  delete manifest.updatedAt;
  delete manifest.workspaceApprovedAt;
  hash.update(`manifest\0${relative}\0${stableJson(manifest)}\0`);
}

export async function fingerprintCourseExportInputs(input: {
  repoRoot: string;
  projectSlug: string;
  target: CourseExportEvidenceTarget;
  implementationRoot?: string;
}) {
  const repoRoot = path.resolve(input.repoRoot);
  const exporterRoot = path.resolve(input.implementationRoot ?? implementationRepoRoot);
  const projectRoot = path.join(repoRoot, "projects", input.projectSlug);
  const workspace = path.join(projectRoot, "workspace");
  const hash = createHash("sha256");
  hash.update(`canvas-helper-export-input-v2\0${input.target}\0`);
  hash.update(`workspace\0${await fingerprintCourseExportArtifact(repoRoot, workspace)}\0`);
  await addProjectManifestToHash(hash, repoRoot, path.join(projectRoot, "meta", "project.json"));
  for (const filePath of [
    path.join(projectRoot, "meta", "studio-course.json"),
    path.join(projectRoot, "meta", "studio-edits.json")
  ]) {
    await addOptionalFileToHash(hash, repoRoot, filePath);
  }
  for (const filePath of [
    path.join(exporterRoot, "package.json"),
    path.join(exporterRoot, "package-lock.json"),
    ...await collectExporterImplementationFiles(exporterRoot, input.target)
  ]) {
    await addOptionalFileToHash(hash, exporterRoot, filePath);
  }
  return hash.digest("hex");
}

async function loadEvidence(repoRoot: string, projectSlug: string): Promise<CourseExportEvidence> {
  try {
    const value = JSON.parse(await readFile(evidencePath(repoRoot, projectSlug), "utf8")) as Record<string, unknown>;
    if (![1, 2].includes(Number(value.schemaVersion)) || value.projectSlug !== projectSlug || !Array.isArray(value.records)) {
      throw new Error("Invalid Studio export evidence.");
    }
    const records = value.records.map((entry) => {
      if (!entry || typeof entry !== "object") throw new Error("Invalid Studio export evidence record.");
      const record = entry as Partial<CourseExportEvidenceRecord>;
      return {
        ...record,
        inputSha256: typeof record.inputSha256 === "string" ? record.inputSha256 : ""
      } as CourseExportEvidenceRecord;
    });
    return {
      schemaVersion: 2,
      projectSlug,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
      records
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { schemaVersion: 2, projectSlug, updatedAt: new Date(0).toISOString(), records: [] };
    }
    throw error;
  }
}

async function saveEvidence(repoRoot: string, evidence: CourseExportEvidence) {
  const target = evidencePath(repoRoot, evidence.projectSlug);
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.tmp-${process.pid}-${randomUUID()}`;
  try {
    await writeFile(temporary, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function recordCourseExportEvidence(input: {
  repoRoot: string;
  projectSlug: string;
  target: CourseExportEvidenceTarget;
  artifactPath: string;
}) {
  const workspace = path.join(input.repoRoot, "projects", input.projectSlug, "workspace");
  const artifact = path.resolve(input.artifactPath);
  if (!contained(path.resolve(input.repoRoot), artifact)) throw new Error("Export artifact escaped this checkout.");
  const [sourceSha256, inputSha256, artifactSha256, evidence] = await Promise.all([
    fingerprintCourseExportArtifact(input.repoRoot, workspace),
    fingerprintCourseExportInputs(input),
    fingerprintCourseExportArtifact(input.repoRoot, artifact),
    loadEvidence(input.repoRoot, input.projectSlug)
  ]);
  const record: CourseExportEvidenceRecord = {
    target: input.target,
    sourceSha256,
    inputSha256,
    artifactRepoRelativePath: path.relative(input.repoRoot, artifact).split(path.sep).join("/"),
    artifactSha256,
    recordedAt: new Date().toISOString()
  };
  await saveEvidence(input.repoRoot, {
    schemaVersion: 2,
    projectSlug: input.projectSlug,
    updatedAt: record.recordedAt,
    records: [...evidence.records.filter((entry) => entry.target !== input.target), record]
  });
  return record;
}

export async function staleCourseExportTargets(input: {
  repoRoot: string;
  projectSlug: string;
  targets: CourseExportEvidenceTarget[];
}) {
  if (!input.targets.length) return [];
  let evidence: CourseExportEvidence;
  try {
    evidence = await loadEvidence(input.repoRoot, input.projectSlug);
  } catch {
    return [...input.targets];
  }
  const stale: CourseExportEvidenceTarget[] = [];
  for (const target of input.targets) {
    const record = evidence.records.find((entry) => entry.target === target);
    if (!record) {
      stale.push(target);
      continue;
    }
    try {
      if (record.inputSha256 !== await fingerprintCourseExportInputs({
        repoRoot: input.repoRoot,
        projectSlug: input.projectSlug,
        target
      })) {
        stale.push(target);
        continue;
      }
      const artifactPath = path.resolve(input.repoRoot, ...record.artifactRepoRelativePath.split("/"));
      if (!contained(path.resolve(input.repoRoot), artifactPath)) {
        stale.push(target);
        continue;
      }
      if (await fingerprintCourseExportArtifact(input.repoRoot, artifactPath) !== record.artifactSha256) stale.push(target);
    } catch {
      stale.push(target);
    }
  }
  return stale;
}
