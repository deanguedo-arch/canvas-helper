import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";

import { loadPreviewScrollMap, savePreviewScrollMap } from "../lib/storage";
import { capturePreviewScrollPosition, restorePreviewScrollPosition } from "../lib/preview-scroll";
import { getTargetKey } from "../lib/preview-urls";
import {
  normalizeZoom,
  previewModes,
  type PreviewLayoutPreferences,
  type PreviewMode,
  type ProjectBundle,
  type ReferenceTarget,
  type ScrollSelectorCache,
  type PreviewScrollMap
} from "../lib/types";

type PreviewTarget = Pick<ReferenceTarget, "projectSlug" | "root" | "htmlPath"> & Partial<ReferenceTarget>;

type UsePreviewScrollSyncOptions = {
  previewMode: PreviewMode;
  layoutPreferences: PreviewLayoutPreferences;
  setLayoutPreferences: Dispatch<SetStateAction<PreviewLayoutPreferences>>;
  selectedProject: ProjectBundle | null;
  workspaceTarget: PreviewTarget | null;
  referenceTarget: ReferenceTarget;
};

export function usePreviewScrollSync({
  previewMode,
  layoutPreferences,
  setLayoutPreferences,
  selectedProject,
  workspaceTarget,
  referenceTarget
}: UsePreviewScrollSyncOptions) {
  const previewFrameRefs = useRef<Record<PreviewMode, HTMLIFrameElement | null>>({
    reference: null,
    workspace: null
  });
  const previewCleanupRefs = useRef<Record<PreviewMode, (() => void) | null>>({
    reference: null,
    workspace: null
  });
  const previewScrollMapRef = useRef<PreviewScrollMap>(loadPreviewScrollMap());
  const scrollSelectorCacheRef = useRef<ScrollSelectorCache>({});

  const getModeTarget = (mode: PreviewMode) => {
    if (mode === "workspace") {
      return workspaceTarget;
    }

    return referenceTarget.projectSlug ? referenceTarget : null;
  };

  const persistPreviewScrollPosition = (mode: PreviewMode) => {
    const target = getModeTarget(mode);
    const iframe = previewFrameRefs.current[mode];
    if (!iframe || !target) {
      return;
    }

    const key = getTargetKey(target);
    const cachedSelectors = scrollSelectorCacheRef.current[key];
    const captured = capturePreviewScrollPosition(iframe, cachedSelectors);
    if (!captured) {
      return;
    }

    scrollSelectorCacheRef.current[key] = captured.selectors;
    previewScrollMapRef.current[key] = captured.position;
    savePreviewScrollMap(previewScrollMapRef.current);
  };

  const persistAllVisibleScrollPositions = () => {
    previewModes.forEach((mode) => persistPreviewScrollPosition(mode));
  };

  const copyPreviewModeScrollPosition = (sourceMode: PreviewMode, targetMode: PreviewMode) => {
    const sourceTarget = getModeTarget(sourceMode);
    const targetTarget = getModeTarget(targetMode);
    if (!sourceTarget || !targetTarget) {
      return;
    }

    const sourceIframe = previewFrameRefs.current[sourceMode];
    if (!sourceIframe) {
      return;
    }

    const sourceKey = getTargetKey(sourceTarget);
    const cachedSelectors = scrollSelectorCacheRef.current[sourceKey];
    const captured = capturePreviewScrollPosition(sourceIframe, cachedSelectors);
    if (!captured) {
      return;
    }

    scrollSelectorCacheRef.current[sourceKey] = captured.selectors;
    previewScrollMapRef.current[sourceKey] = captured.position;

    const targetKey = getTargetKey(targetTarget);
    scrollSelectorCacheRef.current[targetKey] = captured.selectors;
    previewScrollMapRef.current[targetKey] = captured.position;

    savePreviewScrollMap(previewScrollMapRef.current);

    const targetIframe = previewFrameRefs.current[targetMode];
    if (targetIframe) {
      restorePreviewScrollPosition(targetIframe, captured.position);
    }
  };

  const syncFocusModeScrollPosition = (fromMode: PreviewMode, toMode: PreviewMode) => {
    if (fromMode === toMode) {
      return;
    }

    copyPreviewModeScrollPosition(fromMode, toMode);
  };

  const attachPreviewPersistence = (mode: PreviewMode) => {
    const target = getModeTarget(mode);
    const iframe = previewFrameRefs.current[mode];
    const contentWindow = iframe?.contentWindow;
    const contentDocument = iframe?.contentDocument;
    if (!iframe || !contentWindow || !contentDocument || !target) {
      previewCleanupRefs.current[mode] = null;
      return;
    }

    const key = getTargetKey(target);
    const stored = previewScrollMapRef.current[key];
    if (stored) {
      restorePreviewScrollPosition(iframe, stored);
    }

    let frameHandle = 0;
    const scheduleSave = () => {
      if (frameHandle) {
        return;
      }

      frameHandle = contentWindow.requestAnimationFrame(() => {
        frameHandle = 0;
        persistPreviewScrollPosition(mode);
      });
    };

    contentWindow.addEventListener("scroll", scheduleSave, { passive: true });
    contentWindow.addEventListener("hashchange", scheduleSave);
    contentDocument.addEventListener("scroll", scheduleSave, true);

    previewCleanupRefs.current[mode] = () => {
      if (frameHandle) {
        contentWindow.cancelAnimationFrame(frameHandle);
      }

      persistPreviewScrollPosition(mode);
      contentWindow.removeEventListener("scroll", scheduleSave);
      contentWindow.removeEventListener("hashchange", scheduleSave);
      contentDocument.removeEventListener("scroll", scheduleSave, true);
    };
  };

  const registerPreviewFrame = (mode: PreviewMode, node: HTMLIFrameElement | null) => {
    if (!node) {
      previewCleanupRefs.current[mode]?.();
      previewCleanupRefs.current[mode] = null;
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
    const handleBeforeUnload = () => {
      persistAllVisibleScrollPositions();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      previewModes.forEach((mode) => {
        previewCleanupRefs.current[mode]?.();
        previewCleanupRefs.current[mode] = null;
      });
    };
  }, [selectedProject, referenceTarget, layoutPreferences.compareMode]);

  useEffect(() => {
    const target = getModeTarget(previewMode);
    const iframe = previewFrameRefs.current[previewMode];
    if (!target || !iframe) {
      return;
    }

    const key = getTargetKey(target);
    const stored = previewScrollMapRef.current[key];
    if (!stored) {
      return;
    }

    const timer = window.setTimeout(() => restorePreviewScrollPosition(iframe, stored), 0);
    return () => window.clearTimeout(timer);
  }, [previewMode, selectedProject, referenceTarget]);

  return {
    registerPreviewFrame,
    attachPreviewPersistence,
    persistAllVisibleScrollPositions,
    copyPreviewModeScrollPosition,
    syncFocusModeScrollPosition,
    fitPreviewToWidth
  };
}
