import { createHash } from "node:crypto";

import { load } from "cheerio";

import {
  COURSE_EDITABILITY_INVENTORY_SCHEMA_VERSION,
  COURSE_EDITABILITY_MAX_SURFACES_PER_PROJECT,
  COURSE_EDITABILITY_NATIVE_DETAILS_STATE,
  isProjectLearnerSurfacesV1,
  type LearnerSurface,
  type LearnerSurfaceInventory,
  type LearnerSurfaceInventoryErrorCode,
  type LearnerSurfaceInventorySource,
  type ProjectLearnerSurfaceDeclaration
} from "../../../app/shared/course-editability.js";
import type { CourseEditAdapter } from "../../../app/shared/course-editing.js";
import { parseEnglishUnitRecipe } from "../english-unit/schema.js";
import {
  CourseEditabilityReadError,
  openCourseEditabilityReadOnlyProject,
  type CourseEditabilityReadOnlyProject
} from "./read-only-project.js";

type InventoryResult = LearnerSurfaceInventory & { adapter: CourseEditAdapter | null };

function codePointCompare(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function surfaceId(projectSlug: string, htmlPath: string, route: string, stateKey: string | null) {
  return `ls1:${createHash("sha256")
    .update(`${projectSlug}\0${htmlPath}\0${route}\0${stateKey ?? ""}`, "utf8")
    .digest("hex")
    .slice(0, 24)}`;
}

function incomplete(errorCode: LearnerSurfaceInventoryErrorCode, adapter: CourseEditAdapter | null): InventoryResult {
  return {
    schemaVersion: COURSE_EDITABILITY_INVENTORY_SCHEMA_VERSION,
    complete: false,
    surfaces: [],
    errorCode,
    adapter
  };
}

function completed(
  projectSlug: string,
  declarations: ProjectLearnerSurfaceDeclaration[],
  inventorySource: LearnerSurfaceInventorySource,
  adapter: CourseEditAdapter
): InventoryResult {
  const tuples = new Set<string>();
  const surfaces: LearnerSurface[] = [];
  for (const declaration of declarations) {
    const tuple = `${declaration.htmlPath}\0${declaration.route}\0${declaration.stateKey ?? ""}`;
    if (tuples.has(tuple)) return incomplete("manifest-invalid", adapter);
    tuples.add(tuple);
    surfaces.push({
      surfaceId: surfaceId(projectSlug, declaration.htmlPath, declaration.route, declaration.stateKey),
      projectSlug,
      htmlPath: declaration.htmlPath,
      route: declaration.route,
      stateKey: declaration.stateKey,
      inventorySource
    });
  }
  surfaces.sort((left, right) => (
    codePointCompare(left.htmlPath, right.htmlPath) ||
    codePointCompare(left.route, right.route) ||
    codePointCompare(left.stateKey ?? "", right.stateKey ?? "")
  ));
  if (!surfaces.length) return incomplete("manifest-invalid", adapter);
  if (surfaces.length > COURSE_EDITABILITY_MAX_SURFACES_PER_PROJECT) {
    return incomplete("inventory-truncated", adapter);
  }
  return {
    schemaVersion: COURSE_EDITABILITY_INVENTORY_SCHEMA_VERSION,
    complete: true,
    surfaces,
    errorCode: null,
    adapter
  };
}

function adapterForManifest(project: CourseEditabilityReadOnlyProject): CourseEditAdapter | null {
  if (project.manifest.authoringStatus !== "active" && project.manifest.authoringStatus !== "ready-for-export") return null;
  if (project.manifest.authoring?.studioEditing?.enabled !== true) return null;
  if (project.manifest.authoring.driverId === "direct-workspace-v1") return "direct";
  if (project.manifest.authoring.driverId === "english-factory-v1") return "english-factory";
  if (project.manifest.authoring.driverId === "social-related-issues-v1") return "social-related-issues";
  if (project.manifest.authoring.driverId === "legacy-snapshot-v1") return "legacy-snapshot";
  return null;
}

function canonicalWorkspaceHtmlPaths(project: CourseEditabilityReadOnlyProject) {
  const prefix = `projects/${project.projectSlug}/workspace/`;
  return new Set(
    (project.manifest.canonicalSources ?? [])
      .filter((entry) => entry.startsWith(prefix) && /\.html?$/i.test(entry))
      .map((entry) => entry.slice(prefix.length))
  );
}

async function declaredInventory(
  project: CourseEditabilityReadOnlyProject,
  adapter: "direct" | "legacy-snapshot"
) {
  const declaration = project.rawManifest.authoring?.learnerSurfaces;
  if (!declaration) {
    return incomplete(adapter === "legacy-snapshot" ? "snapshot-boundary-invalid" : "route-declaration-missing", adapter);
  }
  if (!isProjectLearnerSurfacesV1(declaration)) return incomplete("manifest-invalid", adapter);
  const declarations: ProjectLearnerSurfaceDeclaration[] = declaration.mode === "static-pages-complete"
    ? declaration.pages.map((page) => ({ ...page, stateKey: null }))
    : declaration.surfaces;
  const canonicalPages = canonicalWorkspaceHtmlPaths(project);
  for (const entry of declarations) {
    if (!canonicalPages.has(entry.htmlPath)) {
      return incomplete(adapter === "legacy-snapshot" ? "snapshot-boundary-invalid" : "declared-page-missing", adapter);
    }
    try {
      await project.readWorkspaceText(entry.htmlPath);
    } catch (error) {
      if (error instanceof CourseEditabilityReadError && error.code === "declared-page-missing") {
        return incomplete("declared-page-missing", adapter);
      }
      throw error;
    }
  }
  return completed(project.projectSlug, declarations, "manifest", adapter);
}

function parseFactoryRouteArray(html: string) {
  const declarations = [...html.matchAll(/\bconst\s+(?:pageIds|staticPages)\s*=\s*\[([^\]]*)\]\s*;/g)];
  if (declarations.length !== 1) return null;
  const entries: string[] = [];
  const source = declarations[0]?.[1] ?? "";
  const stripped = source.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g, (match) => {
    try {
      entries.push(JSON.parse(match.startsWith("'")
        ? `"${match.slice(1, -1).replaceAll('"', '\\"')}"`
        : match));
    } catch {
      entries.length = 0;
    }
    return "";
  });
  if (stripped.replace(/[\s,]/g, "") || !entries.length) return null;
  if (entries.some((entry) => !/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(entry))) return null;
  return entries;
}

