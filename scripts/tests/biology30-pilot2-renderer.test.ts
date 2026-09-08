import test from "node:test";
import assert from "node:assert/strict";
import { load } from "cheerio";
import { rendererFixture, textbookFixture } from "./fixtures/biology30-pilot2/renderer.js";
import { renderBiology30Topic, renderTopicFigure } from "../lib/biology30-course/v1/pilot2-render-topic.js";
import { renderTopicDataset } from "../lib/biology30-course/v1/pilot2-render-controls.js";

test("synthetic topic renderer preserves teaching, unique targets, labels and hidden attempt feedback",()=>{
  const input=rendererFixture(),html=renderBiology30Topic(input.contract.topics[0].id,input),$=load(html),ids=$('[id]').map((_i,node)=>$(node).attr('id')).get();
  assert.equal(new Set(ids).size,ids.length);
  assert.equal($('script').length,0);assert.equal($('img[onerror]').length,0);
  assert.ok($('body').text().includes('<script>must remain text</script>'));
  assert.equal($('[data-response-id]').length,0);
  assert.equal($('[data-pilot2-response]').length,4);
  for(const node of $('[data-pilot2-response]').toArray())assert.equal($(`label[for="${$(node).attr('id')}"]`).length,1);
  assert.equal($('[data-pilot2-check][disabled]').length,2);assert.equal($('[data-pilot2-feedback][hidden]').length,2);
  assert.equal($('details.p2-advanced[open]').length,0);assert.equal($('[data-pilot2-optional-flag]').length,1);
  assert.equal($('figure img[width][height][alt]').length,2);assert.equal($('figure').map((_i,node)=>$(node).attr('id')).get().length,2);
  assert.equal($('table th[scope="col"]').length,4);assert.equal($('table th[scope="row"]').length,3);
  assert.equal($('.p2-advanced table caption').text(),'Symbol comparison');
  const missing=structuredClone(input);missing.figures=[];assert.throws(()=>renderBiology30Topic(input.contract.topics[0].id,missing),/Missing complete teaching\/figure/);
  const unsafe=structuredClone(input.figures[0]);unsafe.src="https://example.com/image.svg";assert.throws(()=>renderTopicFigure(unsafe),/unsafe figure/);
  assert.throws(()=>renderTopicDataset({columns:["A"],rows:[[1,2]]},"Malformed"),/column inventory/);
});

import { renderTopicTextbookQuestion } from "../lib/biology30-course/v1/pilot2-render-textbook.js";
test("textbook renderer keeps correction/context before attempt and uses physical PDF pages",()=>{
 const input=rendererFixture(),book=textbookFixture(),html=renderTopicTextbookQuestion(book,input.contract,input.state),$=load(html);
 assert.ok(html.indexOf(book.preAttemptSourceNotice)<html.indexOf("data-pilot2-textbook-attempt"));
 assert.ok(html.indexOf(book.preAttemptContext)<html.indexOf("data-pilot2-textbook-attempt"));
 assert.equal($("a[href=\"assets/textbook/chapter-14.pdf#page=5\"]").length,1);
 assert.equal($("a[href=\"assets/textbook/chapter-14.pdf#page=6\"]").length,1);
 assert.equal($("#fixture-textbook-guide[hidden]").length,1);
 assert.equal($("[data-pilot2-return-focus=\"b-topic-fixture-comparison-teaching\"]").length,1);
 assert.throws(()=>renderTopicTextbookQuestion({...book,countsForRequiredCompletion:true},input.contract,input.state),/Invalid textbook renderer/);
});
