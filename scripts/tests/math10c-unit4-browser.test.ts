import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const root = path.resolve(process.cwd(), 'projects/math10c-unit4-pilot/workspace');
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.json': 'application/json'
};

let browser: Browser;
let baseUrl = '';
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    if (relative.split('/').includes('..')) throw new Error('invalid path');
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) throw new Error('invalid path');
    const bytes = await readFile(file);
    response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    response.end(bytes);
  } catch {
    response.statusCode = 404;
    response.end('Not found');
  }
});

test.before(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  baseUrl = `http://127.0.0.1:${address.port}/index.html`;
  browser = await chromium.launch({ headless: true });
});
test.after(async () => { await browser.close(); server.close(); });

async function cleanPage(): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: 'load' });
  return page;
}

async function completeVisibleMasteryTask(page: Page, taskId: string) {
  const answers = await page.evaluate((id) => {
    const review=(window as any).Chapter4MasteryReview.getState().tasks[id];
    const task=(window as any).Chapter4Checkers.getTask(id,review.variant);
    return Object.fromEntries(Object.entries(task.fields).map(([name,config]:[string,any])=>[name,config.answers[0]]));
  },taskId);
  const section=page.locator(`[data-chapter4-task="${taskId}"]`);
  for(const [name,value] of Object.entries(answers)){
    const field=section.locator(`[data-field="${name}"]`);
    if(await field.evaluate(node=>node.tagName==='SELECT'))await field.selectOption(String(value));else await field.fill(String(value));
  }
  await section.locator('[data-check-task]').click();
}

test('all 22 learner routes render one page with working navigation', async () => {
  const page = await cleanPage();
  const routes = [
    'u4-overview','u4-ready','u4-41','u4-42','u4-43','u4-44','u4-45','u4-46','u4-47','u4-48',
    'u4-practice','u4-mixed','u4-errors','u4-review','u4-reference','u4-radical-lab','u4-exponent-lab',
    'u4-vocab','u4-resources','u4-work','u4-support-library'
  ];
  for (const route of routes) {
    assert.ok(await page.locator(`a[href="#${route}"]`).count(), `${route} needs a navigation link`);
    await page.evaluate((id) => { window.location.hash = id; }, route);
    await page.waitForFunction((id) => {
      const node = document.getElementById(id);
      return Boolean(node && !node.hidden);
    }, route);
    assert.equal(await page.locator(`#${route}`).isVisible(), true, `${route} should be visible`);
    assert.equal(await page.locator('main .course-page:visible').count(), 1, `${route} should be the only visible page`);
    assert.ok((await page.locator(`#${route} h1`).first().innerText()).trim().length > 3);
  }
  assert.equal((await page.locator('.guided-practice').count()) >= 8, true);
  assert.equal((await page.locator('.misconception').count()) >= 5, true);
  assert.equal(await page.locator('.support-library > details').count(), 8);
  await page.context().close();
});

test('all eight lessons have no serious or critical automated accessibility violations', async () => {
  const page = await cleanPage();
  for (let lesson = 41; lesson <= 48; lesson++) {
    await page.goto(baseUrl + `#u4-${lesson}`);
    const results = await new AxeBuilder({ page }).include(`#u4-${lesson}`).analyze();
    const blocking = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
    assert.deepEqual(blocking.map((violation) => ({ id: violation.id, nodes: violation.nodes.length })), [], `Lesson 4.${lesson - 40} accessibility failures`);
  }
  await page.context().close();
});

test('practice diagnoses, retains, recommends, and never raises mastery', async () => {
  const page = await cleanPage();
  await page.goto(baseUrl + '#u4-practice');
  assert.equal(await page.locator('#practice-set .practice-card').count(), 5);
  const first = page.locator('#practice-set .practice-card').first();
  const answer = first.locator('input');
  await first.getByRole('button', { name: 'Check answer' }).click();
  assert.match(await first.locator('[role="status"]').innerText(), /blank does not use a check/i);
  await answer.fill('definitely wrong');
  await first.getByRole('button', { name: 'Check answer' }).click();
  assert.equal(await answer.getAttribute('aria-invalid'), 'true');
  assert.match(await first.locator('[role="status"]').innerText(), /check 1 of 4/i);
  const expected = await page.evaluate(() => (window as any).Chapter4PracticeData.lessonSet('41', 0, 5)[0].answers[0]);
  await answer.fill(String(expected));
  await first.getByRole('button', { name: 'Check answer' }).click();
  assert.match(await first.locator('[role="status"]').innerText(), /correct/i);
  assert.match(await page.locator('#practice-recommendation').innerText(), /Lesson 4\.1/i);
  assert.match(await page.locator('#mastery-score').innerText(), /^0\.0/);
  await page.reload();
  assert.equal(await page.locator('#practice-set .practice-card').first().locator('input').inputValue(), String(expected));
  assert.match(await page.locator('#practice-set .practice-card').first().locator('[role="status"]').innerText(), /retained/i);
  await page.context().close();
});

