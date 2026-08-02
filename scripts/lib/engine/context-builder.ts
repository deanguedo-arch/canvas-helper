import { Buffer } from "node:buffer";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";

import { assertExactProjectSlug, buildProjectAuthoringContext } from "../course-authoring/context.js";
import { type ProjectPaths } from "../types.js";

export const MAX_GENERATION_CONTEXT_BYTES = 16_000;
export const MAX_GENERATION_CONTEXT_IDS = 8;

const CONTEXT_ID_PATTERN = /^(unit|outcome|resource|lesson):([A-Za-z0-9][A-Za-z0-9._-]{0,511})$/;

type ContextKind = "unit" | "outcome" | "resource" | "lesson";
type ContextSelection = { kind: ContextKind; id: string; raw: string };
type JsonRecord = Record<string, unknown>;

export interface GenerationContextRequest {
  slug: string;
  roots: ProjectPaths;
  contextIds?: readonly string[];
  repoRoot?: string;
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isContainedPath(parentPath: string, candidatePath: string) {
  const relative = path.relative(parentPath, candidatePath);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function stringValue(record: JsonRecord, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function numberValue(record: JsonRecord, key: string) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringList(record: JsonRecord, key: string) {
  const value = record[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function recordList(record: JsonRecord, key: string) {
  const value = record[key];
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function stringProperties(record: JsonRecord, keys: readonly string[]) {
  return Object.fromEntries(
    keys.flatMap((key) => {
      const value = stringValue(record, key);
      return value === undefined ? [] : [[key, value]];
    })
  );
}

function stringListProperties(record: JsonRecord, keys: readonly string[]) {
  return Object.fromEntries(
    keys.map((key) => [key, stringList(record, key)]).filter(([, value]) => value.length > 0)
  );
}

export function parseGenerationContextIds(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error("Context IDs must be an array of typed stable IDs.");
  }
  if (value.length > MAX_GENERATION_CONTEXT_IDS) {
    throw new Error(`At most ${MAX_GENERATION_CONTEXT_IDS} context IDs may be selected.`);
  }

  const ids: string[] = [];
  const seen = new Set<string>();
  for (const rawId of value) {
    if (typeof rawId !== "string" || rawId.trim() !== rawId || !CONTEXT_ID_PATTERN.test(rawId)) {
      throw new Error("Context IDs must use unit:, outcome:, resource:, or lesson: followed by one stable ID.");
    }
    if (seen.has(rawId)) {
      throw new Error(`Context ID is duplicated: ${rawId}`);
    }
    seen.add(rawId);
    ids.push(rawId);
  }
  return ids;
}

function parseSelection(raw: string): ContextSelection {
  const match = CONTEXT_ID_PATTERN.exec(raw);
  if (!match) {
    throw new Error(`Invalid context ID: ${raw}`);
  }
  return { kind: match[1] as ContextKind, id: match[2], raw };
}

function deriveRepoRoot(request: GenerationContextRequest) {
  assertExactProjectSlug(request.slug);
  const repoRoot = path.resolve(request.repoRoot ?? path.join(request.roots.root, "..", ".."));
  const projectRoot = path.join(repoRoot, "projects", request.slug);
  if (path.resolve(request.roots.root) !== projectRoot || path.resolve(request.roots.metaDir) !== path.join(projectRoot, "meta")) {
    throw new Error(`Generation context paths do not match project "${request.slug}".`);
  }
  return repoRoot;
}

async function readJsonRecordWithin(metaDir: string, fileName: string) {
  const candidatePath = path.resolve(metaDir, fileName);
  if (!isContainedPath(path.resolve(metaDir), candidatePath)) {
    throw new Error(`Context file escapes project metadata: ${fileName}`);
  }

  try {
    const [realMetaDir, realCandidatePath] = await Promise.all([realpath(metaDir), realpath(candidatePath)]);
    if (!isContainedPath(realMetaDir, realCandidatePath)) {
      throw new Error(`Context file resolves outside project metadata through a symbolic link: ${fileName}`);
    }
    const parsed: unknown = JSON.parse(await readFile(realCandidatePath, "utf8"));
    if (!isRecord(parsed)) {
      throw new Error(`Context file must contain a JSON object: ${fileName}`);
    }
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

function compactUnit(unit: JsonRecord) {
  return {
    kind: "unit",
    ...stringProperties(unit, ["id", "title"]),
    ...(numberValue(unit, "sequence") === undefined ? {} : { sequence: numberValue(unit, "sequence") }),
    ...stringListProperties(unit, [
      "mustKnow",
      "assessedSkills",
      "requiredConcepts",
      "requiredSkills",
      "mandatoryVocabulary",
      "outcomeIds"
    ])
  };
}

function compactOutcome(outcome: JsonRecord) {
  return {
    kind: "outcome",
    ...stringProperties(outcome, ["id", "unitId", "title", "description"]),
    ...stringListProperties(outcome, [
      "mustKnow",
      "assessedSkills",
      "requiredConcepts",
      "requiredSkills",
      "mandatoryVocabulary",
      "prerequisiteOutcomeIds"
    ])
  };
}

function compactResource(resource: JsonRecord) {
  return {
    kind: "resource",
    ...stringProperties(resource, [
      "id",
      "relativePath",
      "kind",
      "extractionStatus",
      "titleGuess",
      "resourceCategory",
      "authorityRole"
    ]),
    ...(numberValue(resource, "chunkCount") === undefined ? {} : { chunkCount: numberValue(resource, "chunkCount") }),
    ...stringListProperties(resource, ["sectionLabels"])
  };
}

function compactSourceReference(reference: JsonRecord) {
  return {
    ...stringProperties(reference, ["resourceId", "resourceTitle", "resourceCategory", "authorityRole", "whySelected", "exampleSnippet"]),
    ...(Array.isArray(reference.locators) ? { locators: reference.locators } : {}),
    ...(Array.isArray(reference.pageRanges) ? { pageRanges: reference.pageRanges } : {})
  };
}

function compactLessonPacket(packet: JsonRecord) {
  return {
    kind: "lesson",
    ...stringProperties(packet, ["lessonId", "lessonTitle", "unitId"]),
    targetOutcomes: recordList(packet, "targetOutcomes").map((outcome) => stringProperties(outcome, ["id", "title"])),
    ...stringListProperties(packet, [
      "linkedAssessmentIds",
      "prerequisiteKnowledge",
      "requiredVocabulary",
      "coreConcepts",
      "misconceptions",
      "whatThisLessonMustPrepareStudentsToDo",
      "checksForUnderstanding",
      "guidedPracticeIdeas",
      "independentPracticeIdeas",
      "evidenceOfReadinessForAssessment",
      "examplesOrCases",
      "warnings"
    ]),
    sourceReferences: recordList(packet, "sourceReferences").map(compactSourceReference)
  };
}

function renderEvidence(selection: ContextSelection, evidence: unknown) {
  return `## Selected ${selection.kind} evidence: ${selection.id}\n\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\``;
}

function appendBoundedPart(parts: string[], value: string, label: string) {
  parts.push(value);
  const bytes = Buffer.byteLength(parts.join("\n\n"), "utf8");
  if (bytes > MAX_GENERATION_CONTEXT_BYTES) {
    parts.pop();
    throw new Error(`${label} would make the server-assembled generation context ${bytes} UTF-8 bytes; the limit is ${MAX_GENERATION_CONTEXT_BYTES}. Select fewer or narrower IDs.`);
  }
}

export async function buildGenerationContext(request: GenerationContextRequest): Promise<string> {
  const repoRoot = deriveRepoRoot(request);
  const contextIds = parseGenerationContextIds(request.contextIds);
  const { report, text: sourceBrief } = await buildProjectAuthoringContext(request.slug, repoRoot);
  if (!sourceBrief) {
    const issues = report.issues.map((issue) => issue.message).join(" ");
    throw new Error(`Generation context is unavailable until course:doctor passes.${issues ? ` ${issues}` : ""}`);
  }

  const parts: string[] = [];
  appendBoundedPart(
    parts,
    [
      "You are Canvas Helper's production artifact assistant inside the selected project boundary.",
      "Follow import -> normalize -> edit -> expand -> integrate -> export without repo sprawl.",
      "Use the canonical editable sources below. Preserve raw, exports, generated files, and unrelated projects.",
      "Selected evidence is optional and intentionally narrow; do not infer unselected catalog or blueprint content.",
      "Return only complete markdown code blocks headed by an exact canonical workspace path, for example **workspace/index.html**."
    ].join("\n"),
    "Base generation guidance"
  );
  appendBoundedPart(parts, sourceBrief, "Course authoring context");

  let blueprintPromise: Promise<JsonRecord | undefined> | undefined;
  let resourceCatalogPromise: Promise<JsonRecord | undefined> | undefined;
  let lessonIndexPromise: Promise<JsonRecord | undefined> | undefined;
  const loadBlueprint = () => (blueprintPromise ??= readJsonRecordWithin(request.roots.metaDir, "course-blueprint.json"));
  const loadResourceCatalog = () => (resourceCatalogPromise ??= readJsonRecordWithin(request.roots.metaDir, "resource-catalog.json"));
  const loadLessonIndex = () => (lessonIndexPromise ??= readJsonRecordWithin(request.roots.metaDir, "lesson-packets/index.json"));

  for (const rawId of contextIds) {
    const selection = parseSelection(rawId);
    let evidence: unknown;

    if (selection.kind === "unit") {
      const blueprint = await loadBlueprint();
      const unit = blueprint && recordList(blueprint, "units").find((entry) => stringValue(entry, "id") === selection.id);
      if (!unit) throw new Error(`Unknown unit context ID: ${selection.id}`);
      evidence = compactUnit(unit);
    } else if (selection.kind === "outcome") {
      const blueprint = await loadBlueprint();
      const outcome = blueprint && recordList(blueprint, "outcomes").find((entry) => stringValue(entry, "id") === selection.id);
      if (!outcome) throw new Error(`Unknown outcome context ID: ${selection.id}`);
      evidence = compactOutcome(outcome);
    } else if (selection.kind === "resource") {
      const catalog = await loadResourceCatalog();
      const resource = catalog && recordList(catalog, "resources").find((entry) => stringValue(entry, "id") === selection.id);
      if (!resource) throw new Error(`Unknown resource context ID: ${selection.id}`);
      evidence = compactResource(resource);
    } else {
      const index = await loadLessonIndex();
      const lesson = index && recordList(index, "lessonPackets").find((entry) => stringValue(entry, "lessonId") === selection.id);
      if (!lesson) throw new Error(`Unknown lesson context ID: ${selection.id}`);
      const packet = await readJsonRecordWithin(request.roots.metaDir, path.join("lesson-packets", `${selection.id}.json`));
      if (!packet || stringValue(packet, "lessonId") !== selection.id) {
        throw new Error(`Lesson packet is missing or does not match context ID: ${selection.id}`);
      }
      evidence = compactLessonPacket(packet);
    }

    appendBoundedPart(parts, renderEvidence(selection, evidence), `Selected ${selection.raw}`);
  }

  appendBoundedPart(parts, "Do not write files that are not explicitly listed as canonical editable sources.", "Output instruction");
  return parts.join("\n\n");
}
