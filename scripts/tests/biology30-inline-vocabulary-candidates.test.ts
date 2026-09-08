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

test('delivered inventory: all 127 rich blocks, exact destinations, unchanged A Advanced and saved schemas',async()=>{
  const baseline=JSON.parse(await readFile(evidence+'/baseline.json','utf8'));
  for(const u of ['a','b','c','d'] as const){
    const html=await readFile(`projects/${slugs[u]}/workspace/index.html`,'utf8'),$=load(html);
    if(u==='a'){
      const advanced=$('.advanced-learning-block').map((_i,n)=>$(n).text().replace(/\s+/g,' ').trim()).get();
      assert.equal(advanced.length,40);assert.equal(hash(JSON.stringify(advanced)),baseline.units['a-pilot-2'].advancedSemanticSha256);
      continue;
    }
    const payload=JSON.parse($('#pilot2-course-data').text()),{instruction,state,contract}=payload.activities;
    assert.equal(hash(JSON.stringify(state)),baseline.units[u].stateSchemaSha256,'no saved-schema change');
    assert.equal(instruction.parts.length,{b:34,c:71,d:22}[u]);
    for(const p of instruction.parts){const a=p.advanced,block=$(`[id="${a.id}"]`);
      assert.equal(block.length,1);assert.equal(block.find('.advanced-learning-body > p').length,5);
      assert.equal(a.paragraphs.length,3);assert.equal(block.find('table caption').text(),a.evidence.caption);
      assert.equal(block.find('tbody tr').length,a.evidence.rows.length);assert.equal(block.attr('open'),undefined);
      assert.equal(block.find(`[data-pilot2-optional-flag="${a.id}-complete"]`).length,1);
      assert.equal($(`#${u}-advanced [data-pilot2-return-focus="${a.id}"]`).length,1);
      const link=block.find('[data-pilot2-return-focus]');assert.equal(link.attr('data-pilot2-return-focus'),a.related.focusId);
      assert.equal($(`[id="${a.related.routeId}"] [id="${a.related.focusId}"]`).length,1,'destination belongs to named route');
      assert.ok(contract.topics.some((t:any)=>t.parts.some((part:any)=>part.id===p.partId)));
    }
  }
});

