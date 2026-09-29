import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Script } from "node:vm";

import * as cheerio from "cheerio";

import {
  resolveLearnerEvidenceScenarios,
  validateProjectContract,
  type ProjectE2EContract
} from "../e2e/lib/project-contract-schema.js";
import { parseEnglishCourseManifest, parseEnglishUnitRecipe } from "./lib/english-unit/schema.js";
import type {
  EnglishBuildReport,
  EnglishCourseManifestV1,
  EnglishUnitRecipeV2,
  EnglishUnitRecipeV3,
  EnglishWritingFormKind
} from "./lib/english-unit/types.js";

export type VerificationCheck = { id: string; status: "passed" | "warning" | "failed"; detail: string };
type UnitVerification = { projectSlug: string; activityProfile: string; checks: VerificationCheck[] };

type LegacyWorkspaceUnit = {
  projectSlug: string;
  unitTitle: string;
  activityProfile: string;
  profileVersion: string;
  reviewStatus: "needs-review" | "approved" | "ready-for-export";
};

type LegacyWorkspaceCourseManifest = {
  schemaVersion: 1;
  sourceMode: "legacy-workspace";
  courseId: string;
  courseCode: string;
  courseTitle: string;
  profileVersion: string;
  units: LegacyWorkspaceUnit[];
};

function parseArgs(argv: string[]) {
  const courseIndex = argv.indexOf("--course");
  const courseId = courseIndex >= 0 ? argv[courseIndex + 1] : undefined;
  if (!courseId) throw new Error("Usage: npm run verify:english-course -- --course ela20-1");
  const repoIndex = argv.indexOf("--repo-root");
  return { courseId, repoRoot: path.resolve(repoIndex >= 0 ? argv[repoIndex + 1] : process.cwd()) };
}

async function exists(filePath: string) {
  try { return (await stat(filePath)).isFile(); } catch { return false; }
}

async function sha256File(filePath: string) {
  const digest = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) digest.update(chunk);
  return digest.digest("hex");
}

async function walkFiles(root: string, relative = ""): Promise<string[]> {
  const current = path.join(root, relative);
  let entries;
  try { entries = await readdir(current, { withFileTypes: true }); } catch { return []; }
  const files: string[] = [];
  for (const entry of entries) {
    const next = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(root, next));
    else if (entry.isFile()) files.push(next.replaceAll(path.sep, "/"));
  }
  return files;
}

function add(checks: VerificationCheck[], id: string, passed: boolean, detail: string, warning = false) {
  checks.push({ id, status: passed ? "passed" : warning ? "warning" : "failed", detail });
}

function writingNavigationRouteIds($: cheerio.CheerioAPI, groupId: string) {
  const familyTargets = $(`[data-ela-nav-subgroup='${groupId}'] [data-page-target]`);
  const targets = familyTargets.length
    ? familyTargets
    : $(`[data-nav-group='${groupId}'] #${groupId}-subnav [data-page-target]`);
  return targets.toArray().map((element) => $(element).attr("data-page-target") ?? "");
}

export function inspectWritingNavigationRoutes(html: string, groupId: string) {
  return writingNavigationRouteIds(cheerio.load(html), groupId);
}

function requiredText(value: unknown, label: string, manifestPath: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid legacy English manifest at ${manifestPath}: ${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function parseLegacyWorkspaceCourseManifest(
  raw: unknown,
  manifestPath = "legacy English family manifest"
): LegacyWorkspaceCourseManifest {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`Invalid legacy English manifest at ${manifestPath}: expected an object.`);
  }
  const candidate = raw as Record<string, unknown>;
  if (candidate.schemaVersion !== 1 || candidate.sourceMode !== "legacy-workspace") {
    throw new Error(
      `Invalid legacy English manifest at ${manifestPath}: schemaVersion must be 1 and sourceMode must be legacy-workspace.`
    );
  }
  if (!Array.isArray(candidate.units) || candidate.units.length === 0) {
    throw new Error(`Invalid legacy English manifest at ${manifestPath}: units must contain at least one project.`);
  }
  const reviewStatuses = new Set(["needs-review", "approved", "ready-for-export"]);
  const units = candidate.units.map((value, index): LegacyWorkspaceUnit => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`Invalid legacy English manifest at ${manifestPath}: units[${index}] must be an object.`);
    }
    const unit = value as Record<string, unknown>;
    const reviewStatus = requiredText(unit.reviewStatus, `units[${index}].reviewStatus`, manifestPath);
    if (!reviewStatuses.has(reviewStatus)) {
      throw new Error(
        `Invalid legacy English manifest at ${manifestPath}: units[${index}].reviewStatus is not supported.`
      );
    }
    return {
      projectSlug: requiredText(unit.projectSlug, `units[${index}].projectSlug`, manifestPath),
      unitTitle: requiredText(unit.unitTitle, `units[${index}].unitTitle`, manifestPath),
      activityProfile: requiredText(unit.activityProfile, `units[${index}].activityProfile`, manifestPath),
      profileVersion: requiredText(unit.profileVersion, `units[${index}].profileVersion`, manifestPath),
      reviewStatus: reviewStatus as LegacyWorkspaceUnit["reviewStatus"]
    };
  });
  const slugs = units.map((unit) => unit.projectSlug);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error(`Invalid legacy English manifest at ${manifestPath}: project slugs must be unique.`);
  }

  return {
    schemaVersion: 1,
    sourceMode: "legacy-workspace",
    courseId: requiredText(candidate.courseId, "courseId", manifestPath),
    courseCode: requiredText(candidate.courseCode, "courseCode", manifestPath),
    courseTitle: requiredText(candidate.courseTitle, "courseTitle", manifestPath),
    profileVersion: requiredText(candidate.profileVersion, "profileVersion", manifestPath),
    units
  };
}

function listSources(report: EnglishBuildReport, status: EnglishBuildReport["items"][number]["status"]) {
  return report.items
    .filter((item) => item.status === status)
    .slice(0, 6)
    .map((item) => item.source)
    .join(", ");
}

export function inspectMappingReport(raw: unknown): VerificationCheck[] {
  const checks: VerificationCheck[] = [];
  if (!raw || typeof raw !== "object") {
    add(checks, "mapping-report", false, "English unit mapping report is missing or invalid.");
    return checks;
  }
  const report = raw as Partial<EnglishBuildReport>;
  const statuses = ["placed", "excluded", "missing", "duplicate", "corrected", "failed"] as const;
  const hasSummary = Boolean(report.summary && statuses.every((status) => Number.isInteger(report.summary?.[status]) && (report.summary?.[status] ?? -1) >= 0));
  const hasItems = Array.isArray(report.items);
  add(checks, "mapping-report", hasSummary && hasItems, hasSummary && hasItems
    ? "Mapping report has a complete disposition summary. Intentional exclusions remain separate from missing and failed resources."
    : "Mapping report lacks a complete disposition summary or item list.");
  if (!hasSummary || !hasItems) return checks;

  const typed = report as EnglishBuildReport;
  const inconsistent = statuses.filter((status) => typed.items.filter((item) => item.status === status).length !== typed.summary[status]);
  add(checks, "mapping-summary", inconsistent.length === 0, inconsistent.length
    ? `Mapping summary does not match item dispositions for: ${inconsistent.join(", ")}.`
    : "Mapping summary counts match the item dispositions.");

  add(checks, "mapping-missing", typed.summary.missing === 0, typed.summary.missing
    ? `${typed.summary.missing} source resource(s) are missing: ${listSources(typed, "missing")}`
    : "No source resources are classified as missing.");
  const learnerFailures = typed.items.filter((item) => item.status === "failed" && Boolean(item.destination?.trim()));
  add(checks, "mapping-failed", learnerFailures.length === 0, learnerFailures.length
    ? `${learnerFailures.length} learner-placed resource(s) failed validation or live-link checks: ${learnerFailures.slice(0, 6).map((item) => item.source).join(", ")}`
    : typed.summary.failed
      ? `${typed.summary.failed} archival source link(s) failed intake validation, but none are placed on a learner surface; canonical local-link verification remains authoritative.`
      : "No source resources failed validation or live-link checks.", learnerFailures.length === 0 && typed.summary.failed > 0);
  return checks;
}

export function inspectE2EContractDepth(contract: ProjectE2EContract): VerificationCheck {
  const learnerCourse = contract.learnerCourse?.enabled ? contract.learnerCourse : undefined;
  const evidenceScenarioCount = learnerCourse ? resolveLearnerEvidenceScenarios(learnerCourse).length : 0;
  const learnerTargets = learnerCourse
    ? learnerCourse.routes.length
      + learnerCourse.hintRoutes.length
      + learnerCourse.printRoutes.length
      + learnerCourse.resourceChecks.length
      + learnerCourse.mobile.routes.length
      + evidenceScenarioCount
    : 0;
  const deepTargets = (contract.modulePassTargets?.length ?? 0) + (contract.visibilityChecks?.length ?? 0) + learnerTargets;
  const enabledBehaviors = [
    contract.modes?.enabled,
    contract.navigation?.enabled,
    contract.quiz?.enabled,
    contract.moduleAssignments?.enabled,
    learnerCourse?.enabled
  ].filter(Boolean).length;
  const assertionProfiles = Object.keys(contract.assertionProfiles ?? {}).length;
  const passed = deepTargets > 0 && (enabledBehaviors > 0 || assertionProfiles > 0);
  return {
    id: "e2e-contract-depth",
    status: passed ? "passed" : "failed",
    detail: passed
      ? `E2E contract defines ${deepTargets} deep target(s), ${assertionProfiles} assertion profile(s), and ${enabledBehaviors} enabled behavior area(s).${learnerCourse ? ` Learner-course coverage includes ${learnerCourse.routes.length} routes, ${evidenceScenarioCount} Evidence Bank persistence scenario(s), ${learnerCourse.resourceChecks.length} reader/media check(s), and ${learnerCourse.mobile.routes.length} mobile route(s).` : ""}`
      : "E2E contract is only a platform-shell smoke contract; add activity/navigation targets and behavioral assertions for this unit."
  };
}

