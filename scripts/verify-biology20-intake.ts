import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MODULES,ROOT,sha,sourceTree} from './lib/biology20-course/intake.js';
import {validateProjectManifestPolicy} from './lib/project-manifest-policy.js';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.join(repo,ROOT);
async function main(){
 const manifest=JSON.parse(await readFile(path.join(root,'resource-manifest.json'),'utf8'));
 if(sha(await readFile(path.join(root,manifest.bundle.path)))!==manifest.bundle.sha256)throw Error('Original bundle changed');
 const reference=JSON.parse(await readFile(path.join(root,'reference/biology30-workspaces.json'),'utf8'));
 for(const slug of Object.keys(reference))if(JSON.stringify(await sourceTree(path.join(repo,'projects',slug,'workspace')))!==JSON.stringify(reference[slug]))throw Error(`Protected Biology 30 workspace changed: ${slug}`);
 const assets=await readdir(path.join(root,'assets'));for(const asset of assets)if(sha(await readFile(path.join(root,'assets',asset)))!==asset.split('.')[0])throw Error(`Derived source asset hash mismatch: ${asset}`);
 for(const module of MODULES){const project=JSON.parse(await readFile(path.join(repo,`projects/biology20-unit-${module.id}/meta/project.json`),'utf8'));const check=validateProjectManifestPolicy(project);if(check.errors.length)throw Error(check.errors.join('\n'));if(project.authoringStatus!=='blocked'||project.authoring.studioEditing.enabled!==false||project.exportTargets.some((e:{enabled:boolean})=>e.enabled))throw Error('Intake cannot authorize editing or release');}
 const map=JSON.parse(await readFile(path.join(root,'topic-map.json'),'utf8'));if(map.sourceManifestSha256!==sha(await readFile(path.join(root,'resource-manifest.json'))))throw Error('Topic map source manifest drift');
 const curriculum=JSON.parse(await readFile(path.join(root,'authority/outcome-register.json'),'utf8'));if(curriculum.sourceSha256!==sha(await readFile(path.join(root,'authority/program.pdf'))))throw Error('Official curriculum changed');
 const candidates=[];for(const module of MODULES)try{await readFile(path.join(repo,`projects/biology20-unit-${module.id}/workspace/index.html`));candidates.push(module.id);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
 console.log(JSON.stringify({status:'intake-verification-passed',modules:MODULES.length,slides:manifest.slideCount,sourceAssets:assets.length,sourceMappedTopics:map.modules.reduce((n:number,m:{topics:unknown[]})=>n+m.topics.length,0),officialOutcomeIds:curriculum.outcomes.length,protectedBiology30Workspaces:Object.keys(reference).length,learnerCandidates:candidates.length,candidateModules:candidates,academicCoverage:'see individual module review; not curriculum certification'},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
