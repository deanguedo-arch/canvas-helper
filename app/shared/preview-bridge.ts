import { isPreviewContentHealth } from "./preview-health.js";
import {
  COURSE_EDIT_MAX_DRAFTS,
  COURSE_EDIT_MAX_EDITOR_TEXT_CODE_UNITS,
  COURSE_EDIT_MAX_HTML_CODE_UNITS,
  COURSE_EDIT_MAX_ID_CODE_UNITS,
  COURSE_EDIT_MAX_STATUS_CODE_UNITS,
  COURSE_EDIT_MAX_URL_CODE_UNITS,
  isCourseEditPatch,
  isCourseEditStylePatch,
  type CourseEditCapabilities,
  type CourseEditDraftBaseline,
  type CourseEditPatch,
  type CourseEditPreviewRepresentation,
  type CourseEditStylePatch
} from "./course-editing.js";
import { STUDIO_BRIDGE_LIMITS, STUDIO_REVIEW_LIMITS } from "./studio-quality.js";
import { isCapabilityWorkspacePreviewPath } from "./preview-path.js";

export const PREVIEW_BRIDGE_PROTOCOL = "canvas-helper.preview";
export const PREVIEW_BRIDGE_VERSION = 1;
export const PREVIEW_BRIDGE_MAX_MESSAGE_BYTES = STUDIO_BRIDGE_LIMITS.messageUtf8Bytes;
export const PREVIEW_BRIDGE_MAX_VISIBLE_TEXT = STUDIO_BRIDGE_LIMITS.visibleTextCodeUnits;
export const PREVIEW_BRIDGE_MAX_CONTAINERS = STUDIO_BRIDGE_LIMITS.scrollContainers;
export const PREVIEW_BRIDGE_BOOTSTRAP_TYPE = "studio-connect";
export const PREVIEW_STANDALONE_BOOTSTRAP_TYPE = "studio-connect-standalone";
export const PREVIEW_STANDALONE_HOST_BOOTSTRAP_TYPE = "studio-connect-standalone-host";
export const PREVIEW_STANDALONE_HOST_REJOIN_TYPE = "studio-rejoin-standalone-host";
export const PREVIEW_STANDALONE_SESSION_PARAM = "canvas-helper-inspect-session";
export const PREVIEW_STANDALONE_REJOIN_PARAM = "canvas-helper-inspect-rejoin";
export const PREVIEW_STANDALONE_SESSION_TOKEN_MAX_LENGTH = STUDIO_BRIDGE_LIMITS.standaloneSessionTokenCodeUnits;
export const PREVIEW_REVIEW_MAX_ITEMS = STUDIO_REVIEW_LIMITS.itemsPerSession;
export const PREVIEW_REVIEW_MAX_SCREENSHOTS = STUDIO_REVIEW_LIMITS.screenshotsPerItem;
export const PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH = STUDIO_BRIDGE_LIMITS.reviewItemIdCodeUnits;
export const PREVIEW_REVIEW_NOTE_MAX_LENGTH = STUDIO_BRIDGE_LIMITS.reviewNoteCodeUnits;
export const PREVIEW_REVIEW_EXCERPT_MAX_LENGTH = STUDIO_BRIDGE_LIMITS.reviewExcerptCodeUnits;
export const PREVIEW_REVIEW_STATUS_MAX_LENGTH = STUDIO_BRIDGE_LIMITS.reviewStatusCodeUnits;
export const PREVIEW_REVIEW_PACKET_MAX_LENGTH = STUDIO_BRIDGE_LIMITS.reviewPacketCodeUnits;
export const PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH = STUDIO_BRIDGE_LIMITS.inspectRequestIdCodeUnits;

export const PREVIEW_EVENT_TYPES = [
  "preview-ready",
  "preview-scroll-state",
  "preview-navigation",
  "preview-inspect-hover",
  "preview-inspect-selected",
  "preview-inspect-current",
  "preview-inspect-focused",
  "preview-inspect-mode",
  "preview-edit-preview-ack",
  "preview-edit-action",
  "preview-inline-editor-action",
  "preview-review-action",
  "preview-return-to-studio",
  "preview-health",
  "preview-diagnostic",
  "preview-error"
] as const;

export const STUDIO_COMMAND_TYPES = [
  "studio-request-state",
  "studio-restore-scroll",
  "studio-set-inspect-mode",
  "studio-set-edit-visual-mode",
  "studio-set-edit-preview",
  "studio-set-inline-editor",
  "studio-request-inspect-current",
  "studio-focus-inspect-node",
  "studio-show-inspect-node",
  "studio-refresh-preview",
  "studio-disconnect-standalone",
  "studio-cancel-review-copy",
  "studio-set-review-state",
  "studio-set-review-packet",
  "studio-review-action-result",
  "studio-set-edit-state",
  "studio-edit-action-result"
] as const;

export type PreviewEventType = (typeof PREVIEW_EVENT_TYPES)[number];
export type StudioCommandType = (typeof STUDIO_COMMAND_TYPES)[number];
export type PreviewBridgeMessageType = PreviewEventType | StudioCommandType;

export type PreviewScrollContainer = {
  selector: string;
  top: number;
  left: number;
};

export type PreviewScrollState = {
  windowTop: number;
  windowLeft: number;
  containers: PreviewScrollContainer[];
};

export type PreviewGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PreviewViewport = {
  width: number;
  height: number;
};

/**
 * Bounded, presentation-only values reported from the isolated learner frame
 * so Studio can position its own editor without receiving selectors, CSS
 * declarations, script, or keyboard events from the learner page.
 */
export type SafePresentationSnapshot = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: "normal" | "italic" | "oblique";
  lineHeight: string;
  letterSpacing: string;
  textAlign: "left" | "right" | "center" | "justify" | "start" | "end";
  color: string;
  whiteSpace: "normal" | "pre" | "pre-wrap" | "pre-line" | "nowrap";
};

export type PreviewInlineTargetState = {
  schemaVersion: typeof PREVIEW_BRIDGE_VERSION;
  targetNodeId: string;
  geometry: PreviewGeometry;
  viewport: PreviewViewport;
  visible: boolean;
  presentation: SafePresentationSnapshot;
};

/**
 * A Studio-owned text layer for the standalone Full Preview host. The learner
 * document receives only opaque geometry and never receives keyboard input.
 */
export type PreviewInlineEditorStatus = "clean" | "editing" | "normalizing" | "valid" | "invalid" | "saved";

export type PreviewInlineEditorCommand = {
  schemaVersion: typeof PREVIEW_BRIDGE_VERSION;
  active: boolean;
  sessionId: string;
  revision: number;
  targetId: string;
  target: PreviewInlineTargetState | null;
  text: string;
  allowsLineBreaks: boolean;
  status: PreviewInlineEditorStatus;
};

