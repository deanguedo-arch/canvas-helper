import { useEffect, useRef, useState } from "react";

import { REVIEW_SCREENSHOT_MAX_BYTES, REVIEW_SCREENSHOT_MAX_PER_ITEM } from "../../../shared/inspection.js";
import type { PreviewInspectPayload } from "../../../shared/preview-bridge.js";

export type ScreenshotDraft = {
  id: string;
  imageUrl: string;
  png: Blob;
  width: number;
  height: number;
  cropped: boolean;
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

function loadImage(imageUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The captured screenshot could not be opened."));
    image.src = imageUrl;
  });
}

function canvasPng(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob || blob.type !== "image/png" || blob.size <= 0 || blob.size > REVIEW_SCREENSHOT_MAX_BYTES) {
        reject(new Error("The cropped screenshot is not a valid bounded PNG."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export async function cropScreenshotPng(png: Blob, selection: PreviewInspectPayload, padding = 24) {
  if (png.type !== "image/png" || png.size <= 0 || png.size > REVIEW_SCREENSHOT_MAX_BYTES) {
    throw new Error("The screenshot is not a valid bounded PNG.");
  }
  const sourceUrl = URL.createObjectURL(png);
  try {
    const image = await loadImage(sourceUrl);
    const { viewport, geometry } = selection;
    if (viewport.width <= 0 || viewport.height <= 0 || geometry.width <= 0 || geometry.height <= 0) {
      throw new Error("This selection does not have a crop area.");
    }
    const scaleX = image.naturalWidth / viewport.width;
    const scaleY = image.naturalHeight / viewport.height;
    const sourceX = Math.max(0, Math.floor((geometry.x - padding) * scaleX));
    const sourceY = Math.max(0, Math.floor((geometry.y - padding) * scaleY));
    const sourceRight = Math.min(image.naturalWidth, Math.ceil((geometry.x + geometry.width + padding) * scaleX));
    const sourceBottom = Math.min(image.naturalHeight, Math.ceil((geometry.y + geometry.height + padding) * scaleY));
    const width = sourceRight - sourceX;
    const height = sourceBottom - sourceY;
    if (width < 24 || height < 24) throw new Error("This selection is too small to crop safely.");
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("This browser could not prepare the crop.");
    context.drawImage(image, sourceX, sourceY, width, height, 0, 0, width, height);
    return { png: await canvasPng(canvas), width, height };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
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
    const image = await loadImage(imageUrl);
    return {
      id: createDraftId(),
      imageUrl,
      png,
      width: image.naturalWidth,
      height: image.naturalHeight,
      cropped: false
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
  const [status, setStatus] = useState<"idle" | "capturing" | "processing" | "ready" | "error">("idle");
  const [error, setError] = useState("");

  const replaceDrafts = (next: ScreenshotDraft[]) => {
    draftsRef.current = next;
    setDrafts(next);
  };

  const cancelCapture = () => {
    const active = activeCaptureRef.current;
    if (!active) return false;
    active.abort();
    activeCaptureRef.current = null;
    setStatus(draftsRef.current.length ? "ready" : "idle");
    setError("");
    return true;
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

  const crop = async (id: string, selection: PreviewInspectPayload) => {
    const existing = draftsRef.current.find((draft) => draft.id === id);
    if (!existing || existing.cropped || status === "capturing" || status === "processing") return false;
    setStatus("processing");
    setError("");
    try {
      const cropped = await cropScreenshotPng(existing.png, selection);
      const imageUrl = URL.createObjectURL(cropped.png);
      replaceDrafts(draftsRef.current.map((draft) => draft.id === id ? {
        ...draft,
        ...cropped,
        imageUrl,
        cropped: true
      } : draft));
      URL.revokeObjectURL(existing.imageUrl);
      setStatus("ready");
      return true;
    } catch (cropError) {
      setStatus("error");
      setError(cropError instanceof Error ? cropError.message : "Canvas Helper could not crop the screenshot.");
      return false;
    }
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
    cancel: cancelCapture,
    remove,
    crop,
    download,
    clear,
    reportError
  };
}
