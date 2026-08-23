import fs from "node:fs";
import path from "node:path";

type CourseExpectation = {
  count: number;
  family: "writing" | "short-fiction" | "film" | "modern-drama" | "novel" | "shakespeare";
  requiredSources: string[];
};

const repoRoot = path.resolve(import.meta.dirname, "..");
const courses: Record<string, CourseExpectation> = {
  "ela10-1-short-stories": { count: 45, family: "short-fiction", requiredSources: ["The Cask of Amontillado", "Flight into Danger", "The Flying Machine", "Harrison Bergeron", "I Am a Rock"] },
  "ela10-2-writing-foundations": { count: 34, family: "writing", requiredSources: ["Writing Foundations lessons and guides", "Bee Dance Paragraph"] },
  "ela10-2-short-stories": { count: 48, family: "short-fiction", requiredSources: ["The Cask of Amontillado", "Flight into Danger", "The Flying Machine", "Harrison Bergeron", "I Am a Rock"] },
  "ela20-1-short-stories-pilot": { count: 48, family: "short-fiction", requiredSources: ["The Lamp at Noon", "The Sea Devil", "Do Not Fall in New York City", "Men Must Pay for Evil They Do", "We Must Not Return to the Noose"] },
  "ela20-2-short-stories": { count: 48, family: "short-fiction", requiredSources: ["The Lamp at Noon", "The Sea Devil", "Do Not Fall in New York City", "Men Must Pay for Evil They Do", "We Must Not Return to the Noose"] },
  "ela30-1-short-stories": { count: 50, family: "short-fiction", requiredSources: ["By the Waters of Babylon", "Dulce et Decorum Est", "Good Country People", "The First Year of My Life", "The Jilting of Granny Weatherall"] },
  "ela30-2-short-stories-visual-literacy": { count: 54, family: "short-fiction", requiredSources: ["God Is Not a Fish Inspector", "Mother and Son", "Old Man", "Warren Pryor", "Current Visual"] },
  "ela20-1-feature-film": { count: 42, family: "film", requiredSources: ["Current Feature Film"] },
  "ela20-2-feature-film": { count: 40, family: "film", requiredSources: ["Current Film"] },
  "ela30-1-feature-film": { count: 45, family: "film", requiredSources: ["Feature Film"] },
  "ela30-2-film-study": { count: 45, family: "film", requiredSources: ["Current Film", "Current Visual"] },
  "ela20-1-modern-play-crucible": { count: 46, family: "modern-drama", requiredSources: ["The Crucible — Act 1", "The Crucible — Act 4", "The Crucible Act Questions"] },
  "ela20-2-modern-play-crucible": { count: 46, family: "modern-drama", requiredSources: ["The Crucible — Act 1", "The Crucible — Act 4", "The Crucible Act Questions"] },
  "ela30-1-modern-drama": { count: 48, family: "modern-drama", requiredSources: ["A Streetcar Named Desire — Primary Text", "Scene Overviews"] },
  "ela30-2-modern-play": { count: 48, family: "modern-drama", requiredSources: ["A Streetcar Named Desire — Primary Text", "Scene Overviews"] },
  "ela20-1-novel-study-clean": { count: 42, family: "novel", requiredSources: ["Lord of the Flies", "The Book Thief"] },
  "ela20-2-novel-study": { count: 40, family: "novel", requiredSources: ["Lord of the Flies", "The Book Thief"] },
  "ela30-1-novel-study": { count: 45, family: "novel", requiredSources: ["Selected Novel"] },
  "ela30-2-novel-study": { count: 45, family: "novel", requiredSources: ["Fight Club", "Night", "Fallen Angels"] },
  "ela20-1-shakespeare-macbeth": { count: 50, family: "shakespeare", requiredSources: ["Macbeth Side-by-Side Reader", "Macbeth Act Questions"] },
  "ela30-1-shakespeare-othello": { count: 50, family: "shakespeare", requiredSources: ["Othello Side-by-Side Reader", "Othello Act Questions"] }
};

const familyRanges: Record<CourseExpectation["family"], [number, number]> = {
  writing: [28, 35],
  "short-fiction": [35, 55],
  film: [35, 45],
  "modern-drama": [40, 50],
  novel: [35, 45],
  shakespeare: [45, 55]
};

function fail(message: string): never {
  throw new Error(message);
}

