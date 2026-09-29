const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../../projects/math10c-unit4-pilot/workspace/assets');
const sandbox = {};
sandbox.globalThis = sandbox;
for (const file of ['chapter4-math.js', 'chapter4-checkers.js', 'chapter4-practice-data.js']) {
  const full = path.join(root, file);
  vm.runInNewContext(fs.readFileSync(full, 'utf8'), sandbox, { filename: full });
}

const data = sandbox.Chapter4PracticeData;
assert.ok(data, 'practice data must load with the shared checker normalization');
assert.deepEqual(Object.keys(data.banks), ['41', '42', '43', '44', '45', '46', '47', '48']);

const ids = new Set();
const targets = new Set();
for (const [lesson, bank] of Object.entries(data.banks)) {
  assert.equal(bank.length, 8, `lesson ${lesson} must have eight authored questions`);
  for (const question of bank) {
    assert.equal(ids.has(question.id), false, `duplicate question id ${question.id}`);
    ids.add(question.id);
    targets.add(question.target);
    assert.ok(question.prompt.length >= 10, `${question.id} needs a complete prompt`);
    assert.ok(question.hint.length >= 8, `${question.id} needs a useful hint`);
    assert.ok(question.solution.length >= 12, `${question.id} needs a worked resolution`);
    assert.equal(data.accepted(question, question.answers[0]), true, `${question.id} must accept its canonical answer`);
    assert.equal(data.accepted(question, 'definitely wrong'), false, `${question.id} must reject an unrelated answer`);
    assert.equal(data.byId(question.id).id, question.id);
  }
  const set = data.lessonSet(lesson, 0, 5);
  assert.equal(set.length, 5);
  assert.equal(new Set(set.map((q) => q.id)).size, 5);
  const tenSets = Array.from({ length: 10 }, (_, seed) => data.lessonSet(lesson, seed, 5)).flat();
  assert.equal(tenSets.length, 50);
  assert.equal(new Set(tenSets.map((q) => q.id)).size, 50, `lesson ${lesson} needs 50 stable identities`);
  assert.equal(new Set(tenSets.map((q) => q.fingerprint)).size, 50, `lesson ${lesson} needs 50 different mathematical instances`);
}

assert.equal(ids.size, 64);
assert.equal(targets.size, 32, 'all 32 Chapter 4 targets must be represented');
assert.equal(data.mixedSet(0).length, 8);
assert.equal(new Set(data.mixedSet(0).map((q) => q.target.slice(0, 5))).size, 8, 'mixed practice must cover every lesson');
assert.equal(data.reviewSet(0).length, 16);
assert.equal(new Set([...data.reviewSet(0), ...data.reviewSet(1)].map((q) => q.target)).size, 32, 'two balanced review sets must cover all 32 targets');
assert.equal(data.accepted(data.banks['44'][2], '8b^6a^3'), true);
assert.equal(data.accepted(data.banks['44'][4], '(9/16)*m^2'), true);
assert.equal(data.accepted(data.banks['45'][4], '3.375'), true);
assert.equal(data.errors.length, 8);
for (const question of data.errors) {
  assert.equal(data.accepted(question, question.answers[0]), true, `${question.id} canonical diagnosis must pass`);
}

console.log('Math 10C Chapter 4 practice tests passed: 50 unique generated instances per lesson, 32-target review union, semantic equivalence and preserved legacy questions.');
