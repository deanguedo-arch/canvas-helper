import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";
import JSZip from "jszip";

import { EnglishUnitRecipeSchema, parseEnglishUnitRecipe } from "./schema.js";
import {
  loadBrightspaceLessonsByIds,
  loadBrightspaceUnit,
  safeFileName,
  safeId
} from "./source.js";
import type {
  EnglishBuildReportItem,
  EnglishBuiltLesson,
  EnglishReadingRecipe,
  EnglishSupportingResource,
  EnglishUnitRecipeV1,
  EnglishUnitRecipeV2,
  EnglishUnitRecipeV3
} from "./types.js";

export type EnglishDonorLessonSourceKind =
  | "recipe-v2"
  | "recipe-v1"
  | "recipe-alias-v2"
  | "legacy-brightspace"
  | "imported-source-html";

export type EnglishDonorLessonSource = {
  requestedProjectSlug: string;
  resolvedProjectSlug: string;
  kind: EnglishDonorLessonSourceKind;
  sourcePath: string;
};

export type EnglishDonorLessonResolution = {
  lessons: EnglishBuiltLesson[];
  sources: EnglishDonorLessonSource[];
  unresolvedCases: string[];
};

export type EnglishV3DonorDataSource = {
  requestedProjectSlug: string;
  resolvedProjectSlug: string;
  kind: "recipe-v1" | "recipe-v2" | "recipe-alias-v2";
  recipePath: string;
};

export type EnglishV3DonorDataHydration = {
  recipe: EnglishUnitRecipeV3;
  source?: EnglishV3DonorDataSource;
  matchedReadings: Array<{ donorReadingId: string; targetReadingId: string }>;
  inherited: {
    questionPromptReadings: number;
    questionPrompts: number;
    questionPageSelections: number;
    analysisTerms: number;
    analysisExamples: number;
    placements: number;
    fictionElementsHub: boolean;
    lessonStructure: boolean;
  };
};

export class EnglishDonorLessonResolutionError extends Error {
  readonly unresolvedCases: string[];

  constructor(message: string, unresolvedCases: string[]) {
    super(message);
    this.name = "EnglishDonorLessonResolutionError";
    this.unresolvedCases = [...unresolvedCases];
  }
}

type V1RecipePlan = {
  kind: "recipe-v1";
  requestedProjectSlug: string;
  resolvedProjectSlug: string;
  recipePath: string;
  sourcePath: string;
  recipe: EnglishUnitRecipeV1;
};

type V2RecipePlan = {
  kind: "recipe-v2" | "recipe-alias-v2";
  requestedProjectSlug: string;
  resolvedProjectSlug: string;
  recipePath: string;
  sourcePath: string;
  recipe: EnglishUnitRecipeV2;
};

type RecipePlan = V1RecipePlan | V2RecipePlan;

type BrightspacePlan = {
  kind: "legacy-brightspace";
  requestedProjectSlug: string;
  resolvedProjectSlug: string;
  sourcePath: string;
  selectors: Array<{ itemId: string; title: string }>;
};

type ImportedHtmlPlan = {
  kind: "imported-source-html";
  requestedProjectSlug: string;
  resolvedProjectSlug: string;
  sourcePath: string;
  lessons: Array<{ file: string; title: string; kind?: "html" | "document" }>;
};

export type EnglishDonorLessonPlan = RecipePlan | BrightspacePlan | ImportedHtmlPlan;

const LEGACY_DONOR_ALIASES: Record<string, string> = {
  "ela30-1-novel-study-legacy": "ela20-1-novel-study-clean",
  "ela30-1-feature-film-legacy": "ela20-1-feature-film"
};

const LEGACY_DONOR_LESSON_TITLE_OVERRIDES: Record<string, Record<string, string>> = {
  "ela30-1-novel-study-legacy": {
    "Novel Study Introduction": "Novel Unit Introduction",
    "Characteristics of the Novel": "Characteristics of a Novel"
  },
  "ela30-1-feature-film-legacy": {
    "Film Study Overview": "Film Study Introduction",
    "Formal Elements of Film": "Elements of Film",
    "Editing and Sound": "Elements of Film - Continued",
    "Film Editing Techniques": "Editing and Transitions",
    "Camera Shots and Angles": "Film Shots and Angles",
    "Mise-en-scene": "Examining Mise-En-Scene",
    "Composition and Camera Movement": "Camera Movement in Film and Video"
  }
};

const ELA30_SHORT_STORY_LESSONS = [
  ["3521", "Short Stories - Introduction"],
  ["3522", "Lesson 1: Characters and Characterization"],
  ["3523", "Lesson 2: Introduction to Elements of Fiction"],
  ["3524", "Lesson 3: Irony"],
  ["3525", "Lesson 4: Point of View"],
  ["3526", "Lesson 5: Plot"],
  ["3527", "Lesson 6: Setting"],
  ["3528", "Lesson 7: Symbols and Motifs"],
  ["3529", "Lesson 8: Tone and Mood"],
  ["3530", "Lesson 9: Diction"],
  ["3531", "Lesson 10: Theme"],
  ["3532", "Lesson 11: Suggestions for Reading Short Stories"],
  ["3533", "Lesson 12: Literary Terms"],
  ["3534", "Lesson 13: Writing a Personal Response to Text(s)"],
] as const;

const ELA30_SHORT_STORY_ELEMENTS_HUB = {
  hubLesson: "Lesson 2: Introduction to Elements of Fiction",
  childLessons: [
    "Lesson 3: Irony",
    "Lesson 4: Point of View",
    "Lesson 5: Plot",
    "Lesson 6: Setting",
    "Lesson 7: Symbols and Motifs",
    "Lesson 8: Tone and Mood",
    "Lesson 9: Diction",
    "Lesson 10: Theme"
  ]
} as const;

