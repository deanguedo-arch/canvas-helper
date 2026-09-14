import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {promisify} from 'node:util';
import {hashTopicBuildTree} from './pilot2-build-transaction.js';
import {readBiology30TopicContract,type TopicUnit} from './pilot2-contract.js';
import {TOPIC_OWNER_CLOSURE_PATH,verifyTopicOwnerClosure} from './pilot2-owner-closure.js';
import type {TopicInputFile} from './pilot2-inputs.js';

const execute=promisify(execFile);
const digest=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
export const TOPIC_INTAKE_MANIFEST='projects/biology30-unit-a-pilot/meta/bcd-rebuild-intake-manifest.json';
// Successor records authorized A inline vocabulary; historical baselines remain immutable.
export const TOPIC_BASELINE='projects/resources/biology30-production/v1/pilot2/baselines/2026-09-09-word-vocabulary-delivery/baseline.json';
const protectedPaths=['projects/biology30-unit-a-pilot/workspace','projects/biology30-unit-a-pilot-2/workspace','projects/biology30-unit-a/workspace','scripts/lib/biology30-unit-a-pilot-2'];

/** Verify the actual input bytes against all three frozen contracts. Shared
 * files outside the resource boundary are pinned by the owner manifest. */
export function assertTopicInputClosure(unit:TopicUnit,files:TopicInputFile[],frozen:Record<string,string>,ownerFiles:TopicInputFile[]) {
 const contract=`projects/resources/biology30-production/v1/units/unit-${unit.toLowerCase()}/pilot2-contract.json`;
 for(const input of files){
  if(input.file===contract)continue; // Its design and evidence are verified by the contract reader.
  const expected=input.file.startsWith('projects/resources/biology30-production/v1/')?frozen[input.file]:ownerFiles.find(file=>file.file===input.file)?.sha256;
  if(expected!==input.sha256)throw new Error(`Course input missing or changed in the frozen closure: ${input.file}`);
 }
}

export async function verifyTopicProtectedBaseline(repoRoot:string,expectedSha256:string) {
 const root=await realpath(repoRoot),absolute=path.join(root,TOPIC_BASELINE);
 if(await realpath(absolute)!==absolute)throw new Error('Protected baseline resolves through a symlink');
 const bytes=await readFile(absolute);if(digest(bytes)!==expectedSha256)throw new Error('Frozen protected baseline changed');
 const baseline=JSON.parse(bytes.toString('utf8')) as {git:{branch:string;commit:string};trees:{path:string;sha256:string}[]};
 const branch=(await execute('git',['branch','--show-current'],{cwd:root})).stdout.trim(),commit=(await execute('git',['rev-parse','HEAD'],{cwd:root})).stdout.trim();
 if(branch!==baseline.git.branch||commit!==baseline.git.commit)throw new Error('Authorized Biology branch or HEAD changed');
 for(const protectedPath of protectedPaths){
  const records=baseline.trees.filter(tree=>tree.path===protectedPath);
  if(records.length!==1||(await hashTopicBuildTree(path.join(root,protectedPath))).sha256!==records[0].sha256)throw new Error(`Protected Unit A tree changed: ${protectedPath}`);
 }
 return {branch,commit,protectedTrees:protectedPaths.length,writesPerformed:false as const};
}

export async function preflightTopicBuild(repoRoot:string,unit:TopicUnit) {
 const contracts=await Promise.all((['B','C','D'] as const).map(code=>readBiology30TopicContract(repoRoot,code,true)));
 const target=contracts.find(item=>item.contract.unit===unit)!;
 const hashes=contracts.map(item=>item.contract.freezeEvidence!.inputs[TOPIC_OWNER_CLOSURE_PATH]);
 if(!hashes[0]||hashes.some(hash=>hash!==hashes[0]))throw new Error('All units must pin the same reviewed owner closure');
 const owner=await verifyTopicOwnerClosure(repoRoot,hashes[0]);
 const baselineHashes=contracts.map(item=>item.contract.freezeEvidence!.inputs[TOPIC_BASELINE]);
 if(!baselineHashes[0]||baselineHashes.some(hash=>hash!==baselineHashes[0]))throw new Error('All units must pin the same protected baseline');
 const protectedBaseline=await verifyTopicProtectedBaseline(repoRoot,baselineHashes[0]);
 const manifestPath=path.join(repoRoot,TOPIC_INTAKE_MANIFEST);
 if(await realpath(manifestPath)!==path.resolve(manifestPath))throw new Error('Intake manifest resolves through a symlink');
 const manifestHash=digest(await readFile(manifestPath));
 if(contracts.some(item=>item.contract.sourceManifestSha256!==manifestHash))throw new Error('All-unit source manifest drift');
 const cold=await execute('python3',['scripts/prepare-biology30-course-resources.py','--verify-build-inputs'],{cwd:repoRoot,maxBuffer:1024*1024});
 const sources=JSON.parse(cold.stdout);
 if(sources.writesPerformed!==false||sources.teacherAcceptance!==null||!sources.sourceChecks||!sources.textbookMemberChecks)throw new Error('Cold source verification did not return its read-only proof');
 return {target,contracts,owner,protectedBaseline,sources};
}
