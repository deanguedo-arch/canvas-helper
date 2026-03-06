import { useEffect, useState } from "react";

import { fetchProjects } from "../lib/projects";
import type { ProjectBundle } from "../lib/types";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectBundle[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const refreshProjects = async () => {
    const bundles = await fetchProjects();
    setProjects(bundles);
    setErrorMessage("");
  };

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const bundles = await fetchProjects();
        if (cancelled) {
          return;
        }

        setProjects(bundles);
        setErrorMessage("");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load projects.");
        }
      }
    };

    void loadProjects();

    if (import.meta.hot) {
      import.meta.hot.on("projects:changed", () => {
        void loadProjects();
      });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    projects,
    errorMessage,
    refreshProjects
  };
}
