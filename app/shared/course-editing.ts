import type { InspectionResolveRequest } from "./inspection.js";
import { normalizePreviewPageIdentity, parsePreviewCapabilityPath } from "./preview-path.js";

export const COURSE_EDIT_SCHEMA_VERSION = 2;
export const COURSE_EDIT_PREVIEW_SCHEMA_VERSION = 1;
export const COURSE_EDIT_MAX_DRAFTS = 20;
export const COURSE_EDIT_MAX_HTML_CODE_UNITS = 24_000;
export const COURSE_EDIT_MAX_URL_CODE_UNITS = 2_048;
export const COURSE_EDIT_MAX_STATUS_CODE_UNITS = 240;
export const COURSE_EDIT_MAX_ID_CODE_UNITS = 160;
export const COURSE_EDIT_PAGE_MAP_SCHEMA_VERSION = 1;
export const COURSE_EDIT_PAGE_MAP_MAX_ENTRIES = 4_000;

export const COURSE_EDIT_TEXT_STYLES = ["default", "heading", "subheading", "body", "caption"] as const;
export const COURSE_EDIT_FONT_FAMILIES = ["default", "readable-sans", "book-serif"] as const;
export const COURSE_EDIT_FONT_SIZES = ["default", "small", "large", "x-large"] as const;
export const COURSE_EDIT_TEXT_TONES = ["default", "ink", "muted", "accent"] as const;
export const COURSE_EDIT_ALIGNMENTS = ["default", "left", "center", "right"] as const;
export const COURSE_EDIT_SPACING = ["default", "compact", "relaxed"] as const;

export const COURSE_EDIT_ADAPTERS = ["direct", "english-factory", "social-related-issues", "legacy-snapshot"] as const;

export type CourseEditAdapter = (typeof COURSE_EDIT_ADAPTERS)[number];
export type CourseEditEligibility = "editable" | "unsupported";
export type CourseEditMapAction = "edit-text" | "edit-link" | "replace-image" | "style-text" | "rename-course" | "annotation-only";
export type CourseEditTextStyle = (typeof COURSE_EDIT_TEXT_STYLES)[number];
export type CourseEditFontFamily = (typeof COURSE_EDIT_FONT_FAMILIES)[number];
export type CourseEditFontSize = (typeof COURSE_EDIT_FONT_SIZES)[number];
export type CourseEditTextTone = (typeof COURSE_EDIT_TEXT_TONES)[number];
export type CourseEditAlignment = (typeof COURSE_EDIT_ALIGNMENTS)[number];
export type CourseEditSpacing = (typeof COURSE_EDIT_SPACING)[number];

export type CourseEditStylePatch = {
  textStyle?: CourseEditTextStyle;
  fontFamily?: CourseEditFontFamily;
  fontSize?: CourseEditFontSize;
  textTone?: CourseEditTextTone;
  alignment?: CourseEditAlignment;
  spacing?: CourseEditSpacing;
};

export type CourseEditPatch = {
  html?: string;
  href?: string | null;
  src?: string | null;
  alt?: string | null;
  title?: string | null;
  style?: CourseEditStylePatch;
};

export type CourseEditCapabilities = {
  richText: boolean;
  link: boolean;
  image: boolean;
  styles: boolean;
  styleKeys: Array<keyof CourseEditStylePatch>;
};

/**
 * Browser-safe identity for one server-resolved editable element. It contains
 * no filesystem path. Every field is revalidated against the current course
 * and current source digest before a write is allowed.
 */
export type CourseEditTargetIdentity = {
  targetId: string;
  projectSlug: string;
  htmlPath: string;
  nodeId: string;
  sourceDigest: string;
  elementDigest: string;
  editId: string | null;
  tagName: string;
  adapter: CourseEditAdapter;
};

