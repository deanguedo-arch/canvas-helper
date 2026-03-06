import { useEffect, useMemo, useState } from "react";

import { loadStudioSelection, saveStudioSelection } from "../lib/storage";
import type { PreviewMode, ProjectBundle } from "../lib/types";

export function useStudioSelection(projects: ProjectBundle[]) {
  const initialSelection = useMemo(() => loadStudioSelection(), []);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSelection.selectedSlug);
  const [previewMode, setPreviewMode] = useState<PreviewMode>(initialSelection.previewMode);

  useEffect(() => {
    const fallbackSlug =
      selectedSlug && projects.some((project) => project.manifest.slug === selectedSlug)
        ? selectedSlug
        : projects[0]?.manifest.slug ?? "";

    if (fallbackSlug !== selectedSlug) {
      setSelectedSlug(fallbackSlug);
    }
  }, [projects, selectedSlug]);

  useEffect(() => {
    saveStudioSelection(selectedSlug, previewMode);
  }, [previewMode, selectedSlug]);

  return {
    selectedSlug,
    setSelectedSlug,
    previewMode,
    setPreviewMode
  };
}
