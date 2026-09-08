import {captureTopicEnvironment} from './pilot2-browser-environment.js';
import {startTopicCourse} from './pilot2-startup.js';
import {buildTopicActivityIndex} from './pilot2-activity-index.js';
import {emptyTopicState,validateTopicState} from './pilot2-state.js';
import type {ActivityInputs} from './pilot2-activity-index.js';
import type {RenderTopicModel} from './pilot2-render-model.js';
import type {GraphWork} from './pilot2-graph-work.js';
import type {Biology30SuspendDataSchema} from './suspend-data.js';

export type TopicBrowserPayload={schemaVersion:1;activities:ActivityInputs;models:RenderTopicModel[];graphs:GraphWork[];legacySchema?:Biology30SuspendDataSchema};
export function bootTopicBrowser(document:Document,host:Window) {
 const root=document.getElementById('pilot2-course-surface'),panel=document.getElementById('pilot2-recovery');
 if(!root||!panel)throw new Error('Missing owning course surfaces');
 let environment:ReturnType<typeof captureTopicEnvironment>|undefined,course:ReturnType<typeof startTopicCourse>|undefined;
 const stop=()=>{course?.dispose();environment?.close();};
 const pageHide=(event:PageTransitionEvent)=>{if(!event.persisted)stop();};
 try{
  const payload:TopicBrowserPayload=JSON.parse(document.getElementById('pilot2-course-data')?.textContent??'');
  if(payload.schemaVersion!==1||!Array.isArray(payload.models)||!Array.isArray(payload.graphs))throw new Error('Invalid course startup data');
  validateTopicState(emptyTopicState(payload.activities.state),payload.activities.state);buildTopicActivityIndex(payload.activities);
  if(payload.activities.contract.unit!==payload.activities.state.unit)throw new Error('Mismatched unit startup data');
  environment=captureTopicEnvironment(host,payload.activities.state.unit);
  course=startTopicCourse(root,panel,environment.sources,payload.activities,payload.models,payload.graphs,environment.local,environment.lms,payload.legacySchema);
  host.addEventListener('pagehide',pageHide);
  return{course,dispose(){host.removeEventListener('pagehide',pageHide);stop();}};
 }catch{
  try{stop();}catch{}
  root.hidden=true;panel.hidden=false;panel.replaceChildren();
  const heading=document.createElement('h1');heading.textContent='Saved work could not be opened';
  const message=document.createElement('p');message.textContent='The course could not read its saved work or startup data safely. No empty replacement has been saved. Reopen this page to try again.';
  const retry=document.createElement('button');retry.type='button';retry.textContent='Reopen this page';retry.addEventListener('click',()=>host.location.reload());
  panel.append(heading,message,retry);return null;
 }
}

if(typeof document!=='undefined'&&typeof window!=='undefined')bootTopicBrowser(document,window);
