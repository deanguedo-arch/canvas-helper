import type { ProjectBundle } from "./types";

const HIDDEN_STUDIO_PROJECT_SLUGS = new Set([
  "social30-1-related-issue-1",
  "social30-1-related-issue-2",
  "social30-1-related-issue-3",
  "social30-1-related-issue-4"
]);

const PROJECT_GROUP_ORDER = ["Conversion projects", "Generated courses", "Hybrid courses", "Legacy projects"];

function formatProjectSlugLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (/^(ela|cte)$/i.test(part)) return part.toUpperCase();
      if (/^\d/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

export function getProjectLabel(project: ProjectBundle | string) {
  if (typeof project === "string") return formatProjectSlugLabel(project);
  return project.manifest.title?.trim() || formatProjectSlugLabel(project.manifest.slug);
}

export function getProjectGroupLabel(project: ProjectBundle) {
  if (project.manifest.projectType === "conversion") return "Conversion projects";
  if (project.manifest.projectType === "generated-course") return "Generated courses";
  if (project.manifest.projectType === "hybrid") return "Hybrid courses";
  return "Legacy projects";
}

export function getProjectStatusLabel(project: ProjectBundle) {
  switch (project.manifest.authoringStatus) {
    case "active": return "Active";
    case "blocked": return "Needs setup";
    case "ready-for-export": return "Ready for export";
    case "reference-only": return "Reference only";
    case "archived": return "Archived";
    default: return "Legacy";
  }
}

export function isStudioProjectVisible(project: ProjectBundle) {
  return !HIDDEN_STUDIO_PROJECT_SLUGS.has(project.manifest.slug);
}

export function getVisibleStudioProjects(projects: ProjectBundle[]) {
  return projects.filter(isStudioProjectVisible);
}

function compareProjects(left: ProjectBundle, right: ProjectBundle) {
  return getProjectLabel(left).localeCompare(getProjectLabel(right));
}

export function getProjectMetadataGroups(projects: ProjectBundle[]) {
  const groups = new Map<string, ProjectBundle[]>();
  for (const project of getVisibleStudioProjects(projects)) {
    const group = getProjectGroupLabel(project);
    groups.set(group, [...(groups.get(group) ?? []), project]);
  }

  return [...groups.entries()]
    .map(([label, groupProjects]) => ({ label, projects: groupProjects.sort(compareProjects) }))
    .sort((left, right) => {
      const leftIndex = PROJECT_GROUP_ORDER.indexOf(left.label);
      const rightIndex = PROJECT_GROUP_ORDER.indexOf(right.label);
      return (leftIndex < 0 ? PROJECT_GROUP_ORDER.length : leftIndex)
        - (rightIndex < 0 ? PROJECT_GROUP_ORDER.length : rightIndex);
    });
}

export function orderProjectSlugs(slugs: string[]) {
  return slugs
    .filter((slug) => !HIDDEN_STUDIO_PROJECT_SLUGS.has(slug))
    .sort((left, right) => getProjectLabel(left).localeCompare(getProjectLabel(right)));
}
