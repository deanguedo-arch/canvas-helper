import path from "node:path";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

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
  missingWorkspaceEmbeds: AssessmentDeliveryEmbedIssue[];
  missingCourseShellResources: CourseShellResourceIssue[];
  declaredMissingCourseShellResources: CourseShellResourceIssue[];
};

type AssessmentDeliveryEmbedIssue = {
  activityId: string;
  activityTitle: string;
  moduleTitle: string;
  deliveryMode: string;
  embedPath: string;
  resolvedPath: string;
};

type CourseShellResourceIssue = {
  activityId: string;
  activityTitle: string;
  moduleTitle: string;
  resourceKind: string;
  sourceHref: string;
  resolvedPath: string;
};

type CourseShellActivityLike = {
  id?: string;
  title?: string;
  moduleTitle?: string;
  resourceKind?: string;
  sourceHref?: string;
  contentBody?: string;
  contentPreview?: string;
};

type CourseShellModuleLike = {
  title?: string;
  activities?: CourseShellActivityLike[];
};

type CourseShellDataLike = {
  modules?: CourseShellModuleLike[];
};

type AssessmentDeliveryLike = {
  activityId?: string;
  deliveryMode?: string;
  embedPath?: string;
  ctaUrl?: string;
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

function isInsideBaseDir(baseDir: string, resolvedPath: string) {
  const relativePath = path.relative(baseDir, resolvedPath);
  return relativePath !== ".." && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath);
}

function looksLikeDeclaredMissingSourceFallback(activity: CourseShellActivityLike) {
  const fallbackText = `${activity.contentBody || ""}\n${activity.contentPreview || ""}`;
  return /did not include the source file|missing source file|source file is unavailable/i.test(fallbackText);
}

async function loadCourseShellData(courseShellDataPath: string) {
  return loadModuleDefault<CourseShellDataLike>(courseShellDataPath, "workspace/course-shell-data.js");
}

async function loadAssessmentDeliveryData(assessmentDeliveryPath: string) {
  const imported = await loadModuleDefault<AssessmentDeliveryLike[]>(assessmentDeliveryPath, "workspace/assessment-delivery.js");
  return Array.isArray(imported) ? imported : [];
}

