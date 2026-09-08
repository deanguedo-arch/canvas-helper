import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareReviewUnit, parseReviewUnits, REVIEW_PROJECTS } from '../package-biology30-review.js';

test('review A selects and reconciles the current 13-lesson Pilot 2 rather than production A', async () => {
  const result = await prepareReviewUnit(process.cwd(), 'A');
  assert.equal(REVIEW_PROJECTS.A, 'biology30-unit-a-pilot-2');
  assert.equal(result.summary.teachingCount, 13);
  assert.equal(result.summary.practiceItemCount, 86);
  assert.equal(result.summary.requiredPracticeItemCount, 80);
  const responses = JSON.parse(result.entries.get('metadata/response-capacities.json')!.toString());
  const seminar = responses.filter((x: any) => x.id.includes(':review-seminar:'));
  assert.equal(seminar.length, 3);
  assert.ok(seminar.every((x: any) => x.limit === 900));
  assert.ok(result.entries.has('metadata/canonical/reading-level-report.json'));
  assert.ok(!result.entries.has('metadata/canonical/production-contract.json'));
  assert.equal(result.manifest.entrySha256, JSON.parse(result.entries.get('metadata/canonical/reading-level-report.json')!.toString()).workspaceSha256);
});
test('partial selections stay partial and malformed unit selection is rejected', () => {
  assert.deepEqual(parseReviewUnits(['--units', 'a,b']), ['A', 'B']);
  assert.deepEqual(parseReviewUnits([]), ['A','B','C','D']);
  assert.throws(() => parseReviewUnits(['--units']));
  assert.throws(() => parseReviewUnits(['--units', 'a,z']));
});