export type PreviewInlineEditorAction = (
  | { action: "input"; sessionId: string; revision: number; targetId: string; text: string }
  | { action: "save"; sessionId: string; revision: number; targetId: string }
  | { action: "cancel"; sessionId: string; revision: number; targetId: string }
) & { requestId?: string };

export type PreviewInspectPayload = {
  nodeId: string | null;
  selectionKind?: "element" | "area";
  visibleText: string;
  tagName: string;
  role: string;
  testId: string;
  geometry: PreviewGeometry;
  viewport: PreviewViewport;
  scroll: PreviewScrollState;
  pageHref: string;
  interactionStartedAt?: number;
  rendered?: {
    textFingerprint: string;
    textLength: number;
    attributes: {
      href: string;
      src: string;
      alt: string;
      title: string;
    };
  };
  presentation?: SafePresentationSnapshot;
};

export type PreviewInspectCurrentPayload = {
  requestId: string;
  selection: PreviewInspectPayload;
};

export type PreviewInspectFocusedPayload = {
  requestId: string;
  nodeId: string;
  focused: boolean;
};

export type PreviewDiagnostic = {
  kind: "runtime-error" | "unhandled-rejection" | "asset-error";
  message: string;
  href: string;
};

export type PreviewReviewAction = (
  | { action: "request-state" }
  | { action: "begin-copy"; copyId: string; itemIds: string[]; packetId: string; reviewSessionId: string }
  | { action: "cancel-copy"; copyId: string; itemIds: string[]; packetId: string; reviewSessionId: string }
  | { action: "mark-sent"; copyId?: string; itemIds: string[]; packetId: string; reviewSessionId: string }
  | { action: "undo" }
  | { action: "cancel-capture" }
  | { action: "add"; selection: PreviewInspectPayload; teacherNote: string }
  | { action: "capture-draft"; selection: PreviewInspectPayload }
  | { action: "capture-item"; itemId: string }
  | { action: "focus-item"; itemId: string }
  | { action: "accept-item"; itemId: string }
  | { action: "reopen-item"; itemId: string }
  | { action: "remove"; itemId: string }
  | { action: "remove-screenshot"; itemId: string; screenshotId: string }
  | { action: "update-note"; itemId: string; teacherNote: string }
  | { action: "clear" }
) & { requestId?: string };

export type PreviewReviewPacket = {
  packet: string;
  packetId: string;
  itemIds: string[];
  reviewSessionId: string;
};

export type PreviewReviewScreenshotSummary = {
  id: string;
  filePath: string;
  ownerNodeId: string;
};

export type PreviewReviewItemSummary = {
  id: string;
  projectSlug: string;
  nodeId: string;
  excerpt: string;
  teacherNote: string;
  handoffState: "draft" | "sent" | "accepted" | "reopened";
  screenshots: PreviewReviewScreenshotSummary[];
};

export type PreviewReviewState = {
  sessionId: string;
  items: PreviewReviewItemSummary[];
  draftScreenshotCount: number;
  captureItemId: string;
  saving: boolean;
  copying: boolean;
  preparing: boolean;
  packetReady: boolean;
  status: string;
  error: string;
  undoLabel?: string;
};

export type PreviewReviewActionResult = {
  ok: boolean;
  message: string;
  clearDraft: boolean;
  requestId?: string;
};

export type PreviewCourseEditTarget = {
  eligibility: "editable" | "unsupported";
  reason: string;
  targetId: string;
  tagName: string;
  originalHtml: string;
  originalText: string;
  capabilities: CourseEditCapabilities;
  attributes: { href: string; src: string; alt: string; title: string };
  currentStyle: Required<CourseEditStylePatch>;
};

export type PreviewCourseEditDraftSummary = {
  id: string;
  targetId: string;
  tagName: string;
  beforeText: string;
  afterText: string;
};

export type PreviewCourseEditDraftDetail = PreviewCourseEditDraftSummary & {
  baseline: CourseEditDraftBaseline;
  patch: CourseEditPatch;
};

export type PreviewCourseEditState = {
  projectSlug: string;
  enabled: boolean;
  available: boolean;
  unavailableReason: string;
  target: PreviewCourseEditTarget | null;
  drafts: PreviewCourseEditDraftSummary[];
  selectedDraft: PreviewCourseEditDraftDetail | null;
  busy: boolean;
  canUndo: boolean;
  exportsOutOfDate: boolean;
  staleExportTargets: string[];
  status: string;
  error: string;
};

export type PreviewCourseEditAction = (
  | { action: "request-state" }
  | { action: "set-mode"; enabled: boolean; nextMode?: "off" | "annotate" }
  | { action: "annotate-selection"; selection: PreviewInspectPayload }
  | { action: "preview-target"; targetId: string; patch: CourseEditPatch }
  | { action: "clear-preview"; targetId: string }
  | { action: "save-target"; targetId: string; patch: CourseEditPatch }
  | { action: "select-draft"; draftId: string }
  | { action: "reopen-draft"; draftId: string }
  | { action: "update-draft"; draftId: string; patch: CourseEditPatch }
  | { action: "remove-draft"; draftId: string }
  | { action: "reorder-draft"; draftId: string; direction: -1 | 1 }
  | { action: "apply" }
  | { action: "undo" }
) & { requestId?: string };

export type PreviewCourseEditActionResult = {
  ok: boolean;
  message: string;
  requestId?: string;
};

export type PreviewCourseEditCommand = {
  action: "render" | "clear";
  previewSessionId: string;
  revision: number;
  projectSlug: string;
  pageIdentity: string;
  mapSourceDigest: string;
  targetNodeId: string;
  canonicalPatchDigest: string;
  representation: CourseEditPreviewRepresentation | null;
};

export type PreviewCourseEditAck = Omit<PreviewCourseEditCommand, "representation" | "action"> & {
  action: "rendered" | "cleared" | "rejected";
  ok: boolean;
  message: string;
  acknowledgedAt: number;
};

export type PreviewBridgeMessage = {
  protocol: typeof PREVIEW_BRIDGE_PROTOCOL;
  version: typeof PREVIEW_BRIDGE_VERSION;
  type: PreviewBridgeMessageType;
  payload: unknown;
};

export type PreviewBridgeBootstrap = {
  protocol: typeof PREVIEW_BRIDGE_PROTOCOL;
  version: typeof PREVIEW_BRIDGE_VERSION;
  type: typeof PREVIEW_BRIDGE_BOOTSTRAP_TYPE;
  payload: null;
};

