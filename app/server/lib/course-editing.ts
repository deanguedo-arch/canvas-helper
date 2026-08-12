import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { chmod, copyFile, lstat, mkdir, readFile, readdir, realpath, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";

import {
  COURSE_EDIT_SCHEMA_VERSION,
  type CourseEditAdapter,
  type CourseEditApplyRequest,
  type CourseEditBatchResult,
  type CourseEditDraft,
  type CourseEditResolveRequest,
  type CourseEditStatus,
  type CourseEditTarget,
  type CourseEditTargetIdentity
} from "../../shared/course-editing.js";
import { inspectCourseAuthoringProject, type ResolvedCourseAuthoringProject } from "../../../scripts/lib/course-authoring/context.js";
import {
  applyPatchToEditableElement,
  collectEditableHtmlElements,
  courseEditCapabilitiesForTag,
  currentCourseEditStyle,
  ensureStudioEditStyles,
  isSafeCourseEditRichTextSource,
  sanitizeCourseEditPlainText,
  sanitizeCourseEditRichText,
  sanitizeCourseEditUrl,
  type EditableHtmlElement
} from "../../../scripts/lib/course-editing/html.js";
import {
  applyCourseEditOverridesToHtml,
  courseEditOverridesPath,
  loadCourseEditOverrides,
  saveCourseEditOverrides,
  type StoredCourseEditOverride
} from "../../../scripts/lib/course-editing/overrides.js";
import { repoRoot as defaultRepoRoot } from "../../../scripts/lib/paths.js";
import { loadProjectManifest } from "../../../scripts/lib/projects.js";
import type { ProjectManifest } from "../../../scripts/lib/types.js";
import { clearPreviewInspectionDocumentCache, isPreviewInspectionNodeId, loadPreviewInspectionDocument } from "./preview-inspection";
import { isPathInside } from "./validation";

const CHECKPOINT_SCHEMA_VERSION = 1;
const MAX_CHECKPOINT_FILE_BYTES = 10 * 1024 * 1024;
const MAX_CHECKPOINT_DIRECTORY_BYTES = 512 * 1024 * 1024;
const MAX_CHECKPOINT_DIRECTORY_FILES = 20_000;
const MAX_COMMAND_OUTPUT = 12_000;
const COMMAND_TIMEOUT_MS = 6 * 60 * 1_000;
const activeProjectEdits = new Set<string>();

class StaleCourseEditSourceError extends Error {
  constructor(message = "The course changed while Studio prepared this batch. Reload it and select the element again.") {
    super(message);
    this.name = "StaleCourseEditSourceError";
  }
}

type SnapshotFile = {
  repoRelativePath: string;
  existed: boolean;
  mode: number | null;
  contentBase64: string;
};

type SnapshotDirectory = {
  repoRelativePath: string;
  backupRelativePath: string;
  existed: boolean;
};

type CourseEditCheckpoint = {
  schemaVersion: typeof CHECKPOINT_SCHEMA_VERSION;
  checkpointId: string;
  projectSlug: string;
  adapter: CourseEditAdapter;
  htmlPaths: string[];
  createdAt: string;
  files: SnapshotFile[];
  directories: SnapshotDirectory[];
  previousStatus: CourseEditStatus;
};

type ResolvedEditableTarget = {
  target: CourseEditTarget;
  sourcePath: string;
  source: string;
  element: EditableHtmlElement;
  project: ResolvedCourseAuthoringProject;
};

type CommandResult = { ok: boolean; stdout: string; stderr: string; exitCode: number };

type CourseEditExecutionHooks = {
  beforeDirectCommit?: () => void | Promise<void>;
};

function trimOutput(value: string) {
  return value.length <= MAX_COMMAND_OUTPUT ? value : `...<truncated>\n${value.slice(-MAX_COMMAND_OUTPUT)}`;
}

function hash24(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 24);
}

function adapterForProject(project: ResolvedCourseAuthoringProject): CourseEditAdapter | null {
  if (project.driverId === "direct-workspace-v1" && project.authoringMode === "direct") return "direct";
  if (project.driverId === "english-factory-v1" && project.authoringMode === "factory") return "english-factory";
  if (project.driverId === "social-related-issues-v1" && project.driverSource === "declared") return "social-related-issues";
  return null;
}

function emptyCapabilities() {
  return { richText: false, link: false, image: false, styles: false };
}

function unsupportedTarget(reason: string): CourseEditTarget {
  return {
    eligibility: "unsupported",
    reason,
    identity: null,
    capabilities: emptyCapabilities(),
    originalHtml: "",
    originalText: "",
    attributes: { href: "", src: "", alt: "", title: "" },
    currentStyle: {
      textStyle: "default",
      fontFamily: "default",
      fontSize: "default",
      textTone: "default",
      alignment: "default",
      spacing: "default"
    }
  };
}

function relativeWorkspacePath(sourcePath: string, projectSlug: string, repoRoot: string) {
  const workspaceRoot = path.join(repoRoot, "projects", projectSlug, "workspace");
  const relative = path.relative(workspaceRoot, sourcePath).split(path.sep).join("/");
  if (!relative || relative.startsWith("../") || path.isAbsolute(relative)) throw new Error("Course edit target is outside its workspace.");
  return relative;
}

