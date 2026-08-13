import { spawn, type ChildProcess } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { chmod, copyFile, lstat, mkdir, readFile, readdir, realpath, rename, rm } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";

import {
  COURSE_EDIT_PAGE_MAP_MAX_ENTRIES,
  COURSE_EDIT_PAGE_MAP_SCHEMA_VERSION,
  COURSE_EDIT_SCHEMA_VERSION,
  type CourseEditAdapter,
  type CourseEditApplyRequest,
  type CourseEditBatchResult,
  type CourseEditDraft,
  type CourseEditMapAction,
  type CourseEditPageMap,
  type CourseEditPageMapEntry,
  type CourseEditResolveRequest,
  type CourseEditStylePatch,
  type CourseEditStatus,
  type CourseEditTarget,
  type CourseEditTargetIdentity
} from "../../shared/course-editing.js";
import { inspectCourseAuthoringProject, type ResolvedCourseAuthoringProject } from "../../../scripts/lib/course-authoring/context.js";
import {
  applyPatchToEditableElement,
  collectEditableHtmlElements,
  courseEditElementDigest,
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
  applyStoredCourseEdits,
  applyStoredCourseTitleToHtml,
  applyStoredCourseTitleToRuntimeData,
  courseEditOverridesPath,
  loadCourseEditOverrides,
  loadStoredStudioCourse,
  saveCourseEditOverrides,
  saveStoredStudioCourse,
  studioCoursePath,
  type StoredCourseEditOverride
} from "../../../scripts/lib/course-editing/overrides.js";
import { repoRoot as defaultRepoRoot } from "../../../scripts/lib/paths.js";
import { loadProjectManifest } from "../../../scripts/lib/projects.js";
import type { ProjectManifest } from "../../../scripts/lib/types.js";
import {
  recordCourseExportEvidence,
  staleCourseExportTargets,
  type CourseExportEvidenceTarget
} from "../../../scripts/lib/course-editing/export-freshness.js";
import {
  clearPreviewInspectionDocumentCache,
  isPreviewInspectionNodeId,
  loadPreviewInspectionDocument,
  type PreviewInspectionDocument
} from "./preview-inspection";
import { isPathInside } from "./validation";
import {
  courseEditFingerprintsMatch,
  classifyCourseEditBoundary,
  durableAtomicWrite,
  fingerprintCourseEditPath,
  fingerprintCourseEditPaths,
  readCourseEditJournal,
  removeCourseEditJournal,
  withCourseEditFileLock,
  writeCourseEditJournal,
  type CourseEditPathFingerprint,
  type CourseEditTransactionJournal
} from "./course-edit-transaction";
import { validateCourseEditImage } from "./course-edit-image";
import {
  renderCheckForPatch,
  validateRenderedCourseEdits,
  type CourseEditRenderCheck
} from "./course-edit-render-validation";

const CHECKPOINT_SCHEMA_VERSION = 3;
const MAX_CHECKPOINT_FILE_BYTES = 10 * 1024 * 1024;
const MAX_CHECKPOINT_DIRECTORY_BYTES = 512 * 1024 * 1024;
const MAX_CHECKPOINT_DIRECTORY_FILES = 20_000;
const MAX_COMMAND_OUTPUT = 12_000;
const COMMAND_TIMEOUT_MS = 6 * 60 * 1_000;
const MAX_EXACT_RUNTIME_TEXT_CODE_UNITS = 280;

class StaleCourseEditSourceError extends Error {
  readonly studioWrites: boolean;