test('actual A-D adapters: shared saves, limits, collection, keyboard/scroll, mobile and every Advanced block',async()=>{
  await mkdir(evidence,{recursive:true});
  const server=createServer(async(req,res)=>{try{
    const match=/^\/([abcd])\/(.*)$/.exec(decodeURIComponent(new URL(req.url!,'http://localhost').pathname));if(!match||match[2].split('/').includes('..'))throw Error('path');
    const rel=match[2]||'index.html';res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf','.ttf':'font/ttf'} as Record<string,string>)[path.extname(rel)]??'application/octet-stream');
    res.end(await readFile(path.join(process.cwd(),'projects',slugs[match[1] as keyof typeof slugs],'workspace',rel)));
  }catch{res.statusCode=404;res.end();}});
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address();assert.ok(address&&typeof address==='object');
  const browser=await chromium.launch(),results:any[]=[];
  try{for(const u of ['a','b','c','d'] as const){
    const html=await readFile(`projects/${slugs[u]}/workspace/index.html`,'utf8'),$=load(html),payload=u==='a'?null:JSON.parse($('#pilot2-course-data').text());
    const route=u==='a'?'lesson-01':payload.activities.contract.topics[0].id,key=u==='a'?slugs.a+':state:v1':slugs[u]+':pilot2-v3';
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors:string[]=[];page.setDefaultTimeout(7000);page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
    await page.goto(`http://127.0.0.1:${address.port}/${u}/#${route}`);
    const terms=page.locator(`#${route} [data-bio-term]`);assert.ok(await terms.count());
    const first=terms.first(),term=await first.getAttribute('data-bio-term'),startUrl=page.url();await first.scrollIntoViewIfNeeded();
    const inlineStyle=await first.evaluate(n=>{const s=getComputedStyle(n),parent=getComputedStyle(n.parentElement!);return {display:s.display,padding:s.padding,minHeight:s.minHeight,background:s.backgroundColor,border:s.borderWidth,color:s.color,fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,parentColor:parent.color,parentFamily:parent.fontFamily,parentSize:parent.fontSize};});
    assert.ok(['inline','inline-block'].includes(inlineStyle.display));assert.equal(inlineStyle.padding,'0px');assert.equal(inlineStyle.minHeight,'0px');assert.equal(inlineStyle.background,'rgba(0, 0, 0, 0)');assert.equal(inlineStyle.border,'0px');assert.equal(inlineStyle.color,inlineStyle.parentColor);assert.equal(inlineStyle.fontFamily,inlineStyle.parentFamily);assert.equal(inlineStyle.fontSize,inlineStyle.parentSize);assert.ok(Number(inlineStyle.fontWeight)>=700,'clickable terms are bold without action-button styling');
    const beforeScroll=await page.evaluate(()=>({x:scrollX,y:scrollY})),beforeOpen=await page.evaluate(k=>localStorage.getItem(k),key);
    await first.click();await expect(page.getByRole('dialog',{name:await first.textContent()??undefined})).toBeVisible();
    assert.equal(page.url(),startUrl);assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),beforeOpen,'opening must not save progress or session-only UI');
    await page.locator('[data-bio-frayer] > summary').click();
    const choose=page.locator('dialog [data-select-frayer]:visible,dialog [data-p2-choose-family]:visible');if(await choose.count()&&!await choose.first().isDisabled())await choose.first().click();
    const fields=page.locator('dialog textarea');await expect(fields).toHaveCount(4);
    const fieldAttribute=u==='a'?'data-response-id':'data-pilot2-response',fieldId=(await fields.first().getAttribute(fieldAttribute))!;
    const family=u==='a'?await page.locator('dialog [data-frayer]').getAttribute('data-frayer'):await page.locator('dialog [data-pilot2-frayer-writing]').getAttribute('data-pilot2-frayer-writing');
    for(let i=0;i<4;i++)await fields.nth(i).fill(`Panel ${i}: a scientific explanation with evidence 🧬.`);
    const collect=page.locator('dialog [data-collect-frayer],dialog [data-pilot2-collect-toggle]');await expect(collect).toBeEnabled();await collect.click();
    const compare=page.locator('dialog [data-reveal-frayer],dialog [data-pilot2-frayer-compare]');await expect(compare).toBeEnabled();await compare.click();
    await page.screenshot({path:`${evidence}/${u}-panel-desktop.png`});
    await page.keyboard.press('Escape');assert.equal(page.url(),startUrl);assert.deepEqual(await page.evaluate(()=>({x:scrollX,y:scrollY})),beforeScroll);
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-bio-term')),term);
    const vocabRoute=u==='a'?'core-vocabulary':`${u}-core-vocabulary`;await page.evaluate(r=>{location.hash=r;},vocabRoute);
    await page.locator(u==='a'?`[data-vocabulary-target="${family}"]`:`[data-p2-family-target="${family}"]`).click();
    const canonical=page.locator(`[${fieldAttribute}="${fieldId}"]`);await expect(canonical).toHaveValue('Panel 0: a scientific explanation with evidence 🧬.');await canonical.fill('Changed on the full vocabulary page.');
    await page.reload();await expect(canonical).toHaveValue('Changed on the full vocabulary page.');
    await page.evaluate(r=>{location.hash=r;},route);await first.click();await page.locator('[data-bio-frayer] > summary').click();await expect(fields.first()).toHaveValue('Changed on the full vocabulary page.');
    await fields.first().fill('x'.repeat(240));const valid=await page.evaluate(k=>localStorage.getItem(k),key);await fields.first().fill('x'.repeat(241));assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),valid);
    await expect(page.locator('[data-bio-save-status]')).toContainText(/not saved|too large|cannot be read/i);
    await page.keyboard.press('Escape');await first.click();await page.locator('[data-bio-frayer] > summary').click();await expect(fields.first()).toHaveValue('x'.repeat(241));await fields.first().fill('Valid replacement after oversized draft.');
    await page.evaluate(`window.originalStorageSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error('Synthetic storage failure')}`);
    await fields.first().fill('Unsaved failure draft survives closing.');await expect(page.locator('[data-bio-save-status]')).toContainText(/not saved|failed/i);await page.keyboard.press('Escape');await first.click();await page.locator('[data-bio-frayer] > summary').click();await expect(fields.first()).toHaveValue('Unsaved failure draft survives closing.');
    await page.evaluate(`Storage.prototype.setItem=window.originalStorageSet`);await fields.first().fill('Recovered save.');
    await page.setViewportSize({width:390,height:844});await fields.first().focus();await fields.first().press('End');await fields.first().press('!');await page.screenshot({path:`${evidence}/${u}-panel-mobile.png`});assert.ok(await page.locator('dialog.bio-vocabulary').evaluate(n=>{const r=n.getBoundingClientRect();return r.x>=0&&r.right<=innerWidth+1;}));
    await page.keyboard.press('Escape');await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>{document.documentElement.style.zoom='2';});await first.click();await page.screenshot({path:`${evidence}/${u}-panel-zoom200.png`});assert.ok(await page.locator('dialog.bio-vocabulary').evaluate(n=>n.getBoundingClientRect().right<=innerWidth+1));await page.keyboard.press('Escape');await page.evaluate(()=>{document.documentElement.style.zoom='';});
    if(u!=='a')for(const width of [1440,390]){
      await page.setViewportSize({width,height:1000});
      for(const topic of payload.activities.contract.topics){await page.evaluate(r=>{location.hash=r;},topic.id);for(const part of topic.parts){const id=part.id+'-advanced',block=page.locator(`[id="${id}"]`);await block.locator(':scope > summary').click();await block.locator('table').scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${u}/${id}/${width}`);await block.locator(':scope > summary').click();}}
      const firstId=payload.activities.instruction.parts[0].advanced.id;await page.evaluate(r=>{location.hash=r;},route);await page.locator(`[id="${firstId}"] > summary`).click();await page.locator(`[id="${firstId}"]`).scrollIntoViewIfNeeded();await page.screenshot({path:`${evidence}/${u}-advanced-${width}.png`});await page.locator(`[id="${firstId}"] > summary`).click();
    }
    assert.deepEqual(errors,[]);results.push({unit:u,workspaceSha256:hash(html),termLinks:await page.locator('[data-bio-term]').count(),sharedDrafts:true,reload:true,collection:true,comparison:true,oversizedPreserved:true,failedSavePreserved:true,routeAndScroll:true,mobile:true,zoom200:true,advancedGeometryBlocks:u==='a'?0:payload.activities.instruction.parts.length});await page.close();
  }}finally{await browser.close();await new Promise<void>(r=>server.close(()=>r()));}
  await writeFile(evidence+'/browser-results.json',JSON.stringify(results,null,2)+'\n');
});
