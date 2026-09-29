(function (root, factory) {
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.Chapter4Policy=api;
}(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  var VERSION="c4-mastery-policy-3";
  var STAGES=Object.freeze([0,25,50,75,100]);
  var RETENTION_DELAY_MS=48*60*60*1000;
  var MAX_APPLICATION_CHARS=52000;
  function retentionAdmission(record,now,sessionId){
    if(!record||!record.retentionAvailableAt||!record.transferSessionId)return {allowed:false,reason:"Complete qualifying transfer evidence first."};
    if(String(sessionId||"")===String(record.transferSessionId))return {allowed:false,reason:"Return in a later browser session after the waiting period."};
    if(Number(now)<Number(record.retentionAvailableAt))return {allowed:false,reason:"Retention opens after "+new Date(record.retentionAvailableAt).toLocaleString()+"."};
    return {allowed:true,reason:"Retention task available."};
  }
  function compact(state){
    var copy=JSON.parse(JSON.stringify(state));
    function compactSubmission(submission){
      if(!submission||!submission.componentResults)return submission;
      var components={};
      submission.componentResults.forEach(function(target){
        (target.fields||[]).forEach(function(field){components[field.name]=field.status;});
      });
      submission.components=components;
      delete submission.componentResults;
      if(submission.helpBefore===false)delete submission.helpBefore;
      if(!(submission.supportSources||[]).length)delete submission.supportSources;
      return submission;
    }
    function compactPair(owner){
      if(!owner)return;
      compactSubmission(owner.firstSubmission);
      compactSubmission(owner.finalSubmission);
      if(owner.firstSubmission&&owner.finalSubmission&&JSON.stringify(owner.firstSubmission.answers)===JSON.stringify(owner.finalSubmission.answers)&&JSON.stringify(owner.firstSubmission.components)===JSON.stringify(owner.finalSubmission.components)){
        owner.finalSubmission={sameAsFirst:true,checkedAt:owner.finalSubmission.checkedAt};
      }
    }
    Object.keys(copy.tasks||{}).forEach(function(id){
      var task=copy.tasks[id];
      compactPair(task);
      if(task&&task.closed){delete task.lastResult;delete task.presentationId;delete task.freshAtPresentation;}
      if(task&&!task.repair)delete task.repair;
      if(task&&!(task.repairVariants||[]).length)delete task.repairVariants;
      (task&&task.history||[]).forEach(function(item){
        compactPair(item);
        if(item.answers&&item.finalSubmission&&item.finalSubmission.answers&&JSON.stringify(item.answers)===JSON.stringify(item.finalSubmission.answers))delete item.answers;
        delete item.lastResult;
        if(!item.help)delete item.help;
        if(!(item.supportSources||[]).length)delete item.supportSources;
        if(!item.repair)delete item.repair;
      });
      if(task&&task.history)task.history=task.history.map(function(item){return [item.variant,item.taskVersion,item.checks,item.help?1:0,item.practiceCredit,item.firstSubmission||null,item.finalSubmission||null,item.repair||null,item.supportSources||[]];});
    });
    var fingerprints=[],fingerprintIndex={};function fingerprintId(value){var fp=value||"",index=fingerprintIndex[fp];if(index==null){index=fingerprints.length;fingerprintIndex[fp]=index;fingerprints.push(fp);}return index;}
    var exposureProvenance=[],exposureIndex={},compactExposures=[];
    Object.keys(copy.exposures||{}).forEach(function(fingerprint){var items=(copy.exposures[fingerprint]||[]).map(function(item){var tuple=Array.isArray(item)?item:[item.sourceId,item.route],key=JSON.stringify(tuple),index=exposureIndex[key];if(index==null){index=exposureProvenance.length;exposureIndex[key]=index;exposureProvenance.push(tuple);}return index;});compactExposures.push([fingerprintId(fingerprint),items]);});
    copy.exposures=compactExposures;
    if(exposureProvenance.length)copy.exposureProvenance=exposureProvenance;
    var attempts=[],attemptIndex={},origins=[],originIndex={};
    var variationCodes={"routine-symbolic":"r","changed-representation":"c","context-transfer":"t","error-analysis-transfer":"e","later-routine":"l","later-changed-representation":"d"};
    var componentCodes={"structured-work":"s","transfer":"t","reasoning":"q","retention":"r"};
    Object.keys(copy.evidence||{}).forEach(function(targetId){
      var evidence=copy.evidence[targetId]||{};
      evidence.records=(evidence.records||[]).map(function(record){
        var provenance=[record.taskVersion,record.presentationId,record.variant,record.checkedAt,record.sessionId],key=JSON.stringify(provenance),index=attemptIndex[key];
        if(index==null){index=attempts.length;attemptIndex[key]=index;attempts.push(provenance);}
        var fpAt=record.role==="reasoning"?"":fingerprintId(record.fingerprint);
        var origin=record.originSessionId||"",originAt="";if(origin){originAt=originIndex[origin];if(originAt==null){originAt=origins.length;originIndex[origin]=originAt;origins.push(origin);}}
        return [
          record.role==="verification"?"v":record.role==="transfer"?"t":record.role==="reasoning"?"q":"r",
          fpAt,index,
          record.role==="reasoning"?[]:(record.componentResults||[]).map(function(field){return field.correct&&field.status==="correct_complete"?field.name:[field.name,field.status,field.correct?1:0];}),
          componentCodes[record.component]||record.component||"",variationCodes[record.variation]||record.variation||"",originAt
        ];
      });
      if(!(evidence.gapSignals||[]).length)delete evidence.gapSignals;
      if(!evidence.confirmedGapAt)delete evidence.confirmedGapAt;
    });
    if(attempts.length)copy.attemptProvenance=attempts;
    if(fingerprints.length)copy.fingerprintDictionary=fingerprints;
    if(origins.length)copy.evidenceOrigins=origins;
    return copy;
  }
  function preflight(state){
    var serialized=JSON.stringify(state);
    var compactedState=compact(state), compacted=JSON.stringify(compactedState);
    if(compacted.length<serialized.length)return {allowed:compacted.length<=MAX_APPLICATION_CHARS,characters:compacted.length,limit:MAX_APPLICATION_CHARS,serialized:compacted,state:compactedState,compacted:true};
    return {allowed:serialized.length<=MAX_APPLICATION_CHARS,characters:serialized.length,limit:MAX_APPLICATION_CHARS,serialized:serialized,state:state,compacted:false};
  }
  return {VERSION:VERSION,STAGES:STAGES,RETENTION_DELAY_MS:RETENTION_DELAY_MS,MAX_APPLICATION_CHARS:MAX_APPLICATION_CHARS,retentionAdmission:retentionAdmission,compact:compact,preflight:preflight};
}));
