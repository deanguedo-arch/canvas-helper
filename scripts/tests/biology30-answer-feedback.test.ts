import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import {load} from 'cheerio';
import {chromium,expect} from '@playwright/test';
const evidence='projects/resources/biology30-production/v1/pilot2/verification/2026-09-08-answer-feedback';
test('BCD feedback uses A-style controls and working supporting-reading/lesson links',async()=>{
 await mkdir(evidence,{recursive:true});
 const server=createServer(async(req,res)=>{try{const match=/^\/(b|c|d)\/(.*)$/.exec(new URL(req.url!,'http://localhost').pathname);if(!match||match[2].includes('..'))throw Error('path');const file=path.join(process.cwd(),`projects/biology30-unit-${match[1]}/workspace`,match[2]||'index.html');res.setHeader('Content-Type',path.extname(file)==='.js'?'text/javascript':path.extname(file)==='.html'?'text/html':'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end();}});
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address();assert.ok(address&&typeof address==='object');const browser=await chromium.launch(),results:any[]=[];
 try{for(const unit of ['b','c','d']){
 const source=JSON.parse(await readFile(`projects/resources/biology30-production/v1/units/unit-${unit}/pilot2-practice.json`,'utf8'));
 const $=load(await readFile(`projects/biology30-unit-${unit}/workspace/index.html`,'utf8'));
 for(const item of source.items){const panel=$(`[data-pilot2-feedback="${item.id}"]`);assert.equal(panel.length,1);const link=panel.find('[data-pilot2-return-focus]');assert.equal(link.attr('data-pilot2-return-route'),item.teachingTopicId);assert.equal($(`[id="${link.attr('data-pilot2-return-focus')}"]`).length,1);const book=panel.find('.p2-feedback-reading a').attr('href');assert.ok(book?.match(/^assets\/textbook\/chapter-\d+\.pdf#page=\d+$/));await readFile(`projects/biology30-unit-${unit}/workspace/${book!.split('#')[0]}`);}
 const item=source.items.find((i:any)=>i.kind==='multiple-choice'&&i.role==='guided');assert.ok(item);
 for(const width of [1440,390]){const page=await browser.newPage({viewport:{width,height:1000}});await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.goto(`http://127.0.0.1:${address.port}/${unit}/#${item.routeId}`);if(width===390)await expect.poll(async()=>{const b=await page.locator('#course-sidebar').boundingBox();return b?b.x+b.width:0;}).toBeLessThanOrEqual(1);
 const article=page.locator(`[data-pilot2-practice="${item.id}"]`),button=article.locator('[data-pilot2-check]'),panel=article.locator('[data-pilot2-feedback]');await expect(button).toBeDisabled();await expect(panel).toBeHidden();await article.locator(`input[value="${(item.correctIndex+1)%4}"]`).check();await button.click();await expect(panel).toContainText('Review this choice.');await article.locator(`input[value="${item.correctIndex}"]`).check();await button.click();await expect(panel).toContainText('Correct.');assert.equal((await panel.innerText()).includes('Correct. Correct.'),false);await page.mouse.move(0,0);const style=await button.evaluate(e=>({background:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color}));assert.equal(style.background,'rgb(255, 255, 255)');assert.equal(style.color,'rgb(21, 66, 18)');await page.reload();await expect(panel).toBeVisible();await panel.scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`${evidence}/${unit}-${width}.png`});const back=panel.locator('[data-pilot2-return-focus]'),focus=await back.getAttribute('data-pilot2-return-focus');await back.click();await expect(page.locator(`[id="${focus}"]`)).toBeVisible();results.push({unit,width,item:item.id,allItemLinks:source.items.length,wrongAndCorrect:true,reload:true,returnToTeaching:true});await page.close();}
 }await writeFile(`${evidence}/browser-results.json`,JSON.stringify({results,syntheticOnly:true},null,2)+'\n');}finally{await browser.close();await new Promise<void>(r=>server.close(()=>r()));}
});
