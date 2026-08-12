import { useCallback, useEffect, useRef, useState } from "react";

import { fetchProjects, refreshIncomingIntake } from "../lib/projects";
import type { IncomingRefreshSummary, ProjectBundle } from "../lib/types";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectBundle[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [incomingRefreshRunning, setIncomingRefreshRunning] = useState(false);
  const [incomingRefreshMessage, setIncomingRefreshMessage] = useState("");
  const [incomingRefreshIsError, setIncomingRefreshIsError] = useState(false);
  const requestRef = useRef<Promise<ProjectBundle[]> | null>(null);
  const requestVersionRef = useRef(0);

  const loadProjectsOnce = useCallback(async (force = false) => {
    if (!force && requestRef.current) return requestRef.current;
    const requestVersion = ++requestVersionRef.current;
    const request = fetchProjects();
    requestRef.current = request;
    try {
      const bundles = await request;
      if (requestVersion === requestVersionRef.current) {
        setProjects(bundles);
        setErrorMessage("");
      }
      return bundles;
    } catch (error) {
      if (requestVersion === requestVersionRef.current) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load projects.");
      }
      throw error;
    } finally {
      if (requestRef.current === request) requestRef.current = null;
    }
  }, []);

  const refreshProjects = async (force = false) => {
    try {
      await loadProjectsOnce(force);
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load projects.");
      return false;
    }
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
      const refreshed = await refreshProjects(true);
      if (!refreshed) throw new Error("The intake scan finished, but Studio could not refresh the course list.");
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
        await loadProjectsOnce();
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
  }, [loadProjectsOnce]);

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
