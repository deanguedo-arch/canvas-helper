import {inspectTopicRestore,activateTopicRestore,type TopicRestoreSource,type TopicRestoreInspection} from './pilot2-restore.js';
import {renderTopicRecovery,mountTopicRecovery} from './pilot2-recovery-view.js';
import {mountTopicSession} from './pilot2-session.js';
import {emptyTopicState,type TopicState} from './pilot2-state.js';
/** The owner supplies captured local/LMS/legacy sources and save adapters. This
 * module neither discovers nor initializes a live LMS session. */
type SessionArgs=Parameters<typeof mountTopicSession>;
export function startTopicCourse(root:HTMLElement,recoveryRoot:HTMLElement,sources:TopicRestoreSource[],input:SessionArgs[1],models:SessionArgs[3],graphs:SessionArgs[4],local:SessionArgs[5],lms:SessionArgs[6],legacySchema?:SessionArgs[7]) {
 if(root===recoveryRoot||root.contains(recoveryRoot))throw new Error("Recovery controls must remain outside the suspended course surface");
 let session:ReturnType<typeof mountTopicSession>|undefined,recovery:ReturnType<typeof mountTopicRecovery>|undefined;
 const begin=(state:TopicState)=>{recovery?.dispose();recoveryRoot.hidden=true;root.hidden=false;session=mountTopicSession(root,input,state,models,graphs,local,lms,legacySchema);const route=state.route.endsWith('-overview')?'overview':state.route;let current='';try{current=decodeURIComponent(location.hash.slice(1));}catch{}if(!input.state.routes.includes(current)&&current!=='overview')location.hash=route;};
 const recover=(inspection:TopicRestoreInspection)=>{root.hidden=true;recoveryRoot.hidden=false;recoveryRoot.innerHTML=renderTopicRecovery(inspection);recovery=mountTopicRecovery(recoveryRoot,inspection,input.state,local,begin);};
 const inspection=inspectTopicRestore(sources,input.state);
 if(inspection.requiresChoice)recover(inspection);
 else if(!inspection.sources.length)begin(emptyTopicState(input.state));
 else {
  const candidate=inspection.candidates.find(candidate=>candidate.id===inspection.automaticId);
  if(!candidate)throw new Error('Restore inspection has no continuation state');
  const needsArchive=inspection.sources.some(source=>!candidate.sources.includes(source.id));
  let state:TopicState|null=candidate.state;
  if(needsArchive){
   if(!local)state=null;
   else try{state=activateTopicRestore(inspection,candidate.id,input.state,local,false).state;}catch{state=null;}
  }
  if(state)begin(state);else recover({...inspection,requiresChoice:true,automaticId:null});
 }
 return{getSession:()=>session,dispose(){recovery?.dispose();session?.dispose();}};
}
