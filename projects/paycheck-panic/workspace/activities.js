/* Illustrated activity presentation; score geometry lives beside its rendering. */
const PPCheckout={scanner:.30,window:3.2,spacing:.18};
Object.assign(mgChaos,{
  init(){this.items=[];this.spawnT=.2;this.speed=1;this.strikes=0;this.misses=0;this.scanned=[];this.reaction=0;this._btnSync=null;mgEl('mgMsg').textContent='Let the front grocery reach the scanner, then choose its price. Keys 1–4 or tap.';mgEl('mgBtns').className='four';this.setButtons(null);},
  misc(){const left=3-this.strikes;mgEl('mgMisc').textContent=`${left} ${left===1?'chance':'chances'} · ${MG.correct} bagged`;},
  onMiss(reason){this.strikes++;this.reaction=-1;this.reactionT=1;MG.popup(reason==="wrong price"?'Check the price tag':'Item timed out','#f1a17a');if(this.strikes>=3)MG.finish(true);},
  frontItem(){return this.items.find(it=>!it.answered)||null;},
  setButtons(item){
    const box=mgEl('mgBtns');box.innerHTML='';(item?item.opts:['—','—','—','—']).forEach((o,i)=>{const b=document.createElement('button');b.textContent=o==='—'?'Waiting…':`${i+1} · $${o}`;b.disabled=!item||!item.atScanner;b.dataset.testid='scan-price-'+(i+1);b.onclick=()=>{if(MG.active&&!MG.over&&!PPScene.paused)this.answer(o);};box.appendChild(b);});
  },
  answer(o){const it=this.frontItem();if(!it?.atScanner||MG.over||PPScene.paused)return;if(o===it.price){it.answered=true;mgAddScore(100);MG.popup('Scanned · +100','#a9df9f');this.scanned.push({...it,flight:0});this.items.shift();this.reaction=1;this.reactionT=1;this.setButtons(null);}else mgMiss('wrong price');if(window.PPCampaign)PPCampaign.checkpoint();},
  update(dt){
    if(this.reactionT>0)this.reactionT-=dt;else this.reaction=0;
    this.spawnT-=dt;if(this.spawnT<=0&&this.items.length<4){const it=this.pickItem();it.product=CHAOS_PRICES.findIndex(([e])=>e===it.e);it.pos=Math.max(1.06,(this.items.at(-1)?.pos||.87)+PPCheckout.spacing);it.wait=PPCheckout.window/Math.sqrt(this.speed);this.items.push(it);this.spawnT=1.8;}
    for(let i=0;i<this.items.length;i++){const it=this.items[i],stop=PPCheckout.scanner+i*PPCheckout.spacing;it.pos=Math.max(stop,it.pos-dt*.19*this.speed);if(i===0){it.atScanner=it.pos<=PPCheckout.scanner+.001;if(it.atScanner){it.wait-=dt;if(it.wait<=0){this.items.shift();this.misses++;mgMiss('missed item');if(MG.over)return;}}}}
    this.scanned.forEach(it=>it.flight+=dt);this.scanned=this.scanned.filter(it=>it.flight<.85);
    const f=this.frontItem(),sync=f?f.price+':'+f.atScanner:'none';if(sync!==this._btnSync){this._btnSync=sync;this.setButtons(f);}
  },
  draw(ctx,W,H){
    const belt=H*.66,scanner=W*PPCheckout.scanner,unit=Math.min(88,W*.15,H*.21),f=this.frontItem();
    PPArt.sprite(ctx,'checkout',0,W/2,H,W,H);
    PPArt.person(ctx,'maya',W*.16,H*.57,'se',MG.t*5,this.reaction>0?'celebrate':this.reaction<0?'setback':'idle',Math.min(230,H*.46));
    PPArt.label(ctx,this.reaction>0?'Thank you!':this.reaction<0?'Try the tag':'Next, please',W*.16,H*.13);
    ctx.strokeStyle='rgba(193,218,179,.12)';ctx.lineWidth=1;for(let x=W*.32-(MG.t*85)%28;x<W*.985;x+=28){ctx.beginPath();ctx.moveTo(x,H*.617);ctx.lineTo(x,H*.722);ctx.stroke();}
    // The outline and the scoring rule use exactly the same scanner center.
    ctx.fillStyle=f?.atScanner?'#93ccad':'#d0ddd1';ctx.strokeStyle='#315a44';ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(scanner-unit*.6,belt-unit*.65,unit*1.2,unit*1.35,8);ctx.fill();ctx.stroke();
    ctx.fillStyle='#337e5b';ctx.fillRect(scanner-unit*.55,belt+unit*.60,unit*1.1*Math.max(0,(f?.wait||0)/(PPCheckout.window/Math.sqrt(this.speed))),5);
    PPArt.sprite(ctx,'furniture','bag',W*.12,H*.78,unit*1.4,unit*1.8);
    for(const it of this.items){const x=it.pos*W;PPArt.sprite(ctx,'groceries',it.product,x,belt+unit*.40,unit,unit);PPArt.label(ctx,'$'+it.price,x,belt-unit*.70,it===f&&it.atScanner);}
    for(const it of this.scanned){const p=Math.min(1,it.flight/.85),x=scanner+(W*.12-scanner)*p,y=belt+unit*.40+(H*.67-belt)*p-Math.sin(p*Math.PI)*unit;ctx.save();ctx.globalAlpha=1-p*.4;PPArt.sprite(ctx,'groceries',it.product,x,y,unit*.85,unit*.85);ctx.restore();}
    PPArt.label(ctx,f?.atScanner?'In scanner — choose the price':'Conveyor → scanner → bag',W*.63,H*.94);
    if(PPScene.debug){ctx.strokeStyle='#f0206a';ctx.strokeRect(scanner-unit*.6,belt-unit*.65,unit*1.2,unit*1.35);}
  }
});
window.addEventListener('keydown',e=>{if(MG.active&&MG.kind==='chaos'&&!e.repeat&&/^[1-4]$/.test(e.key)){e.preventDefault();const it=mgChaos.frontItem();if(it)mgChaos.answer(it.opts[Number(e.key)-1]);}});
const ppTrainStat=trainStat;trainStat=function(...args){const earned=ppTrainStat(...args);if(earned)PPScene.pose('celebrate');return earned;};
const ppMGStart=mgStart;mgStart=function(kind){PPScene.clearInput();mgEl('mgTop').style.display='flex';ppMGStart(kind);};
const ppMGStop=mgStop;mgStop=function(){PPScene.clearInput();ppMGStop();};