export type PreviewStandaloneBridgeBootstrap = {
  protocol: typeof PREVIEW_BRIDGE_PROTOCOL;
  version: typeof PREVIEW_BRIDGE_VERSION;
  type: typeof PREVIEW_STANDALONE_BOOTSTRAP_TYPE;
  payload: {
    sessionToken: string;
  };
};

export type PreviewStandaloneHostBridgeBootstrap = {
  protocol: typeof PREVIEW_BRIDGE_PROTOCOL;
  version: typeof PREVIEW_BRIDGE_VERSION;
  type: typeof PREVIEW_STANDALONE_HOST_BOOTSTRAP_TYPE;
  payload: {
    sessionToken: string;
    rejoinToken: string;
  };
};

export type PreviewStandaloneHostRejoin = {
  protocol: typeof PREVIEW_BRIDGE_PROTOCOL;
  version: typeof PREVIEW_BRIDGE_VERSION;
  type: typeof PREVIEW_STANDALONE_HOST_REJOIN_TYPE;
  payload: {
    rejoinToken: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isBoundedString(value: unknown, maximumLength: number): value is string {
  return typeof value === "string" && value.length <= maximumLength;
}

function isBoundedNonEmptyString(value: unknown, maximumLength: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximumLength;
}

function isReviewScreenshotPath(value: unknown) {
  const sessionRange = `{${STUDIO_REVIEW_LIMITS.sessionIdMinCodeUnits},${STUDIO_REVIEW_LIMITS.sessionIdMaxCodeUnits}}`;
  return (
    typeof value === "string" &&
    new RegExp(`^\\.runtime/studio-review-sets/[A-Za-z0-9-]${sessionRange}/[A-Za-z0-9._-]+\\.png$`).test(value)
  );
}

export function isPreviewStandaloneSessionToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= STUDIO_BRIDGE_LIMITS.standaloneSessionTokenMinCodeUnits &&
    value.length <= PREVIEW_STANDALONE_SESSION_TOKEN_MAX_LENGTH &&
    /^[A-Za-z0-9-]+$/.test(value)
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 10_000_000;
}

function isGeometry(value: unknown): value is PreviewGeometry {
  if (!isRecord(value)) {
    return false;
  }
  const { x, y, width, height } = value;
  return isFiniteNumber(x) && isFiniteNumber(y) && isFiniteNumber(width) && isFiniteNumber(height) && width >= 0 && height >= 0;
}

function isViewport(value: unknown): value is PreviewViewport {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.width === "number" &&
    Number.isInteger(value.width) &&
    value.width >= 240 &&
    value.width <= 2_560 &&
    typeof value.height === "number" &&
    Number.isInteger(value.height) &&
    value.height >= 240 &&
    value.height <= 2_000
  );
}

function isSafePresentationValue(value: unknown, maximum = 240) {
  return (
    typeof value === "string" &&
    isBoundedString(value, maximum) &&
    !/[;{}<>]/.test(value) &&
    !/(?:url|expression|@import)\s*\(/i.test(value)
  );
}

function isSafePresentationSnapshot(value: unknown): value is SafePresentationSnapshot {
  if (!isRecord(value)) return false;
  const fontStyle = value.fontStyle;
  const textAlign = value.textAlign;
  const whiteSpace = value.whiteSpace;
  return (
    hasOnlyKeys(value, ["fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight", "letterSpacing", "textAlign", "color", "whiteSpace"]) &&
    isSafePresentationValue(value.fontFamily) &&
    isSafePresentationValue(value.fontSize, 32) &&
    isSafePresentationValue(value.fontWeight, 32) &&
    (fontStyle === "normal" || fontStyle === "italic" || fontStyle === "oblique") &&
    isSafePresentationValue(value.lineHeight, 32) &&
    isSafePresentationValue(value.letterSpacing, 32) &&
    ["left", "right", "center", "justify", "start", "end"].includes(String(textAlign)) &&
    isSafePresentationValue(value.color, 64) &&
    ["normal", "pre", "pre-wrap", "pre-line", "nowrap"].includes(String(whiteSpace))
  );
}

function isPreviewInlineTargetState(value: unknown): value is PreviewInlineTargetState {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["schemaVersion", "targetNodeId", "geometry", "viewport", "visible", "presentation"]) &&
    value.schemaVersion === PREVIEW_BRIDGE_VERSION &&
    isBoundedNonEmptyString(value.targetNodeId, STUDIO_REVIEW_LIMITS.identifierCodeUnits) &&
    isGeometry(value.geometry) &&
    isViewport(value.viewport) &&
    typeof value.visible === "boolean" &&
    isSafePresentationSnapshot(value.presentation)
  );
}

export function isPreviewInlineEditorCommand(value: unknown): value is PreviewInlineEditorCommand {
  if (!isRecord(value)) return false;
  const { schemaVersion, active, sessionId, revision, targetId, target, text, allowsLineBreaks, status } = value;
  if (
    !hasOnlyKeys(value, ["schemaVersion", "active", "sessionId", "revision", "targetId", "target", "text", "allowsLineBreaks", "status"]) ||
    schemaVersion !== PREVIEW_BRIDGE_VERSION ||
    typeof active !== "boolean" ||
    typeof revision !== "number" ||
    !Number.isSafeInteger(revision) ||
    revision < 0 ||
    typeof allowsLineBreaks !== "boolean" ||
    typeof status !== "string" ||
    !["clean", "editing", "normalizing", "valid", "invalid", "saved"].includes(status)
  ) return false;
  if (active === false) {
    return (
      sessionId === "" &&
      targetId === "" &&
      target === null &&
      text === "" &&
      allowsLineBreaks === false &&
      status === "clean"
    );
  }
  return (
    isBoundedNonEmptyString(sessionId, 96) &&
    /^[A-Za-z0-9-]+$/.test(sessionId) &&
    revision > 0 &&
    isBoundedNonEmptyString(targetId, COURSE_EDIT_MAX_ID_CODE_UNITS) &&
    /^[a-f0-9]{24}$/.test(targetId) &&
    isPreviewInlineTargetState(target) &&
    isBoundedString(text, COURSE_EDIT_MAX_EDITOR_TEXT_CODE_UNITS)
  );
}

