import { expect, test } from "@playwright/test";

import { openProjectInStudio, reloadWorkspacePreview } from "../lib/project-open";

const SLUG = "math10c-unit3-pilot";
const PREVIEW = '[data-testid="workspace-preview-frame"]';

const LESSON_ROUTES = ["u3-31", "u3-32", "u3-33", "u3-34", "u3-35", "u3-36", "u3-37", "u3-38"];
const SUPPORT_ROUTES = [
  "u3-practice",
  "u3-mixed",
  "u3-errors",
  "u3-review",
  "u3-reference",
  "u3-number-lab",
  "u3-expansion-lab",
  "u3-vocab",
  "u3-work",
  "u3-resources",
  "u3-support-library",
  "u3-transfer",
];

test('sequential 3.1–3.8 use, return and out-of-order navigation keep lesson drafts separate', async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);
  for (const [index, route] of LESSON_ROUTES.entries()) {
    await frame.locator(`.course-nav a[href="#${route}"]`).first().click();
    const workshop = frame.locator(`#mastery-3${index + 1}-workshop`);
    await expect(workshop).toBeVisible();
    const first = workshop.locator(`input[id^="m3${index + 1}-"]`).first();
    await first.fill(String(71 + index));
  }
  await frame.locator('.course-nav a[href="#u3-33"]').first().click();
  await expect(frame.locator('#mastery-33-workshop input[id^="m33-"]').first()).toHaveValue('73');
  await frame.locator('.course-nav a[href="#u3-36"]').first().click();
  const workshop = frame.locator('#mastery-36-workshop');
  await expect(workshop.locator('#m36-g')).toHaveValue('76');
  for (const [id, value] of Object.entries({
    'm36-g':'1','m36-a':'2','m36-b':'7','m36-c':'3','m36-m':'6','m36-n':'1',
    'm36-split':'2x^2+7x+3=2x^2+6x+x+3','m36-factor':'(2x+1)(x+3)','m36-expand':'2x^2+7x+3',
  })) await workshop.locator(`#${id}`).fill(value);
  await workshop.locator('#m36-submit').click();
  await expect(workshop.locator('#m36-feedback')).toContainText('fresh independent work is retained');
  await expect(frame.locator('#progress-count')).toContainText('3.1 of 100');
});

test('wrong filled answers get cube, signal-cycle and area-unit hints from their actual task', async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-31"]').first().click();
  const w31 = frame.locator('#mastery-31-workshop');
  const first31 = await w31.evaluate(el => { const bank=(window as any).MathMastery31; return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]); });
  for (const [i, parts] of first31.prime.entries()) await w31.locator(`#m31-prime-${'abc'[i]}`).fill(parts.join('*'));
  for (const [id, value] of Object.entries({'m31-gcf':first31.gcf,'m31-lcm':first31.lcm,'m31-value':first31.value,'m31-counts':first31.counts.join(',')})) await w31.locator(`#${id}`).fill(String(value));
  await w31.locator('#m31-method').selectOption(first31.method);
  await w31.locator('#m31-submit').click();
  await w31.locator('#m31-next').click();
  const signal = await w31.evaluate(el => { const bank=(window as any).MathMastery31; return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]); });
  expect(signal.context).toBe('signals');
  await w31.locator('#m31-counts').fill('1,1');
  await w31.locator('#m31-submit').click();
  await expect(w31.locator('#m31-counts + [data-mastery-field-hint]')).toContainText('common flash time');

  await frame.locator('.course-nav a[href="#u3-32"]').first().click();
  const w32=frame.locator('#mastery-32-workshop');
  const first32=await w32.evaluate(el => { const bank=(window as any).MathMastery32; return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]); });
  for (const [key,value] of Object.entries({square:first32.squareRoot,cube:first32.cubeRoot,lower:first32.lower,upper:first32.upper,'lower-power':first32.lowerPower,'upper-power':first32.upperPower,estimate:first32.estimate.toFixed(1),dimension:first32.dimension,unit:'cm',relationship:`${first32.dimension}^${first32.context==='area'?2:3}=${first32.measure}`})) await w32.locator(`#m32-${key}`).fill(String(value));
  await w32.locator('#m32-submit').click();
  await w32.locator('#m32-next').click();
  const cube=await w32.evaluate(el => { const bank=(window as any).MathMastery32; return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]); });
  expect(cube.degree).toBe(3);
  await w32.locator('#m32-lower-power').fill('99');
  await w32.locator('#m32-submit').click();
  await expect(w32.locator('#m32-lower-power + [data-mastery-field-hint]')).toContainText('Cube the lower');

  await frame.locator('.course-nav a[href="#u3-37"]').first().click();
  const w37=frame.locator('#mastery-37-workshop');
  const area=await w37.evaluate(el => { const bank=(window as any).MathMastery37; return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]); });
  await w37.locator('#m37-unit').fill(area.unit==='cm'?'m':'cm');
  await w37.locator('[data-supp-action="submit"]').click();
  await expect(w37.locator('#m37-unit + [data-mastery-field-hint]')).toContainText(`Area needs ${area.unit}²`);
});

test("Lesson 3.4 ignores equation spacing and lets a student correct the same task on check two", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  let frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-34"]').first().click();
  let workshop = frame.locator('#mastery-34-workshop');
  const problem = await workshop.evaluate(el => {
    const bank = (window as any).MathMastery34;
    return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);
  });
  const spaced = (value: string) => value.replace(/\+/g, ' + ').replace(/-/g, ' - ');
  await workshop.locator('#m34-total').fill(spaced(problem.totalB));
  for (let i = 0; i < 4; i++) await workshop.locator(`#m34-cell-${i + 1}`).fill(i === 0 ? '0' : spaced(problem.cellsA[i]));
  await workshop.locator('#m34-factors').fill(spaced(problem.B));
  await workshop.locator('#m34-cross').fill(`${problem.cross[0]}x + ${problem.cross[1]}x = ${problem.cross[0] + problem.cross[1]}x`);
  await workshop.locator('#m34-submit').click();
  await expect(workshop.locator('#m34-feedback')).toContainText('Check 1 of 4');
  await expect(workshop.locator('#m34-feedback')).toContainText('Top-left cell');
  await expect(workshop.locator('#m34-cell-1')).toHaveAttribute('aria-invalid', 'true');
  await expect(workshop.locator('#m34-cell-2')).not.toHaveAttribute('aria-invalid', 'true');
  await expect(workshop.locator('#m34-cell-1')).toBeEnabled();
  await reloadWorkspacePreview(page, SLUG);
  frame = page.frameLocator(PREVIEW);
  workshop = frame.locator('#mastery-34-workshop');
  await expect(workshop.locator('#m34-feedback')).toContainText('Top-left cell');
  await expect(workshop.locator('#m34-cell-1')).toHaveAttribute('aria-invalid', 'true');
  await expect(workshop.locator('#m34-cell-2')).not.toHaveAttribute('aria-invalid', 'true');
  await workshop.locator('#m34-cell-1').fill(spaced(problem.cellsA[0]));
  await expect(workshop.locator('#m34-cell-1')).not.toHaveAttribute('aria-invalid', 'true');
  await workshop.locator('#m34-submit').click();
  await expect(workshop.locator('#m34-feedback')).toContainText('Check 2 of 4');
  await expect(workshop.locator('#m34-feedback')).toContainText('75% practice credit');
  await expect(frame.locator('#progress-count')).toContainText('0.0 of 100');
});

test("Lesson 3.2 points to missing and wrong entries without hiding the feedback", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  let frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-32"]').first().click();
  let workshop = frame.locator('#mastery-32-workshop');
  const p = await workshop.evaluate(el => {
    const bank = (window as any).MathMastery32;
    return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);
  });
  const fields: Record<string, string> = {cube:String(p.cubeRoot),lower:String(p.lower),upper:String(p.upper),
    'lower-power':String(p.lowerPower),'upper-power':String(p.upperPower),estimate:p.estimate.toFixed(1),
    dimension:String(p.dimension),unit:'cm',relationship:`${p.dimension}^${p.context==='area'?2:3}=${p.measure+1}`};
  for (const [key, value] of Object.entries(fields)) await workshop.locator(`#m32-${key}`).fill(value);
  await workshop.locator('#m32-submit').click();
  await expect(workshop.locator('#m32-feedback')).toContainText('Complete the outlined entries');
  await expect(workshop.locator('#m32-square')).toHaveAttribute('aria-invalid', 'true');
  await workshop.locator('#m32-square').fill(String(p.squareRoot+1));
  await workshop.locator('#m32-submit').click();
  await expect(workshop.locator('#m32-feedback')).toContainText('Check 1 of 4');
  await expect(workshop.locator('#m32-feedback')).toContainText('Square root');
  await expect(workshop.locator('#m32-feedback')).toContainText('Power equality that checks it');
  await expect(workshop.locator('#m32-square')).toHaveAttribute('aria-invalid', 'true');
  await expect(workshop.locator('#m32-relationship')).toHaveAttribute('aria-invalid', 'true');
  await expect(workshop.locator('#m32-cube')).not.toHaveAttribute('aria-invalid', 'true');
  await reloadWorkspacePreview(page, SLUG);
  frame = page.frameLocator(PREVIEW);workshop = frame.locator('#mastery-32-workshop');
  await expect(workshop.locator('#m32-square')).toHaveAttribute('aria-invalid', 'true');
  await expect(workshop.locator('#m32-relationship')).toHaveAttribute('aria-invalid', 'true');
  await workshop.locator('#m32-square').fill(String(p.squareRoot));
  await workshop.locator('#m32-relationship').fill(`${p.dimension} ^ ${p.context==='area'?2:3} = ${p.measure}`);
  await workshop.locator('#m32-submit').click();
  await expect(workshop.locator('#m32-feedback')).toContainText('Check 2 of 4');
  await expect(workshop.locator('#m32-feedback')).toContainText('50% practice credit');
  await expect(frame.locator('#progress-count')).toContainText('0.0 of 100');
});