Object.assign(mgBlitz,{
  init(){this.missed=[];this.lastIdx=-1;this.feedback=null;this.next();mgEl('mgMsg').textContent='Choose a response, then read the explanation. The shift clock pauses for feedback.';},
  render(){mgEl('mgCanvas').style.display='block';const box=mgEl('mgCard');box.style.display='block';box.className='';box.innerHTML=`<div>${this.card.q}</div><div class="ctimer"><div id="blitzBar"></div></div>`;const btns=mgEl('mgBtns');btns.innerHTML='';btns.className='two';
    if(this.feedback){box.innerHTML+=`<p class="activity-feedback ${this.feedback.ok?'good':'miss'}"><b>${this.feedback.label}</b> ${this.card.lesson}</p>`;const b=document.createElement('button');b.textContent='Next request';b.onclick=()=>{this.feedback=null;this.next();save();};btns.appendChild(b);}
    else this.card.opts.forEach(([label,ok],i)=>{const b=document.createElement('button');b.textContent=(i+1)+' · '+label;b.onclick=()=>this.answer(ok);btns.appendChild(b);});
  },
  answer(ok,expired=false){if(!MG.active||MG.over||this.feedback||PPScene.paused)return;if(ok)mgAddScore(100);else{this.missed.push(this.card);mgMiss(expired?'timed out':'bad call');}this.feedback={ok,label:expired?'Timed out.':ok?'Handled well.':'Try a different approach.'};this.render();save();},
  update(dt){if(this.feedback){MG.timeLeft+=dt;return;}this.cardT-=dt;const bar=$('blitzBar');if(bar)bar.style.width=Math.max(0,this.cardT/this.cardMax*100)+'%';if(this.cardT<=0)this.answer(false,true);},
  draw(ctx,W,H){PPArt.sprite(ctx,'roomsA','office',W/2,H,W,H);PPArt.person(ctx,'sam',W*.74,H*.95,'sw',MG.t,this.feedback?.ok?'celebrate':'idle',H*.75);PPArt.person(ctx,G.char,W*.25,H*.95,'se',MG.t,this.feedback&&!this.feedback.ok?'setback':'interact',H*.73);PPArt.sprite(ctx,'furniture','desk',W*.44,H*1.12,W*.38,H*.70);ppProp(ctx,'papers',W*.40,H*.58,W*.14,H*.23);PPArt.label(ctx,this.feedback?.label||'Incoming request',W*.5,H*.15);},
  misc(){mgEl('mgMisc').textContent='Stress '+Math.round(G.stress);}
});
window.addEventListener('keydown',e=>{if(MG.active&&MG.kind==='blitz'&&!e.repeat&&/^[12]$/.test(e.key)&&!mgBlitz.feedback)mgBlitz.answer(mgBlitz.card.opts[+e.key-1][1]);});
Object.assign(mgRunner,{
  init(){this.px=96;this.py=300;this.vx=this.vy=0;this.hd=-Math.PI/2;this.fuel=100;this.orders=[];this.cars=[{x:150,y:192,vx:95},{x:650,y:408,vx:-110},{x:350,y:192,vx:85}];this.cans=[];this.tips=0;this.deliveries=0;this.heatSum=0;this.crashes=0;this.stun=0;this.spawnT=.5;this.canT=8;this.carrying=null;this.touch=null;this.dropped=null;
    mgEl('mgMsg').textContent='Pick up a parcel at the diner. Deliver to the numbered house while it is hot. Arrows/WASD or drag; collect red fuel cans.';const c=$('mgCanvas'),point=e=>{const r=c.getBoundingClientRect(),v=this.viewport(c.width,c.height),x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;return{x:clamp((x-v.x)/v.scale,18,782),y:clamp((y-v.y)/v.scale,22,578)};};c.onpointerdown=e=>{c.setPointerCapture(e.pointerId);this.touch=point(e);};c.onpointermove=e=>{if(this.touch)this.touch=point(e);};c.onpointerup=c.onpointercancel=()=>{this.touch=null;};
  },
  viewport(W,H){const scale=Math.min(W/800,H/600);return{scale,x:(W-800*scale)/2,y:(H-600*scale)/2};},
  P:(x,y)=>({x:x*800,y:y*600}),
  misc(){mgEl('mgMisc').textContent=`Tips ${fmt$(this.tips)} · Fuel ${Math.round(this.fuel)}%`;},
  playerBox(){const a=this.hd+Math.PI/2,w=27*Math.abs(Math.cos(a))+35*Math.abs(Math.sin(a)),h=27*Math.abs(Math.sin(a))+35*Math.abs(Math.cos(a));return{x:this.px-w/2,y:this.py-h/2,w,h};},
  carBox(car){return{x:car.x-27,y:car.y-14,w:54,h:28};},
  update(dt){
    this.stun=Math.max(0,this.stun-dt);if(!this.stun){let ax=(keys.arrowright||keys.d?1:0)-(keys.arrowleft||keys.a?1:0),ay=(keys.arrowdown||keys.s?1:0)-(keys.arrowup||keys.w?1:0);if(this.touch){const x=this.touch.x-this.px,y=this.touch.y-this.py,d=Math.hypot(x,y);ax=d>8?x/d:0;ay=d>8?y/d:0;}
      const v=PPWorld.normalizeInput(ax,ay),speed=(this.fuel<=0?45:this.fuel<20?105:175);this.vx=v.x*speed;this.vy=v.y*speed;if(v.x||v.y){this.hd=Math.atan2(v.y,v.x);this.fuel=Math.max(0,this.fuel-dt*1.1);}this.px=clamp(this.px+this.vx*dt,18,782);this.py=clamp(this.py+this.vy*dt,22,578);
    }
    this.spawnT-=dt;if(this.spawnT<=0){this.spawnOrder();this.spawnT=Math.max(5,13-MG.wave*2);}
    const dnr=this.P(...this.diner);for(let i=this.orders.length-1;i>=0;i--){const o=this.orders[i];if(o.state==='carrying')o.heat-=dt/45;
      if(o.heat<=0){this.orders.splice(i,1);this.carrying=null;mgMiss('Parcel went cold');continue;}
      if(o.state==='ready'&&!this.carrying&&Math.hypot(this.px-dnr.x,this.py-dnr.y)<42){o.state='carrying';this.carrying=o;MG.popup('Parcel collected','#baddb4');}
      if(o.state==='carrying'){const h=this.P(...this.houses[o.house]);if(Math.hypot(this.px-h.x,this.py-h.y)<38){const tip=this.tipFor(o.heat);this.tips+=tip;this.deliveries++;this.heatSum+=o.heat;this.orders.splice(i,1);this.carrying=null;mgAddScore(150);MG.popup('Delivered · +'+fmt$(tip),'#e9ca72');}}
    }
    for(const car of this.cars){car.x+=car.vx*dt*(1+MG.wave*.10);if(car.x<-30)car.x=830;if(car.x>830)car.x=-30;if(this.stun<=0&&PPRules.overlap(this.playerBox(),this.carBox(car))){this.stun=1.7;this.crashes++;this.dropped={x:this.px,y:this.py,t:1.2};if(this.carrying){this.orders=this.orders.filter(o=>o.state!=='carrying');this.carrying=null;}mgMiss('Traffic impact — parcel lost');MG.popup('Recovering','#e79b7b');}}
    this.canT-=dt;if(this.canT<=0&&this.cans.length<2){this.cans.push({x:60+Math.random()*680,y:70+Math.random()*460});this.canT=16;}
    this.cans=this.cans.filter(f=>{if(Math.hypot(this.px-f.x,this.py-f.y)<29){this.fuel=Math.min(100,this.fuel+40);MG.popup('Fuel +40','#aeddaa');return false;}return true;});if(this.dropped){this.dropped.t-=dt;if(this.dropped.t<=0)this.dropped=null;}this.misc();
  },
  draw(ctx,W,H){ctx.fillStyle='#203f30';ctx.fillRect(0,0,W,H);const v=this.viewport(W,H);ctx.save();ctx.translate(v.x,v.y);ctx.scale(v.scale,v.scale);ctx.fillStyle='#9eaf7d';ctx.fillRect(0,0,800,600);if(PPArt.ready.ground)ctx.drawImage(PPArt.images.ground,0,0,800,600);ctx.fillStyle='#e4d7b6';ctx.fillRect(0,142,800,100);ctx.fillRect(0,358,800,100);ctx.fillStyle='#758178';ctx.fillRect(0,164,800,56);ctx.fillRect(0,380,800,56);ctx.strokeStyle='#ecd9a1';ctx.lineWidth=2;ctx.setLineDash([20,16]);for(const y of [192,408]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(800,y);ctx.stroke();}ctx.setLineDash([]);
    for(const [i,h]of this.houses.entries()){const p=this.P(...h),target=this.carrying?.house===i;PPArt.sprite(ctx,'town','home',p.x,p.y+5,90,85);PPArt.label(ctx,'H'+(i+1),p.x,p.y+32,target);if(target){ctx.strokeStyle='#d19422';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(p.x,p.y,38,18,0,0,Math.PI*2);ctx.stroke();}}
    const d=this.P(...this.diner);PPArt.sprite(ctx,'town','diner',d.x,d.y,110,75);PPArt.label(ctx,'Pick up',d.x,d.y+32);
    for(const f of this.cans)ppProp(ctx,'fuel',f.x,f.y,27,33);for(const car of this.cars){ppProp(ctx,'traffic',car.x,car.y,28,54,car.vx>0?Math.PI/2:-Math.PI/2);if(PPScene.debug){const b=this.carBox(car);ctx.strokeStyle='#e52767';ctx.strokeRect(b.x,b.y,b.w,b.h);}}
    const p=this.playerBox();ppProp(ctx,'scooter',this.px,this.py,27,35,this.hd+Math.PI/2);if(this.carrying){ppProp(ctx,'food',this.px-17,this.py+19,20,22);ctx.fillStyle='#294633';ctx.fillRect(this.px-25,this.py-29,50,5);ctx.fillStyle='#f0bd62';ctx.fillRect(this.px-25,this.py-29,50*this.carrying.heat,5);}if(this.dropped){ctx.save();ctx.globalAlpha=this.dropped.t/1.2;ppProp(ctx,'food',this.dropped.x+22,this.dropped.y+24,30,30,.6);ctx.restore();}if(this.stun>0)PPArt.label(ctx,'Recovering',this.px,this.py-35);if(PPScene.debug){ctx.strokeStyle='#20eee1';ctx.strokeRect(p.x,p.y,p.w,p.h);}ctx.restore();
  }
});
