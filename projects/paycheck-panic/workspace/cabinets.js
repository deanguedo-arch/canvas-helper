/* Illustrated cabinets. Render geometry and gameplay contact share coordinates. */
function ppCabScene(ctx,W,H,room='mall'){
  PPArt.sprite(ctx,'roomsB',room,W/2,H,W,H);
  ctx.fillStyle='rgba(22,43,32,.78)';ctx.fillRect(W*.05,H*.03,W*.9,H*.94);
  ctx.strokeStyle='#dbb65f';ctx.lineWidth=5;ctx.strokeRect(W*.05,H*.03,W*.9,H*.94);
}
function ppProp(ctx,name,x,y,w,h,rotation=0){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);PPArt.sprite(ctx,'props',name,0,h/2,w,h);ctx.restore();}
Object.assign(CABS.claw,{fee:3,energy:2,rival:[1],blurb:'One drop. Line up the articulated claw with a prize. A clean grab earns a souvenir and +2 happiness.'});
Object.assign(CABS.rhythm,{rival:[80,90],blurb:'32 notes. 60% pays $1, 80% pays $3, 90% pays $6. Play with sound on or off.'});
Object.assign(CABS.racer,{rival:[700,1000],blurb:'Reach 1000 m for $6. A wreck at 400–699 m pays $0.50; 700–999 m pays $1.50.'});
Object.assign(CABS.wheel,{blurb:'$0: 40% · $1: 30% · $2: 15% · $3: 10% · $5: 4% · $10: 1%. Expected payout $1.20 per $2 spin.'});
Object.assign(CABS.trader,{fee:5,rival:[140,180],blurb:'100 virtual tokens. Trade ten market ticks. Souvenirs at 100 / 140 / 180. No cash redemption.'});
wheelBucket=PPRules.wheel;wheelEV=PPRules.wheelEV;traderScore=v=>Math.round(v*100)/100;
clawPrizePool=()=>{const period=G.campaign?.pace==='life'?Math.floor(((G.month-1)*30+G.campaign.day-1)/7):G.month;return seededPick(CLAW_PRIZE_POOL,5,(G.seed^period)>>>0);};
traderTicks=seed=>{let p=1;const out=[p];for(let i=0;i<10;i++){p=Math.max(.05,_r2(p*(1+gaussPair(splitmix64_2arg(seed,i*2),splitmix64_2arg(seed,i*2+1))*.05)));out.push(p);}return out;};
cabEnter=id=>{
  const c=CABS[id],period=PPRules.period(G);if(!c||G.arc.visitMonth!==period||G.arc.plays[id]===period||cabPlaysUsed()>=3)return null;
  if(G.cash<c.fee||G.energy<c.energy){toast('You need enough cash and energy to play.');return null;}
  G.cash=_r2(G.cash-c.fee);noteSpend('fun',c.fee);G.energy-=c.energy;
  const attempt={id:'ARC'+period+'-'+id+'-'+(++G.arc.attemptSeq|| (G.arc.attemptSeq=1)),cab:id};
  G.arc.plays[id]=period;G.arc.playsUsed++;G.arcEnergyDebt=Math.min(24,(G.arcEnergyDebt||0)+8);G.arc.attempts[attempt.id]={cab:id,paidOut:false,quit:false};
  if(id==='wheel'){G.gambled-=c.fee;trackGamble(c.fee,0);}hud();save();return attempt;
};
openArcade=()=>{
  const period=PPRules.period(G),unit=G.campaign?.pace==='life'?'day':'month',visited=G.arc.visitMonth===period;
  if(!visited){showMenu('Arcade evening',`One visit per ${unit}; up to three different cabinets. Each play also uses 8 energy after your next sleep (maximum 24).`,[{label:'Step inside',fn:()=>{G.arc.visitMonth=period;G.arc.playsUsed=0;save();openArcade();}},{label:'Back to mall',fn:openMall}],'Entry fees are charged once when play starts. Save and resume keeps your attempt. Quitting forfeits the fee.');return;}
  showMenu('Arcade evening',`${3-cabPlaysUsed()} plays left · ${G.arcEnergyDebt||0} energy due after sleep`,Object.entries(CABS).map(([id,c])=>({label:`${c.name} — ${fmt$(c.fee)} · ${c.energy} energy<br><small>${c.blurb}</small>`,disabled:cabPlaysUsed()>=3||G.arc.plays[id]===period,fn:()=>{const a=cabEnter(id);if(a){closeModal();cbOpen(id,a,c.name,c.blurb);}}})),'Souvenirs have no resale value. Wheel odds favor the house.');
};
const ppCBOpen=cbOpen;cbOpen=(...args)=>{PPScene.clearInput();if(CB.active)cbCleanup();ppCBOpen(...args);CB.game.over=false;cbEl('cbPause').disabled=false;save();};
cbSetPaused=p=>{if(!CB.active)return;CB.paused=p;PPScene.clearInput();CB.last=performance.now();cbEl('cbPause').textContent=p?'Resume':'Pause';cbEl('cbWarn').textContent=p?'Paused — your attempt is saved.':'';if(CB.kind==='rhythm'){if(p)CB.game.ac?.suspend();else CB.game.ac?.resume();}save();};
const ppSoundClick=$('ppSound').onclick;$('ppSound').onclick=()=>{ppSoundClick();if(CB.kind==='rhythm'&&CB.game?.master)CB.game.master.gain.value=PPScene.muted?0:.5;save();};
Object.assign(clawGame,{
  init(attempt){
    const seed=Math.floor(arcDraw()*4294967296)>>>0;this.layout=clawLayout(splitmix64_2arg(seed,0));this.sway=clawSway(...[1,2,3].map(i=>splitmix64_2arg(seed,i)));this.mult=Math.min(2,1+.15*(G.arc.clawStreak||0));this.pool=clawPrizePool();
    let prizeIndex=0;this.prizes=this.layout.grid.map((v,i)=>v?{x:.18+(i%5)*.16,y:.58+Math.floor(i/5)*.18,art:['dinosaur','rabbit','rocket','robot','ticket'][prizeIndex],name:this.pool[prizeIndex++]}:null).filter(Boolean);
    this.t=0;this.carX=.5;this.targetX=.5;this.phase='aim';this.cy=.18;this.cx=.5;this.held=null;this.clean=false;this._keyL=this._keyR=false;this.over=false;this.phaseT=0;
    cbEl('cbInfo').textContent='One drop · A/D or drag to aim · Space to drop · contact inside the fingers';cbEl('cbBtns').innerHTML='<button id="cbDrop">Drop claw</button>';$('cbDrop').onclick=()=>this.tryDrop();
    const cv=$('cbCanvas');const aim=e=>{const r=cv.getBoundingClientRect();this.targetX=clamp((e.clientX-r.left)/r.width,.14,.86);};cv.onpointerdown=aim;cv.onpointermove=e=>{if(e.buttons)aim(e);};
  },
  tryDrop(){if(this.phase!=='aim'||CB.paused)return;this.phase='dropping';this.phaseT=0;$('cbDrop').disabled=true;save();},
  update(dt){
    if(this.over)return;this.t+=dt;this.phaseT+=dt;
    if(this.phase==='aim'){if(this._keyL)this.targetX=clamp(this.targetX-dt*.5,.14,.86);if(this._keyR)this.targetX=clamp(this.targetX+dt*.5,.14,.86);this.carX+=(this.targetX-this.carX)*Math.min(1,dt*10);this.cx=this.carX;}
    if(this.phase==='dropping'){
      this.cy+=dt*.5;this.cx=this.carX+Math.sin(clawSwayDeg(this.sway,this.t)*Math.PI/180)*Math.max(0,this.cy-.18)*.12*this.mult;
      const p=this.prizes.find(p=>Math.abs(p.x-this.cx)<.062&&Math.abs(p.y-(this.cy+.035))<.025);
      if(p){this.held=p;this.clean=Math.abs(p.x-this.cx)<.035;this.phase='grabbing';this.phaseT=0;}else if(this.cy>=.81){this.phase='rising';this.phaseT=0;}
    }else if(this.phase==='grabbing'&&this.phaseT>.4){this.phase='rising';this.phaseT=0;}
    else if(this.phase==='rising'){
      this.cy=Math.max(.18,this.cy-dt*.42);if(this.held&&!this.clean&&this.phaseT>.6){this.slip={...this.held,y:this.cy};this.held=null;}
      if(this.cy<=.18){this.phase='drop';this.phaseT=0;}
    }else if(this.phase==='drop'){if(this.held)this.cx+=(.12-this.cx)*Math.min(1,dt*4);if(this.phaseT>1.1)this.finish();}
    if(this.slip)this.slip.y=Math.min(.84,this.slip.y+dt*.6);
  },
  finish(){if(this.over)return;this.over=true;const win=!!this.held;
    if(win){addSouvenir(this.held.name,'Claw · '+CB.attempt.id);addHappy(2);clawNoteWin();}else G.arc.clawStreak=0;
    cbShowResults({score:win?1:0,payout:0,title:win?'A clean grab!':'The prize slipped away',lines:[win?`${this.held.name} is now displayed at home. +2 happiness. $0 resale.`:'Line up both fingers around the same prize. An edge grab slips during the lift.','One drop used. Entry $3; 2 energy plus the evening energy debt.']});
  },
  draw(){const c=$('cbCanvas'),ctx=c.getContext('2d'),W=c.width,H=c.height;ppCabScene(ctx,W,H);ctx.fillStyle='#b9d1bc';ctx.fillRect(W*.1,H*.13,W*.8,H*.72);ctx.fillStyle='#d8bd81';ctx.fillRect(W*.1,H*.83,W*.8,H*.035);
    for(const p of this.prizes)if(p.name!==this.held?.name&&(!this.slip||p.name!==this.slip.name))ppProp(ctx,p.art,p.x*W,p.y*H,W*.09,H*.12);
    if(this.slip)ppProp(ctx,this.slip.art,this.slip.x*W,this.slip.y*H,W*.09,H*.12);
    ctx.strokeStyle='#476259';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(W*.13,H*.12);ctx.lineTo(W*.87,H*.12);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(this.carX*W,H*.12);ctx.lineTo(this.cx*W,this.cy*H);ctx.stroke();
    ctx.fillStyle='#d8b560';ctx.fillRect(this.carX*W-18,H*.1,36,H*.055);const x=this.cx*W,y=this.cy*H,grip=this.phase==='grabbing'||this.held?.name?W*.032:W*.058;
    ctx.strokeStyle='#f3f4dc';ctx.lineWidth=6;ctx.lineCap='round';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+s*grip,y+H*.022);ctx.lineTo(x+s*grip*.75,y+H*.065);ctx.stroke();}
    if(this.held)ppProp(ctx,this.held.art,x,y+H*.073,W*.085,H*.11);PPArt.label(ctx,this.phase==='aim'?'Aim at the center of one prize':this.phase==='rising'?'Lifting…':this.phase==='drop'?'Prize chute':'Claw in motion',W/2,H*.94);
  }
});
Object.assign(rhythmGame,{
  start(){if(this.started)return;this.started=true;this.ac.resume();this.master.gain.value=PPScene.muted||this.muted?0:.5;const elapsed=this.resumeElapsed||0;this.startT=this.ac.currentTime-elapsed/1000;this.noteTimes=this.notes.map(n=>this.startT+n.t/1000);this.resumeElapsed=0;
    this.notes.forEach((n,i)=>{const t=this.noteTimes[i];if(this.judged[i]||t<this.ac.currentTime)return;const o=this.ac.createOscillator(),g=this.ac.createGain();o.frequency.value=this.pitches[n.lane];g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.2,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.2);});$('cbBtns').innerHTML='';save();
  },
  finish(){if(this.over)return;this.over=true;const pct=Math.round(this.hits/32*100),payout=PPRules.rhythm(this.hits);cbShowResults({score:pct,payout,title:'Rhythm Rush — complete',lines:[`${this.hits}/32 notes hit · ${this.perfect} perfect · ${this.good} good · ${this.missed} missed.`,`Reward bands: 60% $1 · 80% $3 · 90% $6. Your payout: ${fmt$(payout)}.`]});},
  draw(){const c=$('cbCanvas'),ctx=c.getContext('2d'),W=c.width,H=c.height;ppCabScene(ctx,W,H);const left=W*.13,lw=W*.185,hitY=H*.80;
    for(let l=0;l<4;l++){ctx.fillStyle=l%2?'#2e594b':'#25473e';ctx.fillRect(left+l*lw,H*.07,lw-4,H*.80);ctx.fillStyle='#dfc782';ctx.font=`bold ${H*.05}px Trebuchet MS`;ctx.textAlign='center';ctx.fillText('DFJK'[l],left+(l+.5)*lw,H*.94);}
    ctx.fillStyle='#f8e7a4';ctx.fillRect(left,hitY-3,lw*4-4,6);
    if(!this.started){PPArt.label(ctx,'Start · watch the line · D F J K or tap',W/2,H*.48);return;}
    const now=this.ac.currentTime;this.notes.forEach((n,i)=>{if(this.judged[i])return;const d=this.noteTimes[i]-now,y=hitY-d*H*.46;if(y<H*.08||y>H*.90)return;ctx.fillStyle=['#e89c77','#ebcc75','#9ccd99','#96bcc8'][n.lane];ctx.strokeStyle='#152c24';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(left+(n.lane+.15)*lw,y-H*.016,lw*.7,H*.034,5);ctx.fill();ctx.stroke();});
    if(this.flash?.t>0)PPArt.label(ctx,this.flash.txt,left+(this.flash.lane+.5)*lw,hitY-H*.12);
  }
});
const ppRhythmInit=rhythmGame.init;rhythmGame.init=function(a){ppRhythmInit.call(this,a);this.flash=null;this.muted=PPScene.muted;this.master.gain.value=this.muted?0:.5;$('cbStart').textContent='Start rhythm';$('cbMute').textContent=this.muted?'Unmute':'Mute';$('cbCanvas').onpointerdown=e=>{if(CB.paused)return;if(!this.started){this.start();return;}const r=$('cbCanvas').getBoundingClientRect(),x=(e.clientX-r.left)/r.width;this.tapLane(clamp(Math.floor((x-.13)/.185),0,3));};};
const ppRhythmTap=rhythmGame.tapLane;rhythmGame.tapLane=function(l){if(CB.paused||PPScene.paused)return;const before=this.hits;ppRhythmTap.call(this,l);if(this.hits===before)this.flash={lane:l,t:.3,txt:'MISS'};save();};
const ppRhythmUpdate=rhythmGame.update;rhythmGame.update=function(dt){const before=this.missed;ppRhythmUpdate.call(this,dt);if(this.missed>before)this.flash={lane:this.notes[this.judged.lastIndexOf(true)]?.lane||0,t:.3,txt:'MISS'};};
Object.assign(racerGame,{
  geometry(){const c=$('cbCanvas');return{W:c.width,H:c.height,laneW:c.width*.26,left:c.width*.24,py:c.height*.79,scale:c.height*.003};},
  playerBox(){const g=this.geometry();const w=Math.min(g.W*.10,g.H*.10),h=w*1.5;return{x:g.left+this.lane*g.laneW-w/2,y:g.py-h/2,w,h};},
  obstacleBox(o){const g=this.geometry();const w=Math.min(g.W*.17,g.H*.25),h=w*.4;return{x:g.left+o.lane*g.laneW-w/2,y:g.py-(o.dist-this.dist)*g.scale-h/2,w,h};},
  update(dt){if(this.over)return;this.elapsed=(this.elapsed||0)+dt;this.lane+=(this.targetLane-this.lane)*Math.min(1,dt*9);this.dist+=this.speed()*dt;this.slowT=Math.max(0,this.slowT-dt);this.shake=Math.max(0,this.shake-dt);
    const p=this.playerBox();for(const o of this.obs){if(o.done)continue;const b=this.obstacleBox(o);if(PPRules.overlap(p,b)){o.done=true;this.crashes++;this.shake=.45;this.slowT=1.2;sfx.bad();if(this.crashes>=3){this.finish();return;}}else if(b.y>p.y+p.h)o.done=true;}
    if(this.dist>=1000){this.dist=1000;this.finish();return;}$('cbInfo').textContent=`${Math.floor(this.dist)} / 1000 m · ${this.crashes}/3 impacts · ${this.elapsed.toFixed(1)} s`;
  },
  finish(){if(this.over)return;this.over=true;const d=Math.floor(this.dist),payout=PPRules.racer(d,this.crashes);const rec=G.arc.racerBest;if(!rec||d>rec.distance||(d===rec.distance&&this.elapsed<rec.elapsed))G.arc.racerBest={distance:d,elapsed:this.elapsed};cbShowResults({score:d,payout,title:d>=1000?'Finish line!':'The car needs repairs',lines:[`${d} m in ${(this.elapsed||0).toFixed(1)} seconds · ${this.crashes} impacts.`,`Payout ${fmt$(payout)}. Finish: $6. Wreck after 400 m: $0.50; after 700 m: $1.50.`]});},
  draw(){const c=$('cbCanvas'),ctx=c.getContext('2d'),g=this.geometry(),{W,H}=g;ctx.fillStyle='#9caf76';ctx.fillRect(0,0,W,H);PPArt.sprite(ctx,'town','tree',W*.04,H*.62,W*.17,W*.20);PPArt.sprite(ctx,'town','pines',W*.96,H*.92,W*.19,W*.22);ctx.fillStyle='#e8d5b1';ctx.fillRect(W*.095,0,W*.81,H);ctx.fillStyle='#6b756e';ctx.fillRect(W*.12,0,W*.76,H);
    ctx.strokeStyle='#f2dfb4';ctx.lineWidth=3;ctx.setLineDash([H*.06,H*.045]);ctx.lineDashOffset=-this.dist*2;for(const x of [.37,.63]){ctx.beginPath();ctx.moveTo(W*x,0);ctx.lineTo(W*x,H);ctx.stroke();}ctx.setLineDash([]);
    for(const o of this.obs){if(o.done)continue;const b=this.obstacleBox(o);if(b.y<0||b.y>H)continue;ppProp(ctx,'barrier',b.x+b.w/2,b.y+b.h/2,b.w,b.h);if(b.y<H*.19)PPArt.label(ctx,'Ahead',b.x+b.w/2,H*.15);if(PPScene.debug){ctx.strokeStyle='#ff4380';ctx.strokeRect(b.x,b.y,b.w,b.h);}}
    const p=this.playerBox();ctx.save();if(this.shake>0&&!PPScene.reduced)ctx.translate(Math.sin(this.elapsed*60)*this.shake*6,0);ppProp(ctx,'car',p.x+p.w/2,p.y+p.h/2,p.w,p.h,(this.targetLane-this.lane)*.16);ctx.restore();if(this.slowT>0)PPArt.label(ctx,'Recovering',W/2,H*.97);if(PPScene.debug){ctx.strokeStyle='#3ff3da';ctx.strokeRect(p.x,p.y,p.w,p.h);}
  }
});
const ppRacerInit=racerGame.init;racerGame.init=function(a){ppRacerInit.call(this,a);this.elapsed=0;};
Object.assign(wheelGame,{
  noPause:false,
  init(a){this.attempt=a;this.spinning=false;this.angle=0;this.over=false;this.result=null;this.segs=[{label:'$0',pct:40,color:'#668d78',from:0,to:.4},{label:'$1',pct:30,color:'#99b899',from:.4,to:.7},{label:'$2',pct:15,color:'#e1c37c',from:.7,to:.85},{label:'$3',pct:10,color:'#df9d78',from:.85,to:.95},{label:'$5',pct:4,color:'#a3bac5',from:.95,to:.99},{label:'$10',pct:1,color:'#f4e5aa',from:.99,to:1}];$('cbInfo').textContent=CABS.wheel.blurb;$('cbBtns').innerHTML='<button id="cbSpin">Spin the wheel</button>';$('cbSpin').onclick=()=>this.spin();},
  spin(){if(this.spinning||this.over||CB.paused)return;this.spinning=true;$('cbBtns').innerHTML='';const d=casDraw();this.prize=wheelBucket(d);this.startAngle=this.angle;this.targetAngle=Math.PI*2*5-Math.PI/2-d*Math.PI*2;this.spinT=0;save();},
  finish(){if(this.over)return;this.over=true;G.gambled+=this.prize;trackGambleWin(this.prize);cbShowResults({score:this.prize,payout:this.prize,title:'Wheel result — '+fmt$(this.prize),lines:[CABS.wheel.blurb,`Entry $2. Net result ${fmt$(this.prize-2)}. Lifetime gambling ${fmt$(G.gambled)}.`]});},
  draw(){const c=$('cbCanvas'),ctx=c.getContext('2d'),W=c.width,H=c.height;ppCabScene(ctx,W,H,'lucky');const x=W/2,y=H*.49,r=Math.min(W*.34,H*.37);ctx.fillStyle='#b99349';ctx.beginPath();ctx.arc(x,y,r+13,0,Math.PI*2);ctx.fill();
    for(const s of this.segs){const a=this.angle+s.from*Math.PI*2,b=this.angle+s.to*Math.PI*2;ctx.fillStyle=s.color;ctx.strokeStyle='#304c3b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,r,a,b);ctx.closePath();ctx.fill();ctx.stroke();if(s.pct>=10){const m=(a+b)/2;ctx.fillStyle='#173d2c';ctx.font=`bold ${r*.13}px Trebuchet MS`;ctx.textAlign='center';ctx.fillText(s.label,x+Math.cos(m)*r*.68,y+Math.sin(m)*r*.68);}}
    ctx.fillStyle='#f2dda0';ctx.beginPath();ctx.moveTo(x-14,y-r-20);ctx.lineTo(x+14,y-r-20);ctx.lineTo(x,y-r+9);ctx.fill();ctx.fillStyle='#365441';ctx.beginPath();ctx.arc(x,y,r*.13,0,Math.PI*2);ctx.fill();PPArt.label(ctx,this.spinning?'Spinning…':'$2 entry · expected payout $1.20',W/2,H*.94);
  }
});
Object.assign(traderGame,{
  init(){const seed=traderAttemptSeed();G.arc.tokenAttempts=(G.arc.tokenAttempts||0)+1;this.prices=traderTicks(seed);this.tick=0;this.cash=0;this.tokens=100;this.history=[1];this.over=false;this.render();},
  render(){const p=this.price();$('cbCanvas').style.display='block';$('cbInfo').textContent=`Tick ${this.tick}/10 · price $${p.toFixed(2)} · ${this.tokens.toFixed(2)} tokens · virtual cash $${this.cash.toFixed(2)} · value $${this.value().toFixed(2)}`;$('cbMsg').textContent='Virtual market · souvenirs at 100 / 140 / 180 · no real cash redemption';$('cbBtns').innerHTML='<button id="cbBuy">Buy with 10 virtual dollars</button><button id="cbSell">Sell 10 tokens</button><button id="cbHold">Hold → next tick</button>';for(const [id,k]of [['cbBuy','buy'],['cbSell','sell'],['cbHold','hold']])$(id).onclick=()=>{if(!CB.paused){this.act(k);save();}};$('cbBuy').disabled=this.cash<=0;$('cbSell').disabled=this.tokens<=0;},
  finish(){if(this.over)return;this.over=true;const final=this.value(),trophy=PPRules.trader(final);if(trophy)addSouvenir(trophy,'Token Trader · '+CB.attempt.id);this.tokens=0;this.cash=0;cbShowResults({score:final,payout:0,title:'Market closed',lines:[`Final virtual value: $${final.toFixed(2)}. Started with 100 tokens worth $100.`,trophy?`${trophy} souvenir earned. $0 resale.`:'No souvenir this time.','Tokens and virtual cash expire when the session ends. Entry $5; no cash payout.']});},
  draw(){const c=$('cbCanvas'),ctx=c.getContext('2d'),W=c.width,H=c.height;ppCabScene(ctx,W,H);PPArt.sprite(ctx,'furniture','arcade',W*.15,H*.94,W*.19,H*.65);const hs=this.history,mn=Math.min(.9,...hs)*.92,mx=Math.max(1.1,...hs)*1.08;ctx.fillStyle='#f0e6c6';ctx.fillRect(W*.29,H*.15,W*.6,H*.65);ctx.strokeStyle='#305a43';ctx.lineWidth=4;ctx.beginPath();hs.forEach((v,i)=>{const x=W*(.32+.53*i/10),y=H*(.74-.53*(v-mn)/(mx-mn));i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();PPArt.label(ctx,'Price history — '+this.tick+' / 10',W*.59,H*.91);}
});
Object.assign(window.__game,{CABS,CABGAMES,cabEnter,openArcade,wheelBucket,wheelEV,traderTicks,cbSetPaused,cbOpen});