export type CourseEditTarget = {
  eligibility: CourseEditEligibility;
  reason: string;
  identity: CourseEditTargetIdentity | null;
  capabilities: CourseEditCapabilities;
  originalHtml: string;
  originalText: string;
  attributes: {
    href: string;
    src: string;
    alt: string;
    title: string;
  };
  currentStyle: Required<CourseEditStylePatch>;
};

export type CourseEditReopenRequest = {
  schemaVersion: typeof COURSE_EDIT_SCHEMA_VERSION;
  identity: CourseEditTargetIdentity;
};

export type CourseEditReopenResult =
  | { status: "resolved"; target: CourseEditTarget }
  | { status: "target-changed"; currentTarget: CourseEditTarget }
  | { status: "missing" | "unsupported"; reason: string };

export type CourseEditPageMapEntry = {
  nodeId: string;
  tagName: string;
  action: CourseEditMapAction;
  label: string;
  reason: string;
  expected: {
    textFingerprint: string;
    textLength: number;
    attributeFingerprint: string;
  } | null;
};

export type CourseEditPageMap = {
  schemaVersion: typeof COURSE_EDIT_PAGE_MAP_SCHEMA_VERSION;
  projectSlug: string;
  htmlPath: string;
  sourceDigest: string;
  available: boolean;
  reason: string;
  entries: CourseEditPageMapEntry[];
  editableCount: number;
  annotationOnlyCount: number;
  truncated: boolean;
};

export type CourseEditDraftBaseline = Pick<
  CourseEditTarget,
  "originalHtml" | "attributes" | "currentStyle" | "capabilities"
>;

export type CourseEditResolveRequest = InspectionResolveRequest;

export type CourseEditDraft = {
  id: string;
  createdAt: number;
  updatedAt: number;
  identity: CourseEditTargetIdentity;
  beforeText: string;
  afterText: string;
  baseline: CourseEditDraftBaseline;
  patch: CourseEditPatch;
  canonicalPatchDigest?: string;
  pendingAssets?: CourseEditPendingAssetReference[];
  pageHref?: string;
};

export type CourseEditPendingAssetReference = {
  kind: "image";
  id: string;
  previewSessionId: string;
  digest: string;
  finalSrc: string;
  mimeType: "image/png" | "image/jpeg" | "image/gif";
  width: number;
  height: number;
  byteLength: number;
};

export type CourseEditPreviewBinding = {
  previewSessionId: string;
  revision: number;
  projectSlug: string;
  pageIdentity: string;
  mapSourceDigest: string;
  targetNodeId: string;
};

export type CourseEditPreviewRepresentation = {
  tagName: string;
  html: string;
  attributes: {
    href: string;
    src: string;
    alt: string;
    title: string;
  };
  style: Required<CourseEditStylePatch>;
};

export type CourseEditPreviewNormalizeRequest = CourseEditPreviewBinding & {
  schemaVersion: typeof COURSE_EDIT_PREVIEW_SCHEMA_VERSION;
  identity: CourseEditTargetIdentity;
  patch: CourseEditPatch;
  pendingAssets?: CourseEditPendingAssetReference[];
};

export type CourseEditPreviewNormalizeResult = CourseEditPreviewBinding & {
  schemaVersion: typeof COURSE_EDIT_PREVIEW_SCHEMA_VERSION;
  canonicalPatch: CourseEditPatch;
  canonicalPatchDigest: string;
  pendingAssets: CourseEditPendingAssetReference[];
  representation: CourseEditPreviewRepresentation;
  changed: true;
};

export type CourseEditPreviewClearRequest = CourseEditPreviewBinding & {
  schemaVersion: typeof COURSE_EDIT_PREVIEW_SCHEMA_VERSION;
  retainPendingAssetIds?: string[];
};

export type CourseEditPendingImage = CourseEditPendingAssetReference & {
  previewSrc: string;
};

export type CourseEditApplyRequest = {
  schemaVersion: typeof COURSE_EDIT_SCHEMA_VERSION;
  projectSlug: string;
  drafts: CourseEditDraft[];
};