async function resolveEditWorkspacePath(projectSlug: string, htmlPath: string, repoRoot: string) {
  if (!htmlPath || htmlPath.length > 2_048 || htmlPath.includes("\0") || htmlPath.includes("\\") || path.isAbsolute(htmlPath)) {
    throw new Error("The course page path is not safe to edit.");
  }
  const parts = htmlPath.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) throw new Error("The course page path is not safe to edit.");
  const projectRoot = path.join(repoRoot, "projects", projectSlug);
  const workspaceRoot = path.join(projectRoot, "workspace");
  const target = path.resolve(workspaceRoot, ...parts);
  if (!isPathInside(projectRoot, workspaceRoot) || !isPathInside(workspaceRoot, target)) throw new Error("The course page escaped its workspace.");
  const workspaceStats = await lstat(workspaceRoot);
  if (!workspaceStats.isDirectory() || workspaceStats.isSymbolicLink()) {
    throw new Error("The course page is not a real workspace HTML file.");
  }
  let cursor = workspaceRoot;
  for (const part of parts) {
    cursor = path.join(cursor, part);
    const stats = await lstat(cursor);
    if (stats.isSymbolicLink()) throw new Error("Studio cannot edit a course page through a symbolic link.");
  }
  const targetStats = await lstat(target);
  if (!targetStats.isFile()) throw new Error("The course page is not a real workspace HTML file.");
  const [realWorkspaceRoot, realTarget] = await Promise.all([realpath(workspaceRoot), realpath(target)]);
  if (!isPathInside(realWorkspaceRoot, realTarget)) throw new Error("The course page escaped its real workspace.");
  return target;
}

function htmlText(value: string) {
  return load(`<body>${value}</body>`)("body").text().replace(/\s+/g, " ").trim();
}

function targetIdentity(input: {
  projectSlug: string;
  htmlPath: string;
  nodeId: string;
  sourceDigest: string;
  editId: string | null;
  tagName: string;
  adapter: CourseEditAdapter;
}): CourseEditTargetIdentity {
  return {
    targetId: hash24([input.projectSlug, input.htmlPath, input.nodeId, input.sourceDigest, input.editId ?? "direct", input.tagName, input.adapter].join("\u0000")),
    ...input
  };
}

async function resolveCourseProject(projectSlug: string, repoRoot: string) {
  const report = await inspectCourseAuthoringProject(projectSlug, repoRoot);
  if (report.status !== "pass" || !report.project) {
    return { project: null, adapter: null, reason: "This course must pass its authoring check before Studio can edit it." };
  }
  const adapter = adapterForProject(report.project);
  if (!adapter) {
    return {
      project: report.project,
      adapter: null,
      reason: "This course does not yet have a safe direct-edit adapter. You can still annotate it for Codex."
    };
  }
  return { project: report.project, adapter, reason: "" };
}

function editableElementForNode(input: {
  source: string;
  projectSlug: string;
  htmlPath: string;
  sourceStart: number;
  tagName: string;
  editId: string | null;
}) {
  const elements = collectEditableHtmlElements(input.source, input.projectSlug, input.htmlPath);
  if (!elements) return null;
  if (input.editId) {
    const byId = elements.find((element) => element.editId === input.editId && element.tagName === input.tagName);
    if (byId) return byId;
  }
  return elements.find((element) => element.sourceStart === input.sourceStart && element.tagName === input.tagName) ?? null;
}

async function resolveFromIdentity(identity: CourseEditTargetIdentity, repoRoot: string): Promise<ResolvedEditableTarget> {
  const sourcePath = await resolveEditWorkspacePath(identity.projectSlug, identity.htmlPath, repoRoot);
  const document = await loadPreviewInspectionDocument(sourcePath);
  if (!document || document.sourceDigest !== identity.sourceDigest || !document.nodeIds.has(identity.nodeId)) {
    throw new Error("The course changed after this draft was created. Reload it and select the element again.");
  }
  const location = document.nodeLocations.get(identity.nodeId);
  if (!location || location.tagName !== identity.tagName) throw new Error("The selected element is no longer current.");
  const { project, adapter, reason } = await resolveCourseProject(identity.projectSlug, repoRoot);
  if (!project || !adapter || adapter !== identity.adapter) throw new Error(reason || "The course edit adapter changed.");
  if (adapter === "direct") {
    const repoRelative = path.relative(repoRoot, sourcePath).split(path.sep).join("/");
    if (!project.editableSources.some((entry) => entry.kind === "file" && entry.repoRelative === repoRelative)) {
      throw new Error("This workspace page is no longer a declared canonical editable source.");
    }
  } else if (identity.htmlPath !== "index.html") {
    throw new Error("Generated course edits are available only on the generated course entry page.");
  }
  const element = editableElementForNode({
    source: document.source,
    projectSlug: identity.projectSlug,
    htmlPath: identity.htmlPath,
    sourceStart: location.sourceStart,
    tagName: location.tagName,
    editId: identity.editId
  });
  if (!element || (identity.editId && element.editId !== identity.editId)) throw new Error("The selected content no longer has the same stable edit identity.");
  const expected = targetIdentity({
    projectSlug: identity.projectSlug,
    htmlPath: identity.htmlPath,
    nodeId: identity.nodeId,
    sourceDigest: identity.sourceDigest,
    editId: adapter === "direct" ? null : element.editId,
    tagName: element.tagName,
    adapter
  });
  if (expected.targetId !== identity.targetId) throw new Error("The edit target identity is invalid.");
  const originalHtml = document.source.slice(element.innerStart, element.innerEnd);
  return {
    target: buildEditableTarget({ identity: expected, element, originalHtml }),
    sourcePath,
    source: document.source,
    element,
    project
  };
}

