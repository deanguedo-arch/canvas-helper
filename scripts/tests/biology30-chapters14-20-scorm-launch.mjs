/** Focused regression for the Brightspace launch failure caused by missing contracts. */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.pdf':'application/pdf','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost'),m=u.pathname.match(/^\/ch(1[4-9]|20)\/(.*)$/);if(!m)throw Error();const base=path.join(root,`projects/biology30-chapter-${m[1]}/exports/scorm-2004-review`),file=path.resolve(base,m[2]||'index.html');if(!file.startsWith(base+path.sep))throw Error();res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});
try{for(let ch=14;ch<=20;ch++){
 const page=await browser.newPage({viewport:{width:1117,height:902},reducedMotion:'reduce'}),errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)failed.push([r.status(),r.url()]);});
 await page.route(/https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.addInitScript(()=>{const values={'cmi.learner_id':'biology-scorm-qa','cmi.suspend_data':''};window.__qaLms={values,commits:0};window.API_1484_11={Initialize:()=> 'true',GetValue:k=>values[k]||'',SetValue:(k,v)=>(values[k]=v,'true'),Commit:()=>(window.__qaLms.commits++,'true'),Terminate:()=> 'true',GetLastError:()=> '0',GetErrorString:()=>'',GetDiagnostic:()=>''};});
 await page.goto(`${origin}/ch${ch}/index.html`,{waitUntil:'domcontentloaded',timeout:20000});
 await page.waitForFunction(()=>!!window.BIOLOGY_HTML&&window.__canvasHelperScorm?.connectionState()==='connected',{timeout:5000});
 await page.locator('a[href="#lesson-01"]').first().click();await page.waitForFunction(()=>location.hash==='#lesson-01'&&!document.querySelector('#lesson-01').hidden);
 const group=page.locator('details.nav-group').filter({hasText:'Practice & Review'});await group.locator('summary').click();await group.locator('a[href="#labeling-practice"]').click();await page.waitForFunction(()=>location.hash==='#labeling-practice'&&!document.querySelector('#labeling-practice').hidden);
 await page.waitForTimeout(900);const state=await page.evaluate(()=>({status:document.querySelector('[data-local-status]').textContent,location:window.__qaLms.values['cmi.location'],suspend:window.__qaLms.values['cmi.suspend_data'],commits:window.__qaLms.commits}));
 assert.match(state.status,/Brightspace|stored|saved/i);assert.equal(state.location,'labeling-practice');assert(state.suspend.length>0);assert(state.commits>0);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 await page.close();console.log(`Chapter ${ch}: interactive launch, navigation and SCORM commit passed`);
}}finally{await browser.close();server.close();}
