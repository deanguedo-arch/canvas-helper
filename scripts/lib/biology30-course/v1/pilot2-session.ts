import {mountSourceVideos} from './pilot2-source-videos.js';
import {mountTopicVocabularyPanel} from './pilot2-vocabulary-panel.js';
import {mountTopicPresentation} from './pilot2-presentation-runtime.js';
import {mountTopicMedia} from './pilot2-media-controls.js';
import {persistTopicState,validateTopicState,encodeTopicState,decodeTopicState,migrateTopicWordFrayers,type TopicState,type KeyValueStorage,type TopicLms} from './pilot2-state.js';
import {completedTopicRoutes,buildTopicActivityIndex,collectTopicWork,type ActivityInputs,type WorkEntry} from './pilot2-activity-index.js';
import {mountTopicControls} from './pilot2-controls-runtime.js';
import {mountTopicModelControls} from './pilot2-model-controls.js';
import {mountTopicFrayerControls} from './pilot2-frayer-controls.js';
import {mountTopicGraphControls,currentUnsavedGraphWork} from './pilot2-graph-controls.js';
import {mountTopicCollection} from './pilot2-collection-view.js';
import {mountTopicFigureViewer} from './pilot2-figure-viewer.js';
import {mountTopicReturnLinks} from './pilot2-return-links.js';
import {mountTopicGlossary} from './pilot2-render-reference.js';
import type {RenderTopicModel} from './pilot2-render-model.js';
import type {GraphWork} from './pilot2-graph-work.js';
import type {Biology30SuspendDataSchema} from './suspend-data.js';
import {readTopicRecoveryArchive} from './pilot2-restore.js';
import {describeLegacyWork} from './pilot2-legacy-work.js';

export function topicSaveMessage(result:ReturnType<typeof persistTopicState>) {
 if(!result.accepted)return 'Not saved: some current work is too large or cannot be read safely. Keep it visible or use Copy all before leaving.';
 const local=result.local==='saved'?'Saved on this device.':result.local==='unavailable'?'Device saving is unavailable.':'Device saving failed; current writing remains visible.';
 const lms=result.commit==='confirmed'?' LMS save confirmed.':result.setValue==='accepted'?' LMS accepted the data but did not confirm saving.':result.setValue==='failed'?' LMS did not accept this save.':' LMS saving is unavailable in this session.';
 return local+lms;
}
/** Mount only after startup has resolved current/previous/legacy source conflicts.
 * The owning shell supplies routes; this controller owns Biology answers only. */
