const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sandbox = {};
sandbox.globalThis = sandbox;
for (const file of ['chapter4-math.js', 'chapter4-checkers.js']) {
  const full = path.resolve(__dirname, '../../projects/math10c-unit4-pilot/workspace/assets', file);
  vm.runInNewContext(fs.readFileSync(full, 'utf8'), sandbox, { filename: full });
}
const { normalize, tasks, checkTask } = sandbox.Chapter4Checkers;
const { variants, getTask } = sandbox.Chapter4Checkers;

const correct = {
  '41': { exact:'12', lower:'8', upper:'9', classify:'irrational', order:'7, √50, 8' },
  '42': { coefficient:'3', index:'3', radicand:'54', mixed:'5√3', entire:'√28', verify:'yes' },
  '43': { product:'x^11', quotient:'y⁶', zero:'1', restriction:'a ≠ 0', combined:'4x³y²' },
  '44': { power:'x¹²', product:'8x³y⁶', quotient:'9x²/4', combined:'x⁷y' },
  '45': { reciprocal:'1/x⁴', rewrite:'3y/x²', evaluate:'9/4', restriction:'x != 0' },
  '46': { square:'9', cube:'9', radical:'4rt(x^3)', domain:'no' },
  '47': { law:'powerofapower', simplify:'4x', model:'48', invalid:'addition', reason:'notmultiplication' },
  '48': { length:'5', exponent:'125^(1/3)', operation:'cuberoot', unit:'cm', strategy:'exact' }
};

assert.equal(Object.keys(tasks).length, 8);
for (const [id, answers] of Object.entries(correct)) {
  const result = checkTask(id, answers);
  assert.equal(result.correct, true, `task ${id} should accept its reviewed answer set`);
  const first = Object.keys(tasks[id].fields)[0];
  const wrong = { ...answers, [first]: 'definitely wrong' };
  const wrongResult = checkTask(id, wrong);
  assert.equal(wrongResult.correct, false, `task ${id} should reject a wrong component`);
  assert.equal(wrongResult.fields[first].correct, false);
  const incomplete = { ...answers, [first]: '' };
  const incompleteResult = checkTask(id, incomplete);
  assert.equal(incompleteResult.fields[first].blank, true);
  assert.equal(incompleteResult.fields[first].hint, '');
}

for (const id of Object.keys(tasks)) {
  for (const variant of ['fresh', 'fresh2', 'transfer', 'transfer2', 'retention', 'retention2']) {
    const task = getTask(id, variant);
    const answers = Object.fromEntries(Object.entries(task.fields).map(([name, config]) => [name, config.answers[0]]));
    assert.equal(checkTask(id, answers, variant).correct, true, `${id}/${variant} should accept its reviewed answer set`);
    assert.ok(task.prompt.length > 30, `${id}/${variant} needs a substantive prompt`);
  }
}

assert.equal(normalize(' 4 × x³ y² '), '4*x^3y^2');
assert.equal(checkTask('43', correct['43']).fields.restriction.correct, true);
assert.equal(checkTask('42', correct['42']).fields.mixed.correct, true);
assert.equal(sandbox.Chapter4Math.classify({answers:['5sqrt3'],contract:{kind:'expression',form:'simplified-radical'}},'sqrt(3)*5').correct,true);
assert.equal(sandbox.Chapter4Math.classify({answers:['8a^3b^6'],contract:{kind:'expression'}},'8b^6a^3').correct,true);
assert.equal(sandbox.Chapter4Math.classify({answers:['9m^2/16'],contract:{kind:'expression'}},'(9/16)*m^2').correct,true);
assert.equal(sandbox.Chapter4Math.classify({answers:['27/8'],contract:{kind:'expression'}},'3.375').correct,true);
assert.equal(sandbox.Chapter4Math.classify({answers:['x!=0'],contract:{kind:'restriction'}},'x − 0 ≠ 0').correct,false);
assert.equal(sandbox.Chapter4Math.classify({answers:['5sqrt3'],contract:{kind:'expression',form:'simplified-radical'}},'sqrt75').status,'valid_intermediate_step');
assert.equal(sandbox.Chapter4Math.equivalent('-2^2','-4'),true,'exponentiation binds before a leading sign');
assert.equal(sandbox.Chapter4Math.equivalent('-2^2','4'),false,'a leading negative is not swallowed into the squared base');
assert.equal(sandbox.Chapter4Math.equivalent('(-2)^2','4'),true,'parentheses control the signed base');
assert.equal(sandbox.Chapter4Math.equivalent('sqrt(x^2)','x'),false,'principal square root preserves the absolute-value distinction');
assert.equal(sandbox.Chapter4Math.equivalent('sqrt(x^4)','x^2'),true,'an even resulting power is nonnegative over the real domain');
console.log('Math 10C Chapter 4 checker tests passed: semantic equivalence, required form, Unicode normalization, 8 initial tasks and 48 versioned variants.');
