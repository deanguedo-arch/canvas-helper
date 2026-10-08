/* Local lifecycle and evidence protocol for the original Sports Wellness game mechanics. */
(()=>{
'use strict';
const cfg=JSON.parse(document.getElementById('game-config').textContent);
const session=new URLSearchParams(location.hash.slice(1)).get('session')||'';
const rawNow=Date.now.bind(Date),rawSet=setTimeout.bind(window),rawClear=clearTimeout.bind(window);
let active=false,pausedAt=rawNow(),pauseTotal=0,current=null,handlers=null,lastState='intro';
let timerID=0;const timers=new Map();const target=location.origin==='null'?'*':location.origin;
const now=()=> (active?rawNow():pausedAt)-pauseTotal;
const clockPause=()=>{if(!active)return;pausedAt=rawNow();active=false;for(const t of timers.values()){rawClear(t.native);t.remaining=Math.max(0,t.due-now());}};
const runTimer=t=>{t.due=now()+t.remaining;t.native=rawSet(()=>{if(!active)return;timers.delete(t.id);t.fn(...t.args);},t.remaining);};
const clockResume=()=>{if(active)return;pauseTotal+=rawNow()-pausedAt;active=true;for(const t of timers.values())runTimer(t);};
const clearTimers=()=>{for(const t of timers.values())rawClear(t.native);timers.clear();};
const send=(type,record)=>parent.postMessage({channel:'sportswellness-game',activityId:cfg.id,version:1,session,type,...(record?{record}:{})},target);
const id=()=>crypto.randomUUID?.()||`round-${rawNow()}-${Math.random().toString(16).slice(2)}`;
function begin(){clearTimers();clockResume();current={id:id(),started:now(),sent:false};}
function finish(status,reason){
 if(!current||current.sent)return;
 const elapsed=Math.max(0,(now()-current.started)/1000);current.sent=true;clockPause();clearTimers();
 const record={id:current.id,activityId:cfg.id,version:1,at:new Date(rawNow()).toISOString(),status,reason,elapsed,score:Number(handlers?.score)||0};
 send('summary',record);document.getElementById('game-status').textContent=`${reason} Active time ${elapsed.toFixed(1)} seconds. Game score ${record.score}. This is not a psychological measurement.`;
}
function updateControls(state){
 document.getElementById('game-start').hidden=state!=='intro';
 document.getElementById('game-pause').hidden=state!=='playing';
 document.getElementById('game-resume').hidden=state!=='paused';
 document.getElementById('game-end').hidden=!['playing','paused'].includes(state);
 document.getElementById('game-restart').hidden=state==='intro';
 document.getElementById('root').hidden=state==='paused'||state==='ended';
 document.getElementById('game-state').textContent=state==='playing'?'Round running':state==='paused'?'Paused':state==='intro'?'Ready to start': 'Round finished';
}
function pause(){if(handlers?.gameState!=='playing')return;clockPause();handlers.audio?.current?.suspend?.();handlers.setGameState('paused');document.getElementById('game-status').textContent='Paused. Timed motion and pending game adjustments are stopped. Resume when ready.';}
function interrupt(reason){if(!['playing','paused'].includes(handlers?.gameState))return;finish('interrupted',reason||'Activity interrupted');handlers.audio?.current?.suspend?.();handlers.setGameState('ended');}
const bridge={muted:true,now,
 setTimeout(fn,ms,...args){const t={id:++timerID,fn,args,remaining:Math.max(0,Number(ms)||0),due:now()+Math.max(0,Number(ms)||0),native:null};timers.set(t.id,t);if(active)runTimer(t);return t.id;},
 clearTimeout(id){const t=timers.get(id);if(t)rawClear(t.native);timers.delete(id);},
 useControls(h){
  handlers=h;
  React.useEffect(()=>{
   const state=h.gameState;
   if(state==='playing'&&lastState!=='playing'){
    if(lastState==='paused')clockResume();else begin();
    document.getElementById('game-status').textContent='Round running. Scores and visual effects follow the game rules, not measurements of your thoughts or body.';
   }
   if(state==='paused')clockPause();
   if(state==='gameover')finish('completed',h.reason||'The game variable reached its ending limit.');
   if(state==='win')finish('completed','The game target was reached.');
   if(state!=='playing')h.audio?.current?.suspend?.();
   updateControls(state);lastState=state;
  },[h.gameState]);
 },interrupt,
 diagnostics:()=>({state:handlers?.gameState,active,pendingTimers:timers.size,hasRound:!!current,summarySent:current?.sent||false,now:now()})};
window.CourseGameBridge=bridge;
document.getElementById('game-start').onclick=()=>{if(handlers){handlers.restart();}};
document.getElementById('game-pause').onclick=pause;
document.getElementById('game-resume').onclick=()=>{if(handlers?.gameState==='paused')handlers.setGameState('playing');};
document.getElementById('game-end').onclick=()=>{if(!handlers)return;finish('ended','Round ended by the learner.');handlers.setGameState('ended');};
document.getElementById('game-restart').onclick=()=>{if(!handlers)return;if(['playing','paused'].includes(handlers.gameState)&&!confirm('End this round and restart? A summary of the current round will be kept.'))return;finish('ended','Restarted by the learner.');handlers.setGameState('intro');rawSet(()=>handlers.restart(),30);};
document.getElementById('game-sound').onchange=e=>{bridge.muted=!e.target.checked;if(bridge.muted)handlers?.audio?.current?.suspend?.();};
addEventListener('message',e=>{
 if(e.source!==parent||e.origin!==location.origin)return;
 const d=e.data;if(!d||typeof d!=='object'||d.channel!=='sportswellness-control'||d.activityId!==cfg.id||d.version!==1||d.session!==session)return;
 if(d.command==='interrupt'&&typeof d.reason==='string'&&d.reason.length<=500)interrupt(d.reason);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt('Activity hidden.');});
addEventListener('pagehide',()=>interrupt('Activity closed.'));
rawSet(()=>send('ready'),0);
})();