async function loadModuleDefault<T>(filePath: string, label: string) {
  const moduleUrl = pathToFileURL(filePath);
  moduleUrl.searchParams.set("t", `${Date.now()}`);

  try {
    const imported = (await import(moduleUrl.href)) as { default?: T };
    return imported.default ?? null;
  } catch (error) {
    throw new Error(
      `Failed to load ${label} for verification: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function buildCourseShellActivityLookup(courseShellData: CourseShellDataLike | null) {
  const lookup = new Map<string, { activityTitle: string; moduleTitle: string }>();
  const modules = Array.isArray(courseShellData?.modules) ? courseShellData.modules : [];

  for (const module of modules) {
    const moduleTitle = String(module?.title || "");
    const activities = Array.isArray(module?.activities) ? module.activities : [];
    for (const activity of activities) {
      const activityId = String(activity?.id || "");
      if (!activityId) {
        continue;
      }

      lookup.set(activityId, {
        activityTitle: String(activity?.title || activityId),
        moduleTitle: String(activity?.moduleTitle || moduleTitle)
      });
    }
  }

  return lookup;
}

async function maybeLoadWorkspaceCourseShellData(projectSlug: string) {
  const paths = getProjectPaths(projectSlug);
  const courseShellDataPath = path.join(paths.workspaceDir, "course-shell-data.js");

  if (!(await fileExists(courseShellDataPath))) {
    return null;
  }

  return loadCourseShellData(courseShellDataPath);
}

function looksLikeWorkspaceAssetPath(value: string) {
  const normalized = String(value || "").trim().replace(/\\/g, "/");
  return normalized.startsWith("./assets/") || normalized.startsWith("assets/");
}

async function verifyAssessmentDeliveryEmbeds(projectSlug: string, courseShellData: CourseShellDataLike | null) {
  const paths = getProjectPaths(projectSlug);
  const assessmentDeliveryPath = path.join(paths.workspaceDir, "assessment-delivery.js");

  if (!(await fileExists(assessmentDeliveryPath))) {
    return [] as AssessmentDeliveryEmbedIssue[];
  }

  const assessmentDelivery = await loadAssessmentDeliveryData(assessmentDeliveryPath);
  const activityLookup = buildCourseShellActivityLookup(courseShellData);
  const missingWorkspaceEmbeds: AssessmentDeliveryEmbedIssue[] = [];

  for (const delivery of assessmentDelivery) {
    if (String(delivery?.deliveryMode || "") !== "workspace-embed") {
      continue;
    }

    const rawEmbedPath = String(delivery?.embedPath || delivery?.ctaUrl || "").trim();
    if (!rawEmbedPath || !looksLikeWorkspaceAssetPath(rawEmbedPath)) {
      continue;
    }

    const embedPath = normalizeLocalRef(rawEmbedPath);
    const resolvedPath = path.resolve(paths.workspaceDir, embedPath);
    const activityId = String(delivery?.activityId || "");
    const activityMeta = activityLookup.get(activityId);
    const issue: AssessmentDeliveryEmbedIssue = {
      activityId,
      activityTitle: activityMeta?.activityTitle || activityId || embedPath,
      moduleTitle: activityMeta?.moduleTitle || "",
      deliveryMode: "workspace-embed",
      embedPath,
      resolvedPath
    };

    if (hasTraversal(embedPath) || !isInsideBaseDir(paths.workspaceDir, resolvedPath)) {
      missingWorkspaceEmbeds.push(issue);
      continue;
    }

    if (!(await fileExists(resolvedPath))) {
      missingWorkspaceEmbeds.push(issue);
    }
  }

  return missingWorkspaceEmbeds;
}

async function verifyCourseShellResources(projectSlug: string, courseShellData: CourseShellDataLike | null) {
  if (!courseShellData) {
    return {
      missingCourseShellResources: [] as CourseShellResourceIssue[],
      declaredMissingCourseShellResources: [] as CourseShellResourceIssue[]
    };
  }

  const paths = getProjectPaths(projectSlug);
  const modules = Array.isArray(courseShellData?.modules) ? courseShellData.modules : [];
  const missingCourseShellResources: CourseShellResourceIssue[] = [];
  const declaredMissingCourseShellResources: CourseShellResourceIssue[] = [];

  for (const module of modules) {
    const activities = Array.isArray(module?.activities) ? module.activities : [];

    for (const activity of activities) {
      const sourceHref = normalizeLocalRef(String(activity?.sourceHref || ""));
      if (!sourceHref) {
        continue;
      }

      const resolvedPath = path.resolve(paths.resourceDir, sourceHref);
      const issue: CourseShellResourceIssue = {
        activityId: String(activity?.id || ""),
        activityTitle: String(activity?.title || sourceHref),
        moduleTitle: String(activity?.moduleTitle || module?.title || ""),
        resourceKind: String(activity?.resourceKind || "other"),
        sourceHref,
        resolvedPath
      };

      if (hasTraversal(sourceHref) || !isInsideBaseDir(paths.resourceDir, resolvedPath)) {
        missingCourseShellResources.push(issue);
        continue;
      }

      if (await fileExists(resolvedPath)) {
        continue;
      }

      if (looksLikeDeclaredMissingSourceFallback(activity)) {
        declaredMissingCourseShellResources.push(issue);
        continue;
      }

      missingCourseShellResources.push(issue);
    }
  }

  return {
    missingCourseShellResources,
    declaredMissingCourseShellResources
  };
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

  const workspaceCourseShellData = mode === "workspace" ? await maybeLoadWorkspaceCourseShellData(projectSlug) : null;
  const courseShellResourceCheck =
    mode === "workspace"
      ? await verifyCourseShellResources(projectSlug, workspaceCourseShellData)
      : {
          missingCourseShellResources: [] as CourseShellResourceIssue[],
          declaredMissingCourseShellResources: [] as CourseShellResourceIssue[]
        };
  const missingWorkspaceEmbeds =
    mode === "workspace" ? await verifyAssessmentDeliveryEmbeds(projectSlug, workspaceCourseShellData) : [];

  return {
    mode,
    entryPath,
    baseDir,
    missingAssets: [...missingAssets].sort((left, right) => left.localeCompare(right)),
    externalDependencies: [...externalDependencies].sort((left, right) => left.localeCompare(right)),
    traversalWarnings: [...traversalWarnings].sort((left, right) => left.localeCompare(right)),
    missingWorkspaceEmbeds,
    missingCourseShellResources: courseShellResourceCheck.missingCourseShellResources,
    declaredMissingCourseShellResources: courseShellResourceCheck.declaredMissingCourseShellResources
  };
}
