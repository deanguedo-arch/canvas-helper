import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { load } from "cheerio";

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

const forbiddenLearnerReferences = [
  "RecVd-6g-IY",
  "ise.uvic.ca/Library/SLT/intro/introsubj.html",
  "internetshakespeare.uvic.ca/Library/SLT/intro/introsubj.html"
];

const ironySupportHashes: Record<string, string> = {
  "Template/cbestylesheet.css": "717b384c0bbbaf4e3711ea59e657cb2de9f5d5e18e2d0fbfb3f7051402a1deba",
  "Template/custom_scripts.js": "133f61839a836279f3e1444dad99e42d44a9166d4b769ac4330e024dc7742372"
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

function sameMembers(left: string[], right: string[]): boolean {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  return leftSet.size === left.length
    && rightSet.size === right.length
    && leftSet.size === rightSet.size
    && [...leftSet].every((value) => rightSet.has(value));
}

function declaredStringArray(html: string, name: string): string[] | undefined {
  const declaration = html.match(new RegExp(`const ${name}\\s*=\\s*(\\[[^;]+\\]);`, "s"))?.[1];
  if (!declaration) return undefined;
  const values = JSON.parse(declaration);
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string")) {
    fail(`${name} is not a string array.`);
  }
  return values;
}

function readWorkspaceText(filePath: string): string {
  const source = fs.readFileSync(filePath);
  if (source[0] === 0xff && source[1] === 0xfe) return source.subarray(2).toString("utf16le");
  if (source[0] === 0xfe && source[1] === 0xff) {
    const swapped = Buffer.from(source.subarray(2));
    for (let index = 0; index + 1 < swapped.length; index += 2) {
      [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
    }
    return swapped.toString("utf16le");
  }
  return source.toString("utf8");
}

function workspaceHtmlFiles(root: string): string[] {
  const files: string[] = [];
  const visit = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(entryPath);
      else if (entry.isFile() && /\.html?$/i.test(entry.name)) files.push(entryPath);
    }
  };
  visit(root);
  return files;
}

function assertNoControlCharacters(slug: string, workspaceRoot: string) {
  for (const filePath of workspaceHtmlFiles(workspaceRoot)) {
    const source = readWorkspaceText(filePath);
    const match = source.match(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u);
    if (match?.index !== undefined) {
      const line = source.slice(0, match.index).split(/\r?\n/).length;
      fail(`${slug}: ${path.relative(workspaceRoot, filePath)}:${line} contains an invalid control character.`);
    }
    for (const reference of forbiddenLearnerReferences) {
      if (source.includes(reference)) {
        fail(`${slug}: ${path.relative(workspaceRoot, filePath)} retains known-dead learner reference ${reference}.`);
      }
    }
  }
}

function assertIronySupportContract(slug: string, workspaceRoot: string) {
  if (slug !== "ela30-1-short-stories") return;
  const manifest = fs.readFileSync(path.join(workspaceRoot, "imsmanifest.xml"), "utf8");
  for (const [relativePath, expectedHash] of Object.entries(ironySupportHashes)) {
    const filePath = path.join(workspaceRoot, relativePath);
    if (!manifest.includes(`<file href="${relativePath}"`)) {
      fail(`${slug}: imsmanifest.xml does not declare recovered learner support file ${relativePath}.`);
    }
    const actualHash = createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
    if (actualHash !== expectedHash) {
      fail(`${slug}: recovered learner support file ${relativePath} drifted from its reviewed adaptation.`);
    }
  }
}

function isLocalReference(value: string): boolean {
  const normalized = value.trim();
  return Boolean(normalized)
    && !normalized.startsWith("#")
    && !normalized.startsWith("//")
    && !normalized.startsWith("/")
    && !/^[a-z][a-z\d+.-]*:/i.test(normalized);
}

function resolveLocalReference(sourceFile: string, workspaceRoot: string, value: string): string | undefined {
  if (!isLocalReference(value)) return undefined;
  const withoutFragment = value.split("#", 1)[0].split("?", 1)[0].trim();
  if (!withoutFragment) return undefined;
  let decoded = withoutFragment;
  try {
    decoded = decodeURI(withoutFragment);
  } catch {
    fail(`${path.relative(workspaceRoot, sourceFile)} has an invalid encoded local reference: ${value}`);
  }
  const resolved = path.resolve(path.dirname(sourceFile), decoded);
  const relative = path.relative(workspaceRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    fail(`${path.relative(workspaceRoot, sourceFile)} escapes the workspace with local reference ${value}.`);
  }
  return resolved;
}

function cssReferences(source: string): string[] {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  return Array.from(withoutComments.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi), (match) => match[2]);
}

function scriptAssetReferences(source: string): string[] {
  return Array.from(
    source.matchAll(/["']([^"']+\.(?:css|js|html?|png|jpe?g|gif|svg|webp|pdf|mp3|mp4|webm|woff2?)(?:[?#][^"']*)?)["']/gi),
    (match) => match[1]
  );
}

