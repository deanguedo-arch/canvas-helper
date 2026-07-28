import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import {
  ELA30_WRITING_PROJECT_SLUGS,
  ELA30_WRITING_RETROFIT_VERSION,
  applyEla30WritingRetrofit,
  type Ela30WritingProjectSlug,
} from "./lib/english-unit/ela30-writing-retrofit.js";
import { parseEnglishUnitRecipe } from "./lib/english-unit/schema.js";
import type { EnglishUnitRecipeV2 } from "./lib/english-unit/types.js";
import { ensureStandardEnglishWritingProfile } from "./lib/english-unit/writing-sequence-renderer.js";

const FACTORY_PROJECTS = [
  "ela10-1-film-study",
  "ela10-1-modern-play-fences",
  "ela10-1-novel-study",
  "ela10-1-shakespeare-merchant-of-venice",
  "ela20-1-feature-film",
  "ela20-1-modern-play-crucible",
  "ela20-1-novel-study-clean",
  "ela20-1-shakespeare-macbeth",
] as const;

const SHORT_FICTION_PROJECTS = ["ela10-1-short-stories", "ela20-1-short-stories-pilot"] as const;
const ALL_PROJECTS = [...FACTORY_PROJECTS, ...SHORT_FICTION_PROJECTS, ...ELA30_WRITING_PROJECT_SLUGS] as const;
type ProjectSlug = (typeof ALL_PROJECTS)[number];