export function mountTopicSession(root:HTMLElement,input:ActivityInputs,state:TopicState,models:RenderTopicModel[],graphs:GraphWork[],local:KeyValueStorage|null,lms:TopicLms|null,legacySchema?:Biology30SuspendDataSchema) {
 validateTopicState(state,input.state);if(input.state.wordFrayers)Object.assign(state,migrateTopicWordFrayers(state,input.state));const index=buildTopicActivityIndex(input),cleanup:(()=>void)[]=[];let latestSaveConfirmed=true;
 const progress=()=>{try{const completed=completedTopicRoutes(input,state,graphs);root.querySelectorAll<HTMLElement>('[data-pilot2-progress-percent]').forEach(node=>{node.textContent=`${Math.round(100*completed.length/input.contract.requiredRoutes.length)}%`;});root.querySelectorAll<HTMLElement>('[data-pilot2-progress-count]').forEach(node=>{node.textContent=`${completed.length} / ${input.contract.requiredRoutes.length} required routes`;});root.querySelectorAll<HTMLElement>('[data-pilot2-progress-fill]').forEach(node=>{node.style.width=`${Math.round(100*completed.length/input.contract.requiredRoutes.length)}%`;});root.querySelectorAll<HTMLElement>('[data-pilot2-required-progress]').forEach(node=>{node.textContent=`${completed.length} of ${input.contract.requiredRoutes.length} required activities complete.`;});root.querySelectorAll<HTMLElement>('[data-pilot2-route-status]').forEach(node=>{node.textContent=completed.includes(node.dataset.pilot2RouteStatus!)?'Complete':'In progress';});}catch{root.querySelectorAll<HTMLElement>('[data-pilot2-required-progress]').forEach(node=>{node.textContent='Progress cannot be updated until the current oversized or invalid draft is revised. Your writing remains available.';});}};
 const controls=mountTopicControls(root,state,input.state,current=>{const result=persistTopicState(current,input.state,local,lms);latestSaveConfirmed=result.local==='saved'||result.commit==='confirmed';return{saved:latestSaveConfirmed,message:topicSaveMessage(result)};},graphs);cleanup.push(controls.dispose);
 cleanup.push(mountTopicGraphControls(root,state,input.state,graphs,controls).dispose,mountTopicModelControls(root,state,input.state,models,controls).dispose,mountTopicFrayerControls(root,state,input.state,controls).dispose);
 const archiveWork=():WorkEntry[]=>{
  if(!local)return[];return readTopicRecoveryArchive(local,input.state).map((entry,position)=>{
   let fields:WorkEntry['fields'];try{fields=collectTopicWork(index,decodeTopicState(entry.raw,input.state),input.state,graphs,legacySchema).flatMap(work=>work.fields.map(field=>({label:`${work.title}: ${field.label}`,text:field.text})));}catch{fields=legacySchema?describeLegacyWork(entry.raw,legacySchema):[{label:'Original saved work',text:entry.raw}];}
   return{id:`recovery-archive-${position}`,title:`Preserved save: ${entry.label}`,category:'Preserved recovery versions',routeId:null,focusId:null,fields};
  }).filter(entry=>entry.fields.some(field=>field.text.trim().length>0));
 };
 const wordWork=():WorkEntry[]=>{if(!state.wordFrayers)return[];const data=JSON.parse(root.querySelector('#biology-word-data')?.textContent??'{}');return state.wordFrayers.filter(s=>s.answers.some(a=>a.length)).map(s=>({id:'word-frayer-'+s.id,title:s.kind==='word'?(data.words?.find((w:{id:string})=>w.id===s.id)?.term??s.id):'Preserved earlier Frayer: '+(data.categories?.find((c:{id:string})=>c.id===s.id)?.label??s.id),category:s.collected?'Collected vocabulary':'Vocabulary drafts',routeId:input.state.unit.toLowerCase()+'-core-vocabulary',focusId:s.kind==='word'?'word-frayer-'+s.id:null,fields:s.answers.map((text,i)=>({label:['Definition','Characteristics','Example','Non-example'][i],text}))}));};
 cleanup.push(mountTopicCollection(root,index,state,input.state,graphs,legacySchema,()=>[...currentUnsavedGraphWork(root,graphs,index),...archiveWork(),...wordWork()]).dispose);
 cleanup.push(mountSourceVideos(root).dispose,mountTopicMedia(root).dispose,mountTopicFigureViewer(root).dispose,mountTopicReturnLinks(root,input.state.routes).dispose);
 if(root.querySelector('[data-pilot2-glossary-search]'))cleanup.push(mountTopicGlossary(root).dispose);
 const routeChanged=()=>{let hash:string;try{hash=decodeURIComponent(location.hash.slice(1));}catch{return;}const route=hash==='overview'?`${input.state.unit.toLowerCase()}-overview`:hash;if(!input.state.routes.includes(route))return;state.route=route;if(!state.visited.includes(route))state.visited.push(route);controls.saveDraft();};
 root.addEventListener('pilot2-state-change',progress);root.addEventListener('pilot2-draft-change',progress);window.addEventListener('hashchange',routeChanged);cleanup.push(mountTopicPresentation(root,state,input.state,controls).dispose);routeChanged();progress();
 cleanup.push(mountTopicVocabularyPanel(root,input,state,controls).dispose);
 const unsaved=()=>{try{return !latestSaveConfirmed||currentUnsavedGraphWork(root,graphs,index).length>0||!persistable();}catch{return true;}};
 const persistable=()=>{try{encodeTopicState(state,input.state);return true;}catch{return false;}};
 const beforeUnload=(event:BeforeUnloadEvent)=>{if(unsaved()){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',beforeUnload);
 return{state,controls,dispose(){cleanup.reverse().forEach(dispose=>dispose());root.removeEventListener('pilot2-state-change',progress);root.removeEventListener('pilot2-draft-change',progress);window.removeEventListener('hashchange',routeChanged);window.removeEventListener('beforeunload',beforeUnload);}};
}
