import { useEffect, useState } from "react";

type PreviewConfigResponse = {
  origin?: string;
  studioOrigin?: string;
  error?: string;
};

export function usePreviewRuntime() {
  const [previewOrigin, setPreviewOrigin] = useState("");
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let retryTimer = 0;

    const load = async () => {
      try {
        const response = await fetch("/api/preview-config", {
          cache: "no-store",
          signal: controller.signal
        });
        const payload = (await response.json().catch(() => ({}))) as PreviewConfigResponse;
        if (
          response.ok &&
          typeof payload.origin === "string" &&
          /^https?:\/\//.test(payload.origin) &&
          payload.studioOrigin === window.location.origin
        ) {
          setPreviewOrigin(payload.origin);
          setPreviewError("");
          return;
        }

        if (response.status === 503) {
          retryTimer = window.setTimeout(() => void load(), 150);
          return;
        }

        setPreviewError(
          payload.studioOrigin && payload.studioOrigin !== window.location.origin
            ? `Studio must be opened at ${payload.studioOrigin} to use the isolated preview.`
            : payload.error || "The isolated preview server could not start."
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setPreviewError(error instanceof Error ? error.message : "The isolated preview server could not start.");
        }
      }
    };

    void load();
    return () => {
      controller.abort();
      window.clearTimeout(retryTimer);
    };
  }, []);

  return { previewOrigin, previewError };
}