function visibleLearnerText(html: string) {
  const $ = cheerio.load(html);
  $("script, style, template, noscript").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

function matchingLabels(text: string, patterns: Array<{ label: string; pattern: RegExp }>) {
  return patterns.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label);
}

export function inspectLearnerHtml(
  html: string,
  requiredResourceRoutes: string[] = [],
  options: { allowThirtyTwoDiplomaConnection?: boolean } = {}
): VerificationCheck[] {
  const checks: VerificationCheck[] = [];
  const $ = cheerio.load(html);
  const learnerText = visibleLearnerText(html);
  const safetyContamination = matchingLabels(learnerText, [
    { label: "soft/hard gate", pattern: /\b(?:soft|hard)[ _-]*gate\b/iu },
    { label: "Math content", pattern: /\b(?:factors_and_products|trigonometry)\b/iu }
  ]);
  add(checks, "safety-contamination", safetyContamination.length === 0, safetyContamination.length
    ? `Learner text contains excluded content markers: ${safetyContamination.join(", ")}.`
    : "No gate or Math contamination appears in learner-visible text.");

  const gradeExamPatterns = [
    { label: "ELA/English 30-1", pattern: /\b(?:ELA|English(?:\s+Language\s+Arts)?)\s*30\s*[-\u2010-\u2015]\s*1\b/iu },
    { label: "Part A", pattern: /\b(?:Part|PART)\s+A(?:\s*\(Written\))?\b/u },
    ...(!options.allowThirtyTwoDiplomaConnection
      ? [
          { label: "Diploma", pattern: /\bDiploma(?:\s+(?:Exam|Examination))?\b/iu },
          { label: "exam", pattern: /\bexam\b/iu }
        ]
      : [])
  ];
  const gradeExamContamination = matchingLabels(learnerText, gradeExamPatterns);
  add(checks, "grade-exam-contamination", gradeExamContamination.length === 0, gradeExamContamination.length
    ? `Learner text contains grade/exam contamination: ${gradeExamContamination.join(", ")}.`
    : options.allowThirtyTwoDiplomaConnection
      ? "No ELA 30-1 or Part A wording appears in learner-visible text; the concise ELA 30-2 Diploma connection is permitted."
      : "No ELA 30-1, Diploma, Part A, or exam wording appears in learner-visible text.");

  const lmsDeliveryContamination = matchingLabels(learnerText, [
    { label: "Brightspace/D2L learner wording", pattern: /\b(?:Brightspace|D2L)\b/iu },
    { label: "orphaned new-window boilerplate", pattern: /this link opens in a new (?:window|tab)(?:\/tab)?/iu },
    { label: "external assignment direction", pattern: /(?:access the assignment prior|open the following google doc|complete the assignment)/iu },
    { label: "resubmission warning", pattern: /re-submit your work in the proper format/iu },
    { label: "orphaned click direction", pattern: /click (?:on )?(?:the )?link to (?:watch|read)/iu },
    { label: "missing next-page assignment", pattern: /provided on the next page|part of your unit 2 assignment/iu },
    { label: "missing copy-template direction", pattern: /make a copy of (?:this template|the printable version) by clicking|For a printable version, you can make a copy by clicking/iu },
    { label: "wrong-course printable reference", pattern: /ELA\s*10\s*[-\u2010-\u2015]\s*2\s+U4\s+Reading Comprehension Review/iu }
  ]);
  add(checks, "lms-delivery-copy", lmsDeliveryContamination.length === 0, lmsDeliveryContamination.length
    ? `Learner text contains inherited LMS delivery language: ${lmsDeliveryContamination.join(", ")}.`
    : "No Brightspace-only delivery directions or orphaned LMS link instructions appear in learner text.");

  const normalizedLearnerText = learnerText.toLocaleLowerCase("en-CA");
  const studentSamples = (normalizedLearnerText.includes("student samples")
    || /samples?\s+of\s+student(?:'s|s')?\s+writing/iu.test(learnerText))
    && !/Using Response Models/iu.test(learnerText);
  add(checks, "student-samples-review", !studentSamples, studentSamples
    ? "Learner text contains a Student Samples surface; confirm it is ELA 20-1-specific, populated, and current."
    : "No inherited Student Samples surface requires review.", true);

  const images = $("img").toArray();
  const missingAlt = images.filter((image) => $(image).attr("alt") === undefined);
  const emptyAlt = images.filter((image) => $(image).attr("alt") !== undefined && !($(image).attr("alt") ?? "").trim());
  const altIssues = missingAlt.length + emptyAlt.length;
  add(checks, "image-alt-text", altIssues === 0, altIssues
    ? `${missingAlt.length} image(s) are missing alt attributes and ${emptyAlt.length} image(s) have empty alt text; review decorative intent or supply meaningful alternatives.`
    : `All ${images.length} learner images have non-empty alt text.`, true);

  const emptyRoutes = [...new Set(requiredResourceRoutes)].filter((route) => {
    const surface = $(`[id="${route.replaceAll('"', '\\"')}"]`);
    if (surface.length !== 1) return true;
    return surface.find("a[href], button, input, textarea, select, iframe[src], embed[src], object[data], img[src], [data-library-doc-panel], [data-english-activity-panel], [data-question-panel], .english-factory-resource-card, .english-material-access-note").length === 0;
  });
  add(checks, "required-resource-surfaces", emptyRoutes.length === 0, emptyRoutes.length
    ? `Required resource surface(s) are absent or empty: ${emptyRoutes.join(", ")}.`
    : requiredResourceRoutes.length
      ? `Required resource surfaces contain learner-usable materials or truthful access guidance: ${[...new Set(requiredResourceRoutes)].join(", ")}.`
      : "No required resource surfaces are declared for this profile.");
  return checks;
}

const writingRoutesByKind: Record<EnglishWritingFormKind, readonly string[]> = {
  "critical-essay": [
    "critical-essay",
    "critical-essay-topic-interpretation",
    "critical-essay-introduction",
    "critical-essay-body-one",
    "critical-essay-body-two",
    "critical-essay-body-three",
    "critical-essay-conclusion-revision",
    "critical-essay-preview"
  ],
  "literary-exploration": [
    "literary-exploration",
    "literary-exploration-prompt-controlling-idea",
    "literary-exploration-introduction-thesis",
    "literary-exploration-body-assigned-text",
    "literary-exploration-body-studied-work",
    "literary-exploration-body-personal-connection",
    "literary-exploration-conclusion-revision",
    "literary-exploration-preview"
  ],
  "personal-response": [
    "personal-response",
    "personal-response-prompt-impression",
    "personal-response-text-evidence",
    "personal-response-knowledge-experience",
    "personal-response-form-perspective",
    "personal-response-response-plan",
    "personal-response-draft-revise",
    "personal-response-preview"
  ],
  "visual-response": [
    "visual-response",
    "visual-response-observe",
    "visual-response-paces",
    "visual-response-central-idea",
    "visual-response-prose-form",
    "visual-response-draft",
    "visual-response-conclusion-revision",
    "visual-response-preview"
  ]
};

function normalizedEnglishCourseCode(value: string) {
  return value.toUpperCase().replace(/\s+/g, "");
}

function routeTargetsInGroup($: cheerio.CheerioAPI, kind: EnglishWritingFormKind) {
  const familyTargets = $(`[data-ela-nav-subgroup="${kind}"] [data-page-target]`);
  const targets = familyTargets.length
    ? familyTargets
    : $(`[data-nav-group="${kind}"] [data-page-target]`).not("[data-nav-group-toggle]");
  return targets.toArray()
    .map((element) => $(element).attr("data-page-target") ?? "")
    .filter(Boolean);
}

/**
 * Recipe V3 makes writing forms authoritative. This audit intentionally reads
 * both the route DOM and the raw learner HTML so an unselected form cannot
 * survive as a hidden page, runtime selector, style hook, or storage key.
 */
