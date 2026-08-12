import { isPreviewContentHealth } from "./preview-health.js";
import { STUDIO_BRIDGE_LIMITS, STUDIO_REVIEW_LIMITS } from "./studio-quality.js";

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
  "studio-request-inspect-current",
  "studio-focus-inspect-node",
  "studio-show-inspect-node",
  "studio-disconnect-standalone",
  "studio-cancel-review-copy",
  "studio-set-review-state",
  "studio-set-review-packet",
  "studio-review-action-result"
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

function isBoundedString(value: unknown, maximumLength: number) {
  return typeof value === "string" && value.length <= maximumLength;
}

function isBoundedNonEmptyString(value: unknown, maximumLength: number) {
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
