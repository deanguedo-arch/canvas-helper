(function(root){
  "use strict";
  var bridge=root.__canvasHelperScorm||null;
  var managed=Boolean(bridge&&bridge.connectionState&&bridge.connectionState()==="connected");
  var bases={mastery:"math10c-unit4-pilot:review:v1",practice:"math10c-unit4-pilot:practice:v1",learning:"math10c-unit4-pilot:learning:v1",tools:"math10c-unit4-pilot:tools:v1"};
  var keys={};Object.keys(bases).forEach(function(name){keys[name]=managed?bridge.scopeKey(bases[name]):bases[name];});
  var pendingTimer=null,pendingReceipt="",opening=true;

  function status(message,error){var node=document.getElementById("build-status");if(!node)return;node.textContent=message;node.parentElement.classList.toggle("error",Boolean(error));}
  function parsed(key){try{return JSON.parse(localStorage.getItem(key)||"null");}catch(_){return null;}}
  function snapshot(){return {schemaVersion:2,mastery:parsed(keys.mastery),practice:parsed(keys.practice),learning:parsed(keys.learning),tools:parsed(keys.tools)};}
  function completedIds(){var mastery=parsed(keys.mastery);return mastery&&Array.isArray(mastery.completedIds)?mastery.completedIds.slice():[];}
  function validate(remote){
    if(remote===null)return null;
    if(!remote||(remote.schemaVersion!==1&&remote.schemaVersion!==2)||typeof remote!=="object"||Array.isArray(remote))throw new Error("The Chapter 4 saved-state envelope is invalid.");
    ["mastery","practice","learning","tools"].forEach(function(name){if(remote[name]!==null&&remote[name]!==undefined&&(typeof remote[name]!=="object"||Array.isArray(remote[name])))throw new Error("The saved "+name+" state is invalid.");});
    return remote;
  }
  function restore(remote){
    Object.keys(keys).forEach(function(name){
      if(remote&&remote[name]!=null)localStorage.setItem(keys[name],JSON.stringify(remote[name]));
      else localStorage.removeItem(keys[name]);
    });
  }
  function publish(){
    if(!managed)return "";
    pendingReceipt=bridge.publishCourseState(snapshot(),completedIds());
    if(!pendingReceipt)throw new Error("Brightspace did not issue a save receipt.");
    return pendingReceipt;
  }
  function flush(){publish();}
  function schedule(){
    if(!managed||opening)return;
    try{publish();status("Saving current work to Brightspace…",false);}catch(error){bridge.failCourseSave(error);status("Not saved: "+String(error.message||error),true);return;}
    clearTimeout(pendingTimer);pendingTimer=setTimeout(function(){bridge.saveAsync().then(function(ok){if(!ok)status("Not saved: "+(bridge.lastError?bridge.lastError():"Brightspace did not confirm the save."),true);});},250);
  }

  root.Chapter4Save={managed:managed,key:function(name){return keys[name]||name;},snapshot:snapshot,flush:flush,schedule:schedule};
  if(!managed){opening=false;return;}
  try{
    restore(validate(bridge.readCourseState()));
    bridge.registerCourse({flush:flush});
    publish();
    opening=false;
    root.addEventListener("chapter4:state-changed",schedule);
    root.addEventListener("canvas-helper:scorm-status",function(event){
      var detail=event.detail||{};
      if(detail.error)status("Not saved: "+detail.message,true);
      else if(detail.phase==="saved"&&detail.coursePublicationId===pendingReceipt)status("Saved to Brightspace · not submitted",false);
      else if(detail.message)status(detail.message,false);
    });
  }catch(error){opening=false;bridge.failCourseSave(error);status("Course saving is paused: "+String(error.message||error),true);}
}(typeof globalThis!=="undefined"?globalThis:this));
