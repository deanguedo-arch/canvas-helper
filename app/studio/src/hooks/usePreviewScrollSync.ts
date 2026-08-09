import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";

import {
  createPreviewBridgeBootstrap,
  createPreviewBridgeMessage,
  isPreviewBridgeMessage,
  isPreviewEventMessage,
  isPreviewStandaloneBridgeBootstrap,
  PREVIEW_BRIDGE_MAX_MESSAGE_BYTES,
  PREVIEW_STANDALONE_SESSION_PARAM,
  previewBridgeMessageByteLength,
  type PreviewDiagnostic,
  type PreviewInspectPayload,
  type PreviewReviewAction,
  type PreviewReviewActionResult,
  type PreviewReviewState,
  type PreviewScrollState
} from "../../../shared/preview-bridge.js";
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

type UsePreviewScrollSyncOptions = {
  previewMode: PreviewMode;
  layoutPreferences: PreviewLayoutPreferences;
  setLayoutPreferences: Dispatch<SetStateAction<PreviewLayoutPreferences>>;
  selectedProject: ProjectBundle | null;
  workspaceTarget: PreviewTarget | null;
  referenceTarget: ReferenceTarget;
  previewOrigin: string;
  inspectEnabled: boolean;
  onInspectSelection: (mode: PreviewMode, selection: PreviewInspectPayload) => void;
  onInspectHover?: (mode: PreviewMode, selection: PreviewInspectPayload) => void;
  onInspectModeChange?: (enabled: boolean) => void;
  onPreviewReviewAction?: (mode: PreviewMode, action: PreviewReviewAction) => void;
  onPreviewDiagnostic?: (mode: PreviewMode, diagnostic: PreviewDiagnostic) => void;
};

type BridgeState = Pick<
  UsePreviewScrollSyncOptions,
  "previewMode" | "selectedProject" | "workspaceTarget" | "referenceTarget" | "previewOrigin" | "inspectEnabled"
>;

