import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";

import {
  createPreviewBridgeBootstrap,
  createPreviewBridgeMessage,
  isPreviewBridgeMessage,
  isPreviewEventMessage,
  isPreviewStandaloneBridgeBootstrap,
  isPreviewStandaloneHostBridgeBootstrap,
  isPreviewStandaloneHostRejoin,
  isPreviewStandaloneSessionToken,
  PREVIEW_BRIDGE_MAX_MESSAGE_BYTES,
  PREVIEW_STANDALONE_REJOIN_PARAM,
  PREVIEW_STANDALONE_SESSION_PARAM,
  previewBridgeMessageByteLength,
  type PreviewCourseEditAck,
  type PreviewDiagnostic,
  type PreviewCourseEditAction,
  type PreviewCourseEditActionResult,
  type PreviewCourseEditCommand,
  type PreviewCourseEditState,
  type PreviewInspectCurrentPayload,
  type PreviewInspectFocusedPayload,
  type PreviewInspectPayload,
  type PreviewReviewAction,
  type PreviewReviewActionResult,
  type PreviewReviewPacket,
  type PreviewReviewState,
  type PreviewScrollState
} from "../../../shared/preview-bridge.js";
import type { PreviewContentHealth } from "../../../shared/preview-health.js";
import { loadPreviewScrollMap, savePreviewScrollMap } from "../lib/storage";
import { getTargetKey } from "../lib/preview-urls";
import {
  normalizeZoom,
  previewModes,
  type PreviewLayoutPreferences,
  type PreviewMode,
  type ProjectBundle,
  type ReferenceTarget,
  type PreviewScrollMap,
  type PreviewScrollPosition
} from "../lib/types";

type PreviewTarget = Pick<ReferenceTarget, "projectSlug" | "root" | "htmlPath"> & Partial<ReferenceTarget>;

type PreviewSurface = "embedded" | "standalone";

type UsePreviewScrollSyncOptions = {
  previewMode: PreviewMode;
  layoutPreferences: PreviewLayoutPreferences;
  setLayoutPreferences: Dispatch<SetStateAction<PreviewLayoutPreferences>>;
  selectedProject: ProjectBundle | null;
  workspaceTarget: PreviewTarget | null;
  referenceTarget: ReferenceTarget;
  previewOrigin: string;
  inspectEnabled: boolean;
  editEnabled: boolean;
  courseEditPreview: PreviewCourseEditCommand | null;
  onInspectSelection: (mode: PreviewMode, selection: PreviewInspectPayload, source: PreviewSurface) => void;
  onInspectHover?: (mode: PreviewMode, selection: PreviewInspectPayload, source: PreviewSurface) => void;
  onInspectModeChange?: (enabled: boolean, source: PreviewSurface) => void;
  onPreviewNavigation?: (mode: PreviewMode, href: string, source: PreviewSurface) => void;
  onPreviewReady?: (mode: PreviewMode, href: string, source: PreviewSurface) => void;
  onPreviewHealth?: (mode: PreviewMode, health: PreviewContentHealth, source: PreviewSurface) => void;
  onPreviewReviewAction?: (mode: PreviewMode, action: PreviewReviewAction) => void;
  onPreviewEditAction?: (mode: PreviewMode, action: PreviewCourseEditAction) => void;
  onCourseEditPreviewAck?: (mode: PreviewMode, ack: PreviewCourseEditAck, source: PreviewSurface) => void;
  onStandaloneReturn?: (mode: PreviewMode) => void;
  onPreviewDiagnostic?: (mode: PreviewMode, diagnostic: PreviewDiagnostic, source: PreviewSurface) => void;
};

type BridgeState = Pick<
  UsePreviewScrollSyncOptions,
  "previewMode" | "selectedProject" | "workspaceTarget" | "referenceTarget" | "previewOrigin" | "inspectEnabled" | "editEnabled" | "courseEditPreview"
>;

type PendingInspectionRequest = {
  requestId: string;
  nodeId: string;
  source: PreviewSurface;
  resolve: (selection: PreviewInspectPayload) => void;
  reject: (error: Error) => void;
  timeout: number;
  signal?: AbortSignal;
  abortHandler?: () => void;
};

type PendingFocusRequest = {
  requestId: string;
  nodeId: string;
  source: PreviewSurface;
  pageHref: string;
  resolve: (focused: boolean) => void;
  timeout: number;
};

type StandalonePreviewConnection = {
  port: MessagePort;
  window: Window;
  rejoinToken: string;
  targetKey: string;
};

const STANDALONE_REJOIN_STORAGE_KEY = "canvas-helper/standalone-preview-rejoin-v1";
const STANDALONE_REJOIN_TTL_MS = 8 * 60 * 60 * 1_000;

type StandaloneRejoinState = {
  tokens: Record<PreviewMode, string>;
  targetKeys: Record<PreviewMode, string>;
};