export function inspectV3WritingFormOutput(
  html: string,
  recipe: Pick<EnglishUnitRecipeV3, "courseCode" | "writingForms">
): VerificationCheck[] {
  const checks: VerificationCheck[] = [];
  const $ = cheerio.load(html);
  const configuredKinds = recipe.writingForms.map((form) => form.kind);
  const configuredRoutes = recipe.writingForms.flatMap((form) => writingRoutesByKind[form.kind]);
  const unconfiguredKinds = (Object.keys(writingRoutesByKind) as EnglishWritingFormKind[])
    .filter((kind) => !configuredKinds.includes(kind));

  const missingPages = configuredRoutes.filter((route) => $(`[id="${route}"]`).length !== 1);
  add(
    checks,
    "v3-writing-routes",
    missingPages.length === 0,
    missingPages.length
      ? `Configured writing route(s) are missing or duplicated: ${missingPages.join(", ")}.`
      : `All ${configuredRoutes.length} configured writing routes are present exactly once.`
  );

  const navigationProblems = recipe.writingForms.flatMap((form) => {
    const expected = [...writingRoutesByKind[form.kind]];
    const actual = routeTargetsInGroup($, form.kind);
    return expected.length === actual.length && expected.every((route, index) => actual[index] === route)
      ? []
      : [`${form.kind}: expected ${expected.join(" -> ")}; found ${actual.join(" -> ") || "no routes"}`];
  });
  add(
    checks,
    "v3-writing-route-order",
    navigationProblems.length === 0,
    navigationProblems.length
      ? `Writing navigation is incomplete or out of order: ${navigationProblems.join(" | ")}.`
      : `Each configured writing form exposes its Guide, six lessons, and Preview in the required order.`
  );

  const allWritingRoutes = new Set(Object.values(writingRoutesByKind).flat());
  const actualPageOrder = $("[id]").toArray()
    .map((element) => $(element).attr("id") ?? "")
    .filter((id) => allWritingRoutes.has(id));
  add(
    checks,
    "v3-writing-page-order",
    actualPageOrder.length === configuredRoutes.length
      && actualPageOrder.every((route, index) => route === configuredRoutes[index]),
    actualPageOrder.length === configuredRoutes.length
      && actualPageOrder.every((route, index) => route === configuredRoutes[index])
      ? `Writing route sections appear in recipe order: ${configuredKinds.join(" -> ")}.`
      : `Writing route section order does not match the recipe. Expected ${configuredRoutes.join(" -> ")}; found ${actualPageOrder.join(" -> ") || "none"}.`
  );

  const familyWritingGroups = $("[data-ela-nav-subgroup]");
  const actualWritingGroups = (familyWritingGroups.length ? familyWritingGroups : $("[data-nav-group]")).toArray()
    .map((element) => familyWritingGroups.length
      ? $(element).attr("data-ela-nav-subgroup") ?? ""
      : $(element).attr("data-nav-group") ?? "")
    .filter((group): group is EnglishWritingFormKind => group in writingRoutesByKind);
  add(
    checks,
    "v3-writing-form-order",
    actualWritingGroups.length === configuredKinds.length
      && actualWritingGroups.every((kind, index) => kind === configuredKinds[index]),
    actualWritingGroups.length === configuredKinds.length
      && actualWritingGroups.every((kind, index) => kind === configuredKinds[index])
      ? `Writing forms appear in recipe order: ${configuredKinds.join(" -> ")}.`
      : `Writing-form navigation does not match the recipe. Expected ${configuredKinds.join(" -> ")}; found ${actualWritingGroups.join(" -> ") || "none"}.`
  );

  const leakedRoutes = unconfiguredKinds.flatMap((kind) => writingRoutesByKind[kind]
    .filter((route) => $(`[id="${route}"], [data-page-target="${route}"]`).length > 0));
  add(
    checks,
    "v3-unselected-writing-forms",
    leakedRoutes.length === 0,
    leakedRoutes.length
      ? `Unselected writing routes remain in learner DOM or navigation: ${leakedRoutes.join(", ")}.`
      : "No unselected writing-form route remains in the learner DOM or navigation."
  );

  const isMinusTwo = /(?:10|20|30)-2$/u.test(normalizedEnglishCourseCode(recipe.courseCode));
  const isThirtyTwo = /30-2$/u.test(normalizedEnglishCourseCode(recipe.courseCode));
  const criticalEssayTokens = html.match(/critical(?:[\s_-]*essay|Essay)/giu) ?? [];
  add(
    checks,
    "v3-no-critical-essay",
    !isMinusTwo || criticalEssayTokens.length === 0,
    !isMinusTwo || criticalEssayTokens.length === 0
      ? "No Critical Essay page, navigation, hidden DOM, runtime selector, or storage token appears in the -2 learner artifact."
      : `Critical Essay leaked into the -2 learner artifact ${criticalEssayTokens.length} time(s).`
  );

  const visualTokens = html.match(/visual(?:[\s_-]*response|Response)/giu) ?? [];
  const visualConfigured = configuredKinds.includes("visual-response");
  const visualPolicyPassed = isThirtyTwo
    ? visualConfigured && visualTokens.length > 0
    : !visualConfigured && visualTokens.length === 0;
  add(
    checks,
    "v3-visual-response-scope",
    visualPolicyPassed,
    visualPolicyPassed
      ? isThirtyTwo
        ? "Visual Response is configured and rendered for ELA 30-2."
        : "Visual Response is absent outside ELA 30-2."
      : isThirtyTwo
        ? "ELA 30-2 is missing its configured Visual Response learner system."
        : "Visual Response leaked into a course outside ELA 30-2."
  );

  const learnerText = visibleLearnerText(html);
  const donorCodes = matchingLabels(learnerText, [
    { label: "ELA/English 10-1", pattern: /\b(?:ELA|English(?:\s+Language\s+Arts)?)\s*10\s*[-\u2010-\u2015]\s*1\b/iu },
    { label: "ELA/English 20-1", pattern: /\b(?:ELA|English(?:\s+Language\s+Arts)?)\s*20\s*[-\u2010-\u2015]\s*1\b/iu },
    { label: "ELA/English 30-1", pattern: /\b(?:ELA|English(?:\s+Language\s+Arts)?)\s*30\s*[-\u2010-\u2015]\s*1\b/iu }
  ]);
  add(
    checks,
    "v3-donor-course-codes",
    donorCodes.length === 0,
    donorCodes.length
      ? `Learner-visible copy contains donor course code(s): ${donorCodes.join(", ")}.`
      : "No -1 donor course code appears in learner-visible copy."
  );

  return checks;
}

export function inspectV3MaterialsOutput(
  html: string,
  recipe: Pick<EnglishUnitRecipeV3, "activityProfile" | "resourceDispositions">
): VerificationCheck[] {
  const checks: VerificationCheck[] = [];
  const $ = cheerio.load(html);
  const configuredMaterialRoutes = recipe.activityProfile.activities
    .filter((activity) => activity.enabled && /\b(?:materials?|resources?)\b/iu.test(`${activity.id} ${activity.title} ${activity.route}`))
    .map((activity) => activity.route);
  const materialRoutes = [...new Set(configuredMaterialRoutes.length ? configuredMaterialRoutes : ["materials"])]
    .filter((route) => $(`[id="${route}"]`).length > 0);
  const packagedResources = recipe.resourceDispositions.filter((resource) =>
    (resource.disposition === "place" || resource.disposition === "review-required")
    && !/^https?:\/\//iu.test(resource.source)
  );
  const usableMaterialControls = materialRoutes.reduce((total, route) => total + $(`[id="${route}"]`)
    .find("a[href], button, iframe[src], embed[src], object[data], [data-library-doc-panel], .english-factory-resource-card")
    .length, 0);
  add(
    checks,
    "v3-materials-route",
    materialRoutes.length === 1 && (packagedResources.length === 0 || usableMaterialControls > 0),
    materialRoutes.length !== 1
      ? `Expected one canonical Materials or Resources route; found ${materialRoutes.length ? materialRoutes.join(", ") : "none"}.`
      : packagedResources.length > 0 && usableMaterialControls === 0
        ? `#${materialRoutes[0]} exists but does not expose the ${packagedResources.length} packaged resource(s) declared for learner placement or review.`
        : `Canonical resource route #${materialRoutes[0]} is present${packagedResources.length ? ` with learner-usable controls for packaged course documents` : ""}.`
  );

  const resources = $("#resources");
  const resourceLinks = resources.find("a[href]").toArray();
  const localResourceLinks = resourceLinks
    .map((element) => $(element).attr("href") ?? "")
    .filter((href) => Boolean(localReference(href)));
  const resourcesIsCanonical = configuredMaterialRoutes.includes("resources")
    && !configuredMaterialRoutes.includes("materials");
  add(
    checks,
    "v3-optional-resources-route",
    resourcesIsCanonical
      ? resources.length === 1 && usableMaterialControls > 0
      : resources.length <= 1
        && (resources.length === 0 || (resourceLinks.length > 0 && localResourceLinks.length === 0)),
    resourcesIsCanonical
      ? resources.length !== 1
        ? `Expected one canonical Resources route; found ${resources.length}.`
        : usableMaterialControls === 0
          ? "Canonical Resources is present but contains no learner-usable controls."
          : `Canonical Resources contains learner-usable controls${localResourceLinks.length ? `, including ${localResourceLinks.length} packaged/local link(s)` : ""}.`
      : resources.length === 0
        ? "Optional Resources route is omitted because this unit does not expose supplemental links there."
        : resources.length > 1
          ? "Resources route is duplicated."
          : resourceLinks.length === 0
            ? "Resources is present but contains no learner-usable supplemental links."
            : localResourceLinks.length
              ? `Resources contains ${localResourceLinks.length} packaged/local document link(s); move course documents to Materials.`
              : "Optional Resources contains supplemental external links; packaged documents remain in Materials."
  );
  return checks;
}

export function inspectEla10CourseVoice(html: string): VerificationCheck {
  const learnerText = visibleLearnerText(html);
  const sourceLanguage = matchingLabels(learnerText, [
    { label: "CBE/SPO learner wording", pattern: /\b(?:CBE|SPO)\b/iu },
    { label: "teacher-selected/supplied provenance", pattern: /\bteacher-(?:selected|supplied|provided)\b/iu },
    { label: "teacher assignment logistics", pattern: /\b(?:assigned by your teacher|your teacher will identify|teacher or school access required|teacher resource)\b/iu },
    { label: "conversion resource labels", pattern: /\b(?:source resources|recovered unit documents|source lesson|original teacher-selected unit material)\b/iu },
    { label: "exclusion report copy", pattern: /\bexcluded assessments?\b|\bunrelated folders?\b/iu },
    { label: "profile provenance", pattern: /\bprofile-supplied\b/iu }
  ]);
  return {
    id: "ela10-course-voice",
    status: sourceLanguage.length ? "failed" : "passed",
    detail: sourceLanguage.length
      ? `ELA 10-1 learner text contains source or conversion language: ${sourceLanguage.join(", ")}.`
      : "ELA 10-1 learner text uses course-facing language and keeps source provenance in metadata only."
  };
}

function localReference(value: string) {
  const withoutFragment = value.split("#", 1)[0].split("?", 1)[0];
  if (!withoutFragment || /^(?:https?:|data:|mailto:|tel:|javascript:|#)/i.test(value)) return undefined;
  return decodeURIComponent(withoutFragment);
}

type LegacyEvidenceRuntimeAdapter = {
  id: string;
  kind: string;
  route: string;
  collectionIdTemplate: string;
  activeSelector?: string;
};

type LegacyEvidenceRuntimeConfig = {
  projectSlug: string;
  adapters: LegacyEvidenceRuntimeAdapter[];
};

function readLegacyEvidenceRuntimeConfig(html: string): LegacyEvidenceRuntimeConfig | undefined {
  const match = html.match(/const config = (\{[\s\S]*?\});\s*const fallbackStorage/u);
  if (!match) return undefined;
  try {
    const raw = JSON.parse(match[1]) as Record<string, unknown>;
    if (typeof raw.projectSlug !== "string" || !Array.isArray(raw.adapters)) return undefined;
    const adapters = raw.adapters.flatMap((value): LegacyEvidenceRuntimeAdapter[] => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return [];
      const candidate = value as Record<string, unknown>;
      if (
        typeof candidate.id !== "string"
        || typeof candidate.kind !== "string"
        || typeof candidate.route !== "string"
        || typeof candidate.collectionIdTemplate !== "string"
      ) return [];
      return [{
        id: candidate.id,
        kind: candidate.kind,
        route: candidate.route,
        collectionIdTemplate: candidate.collectionIdTemplate,
        activeSelector: typeof candidate.activeSelector === "string" ? candidate.activeSelector : undefined
      }];
    });
    return { projectSlug: raw.projectSlug, adapters };
  } catch {
    return undefined;
  }
}

function matchesLegacyEvidenceTemplate(template: string, resolvedId: string) {
  const pattern = template
    .split(/\{(?:active|activeLabel|itemId)\}/u)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".+");
  return new RegExp(`^${pattern}$`, "u").test(resolvedId);
}

