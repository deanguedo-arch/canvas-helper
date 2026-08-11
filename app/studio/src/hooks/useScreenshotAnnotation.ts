import { useEffect, useRef, useState } from "react";

import { REVIEW_SCREENSHOT_MAX_BYTES, REVIEW_SCREENSHOT_MAX_PER_ITEM } from "../../../shared/inspection.js";
import type { PreviewInspectPayload } from "../../../shared/preview-bridge.js";

export type ScreenshotDraft = {
  id: string;
  imageUrl: string;
  png: Blob;
  width: number;
  height: number;
};

type CaptureScreenshotOptions = {
  projectSlug: string;
  selection: PreviewInspectPayload;
  markerNumber: number;
  isCurrent: () => boolean;
};

function createDraftId() {
  if (typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return Array.from(window.crypto.getRandomValues(new Uint32Array(2)), (value) => value.toString(16).padStart(8, "0")).join("");
}

function imageDimensions(imageUrl: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("The captured screenshot could not be opened."));
    image.src = imageUrl;
  });
}

export function releaseScreenshotDraft(draft: ScreenshotDraft | null | undefined) {
  if (draft?.imageUrl) {
    URL.revokeObjectURL(draft.imageUrl);
  }
}

export function releaseScreenshotDrafts(drafts: ScreenshotDraft[]) {
  drafts.forEach(releaseScreenshotDraft);
}

export async function capturePreviewScreenshot(
  options: Omit<CaptureScreenshotOptions, "isCurrent"> & { signal?: AbortSignal }
) {
  if (!options.selection.nodeId) {
    throw new Error("Select a course element before capturing a screenshot.");
  }
  const response = await fetch("/api/inspection/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectSlug: options.projectSlug,
      selection: options.selection,
      markerNumber: options.markerNumber
    }),
    signal: options.signal
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || "Canvas Helper could not capture the course preview.");
  }
  const png = await response.blob();
  if (png.type !== "image/png" || png.size <= 0 || png.size > REVIEW_SCREENSHOT_MAX_BYTES) {
    throw new Error("The captured screenshot is not a valid bounded PNG.");
  }
  const imageUrl = URL.createObjectURL(png);
  try {
    const dimensions = await imageDimensions(imageUrl);
    return {
      id: createDraftId(),
      imageUrl,
      png,
      ...dimensions
    } satisfies ScreenshotDraft;
  } catch (error) {
    URL.revokeObjectURL(imageUrl);
    throw error;
  }
}

export function useScreenshotAnnotation() {
  const draftsRef = useRef<ScreenshotDraft[]>([]);
  const activeCaptureRef = useRef<AbortController | null>(null);
  const [drafts, setDrafts] = useState<ScreenshotDraft[]>([]);
  const [status, setStatus] = useState<"idle" | "capturing" | "ready" | "error">("idle");
  const [error, setError] = useState("");

  const replaceDrafts = (next: ScreenshotDraft[]) => {
    draftsRef.current = next;
    setDrafts(next);
  };

  const cancelCapture = () => {
    activeCaptureRef.current?.abort();
    activeCaptureRef.current = null;
  };

  const clear = () => {
    cancelCapture();
    releaseScreenshotDrafts(draftsRef.current);
    replaceDrafts([]);
    setStatus("idle");
    setError("");
  };

  const reportError = (message: string) => {
    cancelCapture();
    setStatus("error");
    setError(message);
  };

  useEffect(() => () => {
    cancelCapture();
    releaseScreenshotDrafts(draftsRef.current);
  }, []);

  const capture = async (options: CaptureScreenshotOptions) => {
    if (!options.isCurrent()) {
      return null;
    }
    if (draftsRef.current.length >= REVIEW_SCREENSHOT_MAX_PER_ITEM) {
      reportError(`Each annotation can include up to ${REVIEW_SCREENSHOT_MAX_PER_ITEM} screenshots.`);
      return null;
    }
    if (activeCaptureRef.current) {
      return null;
    }
    const controller = new AbortController();
    activeCaptureRef.current = controller;
    setStatus("capturing");
    setError("");
    try {
      const draft = await capturePreviewScreenshot({
        projectSlug: options.projectSlug,
        selection: options.selection,
        markerNumber: options.markerNumber,
        signal: controller.signal
      });
      if (controller.signal.aborted || !options.isCurrent()) {
        releaseScreenshotDraft(draft);
        return null;
      }
      replaceDrafts([...draftsRef.current, draft]);
      setStatus("ready");
      return draft;
    } catch (captureError) {
      if (controller.signal.aborted) {
        return null;
      }
      setStatus("error");
      setError(captureError instanceof Error ? captureError.message : "Canvas Helper could not capture the course preview.");
      return null;
    } finally {
      if (activeCaptureRef.current === controller) {
        activeCaptureRef.current = null;
      }
    }
  };

  const remove = (id: string) => {
    const existing = draftsRef.current.find((draft) => draft.id === id);
    if (!existing) {
      return;
    }
    releaseScreenshotDraft(existing);
    const next = draftsRef.current.filter((draft) => draft.id !== id);
    replaceDrafts(next);
    setStatus(next.length ? "ready" : "idle");
    setError("");
  };

  const download = (id: string) => {
    const draft = draftsRef.current.find((candidate) => candidate.id === id);
    if (!draft) {
      return;
    }
    const link = document.createElement("a");
    link.href = draft.imageUrl;
    link.download = `canvas-helper-annotation-${draftsRef.current.indexOf(draft) + 1}.png`;
    link.click();
  };

  return {
    drafts,
    status,
    error,
    isSupported: typeof window !== "undefined" && typeof window.fetch === "function",
    capture,
    remove,
    download,
    clear,
    reportError
  };
}
