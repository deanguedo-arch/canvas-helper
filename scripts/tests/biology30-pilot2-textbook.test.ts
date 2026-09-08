import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { auditBiology30TextbookReviews, textbookGuideDigest, validateBiology30TextbookReviews } from "../lib/biology30-course/v1/pilot2-textbook-audit.js";

const load = async (unit: string) => {
  const root = `projects/resources/biology30-production/v1/units/unit-${unit}`;
  const [guides, core, textbook, review, contract] = await Promise.all(["textbook-guides", "content", "textbook", "textbook-passage-review", "contract"]
    .map(async name => JSON.parse(await readFile(`${root}/pilot2-${name}.json`, "utf8"))));
  return { guides, core, sources: textbook.chapters, review, contract };
};

test("textbook receipts account for every item and keep unfinished reviews pending", async () => {
  for (const unit of ["b", "c", "d"]) {
    const x = await load(unit);
    const total = x.guides.groups.reduce((n: number, g: any) => n + g.items.length, 0);
    const actual = await auditBiology30TextbookReviews(process.cwd(), unit.toUpperCase(), x.core);
    assert.equal(actual.report.reviewedItems + actual.report.pendingItems, total);
    const check = () => validateBiology30TextbookReviews(x.guides, x.core, x.sources, x.review, x.contract, true);
    if (x.review.pendingItemIds.length) assert.throws(check, /remain pending/); else assert.equal(check().pendingItems, 0);
    const missing = structuredClone(x.review);
    if (missing.pendingItemIds.length) missing.pendingItemIds.pop(); else missing.reviewedItems.pop();
    assert.throws(() => validateBiology30TextbookReviews(x.guides, x.core, x.sources, missing, x.contract), /missing from reviewed/);
  }
});

test("textbook evidence rejects source, prose, guide, context and target drift", async () => {
  const original = await load("b");
  const check = (x = original) => validateBiology30TextbookReviews(x.guides, x.core, x.sources, x.review, x.contract, true);
  const guide = (x: typeof original) => x.guides.groups[0].items[0];
  for (const field of ["guide", "preAttemptSourceNotice", "preAttemptContext", "teachingTargetId"]) {
    const x = structuredClone(original); guide(x)[field] = "changed";
    assert.throws(() => check(x), /Stale textbook guide/);
  }
  const prose = structuredClone(original);
  prose.core.parts[0].paragraphs[0] += " A changed mechanism.";
  assert.throws(() => check(prose), /Stale textbook required passage/);
  const source = structuredClone(original); source.sources[0].sha256 = "0".repeat(64);
  assert.throws(() => check(source), /source binding drift/);
  const page = structuredClone(original); page.review.reviewedItems[0].source.physicalPages = [999];
  assert.throws(() => check(page), /source binding drift/);
  const target = structuredClone(original); guide(target).prerequisitePartIds = ["unknown"];
  target.review.reviewedItems[0].guideSha256 = textbookGuideDigest(guide(target));
  assert.throws(() => check(target), /passage inventory drift|precedes required prerequisite/);
  const future = structuredClone(original);
  guide(future).prerequisitePartIds = [future.core.parts.at(-1).id];
  guide(future).prerequisiteTargetIds = [future.core.parts.at(-1).id + "-teaching"];
  future.review.reviewedItems[0].guideSha256 = textbookGuideDigest(guide(future));
  assert.throws(() => check(future), /precedes required prerequisite/);
  const duplicate = structuredClone(original); duplicate.review.reviewedItems.push(duplicate.review.reviewedItems[0]);
  assert.throws(() => check(duplicate), /duplicate textbook review/);
  const acceptance = structuredClone(original); acceptance.review.reviewedItems[0].teacherDecision = "accepted";
  assert.throws(() => check(acceptance), /cannot imply teacher acceptance/);
  const gate = structuredClone(original); guide(gate).attemptRequiredToReveal = false;
  gate.review.reviewedItems[0].guideSha256 = textbookGuideDigest(guide(gate));
  assert.throws(() => check(gate), /attempt boundary drift/);
});
