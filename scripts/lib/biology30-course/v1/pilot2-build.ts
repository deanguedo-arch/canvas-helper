import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';
import {validateProjectManifestPolicy} from '../../project-manifest-policy.js';
import type {ProjectManifest} from '../../types.js';
import type {Biology30ProductionBuildRequest,Biology30ProductionBuildResult} from './build.js';
import {BIOLOGY30_TOPIC_PROFILE,type TopicUnit} from './pilot2-contract.js';
import {readFrozenTopicInputs} from './pilot2-inputs.js';
import {bundleTopicBrowser} from './pilot2-browser-bundle.js';
import {renderTopicCourse} from './pilot2-render-course.js';
import {hashTopicBuildTree,transactTopicBuild} from './pilot2-build-transaction.js';
import {assertTopicInputClosure,preflightTopicBuild} from './pilot2-preflight.js';

const digest=(bytes:Uint8Array|string)=>createHash('sha256').update(bytes).digest('hex');
function assertManifest(manifest:ProjectManifest){const check=validateProjectManifestPolicy(manifest);if(check.status!=='valid')throw new Error(`Invalid topic project manifest: ${check.errors.join('; ')}`);}
export function topicProjectE2EContract(project:string,input:Awaited<ReturnType<typeof readFrozenTopicInputs>>) {
 const topic=input.topic.contract.topics[0],frame=input.topic.framing.topics[0],unit=input.unit.toLowerCase();
 return {projectSlug:project,requiredTestIds:['studio-shell','course-studio-tab','workspace-project-select','project-root','workspace-preview-frame'],modes:{enabled:false},navigation:{enabled:false},quiz:{enabled:false,lessonTitle:topic.title},fallbackPanel:{enabled:false},learnerCourse:{enabled:true,
  routes:input.topic.state.routes.map(route=>route===`${unit}-overview`?'overview':route),hintRoutes:[],printRoutes:[],resourceChecks:[],
  evidenceScenario:{kind:'pilot2',route:topic.id,responseId:frame.evidenceSlip.responseId,collectionFlag:`${topic.id}-evidence-collected`,collectionRoute:`${unit}-all-my-work`},
  mobile:{width:390,height:844,routes:[...input.topic.contract.requiredRoutes,`${unit}-all-my-work`]}}};
}

/** The only production assembly entry for the topic profile. All three academic
 * contracts and the exact transitive owner closure must pass before rendering. */
