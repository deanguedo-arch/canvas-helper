import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import path from 'node:path';
import {load} from 'cheerio';
import {chromium,expect} from '@playwright/test';

const evidence='projects/resources/biology30-production/v1/pilot2/verification/2026-09-08-inline-vocabulary';
const slugs={a:'biology30-unit-a-pilot-2',b:'biology30-unit-b',c:'biology30-unit-c',d:'biology30-unit-d'};
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');

test('remaining acceptance: locked definitions, family ordering and actual owner choice replacement',async()=>{
  await mkdir(evidence,{recursive:true});
  const server=createServer(async(req,res)=>{try{
    const match=/^\/([abcd])\/(.*)$/.exec(decodeURIComponent(new URL(req.url!,'http://localhost').pathname));if(!match||match[2].split('/').includes('..'))throw Error('path');
    const rel=match[2]||'index.html';res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf','.ttf':'font/ttf'} as Record<string,string>)[path.extname(rel)]??'application/octet-stream');
    res.end(await readFile(path.join(process.cwd(),'projects',slugs[match[1] as keyof typeof slugs],'workspace',rel)));
  }catch{res.statusCode=404;res.end();}});
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address();assert.ok(address&&typeof address==='object');
  const browser=await chromium.launch(),results:any[]=[];

  try { for(const u of ['a','b','c','d'] as const){
    const page=await browser.newPage();page.setDefaultTimeout(7000);
    await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
    await page.goto(`http://127.0.0.1:${address.port}/${u}/`);
    const html=await readFile(`projects/${slugs[u]}/workspace/index.html`,'utf8'),$=load(html);
    const data=u==='a'?JSON.parse($('#bio-inline-vocabulary-data').text()):JSON.parse($('#pilot2-course-data').text()).activities;
    const families=u==='a'?data.families:data.vocabulary.conceptFamilies.map((f:any)=>({...f,routes:data.contract.topics.filter((t:any)=>t.parts.some((p:any)=>f.teachingPartIds.includes(p.id))).map((t:any)=>t.id)}));
    const key=u==='a'?slugs.a+':state:v1':slugs[u]+':pilot2-v3';
    // Open a real inline term without visiting its teaching route: definition stays available, writing stays locked.
    const locked=await page.locator('[data-bio-term]').evaluateAll(nodes=>nodes.map(n=>({term:n.getAttribute('data-bio-term'),route:n.getAttribute('data-bio-term-route')})));
    let lockedChecked=false;
    for(const candidate of locked.slice(0,50)){
      const before=await page.evaluate(k=>localStorage.getItem(k),key);
      await page.locator(`[data-bio-term="${candidate.term}"]`).first().evaluate((n:HTMLElement)=>n.click());
      await page.locator('[data-bio-frayer] > summary').click();
      if((await page.locator('[data-bio-locked]').textContent())!.includes('Begin')){
        assert.ok((await page.locator('[data-bio-meaning]').textContent())!.length>30);
        assert.equal(await page.locator('dialog textarea').count(),0);
        assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),before);lockedChecked=true;
      }
      await page.keyboard.press('Escape');if(lockedChecked)break;
    }
    assert.ok(lockedChecked,`${u}: locked definition checked`);
    // Validate route-priority ordering for every delivered multi-family term.
    const termMap=new Map<string,string[]>();
    for(const t of u==='a'?data.terms:data.vocabulary.introducedTerms.map((t:any)=>({...t,familyIds:families.filter((f:any)=>f.termIds.includes(t.id)).map((f:any)=>f.id)}))){
      const k=t.term.toLowerCase();termMap.set(k,[...new Set([...(termMap.get(k)??[]),...t.familyIds])]);
    }
    const multi=locked.filter(t=>(termMap.get(t.term!)?.length??0)>1);let ordered=0;
    for(const c of multi.filter((v,i,a)=>a.findIndex(x=>x.term===v.term&&x.route===v.route)===i)){
      await page.locator(`[data-bio-term="${c.term}"][data-bio-term-route="${c.route}"]`).first().evaluate((n:HTMLElement)=>n.click());
      const expected=families.filter((f:any)=>termMap.get(c.term!)!.includes(f.id)).sort((a:any,b:any)=>Number(b.routes.includes(c.route))-Number(a.routes.includes(c.route))).map((f:any)=>f.id);
      assert.deepEqual(await page.locator('[data-bio-family] option').evaluateAll(n=>n.map(x=>(x as HTMLOptionElement).value)),expected);
      await page.keyboard.press('Escape');ordered++;
    }
    // Visit teaching routes to unlock actual owner controls, then exercise two-choice protection and scoped clearing.
    for(const route of [...new Set(families.flatMap((f:any)=>f.routes))]){await page.evaluate(r=>{location.hash=String(r)},route);await page.waitForTimeout(30);}
    const vocab=u==='a'?'core-vocabulary':`${u}-core-vocabulary`;
    await page.evaluate(r=>{location.hash=r},vocab);
    const candidates=u==='a'?await page.locator('[data-select-frayer]').evaluateAll(n=>n.map(x=>x.getAttribute('data-select-frayer')!)):data.state.families.selectable;
    const [one,two,three]=candidates;
    assert.ok(one&&two&&three);
    const open=async(id:string)=>{await page.locator(u==='a'?`[data-vocabulary-target="${id}"]`:`[data-p2-family-target="${id}"]`).click();};
    const field=(id:string)=>page.locator(u==='a'?`[data-frayer="${id}"] textarea`:`[data-pilot2-frayer-writing="${id}"] textarea`).first();
    for(const id of [one,two]){await open(id);await page.locator(u==='a'?`[data-select-frayer="${id}"]`:`[data-p2-choose-family="${id}"]`).click();await field(id).fill(`Keep writing for ${id}`);}
    await open(three);await page.locator(u==='a'?`[data-select-frayer="${three}"]`:`[data-p2-choose-family="${three}"]`).click();
    await open(one);await expect(field(one)).toHaveValue(`Keep writing for ${one}`);
    await open(two);await expect(field(two)).toHaveValue(`Keep writing for ${two}`);
    await page.locator('[data-bio-term]').first().evaluate((n:HTMLElement)=>n.click());
    await page.locator('[data-bio-family]').selectOption(one);
    await page.locator('[data-bio-frayer] > summary').click();
    if(u==='a'){
      const manager=page.locator('[data-a-frayer-choices]');await manager.evaluate((n:HTMLDetailsElement)=>n.open=true);
      const row=manager.locator('[data-a-choice-list] > div').first();await expect(row.getByRole('button')).toBeDisabled();await row.locator('input').check();await row.getByRole('button').click();
      await page.keyboard.press('Escape');await open(three);await page.locator(`[data-select-frayer="${three}"]`).click();
    }else{
      const manager=page.locator('.p2-family-choices');await manager.evaluate((n:HTMLDetailsElement)=>n.open=true);
      await page.locator('[data-pilot2-frayer-choice="0"]').selectOption(three);
      await expect(page.locator('[data-pilot2-frayer-choice="0"]')).toHaveValue(one);
      await page.locator(`[data-pilot2-frayer-clear-confirm="${one}"]`).evaluate(n=>{for(let p=n.parentElement;p;p=p.parentElement)if(p instanceof HTMLDetailsElement)p.open=true;});await page.locator(`[data-pilot2-frayer-clear-confirm="${one}"]`).check();await page.locator(`[data-pilot2-frayer-clear="${one}"]`).click();
      await page.locator('[data-pilot2-frayer-choice="0"]').selectOption(three);
      await expect(page.locator('[data-pilot2-frayer-choice="0"]')).toHaveValue(three);
    }
    await page.keyboard.press('Escape');
    await open(two);await expect(field(two)).toHaveValue(`Keep writing for ${two}`);
    await page.reload();await open(two);await expect(field(two)).toHaveValue(`Keep writing for ${two}`);
    await open(three);await expect(field(three)).toHaveValue('');
    const selected=u==='a'?await page.evaluate(()=>(window as any).biologyVocabulary.selectedFamilies()):await page.locator('[data-pilot2-frayer-choice]').evaluateAll(n=>n.map(x=>(x as HTMLSelectElement).value));
    assert.deepEqual([...selected].sort(),[two,three].sort());await expect(field(one)).toHaveValue('');
    results.push({unit:u,workspaceSha256:hash(html),lockedDefinition:true,multiFamilyRouteCases:ordered,choiceLimitProtectsWriting:true,explicitScopedClear:true,replacementReload:true,unrelatedWritingPreserved:true});await page.close();
  }}finally{await browser.close();await new Promise<void>(r=>server.close(()=>r()));}
  await writeFile(evidence+'/supplemental-results.json',JSON.stringify(results,null,2)+'\n');
});
