import { useEffect, useState } from "react";

import type { CourseBuildBrief } from "../../../shared/course-build-brief.js";

export function useCourseBuildBrief(selectedSlug: string) {
  const [brief, setBrief] = useState<CourseBuildBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedSlug) {
      setBrief(null);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    setBrief(null);
    setLoading(true);
    setError("");
    void fetch(`/api/projects/${encodeURIComponent(selectedSlug)}/authoring-brief`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as CourseBuildBrief & { error?: string };
        if (!response.ok || !payload.projectSlug) {
          throw new Error(payload.error || "Course build brief is unavailable.");
        }
        return payload;
      })
      .then((payload) => {
        if (!controller.signal.aborted) {
          setBrief(payload);
        }
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : "Course build brief is unavailable.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedSlug]);

  return { brief, loading, error };
}
