export type ReferenceResourceRoot = "raw" | "extracted";
export type ReferenceResourceRenderMode = "inline-frame" | "inline-pdf" | "fallback";

const INLINE_REFERENCE_RESOURCE_EXTENSIONS = new Set([
  "htm",
  "html",
  "txt",
  "md",
  "json",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "mp3",
  "wav",
  "ogg",
  "mp4",
  "webm"
]);

function getFileExtension(filePath: string) {
  const normalized = filePath.replace(/\\/g, "/");
  const filename = normalized.split("/").pop() ?? normalized;
  const extension = filename.includes(".") ? filename.slice(filename.lastIndexOf(".") + 1) : "";
  return extension.toLowerCase();
}

export function getReferenceResourceRenderMode(
  resourcePath: string,
  resourceRoot: ReferenceResourceRoot
): ReferenceResourceRenderMode {
  if (!resourcePath) {
    return "fallback";
  }

  if (resourceRoot === "extracted") {
    return "inline-frame";
  }

  const extension = getFileExtension(resourcePath);
  if (!extension) {
    return "fallback";
  }

  if (extension === "pdf") {
    return "inline-pdf";
  }

  return INLINE_REFERENCE_RESOURCE_EXTENSIONS.has(extension) ? "inline-frame" : "fallback";
}