function loadStandaloneRejoinState(): StandaloneRejoinState {
  const empty = {
    tokens: { reference: "", workspace: "" },
    targetKeys: { reference: "", workspace: "" }
  } satisfies StandaloneRejoinState;
  if (typeof window === "undefined") return empty;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STANDALONE_REJOIN_STORAGE_KEY) ?? "null") as {
      updatedAt?: unknown;
      tokens?: Partial<Record<PreviewMode, unknown>>;
      targetKeys?: Partial<Record<PreviewMode, unknown>>;
    } | null;
    if (
      !parsed ||
      typeof parsed.updatedAt !== "number" ||
      parsed.updatedAt > Date.now() ||
      Date.now() - parsed.updatedAt > STANDALONE_REJOIN_TTL_MS ||
      !parsed.tokens
    ) {
      window.sessionStorage.removeItem(STANDALONE_REJOIN_STORAGE_KEY);
      return empty;
    }
    const targetKeys = {
      reference: typeof parsed.targetKeys?.reference === "string" ? parsed.targetKeys.reference : "",
      workspace: typeof parsed.targetKeys?.workspace === "string" ? parsed.targetKeys.workspace : ""
    };
    return {
      tokens: {
        reference: targetKeys.reference && isPreviewStandaloneSessionToken(parsed.tokens.reference) ? parsed.tokens.reference : "",
        workspace: targetKeys.workspace && isPreviewStandaloneSessionToken(parsed.tokens.workspace) ? parsed.tokens.workspace : ""
      },
      targetKeys
    };
  } catch {
    window.sessionStorage.removeItem(STANDALONE_REJOIN_STORAGE_KEY);
    return empty;
  }
}

function saveStandaloneRejoinState(state: StandaloneRejoinState) {
  try {
    window.sessionStorage.setItem(STANDALONE_REJOIN_STORAGE_KEY, JSON.stringify({ updatedAt: Date.now(), ...state }));
  } catch {
    // A full preview still works for this session; only reload rejoin is unavailable.
  }
}

