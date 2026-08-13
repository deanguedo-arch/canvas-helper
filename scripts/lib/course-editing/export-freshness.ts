import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

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
  artifactRepoRelativePath: string;
  artifactSha256: string;
  recordedAt: string;
};

type CourseExportEvidence = {
  schemaVersion: 1;
  projectSlug: string;
  updatedAt: string;
  records: CourseExportEvidenceRecord[];
};

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

async function loadEvidence(repoRoot: string, projectSlug: string): Promise<CourseExportEvidence> {
  try {
    const value = JSON.parse(await readFile(evidencePath(repoRoot, projectSlug), "utf8")) as CourseExportEvidence;
    if (value.schemaVersion !== 1 || value.projectSlug !== projectSlug || !Array.isArray(value.records)) throw new Error("Invalid Studio export evidence.");
    return value;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { schemaVersion: 1, projectSlug, updatedAt: new Date(0).toISOString(), records: [] };
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
  const [sourceSha256, artifactSha256, evidence] = await Promise.all([
    fingerprintCourseExportArtifact(input.repoRoot, workspace),
    fingerprintCourseExportArtifact(input.repoRoot, artifact),
    loadEvidence(input.repoRoot, input.projectSlug)
  ]);
  const record: CourseExportEvidenceRecord = {
    target: input.target,
    sourceSha256,
    artifactRepoRelativePath: path.relative(input.repoRoot, artifact).split(path.sep).join("/"),
    artifactSha256,
    recordedAt: new Date().toISOString()
  };
  await saveEvidence(input.repoRoot, {
    schemaVersion: 1,
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
  let sourceSha256 = "";
  try {
    sourceSha256 = await fingerprintCourseExportArtifact(
      input.repoRoot,
      path.join(input.repoRoot, "projects", input.projectSlug, "workspace")
    );
  } catch {
    return [...input.targets];
  }
  const stale: CourseExportEvidenceTarget[] = [];
  for (const target of input.targets) {
    const record = evidence.records.find((entry) => entry.target === target);
    if (!record || record.sourceSha256 !== sourceSha256) {
      stale.push(target);
      continue;
    }
    const artifactPath = path.resolve(input.repoRoot, ...record.artifactRepoRelativePath.split("/"));
    if (!contained(path.resolve(input.repoRoot), artifactPath)) {
      stale.push(target);
      continue;
    }
    try {
      if (await fingerprintCourseExportArtifact(input.repoRoot, artifactPath) !== record.artifactSha256) stale.push(target);
    } catch {
      stale.push(target);
    }
  }
  return stale;
}