export async function buildTopicProductionUnit(request:Biology30ProductionBuildRequest,unit:TopicUnit):Promise<Biology30ProductionBuildResult> {
 if(request.profile!==BIOLOGY30_TOPIC_PROFILE||!request.strict||!request.baselineWorkspaceSha256||request.project!==`biology30-unit-${unit.toLowerCase()}`)throw new Error('Topic production requires its exact strict project/profile/baseline');
 const root=await realpath(request.repoRoot),verified=await preflightTopicBuild(root,unit);
 const input=await readFrozenTopicInputs(root,unit),bundle=await bundleTopicBrowser(root);
 assertTopicInputClosure(unit,input.files,verified.target.contract.freezeEvidence!.inputs,verified.owner.files);
 for(const file of bundle.files)if(!verified.owner.files.some(owner=>owner.file===file.file&&owner.sha256===file.sha256))throw new Error(`Browser bundle differs from frozen owner: ${file.file}`);
 const rendered=renderTopicCourse(input,input.legacySchema),generatedAt=new Date().toISOString();
 const expected=new Map<string,string>([['index.html',digest(rendered.html)],[bundle.destination,bundle.sha256],...input.copies.map(copy=>[copy.destination,copy.sha256] as [string,string])]);
 if(expected.size!==input.copies.length+2)throw new Error('Production asset collision');
 const expectedMeta=new Map<string,string>();
 const writeJson=async(dir:string,name:string,value:unknown)=>{const text=JSON.stringify(value,null,2)+'\n';expectedMeta.set(name,digest(text));await writeFile(path.join(dir,name),text);};
 const recheck=async()=>{
  const latest=await preflightTopicBuild(root,unit);
  if(JSON.stringify(latest.contracts.map(item=>item.sha256))!==JSON.stringify(verified.contracts.map(item=>item.sha256)))throw new Error('All-unit contracts changed during build');
  const current=await readFrozenTopicInputs(root,unit);
  if(JSON.stringify(current.files)!==JSON.stringify(input.files))throw new Error('Inputs changed during build');
 };
 const transaction=await transactTopicBuild({repoRoot:root,project:request.project,expectedWorkspaceSha256:request.baselineWorkspaceSha256,
  async prepare(stage){
   await writeFile(path.join(stage.workspaceDir,'index.html'),rendered.html);
   await mkdir(path.dirname(path.join(stage.workspaceDir,bundle.destination)),{recursive:true});await writeFile(path.join(stage.workspaceDir,bundle.destination),bundle.bytes);
   for(const asset of input.copies){
    if(!/^assets\/[a-zA-Z0-9/_.-]+$/.test(asset.destination)||asset.destination.split('/').includes('..'))throw new Error('Unsafe staged asset destination');
    const source=path.join(root,asset.sourcePath);if(await realpath(source)!==source)throw new Error('Staged source resolves through a symlink');
    const bytes=await readFile(source);if(digest(bytes)!==asset.sha256)throw new Error(`Asset changed during staging: ${asset.sourcePath}`);
    const destination=path.join(stage.workspaceDir,asset.destination);await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,bytes);
   }
   const tree=await hashTopicBuildTree(stage.workspaceDir),current=JSON.parse(await readFile(path.join(stage.metaDir,'project.json'),'utf8')) as ProjectManifest;
   const canonicalSources=[...new Set([...input.files.map(file=>file.file),...verified.owner.files.map(file=>file.file),...Object.keys(verified.target.contract.freezeEvidence!.inputs)])];
   const manifest:ProjectManifest={...current,title:input.title,canonicalEntry:verified.target.file,canonicalSources,
    generatedOutputs:[`projects/${request.project}/workspace`,...['pilot2-build.json','pilot2-review.json','pilot2-activity-inventory.json','e2e-contract.json'].map(file=>`projects/${request.project}/meta/${file}`)],
    regenerateCommand:`npm run build:biology30-course -- --project ${request.project} --strict --profile ${BIOLOGY30_TOPIC_PROFILE} --baseline-workspace-sha ${tree.sha256}`,
    authoringStatus:'blocked',authoring:{driverId:'proposal-only-v1',familyId:'biology30-production',qualityProfile:BIOLOGY30_TOPIC_PROFILE,studioEditing:{enabled:false}},
    exportTargets:(current.exportTargets??[]).map(target=>({...target,enabled:false})),
    sourceOfTruthNotes:'The frozen Pilot 2 contracts, authored resource inputs and transitive Biology owner generate this local candidate. Unit A remains provisional. Teacher acceptance, Studio Edit, export and publication are not granted.'};
   assertManifest(manifest);
   await writeJson(stage.metaDir,'project.json',manifest);
   await writeJson(stage.metaDir,'pilot2-build.json',{schemaVersion:1,profileId:BIOLOGY30_TOPIC_PROFILE,unit,generatedAt,buildSha256:tree.sha256,previousWorkspaceSha256:request.baselineWorkspaceSha256,contractSha256:verified.target.sha256,allUnitContracts:verified.contracts.map(item=>({unit:item.contract.unit,sha256:item.sha256})),inputs:input.files,owner:verified.owner,assets:input.copies,browser:{sha256:bundle.sha256,compiler:bundle.compiler},sourceVerification:verified.sources,protectedBaseline:verified.protectedBaseline,teacherAcceptance:null,authoringStatus:'blocked'});
   await writeJson(stage.metaDir,'pilot2-activity-inventory.json',{routeIds:rendered.routeIds,requiredRoutes:input.topic.contract.requiredRoutes,activities:rendered.index});
   await writeJson(stage.metaDir,'pilot2-review.json',{buildSha256:tree.sha256,teacherAcceptance:null,unitAStatus:'provisional',status:'local-candidate-awaiting-rendered-review',checks:{academic:'pending',desktop:'pending',tablet:'pending',mobile:'pending',zoom200:'pending',offline:'pending',persistence:'pending',projectE2E:'pending',teacher:'pending'},priorReviewFiles:'Retained metadata describes earlier builds; compare its exact build SHA before using it as evidence.'});
   await writeJson(stage.metaDir,'e2e-contract.json',topicProjectE2EContract(request.project,input));
   await request.testHooks?.afterStageWrite?.(stage.workspaceDir,stage.metaDir);
  },
  async validate(stage){
   const tree=await hashTopicBuildTree(stage.workspaceDir);
   if(tree.files.length!==expected.size||tree.files.some(file=>expected.get(file.path)!==file.sha256))throw new Error('Staged workspace differs from compiled candidate');
   const $=load(await readFile(path.join(stage.workspaceDir,'index.html'),'utf8'));
   for(const node of $('[src],[href]').toArray()){
    const reference=$(node).attr('src')??$(node).attr('href')!;
    if(reference.startsWith('#')||/^(https:|mailto:|data:)/.test(reference))continue;
    const local=reference.split('#')[0];if(!expected.has(local))throw new Error(`Unresolved local course asset: ${reference}`);
   }
   for(const [file,sha256] of expectedMeta)if(digest(await readFile(path.join(stage.metaDir,file)))!==sha256)throw new Error(`Staged metadata changed: ${file}`);
   const manifest=JSON.parse(await readFile(path.join(stage.metaDir,'project.json'),'utf8')) as ProjectManifest;assertManifest(manifest);
   if(manifest.authoringStatus!=='blocked'||manifest.authoring?.studioEditing?.enabled!==false||manifest.exportTargets?.some(target=>target.enabled))throw new Error('Staged candidate crossed its blocked boundary');
   const receipt=JSON.parse(await readFile(path.join(stage.metaDir,'pilot2-build.json'),'utf8'));
   if(receipt.buildSha256!==tree.sha256||receipt.teacherAcceptance!==null)throw new Error('Staged build receipt is not bound to the exact candidate');
   await recheck();return{buildSha256:tree.sha256};
  },
  async beforePromote(target,index){await request.testHooks?.beforePromote?.(target,index);await recheck();}
 });
 return {projectDir:path.join(root,'projects',request.project),workspaceDir:path.join(root,'projects',request.project,'workspace'),unitCode:unit,buildSha256:transaction.workspaceSha256,contractSha256:verified.target.sha256,learnerRouteCount:rendered.routeIds.length,lessonCount:rendered.topicCount,practiceItemCount:input.topic.practice.length,generatedAt};
}