export function isPreviewInlineEditorAction(value: unknown): value is PreviewInlineEditorAction {
  if (!isRecord(value)) return false;
  const { action, requestId, sessionId, revision, targetId, text } = value;
  if (
    typeof action !== "string" ||
    (requestId !== undefined && !isBoundedNonEmptyString(requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH)) ||
    !isBoundedNonEmptyString(sessionId, 96) ||
    !/^[A-Za-z0-9-]+$/.test(sessionId) ||
    typeof revision !== "number" ||
    !Number.isSafeInteger(revision) ||
    revision <= 0 ||
    !isBoundedNonEmptyString(targetId, COURSE_EDIT_MAX_ID_CODE_UNITS) ||
    !/^[a-f0-9]{24}$/.test(targetId)
  ) return false;
  if (action === "input") {
    return hasOnlyKeys(value, ["action", "requestId", "sessionId", "revision", "targetId", "text"]) && isBoundedString(text, COURSE_EDIT_MAX_EDITOR_TEXT_CODE_UNITS);
  }
  return (
    (action === "save" || action === "cancel") &&
    hasOnlyKeys(value, ["action", "requestId", "sessionId", "revision", "targetId"])
  );
}

export function isPreviewScrollState(value: unknown): value is PreviewScrollState {
  if (!isRecord(value) || !isFiniteNumber(value.windowTop) || !isFiniteNumber(value.windowLeft) || !Array.isArray(value.containers)) {
    return false;
  }

  return (
    value.containers.length <= PREVIEW_BRIDGE_MAX_CONTAINERS &&
    value.containers.every(
      (container) =>
        isRecord(container) &&
        isBoundedString(container.selector, STUDIO_BRIDGE_LIMITS.scrollSelectorCodeUnits) &&
        isFiniteNumber(container.top) &&
        isFiniteNumber(container.left)
    )
  );
}

export function isPreviewInspectPayload(value: unknown): value is PreviewInspectPayload {
  const rendered = isRecord(value) && isRecord(value.rendered) ? value.rendered : null;
  const renderedAttributes = rendered && isRecord(rendered.attributes) ? rendered.attributes : null;
  return (
    isRecord(value) &&
    (value.nodeId === null || isBoundedString(value.nodeId, STUDIO_REVIEW_LIMITS.identifierCodeUnits)) &&
    (value.selectionKind === undefined || value.selectionKind === "element" || value.selectionKind === "area") &&
    isBoundedString(value.visibleText, PREVIEW_BRIDGE_MAX_VISIBLE_TEXT) &&
    isBoundedString(value.tagName, STUDIO_BRIDGE_LIMITS.elementTagCodeUnits) &&
    isBoundedString(value.role, STUDIO_BRIDGE_LIMITS.elementRoleCodeUnits) &&
    isBoundedString(value.testId, STUDIO_BRIDGE_LIMITS.elementTestIdCodeUnits) &&
    isGeometry(value.geometry) &&
    isViewport(value.viewport) &&
    isPreviewScrollState(value.scroll) &&
    isBoundedNonEmptyString(value.pageHref, STUDIO_BRIDGE_LIMITS.courseUrlCodeUnits) &&
    (
      value.rendered === undefined || (
        rendered !== null &&
        /^[a-f0-9]{8}$/.test(String(rendered.textFingerprint)) &&
        typeof rendered.textLength === "number" &&
        Number.isInteger(rendered.textLength) &&
        rendered.textLength >= 0 &&
        rendered.textLength <= COURSE_EDIT_MAX_HTML_CODE_UNITS &&
        renderedAttributes !== null &&
        ["href", "src", "alt", "title"].every((name) =>
          isBoundedString(renderedAttributes[name], COURSE_EDIT_MAX_URL_CODE_UNITS)
        )
      )
    ) &&
    (value.presentation === undefined || isSafePresentationSnapshot(value.presentation)) &&
    (
      value.interactionStartedAt === undefined ||
      (typeof value.interactionStartedAt === "number" && Number.isFinite(value.interactionStartedAt) && value.interactionStartedAt >= 0)
    )
  );
}

export function isPreviewReviewAction(value: unknown): value is PreviewReviewAction {
  if (!isRecord(value) || typeof value.action !== "string") {
    return false;
  }
  if (value.requestId !== undefined && !isBoundedNonEmptyString(value.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH)) {
    return false;
  }
  switch (value.action) {
    case "request-state":
    case "clear":
    case "undo":
    case "cancel-capture":
      return true;
    case "begin-copy":
    case "cancel-copy":
    case "mark-sent":
      return (
        Array.isArray(value.itemIds) &&
        value.itemIds.length > 0 &&
        value.itemIds.length <= PREVIEW_REVIEW_MAX_ITEMS &&
        new Set(value.itemIds).size === value.itemIds.length &&
        value.itemIds.every((itemId) => isBoundedNonEmptyString(itemId, PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH)) &&
        (
          value.action === "mark-sent"
            ? value.copyId === undefined || isBoundedNonEmptyString(value.copyId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH)
            : isBoundedNonEmptyString(value.copyId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH)
        ) &&
        typeof value.packetId === "string" &&
        /^[a-f0-9]{16}$/.test(value.packetId) &&
        isPreviewStandaloneSessionToken(value.reviewSessionId)
      );
    case "add":
      return isPreviewInspectPayload(value.selection) && isBoundedString(value.teacherNote, PREVIEW_REVIEW_NOTE_MAX_LENGTH);
    case "capture-draft":
      return isPreviewInspectPayload(value.selection);
    case "capture-item":
    case "focus-item":
    case "accept-item":
    case "reopen-item":
    case "remove":
      return isBoundedNonEmptyString(value.itemId, PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH);
    case "remove-screenshot":
      return (
        isBoundedNonEmptyString(value.itemId, PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH) &&
        isBoundedNonEmptyString(value.screenshotId, PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH)
      );
    case "update-note":
      return (
        isBoundedNonEmptyString(value.itemId, PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH) &&
        isBoundedString(value.teacherNote, PREVIEW_REVIEW_NOTE_MAX_LENGTH)
      );
    default:
      return false;
  }
}

