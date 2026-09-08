import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {assertTopicReading, topicReadingEstimate} from '../lib/biology30-course/v1/pilot2-reading.js';

test('a dense teaching block fails even when easier passages dilute the lesson average', () => {
  const dense = 'Semiconservative replication coordinates complementary nucleotide polymerization.';
  const easy = 'The cell has a wall. The wall keeps its shape. Look at the wall. ';
  assert.ok(topicReadingEstimate(dense + ' ' + easy.repeat(20)).fleschKincaidGrade < 12);
  assert.throws(() => assertTopicReading([{id:'dense',paragraphs:[dense]},{id:'easy',paragraphs:[easy]}]), /revision: dense/);
});

test('paragraph and sentence ceilings apply even to familiar short words', () => {
  assert.throws(() => assertTopicReading([{id:'long-paragraph',paragraphs:['The cell has a wall. '.repeat(21)]}]), /long-paragraph/);
  assert.throws(() => assertTopicReading([{id:'long-sentence',paragraphs:['we see the cell and '.repeat(5) + 'we see it.']}]), /long-sentence/);
});

test('every current BCD core block passes; worked scaffolds remain identical in the local path', async () => {
  let total = 0;
  for (const unit of ['b','c','d']) {
    const base = `projects/resources/biology30-production/v1/units/unit-${unit}`;
    const core = JSON.parse(await readFile(`${base}/pilot2-content.json`,'utf8'));
    total += assertTopicReading(core.parts).partReports.length;
    const instruction = JSON.parse(await readFile(`${base}/pilot2-instruction.json`,'utf8'));
    const framing = JSON.parse(await readFile(`${base}/pilot2-topic-teaching.json`,'utf8'));
    for (const topic of framing.topics) for (const frame of topic.localWalkthrough.frames) {
      const example = instruction.parts.find((part: {partId:string}) => part.partId === frame.partId).workedExample;
      assert.deepEqual(frame.orderedExplanation, example.steps, frame.partId);
    }
  }
  assert.equal(total,127);
});
