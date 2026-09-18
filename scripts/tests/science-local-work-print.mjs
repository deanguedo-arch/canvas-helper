/* Shared current-candidate writing/print checks; no live LMS or photo uploads. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{for(const slug of ['biology30-unit-a-pilot-3','biology30-chapter-12','biology30-chapter-13','chemistry30-unit-a-pilot']){
 const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const chem=slug.startsWith('chemistry'),url=`file://${process.cwd()}/projects/${slug}/workspace/index.html`,text=`Local saved work for ${slug}`;
 await page.goto(url+(chem?'#c9-energy':'#textbook-practice'),{waitUntil:'domcontentloaded'});
 if(chem){await page.locator('[data-save="c9-energy-explain"]').fill(text);await page.waitForTimeout(800);await page.reload();assert.equal(await page.locator('[data-save="c9-energy-explain"]').inputValue(),text);await page.evaluate(()=>location.hash='collection');await page.waitForTimeout(200);assert((await page.locator('body').textContent()).includes(text));await page.locator('#collection-content details').evaluateAll(es=>es.forEach(e=>e.open=true));}
 else{await page.locator('[data-book-text]').fill(text);await page.locator('[data-book-save]').click();await page.waitForFunction(()=>document.querySelector('[data-book-question-state]').textContent==='Saved');await page.reload();assert.equal(await page.locator('[data-book-text]').inputValue(),text);await page.evaluate(()=>location.hash='process-collection');await page.waitForFunction(text=>document.querySelector('[data-textbook-work]').textContent.includes(text),text);}
 await page.emulateMedia({media:'print'});await page.pdf({path:`/tmp/${slug}-local-work.pdf`,format:'A4',printBackground:true});assert.deepEqual(errors,[]);console.log(`${slug}: written save, reload, All My Work and print generation passed`);await context.close();
}}finally{await browser.close();}