test('error detective uses bounded decisions for the square-root misconception', async () => {
  const page = await cleanPage();
  await page.goto(baseUrl + '#u4-errors');
  const card = page.locator('#error-set .practice-card').first();
  assert.equal(await card.locator('[data-practice-field]').count(), 4);
  await card.locator('[data-practice-field="operation"]').selectOption('squaring70');
  await card.locator('[data-practice-field="lowerSquare"]').fill('35');
  await card.locator('[data-practice-field="upperSquare"]').fill('70');
  await card.locator('[data-practice-field="repair"]').fill('sqrt70=35');
  await card.getByRole('button', { name: 'Check diagnosis' }).click();
  assert.equal(await card.locator('.mastery-field.is-wrong').count(), 4);
  assert.match(await card.locator('[role="status"]').innerText(), /revise the red decisions/i);
  assert.equal(await card.locator('.field-hint:visible').count(), 4);
  await card.locator('[data-practice-field="operation"]').selectOption('divideby2');
  await card.locator('[data-practice-field="lowerSquare"]').fill('64');
  await card.locator('[data-practice-field="upperSquare"]').fill('81');
  await card.locator('[data-practice-field="repair"]').fill('8 < sqrt(70) < 9');
  await card.getByRole('button', { name: 'Check diagnosis' }).click();
  assert.match(await card.locator('[role="status"]').innerText(), /8<√70<9/i);
  assert.match(await page.locator('#mastery-score').innerText(), /^0\.0/);
  await page.context().close();
});

test('known cross-route mathematics cannot silently earn fresh evidence', async () => {
  const page=await cleanPage();
  await page.goto(baseUrl+'#u4-practice');
  assert.match(await page.locator('#practice-set .practice-card').first().locator('h3').innerText(),/√196/);
  await page.goto(baseUrl+'#u4-41');
  for(let attempt=0;attempt<3;attempt++){await completeVisibleMasteryTask(page,'41');if(attempt<2)await page.locator('[data-chapter4-task="41"] [data-next-task]').click();}
  let scores=await page.evaluate(()=>(window as any).Chapter4MasteryReview.getState().targetScores);
  assert.equal(scores['C4-41a'],25,'practice exposure blocks √196 from serving as the changed-representation verification');
  assert.equal(scores['C4-41b'],50,'two independent verification variations establish consistency before transfer');
  await page.locator('[data-chapter4-task="41"] [data-next-task]').click();
  await completeVisibleMasteryTask(page,'41');
  scores=await page.evaluate(()=>(window as any).Chapter4MasteryReview.getState().targetScores);
  assert.equal(scores['C4-41a'],50,'the changed-context instance restores consistency without skipping the transfer stage');
  assert.equal(scores['C4-41b'],75);
  await page.locator('[data-chapter4-task="41"] [data-next-task]').click();
  await completeVisibleMasteryTask(page,'41');
  scores=await page.evaluate(()=>(window as any).Chapter4MasteryReview.getState().targetScores);
  assert.equal(scores['C4-41a'],75,'a second genuinely changed transfer completes the paired transfer stage');

  await page.goto(baseUrl+'#u4-42');
  await completeVisibleMasteryTask(page,'42');
  await page.locator('[data-chapter4-task="42"] [data-next-task]').click();
  await completeVisibleMasteryTask(page,'42');
  scores=await page.evaluate(()=>(window as any).Chapter4MasteryReview.getState().targetScores);
  assert.equal(scores['C4-42c'],25,'the displayed 3√5 = √45 lesson example blocks duplicate independent evidence');
  assert.equal(scores['C4-42d'],25,'the shared conversion demand is also withheld for the equivalence target');
  await page.context().close();
});