function runtimeActivatorMatches(
  adapter: LegacyEvidenceRuntimeAdapter | undefined,
  activateSelector: string | undefined
) {
  if (!activateSelector) return true;
  const activeSelector = adapter?.activeSelector;
  if (!activeSelector) return false;
  return activateSelector === activeSelector || activateSelector.startsWith(`${activeSelector} `);
}

function runtimeResponseExists(
  html: string,
  projectSlug: string,
  adapter: LegacyEvidenceRuntimeAdapter,
  responseId: string
) {
  return html.includes(responseId)
    || responseId.startsWith(`${projectSlug}:evidence-composer:${adapter.id}:`)
    || responseId === `${projectSlug}:evidence-picker:${adapter.id}`;
}

function legacyResponseSelector(responseId: string) {
  return [
    `[data-response-id="${responseId}"]`,
    `[data-worksheet-answer="${responseId}"]`,
    `[data-novel-question-answer="${responseId}"]`,
    `[data-film-question-answer="${responseId}"]`
  ].join(", ");
}

export function inspectLegacyEvidenceWorkspace(input: {
  html: string;
  projectSlug: string;
  contract: ProjectE2EContract;
}): VerificationCheck[] {
  const checks: VerificationCheck[] = [];
  const $ = cheerio.load(input.html);
  const learnerCourse = input.contract.learnerCourse?.enabled ? input.contract.learnerCourse : undefined;
  const runtimeConfig = readLegacyEvidenceRuntimeConfig(input.html);
  const runtimeScripts = $("script[data-ela30-evidence-retrofit-runtime]");
  const runtimeSyntaxErrors: string[] = [];
  runtimeScripts.each((index, element) => {
    try {
      new Script($(element).html() || "", {
        filename: `${input.projectSlug}-evidence-retrofit-${index + 1}.js`
      });
    } catch (error) {
      runtimeSyntaxErrors.push(error instanceof Error ? error.message : String(error));
    }
  });
  const hasRuntimeAdapterHooks = Boolean(runtimeConfig)
    && input.html.includes('data-evidence-retrofit-adapter="')
    && input.html.includes("data-save-response-collection")
    && input.html.includes("data-save-evidence-note")
    && input.html.includes("data-evidence-capture")
    && input.html.includes("data-evidence-contribution-id");

  add(
    checks,
    "complete-html",
    $("html").length === 1 && $("body").length === 1,
    "Legacy workspace index is a complete HTML document."
  );
  add(
    checks,
    "shared-shell",
    $(".course-sidebar").length === 1 && $(".course-topbar").length === 1,
    "Existing Next Step course shell remains present."
  );
  add(
    checks,
    "evidence-runtime-syntax",
    runtimeScripts.length === 0
      || (runtimeScripts.length === 1 && runtimeSyntaxErrors.length === 0 && Boolean(runtimeConfig)),
    runtimeScripts.length === 0
      ? "Evidence hooks are static; no injected retrofit runtime requires syntax validation."
      : runtimeSyntaxErrors.length
        ? `Injected Evidence Bank runtime does not parse: ${runtimeSyntaxErrors.join("; ")}`
        : runtimeConfig
          ? "Injected Evidence Bank runtime is unique and parses as JavaScript."
          : "Injected Evidence Bank runtime parses but its configuration cannot be read."
  );
  add(
    checks,
    "evidence-route",
    $("#evidence-bank").length === 1
      && $('.course-sidebar nav > [data-page-target="evidence-bank"]').length === 1,
    "Evidence Bank has one learner route and one primary course-navigation target."
  );

  const exposesApi = input.html.includes("window.nextStepEvidenceBank")
    && (input.html.includes("upsertEvidenceEntry") || /\bupsert\s*:/u.test(input.html))
    && (input.html.includes("removeEvidenceEntry") || /\bremove\s*:/u.test(input.html))
    && (input.html.includes("listEvidenceEntries") || /\blist\s*:/u.test(input.html));
  add(checks, "evidence-api", exposesApi, "Shared nextStepEvidenceBank upsert/remove/list API is embedded.");
  add(
    checks,
    "evidence-filters",
    $("#evidence-bank [data-evidence-bank-filter]").length === 4,
    "Central Evidence Bank exposes the four activity, work, locator, and type filters."
  );
  const expectedStorageKey = `canvas-helper:${input.projectSlug}:manual-evidence-notes`;
  add(
    checks,
    "evidence-storage-key",
    input.html.includes(expectedStorageKey),
    `Evidence entries use the project-scoped tracked storage key ${expectedStorageKey}.`
  );

  if (!learnerCourse) {
    add(checks, "evidence-scenarios", false, "The E2E contract does not enable learner-course evidence scenarios.");
    return checks;
  }

  const scenarios = resolveLearnerEvidenceScenarios(learnerCourse);
  const collectionCount = scenarios.filter((scenario) => scenario.kind !== "individual").length;
  const individualCount = scenarios.filter((scenario) => scenario.kind === "individual").length;
  add(
    checks,
    "evidence-scenarios",
    collectionCount > 0 && individualCount > 0,
    `E2E contract covers ${collectionCount} collection save path(s) and ${individualCount} individual save path(s).`
  );

  for (const [index, scenario] of scenarios.entries()) {
    const route = $(`section#${scenario.route}`);
    const hasStaticActivator = !scenario.activateSelector || route.find(scenario.activateSelector).length === 1;
    if (scenario.kind === "individual") {
      const capture = route.find(
        `[data-evidence-capture="${scenario.captureId}"][data-evidence-contribution-id="${scenario.contributionId}"]`
      );
      const hasStaticHooks = route.length === 1
        && hasStaticActivator
        && capture.length === 1
        && capture.find(legacyResponseSelector(scenario.responseId)).length === 1
        && capture.find("[data-save-evidence-note]").length === 1;
      const runtimeAdapter = runtimeConfig?.adapters.find((adapter) =>
        adapter.id === scenario.captureId
        && adapter.route === scenario.route
        && matchesLegacyEvidenceTemplate(adapter.collectionIdTemplate, scenario.contributionId)
      );
      const hasActivator = hasStaticActivator
        || runtimeActivatorMatches(runtimeAdapter, scenario.activateSelector)
        || Boolean(
          runtimeAdapter?.kind === "json-item"
          && scenario.activateSelector?.includes("data-evidence-json-item-select")
        );
      const hasSetupResponses = (scenario.setupResponses || []).every(
        (setup) => route.find(legacyResponseSelector(setup.responseId)).length === 1
      );
      const hasRuntimeHooks = route.length === 1
        && hasActivator
        && hasSetupResponses
        && hasRuntimeAdapterHooks
        && Boolean(runtimeAdapter)
        && (
          route.find(legacyResponseSelector(scenario.responseId)).length === 1
          || runtimeResponseExists(input.html, input.projectSlug, runtimeAdapter!, scenario.responseId)
        );
      const hasHooks = hasStaticHooks || hasRuntimeHooks;
      add(
        checks,
        `evidence-scenario-${index + 1}-individual-hooks`,
        hasHooks,
        `Individual scenario ${scenario.contributionId} has a stable ${hasStaticHooks ? "static" : "runtime-configured"} capture, response, and deliberate save hook on #${scenario.route}.`
      );
      continue;
    }
    const collection = route.find(`[data-evidence-collection-id="${scenario.collectionId}"]`);
    const hasStaticHooks = route.length === 1
      && hasStaticActivator
      && collection.length === 1
      && collection.find(legacyResponseSelector(scenario.responseId)).length === 1
      && collection.find("[data-save-response-collection]").length === 1;
    const runtimeAdapter = runtimeConfig?.adapters.find((adapter) =>
      adapter.route === scenario.route
      && matchesLegacyEvidenceTemplate(adapter.collectionIdTemplate, scenario.collectionId)
    );
    const hasRuntimeHooks = route.length === 1
      && (hasStaticActivator || runtimeActivatorMatches(runtimeAdapter, scenario.activateSelector))
      && hasRuntimeAdapterHooks
      && Boolean(runtimeAdapter)
      && (
        route.find(legacyResponseSelector(scenario.responseId)).length === 1
        || runtimeResponseExists(input.html, input.projectSlug, runtimeAdapter!, scenario.responseId)
      );
    const hasHooks = hasStaticHooks || hasRuntimeHooks;
    add(
      checks,
      `evidence-scenario-${index + 1}-collection-hooks`,
      hasHooks,
      `Collection scenario ${scenario.collectionId} has a stable ${hasStaticHooks ? "static" : "runtime-configured"} response and deliberate save hook on #${scenario.route}.`
    );
  }

  const saveActions = $("[data-save-evidence-note], [data-save-response-collection]").toArray();
  const runtimeActionsUseGreenStyle = hasRuntimeAdapterHooks
    && input.html.includes(".english-evidence-activity-actions [data-save-response-collection]")
    && input.html.includes(".english-evidence-activity-actions [data-save-evidence-note]")
    && input.html.includes("background: #154212");
  add(
    checks,
    "green-save-actions",
    saveActions.length > 0
      && saveActions.every((element) => $(element).hasClass("evidence-bank-save-action"))
      && (!runtimeConfig || runtimeActionsUseGreenStyle),
    "Every Evidence Bank save action uses the shared green action style."
  );
  return checks;
}

