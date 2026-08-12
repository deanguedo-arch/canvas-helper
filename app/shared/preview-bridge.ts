import { isPreviewContentHealth } from "./preview-health.js";

export const PREVIEW_BRIDGE_PROTOCOL = "canvas-helper.preview";
export const PREVIEW_BRIDGE_VERSION = 1;
export const PREVIEW_BRIDGE_MAX_MESSAGE_BYTES = 8_192;
export const PREVIEW_BRIDGE_MAX_VISIBLE_TEXT = 320;
export const PREVIEW_BRIDGE_MAX_CONTAINERS = 8;
export const PREVIEW_BRIDGE_BOOTSTRAP_TYPE = "studio-connect";
export const PREVIEW_STANDALONE_BOOTSTRAP_TYPE = "studio-connect-standalone";
export const PREVIEW_STANDALONE_HOST_BOOTSTRAP_TYPE = "studio-connect-standalone-host";
export const PREVIEW_STANDALONE_HOST_REJOIN_TYPE = "studio-rejoin-standalone-host";
export const PREVIEW_STANDALONE_SESSION_PARAM = "canvas-helper-inspect-session";
export const PREVIEW_STANDALONE_REJOIN_PARAM = "canvas-helper-inspect-rejoin";
export const PREVIEW_STANDALONE_SESSION_TOKEN_MAX_LENGTH = 128;
export const PREVIEW_REVIEW_MAX_ITEMS = 5;
export const PREVIEW_REVIEW_MAX_SCREENSHOTS = 3;
export const PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH = 160;
export const PREVIEW_REVIEW_NOTE_MAX_LENGTH = 256;
export const PREVIEW_REVIEW_EXCERPT_MAX_LENGTH = 320;
export const PREVIEW_REVIEW_STATUS_MAX_LENGTH = 240;
export const PREVIEW_REVIEW_PACKET_MAX_LENGTH = 7_700;
export const PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH = 80;

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
  | { action: "undo" }
  | { action: "cancel-capture" }
  | { action: "add"; selection: PreviewInspectPayload; teacherNote: string }
  | { action: "capture-draft"; selection: PreviewInspectPayload }
  | { action: "capture-item"; itemId: string }
  | { action: "focus-item"; itemId: string }
  | { action: "remove"; itemId: string }
  | { action: "remove-screenshot"; itemId: string; screenshotId: string }
  | { action: "update-note"; itemId: string; teacherNote: string }
  | { action: "clear" }
) & { requestId?: string };

export type PreviewReviewScreenshotSummary = {
  id: string;
  filePath: string;
};

export type PreviewReviewItemSummary = {
  id: string;
  projectSlug: string;
  nodeId: string;
  excerpt: string;
  teacherNote: string;
  screenshots: PreviewReviewScreenshotSummary[];
};

export type PreviewReviewState = {
  sessionId: string;
  items: PreviewReviewItemSummary[];
  draftScreenshotCount: number;
  captureItemId: string;
  saving: boolean;
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
  return (
    typeof value === "string" &&
    /^\.runtime\/studio-review-sets\/[A-Za-z0-9-]{16,80}\/[A-Za-z0-9._-]+\.png$/.test(value)
  );
}

export function isPreviewStandaloneSessionToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 16 &&
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
        isBoundedString(container.selector, 260) &&
        isFiniteNumber(container.top) &&
        isFiniteNumber(container.left)
    )
  );
}

