import {
  type EnglishActivityRenderContext,
  type EnglishMaterialHook,
  type EnglishRenderedActivityNavGroup,
  type EnglishRenderedActivityProfile,
} from "./activity-profile-renderers.js";
import {
  buildQuestionSetsFromResources,
  type EnglishPreparedResource,
} from "./factory-resources.js";
import {
  renderShortFictionProfile,
  type ShortFictionAnalysisExample,
  type ShortFictionResource,
  type ShortFictionWork,
} from "./short-fiction-profile-renderer.js";
import { safeId } from "./source.js";
import type {
  EnglishReadingRecipe,
  EnglishUnitRecipeV3,
  EnglishWritingFormConfigV1,
} from "./types.js";
import { renderV3MediumProfile } from "./v3-medium-profile-renderer.js";
import {
  composeEnglishV3Runtime,
  type EnglishV3RuntimeFragmentKind,
} from "./v3-runtime-sanitizer.js";
import { renderWritingFoundationsProfile } from "./writing-foundations-profile-renderer.js";
import {
  renderEnglishWritingSequences,
  type EnglishWritingWork,
} from "./writing-sequence-renderer.js";

export type EnglishV3ProfileRenderInput = {
  recipe: EnglishUnitRecipeV3;
  resources: readonly EnglishPreparedResource[];
  context?: EnglishActivityRenderContext;
};

const SUPPORTED_PROFILES = new Set([
  "short-fiction",
  "writing-foundations",
  "modern-drama",
  "novel-study",
  "film-study",
]);

const CRITICAL_ESSAY_PATTERN = /critical(?:[-_\s]?essay)/i;

function expectedWritingForms(recipe: EnglishUnitRecipeV3) {
  if (recipe.activityProfile.kind === "writing-foundations") return [];
  return /^ELA\s*30-2$/i.test(recipe.courseCode.trim())
    ? ["literary-exploration", "personal-response", "visual-response"]
    : ["literary-exploration", "personal-response"];
}

function assertRecipe(recipe: EnglishUnitRecipeV3) {
  if (recipe.schemaVersion !== 3) throw new Error("The V3 profile renderer requires an EnglishUnitRecipeV3 recipe.");
  if (!recipe.projectSlug.trim() || !recipe.courseCode.trim() || !recipe.unitTitle.trim()) {
    throw new Error("The V3 profile renderer requires projectSlug, courseCode, and unitTitle.");
  }
  if (!SUPPORTED_PROFILES.has(recipe.activityProfile.kind)) {
    throw new Error(`Unsupported V3 activity profile: ${recipe.activityProfile.kind}`);
  }
  if (!/^ELA\s*(?:10|20|30)-2$/i.test(recipe.courseCode.trim())) {
    throw new Error(`V3 -2 profile rendering requires an ELA 10-2, 20-2, or 30-2 course code; received ${recipe.courseCode}.`);
  }
  const actual = recipe.writingForms.map((form) => form.kind);
  if (new Set(actual).size !== actual.length) throw new Error("ELA -2 recipes cannot contain duplicate writing forms.");
  if (actual.includes("critical-essay")) throw new Error("ELA -2 recipes cannot render Critical Essay.");
  const expected = expectedWritingForms(recipe);
  if (actual.length !== expected.length || actual.some((kind, index) => kind !== expected[index])) {
    throw new Error(`ELA ${recipe.courseCode.match(/\d+-2/)?.[0] ?? "-2"} writing forms must be ordered ${expected.join(", ")}.`);
  }
}