export function isPreviewReviewState(value: unknown): value is PreviewReviewState {
  return (
    isRecord(value) &&
    isPreviewStandaloneSessionToken(value.sessionId) &&
    Array.isArray(value.items) &&
    value.items.length <= PREVIEW_REVIEW_MAX_ITEMS &&
    value.items.every(
      (item) =>
        isRecord(item) &&
        isBoundedNonEmptyString(item.id, PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH) &&
        isBoundedNonEmptyString(item.projectSlug, STUDIO_REVIEW_LIMITS.identifierCodeUnits) &&
        isBoundedNonEmptyString(item.nodeId, STUDIO_REVIEW_LIMITS.identifierCodeUnits) &&
        isBoundedString(item.excerpt, PREVIEW_REVIEW_EXCERPT_MAX_LENGTH) &&
        isBoundedString(item.teacherNote, PREVIEW_REVIEW_NOTE_MAX_LENGTH) &&
        ["draft", "sent", "accepted", "reopened"].includes(String(item.handoffState)) &&
        Array.isArray(item.screenshots) &&
        item.screenshots.length <= PREVIEW_REVIEW_MAX_SCREENSHOTS &&
        item.screenshots.every(
          (screenshot) =>
            isRecord(screenshot) &&
            isBoundedNonEmptyString(screenshot.id, PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH) &&
            isReviewScreenshotPath(screenshot.filePath) &&
            isBoundedNonEmptyString(screenshot.ownerNodeId, STUDIO_REVIEW_LIMITS.identifierCodeUnits)
        )
    ) &&
    typeof value.draftScreenshotCount === "number" &&
    Number.isInteger(value.draftScreenshotCount) &&
    value.draftScreenshotCount >= 0 &&
    value.draftScreenshotCount <= PREVIEW_REVIEW_MAX_SCREENSHOTS &&
    isBoundedString(value.captureItemId, PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH) &&
    typeof value.saving === "boolean" &&
    typeof value.copying === "boolean" &&
    typeof value.preparing === "boolean" &&
    typeof value.packetReady === "boolean" &&
    isBoundedString(value.status, PREVIEW_REVIEW_STATUS_MAX_LENGTH) &&
    isBoundedString(value.error, PREVIEW_REVIEW_STATUS_MAX_LENGTH) &&
    (value.undoLabel === undefined || isBoundedString(value.undoLabel, STUDIO_BRIDGE_LIMITS.reviewSessionNameCodeUnits))
  );
}

export function isPreviewReviewActionResult(value: unknown): value is PreviewReviewActionResult {
  return (
    isRecord(value) &&
    typeof value.ok === "boolean" &&
    isBoundedString(value.message, PREVIEW_REVIEW_STATUS_MAX_LENGTH) &&
    typeof value.clearDraft === "boolean" &&
    (value.requestId === undefined || isBoundedNonEmptyString(value.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH))
  );
}

function isCourseEditCapabilities(value: unknown): value is CourseEditCapabilities {
  return (
    isRecord(value) &&
    Object.keys(value).every((key) => ["richText", "link", "image", "styles", "styleKeys"].includes(key)) &&
    typeof value.richText === "boolean" &&
    typeof value.link === "boolean" &&
    typeof value.image === "boolean" &&
    typeof value.styles === "boolean" &&
    Array.isArray(value.styleKeys) &&
    value.styleKeys.every((entry) => ["textStyle", "fontFamily", "fontSize", "textTone", "alignment", "spacing"].includes(String(entry)))
  );
}

function isCourseEditAttributes(value: unknown): value is PreviewCourseEditTarget["attributes"] {
  return (
    isRecord(value) &&
    Object.keys(value).every((key) => ["href", "src", "alt", "title"].includes(key)) &&
    isBoundedString(value.href, COURSE_EDIT_MAX_URL_CODE_UNITS) &&
    isBoundedString(value.src, COURSE_EDIT_MAX_URL_CODE_UNITS) &&
    isBoundedString(value.alt, COURSE_EDIT_MAX_HTML_CODE_UNITS) &&
    isBoundedString(value.title, COURSE_EDIT_MAX_HTML_CODE_UNITS)
  );
}

function isPreviewCourseEditTarget(value: unknown): value is PreviewCourseEditTarget {
  if (!isRecord(value)) return false;
  const targetId = value.targetId;
  return (
    Object.keys(value).every((key) => ["eligibility", "reason", "targetId", "tagName", "originalHtml", "originalText", "capabilities", "attributes", "currentStyle"].includes(key)) &&
    (value.eligibility === "editable" || value.eligibility === "unsupported") &&
    isBoundedString(value.reason, COURSE_EDIT_MAX_STATUS_CODE_UNITS) &&
    (targetId === "" || (isBoundedString(targetId, COURSE_EDIT_MAX_ID_CODE_UNITS) && /^[a-f0-9]{24}$/.test(targetId as string))) &&
    isBoundedString(value.tagName, 24) &&
    isBoundedString(value.originalHtml, COURSE_EDIT_MAX_HTML_CODE_UNITS) &&
    isBoundedString(value.originalText, COURSE_EDIT_MAX_HTML_CODE_UNITS) &&
    isCourseEditCapabilities(value.capabilities) &&
    isCourseEditAttributes(value.attributes) &&
    isCourseEditStylePatch(value.currentStyle)
  );
}

function isPreviewCourseEditDraftSummary(value: unknown): value is PreviewCourseEditDraftSummary {
  if (!isRecord(value)) return false;
  const targetId = value.targetId;
  return (
    Object.keys(value).every((key) => ["id", "targetId", "tagName", "beforeText", "afterText", "baseline", "patch"].includes(key)) &&
    isBoundedNonEmptyString(value.id, COURSE_EDIT_MAX_ID_CODE_UNITS) &&
    isBoundedNonEmptyString(targetId, COURSE_EDIT_MAX_ID_CODE_UNITS) &&
    /^[a-f0-9]{24}$/.test(targetId as string) &&
    isBoundedNonEmptyString(value.tagName, 24) &&
    isBoundedString(value.beforeText, PREVIEW_BRIDGE_MAX_VISIBLE_TEXT) &&
    isBoundedString(value.afterText, PREVIEW_BRIDGE_MAX_VISIBLE_TEXT)
  );
}

function isPreviewCourseEditDraftDetail(value: unknown): value is PreviewCourseEditDraftDetail {
  if (!isRecord(value)) return false;
  const baseline = value.baseline;
  const patch = value.patch;
  if (!isPreviewCourseEditDraftSummary(value)) return false;
  return (
    isRecord(baseline) &&
    Object.keys(baseline).every((key) => ["originalHtml", "attributes", "currentStyle", "capabilities"].includes(key)) &&
    isBoundedString(baseline.originalHtml, COURSE_EDIT_MAX_HTML_CODE_UNITS) &&
    isCourseEditAttributes(baseline.attributes) &&
    isCourseEditStylePatch(baseline.currentStyle) &&
    isCourseEditCapabilities(baseline.capabilities) &&
    isCourseEditPatch(patch)
  );
}

function isCapabilityWorkspacePreviewHref(value: unknown) {
  if (typeof value !== "string" || !isBoundedNonEmptyString(value, STUDIO_BRIDGE_LIMITS.courseUrlCodeUnits)) return false;
  try {
    const url = new URL(value);
    const port = Number(url.port);
    return (
      url.protocol === "http:" &&
      url.hostname === "127.0.0.1" &&
      Number.isInteger(port) &&
      port > 0 &&
      port <= 65_535 &&
      isCapabilityWorkspacePreviewPath(url.pathname)
    );
  } catch {
    return false;
  }
}