function countMatches(value: string, pattern: RegExp): number {
  return Array.from(value.matchAll(pattern)).length;
}

function coursePageSections(html: string): string[] {
  const sections: string[] = [];
  const matcher = /<section\b(?=[^>]*\bclass=["'][^"']*\bcourse-page\b[^"']*["'])(?=[^>]*\bid=["']([^"']+)["'])[^>]*>/gi;
  for (const match of html.matchAll(matcher)) {
    if (sections.includes(match[1])) fail(`Duplicate course-page id #${match[1]}.`);
    sections.push(match[1]);
  }
  return sections;
}

function declaredPageRoutes(html: string): string[] | undefined {
  const declaration = html.match(/const pageIds\s*=\s*(\[[^;]+\]);/s)?.[1];
  if (!declaration) return undefined;
  const routes = JSON.parse(declaration);
  if (!Array.isArray(routes) || routes.some((route) => typeof route !== "string")) {
    fail("Course pageIds declaration is not a string array.");
  }
  return routes;
}

function sameArray(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

const activeElaProjects = fs.readdirSync(path.join(repoRoot, "projects"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith("ela"))
  .map((entry) => entry.name)
  .filter((slug) => {
    const metadataPath = path.join(repoRoot, "projects", slug, "meta", "project.json");
    if (!fs.existsSync(metadataPath)) return false;
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    return ["active", "ready-for-export"].includes(metadata.authoringStatus);
  })
  .sort();
const declaredProjects = Object.keys(courses).sort();
if (!sameArray(activeElaProjects, declaredProjects)) {
  fail(`Active ELA catalog mismatch. Expected ${declaredProjects.join(", ")}; found ${activeElaProjects.join(", ")}.`);
}

const fingerprints = new Map<string, string>();
for (const [slug, expectation] of Object.entries(courses)) {
  const projectRoot = path.join(repoRoot, "projects", slug);
  const html = fs.readFileSync(path.join(projectRoot, "workspace", "index.html"), "utf8");
  const project = JSON.parse(fs.readFileSync(path.join(projectRoot, "meta", "project.json"), "utf8"));
  const contract = JSON.parse(fs.readFileSync(path.join(projectRoot, "meta", "e2e-contract.json"), "utf8"));

  const coreStart = html.search(/<section\s+id=["']core-vocabulary["'][^>]*>/i);
  const lessonsStart = html.search(/<section\s+id=["']lessons["'][^>]*>/i);
  const overviewStart = html.search(/<section\s+id=["']overview["'][^>]*>/i);
  if (!(overviewStart >= 0 && coreStart > overviewStart && lessonsStart > coreStart)) fail(`${slug}: Core Vocabulary must appear after Overview and before Lessons.`);
  const coreHtml = html.slice(coreStart, lessonsStart);

  const declaredCount = Number(coreHtml.match(/data-core-vocabulary-count=["'](\d+)["']/)?.[1] ?? 0);
  const conceptIds = Array.from(coreHtml.matchAll(/data-core-vocabulary-term=["']([^"']+)["']/g), (match) => match[1]);
  const panelIds = Array.from(coreHtml.matchAll(/data-core-vocabulary-panel=["']([^"']+)["']/g), (match) => match[1]);
  if (declaredCount !== expectation.count) fail(`${slug}: declared ${declaredCount} concepts; expected ${expectation.count}.`);
  if (conceptIds.length !== expectation.count || panelIds.length !== expectation.count) fail(`${slug}: selector/panel count does not match ${expectation.count}.`);
  if (new Set(conceptIds).size !== conceptIds.length
    || new Set(panelIds).size !== panelIds.length
    || !conceptIds.every((conceptId) => panelIds.includes(conceptId))) fail(`${slug}: concept selectors and panels must be unique and describe the same inventory.`);

  const [minimum, maximum] = familyRanges[expectation.family];
  if (expectation.count < minimum || expectation.count > maximum) fail(`${slug}: concept count falls outside the ${expectation.family} range.`);
  const fingerprint = conceptIds.join("|");
  const duplicate = fingerprints.get(fingerprint);
  if (duplicate) fail(`${slug}: concept inventory is identical to ${duplicate}.`);
  fingerprints.set(fingerprint, slug);

  if (countMatches(coreHtml, /data-core-vocabulary-source(?:\s|>)/g) !== expectation.count) fail(`${slug}: every concept needs one source selector.`);
  if (countMatches(coreHtml, /class=["'][^"']*core-vocabulary-model[^"']*["']/g) !== expectation.count) fail(`${slug}: every concept needs one course model reveal.`);
  if (countMatches(coreHtml, /data-save-response-collection(?:\s|>)/g) !== expectation.count) fail(`${slug}: every concept needs one deliberate collection action.`);
  if (!coreHtml.includes("data-core-vocabulary-search") || !coreHtml.includes("data-core-vocabulary-select") || !coreHtml.includes("data-core-vocabulary-category")) fail(`${slug}: searchable desktop/mobile concept controls are incomplete.`);
  for (const source of expectation.requiredSources) if (!coreHtml.includes(source)) fail(`${slug}: required source ${source} is missing.`);

  for (const conceptId of conceptIds) {
    const prefix = `${slug}:core-vocabulary:${conceptId}:`;
    for (const field of ["definition", "characteristics", "example", "non-example"]) {
      const id = `${prefix}${field}`;
      if (countMatches(coreHtml, new RegExp(`data-response-id=["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "g")) !== 1) fail(`${slug}: ${conceptId} is missing the ${field} response ID.`);
    }
    const collectionId = `${prefix}collection`;
    if (countMatches(coreHtml, new RegExp(`data-evidence-collection-id=["']${collectionId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "g")) !== 1) fail(`${slug}: ${conceptId} collection ID is missing or duplicated.`);
  }

  if (countMatches(html, /href=["']#core-vocabulary["']/g) < 3) fail(`${slug}: sidebar, Overview, and Evidence Bank links are required.`);
  for (const facet of ["activity", "work", "locator", "type"]) {
    if (!html.includes(`data-evidence-bank-filter="${facet}"`)) fail(`${slug}: Evidence Bank ${facet} filter is missing.`);
  }
  if (project.authoring?.driverId !== "legacy-snapshot-v1") fail(`${slug}: source boundary must remain legacy-snapshot-v1.`);
  const htmlRoutes = coursePageSections(html);
  if (htmlRoutes.length === 0) fail(`${slug}: no learner course pages were discovered.`);
  const declaredRoutes = declaredPageRoutes(html);
  if (declaredRoutes && !sameArray(declaredRoutes, htmlRoutes)) fail(`${slug}: pageIds is not a complete ordered inventory of course-page sections.`);
  for (const route of htmlRoutes) {
    const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`<section\\b[^>]*\\bid=["']${escapedRoute}["']`, "i").test(html)) fail(`${slug}: declared page #${route} has no section.`);
    if (!new RegExp(`data-page-target=["']${escapedRoute}["']`, "i").test(html)) fail(`${slug}: declared page #${route} has no navigation target.`);
  }
  const metadataRoutes = (project.authoring?.learnerSurfaces?.surfaces ?? []).map((surface: { route?: string }) => String(surface.route ?? "").replace(/^#/, ""));
  const contractRoutes = contract.learnerCourse?.routes ?? [];
  if (!sameArray(metadataRoutes, htmlRoutes)) fail(`${slug}: learner-surface metadata is not a complete ordered route inventory.`);
  if (contract.learnerCourse?.enabled !== true || !sameArray(contractRoutes, htmlRoutes)) fail(`${slug}: E2E route inventory is incomplete or out of order.`);
  const evidenceScenarios = contract.learnerCourse.evidenceScenarios ?? (contract.learnerCourse.evidenceScenario ? [contract.learnerCourse.evidenceScenario] : []);
  if (!evidenceScenarios.some((scenario: { route?: string; collectionId?: string; responseId?: string }) => {
    if (scenario.route !== "core-vocabulary") return false;
    return conceptIds.some((conceptId) => scenario.collectionId === `${slug}:core-vocabulary:${conceptId}:collection`
      && scenario.responseId === `${slug}:core-vocabulary:${conceptId}:definition`);
  })) fail(`${slug}: E2E Core Vocabulary evidence scenario is missing.`);

  console.log(`PASS ${slug}: ${expectation.count} concepts, ${htmlRoutes.length} learner routes`);
}

console.log(`PASS all ${Object.keys(courses).length} active ELA Core Vocabulary courses (${Array.from(fingerprints.keys()).length} distinct inventories).`);
