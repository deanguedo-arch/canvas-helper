import { useCallback, useEffect, useState } from "react";

type PreviewConfigResponse = {
  origin?: string;
  studioOrigin?: string;
  error?: string;
};

export function usePreviewRuntime() {
  const [previewOrigin, setPreviewOrigin] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [previewStatus, setPreviewStatus] = useState<"starting" | "ready" | "error">("starting");
  const [retryVersion, setRetryVersion] = useState(0);

  const retryPreview = useCallback(() => {
    setPreviewOrigin("");
    setPreviewError("");
    setPreviewStatus("starting");
    setRetryVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let retryTimer = 0;
    let attempts = 0;

    const load = async () => {
      attempts += 1;
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
          setPreviewStatus("ready");
          return;
        }

        if (response.status === 503 && attempts < 40) {
          retryTimer = window.setTimeout(() => void load(), 150);
          return;
        }

        const message = payload.studioOrigin && payload.studioOrigin !== window.location.origin
          ? `Studio must be opened at ${payload.studioOrigin} to use the isolated preview.`
          : payload.error || "The local preview is unavailable. Reconnect when the Studio server is ready.";
        setPreviewError(message);
        setPreviewStatus("error");
      } catch (error) {
        if (!controller.signal.aborted) {
          setPreviewError(error instanceof Error ? error.message : "The isolated preview server could not start.");
          setPreviewStatus("error");
        }
      }
    };

    void load();
    return () => {
      controller.abort();
      window.clearTimeout(retryTimer);
    };
  }, [retryVersion]);

  return { previewOrigin, previewError, previewStatus, retryPreview };
}