test("every Chapter 3 mastery workshop identifies a wrong answer box and restores it", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  let frame = page.frameLocator(PREVIEW);
  for (const lesson of [31,32,33,34,35,36,37,38]) {
    await frame.locator(`.course-nav a[href="#u3-${lesson}"]`).first().click();
    let workshop = frame.locator(`#mastery-${lesson}-workshop`);
    const task = await workshop.evaluate((el, n) => {
      const index = Number(el.dataset.instanceIndex), w = window as any;
      const signed = (v:number) => `${v < 0 ? '' : '+'}${v}`;
      if (n===31) {const bank=w.MathMastery31,p=bank.problem(bank.variants[index]),values:any={};p.prime.forEach((parts:number[],i:number)=>values[`m31-prime-${'abc'[i]}`]=parts.join('*'));Object.assign(values,{'m31-gcf':String(p.gcf),'m31-lcm':String(p.lcm),'m31-method':p.method,'m31-value':String(p.value),'m31-counts':p.counts.join(',')});return{values,wrong:'m31-gcf',other:'m31-lcm',button:'#m31-submit',feedback:'#m31-feedback'};}
      if (n===32) {const bank=w.MathMastery32,p=bank.problem(bank.variants[index]);return{values:{'m32-square':String(p.squareRoot),'m32-cube':String(p.cubeRoot),'m32-lower':String(p.lower),'m32-upper':String(p.upper),'m32-lower-power':String(p.lowerPower),'m32-upper-power':String(p.upperPower),'m32-estimate':p.estimate.toFixed(1),'m32-dimension':String(p.dimension),'m32-unit':'cm','m32-relationship':`${p.dimension}^${p.context==='area'?2:3}=${p.measure}`},wrong:'m32-square',other:'m32-cube',button:'#m32-submit',feedback:'#m32-feedback'};}
      if (n===33) {const bank=w.MathMastery33,p=bank.problem(bank.variants[index],2);return{values:{'m33-gcf':p.gcf,'m33-factor':p.factor,'m33-candidate':p.candidateStatus,'m33-candidate-expand':p.candidatePoly,'m33-expand':p.poly},wrong:'m33-gcf',other:'m33-factor',button:'#m33-submit',feedback:'#m33-feedback'};}
      if (n===34) {const bank=w.MathMastery34,p=bank.problem(bank.variants[index]),values:any={'m34-total':p.totalB,'m34-factors':p.B,'m34-cross':`${p.cross[0]}x${p.cross[1]>=0?'+':''}${p.cross[1]}x=${p.cross[0]+p.cross[1]}x`};p.cellsA.forEach((cell:string,i:number)=>values[`m34-cell-${i+1}`]=cell);return{values,wrong:'m34-cell-1',other:'m34-cell-2',button:'#m34-submit',feedback:'#m34-feedback'};}
      if (n===35) {const bank=w.MathMastery35,row=bank.variants[index],p=bank.problem(row,2);return{values:{'m35-pair':`${row.p},${row.q}`,'m35-sum':String(p.sum),'m35-product':String(p.product),'m35-monic':p.monic,'m35-gcf':String(p.g),'m35-full':p.whole,'m35-status':p.status,'m35-expand':p.candidateExpand},wrong:'m35-sum',other:'m35-product',button:'#m35-submit',feedback:'#m35-feedback'};}
      if (n===36) {const bank=w.MathMastery36,p=bank.problem(bank.variants[index]),primitive=`${p.a}x^2${signed(p.m)}x${signed(p.n)}x${signed(p.c)}`,split=`${p.poly}=${p.g===1?primitive:`${p.g}(${primitive})`}`;return{values:{'m36-g':String(p.g),'m36-a':String(p.a),'m36-b':String(p.b),'m36-c':String(p.c),'m36-m':String(p.m),'m36-n':String(p.n),'m36-split':split,'m36-factor':p.factor,'m36-expand':p.poly},wrong:'m36-g',other:'m36-a',button:'#m36-submit',feedback:'#m36-feedback'};}
      if (n===37) {const bank=w.MathMastery37,row=bank.variants[index],p=bank.problem(row),values:any={'m37-expanded':p.expanded,'m37-multi':p.multiExpanded,'m37-value':String(p.value),'m37-unit':p.unit+'^2','m37-check':`${row.a*row.n+row.b}*${row.c*row.n+row.d}=${p.value}`};p.cells.forEach((cell:string,i:number)=>values[`m37-cell${i+1}`]=cell);return{values,wrong:'m37-cell1',other:'m37-cell2',button:'[data-supp-action="submit"]',feedback:'.supplemental-feedback'};}
      const bank=w.MathMastery38,p=bank.problem(bank.variants[index]);return{values:{'m38-square':p.squareExpanded,'m38-middle':String(p.middle),'m38-perfect':p.perfectFactor,'m38-difference':p.differenceFactor,'m38-gcf':String(p.g),'m38-complete':p.complete,'m38-expand':p.completeExpression},wrong:'m38-middle',other:'m38-perfect',button:'[data-supp-action="submit"]',feedback:'.supplemental-feedback'};
    }, lesson);
    for (const [id, value] of Object.entries(task.values as Record<string,string>)) {
      if (id === task.other) continue;
      const field = workshop.locator(`#${id}`);
      if (await field.evaluate(el=>el.tagName==='SELECT')) await field.selectOption(value);
      else await field.fill(value);
    }
    await workshop.locator(`#${task.wrong}`).fill('999');
    await workshop.locator(task.button).click();
    await expect(workshop.locator(task.feedback)).toContainText('Also incorrect:');
    await expect(workshop.locator(task.feedback)).not.toContainText('Check 1 of 4');
    await expect(workshop.locator(`#${task.wrong}`)).toHaveAttribute('aria-invalid','true');
    await expect(workshop.locator(`#${task.other}`)).toHaveAttribute('aria-invalid','true');
    await expect(workshop.locator(`#${task.wrong} + [data-mastery-field-hint]`)).not.toBeEmpty();
    await expect(workshop.locator(`#${task.other} + [data-mastery-field-hint]`)).toHaveCount(0);
    await workshop.locator(`#${task.other}`).fill((task.values as Record<string,string>)[task.other]);
    await workshop.locator(task.button).click();
    await expect(workshop.locator(task.feedback)).toContainText('Check 1 of 4');
    await expect(workshop.locator(`#${task.wrong}`)).toHaveAttribute('aria-invalid','true');
    await expect(workshop.locator(`#${task.wrong} + [data-mastery-field-hint]`)).not.toBeEmpty();
    await expect(workshop.locator(`#${task.other}`)).not.toHaveAttribute('aria-invalid','true');
    await reloadWorkspacePreview(page, SLUG);
    frame = page.frameLocator(PREVIEW);workshop = frame.locator(`#mastery-${lesson}-workshop`);
    await expect(workshop.locator(task.feedback)).toContainText('Check 1 of 4');
    await expect(workshop.locator(`#${task.wrong}`)).toHaveAttribute('aria-invalid','true');
    await expect(workshop.locator(`#${task.wrong} + [data-mastery-field-hint]`)).not.toBeEmpty();
    await workshop.locator(`#${task.wrong}`).fill('998');
    await expect(workshop.locator(`#${task.wrong} + [data-mastery-field-hint]`)).toHaveCount(0);
  }
});

test("Lesson 3.4 flags filled wrong cells as well as blank cells without using a check", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-34"]').first().click();
  const workshop = frame.locator('#mastery-34-workshop');
  await workshop.locator('#m34-cell-1').fill('5');
  await workshop.locator('#m34-cell-2').fill('5');
  await workshop.locator('#m34-submit').click();
  await expect(workshop.locator('#m34-feedback')).toContainText('Also incorrect: Top-left cell, Top-right cell');
  for (const id of ['m34-cell-1','m34-cell-2','m34-cell-3','m34-cell-4'])
    await expect(workshop.locator(`#${id}`)).toHaveAttribute('aria-invalid','true');
  for (const id of ['m34-cell-1','m34-cell-2'])
    await expect(workshop.locator(`#${id} + [data-mastery-field-hint]`)).toContainText('Multiply');
  for (const id of ['m34-cell-3','m34-cell-4'])
    await expect(workshop.locator(`#${id} + [data-mastery-field-hint]`)).toHaveCount(0);
  await expect(workshop.locator('#m34-feedback')).not.toContainText('Check 1 of 4');
});

