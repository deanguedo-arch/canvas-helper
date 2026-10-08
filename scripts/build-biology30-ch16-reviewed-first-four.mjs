import fs from 'node:fs';
import assert from 'node:assert/strict';

// Reuse the guarded additive integrator, with an explicit Chapter 16 contract.
// No historical builder/config replacement; existing Chapter 16 workspace is the baseline.
let source=fs.readFileSync('scripts/build-biology30-ch15-reviewed-complete.mjs','utf8');
const replace=(before,after)=>{assert(source.includes(before),`Adapter drift: ${before.slice(0,90)}`);source=source.replace(before,after);};
replace("const project=path.resolve('projects/biology30-chapter-15');","const project=path.resolve('projects/biology30-chapter-16');");
replace("const root=path.join(parent,'complete-teaching-v0.1.0');","const root=path.join(parent,'first-four-v0.1.0');");
replace("const previous=path.join(parent,'first-pair-v0.1.0/evaluation/new');","const previous=path.join(project,'workspace');");
const start=source.indexOf('const packages=['),end=source.indexOf('packages.push(',start);
assert(start>=0&&end>start);
source=source.slice(0,start)+`const packages=[
  {span:'01-02',hash:'b7db0717e57078d87aa9e96d83fc1b3f501119cc9e2b5532f9ec34257f9eb99b',name:'Biology30_CH16_01-02_Conditional_Content_Handoff_v0.1.0.zip'},
  {span:'03-04',hash:'5d55fe48a604ebbdf118b6508ec1a98d3543291119125bd3ac8cdcfa99110b80',name:'Biology30_CH16_03-04_Conditional_Content_Handoff_v0.1.0.zip'}
];
`+source.slice(end);
replace("'workspace/index.html':'7ff098c0763a1eedbe8c7e562e13082aa7a832582f9c73fd1739eaa4c31f0109'","'workspace/index.html':'6def7f770f78263613c52cc59d64ef40c82857cad39227ff2008afc8ba09872b'");
replace("'meta/external-generation/authoring/course-config.json':'8ae42534366bf744c39a584059d2b1be871bbdd6ffae2954d1384ad7e802faaf'","'meta/external-generation/authoring/course-config.json':'eadae7629c9a7e45f83c9055f6dfd32e96bb49660f4d0f53505c6acecb7a7e8e'");
replace("'9df5d0862c281fac3f23438be46e0828c962a6c14508fbb66b1936e1ac7d58d7','Previous candidate drift'","'6def7f770f78263613c52cc59d64ef40c82857cad39227ff2008afc8ba09872b','Current baseline drift'");
replace("if(spec.supplement){","for(const supplement of (spec.supplements||[])){");
replace("const asset=(spec.supplement.asset||spec.supplement.path).replace(/^.*?learner\\//,'learner/');","const asset='learner/assets/figures/'+supplement.path;");
replace('spec.supplement.sha256','supplement.sha256');
replace("g.batch.startsWith('ch15-')","g.batch.startsWith('ch16-')");
replace('assert.equal(replacements.length,38);assert.equal(newIDs.size,3);assert.equal(supplements.length,3);','assert.equal(replacements.length,16);assert.equal(newIDs.size,2);assert.equal(supplements.length,2);');
replace('assert.equal(newTree.length,oldTree.length+4);','assert.equal(newTree.length,oldTree.length+2);');
replace("integratedLessons:'01–12'","integratedLessons:'01–04 only'");
replace('cumulativeBlocks:46','cumulativeBlocks:16');
replace('cumulativeSourceSupplements:4','cumulativeSourceSupplements:2');
replace("guidedActivities[route=lesson-03 through lesson-11].worked teaching mirror","guidedActivities[route=lesson-01 through lesson-04].worked teaching mirror");
replace("let comparison=read(path.join(parent,'first-pair-v0.1.0/evaluation/index.html'));","let comparison=read(path.resolve('projects/biology30-chapter-15/meta/teaching-overhaul/2026-10-08-teacher-led/first-pair-v0.1.0/evaluation/index.html'));");
replace("out('.course-page[id^=\"lesson-\"]').toArray().map","out('.course-page[id^=\"lesson-\"]').toArray().filter(e=>routes.includes(e.attribs.id)).map");
replace("replaceAll('57623','57643').replaceAll('57621','57641')","replaceAll('57623','57653').replaceAll('57621','57651')");
replace("replaceAll('lessons 1–2','complete chapter').replace('Lessons 1–2:','Lessons 1–12:').replace('One exact teacher-source image added.','Four exact source supplements added.')","replaceAll('Chapter 15','Chapter 16').replaceAll('lessons 1–2','lessons 1–4').replace('Lessons 1–2:','Lessons 1–4:').replace('One exact teacher-source image added.','Two exact source supplements added. Later lessons retain their existing teaching.')");
replace('length,12);','length,4);');
replace('blocks:38,cumulativeBlocks:46','blocks:16,cumulativeBlocks:16');
replace("from 'cheerio'",`from ${JSON.stringify(import.meta.resolve('cheerio'))}`);
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
