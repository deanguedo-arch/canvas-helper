import { useEffect, useRef, useState } from "react";

import type { PreviewGeometry } from "../../../shared/preview-bridge.js";

export type AnnotationRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ScreenshotAnnotation = {
  imageUrl: string;
  width: number;
  height: number;
  marker: AnnotationRect;
};

type CaptureScreenshotOptions = {
  iframe: HTMLIFrameElement | null;
  geometry: PreviewGeometry;
  expectedPreviewUrl: string;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function normalizeMarker(marker: AnnotationRect, width: number, height: number): AnnotationRect {
  const x = clamp(Math.round(marker.x), 0, width);
  const y = clamp(Math.round(marker.y), 0, height);
  const right = clamp(Math.round(marker.x + marker.width), x, width);
  const bottom = clamp(Math.round(marker.y + marker.height), y, height);
  return { x, y, width: right - x, height: bottom - y };
}

function clearCanvas(canvas: HTMLCanvasElement | null) {
  if (canvas) {
    canvas.width = 0;
    canvas.height = 0;
  }
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("The screenshot could not be encoded."))), "image/png");
  });
}

function assertCurrentPreview(iframe: HTMLIFrameElement, expectedPreviewUrl: string) {
  if (!expectedPreviewUrl || iframe.src !== new URL(expectedPreviewUrl, window.location.href).href) {
    throw new Error("The preview changed after selection. Select the element again before capturing a screenshot.");
  }
}

function cropPreviewFrame(options: {
  frameCanvas: HTMLCanvasElement;
  iframe: HTMLIFrameElement;
  geometry: PreviewGeometry;
}) {
  const { frameCanvas, iframe, geometry } = options;
  const frameBounds = iframe.getBoundingClientRect();
  if (frameBounds.width <= 0 || frameBounds.height <= 0 || iframe.clientWidth <= 0 || iframe.clientHeight <= 0) {
    throw new Error("The selected preview is no longer visible. Select it again before capturing a screenshot.");
  }

  const captureScaleX = frameCanvas.width / window.innerWidth;
  const captureScaleY = frameCanvas.height / window.innerHeight;
  if (!Number.isFinite(captureScaleX) || !Number.isFinite(captureScaleY) || captureScaleX <= 0 || captureScaleY <= 0) {
    throw new Error("The captured tab has no usable pixel dimensions.");
  }

  const sourceX = Math.round(frameBounds.left * captureScaleX);
  const sourceY = Math.round(frameBounds.top * captureScaleY);
  const sourceWidth = Math.round(frameBounds.width * captureScaleX);
  const sourceHeight = Math.round(frameBounds.height * captureScaleY);
  if (
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    sourceX < 0 ||
    sourceY < 0 ||
    sourceX + sourceWidth > frameCanvas.width ||
    sourceY + sourceHeight > frameCanvas.height
  ) {
    throw new Error("The selected preview is not fully visible in the captured tab. Keep it visible and try again.");
  }

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = sourceWidth;
  cropCanvas.height = sourceHeight;
  const context = cropCanvas.getContext("2d");
  if (!context) {
    clearCanvas(cropCanvas);
    throw new Error("Canvas is unavailable in this browser.");
  }
  context.drawImage(frameCanvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

  const previewScaleX = sourceWidth / iframe.clientWidth;
  const previewScaleY = sourceHeight / iframe.clientHeight;
  return {
    cropCanvas,
    marker: normalizeMarker(
      {
        x: geometry.x * previewScaleX,
        y: geometry.y * previewScaleY,
        width: geometry.width * previewScaleX,
        height: geometry.height * previewScaleY
      },
      sourceWidth,
      sourceHeight
    )
  };
}

async function captureFrameCanvas(stream: MediaStream) {
  const video = document.createElement("video");
  let canvas: HTMLCanvasElement | null = null;
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("The browser did not provide a video frame.")), 8_000);
      video.onloadedmetadata = () => {
        void video
          .play()
          .then(() => window.setTimeout(resolve, 60))
          .catch(reject)
          .finally(() => window.clearTimeout(timeout));
      };
      video.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("The browser could not read the selected screen."));
      };
    });

    if (!video.videoWidth || !video.videoHeight) {
      throw new Error("The selected screen did not provide a usable image.");
    }
    canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      clearCanvas(canvas);
      canvas = null;
      throw new Error("Canvas is unavailable in this browser.");
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameCanvas = canvas;
    canvas = null;
    return frameCanvas;
  } finally {
    clearCanvas(canvas);
    video.pause();
    video.srcObject = null;
  }
}