const ELA30_SHORT_STORY_TOP_LEVEL_LESSONS = [
  "Short Stories - Introduction",
  "Lesson 1: Characters and Characterization",
  "Lesson 2: Introduction to Elements of Fiction",
  "Lesson 12: Literary Terms",
  "Lesson 11: Suggestions for Reading Short Stories",
  "Lesson 13: Writing a Personal Response to Text(s)"
] as const;

const STREETCAR_SOURCE_LESSONS = [
  { file: "a_streetcar_named_desire_unit_intro.html", title: "A Streetcar Named Desire - Introduction" },
  { file: "Streetcar Overview and Character.html", title: "Streetcar Overview and Characters" },
  { file: "assets/A Streetcar Named Desire questions.pdf", title: "A Streetcar Named Desire Questions", kind: "document" },
  { file: "scene-overviews.html", title: "Scene Overviews" },
  { file: "A Streetcar Named Desire Analysis.html", title: "A Streetcar Named Desire Analysis" },
  { file: "The Streetcar.html", title: "The Streetcar" },
  { file: "Motifs and Symbols.html", title: "Motifs" },
  { file: "Symbols.html", title: "Symbols" },
  { file: "Relationships.html", title: "Relationships" },
  { file: "Themes.html", title: "Themes" },
  { file: "Song Symbolism.html", title: "Song Symbolism" }
] as const;

async function isFile(filePath: string) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function donorProjectSlugs(recipe: EnglishUnitRecipeV3) {
  return [...new Set(recipe.source.lessonSelectors
    .filter((selector) => selector.disposition === "include" && selector.itemId.startsWith("donor:"))
    .map((selector) => selector.itemId.slice("donor:".length).trim())
    .filter(Boolean))];
}

export function hasV3DonorLessonSelector(recipe: EnglishUnitRecipeV3) {
  return donorProjectSlugs(recipe).length > 0;
}

function resolveRecipeSourcePath(input: {
  repoRoot: string;
  projectSlug: string;
  sourcePath: string;
}) {
  if (path.isAbsolute(input.sourcePath)) return input.sourcePath;
  const fromRepo = path.resolve(input.repoRoot, input.sourcePath);
  const fromProject = path.resolve(input.repoRoot, "projects", input.projectSlug, input.sourcePath);
  return { fromRepo, fromProject };
}

async function findRecipeSourcePath(input: {
  repoRoot: string;
  projectSlug: string;
  sourcePath: string;
}) {
  const resolved = resolveRecipeSourcePath(input);
  if (typeof resolved === "string") return resolved;
  if (await isFile(resolved.fromRepo)) return resolved.fromRepo;
  if (await isFile(resolved.fromProject)) return resolved.fromProject;
  return resolved.fromRepo;
}

function assertNotDonorWorkspaceSource(input: {
  repoRoot: string;
  requestedProjectSlug: string;
  resolvedProjectSlug: string;
  sourcePath: string;
}) {
  const workspaceRoot = path.resolve(input.repoRoot, "projects", input.resolvedProjectSlug, "workspace");
  const resolvedSource = path.resolve(input.sourcePath);
  if (resolvedSource === workspaceRoot || resolvedSource.startsWith(`${workspaceRoot}${path.sep}`)) {
    throw new EnglishDonorLessonResolutionError(
      `Donor ${input.requestedProjectSlug} points into a donor workspace, which is not a valid derivation source.`,
      [`${input.requestedProjectSlug}: ${resolvedSource} is generated/editable workspace output rather than recipe or imported source data.`]
    );
  }
}

function withoutV3WritingFields(recipe: EnglishUnitRecipeV3): EnglishUnitRecipeV2 {
  const { derivesFromProject: _derivesFromProject, writingForms: _writingForms, ...rest } = recipe;
  return { ...rest, schemaVersion: 2 };
}

function loaderRecipeForV1(input: {
  target: EnglishUnitRecipeV3;
  donor: EnglishUnitRecipeV1;
}): EnglishUnitRecipeV2 {
  const target = withoutV3WritingFields(input.target);
  return {
    ...target,
    source: {
      ...target.source,
      brightspaceZip: input.donor.source.brightspaceZip,
      brightspaceUnitId: input.donor.source.brightspaceUnitId,
      teacherFolder: input.donor.source.teacherFolder,
      lessonSelectors: []
    },
    lessonOrder: [...input.donor.lessonOrder],
    topLevelLessonOrder: [...input.donor.topLevelLessonOrder],
    fictionElementsHub: {
      ...input.donor.fictionElementsHub,
      childLessons: [...input.donor.fictionElementsHub.childLessons]
    },
    wordingCorrections: [
      ...input.donor.wordingCorrections.map((correction) => ({ ...correction })),
      ...input.target.wordingCorrections.map((correction) => ({ ...correction }))
    ],
    mediaPolicy: {
      ...input.target.mediaPolicy,
      allowedYouTubeIds: [...new Set([
        ...input.donor.mediaPolicy.allowedYouTubeIds,
        ...input.target.mediaPolicy.allowedYouTubeIds
      ])],
      blockedYouTubeIds: [...new Set([
        ...input.donor.mediaPolicy.blockedYouTubeIds,
        ...input.target.mediaPolicy.blockedYouTubeIds
      ])],
      approvedExternalUrls: [...new Set([
        ...input.donor.mediaPolicy.approvedExternalUrls,
        ...input.target.mediaPolicy.approvedExternalUrls
      ])],
      externalUrlRewrites: {
        ...input.donor.mediaPolicy.externalUrlRewrites,
        ...input.target.mediaPolicy.externalUrlRewrites
      }
    }
  };
}

