/* Current review selector owner. Older A/B/C/D showcase stays separate. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {verifyLive} from './deploy-biology30-showcase.ts';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const receiptPath=path.join(repo,'projects/biology30-unit-a-pilot-2/meta/review-selector-deployment.json');
const receipt=JSON.parse(await fs.readFile(receiptPath,'utf8'));
if(receipt.hosting.projectId!=='calm-module-one'||receipt.hosting.siteId!=='biology30pilot')throw Error('Unexpected hosting target');
if(process.argv.slice(2).some(a=>a!=='--deploy'))throw Error('Use --deploy or no arguments for staging only');
const stage=await fs.mkdtemp(path.join(os.tmpdir(),'biology30-current-review-')),files={},sources={};
const hash=b=>createHash('sha256').update(b).digest('hex');
async function copy(source,relative){const stat=await fs.lstat(source);if(stat.isSymbolicLink())throw Error('Refusing symlink '+source);if(stat.isDirectory()){for(const name of (await fs.readdir(source)).sort())if(!name.startsWith('.'))await copy(path.join(source,name),relative+'/'+name);return;}if(!stat.isFile())throw Error('Not a regular file '+source);const data=await fs.readFile(source),dest=path.join(stage,'public',relative);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,data);files[relative]=hash(data);sources[relative]=source;}
const courses=[...receipt.courses];
for(let ch=14;ch<=20;ch++)if(!courses.some(c=>c.id===`biology30-ch${ch}`))courses.splice(courses.findIndex(c=>c.id==='chemistry30-a-pilot'),0,{id:`biology30-ch${ch}`,projectSlug:`biology30-chapter-${ch}`,title:`Biology 30 — Chapter ${ch}`,deployedPath:`biology30-ch${ch}/index.html`});
for(const c of courses)await copy(path.join(repo,'projects',c.projectSlug,'workspace'),c.id);
await copy(path.join(repo,receipt.selector.source),'index.html');
for(const [name,source]of Object.entries(sources))if(hash(await fs.readFile(source))!==files[name])throw Error('Source changed during staging '+source);
const release={schemaVersion:1,createdAt:new Date().toISOString(),purpose:'teacher-review-only',files};
await fs.writeFile(path.join(stage,'public/release.json'),JSON.stringify(release,null,2)+'\n');
await fs.writeFile(path.join(stage,'firebase.json'),JSON.stringify({hosting:{site:'biology30pilot',public:'public',ignore:['firebase.json','**/.*'],headers:[{source:'**',headers:[{key:'Cache-Control',value:'no-cache, max-age=0, must-revalidate'}]}]}},null,2));
console.log(JSON.stringify({stage,fileCount:Object.keys(files).length}));
if(process.argv.includes('--deploy')){
 // New chapters only: refuse to silently publish changes to existing courses.
 await verifyLive({files:Object.fromEntries(Object.entries(files).filter(([name])=>/^(biology30-a|biology30-ch12|biology30-ch13|chemistry30-a-pilot)\//.test(name)))});
 await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.join(repo,'node_modules/firebase-tools/lib/bin/firebase.js'),'deploy','--project','calm-module-one','--config',path.join(stage,'firebase.json'),'--only','hosting','--non-interactive'],{cwd:stage,stdio:'inherit'});child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error('Firebase deploy exited '+code)));});
 const reusable=receipt.verification?.allFilesMatch===true;
 const changed=Object.fromEntries(Object.entries(files).filter(([name,value])=>!reusable||receipt.files?.[name]!==value));
 const checked=await verifyLive({files:changed});
 const verification={...checked,fileCount:Object.keys(files).length,allFilesMatch:true,reusedVerifiedFileCount:Object.keys(files).length-Object.keys(changed).length,reusedVerificationAt:reusable?receipt.deployedAt:null};
 receipt.deployedAt=new Date().toISOString();receipt.files=files;receipt.courses=courses;
 receipt.purpose='Shared teacher-review selector for Biology 30 Chapters 11–20 and Chemistry 30 Unit A Pilot.';
 for(const c of receipt.courses)c.indexSha256=files[c.deployedPath];
 receipt.selector.indexSha256=files['index.html'];receipt.selector.reviewVersion=/const reviewVersion='([^']+)'/.exec(await fs.readFile(sources['index.html'],'utf8'))[1];
 receipt.verification={...verification,browserRoutes:[],chemistryPreserved:true,existingBiologyPreserved:true};
 receipt.knownRisks=receipt.knownRisks.map(r=>r.startsWith('Photo upload controls')?'Chapters 11–13 retain their existing written-only textbook controls. Chapters 14–20 photos remain browser-local; cross-device/LMS attachment saving is not certified.':r);
 receipt.deployCommand='npx tsx scripts/deploy-biology30-current-review.mjs --deploy';
 await fs.writeFile(receiptPath,JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({url:receipt.hosting.url,version:receipt.selector.reviewVersion,verification}));
}