test('first-check mastery, supported repair, completed IDs, and retained work are truthful', async () => {
  const page = await cleanPage();
  await page.goto(baseUrl + '#u4-41');
  const task41 = await page.evaluate(() => {
    const task = (window as any).Chapter4Checkers.getTask('41', 'initial');
    return Object.fromEntries(Object.entries(task.fields).map(([name, config]: [string, any]) => [name, config.answers[0]]));
  });
  for (const [name, value] of Object.entries(task41)) {
    const field = page.locator(`#u4-task-41-${name}`);
    if (await field.evaluate((node) => node.tagName === 'SELECT')) await field.selectOption(String(value));
    else await field.fill(String(value));
  }
  await page.locator('[data-chapter4-task="41"] [data-check-task]').click();
  assert.match(await page.locator('[data-chapter4-task="41"] [data-task-feedback]').innerText(), /100% practice credit.*fresh independent evidence/i);
  assert.match(await page.locator('#mastery-score').innerText(), /^3\.1/);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('math10c-unit4-pilot:review:v1') || '{}'));
  assert.deepEqual(stored.completedIds, ['u4-check-41']);

  await page.goto(baseUrl + '#u4-42');
  const section = page.locator('[data-chapter4-task="42"]');
  await section.locator('#u4-task-42-coefficient').fill('99');
  await section.locator('[data-check-task]').click();
  assert.match(await section.locator('[data-task-feedback]').innerText(), /Complete the blank parts/i);
  const stateAfterBlank = await page.evaluate(() => (window as any).Chapter4MasteryReview.getState().tasks['42']);
  assert.equal(stateAfterBlank.checks, 0);
  assert.equal(stateAfterBlank.help, true);
  assert.equal(await section.locator('#u4-task-42-coefficient').getAttribute('aria-invalid'), 'true');
  assert.equal(await section.locator('#u4-task-42-index').getAttribute('aria-invalid'), 'true');
  assert.equal(await section.locator('#u4-task-42-coefficient-hint').isVisible(), true);
  assert.equal(await section.locator('#u4-task-42-index-hint').isVisible(), false, 'blank fields are red but do not receive a mathematical hint');

  const task42 = await page.evaluate(() => {
    const task = (window as any).Chapter4Checkers.getTask('42', 'initial');
    return Object.fromEntries(Object.entries(task.fields).map(([name, config]: [string, any]) => [name, config.answers[0]]));
  });
  for (const [name, value] of Object.entries(task42)) {
    const field=section.locator(`#u4-task-42-${name}`);
    if(await field.evaluate((node)=>node.tagName==='SELECT'))await field.selectOption(String(value));else await field.fill(String(value));
  }
  await section.locator('[data-check-task]').click();
  assert.match(await section.locator('[data-task-feedback]').innerText(), /75% practice credit.*different fresh task/i);
  assert.match(await page.locator('#mastery-score').innerText(), /^3\.1/);
  assert.equal(await section.locator('[data-next-task]').isVisible(), true);
  await section.locator('[data-next-task]').click();
  assert.match(await section.locator('[data-task-meta]').innerText(), /Practice task fresh/i);
  await page.goto(baseUrl + '#u4-work');
  await page.locator('#retained-work-list details').first().locator('summary').click();
  assert.match(await page.locator('#retained-work-list').innerText(), /First mathematical submission:.*Latest draft:/is);
  await page.context().close();
});

test('guided decisions check components and a fourth miss still opens repair and another task', async () => {
  const page = await cleanPage();
  await page.goto(baseUrl + '#u4-43');
  const guided = page.locator('[data-guided-task="43-product"]');
  await guided.locator('[data-guided-component="product-choice"]').selectOption('add');
  await guided.locator('[data-guided-component="product-exponent"]').fill('7');
  await guided.locator('[data-guided-check]').click();
  assert.match(await guided.locator('[data-guided-feedback]').innerText(), /recheck/i);
  assert.equal(await guided.locator('[data-guided-component="product-choice"]').getAttribute('aria-invalid'), 'true');
  await guided.locator('[data-guided-component="product-choice"]').selectOption('multiply-same');
  await guided.locator('[data-guided-check]').click();
  assert.match(await guided.locator('[data-guided-feedback]').innerText(), /decisions work/i);

  const section = page.locator('[data-chapter4-task="43"]');
  await section.locator('[data-check-task]').click();
  let task = await page.evaluate(() => (window as any).Chapter4MasteryReview.getState().tasks['43']);
  assert.equal(task.checks, 0);
  assert.equal(task.help, false, 'blank-only validation is not mathematical help');
  const wrongValues = await page.evaluate(() => {
    const fields = (window as any).Chapter4Checkers.getTask('43', 'initial').fields;
    return Object.fromEntries(Object.entries(fields).map(([name, field]: [string, any]) => [name, field.contract.kind === 'restriction' ? 'x!=0' : '2']));
  });
  for (const [name, value] of Object.entries(wrongValues)) await section.locator(`#u4-task-43-${name}`).fill(String(value));
  for (let attempt = 1; attempt <= 4; attempt++) await section.locator('[data-check-task]').click();
  task = await page.evaluate(() => (window as any).Chapter4MasteryReview.getState().tasks['43']);
  assert.equal(task.checks, 4);
  assert.equal(task.closed, true);
  assert.equal(task.practiceCredit, 0);
  assert.equal(await section.locator('[data-help-task]').isEnabled(), true);
  assert.equal(await section.locator('[data-next-task]').isVisible(), true);
  await section.locator('[data-help-task]').click();
  assert.equal(await section.locator('[data-repair-panel]').isVisible(), true);
  assert.match(await section.locator('[data-task-feedback]').innerText(), /original task.*remain unchanged/i);
  const repairAnswer = await page.evaluate(() => {
    const state=(window as any).Chapter4MasteryReview.getState().tasks['43'];
    return (window as any).Chapter4Checkers.getTask('43',state.repair.variant).fields[state.repair.field].answers[0];
  });
  await section.locator('[data-repair-panel] input').fill(String(repairAnswer));
  await section.locator('[data-repair-panel] button').click();
  assert.match(await section.locator('[data-repair-panel] .field-hint').innerText(), /repair complete/i);
  assert.equal(await section.locator('#u4-task-43-product').isDisabled(), true, 'original checked work remains closed and preserved');
  await section.locator('[data-next-task]').click();
  assert.match(await section.locator('[data-task-meta]').innerText(), /Practice task (fresh|transfer)/i);
  await page.context().close();
});