test("Math 10C review candidate reaches all eight lesson routes and supporting pages", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);

  await expect(frame.locator("#progress-count")).toContainText("of 100");

  for (const route of [...LESSON_ROUTES, ...SUPPORT_ROUTES]) {
    await frame.locator(`.course-nav a[href="#${route}"]`).first().evaluate((link: HTMLAnchorElement) => link.click());
    await expect(frame.locator(`#${route}`)).toBeVisible();
  }

  await frame.locator('.course-nav a[href="#u3-overview"]').first().evaluate((link: HTMLAnchorElement) => link.click());
  await expect(frame.locator("#u3-overview")).toBeVisible();
  await expect(frame.locator("#u3-overview")).toContainText("Your route through Chapter 3");
});

test("Math 10C review candidate preserves private lesson completion without inflating mastery", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);

  await frame.locator('.course-nav a[href="#u3-31"]').first().click();
  await expect(frame.locator("#u3-31")).toBeVisible();

  const answer = frame.locator("#answer-c31-p1");
  await answer.fill("72");
  await frame.locator('[data-check="c31"]').click();
  await expect(frame.locator('[data-feedback="c31"]')).toContainText("Correct");

  await frame.locator('[data-reason="3.1"]').fill("The lights repeat together, so this needs the least common multiple.");
  await frame.locator('[data-record="3.1"]').click();
  await expect(frame.locator('[data-check-status="3.1"]')).toContainText("Lesson work recorded");
  await expect(frame.locator("#progress-count")).toContainText("0.0 of 100");

  const counts = await frame.locator("body").evaluate(() => {
    const pilot = (window as typeof window & { MathPilotSlice?: any }).MathPilotSlice;
    const completeTrig = {
      side: "BC",
      adjacent: "AB",
      hypotenuse: "AC",
      ratio: "tan",
      angle: "correct",
      angleRaw: "26.6 degrees",
      aa: [[1, "26.6 degrees", "correct", 0, {}]],
      length: "sin",
      lengthStatus: "correct",
      lengthRaw: "5 m",
      la: [[1, "5 m", "correct", 0, {}]],
      reason: "Sine uses opposite over hypotenuse.",
    };
    return {
      triangleAlone: pilot.pilotProgress([], completeTrig).count,
      lessonPlusTriangle: pilot.pilotProgress(["3.1"], completeTrig).count,
      triangleGate: pilot.isTriangleComplete(completeTrig),
      requiredIds: pilot.REQUIRED_IDS,
      total: pilot.TOTAL_CHECKPOINTS,
    };
  });
  expect(counts.triangleGate).toBe(true);
  expect(counts.triangleAlone).toBe(0);
  expect(counts.lessonPlusTriangle).toBe(1);
  expect(counts.requiredIds).toEqual([
    "u3-check-31",
    "u3-check-32",
    "u3-check-33",
    "u3-check-34",
    "u3-check-35",
    "u3-check-36",
    "u3-check-37",
    "u3-check-38",
  ]);
  expect(counts.total).toBe(8);

  await frame.locator('.course-nav a[href="#u3-transfer"]').first().evaluate((link: HTMLAnchorElement) => link.click());
  await expect(frame.locator("#u3-transfer")).toBeVisible();
  await expect(frame.locator("#u3-transfer")).toContainText("Optional lab");
  await expect(frame.locator("#progress-count")).toContainText("0.0 of 100");
});

test("Math 10C review candidate checks and retains the reviewed factoring work", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  let frame = page.frameLocator(PREVIEW);

  await frame.locator('a[href="#u3-35"]').first().click();
  await expect(frame.locator("#u3-35")).toBeVisible();

  const task = frame.locator('[data-question="g35"]').first();
  const answer = task.locator('[data-answer="g35"]');
  await answer.fill("x^2 + 3x + 4x + 12");
  await task.locator('[data-check="g35"]').click();

  await expect(task.locator('[data-feedback="g35"]')).toContainText("Correct for this step");
  await expect(task.locator('[data-feedback="g35"]')).toContainText("middle-term split is correct");
  await expect(task.locator("[data-history-status]")).toContainText("x^2 + 3x + 4x + 12");
  await expect(frame.locator("#save-message")).toContainText(/Saved|saved/u);

  await reloadWorkspacePreview(page, SLUG);
  frame = page.frameLocator(PREVIEW);
  await expect(frame.locator('#u3-35 [data-question="g35"] [data-answer="g35"]')).toHaveValue(
    "x^2 + 3x + 4x + 12"
  );

  const restoredTask = frame.locator('#u3-35 [data-question="g35"]').first();
  await restoredTask.locator('[data-answer="g35"]').fill("x(x + 3) + 4(x + 3) = (x + 3)(x + 4)");
  await restoredTask.locator('[data-check="g35"]').click();
  await expect(restoredTask.locator('[data-feedback="g35"]')).toContainText("Correct for this step");
  await expect(restoredTask.locator('[data-feedback="g35"]')).toContainText("Both sides match the target polynomial");
  await expect(restoredTask.locator("[data-history-status]")).toContainText("x(x + 3) + 4(x + 3)");

  await frame.locator("#reference-open").click();
  await expect(frame.locator("#reference-panel")).toBeVisible();
  await frame.locator("#reference-close").click();
  await expect(frame.locator("#reference-panel")).toBeHidden();
});

test("Lesson 3.6 retains the submitted method and excludes an unchanged split from mastery", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  let frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-36"]').first().click();
  const workshop = frame.locator("#mastery-36-workshop");
  await expect(workshop).toBeVisible();
  await expect(workshop.locator("div.equation")).toContainText("2x2+7x+3");
  for (const [id, value] of Object.entries({
    "m36-g": "1", "m36-a": "2", "m36-b": "7", "m36-c": "3", "m36-m": "6", "m36-n": "1",
    "m36-split": "2x^2+7x+3=2x^2+7x+3", "m36-factor": "(2x+1)(x+3)", "m36-expand": "2x^2+7x+3",
  })) await workshop.locator(`#${id}`).fill(value);
  await workshop.locator("#m36-submit").click();
  await expect(workshop.locator("#m36-feedback")).toContainText("useful middle-term equality");
  await expect(workshop.locator(".mastery-target-list li").nth(2)).toContainText("Not yet shown");
  await expect(workshop.locator(".mastery-target-list li").nth(3)).toContainText("Not yet shown");
  await workshop.locator('#m36-split').fill('2x^2+7x+3=2x^2+6x+x+3');
  await workshop.locator('#m36-submit').click();
  await expect(workshop.locator('#m36-feedback')).toContainText('75% practice credit');
  await expect(workshop).toContainText("2x^2+7x+3=2x^2+7x+3");
  await expect(workshop).toContainText("2x^2+7x+3=2x^2+6x+x+3");
  await workshop.locator("[data-select-m36]").click();
  await expect(workshop.locator("[data-select-m36]")).toHaveAttribute("aria-pressed", "true");

  await reloadWorkspacePreview(page, SLUG);
  frame = page.frameLocator(PREVIEW);
  const restored = frame.locator("#mastery-36-workshop");
  await expect(restored).toContainText("2x^2+7x+3=2x^2+7x+3");
  await expect(restored.locator("[data-select-m36]")).toHaveAttribute("aria-pressed", "true");
  await restored.locator("#m36-next").click();
  await expect(restored.locator("div.equation")).not.toContainText("2x2+7x+3");
});

test("Lesson 3.1 advances from varied checks to three-quantity transfer and retains selected work", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  let frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-31"]').first().click();
  let workshop = frame.locator("#mastery-31-workshop");
  await expect(workshop).toBeVisible();
  const submit = async () => {
    const problem = await workshop.evaluate(el => {
      const bank = (window as any).MathMastery31;
      return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);
    });
    const factors = ["a", "b", "c"];
    for (let i = 0; i < problem.numbers.length; i++) await workshop.locator(`#m31-prime-${factors[i]}`).fill(problem.prime[i].join("*"));
    await workshop.locator("#m31-gcf").fill(String(problem.gcf));
    await workshop.locator("#m31-lcm").fill(String(problem.lcm));
    if (await workshop.locator("#m31-method").evaluate(el => el.tagName === "SELECT")) await workshop.locator("#m31-method").selectOption(problem.method);
    else await workshop.locator("#m31-method").fill(problem.method);
    await workshop.locator("#m31-value").fill(String(problem.value));
    await workshop.locator("#m31-counts").fill(problem.counts.join(","));
    await workshop.locator("#m31-submit").click();
    await expect(workshop.locator("#m31-feedback")).toContainText("All four relationships are correct");
    return problem;
  };
  const first = await submit();
  await expect(workshop.locator(".mastery-target-list")).toContainText("First independent success");
  await workshop.locator("[data-select-m36]").click();
  await expect(workshop.locator("[data-select-m36]")).toHaveAttribute("aria-pressed", "true");
  await reloadWorkspacePreview(page, SLUG);
  frame = page.frameLocator(PREVIEW);
  workshop = frame.locator("#mastery-31-workshop");
  await expect(workshop.locator("[data-select-m36]")).toHaveAttribute("aria-pressed", "true");
  await workshop.locator("#m31-next").click();
  const second = await submit();
  expect(second.context).not.toBe(first.context);
  await expect(workshop.locator(".mastery-target-list")).toContainText("Consistent independence");
  await workshop.locator("#m31-next").click();
  const transfer = await submit();
  expect(transfer.numbers).toHaveLength(3);
  await expect(workshop.locator(".mastery-target-list")).toContainText("Transfer shown");
});

