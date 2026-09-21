/* Blocked Chapter 3 review-candidate boundary for math10c-unit3-pilot.
   All 22 preserved course pages are learner-reachable. Completion derives
   only from the eight recorded lesson checks u3-check-31 through u3-check-38.
   The triangle contrast (u3-transfer) stays reachable as an optional lab and
   never counts toward Chapter progress. Saved state keeps its key, version
   and all evidence; an unknown route migrates to u3-overview. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathPilotSlice=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const ACTIVE_ROUTES=['u3-overview','u3-ready','u3-31','u3-32','u3-33','u3-34','u3-35','u3-36','u3-37','u3-38','u3-practice','u3-mixed','u3-errors','u3-review','u3-reference','u3-number-lab','u3-expansion-lab','u3-vocab','u3-work','u3-resources','u3-support-library','u3-transfer'];
const INACTIVE_ROUTES=[];
const OPTIONAL_ROUTES=['u3-transfer'];
const COMPLETION_LESSONS=['3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8'];
const REQUIRED_IDS=['u3-check-31','u3-check-32','u3-check-33','u3-check-34','u3-check-35','u3-check-36','u3-check-37','u3-check-38'];
const TOTAL_CHECKPOINTS=8;
function isActiveRoute(id){return ACTIVE_ROUTES.indexOf(id)!==-1;}
function isKnownRoute(id){return isActiveRoute(id)||INACTIVE_ROUTES.indexOf(id)!==-1;}
function isOptionalRoute(id){return OPTIONAL_ROUTES.indexOf(id)!==-1;}
function isRequiredId(id){return REQUIRED_IDS.indexOf(id)!==-1;}
function migrateRoute(state){
 if(!state||typeof state!=='object')return state;
 if(isKnownRoute(state.route))return state;
 const next={};for(const key of Object.keys(state))next[key]=state[key];
 next.route='u3-overview';return next;
}
function angleSetupOk(trig){const t=trig||{};return t.side==='BC'&&t.adjacent==='AB'&&t.hypotenuse==='AC'&&t.ratio==='tan';}
function lengthSetupOk(trig){return (trig||{}).length==='sin';}
function reasonOk(trig){return ((trig||{}).reason||'').trim().length>0;}
function checkedCurrent(trig,rowsKey,rawKey,statusKey){const t=trig||{},rows=Array.isArray(t[rowsKey])?t[rowsKey]:[],latest=rows.at(-1);return t[statusKey]==='correct'&&!!latest&&latest[1]===t[rawKey]&&latest[2]==='correct';}
function isTriangleComplete(trig){
 const t=trig||{};
 return angleSetupOk(t)&&checkedCurrent(t,'aa','angleRaw','angle')&&lengthSetupOk(t)&&checkedCurrent(t,'la','lengthRaw','lengthStatus')&&reasonOk(t);
}
function recordedLessons(done){const lessons=Array.isArray(done)?done:[];return COMPLETION_LESSONS.filter(n=>lessons.indexOf(n)!==-1);}
function pilotProgress(done,trig){
 const recorded=recordedLessons(done);
 const factoring=recorded.indexOf('3.5')!==-1,transfer=isTriangleComplete(trig);
 return{factoring,transfer,lessons:recorded,count:recorded.length,total:TOTAL_CHECKPOINTS};
}
const chapterProgress=pilotProgress;
const unitProgress=pilotProgress;
return{ACTIVE_ROUTES,INACTIVE_ROUTES,OPTIONAL_ROUTES,COMPLETION_LESSONS,REQUIRED_IDS,TOTAL_CHECKPOINTS,isActiveRoute,isKnownRoute,isOptionalRoute,isRequiredId,migrateRoute,angleSetupOk,lengthSetupOk,reasonOk,checkedCurrent,isTriangleComplete,recordedLessons,pilotProgress,chapterProgress,unitProgress};
});