interface ProjectJson {
  injectedComponents?: Array<Record<string, unknown>>;
  sourceOfTruthNotes?: string;
  [key: string]: unknown;
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

export function updateEla30E2EContract(contract: Record<string, unknown>, projectSlug: Ela30WritingProjectSlug, routeIds: string[]) {
  const learner = contract.learnerCourse as Record<string, unknown> | undefined;
  if (!learner || learner.enabled !== true) throw new Error(`${projectSlug} is missing an enabled learnerCourse E2E contract.`);
  const isLegacyCriticalRoute = (route: string) => route === "critical-writing" || route.startsWith("critical-writing-");
  const removeLegacyCriticalRoutes = (routes: string[] | undefined) => (routes ?? []).filter((route) => !isLegacyCriticalRoute(route));
  const routes = unique([...removeLegacyCriticalRoutes(learner.routes as string[] | undefined), ...routeIds]);
  const stageRoutes = routeIds.filter((route) => route !== "critical-essay" && route !== "personal-response" && !route.endsWith("-preview"));
  const printRoutes = routeIds.filter((route) => route !== "critical-essay" && route !== "personal-response");
  const currentScenarios = learner.evidenceScenarios as Array<Record<string, unknown>> | undefined;
  const singleScenario = learner.evidenceScenario as Record<string, unknown> | undefined;
  const writingRoutes = new Set(["critical-essay-topic-interpretation", "personal-response-prompt-impression"]);
  const evidenceScenarios = [...(currentScenarios ?? (singleScenario ? [singleScenario] : []))]
    .filter((scenario) => {
      const route = String(scenario.route ?? "");
      return !writingRoutes.has(route) && !isLegacyCriticalRoute(route);
    });
  const additions: Array<Record<string, unknown>> = [];
  if (routeIds.includes("critical-essay-topic-interpretation")) {
    const criticalTrack = projectSlug === "ela30-1-short-stories" ? "by-the-waters-of-babylon" : "unit";
    additions.push({
      kind: "collection",
      route: "critical-essay-topic-interpretation",
      collectionId: `${projectSlug}:critical-essay:${criticalTrack}:topic-interpretation:collection`,
      responseId: `${projectSlug}:critical-essay:${criticalTrack}:topic-interpretation:assigned-topic`,
    });
  }
  if (routeIds.includes("personal-response-prompt-impression")) {
    additions.push({
      kind: "collection",
      route: "personal-response-prompt-impression",
      collectionId: `${projectSlug}:personal-response:unit:prompt-impression:collection`,
      responseId: `${projectSlug}:personal-response:unit:prompt-impression:prompt`,
    });
  }
  for (const scenario of additions) {
    if (!evidenceScenarios.some((current) => current.collectionId === scenario.collectionId)) evidenceScenarios.push(scenario);
  }
  const { evidenceScenario: _removedScenario, ...learnerWithoutSingle } = learner;
  return {
    ...contract,
    learnerCourse: {
      ...learnerWithoutSingle,
      routes,
      hintRoutes: unique([...removeLegacyCriticalRoutes(learner.hintRoutes as string[] | undefined), ...stageRoutes]),
      printRoutes: unique([...removeLegacyCriticalRoutes(learner.printRoutes as string[] | undefined), ...printRoutes]),
      evidenceScenarios,
      mobile: {
        ...(learner.mobile as Record<string, unknown>),
        routes: unique([
          ...removeLegacyCriticalRoutes((learner.mobile as Record<string, unknown> | undefined)?.routes as string[] | undefined),
          ...additions.map((scenario) => scenario.route as string),
        ]),
      },
    },
  };
}

function requestedProjects(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const project = getStringFlag(args, "project");
  const course = getStringFlag(args, "course");
  let projects: ProjectSlug[] = [...ALL_PROJECTS];
  if (project) {
    if (!ALL_PROJECTS.includes(project as ProjectSlug)) throw new Error(`Unsupported English writing retrofit project: ${project}`);
    projects = [project as ProjectSlug];
  } else if (course) {
    if (!/^ela(?:10|20|30)-1$/.test(course)) throw new Error(`Unsupported English course: ${course}`);
    projects = projects.filter((slug) => slug.startsWith(course));
  }
  return { projects, check: hasFlag(args, "check") };
}

async function atomicWrite(filePath: string, contents: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp-${process.pid}`;
  await writeFile(temporaryPath, contents, "utf8");
  await rename(temporaryPath, filePath);
}

async function updateFactoryRecipe(projectSlug: string, check: boolean) {
  const recipePath = path.resolve("projects", projectSlug, "meta", "english-unit.json");
  const current = await readFile(recipePath, "utf8");
  const recipe = parseEnglishUnitRecipe(JSON.parse(current));
  if (recipe.schemaVersion !== 2) throw new Error(`${projectSlug} does not use an EnglishUnitRecipeV2 recipe.`);
  const updated: EnglishUnitRecipeV2 = { ...recipe, activityProfile: ensureStandardEnglishWritingProfile(recipe.activityProfile) };
  const output = `${JSON.stringify(updated, null, 2)}\n`;
  if (check && output !== current) throw new Error(`${projectSlug} recipe is missing the standard writing routes. Run npm run retrofit:english-writing -- --project ${projectSlug}`);
  if (!check && output !== current) await atomicWrite(recipePath, output);
  return output === current ? "already current" : check ? "stale" : "recipe updated";
}

async function updateEla30Workspace(projectSlug: Ela30WritingProjectSlug, check: boolean) {
  const workspacePath = path.resolve("projects", projectSlug, "workspace", "index.html");
  const projectJsonPath = path.resolve("projects", projectSlug, "meta", "project.json");
  const reportPath = path.resolve("projects", projectSlug, "meta", "writing-sequence-retrofit.json");
  const e2eContractPath = path.resolve("projects", projectSlug, "meta", "e2e-contract.json");
  const current = await readFile(workspacePath, "utf8");
  const applied = applyEla30WritingRetrofit({ projectSlug, html: current });
  const currentE2eContractSource = await readFile(e2eContractPath, "utf8");
  const updatedE2eContractSource = `${JSON.stringify(updateEla30E2EContract(JSON.parse(currentE2eContractSource) as Record<string, unknown>, projectSlug, applied.routeIds), null, 2)}\n`;
  if (check && (applied.html !== current || updatedE2eContractSource !== currentE2eContractSource)) throw new Error(`${projectSlug} workspace or E2E contract differs from the deterministic writing retrofit.`);
  if (check) return "current";
  const projectJson = JSON.parse(await readFile(projectJsonPath, "utf8")) as ProjectJson;
  const component = { id: "english-writing-sequences-v1", source: "scripts/lib/english-unit/writing-sequence-renderer.ts", target: `projects/${projectSlug}/workspace/index.html`, status: "active", notes: "Standard Critical Essay and Personal Response lesson sequences; only missing sequences are injected." };
  const injectedComponents = [
    ...(projectJson.injectedComponents ?? []).filter((entry) => entry.id !== component.id),
    component,
  ].sort((left, right) => String(left.id ?? "").localeCompare(String(right.id ?? "")));
  const note = `English writing-sequence retrofit ${ELA30_WRITING_RETROFIT_VERSION} is applied with npm run retrofit:english-writing -- --project ${projectSlug}.`;
  const existingNote = typeof projectJson.sourceOfTruthNotes === "string" ? projectJson.sourceOfTruthNotes : "";
  const updatedProjectJson = { ...projectJson, injectedComponents, sourceOfTruthNotes: existingNote.includes(note) ? existingNote : [existingNote, note].filter(Boolean).join(" ") };
  const report = { schemaVersion: 1, retrofitVersion: ELA30_WRITING_RETROFIT_VERSION, projectSlug, sourceSha256: applied.sourceHash, outputSha256: applied.outputHash, routes: applied.routeIds, appliedAt: new Date().toISOString() };
  await atomicWrite(workspacePath, applied.html);
  await atomicWrite(projectJsonPath, `${JSON.stringify(updatedProjectJson, null, 2)}\n`);
  await atomicWrite(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  await atomicWrite(e2eContractPath, updatedE2eContractSource);
  return applied.changed ? "workspace retrofitted" : "already current";
}

async function main() {
  const { projects, check } = requestedProjects();
  for (const projectSlug of projects) {
    let status = "renderer-backed";
    if ((FACTORY_PROJECTS as readonly string[]).includes(projectSlug)) status = await updateFactoryRecipe(projectSlug, check);
    else if ((ELA30_WRITING_PROJECT_SLUGS as readonly string[]).includes(projectSlug)) status = await updateEla30Workspace(projectSlug as Ela30WritingProjectSlug, check);
    console.log(`${projectSlug}: ${status}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
}

export { requestedProjects };
