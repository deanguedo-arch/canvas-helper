import type { ProjectBundle } from "./types";

const FEATURED_COURSE_BUILD_SLUGS = [
  "ela20-1-novel-study-clean",
  "ela20-1-feature-film",
  "ela30-1-shakespeare-othello",
  "ela30-1-short-stories",
  "ela30-1-modern-drama"
];

const FEATURED_COURSE_BUILD_LABELS: Record<string, string> = {
  "ela20-1-novel-study-clean": "ELA 20-1 Novel Study",
  "ela20-1-feature-film": "ELA 20-1 Feature Film",
  "ela30-1-shakespeare-othello": "ELA 30-1 Othello",
  "ela30-1-short-stories": "ELA 30-1 Short Stories",
  "ela30-1-modern-drama": "ELA 30-1 Modern Drama"
};

export function getProjectLabel(slug: string) {
  return FEATURED_COURSE_BUILD_LABELS[slug] ?? slug;
}

export function getFeaturedCourseBuildProjects(projects: ProjectBundle[]) {
  return FEATURED_COURSE_BUILD_SLUGS.map((slug) =>
    projects.find((project) => project.manifest.slug === slug)
  ).filter((project): project is ProjectBundle => Boolean(project));
}

export function getOtherProjects(projects: ProjectBundle[]) {
  const featuredSlugs = new Set(FEATURED_COURSE_BUILD_SLUGS);
  return projects.filter((project) => !featuredSlugs.has(project.manifest.slug));
}

export function orderProjectSlugs(slugs: string[]) {
  const availableSlugs = new Set(slugs);
  const featuredSlugs = FEATURED_COURSE_BUILD_SLUGS.filter((slug) => availableSlugs.has(slug));
  const otherSlugs = slugs.filter((slug) => !FEATURED_COURSE_BUILD_SLUGS.includes(slug));
  return [...featuredSlugs, ...otherSlugs];
}