test('all 32 targets reach independent, consistency, transfer and controlled later-session stages', async () => {
  let context = await browser.newContext();
  let page = await context.newPage();
  await page.goto(baseUrl + '#u4-41', { waitUntil: 'load' });
  async function completeCurrent(taskId: string) {
    const task = await page.evaluate((id) => {
      const review = (window as any).Chapter4MasteryReview.getState().tasks[id];
      const config = (window as any).Chapter4Checkers.getTask(id, review.variant);
      return { variant: review.variant, answers: Object.fromEntries(Object.entries(config.fields).map(([name, field]: [string, any]) => [name, field.answers[0]])) };
    }, taskId);
    const section = page.locator(`[data-chapter4-task="${taskId}"]`);
    for (const [name, value] of Object.entries(task.answers)) {
      const field = section.locator(`[data-field="${name}"]`);
      if (await field.evaluate((node) => node.tagName === 'SELECT')) await field.selectOption(String(value)); else await field.fill(String(value));
    }
    await section.locator('[data-check-task]').click();
    return task.variant;
  }
  for (let lesson = 41; lesson <= 48; lesson++) {
    const id = String(lesson);
    await page.evaluate((route) => { window.location.hash = route; }, `u4-${id}`);
    let reachedTransfer = false;
    for (let stage = 0; stage < 5; stage++) {
      await completeCurrent(id);
      reachedTransfer = await page.evaluate((taskId) => {
        const state = (window as any).Chapter4MasteryReview.getState();
        return Object.entries(state.targetScores).filter(([target]) => target.startsWith(`C4-${taskId}`)).every(([,score]) => Number(score) >= 75);
      }, id);
      if (!reachedTransfer) {
        const next = page.locator(`[data-chapter4-task="${id}"] [data-next-task]`);
        const visible = await next.isVisible();
        if (!visible) {
          const diagnostics = await page.evaluate((taskId) => {
            const state = (window as any).Chapter4MasteryReview.getState();
            return {
              characters: JSON.stringify(state).length,
              taskCharacters: JSON.stringify(state.tasks).length,
              evidenceCharacters: JSON.stringify(state.evidence).length,
              exposureCharacters: JSON.stringify(state.exposures).length,
              status: document.querySelector('#build-status')?.textContent,
              task: state.tasks[taskId]
            };
          }, id);
          assert.fail(`lesson ${id} stage ${stage} did not expose the next task: ${JSON.stringify(diagnostics)}`);
        }
        await next.click();
      } else break;
    }
    assert.equal(reachedTransfer, true, `lesson ${id} did not reach transfer for all four targets`);
  }
  let mastery = await page.evaluate(() => (window as any).Chapter4MasteryReview.getState());
  assert.equal(Object.values(mastery.targetScores).filter((score) => score === 75).length, 32,
    `unexpected stages: ${JSON.stringify(mastery.targetScores)}; lesson42=${JSON.stringify({task:mastery.tasks['42'], evidence:Object.fromEntries(Object.entries(mastery.evidence).filter(([id]) => id.startsWith('C4-42')))})}`);
  assert.equal(await page.locator('#mastery-score').innerText(), '75.0 of 100');
  await page.evaluate(() => {
    const key = (window as any).Chapter4MasteryReview.storageKey;
    const saved = JSON.parse(localStorage.getItem(key));
    Object.values(saved.evidence).forEach((entry: any) => { entry.retentionAvailableAt = Date.now() - 1000; });
    localStorage.setItem(key, JSON.stringify(saved));
  });
  const storage = await context.storageState();
  await context.close();
  context = await browser.newContext({ storageState: storage });
  page = await context.newPage();
  await page.goto(baseUrl + '#u4-41', { waitUntil: 'load' });
  for (let lesson = 41; lesson <= 48; lesson++) {
    const id = String(lesson), section = page.locator(`[data-chapter4-task="${id}"]`);
    await page.evaluate((route) => { window.location.hash = route; }, `u4-${id}`);
    for(let attempt=0;attempt<2;attempt++){
      const next=section.locator('[data-next-task]');
      if(!await next.isVisible()){
        const diagnostics=await page.evaluate((taskId)=>{const state=(window as any).Chapter4MasteryReview.getState(),key=(window as any).Chapter4MasteryReview.storageKey,stored=localStorage.getItem(key)||'';return {taskId,status:document.querySelector('#build-status')?.textContent,rawCharacters:JSON.stringify(state).length,storedCharacters:stored.length,taskCharacters:JSON.stringify(state.tasks).length,evidenceCharacters:JSON.stringify(state.evidence).length,exposureCharacters:JSON.stringify(state.exposures).length,task:state.tasks[taskId]};},id);
        assert.fail(`next retention task unavailable: ${JSON.stringify(diagnostics)}`);
      }
      await next.click();
      if(await section.locator('[data-field]').first().isDisabled()){
        const diagnostics=await page.evaluate((taskId)=>{const state=(window as any).Chapter4MasteryReview.getState(),key=(window as any).Chapter4MasteryReview.storageKey,stored=localStorage.getItem(key)||'';return {taskId,status:document.querySelector('#build-status')?.textContent,rawCharacters:JSON.stringify(state).length,storedCharacters:stored.length,taskCharacters:JSON.stringify(state.tasks).length,evidenceCharacters:JSON.stringify(state.evidence).length,exposureCharacters:JSON.stringify(state.exposures).length};},id);
        assert.fail(`retention task did not open: ${JSON.stringify(diagnostics)}`);
      }
      await completeCurrent(id);
      const retained=await page.evaluate((taskId)=>{const scores=(window as any).Chapter4MasteryReview.getState().targetScores;return Object.entries(scores).filter(([target])=>target.startsWith(`C4-${taskId}`)).every(([,score])=>Number(score)>=100);},id);
      if(retained)break;
    }
  }
  mastery = await page.evaluate(() => (window as any).Chapter4MasteryReview.getState());
  assert.equal(Object.values(mastery.targetScores).filter((score) => score === 100).length, 32,`retention stages: ${JSON.stringify(mastery.targetScores)}`);
  assert.equal(await page.locator('#mastery-score').innerText(), '100.0 of 100');
  await context.close();
});