function normalizedResourceKey(value: string | undefined) {
  const file = (value ?? "").replace(/\\/g, "/").split("/").at(-1) ?? "";
  return file.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function resourceKeys(resource: EnglishPreparedResource) {
  return [resource.source, resource.href, resource.title, resource.id]
    .map(normalizedResourceKey)
    .filter(Boolean);
}

function matchScore(resource: EnglishPreparedResource, selectors: readonly (string | undefined)[]) {
  const keys = resourceKeys(resource);
  const targets = selectors.map(normalizedResourceKey).filter(Boolean);
  let score = 0;
  for (const target of targets) {
    for (const key of keys) {
      if (key === target) score = Math.max(score, 100);
      else if (key.includes(target) || target.includes(key)) score = Math.max(score, Math.min(key.length, target.length) > 5 ? 50 : 0);
    }
  }
  return score;
}

function bestResource(
  resources: readonly EnglishPreparedResource[],
  roles: readonly EnglishPreparedResource["role"][],
  selectors: readonly (string | undefined)[],
) {
  return resources
    .filter((resource) => roles.includes(resource.role) && !resource.reviewRequired)
    .map((resource, index) => ({ resource, index, score: matchScore(resource, selectors) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.resource;
}

function scopedQuestionResource(resource: EnglishPreparedResource, reading: EnglishReadingRecipe): EnglishPreparedResource {
  if (!reading.questionPages?.length || !resource.pages?.length) return { ...resource, role: "question-set" };
  const allowedPages = new Set(reading.questionPages);
  const pages = resource.pages.filter((page) => allowedPages.has(page.page));
  return {
    ...resource,
    role: "question-set",
    pages,
    text: pages.map((page) => page.text).join("\n\n").trim(),
  };
}

function questionsForReading(reading: EnglishReadingRecipe, resource: EnglishPreparedResource | undefined) {
  if (reading.questionPrompts?.length) {
    return reading.questionPrompts.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      hint: "Return to the assigned work and support your response with precise evidence.",
      sourceLabel: resource?.title,
    }));
  }
  if (!resource?.text?.trim() && !resource?.pages?.length) return [];
  try {
    const sets = buildQuestionSetsFromResources([scopedQuestionResource(resource, reading)], {
      idPrefix: reading.id,
      titlePrefix: `${reading.title} Questions`,
      hint: "Return to the assigned work and support your response with precise evidence.",
      preserveNumberedItems: true,
      normalizeSharedQuotationDirections: true,
    });
    return sets.flatMap((set) => set.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt ?? question.label,
      hint: question.hint,
      sourceLabel: resource.title,
    })));
  } catch {
    return [];
  }
}

function analysisExamples(recipe: EnglishUnitRecipeV3, readingId: string) {
  const examples: Record<string, ShortFictionAnalysisExample[]> = {};
  for (const example of recipe.analysisExamples.filter((candidate) => candidate.readingId === readingId)) {
    const termId = safeId(example.termId || example.term);
    (examples[termId] ??= []).push({ evidence: example.evidenceMoment, analysis: example.analysis });
  }
  return examples;
}

function shortFictionWorks(recipe: EnglishUnitRecipeV3, resources: readonly EnglishPreparedResource[]): ShortFictionWork[] {
  return recipe.readings.map((reading) => {
    const readingResource = bestResource(resources, ["reading"], [reading.readingFile, reading.id, reading.title]);
    const sameSource = normalizedResourceKey(reading.questionFile) === normalizedResourceKey(reading.readingFile);
    const questionResource = bestResource(
      resources,
      sameSource ? ["question-set", "reading"] : ["question-set"],
      [reading.questionFile, `${reading.id}-questions`, `${reading.title} questions`],
    ) ?? (sameSource ? readingResource : undefined);
    return {
      id: reading.id,
      title: reading.title,
      author: reading.author,
      group: reading.group,
      kind: reading.kind,
      readingHref: readingResource?.href,
      downloadHref: readingResource?.href,
      questionSourceHref: reading.questionPrompts?.length && sameSource ? undefined : questionResource?.href,
      questions: questionsForReading(reading, questionResource),
      analysisExamples: analysisExamples(recipe, reading.id),
    };
  });
}