export function isPreviewCourseEditState(value: unknown): value is PreviewCourseEditState {
  return (
    isRecord(value) &&
    Object.keys(value).every((key) => ["projectSlug", "enabled", "available", "unavailableReason", "target", "drafts", "selectedDraft", "busy", "canUndo", "exportsOutOfDate", "staleExportTargets", "status", "error"].includes(key)) &&
    isBoundedString(value.projectSlug, COURSE_EDIT_MAX_ID_CODE_UNITS) &&
    typeof value.enabled === "boolean" &&
    typeof value.available === "boolean" &&
    isBoundedString(value.unavailableReason, COURSE_EDIT_MAX_STATUS_CODE_UNITS) &&
    (value.target === null || isPreviewCourseEditTarget(value.target)) &&
    Array.isArray(value.drafts) &&
    value.drafts.length <= COURSE_EDIT_MAX_DRAFTS &&
    value.drafts.every(isPreviewCourseEditDraftSummary) &&
    (value.selectedDraft === null || isPreviewCourseEditDraftDetail(value.selectedDraft)) &&
    typeof value.busy === "boolean" &&
    typeof value.canUndo === "boolean" &&
    typeof value.exportsOutOfDate === "boolean" &&
    Array.isArray(value.staleExportTargets) &&
    value.staleExportTargets.length <= 12 &&
    value.staleExportTargets.every((entry) => isBoundedNonEmptyString(entry, 80)) &&
    isBoundedString(value.status, COURSE_EDIT_MAX_STATUS_CODE_UNITS) &&
    isBoundedString(value.error, COURSE_EDIT_MAX_STATUS_CODE_UNITS)
  );
}

export function isPreviewCourseEditAction(value: unknown): value is PreviewCourseEditAction {
  if (!isRecord(value) || typeof value.action !== "string") return false;
  if (value.requestId !== undefined && !isBoundedNonEmptyString(value.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH)) return false;
  switch (value.action) {
    case "request-state":
    case "apply":
    case "undo":
      return Object.keys(value).every((key) => key === "action" || key === "requestId");
    case "set-mode":
      return (
        Object.keys(value).every((key) => ["action", "requestId", "enabled", "nextMode"].includes(key)) &&
        typeof value.enabled === "boolean" &&
        (value.nextMode === undefined || value.nextMode === "off" || value.nextMode === "annotate") &&
        (value.enabled ? value.nextMode === undefined : true)
      );
    case "annotate-selection":
      return (
        Object.keys(value).every((key) => ["action", "requestId", "selection"].includes(key)) &&
        isPreviewInspectPayload(value.selection)
      );
    case "preview-target":
    case "save-target":
      return Object.keys(value).every((key) => ["action", "requestId", "targetId", "patch"].includes(key)) && isBoundedNonEmptyString(value.targetId, COURSE_EDIT_MAX_ID_CODE_UNITS) && /^[a-f0-9]{24}$/.test(value.targetId as string) && isCourseEditPatch(value.patch);
    case "select-draft":
    case "reopen-draft":
    case "remove-draft":
      return Object.keys(value).every((key) => ["action", "requestId", "draftId"].includes(key)) && isBoundedNonEmptyString(value.draftId, COURSE_EDIT_MAX_ID_CODE_UNITS);
    case "clear-preview":
      return Object.keys(value).every((key) => ["action", "requestId", "targetId"].includes(key)) && isBoundedNonEmptyString(value.targetId, COURSE_EDIT_MAX_ID_CODE_UNITS) && /^[a-f0-9]{24}$/.test(value.targetId as string);
    case "update-draft":
      return Object.keys(value).every((key) => ["action", "requestId", "draftId", "patch"].includes(key)) && isBoundedNonEmptyString(value.draftId, COURSE_EDIT_MAX_ID_CODE_UNITS) && isCourseEditPatch(value.patch);
    case "reorder-draft":
      return Object.keys(value).every((key) => ["action", "requestId", "draftId", "direction"].includes(key)) && isBoundedNonEmptyString(value.draftId, COURSE_EDIT_MAX_ID_CODE_UNITS) && (value.direction === -1 || value.direction === 1);
    default:
      return false;
  }
}

export function isPreviewCourseEditActionResult(value: unknown): value is PreviewCourseEditActionResult {
  return (
    isRecord(value) &&
    typeof value.ok === "boolean" &&
    isBoundedString(value.message, COURSE_EDIT_MAX_STATUS_CODE_UNITS) &&
    (value.requestId === undefined || isBoundedNonEmptyString(value.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH))
  );
}

function isPreviewCourseEditRepresentation(value: unknown): value is CourseEditPreviewRepresentation {
  return (
    isRecord(value) &&
    Object.keys(value).every((key) => ["tagName", "html", "attributes", "style"].includes(key)) &&
    typeof value.tagName === "string" && isBoundedNonEmptyString(value.tagName, STUDIO_BRIDGE_LIMITS.elementTagCodeUnits) &&
    /^[a-z][a-z0-9-]*$/.test(value.tagName) &&
    isBoundedString(value.html, COURSE_EDIT_MAX_HTML_CODE_UNITS) &&
    isCourseEditAttributes(value.attributes) &&
    isRecord(value.style) &&
    Object.keys(value.style).length === 6 &&
    isCourseEditStylePatch(value.style)
  );
}

export function isPreviewCourseEditCommand(value: unknown): value is PreviewCourseEditCommand {
  return (
    isRecord(value) &&
    Object.keys(value).every((key) => [
      "action",
      "previewSessionId",
      "revision",
      "projectSlug",
      "pageIdentity",
      "mapSourceDigest",
      "targetNodeId",
      "canonicalPatchDigest",
      "representation"
    ].includes(key)) &&
    (value.action === "render" || value.action === "clear") &&
    typeof value.previewSessionId === "string" && isBoundedNonEmptyString(value.previewSessionId, 96) &&
    /^[A-Za-z0-9-]+$/.test(value.previewSessionId) &&
    typeof value.revision === "number" &&
    Number.isSafeInteger(value.revision) &&
    value.revision > 0 &&
    isBoundedNonEmptyString(value.projectSlug, COURSE_EDIT_MAX_ID_CODE_UNITS) &&
    isCapabilityWorkspacePreviewHref(value.pageIdentity) &&
    typeof value.mapSourceDigest === "string" && isBoundedNonEmptyString(value.mapSourceDigest, 64) &&
    /^[a-f0-9]{64}$/.test(value.mapSourceDigest) &&
    typeof value.targetNodeId === "string" && isBoundedNonEmptyString(value.targetNodeId, COURSE_EDIT_MAX_ID_CODE_UNITS) &&
    /^ch1:[a-f0-9]{24}:[1-9][0-9]*$/.test(value.targetNodeId) &&
    typeof value.canonicalPatchDigest === "string" && isBoundedNonEmptyString(value.canonicalPatchDigest, 64) &&
    /^[a-f0-9]{64}$/.test(value.canonicalPatchDigest) &&
    (value.action === "render" ? isPreviewCourseEditRepresentation(value.representation) : value.representation === null)
  );
}

