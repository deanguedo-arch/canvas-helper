import path from "node:path";
import { readFile } from "node:fs/promises";

import { load } from "cheerio";

import { fileExists } from "./fs.js";
import { getProjectPaths } from "./paths.js";

export type VerifyMode = "workspace" | "raw" | "brightspace";

type AssetReference = {
  selector: string;
  attr: "src" | "href";
  value: string;
};

type VerifyResult = {
  mode: VerifyMode;
  entryPath: string;
  baseDir: string;
  missingAssets: string[];
  externalDependencies: string[];
  traversalWarnings: string[];
};

const SELECTOR_ATTRS: Array<{ selector: string; attr: "src" | "href" }> = [
  { selector: "img[src]", attr: "src" },
  { selector: "script[src]", attr: "src" },
  { selector: "link[href]", attr: "href" },
  { selector: "source[src]", attr: "src" },
  { selector: "video[src]", attr: "src" },
  { selector: "audio[src]", attr: "src" }
];

export function normalizeVerifyMode(value: string | undefined): VerifyMode {
  if (value === "raw" || value === "brightspace") {
    return value;
  }

  return "workspace";
}

function entryPathForMode(projectSlug: string, mode: VerifyMode) {
  const paths = getProjectPaths(projectSlug);

  if (mode === "raw") {
    return {
      entryPath: paths.rawEntrypoint,
      baseDir: paths.rawDir
    };
  }

  if (mode === "brightspace") {
    return {
      entryPath: path.join(paths.brightspaceExportDir, "index.html"),
      baseDir: paths.brightspaceExportDir
    };
  }

  return {
    entryPath: paths.workspaceEntrypoint,
    baseDir: paths.workspaceDir
  };
}

function stripQueryAndHash(value: string) {
  return value.split("#")[0].split("?")[0];
}

function isIgnoredLocalCheck(value: string) {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//") ||
    value.startsWith("data:") ||
    value.startsWith("#")
  );
}

function hasExternalDependency(value: string) {
  return /https?:\/\//i.test(value);
}

function normalizeLocalRef(value: string) {
  const stripped = stripQueryAndHash(value).replace(/\\/g, "/").trim();
  if (!stripped) {
    return "";
  }

  return stripped.startsWith("/") ? stripped.slice(1) : stripped;
}

function hasTraversal(normalizedRef: string) {
  return normalizedRef === ".." || normalizedRef.startsWith("../") || normalizedRef.includes("/../");
}

export async function verifyProjectBundle(projectSlug: string, mode: VerifyMode = "workspace"): Promise<VerifyResult> {
  const { entryPath, baseDir } = entryPathForMode(projectSlug, mode);

  if (!(await fileExists(entryPath))) {
    throw new Error(`Entry file not found: ${entryPath}`);
  }

  const html = await readFile(entryPath, "utf8");
  const $ = load(html);

  const references: AssetReference[] = [];
  for (const { selector, attr } of SELECTOR_ATTRS) {
    $(selector).each((_index, element) => {
      const value = $(element).attr(attr);
      if (!value) {
        return;
      }

      references.push({ selector, attr, value: value.trim() });
    });
  }

  const missingAssets = new Set<string>();
  const externalDependencies = new Set<string>();
  const traversalWarnings = new Set<string>();

  for (const reference of references) {
    const rawValue = reference.value;

    if (hasExternalDependency(rawValue)) {
      externalDependencies.add(`${reference.selector} -> ${rawValue}`);
    }

    if (isIgnoredLocalCheck(rawValue)) {
      continue;
    }

    const normalizedRef = normalizeLocalRef(rawValue);
    if (!normalizedRef) {
      continue;
    }

    if (hasTraversal(normalizedRef)) {
      traversalWarnings.add(`${reference.selector} -> ${rawValue}`);
      continue;
    }

    const resolvedPath = path.resolve(baseDir, normalizedRef);
    if (!resolvedPath.startsWith(baseDir)) {
      traversalWarnings.add(`${reference.selector} -> ${rawValue}`);
      continue;
    }

    if (!(await fileExists(resolvedPath))) {
      missingAssets.add(`${reference.selector} -> ${normalizedRef}`);
    }
  }

  return {
    mode,
    entryPath,
    baseDir,
    missingAssets: [...missingAssets].sort((left, right) => left.localeCompare(right)),
    externalDependencies: [...externalDependencies].sort((left, right) => left.localeCompare(right)),
    traversalWarnings: [...traversalWarnings].sort((left, right) => left.localeCompare(right))
  };
}