function ela10ProfileChecks(profile: string, $: cheerio.CheerioAPI, checks: VerificationCheck[]) {
  if (profile === "short-fiction") {
    add(checks, "short-fiction-routes", ["story-bank", "story-questions", "writing-studio", "evidence-bank", "resources"].every((id) => $(`#${id}`).length === 1), "ELA 10-1 Short Fiction routes are present.");
    add(checks, "short-fiction-readings", $("[data-library-doc-panel]").length === 5, "All five SPO-selected Short Stories texts are present in the learner bank.");
    return;
  }
  if (profile === "modern-drama") {
    add(checks, "modern-drama-routes", ["script-reader", "play-materials", "act-questions", "character-notes", "critical-essay", "evidence-bank", "resources"].every((id) => $(`#${id}`).length === 1), "Fences Script Reader, materials, questions, character notes, Critical Essay, Evidence Bank, and Resources routes are present.");
    add(checks, "modern-drama-script-scenes", $("#script-reader [data-english-activity-select] option").length === 9 && $("#script-reader [data-english-activity-panel]").length === 9, "The single-column Fences Script Reader contains all nine scenes: Act I Scenes 1-4 and Act II Scenes 1-5.");
    add(checks, "modern-drama-question-sets", $("#act-questions [data-question-panel]").length === 9, "Fences questions are organized as one complete collection for each of the play's nine scenes.");
    add(checks, "modern-drama-question-coverage", $("#act-questions [data-activity-response]").length === 21, "Twenty-one course questions cover all nine scenes.");
    add(checks, "modern-drama-course-question-groups", $("#act-questions [data-english-activity-panel='fences-1-act-i-scene-2'] [data-activity-response]").length === 3 && $("#act-questions [data-english-activity-panel='fences-2-act-ii-scene-4'] [data-activity-response]").length === 2, "Assigned question groups remain mapped to the Act I Scene 2 and Act II Scene 4 collections.");
    add(checks, "modern-drama-characters", $("#character-notes [data-english-activity-panel]").length === 6, "Six Fences character dossiers are present.");
    add(checks, "modern-drama-essay-navigation", writingNavigationRouteIds($, "critical-essay").length === 8, "Critical Essay navigation exposes the Guide, six writing lessons, and Preview in order.");
    return;
  }
  if (profile === "shakespeare-drama") {
    const foundationLessonIds = [
      "merchant-foundation-1-introduction",
      "merchant-foundation-2-life-times-themes",
      "merchant-foundation-3-understanding-shakespeare",
      "merchant-foundation-4-globe-theatre",
      "merchant-foundation-5-shakespeares-world",
      "merchant-foundation-6-literary-devices"
    ];
    const essayRoutes = [
      "critical-essay",
      "critical-essay-topic-thesis",
      "critical-essay-introduction",
      "critical-essay-body-1",
      "critical-essay-body-2",
      "critical-essay-body-3",
      "critical-essay-conclusion-revision",
      "critical-essay-preview"
    ];
    const requiredRoutes = ["side-by-side", "play-materials", "act-questions", "character-notes", "writing-studio", ...essayRoutes, "evidence-bank", "resources"];
    add(checks, "shakespeare-routes", requiredRoutes.every((id) => $(`#${id}`).length === 1), "Merchant of Venice includes the Side-by-Side Reader, activities, staged Critical Essay, Evidence Bank, and Resources routes.");
    add(checks, "shakespeare-foundation-lessons", foundationLessonIds.every((id) => $(`#${id}`).length === 1) && $(".lesson-detail-panel--ela30").length === 6, "Six consolidated Shakespeare foundation lessons use the established lesson presentation.");
    const lessonText = foundationLessonIds.map((id) => $(`#${id}`).text()).join(" ");
    add(checks, "shakespeare-foundation-copy", /Dramatic Script Terminology/i.test(lessonText) && /Soliloquy/i.test(lessonText) && !/\b(?:Othello|Romeo and Juliet|ELA 20-1|ELA 30-1)\b/i.test(lessonText), "Foundation lessons preserve drama terminology and reading guidance without alternate-play or grade contamination.");
    add(checks, "shakespeare-scenes", $("#side-by-side [data-english-activity-panel]").length === 20 && $("#side-by-side .parallel-reading-pair-row").length >= 600, "All 20 Merchant of Venice scenes and their locally stored original/companion passage pairs are present.");
    add(checks, "shakespeare-question-sets", $("#act-questions [data-question-panel]").length === 5, "All five Merchant of Venice act-question collections are present.");
    add(checks, "shakespeare-source-questions", $("#act-questions .scene-supplied-questions .worksheet-question").length === 86, "All 86 assigned Merchant of Venice questions are mapped into the five act collections.");
    add(checks, "shakespeare-characters", $("#character-notes [data-english-activity-panel]").length === 6, "Six Merchant of Venice character dossiers are present.");
    add(checks, "shakespeare-writing-tools", $("#writing-studio [data-english-activity-panel]").length === 5, "All five configured Merchant of Venice Writing Studio tools are present.");
    add(checks, "shakespeare-essay-navigation", writingNavigationRouteIds($, "critical-essay").length === 8, "Critical Essay navigation exposes the Guide, six writing lessons, and Preview in order.");
    const learnerText = $("#side-by-side, #play-materials, #act-questions, #character-notes, #writing-studio").text();
    add(checks, "shakespeare-learner-copy", !/needs[- ]editorial|editorial review|machine-normalized|final packaging|admin note/i.test(learnerText), "Editorial and administrative production notes are absent from learner-facing Merchant surfaces.");
    add(checks, "shakespeare-no-duplicate-question-pdf", !/MOV questions\.pdf/i.test($("#play-materials, #resources").text()), "The byte-identical duplicate question PDF is absent from learner materials and Resources.");
    return;
  }
  if (profile === "novel-study") {
    const essayRoutes = [
      "critical-essay",
      "critical-essay-topic-thesis",
      "critical-essay-introduction",
      "critical-essay-body-one",
      "critical-essay-body-two",
      "critical-essay-body-three",
      "critical-essay-conclusion-revision",
      "critical-essay-preview"
    ];
    const requiredRoutes = [...essayRoutes, "reading-guide", "major-works-data", "novel-study-questions", "writing-studio", "evidence-bank", "resources"];
    add(checks, "novel-routes", requiredRoutes.every((id) => $(`#${id}`).length === 1) && $("#novel-study-tracks").length === 0, "Both novels remain configured inside the activities, the redundant standalone track route is absent, and all Critical Essay lesson routes are present.");
    add(checks, "novel-access-notices", $("#resources [data-material-status='access-required']").length === 2, "Resources contains truthful access notices for both SPO-selected novels.");
    const mockingbird = $("#novel-study-questions [data-novel-track-panel='to-kill-a-mockingbird']");
    const stripedPyjamas = $("#novel-study-questions [data-novel-track-panel='the-boy-in-the-striped-pyjamas']");
    add(checks, "novel-track-question-placement", mockingbird.find("[data-novel-phase-panel]").length === 5 && stripedPyjamas.find("[data-novel-phase-panel]").length === 3 && !/TKAMB|Mockingbird/i.test(stripedPyjamas.text()), "The two TKAMB teacher worksheets are restricted to To Kill a Mockingbird; the second novel retains only its neutral enrichment phases.");
    add(checks, "novel-essay-navigation", writingNavigationRouteIds($, "critical-essay").length === 8, "Critical Essay navigation exposes the Guide, six writing lessons, and Preview in order.");
    return;
  }
  if (profile === "film-study") {
    const essayRoutes = [
      "critical-essay",
      "critical-essay-topic-interpretation",
      "critical-essay-introduction",
      "critical-essay-body-one",
      "critical-essay-body-two",
      "critical-essay-body-three",
      "critical-essay-conclusion-revision",
      "critical-essay-preview"
    ];
    add(checks, "film-routes", [...essayRoutes, "viewing-guide", "film-study-questions", "film-room", "resources", "evidence-bank"].every((id) => $(`#${id}`).length === 1), "Film Study activity and Critical Essay lesson routes are present.");
    const sets = $("#film-study-questions [data-film-profile-panel-group]");
    add(checks, "film-question-sets", sets.length === 2 && sets.eq(0).find("[data-evidence-question-prompt]").length === 22 && sets.eq(1).find("[data-evidence-question-prompt]").length === 18, "Film question sets contain 22 technique and 18 full-response prompts.");
    const essayStageRoutes = essayRoutes.slice(1, -1);
    const essayFieldCount = essayStageRoutes.reduce((total, routeId) => total + $(`#${routeId} [data-activity-response]`).length, 0);
    add(checks, "film-essay-fields", essayStageRoutes.every((routeId) => $(`#${routeId} [data-response-collection]`).length === 1) && essayFieldCount === 19, "Film Critical Essay contains six independent lesson stages and 19 stable fields.");
    add(checks, "film-room-content", $("#film-room iframe").length > 0 || $("#film-room .film-concept-index-grid article").length >= 3, "Film Room contains verified videos or a truthful Brightspace lesson-concept index.");
    add(checks, "film-essay-navigation", writingNavigationRouteIds($, "critical-essay").length === 8, "Critical Essay navigation exposes the Guide, six writing lessons, and Preview in order.");
    const expectedLessons = ["Film Study Overview", "A Brief History of Film", "Formal Elements of Film", "Editing and Sound", "Film Editing Techniques", "Camera Shots and Angles", "Mise-en-scene", "Composition and Camera Movement", "Sound in Film"];
    const actualLessons = $("#lessons .lesson-card strong").toArray().map((element) => $(element).text().replace(/\s+/g, " ").trim());
    add(checks, "film-foundation-lessons", actualLessons.length === expectedLessons.length && actualLessons.every((title, index) => title === expectedLessons[index]), "Film Study uses the complete nine-lesson Feature Film sequence in the intended order.");
  }
}

