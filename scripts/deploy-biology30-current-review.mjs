/* Current review selector owner. Older A/B/C/D showcase stays separate. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {verifyLive} from './deploy-biology30-showcase.ts';
import {currentReviewRefreshAuthorized} from './lib/review-deployment-scope.mjs';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const receiptPath=path.join(repo,'projects/biology30-unit-a-pilot-2/meta/review-selector-deployment.json');
const receipt=JSON.parse(await fs.readFile(receiptPath,'utf8'));
if(receipt.hosting.projectId!=='calm-module-one'||receipt.hosting.siteId!=='biology30pilot')throw Error('Unexpected hosting target');
const args=process.argv.slice(2);
if(args.some(a=>!['--deploy','--refresh-biology','--refresh-science24'].includes(a)))throw Error('Use [--deploy] [--refresh-biology] [--refresh-science24]; omit --deploy for staging only');
const deploy=args.includes('--deploy'),refreshBiology=args.includes('--refresh-biology'),refreshScience24=args.includes('--refresh-science24');
const refreshAuthorized=id=>currentReviewRefreshAuthorized(id,{refreshBiology,refreshScience24});
const stage=await fs.mkdtemp(path.join(os.tmpdir(),'biology30-current-review-')),files={},sources={};
const hash=b=>createHash('sha256').update(b).digest('hex');
const verifyWithPropagation=async filesToCheck=>{for(let attempt=0;;attempt++){try{return await verifyLive({files:filesToCheck});}catch(error){if(attempt>=2)throw error;await new Promise(resolve=>setTimeout(resolve,5000*(attempt+1)));}}};
async function copy(source,relative){const stat=await fs.lstat(source);if(stat.isSymbolicLink())throw Error('Refusing symlink '+source);if(stat.isDirectory()){for(const name of (await fs.readdir(source)).sort())if(!name.startsWith('.'))await copy(path.join(source,name),relative+'/'+name);return;}if(!stat.isFile())throw Error('Not a regular file '+source);const data=await fs.readFile(source),dest=path.join(stage,'public',relative);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,data);files[relative]=hash(data);sources[relative]=source;}
const courses=[...receipt.courses];
for(let ch=14;ch<=20;ch++)if(!courses.some(c=>c.id===`biology30-ch${ch}`))courses.splice(courses.findIndex(c=>c.id==='chemistry30-a-pilot'),0,{id:`biology30-ch${ch}`,projectSlug:`biology30-chapter-${ch}`,title:`Biology 30 — Chapter ${ch}`,deployedPath:`biology30-ch${ch}/index.html`});
if(!courses.some(c=>c.id==='math10c-ch3'))courses.splice(courses.findIndex(c=>c.id==='chemistry30-a-pilot'),0,{id:'math10c-ch3',projectSlug:'math10c-unit3-pilot',title:'Math 10C — Chapter 3: Factors & Products (Pilot)',deployedPath:'math10c-ch3/index.html'});
if(!courses.some(c=>c.id==='social30-1-issue1'))courses.push({id:'social30-1-issue1',projectSlug:'social30-1-related-issue-1-option-2',title:'Social 30-1 — Related Issue 1: Option Two',deployedPath:'social30-1-issue1/index.html'});
const science24Courses=[
 {id:'science24-unit-a',projectSlug:'science24-unit-a',title:'Science 24 — Unit A: Matter and Chemical Change',deployedPath:'science24-unit-a/index.html'},
 {id:'science24-unit-b',projectSlug:'science24-unit-b',title:'Science 24 — Unit B: Energy Transformations',deployedPath:'science24-unit-b/index.html'},
 {id:'science24-unit-c',projectSlug:'science24-unit-c',title:'Science 24 — Unit C: Disease Defence and Human Health',deployedPath:'science24-unit-c/index.html'},
 {id:'science24-unit-d',projectSlug:'science24-unit-d',title:'Science 24 — Unit D: Safety in Transportation',deployedPath:'science24-unit-d/index.html'}
];
for(const course of science24Courses)if(!courses.some(c=>c.id===course.id)){const socialIndex=courses.findIndex(c=>c.id==='social30-1-issue1');courses.splice(socialIndex<0?courses.length:socialIndex,0,course);}
const existingCourseIds=new Set(receipt.courses.map(c=>c.id));
for(const c of courses)await copy(path.join(repo,'projects',c.projectSlug,'workspace'),c.id);
await copy(path.join(repo,receipt.selector.source),'index.html');
// Retain verified deployed course pages when local work belongs to another task.
for(const [name,value] of Object.entries(files)){const courseId=name.split('/')[0];if(!existingCourseIds.has(courseId)||receipt.files?.[name]===value||refreshAuthorized(courseId))continue;const expected=receipt.files?.[name];if(!expected){await fs.rm(path.join(stage,'public',name));delete files[name];delete sources[name];continue;}const response=await fetch(`${receipt.hosting.url}/${name}?preserve=${expected.slice(0,12)}`,{signal:AbortSignal.timeout(60000)});const bytes=new Uint8Array(await response.arrayBuffer());if(!response.ok||hash(bytes)!==expected)throw Error('Cannot preserve verified live course bytes '+name);await fs.writeFile(path.join(stage,'public',name),bytes);files[name]=expected;delete sources[name];}

for(const [name,source]of Object.entries(sources))if(hash(await fs.readFile(source))!==files[name])throw Error('Source changed during staging '+source);
const release={schemaVersion:1,createdAt:new Date().toISOString(),purpose:'teacher-review-only',files};
await fs.writeFile(path.join(stage,'public/release.json'),JSON.stringify(release,null,2)+'\n');
await fs.writeFile(path.join(stage,'firebase.json'),JSON.stringify({hosting:{site:'biology30pilot',public:'public',ignore:['firebase.json','**/.*'],headers:[{source:'**',headers:[{key:'Cache-Control',value:'no-cache, max-age=0, must-revalidate'}]}]}},null,2));
console.log(JSON.stringify({stage,fileCount:Object.keys(files).length}));
if(deploy){
 // Every existing course outside the explicitly refreshed family stays preserved.
 for(const [name,value] of Object.entries(files)){const id=name.split('/')[0];if(existingCourseIds.has(id)&&!refreshAuthorized(id)&&receipt.files?.[name]!==value)throw Error('Existing course differs from deployed receipt: '+name);}
 await verifyLive({files:Object.fromEntries(Object.entries(files).filter(([name])=>/^(biology30-a|biology30-ch12|biology30-ch13|chemistry30-a-pilot)\//.test(name)))});
 await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.join(repo,'node_modules/firebase-tools/lib/bin/firebase.js'),'deploy','--project','calm-module-one','--config',path.join(stage,'firebase.json'),'--only','hosting','--non-interactive'],{cwd:stage,stdio:'inherit'});child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error('Firebase deploy exited '+code)));});
 const reusable=receipt.verification?.allFilesMatch===true;
 const changed=Object.fromEntries(Object.entries(files).filter(([name,value])=>!reusable||receipt.files?.[name]!==value));
 const checked=await verifyWithPropagation(changed);
 const verification={...checked,fileCount:Object.keys(files).length,allFilesMatch:true,reusedVerifiedFileCount:Object.keys(files).length-Object.keys(changed).length,reusedVerificationAt:reusable?receipt.deployedAt:null};
 receipt.deployedAt=new Date().toISOString();receipt.files=files;receipt.courses=courses;
 receipt.purpose='Shared teacher-review selector for Biology 30 Chapters 11–20, Math 10C Chapter 3 Pilot, Chemistry 30 Unit A Pilot, Science 24 Units A–D and Social 30-1 Related Issue 1 Option Two.';
 for(const c of receipt.courses)c.indexSha256=files[c.deployedPath];
 receipt.selector.indexSha256=files['index.html'];receipt.selector.reviewVersion=/const reviewVersion='([^']+)'/.exec(await fs.readFile(sources['index.html'],'utf8'))[1];
 receipt.verification={...verification,browserRoutes:[],chemistryPreserved:true,socialPreserved:true,science24Published:true,science24Refreshed:refreshScience24,existingBiologyPreserved:!refreshBiology,biologyRefreshed:refreshBiology};
 receipt.knownRisks=receipt.knownRisks.map(r=>r.startsWith('Photo upload controls')?'Chapters 11–13 retain their existing written-only textbook controls. Chapters 14–20 photos remain browser-local; cross-device/LMS attachment saving is not certified.':r);
 if(!receipt.knownRisks.some(r=>r.startsWith('Science 24 Units A–D')))receipt.knownRisks.push('Science 24 Units A–D remain blocked teacher-review candidates; Firebase publication does not authorize export, Brightspace upload or learner release.');
 receipt.deployCommand=`npx tsx scripts/deploy-biology30-current-review.mjs --deploy${refreshBiology?' --refresh-biology':''}${refreshScience24?' --refresh-science24':''}`;
 await fs.writeFile(receiptPath,JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({url:receipt.hosting.url,version:receipt.selector.reviewVersion,verification}));
}
