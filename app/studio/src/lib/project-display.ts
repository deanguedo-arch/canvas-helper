import type { ProjectBundle } from "./types";

const HIDDEN_STUDIO_PROJECT_SLUGS = new Set([
  "social30-1-related-issue-1",
  "social30-1-related-issue-2",
  "social30-1-related-issue-3",
  "social30-1-related-issue-4"
]);

const PROJECT_GROUP_ORDER = ["Conversion projects", "Generated courses", "Hybrid courses", "Legacy projects"];

const PROJECT_ACRONYMS = new Set(["ai", "calm", "cte", "ela", "hss", "scorm"]);

function titleCaseProjectWord(word: string) {
  if (PROJECT_ACRONYMS.has(word.toLowerCase())) return word.toUpperCase();
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function formatProjectToken(token: string) {
  if (/^[a-z]\d[a-z]$/i.test(token)) return token.toUpperCase();
  const parts = token.match(/[a-z]+|\d+/gi) ?? [token];
  return parts.map((part) => /^\d+$/.test(part) ? part : titleCaseProjectWord(part)).join(" ");
}

function matchesSlugIdentity(title: string, slug: string) {
  const compact = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return compact(title) === compact(slug);
}

export function formatProjectSlugLabel(slug: string) {
  const tokens = slug.split("-").filter(Boolean);
  if (!tokens.length) return slug;

  const firstCourseToken = tokens[0]?.match(/^([a-z]+)(\d+)([a-z]+)?$/i);
  if (firstCourseToken && /^\d$/.test(tokens[1] ?? "") && Number(firstCourseToken[2]) >= 10) {
    const [, subject, level, suffix] = firstCourseToken;
    const courseLabel = `${titleCaseProjectWord(subject)} ${level}-${tokens[1]}`;
    const remaining = [suffix, ...tokens.slice(2)].filter(Boolean).map(formatProjectToken);
    return [courseLabel, ...remaining].join(" ");
  }

  return tokens.map(formatProjectToken).join(" ");
}

export function getProjectLabel(project: ProjectBundle | string) {
  if (typeof project === "string") return formatProjectSlugLabel(project);
  const title = project.manifest.title?.trim();
  if (!title || matchesSlugIdentity(title, project.manifest.slug)) {
    return formatProjectSlugLabel(project.manifest.slug);
  }
  return title;
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