function buildEditableTarget(input: {
  identity: CourseEditTargetIdentity;
  element: EditableHtmlElement;
  originalHtml: string;
}): CourseEditTarget {
  const baseCapabilities = courseEditCapabilitiesForTag(input.element.tagName);
  const capabilities = {
    ...baseCapabilities,
    richText: baseCapabilities.richText && isSafeCourseEditRichTextSource(input.originalHtml)
  };
  if (!capabilities.richText && !capabilities.link && !capabilities.image && !capabilities.styles) {
    return unsupportedTarget("This element contains complex course structure and remains annotation-only.");
  }
  return {
    eligibility: "editable",
    reason: capabilities.richText ? "Ready to edit." : "Formatting inside this element is complex, so Studio will preserve its text structure.",
    identity: input.identity,
    capabilities,
    originalHtml: input.originalHtml,
    originalText: input.element.tagName === "img"
      ? input.element.attributes.alt || input.element.attributes.title || "Image"
      : htmlText(input.originalHtml),
    attributes: {
      href: input.element.attributes.href ?? "",
      src: input.element.attributes.src ?? "",
      alt: input.element.attributes.alt ?? "",
      title: input.element.attributes.title ?? ""
    },
    currentStyle: currentCourseEditStyle(input.element.attributes)
  };
}

export async function resolveCourseEditTarget(request: CourseEditResolveRequest, repoRoot = defaultRepoRoot): Promise<CourseEditTarget> {
  if (request.root !== "workspace" || !isPreviewInspectionNodeId(request.selection.nodeId)) {
    return unsupportedTarget("Only current workspace elements can be edited. References and area selections remain annotation-only.");
  }
  const { project, adapter, reason } = await resolveCourseProject(request.projectSlug, repoRoot);
  if (!project || !adapter) return unsupportedTarget(reason);
  const sourcePath = await resolveEditWorkspacePath(request.projectSlug, request.htmlPath, repoRoot);
  const document = await loadPreviewInspectionDocument(sourcePath);
  if (!document || !request.selection.nodeId || !document.nodeIds.has(request.selection.nodeId)) {
    return unsupportedTarget("The preview is stale. Refresh it and select the element again.");
  }
  const location = document.nodeLocations.get(request.selection.nodeId);
  if (!location || location.tagName !== request.selection.tagName.toLowerCase()) {
    return unsupportedTarget("The selected element no longer matches the course source.");
  }
  const htmlPath = relativeWorkspacePath(sourcePath, request.projectSlug, repoRoot);
  if (adapter === "direct") {
    const repoRelative = path.relative(repoRoot, sourcePath).split(path.sep).join("/");
    if (!project.editableSources.some((entry) => entry.kind === "file" && entry.repoRelative === repoRelative)) {
      return unsupportedTarget("This workspace page is not declared as a canonical editable source.");
    }
  } else if (htmlPath !== "index.html") {
    return unsupportedTarget("Generated course edits are available only on the generated course entry page.");
  }
  const element = editableElementForNode({
    source: document.source,
    projectSlug: request.projectSlug,
    htmlPath,
    sourceStart: location.sourceStart,
    tagName: location.tagName,
    editId: adapter === "direct" ? null : location.editId
  });
  if (!element) return unsupportedTarget("Select the text, link, image, caption, or button itself rather than its surrounding layout.");
  const identity = targetIdentity({
    projectSlug: request.projectSlug,
    htmlPath,
    nodeId: request.selection.nodeId,
    sourceDigest: document.sourceDigest,
    editId: adapter === "direct" ? null : element.editId,
    tagName: element.tagName,
    adapter
  });
  return buildEditableTarget({
    identity,
    element,
    originalHtml: document.source.slice(element.innerStart, element.innerEnd)
  });
}

function sanitizeDraft(draft: CourseEditDraft, target: CourseEditTarget) {
  if (!target.identity) throw new Error("The edit target is no longer available.");
  const patch = { ...draft.patch };
  if (patch.html !== undefined) {
    if (!target.capabilities.richText) throw new Error("This element does not support rich-text changes.");
    patch.html = sanitizeCourseEditRichText(patch.html);
  }
  if (patch.href !== undefined) {
    if (!target.capabilities.link) throw new Error("This element is not an editable link.");
    patch.href = patch.href === null ? null : sanitizeCourseEditUrl(patch.href, "href");
  }
  if (patch.src !== undefined) {
    if (!target.capabilities.image) throw new Error("This element is not an editable image.");
    patch.src = patch.src === null ? null : sanitizeCourseEditUrl(patch.src, "src");
  }
  if (patch.alt !== undefined) {
    if (!target.capabilities.image) throw new Error("Only images support alt text.");
    patch.alt = patch.alt === null ? null : sanitizeCourseEditPlainText(patch.alt);
  }
  if (patch.title !== undefined) patch.title = patch.title === null ? null : sanitizeCourseEditPlainText(patch.title);
  if (patch.style && !target.capabilities.styles) throw new Error("This element does not support Studio style controls.");
  return { ...draft, patch };
}

