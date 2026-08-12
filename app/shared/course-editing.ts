import type { InspectionResolveRequest } from "./inspection.js";

export const COURSE_EDIT_SCHEMA_VERSION = 1;
export const COURSE_EDIT_MAX_DRAFTS = 20;
export const COURSE_EDIT_MAX_HTML_CODE_UNITS = 24_000;
export const COURSE_EDIT_MAX_URL_CODE_UNITS = 2_048;
export const COURSE_EDIT_MAX_STATUS_CODE_UNITS = 240;
export const COURSE_EDIT_MAX_ID_CODE_UNITS = 160;

export const COURSE_EDIT_TEXT_STYLES = ["default", "heading", "subheading", "body", "caption"] as const;
export const COURSE_EDIT_FONT_FAMILIES = ["default", "readable-sans", "book-serif"] as const;
export const COURSE_EDIT_FONT_SIZES = ["default", "small", "large", "x-large"] as const;
export const COURSE_EDIT_TEXT_TONES = ["default", "ink", "muted", "accent"] as const;
export const COURSE_EDIT_ALIGNMENTS = ["default", "left", "center", "right"] as const;
export const COURSE_EDIT_SPACING = ["default", "compact", "relaxed"] as const;

export type CourseEditAdapter = "direct" | "english-factory" | "social-related-issues";
export type CourseEditEligibility = "editable" | "unsupported";
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

export type CourseEditResolveRequest = InspectionResolveRequest;

export type CourseEditDraft = {
  id: string;
  createdAt: number;
  updatedAt: number;
  identity: CourseEditTargetIdentity;
  beforeText: string;
  afterText: string;
  patch: CourseEditPatch;
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
  canUndo: boolean;
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
    hasOnlyKeys(value, ["targetId", "projectSlug", "htmlPath", "nodeId", "sourceDigest", "editId", "tagName", "adapter"]) &&
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
    (value.editId === null || (isBoundedString(value.editId, COURSE_EDIT_MAX_ID_CODE_UNITS, false) && /^che1:[a-f0-9]{24}$/.test(value.editId))) &&
    isBoundedString(value.tagName, 24, false) &&
    ["direct", "english-factory", "social-related-issues"].includes(String(value.adapter))
  );
}

export function isCourseEditDraft(value: unknown): value is CourseEditDraft {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["id", "createdAt", "updatedAt", "identity", "beforeText", "afterText", "patch"]) &&
    isBoundedString(value.id, COURSE_EDIT_MAX_ID_CODE_UNITS, false) &&
    /^[A-Za-z0-9._-]+$/.test(value.id) &&
    typeof value.createdAt === "number" &&
    Number.isFinite(value.createdAt) &&
    typeof value.updatedAt === "number" &&
    Number.isFinite(value.updatedAt) &&
    isCourseEditTargetIdentity(value.identity) &&
    isBoundedString(value.beforeText, COURSE_EDIT_MAX_HTML_CODE_UNITS) &&
    isBoundedString(value.afterText, COURSE_EDIT_MAX_HTML_CODE_UNITS) &&
    isCourseEditPatch(value.patch)
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