test("Lesson 3.1 repair preserves the attempt and reduces the task's available marks", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-31"]').first().click();
  const workshop = frame.locator("#mastery-31-workshop");
  const problem = await workshop.evaluate(el => {
    const bank = (window as any).MathMastery31;
    return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);
  });
  await workshop.locator("#m31-repair").click();
  await expect(workshop.locator("#m31-repair-panel")).toContainText("lowers this task’s practice credit");
  for (const [i, suffix] of ["a", "b", "c"].entries())
    if (i < problem.numbers.length) await workshop.locator(`#m31-prime-${suffix}`).fill(problem.prime[i].join("*"));
  await workshop.locator("#m31-gcf").fill(String(problem.gcf));
  await workshop.locator("#m31-lcm").fill(String(problem.lcm));
  if (await workshop.locator("#m31-method").evaluate(el => el.tagName === "SELECT")) await workshop.locator("#m31-method").selectOption(problem.method);
  else await workshop.locator("#m31-method").fill(problem.method);
  await workshop.locator("#m31-value").fill(String(problem.value));
  await workshop.locator("#m31-counts").fill(problem.counts.join(","));
  await workshop.locator("#m31-submit").click();
  await expect(workshop.locator("#m31-feedback")).toContainText("75% practice credit");
  await expect(frame.locator("#progress-count")).toContainText("0.0 of 100");
  await expect(workshop).toContainText(problem.prompt);
});

test("Lesson 3.2 retains root and unit working through varied checks and changed-form transfer", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  let frame=page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-32"]').first().click();
  let workshop=frame.locator('#mastery-32-workshop');
  await expect(workshop).toBeVisible();
  const submit=async()=>{
    const p=await workshop.evaluate(el=>{const bank=(window as any).MathMastery32;return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);});
    const relationship=workshop.locator('#m32-relationship');
    await relationship.fill(String(p.dimension));
    await workshop.locator(`[data-input="m32-relationship"][data-insert="${p.context==='area'?'²':'³'}"]`).click();
    await expect(relationship).toHaveValue(`${p.dimension}${p.context==='area'?'²':'³'}`);
    await expect(workshop.locator('[data-preview="m32-relationship"]')).toContainText(`${p.dimension}${p.context==='area'?'²':'³'}`);
    const fields:Record<string,string>={square:String(p.squareRoot),cube:String(p.cubeRoot),lower:String(p.lower),upper:String(p.upper),
      'lower-power':String(p.lowerPower),'upper-power':String(p.upperPower),estimate:p.estimate.toFixed(1),dimension:String(p.dimension),unit:'cm',
      relationship:`${p.dimension}^${p.context==='area'?2:3}=${p.measure}`};
    for(const [key,value] of Object.entries(fields))await workshop.locator(`#m32-${key}`).fill(value);
    await workshop.locator('#m32-submit').click();
    await expect(workshop.locator('#m32-feedback')).toContainText('All four relationships are correct');
    return p;
  };
  const first=await submit();
  await expect(workshop.locator('.mastery-target-list')).toContainText('First independent success');
  await expect(frame.locator('#progress-count')).not.toContainText('0.0 of 100');
  await workshop.locator('[data-select-m36]').click();
  await reloadWorkspacePreview(page,SLUG);
  frame=page.frameLocator(PREVIEW);workshop=frame.locator('#mastery-32-workshop');
  await expect(workshop.locator('[data-select-m36]')).toHaveAttribute('aria-pressed','true');
  for(let i=0;i<4;i++){
    if(await workshop.locator('.mastery-target-list').innerText().then(s=>!s.includes('First independent success')))break;
    await workshop.locator('#m32-next').click();await submit();
  }
  await expect(workshop.locator('.mastery-target-list')).not.toContainText('First independent success');
  await workshop.locator('#m32-next').click();
  const transfer=await submit();
  expect(transfer.prompt).not.toBe(first.prompt);
  for(const item of await workshop.locator('.mastery-target-list li').all())await expect(item).toContainText('Transfer shown');
});

test("Lesson 3.2 repair uses the missed task and saving ownership blocks mastery entry", async ({ page }) => {
  await openProjectInStudio(page,SLUG);
  const frame=page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-32"]').first().click();
  const workshop=frame.locator('#mastery-32-workshop');
  const p=await workshop.evaluate(el=>{const bank=(window as any).MathMastery32;return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);});
  const fields:Record<string,string>={square:String(p.squareRoot+1),cube:String(p.cubeRoot),lower:String(p.lower),upper:String(p.upper),
    'lower-power':String(p.lowerPower),'upper-power':String(p.upperPower),estimate:p.estimate.toFixed(1),dimension:String(p.dimension),unit:'cm',
    relationship:`${p.dimension}^${p.context==='area'?2:3}=${p.measure}`};
  for(const [key,value] of Object.entries(fields))await workshop.locator(`#m32-${key}`).fill(value);
  await workshop.locator('#m32-submit').click();
  await expect(workshop.locator('#m32-feedback')).toContainText('Needs correction: Square root');
  await workshop.locator('#m32-repair').click();
  await expect(workshop.locator('#m32-repair-panel')).toContainText(`${p.squareRoot}² = ${p.squareRoot**2}`);
  await expect(workshop.locator('#m32-repair-panel')).not.toContainText('Bounds and estimate:');
  await workshop.locator('#m32-square').fill(String(p.squareRoot));
  await workshop.locator('#m32-submit').click();
  await expect(workshop.locator('#m32-feedback')).toContainText('50% practice credit');
  await workshop.locator('#m32-next').click();
  await workshop.evaluate(()=> (window as any).Unit3Debug.releaseWriter());
  await expect(workshop.locator('#m32-submit')).toBeDisabled();
  await expect(workshop.locator('#m32-relationship')).toBeDisabled();
  await expect(workshop.locator('#m32-save-paused')).toContainText('another tab owns editing');
});

test("Lesson 3.2 support reduces credit and a refused save keeps the open draft", async ({ page }) => {
  await openProjectInStudio(page,SLUG);
  const frame=page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-32"]').first().click();
  const workshop=frame.locator('#mastery-32-workshop');
  const p=await workshop.evaluate(el=>{const bank=(window as any).MathMastery32;return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);});
  await workshop.locator('#m32-repair').click();
  await expect(workshop.locator('#m32-repair-panel')).toContainText('lowers this task’s practice credit');
  const fields:Record<string,string>={square:String(p.squareRoot),cube:String(p.cubeRoot),lower:String(p.lower),upper:String(p.upper),
    'lower-power':String(p.lowerPower),'upper-power':String(p.upperPower),estimate:p.estimate.toFixed(1),dimension:String(p.dimension),unit:'cm',
    relationship:`${p.dimension}^${p.context==='area'?2:3}=${p.measure}`};
  for(const [key,value] of Object.entries(fields))await workshop.locator(`#m32-${key}`).fill(value);
  await workshop.locator('#m32-submit').click();
  await expect(workshop.locator('#m32-feedback')).toContainText('75% practice credit');
  await expect(workshop.locator('.mastery-target-list')).toContainText('Not yet shown');
  await workshop.locator('#m32-next').click();
  const fresh=await workshop.evaluate(el=>{const bank=(window as any).MathMastery32;return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);});
  const freshFields:Record<string,string>={square:String(fresh.squareRoot),cube:String(fresh.cubeRoot),lower:String(fresh.lower),upper:String(fresh.upper),
    'lower-power':String(fresh.lowerPower),'upper-power':String(fresh.upperPower),estimate:fresh.estimate.toFixed(1),dimension:String(fresh.dimension),unit:'cm',
    relationship:`${fresh.dimension}^${fresh.context==='area'?2:3}=${fresh.measure}`};
  for(const [key,value] of Object.entries(freshFields))await workshop.locator(`#m32-${key}`).fill(value);
  await workshop.locator('#m32-submit').evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key:string,value:string){if(key.includes('math10c-unit3-pilot:review:v2'))throw new Error('Simulated storage failure');return original.call(this,key,value);};});
  await workshop.locator('#m32-submit').click();
  await expect(workshop.locator('#m32-feedback')).toContainText('Saving did not complete');
  await expect(workshop.locator('#m32-square')).toHaveValue(String(fresh.squareRoot));
  await expect(workshop.locator('.mastery-target-list')).toContainText('Not yet shown');
});

