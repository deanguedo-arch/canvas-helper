import {createHash} from 'node:crypto';
import {readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {build,version as esbuildVersion} from 'esbuild';
import type {TopicInputFile} from './pilot2-inputs.js';
const hash=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
export const TOPIC_OWNER_CLOSURE_PATH='projects/resources/biology30-production/v1/pilot2/owner-closure.json';
export type TopicOwnerClosure={schemaVersion:1;profileId:'pilot2-topic-sequence-v1';status:'author-reviewed';teacherDecision:null;compiler:{name:'esbuild';version:string};files:TopicInputFile[]};
/** Discover the actual owner import graph without invoking the builder or
 * writing learner files. Package dependencies remain pinned by the lockfile. */
export async function inspectTopicOwnerCode(repoRoot:string) {
 const root=await realpath(repoRoot),captured=new Map<string,string>();
 const result=await build({absWorkingDir:root,entryPoints:['scripts/build-biology30-course.ts','scripts/lib/biology30-course/v1/pilot2-browser-entry.ts','scripts/lib/biology30-course/v1/pilot2-owner-closure.ts'],outdir:'owner-closure-memory-only',bundle:true,packages:'external',write:false,metafile:true,platform:'node',format:'esm',target:'node22',logLevel:'silent',plugins:[{name:'capture-topic-owner-code',setup(api){api.onLoad({filter:/\.[cm]?[jt]s$/},async args=>{
  const file=path.relative(root,args.path).split(path.sep).join('/');if(!(file.startsWith('scripts/')||file.startsWith('app/shared/'))||await realpath(args.path)!==args.path)throw new Error(`Owner dependency escaped the scripts/shared boundary: ${file}`);
  const contents=await readFile(args.path),sha256=hash(contents);if(captured.has(file)&&captured.get(file)!==sha256)throw new Error(`Owner changed during closure capture: ${file}`);captured.set(file,sha256);return{contents,loader:file.endsWith('.ts')?'ts':'js',resolveDir:path.dirname(args.path)};
 });}}]});
 const inputs=Object.keys(result.metafile.inputs).sort();if(JSON.stringify(inputs)!==JSON.stringify([...captured.keys()].sort()))throw new Error('Owner code closure is incomplete');
 // Python is invoked by the production preflight, so it is an explicit runtime
 // dependency beyond the JavaScript import graph.
 for(const file of ['package.json','package-lock.json','scripts/prepare-biology30-course-resources.py','projects/biology30-unit-a-pilot/meta/bcd-rebuild-intake-manifest.json','projects/biology30-unit-a-pilot/meta/bcd-rebuild-handoff-checkpoint.json','projects/resources/biology30-unit-a-pilot/v2/assets/brand/nxt-ce-logo-white-with-ce.png']){
  const absolute=path.join(root,file);if(await realpath(absolute)!==absolute)throw new Error(`Owner dependency resolves through a symlink: ${file}`);
  captured.set(file,hash(await readFile(absolute)));
 }
 const files=[...captured].sort(([a],[b])=>a.localeCompare(b)).map(([file,sha256])=>({file,sha256}));return{files,compiler:{name:'esbuild' as const,version:esbuildVersion},writesPerformed:false as const};
}
export async function verifyTopicOwnerClosure(repoRoot:string,expectedSha256:string) {
 const root=await realpath(repoRoot),file=path.join(root,TOPIC_OWNER_CLOSURE_PATH);if(await realpath(file)!==file)throw new Error('Owner closure resolves through a symlink');const bytes=await readFile(file);
 if(hash(bytes)!==expectedSha256)throw new Error('Frozen owner-closure manifest changed');const manifest=JSON.parse(bytes.toString('utf8')) as TopicOwnerClosure;
 if(manifest.schemaVersion!==1||manifest.profileId!=='pilot2-topic-sequence-v1'||manifest.status!=='author-reviewed'||manifest.teacherDecision!==null)throw new Error('Owner closure is not reviewed for blocked generation');
 const actual=await inspectTopicOwnerCode(root);if(JSON.stringify(actual.compiler)!==JSON.stringify(manifest.compiler)||JSON.stringify(actual.files)!==JSON.stringify(manifest.files))throw new Error('Frozen transitive owner code or compiler dependencies changed');return actual;
}
