import type { PreviewRoot, ReferenceTarget } from "./types";

export type PreviewUrlOptions = {
  origin?: string;
  capabilityToken?: string;
};

const SAFE_PREVIEW_CAPABILITY = /^[A-Za-z0-9-]{16,80}$/;

export function uniqueStrings(values: Array<string | undefined>) {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const value of values) {
    if (!value || seen.has(value)) {
      continue;
    }

    seen.add(value);
    ordered.push(value);
  }

  return ordered;
}

export function normalizeSlashes(value: string) {
  return value.replace(/\\/g, "/");
}

export function toReferenceOptionPath(filePath: string | undefined, rootPrefix: string) {
  if (!filePath) {
    return "";
  }

  const normalizedFilePath = normalizeSlashes(filePath);
  const normalizedRoot = normalizeSlashes(rootPrefix).replace(/\/+$/, "");
  const normalizedFilePathLower = normalizedFilePath.toLowerCase();
  const normalizedRootLower = normalizedRoot.toLowerCase();

  if (normalizedFilePathLower === normalizedRootLower) {
    return "";
  }

  if (normalizedFilePathLower.startsWith(`${normalizedRootLower}/`)) {
    return normalizedFilePath.slice(normalizedRoot.length + 1);
  }

  return normalizedFilePath;
}

function withPreviewOrigin(pathname: string, options: PreviewUrlOptions) {
  const capabilityPath = options.capabilityToken && SAFE_PREVIEW_CAPABILITY.test(options.capabilityToken)
    ? `/_canvas-helper/p/${options.capabilityToken}${pathname}`
    : pathname;
  if (!options.origin) {
    return capabilityPath;
  }

  return new URL(capabilityPath, options.origin).toString();
}

function previewQuery(rev: number, options: PreviewUrlOptions) {
  const params = new URLSearchParams({ rev: String(rev) });
  return params.toString();
}

export function toPreviewUrl(
  root: PreviewRoot,
  slug: string,
  relativePath: string,
  rev: number,
  options: PreviewUrlOptions = {}
) {
  const encodedSlug = encodeURIComponent(slug);
  const encodedPath = relativePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return withPreviewOrigin(`/preview/${root}/${encodedSlug}/${encodedPath}?${previewQuery(rev, options)}`, options);
}

export function toReferenceResourcePreviewUrl(
  root: "raw" | "extracted",
  slug: string,
  relativePath: string,
  rev: number,
  options: PreviewUrlOptions = {}
) {
  const encodedSlug = encodeURIComponent(slug);
  const encodedPath = relativePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return withPreviewOrigin(`/preview/references/${root}/${encodedSlug}/${encodedPath}?${previewQuery(rev, options)}`, options);
}

export function getTargetKey(target: Pick<ReferenceTarget, "projectSlug" | "root" | "htmlPath"> & Partial<ReferenceTarget>) {
  const source = target.source ?? "html";
  const resourceRoot = target.resourceRoot ?? "raw";
  const resourcePath = target.resourcePath ?? "";
  return `${target.projectSlug}:${source}:${target.root}:${target.htmlPath}:${resourceRoot}:${resourcePath}`;
}

export function equalReferenceTargets(left: ReferenceTarget, right: ReferenceTarget) {
  return (
    left.projectSlug === right.projectSlug &&
    left.source === right.source &&
    left.root === right.root &&
    left.htmlPath === right.htmlPath &&
    left.resourceRoot === right.resourceRoot &&
    left.resourcePath === right.resourcePath
  );
}