test('radical and exponent labs respond and the mobile course does not overflow', async () => {
  const page = await cleanPage();
  await page.goto(baseUrl + '#u4-radical-lab');
  await page.locator('#radical-coefficient').fill('2');
  await page.locator('#radical-index').selectOption('3');
  await page.locator('#radical-radicand').fill('5');
  await page.locator('#radical-build').click();
  assert.match(await page.locator('#radical-output').innerText(), /2∛5.*∛40/s);
  await page.goto(baseUrl + '#u4-exponent-lab');
  await page.locator('#law-first').fill('5');
  await page.locator('#law-operation').selectOption('quotient');
  await page.locator('#law-second').fill('3');
  await page.locator('#law-build').click();
  assert.match(await page.locator('#law-output').innerText(), /subtract.*x5.*x3.*x2.*x ≠ 0/is);
  await page.locator('#law-first').fill('-2');
  await page.locator('#law-operation').selectOption('product');
  await page.locator('#law-second').fill('2');
  await page.locator('#law-build').click();
  assert.match(await page.locator('#law-output').innerText(), /x-2.*x2.*1.*x ≠ 0/is);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl + '#u4-44');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `mobile horizontal overflow was ${overflow}px`);
  assert.equal(await page.locator('#menu-button').isVisible(), true);
  await page.setViewportSize({ width: 320, height: 740 });
  for (let lesson = 41; lesson <= 48; lesson++) {
    await page.goto(baseUrl + `#u4-${lesson}`);
    const lessonOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(lessonOverflow <= 1, `Lesson 4.${lesson - 40} overflowed by ${lessonOverflow}px at 320px`);
  }
  await page.context().close();
});