export type CourseEditStatus = {
  projectSlug: string;
  available: boolean;
  unavailableReason: string;
  courseTitle: string;
  canRenameCourse: boolean;
  canUploadImages: boolean;
  canUndo: boolean;
  undoUnavailableReason: string;
  checkpointId: string | null;
  exportsOutOfDate: boolean;
  staleExportTargets: string[];
  lastAppliedAt: string | null;
};

export type CourseEditBatchResult = CourseEditStatus & {
  ok: boolean;
  appliedCount: number;
  message: string;
  warnings: string[];
};

export type CourseRenameRequest = {
  schemaVersion: typeof COURSE_EDIT_SCHEMA_VERSION;
  projectSlug: string;
  title: string;
};

export function isCourseRenameRequest(value: unknown): value is CourseRenameRequest {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["schemaVersion", "projectSlug", "title"]) &&
    value.schemaVersion === COURSE_EDIT_SCHEMA_VERSION &&
    isBoundedString(value.projectSlug, COURSE_EDIT_MAX_ID_CODE_UNITS, false) &&
    /^[a-z0-9][a-z0-9._-]*$/i.test(value.projectSlug) &&
    isBoundedString(value.title, 160, false) &&
    value.title.trim() === value.title
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isBoundedString(value: unknown, maximum: number, allowEmpty = true): value is string {
  return typeof value === "string" && value.length <= maximum && (allowEmpty || value.length > 0);
}

function isNullableBoundedString(value: unknown, maximum: number) {
  return value === null || isBoundedString(value, maximum);
}

export function isCourseEditAdapter(value: unknown): value is CourseEditAdapter {
  return typeof value === "string" && COURSE_EDIT_ADAPTERS.includes(value as CourseEditAdapter);
}

export function isCourseEditStylePatch(value: unknown): value is CourseEditStylePatch {
  if (!isRecord(value)) return false;
  if (!hasOnlyKeys(value, ["textStyle", "fontFamily", "fontSize", "textTone", "alignment", "spacing"])) return false;
  return (
    (value.textStyle === undefined || COURSE_EDIT_TEXT_STYLES.includes(value.textStyle as CourseEditTextStyle)) &&
    (value.fontFamily === undefined || COURSE_EDIT_FONT_FAMILIES.includes(value.fontFamily as CourseEditFontFamily)) &&
    (value.fontSize === undefined || COURSE_EDIT_FONT_SIZES.includes(value.fontSize as CourseEditFontSize)) &&
    (value.textTone === undefined || COURSE_EDIT_TEXT_TONES.includes(value.textTone as CourseEditTextTone)) &&
    (value.alignment === undefined || COURSE_EDIT_ALIGNMENTS.includes(value.alignment as CourseEditAlignment)) &&
    (value.spacing === undefined || COURSE_EDIT_SPACING.includes(value.spacing as CourseEditSpacing))
  );
}

export function isCourseEditPatch(value: unknown): value is CourseEditPatch {
  if (!isRecord(value)) return false;
  const known = new Set(["html", "href", "src", "alt", "title", "style"]);
  if (Object.keys(value).some((key) => !known.has(key))) return false;
  if (value.html !== undefined && !isBoundedString(value.html, COURSE_EDIT_MAX_HTML_CODE_UNITS)) return false;
  if (value.href !== undefined && !isNullableBoundedString(value.href, COURSE_EDIT_MAX_URL_CODE_UNITS)) return false;
  if (value.src !== undefined && !isNullableBoundedString(value.src, COURSE_EDIT_MAX_URL_CODE_UNITS)) return false;
  if (value.alt !== undefined && !isNullableBoundedString(value.alt, COURSE_EDIT_MAX_HTML_CODE_UNITS)) return false;
  if (value.title !== undefined && !isNullableBoundedString(value.title, COURSE_EDIT_MAX_HTML_CODE_UNITS)) return false;
  if (value.style !== undefined && !isCourseEditStylePatch(value.style)) return false;
  return Object.keys(value).length > 0;
}

