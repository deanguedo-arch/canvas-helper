import { useEffect, useState } from "react";

import { loadPreviewLayoutPreferences, savePreviewLayoutPreferences } from "../lib/storage";
import type { PreviewLayoutPreferences, PreviewMode } from "../lib/types";

export function useLayoutPreferences() {
  const [layoutPreferences, setLayoutPreferences] = useState<PreviewLayoutPreferences>(() =>
    loadPreviewLayoutPreferences()
  );
  const [paneControlsVisible, setPaneControlsVisible] = useState<Record<PreviewMode, boolean>>({
    reference: true,
    workspace: true
  });

  useEffect(() => {
    savePreviewLayoutPreferences(layoutPreferences);
  }, [layoutPreferences]);

  return {
    layoutPreferences,
    setLayoutPreferences,
    paneControlsVisible,
    setPaneControlsVisible
  };
}
