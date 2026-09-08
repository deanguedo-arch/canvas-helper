import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { emptyTopicState, encodeTopicState } from '../lib/biology30-course/v1/pilot2-state.js';
const evidence='projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-c-capacity-completion';
test('all 18 reviewed controls preserve drafts, restore saved writing and show bounded capacity on desktop/tablet/mobile',async()=>{
  const fixtures=JSON.parse(await readFile(evidence+'/response-fixtures.json','utf8'));
  const decisions=JSON.parse(await readFile(evidence+'/repair-decisions.json','utf8'));
  const server=createServer(async(req,res)=>{try{
    const match=/^\/([bcd])\/(.*)$/.exec(decodeURIComponent(new URL(req.url!,'http://localhost').pathname));
    if(!match||match[2].split('/').includes('..'))throw Error('path');
    const rel=match[2]||'index.html';res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf','.pdf':'application/pdf'} as Record<string,string>)[path.extname(rel)]??'application/octet-stream');
    res.end(await readFile(path.join(process.cwd(),`projects/biology30-unit-${match[1]}/workspace`,rel)));
  }catch{res.statusCode=404;res.end();}});
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address();assert.ok(address&&typeof address==='object');
  const browser=await chromium.launch();const results:any[]=[];
  await mkdir(evidence,{recursive:true});
  try{for(const unit of ['b','c','d']){
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
    if(unit==='c'){
      const prior=JSON.parse(await readFile(evidence+'/pre-change-c-schema.json','utf8')),state=emptyTopicState(prior);
      state.responses['c-review-seminar-connect']='Earlier saved response 🧬';
      const choice=Object.keys(prior.choices)[0];state.choices[choice]=prior.choices[choice].values[2];state.visited=[prior.routes[2]];
      await page.addInitScript(raw=>{const k='biology30-unit-c:pilot2-v3';if(!localStorage.getItem(k))localStorage.setItem(k,raw);},encodeTopicState(state,prior));
    }
    for(const route of [unit+'-review-seminar',unit+'-final-practice']){
      await page.goto(`http://127.0.0.1:${address.port}/${unit}/#${route}`);
      if(unit==='c'&&route.endsWith('review-seminar'))await expect(page.locator('[data-pilot2-response="c-review-seminar-connect"]')).toHaveValue('Earlier saved response 🧬');
      const selected=fixtures.responses.filter((f:any)=>f.id.startsWith(unit+'-')&&(route.endsWith('review-seminar')?f.id.includes('review-seminar'):f.id.includes('investigation')));
      for(const f of selected){
        const d=decisions.responses.find((x:any)=>x.id===f.id),field=page.locator(`[data-pilot2-response="${f.id}"]`),note=page.locator(`[data-pilot2-response-capacity="${f.id}"]`);
        const value=f.example;
        await field.fill(value);await page.reload();await expect(field).toHaveValue(value);await expect(note).toContainText(`/ ${d.appliedLimit} characters`);
        await field.fill('x'.repeat(d.appliedLimit));const key=`biology30-unit-${unit}:pilot2-v3`,before=await page.evaluate(k=>localStorage.getItem(k),key);assert.ok(before);
        await field.fill('x'.repeat(d.appliedLimit+1));await expect(field).toHaveValue('x'.repeat(d.appliedLimit+1));await expect(note).toContainText('Over the limit by 1');await expect(field).toHaveAttribute('aria-invalid','true');
        assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),before,'oversized draft must not replace saved work');
        await field.fill(value);await expect(field).toHaveAttribute('aria-invalid','false');
        results.push({unit,id:f.id,completeExample:true,limit:d.appliedLimit,reload:true,boundary:true,oversizedDraftPreserved:true,lastValidSavePreserved:true});
      }
      const first=page.locator(`[data-pilot2-response="${selected[0].id}"]`);
      for(const width of [1440,1024,390]){await page.setViewportSize({width,height:1000});if(width===390)await expect.poll(async()=>{const b=await page.locator('#course-sidebar').boundingBox();return b?b.x+b.width:0;}).toBeLessThanOrEqual(1);await first.scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const note=page.locator(`[data-pilot2-response-capacity="${selected[0].id}"]`);await page.screenshot({path:`${evidence}/${route}-${width}.png`});const box=await note.boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=width+1,JSON.stringify({route,width,box}));}
    }
    assert.deepEqual(errors,[]);await page.close();
  }}finally{await browser.close();await new Promise<void>(r=>server.close(()=>r()));}
  await writeFile(evidence+'/browser-results.json',JSON.stringify(results,null,2)+'\n');
});