async function atomicWrite(filePath: string, content: string, mode?: number | null) {
  const temporary = `${filePath}.studio-edit-${process.pid}-${Date.now()}`;
  try {
    await writeFile(temporary, content, "utf8");
    if (typeof mode === "number") await chmod(temporary, mode);
    await rename(temporary, filePath);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function runCommand(args: string[], repoRoot: string): Promise<CommandResult> {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "npm.cmd" : "npm";
  return await new Promise((resolve) => {
    const child = spawn(command, args, { cwd: repoRoot, env: process.env, stdio: ["ignore", "pipe", "pipe"], shell: false });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      child.kill("SIGTERM");
      stderr += "\nCommand exceeded the Studio edit deadline.";
    }, COMMAND_TIMEOUT_MS);
    const finish = (exitCode: number) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ok: exitCode === 0, exitCode, stdout: trimOutput(stdout.trim()), stderr: trimOutput(stderr.trim()) });
    };
    child.stdout?.on("data", (chunk) => { stdout += String(chunk); });
    child.stderr?.on("data", (chunk) => { stderr += String(chunk); });
    child.on("error", (error) => { stderr += `\n${error.message}`; finish(1); });
    child.on("close", (code) => finish(code ?? 1));
  });
}

async function projectManifest(projectSlug: string, repoRoot: string) {
  if (repoRoot === defaultRepoRoot) return await loadProjectManifest(projectSlug);
  return JSON.parse(await readFile(path.join(repoRoot, "projects", projectSlug, "meta", "project.json"), "utf8")) as ProjectManifest;
}

async function rebuildArgs(projectSlug: string, adapter: CourseEditAdapter, repoRoot: string) {
  if (adapter === "english-factory") return ["run", "build:english-unit", "--", "--project", projectSlug];
  if (adapter !== "social-related-issues") return null;
  const manifest = await projectManifest(projectSlug, repoRoot);
  if (projectSlug.startsWith("social10-1-related-issue-")) {
    return ["exec", "--", "tsx", "scripts/build-social10-related-issues.ts", "--only", projectSlug, "--studio-edit"];
  }
  if (projectSlug.startsWith("social20-1-related-issue-")) {
    return ["exec", "--", "tsx", "scripts/build-social20-related-issues.ts", "--only", projectSlug, "--studio-edit"];
  }
  const resourceId = manifest.authoring?.sourceResourceIds?.[0];
  if (projectSlug.startsWith("social30-1-related-issue-") && resourceId) {
    return ["run", "build:social30", "--", "--resource", resourceId, "--only", projectSlug];
  }
  throw new Error("This Social course does not declare a known bounded rebuild adapter.");
}

async function runRebuild(projectSlug: string, adapter: CourseEditAdapter, repoRoot: string) {
  const args = await rebuildArgs(projectSlug, adapter, repoRoot);
  if (!args) return;
  const result = await runCommand(args, repoRoot);
  if (!result.ok) throw new Error(`The course rebuild failed.\n${result.stderr || result.stdout}`);
}

async function runValidation(projectSlug: string, repoRoot: string) {
  for (const args of [
    ["run", "course:doctor", "--", "--project", projectSlug],
    ["run", "verify", "--", "--project", projectSlug, "--mode", "workspace"]
  ]) {
    const result = await runCommand(args, repoRoot);
    if (!result.ok) throw new Error(`Course validation failed.\n${result.stderr || result.stdout}`);
  }
}

function checkpointPath(repoRoot: string, projectSlug: string) {
  return path.join(repoRoot, ".runtime", "studio-edit-checkpoints", projectSlug, "latest.json");
}

function checkpointBackupRoot(repoRoot: string, projectSlug: string, checkpointId: string) {
  return path.join(repoRoot, ".runtime", "studio-edit-checkpoints", projectSlug, checkpointId);
}

function statusPath(repoRoot: string, projectSlug: string) {
  return path.join(repoRoot, ".runtime", "studio-edit-status", `${projectSlug}.json`);
}

async function snapshotFile(repoRoot: string, filePath: string): Promise<SnapshotFile> {
  const relative = path.relative(repoRoot, filePath).split(path.sep).join("/");
  if (!relative || relative.startsWith("../") || path.isAbsolute(relative)) throw new Error("Checkpoint path escaped this checkout.");
  try {
    const stats = await lstat(filePath);
    if (!stats.isFile() || stats.isSymbolicLink() || stats.size > MAX_CHECKPOINT_FILE_BYTES) {
      throw new Error("Studio cannot checkpoint this edit source safely.");
    }
    return { repoRelativePath: relative, existed: true, mode: stats.mode, contentBase64: (await readFile(filePath)).toString("base64") };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { repoRelativePath: relative, existed: false, mode: null, contentBase64: "" };
    }
    throw error;
  }
}

