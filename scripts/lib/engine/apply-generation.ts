import { realpath, writeFile } from "node:fs/promises";
import path from "node:path";

import { assertExactProjectSlug, inspectCourseAuthoringProject } from "../course-authoring/context.js";
import { type ProjectPaths } from "../types.js";

const GENERATED_FILE_BLOCK = /^\s*\*\*([^*\r\n]+)\*\*[ \t]*\r?\n```[^\r\n]*\r?\n([\s\S]*?)```/gm;

export interface ApplyGenerationOptions {
  slug: string;
  roots: ProjectPaths;
  llmResponse: string;
  repoRoot?: string;
}

export interface AppliedFile {
  relativePath: string;
  content: string;
}

export interface GenerationWriteEligibility {
  slug: string;
  workspaceDir: string;
  realWorkspaceDir: string;
  targets: ReadonlyMap<string, { absolutePath: string; realPath: string }>;
}

type ParsedGeneratedFile = AppliedFile;

function isContainedPath(parentPath: string, candidatePath: string) {
  const relative = path.relative(parentPath, candidatePath);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function normalizeWorkspaceTarget(rawPath: string) {
  const normalized = rawPath.replaceAll("\\", "/");
  const segments = normalized.split("/");
  if (segments[0] !== "workspace" || segments.length < 2) {
    throw new Error(`Generated file target must begin with workspace/: ${rawPath}`);
  }

  const relativeSegments = segments.slice(1);
  if (relativeSegments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error(`Generated file target contains an unsafe path segment: ${rawPath}`);
  }
  return `workspace/${relativeSegments.join("/")}`;
}

function parseGeneratedFiles(llmResponse: string): ParsedGeneratedFile[] {
  const files: ParsedGeneratedFile[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  GENERATED_FILE_BLOCK.lastIndex = 0;
  while ((match = GENERATED_FILE_BLOCK.exec(llmResponse)) !== null) {
    const relativePath = normalizeWorkspaceTarget(match[1].trim());
    if (seen.has(relativePath)) {
      throw new Error(`Generated response contains the same target more than once: ${relativePath}`);
    }
    seen.add(relativePath);
    files.push({ relativePath, content: match[2] });
  }

  if (files.length === 0) {
    throw new Error("Generated response did not contain a canonical workspace file block.");
  }
  return files;
}

function deriveRepoRoot(slug: string, roots: ProjectPaths, explicitRepoRoot?: string) {
  assertExactProjectSlug(slug);
  const repoRoot = path.resolve(explicitRepoRoot ?? path.join(roots.root, "..", ".."));
  const projectRoot = path.join(repoRoot, "projects", slug);
  if (path.resolve(roots.root) !== projectRoot || path.resolve(roots.workspaceDir) !== path.join(projectRoot, "workspace")) {
    throw new Error(`Generation write paths do not match project "${slug}".`);
  }
  return repoRoot;
}

export async function assertGenerationWriteEligible(
  options: Pick<ApplyGenerationOptions, "slug" | "roots" | "repoRoot">
): Promise<GenerationWriteEligibility> {
  const { slug, roots } = options;
  const repoRoot = deriveRepoRoot(slug, roots, options.repoRoot);
  const report = await inspectCourseAuthoringProject(slug, repoRoot);
  if (report.status !== "pass" || !report.project) {
    const details = report.issues.map((issue) => issue.message).join(" ");
    throw new Error(`Automatic generation writes are unavailable until course:doctor passes.${details ? ` ${details}` : ""}`);
  }
  if (report.project.driverId !== "direct-workspace-v1") {
    throw new Error(
      `Automatic generation writes are proposal-only for ${report.project.driverId}; use its declared authoring driver and rebuild flow instead.`
    );
  }

  const [realRepoRoot, realWorkspaceDir] = await Promise.all([realpath(repoRoot), realpath(roots.workspaceDir)]);
  if (!isContainedPath(realRepoRoot, realWorkspaceDir)) {
    throw new Error(`Workspace resolves outside this checkout through a symbolic link for project "${slug}".`);
  }

  const targets = new Map<string, { absolutePath: string; realPath: string }>();
  for (const source of report.project.editableSources) {
    if (source.kind !== "file") continue;
    const absolutePath = path.resolve(repoRoot, ...source.repoRelative.split("/"));
    if (!isContainedPath(roots.workspaceDir, absolutePath)) {
      throw new Error(`Canonical editable source is outside the workspace: ${source.repoRelative}`);
    }
    const realPath = await realpath(absolutePath);
    if (!isContainedPath(realWorkspaceDir, realPath)) {
      throw new Error(`Canonical editable source resolves outside the workspace through a symbolic link: ${source.repoRelative}`);
    }
    const workspaceRelativePath = path.relative(roots.workspaceDir, absolutePath).split(path.sep).join("/");
    if (!workspaceRelativePath || workspaceRelativePath.startsWith("../") || path.isAbsolute(workspaceRelativePath)) {
      throw new Error(`Cannot safely map canonical editable source: ${source.repoRelative}`);
    }
    targets.set(`workspace/${workspaceRelativePath}`, { absolutePath, realPath });
  }

  if (targets.size === 0) {
    throw new Error("Automatic generation writes require at least one declared canonical workspace file.");
  }

  return { slug, workspaceDir: roots.workspaceDir, realWorkspaceDir, targets };
}

export async function applyGeneration(options: ApplyGenerationOptions): Promise<AppliedFile[]> {
  const requestedFiles = parseGeneratedFiles(options.llmResponse);
  const eligibility = await assertGenerationWriteEligible(options);
  const validatedWrites: Array<AppliedFile & { absolutePath: string }> = [];

  for (const requestedFile of requestedFiles) {
    const target = eligibility.targets.get(requestedFile.relativePath);
    if (!target) {
      throw new Error(`Generated file target is not a declared canonical editable source: ${requestedFile.relativePath}`);
    }
    const currentRealPath = await realpath(target.absolutePath);
    if (currentRealPath !== target.realPath || !isContainedPath(eligibility.realWorkspaceDir, currentRealPath)) {
      throw new Error(`Generated file target changed or resolves outside the workspace: ${requestedFile.relativePath}`);
    }
    validatedWrites.push({ ...requestedFile, absolutePath: target.absolutePath });
  }

  for (const write of validatedWrites) {
    await writeFile(write.absolutePath, write.content, "utf8");
  }

  return validatedWrites.map(({ absolutePath: _absolutePath, ...file }) => file);
}