function materialKind(resource: EnglishPreparedResource): EnglishMaterialHook["kind"] {
  const target = resource.href ?? resource.source;
  if (resource.role === "media" || /\.(?:mp4|mov|m4v|webm)$/i.test(target)) return "video";
  if (/\.(?:png|jpe?g|gif|webp|svg)$/i.test(target)) return "image";
  if (/^https?:\/\//i.test(target)) return "link";
  return "document";
}

function shortFictionResources(resources: readonly EnglishPreparedResource[]): ShortFictionResource[] {
  const seen = new Set<string>();
  return resources.flatMap((resource) => {
    if (!resource.href || resource.reviewRequired || resource.role === "lesson" || resource.role === "excluded-assessment") return [];
    if (CRITICAL_ESSAY_PATTERN.test(`${resource.title} ${resource.source}`)) return [];
    const id = safeId(resource.id || resource.title);
    if (seen.has(id)) return [];
    seen.add(id);
    const kind = materialKind(resource);
    return [{
      id,
      title: resource.title,
      kind,
      description: resource.role === "reading"
        ? "Assigned work for this unit."
        : resource.role === "question-set"
          ? "Assigned questions for this unit."
          : "Course material for this unit.",
      href: resource.href,
      actionLabel: kind === "video" ? "Open Video" : "Open",
      downloadable: !/^https?:\/\//i.test(resource.href),
      embeddable: kind !== "link",
      status: "available",
      learnerFacing: true,
    } satisfies ShortFictionResource];
  });
}

function visualWorks(resources: readonly EnglishPreparedResource[]): EnglishWritingWork[] {
  const images = resources.filter((resource) => resource.href && !resource.reviewRequired && materialKind(resource) === "image");
  return images.length
    ? images.map((resource) => ({ id: safeId(resource.id || resource.title), title: resource.title, kind: "visual" as const }))
    : [{ id: "current-visual", title: "Current Visual", kind: "visual" }];
}

function shortWritingWorks(recipe: EnglishUnitRecipeV3): EnglishWritingWork[] {
  return recipe.readings.map((reading) => ({
    id: safeId(reading.id),
    title: reading.title,
    author: reading.author,
    kind: "text" as const,
  }));
}

function playTitle(unitTitle: string) {
  return unitTitle
    .replace(/^Modern\s+(?:Play|Drama)\s*[-:–—]\s*/i, "")
    .replace(/^Stage\s+and\s+Screen\s*[-:–—]\s*/i, "")
    .trim() || unitTitle;
}

function mediumWritingWorks(recipe: EnglishUnitRecipeV3): EnglishWritingWork[] {
  if (recipe.activityProfile.kind === "modern-drama") {
    const title = playTitle(recipe.unitTitle);
    return [{ id: safeId(title), title, kind: "play" }];
  }
  if (recipe.activityProfile.kind === "novel-study") {
    return recipe.activityProfile.novels.length
      ? recipe.activityProfile.novels.map((novel) => ({ id: safeId(novel.id), title: novel.title, author: novel.author, kind: "novel" as const }))
      : [{ id: safeId(recipe.unitTitle), title: recipe.unitTitle, kind: "novel" }];
  }
  if (recipe.activityProfile.kind === "film-study") {
    const title = recipe.activityProfile.filmSelection.mode === "selected" ? recipe.activityProfile.filmSelection.title : "Current Film";
    return [{ id: safeId(title), title, kind: "film" }];
  }
  return [{ id: safeId(recipe.unitTitle), title: recipe.unitTitle, kind: "text" }];
}

function writingWorksForForm(
  recipe: EnglishUnitRecipeV3,
  resources: readonly EnglishPreparedResource[],
  form: EnglishWritingFormConfigV1,
) {
  if (form.kind === "visual-response") return visualWorks(resources);
  if (recipe.activityProfile.kind === "short-fiction") return shortWritingWorks(recipe);
  if (recipe.activityProfile.kind === "writing-foundations") {
    return [{ id: "writing-foundations", title: recipe.unitTitle, kind: "text" as const }];
  }
  return mediumWritingWorks(recipe);
}

function renderWritingForms(recipe: EnglishUnitRecipeV3, resources: readonly EnglishPreparedResource[]) {
  const results = recipe.writingForms.map((form) => renderEnglishWritingSequences({
    namespace: recipe.projectSlug,
    courseCode: recipe.courseCode,
    unitTitle: recipe.unitTitle,
    profileKind: recipe.activityProfile.kind,
    works: writingWorksForForm(recipe, resources, form),
    visualProfile: "ela20-workbook",
    writingForms: [form],
  }));
  return {
    pages: results.flatMap((result) => result.pages),
    navGroups: results.flatMap((result) => result.navGroups),
    css: results[0]?.css ?? "",
    runtime: results[0]?.runtime ?? "",
  };
}

function findClosingBrace(source: string, openIndex: number) {
  let depth = 1;
  let quote = "";
  let comment = false;
  for (let index = openIndex + 1; index < source.length; index += 1) {
    const character = source[index]!;
    const next = source[index + 1] ?? "";
    if (comment) {
      if (character === "*" && next === "/") { comment = false; index += 1; }
      continue;
    }
    if (!quote && character === "/" && next === "*") { comment = true; index += 1; continue; }
    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (character === "{") depth += 1;
    else if (character === "}" && --depth === 0) return index;
  }
  return -1;
}

function stripCriticalEssayCss(css: string): string {
  let output = "";
  let cursor = 0;
  while (cursor < css.length) {
    const open = css.indexOf("{", cursor);
    if (open < 0) { output += css.slice(cursor); break; }
    const close = findClosingBrace(css, open);
    if (close < 0) return css;
    const prelude = css.slice(cursor, open);
    const body = css.slice(open + 1, close);
    if (prelude.trim().startsWith("@")) {
      output += `${prelude}{${stripCriticalEssayCss(body)}}`;
    } else {
      const prefix = prelude.match(/^\s*/)?.[0] ?? "";
      const selectors = prelude.trim().split(",").map((selector) => selector.trim()).filter((selector) => !CRITICAL_ESSAY_PATTERN.test(selector));
      if (selectors.length) output += `${prefix}${selectors.join(",\n")}{${body}}`;
    }
    cursor = close + 1;
  }
  return output;
}

function sanitizedProfile(
  profile: EnglishRenderedActivityProfile,
  kind: EnglishV3RuntimeFragmentKind,
): EnglishRenderedActivityProfile {
  const pages = profile.pages.filter((page) => !CRITICAL_ESSAY_PATTERN.test(`${page.id} ${page.label} ${page.html}`));
  const pageIds = new Set(pages.map((page) => page.id));
  const navGroups = (profile.navGroups ?? [])
    .filter((group) => !CRITICAL_ESSAY_PATTERN.test(`${group.id} ${group.label} ${group.landingItemLabel ?? ""}`))
    .map((group): EnglishRenderedActivityNavGroup => ({ ...group, itemPageIds: group.itemPageIds.filter((id) => pageIds.has(id) && !CRITICAL_ESSAY_PATTERN.test(id)) }));
  const resourceLinks = (profile.resourceLinks ?? []).filter((resource) => !CRITICAL_ESSAY_PATTERN.test(`${resource.id} ${resource.title} ${resource.description ?? ""}`));
  const output: EnglishRenderedActivityProfile = {
    kind: profile.kind,
    pages,
    navGroups,
    resourceLinks,
    css: stripCriticalEssayCss(profile.css ?? ""),
    runtime: composeEnglishV3Runtime([{ id: `${profile.kind}-profile`, kind, source: profile.runtime ?? "" }]),
  };
  const serialized = JSON.stringify(output);
  if (CRITICAL_ESSAY_PATTERN.test(serialized)) {
    throw new Error(`V3 ${profile.kind} output retained Critical Essay residue.`);
  }
  return output;
}

function renderShortFiction(input: EnglishV3ProfileRenderInput) {
  const base = renderShortFictionProfile({
    namespace: input.recipe.projectSlug,
    courseCode: input.recipe.courseCode,
    unitTitle: input.recipe.unitTitle,
    works: shortFictionWorks(input.recipe, input.resources),
    resources: shortFictionResources(input.resources),
    materialsMode: "text-bank",
    evidenceBankRoute: "evidence-bank",
    analysisTerms: input.recipe.analysisTerms.map((term) => ({ ...term })),
  });
  const writing = renderWritingForms(input.recipe, input.resources);
  return sanitizedProfile({
    ...base,
    pages: [...writing.pages, ...base.pages],
    navGroups: [...writing.navGroups, ...base.navGroups],
    css: [base.css, writing.css].filter(Boolean).join("\n"),
    runtime: [base.runtime, writing.runtime].filter(Boolean).join("\n"),
  }, "composite");
}

function renderWritingFoundations(input: EnglishV3ProfileRenderInput) {
  const base = renderWritingFoundationsProfile({
    namespace: input.recipe.projectSlug,
    courseCode: input.recipe.courseCode,
    unitTitle: input.recipe.unitTitle,
    evidenceBankRoute: "evidence-bank",
  });
  const writing = renderWritingForms(input.recipe, input.resources);
  return sanitizedProfile({
    kind: base.kind,
    pages: [...writing.pages, ...base.pages],
    navGroups: [...writing.navGroups, ...base.navGroups],
    resourceLinks: base.resourceLinks ?? [],
    css: [base.css, writing.css].filter(Boolean).join("\n"),
    runtime: [base.runtime, writing.runtime].filter(Boolean).join("\n"),
  }, "composite");
}

function renderMedium(input: EnglishV3ProfileRenderInput) {
  const native = renderV3MediumProfile({
    ...input,
    recipe: { ...input.recipe, writingForms: [] },
  });
  const writing = renderWritingForms(input.recipe, input.resources);
  return sanitizedProfile({
    ...native,
    pages: [...writing.pages, ...native.pages],
    navGroups: [...writing.navGroups, ...(native.navGroups ?? [])],
    css: [native.css, writing.css].filter(Boolean).join("\n"),
    runtime: [native.runtime, writing.runtime].filter(Boolean).join("\n"),
  }, input.recipe.activityProfile.kind);
}

/**
 * Composes one review-ready Recipe V3 activity system from prepared resources.
 * The ordered `writingForms` array is authoritative; no donor writing route or
 * Critical Essay runtime is allowed to survive the composition boundary.
 */
export function renderV3ActivityProfile(input: EnglishV3ProfileRenderInput): EnglishRenderedActivityProfile {
  assertRecipe(input.recipe);
  if (input.recipe.activityProfile.kind === "short-fiction") return renderShortFiction(input);
  if (input.recipe.activityProfile.kind === "writing-foundations") return renderWritingFoundations(input);
  return renderMedium(input);
}
