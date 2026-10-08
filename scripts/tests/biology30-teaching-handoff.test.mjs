import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {readLiteralBank, readableMarkdown} from '../export-biology30-teaching-handoff.mjs';

test('bank extraction supports only literal values and the authored array-map pattern', () => {
  const result = readLiteralBank('window.BANK={rows:[["axon",4]].map(([term,page])=>({term,ref:`p. ${page}`,next:page+1,previous:page-1,first:[term][0]}))};', 'BANK');
  assert.deepEqual(result, {rows: [{term: 'axon', ref: 'p. 4', next: 5, previous: 3, first: 'axon'}]});
  assert.throws(() => readLiteralBank('window.BANK={data:globalThis.process.exit()};', 'BANK'), /Unsupported/);
  assert.throws(() => readLiteralBank('window.BANK={get data(){return "side effect"}};', 'BANK'), /Nonliteral/);
  assert.throws(() => readLiteralBank('window.WRONG={};', 'BANK'), /Unexpected/);
});

test('readable extract keeps collapsed teaching, lists, tables, media and response identity', () => {
  const $ = load('<section id="lesson-01"><h1>Neuron</h1><p>Visible teaching.</p><details><summary>More vocabulary</summary><p>Closed text is still exported.</p><ol><li>Receive</li><li>Transmit</li></ol></details><table><tr><th>Structure</th><th>Role</th></tr><tr><td>Axon</td><td>Output</td></tr></table><img src="axon.png" alt="Follow the arrow"><a href="#reader">Textbook p. 372</a><input value="stable-option"><textarea></textarea><script>not learner text</script></section>');
  const output = readableMarkdown($, $('#lesson-01')[0]);
  for (const expected of ['# Neuron', 'Visible teaching.', 'Closed text is still exported.', '1. Receive', '2. Transmit', 'Structure | Role', 'Axon | Output', '![Follow the arrow](axon.png)', '[Textbook p. 372](#reader)', 'stable-option', 'no learner data exported']) assert.ok(output.includes(expected), expected);
  assert.ok(!output.includes('not learner text'));
});
