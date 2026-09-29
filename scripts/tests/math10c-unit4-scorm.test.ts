import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';

const root = path.resolve(process.cwd(), 'projects/math10c-unit4-pilot/exports/scorm-2004-review');
const mime: Record<string, string> = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json','.xml':'application/xml'};
let browser: Browser;
let baseUrl = '';
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    if (relative.split('/').includes('..')) throw new Error('invalid path');
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) throw new Error('invalid path');
    response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch { response.statusCode = 404; response.end('Not found'); }
});

test.before(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); assert.ok(address && typeof address === 'object');
  baseUrl = `http://127.0.0.1:${address.port}/index.html`;
  browser = await chromium.launch({headless:true});
});
test.after(async () => { await browser.close(); server.close(); });

async function launch(context: BrowserContext, suspend = '', fail = false): Promise<Page> {
  const page = await context.newPage();
  const initial = JSON.stringify({suspend,fail});
  await page.addInitScript({content:`(()=>{const input=${initial};const lms={values:{'cmi.suspend_data':input.suspend,'cmi.learner_id':'chapter4-student'},initializes:0,commits:0,terminates:0,fail:input.fail};window.chapter4Lms=lms;window.API_1484_11={Initialize:function(){lms.initializes++;return lms.initializes===1?'true':'false';},GetValue:function(key){return lms.values[key]||'';},SetValue:function(key,value){if(lms.fail)return 'false';lms.values[key]=value;return 'true';},Commit:function(){lms.commits++;return lms.fail?'false':'true';},Terminate:function(){lms.terminates++;return 'true';},GetLastError:function(){return lms.fail?'101':'0';},GetErrorString:function(){return lms.fail?'General failure':'No error';},GetDiagnostic:function(){return lms.fail?'Simulated failure':'';}};})();`});
  await page.goto(baseUrl+'#u4-41',{waitUntil:'load'});
  return page;
}

async function completeLesson41(page: Page) {
  const answers = await page.evaluate(() => {
    const task=(window as any).Chapter4Checkers.getTask('41','initial');
    return Object.fromEntries(Object.entries(task.fields).map(([name,config]:[string,any])=>[name,config.answers[0]]));
  });
  for(const [name,value] of Object.entries(answers)){
    const field=page.locator(`#u4-task-41-${name}`);
    if(await field.evaluate(node=>node.tagName==='SELECT'))await field.selectOption(String(value));else await field.fill(String(value));
  }
  await page.locator('[data-chapter4-task="41"] [data-check-task]').click();
  assert.match(await page.locator('[data-chapter4-task="41"] [data-task-feedback]').innerText(),/fresh independent evidence/i);
}

async function completeCurrentTask(page: Page, taskId: string) {
  const answers = await page.evaluate((id) => {
    const review=(window as any).Chapter4MasteryReview.getState().tasks[id];
    const task=(window as any).Chapter4Checkers.getTask(id,review.variant);
    return Object.fromEntries(Object.entries(task.fields).map(([name,config]:[string,any])=>[name,config.answers[0]]));
  }, taskId);
  const section=page.locator(`[data-chapter4-task="${taskId}"]`);
  for(const [name,value] of Object.entries(answers)){
    const field=section.locator(`[data-field="${name}"]`);
    if(await field.evaluate(node=>node.tagName==='SELECT'))await field.selectOption(String(value));else await field.fill(String(value));
  }
  await section.locator('[data-check-task]').click();
}