function loaderRecipeForV2(input: {
  target: EnglishUnitRecipeV3;
  donor: EnglishUnitRecipeV2;
}): EnglishUnitRecipeV2 {
  const target = withoutV3WritingFields(input.target);
  return {
    ...input.donor,
    projectSlug: target.projectSlug,
    courseCode: target.courseCode,
    courseTitle: target.courseTitle,
    unitTitle: target.unitTitle,
    status: target.status,
    source: {
      ...input.donor.source,
      teacherResourcesZip: target.source.teacherResourcesZip,
      teacherFolder: target.source.teacherFolder
    },
    activityProfile: target.activityProfile,
    wordingCorrections: [
      ...input.donor.wordingCorrections.map((correction) => ({ ...correction })),
      ...target.wordingCorrections.map((correction) => ({ ...correction }))
    ],
    mediaPolicy: {
      ...target.mediaPolicy,
      allowedYouTubeIds: [...new Set([
        ...input.donor.mediaPolicy.allowedYouTubeIds,
        ...target.mediaPolicy.allowedYouTubeIds
      ])],
      blockedYouTubeIds: [...new Set([
        ...input.donor.mediaPolicy.blockedYouTubeIds,
        ...target.mediaPolicy.blockedYouTubeIds
      ])],
      approvedExternalUrls: [...new Set([
        ...input.donor.mediaPolicy.approvedExternalUrls,
        ...target.mediaPolicy.approvedExternalUrls
      ])],
      externalUrlRewrites: {
        ...input.donor.mediaPolicy.externalUrlRewrites,
        ...target.mediaPolicy.externalUrlRewrites
      }
    }
  };
}

function replaceCourseIdentity(value: string, courseCode: string) {
  const englishCode = courseCode.replace(/^ELA\s+/i, "English Language Arts ");
  return value
    .replace(/English Language Arts\s*(?:10|20|30)[\u2010-\u2015-](?:1|2)/gi, englishCode)
    .replace(/\bELA\s*(?:10|20|30)[\u2010-\u2015-](?:1|2)\b/gi, courseCode)
    .replace(/\bEnglish\s*(?:10|20|30)[\u2010-\u2015-](?:1|2)\b/gi, courseCode.replace(/^ELA/i, "English"));
}

function applyTargetWordingCorrections(value: string, target: EnglishUnitRecipeV3) {
  let corrected = value;
  for (const correction of target.wordingCorrections) {
    if (corrected.includes(correction.find)) {
      corrected = corrected.split(correction.find).join(correction.replace);
    }
  }
  return corrected;
}

function normalizeTargetLessonValue(value: string, target: EnglishUnitRecipeV3) {
  // The source loader performs its own donor-grade normalization after its
  // wording pass. Apply the target decisions once more here so wording that is
  // created by that cleanup cannot leak into the derived course. Course
  // identity normalization intentionally runs last because target corrections
  // may be authored against inherited donor wording such as ELA 20-1.
  return removeEmptyPleaseArtifacts(
    replaceCourseIdentity(applyTargetWordingCorrections(value, target), target.courseCode)
  );
}

