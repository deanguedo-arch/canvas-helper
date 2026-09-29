/* Course-side orchestration only; all LMS calls remain in the shared bridge.
   This module deliberately refuses canonical writes without an exclusive Web Lock. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathSaveController=factory();})(globalThis,function(){
'use strict';
function create(opts){
 const {bridge,getSnapshot,setState,decode,validate,onStatus,onRecovery,onWritable}=opts;
 let managed=false,blocked=true,dirty=false,currentError=null,owns=false,initialized=false,baseline=null,pending=null,lastConfirmed=null,release=null,started=false,attemptedLock=false;
 let key=opts.key,lockName,branchSeq=0,revision=0,signalling=false,confirmedRevision=-1;const publications=new Map();const tab=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');const branches=[],savedBranches=new Map();
 const local=()=>opts.storage||localStorage;
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function status(text,error=false){onStatus(text,error);}
 function retainBytes(label,raw){if(raw===null||raw===undefined)return;const text=typeof raw==='string'?raw:JSON.stringify(raw);if(branches.some(b=>b.label===label&&b.raw===text))return;
  const b={label,raw:text,key:key+':recovery:'+tab+':'+(++branchSeq),durable:false};branches.push(b);
  try{local().setItem(b.key,text);b.durable=true;savedBranches.set(b.key,text);}catch{} }
 function preserveFailure(error){dirty=true;currentError=error instanceof Error?error:Error(String(error));
  // Signal the owner before showing UI; an old heartbeat cannot clear this latch.
  if(managed&&!signalling){signalling=true;try{bridge.failCourseSave(currentError);}finally{signalling=false;}}
  try{retainBytes('Open-tab draft',getSnapshot());}catch{}
  if(lastConfirmed!==null)retainBytes('Last confirmed save',lastConfirmed);
  status('Not saved: '+currentError.message+' Keep this tab open. Current work and any conflicting versions are available in Recovery.',true);
  onRecovery?.(branches,currentError.message);return false;
 }
 function conflict(raw,reason){retainBytes('Conflicting durable version',raw);try{retainBytes('Open-tab draft',getSnapshot());}catch{}blocked=true;onWritable?.(false);return preserveFailure(Error(reason));}
 function read(){return local().getItem(key);}
 function validBlob(){const data=getSnapshot();decode(data);return validate(data);}
 function localPreserve(){if(!owns||blocked)throw Error('This tab does not own the course writer, or a conflict needs resolution.');
  const text=validBlob();const prior=read();if(initialized&&prior!==baseline){conflict(prior,'Another writer changed or removed the saved record. Both versions require an explicit decision.');throw currentError;}
  if(prior!==text)local().setItem(key,text);baseline=text;initialized=true;return text;
 }
 function publish(text){if(!managed)return;
  if(!bridge.capabilities?.courseSaveReceiptV1)throw Error('The installed bridge has no current-publication receipt capability. Work is local only; integration is required.');
  const data=JSON.parse(text),completed=(opts.completedIds||(()=>[]))();const identity=JSON.stringify([data,completed]);
  const id=bridge.publishCourseState(data,completed);if(typeof id!=='string'||!id)throw Error('The bridge did not issue a publication identity.');
  pending={id,revision,snapshotIdentity:identity,raw:text};publications.set(id,pending);
 }
 function save(){dirty=true;if(!owns||blocked)return preserveFailure(Error('Saving is paused until this tab owns the writer and any conflict is resolved.'));
  try{const text=localPreserve();currentError=null;if(managed){publish(text);status('Current work preserved locally; Brightspace confirmation pending.');}
   else{lastConfirmed=text;dirty=false;status('Saved in this browser · not submitted');}return true;
  }catch(e){return preserveFailure(e);}
 }
 function edited(){revision++;return save();}
 function flush(){if(blocked||!owns)throw currentError||Error('This tab cannot publish work.');if(!save())throw currentError;}
 function accept(detail={}){
  if(signalling)return;
  if(detail.error){preserveFailure(Error(detail.message||'The LMS save failed.'));return;}
  if(detail.phase==='saved'&&publications.has(detail.coursePublicationId)){
   const p=publications.get(detail.coursePublicationId); // Receipt may acknowledge A while B is already dirty.
   if(p.revision>=confirmedRevision){lastConfirmed=p.raw;confirmedRevision=p.revision;}
   try{local().setItem(key+':last-confirmed',lastConfirmed);}catch(e){preserveFailure(e);return;}
   let identity;try{identity=JSON.stringify([getSnapshot(),(opts.completedIds||(()=>[]))()]);}catch(e){preserveFailure(e);return;}
   if(!blocked&&!currentError&&owns&&pending?.id===p.id&&revision===p.revision&&identity===p.snapshotIdentity){dirty=false;status('Saved to Brightspace · not submitted');return;}
  }
  // Bridge renders defaults before this listener. Restore truthful final state.
  if(currentError||blocked||!owns)status('Not saved: '+(currentError?.message||'This tab is read-only.')+' Keep current work open or use Recovery.',true);
  else if(dirty)status('Newer changes are pending; the latest work is not yet confirmed by Brightspace.',true);
  else status(managed?'Saved to Brightspace · not submitted':'Saved in this browser · not submitted');
 }
 async function acquire(){attemptedLock=true;
  if(!navigator.locks?.request){blocked=true;onWritable?.(false);preserveFailure(Error('Exclusive tab locking is unavailable in this context. This page is read-only; no canonical or LMS work will be replaced.'));return false;}
  return new Promise(resolve=>{
   navigator.locks.request(lockName,{mode:'exclusive',ifAvailable:true},async lock=>{
    if(!lock){blocked=true;onWritable?.(false);preserveFailure(Error('Another tab owns this course. Keep that tab open for its unsaved work; release it explicitly or close it before reopening here.'));resolve(false);return;}
    owns=true;blocked=false;resolve(true);await new Promise(r=>release=r);owns=false;
   }).catch(e=>{preserveFailure(e);resolve(false);});
  });
 }
 async function open(){
  const connection=bridge?.connectionState?.();managed=connection==='connected';
  if(['blocked','unavailable'].includes(connection)){preserveFailure(Error('The course connection cannot restore this attempt safely.'));return false;}
  if(managed)key=bridge.scopeKey(key);
  // Deliberately wider than one attempt: excludes two initially empty LMS tabs
  // whose bridge-generated attempt scopes have not yet been committed.
  lockName=managed?'math10c-writer:'+opts.key+':learner:'+bridge.learner():'math10c-writer:'+key;
  if(managed){signalling=true;try{bridge.failCourseSave(Error('Waiting for the course writer and validated restore.'));}finally{signalling=false;}bridge.registerCourse({flush});}
  let remote=null;
  try{
   if(managed){remote=bridge.readCourseState();lastConfirmed=remote===null?null:JSON.stringify(remote);}
   const localRaw=read();baseline=localRaw;initialized=true;
   if(localRaw!==null)decode(localRaw);if(remote!==null)decode(remote);
   if(!await acquire())return false;
   // Reread AFTER acquiring; null is an initialized baseline, not a wildcard.
   const now=read();if(now!==baseline){conflict(now,'The saved version changed while this tab was acquiring ownership.');return false;}
   if(managed&&remote!==null&&localRaw!==null&&!same(decode(localRaw),decode(remote))){setState(decode(localRaw));retainBytes('Brightspace version',remote);conflict(localRaw,'Browser and Brightspace versions differ. Preview both before choosing.');return false;}
   if(localRaw!==null)setState(decode(localRaw));else if(remote!==null)setState(decode(remote));
   if(managed&&remote===null&&localRaw!==null){retainBytes('Browser-only saved work',localRaw);conflict(null,'Brightspace has no confirmed work for this local version. Choose explicitly before publishing.');return false;}
   currentError=null;blocked=false;started=true;onWritable?.(true);status(managed?'Brightspace work restored; current changes need an exact save receipt.':'Browser-local review · not submitted');return true;
  }catch(e){if(remote!==null)retainBytes('Original Brightspace bytes',remote);try{retainBytes('Original local bytes',read());}catch{}blocked=true;onWritable?.(false);preserveFailure(e);return false;}
 }
 async function retry(){if(blocked||!owns){preserveFailure(currentError||Error('Resolve ownership or recovery first.'));return false;}if(!save())return false;if(managed){const ok=await bridge.saveAsync();if(!ok)preserveFailure(Error(bridge.lastError?.()||'The LMS did not confirm the retry.'));return ok;}return true;}
 async function releaseOwnership(){
  if(!owns)return false;
  // Latch publication BEFORE releasing. Heartbeats must not outlive ownership.
  if(dirty){try{retainBytes('Released-tab unsaved work',getSnapshot());}catch{}}
  blocked=true;currentError=Error('Writer released. This tab is read-only; its unsaved draft remains here.');if(managed)bridge.failCourseSave(currentError);onWritable?.(false);
  owns=false;release?.();release=null;status(currentError.message,true);return true;
 }
 async function requestOwnership(){
  if(owns)return true;
  if(managed){preserveFailure(Error('Reopen this activity from Brightspace after releasing the other tab to restore its current attempt. No automatic takeover is performed.'));return false;}
  if(!await acquire())return false;
  try{const now=read();if(now!==baseline){retainBytes('New durable version after transfer',now);return conflict(now,'Ownership acquired, but the durable version changed. Preview and choose; nothing has been overwritten.');}blocked=false;currentError=null;onWritable?.(true);return true;}catch(e){return preserveFailure(e);}
 }
 function choose(raw){if(!owns)throw Error('Acquire ownership before selecting a recovered version.');const next=decode(raw);const now=read();retainBytes('Version before explicit recovery',now);retainBytes('Open-tab work before explicit recovery',getSnapshot());if(branches.some(b=>!b.durable))throw Error('Recovery copies are not durable. Copy or download both originals before replacing either record.');setState(next);baseline=now;initialized=true;blocked=false;currentError=null;pending=null;revision++;onWritable?.(true);return save();}
 function observeStorage(event){if(!owns||!initialized||event.key!==key)return;if(event.newValue!==baseline)conflict(event.newValue,'Another context changed the current saved record. Saving is paused; both versions remain available.');}
 function teardown(){blocked=true;if(managed)bridge.failCourseSave(Error('Course writer is closing.'));owns=false;release?.();release=null;}
 return{open,edited,save,retry,flush,accept,choose,releaseOwnership,requestOwnership,observeStorage,teardown,fail:preserveFailure,
  inspect:()=>({managed,blocked,dirty,ownsWriterLock:owns,localBaselineInitialized:initialized,localBaseline:baseline,pendingPublication:pending,editRevision:revision,currentError:currentError?.message||null,lastConfirmed,branches:branches.map(b=>({...b})),localKey:key,lockName,started,attemptedLock})};
}
return{create};
});