type PendingInspectionRequest = {
  nodeId: string;
  resolve: (selection: PreviewInspectPayload) => void;
  reject: (error: Error) => void;
  timeout: number;
};

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
  onInspectSelection,
  onInspectHover,
  onInspectModeChange,
  onPreviewReviewAction,
  onPreviewDiagnostic
}: UsePreviewScrollSyncOptions) {
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
  const standalonePreviewPortRefs = useRef<Record<PreviewMode, MessagePort | null>>({
    reference: null,
    workspace: null
  });
  const standaloneSessionTokenRefs = useRef<Record<PreviewMode, string>>({
    reference: "",
    workspace: ""
  });
  const pendingInspectionRequestRefs = useRef<Record<PreviewMode, PendingInspectionRequest | null>>({
    reference: null,
    workspace: null
  });
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
    inspectEnabled
  });
  const inspectionCallbacksRef = useRef({ onInspectSelection, onInspectHover, onInspectModeChange, onPreviewReviewAction, onPreviewDiagnostic });
  stateRef.current = {
    previewMode,
    selectedProject,
    workspaceTarget,
    referenceTarget,
    previewOrigin,
    inspectEnabled
  };
  inspectionCallbacksRef.current = { onInspectSelection, onInspectHover, onInspectModeChange, onPreviewReviewAction, onPreviewDiagnostic };

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
    pendingInspectionRequestRefs.current[mode] = null;
    if (error) {
      pending.reject(error);
    }
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

  const postBridgeCommand = (
    mode: PreviewMode,
    type:
      | "studio-request-state"
      | "studio-restore-scroll"
      | "studio-set-inspect-mode"
      | "studio-request-inspect-current"
      | "studio-focus-inspect-node",
    payload: unknown
  ) => {
    const framePort = previewPortRefs.current[mode];
    const standalonePort = standalonePreviewPortRefs.current[mode];
    if (!framePort && !standalonePort) {
      return;
    }

    const message = createPreviewBridgeMessage(type, payload);
    if (previewBridgeMessageByteLength(message) > PREVIEW_BRIDGE_MAX_MESSAGE_BYTES) {
      return;
    }

    postToPort(framePort, message);
    if (standalonePort !== framePort) {
      postToPort(standalonePort, message);
    }
  };

  const postStandaloneBridgeCommand = (
    mode: PreviewMode,
    type: "studio-set-review-state" | "studio-set-review-packet" | "studio-review-action-result",
    payload: unknown
  ) => {
    const port = standalonePreviewPortRefs.current[mode];
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

  const handleBridgeMessage = (mode: PreviewMode, data: unknown, source: "embedded" | "standalone") => {
    if (!isPreviewBridgeMessage(data) || !isPreviewEventMessage(data) || previewBridgeMessageByteLength(data) > PREVIEW_BRIDGE_MAX_MESSAGE_BYTES) {
      return;
    }

    switch (data.type) {
      case "preview-ready":
        previewReadyRefs.current[mode] = true;
        restoreStoredScrollPosition(mode);
        postBridgeCommand(mode, "studio-request-state", null);
        postBridgeCommand(mode, "studio-set-inspect-mode", { enabled: stateRef.current.inspectEnabled });
        break;
      case "preview-scroll-state": {
        previewReadyRefs.current[mode] = true;
        const position = toScrollPosition(data.payload as PreviewScrollState);
        latestScrollStateRef.current[mode] = position;
        persistPreviewScrollPosition(mode);
        break;
      }
      case "preview-inspect-hover":
        inspectionCallbacksRef.current.onInspectHover?.(mode, data.payload as PreviewInspectPayload);
        break;
      case "preview-inspect-selected":
        inspectionCallbacksRef.current.onInspectSelection(mode, data.payload as PreviewInspectPayload);
        break;
      case "preview-inspect-current": {
        const selection = data.payload as PreviewInspectPayload;
        const pending = pendingInspectionRequestRefs.current[mode];
        if (!pending || pending.nodeId !== selection.nodeId) {
          break;
        }
        window.clearTimeout(pending.timeout);
        pendingInspectionRequestRefs.current[mode] = null;
        pending.resolve(selection);
        break;
      }
      case "preview-inspect-mode": {
        const enabled = Boolean((data.payload as { enabled?: boolean }).enabled);
        stateRef.current = {
          ...stateRef.current,
          inspectEnabled: enabled
        };
        previewModes.forEach((targetMode) => {
          postBridgeCommand(targetMode, "studio-set-inspect-mode", { enabled });
        });
        inspectionCallbacksRef.current.onInspectModeChange?.(enabled);
        break;
      }
      case "preview-review-action":
        if (source === "standalone") {
          inspectionCallbacksRef.current.onPreviewReviewAction?.(mode, data.payload as PreviewReviewAction);
        }
        break;
      case "preview-diagnostic":
        inspectionCallbacksRef.current.onPreviewDiagnostic?.(mode, data.payload as PreviewDiagnostic);
        break;
      case "preview-error":
        clearPendingInspectionRequest(mode, new Error("The preview could not refresh the selected element. Select it again before capturing a screenshot."));
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
    clearPendingInspectionRequest(mode, new Error("The preview reloaded before the selected element could be refreshed."));
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

  const prepareStandalonePreview = (mode: PreviewMode, previewUrl: string) => {
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

    const sessionToken = typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : Array.from(window.crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16).padStart(8, "0")).join("");
    targetUrl.searchParams.set(PREVIEW_STANDALONE_SESSION_PARAM, sessionToken);
    standaloneSessionTokenRefs.current[mode] = sessionToken;
    window.setTimeout(() => {
      if (standaloneSessionTokenRefs.current[mode] === sessionToken) {
        standaloneSessionTokenRefs.current[mode] = "";
      }
    }, 15_000);
    return targetUrl.toString();
  };

  const attachPreviewPersistence = (mode: PreviewMode) => {
    connectPreviewBridge(mode);
  };

  const requestCurrentInspectionSelection = (mode: PreviewMode, nodeId: string) => {
    const hasReadyPort = Boolean(
      (previewPortRefs.current[mode] && previewReadyRefs.current[mode]) || standalonePreviewPortRefs.current[mode]
    );
    if (!hasReadyPort) {
      return Promise.reject(new Error("The preview bridge is not ready. Select the element again before capturing a screenshot."));
    }

    clearPendingInspectionRequest(mode, new Error("A newer screenshot request replaced the previous one."));
    return new Promise<PreviewInspectPayload>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        const pending = pendingInspectionRequestRefs.current[mode];
        if (pending?.nodeId !== nodeId) {
          return;
        }
        pendingInspectionRequestRefs.current[mode] = null;
        reject(new Error("The preview did not confirm the selected element. Select it again before capturing a screenshot."));
      }, 1_500);
      pendingInspectionRequestRefs.current[mode] = { nodeId, resolve, reject, timeout };
      postBridgeCommand(mode, "studio-request-inspect-current", { nodeId });
    });
  };

  const setPreviewInspectMode = (enabled: boolean) => {
    stateRef.current = {
      ...stateRef.current,
      inspectEnabled: enabled
    };
    previewModes.forEach((mode) => {
      if (previewReadyRefs.current[mode] || standalonePreviewPortRefs.current[mode]) {
        postBridgeCommand(mode, "studio-set-inspect-mode", { enabled });
      }
    });
  };

  const focusPreviewInspectionSelection = (mode: PreviewMode, nodeId: string) => {
    const hasReadyPort = Boolean(
      (previewPortRefs.current[mode] && previewReadyRefs.current[mode]) || standalonePreviewPortRefs.current[mode]
    );
    if (!nodeId || !hasReadyPort) {
      return false;
    }
    postBridgeCommand(mode, "studio-focus-inspect-node", { nodeId });
    return true;
  };

  const syncStandaloneReviewSet = (mode: PreviewMode, state: PreviewReviewState, packet: string) => {
    postStandaloneBridgeCommand(mode, "studio-set-review-state", state);
    postStandaloneBridgeCommand(mode, "studio-set-review-packet", { packet });
  };

  const sendStandaloneReviewActionResult = (mode: PreviewMode, result: PreviewReviewActionResult) => {
    postStandaloneBridgeCommand(mode, "studio-review-action-result", result);
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
      if (
        !current.previewOrigin ||
        event.origin !== current.previewOrigin ||
        !event.ports ||
        event.ports.length !== 1 ||
        !isPreviewStandaloneBridgeBootstrap(event.data)
      ) {
        return;
      }

      const mode = previewModes.find(
        (candidate) => standaloneSessionTokenRefs.current[candidate] === event.data.payload.sessionToken
      );
      if (!mode) {
        return;
      }

      event.stopImmediatePropagation();
      standaloneSessionTokenRefs.current[mode] = "";
      standalonePreviewPortRefs.current[mode]?.close();
      const nextPort = event.ports[0];
      standalonePreviewPortRefs.current[mode] = nextPort;
      nextPort.onmessage = (portEvent) => {
        if (standalonePreviewPortRefs.current[mode] === nextPort) {
          handleBridgeMessage(mode, portEvent.data, "standalone");
        }
      };
      nextPort.start();
    };

    window.addEventListener("message", receiveStandaloneBridge, true);
    return () => window.removeEventListener("message", receiveStandaloneBridge, true);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => persistAllVisibleScrollPositions();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      previewModes.forEach((mode) => {
        previewReadyRefs.current[mode] = false;
        clearPendingInspectionRequest(mode, new Error("The Studio closed before the selected element could be refreshed."));
        previewPortRefs.current[mode]?.close();
        previewPortRefs.current[mode] = null;
        standalonePreviewPortRefs.current[mode]?.close();
        standalonePreviewPortRefs.current[mode] = null;
        standaloneSessionTokenRefs.current[mode] = "";
      });
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => restoreStoredScrollPosition(previewMode), 0);
    return () => window.clearTimeout(timer);
  }, [previewMode, selectedProject, referenceTarget]);

  return {
    registerPreviewFrame,
    attachPreviewPersistence,
    getPreviewFrame: (mode: PreviewMode) => previewFrameRefs.current[mode],
    persistAllVisibleScrollPositions,
    copyPreviewModeScrollPosition,
    syncFocusModeScrollPosition,
    fitPreviewToWidth,
    prepareStandalonePreview,
    requestCurrentInspectionSelection,
    setPreviewInspectMode,
    focusPreviewInspectionSelection,
    syncStandaloneReviewSet,
    sendStandaloneReviewActionResult
  };
}