export function isPreviewInspectPayload(value: unknown): value is PreviewInspectPayload {
  return (
    isRecord(value) &&
    (value.nodeId === null || isBoundedString(value.nodeId, 160)) &&
    (value.selectionKind === undefined || value.selectionKind === "element" || value.selectionKind === "area") &&
    isBoundedString(value.visibleText, PREVIEW_BRIDGE_MAX_VISIBLE_TEXT) &&
    isBoundedString(value.tagName, 48) &&
    isBoundedString(value.role, 80) &&
    isBoundedString(value.testId, 120) &&
    isGeometry(value.geometry) &&
    isViewport(value.viewport) &&
    isPreviewScrollState(value.scroll) &&
    isBoundedNonEmptyString(value.pageHref, 2_048)
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
    case "add":
      return isPreviewInspectPayload(value.selection) && isBoundedString(value.teacherNote, PREVIEW_REVIEW_NOTE_MAX_LENGTH);
    case "capture-draft":
      return isPreviewInspectPayload(value.selection);
    case "capture-item":
    case "focus-item":
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
        isBoundedNonEmptyString(item.projectSlug, 160) &&
        isBoundedNonEmptyString(item.nodeId, 160) &&
        isBoundedString(item.excerpt, PREVIEW_REVIEW_EXCERPT_MAX_LENGTH) &&
        isBoundedString(item.teacherNote, PREVIEW_REVIEW_NOTE_MAX_LENGTH) &&
        Array.isArray(item.screenshots) &&
        item.screenshots.length <= PREVIEW_REVIEW_MAX_SCREENSHOTS &&
        item.screenshots.every(
          (screenshot) =>
            isRecord(screenshot) &&
            isBoundedNonEmptyString(screenshot.id, PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH) &&
            isReviewScreenshotPath(screenshot.filePath)
        )
    ) &&
    typeof value.draftScreenshotCount === "number" &&
    Number.isInteger(value.draftScreenshotCount) &&
    value.draftScreenshotCount >= 0 &&
    value.draftScreenshotCount <= PREVIEW_REVIEW_MAX_SCREENSHOTS &&
    isBoundedString(value.captureItemId, PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH) &&
    typeof value.saving === "boolean" &&
    typeof value.preparing === "boolean" &&
    typeof value.packetReady === "boolean" &&
    isBoundedString(value.status, PREVIEW_REVIEW_STATUS_MAX_LENGTH) &&
    isBoundedString(value.error, PREVIEW_REVIEW_STATUS_MAX_LENGTH) &&
    (value.undoLabel === undefined || isBoundedString(value.undoLabel, 80))
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
      return isRecord(payload) && isBoundedString(payload.href, 2_048);
    case "preview-scroll-state":
      return isPreviewScrollState(payload);
    case "preview-navigation":
      return isRecord(payload) && isBoundedString(payload.href, 2_048);
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
        isBoundedNonEmptyString(payload.nodeId, 160) &&
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
        isBoundedString(payload.message, 360) &&
        isBoundedString(payload.href, 2_048)
      );
    case "preview-error":
      return (
        isRecord(payload) &&
        isBoundedString(payload.message, 360) &&
        (payload.requestId === undefined || isBoundedNonEmptyString(payload.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH))
      );
    case "studio-request-state":
      return payload === null;
    case "studio-restore-scroll":
      return isPreviewScrollState(payload);
    case "studio-set-inspect-mode":
      return isRecord(payload) && typeof payload.enabled === "boolean";
    case "studio-request-inspect-current":
      return (
        isRecord(payload) &&
        isBoundedNonEmptyString(payload.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH) &&
        isBoundedNonEmptyString(payload.nodeId, 160)
      );
    case "studio-focus-inspect-node":
      return (
        isRecord(payload) &&
        isBoundedNonEmptyString(payload.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH) &&
        isBoundedNonEmptyString(payload.nodeId, 160)
      );
    case "studio-show-inspect-node":
      return (
        isRecord(payload) &&
        isBoundedNonEmptyString(payload.requestId, PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH) &&
        isBoundedNonEmptyString(payload.nodeId, 160) &&
        isBoundedNonEmptyString(payload.pageHref, 2_048)
      );
    case "studio-disconnect-standalone":
      return payload === null;
    case "studio-set-review-state":
      return isPreviewReviewState(payload);
    case "studio-set-review-packet":
      return isRecord(payload) && isBoundedString(payload.packet, PREVIEW_REVIEW_PACKET_MAX_LENGTH);
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
