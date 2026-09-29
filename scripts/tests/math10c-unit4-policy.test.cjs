const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const policyPath = path.resolve(__dirname, '../../projects/math10c-unit4-pilot/workspace/assets/chapter4-policy.js');
const sandbox = { Date };
sandbox.globalThis = sandbox;
vm.runInNewContext(fs.readFileSync(policyPath, 'utf8'), sandbox, { filename: policyPath });
const policy = sandbox.Chapter4Policy;

const start = Date.UTC(2026, 8, 24, 12);
const record = { transferSessionId: 'session-a', retentionAvailableAt: start + policy.RETENTION_DELAY_MS };
assert.equal(policy.retentionAdmission(record, start + policy.RETENTION_DELAY_MS + 1, 'session-a').allowed, false, 'same session must not earn retention');
assert.equal(policy.retentionAdmission(record, start + policy.RETENTION_DELAY_MS - 1, 'session-b').allowed, false, 'early later session must wait');
assert.equal(policy.retentionAdmission(record, start + policy.RETENTION_DELAY_MS, 'session-b').allowed, true, 'later session after 48 hours may enter');

assert.equal(policy.VERSION,'c4-mastery-policy-3');
const bounded = { version:'chapter4-review-state-4', policyVersion:policy.VERSION, tasks:{}, targetScores:{}, evidence:{}, exposures:{} };
for (let lesson=41; lesson<=48; lesson++) {
  bounded.tasks[String(lesson)] = {
    variant:'retention2', answers:{a:'x'.repeat(64),b:'y'.repeat(64),c:'z'.repeat(64),d:'w'.repeat(64)},
    firstSubmission:{answers:{a:'f'.repeat(64),b:'f'.repeat(64),c:'f'.repeat(64),d:'f'.repeat(64)},helpBefore:false,checkedAt:'2026-09-24T12:00:00.000Z'},
    finalSubmission:{answers:{a:'x'.repeat(64),b:'y'.repeat(64),c:'z'.repeat(64),d:'w'.repeat(64)},checkedAt:'2026-09-24T12:01:00.000Z'},
    history:Array.from({length:6},(_,i)=>({variant:['initial','fresh','fresh2','transfer','transfer2','retention'][i],answers:{a:'a'.repeat(64),b:'b'.repeat(64),c:'c'.repeat(64),d:'d'.repeat(64)},checks:4,help:true,practiceCredit:25,firstSubmission:{answers:{a:'i'.repeat(64),b:'i'.repeat(64),c:'i'.repeat(64),d:'i'.repeat(64)},helpBefore:true,checkedAt:'2026-09-24T12:00:00.000Z'},finalSubmission:{answers:{a:'a'.repeat(64),b:'b'.repeat(64),c:'c'.repeat(64),d:'d'.repeat(64)},checkedAt:'2026-09-24T12:01:00.000Z'}}))
  };
}
const admitted = policy.preflight(bounded);
assert.equal(admitted.allowed, true);
const compactable = JSON.parse(JSON.stringify(bounded));
Object.values(compactable.tasks).forEach((task) => {
  task.closed = true;
  task.firstSubmission = { answers: { a: 'first' }, helpBefore: false, checkedAt: '2026-09-24T12:00:00.000Z' };
  task.finalSubmission = { answers: { a: 'final' }, checkedAt: '2026-09-24T12:01:00.000Z' };
  task.lastResult = { fields: { a: { correct: true, hint: 'x'.repeat(5000) } } };
});
const compacted = policy.preflight(compactable);
assert.equal(compacted.allowed, true);
assert.equal(compacted.compacted, true);
assert.equal(JSON.stringify(compacted.state.targetScores), JSON.stringify(compactable.targetScores));
Object.keys(compactable.tasks).forEach((id) => {
  assert.equal(JSON.stringify(compacted.state.tasks[id].answers), JSON.stringify(compactable.tasks[id].answers));
  assert.equal(JSON.stringify(compacted.state.tasks[id].firstSubmission), JSON.stringify(compactable.tasks[id].firstSubmission));
  assert.equal(JSON.stringify(compacted.state.tasks[id].finalSubmission), JSON.stringify(compactable.tasks[id].finalSubmission));
  assert.equal(JSON.stringify(compacted.state.tasks[id].history.map((item) => item[5])), JSON.stringify(compactable.tasks[id].history.map((item) => item.firstSubmission)));
  assert.equal(JSON.stringify(compacted.state.tasks[id].history.map((item) => item[6])), JSON.stringify(compactable.tasks[id].history.map((item) => item.finalSubmission)));
  assert.equal(compacted.state.tasks[id].history.every((item) => Array.isArray(item) && item.length === 9), true);
  assert.equal(Object.hasOwn(compacted.state.tasks[id], 'lastResult'), false);
});
const oversized = JSON.parse(JSON.stringify(bounded));
oversized.extra = 'q'.repeat(policy.MAX_APPLICATION_CHARS);
assert.equal(policy.preflight(oversized).allowed, false, 'oversized protected evidence must fail rather than truncate');
console.log(`Math 10C Chapter 4 policy tests passed: 48-hour later-session gate; modeled state ${admitted.characters}/${admitted.limit}; protected compaction preserves evidence; oversized state refused.`);
