import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';
import {load} from 'cheerio';
import {assertTopicReading} from '../lib/biology30-course/v1/pilot2-reading.js';

test('rebuilt BCD teaching retains all source paragraphs and readable worked steps at desktop and mobile', async () => {
  const root=process.cwd(),evidence='projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-learning-level';
  await mkdir(evidence,{recursive:true});
  const server=createServer(async(req,res)=>{
    try {
      const match=/^\/([bcd])\/(.*)$/.exec(decodeURIComponent(new URL(req.url!,'http://localhost').pathname));
      if(!match||match[2].split('/').includes('..')) throw Error('Invalid path');
      const relative=match[2]||'index.html',body=await readFile(path.join(root,`projects/biology30-unit-${match[1]}/workspace`,relative));
      res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.pdf':'application/pdf','.ttf':'font/ttf'} as Record<string,string>)[path.extname(relative)]??'application/octet-stream');res.end(body);
    }catch{res.statusCode=404;res.end();}
  });
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address();assert.ok(address&&typeof address==='object');
  const browser=await chromium.launch(),results=[];
  try {
    for(const [unit,topic,part] of [
      ['b','b-topic-menstrual-cycle','b-topic-menstrual-cycle-follicle-growth-and-changing-feedback'],
      ['c','c-topic-single-and-two-trait-crosses','c-topic-single-and-two-trait-crosses-probability-rules'],
      ['d','d-topic-hardy-weinberg','d-topic-hardy-weinberg-solving-and-checking']
    ]) {
      const base=`projects/resources/biology30-production/v1/units/unit-${unit}`;
      const core=JSON.parse(await readFile(`${base}/pilot2-content.json`,'utf8'));
      const instructions=JSON.parse(await readFile(`${base}/pilot2-instruction.json`,'utf8'));
      const $=load(await readFile(`projects/biology30-unit-${unit}/workspace/index.html`,'utf8'));
      const rendered=core.parts.map((p:{id:string;paragraphs:string[]})=>{
        const paragraphs=$(`#${p.id}-teaching>p`).map((_,node)=>$(node).text()).get();
        assert.deepEqual(paragraphs,p.paragraphs,p.id);return {id:p.id,paragraphs};
      });
      assertTopicReading(rendered);
      const page=await browser.newPage({viewport:{width:1440,height:1000}});
      await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
      await page.goto(`http://127.0.0.1:${address.port}/${unit}/#${topic}`);
      const example=instructions.parts.find((p:{partId:string})=>p.partId===part).workedExample;
      await expect(page.locator(`#${example.id} ol>li`)).toHaveText(example.steps);
      const check=page.locator(`#${part}-check details`);
      await expect(check).not.toHaveAttribute('open','');await check.locator('summary').click();await expect(check).toHaveAttribute('open','');
      for(const width of [1440,390]) {
        await page.setViewportSize({width,height:1000});
        if(width===390) await expect.poll(async()=>{const box=await page.locator('#course-sidebar').boundingBox();return box ? box.x+box.width : 0;}).toBeLessThanOrEqual(1);
        await page.locator(`#${example.id}`).scrollIntoViewIfNeeded();
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${unit} page at ${width}`);
        for(const li of await page.locator(`#${example.id} ol>li`).all()) {
          const box=await li.boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=width+1,`${unit} step fits ${width}`);
        }
        await page.screenshot({path:`${evidence}/${unit}-${width}.png`});
      }
      results.push({unit,renderedParts:rendered.length,workedSteps:example.steps.length,widths:[1440,390],offline:true});await page.close();
    }
    await writeFile(`${evidence}/rendered-checks.json`,JSON.stringify(results,null,2)+'\n');
  }finally{await browser.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