export function extractAdapterLearnerRouteIds(html: string) {
  const routeIds = parseFactoryRouteArray(html);
  if (!routeIds || new Set(routeIds).size !== routeIds.length) return null;
  const $ = load(html);
  const sectionIds = new Set<string>();
  $(".course-page[id]").each((_, element) => {
    const id = $(element).attr("id");
    if (id) sectionIds.add(id);
  });
  const navigationIds = new Set<string>();
  $("[data-page-target]").each((_, element) => {
    const id = $(element).attr("data-page-target");
    if (id) navigationIds.add(id);
  });
  if (
    routeIds.some((id) => !sectionIds.has(id)) ||
    [...sectionIds].some((id) => !routeIds.includes(id)) ||
    [...navigationIds].some((id) => !routeIds.includes(id))
  ) return null;
  return routeIds;
}

export function extractStructurallyDeclaredLearnerRouteIds(html: string) {
  const $ = load(html);
  const sectionIds: string[] = [];
  $(".course-page[id]").each((_, element) => {
    const id = ($(element).attr("id") ?? "").trim();
    if (id) sectionIds.push(id);
  });
  if (
    !sectionIds.length ||
    new Set(sectionIds).size !== sectionIds.length ||
    sectionIds.some((id) => !/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(id))
  ) return null;
  const sectionSet = new Set(sectionIds);
  const navigationIds = new Set<string>();
  $("[data-page-target]").each((_, element) => {
    const id = ($(element).attr("data-page-target") ?? "").trim();
    if (id) navigationIds.add(id);
  });
  if (
    !navigationIds.size ||
    sectionIds.some((id) => !navigationIds.has(id)) ||
    [...navigationIds].some((id) => !sectionSet.has(id))
  ) return null;
  return sectionIds;
}

function factoryRouteDeclarations(html: string) {
  const routeIds = extractAdapterLearnerRouteIds(html);
  if (!routeIds) return null;
  return routeIds.map((route): ProjectLearnerSurfaceDeclaration => ({
    htmlPath: "index.html",
    route: `#${route}`,
    stateKey: learnerRouteNeedsNativeDetailsState(html, `#${route}`)
  }));
}

export function learnerRouteNeedsNativeDetailsState(html: string, route: string) {
  const $ = load(html);
  if (!route) return $("details").length ? COURSE_EDITABILITY_NATIVE_DETAILS_STATE : null;
  const routeId = route.startsWith("#") ? route.slice(1) : "";
  if (!routeId) return $("details").length ? COURSE_EDITABILITY_NATIVE_DETAILS_STATE : null;
  let hasDetails = false;
  $(".course-page[id]").each((_, element) => {
    if ($(element).attr("id") === routeId && $(element).find("details").length) hasDetails = true;
  });
  return hasDetails ? COURSE_EDITABILITY_NATIVE_DETAILS_STATE : null;
}