function profileChecks(profile: string, recipe: EnglishUnitRecipeV2, $: cheerio.CheerioAPI, checks: VerificationCheck[]) {
  if (recipe.courseCode === "ELA 10-1") {
    ela10ProfileChecks(profile, $, checks);
    return;
  }
  if (profile === "short-fiction") {
    add(checks, "short-fiction-routes", ["story-bank", "story-questions", "writing-studio", "evidence-bank", "film-room", "resources"].every((id) => $(`#${id}`).length === 1), "Golden Short Fiction routes are present.");
    add(checks, "short-fiction-readings", $("[data-library-doc-panel]").length >= 5, "All five teacher-selected reading panels are present.");
    return;
  }
  if (profile === "modern-drama") {
    add(checks, "crucible-routes", ["play-materials", "act-questions", "character-notes", "critical-essay", "evidence-bank"].every((id) => $(`#${id}`).length === 1), "Modern Drama activity routes are present.");
    add(checks, "crucible-acts", $("#act-questions [data-question-panel]").length === 4, "Four Crucible act question sets are present.");
    return;
  }
  if (profile === "shakespeare-drama") {
    add(checks, "macbeth-routes", ["side-by-side", "play-materials", "act-questions", "character-notes", "writing-studio", "evidence-bank"].every((id) => $(`#${id}`).length === 1), "Shakespeare activity routes are present.");
    add(checks, "macbeth-scenes", $("#side-by-side [data-english-activity-panel]").length === 28, "All 28 Macbeth scenes are present in the side-by-side reader.");
    const readerText = $("#side-by-side").text().replace(/\s+/g, " ");
    const learnerEditorialCopyAbsent = $("#side-by-side [data-editorial-status]").length === 0
      && !/(?:Companion needs editorial review|Machine-normalized editorial draft|final packaging)/i.test(readerText);
    add(checks, "macbeth-editorial", learnerEditorialCopyAbsent, "Editorial review status remains in preserved project data and is absent from the learner-facing reader.");
    add(checks, "macbeth-act-sets", $("#act-questions [data-question-panel]").length === 5, "Five Macbeth act collections are present.");
    add(checks, "macbeth-question-scenes", $("#act-questions .scene-checkpoint-card").length === 28, "All 28 Macbeth scenes are represented in Act Questions.");
    add(checks, "macbeth-teacher-scenes", $("#act-questions [data-question-origin='teacher-supplied']").length === 20, "The 20 teacher-supplied question pages retain their internal source mapping.");
    add(checks, "macbeth-profile-scenes", $("#act-questions [data-question-origin='profile-supplied']").length === 8, "Eight internally mapped profile-supplied question sets complete the scene sequence without learner-facing provenance notes.");
    add(checks, "macbeth-characters", $("#character-notes [data-english-activity-panel]").length === 6, "Six Macbeth character dossiers are present.");
    const writingTools = ["language-lab", "close-reading", "theme-builder", "character-change-paragraph", "critical-essay", "graphic-essay"];
    add(
      checks,
      "macbeth-writing-tools",
      writingTools.every((id) => $(`#writing-studio [data-english-activity-panel='${id}']`).length === 1),
      "All six Shakespeare Writing Studio tools are present."
    );
    return;
  }
  if (profile === "novel-study") {
    const essayRoutes = [
      "critical-essay",
      "critical-essay-topic-thesis",
      "critical-essay-introduction",
      "critical-essay-body-one",
      "critical-essay-body-two",
      "critical-essay-body-three",
      "critical-essay-conclusion-revision",
      "critical-essay-preview"
    ];
    const requiredRoutesPresent = [...essayRoutes, "reading-guide", "major-works-data", "novel-study-questions", "writing-studio", "evidence-bank", "resources"]
      .every((id) => $(`#${id}`).length === 1);
    const accessNotices = $("#resources [data-material-status='access-required']");
    add(
      checks,
      "novel-routes",
      requiredRoutesPresent && $("#novel-study-tracks").length === 0 && accessNotices.length === 2,
      "Both novel tracks remain available inside the activities, Resources contains two truthful access notices, the redundant track route is absent, and all eight Critical Essay lesson routes are present."
    );
    const essayStageRoutes = essayRoutes.slice(1, -1);
    const novelTrackIds = ["lord-of-the-flies", "the-book-thief"];
    const essayFieldsByTrack = novelTrackIds.map((trackId) => essayStageRoutes.reduce(
      (total, routeId) => total + $(`#${routeId} textarea[data-response-id^='ela20-1-novel-study-clean:critical-essay:${trackId}:']`).length,
      0
    ));
    const essayStageCollections = essayStageRoutes.reduce((total, routeId) => total + $(`#${routeId} [data-evidence-collection-id$=':collection']`).length, 0);
    add(checks, "novel-essay-fields", essayFieldsByTrack.every((count) => count === 18) && essayStageCollections === 12, "Novel Critical Essay contains six independent lesson stages, 18 stable fields per novel, and one explicit stage collection per novel and lesson.");
    const fullPlanIds = novelTrackIds.map((trackId) => `ela20-1-novel-study-clean:critical-essay:${trackId}:full-plan`);
    const preview = $("#critical-essay-preview[data-novel-essay-preview]");
    add(checks, "novel-essay-preview", preview.length === 1 && preview.find("[data-novel-essay-preview-panel]").length === 2 && fullPlanIds.every((id) => preview.find(`[data-evidence-collection-id='${id}']`).length === 1), "Novel Critical Essay includes separate live Preview and full-plan Evidence Bank collections for both novels.");
    add(checks, "novel-essay-navigation", writingNavigationRouteIds($, "critical-essay").length === 8, "Critical Essay navigation exposes the Guide, six writing lessons, and Preview in order.");
    add(checks, "novel-generic-questions", $("#novel-study-questions .novel-question").length === 48, "The 24 disclosed profile-supplied questions are rendered for both novel tracks.");
    add(checks, "novel-phases", $("#novel-study-questions [data-novel-phase-panel]").length === 6, "Opening, middle, and final collections are present for both novels.");
    return;
  }
  if (profile === "film-study") {
    const essayRoutes = [
      "critical-essay",
      "critical-essay-topic-interpretation",
      "critical-essay-introduction",
      "critical-essay-body-one",
      "critical-essay-body-two",
      "critical-essay-body-three",
      "critical-essay-conclusion-revision",
      "critical-essay-preview"
    ];
    const personalResponseEnabled = recipe.activityProfile.activities.some((activity) => activity.enabled && activity.route === "personal-response");
    const personalResponseRoutes = personalResponseEnabled ? [
      "personal-response",
      "personal-response-prompt-impression",
      "personal-response-film-evidence",
      "personal-response-knowledge-experience",
      "personal-response-form-perspective",
      "personal-response-response-plan",
      "personal-response-draft-revise",
      "personal-response-preview"
    ] : [];
    add(checks, "film-routes", [...essayRoutes, ...personalResponseRoutes, "viewing-guide", "film-study-questions", "film-room", "resources", "evidence-bank"].every((id) => $(`#${id}`).length === 1), "Film Study activity, Critical Essay lessons, and configured Personal Response lessons are present.");
    const sets = $("#film-study-questions [data-film-profile-panel-group]");
    add(checks, "film-question-sets", sets.length === 2 && sets.eq(0).find("[data-evidence-question-prompt]").length === 22 && sets.eq(1).find("[data-evidence-question-prompt]").length === 18, "Film question sets contain 22 technique and 18 full-response prompts.");
    const essayStageRoutes = essayRoutes.slice(1, -1);
    const essayFieldCount = essayStageRoutes.reduce((total, routeId) => total + $(`#${routeId} [data-activity-response]`).length, 0);
    add(checks, "film-essay-fields", essayStageRoutes.every((routeId) => $(`#${routeId} [data-response-collection]`).length === 1) && essayFieldCount === 19, "Film Critical Essay contains six independent lesson stages and 19 stable fields.");
    add(checks, "film-essay-preview", $("#critical-essay-preview[data-film-essay-preview]").length === 1 && $("#critical-essay-preview [data-film-save-essay-preview]").length === 1, "Film Critical Essay includes a live assembled Preview with a deliberate full-plan Evidence Bank save.");
    add(checks, "film-essay-navigation", writingNavigationRouteIds($, "critical-essay").length === 8, "Critical Essay navigation exposes the Guide, six writing lessons, and Preview in order.");
    if (personalResponseEnabled) {
      const personalResponseStageRoutes = personalResponseRoutes.slice(1, -1);
      const personalResponseFieldCount = personalResponseStageRoutes.reduce((total, routeId) => total + $(`#${routeId} [data-activity-response]`).length, 0);
      add(checks, "film-personal-response-fields", personalResponseStageRoutes.every((routeId) => $(`#${routeId} [data-response-collection]`).length === 1) && personalResponseFieldCount === 18, "Film Personal Response contains six independent lesson stages and 18 stable fields.");
      add(checks, "film-personal-response-preview", $("#personal-response-preview[data-film-personal-response-preview]").length === 1 && $("#personal-response-preview [data-film-save-personal-response-preview]").length === 1, "Film Personal Response includes a live assembled Preview with a deliberate full-plan Evidence Bank save.");
      add(checks, "film-personal-response-navigation", $("[data-nav-group='personal-response'] #personal-response-subnav [data-page-target]").length === 8, "Personal Response navigation exposes the Guide, six writing lessons, and Preview in order.");
    }
    add(checks, "film-videos", $("#film-room iframe").length === 4, "Four verified Film Study concept videos are embedded.");
  }
}