export function isPreviewCourseEditAck(value: unknown): value is PreviewCourseEditAck {
  return (
    isRecord(value) &&
    Object.keys(value).every((key) => [
      "action",
      "previewSessionId",
      "revision",
      "projectSlug",
      "pageIdentity",
      "mapSourceDigest",
      "targetNodeId",
      "canonicalPatchDigest",
      "ok",
      "message",
      "acknowledgedAt"
    ].includes(key)) &&
    ["rendered", "cleared", "rejected"].includes(String(value.action)) &&
    typeof value.previewSessionId === "string" && isBoundedNonEmptyString(value.previewSessionId, 96) &&
    /^[A-Za-z0-9-]+$/.test(value.previewSessionId) &&
    typeof value.revision === "number" &&
    Number.isSafeInteger(value.revision) &&
    value.revision > 0 &&
    isBoundedNonEmptyString(value.projectSlug, COURSE_EDIT_MAX_ID_CODE_UNITS) &&
    isCapabilityWorkspacePreviewHref(value.pageIdentity) &&
    typeof value.mapSourceDigest === "string" && isBoundedNonEmptyString(value.mapSourceDigest, 64) &&
    /^[a-f0-9]{64}$/.test(value.mapSourceDigest) &&
    typeof value.targetNodeId === "string" && isBoundedNonEmptyString(value.targetNodeId, COURSE_EDIT_MAX_ID_CODE_UNITS) &&
    /^ch1:[a-f0-9]{24}:[1-9][0-9]*$/.test(value.targetNodeId) &&
    typeof value.canonicalPatchDigest === "string" && isBoundedNonEmptyString(value.canonicalPatchDigest, 64) &&
    /^[a-f0-9]{64}$/.test(value.canonicalPatchDigest) &&
    typeof value.ok === "boolean" &&
    isBoundedString(value.message, COURSE_EDIT_MAX_STATUS_CODE_UNITS) &&
    typeof value.acknowledgedAt === "number" &&
    Number.isFinite(value.acknowledgedAt) &&
    value.acknowledgedAt >= 0
  );
}

function isValidPayload(type: PreviewBridgeMessageType, payload: unknown) {
  switch (type) {
    case "preview-ready":
      return isRecord(payload) && isBoundedString(payload.href, STUDIO_BRIDGE_LIMITS.courseUrlCodeUnits);
    case "preview-scroll-state":
      return isPreviewScrollState(payload);
    case "preview-navigation":
      return isRecord(payload) && isBoundedString(payload.href, STUDIO_BRIDGE_LIMITS.courseUrlCodeUnits);
    case "preview-inspect-hover":
    case "preview-inspect-selected":
      return isPreviewInspectPayload(payload);
    case "preview-inspect-current":
      return (
        isRecord(payload) &&
        isBoundedNonEmptyString(payload.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH) &&
        isPreviewInspectPayload(payload.selection)
      );
    case "preview-inspect-focused":
      return (
        isRecord(payload) &&
        isBoundedNonEmptyString(payload.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH) &&
        isBoundedNonEmptyString(payload.nodeId, STUDIO_REVIEW_LIMITS.identifierCodeUnits) &&
        typeof payload.focused === "boolean"
      );
    case "preview-inspect-mode":
      return isRecord(payload) && typeof payload.enabled === "boolean";
    case "preview-edit-preview-ack":
      return isPreviewCourseEditAck(payload);
    case "preview-edit-action":
      return isPreviewCourseEditAction(payload);
    case "preview-inline-editor-action":
      return isPreviewInlineEditorAction(payload);
    case "preview-review-action":
      return isPreviewReviewAction(payload);
    case "preview-return-to-studio":
      return payload === null;
    case "preview-health":
      return isPreviewContentHealth(payload);
    case "preview-diagnostic":
      return (
        isRecord(payload) &&
        (payload.kind === "runtime-error" || payload.kind === "unhandled-rejection" || payload.kind === "asset-error") &&
        isBoundedString(payload.message, STUDIO_BRIDGE_LIMITS.diagnosticMessageCodeUnits) &&
        isBoundedString(payload.href, STUDIO_BRIDGE_LIMITS.courseUrlCodeUnits)
      );
    case "preview-error":
      return (
        isRecord(payload) &&
        isBoundedString(payload.message, STUDIO_BRIDGE_LIMITS.diagnosticMessageCodeUnits) &&
        (payload.requestId === undefined || isBoundedNonEmptyString(payload.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH))
      );
    case "studio-request-state":
      return payload === null;
    case "studio-restore-scroll":
      return isPreviewScrollState(payload);
    case "studio-set-inspect-mode":
      return isRecord(payload) && typeof payload.enabled === "boolean" && (payload.keyboardEntry === undefined || typeof payload.keyboardEntry === "boolean");
    case "studio-set-edit-visual-mode":
      return isRecord(payload) && Object.keys(payload).every((key) => key === "enabled") && typeof payload.enabled === "boolean";
    case "studio-set-edit-preview":
      return isPreviewCourseEditCommand(payload);
    case "studio-set-inline-editor":
      return isPreviewInlineEditorCommand(payload);
    case "studio-request-inspect-current":
      return (
        isRecord(payload) &&
        isBoundedNonEmptyString(payload.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH) &&
        isBoundedNonEmptyString(payload.nodeId, STUDIO_REVIEW_LIMITS.identifierCodeUnits)
      );
    case "studio-focus-inspect-node":
      return (
        isRecord(payload) &&
        isBoundedNonEmptyString(payload.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH) &&
        isBoundedNonEmptyString(payload.nodeId, STUDIO_REVIEW_LIMITS.identifierCodeUnits)
      );
    case "studio-show-inspect-node":
      return (
        isRecord(payload) &&
        isBoundedNonEmptyString(payload.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH) &&
        isBoundedNonEmptyString(payload.nodeId, STUDIO_REVIEW_LIMITS.identifierCodeUnits) &&
        isBoundedNonEmptyString(payload.pageHref, STUDIO_BRIDGE_LIMITS.courseUrlCodeUnits)
      );
    case "studio-refresh-preview":
      return (
        isRecord(payload) &&
        Object.keys(payload).every((key) => key === "href") &&
        isCapabilityWorkspacePreviewHref(payload.href)
      );
    case "studio-disconnect-standalone":
      return payload === null;
    case "studio-cancel-review-copy":
      return (
        isRecord(payload) &&
        isBoundedNonEmptyString(payload.copyId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH) &&
        isBoundedString(payload.message, PREVIEW_REVIEW_STATUS_MAX_LENGTH)
      );
    case "studio-set-review-state":
      return isPreviewReviewState(payload);
    case "studio-set-review-packet":
      return (
        isRecord(payload) &&
        isBoundedString(payload.packet, PREVIEW_REVIEW_PACKET_MAX_LENGTH) &&
        typeof payload.packetId === "string" &&
        (payload.packetId === "" || /^[a-f0-9]{16}$/.test(payload.packetId)) &&
        Array.isArray(payload.itemIds) &&
        payload.itemIds.length <= PREVIEW_REVIEW_MAX_ITEMS &&
        new Set(payload.itemIds).size === payload.itemIds.length &&
        payload.itemIds.every((itemId) => isBoundedNonEmptyString(itemId, PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH)) &&
        isPreviewStandaloneSessionToken(payload.reviewSessionId)
      );
    case "studio-review-action-result":
      return isPreviewReviewActionResult(payload);
    case "studio-set-edit-state":
      return isPreviewCourseEditState(payload);
    case "studio-edit-action-result":
      return isPreviewCourseEditActionResult(payload);
    default:
      return false;
  }
}