export function hasUnsupportedLearnerStateMechanisms(html: string) {
  const $ = load(html);
  if ($('[role="tab"],[data-state-target],[data-tab-target]').length) return true;
  let unsupported = false;
  $("[aria-controls]").each((_, element) => {
    const control = $(element);
    const targetId = (control.attr("aria-controls") ?? "").trim();
    const controlInNavigation = control.closest("nav,aside,[role='navigation'],[role='menu']").length > 0;
    let targetInNavigation = false;
    if (targetId) {
      $("[id]").each((__, target) => {
        if ($(target).attr("id") === targetId && $(target).closest("nav,aside,[role='navigation'],[role='menu']").length) {
          targetInNavigation = true;
        }
      });
    }
    if (!controlInNavigation && !targetInNavigation) unsupported = true;
  });
  return unsupported;
}

export function isDeclaredFactoryActivityRoute(requiredRoute: string, declaredRouteIds: readonly string[]) {
  return declaredRouteIds.some((declared) => declared === requiredRoute || declared.startsWith(`${requiredRoute}-`));
}

async function englishInventory(project: CourseEditabilityReadOnlyProject) {
  let recipe: ReturnType<typeof parseEnglishUnitRecipe>;
  try {
    recipe = parseEnglishUnitRecipe(await project.readMetaJson("english-unit.json"));
  } catch {
    return incomplete("factory-outline-invalid", "english-factory");
  }
  if (recipe.projectSlug !== project.projectSlug || !recipe.lessonOrder.length) {
    return incomplete("factory-outline-invalid", "english-factory");
  }
  const html = await project.readWorkspaceText("index.html");
  const declarations = factoryRouteDeclarations(html);
  if (!declarations) return incomplete("route-declaration-missing", "english-factory");
  const requiredActivityRoutes = recipe.activityProfile.activities
    .filter((activity) => activity.enabled)
    .map((activity) => activity.route);
  const declaredRouteIds = declarations.map((entry) => entry.route.replace(/^#/, ""));
  if (requiredActivityRoutes.some((route) => !isDeclaredFactoryActivityRoute(route, declaredRouteIds))) {
    return incomplete("factory-outline-invalid", "english-factory");
  }
  return completed(project.projectSlug, declarations, "course-outline", "english-factory");
}

async function socialInventory(project: CourseEditabilityReadOnlyProject) {
  let build: { schemaVersion?: unknown; projectSlug?: unknown; builder?: unknown };
  try {
    build = await project.readMetaJson("social-build.json");
  } catch {
    return incomplete("factory-outline-invalid", "social-related-issues");
  }
  if (
    build.schemaVersion !== 1 ||
    build.projectSlug !== project.projectSlug ||
    typeof build.builder !== "string" ||
    !/^scripts\/build-social(?:10|20|30)-related-issues\.ts$/.test(build.builder)
  ) return incomplete("factory-outline-invalid", "social-related-issues");
  const html = await project.readWorkspaceText("index.html");
  const declarations = factoryRouteDeclarations(html);
  if (!declarations) return incomplete("route-declaration-missing", "social-related-issues");
  return completed(project.projectSlug, declarations, "adapter", "social-related-issues");
}

function readErrorCode(error: CourseEditabilityReadError): LearnerSurfaceInventoryErrorCode {
  if (error.code === "manifest-missing") return "manifest-missing";
  if (error.code === "declared-page-missing") return "declared-page-missing";
  if (error.code === "project-repair-attempt") return "inventory-internal-error";
  return "manifest-invalid";
}

export async function resolveLearnerSurfaceInventory(
  projectSlug: string,
  repoRoot: string
): Promise<InventoryResult> {
  let project: CourseEditabilityReadOnlyProject;
  try {
    project = await openCourseEditabilityReadOnlyProject(projectSlug, repoRoot);
  } catch (error) {
    if (error instanceof CourseEditabilityReadError) return incomplete(readErrorCode(error), null);
    return incomplete("inventory-internal-error", null);
  }
  const adapter = adapterForManifest(project);
  if (!adapter) return incomplete("driver-unsupported", null);
  try {
    if (adapter === "direct" || adapter === "legacy-snapshot") {
      return await declaredInventory(project, adapter);
    }
    if (adapter === "english-factory") return await englishInventory(project);
    return await socialInventory(project);
  } catch (error) {
    if (error instanceof CourseEditabilityReadError) return incomplete(readErrorCode(error), adapter);
    return incomplete("inventory-internal-error", adapter);
  }
}