async function verifyCourseArchives(repoRoot: string, manifest: EnglishCourseManifestV1): Promise<VerificationCheck[]> {
  const checks: VerificationCheck[] = [];
  for (const archive of manifest.archives) {
    const archivePath = path.resolve(repoRoot, archive.path);
    if (!(await exists(archivePath))) {
      add(checks, `archive-${archive.id}`, false, `Registered ${archive.kind} archive is missing: ${archive.path}`);
      continue;
    }
    const digest = await sha256File(archivePath);
    add(checks, `archive-${archive.id}`, digest === archive.sha256, digest === archive.sha256
      ? `Registered ${archive.kind} archive exists and matches its SHA-256.`
      : `Registered ${archive.kind} archive SHA-256 does not match ${archive.sha256}.`);

    if (archive.kind !== "audit-reference") continue;
    const inventoryPath = path.resolve(repoRoot, archive.inventoryPath ?? "");
    if (!archive.inventoryPath || !(await exists(inventoryPath))) {
      add(checks, `audit-inventory-${archive.id}`, false, `Audit-reference inventory is missing: ${archive.inventoryPath ?? "not declared"}`);
      continue;
    }
    try {
      const inventory = JSON.parse(await readFile(inventoryPath, "utf8")) as {
        sha256?: string;
        unitFindings?: Array<{ unit?: string; missingTargets?: string[] }>;
      };
      add(checks, `audit-inventory-${archive.id}`, inventory.sha256 === archive.sha256, inventory.sha256 === archive.sha256
        ? "Audit-reference inventory is tied to the registered archive hash."
        : "Audit-reference inventory hash does not match the registered archive.");
      const missingTargets = (inventory.unitFindings ?? []).flatMap((finding) =>
        (finding.missingTargets ?? []).map((target) => `${finding.unit ?? "unassigned"}: ${target}`)
      );
      add(checks, `audit-advertised-targets-${archive.id}`, missingTargets.length === 0, missingTargets.length
        ? `${missingTargets.length} manifest-advertised target(s) are physically absent and remain audit-only: ${missingTargets.slice(0, 8).join(", ")}${missingTargets.length > 8 ? ", …" : ""}`
        : "The audit-reference inventory has no advertised-but-absent targets.", true);
    } catch (error) {
      add(checks, `audit-inventory-${archive.id}`, false, `Audit-reference inventory could not be read: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return checks;
}

function resourceRoutes(recipe: EnglishUnitRecipeV2 | EnglishUnitRecipeV3, $: cheerio.CheerioAPI) {
  const requiredIds = new Set(recipe.acceptance.requiredActivityIds);
  const routes = recipe.activityProfile.activities
    .filter((activity) => activity.enabled && requiredIds.has(activity.id))
    .filter((activity) => activity.id !== "evidence-bank")
    .filter((activity) => /(?:bank|materials?|resources?|reader|film-room)/i.test(`${activity.id} ${activity.route}`))
    .map((activity) => activity.route);
  if ($("#resources").length) routes.push("resources");
  if (recipe.schemaVersion === 3 && $("#materials").length) routes.push("materials");
  return [...new Set(routes)];
}

async function verifyUnit(input: { repoRoot: string; projectSlug: string; activityProfile: string }): Promise<UnitVerification> {
  const projectDir = path.join(input.repoRoot, "projects", input.projectSlug);
  const workspaceDir = path.join(projectDir, "workspace");
  const recipePath = path.join(projectDir, "meta", "english-unit.json");
  const buildManifestPath = path.join(projectDir, "meta", "english-unit-build.json");
  const checks: VerificationCheck[] = [];
  const recipe = parseEnglishUnitRecipe(JSON.parse(await readFile(recipePath, "utf8")));
  add(checks, "recipe-profile", recipe.activityProfile.kind === input.activityProfile, `Recipe profile is ${recipe.activityProfile.kind}.`);
  const e2eContractPath = path.join(projectDir, "meta", "e2e-contract.json");
  try {
    const e2eContract = validateProjectContract(JSON.parse(await readFile(e2eContractPath, "utf8")), e2eContractPath);
    add(checks, "e2e-contract", true, "Project E2E contract is valid.");
    checks.push(inspectE2EContractDepth(e2eContract));
  } catch (error) {
    add(checks, "e2e-contract", false, error instanceof Error ? error.message.replace(/\s+/g, " ") : String(error));
  }
  const indexPath = path.join(workspaceDir, "index.html");
  const html = await readFile(indexPath, "utf8");
  const $ = cheerio.load(html);
  add(checks, "complete-html", $("html").length === 1 && $("body").length === 1, "Workspace index is a complete HTML document.");
  add(checks, "shared-shell", $(".course-sidebar").length === 1 && $(".course-topbar").length === 1, "Shared Next Step course shell is present.");
  add(checks, "evidence-api", html.includes("window.nextStepEvidenceBank") && html.includes("upsertEvidenceEntry") && html.includes("removeEvidenceEntry") && html.includes("listEvidenceEntries"), "Shared Evidence Bank API is embedded.");
  add(checks, "evidence-filters", input.activityProfile === "short-fiction" || $("[data-evidence-bank-filter]").length === 4, "Central Evidence Bank filter controls are present.");
  add(checks, "green-save-actions", $("[data-save-evidence-note], [data-save-response-collection]").toArray().every((element) => $(element).hasClass("evidence-bank-save-action") || input.activityProfile === "short-fiction"), "Evidence Bank save actions use the shared green style.");
  add(checks, "hints-print", $("[data-worksheet-toggle-hints]").length > 0 && $("[data-worksheet-print], [data-print-writing]").length > 0, "Hints and scoped Print/PDF controls are present.");
  checks.push(...inspectLearnerHtml(html, resourceRoutes(recipe, $), {
    allowThirtyTwoDiplomaConnection: recipe.schemaVersion === 3 && normalizedEnglishCourseCode(recipe.courseCode).endsWith("30-2")
  }));
  if (recipe.courseCode === "ELA 10-1") checks.push(inspectEla10CourseVoice(html));
  const duplicateResponseIds = $("[data-response-id]").toArray().map((element) => $(element).attr("data-response-id") ?? "").filter((id, index, ids) => id && ids.indexOf(id) !== index);
  const isDeliberatelySharedResponseId = (id: string) =>
    id.endsWith(":selection:track") || (input.activityProfile === "short-fiction" && id.startsWith("english-question:"));
  const unexpectedDuplicateResponseIds = duplicateResponseIds.filter((id) => !isDeliberatelySharedResponseId(id));
  add(
    checks,
    "stable-response-ids",
    unexpectedDuplicateResponseIds.length === 0,
    unexpectedDuplicateResponseIds.length
      ? `Unexpected duplicate response IDs: ${[...new Set(unexpectedDuplicateResponseIds)].slice(0, 8).join(", ")}`
      : input.activityProfile === "short-fiction"
        ? "Question response IDs and writing-track selections are deliberately shared across their linked learner surfaces."
        : "Response IDs are unique and stable."
  );

  const brokenLocal: string[] = [];
  for (const element of $("img[src], iframe[src], a[href]").toArray()) {
    const attribute = element.tagName === "a" ? "href" : "src";
    const reference = localReference($(element).attr(attribute) ?? "");
    if (!reference) continue;
    const target = path.resolve(workspaceDir, reference);
    if (!target.startsWith(`${path.resolve(workspaceDir)}${path.sep}`) || !(await exists(target))) brokenLocal.push(reference);
  }
  add(checks, "local-links", brokenLocal.length === 0, brokenLocal.length ? `Broken local references: ${[...new Set(brokenLocal)].slice(0, 8).join(", ")}` : "All local image, reader, download, and link targets exist.");
  const leakedFiles = (await walkFiles(workspaceDir)).filter((file) => /(?:soft|hard)[ _-]*gate|answer\s*key|\bmath\b/i.test(file));
  add(checks, "excluded-files", leakedFiles.length === 0, leakedFiles.length ? `Excluded files leaked: ${leakedFiles.join(", ")}` : "No gate, answer-key, or Math files exist in learner workspace.");
  const mappingPath = path.join(projectDir, "meta", "english-unit-mapping.json");
  try {
    checks.push(...inspectMappingReport(JSON.parse(await readFile(mappingPath, "utf8"))));
  } catch (error) {
    add(checks, "mapping-report", false, `English unit mapping report could not be read: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (recipe.schemaVersion === 3) {
    checks.push(...inspectV3WritingFormOutput(html, recipe));
    checks.push(...inspectV3MaterialsOutput(html, recipe));
    const missingAcceptanceRoutes = recipe.acceptance.requiredRoutes.filter((route) => $(`[id="${route}"]`).length !== 1);
    add(
      checks,
      "v3-acceptance-routes",
      missingAcceptanceRoutes.length === 0,
      missingAcceptanceRoutes.length
        ? `Recipe-required route(s) are missing or duplicated: ${missingAcceptanceRoutes.join(", ")}.`
        : `All ${recipe.acceptance.requiredRoutes.length} recipe-required routes are present exactly once.`
    );
  } else {
    profileChecks(input.activityProfile, recipe, $, checks);
  }

  const buildManifest = JSON.parse(await readFile(buildManifestPath, "utf8")) as { status?: string; components?: Array<{ source: string; sha256: string }>; reviewItems?: string[] };
  add(checks, "review-status", buildManifest.status === "needs-review" || recipe.status === "ready-for-export", `Build status is ${buildManifest.status}; final export remains review-gated.`, buildManifest.status !== "needs-review" && recipe.status !== "ready-for-export");
  const reviewItems = [...new Set([...(recipe.acceptance.reviewItems ?? []), ...(buildManifest.reviewItems ?? [])])];
  add(checks, "review-items", reviewItems.length === 0, reviewItems.length
    ? `${reviewItems.length} unresolved review item(s): ${reviewItems.join("; ")}`
    : "No unresolved recipe or build review items remain.", true);
  if (input.activityProfile === "shakespeare-drama" && recipe.courseCode !== "ELA 10-1") {
    const scenePath = path.join(workspaceDir, "components", "shakespeare-side-by-side", "scenes.json");
    const digest = createHash("sha256").update(await readFile(scenePath)).digest("hex");
    add(checks, "preserved-macbeth-component", buildManifest.components?.some((component) => component.source === "components/shakespeare-side-by-side/scenes.json" && component.sha256 === digest) ?? false, "Macbeth editable scene data is preserved and hashed in the build manifest.");
  }
  return { projectSlug: input.projectSlug, activityProfile: input.activityProfile, checks };
}

async function verifyLegacyWorkspaceUnit(input: {
  repoRoot: string;
  unit: LegacyWorkspaceUnit;
  familyProfileVersion: string;
}): Promise<UnitVerification> {
  const projectDir = path.join(input.repoRoot, "projects", input.unit.projectSlug);
  const workspacePath = path.join(projectDir, "workspace", "index.html");
  const contractPath = path.join(projectDir, "meta", "e2e-contract.json");
  const checks: VerificationCheck[] = [];

  add(
    checks,
    "legacy-workspace-source",
    true,
    "Verification reads the canonical legacy workspace directly and does not require a factory recipe, build manifest, or mapping report."
  );
  add(
    checks,
    "evidence-profile-version",
    input.unit.profileVersion === input.familyProfileVersion,
    `Unit evidence profile is ${input.unit.profileVersion}; family profile is ${input.familyProfileVersion}.`
  );
  add(
    checks,
    "review-status",
    input.unit.reviewStatus === "approved" || input.unit.reviewStatus === "ready-for-export",
    `Legacy retrofit review status is ${input.unit.reviewStatus}.`,
    input.unit.reviewStatus === "needs-review"
  );

  let html: string;
  try {
    html = await readFile(workspacePath, "utf8");
  } catch (error) {
    add(
      checks,
      "workspace-source",
      false,
      `Canonical workspace could not be read: ${error instanceof Error ? error.message : String(error)}`
    );
    return { projectSlug: input.unit.projectSlug, activityProfile: input.unit.activityProfile, checks };
  }

  try {
    const contract = validateProjectContract(
      JSON.parse(await readFile(contractPath, "utf8")),
      contractPath,
      { requireDeepTargets: true }
    );
    add(checks, "e2e-contract", true, "Project E2E contract is valid and contains deep learner targets.");
    checks.push(inspectE2EContractDepth(contract));
    checks.push(...inspectLegacyEvidenceWorkspace({
      html,
      projectSlug: input.unit.projectSlug,
      contract
    }));
  } catch (error) {
    add(
      checks,
      "e2e-contract",
      false,
      error instanceof Error ? error.message.replace(/\s+/g, " ") : String(error)
    );
  }

  const $ = cheerio.load(html);
  const learnerText = visibleLearnerText(html);
  const structuralCourseLabels = $(".sidebar-course-label, .course-code, [data-course-code]").toArray()
    .map((node) => $(node).text().replace(/\s+/g, " ").trim())
    .join(" ");
  const wrongCourseLabels = matchingLabels(structuralCourseLabels, [
    { label: "ELA/English 10-1", pattern: /\b(?:ELA|English(?:\s+Language\s+Arts)?)\s*10\s*[-\u2010-\u2015]\s*1\b/iu },
    { label: "ELA/English 20-1", pattern: /\b(?:ELA|English(?:\s+Language\s+Arts)?)\s*20\s*[-\u2010-\u2015]\s*1\b/iu },
  ]);
  add(checks, "legacy-course-labels", wrongCourseLabels.length === 0, wrongCourseLabels.length
    ? `Learner text contains incorrect course labels: ${wrongCourseLabels.join(", ")}.`
    : "Learner-visible course labels consistently identify ELA 30-1.");

  const lmsWording = matchingLabels(learnerText, [
    { label: "Brightspace/D2L", pattern: /\b(?:Brightspace|D2L)\b/iu },
    { label: "conversion/export provenance", pattern: /\b(?:conversion|recovered from (?:the )?export)\b/iu },
  ]);
  add(checks, "legacy-course-voice", lmsWording.length === 0, lmsWording.length
    ? `Learner text contains authoring or LMS provenance: ${lmsWording.join(", ")}.`
    : "Learner text uses course-facing language without LMS or conversion provenance.");

  const requiredWritingRoutes = [
    "critical-essay",
    "critical-essay-topic-interpretation",
    "critical-essay-introduction",
    "critical-essay-body-one",
    "critical-essay-body-two",
    "critical-essay-body-three",
    "critical-essay-conclusion-revision",
    "critical-essay-preview",
    "personal-response",
    "personal-response-prompt-impression",
    "personal-response-text-evidence",
    "personal-response-knowledge-experience",
    "personal-response-form-perspective",
    "personal-response-response-plan",
    "personal-response-draft-revise",
    "personal-response-preview",
  ];
  const missingWritingRoutes = requiredWritingRoutes.filter((route) => $(`#${route}`).length !== 1 || $(`[data-page-target="${route}"]`).length === 0);
  add(checks, "writing-route-parity", missingWritingRoutes.length === 0, missingWritingRoutes.length
    ? `Missing standard writing route or navigation target: ${missingWritingRoutes.join(", ")}.`
    : "Critical Essay and Personal Response each provide a guide, six sequenced lessons, and a final preview.");

  const criticalNavIndex = html.indexOf('data-nav-group="critical-essay"');
  const personalNavIndex = html.indexOf('data-nav-group="personal-response"');
  add(checks, "writing-navigation-order", criticalNavIndex >= 0 && personalNavIndex > criticalNavIndex,
    criticalNavIndex >= 0 && personalNavIndex > criticalNavIndex
      ? "Critical Essay is followed by Personal Response in the learner navigation."
      : "Critical Essay and Personal Response are missing or out of order in the learner navigation.");

  if (input.unit.projectSlug === "ela30-1-modern-drama") {
    const sidebarLabels = $(".course-sidebar .sidebar-label").toArray().map((node) => $(node).text().trim());
    add(checks, "materials-resources-terminology",
      sidebarLabels.includes("Materials") && sidebarLabels.includes("Resources") && !sidebarLabels.includes("Library"),
      "Core local documents are labelled Materials; supplemental links remain Resources.");
  }

  const workspaceDir = path.dirname(workspacePath);
  const brokenLocal: string[] = [];
  for (const element of $("img[src], script[src], link[href], a[href], iframe[src], embed[src], object[data]").toArray()) {
    const attribute = element.tagName === "object" ? "data" : element.tagName === "link" || element.tagName === "a" ? "href" : "src";
    const reference = localReference($(element).attr(attribute) ?? "");
    if (!reference) continue;
    const target = path.resolve(workspaceDir, reference);
    if (!target.startsWith(`${path.resolve(workspaceDir)}${path.sep}`) || !(await exists(target))) brokenLocal.push(reference);
  }
  add(checks, "local-links", brokenLocal.length === 0, brokenLocal.length
    ? `Broken local references: ${[...new Set(brokenLocal)].slice(0, 8).join(", ")}`
    : "All local image, reader, download, and link targets exist.");

  const leakedFiles = (await walkFiles(workspaceDir)).filter((file) => /(?:soft|hard)[ _-]*gate|answer\s*key|\bmath\b/i.test(file));
  add(checks, "excluded-files", leakedFiles.length === 0, leakedFiles.length
    ? `Excluded files leaked: ${leakedFiles.join(", ")}`
    : "No gate, answer-key, or Math files exist in the learner workspace.");

  return { projectSlug: input.unit.projectSlug, activityProfile: input.unit.activityProfile, checks };
}

function renderMarkdown(courseId: string, courseChecks: VerificationCheck[], units: UnitVerification[]) {
  const allChecks = [...courseChecks, ...units.flatMap((unit) => unit.checks)];
  const failed = allChecks.filter((check) => check.status === "failed").length;
  const warning = allChecks.filter((check) => check.status === "warning").length;
  const lines = [`# ${courseId} English Course Verification`, "", `- Failed: ${failed}`, `- Warnings: ${warning}`, ""];
  lines.push("## Course sources", "", "| Status | Check | Detail |", "| --- | --- | --- |");
  courseChecks.forEach((check) => lines.push(`| ${check.status} | ${check.id} | ${check.detail.replace(/\|/g, "\\|")} |`));
  lines.push("");
  for (const unit of units) {
    lines.push(`## ${unit.projectSlug}`, "", "| Status | Check | Detail |", "| --- | --- | --- |");
    unit.checks.forEach((check) => lines.push(`| ${check.status} | ${check.id} | ${check.detail.replace(/\|/g, "\\|")} |`));
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

export async function verifyEnglishCourse(input: { courseId: string; repoRoot: string }) {
  const manifestPath = path.join(input.repoRoot, "config", "english", "families", `${input.courseId}.json`);
  const rawManifest = JSON.parse(await readFile(manifestPath, "utf8")) as unknown;
  const isLegacyWorkspace = Boolean(
    rawManifest
      && typeof rawManifest === "object"
      && !Array.isArray(rawManifest)
      && (rawManifest as Record<string, unknown>).sourceMode === "legacy-workspace"
  );
  const courseChecks: VerificationCheck[] = [];
  const units: UnitVerification[] = [];
  if (isLegacyWorkspace) {
    const manifest = parseLegacyWorkspaceCourseManifest(rawManifest, manifestPath);
    add(
      courseChecks,
      "legacy-workspace-manifest",
      manifest.courseId === input.courseId,
      `Legacy workspace family ${manifest.courseId} declares ${manifest.units.length} unit(s) on evidence profile ${manifest.profileVersion}.`
    );
    for (const unit of manifest.units) {
      units.push(await verifyLegacyWorkspaceUnit({
        repoRoot: input.repoRoot,
        unit,
        familyProfileVersion: manifest.profileVersion
      }));
    }
  } else {
    const manifest = parseEnglishCourseManifest(rawManifest);
    courseChecks.push(...await verifyCourseArchives(input.repoRoot, manifest));
    for (const unit of manifest.units) {
      units.push(await verifyUnit({
        repoRoot: input.repoRoot,
        projectSlug: unit.projectSlug,
        activityProfile: unit.activityProfile
      }));
    }
  }
  const allChecks = [...courseChecks, ...units.flatMap((unit) => unit.checks)];
  const failed = allChecks.filter((check) => check.status === "failed");
  const warnings = allChecks.filter((check) => check.status === "warning");
  const report = { schemaVersion: 1, courseId: input.courseId, generatedAt: new Date().toISOString(), passed: failed.length === 0, failed: failed.length, warnings: warnings.length, courseChecks, units };
  const outputBase = path.join(input.repoRoot, "config", "english", "families", `${input.courseId}-verification`);
  await writeFile(`${outputBase}.json`, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(`${outputBase}.md`, renderMarkdown(input.courseId, courseChecks, units), "utf8");
  if (failed.length) throw new Error(`English course verification failed ${failed.length} check(s). See ${outputBase}.md`);
  return report;
}

async function main() { console.log(JSON.stringify(await verifyEnglishCourse(parseArgs(process.argv.slice(2))), null, 2)); }
if (import.meta.url === `file://${process.argv[1]}`) main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