export function isPreviewBridgeMessage(value: unknown): value is PreviewBridgeMessage {
  if (!isRecord(value)) {
    return false;
  }

  const type = value.type;
  if (
    value.protocol !== PREVIEW_BRIDGE_PROTOCOL ||
    value.version !== PREVIEW_BRIDGE_VERSION ||
    typeof type !== "string" ||
    ![...PREVIEW_EVENT_TYPES, ...STUDIO_COMMAND_TYPES].includes(type as PreviewBridgeMessageType)
  ) {
    return false;
  }

  return isValidPayload(type as PreviewBridgeMessageType, value.payload);
}

export function isPreviewBridgeBootstrap(value: unknown): value is PreviewBridgeBootstrap {
  return (
    isRecord(value) &&
    value.protocol === PREVIEW_BRIDGE_PROTOCOL &&
    value.version === PREVIEW_BRIDGE_VERSION &&
    value.type === PREVIEW_BRIDGE_BOOTSTRAP_TYPE &&
    value.payload === null
  );
}

export function isPreviewStandaloneBridgeBootstrap(value: unknown): value is PreviewStandaloneBridgeBootstrap {
  return (
    isRecord(value) &&
    value.protocol === PREVIEW_BRIDGE_PROTOCOL &&
    value.version === PREVIEW_BRIDGE_VERSION &&
    value.type === PREVIEW_STANDALONE_BOOTSTRAP_TYPE &&
    isRecord(value.payload) &&
    isPreviewStandaloneSessionToken(value.payload.sessionToken)
  );
}

export function isPreviewStandaloneHostBridgeBootstrap(value: unknown): value is PreviewStandaloneHostBridgeBootstrap {
  return (
    isRecord(value) &&
    value.protocol === PREVIEW_BRIDGE_PROTOCOL &&
    value.version === PREVIEW_BRIDGE_VERSION &&
    value.type === PREVIEW_STANDALONE_HOST_BOOTSTRAP_TYPE &&
    isRecord(value.payload) &&
    isPreviewStandaloneSessionToken(value.payload.sessionToken) &&
    isPreviewStandaloneSessionToken(value.payload.rejoinToken)
  );
}

export function isPreviewStandaloneHostRejoin(value: unknown): value is PreviewStandaloneHostRejoin {
  return (
    isRecord(value) &&
    value.protocol === PREVIEW_BRIDGE_PROTOCOL &&
    value.version === PREVIEW_BRIDGE_VERSION &&
    value.type === PREVIEW_STANDALONE_HOST_REJOIN_TYPE &&
    isRecord(value.payload) &&
    isPreviewStandaloneSessionToken(value.payload.rejoinToken)
  );
}

export function isPreviewEventMessage(message: PreviewBridgeMessage): message is PreviewBridgeMessage & { type: PreviewEventType } {
  return PREVIEW_EVENT_TYPES.includes(message.type as PreviewEventType);
}

export function isStudioCommandMessage(message: PreviewBridgeMessage): message is PreviewBridgeMessage & { type: StudioCommandType } {
  return STUDIO_COMMAND_TYPES.includes(message.type as StudioCommandType);
}

export function createPreviewBridgeMessage(
  type: PreviewBridgeMessageType,
  payload: unknown
): PreviewBridgeMessage {
  return {
    protocol: PREVIEW_BRIDGE_PROTOCOL,
    version: PREVIEW_BRIDGE_VERSION,
    type,
    payload
  };
}

export function createPreviewBridgeBootstrap(): PreviewBridgeBootstrap {
  return {
    protocol: PREVIEW_BRIDGE_PROTOCOL,
    version: PREVIEW_BRIDGE_VERSION,
    type: PREVIEW_BRIDGE_BOOTSTRAP_TYPE,
    payload: null
  };
}

export function createPreviewStandaloneBridgeBootstrap(sessionToken: string): PreviewStandaloneBridgeBootstrap {
  if (!isPreviewStandaloneSessionToken(sessionToken)) {
    throw new Error("Standalone preview inspection requires a valid session token.");
  }
  return {
    protocol: PREVIEW_BRIDGE_PROTOCOL,
    version: PREVIEW_BRIDGE_VERSION,
    type: PREVIEW_STANDALONE_BOOTSTRAP_TYPE,
    payload: { sessionToken }
  };
}

export function createPreviewStandaloneHostBridgeBootstrap(
  sessionToken: string,
  rejoinToken: string
): PreviewStandaloneHostBridgeBootstrap {
  if (!isPreviewStandaloneSessionToken(sessionToken) || !isPreviewStandaloneSessionToken(rejoinToken)) {
    throw new Error("Standalone preview host requires valid connection tokens.");
  }
  return {
    protocol: PREVIEW_BRIDGE_PROTOCOL,
    version: PREVIEW_BRIDGE_VERSION,
    type: PREVIEW_STANDALONE_HOST_BOOTSTRAP_TYPE,
    payload: { sessionToken, rejoinToken }
  };
}

export function createPreviewStandaloneHostRejoin(rejoinToken: string): PreviewStandaloneHostRejoin {
  if (!isPreviewStandaloneSessionToken(rejoinToken)) {
    throw new Error("Standalone preview host requires a valid rejoin token.");
  }
  return {
    protocol: PREVIEW_BRIDGE_PROTOCOL,
    version: PREVIEW_BRIDGE_VERSION,
    type: PREVIEW_STANDALONE_HOST_REJOIN_TYPE,
    payload: { rejoinToken }
  };
}

export function previewBridgeMessageByteLength(value: unknown) {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}