export function useScreenshotAnnotation() {
  const objectUrlRef = useRef<string | null>(null);
  const [annotation, setAnnotation] = useState<ScreenshotAnnotation | null>(null);
  const [status, setStatus] = useState<"idle" | "capturing" | "ready" | "error">("idle");
  const [error, setError] = useState("");

  const releaseObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const clear = () => {
    releaseObjectUrl();
    setAnnotation(null);
    setStatus("idle");
    setError("");
  };

  useEffect(() => () => releaseObjectUrl(), []);

  const capture = async ({ iframe, geometry, expectedPreviewUrl }: CaptureScreenshotOptions) => {
    if (!iframe) {
      setStatus("error");
      setError("The selected preview is no longer available.");
      return;
    }
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setStatus("error");
      setError("This browser does not support tab screenshot capture.");
      return;
    }

    clear();
    setStatus("capturing");
    let stream: MediaStream | null = null;
    let frameCanvas: HTMLCanvasElement | null = null;
    let cropCanvas: HTMLCanvasElement | null = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" } as MediaTrackConstraints,
        audio: false
      });
      const track = stream.getVideoTracks()[0];
      if (!track || track.readyState !== "live" || track.muted) {
        throw new Error("The selected tab did not provide a live video stream.");
      }
      const displaySurface = (track.getSettings() as MediaTrackSettings & { displaySurface?: string }).displaySurface;
      if (displaySurface && displaySurface !== "browser") {
        throw new Error("Choose the current Studio browser tab in the sharing picker, then try again.");
      }

      assertCurrentPreview(iframe, expectedPreviewUrl);
      frameCanvas = await captureFrameCanvas(stream);
      if (track.readyState !== "live" || track.muted) {
        throw new Error("The selected tab stopped sharing before its screenshot could be captured.");
      }
      assertCurrentPreview(iframe, expectedPreviewUrl);
      const crop = cropPreviewFrame({ frameCanvas, iframe, geometry });
      cropCanvas = crop.cropCanvas;
      const blob = await canvasBlob(cropCanvas);
      const imageUrl = URL.createObjectURL(blob);
      objectUrlRef.current = imageUrl;
      setAnnotation({ imageUrl, width: cropCanvas.width, height: cropCanvas.height, marker: crop.marker });
      setStatus("ready");
    } catch (captureError) {
      releaseObjectUrl();
      setStatus("error");
      setError(captureError instanceof Error ? captureError.message : "Screen capture was canceled or unavailable.");
    } finally {
      clearCanvas(frameCanvas);
      clearCanvas(cropCanvas);
      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  const updateMarker = (marker: AnnotationRect) => {
    setAnnotation((current) =>
      current
        ? {
            ...current,
            marker: normalizeMarker(marker, current.width, current.height)
          }
        : current
    );
  };

  const download = async () => {
    if (!annotation) {
      return;
    }
    let canvas: HTMLCanvasElement | null = null;
    try {
      const image = new Image();
      image.src = annotation.imageUrl;
      await image.decode();
      canvas = document.createElement("canvas");
      canvas.width = annotation.width;
      canvas.height = annotation.height;
      const context = canvas.getContext("2d");
      if (!context) {
        clearCanvas(canvas);
        throw new Error("Canvas is unavailable in this browser.");
      }
      context.drawImage(image, 0, 0, annotation.width, annotation.height);
      context.strokeStyle = "#dc2626";
      context.lineWidth = Math.max(3, Math.round(Math.min(annotation.width, annotation.height) / 260));
      context.setLineDash([context.lineWidth * 2, context.lineWidth]);
      context.strokeRect(annotation.marker.x, annotation.marker.y, annotation.marker.width, annotation.marker.height);
      const blob = await canvasBlob(canvas);
      clearCanvas(canvas);
      canvas = null;
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "canvas-helper-inspection.png";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      clear();
    } catch (downloadError) {
      clearCanvas(canvas);
      setStatus("error");
      setError(downloadError instanceof Error ? downloadError.message : "The annotated screenshot could not be downloaded.");
    }
  };

  return {
    annotation,
    status,
    error,
    isSupported: typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getDisplayMedia),
    capture,
    updateMarker,
    download,
    clear
  };
}