test("Chapter workshops provide notation, task-specific repair, and save-owner protection", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);
  const fields = [
    {lesson:"31",field:"m31-prime-a",answer:"2³×3",symbol:"³",absent:"="},
    {lesson:"33",field:"m33-factor",answer:"x^2+2x+1",symbol:"²",absent:"="},
    {lesson:"34",field:"m34-cross",answer:"3x+2x=5x",symbol:"=",absent:"²"},
    {lesson:"35",field:"m35-full",answer:"x^2+2x+1",symbol:"²",absent:"="},
    {lesson:"36",field:"m36-factor",answer:"x^2+2x+1",symbol:"²",absent:"="},
    {lesson:"37",field:"m37-check",answer:"5×7=35",symbol:"×",absent:"²"},
    {lesson:"38",field:"m38-square",answer:"x^2+2x+1",symbol:"²",absent:"="},
  ];
  for (const {lesson,field,answer,symbol,absent} of fields) {
    await frame.locator(`.course-nav a[href="#u3-${lesson}"]`).first().click();
    const workshop = frame.locator(`#mastery-${lesson}-workshop`);
    await expect(workshop.locator(`#${field}`)).toBeVisible();
    await workshop.locator(`#${field}`).fill(answer);
    await expect(workshop.locator(`[data-preview="${field}"]`)).not.toBeEmpty();
    await expect(workshop.locator(`[data-input="${field}"][data-insert="${symbol}"]`)).toBeVisible();
    await expect(workshop.locator(`[data-input="${field}"][data-insert="${absent}"]`)).toHaveCount(0);
    const repair = lesson === "37" || lesson === "38" ? workshop.locator('[data-supp-action="repair"]') : workshop.locator(`#m${lesson}-repair`);
    await repair.click();
    const panel = lesson === "37" || lesson === "38" ? workshop.locator('.supplemental-repair') : workshop.locator(`#m${lesson}-repair-panel`);
    await expect(panel).toContainText("Question you are working on:");
    await expect(panel).toContainText("lowers this task’s practice credit");
  }
  const last=frame.locator("#mastery-38-workshop");
  await last.evaluate(() => (window as any).Unit3Debug.releaseWriter());
  await expect(last.locator("#m38-square")).toBeDisabled();
  await expect(last.locator('[data-supp-action="submit"]')).toBeDisabled();
  await expect(last.locator("[data-mastery-save-paused]")).toContainText("another tab owns editing");
  for (const [lesson,field] of [["31","m31-prime-a"],["32","m32-relationship"],["33","m33-factor"],["34","m34-cross"],["35","m35-full"],["36","m36-factor"],["37","m37-check"],["38","m38-square"]]) {
    await frame.locator(`.course-nav a[href="#u3-${lesson}"]`).first().click();
    const workshop=frame.locator(`#mastery-${lesson}-workshop`);
    await expect(workshop.locator(`#${field}`)).toBeDisabled();
    await expect(workshop.locator('button').first()).toBeDisabled();
    await expect(workshop.locator('[data-mastery-save-paused]')).toContainText('another tab owns editing');
  }
});

test("practice rendered after a save-owner conflict cannot accept a new check", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame=page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-practice"]').first().evaluate((link: HTMLAnchorElement) => link.click());
  await frame.locator('#practice-topic').selectOption('3.1');
  await frame.locator('#start-independent').click();
  await expect(frame.locator('#practice-root [data-answer]')).toBeVisible();
  await frame.locator('#practice-root').evaluate(() => (window as any).Unit3Debug.releaseWriter());
  await frame.locator('.course-nav a[href="#u3-overview"]').first().evaluate((link: HTMLAnchorElement) => link.click());
  await frame.locator('.course-nav a[href="#u3-practice"]').first().evaluate((link: HTMLAnchorElement) => link.click());
  await expect(frame.locator('#practice-root [data-answer]')).toBeDisabled();
  await expect(frame.locator('#practice-root [data-check]')).toBeDisabled();
});

test("Lesson 3.3 checks complete GCF factoring and reaches changed-form transfer with retained work", async ({ page }) => {
  await openProjectInStudio(page,SLUG);
  let frame=page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-33"]').first().click();
  let workshop=frame.locator('#mastery-33-workshop');
  await expect(workshop).toBeVisible();
  const submit=async()=>{
    const p=await workshop.evaluate(el=>{const bank=(window as any).MathMastery33;return bank.problem(bank.variants[Number(el.dataset.instanceIndex)],2);});
    expect(p.analysisPoly).not.toBe(p.poly);
    await workshop.locator('#m33-gcf').fill(p.gcf);
    await workshop.locator('#m33-factor').fill(p.factor);
    if(await workshop.locator('#m33-candidate').evaluate(el=>el.tagName==='SELECT'))await workshop.locator('#m33-candidate').selectOption(p.candidateStatus);
    else await workshop.locator('#m33-candidate').fill(p.candidateStatus);
    await workshop.locator('#m33-candidate-expand').fill(p.candidatePoly);
    await workshop.locator('#m33-expand').fill(p.poly);
    await workshop.locator('#m33-submit').click();
    await expect(workshop.locator('#m33-feedback')).toContainText('All four relationships are correct');
    return p;
  };
  const first=await submit();
  await workshop.locator('[data-select-m36]').click();
  await reloadWorkspacePreview(page,SLUG);
  frame=page.frameLocator(PREVIEW);workshop=frame.locator('#mastery-33-workshop');
  await expect(workshop.locator('[data-select-m36]')).toHaveAttribute('aria-pressed','true');
  for(let i=0;i<6;i++){
    if(await workshop.locator('.mastery-target-list').innerText().then(s=>!s.includes('First independent success')))break;
    await workshop.locator('#m33-next').click();await submit();
  }
  await expect(workshop.locator('.mastery-target-list')).not.toContainText('First independent success');
  await workshop.locator('#m33-next').click();
  const transfer=await submit();
  expect(transfer.role).toBe('transfer');expect(transfer.prompt).not.toBe(first.prompt);
  for(const item of await workshop.locator('.mastery-target-list li').all())await expect(item).toContainText('Transfer shown');
});

test("Lesson 3.4 builds and reads area models through fresh transfer", async ({ page }) => {
  await openProjectInStudio(page,SLUG);
  let frame=page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-34"]').first().click();
  let workshop=frame.locator('#mastery-34-workshop');
  await expect(workshop).toBeVisible();
  const submit=async()=>{
    const p=await workshop.evaluate(el=>{const bank=(window as any).MathMastery34;return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);});
    await workshop.locator('#m34-total').fill(p.totalB);
    for(let i=0;i<4;i++)await workshop.locator(`#m34-cell-${i+1}`).fill(p.cellsA[i]);
    await workshop.locator('#m34-factors').fill(p.B);
    await workshop.locator('#m34-cross').fill(`${p.cross[0]}x${p.cross[1]>=0?'+':''}${p.cross[1]}x=${p.cross[0]+p.cross[1]}x`);
    await workshop.locator('#m34-submit').click();
    await expect(workshop.locator('#m34-feedback')).toContainText('All four relationships are correct');
    return p;
  };
  const first=await submit();
  await workshop.locator('[data-select-m36]').click();
  await reloadWorkspacePreview(page,SLUG);
  frame=page.frameLocator(PREVIEW);workshop=frame.locator('#mastery-34-workshop');
  await expect(workshop.locator('[data-select-m36]')).toHaveAttribute('aria-pressed','true');
  for(let i=0;i<6;i++){
    if(await workshop.locator('.mastery-target-list').innerText().then(s=>!s.includes('First independent success')))break;
    await workshop.locator('#m34-next').click();await submit();
  }
  await expect(workshop.locator('.mastery-target-list')).not.toContainText('First independent success');
  await workshop.locator('#m34-next').click();
  const transfer=await submit();
  expect(transfer.role).toBe('transfer');expect(transfer.prompt).not.toBe(first.prompt);
  for(const item of await workshop.locator('.mastery-target-list li').all())await expect(item).toContainText('Transfer shown');
});

