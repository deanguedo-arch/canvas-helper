import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {loadBiology20UnitA} from '../lib/biology20-course/unit-a-inputs.js';

test('A Pilot 2 resource behavior: exact glossary contexts, in-course PDFs, original videos and reinforcement',async()=>{
 const a=await loadBiology20UnitA(process.cwd()),source=JSON.parse(await readFile('projects/resources/biology20-production/v1/units/a/source-videos.json','utf8')),browser=await chromium.launch();
 const workspace=path.resolve('projects/biology20-unit-a/workspace');
 const server=createServer(async(req,res)=>{try{const file=path.resolve(workspace,'.'+new URL(req.url!,'http://localhost').pathname);if(!file.startsWith(workspace+'/'))throw Error('Out of scope');res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.pdf')?'application/pdf':'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end();}});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address() as {port:number};
 try{for(const width of [1766,390]){
  const context=await browser.newContext({viewport:{width,height:954},reducedMotion:'reduce'}),page=await context.newPage();
  // Test our player lifecycle deterministically; do not claim provider playback from a mocked iframe.
  await context.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({contentType:'text/html',body:'<p>Provider-frame test fixture</p>'}));
  await page.goto(`http://127.0.0.1:${address.port}/index.html`);await page.evaluate(()=>document.fonts.ready);
  const go=async(r:string)=>{await page.evaluate(r=>{location.hash=r;},r);await expect(page.locator('#'+r)).toBeVisible();};
  if(width===1766){assert.equal(await page.locator('.course-frame').evaluate(e=>Math.round(e.getBoundingClientRect().width)),1120);await expect(page.locator('#overview .overview-intro>ol>li')).toHaveCount(4);}
  for(const term of a.input.vocabulary.introducedTerms){
   await go('a-glossary');const link=page.locator('[data-pilot2-glossary-term]').filter({has:page.locator('dt',{hasText:new RegExp('^'+term.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')})}).locator('a');
   const id=await link.getAttribute('data-pilot2-return-focus');await link.click();const target=page.locator('[id="'+id+'"]');await expect(target).toBeFocused();await expect(target).toBeInViewport();assert.ok((await target.innerText()).toLowerCase().includes(term.term.toLowerCase()));assert.equal(await target.getAttribute('data-p2-reading-target'),'');
  }
  await go('a-core-vocabulary');await page.locator('[data-biology-select-word="a-term-albedo"]').click();const family=page.locator('[data-biology-word-view="a-term-albedo"]');await expect(family.getByRole('heading',{name:'Retrieve the idea',exact:true})).toBeVisible();await expect(family.locator('.resource-links')).toContainText('See it in Lesson 1');await family.getByText('Textbook p. 11',{exact:true}).click();await expect(page.locator('#a-book-0')).toBeVisible();await expect(page.locator('#a-book-0 iframe')).toHaveAttribute('src',/page=10&zoom=page-width/);await expect(page.locator('#a-book-0-title')).toBeFocused();assert.equal(context.pages().length,1);
  for(const route of ['a-chapter-1-practice','a-chapter-2-practice','a-final-practice']){await go(route);const review=page.locator('#'+route+' .textbook-review-support');await expect(review).toBeVisible();await expect(review.locator('[data-p2-textbook-group-guide]')).toBeHidden();await review.locator('[data-p2-textbook-group-attempt]').click();await expect(review.locator('[data-p2-textbook-group-guide]')).toBeVisible();}
  await go('a-video-library');await expect(page.locator('#a-video-library [data-p2-panel-target]')).toHaveCount(16);
  for(const v of source.videos){
   await go(v.topicId);const clip=page.locator(`[id="${v.topicId}-video-${v.id}"]`);await clip.scrollIntoViewIfNeeded();await expect(clip.locator('iframe')).toHaveAttribute('src',new RegExp('/embed/'+v.id.replace(/[-]/g,'\\-')+'\\?'));await expect(clip).toContainText(v.watchFor);
   await clip.getByText('Find this video in the Video Library',{exact:true}).click();await expect(page.locator('#source-library-'+v.id)).toBeVisible();
  }
  await go('overview');await expect(page.locator('[data-p2-source-video-host] iframe')).toHaveCount(0);
  await page.goto(pathToFileURL(path.join(workspace,'index.html')).href+'#a-video-library');await page.locator('#source-library-uWZEvZ118DM').scrollIntoViewIfNeeded();await expect(page.locator('#source-library-uWZEvZ118DM [data-p2-source-video-host]')).toContainText('local web preview');await expect(page.locator('[data-p2-source-video-host] iframe')).toHaveCount(0);await context.close();
 }}finally{await browser.close();server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
