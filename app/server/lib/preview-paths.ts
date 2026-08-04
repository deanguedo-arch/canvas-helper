import path from "node:path";
import { realpath } from "node:fs/promises";

import { getProjectPaths, resourcesRoot } from "../../../scripts/lib/paths.ts";

import { isPathInside, isSafeProjectSlug } from "./validation";

function isMissingPathError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && ((error as { code?: string }).code === "ENOENT" || (error as { code?: string }).code === "ENOTDIR"));
}

async function realPathIfPresent(filePath: string) {
  try {
    return await realpath(filePath);
  } catch (error) {
    if (isMissingPathError(error)) {
      return null;
    }
    throw error;
  }
}

function decodePreviewRelativePath(value: string | undefined, fallback: string) {
  const encoded = value ?? fallback;
  if (!encoded || encoded.length > 2_048) {
    throw new Error("Preview path is empty or exceeds the supported length.");
  }
  if (/%2f|%5c/i.test(encoded)) {
    throw new Error("Preview paths may not contain encoded separators.");
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(encoded);
  } catch {
    throw new Error("Preview path is not valid URL encoding.");
  }

  if (
    decoded.includes("\0") ||
    decoded.includes("\\") ||
    path.isAbsolute(decoded) ||
    /^[A-Za-z]:/.test(decoded) ||
    decoded.split("/").some((part) => !part || part === "." || part === "..")
  ) {
    throw new Error("Preview path is not a safe relative project path.");
  }

  return decoded;
}

async function resolveContainedPreviewPath(options: {
  baseDir: string;
  trustedRoot: string;
  relativePath: string;
}) {
  const baseDir = path.resolve(options.baseDir);
  const trustedRoot = path.resolve(options.trustedRoot);
  const targetPath = path.resolve(baseDir, options.relativePath);
  if (!isPathInside(trustedRoot, baseDir) || !isPathInside(baseDir, targetPath)) {
    throw new Error("Preview request escaped the declared project root.");
  }

  const [realTrustedRoot, realBaseDir] = await Promise.all([
    realPathIfPresent(trustedRoot),
    realPathIfPresent(baseDir)
  ]);
  if (!realTrustedRoot || !realBaseDir) {
    // A missing root cannot be read. Retain the lexical path so callers can
    // render their existing missing-file diagnostic without following links.
    return targetPath;
  }
  if (!isPathInside(realTrustedRoot, realBaseDir)) {
    throw new Error("Preview root resolved outside its declared project root.");
  }

  const realTarget = await realPathIfPresent(targetPath);
  if (realTarget) {
    if (!isPathInside(realBaseDir, realTarget)) {
      throw new Error("Preview request followed a symlink outside the declared root.");
    }
    return realTarget;
  }

  let ancestor = path.dirname(targetPath);
  while (isPathInside(baseDir, ancestor)) {
    const realAncestor = await realPathIfPresent(ancestor);
    if (realAncestor) {
      if (!isPathInside(realBaseDir, realAncestor)) {
        throw new Error("Preview request followed a symlink outside the declared root.");
      }
      break;
    }
    if (ancestor === baseDir) {
      break;
    }
    ancestor = path.dirname(ancestor);
  }

  return targetPath;
}

function assertSafeSlug(slug: string) {
  if (!isSafeProjectSlug(slug)) {
    throw new Error("Preview project slug is invalid.");
  }
}

export async function getPreviewPath(mode: "raw" | "workspace", slug: string, relativePath?: string) {
  assertSafeSlug(slug);
  const paths = getProjectPaths(slug);
  const baseDir = mode === "raw" ? paths.rawDir : paths.workspaceDir;
  const defaultFile = mode === "raw" ? "original.html" : "index.html";
  return resolveContainedPreviewPath({
    baseDir,
    trustedRoot: paths.root,
    relativePath: decodePreviewRelativePath(relativePath, defaultFile)
  });
}

export async function getReferencePreviewPath(mode: "raw" | "extracted", slug: string, relativePath?: string) {
  assertSafeSlug(slug);
  const paths = getProjectPaths(slug);
  const baseDir = mode === "raw" ? paths.resourceDir : paths.resourceExtractedDir;
  return resolveContainedPreviewPath({
    baseDir,
    trustedRoot: resourcesRoot,
    relativePath: decodePreviewRelativePath(relativePath, "")
  });
}
