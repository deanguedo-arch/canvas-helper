import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";

import {
  createPreviewBridgeBootstrap,
  createPreviewBridgeMessage,
  isPreviewBridgeMessage,
  isPreviewEventMessage,
  PREVIEW_BRIDGE_MAX_MESSAGE_BYTES,
  previewBridgeMessageByteLength,
  type PreviewInspectPayload,
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
};

type BridgeState = Pick<
  UsePreviewScrollSyncOptions,
  "previewMode" | "selectedProject" | "workspaceTarget" | "referenceTarget" | "previewOrigin" | "inspectEnabled"
>;

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
  onInspectHover
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
  const inspectionCallbacksRef = useRef({ onInspectSelection, onInspectHover });
  stateRef.current = {
    previewMode,
    selectedProject,
    workspaceTarget,
    referenceTarget,
    previewOrigin,
    inspectEnabled
  };
  inspectionCallbacksRef.current = { onInspectSelection, onInspectHover };

  const getModeTarget = (mode: PreviewMode) => {
    const current = stateRef.current;
    return mode === "workspace" ? current.workspaceTarget : current.referenceTarget.projectSlug ? current.referenceTarget : null;
  };

  const postBridgeCommand = (mode: PreviewMode, type: "studio-request-state" | "studio-restore-scroll" | "studio-set-inspect-mode", payload: unknown) => {
    const port = previewPortRefs.current[mode];
    if (!port) {
      return;
    }

    const message = createPreviewBridgeMessage(type, payload);
    if (previewBridgeMessageByteLength(message) > PREVIEW_BRIDGE_MAX_MESSAGE_BYTES) {
      return;
    }

    try {
      port.postMessage(message);
    } catch {
      // A preview navigation can close a port between readiness and dispatch.
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

  const handleBridgeMessage = (mode: PreviewMode, data: unknown) => {
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
    previewPortRefs.current[mode]?.close();

    const channel = new MessageChannel();
    previewPortRefs.current[mode] = channel.port1;
    channel.port1.onmessage = (event) => {
      if (previewPortRefs.current[mode] !== channel.port1) {
        return;
      }
      handleBridgeMessage(mode, event.data);
    };
    channel.port1.start();

    try {
      iframe.contentWindow.postMessage(createPreviewBridgeBootstrap(), current.previewOrigin, [channel.port2]);
    } catch {
      channel.port1.close();
      previewPortRefs.current[mode] = null;
    }
  };

  const attachPreviewPersistence = (mode: PreviewMode) => {
    connectPreviewBridge(mode);
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
    previewModes.forEach((mode) => {
      if (previewReadyRefs.current[mode]) {
        postBridgeCommand(mode, "studio-set-inspect-mode", { enabled: inspectEnabled });
      }
    });
  }, [inspectEnabled, previewOrigin]);

  useEffect(() => {
    const handleBeforeUnload = () => persistAllVisibleScrollPositions();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      previewModes.forEach((mode) => {
        previewReadyRefs.current[mode] = false;
        previewPortRefs.current[mode]?.close();
        previewPortRefs.current[mode] = null;
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
    fitPreviewToWidth
  };
}
