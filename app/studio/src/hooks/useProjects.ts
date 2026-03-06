import { useEffect, useState } from "react";

import { fetchProjects, refreshIncomingIntake } from "../lib/projects";
import type { IncomingRefreshSummary, ProjectBundle } from "../lib/types";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectBundle[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [incomingRefreshRunning, setIncomingRefreshRunning] = useState(false);
  const [incomingRefreshMessage, setIncomingRefreshMessage] = useState("");
  const [incomingRefreshIsError, setIncomingRefreshIsError] = useState(false);

  const refreshProjects = async () => {
    const bundles = await fetchProjects();
    setProjects(bundles);
    setErrorMessage("");
  };

  const toIncomingRefreshMessage = (summary: IncomingRefreshSummary) => {
    const parts: string[] = [];

    if (summary.importedProjects.length > 0) {
      parts.push(
        `Imported ${summary.importedProjects.length} project${summary.importedProjects.length === 1 ? "" : "s"}`
      );
    }

    if (summary.syncedReferences.length > 0) {
      const refreshedResourceProjects = new Set(summary.syncedReferences.map((item) => item.slug)).size;
      parts.push(
        `refreshed resources for ${refreshedResourceProjects} project${refreshedResourceProjects === 1 ? "" : "s"}`
      );
    }

    if (summary.skippedProjects.length > 0) {
      parts.push(
        `skipped ${summary.skippedProjects.length} project${summary.skippedProjects.length === 1 ? "" : "s"}`
      );
    }

    if (summary.failures.length > 0) {
      parts.push(
        `${summary.failures.length} failure${summary.failures.length === 1 ? "" : "s"}`
      );
    }

    return parts.length > 0 ? `${parts.join(", ")}.` : "No incoming items were ready.";
  };

  const refreshIncoming = async () => {
    if (incomingRefreshRunning) {
      return null;
    }

    setIncomingRefreshRunning(true);
    setIncomingRefreshIsError(false);
    setIncomingRefreshMessage("");

    try {
      const summary = await refreshIncomingIntake();
      await refreshProjects();
      setIncomingRefreshMessage(toIncomingRefreshMessage(summary));
      setIncomingRefreshIsError(summary.failures.length > 0);
      return summary;
    } catch (error) {
      setIncomingRefreshMessage(error instanceof Error ? error.message : "Failed to refresh incoming intake.");
      setIncomingRefreshIsError(true);
      return null;
    } finally {
      setIncomingRefreshRunning(false);
    }
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

    const refreshOnFocus = () => {
      void loadProjects();
    };

    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") {
        void loadProjects();
      }
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnVisible);

    if (import.meta.hot) {
      import.meta.hot.on("projects:changed", () => {
        void loadProjects();
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, []);

  return {
    projects,
    errorMessage,
    refreshProjects,
    refreshIncoming,
    incomingRefreshRunning,
    incomingRefreshMessage,
    incomingRefreshIsError
  };
}
