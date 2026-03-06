import type { PreviewRoot, ReferenceTarget } from "./types";

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

export function toPreviewUrl(root: PreviewRoot, slug: string, relativePath: string, rev: number) {
  const encodedSlug = encodeURIComponent(slug);
  const encodedPath = relativePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `/preview/${root}/${encodedSlug}/${encodedPath}?rev=${rev}`;
}

export function toReferenceResourcePreviewUrl(
  root: "raw" | "extracted",
  slug: string,
  relativePath: string,
  rev: number
) {
  const encodedSlug = encodeURIComponent(slug);
  const encodedPath = relativePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `/preview/references/${root}/${encodedSlug}/${encodedPath}?rev=${rev}`;
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