function assertReachableLocalResources(slug: string, workspaceRoot: string) {
  const entry = path.join(workspaceRoot, "index.html");
  const queue = [entry];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const sourceFile = queue.shift()!;
    if (visited.has(sourceFile)) continue;
    visited.add(sourceFile);
    const source = readWorkspaceText(sourceFile);
    const extension = path.extname(sourceFile).toLowerCase();
    const references: string[] = extension === ".css"
      ? cssReferences(source)
      : extension === ".js"
        ? scriptAssetReferences(source)
        : [];

    if (extension === ".html" || extension === ".htm") {
      const $ = load(source);
      $("*").each((_, element) => {
        const attributes = (element as { attribs?: Record<string, string> }).attribs ?? {};
        for (const [name, value] of Object.entries(attributes)) {
          if (["src", "href", "poster", "data", "action"].includes(name)
            || (name.startsWith("data-") && /(?:src|href)$/i.test(name))) references.push(value);
          if (name === "srcset") {
            references.push(...value.split(",").map((candidate) => candidate.trim().split(/\s+/, 1)[0]));
          }
          if (name === "style") references.push(...cssReferences(value));
        }
      });
      $("style").each((_, element) => {
        references.push(...cssReferences($(element).html() ?? ""));
      });
    }

    for (const reference of references) {
      const resolved = resolveLocalReference(sourceFile, workspaceRoot, reference);
      if (!resolved) continue;
      if (!fs.existsSync(resolved)) {
        fail(`${slug}: ${path.relative(workspaceRoot, sourceFile)} references missing local resource ${reference}.`);
      }
      if ([".html", ".htm", ".css", ".js"].includes(path.extname(resolved).toLowerCase())) queue.push(resolved);
    }
  }
}