export function isCourseEditTargetIdentity(value: unknown): value is CourseEditTargetIdentity {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["targetId", "projectSlug", "htmlPath", "nodeId", "sourceDigest", "elementDigest", "editId", "tagName", "adapter"]) &&
    isBoundedString(value.targetId, COURSE_EDIT_MAX_ID_CODE_UNITS, false) &&
    /^[a-f0-9]{24}$/.test(value.targetId) &&
    isBoundedString(value.projectSlug, COURSE_EDIT_MAX_ID_CODE_UNITS, false) &&
    /^[a-z0-9][a-z0-9._-]*$/i.test(value.projectSlug) &&
    isBoundedString(value.htmlPath, COURSE_EDIT_MAX_URL_CODE_UNITS, false) &&
    !value.htmlPath.startsWith("/") &&
    !value.htmlPath.split(/[\\/]/).includes("..") &&
    isBoundedString(value.nodeId, COURSE_EDIT_MAX_ID_CODE_UNITS, false) &&
    /^ch1:[a-f0-9]{24}:[1-9][0-9]*$/.test(value.nodeId) &&
    isBoundedString(value.sourceDigest, 64, false) &&
    /^[a-f0-9]{64}$/.test(value.sourceDigest) &&
    isBoundedString(value.elementDigest, 64, false) &&
    /^[a-f0-9]{64}$/.test(value.elementDigest) &&
    (value.editId === null || (isBoundedString(value.editId, COURSE_EDIT_MAX_ID_CODE_UNITS, false) && /^che[12]:[a-f0-9]{24}$/.test(value.editId))) &&
    isBoundedString(value.tagName, 24, false) &&
    isCourseEditAdapter(value.adapter)
  );
}

export function isCourseEditReopenRequest(value: unknown): value is CourseEditReopenRequest {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["schemaVersion", "identity"]) &&
    value.schemaVersion === COURSE_EDIT_SCHEMA_VERSION &&
    isCourseEditTargetIdentity(value.identity)
  );
}

export function isCourseEditPendingAssetReference(value: unknown): value is CourseEditPendingAssetReference {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, [
      "kind",
      "id",
      "previewSessionId",
      "digest",
      "finalSrc",
      "mimeType",
      "width",
      "height",
      "byteLength"
    ]) &&
    value.kind === "image" &&
    isBoundedString(value.id, 96, false) &&
    /^[A-Za-z0-9-]+$/.test(value.id) &&
    isBoundedString(value.previewSessionId, 96, false) &&
    /^[A-Za-z0-9-]+$/.test(value.previewSessionId) &&
    isBoundedString(value.digest, 64, false) &&
    /^[a-f0-9]{64}$/.test(value.digest) &&
    isBoundedString(value.finalSrc, COURSE_EDIT_MAX_URL_CODE_UNITS, false) &&
    !value.finalSrc.includes("\\") &&
    !value.finalSrc.includes("\0") &&
    ["image/png", "image/jpeg", "image/gif"].includes(String(value.mimeType)) &&
    typeof value.width === "number" &&
    Number.isSafeInteger(value.width) &&
    value.width > 0 &&
    value.width <= 12_000 &&
    typeof value.height === "number" &&
    Number.isSafeInteger(value.height) &&
    value.height > 0 &&
    value.height <= 12_000 &&
    typeof value.byteLength === "number" &&
    Number.isSafeInteger(value.byteLength) &&
    value.byteLength > 0 &&
    value.byteLength <= 10 * 1024 * 1024
  );
}

function isCourseEditDraftPageHref(value: unknown, projectSlug: string) {
  if (!isBoundedString(value, COURSE_EDIT_MAX_URL_CODE_UNITS, false)) return false;
  const normalized = normalizePreviewPageIdentity(value);
  if (!normalized || normalized !== value) return false;
  const capability = parsePreviewCapabilityPath(new URL(normalized).pathname);
  return capability?.scope === `project:workspace:${projectSlug}`;
}