function removeEmptyPleaseArtifacts(value: string) {
  return value
    .replace(/<p\b[^>]*>\s*Please\s*\.?\s*<\/p>/gi, "")
    .replace(/(^|\n)\s*Please\s*\.\s*(?=\n|$)/gi, "$1");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Brightspace pages commonly reuse generic wrapper IDs such as `container`,
 * `content`, and `border`. Once several pages are assembled into one course,
 * those otherwise-valid standalone IDs collide. Namespace the fragment IDs
 * and every local ID reference before the lesson enters the shared shell.
 */
function namespaceLessonHtmlIds(html: string, namespace: string) {
  const $ = cheerio.load(html, null, false);
  const prefix = safeId(namespace, "lesson");
  const ids = new Map<string, string>();
  const occurrences = new Map<string, number>();

  $("[id]").each((_index, element) => {
    const original = $(element).attr("id")?.trim();
    if (!original) return;
    const occurrence = (occurrences.get(original) ?? 0) + 1;
    occurrences.set(original, occurrence);
    const base = `${prefix}--${safeId(original)}`;
    const namespaced = occurrence === 1 ? base : `${base}-${occurrence}`;
    if (!ids.has(original)) ids.set(original, namespaced);
    $(element).attr("id", namespaced);
  });

  if (ids.size === 0) return html;

  const tokenReferenceAttributes = [
    "for",
    "headers",
    "aria-labelledby",
    "aria-describedby",
    "aria-controls",
    "aria-owns",
    "aria-activedescendant",
    "aria-details",
    "aria-errormessage"
  ];
  const fragmentReferenceAttributes = ["href", "xlink:href", "data-target", "data-bs-target", "data-parent"];

  $("*").each((_index, element) => {
    const node = $(element);
    for (const attribute of tokenReferenceAttributes) {
      const value = node.attr(attribute);
      if (!value) continue;
      node.attr(attribute, value
        .split(/\s+/)
        .map((token) => ids.get(token) ?? token)
        .join(" "));
    }
    for (const attribute of fragmentReferenceAttributes) {
      const value = node.attr(attribute);
      if (!value?.startsWith("#")) continue;
      const replacement = ids.get(value.slice(1));
      if (replacement) node.attr(attribute, `#${replacement}`);
    }
    const inlineStyle = node.attr("style");
    if (inlineStyle) {
      let rewritten = inlineStyle;
      for (const [original, namespaced] of ids) {
        rewritten = rewritten.replace(
          new RegExp(`url\\(\\s*#${escapeRegExp(original)}\\s*\\)`, "g"),
          `url(#${namespaced})`
        );
      }
      node.attr("style", rewritten);
    }
  });

  $("style").each((_index, element) => {
    let css = $(element).html() ?? "";
    for (const [original, namespaced] of ids) {
      css = css.replace(
        new RegExp(`#${escapeRegExp(original)}(?![a-zA-Z0-9_-])`, "g"),
        `#${namespaced}`
      );
    }
    $(element).html(css);
  });

  return $.html();
}

export function namespaceEnglishV3LessonIds(lessons: EnglishBuiltLesson[]) {
  return lessons.map((lesson, index) => ({
    ...lesson,
    html: namespaceLessonHtmlIds(
      lesson.html,
      lesson.id?.trim() || `lesson-${index + 1}-${safeId(lesson.title)}`
    )
  }));
}

export function normalizeEnglishV3ResolvedLessons(lessons: EnglishBuiltLesson[], target: EnglishUnitRecipeV3) {
  return namespaceEnglishV3LessonIds(lessons.map((lesson, index) => {
    const lessonId = `lesson-${index + 1}-${safeId(lesson.title)}`;
    return {
      ...lesson,
      id: lessonId,
      html: normalizeTargetLessonValue(lesson.html, target),
      text: normalizeTargetLessonValue(lesson.text, target),
      supportingResources: lesson.supportingResources.map((resource) => ({ ...resource }))
    };
  }));
}

function applyLegacyDonorLessonPresentation(
  lessons: EnglishBuiltLesson[],
  requestedProjectSlug: string
) {
  const overrides = LEGACY_DONOR_LESSON_TITLE_OVERRIDES[requestedProjectSlug];
  if (!overrides) return lessons;
  return lessons.map((lesson) => {
    const title = overrides[lesson.title] ?? lesson.title;
    return title === lesson.title ? lesson : { ...lesson, title };
  });
}

async function readDonorRecipePlan(input: {
  repoRoot: string;
  requestedProjectSlug: string;
  projectSlug: string;
  alias: boolean;
}): Promise<RecipePlan | undefined> {
  const recipePath = path.join(input.repoRoot, "projects", input.projectSlug, "meta", "english-unit.json");
  if (!(await isFile(recipePath))) return undefined;
  const parsed = EnglishUnitRecipeSchema.parse(JSON.parse(await readFile(recipePath, "utf8")));
  if (parsed.schemaVersion === 3) {
    throw new EnglishDonorLessonResolutionError(
      `Donor ${input.projectSlug} is itself a V3 derived unit. V3 donor chains are not supported.`,
      [`${input.requestedProjectSlug}: donor recipe ${input.projectSlug} is V3 rather than an approved -1 source recipe.`]
    );
  }
  const sourcePath = await findRecipeSourcePath({
    repoRoot: input.repoRoot,
    projectSlug: input.projectSlug,
    sourcePath: parsed.source.brightspaceZip
  });
  assertNotDonorWorkspaceSource({
    repoRoot: input.repoRoot,
    requestedProjectSlug: input.requestedProjectSlug,
    resolvedProjectSlug: input.projectSlug,
    sourcePath
  });
  if (parsed.schemaVersion === 1) {
    return {
      kind: "recipe-v1",
      requestedProjectSlug: input.requestedProjectSlug,
      resolvedProjectSlug: input.projectSlug,
      recipePath,
      sourcePath,
      recipe: parsed as EnglishUnitRecipeV1
    };
  }
  return {
    kind: input.alias ? "recipe-alias-v2" : "recipe-v2",
    requestedProjectSlug: input.requestedProjectSlug,
    resolvedProjectSlug: input.projectSlug,
    recipePath,
    sourcePath,
    recipe: parsed as EnglishUnitRecipeV2
  };
}

/**
 * Resolves source-data plans only. This never reads donor workspace HTML.
 */
export async function inspectEnglishV3DonorLessonPlans(input: {
  repoRoot: string;
  recipe: EnglishUnitRecipeV3;
}): Promise<EnglishDonorLessonPlan[]> {
  if (input.recipe.schemaVersion !== 3) {
    throw new Error("Donor lesson resolution requires an EnglishUnitRecipeV3 recipe.");
  }
  const requestedSlugs = donorProjectSlugs(input.recipe);
  if (requestedSlugs.length === 0) return [];

  const plans: EnglishDonorLessonPlan[] = [];
  const unresolved: string[] = [];
  for (const requestedProjectSlug of requestedSlugs) {
    const directRecipe = await readDonorRecipePlan({
      repoRoot: input.repoRoot,
      requestedProjectSlug,
      projectSlug: requestedProjectSlug,
      alias: false
    });
    if (directRecipe) {
      plans.push(directRecipe);
      continue;
    }

    const alias = LEGACY_DONOR_ALIASES[requestedProjectSlug];
    if (alias) {
      const aliasPlan = await readDonorRecipePlan({
        repoRoot: input.repoRoot,
        requestedProjectSlug,
        projectSlug: alias,
        alias: true
      });
      if (aliasPlan) {
        plans.push(aliasPlan);
        continue;
      }
      unresolved.push(`${requestedProjectSlug}: configured source-recipe fallback ${alias} has no recipe.`);
      continue;
    }

    if (requestedProjectSlug === "ela30-1-short-stories") {
      plans.push({
        kind: "legacy-brightspace",
        requestedProjectSlug,
        resolvedProjectSlug: requestedProjectSlug,
        sourcePath: path.join(
          input.repoRoot,
          "projects",
          "ela30-1-short-stories",
          "raw",
          "D2LExport_6670_CBE System ELA 30-1 (Winter 2020)_202661528.zip"
        ),
        selectors: ELA30_SHORT_STORY_LESSONS.map(([itemId, title]) => ({ itemId, title }))
      });
      continue;
    }

    if (requestedProjectSlug === "ela30-1-modern-drama") {
      plans.push({
        kind: "imported-source-html",
        requestedProjectSlug,
        resolvedProjectSlug: requestedProjectSlug,
        sourcePath: path.join(input.repoRoot, "projects", "resources", "ela30-1-modern-drama", "streetcar_named_desire"),
        lessons: STREETCAR_SOURCE_LESSONS.map((lesson) => ({ ...lesson }))
      });
      continue;
    }

    unresolved.push(`${requestedProjectSlug}: no V1/V2 donor recipe or explicit imported-source fallback exists.`);
  }

  if (unresolved.length > 0) {
    throw new EnglishDonorLessonResolutionError("One or more V3 donor lesson sources could not be resolved.", unresolved);
  }
  return plans;
}

function normalizedWorkPart(value: string | undefined) {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function workIdentity(reading: EnglishReadingRecipe) {
  return `${normalizedWorkPart(reading.title)}::${normalizedWorkPart(reading.author)}::${reading.kind}`;
}

function emptyDonorDataCounts(): EnglishV3DonorDataHydration["inherited"] {
  return {
    questionPromptReadings: 0,
    questionPrompts: 0,
    questionPageSelections: 0,
    analysisTerms: 0,
    analysisExamples: 0,
    placements: 0,
    fictionElementsHub: false,
    lessonStructure: false
  };
}

async function inspectDerivedRecipePlan(input: {
  repoRoot: string;
  recipe: EnglishUnitRecipeV3;
}): Promise<RecipePlan | undefined> {
  const requestedProjectSlug = input.recipe.derivesFromProject.trim();
  const directRecipe = await readDonorRecipePlan({
    repoRoot: input.repoRoot,
    requestedProjectSlug,
    projectSlug: requestedProjectSlug,
    alias: false
  });
  if (directRecipe) return directRecipe;

  const alias = LEGACY_DONOR_ALIASES[requestedProjectSlug];
  if (!alias) return undefined;
  return await readDonorRecipePlan({
    repoRoot: input.repoRoot,
    requestedProjectSlug,
    projectSlug: alias,
    alias: true
  });
}

function matchDonorReadings(target: EnglishUnitRecipeV3, donor: EnglishUnitRecipeV1 | EnglishUnitRecipeV2) {
  const donorsByIdentity = new Map<string, EnglishReadingRecipe[]>();
  for (const reading of donor.readings) {
    const identity = workIdentity(reading);
    const matches = donorsByIdentity.get(identity) ?? [];
    matches.push(reading);
    donorsByIdentity.set(identity, matches);
  }

  return target.readings.flatMap((targetReading) => {
    const matches = donorsByIdentity.get(workIdentity(targetReading)) ?? [];
    return matches.length === 1 ? [{ donor: matches[0]!, target: targetReading }] : [];
  });
}

function remapQuestionRef(questionRef: string, readingIdMap: ReadonlyMap<string, string>) {
  const separatorIndex = questionRef.indexOf(":");
  if (separatorIndex <= 0) return undefined;
  const targetReadingId = readingIdMap.get(questionRef.slice(0, separatorIndex));
  return targetReadingId ? `${targetReadingId}${questionRef.slice(separatorIndex)}` : undefined;
}

/**
 * Hydrates only work-dependent, learner-facing decisions that are curated in
 * the approved donor recipe. Explicit target decisions win, source/resource
 * paths remain target-owned, and donor workspace output is never consulted.
 */
export async function hydrateEnglishV3DonorData(input: {
  repoRoot: string;
  recipe: EnglishUnitRecipeV3;
}): Promise<EnglishV3DonorDataHydration> {
  if (input.recipe.schemaVersion !== 3) {
    throw new Error("Donor data hydration requires an EnglishUnitRecipeV3 recipe.");
  }

  const plan = await inspectDerivedRecipePlan(input);
  if (!plan) {
    if (input.recipe.derivesFromProject === "ela30-1-short-stories") {
      const lessonOrder = ELA30_SHORT_STORY_LESSONS.map(([, title]) => title);
      const recipe = parseEnglishUnitRecipe({
        ...input.recipe,
        lessonOrder,
        topLevelLessonOrder: [...ELA30_SHORT_STORY_TOP_LEVEL_LESSONS],
        lessonGroups: input.recipe.lessonGroups.map((group) => ({
          ...group,
          lessonIds: [...ELA30_SHORT_STORY_TOP_LEVEL_LESSONS]
        })),
        fictionElementsHub: {
          hubLesson: ELA30_SHORT_STORY_ELEMENTS_HUB.hubLesson,
          childLessons: [...ELA30_SHORT_STORY_ELEMENTS_HUB.childLessons]
        }
      });
      if (recipe.schemaVersion !== 3) throw new Error("ELA 30-1 Short Stories donor hydration produced a non-V3 recipe.");
      const inherited = emptyDonorDataCounts();
      inherited.fictionElementsHub = true;
      inherited.lessonStructure = true;
      return { recipe, matchedReadings: [], inherited };
    }
    return { recipe: input.recipe, matchedReadings: [], inherited: emptyDonorDataCounts() };
  }

  const matches = matchDonorReadings(input.recipe, plan.recipe);
  const matchedReadings = matches.map(({ donor, target }) => ({
    donorReadingId: donor.id,
    targetReadingId: target.id
  }));
  const source: EnglishV3DonorDataSource = {
    requestedProjectSlug: plan.requestedProjectSlug,
    resolvedProjectSlug: plan.resolvedProjectSlug,
    kind: plan.kind,
    recipePath: plan.recipePath
  };
  if (matches.length === 0) {
    return { recipe: input.recipe, source, matchedReadings, inherited: emptyDonorDataCounts() };
  }

  const counts = emptyDonorDataCounts();
  const donorByTargetId = new Map(matches.map(({ donor, target }) => [target.id, donor]));
  const readingIdMap = new Map(matches.map(({ donor, target }) => [donor.id, target.id]));
  const donorSelectorId = `donor:${plan.requestedProjectSlug}`;
  const symbolicLessonStructure = input.recipe.lessonOrder.length === 1
    && input.recipe.lessonOrder[0] === donorSelectorId
    && plan.recipe.lessonOrder.length > 0;
  const lessonOrder = symbolicLessonStructure
    ? [...plan.recipe.lessonOrder]
    : [...input.recipe.lessonOrder];
  const topLevelLessonOrder = symbolicLessonStructure
    && input.recipe.topLevelLessonOrder.length === 1
    && input.recipe.topLevelLessonOrder[0] === donorSelectorId
    ? [...plan.recipe.topLevelLessonOrder]
    : [...input.recipe.topLevelLessonOrder];
  const lessonGroups = input.recipe.lessonGroups.map((group) => ({
    ...group,
    lessonIds: symbolicLessonStructure
      && group.lessonIds.length === 1
      && group.lessonIds[0] === donorSelectorId
      ? [...lessonOrder]
      : [...group.lessonIds]
  }));
  counts.lessonStructure = symbolicLessonStructure;
  const readings = input.recipe.readings.map((targetReading) => {
    const donorReading = donorByTargetId.get(targetReading.id);
    if (!donorReading) return { ...targetReading, questionPages: targetReading.questionPages && [...targetReading.questionPages], questionPrompts: targetReading.questionPrompts?.map((prompt) => ({ ...prompt })) };

    const inheritPrompts = targetReading.questionPrompts === undefined && Boolean(donorReading.questionPrompts?.length);
    const inheritQuestionPages = targetReading.questionPages === undefined && Boolean(donorReading.questionPages?.length);
    if (inheritPrompts) {
      counts.questionPromptReadings += 1;
      counts.questionPrompts += donorReading.questionPrompts!.length;
    }
    if (inheritQuestionPages) counts.questionPageSelections += 1;
    return {
      ...targetReading,
      questionPages: inheritQuestionPages ? [...donorReading.questionPages!] : targetReading.questionPages && [...targetReading.questionPages],
      questionPrompts: inheritPrompts
        ? donorReading.questionPrompts!.map((prompt) => ({ ...prompt }))
        : targetReading.questionPrompts?.map((prompt) => ({ ...prompt }))
    };
  });

  const analysisEnabled = input.recipe.activityProfile.kind === "short-fiction"
    && input.recipe.activityProfile.analysisExplorer;
  const analysisTerms = analysisEnabled && input.recipe.analysisTerms.length === 0
    ? plan.recipe.analysisTerms.map((term) => ({ ...term }))
    : input.recipe.analysisTerms.map((term) => ({ ...term }));
  counts.analysisTerms = Math.max(0, analysisTerms.length - input.recipe.analysisTerms.length);

  const termIds = new Set(analysisTerms.map((term) => term.id));
  const analysisExamples = analysisEnabled && input.recipe.analysisExamples.length === 0
    ? plan.recipe.analysisExamples.flatMap((example) => {
        const targetReadingId = readingIdMap.get(example.readingId);
        if (!targetReadingId || (example.termId && !termIds.has(example.termId))) return [];
        return [{ ...example, readingId: targetReadingId }];
      })
    : input.recipe.analysisExamples.map((example) => ({ ...example }));
  counts.analysisExamples = Math.max(0, analysisExamples.length - input.recipe.analysisExamples.length);

  const lessonIds = new Set(lessonOrder);
  const placements = input.recipe.placements.length === 0
    ? plan.recipe.placements.flatMap((placement) => {
        if (!lessonIds.has(placement.targetLesson) || placement.readingIds.some((readingId) => !readingIdMap.has(readingId))) return [];
        const questionRefs = placement.questionRefs.flatMap((questionRef) => {
          const remapped = remapQuestionRef(questionRef, readingIdMap);
          return remapped ? [remapped] : [];
        });
        if (questionRefs.length !== placement.questionRefs.length) return [];
        return [{
          ...placement,
          readingIds: placement.readingIds.map((readingId) => readingIdMap.get(readingId)!),
          questionRefs
        }];
      })
    : input.recipe.placements.map((placement) => ({
        ...placement,
        readingIds: [...placement.readingIds],
        questionRefs: [...placement.questionRefs]
      }));
  counts.placements = Math.max(0, placements.length - input.recipe.placements.length);

  const donorHub = plan.recipe.fictionElementsHub;
  const hubLessons = donorHub
    ? [donorHub.hubLesson, donorHub.contextLesson, ...donorHub.childLessons].filter((lesson): lesson is string => Boolean(lesson))
    : [];
  const inheritHub = !input.recipe.fictionElementsHub
    && Boolean(donorHub)
    && hubLessons.every((lesson) => lessonIds.has(lesson));
  const fictionElementsHub = inheritHub
    ? { ...donorHub!, childLessons: [...donorHub!.childLessons] }
    : input.recipe.fictionElementsHub
      ? { ...input.recipe.fictionElementsHub, childLessons: [...input.recipe.fictionElementsHub.childLessons] }
      : undefined;
  counts.fictionElementsHub = inheritHub;

  const hydrated = parseEnglishUnitRecipe({
    ...input.recipe,
    lessonOrder,
    topLevelLessonOrder,
    lessonGroups,
    readings,
    placements,
    analysisTerms,
    analysisExamples,
    fictionElementsHub
  });
  if (hydrated.schemaVersion !== 3) throw new Error("V3 donor data hydration produced a non-V3 recipe.");
  return { recipe: hydrated, source, matchedReadings, inherited: counts };
}

async function copyImportedAsset(input: {
  sourceRoot: string;
  sourceFile: string;
  src: string;
  workspaceDir: string;
  donorSlug: string;
  lessonTitle: string;
}) {
  const decoded = decodeURIComponent(input.src.split(/[?#]/)[0] ?? input.src);
  const sourcePath = path.resolve(path.dirname(input.sourceFile), decoded);
  if (!sourcePath.startsWith(`${path.resolve(input.sourceRoot)}${path.sep}`) || !(await isFile(sourcePath))) return undefined;
  const href = path.posix.join(
    "assets",
    "generated",
    "donor-lessons",
    safeId(input.donorSlug),
    `${safeId(input.lessonTitle)}-${safeFileName(path.basename(sourcePath))}`
  );
  const targetPath = path.join(input.workspaceDir, ...href.split("/"));
  await mkdir(path.dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);
  return href;
}

async function loadImportedHtmlLessons(input: {
  plan: ImportedHtmlPlan;
  target: EnglishUnitRecipeV3;
  workspaceDir: string;
  reportItems: EnglishBuildReportItem[];
}) {
  const lessons: EnglishBuiltLesson[] = [];
  const missing: string[] = [];
  const learnerSourceNamespace = safeId(
    input.plan.resolvedProjectSlug.replace(/^ela(?:10|20|30)-1-?/i, "")
  ) || "donor";
  for (const [index, sourceLesson] of input.plan.lessons.entries()) {
    const sourceFile = path.join(input.plan.sourcePath, sourceLesson.file);
    if (!(await isFile(sourceFile))) {
      missing.push(`${input.plan.requestedProjectSlug}: imported lesson source is missing: ${sourceFile}`);
      continue;
    }
    if (sourceLesson.kind === "document") {
      const href = path.posix.join(
        "assets",
        "generated",
        "donor-lessons",
        learnerSourceNamespace,
        `${safeId(sourceLesson.title)}-${safeFileName(path.basename(sourceFile))}`
      );
      const targetPath = path.join(input.workspaceDir, ...href.split("/"));
      await mkdir(path.dirname(targetPath), { recursive: true });
      await copyFile(sourceFile, targetPath);
      const title = normalizeTargetLessonValue(sourceLesson.title, input.target);
      lessons.push({
        id: `lesson-${index + 1}-${safeId(title)}`,
        title,
        sourceHref: `imported-source://${learnerSourceNamespace}/${sourceLesson.file}`,
        html: `<p><a class="source-link" href="${href}" target="_blank" rel="noopener noreferrer">Open ${title}</a></p>
<iframe class="source-document-frame" src="${href}" title="${title}"></iframe>`,
        text: title,
        supportingResources: [{
          id: safeId(`${title}-document`),
          title,
          href,
          kind: "local",
          lessonTitle: title
        }]
      });
      input.reportItems.push({
        role: "lesson",
        source: sourceFile,
        status: "placed",
        destination: title,
        note: "Reused the approved donor lesson document in the derived lesson sequence."
      });
      continue;
    }
    const $ = cheerio.load(await readFile(sourceFile, "utf8"));
    $("script, style, link, meta, noscript, #header, #footer, nav, form, button").remove();
    const body = $("body");
    body.find("h1").first().remove();
    const supportingResources: EnglishSupportingResource[] = [];

    for (const element of body.find("img, audio[src], video[src], source[src]").toArray()) {
      const asset = $(element);
      const src = asset.attr("src")?.trim() ?? "";
      if (!src || /^data:/i.test(src)) continue;
      if (/^https?:/i.test(src)) {
        asset.remove();
        continue;
      }
      const href = await copyImportedAsset({
        sourceRoot: input.plan.sourcePath,
        sourceFile,
        src,
        workspaceDir: input.workspaceDir,
        donorSlug: learnerSourceNamespace,
        lessonTitle: sourceLesson.title
      });
      if (!href) {
        asset.remove();
        input.reportItems.push({
          role: "supporting-resource",
          source: `${sourceLesson.file}:${src}`,
          status: "corrected",
          destination: sourceLesson.title,
          note: "Removed a missing imported-source media asset so the derived learner lesson has no broken media."
        });
        continue;
      }
      asset.attr("src", href);
      if (element.tagName === "img") {
        asset.removeAttr("width").removeAttr("height");
        if (!asset.attr("alt")?.trim()) asset.attr("alt", `${sourceLesson.title} instructional visual`);
      }
    }

    body.find("a[href]").each((_, element) => {
      const anchor = $(element);
      const href = anchor.attr("href")?.trim() ?? "";
      if (!/^https?:/i.test(href) || !input.target.mediaPolicy.approvedExternalUrls.includes(href)) {
        anchor.replaceWith(anchor.contents());
        return;
      }
      anchor.attr("target", "_blank").attr("rel", "noopener noreferrer");
      supportingResources.push({
        id: safeId(`${sourceLesson.title}-${href}`),
        title: anchor.text().replace(/\s+/g, " ").trim() || href,
        href,
        kind: "external",
        lessonTitle: sourceLesson.title
      });
    });

    body.find("p").filter((_, element) => /necessary for you to purchase a copy of the play/i.test($(element).text())).each((_, element) => {
      $(element).html("Use the class-provided or school-authorized copy of <em>A Streetcar Named Desire</em> while completing this unit.");
    });
    body.find("p, li").each((_, element) => {
      const node = $(element);
      const text = node.text().replace(/\s+/g, " ").trim();
      if (/CBe-learn|Calgary Board of Education/i.test(text)) node.remove();
      if (/continue to the next page|submit (?:this|your)|dropbox|email your instructor/i.test(text)) node.remove();
    });
    body.find("p, h2, h3, h4, li").each((_, element) => {
      const node = $(element);
      if (!node.text().replace(/\s+/g, " ").trim() && !node.find("img, video, audio, iframe, object, a[href]").length) node.remove();
    });

    const html = body.html() ?? "";
    const text = body.text().replace(/\s+/g, " ").trim();
    lessons.push({
      id: `lesson-${index + 1}-${safeId(sourceLesson.title)}`,
      title: sourceLesson.title,
      sourceHref: `imported-source://${learnerSourceNamespace}/${sourceLesson.file}`,
      html,
      text,
      supportingResources
    });
    input.reportItems.push({
      role: "lesson",
      source: sourceFile,
      status: "placed",
      destination: sourceLesson.title,
      note: "Derived from the imported instructional source HTML; donor workspace HTML was not read."
    });
  }

  if (missing.length > 0) {
    throw new EnglishDonorLessonResolutionError("The imported HTML donor source is incomplete.", missing);
  }
  return lessons;
}

async function loadPlan(input: {
  plan: EnglishDonorLessonPlan;
  target: EnglishUnitRecipeV3;
  workspaceDir: string;
  reportItems: EnglishBuildReportItem[];
}) {
  if (input.plan.kind === "imported-source-html") {
    const lessons = await loadImportedHtmlLessons({
      plan: input.plan,
      target: input.target,
      workspaceDir: input.workspaceDir,
      reportItems: input.reportItems
    });
    return normalizeEnglishV3ResolvedLessons(lessons, input.target);
  }
  if (!(await isFile(input.plan.sourcePath))) {
    throw new EnglishDonorLessonResolutionError(
      `Donor source file is missing: ${input.plan.sourcePath}`,
      [`${input.plan.requestedProjectSlug}: source file is missing: ${input.plan.sourcePath}`]
    );
  }
  const zip = await JSZip.loadAsync(await readFile(input.plan.sourcePath));
  if (input.plan.kind === "recipe-v1") {
    const loaded = await loadBrightspaceUnit({
      zip,
      workspaceDir: input.workspaceDir,
      recipe: loaderRecipeForV1({ target: input.target, donor: input.plan.recipe }),
      reportItems: input.reportItems
    });
    return normalizeEnglishV3ResolvedLessons(
      applyLegacyDonorLessonPresentation(loaded.lessons, input.plan.requestedProjectSlug),
      input.target
    );
  }

  const selectors = input.plan.kind === "legacy-brightspace"
    ? input.plan.selectors
    : input.plan.recipe.source.lessonSelectors
      .filter((selector) => selector.disposition === "include")
      .map((selector) => ({ itemId: selector.itemId, title: selector.title }));
  const loaded = await loadBrightspaceLessonsByIds({
    zip,
    workspaceDir: input.workspaceDir,
    recipe: input.plan.kind === "legacy-brightspace"
      ? withoutV3WritingFields(input.target)
      : loaderRecipeForV2({ target: input.target, donor: input.plan.recipe }),
    selectors,
    reportItems: input.reportItems
  });
  return normalizeEnglishV3ResolvedLessons(
    applyLegacyDonorLessonPresentation(loaded.lessons, input.plan.requestedProjectSlug),
    input.target
  );
}

/**
 * Resolves every symbolic `donor:<project-slug>` selector to normalized lesson
 * data. The donor workspace is never consulted. Incomplete source plans throw
 * with explicit unresolved cases so a derived build cannot silently ship an
 * empty lesson frame.
 */
export async function resolveEnglishV3DonorLessons(input: {
  repoRoot: string;
  recipe: EnglishUnitRecipeV3;
  workspaceDir: string;
  reportItems: EnglishBuildReportItem[];
}): Promise<EnglishDonorLessonResolution> {
  const plans = await inspectEnglishV3DonorLessonPlans({ repoRoot: input.repoRoot, recipe: input.recipe });
  const lessons: EnglishBuiltLesson[] = [];
  const sources: EnglishDonorLessonSource[] = [];
  for (const plan of plans) {
    const resolved = await loadPlan({
      plan,
      target: input.recipe,
      workspaceDir: input.workspaceDir,
      reportItems: input.reportItems
    });
    if (resolved.length === 0) {
      throw new EnglishDonorLessonResolutionError(
        `Donor ${plan.requestedProjectSlug} resolved without any lessons.`,
        [`${plan.requestedProjectSlug}: the approved source plan produced zero lessons.`]
      );
    }
    lessons.push(...resolved);
    sources.push({
      requestedProjectSlug: plan.requestedProjectSlug,
      resolvedProjectSlug: plan.resolvedProjectSlug,
      kind: plan.kind,
      sourcePath: plan.sourcePath
    });
  }
  return {
    lessons: lessons.map((lesson, index) => ({ ...lesson, id: `lesson-${index + 1}-${safeId(lesson.title)}` })),
    sources,
    unresolvedCases: []
  };
}

export const englishV3DonorLessonInternals = {
  LEGACY_DONOR_ALIASES,
  LEGACY_DONOR_LESSON_TITLE_OVERRIDES,
  ELA30_SHORT_STORY_LESSONS,
  ELA30_SHORT_STORY_ELEMENTS_HUB,
  ELA30_SHORT_STORY_TOP_LEVEL_LESSONS,
  STREETCAR_SOURCE_LESSONS,
  replaceCourseIdentity,
  applyTargetWordingCorrections,
  normalizeTargetLessonValue,
  namespaceLessonHtmlIds
};
