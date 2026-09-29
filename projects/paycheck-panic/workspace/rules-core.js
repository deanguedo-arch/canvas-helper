/* Money and contact rules used by both the scene and focused checks. */
(function(root){
  const rules={
    rhythm: hits=>{const pct=hits/32*100;return pct>=90?6:pct>=80?3:pct>=60?1:0;},
    racer:(distance,crashes)=>distance>=1000&&crashes<3?6:distance>=700?1.5:distance>=400?.5:0,
    wheel:d=>d<.40?0:d<.70?1:d<.85?2:d<.95?3:d<.99?5:10,
    wheelEV:()=>.3+.15*2+.1*3+.04*5+.01*10,
    trader:value=>value>=180?'Market maestro':value>=140?'Steady trader':value>=100?'Token keeper':null,
    overlap:(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y,
    period:g=>g.campaign?.pace==='life'?(g.month-1)*30+g.campaign.day:g.month,
  };root.PPRules=rules;if(typeof module!=='undefined')module.exports=rules;
})(typeof window==='undefined'?globalThis:window);
