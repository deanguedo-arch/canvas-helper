/* Retained casino rules, with illustrated outcomes and a settled receipt. */
window.PPLucky=(()=>{
  const symbols=['cherries','lemon','bell','star','gem','seven'];
  const names={cherries:'Cherries',lemon:'Lemon',bell:'Bell',star:'Star',gem:'Gem',seven:'Seven'};
  const red=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
  let revealUntil=0;
  const resultText=r=>r?`${r.label}. Entry ${fmt$(r.bet)}; payout ${fmt$(r.payout)}; net ${fmt$(r.payout-r.bet)}.`:'The reels are ready. Your last result stays here after reloading.';
  const allowed=bet=>window.PPExperience?.casinoAllowed?.(bet)!==false;
  function settle(bet,result){
    if(performance.now()<revealUntil||!allowed(bet)||!canAfford(bet))return;
    G.cash=_r2(G.cash-bet+result.payout);G.gambled=_r2(G.gambled-bet+result.payout);
    noteSpend('fun',bet);if(result.payout)noteIncome(result.payout);trackGamble(bet,result.payout);
    window.PPExperience?.casinoSpent?.(bet);
    G.luckyResult={...result,bet,id:(G.luckySerial=(G.luckySerial||0)+1)};
    revealUntil=performance.now()+(PPScene.reduced?0:650);hud();save();openLucky();
  }
  slotsSpin=()=>{if(performance.now()<revealUntil||!allowed(5)||!canAfford(5))return;const bag=['cherries','cherries','cherries','cherries','lemon','lemon','lemon','bell','bell','star','star','gem','seven'],reels=Array.from({length:3},()=>bag[Math.floor(casDraw()*bag.length)]);const same=reels[0]===reels[1]&&reels[1]===reels[2],pair=new Set(reels).size<3,payout=same&&reels[0]==='seven'?500:same?50:pair?3:0;settle(5,{kind:'slots',reels,payout,label:reels.map(s=>names[s]).join(' · ')});};
  roulette=kind=>{const bet=kind==='seven'?5:10;if(performance.now()<revealUntil||!allowed(bet)||!canAfford(bet))return;const u=casDraw();let number,win;if(kind==='seven'){win=u<.04;const other=Math.floor(Math.max(0,(u-.04)/.96)*36);number=win?7:other>=7?other+1:other;}else{number=Math.floor(u*37);win=number!==0&&(red.has(number)?'red':'black')===kind;}const color=number===0?'green':red.has(number)?'red':'black';settle(bet,{kind:'roulette',number,color,payout:win?(kind==='seven'?100:20):0,label:`${kind==='seven'?'Lucky number 7':kind+' bet'} · landed on ${color} ${number}`});};
  function ticket(){if(performance.now()<revealUntil||!allowed(2)||!canAfford(2))return;const payout=casDraw()<.01?100:0;settle(2,{kind:'ticket',payout,label:payout?'Winning ticket':'No winning match'});}
  openLucky=()=>{
    const r=G.luckyResult;
    const cap=window.PPExperience?.casinoState?.(),remaining=cap?.cap==null?0:Math.max(0,cap.cap-cap.spent);
    showMenu("Lucky's",`Lifetime gambling net: <b>${fmt$(G.gambled)}</b>. ${cap?.cap==null?'Set a spending limit before playing.':`This period: ${fmt$(remaining)} of ${fmt$(cap.cap)} limit remains.`}`, [
      {label:'Set or view spending limit and odds',fn:()=>openExamine('lucky')},
      {label:'Slots — $5 · three sevens $500, other triples $50, a pair $3',fn:slotsSpin,disabled:remaining<5},
      {label:'Roulette red — $10 · pays $20 · 18/37 chance',fn:()=>roulette('red'),disabled:remaining<10},
      {label:'Roulette black — $10 · pays $20 · 18/37 chance',fn:()=>roulette('black'),disabled:remaining<10},
      {label:'Lucky number 7 — $5 · pays $100 · 4% chance',fn:()=>roulette('seven'),disabled:remaining<5},
      {label:'Lottery ticket — $2 · pays $100 · 1% chance',fn:ticket,disabled:remaining<2}
    ],'A payout includes any returned stake. These games favor the house over time. Treat the cost as entertainment, with a limit you choose in advance.');
    const art=document.createElement('div');art.className='lucky-display';art.innerHTML=`<canvas id="luckyScene" width="640" height="250" aria-label="Illustrated game result"></canvas><p id="luckyOutcome" role="status">${performance.now()<revealUntil?'Revealing your result…':resultText(r)}</p>`;$('modal').querySelector('.desc').after(art);
    for(const b of $('modal').querySelectorAll('button[data-a^="b"]'))if(b.dataset.a!=='bx'&&performance.now()<revealUntil)b.disabled=true;
    draw();
  };
  function draw(){const cv=$('luckyScene');if(!cv)return;const ctx=cv.getContext('2d'),W=cv.width,H=cv.height,r=G.luckyResult,revealing=performance.now()<revealUntil;PPArt.sprite(ctx,'roomsB','lucky',W/2,H,W,H);ctx.fillStyle='rgba(29,57,40,.92)';ctx.strokeStyle='#d4b46a';ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(25,18,W-50,H-36,12);ctx.fill();ctx.stroke();
    if(!r||r.kind==='slots'){const reels=r?.reels||['cherries','bell','seven'];for(let i=0;i<3;i++){const x=W/2+(i-1)*175;ctx.fillStyle='#fff1cf';ctx.beginPath();ctx.roundRect(x-73,43,146,148,8);ctx.fill();const name=revealing?symbols[(Math.floor(performance.now()/75)+i)%6]:reels[i];PPArt.sprite(ctx,'luckySymbols',name,x,174,100,108);if(name==='seven'){ctx.fillStyle='#345b45';ctx.font='bold 55px Georgia';ctx.textAlign='center';ctx.fillText('7',x,145);}ctx.fillStyle='#f3dfab';ctx.font='bold 16px Trebuchet MS';ctx.textAlign='center';ctx.fillText(names[name],x,219);}}
    else if(r.kind==='roulette'){PPArt.sprite(ctx,'luckySymbols','seven',W*.28,H*.84,170,170);ctx.fillStyle=r.color==='red'?'#a23e2b':r.color==='green'?'#2c6845':'#25372c';ctx.font='bold 62px Georgia';ctx.textAlign='center';ctx.fillText(String(r.number),W*.28,H*.61);ctx.fillStyle='#f3dfab';ctx.font='bold 21px Trebuchet MS';ctx.fillText(r.color.toUpperCase()+' '+r.number,W*.68,H*.46);ctx.font='17px Trebuchet MS';ctx.fillText(r.payout?'Payout '+fmt$(r.payout):'No payout this time',W*.68,H*.63);}
    else{PPArt.sprite(ctx,'props','ticket',W*.28,H*.80,180,130);ctx.fillStyle='#f3dfab';ctx.font='bold 21px Trebuchet MS';ctx.textAlign='center';ctx.fillText(r.payout?'Winning ticket':'No winning match',W*.68,H*.48);ctx.font='17px Trebuchet MS';ctx.fillText('Payout '+fmt$(r.payout),W*.68,H*.65);}
    if(revealing)requestAnimationFrame(draw);else{if($('luckyOutcome'))$('luckyOutcome').textContent=resultText(r);if($('modal').querySelector('.lucky-display')){const cap=window.PPExperience?.casinoState?.(),remaining=cap?.cap==null?0:Math.max(0,cap.cap-cap.spent);$('modal').querySelectorAll('button[data-a^="b"]').forEach((b,i)=>{if(i>0)b.disabled=remaining<[0,5,10,10,5,2][i];else b.disabled=false;});}}
  }
  MENU_FNS.openLucky=()=>openLucky();return{open:()=>openLucky(),draw};
})();