async function copyCheckpointDirectory(
  sourceDir: string,
  destinationDir: string,
  total: { bytes: number; files: number }
): Promise<void> {
  const sourceStats = await lstat(sourceDir);
  if (!sourceStats.isDirectory() || sourceStats.isSymbolicLink()) {
    throw new Error("Studio can checkpoint only real course directories.");
  }
  await mkdir(destinationDir, { recursive: true, mode: sourceStats.mode });
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);
    const stats = await lstat(sourcePath);
    if (stats.isSymbolicLink()) throw new Error("Studio cannot checkpoint a course directory containing symbolic links.");
    if (stats.isDirectory()) {
      await copyCheckpointDirectory(sourcePath, destinationPath, total);
      continue;
    }
    if (!stats.isFile()) continue;
    total.files += 1;
    total.bytes += stats.size;
    if (total.files > MAX_CHECKPOINT_DIRECTORY_FILES || total.bytes > MAX_CHECKPOINT_DIRECTORY_BYTES) {
      throw new Error("This generated course is too large for a safe Studio undo checkpoint.");
    }
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath, fsConstants.COPYFILE_FICLONE);
    await chmod(destinationPath, stats.mode);
  }
}

async function snapshotDirectory(input: {
  repoRoot: string;
  projectSlug: string;
  checkpointId: string;
  directoryPath: string;
  index: number;
  total: { bytes: number; files: number };
}): Promise<SnapshotDirectory> {
  const repoRelativePath = path.relative(input.repoRoot, input.directoryPath).split(path.sep).join("/");
  if (!repoRelativePath || repoRelativePath.startsWith("../") || path.isAbsolute(repoRelativePath)) {
    throw new Error("Checkpoint directory escaped this checkout.");
  }
  const backupPath = path.join(
    checkpointBackupRoot(input.repoRoot, input.projectSlug, input.checkpointId),
    "directories",
    String(input.index)
  );
  const backupRelativePath = path.relative(input.repoRoot, backupPath).split(path.sep).join("/");
  try {
    await copyCheckpointDirectory(input.directoryPath, backupPath, input.total);
    return { repoRelativePath, backupRelativePath, existed: true };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { repoRelativePath, backupRelativePath, existed: false };
    }
    throw error;
  }
}

function resolveCheckpointRelativePath(repoRoot: string, relativePath: string, label: string) {
  const target = path.resolve(repoRoot, ...relativePath.split("/"));
  const relative = path.relative(repoRoot, target);
  if (!relative || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`${label} escaped this checkout.`);
  }
  return target;
}

