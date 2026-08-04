export const PREVIEW_BRIDGE_PROTOCOL = "canvas-helper.preview";
export const PREVIEW_BRIDGE_VERSION = 1;
export const PREVIEW_BRIDGE_MAX_MESSAGE_BYTES = 8_192;
export const PREVIEW_BRIDGE_MAX_VISIBLE_TEXT = 320;
export const PREVIEW_BRIDGE_MAX_CONTAINERS = 8;
export const PREVIEW_BRIDGE_BOOTSTRAP_TYPE = "studio-connect";

export const PREVIEW_EVENT_TYPES = [
  "preview-ready",
  "preview-scroll-state",
  "preview-navigation",
  "preview-inspect-hover",
  "preview-inspect-selected",
  "preview-inspect-current",
  "preview-error"
] as const;

export const STUDIO_COMMAND_TYPES = [
  "studio-request-state",
  "studio-restore-scroll",
  "studio-set-inspect-mode",
  "studio-request-inspect-current"
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

export type PreviewInspectPayload = {
  nodeId: string | null;
  visibleText: string;
  tagName: string;
  role: string;
  testId: string;
  geometry: PreviewGeometry;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isBoundedString(value: unknown, maximumLength: number) {
  return typeof value === "string" && value.length <= maximumLength;
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
    isBoundedString(value.visibleText, PREVIEW_BRIDGE_MAX_VISIBLE_TEXT) &&
    isBoundedString(value.tagName, 48) &&
    isBoundedString(value.role, 80) &&
    isBoundedString(value.testId, 120) &&
    isGeometry(value.geometry)
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
    case "preview-inspect-current":
      return isPreviewInspectPayload(payload);
    case "preview-error":
      return isRecord(payload) && isBoundedString(payload.message, 360);
    case "studio-request-state":
      return payload === null;
    case "studio-restore-scroll":
      return isPreviewScrollState(payload);
    case "studio-set-inspect-mode":
      return isRecord(payload) && typeof payload.enabled === "boolean";
    case "studio-request-inspect-current":
      return isRecord(payload) && isBoundedString(payload.nodeId, 160);
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

export function previewBridgeMessageByteLength(value: unknown) {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}
