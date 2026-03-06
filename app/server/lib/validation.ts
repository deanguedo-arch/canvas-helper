import path from "node:path";

export function isPathInside(baseDir: string, targetPath: string) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);

  const normalizedBase = process.platform === "win32" ? resolvedBase.toLowerCase() : resolvedBase;
  const normalizedTarget = process.platform === "win32" ? resolvedTarget.toLowerCase() : resolvedTarget;
  const baseWithSeparator = normalizedBase.endsWith(path.sep) ? normalizedBase : `${normalizedBase}${path.sep}`;

  return normalizedTarget === normalizedBase || normalizedTarget.startsWith(baseWithSeparator);
}

export function isSafeProjectSlug(slug: string) {
  return /^[a-z0-9][a-z0-9._-]*$/i.test(slug);
}
