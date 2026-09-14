import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import {load} from 'cheerio';
import sharp from 'sharp';
import {loadBiology20UnitA} from './lib/biology20-course/unit-a-inputs.js';

const repo=process.cwd(),a=await loadBiology20UnitA(repo),out=path.join(repo,'projects/biology20-unit-a/workspace'),meta=path.join(repo,'projects/biology20-unit-a/meta');
const build=JSON.parse(await readFile(path.join(out,'build.json'),'utf8')),sha=(bytes:Buffer|string)=>createHash('sha256').update(bytes).digest('hex');
for(const item of build.files)assert.equal(sha(await readFile(path.join(out,item.file))),item.sha256,'Candidate changed: '+item.file);
for(const item of build.sources)assert.equal(sha(await readFile(path.join(repo,item.file))),item.sha256,'Source changed: '+item.file);
const html=await readFile(path.join(out,'index.html'),'utf8'),$=load(html),coverage=JSON.parse(await readFile(path.join(a.base,'module-coverage-review.json'),'utf8'));
assert.equal(coverage.operations.length,25);assert.equal(new Set(coverage.operations.map((o:any)=>o.id)).size,25);
for(const o of coverage.operations){for(const id of [...o.teaching,...o.workedExample])assert.equal($(`[id="${id}"]`).length,1,'Missing teaching/example '+id);assert.ok(a.schema.responses[o.independentOpportunity]||a.schema.choices[o.independentOpportunity],'Missing independent opportunity '+o.id);}
assert.equal($('.p2-part').length,18);assert.equal($('.p2-advanced').length,18);assert.equal($('.p2-practice').length,32);
assert.equal(a.input.timing.routes.reduce((n,r)=>n+r.requiredMinutes,0),a.input.contract.requiredMinutes);
$('[data-pilot2-return-focus]').each((_,node)=>{const focus=$(node).attr('data-pilot2-return-focus')!,route=$(node).attr('data-pilot2-return-route')!;assert.equal($(`[id="${route}"] [id="${focus}"]`).length,1,'Broken return '+focus);});
assert.doesNotMatch(html,/not assembled|planned teaching destination|Diploma Challenge/i);
const screenDir=path.join(meta,'module-visuals');await mkdir(screenDir,{recursive:true});
// Biology presentation profile dimensions retained; A-specific route and asset inventory.
const viewports=[{width:1766,height:954},{width:1440,height:900},{width:1117,height:902},{width:1024,height:768},{width:390,height:844}];
const browser=await chromium.launch(),screens:string[]=[],errors:string[]=[];let routesChecked=0,figuresChecked=0;
try{for(const viewport of viewports){const page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.join(out,'index.html')).href);await page.evaluate(()=>document.fonts.ready);
 for(const route of ['overview',...a.schema.routes.filter(r=>r!=='a-overview')]){
  await page.evaluate(r=>{location.hash=r;},route);await page.locator('#'+route).waitFor({state:'visible'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'Horizontal page overflow '+route+' '+viewport.width);routesChecked++;
  await page.evaluate(()=>scrollTo(0,0));const routeScreen=`${viewport.width}-route-${route}.png`;await page.screenshot({path:path.join(screenDir,routeScreen)});screens.push(routeScreen);
 }
 for(const [i,t] of a.input.contract.topics.entries()){
  await page.evaluate(r=>{location.hash=r;},t.id);await page.locator('#'+t.id).waitFor({state:'visible'});
  for(const figure of await page.locator('#'+t.id+' .p2-part .p2-figure img').all()){await figure.scrollIntoViewIfNeeded();await figure.evaluate((n:HTMLImageElement)=>n.decode());assert.ok(await figure.evaluate((n:HTMLImageElement)=>n.naturalWidth>0));figuresChecked++;}
  await page.evaluate(()=>scrollTo(0,0));const file=`${viewport.width}-lesson-${i+1}.png`;await page.screenshot({path:path.join(screenDir,file)});screens.push(file);
  const advanced=page.locator('#'+t.id+' .p2-advanced').first();await advanced.locator('summary').click();await advanced.scrollIntoViewIfNeeded();const af=`${viewport.width}-advanced-${i+1}.png`;await page.screenshot({path:path.join(screenDir,af)});screens.push(af);
 }
 await page.evaluate(()=>{location.hash='a-models';});await page.locator('#a-models').waitFor({state:'visible'});const file=`${viewport.width}-models.png`;await page.screenshot({path:path.join(screenDir,file)});screens.push(file);
 await page.emulateMedia({media:'print'});await page.screenshot({path:path.join(screenDir,`${viewport.width}-print.png`)});screens.push(`${viewport.width}-print.png`);await page.close();
}}finally{await browser.close();}
assert.deepEqual(errors,[]);
for(const width of [1440,1024,390]){const selected=screens.filter(s=>s.startsWith(width+'-')&&s.includes('lesson')),tiles=[];for(const [i,file] of selected.entries())tiles.push({input:await sharp(path.join(screenDir,file)).resize(360,300,{fit:'contain',background:'white'}).png().toBuffer(),left:(i%3)*360,top:Math.floor(i/3)*300});await sharp({create:{width:1080,height:600,channels:3,background:'white'}}).composite(tiles).png().toFile(path.join(screenDir,`${width}-lesson-gallery.png`));}
const result={schemaVersion:1,status:'automated-candidate-checks-passed; screenshot-inspection-record-separate',candidateSha256:sha(html),profile:'Biology presentation: desktop 1440x900, tablet 1024x768, mobile 390x844; explicit Biology20 A inventory, not the Biology30-only CLI',routesChecked,figuresChecked,coreParts:18,advanced:18,practice:32,terms:a.input.vocabulary.introducedTerms.length,families:10,requiredRoutes:10,maximumSavedCharacters:a.maximum,sourceFilesVerified:build.sources.length,learnerFilesVerified:build.files.length,coverageRecord:'module-coverage-review.json',screens,errors,limits:['No live LMS, deployment, Studio editing or teacher/curriculum certification.','Read source and coverage dispositions; physical/team performance is not established.']};
await writeFile(path.join(meta,'module-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
