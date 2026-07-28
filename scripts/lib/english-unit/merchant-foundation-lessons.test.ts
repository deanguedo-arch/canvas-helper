import assert from "node:assert/strict";
import test from "node:test";

import * as cheerio from "cheerio";

import {
  merchantFoundationInternals,
  MERCHANT_FOUNDATION_LESSON_IDS,
  MERCHANT_FOUNDATION_LESSON_TITLES,
  validateMerchantFoundationLessons
} from "./merchant-foundation-lessons.js";

test("Merchant foundation component consolidates the CBE and Othello donors into six clean lessons", () => {
  const lessons = merchantFoundationInternals.curatedLessons();
  validateMerchantFoundationLessons(lessons);
  assert.deepEqual(lessons.map((lesson) => lesson.id), [...MERCHANT_FOUNDATION_LESSON_IDS]);
  assert.deepEqual(lessons.map((lesson) => lesson.title), [...MERCHANT_FOUNDATION_LESSON_TITLES]);
  assert.ok(lessons.every((lesson) => lesson.text.length > 500));
  assert.match(lessons.map((lesson) => lesson.text).join(" "), /Dramatic script terminology/);
  assert.match(lessons.map((lesson) => lesson.text).join(" "), /soliloquy/i);
});

test("Merchant foundation lessons have no donor contamination, external links, embeds, or empty image alternatives", () => {
  for (const lesson of merchantFoundationInternals.curatedLessons()) {
    assert.doesNotMatch(`${lesson.title} ${lesson.html}`, /\b(?:Othello|Romeo and Juliet|ELA 20-1|ELA 30-1|Diploma|editorial review|admin note)\b/i);
    const $ = cheerio.load(lesson.html);
    assert.equal($("a[href], iframe, script").length, 0);
    $("img").each((_index, image) => {
      assert.match($(image).attr("src") ?? "", /^assets\/custom\/shakespeare-foundations\//);
      assert.ok(($(image).attr("alt") ?? "").trim());
    });
  }
});
