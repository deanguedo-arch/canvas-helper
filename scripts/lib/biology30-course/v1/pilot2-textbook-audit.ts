import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { passageDigest } from "./pilot2-passage-audit.js";
import type { TopicContract } from "./pilot2-contract.js";
import type { CoreTeaching } from "./pilot2-instruction-audit.js";

type Guide = {
  id: string; physicalPage: number; printedPage: number; continuationPhysicalPage?: number;
  chapterPdf: string; teachingPartId: string; teachingTargetId: string;
  prerequisitePartIds?: string[]; prerequisiteTargetIds?: string[];
  preAttemptContext?: string; preAttemptContextPolicy?: string;
  attemptRequiredToReveal: boolean; countsForRequiredCompletion: boolean;
  [key: string]: unknown;
};
type Guides = { unit: string; groups: { id: string; chapter: number; textbookUnit: number | null; items: Guide[] }[] };
type Source = { chapter: number; pdfPath: string; sha256: string; pageCount: number };
type Review = {
  unit: string; teacherDecision: unknown;
  reviewedItems: {
    itemId: string; guideSha256: string;
    source: { path: string; sha256: string; physicalPages: number[]; printedPage: number };
    requiredPassages: { partId: string; paragraphsSha256: string }[];
    keyCheck: string; reviewMethod: string; optionalContextReviewed: boolean; teacherDecision: unknown;
  }[];
  pendingItemIds: string[];
};

export function textbookGuideDigest(guide: Guide) {
  return passageDigest(Object.fromEntries(Object.entries(guide).filter(([key]) =>
    !["revisionHistory", "reviewStatus", "bindingReview"].includes(key))));
}

