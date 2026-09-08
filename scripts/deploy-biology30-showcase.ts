import {readFile,writeFile,mkdir,readdir,lstat,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
export const UNITS={a:'biology30-unit-a-pilot-2',b:'biology30-unit-b',c:'biology30-unit-c',d:'biology30-unit-d'} as const;
const hash=(data:Uint8Array)=>createHash('sha256').update(data).digest('hex');
export async function buildShowcase(repo:string,stage:string){
 const publicRoot=path.join(stage,'public'),files:Record<string,string>={},entries:Record<string,string>={};await mkdir(publicRoot,{recursive:true});
 async function copy(source:string,relative:string){const stat=await lstat(source);if(stat.isSymbolicLink())throw Error(`Refusing symlink: ${source}`);if(stat.isDirectory()){for(const name of (await readdir(source)).sort()){if(name.startsWith('.'))continue;await copy(path.join(source,name),relative+'/'+name);}return;}if(!stat.isFile())throw Error(`Not a regular file: ${source}`);const data=await readFile(source);await mkdir(path.dirname(path.join(publicRoot,relative)),{recursive:true});await writeFile(path.join(publicRoot,relative),data);files[relative]=hash(data);}
 for(const [unit,slug]of Object.entries(UNITS)){
  const workspace=path.join(repo,'projects',slug,'workspace');
  await copy(path.join(workspace,'index.html'),`units/${unit}/index.html`);
  await copy(path.join(workspace,'assets'),`units/${unit}/assets`);
  entries[unit]=files[`units/${unit}/index.html`];
 }
 for(const name of ['index.html','showcase.css','showcase.js'])await copy(path.join(repo,'scripts/templates/biology30-showcase',name),name);
 // Detect source changes during copying instead of deploying a mixed snapshot.
 for(const [relative,expected]of Object.entries(files)){const match=/^units\/([abcd])\/(.*)$/.exec(relative);if(match){const source=path.join(repo,'projects',UNITS[match[1] as keyof typeof UNITS],'workspace',match[2]);if(hash(await readFile(source))!==expected)throw Error(`Source changed during staging: ${source}`);}}
 const release={schemaVersion:1,createdAt:new Date().toISOString(),purpose:'teacher-review-only',entries,files};await writeFile(path.join(publicRoot,'release.json'),JSON.stringify(release,null,2)+'\n');
 await writeFile(path.join(stage,'firebase.json'),JSON.stringify({hosting:{site:'biology30pilot',public:'public',ignore:['firebase.json','**/.*'],headers:[{source:'**',headers:[{key:'Cache-Control',value:'no-cache, max-age=0, must-revalidate'}]}]}},null,2)+'\n');
 return {publicRoot,release};
}
async function run(command:string,args:string[],cwd:string){await new Promise<void>((resolve,reject)=>{const child=spawn(command,args,{cwd,stdio:'inherit'});child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error(`${command} exited ${code}`)));});}
export async function verifyLive(release:{files:Record<string,string>},base='https://biology30pilot.web.app'){
 const rows=Object.entries(release.files);let next=0;
 await Promise.all(Array.from({length:4},async()=>{while(next<rows.length){const [name,expected]=rows[next++];let good=false;for(let attempt=0;attempt<3;attempt++){const response=await fetch(`${base}/${name}?review=${expected.slice(0,12)}`,{signal:AbortSignal.timeout(60000)});if(response.ok&&hash(new Uint8Array(await response.arrayBuffer()))===expected){good=true;break;}}if(!good)throw Error(`Live bytes do not match: ${name}`);}}));return {fileCount:rows.length,allFilesMatch:true};
}
async function main(){
 const args=process.argv.slice(2);if(args.includes('--help')){console.log('npx tsx scripts/deploy-biology30-showcase.ts [--deploy]\nWithout --deploy: stage the current A Pilot2/B/C/D workspaces for local review.\nWith --deploy: verify workspaces, stage, deploy only biology30pilot, and verify every hosted file. Rebuild changed units through their owner first.');return;}
 if(args.some(arg=>arg!=='--deploy'))throw Error('Unknown argument; use --help');
 const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 for(const slug of Object.values(UNITS))await run('npm',['run','verify','--','--project',slug,'--mode','workspace'],repo);
 const stage=await mkdtemp(path.join(os.tmpdir(),'biology30-showcase-'));const {release,publicRoot}=await buildShowcase(repo,stage);console.log(`Review files: ${publicRoot}`);
 if(!args.includes('--deploy'))return;
 await run(process.execPath,[path.join(repo,'node_modules/firebase-tools/lib/bin/firebase.js'),'deploy','--project','calm-module-one','--config',path.join(stage,'firebase.json'),'--only','hosting','--non-interactive'],stage);
 const verification=await verifyLive(release);
 const receipt={...release,hosting:{projectId:'calm-module-one',siteId:'biology30pilot',url:'https://biology30pilot.web.app'},deployedAt:new Date().toISOString(),verification,learnerRelease:false,unitProjects:UNITS};
 await writeFile(path.join(repo,'docs/ops/biology30-showcase-deployment.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({url:receipt.hosting.url,verification},null,2));await rm(stage,{recursive:true,force:true});
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error);process.exitCode=1;});
