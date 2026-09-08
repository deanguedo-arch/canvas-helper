import { readFile, readdir, realpath } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

export const BIOLOGY30_TOPIC_PROFILE = "pilot2-topic-sequence-v1";
export const BIOLOGY30_TOPIC_UNITS = { B: { lessons: 8, routes: 12, required: 1200, optional: 240 }, C: { lessons: 18, routes: 23, required: 2400, optional: 480 }, D: { lessons: 4, routes: 8, required: 900, optional: 180 } } as const;
export type TopicUnit = keyof typeof BIOLOGY30_TOPIC_UNITS;

export type TopicContract = {
  schemaVersion: 1;
  profileId: typeof BIOLOGY30_TOPIC_PROFILE;
  unit: TopicUnit;
  status: "draft" | "frozen";
  teacherAcceptance: null;
  requiredMinutes: number;
  optionalMinutes: number;
  topics: { id: string; title: string; chapter: number; planRowId: string; slideNumbers: number[]; parts: { id: string; title: string; outcomeIds: string[]; operation: string; concepts: string[] }[] }[];
  requiredRoutes: string[];
  guidedQuestionsPerTopic: 2;
  reviewGates: Record<string, { status: "pending" | "passed"; evidence: string[]; evidenceSha256?: Record<string, string> }>;
  freezeEvidence?: { designSha256: string; inputs: Record<string, string> };
  sourceManifestSha256: string;
  baselineWorkspaceSha256: string;
};

export const TOPIC_REVIEW_GATES = ["sourceDispositions", "curriculumAtomicMap", "performanceColumns", "oldSectionDispositions", "practiceAndKeys", "textbookFoliosAndGuides", "vocabularyAndFirstUse", "figuresAndRights", "captionsAndLocalPaths", "advancedAndTiming", "investigations", "stateAndMigration", "transferRules"] as const;

const resourceRoot = "projects/resources/biology30-production/v1";
const sha256 = (bytes: string | Buffer) => createHash("sha256").update(bytes).digest("hex");
const validHash = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);

// Exclude only review bookkeeping. Every routing, teaching, time and source-boundary
// declaration (including future fields) remains part of the reviewed design.
export function biology30TopicDesignSha256(contract: TopicContract) {
  const { status: _status, reviewGates: _gates, freezeEvidence: _freeze, ...design } = contract;
  const canonical = (value: unknown): unknown => Array.isArray(value) ? value.map(canonical)
    : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, canonical(entry)])) : value;
  return sha256(JSON.stringify(canonical(design)));
}

async function checkedReviewBytes(repoRoot: string, file: string) {
  // Review evidence is restricted to this resource boundary. In particular, a
  // receipt cannot turn an arbitrary local or absolute path into a build input.
  if (typeof file !== "string" || file.includes("\\") || path.posix.normalize(file) !== file || !file.startsWith(`${resourceRoot}/`)) {
    throw new Error(`Unsafe Biology review path: ${file}`);
  }
  const allowed = await realpath(path.join(repoRoot, resourceRoot));
  const target = await realpath(path.join(repoRoot, file));
  if (!target.startsWith(`${allowed}${path.sep}`)) throw new Error(`Biology review path escapes through a symlink: ${file}`);
  return readFile(target);
}

export async function verifyBiology30TopicReviewEvidence(repoRoot: string, contract: TopicContract) {
  let evidenceFiles = 0;
  for (const gateName of TOPIC_REVIEW_GATES) {
    const gate = contract.reviewGates[gateName];
    if (gate.status !== "passed") continue;
    for (const file of gate.evidence) {
      if (sha256(await checkedReviewBytes(repoRoot, file)) !== gate.evidenceSha256?.[file]) throw new Error(`Stale Biology review evidence: ${gateName}: ${file}`);
      evidenceFiles++;
    }
  }
  if (contract.status !== "frozen") return { evidenceFiles, frozenInputs: 0 };
  const freeze = contract.freezeEvidence;
  if (!freeze || freeze.designSha256 !== biology30TopicDesignSha256(contract)) throw new Error("Biology frozen design has changed or lacks its exact review hash");
  const folder = `${resourceRoot}/units/unit-${contract.unit.toLowerCase()}`;
  const expected = (await readdir(path.join(repoRoot, folder)))
    .filter(name => name.startsWith("pilot2-") && name.endsWith(".json") && name !== "pilot2-contract.json")
    .map(name => `${folder}/${name}`);
  const actual = Object.keys(freeze.inputs);
  if (expected.some(file => !actual.includes(file)) || !actual.length) throw new Error("Biology frozen input inventory is incomplete");
  for (const [file, hash] of Object.entries(freeze.inputs)) {
    if (!validHash(hash) || sha256(await checkedReviewBytes(repoRoot, file)) !== hash) throw new Error(`Stale Biology frozen input: ${file}`);
  }
  return { evidenceFiles, frozenInputs: actual.length };
}