export function isCourseEditDraft(value: unknown): value is CourseEditDraft {
  const baseline = isRecord(value) && isRecord(value.baseline) ? value.baseline : null;
  const attributes = baseline && isRecord(baseline.attributes) ? baseline.attributes : null;
  const currentStyle = baseline && isRecord(baseline.currentStyle) ? baseline.currentStyle : null;
  const capabilities = baseline && isRecord(baseline.capabilities) ? baseline.capabilities : null;
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["id", "createdAt", "updatedAt", "identity", "beforeText", "afterText", "baseline", "patch", "canonicalPatchDigest", "pendingAssets", "pageHref"]) &&
    isBoundedString(value.id, COURSE_EDIT_MAX_ID_CODE_UNITS, false) &&
    /^[A-Za-z0-9._-]+$/.test(value.id) &&
    typeof value.createdAt === "number" &&
    Number.isFinite(value.createdAt) &&
    typeof value.updatedAt === "number" &&
    Number.isFinite(value.updatedAt) &&
    isCourseEditTargetIdentity(value.identity) &&
    (value.pageHref === undefined || isCourseEditDraftPageHref(value.pageHref, value.identity.projectSlug)) &&
    isBoundedString(value.beforeText, COURSE_EDIT_MAX_HTML_CODE_UNITS) &&
    isBoundedString(value.afterText, COURSE_EDIT_MAX_HTML_CODE_UNITS) &&
    baseline !== null &&
    hasOnlyKeys(baseline, ["originalHtml", "attributes", "currentStyle", "capabilities"]) &&
    isBoundedString(baseline.originalHtml, COURSE_EDIT_MAX_HTML_CODE_UNITS) &&
    attributes !== null &&
    hasOnlyKeys(attributes, ["href", "src", "alt", "title"]) &&
    [attributes.href, attributes.src, attributes.alt, attributes.title].every((entry) => isBoundedString(entry, COURSE_EDIT_MAX_HTML_CODE_UNITS)) &&
    currentStyle !== null &&
    hasOnlyKeys(currentStyle, ["textStyle", "fontFamily", "fontSize", "textTone", "alignment", "spacing"]) &&
    isCourseEditStylePatch(currentStyle) &&
    Object.keys(currentStyle).length === 6 &&
    capabilities !== null &&
    hasOnlyKeys(capabilities, ["richText", "link", "image", "styles", "styleKeys"]) &&
    [capabilities.richText, capabilities.link, capabilities.image, capabilities.styles].every((entry) => typeof entry === "boolean") &&
    Array.isArray(capabilities.styleKeys) &&
    capabilities.styleKeys.every((entry) => ["textStyle", "fontFamily", "fontSize", "textTone", "alignment", "spacing"].includes(String(entry))) &&
    isCourseEditPatch(value.patch) &&
    (value.canonicalPatchDigest === undefined || (
      isBoundedString(value.canonicalPatchDigest, 64, false) && /^[a-f0-9]{64}$/.test(value.canonicalPatchDigest)
    )) &&
    (value.pendingAssets === undefined || (
      Array.isArray(value.pendingAssets) &&
      value.pendingAssets.length <= 1 &&
      value.pendingAssets.every(isCourseEditPendingAssetReference) &&
      new Set(value.pendingAssets.map((entry) => entry.id)).size === value.pendingAssets.length &&
      value.pendingAssets.every((entry) => (value.patch as CourseEditPatch).src === entry.finalSrc)
    ))
  );
}

