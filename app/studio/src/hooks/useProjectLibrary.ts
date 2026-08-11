import { useCallback, useEffect, useState } from "react";

import {
  loadProjectLibrary,
  saveProjectLibrary,
  toggleFavoriteProject,
  touchRecentProject
} from "../lib/project-library";

export function useProjectLibrary(selectedSlug: string) {
  const [library, setLibrary] = useState(loadProjectLibrary);

  useEffect(() => {
    if (!selectedSlug) return;
    setLibrary((current) => {
      const next = touchRecentProject(current, selectedSlug);
      saveProjectLibrary(next);
      return next;
    });
  }, [selectedSlug]);

  const toggleFavorite = useCallback((slug: string) => {
    setLibrary((current) => {
      const next = toggleFavoriteProject(current, slug);
      saveProjectLibrary(next);
      return next;
    });
  }, []);

  return {
    favoriteSlugs: library.favorites,
    recentSlugs: library.recents.map((recent) => recent.slug),
    toggleFavorite
  };
}
