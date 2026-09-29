/** Add the same explicit hash-route/course-state contract used by Chapters 12–13. */
import {readFile,writeFile} from 'node:fs/promises';
for(let chapter=14;chapter<=20;chapter++){
 const root=`projects/biology30-chapter-${chapter}/workspace`;
 const html=await readFile(`${root}/index.html`,'utf8');
 const match=html.match(/<script[^>]+id="course-data"[^>]*>([\s\S]*?)<\/script>/);
 if(!match)throw Error(`Chapter ${chapter}: course-data missing`);
 const C=JSON.parse(match[1]);
 if(C.chapter!==chapter||!Array.isArray(C.lessons)||!Array.isArray(C.checks))throw Error(`Chapter ${chapter}: invalid config`);
 const pageIds=['overview',...C.lessons.map((_,i)=>`lesson-${String(i+1).padStart(2,'0')}`),'extension','practice','fill-in-the-blanks','multiple-choice','mixed-practice','labeling-practice','core-vocabulary','textbook-practice','process-collection','textbook-library','video-library'];
 const requiredIds=C.checks.map(c=>c.id);
 if(pageIds.some(id=>!html.includes(`id="${id}"`))||requiredIds.some(id=>!html.includes(`data-check-id="${id}"`)))throw Error(`Chapter ${chapter}: contract target missing`);
 const contract={schemaVersion:1,adapter:'hash-pages-v1',pageIds,defaultPageId:'overview',state:{adapter:'course-state-v1'},completion:{storageKey:`biology30-chapter-${chapter}:required-completion:v1`,requiredIds}};
 await writeFile(`${root}/scorm-tracking.json`,JSON.stringify(contract,null,2)+'\n');
 const metaFile=`projects/biology30-chapter-${chapter}/meta/project.json`,meta=JSON.parse(await readFile(metaFile,'utf8')),rel=`projects/biology30-chapter-${chapter}/workspace/scorm-tracking.json`;
 if(!meta.canonicalSources.includes(rel))meta.canonicalSources.push(rel);
 await writeFile(metaFile,JSON.stringify(meta,null,2)+'\n');
 console.log(`Chapter ${chapter}: ${pageIds.length} pages, ${requiredIds.length} required checks`);
}