function isCourseEditPreviewBinding(value: unknown) {
  return (
    isRecord(value) &&
    isBoundedString(value.previewSessionId, 96, false) &&
    /^[A-Za-z0-9-]+$/.test(value.previewSessionId) &&
    typeof value.revision === "number" &&
    Number.isSafeInteger(value.revision) &&
    value.revision > 0 &&
    isBoundedString(value.projectSlug, COURSE_EDIT_MAX_ID_CODE_UNITS, false) &&
    /^[a-z0-9][a-z0-9._-]*$/i.test(value.projectSlug) &&
    isBoundedString(value.pageIdentity, COURSE_EDIT_MAX_URL_CODE_UNITS, false) &&
    isBoundedString(value.mapSourceDigest, 64, false) &&
    /^[a-f0-9]{64}$/.test(value.mapSourceDigest) &&
    isBoundedString(value.targetNodeId, COURSE_EDIT_MAX_ID_CODE_UNITS, false) &&
    /^ch1:[a-f0-9]{24}:[1-9][0-9]*$/.test(value.targetNodeId)
  );
}

export function isCourseEditPreviewNormalizeRequest(value: unknown): value is CourseEditPreviewNormalizeRequest {
  const request = isRecord(value) ? value : null;
  return (
    request !== null &&
    isCourseEditPreviewBinding(request) &&
    hasOnlyKeys(request, [
      "schemaVersion",
      "previewSessionId",
      "revision",
      "projectSlug",
      "pageIdentity",
      "mapSourceDigest",
      "targetNodeId",
      "identity",
      "patch",
      "pendingAssets"
    ]) &&
    request.schemaVersion === COURSE_EDIT_PREVIEW_SCHEMA_VERSION &&
    isCourseEditTargetIdentity(request.identity) &&
    request.identity.projectSlug === request.projectSlug &&
    request.identity.sourceDigest === request.mapSourceDigest &&
    request.identity.nodeId === request.targetNodeId &&
    isCourseEditPatch(request.patch) &&
    (request.pendingAssets === undefined || (
      Array.isArray(request.pendingAssets) &&
      request.pendingAssets.length <= 1 &&
      request.pendingAssets.every(isCourseEditPendingAssetReference) &&
      request.pendingAssets.every((entry) => (request.patch as CourseEditPatch).src === entry.finalSrc)
    ))
  );
}

export function isCourseEditPreviewClearRequest(value: unknown): value is CourseEditPreviewClearRequest {
  const request = isRecord(value) ? value : null;
  return (
    request !== null &&
    isCourseEditPreviewBinding(request) &&
    hasOnlyKeys(request, [
      "schemaVersion",
      "previewSessionId",
      "revision",
      "projectSlug",
      "pageIdentity",
      "mapSourceDigest",
      "targetNodeId",
      "retainPendingAssetIds"
    ]) &&
    request.schemaVersion === COURSE_EDIT_PREVIEW_SCHEMA_VERSION &&
    (request.retainPendingAssetIds === undefined || (
      Array.isArray(request.retainPendingAssetIds) &&
      request.retainPendingAssetIds.length <= 5 &&
      new Set(request.retainPendingAssetIds).size === request.retainPendingAssetIds.length &&
      request.retainPendingAssetIds.every((entry) => (
        isBoundedString(entry, 96, false) && /^[A-Za-z0-9-]+$/.test(entry)
      ))
    ))
  );
}

export function isCourseEditApplyRequest(value: unknown): value is CourseEditApplyRequest {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["schemaVersion", "projectSlug", "drafts"]) &&
    value.schemaVersion === COURSE_EDIT_SCHEMA_VERSION &&
    isBoundedString(value.projectSlug, COURSE_EDIT_MAX_ID_CODE_UNITS, false) &&
    /^[a-z0-9][a-z0-9._-]*$/i.test(value.projectSlug) &&
    Array.isArray(value.drafts) &&
    value.drafts.length > 0 &&
    value.drafts.length <= COURSE_EDIT_MAX_DRAFTS &&
    value.drafts.every(isCourseEditDraft) &&
    value.drafts.every((draft) => draft.identity.projectSlug === value.projectSlug) &&
    new Set(value.drafts.map((draft) => draft.identity.targetId)).size === value.drafts.length
  );
}
