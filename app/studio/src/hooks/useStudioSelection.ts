import { useEffect, useMemo, useState } from "react";

import { loadStudioSelection, saveStudioSelection } from "../lib/storage";
import type { PreviewMode, ProjectBundle } from "../lib/types";
import { orderProjectSlugs } from "../lib/project-display";

export function useStudioSelection(projects: ProjectBundle[]) {
  const initialSelection = useMemo(() => loadStudioSelection(), []);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSelection.selectedSlug);
  const [previewMode, setPreviewMode] = useState<PreviewMode>(initialSelection.previewMode);

  useEffect(() => {
    const orderedSlugs = orderProjectSlugs(projects.map((project) => project.manifest.slug));
    const fallbackSlug =
      selectedSlug && projects.some((project) => project.manifest.slug === selectedSlug)
        ? selectedSlug
        : orderedSlugs[0] ?? "";

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
