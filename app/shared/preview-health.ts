export const PREVIEW_PREFLIGHT_MAX_DETAILS = 8;
export const PREVIEW_PREFLIGHT_DETAIL_MAX_LENGTH = 240;
export const PREVIEW_ISSUE_MAX_DIAGNOSTICS = 5;

export type PreviewPreflightStatus = "ready" | "warning" | "error";

export type PreviewPreflightCode =
  | "ready"
  | "missing-page"
  | "empty-page"
  | "missing-local-runtime"
  | "missing-local-style"
  | "unsupported-runtime"
  | "unsupported-page"
  | "unreadable-page";

export type PreviewRuntimeFamily =
  | "static-html"
  | "local-runtime"
  | "approved-runtime"
  | "mixed-runtime"
  | "unknown";

export type PreviewPreflightResponse = {
  status: PreviewPreflightStatus;
  code: PreviewPreflightCode;
  message: string;
  details: string[];
  runtimeFamily: PreviewRuntimeFamily;
};

export type PreviewContentHealth = {
  status: "ready" | "empty";
  href: string;
  textLength: number;
  visualCount: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isBoundedInteger(value: unknown, maximum: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= maximum;
}

export function isPreviewContentHealth(value: unknown): value is PreviewContentHealth {
  return (
    isRecord(value) &&
    (value.status === "ready" || value.status === "empty") &&
    typeof value.href === "string" &&
    value.href.length <= 2_048 &&
    isBoundedInteger(value.textLength, 100_000) &&
    isBoundedInteger(value.visualCount, 10_000)
  );
}

export function isPreviewPreflightResponse(value: unknown): value is PreviewPreflightResponse {
  if (!isRecord(value)) return false;
  if (value.status !== "ready" && value.status !== "warning" && value.status !== "error") return false;
  if (
    value.code !== "ready" &&
    value.code !== "missing-page" &&
    value.code !== "empty-page" &&
    value.code !== "missing-local-runtime" &&
    value.code !== "missing-local-style" &&
    value.code !== "unsupported-runtime" &&
    value.code !== "unsupported-page" &&
    value.code !== "unreadable-page"
  ) return false;
  if (typeof value.message !== "string" || value.message.length > 360) return false;
  if (
    value.runtimeFamily !== "static-html" &&
    value.runtimeFamily !== "local-runtime" &&
    value.runtimeFamily !== "approved-runtime" &&
    value.runtimeFamily !== "mixed-runtime" &&
    value.runtimeFamily !== "unknown"
  ) return false;
  return (
    Array.isArray(value.details) &&
    value.details.length <= PREVIEW_PREFLIGHT_MAX_DETAILS &&
    value.details.every((detail) => typeof detail === "string" && detail.length <= PREVIEW_PREFLIGHT_DETAIL_MAX_LENGTH)
  );
}
