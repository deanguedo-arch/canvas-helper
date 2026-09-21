/* Blocked review-pilot boundary for math10c-unit3-pilot.
   Known pages are every preserved course-page ID; active pages are the seven
   learner-reachable pilot routes. Inactive pages stay in canonical HTML for
   later expansion but are never routed to. Saved state keeps its key, version
   and all evidence; only an inactive route is remapped to u3-overview. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathPilotSlice=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const ACTIVE_ROUTES=['u3-overview','u3-ready','u3-35','u3-transfer','u3-reference','u3-support-library','u3-work'];
const INACTIVE_ROUTES=['u3-31','u3-32','u3-33','u3-34','u3-36','u3-37','u3-38','u3-practice','u3-mixed','u3-errors','u3-review','u3-number-lab','u3-expansion-lab','u3-vocab','u3-resources'];
const REQUIRED_IDS=['u3-check-35','u3-transfer-complete'];
const TOTAL_CHECKPOINTS=2;
function isActiveRoute(id){return ACTIVE_ROUTES.indexOf(id)!==-1;}
function isKnownRoute(id){return isActiveRoute(id)||INACTIVE_ROUTES.indexOf(id)!==-1;}
function migrateRoute(state){
 if(!state||typeof state!=='object')return state;
 if(isActiveRoute(state.route))return state;
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
function pilotProgress(done,trig){
 const lessons=Array.isArray(done)?done:[];
 const factoring=lessons.indexOf('3.5')!==-1,transfer=isTriangleComplete(trig);
 return{factoring,transfer,count:(factoring?1:0)+(transfer?1:0),total:TOTAL_CHECKPOINTS};
}
return{ACTIVE_ROUTES,INACTIVE_ROUTES,REQUIRED_IDS,TOTAL_CHECKPOINTS,isActiveRoute,isKnownRoute,migrateRoute,angleSetupOk,lengthSetupOk,reasonOk,checkedCurrent,isTriangleComplete,pilotProgress};
});