  constructor(
    message = "The course changed while Studio prepared this batch. Reload it and select the element again.",
    studioWrites = false
  ) {
    super(message);
    this.name = "StaleCourseEditSourceError";
    this.studioWrites = studioWrites;
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
  previousCheckpointId: string | null;
  expectedBefore: CourseEditPathFingerprint[];
  expectedAfter: CourseEditPathFingerprint[];
  renderBefore: CourseEditRenderCheck[];
  renderAfter: CourseEditRenderCheck[];
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
  validateRendered?: typeof validateRenderedCourseEdits;
};

function trimOutput(value: string) {
  return value.length <= MAX_COMMAND_OUTPUT ? value : `...<truncated>\n${value.slice(-MAX_COMMAND_OUTPUT)}`;
}

function normalizedCourseEditText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function renderedTextFingerprint(value: string) {
  const text = normalizedCourseEditText(value).slice(0, 24_000);
  return shortRenderedFingerprint(text);
}

function shortRenderedFingerprint(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function renderedAttributeFingerprint(attributes: { href: string; src: string; alt: string; title: string }) {
  return shortRenderedFingerprint([attributes.href, attributes.src, attributes.alt, attributes.title].join("\u0000"));
}

function decodedElementAttributes(source: string, element: EditableHtmlElement) {
  const fragment = load(`<body>${source.slice(element.sourceStart, element.openEnd + 1)}</body>`);
  const selected = fragment("body").children().first();
  return {
    href: selected.attr("href") ?? "",
    src: selected.attr("src") ?? "",
    alt: selected.attr("alt") ?? "",
    title: selected.attr("title") ?? ""
  };
}

function hash24(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 24);
}

function adapterForProject(project: ResolvedCourseAuthoringProject): CourseEditAdapter | null {
  if (project.driverSource !== "declared" || !project.studioEditing.enabled) return null;
  if (project.driverId === "direct-workspace-v1" && project.authoringMode === "direct") return "direct";
  if (project.driverId === "english-factory-v1" && project.authoringMode === "factory") return "english-factory";
  if (project.driverId === "social-related-issues-v1" && project.authoringMode === "factory") return "social-related-issues";
  if (project.driverId === "legacy-snapshot-v1" && project.authoringMode === "factory") return "legacy-snapshot";
  return null;
}

function emptyCapabilities() {
  return { richText: false, link: false, image: false, styles: false, styleKeys: [] };
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
  elementDigest: string;
  editId: string | null;
  tagName: string;
  adapter: CourseEditAdapter;
}): CourseEditTargetIdentity {
  return {
    targetId: hash24([input.projectSlug, input.htmlPath, input.editId ?? input.elementDigest, input.tagName, input.adapter].join("\u0000")),
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
      reason: report.project.driverSource !== "declared" || !report.project.studioEditing.enabled
        ? "This course has not been explicitly onboarded for Studio editing. You can still annotate it for Codex."
        : "This course does not yet have a safe direct-edit adapter. You can still annotate it for Codex."
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
  if (!document) throw new Error("Studio can no longer inspect this course page safely.");
  const { project, adapter, reason } = await resolveCourseProject(identity.projectSlug, repoRoot);
  if (!project || !adapter || adapter !== identity.adapter) throw new Error(reason || "The course edit adapter changed.");
  if (adapter === "direct") {
    const repoRelative = path.relative(repoRoot, sourcePath).split(path.sep).join("/");
    if (!project.editableSources.some((entry) => entry.kind === "file" && entry.repoRelative === repoRelative)) {
      throw new Error("This workspace page is no longer a declared canonical editable source.");
    }
  } else if (adapter !== "legacy-snapshot" && identity.htmlPath !== "index.html") {
    throw new Error("Generated course edits are available only on the generated course entry page.");
  } else if (adapter === "legacy-snapshot") {
    const repoRelative = path.relative(repoRoot, sourcePath).split(path.sep).join("/");
    if (!project.canonicalSources.some((entry) => entry.kind === "file" && entry.repoRelative === repoRelative)) {
      throw new Error("This legacy snapshot page is not a declared preserved source.");
    }
  }
  const elements = collectEditableHtmlElements(document.source, identity.projectSlug, identity.htmlPath);
  if (!elements) throw new Error("Studio can no longer map editable elements on this page.");
  const element = identity.editId
    ? elements.find((candidate) => candidate.editId === identity.editId && candidate.tagName === identity.tagName)
    : null;
  if (!element) throw new Error("The selected content no longer has the same stable edit identity.");
  if (!element.replaySafe) {
    throw new Error("Repeated content needs a durable data-canvas-helper-edit-key before Studio can target an edit safely.");
  }
  if (courseEditElementDigest(document.source, element) !== identity.elementDigest) {
    throw new Error("This selected element changed after the draft was created. Reopen or relink this draft before applying it.");
  }
  const currentNode = [...document.nodeLocations.entries()].find(([, location]) => (
    location.sourceStart === element.sourceStart && location.tagName === element.tagName
  ));
  if (!currentNode) throw new Error("The selected content is no longer inspectable on this page.");
  const expected = targetIdentity({
    projectSlug: identity.projectSlug,
    htmlPath: identity.htmlPath,
    nodeId: currentNode[0],
    sourceDigest: document.sourceDigest,
    elementDigest: courseEditElementDigest(document.source, element),
    editId: element.editId,
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

function unavailablePageMap(projectSlug: string, htmlPath: string, sourceDigest: string, reason: string): CourseEditPageMap {
  return {
    schemaVersion: COURSE_EDIT_PAGE_MAP_SCHEMA_VERSION,
    projectSlug,
    htmlPath,
    sourceDigest,
    available: false,
    reason,
    entries: [],
    editableCount: 0,
    annotationOnlyCount: 0,
    truncated: false
  };
}

function pageMapAction(tagName: string, capabilities: ReturnType<typeof courseEditCapabilitiesForTag>): CourseEditMapAction {
  if (capabilities.image) return "replace-image";
  if (capabilities.link) return "edit-link";
  if (capabilities.richText) return "edit-text";
  if (capabilities.styles) return "style-text";
  return "annotation-only";
}

function pageMapLabel(action: CourseEditMapAction) {
  if (action === "replace-image") return "Replace image";
  if (action === "edit-link") return "Edit link";
  if (action === "style-text") return "Style text";
  if (action === "rename-course") return "Rename course";
  if (action === "annotation-only") return "Annotation only";
  return "Edit text";
}

/**
 * Builds the informational map embedded into an isolated preview. The map is
 * never write authority: every click and every apply still resolves against
 * the current source and project policy again.
 */
export async function resolveCourseEditPageMap(
  projectSlug: string,
  htmlPath: string,
  document: PreviewInspectionDocument,
  repoRoot = defaultRepoRoot
): Promise<CourseEditPageMap> {
  const { project, adapter, reason } = await resolveCourseProject(projectSlug, repoRoot);
  if (!project || !adapter) return unavailablePageMap(projectSlug, htmlPath, document.sourceDigest, reason);

  if (adapter === "direct") {
    const repoRelative = `projects/${projectSlug}/workspace/${htmlPath}`;
    if (!project.editableSources.some((entry) => entry.kind === "file" && entry.repoRelative === repoRelative)) {
      return unavailablePageMap(
        projectSlug,
        htmlPath,
        document.sourceDigest,
        "This page is not a declared canonical editable source."
      );
    }
  } else if (adapter !== "legacy-snapshot" && htmlPath !== "index.html") {
    return unavailablePageMap(
      projectSlug,
      htmlPath,
      document.sourceDigest,
      "Generated course edits are available only on the generated course entry page."
    );
  } else if (adapter === "legacy-snapshot") {
    const repoRelative = `projects/${projectSlug}/workspace/${htmlPath}`;
    if (!project.canonicalSources.some((entry) => entry.kind === "file" && entry.repoRelative === repoRelative)) {
      return unavailablePageMap(projectSlug, htmlPath, document.sourceDigest, "This snapshot page is not a declared canonical source.");
    }
  }

  const editableElements = collectEditableHtmlElements(document.source, projectSlug, htmlPath);
  if (!editableElements) {
    return unavailablePageMap(
      projectSlug,
      htmlPath,
      document.sourceDigest,
      "Studio could not establish stable editable regions for this page."
    );
  }

  const elementsByLocation = new Map(
    editableElements.map((element) => [`${element.sourceStart}\u0000${element.tagName}`, element] as const)
  );
  const entries: CourseEditPageMapEntry[] = [];
  let editableCount = 0;
  let annotationOnlyCount = 0;
  const orderedLocations = [...document.nodeLocations.entries()].sort((left, right) => left[1].ordinal - right[1].ordinal);

  for (const [nodeId, location] of orderedLocations) {
    const element = elementsByLocation.get(`${location.sourceStart}\u0000${location.tagName}`);
    if (!element) continue;
    const originalHtml = document.source.slice(element.innerStart, element.innerEnd);
    const titleOwner = Object.hasOwn(element.attributes, "data-canvas-helper-course-title");
    const baseCapabilities = courseEditCapabilitiesForTag(element.tagName);
    const capabilities = {
      ...baseCapabilities,
      richText: baseCapabilities.richText && isSafeCourseEditRichTextSource(originalHtml)
    };
    const replayUnsafe = !element.replaySafe;
    const action = titleOwner ? "rename-course" : replayUnsafe ? "annotation-only" : pageMapAction(element.tagName, capabilities);
    const annotationOnly = action === "annotation-only";
    const sourceText = normalizedCourseEditText(htmlText(originalHtml)).slice(0, 24_000);
    const attributes = decodedElementAttributes(document.source, element);
    const entry: CourseEditPageMapEntry = {
      nodeId,
      tagName: element.tagName,
      action,
      label: pageMapLabel(action),
      reason: titleOwner
        ? "Use Rename course so every title location stays synchronized."
        : replayUnsafe
          ? "Repeated content needs a durable data-canvas-helper-edit-key in its canonical source before Studio can target edits safely."
          : annotationOnly
          ? "This element contains complex course structure and remains annotation-only."
          : capabilities.richText
            ? "Ready to edit."
            : "Studio can change this element without rewriting its complex inner structure.",
      expected: annotationOnly || titleOwner
        ? null
        : {
            textFingerprint: renderedTextFingerprint(sourceText),
            textLength: sourceText.length,
            attributeFingerprint: renderedAttributeFingerprint(attributes)
          }
    };
    if (annotationOnly) annotationOnlyCount += 1;
    else editableCount += 1;
    if (entries.length < COURSE_EDIT_PAGE_MAP_MAX_ENTRIES) entries.push(entry);
  }

  return {
    schemaVersion: COURSE_EDIT_PAGE_MAP_SCHEMA_VERSION,
    projectSlug,
    htmlPath,
    sourceDigest: document.sourceDigest,
    available: true,
    reason: entries.length
      ? "Editable regions are mapped from the current canonical course source."
      : "No supported text, link, image, or course-title regions were found on this page.",
    entries,
    editableCount,
    annotationOnlyCount,
    truncated: editableCount + annotationOnlyCount > entries.length
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
  } else if (adapter !== "legacy-snapshot" && htmlPath !== "index.html") {
    return unsupportedTarget("Generated course edits are available only on the generated course entry page.");
  } else if (adapter === "legacy-snapshot") {
    const repoRelative = path.relative(repoRoot, sourcePath).split(path.sep).join("/");
    if (!project.canonicalSources.some((entry) => entry.kind === "file" && entry.repoRelative === repoRelative)) {
      return unsupportedTarget("This legacy snapshot page is not a declared preserved source.");
    }
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
  if (!element.replaySafe) {
    return unsupportedTarget(
      "This repeated element needs a durable data-canvas-helper-edit-key in its canonical source before Studio can edit it safely."
    );
  }
  if (Object.hasOwn(element.attributes, "data-canvas-helper-course-title")) {
    return unsupportedTarget("Use Rename course so Studio can update every course title location together.");
  }
  const originalHtml = document.source.slice(element.innerStart, element.innerEnd);
  const sourceText = normalizedCourseEditText(htmlText(originalHtml));
  const visibleText = normalizedCourseEditText(request.selection.visibleText);
  const rendered = request.selection.rendered;
  const sourceAttributes = decodedElementAttributes(document.source, element);
  const runtimeOwned = rendered
    ? (
        rendered.textLength !== sourceText.slice(0, 24_000).length ||
        rendered.textFingerprint !== renderedTextFingerprint(sourceText) ||
        (["href", "src", "alt", "title"] as const).some((name) => rendered.attributes[name] !== sourceAttributes[name])
      )
    : (
        sourceText.length <= MAX_EXACT_RUNTIME_TEXT_CODE_UNITS &&
        visibleText.length <= MAX_EXACT_RUNTIME_TEXT_CODE_UNITS &&
        sourceText !== visibleText
      );
  if (runtimeOwned) {
    return unsupportedTarget(
      "This element is being replaced by course code after the page loads, so editing its HTML would not change what learners see. Annotate it for Codex until its runtime source is mapped."
    );
  }
  const identity = targetIdentity({
    projectSlug: request.projectSlug,
    htmlPath,
    nodeId: request.selection.nodeId,
    sourceDigest: document.sourceDigest,
    elementDigest: courseEditElementDigest(document.source, element),
    editId: element.editId,
    tagName: element.tagName,
    adapter
  });
  return buildEditableTarget({
    identity,
    element,
    originalHtml
  });
}

function sanitizeDraft(draft: CourseEditDraft, target: CourseEditTarget) {
  if (!target.identity) throw new Error("The edit target is no longer available.");
  const patch = { ...draft.patch };
  if (patch.html !== undefined) {
    if (!target.capabilities.richText) throw new Error("This element does not support rich-text changes.");
    patch.html = sanitizeCourseEditRichText(patch.html);
    if (patch.html === sanitizeCourseEditRichText(target.originalHtml)) delete patch.html;
  }
  if (patch.href !== undefined) {
    if (!target.capabilities.link) throw new Error("This element is not an editable link.");
    patch.href = patch.href === null ? null : sanitizeCourseEditUrl(patch.href, "href");
    if ((patch.href ?? "") === target.attributes.href) delete patch.href;
  }
  if (patch.src !== undefined) {
    if (!target.capabilities.image) throw new Error("This element is not an editable image.");
    patch.src = patch.src === null ? null : sanitizeCourseEditUrl(patch.src, "src");
    if ((patch.src ?? "") === target.attributes.src) delete patch.src;
  }
  if (patch.alt !== undefined) {
    if (!target.capabilities.image) throw new Error("Only images support alt text.");
    patch.alt = patch.alt === null ? null : sanitizeCourseEditPlainText(patch.alt);
    if ((patch.alt ?? "") === target.attributes.alt) delete patch.alt;
  }
  if (patch.title !== undefined) {
    patch.title = patch.title === null ? null : sanitizeCourseEditPlainText(patch.title);
    if ((patch.title ?? "") === target.attributes.title) delete patch.title;
  }
  if (patch.style) {
    if (!target.capabilities.styles) throw new Error("This element does not support Studio style controls.");
    const style: CourseEditStylePatch = {};
    for (const [key, value] of Object.entries(patch.style) as Array<[keyof CourseEditStylePatch, CourseEditStylePatch[keyof CourseEditStylePatch]]>) {
      if (!target.capabilities.styleKeys.includes(key)) {
        throw new Error(`The ${key} control is not safe for this kind of course element.`);
      }
      if (value !== undefined && value !== target.currentStyle[key]) Object.assign(style, { [key]: value });
    }
    if (Object.keys(style).length) patch.style = style;
    else delete patch.style;
  }
  if (!Object.keys(patch).length) throw new Error("This draft does not contain an actual change.");
  return { ...draft, patch };
}

async function atomicWrite(filePath: string, content: string | Uint8Array, mode?: number | null) {
  await durableAtomicWrite(filePath, content, typeof mode === "number" ? mode : undefined);
}

function terminateCommandTree(child: ChildProcess) {
  if (!child.pid) return null;
  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      windowsHide: true,
      shell: false
    });
    killer.unref();
    return null;
  }
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
  const force = setTimeout(() => {
    try {
      process.kill(-child.pid!, "SIGKILL");
    } catch {
      child.kill("SIGKILL");
    }
  }, 2_000);
  force.unref();
  return force;
}

async function runCommand(args: string[], repoRoot: string): Promise<CommandResult> {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "npm.cmd" : "npm";
  return await new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      detached: !isWindows,
      windowsHide: true
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    let forceKillTimer: NodeJS.Timeout | null = null;
    const timer = setTimeout(() => {
      if (settled) return;
      forceKillTimer = terminateCommandTree(child);
      stderr += "\nCommand exceeded the Studio edit deadline.";
    }, COMMAND_TIMEOUT_MS);
    const finish = (exitCode: number) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (forceKillTimer) clearTimeout(forceKillTimer);
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

async function currentCourseTitle(projectSlug: string, manifest: ProjectManifest, repoRoot: string) {
  const stored = await loadStoredStudioCourse(repoRoot, projectSlug);
  if (stored?.title.trim()) return stored.title.trim();
  if (manifest.title?.trim()) return manifest.title.trim();
  try {
    const source = await readFile(path.join(repoRoot, "projects", projectSlug, "workspace", "index.html"), "utf8");
    const $ = load(source);
    const declared = $("body [data-canvas-helper-course-title]").first().text().replace(/\s+/g, " ").trim()
      || $(`[data-canvas-helper-course-title]`).first().text().replace(/\s+/g, " ").trim();
    if (declared) return declared;
    const documentTitle = $("title").first().text().replace(/\s+/g, " ").trim();
    if (documentTitle) return documentTitle;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return projectSlug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.length <= 3 ? part.toUpperCase() : `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

async function rebuildArgs(projectSlug: string, adapter: CourseEditAdapter, repoRoot: string) {
  if (adapter === "english-factory") return ["run", "build:english-unit", "--", "--project", projectSlug];
  if (adapter === "legacy-snapshot") return null;
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

async function materializeLegacySnapshot(projectSlug: string, repoRoot: string) {
  const workspaceDir = path.join(repoRoot, "projects", projectSlug, "workspace");
  const [stored, course] = await Promise.all([
    loadCourseEditOverrides(repoRoot, projectSlug),
    loadStoredStudioCourse(repoRoot, projectSlug)
  ]);
  const htmlPaths = new Set(stored.overrides.map((entry) => entry.htmlPath));
  if (course) htmlPaths.add("index.html");
  for (const htmlPath of htmlPaths) {
    const entryPath = await resolveEditWorkspacePath(projectSlug, htmlPath, repoRoot);
    const source = await readFile(entryPath, "utf8");
    const next = await applyStoredCourseEdits({ repoRoot, projectSlug, html: source, htmlPath, workspaceDir });
    if (next !== source) await atomicWrite(entryPath, next, (await lstat(entryPath)).mode);
  }
}

async function runRebuild(projectSlug: string, adapter: CourseEditAdapter, repoRoot: string) {
  if (adapter === "legacy-snapshot") {
    await materializeLegacySnapshot(projectSlug, repoRoot);
    return;
  }
  const args = await rebuildArgs(projectSlug, adapter, repoRoot);
  if (!args) return;
  const result = await runCommand(args, repoRoot);
  if (!result.ok) throw new Error(`The course rebuild failed.\n${result.stderr || result.stdout}`);
}

function generatedWriteSetDirectories(projectSlug: string, adapter: CourseEditAdapter, repoRoot: string) {
  if (adapter === "legacy-snapshot") return [];
  const projectRoot = path.join(repoRoot, "projects", projectSlug);
  const directories = [
    path.join(projectRoot, "workspace"),
    path.join(projectRoot, "meta")
  ];
  if (adapter === "english-factory") {
    const resourceRoot = path.join(repoRoot, "projects", "resources", projectSlug);
    directories.push(
      path.join(resourceRoot, "teacher"),
      path.join(resourceRoot, "_extracted")
    );
  }
  return directories;
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

function checkpointVersionPath(repoRoot: string, projectSlug: string, checkpointId: string) {
  return path.join(checkpointBackupRoot(repoRoot, projectSlug, checkpointId), "checkpoint.json");
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

type RestoreTreeEntry = {
  absolutePath: string;
  relativePath: string;
  kind: "file" | "directory";
  mode: number;
};

async function collectRestoreTree(root: string) {
  const entries: RestoreTreeEntry[] = [];
  const visit = async (directoryPath: string, relativeDirectory: string): Promise<void> => {
    const children = await readdir(directoryPath, { withFileTypes: true });
    for (const child of children) {
      const absolutePath = path.join(directoryPath, child.name);
      const relativePath = relativeDirectory ? `${relativeDirectory}/${child.name}` : child.name;
      const stats = await lstat(absolutePath);
      if (stats.isSymbolicLink()) throw new Error("Checkpoint restore does not follow symbolic links.");
      if (stats.isDirectory()) {
        entries.push({ absolutePath, relativePath, kind: "directory", mode: stats.mode });
        await visit(absolutePath, relativePath);
      } else if (stats.isFile()) {
        entries.push({ absolutePath, relativePath, kind: "file", mode: stats.mode });
      } else {
        throw new Error("Checkpoint restore supports only regular files and directories.");
      }
    }
  };
  await visit(root, "");
  return entries;
}

function pathDepth(relativePath: string) {
  return relativePath.split("/").length;
}

export async function restoreCheckpointDirectoryInPlace(backup: string, target: string) {
  const backupStats = await lstat(backup);
  if (!backupStats.isDirectory() || backupStats.isSymbolicLink()) {
    throw new Error("Checkpoint backup is not a safe directory.");
  }
  try {
    const targetStats = await lstat(target);
    if (!targetStats.isDirectory() || targetStats.isSymbolicLink()) {
      throw new Error("Checkpoint target is not a safe directory.");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await mkdir(target, { recursive: true });
  }

  const [backupEntries, targetEntries] = await Promise.all([
    collectRestoreTree(backup),
    collectRestoreTree(target)
  ]);
  const backupByPath = new Map(backupEntries.map((entry) => [entry.relativePath, entry]));
  const extras = targetEntries
    .filter((entry) => {
      const expected = backupByPath.get(entry.relativePath);
      return !expected || expected.kind !== entry.kind;
    })
    .sort((left, right) => pathDepth(right.relativePath) - pathDepth(left.relativePath));
  for (const entry of extras) {
    await rm(entry.absolutePath, { recursive: entry.kind === "directory", force: true });
  }

  for (const entry of backupEntries
    .filter((candidate) => candidate.kind === "directory")
    .sort((left, right) => pathDepth(left.relativePath) - pathDepth(right.relativePath))) {
    const destination = path.join(target, ...entry.relativePath.split("/"));
    await mkdir(destination, { recursive: true });
    await chmod(destination, entry.mode);
  }
  for (const entry of backupEntries.filter((candidate) => candidate.kind === "file")) {
    const destination = path.join(target, ...entry.relativePath.split("/"));
    await atomicWrite(destination, await readFile(entry.absolutePath), entry.mode);
  }
  await chmod(target, backupStats.mode);
}

async function restoreSnapshotDirectories(repoRoot: string, directories: SnapshotDirectory[]) {
  for (const directory of directories) {
    const target = resolveCheckpointRelativePath(repoRoot, directory.repoRelativePath, "Checkpoint restore");
    if (!directory.existed) {
      await rm(target, { recursive: true, force: true });
      continue;
    }
    const backup = resolveCheckpointRelativePath(repoRoot, directory.backupRelativePath, "Checkpoint backup");
    await restoreCheckpointDirectoryInPlace(backup, target);
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
    await atomicWrite(target, content, file.mode);
  }
  clearPreviewInspectionDocumentCache();
}

async function writeCheckpoint(checkpoint: CourseEditCheckpoint, repoRoot: string) {
  const target = checkpointPath(repoRoot, checkpoint.projectSlug);
  const versionTarget = checkpointVersionPath(repoRoot, checkpoint.projectSlug, checkpoint.checkpointId);
  await Promise.all([
    mkdir(path.dirname(target), { recursive: true }),
    mkdir(path.dirname(versionTarget), { recursive: true })
  ]);
  const serialized = `${JSON.stringify(checkpoint, null, 2)}\n`;
  await atomicWrite(versionTarget, serialized);
  await atomicWrite(target, serialized);
}

function upgradeCourseEditCheckpoint(value: unknown, projectSlug: string): CourseEditCheckpoint | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const parsed = value as Omit<Partial<CourseEditCheckpoint>, "schemaVersion"> & { schemaVersion?: number };
  if (
    (parsed.schemaVersion !== 2 && parsed.schemaVersion !== CHECKPOINT_SCHEMA_VERSION) ||
    parsed.projectSlug !== projectSlug ||
    typeof parsed.previousCheckpointId === "undefined" ||
    !Array.isArray(parsed.files) ||
    !Array.isArray(parsed.directories) ||
    !Array.isArray(parsed.htmlPaths) ||
    !Array.isArray(parsed.expectedBefore) ||
    !Array.isArray(parsed.expectedAfter)
  ) return null;
  return {
    ...(parsed as CourseEditCheckpoint),
    schemaVersion: CHECKPOINT_SCHEMA_VERSION,
    renderBefore: Array.isArray(parsed.renderBefore) ? parsed.renderBefore : [],
    renderAfter: Array.isArray(parsed.renderAfter) ? parsed.renderAfter : []
  };
}

function isCourseEditCheckpoint(parsed: CourseEditCheckpoint, projectSlug: string) {
  return (
    parsed.schemaVersion === CHECKPOINT_SCHEMA_VERSION &&
    parsed.projectSlug === projectSlug &&
    typeof parsed.previousCheckpointId !== "undefined" &&
    Array.isArray(parsed.files) &&
    Array.isArray(parsed.directories) &&
    Array.isArray(parsed.htmlPaths) &&
    Array.isArray(parsed.expectedBefore) &&
    Array.isArray(parsed.expectedAfter) &&
    Array.isArray(parsed.renderBefore) &&
    Array.isArray(parsed.renderAfter)
  );
}

async function loadCheckpointAt(filePath: string, projectSlug: string): Promise<CourseEditCheckpoint | null> {
  try {
    const parsed = upgradeCourseEditCheckpoint(JSON.parse(await readFile(filePath, "utf8")), projectSlug);
    if (!parsed || !isCourseEditCheckpoint(parsed, projectSlug)) {
      throw new Error("The latest Studio edit checkpoint is invalid.");
    }
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function loadCheckpoint(projectSlug: string, repoRoot: string): Promise<CourseEditCheckpoint | null> {
  return await loadCheckpointAt(checkpointPath(repoRoot, projectSlug), projectSlug);
}

async function loadCheckpointVersion(projectSlug: string, checkpointId: string, repoRoot: string) {
  return await loadCheckpointAt(checkpointVersionPath(repoRoot, projectSlug, checkpointId), projectSlug);
}

function checkpointBoundaryPaths(checkpoint: CourseEditCheckpoint, repoRoot: string) {
  return [
    ...checkpoint.files.map((file) => resolveCheckpointRelativePath(repoRoot, file.repoRelativePath, "Checkpoint fingerprint")),
    ...checkpoint.directories.map((directory) => resolveCheckpointRelativePath(repoRoot, directory.repoRelativePath, "Checkpoint fingerprint"))
  ];
}

async function fingerprintCheckpointBoundary(checkpoint: CourseEditCheckpoint, repoRoot: string) {
  return await fingerprintCourseEditPaths(repoRoot, checkpointBoundaryPaths(checkpoint, repoRoot));
}

async function checkpointMatchesExpectedPost(checkpoint: CourseEditCheckpoint, repoRoot: string) {
  if (!checkpoint.expectedAfter.length) return false;
  return courseEditFingerprintsMatch(checkpoint.expectedAfter, await fingerprintCheckpointBoundary(checkpoint, repoRoot));
}

export async function getCourseEditStatus(projectSlug: string, repoRoot = defaultRepoRoot): Promise<CourseEditStatus> {
  let stored: Partial<CourseEditStatus> = {};
  try {
    stored = JSON.parse(await readFile(statusPath(repoRoot, projectSlug), "utf8")) as Partial<CourseEditStatus>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const checkpoint = await loadCheckpoint(projectSlug, repoRoot);
  const journal = await readCourseEditJournal(projectSlug, repoRoot);
  const checkpointCurrent = checkpoint ? await checkpointMatchesExpectedPost(checkpoint, repoRoot) : false;
  const availability = await resolveCourseProject(projectSlug, repoRoot);
  const manifest = availability.project ? await projectManifest(projectSlug, repoRoot) : null;
  const courseTitle = manifest ? await currentCourseTitle(projectSlug, manifest, repoRoot) : "";
  const staleTargets = manifest ? await staleExportTargets(projectSlug, repoRoot, manifest) : [];
  const interruptedReason = journal
    ? "Studio found an interrupted course edit transaction. The next apply or undo will recover it before making another change."
    : "";
  const undoUnavailableReason = journal
    ? "Undo is paused until the interrupted transaction is recovered."
    : checkpoint && !checkpointCurrent
      ? "Undo is unavailable because the course changed after this Studio batch. Reload and review the newer work instead of restoring over it."
      : checkpoint
        ? ""
        : "There is no applied Studio edit batch to undo.";
  return {
    projectSlug,
    available: Boolean(availability.project && availability.adapter && !journal),
    unavailableReason: interruptedReason || availability.reason,
    courseTitle,
    canRenameCourse: Boolean(availability.project?.studioEditing.renameCourse && availability.adapter && !journal),
    canUploadImages: Boolean(availability.project?.studioEditing.imageAssets && availability.adapter && !journal),
    canUndo: Boolean(checkpoint && checkpointCurrent && !journal),
    undoUnavailableReason,
    checkpointId: checkpoint?.checkpointId ?? null,
    exportsOutOfDate: staleTargets.length > 0,
    staleExportTargets: staleTargets,
    lastAppliedAt: typeof stored.lastAppliedAt === "string" ? stored.lastAppliedAt : null
  };
}

async function saveCourseEditStatus(status: CourseEditStatus, repoRoot: string) {
  const target = statusPath(repoRoot, status.projectSlug);
  await mkdir(path.dirname(target), { recursive: true });
  await atomicWrite(target, `${JSON.stringify(status, null, 2)}\n`);
}

function declaredEvidenceTargets(manifest: ProjectManifest) {
  const targets = new Set<CourseExportEvidenceTarget>();
  for (const entry of manifest.exportTargets ?? []) {
    if (entry.enabled === false) continue;
    if (entry.target === "scorm") {
      targets.add("scorm2004");
      targets.add("scorm12");
    } else if (entry.target === "brightspace") {
      targets.add("brightspace");
      targets.add("brightspace-package");
    } else if (["google-hosted", "apps-script", "html"].includes(entry.target)) {
      targets.add(entry.target as CourseExportEvidenceTarget);
    }
  }
  return [...targets];
}

async function staleExportTargets(projectSlug: string, repoRoot: string, manifest?: ProjectManifest) {
  const declared = declaredEvidenceTargets(manifest ?? await projectManifest(projectSlug, repoRoot));
  return await staleCourseExportTargets({ repoRoot, projectSlug, targets: declared });
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
  hooks: CourseEditExecutionHooks,
  repoRoot: string,
  onPrepared: (expectedAfter: CourseEditPathFingerprint[]) => Promise<void>
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
      for (const { draft, target } of operations) {
        next = applyPatchToEditableElement(next, target.element, draft.patch, target.element.editId);
      }
      if (operations.some(({ draft }) => Boolean(draft.patch.style))) next = ensureStudioEditStyles(next);
      const mode = (await lstat(sourcePath)).mode;
      const temporary = `${sourcePath}.studio-edit-${process.pid}-${Date.now()}-${prepared.length}`;
      await durableAtomicWrite(temporary, next, mode);
      prepared.push({ sourcePath, source, next, mode, temporary });
    }
    const expectedAfter = await Promise.all(prepared.map(async (entry) => ({
      ...await fingerprintCourseEditPath(repoRoot, entry.temporary),
      repoRelativePath: path.relative(repoRoot, entry.sourcePath).split(path.sep).join("/")
    })));
    await onPrepared(expectedAfter);
    await hooks.beforeDirectCommit?.();
    await assertResolvedSourcesCurrent(resolved);
    let published = 0;
    for (const entry of prepared) {
      if (await readFile(entry.sourcePath, "utf8") !== entry.source) throw new StaleCourseEditSourceError(undefined, published > 0);
      await rename(entry.temporary, entry.sourcePath);
      published += 1;
    }
  } finally {
    await Promise.all(prepared.map((entry) => rm(entry.temporary, { force: true })));
  }
  clearPreviewInspectionDocumentCache();
}

async function applyGeneratedEdits(
  projectSlug: string,
  resolved: Array<{ draft: CourseEditDraft; target: ResolvedEditableTarget }>,
  repoRoot: string,
  onOverridesSaved?: () => Promise<void>
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
    const selectedPage = resolved.find((entry) => entry.draft.identity.htmlPath === htmlPath)?.target;
    const source = selectedPage?.source ?? await readFile(
      await resolveEditWorkspacePath(projectSlug, htmlPath, repoRoot),
      "utf8"
    );
    applyCourseEditOverridesToHtml({
      html: source,
      projectSlug,
      htmlPath,
      overrides: nextOverrides
    });
  }
  await assertResolvedSourcesCurrent(resolved);
  await saveCourseEditOverrides(repoRoot, { schemaVersion: 1, projectSlug, updatedAt: now, overrides: nextOverrides });
  await onOverridesSaved?.();
}

async function restorePriorUndoCheckpoint(checkpoint: CourseEditCheckpoint, repoRoot: string) {
  const previousCheckpoint = checkpoint.previousCheckpointId
    ? await loadCheckpointVersion(checkpoint.projectSlug, checkpoint.previousCheckpointId, repoRoot)
    : null;
  if (checkpoint.previousCheckpointId && !previousCheckpoint) {
    throw new Error("Studio could not recover the prior Undo checkpoint for this interrupted transaction.");
  }
  if (previousCheckpoint) await writeCheckpoint(previousCheckpoint, repoRoot);
  else await rm(checkpointPath(repoRoot, checkpoint.projectSlug), { force: true });
  await saveCourseEditStatus(checkpoint.previousStatus, repoRoot);
}

async function finishRolledBackTransaction(
  journal: CourseEditTransactionJournal,
  checkpoint: CourseEditCheckpoint,
  repoRoot: string
) {
  await writeCourseEditJournal({ ...journal, phase: "rolled-back", cleanupCheckpointIds: [checkpoint.checkpointId] }, repoRoot);
  await rm(checkpointBackupRoot(repoRoot, checkpoint.projectSlug, checkpoint.checkpointId), { recursive: true, force: true });
  await removeCourseEditJournal(checkpoint.projectSlug, repoRoot);
}

async function finishCommittedTransaction(
  journal: CourseEditTransactionJournal,
  repoRoot: string,
  cleanupCheckpointIds: string[] = []
) {
  await writeCourseEditJournal({ ...journal, phase: "committed", cleanupCheckpointIds }, repoRoot);
  for (const checkpointId of cleanupCheckpointIds) {
    await rm(checkpointBackupRoot(repoRoot, journal.projectSlug, checkpointId), { recursive: true, force: true });
  }
  await removeCourseEditJournal(journal.projectSlug, repoRoot);
}

export async function recoverInterruptedCourseEdit(projectSlug: string, repoRoot: string) {
  const journal = await readCourseEditJournal(projectSlug, repoRoot);
  if (!journal) return;
  if (journal.phase === "committed") {
    for (const checkpointId of journal.cleanupCheckpointIds ?? []) {
      await rm(checkpointBackupRoot(repoRoot, projectSlug, checkpointId), { recursive: true, force: true });
    }
    await removeCourseEditJournal(projectSlug, repoRoot);
    return;
  }
  if (journal.phase === "rolled-back") {
    for (const checkpointId of journal.cleanupCheckpointIds ?? (journal.checkpointId ? [journal.checkpointId] : [])) {
      await rm(checkpointBackupRoot(repoRoot, projectSlug, checkpointId), { recursive: true, force: true });
    }
    await removeCourseEditJournal(projectSlug, repoRoot);
    return;
  }
  if (journal.phase === "manual-recovery") {
    throw new Error(
      "Studio preserved an interrupted transaction because files changed outside its lock. Inspect the recovery journal and checkpoint before choosing which work to keep."
    );
  }
  if (!journal.checkpointId) {
    throw new Error("Studio found an interrupted course operation without a recovery checkpoint. Preserve the journal and inspect the course before editing again.");
  }
  const recovery = await loadCheckpointVersion(projectSlug, journal.checkpointId, repoRoot);
  if (!recovery) {
    throw new Error("Studio found an interrupted course operation, but its recovery checkpoint is missing.");
  }
  const current = await fingerprintCheckpointBoundary(recovery, repoRoot);
  const expectedBefore = journal.expectedBefore.length ? journal.expectedBefore : recovery.expectedBefore;
  const expectedAfter = journal.expectedAfter.length ? journal.expectedAfter : recovery.expectedAfter;
  const boundaryState = classifyCourseEditBoundary(expectedBefore, expectedAfter, current);
  if (boundaryState === "unknown") {
    await writeCourseEditJournal({ ...journal, phase: "manual-recovery", expectedBefore, expectedAfter }, repoRoot);
    throw new Error(
      "Studio preserved the interrupted transaction because the current files do not match either its before state or its known writes. No files were restored; inspect the journal and checkpoint before choosing which work to keep."
    );
  }
  const rollingBack = { ...journal, phase: "rolling-back" as const, expectedBefore, expectedAfter };
  await writeCourseEditJournal(rollingBack, repoRoot);
  if (boundaryState === "after" || boundaryState === "known-partial") {
    await restoreSnapshotDirectories(repoRoot, recovery.directories);
    await restoreSnapshotFiles(repoRoot, recovery.files);
  }
  await restorePriorUndoCheckpoint(recovery, repoRoot);
  if (!courseEditFingerprintsMatch(expectedBefore, await fingerprintCheckpointBoundary(recovery, repoRoot))) {
    throw new Error("Studio recovery did not restore the recorded pre-transaction boundary.");
  }
  await finishRolledBackTransaction(rollingBack, recovery, repoRoot);
}

async function withProjectEditLock<T>(
  projectSlug: string,
  operation: CourseEditTransactionJournal["operation"],
  repoRoot: string,
  run: () => Promise<T>
) {
  return await withCourseEditFileLock({
    projectSlug,
    operation,
    repoRoot,
    recoverInterrupted: () => recoverInterruptedCourseEdit(projectSlug, repoRoot),
    run
  });
}

export async function applyCourseEditBatch(
  request: CourseEditApplyRequest,
  repoRoot = defaultRepoRoot,
  hooks: CourseEditExecutionHooks = {}
): Promise<CourseEditBatchResult> {
  if (request.schemaVersion !== COURSE_EDIT_SCHEMA_VERSION) throw new Error("Unsupported Studio edit batch version.");
  return await withProjectEditLock(request.projectSlug, "apply", repoRoot, async () => {
    const resolved: Array<{ draft: CourseEditDraft; target: ResolvedEditableTarget }> = [];
    for (const [index, draft] of request.drafts.entries()) {
      try {
        const target = await resolveFromIdentity(draft.identity, repoRoot);
        resolved.push({ draft: sanitizeDraft(draft, target.target), target });
      } catch (error) {
        const excerpt = draft.beforeText.replace(/\s+/g, " ").trim().slice(0, 80) || draft.identity.tagName.toUpperCase();
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`Draft ${index + 1} (${draft.identity.tagName.toUpperCase()}: "${excerpt}") needs attention: ${reason} No course files changed.`);
      }
    }
    const adapter = resolved[0].target.target.identity?.adapter;
    const htmlPaths = [...new Set(resolved.map((entry) => entry.target.target.identity?.htmlPath).filter((value): value is string => Boolean(value)))];
    if (!adapter || htmlPaths.length === 0 || resolved.some((entry) => entry.target.target.identity?.adapter !== adapter)) {
      throw new Error("All drafts in one batch must belong to the same course and edit adapter.");
    }
    if (adapter !== "direct" && adapter !== "legacy-snapshot" && htmlPaths.length !== 1) {
      throw new Error("Generated-course edit batches must target their single generated course page.");
    }
    assertNonOverlappingTargets(resolved);
    const previousStatus = await getCourseEditStatus(request.projectSlug, repoRoot);
    const previousCheckpoint = await loadCheckpoint(request.projectSlug, repoRoot);
    const checkpointId = randomUUID();
    const legacySnapshotPaths = adapter === "legacy-snapshot"
      ? await (async () => {
          const [stored, course] = await Promise.all([
            loadCourseEditOverrides(repoRoot, request.projectSlug),
            loadStoredStudioCourse(repoRoot, request.projectSlug)
          ]);
          const htmlPaths = new Set([
            ...resolved.map((entry) => entry.target.target.identity?.htmlPath).filter((value): value is string => Boolean(value)),
            ...stored.overrides.map((entry) => entry.htmlPath)
          ]);
          if (course) htmlPaths.add("index.html");
          return await Promise.all([...htmlPaths].map((htmlPath) => resolveEditWorkspacePath(request.projectSlug, htmlPath, repoRoot)));
        })()
      : [];
    const snapshotPaths = adapter === "direct"
      ? [...new Set(resolved.map((entry) => entry.target.sourcePath))]
      : adapter === "legacy-snapshot"
        ? [...new Set([
            ...legacySnapshotPaths,
            courseEditOverridesPath(repoRoot, request.projectSlug)
          ])]
        : [];
    const snapshotDirectoryPaths = adapter === "direct"
      ? []
      : generatedWriteSetDirectories(request.projectSlug, adapter, repoRoot);
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
      previousStatus,
      previousCheckpointId: previousCheckpoint?.checkpointId ?? null,
      expectedBefore: [],
      expectedAfter: [],
      renderBefore: resolved.map(({ draft, target }) => renderCheckForPatch({
        htmlPath: draft.identity.htmlPath,
        element: target.element,
        patch: draft.patch,
        before: {
          html: target.target.originalHtml,
          attributes: target.target.attributes,
          style: target.target.currentStyle
        },
        phase: "before"
      })),
      renderAfter: resolved.map(({ draft, target }) => renderCheckForPatch({
        htmlPath: draft.identity.htmlPath,
        element: target.element,
        patch: draft.patch,
        before: {
          html: target.target.originalHtml,
          attributes: target.target.attributes,
          style: target.target.currentStyle
        },
        phase: "after"
      }))
    };
    checkpoint.expectedBefore = await fingerprintCheckpointBoundary(checkpoint, repoRoot);
    await writeCheckpoint(checkpoint, repoRoot);
    let journal: CourseEditTransactionJournal = {
      schemaVersion: 1,
      transactionId: randomUUID(),
      projectSlug: request.projectSlug,
      operation: "apply",
      checkpointId: checkpoint.checkpointId,
      phase: "prepared",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedBefore: checkpoint.expectedBefore,
      expectedAfter: []
    };
    await writeCourseEditJournal(journal, repoRoot);

    try {
      journal = { ...journal, phase: "mutating" };
      await writeCourseEditJournal(journal, repoRoot);
      if (adapter === "direct") {
        await applyDirectEdits(resolved, hooks, repoRoot, async (expectedAfter) => {
          checkpoint.expectedAfter = expectedAfter;
          await writeCheckpoint(checkpoint, repoRoot);
          journal = { ...journal, expectedAfter };
          await writeCourseEditJournal(journal, repoRoot);
        });
      } else {
        await applyGeneratedEdits(request.projectSlug, resolved, repoRoot, async () => {
          // Generated builders publish from staging, so the persisted override
          // is a complete known intermediate boundary. Recording it lets a
          // pre-commit builder failure roll back automatically while any
          // unknown partial builder publication still fails closed.
          checkpoint.expectedAfter = await fingerprintCheckpointBoundary(checkpoint, repoRoot);
          await writeCheckpoint(checkpoint, repoRoot);
          journal = { ...journal, expectedAfter: checkpoint.expectedAfter };
          await writeCourseEditJournal(journal, repoRoot);
        });
        await runRebuild(request.projectSlug, adapter, repoRoot);
        clearPreviewInspectionDocumentCache();
      }
      checkpoint.expectedAfter = await fingerprintCheckpointBoundary(checkpoint, repoRoot);
      await writeCheckpoint(checkpoint, repoRoot);
      journal = { ...journal, phase: "validating", expectedAfter: checkpoint.expectedAfter };
      await writeCourseEditJournal(journal, repoRoot);
      await runValidation(request.projectSlug, repoRoot);
      await (hooks.validateRendered ?? validateRenderedCourseEdits)({
        repoRoot,
        projectSlug: request.projectSlug,
        checks: checkpoint.renderAfter
      });
    } catch (error) {
      const current = await fingerprintCheckpointBoundary(checkpoint, repoRoot);
      const boundaryState = classifyCourseEditBoundary(checkpoint.expectedBefore, checkpoint.expectedAfter, current);
      const staleBeforeStudioWrite = error instanceof StaleCourseEditSourceError && !error.studioWrites;
      if (boundaryState === "unknown" && !staleBeforeStudioWrite) {
        journal = { ...journal, phase: "manual-recovery", expectedAfter: checkpoint.expectedAfter };
        await writeCourseEditJournal(journal, repoRoot);
        throw new Error(
          "Studio paused automatic rollback because the current course is not one of its known before, after, or partial-write states. No newer files were overwritten; inspect the preserved journal and checkpoint."
        );
      }
      journal = { ...journal, phase: "rolling-back", expectedAfter: checkpoint.expectedAfter };
      await writeCourseEditJournal(journal, repoRoot);
      if (boundaryState === "after" || boundaryState === "known-partial") {
        await restoreSnapshotDirectories(repoRoot, checkpoint.directories);
        await restoreSnapshotFiles(repoRoot, checkpoint.files);
      }
      await restorePriorUndoCheckpoint(checkpoint, repoRoot);
      if (boundaryState === "after" || boundaryState === "known-partial") {
        if (!courseEditFingerprintsMatch(checkpoint.expectedBefore, await fingerprintCheckpointBoundary(checkpoint, repoRoot))) {
          throw new Error("Studio rollback did not restore the recorded pre-edit boundary.");
        }
      }
      await finishRolledBackTransaction(journal, checkpoint, repoRoot);
      throw error;
    }

    const staleTargets = await staleExportTargets(request.projectSlug, repoRoot);
    const status: CourseEditStatus = {
      projectSlug: request.projectSlug,
      available: true,
      unavailableReason: "",
      courseTitle: await currentCourseTitle(
        request.projectSlug,
        await projectManifest(request.projectSlug, repoRoot),
        repoRoot
      ),
      canRenameCourse: resolved[0].target.project.studioEditing.renameCourse,
      canUploadImages: resolved[0].target.project.studioEditing.imageAssets,
      canUndo: true,
      undoUnavailableReason: "",
      checkpointId: checkpoint.checkpointId,
      exportsOutOfDate: staleTargets.length > 0,
      staleExportTargets: staleTargets,
      lastAppliedAt: new Date().toISOString()
    };
    await saveCourseEditStatus(status, repoRoot);
    await finishCommittedTransaction(
      journal,
      repoRoot,
      previousCheckpoint && previousCheckpoint.checkpointId !== checkpoint.checkpointId
        ? [previousCheckpoint.checkpointId]
        : []
    );
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
  return await withProjectEditLock(projectSlug, "undo", repoRoot, async () => {
    const checkpoint = await loadCheckpoint(projectSlug, repoRoot);
    if (!checkpoint) throw new Error("There is no applied Studio edit batch to undo.");
    if (!await checkpointMatchesExpectedPost(checkpoint, repoRoot)) {
      throw new Error(
        "Undo refused because the course changed after this Studio batch. Reload and review the newer work; Studio will not restore over it."
      );
    }
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
    const recovery: CourseEditCheckpoint = {
      schemaVersion: CHECKPOINT_SCHEMA_VERSION,
      checkpointId: undoRecoveryId,
      projectSlug,
      adapter: checkpoint.adapter,
      htmlPaths: checkpoint.htmlPaths,
      createdAt: new Date().toISOString(),
      files: recoveryFiles,
      directories: recoveryDirectories,
      previousStatus: await getCourseEditStatus(projectSlug, repoRoot),
      previousCheckpointId: checkpoint.checkpointId,
      expectedBefore: [],
      expectedAfter: [],
      renderBefore: checkpoint.renderAfter,
      renderAfter: checkpoint.renderBefore
    };
    recovery.expectedBefore = await fingerprintCheckpointBoundary(recovery, repoRoot);
    recovery.expectedAfter = checkpoint.expectedBefore;
    await writeCheckpoint(recovery, repoRoot);
    let journal: CourseEditTransactionJournal = {
      schemaVersion: 1,
      transactionId: randomUUID(),
      projectSlug,
      operation: "undo",
      checkpointId: recovery.checkpointId,
      phase: "prepared",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedBefore: recovery.expectedBefore,
      expectedAfter: recovery.expectedAfter
    };
    await writeCourseEditJournal(journal, repoRoot);
    try {
      journal = { ...journal, phase: "mutating" };
      await writeCourseEditJournal(journal, repoRoot);
      await restoreSnapshotDirectories(repoRoot, checkpoint.directories);
      await restoreSnapshotFiles(repoRoot, checkpoint.files);
      const restored = await fingerprintCheckpointBoundary(recovery, repoRoot);
      if (!courseEditFingerprintsMatch(recovery.expectedAfter, restored)) {
        throw new Error("Undo restored files that do not match the recorded pre-edit boundary.");
      }
      journal = { ...journal, phase: "validating", expectedAfter: recovery.expectedAfter };
      await writeCourseEditJournal(journal, repoRoot);
      await runValidation(projectSlug, repoRoot);
      await validateRenderedCourseEdits({ repoRoot, projectSlug, checks: checkpoint.renderBefore });
    } catch (error) {
      const current = await fingerprintCheckpointBoundary(recovery, repoRoot);
      const boundaryState = classifyCourseEditBoundary(recovery.expectedBefore, recovery.expectedAfter, current);
      if (boundaryState === "unknown") {
        journal = { ...journal, phase: "manual-recovery", expectedAfter: recovery.expectedAfter };
        await writeCourseEditJournal(journal, repoRoot);
        throw new Error(
          "Studio paused Undo recovery because the current course is not one of its known before, after, or partial-write states. No newer files were overwritten; both checkpoints were preserved."
        );
      }
      journal = { ...journal, phase: "rolling-back", expectedAfter: recovery.expectedAfter };
      await writeCourseEditJournal(journal, repoRoot);
      if (boundaryState === "after" || boundaryState === "known-partial") {
        await restoreSnapshotDirectories(repoRoot, recovery.directories);
        await restoreSnapshotFiles(repoRoot, recovery.files);
      }
      await restorePriorUndoCheckpoint(recovery, repoRoot);
      if (boundaryState === "after" || boundaryState === "known-partial") {
        if (!courseEditFingerprintsMatch(recovery.expectedBefore, await fingerprintCheckpointBoundary(recovery, repoRoot))) {
          throw new Error("Studio Undo recovery did not restore the recorded applied boundary.");
        }
      }
      await finishRolledBackTransaction(journal, recovery, repoRoot);
      throw error;
    }
    const staleTargets = await staleExportTargets(projectSlug, repoRoot);
    const status = {
      ...checkpoint.previousStatus,
      canUndo: false,
      undoUnavailableReason: "There is no applied Studio edit batch to undo.",
      checkpointId: null,
      exportsOutOfDate: staleTargets.length > 0,
      staleExportTargets: staleTargets
    };
    await saveCourseEditStatus(status, repoRoot);
    await rm(checkpointPath(repoRoot, projectSlug), { force: true });
    await finishCommittedTransaction(journal, repoRoot, [checkpoint.checkpointId, recovery.checkpointId]);
    return {
      ...status,
      ok: true,
      appliedCount: 0,
      message: "The last Studio edit batch was undone and the course was validated.",
      warnings: staleTargets.length ? ["Existing export packages are out of date until you publish them again."] : []
    };
  });
}

async function ensureCourseEditAssetDirectory(repoRoot: string, segments: string[]) {
  let cursor = repoRoot;
  for (const segment of segments) {
    cursor = path.join(cursor, segment);
    try {
      const stats = await lstat(cursor);
      if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error("Studio image storage must use real directories inside this checkout.");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await mkdir(cursor);
    }
  }
  return cursor;
}

export async function uploadCourseEditImageAsset(input: {
  projectSlug: string;
  htmlPath: string;
  bytes: Buffer;
  repoRoot?: string;
  afterCanonicalPublish?: () => void | Promise<void>;
}) {
  const repoRoot = input.repoRoot ?? defaultRepoRoot;
  const image = await validateCourseEditImage(input.bytes);
  return await withProjectEditLock(input.projectSlug, "asset-upload", repoRoot, async () => {
    const { project, adapter, reason } = await resolveCourseProject(input.projectSlug, repoRoot);
    if (!project || !adapter) throw new Error(reason || "This course cannot accept Studio image assets.");
    if (!project.studioEditing.imageAssets) throw new Error("This course has not been explicitly onboarded for Studio image uploads.");
    await resolveEditWorkspacePath(input.projectSlug, input.htmlPath, repoRoot);
    const digest = createHash("sha256").update(input.bytes).digest("hex");
    const filename = `${digest}.${image.extension}`;
    const resourceDir = await ensureCourseEditAssetDirectory(repoRoot, ["projects", "resources", input.projectSlug, "studio-assets"]);
    const workspaceDir = await ensureCourseEditAssetDirectory(repoRoot, ["projects", input.projectSlug, "workspace", "assets", "custom", "studio"]);
    const resourcePath = path.join(resourceDir, filename);
    const workspacePath = path.join(workspaceDir, filename);
    const publish = async (targetPath: string) => {
      try {
        const stats = await lstat(targetPath);
        if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("A Studio asset path is not a regular file.");
        if (!(await readFile(targetPath)).equals(input.bytes)) {
          throw new Error("A content-addressed Studio asset does not match its recorded digest.");
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        await durableAtomicWrite(targetPath, input.bytes, 0o644);
      }
    };
    // The canonical resource is published first. Both destinations are keyed
    // by the full content digest and verified on retry, so interruption can
    // leave only an unreferenced canonical copy and a retry safely completes.
    await publish(resourcePath);
    await input.afterCanonicalPublish?.();
    await publish(workspacePath);
    const workspaceRelative = `assets/custom/studio/${filename}`;
    const src = path.posix.relative(path.posix.dirname(input.htmlPath), workspaceRelative) || filename;
    return {
      src,
      repoRelativePath: path.relative(repoRoot, resourcePath).split(path.sep).join("/"),
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      byteLength: input.bytes.length
    };
  });
}

async function courseTitleRenderChecks(input: {
  projectSlug: string;
  repoRoot: string;
  htmlPaths: string[];
}) {
  const checks: CourseEditRenderCheck[] = [];
  for (const htmlPath of input.htmlPaths) {
    const sourcePath = await resolveEditWorkspacePath(input.projectSlug, htmlPath, input.repoRoot);
    const source = await readFile(sourcePath, "utf8");
    const elements = collectEditableHtmlElements(source, input.projectSlug, htmlPath);
    if (!elements) throw new Error("Studio could not map the course title markers safely.");
    for (const element of elements) {
      if (!Object.hasOwn(element.attributes, "data-canvas-helper-course-title")) continue;
      checks.push({
        htmlPath,
        tagName: element.tagName,
        pathKey: element.pathKey,
        editId: element.editId,
        expected: { html: source.slice(element.innerStart, element.innerEnd) }
      });
    }
  }
  return checks;
}

export async function renameCourseForStudio(input: {
  projectSlug: string;
  title: string;
  repoRoot?: string;
}): Promise<CourseEditBatchResult> {
  const repoRoot = input.repoRoot ?? defaultRepoRoot;
  const title = sanitizeCourseEditPlainText(input.title);
  if (!title || title.length > 160) throw new Error("Course titles must be between 1 and 160 characters.");
  return await withProjectEditLock(input.projectSlug, "rename", repoRoot, async () => {
    const { project, adapter, reason } = await resolveCourseProject(input.projectSlug, repoRoot);
    if (!project || !adapter) throw new Error(reason || "This course cannot be renamed in Studio.");
    if (!project.studioEditing.renameCourse) throw new Error("This course has not been explicitly onboarded for coordinated renaming.");
    const manifestPath = path.join(repoRoot, "projects", input.projectSlug, "meta", "project.json");
    const metadataPath = studioCoursePath(repoRoot, input.projectSlug);
    const directSources = adapter === "direct"
      ? project.editableSources
          .filter((entry) => entry.kind === "file" && /\.(?:html?|js)$/i.test(entry.repoRelative))
          .map((entry) => path.join(repoRoot, ...entry.repoRelative.split("/")))
      : [];
    const htmlSourcePaths = adapter === "direct"
      ? directSources.filter((filePath) => /\.html?$/i.test(filePath))
      : [path.join(repoRoot, "projects", input.projectSlug, "workspace", "index.html")];
    const htmlPaths = htmlSourcePaths.map((filePath) => relativeWorkspacePath(filePath, input.projectSlug, repoRoot));
    const beforeChecks = await courseTitleRenderChecks({ projectSlug: input.projectSlug, repoRoot, htmlPaths });
    if (beforeChecks.length < 2) {
      throw new Error("This course does not declare enough synchronized title markers for a safe rename.");
    }

    const previousStatus = await getCourseEditStatus(input.projectSlug, repoRoot);
    const previousCheckpoint = await loadCheckpoint(input.projectSlug, repoRoot);
    const checkpointId = randomUUID();
    const directories: SnapshotDirectory[] = [];
    if (adapter !== "direct") {
      const total = { bytes: 0, files: 0 };
      try {
        for (const [index, directoryPath] of generatedWriteSetDirectories(input.projectSlug, adapter, repoRoot).entries()) {
          directories.push(await snapshotDirectory({
            repoRoot,
            projectSlug: input.projectSlug,
            checkpointId,
            directoryPath,
            index,
            total
          }));
        }
      } catch (error) {
        await rm(checkpointBackupRoot(repoRoot, input.projectSlug, checkpointId), { recursive: true, force: true });
        throw error;
      }
    }
    const snapshotPaths = adapter === "direct"
      ? [...new Set([...directSources, manifestPath, metadataPath])]
      : adapter === "legacy-snapshot"
        ? [...new Set([...htmlSourcePaths, manifestPath, metadataPath])]
        : [];
    const checkpoint: CourseEditCheckpoint = {
      schemaVersion: CHECKPOINT_SCHEMA_VERSION,
      checkpointId,
      projectSlug: input.projectSlug,
      adapter,
      htmlPaths,
      createdAt: new Date().toISOString(),
      files: await Promise.all(snapshotPaths.map((filePath) => snapshotFile(repoRoot, filePath))),
      directories,
      previousStatus,
      previousCheckpointId: previousCheckpoint?.checkpointId ?? null,
      expectedBefore: [],
      expectedAfter: [],
      renderBefore: beforeChecks,
      renderAfter: []
    };
    checkpoint.expectedBefore = await fingerprintCheckpointBoundary(checkpoint, repoRoot);
    await writeCheckpoint(checkpoint, repoRoot);
    let journal: CourseEditTransactionJournal = {
      schemaVersion: 1,
      transactionId: randomUUID(),
      projectSlug: input.projectSlug,
      operation: "rename",
      checkpointId,
      phase: "prepared",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedBefore: checkpoint.expectedBefore,
      expectedAfter: []
    };
    await writeCourseEditJournal(journal, repoRoot);
    try {
      journal = { ...journal, phase: "mutating" };
      await writeCourseEditJournal(journal, repoRoot);
      const now = new Date().toISOString();
      await saveStoredStudioCourse(repoRoot, { schemaVersion: 1, projectSlug: input.projectSlug, title, updatedAt: now });
      const manifest = await projectManifest(input.projectSlug, repoRoot);
      await atomicWrite(manifestPath, `${JSON.stringify({ ...manifest, title, updatedAt: now }, null, 2)}\n`);
      if (adapter === "direct") {
        let htmlMarkerChanges = 0;
        for (const filePath of directSources) {
          const source = await readFile(filePath, "utf8");
          const next = /\.html?$/i.test(filePath)
            ? applyStoredCourseTitleToHtml(source, title)
            : applyStoredCourseTitleToRuntimeData(source, title);
          if (next !== source) {
            if (/\.html?$/i.test(filePath)) htmlMarkerChanges += 1;
            await atomicWrite(filePath, next, (await lstat(filePath)).mode);
          }
        }
        if (htmlMarkerChanges === 0) throw new Error("No canonical course title markers were updated.");
        clearPreviewInspectionDocumentCache();
      } else {
        await runRebuild(input.projectSlug, adapter, repoRoot);
        clearPreviewInspectionDocumentCache();
      }
      checkpoint.renderAfter = await courseTitleRenderChecks({ projectSlug: input.projectSlug, repoRoot, htmlPaths });
      if (checkpoint.renderAfter.length < 2 || checkpoint.renderAfter.some((check) => htmlText(check.expected.html ?? "") !== title)) {
        throw new Error("The rebuilt course did not synchronize all declared title markers.");
      }
      checkpoint.expectedAfter = await fingerprintCheckpointBoundary(checkpoint, repoRoot);
      await writeCheckpoint(checkpoint, repoRoot);
      journal = { ...journal, phase: "validating", expectedAfter: checkpoint.expectedAfter };
      await writeCourseEditJournal(journal, repoRoot);
      await runValidation(input.projectSlug, repoRoot);
      await validateRenderedCourseEdits({ repoRoot, projectSlug: input.projectSlug, checks: checkpoint.renderAfter });
    } catch (error) {
      const current = await fingerprintCheckpointBoundary(checkpoint, repoRoot);
      const boundaryState = classifyCourseEditBoundary(checkpoint.expectedBefore, checkpoint.expectedAfter, current);
      if (boundaryState === "unknown") {
        journal = { ...journal, phase: "manual-recovery", expectedAfter: checkpoint.expectedAfter };
        await writeCourseEditJournal(journal, repoRoot);
        throw new Error(
          "Studio paused rename rollback because the current course is not one of its known before, after, or partial-write states. No newer files were overwritten; the recovery journal was preserved."
        );
      }
      journal = { ...journal, phase: "rolling-back", expectedAfter: checkpoint.expectedAfter };
      await writeCourseEditJournal(journal, repoRoot);
      if (boundaryState === "after" || boundaryState === "known-partial") {
        await restoreSnapshotDirectories(repoRoot, checkpoint.directories);
        await restoreSnapshotFiles(repoRoot, checkpoint.files);
      }
      await restorePriorUndoCheckpoint(checkpoint, repoRoot);
      if (boundaryState === "after" || boundaryState === "known-partial") {
        if (!courseEditFingerprintsMatch(checkpoint.expectedBefore, await fingerprintCheckpointBoundary(checkpoint, repoRoot))) {
          throw new Error("Studio rename rollback did not restore the recorded pre-rename boundary.");
        }
      }
      await finishRolledBackTransaction(journal, checkpoint, repoRoot);
      throw error;
    }
    const staleTargets = await staleExportTargets(input.projectSlug, repoRoot);
    const status: CourseEditStatus = {
      projectSlug: input.projectSlug,
      available: true,
      unavailableReason: "",
      courseTitle: title,
      canRenameCourse: true,
      canUploadImages: project.studioEditing.imageAssets,
      canUndo: true,
      undoUnavailableReason: "",
      checkpointId,
      exportsOutOfDate: staleTargets.length > 0,
      staleExportTargets: staleTargets,
      lastAppliedAt: new Date().toISOString()
    };
    await saveCourseEditStatus(status, repoRoot);
    await finishCommittedTransaction(
      journal,
      repoRoot,
      previousCheckpoint && previousCheckpoint.checkpointId !== checkpoint.checkpointId
        ? [previousCheckpoint.checkpointId]
        : []
    );
    return {
      ...status,
      ok: true,
      appliedCount: 1,
      message: `Course renamed to “${title}” and validated in the learner view.`,
      warnings: staleTargets.length ? ["Existing export packages are out of date until you publish them again."] : []
    };
  });
}

const COMMAND_EXPORT_TARGETS: Record<string, { target: CourseExportEvidenceTarget; artifact: (repoRoot: string, slug: string) => string }> = {
  export: { target: "brightspace", artifact: (repoRoot, slug) => path.join(repoRoot, "projects", slug, "exports", "brightspace") },
  package: { target: "brightspace-package", artifact: (repoRoot, slug) => path.join(repoRoot, "projects", slug, "exports", `${slug}-brightspace.zip`) },
  scorm2004: { target: "scorm2004", artifact: (repoRoot, slug) => path.join(repoRoot, "projects", slug, "exports", `${slug}-scorm-2004.zip`) },
  scorm12: { target: "scorm12", artifact: (repoRoot, slug) => path.join(repoRoot, "projects", slug, "exports", `${slug}-scorm-1-2.zip`) },
  googleHosted: { target: "google-hosted", artifact: (repoRoot, slug) => path.join(repoRoot, "projects", slug, "exports", "google-hosted") },
  appsScript: { target: "apps-script", artifact: (repoRoot, slug) => path.join(repoRoot, "projects", slug, "exports", "apps-script") },
  html: { target: "html", artifact: (repoRoot, slug) => path.join(repoRoot, "projects", slug, "exports", "single-html", `${slug}.html`) }
};

export async function markCourseExportCurrent(projectSlug: string, commandName: string, repoRoot = defaultRepoRoot) {
  const spec = COMMAND_EXPORT_TARGETS[commandName];
  if (!spec) return;
  await recordCourseExportEvidence({
    repoRoot,
    projectSlug,
    target: spec.target,
    artifactPath: spec.artifact(repoRoot, projectSlug)
  });
}