/** Receipt integrity is necessary evidence, not an automated scientific judgment. */
export function validateBiology30TextbookReviews(guides: Guides, core: CoreTeaching, sources: Source[], review: Review, contract: TopicContract, requireComplete = false) {
  if (guides.unit !== core.unit || guides.unit !== review.unit || guides.unit !== contract.unit) throw new Error("Cross-unit textbook review");
  if (review.teacherDecision !== null) throw new Error("Textbook author review cannot imply teacher acceptance");
  const items = new Map(guides.groups.flatMap(group => group.items.map(item => [item.id, { item, chapter: group.chapter, group }] as const)));
  if (items.size !== guides.groups.reduce((n, g) => n + g.items.length, 0)) throw new Error("Duplicate textbook guide");
  const prose = new Map(core.parts.map(part => [part.id, part]));
  const accounted = new Set<string>();
  for (const receipt of review.reviewedItems) {
    const entry = items.get(receipt.itemId);
    if (!entry || accounted.has(receipt.itemId)) throw new Error(`Unknown or duplicate textbook review: ${receipt.itemId}`);
    accounted.add(receipt.itemId);
    const { item, chapter, group } = entry;
    if (textbookGuideDigest(item) !== receipt.guideSha256) throw new Error(`Stale textbook guide review: ${item.id}`);
    const source = sources.find(source => source.chapter === chapter);
    const pages = [item.physicalPage, ...(item.continuationPhysicalPage ? [item.continuationPhysicalPage] : [])];
    if (!source || receipt.source.path !== source.pdfPath || receipt.source.sha256 !== source.sha256
      || receipt.source.printedPage !== item.printedPage || passageDigest(receipt.source.physicalPages) !== passageDigest(pages)
      || pages.some(page => !Number.isInteger(page) || page < 1 || page > source.pageCount)
      || item.chapterPdf !== `assets/textbook/chapter-${chapter}.pdf`) throw new Error(`Textbook source binding drift: ${item.id}`);
    if (!item.attemptRequiredToReveal || item.countsForRequiredCompletion) throw new Error(`Textbook attempt boundary drift: ${item.id}`);
    const ids = [item.teachingPartId, ...item.prerequisitePartIds ?? []];
    const assessmentRoute = group.textbookUnit ? `${guides.unit.toLowerCase()}-review-seminar` : `${guides.unit.toLowerCase()}-chapter-${chapter}-practice`;
    const assessmentOrder = contract.requiredRoutes.indexOf(assessmentRoute);
    const partTopic = new Map(contract.topics.flatMap(topic => topic.parts.map(part => [part.id, topic.id] as const)));
    if (assessmentOrder < 0 || item.teachingTopicId !== partTopic.get(item.teachingPartId)
      || ids.some(id => !partTopic.has(id) || contract.requiredRoutes.indexOf(partTopic.get(id)!) >= assessmentOrder)) throw new Error(`Textbook practice precedes required prerequisite: ${item.id}`);
    for (const id of (item.furtherReadingPartIds as string[] | undefined) ?? []) {
      if (!partTopic.has(id) || !item.furtherReadingPolicy) throw new Error(`Unresolved textbook further reading: ${item.id}`);
    }
    const expected = new Set(ids);
    if (expected.size !== ids.length || receipt.requiredPassages.length !== expected.size
      || item.teachingTargetId !== `${item.teachingPartId}-teaching`
      || passageDigest(item.prerequisiteTargetIds ?? []) !== passageDigest((item.prerequisitePartIds ?? []).map(id => `${id}-teaching`))) throw new Error(`Textbook passage inventory drift: ${item.id}`);
    for (const passage of receipt.requiredPassages) {
      const part = prose.get(passage.partId);
      if (!expected.delete(passage.partId) || !part || passageDigest(part.paragraphs) !== passage.paragraphsSha256) throw new Error(`Stale textbook required passage: ${item.id}`);
    }
    if (expected.size || !receipt.keyCheck?.trim() || !receipt.reviewMethod?.trim()) throw new Error(`Incomplete textbook review: ${item.id}`);
    if (receipt.optionalContextReviewed !== Boolean(item.preAttemptContext)
      || (item.preAttemptContext && !item.preAttemptContextPolicy?.trim())) throw new Error(`Unreviewed optional textbook context: ${item.id}`);
    if (receipt.teacherDecision !== null) throw new Error("Textbook author review cannot imply teacher acceptance");
  }
  for (const id of review.pendingItemIds) {
    if (!items.has(id) || accounted.has(id)) throw new Error(`Unknown or duplicate pending textbook review: ${id}`);
    accounted.add(id);
  }
  if (accounted.size !== items.size) throw new Error("Textbook items missing from reviewed/pending inventory");
  if (requireComplete && review.pendingItemIds.length) throw new Error("Textbook reviews remain pending");
  return { unit: guides.unit, reviewedItems: review.reviewedItems.length, pendingItems: review.pendingItemIds.length,
    proof: "Exact guide, required-passage and source receipt integrity; author judgments remain separate from rendered proof and teacher acceptance." };
}

export async function auditBiology30TextbookReviews(repoRoot: string, unit: string, core: CoreTeaching, requireComplete = false) {
  const base = `projects/resources/biology30-production/v1/units/unit-${unit.toLowerCase()}`;
  const files = ["textbook-guides", "textbook", "textbook-passage-review", "contract"].map(name => `${base}/pilot2-${name}.json`);
  const bytes = await Promise.all(files.map(file => readFile(path.join(repoRoot, file))));
  const [guides, textbook, review, contract] = bytes.map(buffer => JSON.parse(buffer.toString("utf8")));
  const sources: Source[] = textbook.chapters;
  const resourceRoot = await realpath(path.join(repoRoot, "projects/resources/biology30-production/v1/pilot2/intake"));
  for (const source of sources) {
    const sourcePath = await realpath(path.join(repoRoot, source.pdfPath));
    const relative = path.relative(resourceRoot, sourcePath);
    if (relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) throw new Error("Textbook source escaped immutable intake");
    if (createHash("sha256").update(await readFile(sourcePath)).digest("hex") !== source.sha256) throw new Error(`Textbook source bytes changed: ${source.pdfPath}`);
  }
  return { report: validateBiology30TextbookReviews(guides, core, sources, review, contract, requireComplete),
    files: files.map((file, index) => ({ file, sha256: createHash("sha256").update(bytes[index]).digest("hex") })),
    sources: sources.map(source => ({ file: source.pdfPath, sha256: source.sha256 })) };
}
