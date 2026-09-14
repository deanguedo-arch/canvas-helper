import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import {load} from 'cheerio';
const slugs=['marketing-10-20-online','marketing-30-online','legal-studies-30-online','tourism-10-20-online','tourism-30-online'];
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
async function files(root:string):Promise<string[]>{const out:string[]=[];for(const e of await readdir(root,{withFileTypes:true})){const p=path.join(root,e.name);if(e.isDirectory())out.push(...await files(p));else out.push(p);}return out.sort();}
const refs=new Set<string>();
const authorized=await readFile('projects/resources/cts-online/_extracted/authorized-codes.pdf.txt','utf8');
const results=[];
for(const slug of slugs){
 const root='projects/'+slug,html=await readFile(root+'/workspace/index.html','utf8'),$=load(html),c=JSON.parse($('#course-config').text());
 const module={exports:{} as any};new Function('module',await readFile(root+'/workspace/course.js','utf8'))(module);const api=module.exports;
 const s=api.createState(c);for(const id of c.ids){s.drafts[id]={};for(const f of c.projects.includes(id)?api.PROJECT_FIELDS:api.FIELDS)s.drafts[id][f]='\\'.repeat(api.TEXT_LIMIT);s.practice[id]={decision:2,transfer:2};assert.ok(authorized.includes(id));}
 s.reviewed=[...c.ids];s.portfolioIds=[...c.ids];s.lastRoute=[...c.routes].sort((a,b)=>b.length-a.length)[0];s.updatedAt='2026-09-09T12:00:00.0000+00:00';
 const worst=api.serialize(s,c);assert.ok(worst.length<48000);
 for(const route of c.routes)assert.equal($('#'+route+' h1').length,1);
 $('a[href]').each((_,a)=>{const href=$(a).attr('href')!;if(href.startsWith('https://'))refs.add(href);if(href.startsWith('#')){const [route,anchor]=href.slice(1).split(':');assert.equal($('#'+route).length,1,'Missing route '+href);if(anchor)assert.equal($('#'+anchor).length,1,'Missing lesson anchor '+href);}});
 const map=JSON.parse(await readFile(root+'/meta/curriculum-assessment-map.json','utf8'));assert.deepEqual(map.modules.map((m:any)=>m.code),c.ids);
 for(const m of map.modules){assert.equal(m.authoredLearningTargets.length,3);assert.ok(m.evidenceChecklist.length>=4);assert.equal(m.deliveryParameters.learnerReleaseAllowed,false);}
 const manifest=JSON.parse(await readFile(root+'/meta/project.json','utf8'));assert.equal(manifest.authoringStatus,'blocked');assert.equal(manifest.authoring.studioEditing.enabled,false);assert.ok(manifest.exportTargets.every((x:any)=>!x.enabled));
 const digests=[];for(const file of await files(root+'/workspace'))digests.push({path:path.relative(root+'/workspace',file),sha256:hash(await readFile(file))});
 const report={schemaVersion:1,projectSlug:slug,verifiedAt:new Date().toISOString(),htmlSha256:hash(html),workspaceSha256:hash(digests.map(x=>x.path+'\0'+x.sha256+'\n').join('')),hashAlgorithm:'SHA-256 of sorted relative path + NUL + file SHA-256 + LF',files:digests,modules:c.ids.length,projects:c.projects.length,routes:c.routes.length,authoredLessonSections:$('[id^="lesson-"]').length,practiceDecisions:$('[data-question]').length,worstCaseStateCharacters:worst.length,stateCeiling:48000,technicalChecks:'pass',officialOutcomeCoverage:'unresolved: current detailed documents not obtained',teacherApproval:false,learnerRelease:false};
 await writeFile(root+'/meta/verification.json',JSON.stringify(report,null,2)+'\n');results.push(report);
}
const links=[];
for(const url of refs){try{const res=await fetch(url,{signal:AbortSignal.timeout(20000)});const text=await res.text();links.push({url,status:res.status,finalUrl:res.url,characters:text.length,checkedAt:new Date().toISOString(),result:res.ok?'HTTP reachable; not curriculum completeness proof':'access or link verification requires review'});}catch(error){links.push({url,result:'unverified',error:String(error),checkedAt:new Date().toISOString()});}}
await mkdir('projects/resources/cts-online',{recursive:true});
await writeFile('projects/resources/cts-online/link-check.json',JSON.stringify(links,null,2)+'\n');
console.log(JSON.stringify({courses:results.map(({projectSlug,modules,projects,routes,worstCaseStateCharacters,workspaceSha256})=>({projectSlug,modules,projects,routes,worstCaseStateCharacters,workspaceSha256})),links},null,2));
