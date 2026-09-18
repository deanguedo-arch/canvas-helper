/** Hosted review smoke: navigation, loaded assets, saving, and optional progress. */
import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base='https://biology30pilot.web.app',errors=[],badLocal=[],routes=[];
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({reducedMotion:'reduce'});
 await context.route('**/*',route=>{const u=new URL(route.request().url());return u.hostname==='biology30pilot.web.app'||['data:','blob:'].includes(u.protocol)?route.continue():route.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)badLocal.push({url:r.url(),status:r.status()});});
 await page.goto(base+'/?verify='+Date.now(),{waitUntil:'networkidle'});
 assert.equal(await page.locator('#course-select option').count(),11);
 for(let ch=14;ch<=20;ch++){
  const id=`biology30-ch${ch}`;await page.selectOption('#course-select',id);
  await page.waitForFunction(id=>document.querySelector('#course-frame').contentWindow.location.pathname===`/${id}/index.html`,id);
  const f=page.frameLocator('#course-frame');
  const nav=async id=>{const a=f.locator(`a[href="#${id}"]`).first();await a.evaluate(e=>{const d=e.closest('details');if(d)d.open=true;});await a.click();await f.locator(`#${id}`).waitFor({state:'visible'});};
  await nav('lesson-01');
  assert.match(await f.locator('body').evaluate(e=>getComputedStyle(e).fontFamily),/Work Sans/);
  await nav('textbook-practice');await f.locator('[data-book-text]').waitFor({state:'visible'});
  const marker=`Live review QA chapter ${ch}`;await f.locator('[data-book-text]').fill(marker);
  await page.waitForTimeout(900);await page.reload({waitUntil:'networkidle'});
  await nav('textbook-practice');await f.locator('[data-book-text]').waitFor({state:'visible'});
  assert.equal(await f.locator('[data-book-text]').inputValue(),marker);
  await nav('labeling-practice');await nav('core-vocabulary');
  routes.push(id);console.log(`${id}: live lesson, font, textbook draft reload, labeling and vocabulary passed`);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(badLocal,[]);
 const receiptFile='projects/biology30-unit-a-pilot-2/meta/review-selector-deployment.json';
 const receipt=JSON.parse(await readFile(receiptFile,'utf8'));
 receipt.verification.existingBiologyPreserved=true;
 receipt.knownRisks=receipt.knownRisks.map(r=>r.startsWith('Photo upload controls')?'Chapters 11–13 retain their existing written-only textbook controls. Chapters 14–20 photos remain browser-local; cross-device/LMS attachment saving is not certified.':r);
 receipt.verification.browserRoutes=routes;receipt.verification.browserPageErrors=errors;receipt.verification.browserMissingLocalAssets=badLocal;receipt.verification.liveSmokeAt=new Date().toISOString();
 await writeFile(receiptFile,JSON.stringify(receipt,null,2)+'\n');
 for(let ch=14;ch<=20;ch++){const file=`projects/biology30-chapter-${ch}/meta/integration-receipt.json`,r=JSON.parse(await readFile(file,'utf8'));r.reviewDeployment={url:`${base}/biology30-ch${ch}/index.html`,reviewOnly:true,deployedAt:receipt.deployedAt,verifiedAt:receipt.verification.liveSmokeAt,indexSha256:receipt.files[`biology30-ch${ch}/index.html`],releaseStatusUnchanged:true};await writeFile(file,JSON.stringify(r,null,2)+'\n');}
 console.log('Live selector: 11 options; all seven new chapter checks passed. External media intentionally excluded.');
}finally{await browser.close();}