test("Lesson 3.5 checks signed factoring and whole-expression repair through transfer", async ({ page }) => {
  await openProjectInStudio(page,SLUG);
  let frame=page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-35"]').first().click();
  let workshop=frame.locator('#mastery-35-workshop');
  await expect(workshop).toBeVisible();
  const submit=async()=>{
    const {row,p}=await workshop.evaluate(el=>{const bank=(window as any).MathMastery35,row=bank.variants[Number(el.dataset.instanceIndex)];return{row,p:bank.problem(row,2)};});
    expect(p.analysisPoly).not.toBe(p.poly);
    await workshop.locator('#m35-pair').fill(`${row.p},${row.q}`);
    await workshop.locator('#m35-sum').fill(String(p.sum));
    await workshop.locator('#m35-product').fill(String(p.product));
    await workshop.locator('#m35-monic').fill(p.monic);
    await workshop.locator('#m35-gcf').fill(String(p.g));
    await workshop.locator('#m35-full').fill(p.whole);
    await workshop.locator('#m35-status').selectOption(p.status);
    await workshop.locator('#m35-expand').fill(p.candidateExpand);
    await workshop.locator('#m35-submit').click();
    await expect(workshop.locator('#m35-feedback')).toContainText('All four relationships are correct');
    return p;
  };
  const first=await submit();
  await workshop.locator('[data-select-m36]').click();
  await reloadWorkspacePreview(page,SLUG);
  frame=page.frameLocator(PREVIEW);workshop=frame.locator('#mastery-35-workshop');
  await expect(workshop.locator('[data-select-m36]')).toHaveAttribute('aria-pressed','true');
  for(let i=0;i<6;i++){
    if(await workshop.locator('.mastery-target-list').innerText().then(s=>!s.includes('First independent success')))break;
    await workshop.locator('#m35-next').click();await submit();
  }
  await expect(workshop.locator('.mastery-target-list')).not.toContainText('First independent success');
  await workshop.locator('#m35-next').click();
  const transfer=await submit();
  expect(transfer.role).toBe('transfer');expect(transfer.prompt).not.toBe(first.prompt);
  for(const item of await workshop.locator('.mastery-target-list li').all())await expect(item).toContainText('Transfer shown');
});

test("Lesson 3.7 distributes, simplifies and verifies an area through transfer", async ({ page }) => {
  await openProjectInStudio(page,SLUG);
  let frame=page.frameLocator(PREVIEW);await frame.locator('.course-nav a[href="#u3-37"]').first().click();
  let workshop=frame.locator('#mastery-37-workshop');await expect(workshop).toBeVisible();
  const submit=async()=>{
    const {row,p}=await workshop.evaluate(el=>{const bank=(window as any).MathMastery37,row=bank.variants[Number(el.dataset.instanceIndex)];return{row,p:bank.problem(row)};});
    for(let i=0;i<4;i++)await workshop.locator(`#m37-cell${i+1}`).fill(p.cells[i]);
    await workshop.locator('#m37-expanded').fill(p.expanded);
    await workshop.locator('#m37-multi').fill(p.multiExpanded);
    await workshop.locator('#m37-value').fill(String(p.value));
    await workshop.locator('#m37-unit').fill(p.unit+'^2');
    await workshop.locator('#m37-check').fill(`${row.a*row.n+row.b}*${row.c*row.n+row.d}=${p.value}`);
    await workshop.locator('[data-supp-action="submit"]').click();
    await expect(workshop.locator('.supplemental-feedback')).toContainText('All four relationships are correct');return p;
  };
  const first=await submit();await workshop.locator('[data-select-m36]').click();
  await reloadWorkspacePreview(page,SLUG);frame=page.frameLocator(PREVIEW);workshop=frame.locator('#mastery-37-workshop');
  await expect(workshop.locator('[data-select-m36]')).toHaveAttribute('aria-pressed','true');
  for(let i=0;i<6;i++){if(await workshop.locator('.mastery-target-list').innerText().then(s=>!s.includes('First independent success')))break;await workshop.locator('[data-supp-action="next"]').click();await submit();}
  await expect(workshop.locator('.mastery-target-list')).not.toContainText('First independent success');
  await workshop.locator('[data-supp-action="next"]').click();const transfer=await submit();
  expect(transfer.role).toBe('transfer');expect(transfer.prompt).not.toBe(first.prompt);
  for(const item of await workshop.locator('.mastery-target-list li').all())await expect(item).toContainText('Transfer shown');
});

test("Lesson 3.8 works through special products and complete factoring transfer", async ({ page }) => {
  await openProjectInStudio(page,SLUG);
  let frame=page.frameLocator(PREVIEW);await frame.locator('.course-nav a[href="#u3-38"]').first().click();
  let workshop=frame.locator('#mastery-38-workshop');await expect(workshop).toBeVisible();
  const submit=async()=>{
    const p=await workshop.evaluate(el=>{const bank=(window as any).MathMastery38;return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);});
    await workshop.locator('#m38-square').fill(p.squareExpanded);
    await workshop.locator('#m38-middle').fill(String(p.middle));
    await workshop.locator('#m38-perfect').fill(p.perfectFactor);
    await workshop.locator('#m38-difference').fill(p.differenceFactor);
    await workshop.locator('#m38-gcf').fill(String(p.g));
    await workshop.locator('#m38-complete').fill(p.complete);
    await workshop.locator('#m38-expand').fill(p.completeExpression);
    await workshop.locator('[data-supp-action="submit"]').click();
    await expect(workshop.locator('.supplemental-feedback')).toContainText('All four relationships are correct');return p;
  };
  const first=await submit();await workshop.locator('[data-select-m36]').click();
  await reloadWorkspacePreview(page,SLUG);frame=page.frameLocator(PREVIEW);workshop=frame.locator('#mastery-38-workshop');
  await expect(workshop.locator('[data-select-m36]')).toHaveAttribute('aria-pressed','true');
  for(let i=0;i<6;i++){if(await workshop.locator('.mastery-target-list').innerText().then(s=>!s.includes('First independent success')))break;await workshop.locator('[data-supp-action="next"]').click();await submit();}
  await expect(workshop.locator('.mastery-target-list')).not.toContainText('First independent success');
  await workshop.locator('[data-supp-action="next"]').click();const transfer=await submit();
  expect(transfer.role).toBe('transfer');expect(transfer.prompt).not.toBe(first.prompt);
  for(const item of await workshop.locator('.mastery-target-list li').all())await expect(item).toContainText('Transfer shown');
});

test("Supplemental mastery repair reduces credit and failed saves retain the draft", async ({ page }) => {
  await openProjectInStudio(page,SLUG);
  const frame=page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-37"]').first().click();
  const area=frame.locator('#mastery-37-workshop');
  const a=await area.evaluate(el=>{const bank=(window as any).MathMastery37,row=bank.variants[Number(el.dataset.instanceIndex)];return{row,p:bank.problem(row)};});
  await area.locator('[data-supp-action="repair"]').click();
  await expect(area.locator('.supplemental-repair')).toBeVisible();
  for(let i=0;i<4;i++)await area.locator(`#m37-cell${i+1}`).fill(a.p.cells[i]);
  await area.locator('#m37-expanded').fill(a.p.expanded);
  await area.locator('#m37-multi').fill(a.p.multiExpanded);
  await area.locator('#m37-value').fill(String(a.p.value));
  await area.locator('#m37-unit').fill(a.p.unit+'^2');
  await area.locator('#m37-check').fill(`${a.row.a*a.row.n+a.row.b}*${a.row.c*a.row.n+a.row.d}=${a.p.value}`);
  await area.locator('[data-supp-action="submit"]').click();
  await expect(area.locator('.supplemental-feedback')).toContainText('75% practice credit');
  for(const item of await area.locator('.mastery-target-list li').all())await expect(item).toContainText('Not yet shown');
  await frame.locator('.course-nav a[href="#u3-38"]').first().click();
  const special=frame.locator('#mastery-38-workshop');
  const p=await special.evaluate(el=>{const bank=(window as any).MathMastery38;return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);});
  await special.locator('#m38-square').fill(p.squareExpanded);
  await special.locator('#m38-middle').fill(String(p.middle));
  await special.locator('#m38-perfect').fill(p.perfectFactor);
  await special.locator('#m38-difference').fill(p.differenceFactor);
  await special.locator('#m38-gcf').fill(String(p.g));
  await special.locator('#m38-complete').fill(p.complete);
  await special.locator('#m38-expand').fill(p.completeExpression);
  await special.locator('[data-supp-action="submit"]').evaluate(() => {
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key:string,value:string){if(key.includes('math10c-unit3-pilot:review:v2'))throw new Error('Simulated storage failure');return original.call(this,key,value);};
  });
  await special.locator('[data-supp-action="submit"]').click();
  await expect(special.locator('.supplemental-feedback')).toContainText('Saving did not complete');
  await expect(special.locator('#m38-square')).toHaveValue(p.squareExpanded);
  for(const item of await special.locator('.mastery-target-list li').all())await expect(item).toContainText('Not yet shown');
});

test("Lesson 3.1 keeps an open draft when storage refuses the checked record", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-31"]').first().click();
  const workshop = frame.locator("#mastery-31-workshop");
  const problem = await workshop.evaluate(el => {
    const bank = (window as any).MathMastery31;
    return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);
  });
  for (const [i, suffix] of ["a", "b", "c"].entries())
    if (i < problem.numbers.length) await workshop.locator(`#m31-prime-${suffix}`).fill(problem.prime[i].join("*"));
  await workshop.locator("#m31-gcf").fill(String(problem.gcf));
  await workshop.locator("#m31-lcm").fill(String(problem.lcm));
  if (await workshop.locator("#m31-method").evaluate(el => el.tagName === "SELECT")) await workshop.locator("#m31-method").selectOption(problem.method);
  else await workshop.locator("#m31-method").fill(problem.method);
  await workshop.locator("#m31-value").fill(String(problem.value));
  await workshop.locator("#m31-counts").fill(problem.counts.join(","));
  await workshop.locator("#m31-submit").evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key: string, value: string) {
      if (key.includes("math10c-unit3-pilot:review:v2")) throw new Error("Simulated storage failure");
      return original.call(this, key, value);
    };
  });
  await workshop.locator("#m31-submit").click();
  await expect(workshop.locator("#m31-feedback")).toContainText("No mastery evidence was recorded");
  await expect(workshop.locator("#m31-gcf")).toHaveValue(String(problem.gcf));
  await expect(frame.locator("#progress-count")).toContainText("0.0 of 100");
});