test('the exact review package saves, resumes, reports completion, and preserves the last confirmed LMS copy', async () => {
  const errors:string[]=[];
  const firstContext=await browser.newContext();
  const first=await launch(firstContext);first.on('pageerror',error=>errors.push(error.message));
  const boot=await first.evaluate(()=>({initializes:(window as any).chapter4Lms.initializes,initError:(window as any).chapter4Lms.initError,api:Boolean((window as any).API_1484_11),connection:(window as any).__canvasHelperScorm?.connectionState(),managed:(window as any).Chapter4Save?.managed,lastError:(window as any).__canvasHelperScorm?.lastError()}));
  assert.equal(boot.initializes,1,JSON.stringify(boot));
  assert.equal(await first.evaluate(()=>(window as any).Chapter4Save.managed),true);
  await completeLesson41(first);
  const saved=await first.evaluate(async()=>{const bridge=(window as any).__canvasHelperScorm;const ok=await bridge.saveAsync();return {ok,error:bridge.lastError(),lms:(window as any).chapter4Lms};});
  assert.equal(saved.ok,true,saved.error);
  assert.ok(saved.lms.commits>=1);
  assert.equal(saved.lms.values['cmi.completion_status'],'incomplete');
  assert.equal(Number(saved.lms.values['cmi.progress_measure']),0.125);
  assert.ok(saved.lms.values['cmi.suspend_data'].length>50&&saved.lms.values['cmi.suspend_data'].length<=60000);
  const suspend=saved.lms.values['cmi.suspend_data'];
  await firstContext.close();

  const resumedContext=await browser.newContext();
  const resumed=await launch(resumedContext,suspend);resumed.on('pageerror',error=>errors.push(error.message));
  assert.match(await resumed.locator('#mastery-score').innerText(),/^3\.1/);
  assert.equal(await resumed.locator('#u4-task-41-exact').inputValue(),'12');
  assert.equal(await resumed.locator('[data-chapter4-task="41"] [data-check-task]').isDisabled(),true);
  const completed=await resumed.evaluate(async()=>{
    const save=(window as any).Chapter4Save,key=(window as any).Chapter4MasteryReview.storageKey;
    const state=JSON.parse(localStorage.getItem(key));
    state.completedIds=['u4-check-41','u4-check-42','u4-check-43','u4-check-44','u4-check-45','u4-check-46','u4-check-47','u4-check-48'];
    localStorage.setItem(key,JSON.stringify(state));window.dispatchEvent(new CustomEvent('chapter4:state-changed',{detail:{area:'mastery'}}));
    const ok=await (window as any).__canvasHelperScorm.saveAsync();return {ok,lms:(window as any).chapter4Lms};
  });
  assert.equal(completed.ok,true);
  assert.equal(completed.lms.values['cmi.completion_status'],'completed');
  assert.equal(Number(completed.lms.values['cmi.progress_measure']),1);
  const lastGood=completed.lms.values['cmi.suspend_data'];
  const failure=await resumed.evaluate(async()=>{
    (window as any).chapter4Lms.fail=true;
    const key=(window as any).Chapter4MasteryReview.storageKey,state=JSON.parse(localStorage.getItem(key));state.updatedAt='unsent-change';localStorage.setItem(key,JSON.stringify(state));window.dispatchEvent(new CustomEvent('chapter4:state-changed',{detail:{area:'mastery'}}));
    const ok=await (window as any).__canvasHelperScorm.saveAsync();return {ok,suspend:(window as any).chapter4Lms.values['cmi.suspend_data']};
  });
  assert.equal(failure.ok,false);
  assert.equal(failure.suspend,lastGood);
  assert.deepEqual(errors,[]);
  await resumedContext.close();
});

test('the complete configured mastery history and practice envelope fit the exact SCORM save', async () => {
  const context=await browser.newContext();const page=await launch(context);
  const measurement=await page.evaluate(async()=>{
    const text:any=Function('seed','length',"let out='';for(let i=0;i<length;i++)out+=String.fromCharCode(33+((seed*37+i*19)%90));return out;");
    const mastery:any={version:'chapter4-review-state-4',policyVersion:'c4-mastery-policy-3',tasks:{},targetScores:{},evidence:{},exposures:{},completedIds:[],updatedAt:new Date().toISOString()};
    const variants=['initial','fresh','fresh2','transfer','transfer2','retention'];
    for(let lesson=41;lesson<=48;lesson++){
      const answers:any=Function('seed','text','return {a:text(seed,64),b:text(seed+1,64),c:text(seed+2,64),d:text(seed+3,64)};');
      mastery.tasks[String(lesson)]={variant:'retention2',answers:answers(lesson,text),checks:4,help:true,practiceCredit:25,closed:true,
        firstSubmission:{answers:answers(lesson+100,text),helpBefore:true,checkedAt:'2026-09-24T12:00:00.000Z'},finalSubmission:{answers:answers(lesson,text),checkedAt:'2026-09-24T12:01:00.000Z'},
        history:variants.map((variant,index)=>({variant,checks:4,help:true,practiceCredit:25,firstSubmission:{answers:answers(lesson+200+index*10,text),helpBefore:true,checkedAt:'2026-09-24T12:00:00.000Z'},finalSubmission:{answers:answers(lesson+300+index*10,text),checkedAt:'2026-09-24T12:01:00.000Z'}}))};
    }
    const admitted=(window as any).Chapter4Policy.preflight(mastery);if(!admitted.allowed)throw Error('Mastery preflight rejected '+admitted.characters);
    localStorage.setItem((window as any).Chapter4Save.key('mastery'),admitted.serialized);
    const practice:any={version:'chapter4-practice-state-2',seeds:{lesson:8,mixed:8,review:8},lesson:'48',responses:{},summary:{},updatedAt:new Date().toISOString()};
    for(let i=0;i<40;i++)practice.responses['review:8:q'+i]={answer:text(500+i,80),checks:4,support:true,resolved:i%2===0,correct:i%2===0,updatedAt:'2026-09-24T12:00:00.000Z'};
    localStorage.setItem((window as any).Chapter4Save.key('practice'),JSON.stringify(practice));
    localStorage.setItem((window as any).Chapter4Save.key('tools'),JSON.stringify({controls:{coefficient:12,index:5,radicand:500,first:-8,second:12}}));
    window.dispatchEvent(new CustomEvent('chapter4:state-changed',{detail:{area:'capacity'}}));
    const bridge=(window as any).__canvasHelperScorm,ok=await bridge.saveAsync(),suspend=(window as any).chapter4Lms.values['cmi.suspend_data'];
    return {ok,error:bridge.lastError(),masteryChars:admitted.characters,compositeChars:JSON.stringify((window as any).Chapter4Save.snapshot()).length,suspendChars:suspend.length};
  });
  assert.equal(measurement.ok,true,measurement.error);
  assert.equal(measurement.masteryChars<=52000,true);
  assert.equal(measurement.suspendChars<=60000,true);
  console.log(`Chapter 4 capacity: mastery ${measurement.masteryChars}/52000; composite ${measurement.compositeChars}; SCORM suspend_data ${measurement.suspendChars}/60000.`);
  await context.close();
});

