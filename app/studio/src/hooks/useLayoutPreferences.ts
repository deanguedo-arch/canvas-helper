import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { loadPreviewLayoutPreferences, savePreviewLayoutPreferences } from "../lib/storage";
import type { PreviewLayoutPreferences, PreviewMode } from "../lib/types";

export function useLayoutPreferences(projectSlug: string) {
  const [layoutState, setLayoutState] = useState(() => ({
    projectSlug,
    preferences: loadPreviewLayoutPreferences(projectSlug)
  }));
  const [paneControlsVisible, setPaneControlsVisible] = useState<Record<PreviewMode, boolean>>({
    reference: false,
    workspace: false
  });
  const layoutPreferences = layoutState.projectSlug === projectSlug
    ? layoutState.preferences
    : loadPreviewLayoutPreferences(projectSlug);
  const setLayoutPreferences = useCallback<Dispatch<SetStateAction<PreviewLayoutPreferences>>>((update) => {
    setLayoutState((current) => {
      const previous = current.projectSlug === projectSlug
        ? current.preferences
        : loadPreviewLayoutPreferences(projectSlug);
      const preferences = typeof update === "function" ? update(previous) : update;
      savePreviewLayoutPreferences(preferences, projectSlug);
      return { projectSlug, preferences };
    });
  }, [projectSlug]);

  useEffect(() => {
    setLayoutState({
      projectSlug,
      preferences: loadPreviewLayoutPreferences(projectSlug)
    });
    setPaneControlsVisible({ reference: false, workspace: false });
  }, [projectSlug]);

  return {
    layoutPreferences,
    setLayoutPreferences,
    paneControlsVisible,
    setPaneControlsVisible
  };
}