test("Lesson 3.6 support keeps work and reduces that task's available marks", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-36"]').first().click();
  const workshop = frame.locator("#mastery-36-workshop");
  await workshop.locator("#m36-repair").click();
  await expect(workshop.locator("#m36-repair-panel")).toBeVisible();
  for (const [id, value] of Object.entries({
    "m36-g": "1", "m36-a": "2", "m36-b": "7", "m36-c": "3", "m36-m": "6", "m36-n": "1",
    "m36-split": "2x^2+7x+3=2x^2+6x+x+3", "m36-factor": "(2x+1)(x+3)", "m36-expand": "2x^2+7x+3",
  })) await workshop.locator(`#${id}`).fill(value);
  await workshop.locator("#m36-submit").click();
  await expect(workshop.locator("#m36-feedback")).toContainText("75% practice credit");
  await expect(frame.locator("#progress-count")).toContainText("0.0 of 100");
  await expect(workshop).toContainText("2x^2+6x+x+3");
});

test("Lesson 3.6 repair returns to the preserved attempt before a different check", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-36"]').first().click();
  const workshop = frame.locator("#mastery-36-workshop");
  for (const [id, value] of Object.entries({
    "m36-g": "2", "m36-a": "2", "m36-b": "7", "m36-c": "3", "m36-m": "6", "m36-n": "1",
    "m36-split": "2x^2+7x+3=2x^2+6x+x+3", "m36-factor": "(2x+1)(x+3)", "m36-expand": "2x^2+7x+3",
  })) await workshop.locator(`#${id}`).fill(value);
  await workshop.locator("#m36-submit").click();
  await expect(workshop.locator("#m36-feedback")).toContainText("Whole GCF");
  await expect(workshop.locator('#m36-g')).toHaveValue('2');
  await workshop.locator("#m36-repair").click();
  await expect(workshop.locator("#m36-repair-panel")).toContainText("whole GCF");
  await workshop.locator("#m36-repair-answer").fill("2");
  await workshop.locator("#m36-repair-check").click();
  await expect(workshop.locator("#m36-repair-result")).toContainText("That relationship works");
  await workshop.locator("#m36-return").click();
  await workshop.locator('#m36-g').fill('1');
  await workshop.locator('#m36-submit').click();
  await expect(workshop.locator('#m36-feedback')).toContainText('50% practice credit');
  await expect(workshop.locator(".m36-retained").first()).toContainText("Whole GCF2");
  await expect(workshop.locator(".m36-retained").last()).toContainText("Whole GCF1");
  await workshop.locator("#m36-next").click();
  await expect(workshop.locator("div.equation")).not.toContainText("2x2+7x+3");
});

test("Lesson 3.6 reports failed admission truthfully and keeps the open draft", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-36"]').first().click();
  const workshop = frame.locator("#mastery-36-workshop");
  for (const [id, value] of Object.entries({
    "m36-g": "1", "m36-a": "2", "m36-b": "7", "m36-c": "3", "m36-m": "6", "m36-n": "1",
    "m36-split": "2x^2+7x+3=2x^2+6x+x+3", "m36-factor": "(2x+1)(x+3)", "m36-expand": "2x^2+7x+3",
  })) await workshop.locator(`#${id}`).fill(value);
  await workshop.locator("#m36-submit").evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key: string, value: string) {
      if (key.includes("math10c-unit3-pilot:review:v2")) throw new Error("Simulated storage failure");
      return original.call(this, key, value);
    };
  });
  await workshop.locator("#m36-submit").click();
  await expect(workshop.locator("#m36-feedback")).toContainText("No mastery evidence was recorded");
  await expect(workshop.locator("#m36-factor")).toHaveValue("(2x+1)(x+3)");
  await expect(frame.locator("#progress-count")).toContainText("0.0 of 100");
  await expect(frame.locator("#course-save-status")).toContainText("Not saved");
});

test("Lesson 3.6 requires structural variation before a changed-form transfer", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-36"]').first().click();
  const workshop = frame.locator("#mastery-36-workshop");
  const submit = async (mode: "verification" | "transfer") => {
    const p = await workshop.evaluate(el => {
      const contract = (window as any).MathMastery36;
      return contract.problem(contract.variants[Number(el.dataset.instanceIndex)]);
    });
    const signed = (n: number) => `${n < 0 ? "" : "+"}${n}`;
    const primitiveSplit = `${p.a}x^2${signed(p.m)}x${signed(p.n)}x${signed(p.c)}`;
    const split = `${p.poly}=${p.g === 1 ? primitiveSplit : `${p.g}(${primitiveSplit})`}`;
    const values: Record<string, string> = mode === "verification" ? {
      "m36-g": String(p.g), "m36-a": String(p.a), "m36-b": String(p.b), "m36-c": String(p.c),
      "m36-m": String(p.m), "m36-n": String(p.n), "m36-split": split,
      "m36-factor": p.factor, "m36-expand": p.poly,
    } : { "m36-factor": p.factor, "m36-work": split, "m36-expand": p.poly };
    for (const [id, value] of Object.entries(values)) await workshop.locator(`#${id}`).fill(value);
    await workshop.locator("#m36-submit").click();
    await expect(workshop.locator("#m36-feedback")).toContainText("All four components are correct");
  };
  await submit("verification");
  await expect(workshop.locator(".mastery-target-list")).not.toContainText("Consistent independence");
  await workshop.locator("#m36-next").click();
  await submit("verification");
  await expect(workshop.locator(".mastery-target-list")).toContainText("Consistent independence");
  await workshop.locator("#m36-next").click();
  await expect(workshop.locator("#m36-work")).toBeVisible();
  const incomplete = await workshop.evaluate(el => {
    const contract = (window as any).MathMastery36;
    return contract.problem(contract.variants[Number(el.dataset.instanceIndex)]);
  });
  const signed = (n: number) => `${n < 0 ? "" : "+"}${n}`;
  const inside = `${incomplete.a}x^2${signed(incomplete.m)}x${signed(incomplete.n)}x${signed(incomplete.c)}`;
  await workshop.locator("#m36-work").fill(`${incomplete.poly}=${incomplete.g === 1 ? inside : `${incomplete.g}(${inside})`}`);
  await workshop.locator("#m36-factor").fill("(x+1)(x+1)");
  await workshop.locator("#m36-expand").fill(incomplete.poly);
  await workshop.locator("#m36-submit").click();
  await expect(workshop.locator("#m36-feedback")).toContainText("Factor completely");
  await expect(workshop.locator(".mastery-target-list")).not.toContainText("Transfer shown");
  await workshop.locator('#m36-factor').fill(incomplete.factor);
  await workshop.locator('#m36-submit').click();
  await expect(workshop.locator('#m36-feedback')).toContainText('75% practice credit');
  await workshop.locator("#m36-next").click();
  await submit("transfer");
  await expect(workshop.locator(".mastery-target-list")).toContainText("Transfer shown");
  await workshop.locator("#m36-recheck-verification").click();
  await expect(workshop.locator("#m36-g")).toBeVisible();
  await expect(workshop.locator("#m36-work")).toHaveCount(0);
});

test("Lesson 3.6 routes a fresh reasoning miss to another changed-form check", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-36"]').first().click();
  const workshop = frame.locator("#mastery-36-workshop");
  const task = async () => workshop.evaluate(el => {
    const bank = (window as any).MathMastery36;
    return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);
  });
  const splitFor = (p: any) => {
    const term = (n: number) => `${n < 0 ? "" : "+"}${n}`;
    const inside = `${p.a}x^2${term(p.m)}x${term(p.n)}x${term(p.c)}`;
    return `${p.poly}=${p.g === 1 ? inside : `${p.g}(${inside})`}`;
  };
  for (let index = 0; index < 2; index++) {
    const p = await task();
    for (const [id, value] of Object.entries({
      "m36-g": String(p.g), "m36-a": String(p.a), "m36-b": String(p.b), "m36-c": String(p.c),
      "m36-m": String(p.m), "m36-n": String(p.n), "m36-split": splitFor(p).replaceAll('^2','²'), "m36-factor": p.factor, "m36-expand": p.poly,
    })) await workshop.locator(`#${id}`).fill(value);
    await workshop.locator("#m36-submit").click();
    await expect(workshop.locator("#m36-feedback")).toContainText("All four components are correct");
    await workshop.locator("#m36-next").click();
  }
  let p = await task();
  for (const [id, value] of Object.entries({ "m36-factor": p.factor, "m36-work": splitFor(p), "m36-expand": p.poly })) await workshop.locator(`#${id}`).fill(value);
  await workshop.locator("#m36-submit").click();
  await expect(workshop.locator(".mastery-target-list")).toContainText("Transfer shown");
  await workshop.locator("#m36-recheck-transfer").click();
  p = await task();
  for (const [id, value] of Object.entries({ "m36-factor": p.factor, "m36-work": `${p.poly}=${p.poly}`, "m36-expand": p.poly })) await workshop.locator(`#${id}`).fill(value);
  await workshop.locator("#m36-submit").click();
  await expect(workshop.locator("#m36-feedback")).toContainText("key equality or relationship");
  await workshop.locator('#m36-work').fill(splitFor(p));
  await workshop.locator('#m36-submit').click();
  await expect(workshop.locator('#m36-feedback')).toContainText('75% practice credit');
  await expect(workshop.locator(".mastery-target-list")).toContainText("Fresh recheck needed");
  await workshop.locator("#m36-next").click();
  await expect(workshop.locator("#m36-work")).toBeVisible();
});

