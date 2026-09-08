import {createHash} from 'node:crypto';
import {readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {build,version as esbuildVersion} from 'esbuild';
import type {TopicInputFile} from './pilot2-inputs.js';

const owner='scripts/lib/biology30-course/v1/';
const sha256=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
/** Compile the actual browser entry in memory. The closure records the exact
 * bytes delivered to esbuild's loader; no learner directory is written. */
export async function bundleTopicBrowser(repoRoot:string) {
 const root=await realpath(repoRoot),captured=new Map<string,string>();
 const result=await build({absWorkingDir:root,entryPoints:[`${owner}pilot2-browser-entry.ts`],bundle:true,write:false,metafile:true,platform:'browser',format:'iife',target:['es2022'],charset:'utf8',legalComments:'none',logLevel:'silent',
  plugins:[{name:'capture-biology-browser-closure',setup(api){api.onLoad({filter:/\.[cm]?[jt]s$/},async args=>{
   const absolute=path.resolve(args.path),relative=path.relative(root,absolute).split(path.sep).join('/');
   // The one shared A-D view is explicitly allowed and remains hash-pinned.
   if((!relative.startsWith(owner)&&relative!=='scripts/lib/biology30-vocabulary/panel.ts')||await realpath(absolute)!==absolute)throw new Error(`Browser dependency escaped its owner: ${relative}`);
   const contents=await readFile(absolute),hash=sha256(contents);
   if(captured.has(relative)&&captured.get(relative)!==hash)throw new Error(`Browser dependency changed during compilation: ${relative}`);
   captured.set(relative,hash);return{contents,loader:relative.endsWith('.ts')?'ts':'js',resolveDir:path.dirname(absolute)};
  });}}]});
 if(result.outputFiles.length!==1||Object.values(result.metafile.outputs).some(output=>output.imports.length))throw new Error('Browser compilation left unresolved assets or imports');
 const inputs=Object.keys(result.metafile.inputs).sort(),files:TopicInputFile[]=[...captured].sort(([a],[b])=>a.localeCompare(b)).map(([file,sha256])=>({file,sha256}));
 if(JSON.stringify(inputs)!==JSON.stringify(files.map(file=>file.file).sort()))throw new Error('Browser dependency capture is incomplete');
 // The compiler and dependency resolution are part of reproducibility too.
 for(const file of ['package.json','package-lock.json'])files.push({file,sha256:sha256(await readFile(path.join(root,file)))});
 const bytes=result.outputFiles[0].contents;
 return {destination:'assets/pilot2-course.js',bytes,sha256:sha256(bytes),files,compiler:{name:'esbuild',version:esbuildVersion,target:'es2022',format:'iife'},writesPerformed:false as const};
}
