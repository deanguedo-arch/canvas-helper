import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {chromium} from '@playwright/test';
import {courseFixture} from './fixtures/biology30-pilot2/renderer.js';
import {renderTopicCourse} from '../lib/biology30-course/v1/pilot2-render-course.js';
import {bundleTopicBrowser} from '../lib/biology30-course/v1/pilot2-browser-bundle.js';
import {assertLearnerCourseContract} from '../../e2e/lib/learner-course-assertions.js';
import {validateProjectContract} from '../../e2e/lib/project-contract-schema.js';

test('project assertion path verifies the new save, reload, collection and return-focus flow in a synthetic preview',async()=>{
 const fixture=courseFixture(),rendered=renderTopicCourse(fixture),bundle=await bundleTopicBrowser(process.cwd());
 const prefix='/preview/workspace/biology30-unit-b/',topic=fixture.topic.contract.topics[0],evidence=fixture.topic.framing.topics[0].evidenceSlip;
 const contract=validateProjectContract({projectSlug:'biology30-unit-b',learnerCourse:{enabled:true,routes:['overview',...fixture.topic.contract.requiredRoutes,'b-all-my-work'],hintRoutes:[],printRoutes:[],resourceChecks:[],evidenceScenario:{kind:'pilot2',route:topic.id,responseId:evidence.responseId,collectionFlag:`${topic.id}-evidence-collected`,collectionRoute:'b-all-my-work'},mobile:{width:390,height:844,routes:[topic.id,'b-all-my-work']}}},'synthetic preview',{requireDeepTargets:true});
 const server=createServer((req,res)=>{
  if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end(`<style>body{margin:0}iframe{width:100%;height:900px;border:0}</style><iframe data-testid="workspace-preview-frame" src="${prefix}index.html"></iframe>`);}
  else if(req.url===prefix+'index.html'){res.setHeader('Content-Type','text/html');res.end(rendered.html);}
  else if(req.url===prefix+bundle.destination){res.setHeader('Content-Type','text/javascript');res.end(bundle.bytes);}
  else if(req.url===prefix+'assets/fixture.svg'){res.setHeader('Content-Type','image/svg+xml');res.end('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><text x="100" y="200" font-size="90">A B</text></svg>');}
  else {res.statusCode=404;res.end();}
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address();assert.ok(address&&typeof address==='object');const browser=await chromium.launch();
 try{const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();await page.goto(`http://127.0.0.1:${address.port}`);await assertLearnerCourseContract(contract,page,page.frameLocator('[data-testid="workspace-preview-frame"]'));}
 finally{await browser.close();await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
});