test('the real 32-target path with first work, transfer, later-session evidence and supporting state fits the exact package', async () => {
  let context=await browser.newContext();let page=await launch(context);
  for(let lesson=41;lesson<=48;lesson++){
    const id=String(lesson);await page.evaluate(route=>{window.location.hash=route;},`u4-${id}`);let reached=false;
    for(let stage=0;stage<5;stage++){
      await completeCurrentTask(page,id);
      reached=await page.evaluate(taskId=>{const state=(window as any).Chapter4MasteryReview.getState();return Object.entries(state.targetScores).filter(([target])=>target.startsWith(`C4-${taskId}`)).every(([,score])=>Number(score)>=75);},id);
      if(reached)break;
      await page.locator(`[data-chapter4-task="${id}"] [data-next-task]`).click();
    }
    assert.equal(reached,true,`lesson ${id} did not reach transfer`);
  }
  await page.evaluate(()=>{const key=(window as any).Chapter4MasteryReview.storageKey,saved=JSON.parse(localStorage.getItem(key));Object.values(saved.evidence).forEach((entry:any)=>{entry.retentionAvailableAt=Date.now()-1000;});localStorage.setItem(key,JSON.stringify(saved));});
  const transferSave=await page.evaluate(async()=>{const bridge=(window as any).__canvasHelperScorm,ok=await bridge.saveAsync();return {ok,error:bridge.lastError(),suspend:(window as any).chapter4Lms.values['cmi.suspend_data']};});
  assert.equal(transferSave.ok,true,transferSave.error);await context.close();

  context=await browser.newContext();page=await launch(context,transferSave.suspend);
  for(let lesson=41;lesson<=48;lesson++){
    const id=String(lesson),section=page.locator(`[data-chapter4-task="${id}"]`);await page.evaluate(route=>{window.location.hash=route;},`u4-${id}`);
    for(let attempt=0;attempt<2;attempt++){await section.locator('[data-next-task]').click();await completeCurrentTask(page,id);const retained=await page.evaluate(taskId=>{const scores=(window as any).Chapter4MasteryReview.getState().targetScores;return Object.entries(scores).filter(([target])=>target.startsWith(`C4-${taskId}`)).every(([,score])=>Number(score)>=100);},id);if(retained)break;}
  }
  const measurement=await page.evaluate(async()=>{
    const save=(window as any).Chapter4Save,mastery=(window as any).Chapter4MasteryReview.getState(),text='student working retained without truncation';
    const practice:any={version:'chapter4-practice-state-2',seeds:{lesson:9,mixed:9,review:9},lesson:'48',responses:{},summary:{},updatedAt:new Date().toISOString()};
    for(let i=0;i<32;i++)practice.responses['review:9:q'+i]={answer:text+' '+i,checks:Math.min(4,1+i%4),support:i%3===0,resolved:true,correct:true,updatedAt:new Date().toISOString()};
    localStorage.setItem(save.key('practice'),JSON.stringify(practice));
    const learning:any={version:'chapter4-learning-state-1',tasks:{}};for(let lesson=41;lesson<=48;lesson++){learning.tasks[lesson+'-guided']={answers:{decision:text+' '+lesson},checked:true};learning.tasks[lesson+'-faded']={answers:{decision:text+' '+lesson+' faded'},checked:true};}localStorage.setItem(save.key('learning'),JSON.stringify(learning));
    localStorage.setItem(save.key('tools'),JSON.stringify({radical:{coefficient:12,index:5,radicand:500},exponent:{base:'x',first:-8,second:12}}));
    window.dispatchEvent(new CustomEvent('chapter4:state-changed',{detail:{area:'capacity'}}));
    const bridge=(window as any).__canvasHelperScorm,ok=await bridge.saveAsync(),suspend=(window as any).chapter4Lms.values['cmi.suspend_data'],snapshot=save.snapshot();
    return {ok,error:bridge.lastError(),scores:mastery.targetScores,masteryChars:localStorage.getItem(save.key('mastery')).length,compositeChars:JSON.stringify(snapshot).length,suspendChars:suspend.length};
  });
  assert.equal(measurement.ok,true,measurement.error);assert.equal(Object.values(measurement.scores).filter(score=>score===100).length,32);assert.equal(measurement.masteryChars<=52000,true);assert.equal(measurement.suspendChars<=60000,true);
  console.log(`Chapter 4 real path capacity: mastery ${measurement.masteryChars}/52000; composite ${measurement.compositeChars}; SCORM suspend_data ${measurement.suspendChars}/60000.`);
  await context.close();
});
