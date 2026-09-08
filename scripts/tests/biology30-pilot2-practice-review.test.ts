import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { practiceItemDigest, validateBiology30PracticeKeys } from "../lib/biology30-course/v1/pilot2-practice-review.js";
import { practiceOptionOrder } from "../lib/biology30-course/v1/pilot2-practice-options.js";

async function load(unit: string) {
  const base = `projects/resources/biology30-production/v1/units/unit-${unit}`;
  const [practice, review] = await Promise.all(["practice", "practice-key-review"].map(async name => JSON.parse(await readFile(`${base}/pilot2-${name}.json`, "utf8"))));
  return { practice, review };
}

test("all practice keys have explicit derivations and cannot drop, duplicate or silently accept changed operations", async () => {
  for (const unit of ["b", "c", "d"]) {
    const x = await load(unit);
    assert.equal(validateBiology30PracticeKeys(x.practice, x.review, true).reviewedItems, x.practice.items.length);
    const missing = structuredClone(x); missing.review.reviewedItems.pop();
    assert.throws(() => validateBiology30PracticeKeys(missing.practice, missing.review), /missing from key/);
    const duplicate = structuredClone(x); duplicate.review.reviewedItems.push(duplicate.review.reviewedItems[0]);
    assert.throws(() => validateBiology30PracticeKeys(duplicate.practice, duplicate.review), /duplicate practice/);
    for (const field of ["prompt", "rationale", "misconceptionFeedback", "dataset", "prerequisitePartIds", "responseLimit"]) {
      const stale = structuredClone(x); stale.practice.items[0][field] = "changed";
      assert.throws(() => validateBiology30PracticeKeys(stale.practice, stale.review), /Stale practice key/);
    }
    const key = structuredClone(x), selected = key.practice.items.find((item: any) => item.kind === "multiple-choice");
    assert.ok(selected);
    selected.correctIndex = 1;
    key.review.reviewedItems.find((receipt: any) => receipt.itemId === selected.id).itemSha256 = practiceItemDigest(selected);
    assert.throws(() => validateBiology30PracticeKeys(key.practice, key.review), /key disagreement/);
    const pending = structuredClone(x); pending.review.pendingItemIds.push(pending.review.reviewedItems.pop().itemId);
    assert.equal(validateBiology30PracticeKeys(pending.practice, pending.review).pendingItems, 1);
    assert.throws(() => validateBiology30PracticeKeys(pending.practice, pending.review, true), /remain pending/);
    const accepted = structuredClone(x); accepted.review.reviewedItems[0].teacherDecision = "accepted";
    assert.throws(() => validateBiology30PracticeKeys(accepted.practice, accepted.review), /cannot imply teacher acceptance/);
  }
});

test("varied option presentation preserves canonical saved selection and feedback across reload and inventory changes", async () => {
  for (const unit of ["b", "c", "d"]) {
    const { practice } = await load(unit);
    const positions = [0, 0, 0, 0];
    for (const item of practice.items.filter((i: any) => i.kind === "multiple-choice")) {
      const before = JSON.stringify(item), options = practiceOptionOrder(item);
      assert.deepEqual(options, practiceOptionOrder(JSON.parse(before)));
      assert.deepEqual(options.map(x => x.value).sort(), ["0", "1", "2", "3"]);
      for (const option of options) {
        const restored = practiceOptionOrder(item).find(o => o.value === option.value)!;
        assert.equal(restored.text, item.options[Number(option.value)]);
        assert.equal(typeof item.misconceptionFeedback[Number(restored.value)], "string");
      }
      positions[options.findIndex(o => Number(o.value) === item.correctIndex)]++;
      assert.equal(JSON.stringify(item), before);
    }
    assert(positions.every(n => n > 0), `All four answer positions must occur in ${unit}: ${positions}`);
  }
});
