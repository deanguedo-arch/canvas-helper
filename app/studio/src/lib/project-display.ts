import type { ProjectBundle } from "./types";

const FEATURED_COURSE_BUILD_SLUGS = [
  "social10-1-related-issue-1-option-2",
  "social10-1-related-issue-2-option-2",
  "social10-1-related-issue-3-option-2",
  "social10-1-related-issue-4-option-2",
  "social20-1-related-issue-1-option-2",
  "social20-1-related-issue-2-option-2",
  "social20-1-related-issue-3-option-2",
  "social20-1-related-issue-4-option-2",
  "social30-1-related-issue-1-option-2",
  "social30-1-related-issue-2-option-2",
  "social30-1-related-issue-3-option-2",
  "social30-1-related-issue-4-option-2",
  "ela20-1-novel-study-clean",
  "ela20-1-feature-film",
  "ela30-1-shakespeare-othello",
  "ela30-1-short-stories",
  "ela30-1-modern-drama"
];

const HIDDEN_STUDIO_PROJECT_SLUGS = new Set([
  "social30-1-related-issue-1",
  "social30-1-related-issue-2",
  "social30-1-related-issue-3",
  "social30-1-related-issue-4"
]);

const FEATURED_COURSE_BUILD_LABELS: Record<string, string> = {
  "ela20-1-novel-study-clean": "ELA 20-1 Novel Study",
  "ela20-1-feature-film": "ELA 20-1 Feature Film",
  "social30-1-related-issue-1-option-2": "Social 30-1 Related Issue 1 Option 2",
  "social30-1-related-issue-2-option-2": "Social 30-1 Related Issue 2 Option 2",
  "social30-1-related-issue-3-option-2": "Social 30-1 Related Issue 3 Option 2",
  "social30-1-related-issue-4-option-2": "Social 30-1 Related Issue 4 Option 2",
  "ela30-1-shakespeare-othello": "ELA 30-1 Othello",
  "ela30-1-short-stories": "ELA 30-1 Short Stories",
  "ela30-1-modern-drama": "ELA 30-1 Modern Drama"
};

const SUBJECT_GROUP_ORDER = [
  "Social Studies",
  "English Language Arts",
  "Science",
  "Math",
  "Psychology",
  "Physical Education and Wellness",
  "Career and Life",
  "Other"
];

export function getProjectLabel(slug: string) {
  return FEATURED_COURSE_BUILD_LABELS[slug] ?? formatProjectSlugLabel(slug);
}

export function isStudioProjectVisible(project: ProjectBundle) {
  return !HIDDEN_STUDIO_PROJECT_SLUGS.has(project.manifest.slug);
}

export function getVisibleStudioProjects(projects: ProjectBundle[]) {
  return projects.filter(isStudioProjectVisible);
}

function formatProjectSlugLabel(slug: string) {
  const socialMatch = slug.match(/^social(\d+)-1-related-issue-(\d)(?:-option-(\d))?$/);
  if (socialMatch) {
    const [, courseNumber, issueNumber, optionNumber] = socialMatch;
    const optionLabel = optionNumber ? ` Option ${optionNumber}` : "";
    return `Social ${courseNumber}-1 Related Issue ${issueNumber}${optionLabel}`;
  }

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

function getProjectSubject(slug: string) {
  if (/^social/i.test(slug) || /aboriginal|worldreligions|world-religions/i.test(slug)) return "Social Studies";
  if (/^ela/i.test(slug) || /english|novel|shakespeare|othello|stories|drama|film/i.test(slug)) {
    return "English Language Arts";
  }
  if (/science|biology|chemistry|physics|forensics/i.test(slug)) return "Science";
  if (/math|calculus|finlit|financial/i.test(slug)) return "Math";
  if (/psychology|psych|genpsy/i.test(slug)) return "Psychology";
  if (/wellness|sports|physical|pe/i.test(slug)) return "Physical Education and Wellness";
  if (/career|calm|learning-strategies|learningstrategies/i.test(slug)) return "Career and Life";
  return "Other";
}

function compareProjects(left: ProjectBundle, right: ProjectBundle) {
  const leftFeaturedIndex = FEATURED_COURSE_BUILD_SLUGS.indexOf(left.manifest.slug);
  const rightFeaturedIndex = FEATURED_COURSE_BUILD_SLUGS.indexOf(right.manifest.slug);
  if (leftFeaturedIndex >= 0 || rightFeaturedIndex >= 0) {
    if (leftFeaturedIndex < 0) return 1;
    if (rightFeaturedIndex < 0) return -1;
    return leftFeaturedIndex - rightFeaturedIndex;
  }

  return getProjectLabel(left.manifest.slug).localeCompare(getProjectLabel(right.manifest.slug));
}

export function getProjectSubjectGroups(projects: ProjectBundle[]) {
  const groups = new Map<string, ProjectBundle[]>();
  for (const project of getVisibleStudioProjects(projects)) {
    const subject = getProjectSubject(project.manifest.slug);
    groups.set(subject, [...(groups.get(subject) ?? []), project]);
  }

  return [...groups.entries()]
    .map(([label, groupProjects]) => ({
      label,
      projects: groupProjects.sort(compareProjects)
    }))
    .sort((left, right) => {
      const leftIndex = SUBJECT_GROUP_ORDER.indexOf(left.label);
      const rightIndex = SUBJECT_GROUP_ORDER.indexOf(right.label);
      const normalizedLeft = leftIndex < 0 ? SUBJECT_GROUP_ORDER.length : leftIndex;
      const normalizedRight = rightIndex < 0 ? SUBJECT_GROUP_ORDER.length : rightIndex;
      if (normalizedLeft !== normalizedRight) return normalizedLeft - normalizedRight;
      return left.label.localeCompare(right.label);
    });
}

export function orderProjectSlugs(slugs: string[]) {
  const visibleSlugs = slugs.filter((slug) => !HIDDEN_STUDIO_PROJECT_SLUGS.has(slug));
  const availableSlugs = new Set(visibleSlugs);
  const featuredSlugs = FEATURED_COURSE_BUILD_SLUGS.filter((slug) => availableSlugs.has(slug));
  const otherSlugs = visibleSlugs
    .filter((slug) => !FEATURED_COURSE_BUILD_SLUGS.includes(slug))
    .sort((left, right) => getProjectLabel(left).localeCompare(getProjectLabel(right)));
  return [...featuredSlugs, ...otherSlugs];
}