export function validateBiology30TopicContract(contract: TopicContract, forRendering = false) {
  const target = BIOLOGY30_TOPIC_UNITS[contract.unit];
  if (!target || contract.schemaVersion !== 1 || contract.profileId !== BIOLOGY30_TOPIC_PROFILE) throw new Error("Unsupported Biology topic contract");
  if (contract.status !== "draft" && contract.status !== "frozen") throw new Error("Unsupported Biology topic review status");
  if (contract.teacherAcceptance !== null) throw new Error("Topic preparation cannot record teacher acceptance");
  if (contract.topics.length !== target.lessons || contract.requiredRoutes.length !== target.routes) throw new Error("Teacher topic/required-route inventory drift");
  if (contract.requiredMinutes !== target.required || contract.optionalMinutes !== target.optional) throw new Error("Biology unit time budget drift");
  if (contract.guidedQuestionsPerTopic !== 2) throw new Error("Each named topic requires two guided questions");
  const ids = new Set<string>();
  for (const topic of contract.topics) {
    if (!topic.title.trim() || !topic.planRowId || !topic.slideNumbers.length || topic.parts.length < 2) throw new Error(`Incomplete topic contract: ${topic.id}`);
    for (const record of [topic, ...topic.parts]) {
      if (ids.has(record.id)) throw new Error(`Duplicate topic/part identity: ${record.id}`);
      ids.add(record.id);
    }
    for (const part of topic.parts) {
      if (!part.concepts.length || !part.outcomeIds.length || !part.operation.trim()) throw new Error(`Missing atomic planning inputs: ${part.id}`);
    }
    if (!contract.requiredRoutes.includes(topic.id)) throw new Error(`Topic missing required route: ${topic.id}`);
  }
  if (new Set(contract.requiredRoutes).size !== contract.requiredRoutes.length) throw new Error("Duplicate required route");
  for (const gate of TOPIC_REVIEW_GATES) {
    if (!contract.reviewGates[gate]) throw new Error(`Missing review gate: ${gate}`);
    if (!["pending", "passed"].includes(contract.reviewGates[gate].status)) throw new Error(`Unsupported review gate status: ${gate}`);
    if (contract.reviewGates[gate].status === "passed" && !contract.reviewGates[gate].evidence.length) throw new Error(`Review passed without evidence: ${gate}`);
    if (contract.reviewGates[gate].status === "passed") {
      const review = contract.reviewGates[gate];
      if (new Set(review.evidence).size !== review.evidence.length || review.evidence.some(file => !validHash(review.evidenceSha256?.[file]))) throw new Error(`Review passed without exact evidence hashes: ${gate}`);
    }
  }
  const pending = TOPIC_REVIEW_GATES.filter(key => contract.reviewGates[key].status !== "passed");
  if ((forRendering || contract.status === "frozen") && (contract.status !== "frozen" || pending.length)) {
    throw new Error(`Biology ${contract.unit} pre-render contract is not frozen; incomplete: ${pending.join(", ")}`);
  }
  if (contract.status === "frozen" && (!contract.freezeEvidence || contract.freezeEvidence.designSha256 !== biology30TopicDesignSha256(contract)
    || !Object.keys(contract.freezeEvidence.inputs).length || Object.values(contract.freezeEvidence.inputs).some(hash => !validHash(hash)))) {
    throw new Error("Biology frozen design or input hashes are missing or stale");
  }
  return { unit: contract.unit, topicCount: contract.topics.length, partCount: contract.topics.reduce((n, t) => n+t.parts.length, 0), requiredRouteCount: contract.requiredRoutes.length, readyForRendering: contract.status === "frozen" && pending.length === 0, pending };
}

export async function readBiology30TopicContract(repoRoot: string, unit: TopicUnit, forRendering = false) {
  const file = `projects/resources/biology30-production/v1/units/unit-${unit.toLowerCase()}/pilot2-contract.json`;
  const bytes = await readFile(path.join(repoRoot, file));
  const contract = JSON.parse(bytes.toString("utf8")) as TopicContract;
  const report = validateBiology30TopicContract(contract, forRendering);
  const evidence = await verifyBiology30TopicReviewEvidence(repoRoot, contract);
  return { contract, report: { ...report, evidence }, file, sha256: createHash("sha256").update(bytes).digest("hex") };
}