async function restoreSnapshotDirectories(repoRoot: string, directories: SnapshotDirectory[]) {
  for (const directory of directories) {
    const target = resolveCheckpointRelativePath(repoRoot, directory.repoRelativePath, "Checkpoint restore");
    if (!directory.existed) {
      await rm(target, { recursive: true, force: true });
      continue;
    }
    const backup = resolveCheckpointRelativePath(repoRoot, directory.backupRelativePath, "Checkpoint backup");
    const temporary = `${target}.studio-restore-${process.pid}-${Date.now()}`;
    const total = { bytes: 0, files: 0 };
    try {
      await copyCheckpointDirectory(backup, temporary, total);
      await rm(target, { recursive: true, force: true });
      await rename(temporary, target);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  }
  clearPreviewInspectionDocumentCache();
}

async function restoreSnapshotFiles(repoRoot: string, files: SnapshotFile[]) {
  for (const file of files) {
    const target = resolveCheckpointRelativePath(repoRoot, file.repoRelativePath, "Checkpoint restore");
    if (!file.existed) {
      await rm(target, { force: true });
      continue;
    }
    await mkdir(path.dirname(target), { recursive: true });
    const content = Buffer.from(file.contentBase64, "base64");
    if (content.length > MAX_CHECKPOINT_FILE_BYTES) throw new Error("Checkpoint content exceeds the restore limit.");
    await atomicWrite(target, content.toString("utf8"), file.mode);
  }
  clearPreviewInspectionDocumentCache();
}

async function writeCheckpoint(checkpoint: CourseEditCheckpoint, repoRoot: string) {
  const target = checkpointPath(repoRoot, checkpoint.projectSlug);
  await mkdir(path.dirname(target), { recursive: true });
  await atomicWrite(target, `${JSON.stringify(checkpoint, null, 2)}\n`);
}

async function loadCheckpoint(projectSlug: string, repoRoot: string): Promise<CourseEditCheckpoint | null> {
  try {
    const parsed = JSON.parse(await readFile(checkpointPath(repoRoot, projectSlug), "utf8")) as CourseEditCheckpoint;
    if (
      parsed.schemaVersion !== CHECKPOINT_SCHEMA_VERSION ||
      parsed.projectSlug !== projectSlug ||
      !Array.isArray(parsed.files) ||
      !Array.isArray(parsed.directories) ||
      !Array.isArray(parsed.htmlPaths)
    ) {
      throw new Error("The latest Studio edit checkpoint is invalid.");
    }
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function getCourseEditStatus(projectSlug: string, repoRoot = defaultRepoRoot): Promise<CourseEditStatus> {
  let stored: Partial<CourseEditStatus> = {};
  try {
    stored = JSON.parse(await readFile(statusPath(repoRoot, projectSlug), "utf8")) as Partial<CourseEditStatus>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const checkpoint = await loadCheckpoint(projectSlug, repoRoot);
  const availability = await resolveCourseProject(projectSlug, repoRoot);
  return {
    projectSlug,
    available: Boolean(availability.project && availability.adapter),
    unavailableReason: availability.reason,
    canUndo: Boolean(checkpoint),
    checkpointId: checkpoint?.checkpointId ?? null,
    exportsOutOfDate: Boolean(stored.exportsOutOfDate),
    staleExportTargets: Array.isArray(stored.staleExportTargets) ? stored.staleExportTargets.filter((value): value is string => typeof value === "string") : [],
    lastAppliedAt: typeof stored.lastAppliedAt === "string" ? stored.lastAppliedAt : null
  };
}

async function saveCourseEditStatus(status: CourseEditStatus, repoRoot: string) {
  const target = statusPath(repoRoot, status.projectSlug);
  await mkdir(path.dirname(target), { recursive: true });
  await atomicWrite(target, `${JSON.stringify(status, null, 2)}\n`);
}

async function staleExportTargets(projectSlug: string, repoRoot: string) {
  const manifest = await projectManifest(projectSlug, repoRoot);
  return [...new Set((manifest.exportTargets ?? []).filter((target) => target.enabled !== false).map((target) => target.target))];
}

function assertNonOverlappingTargets(resolved: Array<{ draft: CourseEditDraft; target: ResolvedEditableTarget }>) {
  const bySource = new Map<string, typeof resolved>();
  for (const entry of resolved) {
    const entries = bySource.get(entry.target.sourcePath) ?? [];
    entries.push(entry);
    bySource.set(entry.target.sourcePath, entries);
  }
  for (const entries of bySource.values()) {
    const ordered = [...entries].sort((left, right) => left.target.element.sourceStart - right.target.element.sourceStart);
    for (let index = 0; index < ordered.length; index += 1) {
      const current = ordered[index].target.element;
      for (let candidateIndex = index + 1; candidateIndex < ordered.length; candidateIndex += 1) {
        const candidate = ordered[candidateIndex].target.element;
        if (candidate.sourceStart >= current.sourceEnd) break;
        throw new Error("One edit contains another selected edit. Keep either the larger selection or the smaller one, then apply the batch again.");
      }
    }
  }
}

async function assertResolvedSourcesCurrent(resolved: Array<{ draft: CourseEditDraft; target: ResolvedEditableTarget }>) {
  const expected = new Map<string, string>();
  for (const entry of resolved) {
    const prior = expected.get(entry.target.sourcePath);
    if (prior !== undefined && prior !== entry.target.source) throw new StaleCourseEditSourceError();
    expected.set(entry.target.sourcePath, entry.target.source);
  }
  for (const [sourcePath, source] of expected) {
    if (await readFile(sourcePath, "utf8") !== source) throw new StaleCourseEditSourceError();
  }
}

async function applyDirectEdits(
  resolved: Array<{ draft: CourseEditDraft; target: ResolvedEditableTarget }>,
  hooks: CourseEditExecutionHooks
) {
  const bySource = new Map<string, Array<{ draft: CourseEditDraft; target: ResolvedEditableTarget }>>();
  for (const entry of resolved) {
    const entries = bySource.get(entry.target.sourcePath) ?? [];
    entries.push(entry);
    bySource.set(entry.target.sourcePath, entries);
  }
  const prepared: Array<{ sourcePath: string; source: string; next: string; mode: number; temporary: string }> = [];
  try {
    for (const [sourcePath, entries] of bySource) {
      const source = entries[0].target.source;
      if (entries.some((entry) => entry.target.source !== source)) throw new StaleCourseEditSourceError();
      let next = source;
      const operations = [...entries].sort((left, right) => right.target.element.sourceStart - left.target.element.sourceStart);
      for (const { draft, target } of operations) next = applyPatchToEditableElement(next, target.element, draft.patch);
      if (operations.some(({ draft }) => Boolean(draft.patch.style))) next = ensureStudioEditStyles(next);
      const mode = (await lstat(sourcePath)).mode;
      const temporary = `${sourcePath}.studio-edit-${process.pid}-${Date.now()}-${prepared.length}`;
      await writeFile(temporary, next, "utf8");
      await chmod(temporary, mode);
      prepared.push({ sourcePath, source, next, mode, temporary });
    }
    await hooks.beforeDirectCommit?.();
    await assertResolvedSourcesCurrent(resolved);
    for (const entry of prepared) await rename(entry.temporary, entry.sourcePath);
  } finally {
    await Promise.all(prepared.map((entry) => rm(entry.temporary, { force: true })));
  }
  clearPreviewInspectionDocumentCache();
}

async function applyGeneratedEdits(
  projectSlug: string,
  resolved: Array<{ draft: CourseEditDraft; target: ResolvedEditableTarget }>,
  repoRoot: string
) {
  await assertResolvedSourcesCurrent(resolved);
  const stored = await loadCourseEditOverrides(repoRoot, projectSlug);
  const byId = new Map(stored.overrides.map((entry) => [entry.editId, entry]));
  const now = new Date().toISOString();
  for (const { draft, target } of resolved) {
    const editId = target.target.identity?.editId;
    if (!editId) throw new Error("Generated course edits require a stable edit identity.");
    const previous = byId.get(editId);
    byId.set(editId, {
      editId,
      htmlPath: draft.identity.htmlPath,
      tagName: target.element.tagName,
      pathKey: target.element.pathKey,
      patch: { ...(previous?.patch ?? {}), ...draft.patch, style: { ...(previous?.patch.style ?? {}), ...(draft.patch.style ?? {}) } },
      updatedAt: now
    } satisfies StoredCourseEditOverride);
  }
  const nextOverrides = [...byId.values()];
  for (const htmlPath of new Set(nextOverrides.map((entry) => entry.htmlPath))) {
    applyCourseEditOverridesToHtml({
      html: resolved[0].target.source,
      projectSlug,
      htmlPath,
      overrides: nextOverrides
    });
  }
  await assertResolvedSourcesCurrent(resolved);
  await saveCourseEditOverrides(repoRoot, { schemaVersion: 1, projectSlug, updatedAt: now, overrides: nextOverrides });
}

async function withProjectEditLock<T>(projectSlug: string, run: () => Promise<T>) {
  if (activeProjectEdits.has(projectSlug)) throw new Error("Another edit is already being applied to this course.");
  activeProjectEdits.add(projectSlug);
  try {
    return await run();
  } finally {
    activeProjectEdits.delete(projectSlug);
  }
}

export async function applyCourseEditBatch(
  request: CourseEditApplyRequest,
  repoRoot = defaultRepoRoot,
  hooks: CourseEditExecutionHooks = {}
): Promise<CourseEditBatchResult> {
  if (request.schemaVersion !== COURSE_EDIT_SCHEMA_VERSION) throw new Error("Unsupported Studio edit batch version.");
  return await withProjectEditLock(request.projectSlug, async () => {
    const resolved: Array<{ draft: CourseEditDraft; target: ResolvedEditableTarget }> = [];
    for (const draft of request.drafts) {
      const target = await resolveFromIdentity(draft.identity, repoRoot);
      resolved.push({ draft: sanitizeDraft(draft, target.target), target });
    }
    const adapter = resolved[0].target.target.identity?.adapter;
    const htmlPaths = [...new Set(resolved.map((entry) => entry.target.target.identity?.htmlPath).filter((value): value is string => Boolean(value)))];
    if (!adapter || htmlPaths.length === 0 || resolved.some((entry) => entry.target.target.identity?.adapter !== adapter)) {
      throw new Error("All drafts in one batch must belong to the same course and edit adapter.");
    }
    if (adapter !== "direct" && htmlPaths.length !== 1) {
      throw new Error("Generated-course edit batches must target their single generated course page.");
    }
    assertNonOverlappingTargets(resolved);
    const previousStatus = await getCourseEditStatus(request.projectSlug, repoRoot);
    const previousCheckpoint = await loadCheckpoint(request.projectSlug, repoRoot);
    const checkpointId = randomUUID();
    const snapshotPaths = adapter === "direct"
      ? [...new Set(resolved.map((entry) => entry.target.sourcePath))]
      : [];
    const snapshotDirectoryPaths = adapter === "direct"
      ? []
      : [
          path.join(repoRoot, "projects", request.projectSlug, "workspace"),
          path.join(repoRoot, "projects", request.projectSlug, "meta")
        ];
    const directoryTotal = { bytes: 0, files: 0 };
    const directories: SnapshotDirectory[] = [];
    try {
      for (const [index, directoryPath] of snapshotDirectoryPaths.entries()) {
        directories.push(await snapshotDirectory({
          repoRoot,
          projectSlug: request.projectSlug,
          checkpointId,
          directoryPath,
          index,
          total: directoryTotal
        }));
      }
    } catch (error) {
      await rm(checkpointBackupRoot(repoRoot, request.projectSlug, checkpointId), { recursive: true, force: true });
      throw error;
    }
    const checkpoint: CourseEditCheckpoint = {
      schemaVersion: CHECKPOINT_SCHEMA_VERSION,
      checkpointId,
      projectSlug: request.projectSlug,
      adapter,
      htmlPaths,
      createdAt: new Date().toISOString(),
      files: await Promise.all(snapshotPaths.map((filePath) => snapshotFile(repoRoot, filePath))),
      directories,
      previousStatus
    };
    await writeCheckpoint(checkpoint, repoRoot);

    try {
      if (adapter === "direct") {
        await applyDirectEdits(resolved, hooks);
      } else {
        await applyGeneratedEdits(request.projectSlug, resolved, repoRoot);
        await runRebuild(request.projectSlug, adapter, repoRoot);
        clearPreviewInspectionDocumentCache();
      }
      await runValidation(request.projectSlug, repoRoot);
    } catch (error) {
      const sourcesAlreadyChanged = error instanceof StaleCourseEditSourceError;
      if (!sourcesAlreadyChanged) {
        await restoreSnapshotDirectories(repoRoot, checkpoint.directories);
        await restoreSnapshotFiles(repoRoot, checkpoint.files);
      }
      if (previousCheckpoint) {
        await writeCheckpoint(previousCheckpoint, repoRoot);
      } else {
        await rm(checkpointPath(repoRoot, request.projectSlug), { force: true });
      }
      await rm(checkpointBackupRoot(repoRoot, request.projectSlug, checkpoint.checkpointId), { recursive: true, force: true });
      throw error;
    }

    if (previousCheckpoint && previousCheckpoint.checkpointId !== checkpoint.checkpointId) {
      await rm(checkpointBackupRoot(repoRoot, request.projectSlug, previousCheckpoint.checkpointId), { recursive: true, force: true });
    }

    const staleTargets = await staleExportTargets(request.projectSlug, repoRoot);
    const status: CourseEditStatus = {
      projectSlug: request.projectSlug,
      available: true,
      unavailableReason: "",
      canUndo: true,
      checkpointId: checkpoint.checkpointId,
      exportsOutOfDate: staleTargets.length > 0,
      staleExportTargets: staleTargets,
      lastAppliedAt: new Date().toISOString()
    };
    await saveCourseEditStatus(status, repoRoot);
    return {
      ...status,
      ok: true,
      appliedCount: request.drafts.length,
      message: `${request.drafts.length} ${request.drafts.length === 1 ? "change" : "changes"} applied and validated.`,
      warnings: staleTargets.length ? ["Existing export packages are out of date until you publish them again."] : []
    };
  });
}

export async function undoCourseEditBatch(projectSlug: string, repoRoot = defaultRepoRoot): Promise<CourseEditBatchResult> {
  return await withProjectEditLock(projectSlug, async () => {
    const checkpoint = await loadCheckpoint(projectSlug, repoRoot);
    if (!checkpoint) throw new Error("There is no applied Studio edit batch to undo.");
    const undoRecoveryId = `undo-${randomUUID()}`;
    const recoveryTotal = { bytes: 0, files: 0 };
    const recoveryDirectories: SnapshotDirectory[] = [];
    const recoveryDirectoryPaths = checkpoint.directories.map((directory) => (
      resolveCheckpointRelativePath(repoRoot, directory.repoRelativePath, "Undo recovery")
    ));
    try {
      for (const [index, directoryPath] of recoveryDirectoryPaths.entries()) {
        recoveryDirectories.push(await snapshotDirectory({
          repoRoot,
          projectSlug,
          checkpointId: undoRecoveryId,
          directoryPath,
          index,
          total: recoveryTotal
        }));
      }
    } catch (error) {
      await rm(checkpointBackupRoot(repoRoot, projectSlug, undoRecoveryId), { recursive: true, force: true });
      throw error;
    }
    const recoveryFiles = await Promise.all(checkpoint.files.map((file) => (
      snapshotFile(repoRoot, resolveCheckpointRelativePath(repoRoot, file.repoRelativePath, "Undo recovery"))
    )));
    try {
      await restoreSnapshotDirectories(repoRoot, checkpoint.directories);
      await restoreSnapshotFiles(repoRoot, checkpoint.files);
      await runValidation(projectSlug, repoRoot);
    } catch (error) {
      await restoreSnapshotDirectories(repoRoot, recoveryDirectories);
      await restoreSnapshotFiles(repoRoot, recoveryFiles);
      throw error;
    } finally {
      await rm(checkpointBackupRoot(repoRoot, projectSlug, undoRecoveryId), { recursive: true, force: true });
    }
    await rm(checkpointPath(repoRoot, projectSlug), { force: true });
    await rm(checkpointBackupRoot(repoRoot, projectSlug, checkpoint.checkpointId), { recursive: true, force: true });
    const staleTargets = await staleExportTargets(projectSlug, repoRoot);
    const status = {
      ...checkpoint.previousStatus,
      canUndo: false,
      checkpointId: null,
      exportsOutOfDate: staleTargets.length > 0,
      staleExportTargets: staleTargets
    };
    await saveCourseEditStatus(status, repoRoot);
    return {
      ...status,
      ok: true,
      appliedCount: 0,
      message: "The last Studio edit batch was undone and the course was validated.",
      warnings: staleTargets.length ? ["Existing export packages are out of date until you publish them again."] : []
    };
  });
}

const COMMAND_EXPORT_TARGETS: Record<string, string> = {
  export: "brightspace",
  package: "brightspace",
  scorm2004: "scorm",
  scorm12: "scorm",
  googleHosted: "google-hosted",
  appsScript: "apps-script",
  html: "html"
};

export async function markCourseExportCurrent(projectSlug: string, commandName: string, repoRoot = defaultRepoRoot) {
  const target = COMMAND_EXPORT_TARGETS[commandName];
  if (!target) return;
  const status = await getCourseEditStatus(projectSlug, repoRoot);
  const staleExportTargets = status.staleExportTargets.filter((entry) => entry !== target);
  await saveCourseEditStatus({
    ...status,
    exportsOutOfDate: staleExportTargets.length > 0,
    staleExportTargets
  }, repoRoot);
}