function createRequestId() {
  if (typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return Array.from(window.crypto.getRandomValues(new Uint32Array(2)), (value) => value.toString(16).padStart(8, "0")).join("");
}

function toScrollPosition(state: PreviewScrollState): PreviewScrollPosition {
  return {
    windowTop: state.windowTop,
    windowLeft: state.windowLeft,
    containers: state.containers.map((container) => ({
      selector: container.selector,
      top: container.top,
      left: container.left
    }))
  };
}

function toBridgeScrollState(position: PreviewScrollPosition): PreviewScrollState {
  return {
    windowTop: position.windowTop,
    windowLeft: position.windowLeft,
    containers: position.containers.map((container) => ({
      selector: container.selector,
      top: container.top,
      left: container.left
    }))
  };
}

export function usePreviewScrollSync({
  previewMode,
  layoutPreferences,
  setLayoutPreferences,
  selectedProject,
  workspaceTarget,
  referenceTarget,
  previewOrigin,
  inspectEnabled,
  editEnabled,
  courseEditPreview,
  onInspectSelection,
  onInspectHover,
  onInspectModeChange,
  onPreviewNavigation,
  onPreviewReady,
  onPreviewHealth,
  onPreviewReviewAction,
  onPreviewEditAction,
  onCourseEditPreviewAck,
  onStandaloneReturn,
  onPreviewDiagnostic
}: UsePreviewScrollSyncOptions) {
  const initialStandaloneRejoinState = useRef<StandaloneRejoinState | null>(null);
  if (!initialStandaloneRejoinState.current) {
    initialStandaloneRejoinState.current = loadStandaloneRejoinState();
  }
  const previewFrameRefs = useRef<Record<PreviewMode, HTMLIFrameElement | null>>({
    reference: null,
    workspace: null
  });
  const previewReadyRefs = useRef<Record<PreviewMode, boolean>>({
    reference: false,
    workspace: false
  });
  const previewPortRefs = useRef<Record<PreviewMode, MessagePort | null>>({
    reference: null,
    workspace: null
  });
  const standalonePreviewConnectionRefs = useRef<Record<PreviewMode, StandalonePreviewConnection | null>>({
    reference: null,
    workspace: null
  });
  const readyHrefRefs = useRef<Record<PreviewMode, Record<PreviewSurface, string>>>({
    reference: { embedded: "", standalone: "" },
    workspace: { embedded: "", standalone: "" }
  });
  const standaloneSessionTokenRefs = useRef<Record<PreviewMode, string>>({
    reference: "",
    workspace: ""
  });
  const standaloneRejoinTokenRefs = useRef<Record<PreviewMode, string>>(initialStandaloneRejoinState.current.tokens);
  const standaloneTargetKeyRefs = useRef<Record<PreviewMode, string>>(initialStandaloneRejoinState.current.targetKeys);
  const pendingInspectionRequestRefs = useRef<Record<PreviewMode, PendingInspectionRequest | null>>({
    reference: null,
    workspace: null
  });
  const pendingFocusRequestRefs = useRef<Record<PreviewMode, PendingFocusRequest | null>>({
    reference: null,
    workspace: null
  });
  const pendingKeyboardInspectionRef = useRef(false);
  const previewScrollMapRef = useRef<PreviewScrollMap>(loadPreviewScrollMap());
  const latestScrollStateRef = useRef<Record<PreviewMode, PreviewScrollPosition | null>>({
    reference: null,
    workspace: null
  });
  const stateRef = useRef<BridgeState>({
    previewMode,
    selectedProject,
    workspaceTarget,
    referenceTarget,
    previewOrigin,
    inspectEnabled,
    editEnabled,
    courseEditPreview
  });
  const inspectionCallbacksRef = useRef({ onInspectSelection, onInspectHover, onInspectModeChange, onPreviewNavigation, onPreviewReady, onPreviewHealth, onPreviewReviewAction, onPreviewEditAction, onCourseEditPreviewAck, onStandaloneReturn, onPreviewDiagnostic });
  stateRef.current = {
    previewMode,
    selectedProject,
    workspaceTarget,
    referenceTarget,
    previewOrigin,
    inspectEnabled,
    editEnabled,
    courseEditPreview
  };
  inspectionCallbacksRef.current = { onInspectSelection, onInspectHover, onInspectModeChange, onPreviewNavigation, onPreviewReady, onPreviewHealth, onPreviewReviewAction, onPreviewEditAction, onCourseEditPreviewAck, onStandaloneReturn, onPreviewDiagnostic };

  const getModeTarget = (mode: PreviewMode) => {
    const current = stateRef.current;
    return mode === "workspace" ? current.workspaceTarget : current.referenceTarget.projectSlug ? current.referenceTarget : null;
  };

  const clearPendingInspectionRequest = (mode: PreviewMode, error?: Error) => {
    const pending = pendingInspectionRequestRefs.current[mode];
    if (!pending) {
      return;
    }
    window.clearTimeout(pending.timeout);
    if (pending.signal && pending.abortHandler) {
      pending.signal.removeEventListener("abort", pending.abortHandler);
    }
    pendingInspectionRequestRefs.current[mode] = null;
    if (error) {
      pending.reject(error);
    }
  };

  const clearPendingFocusRequest = (mode: PreviewMode, focused = false) => {
    const pending = pendingFocusRequestRefs.current[mode];
    if (!pending) {
      return;
    }
    window.clearTimeout(pending.timeout);
    pendingFocusRequestRefs.current[mode] = null;
    pending.resolve(focused);
  };

  const postToPort = (port: MessagePort | null, message: ReturnType<typeof createPreviewBridgeMessage>) => {
    if (!port) {
      return;
    }
    try {
      port.postMessage(message);
    } catch {
      // A preview navigation or closed standalone tab can invalidate the port between checks.
    }
  };

  const standaloneConnection = (mode: PreviewMode) => {
    const connection = standalonePreviewConnectionRefs.current[mode];
    if (connection?.window.closed) {
      connection.port.close();
      standalonePreviewConnectionRefs.current[mode] = null;
      return null;
    }
    return connection;
  };

  const primaryStandalonePort = (mode: PreviewMode) => standaloneConnection(mode)?.port ?? null;

  const standalonePreviewMatchesTarget = (mode: PreviewMode, targetKey: string) => (
    standaloneConnection(mode)?.targetKey === targetKey
  );

  const postBridgeCommand = (
    mode: PreviewMode,
    type:
      | "studio-request-state"
      | "studio-restore-scroll"
      | "studio-set-inspect-mode"
      | "studio-set-edit-visual-mode"
      | "studio-set-edit-preview"
      | "studio-request-inspect-current"
      | "studio-focus-inspect-node"
      | "studio-show-inspect-node"
      | "studio-refresh-preview"
      | "studio-disconnect-standalone"
      | "studio-cancel-review-copy",
    payload: unknown
  ) => {
    const framePort = previewPortRefs.current[mode];
    const standalonePort = primaryStandalonePort(mode);
    if (!framePort && !standalonePort) {
      return;
    }

    const message = createPreviewBridgeMessage(type, payload);
    if (previewBridgeMessageByteLength(message) > PREVIEW_BRIDGE_MAX_MESSAGE_BYTES) {
      return;
    }

    postToPort(framePort, message);
    if (standalonePort !== framePort) postToPort(standalonePort, message);
  };

  const postBridgeCommandToSource = (
    mode: PreviewMode,
    source: PreviewSurface,
    type: "studio-request-inspect-current" | "studio-focus-inspect-node" | "studio-show-inspect-node",
    payload: unknown
  ) => {
    const port = source === "embedded" ? previewPortRefs.current[mode] : primaryStandalonePort(mode);
    if (!port) {
      return false;
    }
    const message = createPreviewBridgeMessage(type, payload);
    if (previewBridgeMessageByteLength(message) > PREVIEW_BRIDGE_MAX_MESSAGE_BYTES) {
      return false;
    }
    postToPort(port, message);
    return true;
  };

  const flushPendingKeyboardInspection = () => {
    if (!pendingKeyboardInspectionRef.current || !stateRef.current.inspectEnabled) return false;
    const port = previewPortRefs.current.workspace;
    if (!port || !previewReadyRefs.current.workspace) return false;
    const message = createPreviewBridgeMessage("studio-set-inspect-mode", { enabled: true, keyboardEntry: true });
    if (previewBridgeMessageByteLength(message) > PREVIEW_BRIDGE_MAX_MESSAGE_BYTES) return false;
    postToPort(port, message);
    pendingKeyboardInspectionRef.current = false;
    return true;
  };

  const flushPendingFocusRequest = (mode: PreviewMode, source: PreviewSurface) => {
    const pending = pendingFocusRequestRefs.current[mode];
    if (!pending || pending.source !== source) {
      return;
    }
    const sent = postBridgeCommandToSource(
      mode,
      source,
      pending.pageHref ? "studio-show-inspect-node" : "studio-focus-inspect-node",
      pending.pageHref
        ? { requestId: pending.requestId, nodeId: pending.nodeId, pageHref: pending.pageHref }
        : { requestId: pending.requestId, nodeId: pending.nodeId }
    );
    if (!sent) clearPendingFocusRequest(mode, false);
  };

  const postStandaloneBridgeCommand = (
    mode: PreviewMode,
    type: "studio-set-review-state" | "studio-set-review-packet" | "studio-review-action-result" | "studio-set-edit-state" | "studio-edit-action-result" | "studio-refresh-preview",
    payload: unknown
  ) => {
    const port = primaryStandalonePort(mode);
    if (!port) {
      return;
    }
    const message = createPreviewBridgeMessage(type, payload);
    if (previewBridgeMessageByteLength(message) <= PREVIEW_BRIDGE_MAX_MESSAGE_BYTES) {
      postToPort(port, message);
    }
  };

  const persistPreviewScrollPosition = (mode: PreviewMode) => {
    const target = getModeTarget(mode);
    const position = latestScrollStateRef.current[mode];
    if (!target || !position) {
      return;
    }

    previewScrollMapRef.current[getTargetKey(target)] = position;
    savePreviewScrollMap(previewScrollMapRef.current);
  };

  const restoreStoredScrollPosition = (mode: PreviewMode) => {
    const target = getModeTarget(mode);
    if (!target) {
      return;
    }
    const position = previewScrollMapRef.current[getTargetKey(target)];
    if (position) {
      postBridgeCommand(mode, "studio-restore-scroll", toBridgeScrollState(position));
    }
  };

  const persistAllVisibleScrollPositions = () => {
    previewModes.forEach((mode) => persistPreviewScrollPosition(mode));
  };

  const copyPreviewModeScrollPosition = (sourceMode: PreviewMode, targetMode: PreviewMode) => {
    const sourceTarget = getModeTarget(sourceMode);
    const targetTarget = getModeTarget(targetMode);
    const captured = latestScrollStateRef.current[sourceMode] ?? (sourceTarget ? previewScrollMapRef.current[getTargetKey(sourceTarget)] : null);
    if (!sourceTarget || !targetTarget || !captured) {
      return;
    }

    previewScrollMapRef.current[getTargetKey(sourceTarget)] = captured;
    previewScrollMapRef.current[getTargetKey(targetTarget)] = captured;
    latestScrollStateRef.current[targetMode] = captured;
    savePreviewScrollMap(previewScrollMapRef.current);
    postBridgeCommand(targetMode, "studio-restore-scroll", toBridgeScrollState(captured));
  };

  const syncFocusModeScrollPosition = (fromMode: PreviewMode, toMode: PreviewMode) => {
    if (fromMode !== toMode) {
      copyPreviewModeScrollPosition(fromMode, toMode);
    }
  };

  const handleBridgeMessage = (mode: PreviewMode, data: unknown, source: PreviewSurface) => {
    if (!isPreviewBridgeMessage(data) || !isPreviewEventMessage(data) || previewBridgeMessageByteLength(data) > PREVIEW_BRIDGE_MAX_MESSAGE_BYTES) {
      return;
    }

    switch (data.type) {
      case "preview-ready":
        if (source === "embedded") {
          previewReadyRefs.current[mode] = true;
        }
        readyHrefRefs.current[mode][source] = String((data.payload as { href?: string }).href ?? "");
        restoreStoredScrollPosition(mode);
        postBridgeCommand(mode, "studio-request-state", null);
        postBridgeCommand(mode, "studio-set-inspect-mode", { enabled: mode === "workspace" && stateRef.current.inspectEnabled });
        postBridgeCommand(mode, "studio-set-edit-visual-mode", { enabled: mode === "workspace" && stateRef.current.editEnabled });
        if (mode === "workspace" && stateRef.current.courseEditPreview) {
          // A ready message from Full Preview must seed that one new surface,
          // not replay the same revision into the already-rendered embedded
          // learner. The latter correctly rejects duplicate revisions, which
          // must never turn a successful display preview into a clear.
          const port = source === "embedded" ? previewPortRefs.current[mode] : primaryStandalonePort(mode);
          const message = createPreviewBridgeMessage("studio-set-edit-preview", stateRef.current.courseEditPreview);
          if (previewBridgeMessageByteLength(message) <= PREVIEW_BRIDGE_MAX_MESSAGE_BYTES) {
            postToPort(port, message);
          }
        }
        if (mode === "workspace" && source === "embedded") flushPendingKeyboardInspection();
        flushPendingFocusRequest(mode, source);
        inspectionCallbacksRef.current.onPreviewReady?.(
          mode,
          String((data.payload as { href?: string }).href ?? ""),
          source
        );
        break;
      case "preview-scroll-state": {
        if (source === "embedded") {
          previewReadyRefs.current[mode] = true;
        }
        const position = toScrollPosition(data.payload as PreviewScrollState);
        latestScrollStateRef.current[mode] = position;
        persistPreviewScrollPosition(mode);
        break;
      }
      case "preview-navigation": {
        const href = String((data.payload as { href?: string }).href ?? "");
        readyHrefRefs.current[mode][source] = href;
        const pending = pendingInspectionRequestRefs.current[mode];
        if (pending?.source === source) {
          clearPendingInspectionRequest(mode, new Error("The course page changed. Select the element again before capturing a screenshot."));
        }
        inspectionCallbacksRef.current.onPreviewNavigation?.(mode, href, source);
        flushPendingFocusRequest(mode, source);
        break;
      }
      case "preview-inspect-hover":
        inspectionCallbacksRef.current.onInspectHover?.(mode, data.payload as PreviewInspectPayload, source);
        break;
      case "preview-inspect-selected":
        inspectionCallbacksRef.current.onInspectSelection(mode, data.payload as PreviewInspectPayload, source);
        break;
      case "preview-inspect-current": {
        const current = data.payload as PreviewInspectCurrentPayload;
        const selection = current.selection;
        const pending = pendingInspectionRequestRefs.current[mode];
        if (
          !pending ||
          pending.source !== source ||
          pending.requestId !== current.requestId ||
          pending.nodeId !== selection.nodeId
        ) {
          break;
        }
        window.clearTimeout(pending.timeout);
        if (pending.signal && pending.abortHandler) {
          pending.signal.removeEventListener("abort", pending.abortHandler);
        }
        pendingInspectionRequestRefs.current[mode] = null;
        pending.resolve(selection);
        break;
      }
      case "preview-inspect-focused": {
        const result = data.payload as PreviewInspectFocusedPayload;
        const pending = pendingFocusRequestRefs.current[mode];
        if (
          !pending ||
          pending.source !== source ||
          pending.requestId !== result.requestId ||
          pending.nodeId !== result.nodeId
        ) {
          break;
        }
        clearPendingFocusRequest(mode, result.focused);
        break;
      }
      case "preview-inspect-mode": {
        const enabled = mode === "workspace" && Boolean((data.payload as { enabled?: boolean }).enabled);
        stateRef.current = {
          ...stateRef.current,
          inspectEnabled: enabled
        };
        previewModes.forEach((targetMode) => {
          postBridgeCommand(targetMode, "studio-set-inspect-mode", { enabled });
        });
        inspectionCallbacksRef.current.onInspectModeChange?.(enabled, source);
        break;
      }
      case "preview-edit-preview-ack":
        inspectionCallbacksRef.current.onCourseEditPreviewAck?.(mode, data.payload as PreviewCourseEditAck, source);
        break;
      case "preview-review-action":
        if (source === "standalone") {
          inspectionCallbacksRef.current.onPreviewReviewAction?.(mode, data.payload as PreviewReviewAction);
        }
        break;
      case "preview-edit-action":
        if (source === "standalone") {
          inspectionCallbacksRef.current.onPreviewEditAction?.(mode, data.payload as PreviewCourseEditAction);
        }
        break;
      case "preview-return-to-studio":
        if (source === "standalone") {
          inspectionCallbacksRef.current.onStandaloneReturn?.(mode);
        }
        break;
      case "preview-health":
        inspectionCallbacksRef.current.onPreviewHealth?.(mode, data.payload as PreviewContentHealth, source);
        break;
      case "preview-diagnostic":
        inspectionCallbacksRef.current.onPreviewDiagnostic?.(mode, data.payload as PreviewDiagnostic, source);
        break;
      case "preview-error":
        {
          const pending = pendingInspectionRequestRefs.current[mode];
          const requestId = (data.payload as { requestId?: string }).requestId;
          if (pending && pending.source === source && (!requestId || pending.requestId === requestId)) {
            clearPendingInspectionRequest(mode, new Error("The preview could not refresh the selected element. Select it again before capturing a screenshot."));
          }
          const pendingFocus = pendingFocusRequestRefs.current[mode];
          if (pendingFocus && pendingFocus.source === source && requestId === pendingFocus.requestId) {
            clearPendingFocusRequest(mode, false);
          }
        }
        break;
      default:
        break;
    }
  };

  const connectPreviewBridge = (mode: PreviewMode) => {
    const current = stateRef.current;
    const iframe = previewFrameRefs.current[mode];
    if (!iframe?.contentWindow || !current.previewOrigin) {
      return;
    }

    previewReadyRefs.current[mode] = false;
    readyHrefRefs.current[mode].embedded = "";
    if (pendingInspectionRequestRefs.current[mode]?.source === "embedded") {
      clearPendingInspectionRequest(mode, new Error("The preview reloaded before the selected element could be refreshed."));
    }
    previewPortRefs.current[mode]?.close();

    const channel = new MessageChannel();
    previewPortRefs.current[mode] = channel.port1;
    channel.port1.onmessage = (event) => {
      if (previewPortRefs.current[mode] !== channel.port1) {
        return;
      }
      handleBridgeMessage(mode, event.data, "embedded");
    };
    channel.port1.start();

    try {
      iframe.contentWindow.postMessage(createPreviewBridgeBootstrap(), current.previewOrigin, [channel.port2]);
    } catch {
      channel.port1.close();
      previewPortRefs.current[mode] = null;
    }
  };

  const prepareStandalonePreview = (mode: PreviewMode, previewUrl: string, targetKey: string) => {
    const current = stateRef.current;
    if (!previewUrl || !current.previewOrigin) {
      return null;
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(previewUrl, window.location.href);
    } catch {
      return null;
    }
    if (targetUrl.origin !== current.previewOrigin) {
      return null;
    }

    const createToken = () => typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : Array.from(window.crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16).padStart(8, "0")).join("");
    const sessionToken = createToken();
    const rejoinToken = standaloneTargetKeyRefs.current[mode] === targetKey
      ? standaloneRejoinTokenRefs.current[mode] || createToken()
      : createToken();
    standaloneSessionTokenRefs.current[mode] = sessionToken;
    standaloneRejoinTokenRefs.current = {
      ...standaloneRejoinTokenRefs.current,
      [mode]: rejoinToken
    };
    standaloneTargetKeyRefs.current[mode] = targetKey;
    saveStandaloneRejoinState({ tokens: standaloneRejoinTokenRefs.current, targetKeys: standaloneTargetKeyRefs.current });
    window.setTimeout(() => {
      if (standaloneSessionTokenRefs.current[mode] === sessionToken) {
        standaloneSessionTokenRefs.current[mode] = "";
      }
    }, 15_000);
    const hostUrl = new URL("/standalone-preview", window.location.origin);
    hostUrl.searchParams.set("target", targetUrl.toString());
    hostUrl.searchParams.set(PREVIEW_STANDALONE_SESSION_PARAM, sessionToken);
    hostUrl.searchParams.set(PREVIEW_STANDALONE_REJOIN_PARAM, rejoinToken);
    return hostUrl.toString();
  };

  const focusStandalonePreview = (mode: PreviewMode, targetKey: string) => {
    const existing = standaloneConnection(mode);
    if (!existing) return false;
    if (existing.targetKey !== targetKey) {
      revokeStandalonePreview(mode);
      return false;
    }
    existing.window.focus();
    return true;
  };

  const revokeStandalonePreview = (mode: PreviewMode) => {
    const existing = standaloneConnection(mode);
    if (existing) {
      existing.port.close();
      existing.window.close();
    }
    standalonePreviewConnectionRefs.current[mode] = null;
    readyHrefRefs.current[mode].standalone = "";
    standaloneSessionTokenRefs.current[mode] = "";
    standaloneRejoinTokenRefs.current = {
      ...standaloneRejoinTokenRefs.current,
      [mode]: ""
    };
    standaloneTargetKeyRefs.current[mode] = "";
    saveStandaloneRejoinState({ tokens: standaloneRejoinTokenRefs.current, targetKeys: standaloneTargetKeyRefs.current });
  };

  const retargetStandalonePreview = (mode: PreviewMode, targetKey: string) => {
    const existing = standaloneConnection(mode);
    if (!existing || !targetKey) return false;
    existing.targetKey = targetKey;
    standaloneTargetKeyRefs.current[mode] = targetKey;
    saveStandaloneRejoinState({ tokens: standaloneRejoinTokenRefs.current, targetKeys: standaloneTargetKeyRefs.current });
    return true;
  };

  const attachPreviewPersistence = (mode: PreviewMode) => {
    connectPreviewBridge(mode);
  };

  const requestCurrentInspectionSelection = (
    mode: PreviewMode,
    nodeId: string,
    source: PreviewSurface = "embedded",
    signal?: AbortSignal
  ) => {
    if (signal?.aborted) {
      return Promise.reject(new DOMException("Capture canceled", "AbortError"));
    }
    const hasReadyPort = source === "embedded"
      ? Boolean(previewPortRefs.current[mode] && previewReadyRefs.current[mode])
      : Boolean(primaryStandalonePort(mode));
    if (!hasReadyPort) {
      return Promise.reject(new Error("The preview bridge is not ready. Select the element again before capturing a screenshot."));
    }

    clearPendingInspectionRequest(mode, new Error("A newer screenshot request replaced the previous one."));
    return new Promise<PreviewInspectPayload>((resolve, reject) => {
      const requestId = createRequestId();
      const timeout = window.setTimeout(() => {
        const pending = pendingInspectionRequestRefs.current[mode];
        if (pending?.requestId !== requestId) {
          return;
        }
        clearPendingInspectionRequest(mode, new Error("The preview did not confirm the selected element. Select it again before capturing a screenshot."));
      }, 1_500);
      const abortHandler = signal ? () => {
        const pending = pendingInspectionRequestRefs.current[mode];
        if (pending?.requestId === requestId) {
          clearPendingInspectionRequest(mode, new DOMException("Capture canceled", "AbortError"));
        }
      } : undefined;
      pendingInspectionRequestRefs.current[mode] = { requestId, nodeId, source, resolve, reject, timeout, signal, abortHandler };
      if (signal && abortHandler) signal.addEventListener("abort", abortHandler, { once: true });
      if (!postBridgeCommandToSource(mode, source, "studio-request-inspect-current", { requestId, nodeId })) {
        clearPendingInspectionRequest(mode, new Error("The selected preview is no longer connected. Select the element again."));
      }
    });
  };

  const setPreviewInspectMode = (enabled: boolean) => {
    stateRef.current = {
      ...stateRef.current,
      inspectEnabled: enabled
    };
    if (!enabled) pendingKeyboardInspectionRef.current = false;
    previewModes.forEach((mode) => {
      if (previewReadyRefs.current[mode] || primaryStandalonePort(mode)) {
        postBridgeCommand(mode, "studio-set-inspect-mode", { enabled: mode === "workspace" && enabled });
      }
    });
  };

  const beginKeyboardPreviewInspection = () => {
    pendingKeyboardInspectionRef.current = true;
    return flushPendingKeyboardInspection();
  };

  const focusPreviewInspectionSelection = (
    mode: PreviewMode,
    nodeId: string,
    options: { source?: PreviewSurface; pageHref?: string } = {}
  ) => {
    const source = options.source ?? "embedded";
    if (!nodeId) {
      return Promise.resolve(false);
    }
    clearPendingFocusRequest(mode, false);
    return new Promise<boolean>((resolve) => {
      const requestId = createRequestId();
      const timeout = window.setTimeout(() => clearPendingFocusRequest(mode, false), source === "standalone" ? 8_000 : 4_000);
      pendingFocusRequestRefs.current[mode] = {
        requestId,
        nodeId,
        source,
        pageHref: options.pageHref ?? "",
        resolve,
        timeout
      };
      flushPendingFocusRequest(mode, source);
    });
  };

  const restorePreviewLocation = (mode: PreviewMode, scroll: PreviewScrollState) => {
    postBridgeCommand(mode, "studio-restore-scroll", scroll);
  };

  const syncStandaloneReviewSet = (mode: PreviewMode, state: PreviewReviewState, packet: PreviewReviewPacket) => {
    postStandaloneBridgeCommand(mode, "studio-set-review-state", state);
    postStandaloneBridgeCommand(mode, "studio-set-review-packet", packet);
  };

  const sendStandaloneReviewActionResult = (mode: PreviewMode, result: PreviewReviewActionResult) => {
    postStandaloneBridgeCommand(mode, "studio-review-action-result", result);
  };

  const syncStandaloneCourseEditing = (mode: PreviewMode, state: PreviewCourseEditState) => {
    postStandaloneBridgeCommand(mode, "studio-set-edit-state", state);
  };

  const sendStandaloneCourseEditActionResult = (mode: PreviewMode, result: PreviewCourseEditActionResult) => {
    postStandaloneBridgeCommand(mode, "studio-edit-action-result", result);
  };

  const refreshStandalonePreview = (mode: PreviewMode, href: string) => {
    postStandaloneBridgeCommand(mode, "studio-refresh-preview", { href });
  };

  const cancelStandaloneReviewCopy = (mode: PreviewMode, copyId: string, message: string) => {
    postBridgeCommand(mode, "studio-cancel-review-copy", { copyId, message });
  };

  const registerPreviewFrame = (mode: PreviewMode, node: HTMLIFrameElement | null) => {
    if (!node) {
      persistPreviewScrollPosition(mode);
    }
    previewFrameRefs.current[mode] = node;
  };

  const fitPreviewToWidth = (mode: PreviewMode) => {
    const shell = document.querySelector<HTMLDivElement>(`[data-preview-shell="${mode}"]`);
    if (!shell) {
      return;
    }

    const availableWidth = shell.clientWidth;
    if (availableWidth <= 0) {
      return;
    }

    setLayoutPreferences((current) => {
      const activeDevice = current.devices[mode];
      const baseWidth = activeDevice === "tablet" ? 820 : activeDevice === "mobile" ? 430 : availableWidth;
      const fitZoom = normalizeZoom((availableWidth / baseWidth) * 100);
      return {
        ...current,
        zooms: {
          ...current.zooms,
          [mode]: fitZoom
        }
      };
    });
  };

  useEffect(() => {
    const receiveStandaloneBridge = (event: MessageEvent) => {
      const current = stateRef.current;
      if (!current.previewOrigin || !event.source || event.source === window || !event.ports || event.ports.length !== 1) {
        return;
      }
      const legacyInitial = event.origin === current.previewOrigin && isPreviewStandaloneBridgeBootstrap(event.data);
      const hostInitial = event.origin === window.location.origin && isPreviewStandaloneHostBridgeBootstrap(event.data);
      const hostRejoin = event.origin === window.location.origin && isPreviewStandaloneHostRejoin(event.data);
      if (!legacyInitial && !hostInitial && !hostRejoin) return;

      const mode = previewModes.find((candidate) => {
        if (legacyInitial) return standaloneSessionTokenRefs.current[candidate] === event.data.payload.sessionToken;
        if (hostInitial) {
          return (
            standaloneSessionTokenRefs.current[candidate] === event.data.payload.sessionToken &&
            standaloneRejoinTokenRefs.current[candidate] === event.data.payload.rejoinToken
          );
        }
        return (
          Boolean(standaloneTargetKeyRefs.current[candidate]) &&
          standaloneRejoinTokenRefs.current[candidate] === event.data.payload.rejoinToken
        );
      });
      if (!mode) {
        return;
      }

      event.stopImmediatePropagation();
      if (!hostRejoin) standaloneSessionTokenRefs.current[mode] = "";
      saveStandaloneRejoinState({ tokens: standaloneRejoinTokenRefs.current, targetKeys: standaloneTargetKeyRefs.current });
      if (pendingInspectionRequestRefs.current[mode]?.source === "standalone") {
        clearPendingInspectionRequest(mode, new Error("The full preview reconnected before the selected element could be refreshed."));
      }
      if (pendingFocusRequestRefs.current[mode]?.source === "standalone") {
        clearPendingFocusRequest(mode, false);
      }
      const nextPort = event.ports[0];
      const sourceWindow = event.source as Window;
      const existing = standaloneConnection(mode);
      if (existing && existing.window !== sourceWindow) {
        standaloneRejoinTokenRefs.current = {
          ...standaloneRejoinTokenRefs.current,
          [mode]: existing.rejoinToken
        };
        saveStandaloneRejoinState({ tokens: standaloneRejoinTokenRefs.current, targetKeys: standaloneTargetKeyRefs.current });
        nextPort.close();
        sourceWindow.close();
        existing.window.focus();
        return;
      }
      existing?.port.close();
      const rejoinToken = legacyInitial
        ? standaloneRejoinTokenRefs.current[mode]
        : "rejoinToken" in event.data.payload ? event.data.payload.rejoinToken : "";
      const targetKey = hostRejoin && existing?.window === sourceWindow
        ? existing.targetKey
        : standaloneTargetKeyRefs.current[mode] || (mode === "workspace"
          ? stateRef.current.workspaceTarget
            ? getTargetKey(stateRef.current.workspaceTarget)
            : ""
          : stateRef.current.referenceTarget.projectSlug
            ? getTargetKey(stateRef.current.referenceTarget)
            : "");
      standaloneTargetKeyRefs.current[mode] = targetKey;
      standalonePreviewConnectionRefs.current[mode] = { port: nextPort, window: sourceWindow, rejoinToken, targetKey };
      readyHrefRefs.current[mode].standalone = "";
      nextPort.onmessage = (portEvent) => {
        if (standalonePreviewConnectionRefs.current[mode]?.port === nextPort) {
          handleBridgeMessage(mode, portEvent.data, "standalone");
        }
      };
      nextPort.start();
      postToPort(nextPort, createPreviewBridgeMessage("studio-set-inspect-mode", {
        enabled: mode === "workspace" && stateRef.current.inspectEnabled
      }));
      // The standalone host may finish connecting to Studio before its nested
      // learner iframe is ready. Seed the host with the entire current visual
      // edit state now; it keeps the bounded display command and replays it
      // only after the learner bridge reports ready.
      postToPort(nextPort, createPreviewBridgeMessage("studio-set-edit-visual-mode", {
        enabled: mode === "workspace" && stateRef.current.editEnabled
      }));
      if (mode === "workspace" && stateRef.current.courseEditPreview) {
        postToPort(nextPort, createPreviewBridgeMessage(
          "studio-set-edit-preview",
          stateRef.current.courseEditPreview
        ));
      }
    };

    window.addEventListener("message", receiveStandaloneBridge, true);
    return () => window.removeEventListener("message", receiveStandaloneBridge, true);
  }, []);

  useEffect(() => {
    const notifyStandaloneDisconnect = () => {
      previewModes.forEach((mode) => postToPort(
        primaryStandalonePort(mode),
        createPreviewBridgeMessage("studio-disconnect-standalone", null)
      ));
    };
    const handleBeforeUnload = () => {
      persistAllVisibleScrollPositions();
      notifyStandaloneDisconnect();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      previewModes.forEach((mode) => {
        previewReadyRefs.current[mode] = false;
        clearPendingInspectionRequest(mode, new Error("The Studio closed before the selected element could be refreshed."));
        clearPendingFocusRequest(mode, false);
        previewPortRefs.current[mode]?.close();
        previewPortRefs.current[mode] = null;
        standalonePreviewConnectionRefs.current[mode]?.port.close();
        standalonePreviewConnectionRefs.current[mode] = null;
        readyHrefRefs.current[mode] = { embedded: "", standalone: "" };
        standaloneSessionTokenRefs.current[mode] = "";
      });
      pendingKeyboardInspectionRef.current = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => restoreStoredScrollPosition(previewMode), 0);
    return () => window.clearTimeout(timer);
  }, [previewMode, selectedProject, referenceTarget]);

  useEffect(() => {
    previewModes.forEach((mode) => {
      postBridgeCommand(mode, "studio-set-edit-visual-mode", {
        enabled: mode === "workspace" && editEnabled
      });
    });
  }, [editEnabled]);

  useEffect(() => {
    if (courseEditPreview) {
      postBridgeCommand("workspace", "studio-set-edit-preview", courseEditPreview);
    }
  }, [courseEditPreview]);

  return {
    registerPreviewFrame,
    attachPreviewPersistence,
    getPreviewFrame: (mode: PreviewMode) => previewFrameRefs.current[mode],
    persistAllVisibleScrollPositions,
    copyPreviewModeScrollPosition,
    syncFocusModeScrollPosition,
    fitPreviewToWidth,
    prepareStandalonePreview,
    focusStandalonePreview,
    revokeStandalonePreview,
    retargetStandalonePreview,
    standalonePreviewMatchesTarget,
    requestCurrentInspectionSelection,
    setPreviewInspectMode,
    beginKeyboardPreviewInspection,
    focusPreviewInspectionSelection,
    restorePreviewLocation,
    syncStandaloneReviewSet,
    sendStandaloneReviewActionResult,
    syncStandaloneCourseEditing,
    sendStandaloneCourseEditActionResult,
    refreshStandalonePreview,
    cancelStandaloneReviewCopy
  };
}