test("Lesson 3.6 confirms an execution gap only after repeated fresh GCF errors", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-36"]').first().click();
  const workshop = frame.locator("#mastery-36-workshop");
  for (let index = 0; index < 4; index++) {
    const p = await workshop.evaluate(el => {
      const bank = (window as any).MathMastery36;
      return bank.problem(bank.variants[Number(el.dataset.instanceIndex)]);
    });
    const term = (n: number) => `${n < 0 ? "" : "+"}${n}`;
    const inside = `${p.a}x^2${term(p.m)}x${term(p.n)}x${term(p.c)}`;
    const split = `${p.poly}=${p.g === 1 ? inside : `${p.g}(${inside})`}`;
    for (const [id, value] of Object.entries({
      "m36-g": String(index < 2 ? p.g : p.g + 1), "m36-a": String(p.a), "m36-b": String(p.b), "m36-c": String(p.c),
      "m36-m": String(p.m), "m36-n": String(p.n), "m36-split": split, "m36-factor": p.factor, "m36-expand": p.poly,
    })) await workshop.locator(`#${id}`).fill(value);
    await workshop.locator("#m36-submit").click();
    if(index>=2){
      await expect(workshop.locator('#m36-feedback')).toContainText('Whole GCF');
      await workshop.locator('#m36-g').fill(String(p.g));
      await workshop.locator('#m36-submit').click();
      await expect(workshop.locator('#m36-feedback')).toContainText('75% practice credit');
    }
    if (index === 1) await workshop.locator("#m36-recheck-verification").click();
    else if (index < 3) await workshop.locator("#m36-next").click();
  }
  await expect(workshop.locator(".mastery-target-list li").first()).toContainText("Confirmed execution gap");
  for(const item of await workshop.locator('.mastery-target-list li').all().then(rows=>rows.slice(1)))
    await expect(item).not.toContainText('Confirmed execution gap');
  await expect(frame.locator("#progress-count")).not.toContainText("100.0 of 100");
});

test("independent practice keeps the exact checked answer behind its mastery receipt", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  let frame = page.frameLocator(PREVIEW);
  await frame.locator('.course-nav a[href="#u3-practice"]').first().evaluate((link: HTMLAnchorElement) => link.click());
  await frame.locator("#practice-topic").selectOption("3.1");
  await frame.locator("#start-independent").click();
  const task = frame.locator("#practice-root .inline-task");
  const question = await task.evaluate(el => {
    const id = el.getAttribute("data-question")!;
    const q = (window as any).UNIT3_DATA.questions.find((item: any) => item.id === id);
    return { id, answer: q.answer };
  });
  await task.locator("[data-answer]").fill(question.answer);
  await task.locator("[data-check]").click();
  await expect(frame.locator("#progress-count")).not.toContainText("0.0 of 100");
  await expect.poll(() => frame.locator("body").evaluate((_, qid: string) => {
    const raw = localStorage.getItem("math10c-unit3-pilot:review:v2");
    const state = (window as any).MathState.decode(raw, { pages: (window as any).MathPilotSlice.ACTIVE_ROUTES, version: (window as any).UNIT3_DATA.version });
    return state.mastery.receipts.some((receipt: any) => receipt.source === qid);
  }, question.id)).toBe(true);
  await reloadWorkspacePreview(page, SLUG);
  frame = page.frameLocator(PREVIEW);
  const kept = await frame.locator("body").evaluate((_, qid: string) => {
    const raw = localStorage.getItem("math10c-unit3-pilot:review:v2");
    const state = (window as any).MathState.decode(raw, { pages: (window as any).MathPilotSlice.ACTIVE_ROUTES, version: (window as any).UNIT3_DATA.version });
    return state.mastery.receipts.find((receipt: any) => receipt.source === qid);
  }, question.id);
  expect(kept?.raw).toBe(question.answer);
  expect(kept?.source).toBe(question.id);
});

test("Math 10C review candidate keeps its learner route usable at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);

  await expect(frame.locator("#menu-open")).toBeVisible();
  await frame.locator("#menu-open").click();
  await expect(frame.locator("body")).toHaveClass(/nav-open/u);
  await frame.locator('a[href="#u3-35"]').first().click();
  await expect(frame.locator("#u3-35")).toBeVisible();
  await expect(frame.locator('#u3-35 [data-question="g35"] [data-answer="g35"]')).toBeVisible();
});

test("Math 10C standalone textbook notebooks save work and show full pages inline", async ({ page, context }) => {
  for (const part of ["math10c-unit3-textbook-1", "math10c-unit3-textbook-2", "math10c-unit3-textbook-3"]) {
    await openProjectInStudio(page, part);
    const frame = page.frameLocator(PREVIEW);
    await expect(frame.locator("[data-question-index]").first()).toBeVisible();
    await expect(frame.locator("body")).toContainText("Optional and ungraded");
  }

  await openProjectInStudio(page, "math10c-unit3-textbook-1");
  let frame = page.frameLocator(PREVIEW);
  await frame.locator('[data-question-index="0"]').click();
  const stage = frame.locator('[data-question-stage="3.1"]');
  await expect(stage.locator('img[src="assets/textbook-crops/3-1-q3.png"]')).toBeVisible();
  const work = stage.locator('[data-answer-index="0"]');
  await work.fill("Factor pairs 1 and 12, 2 and 6, 3 and 4.");
  await expect(frame.locator("#save-status")).toContainText(/Saved|saved/u);

  await frame.locator("#print-work").click();
  await expect(frame.locator("#print-sheet")).toContainText("3.1 · Q3 · printed p. 140");
  await expect(frame.locator("#print-sheet .print-answer")).toHaveText("Factor pairs 1 and 12, 2 and 6, 3 and 4.");
  await expect(frame.locator('#print-sheet img[src="assets/textbook-crops/3-1-q3.png"]')).toHaveCount(1);
  await expect(frame.locator("#print-message")).toContainText("Save as PDF");

  const pagesBefore = context.pages().length;
  await frame.locator('[data-reader-file="assets/textbook/math10c-3-1.pdf"]').click();
  await expect(frame.locator('[data-reader-stage="3.1"]')).toBeVisible();
  await expect(frame.locator('[data-reader-stage="3.1"] iframe')).toHaveAttribute("src", "assets/textbook/math10c-3-1.pdf");
  expect(context.pages().length).toBe(pagesBefore);

  await reloadWorkspacePreview(page, "math10c-unit3-textbook-1");
  frame = page.frameLocator(PREVIEW);
  await expect(frame.locator('[data-question-stage="3.1"] [data-answer-index="0"]')).toHaveValue(
    "Factor pairs 1 and 12, 2 and 6, 3 and 4."
  );
});

test("Math 10C recovery stays readable beside the navigation", async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __canvasHelperScorm?: unknown }).__canvasHelperScorm = {
      connectionState: () => "connected",
      scopeKey: (key: string) => `${key}:e2e`,
      learner: () => "recovery-layout-test",
      readCourseState: () => null,
      registerCourse: () => undefined,
      failCourseSave: () => undefined,
    };
  });
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);

  await frame.locator('a[href="#u3-35"]').first().click();
  await frame.locator('#u3-35 [data-question="g35"] [data-answer="g35"]').fill("x^2 + 3x + 4x + 12");

  const recovery = frame.locator("#recovery-panel");
  await expect(recovery).toBeVisible();
  await expect(recovery).toContainText("This appears only when saving is interrupted");
  await expect(recovery.locator("textarea").first()).toBeHidden();

  const sidebarBox = await frame.locator("#unit-sidebar").boundingBox();
  const recoveryBox = await recovery.boundingBox();
  expect(sidebarBox).not.toBeNull();
  expect(recoveryBox).not.toBeNull();
  expect(recoveryBox!.x).toBeGreaterThanOrEqual(sidebarBox!.x + sidebarBox!.width);

  await recovery.locator("details").first().locator("summary").click();
  await expect(recovery.locator("textarea").first()).toBeVisible();
});