function assertAccessibleLearnerMarkup(slug: string, html: string) {
  const $ = load(html);
  const elementTextById = new Map<string, string>();
  $("[id]").each((_, element) => {
    const id = $(element).attr("id");
    if (id) elementTextById.set(id, $(element).text().replace(/\s+/g, " ").trim());
  });
  const isExcluded = (element: Parameters<ReturnType<typeof load>>[0]) => {
    const node = $(element);
    return node.attr("hidden") !== undefined
      || node.attr("aria-hidden") === "true"
      || node.closest('template, [data-learner-surface="archive"]').length > 0;
  };
  const directName = (element: Parameters<ReturnType<typeof load>>[0]) => {
    const node = $(element);
    return [node.attr("aria-label"), node.attr("title")].some((value) => Boolean(value?.trim()));
  };

  $("textarea, select, input").each((_, element) => {
    const node = $(element);
    const type = (node.attr("type") ?? "").toLowerCase();
    if (type === "hidden" || isExcluded(element)) return;
    const id = node.attr("id");
    const labelledBy = (node.attr("aria-labelledby") ?? "").split(/\s+/).filter(Boolean);
    const labelledByText = labelledBy.some((labelId) => Boolean(elementTextById.get(labelId)));
    const explicitLabel = Boolean(id && $("label").filter((_, label) => $(label).attr("for") === id).text().trim());
    const wrappingLabel = Boolean(node.parents("label").first().text().trim());
    const valueName = ["button", "submit", "reset"].includes(type) && Boolean(node.attr("value")?.trim());
    if (!directName(element) && !labelledByText && !explicitLabel && !wrappingLabel && !valueName) {
      fail(`${slug}: learner ${element.tagName}${id ? `#${id}` : ""} needs a meaningful programmatic label.`);
    }
  });

  $("iframe").each((_, element) => {
    if (!isExcluded(element) && !directName(element)) {
      fail(`${slug}: learner iframe ${$(element).attr("src") ?? "without src"} needs a title or aria-label.`);
    }
  });

  $("a[href]").each((_, element) => {
    if (isExcluded(element)) return;
    const node = $(element);
    const text = node.text().replace(/\s+/g, " ").trim();
    const imageAlt = node.find("img[alt]").toArray().some((image) => Boolean($(image).attr("alt")?.trim()));
    if (!text && !imageAlt && !directName(element)) {
      fail(`${slug}: learner link ${node.attr("href")} has no accessible name.`);
    }
  });
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
  const workspaceRoot = path.join(projectRoot, "workspace");
  const html = readWorkspaceText(path.join(workspaceRoot, "index.html"));
  const project = JSON.parse(fs.readFileSync(path.join(projectRoot, "meta", "project.json"), "utf8"));
  const contract = JSON.parse(fs.readFileSync(path.join(projectRoot, "meta", "e2e-contract.json"), "utf8"));

  assertNoControlCharacters(slug, workspaceRoot);
  assertIronySupportContract(slug, workspaceRoot);
  assertReachableLocalResources(slug, workspaceRoot);
  assertAccessibleLearnerMarkup(slug, html);

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
  const routeTargets = Array.from(html.matchAll(/data-page-target=["']([^"']+)["']/gi), (match) => match[1]);
  for (const routeTarget of routeTargets) {
    if (!htmlRoutes.includes(routeTarget)) fail(`${slug}: data-page-target references missing learner route #${routeTarget}.`);
  }
  const $routes = load(html);
  $routes('a[href^="#"]').each((_, element) => {
    const hrefRoute = ($routes(element).attr("href") ?? "").replace(/^#/, "");
    if (!hrefRoute) return;
    if (!htmlRoutes.includes(hrefRoute)) fail(`${slug}: hash link references missing learner route #${hrefRoute}.`);
    const pageTarget = $routes(element).attr("data-page-target");
    if (pageTarget && pageTarget !== hrefRoute) {
      fail(`${slug}: hash link #${hrefRoute} disagrees with data-page-target #${pageTarget}.`);
    }
  });
  for (const route of htmlRoutes) {
    const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`<section\\b[^>]*\\bid=["']${escapedRoute}["']`, "i").test(html)) fail(`${slug}: declared page #${route} has no section.`);
    if (!new RegExp(`data-page-target=["']${escapedRoute}["']`, "i").test(html)) fail(`${slug}: declared page #${route} has no navigation target.`);
  }
  const metadataRoutes = (project.authoring?.learnerSurfaces?.surfaces ?? []).map((surface: { route?: string }) => String(surface.route ?? "").replace(/^#/, ""));
  const contractRoutes = contract.learnerCourse?.routes ?? [];
  if (!sameArray(metadataRoutes, htmlRoutes)) fail(`${slug}: learner-surface metadata is not a complete ordered route inventory.`);
  if (contract.learnerCourse?.enabled !== true || !sameArray(contractRoutes, htmlRoutes)) fail(`${slug}: E2E route inventory is incomplete or out of order.`);
  const allCompleteControls = Array.from(html.matchAll(/data-complete-id=["']([^"']+)["']/g), (match) => match[1]);
  const completeControls = [...new Set(allCompleteControls)];
  if (completeControls.length !== allCompleteControls.length) fail(`${slug}: learner completion control IDs must be unique.`);
  const completionIds = declaredStringArray(html, "completionIds");
  const lessonIds = declaredStringArray(html, "lessonIds");
  const progressIds = completionIds ?? lessonIds;
  if (progressIds) {
    if (!sameMembers(progressIds, completeControls)) {
      fail(`${slug}: progress IDs and learner completion controls do not describe the same items.`);
    }
  } else if (completeControls.length > 0) {
    const derivesVisibleLessons = /const visibleLessonIds\s*=\s*pageSections/s.test(html)
      && completeControls.every((completeId) => htmlRoutes.includes(completeId));
    if (!derivesVisibleLessons) {
      fail(`${slug}: progress IDs and learner completion controls do not describe the same items.`);
    }
  }
  const totalLessons = Number(html.match(/const totalLessons\s*=\s*(\d+)\s*;/)?.[1] ?? Number.NaN);
  if (Number.isFinite(totalLessons) && progressIds && totalLessons !== progressIds.length) {
    fail(`${slug}: totalLessons ${totalLessons} does not match ${progressIds.length} progress items.`);
  }
  if (progressIds) {
    $routes("[data-progress-count], [data-progress-count-inline]").each((_, element) => {
      const initialProgress = $routes(element).text().match(/\b\d+\s*\/\s*(\d+)\b/);
      if (initialProgress && Number(initialProgress[1]) !== progressIds.length) {
        fail(`${slug}: initial progress total ${initialProgress[1]} does not match ${progressIds.length} progress items.`);
      }
    });
    $routes(".completed-pill").each((_, element) => {
      const courseTotal = $routes(element).text().match(/\b(\d+)\s+course lessons\b/i);
      if (courseTotal && Number(courseTotal[1]) !== progressIds.length) {
        fail(`${slug}: displayed course total ${courseTotal[1]} does not match ${progressIds.length} progress items.`);
      }
    });
  }
  const evidenceScenarios = contract.learnerCourse.evidenceScenarios ?? (contract.learnerCourse.evidenceScenario ? [contract.learnerCourse.evidenceScenario] : []);
  if (!evidenceScenarios.some((scenario: { route?: string; collectionId?: string; responseId?: string }) => {
    if (scenario.route !== "core-vocabulary") return false;
    return conceptIds.some((conceptId) => scenario.collectionId === `${slug}:core-vocabulary:${conceptId}:collection`
      && scenario.responseId === `${slug}:core-vocabulary:${conceptId}:definition`);
  })) fail(`${slug}: E2E Core Vocabulary evidence scenario is missing.`);

  console.log(`PASS ${slug}: ${expectation.count} concepts, ${htmlRoutes.length} learner routes`);
}

console.log(`PASS all ${Object.keys(courses).length} active ELA Core Vocabulary courses (${Array.from(fingerprints.keys()).length} distinct inventories).`);
