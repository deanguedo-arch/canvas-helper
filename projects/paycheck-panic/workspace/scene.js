/* Canonical geometry and scene ownership. Feet positions are independent of art. */
window.PPScene = (()=>{
  const S={paused:false,debug:HITBOX_DEBUG,muted:false,reduced:REDUCED_MOTION,time:0,acc:0,last:0,zoom:1,ready:false};
  const bounds={x:0,y:0,w:2200,h:1280},roomBounds={x:45,y:270,w:810,h:330};
  const buildings=MAP_BUILDINGS.map((b,i)=>({...b,x:240+(i%5)*425,y:i<5?360:900,index:i,w:320,h:i===1?335:280}));
  const trees=[{x:75,y:625},{x:570,y:680},{x:990,y:680},{x:1420,y:660},{x:2050,y:650},{x:1520,y:1190},{x:1790,y:1190},{x:90,y:1145}];
  const townSolids=buildings.map(b=>({id:b.id,x:b.x-142,y:b.y-81,w:284,h:81})).concat(trees.map(t=>({x:t.x-13,y:t.y-14,w:26,h:22})),[{x:340,y:1090,w:730,h:110}]);
  const prop=(kind,x,y,w,h,depth=35)=>({kind,x,y,w,h,solid:{x:x-w*.43,y:y-depth,w:w*.86,h:depth}});
  const rooms={
    home:[prop('bed',200,355,185,166,65),prop('sofa',685,350,210,132,52),prop('desk',260,520,155,132),prop('plant',778,535,85,110,24)],
    grocery:[prop('shelf',240,320,180,154,42),prop('shelf',640,320,180,154,42),prop('produce',240,478,170,110,48),prop('produce',640,478,170,110,48),prop('checkout',450,275,190,104,45)],
    office:[prop('desk',235,330,200,130,50),prop('desk',645,330,200,130,50),prop('chair',242,393,70,82),prop('bookcase',755,520,120,160)],
    bank:[prop('teller',450,305,420,145,58),prop('plant',150,455,95,125),prop('sofa',740,478,175,115)],
    school:[prop('study',220,350,190,120,50),prop('study',655,350,190,120,50),prop('study',220,510,190,120,50),prop('bookcase',680,505,160,190)],
    gym:[prop('weights',230,350,220,137,58),prop('weights',650,350,220,137,58),prop('plant',725,535,90,118)],
    diner:[prop('booth',190,338,205,147,60),prop('booth',697,338,205,147,60),prop('table',220,507,165,130,55),prop('table',660,507,165,130,55)],
    mall:[prop('arcade',200,352,130,183,40),prop('arcade',450,352,130,183,40),prop('arcade',695,352,130,183,40),prop('plant',160,540,90,118)],
    dealer:[prop('desk',245,340,220,150,60),prop('sofa',660,360,220,135,50),prop('plant',740,535,90,118)],
    lucky:[prop('arcade',220,340,140,180,40),prop('arcade',450,340,140,180,40),prop('arcade',675,340,140,180,40),prop('booth',720,530,190,120,40)]
  };
  const primary={home:'openHome',office:'openOffice',grocery:'openGroceryChooser',bank:'openBank',school:'openSchool',gym:'openGym',diner:'openDiner',mall:'openMall',dealer:'openDealer',lucky:'openLucky'};
  const actionNames={home:'Rest & home',office:'Work desk',grocery:'Checkout & groceries',bank:'Bank counter',school:'Study',gym:'Train',diner:'Order & talk',mall:'Arcade & shops',dealer:'Transport',lucky:'Games & odds'};
  const targets=id=>[{x:450,y:id==='grocery'?342:405,label:actionNames[id],action:primary[id],range:75},{x:820,y:250,label:'Look around',action:'ex'+id[0].toUpperCase()+id.slice(1),range:68},{x:450,y:577,label:'Leave',action:'leave',range:50}];
  const solids=()=>screen==='town'?townSolids:(rooms[interiorId]||[]).map(p=>p.solid);
  const body=()=>screen==='town'?player:{x:iplayer.x*900,y:iplayer.y*620,r:12};
  function clearInput(){S.route=[];if(CB.game){CB.game._keyL=false;CB.game._keyR=false;}if(MG.game===mgRunner)mgRunner.touch=null;for(const k of Object.keys(keys))delete keys[k];joy.active=false;joy.dx=joy.dy=0;joy.id=null;if($('knob'))$('knob').style.transform='translate(0,0)';player.moving=iplayer.moving=false;}
  function busy(){return S.paused||document.hidden||G.over||MG.active||$('mgWrap').style.display==='flex'||CB.active||$('cbWrap').style.display==='flex'||modalOpen()||screen==='title';}
  S.exclusive=e=>{const k=e.key.toLowerCase();if((MG.active||CB.active)&&['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();if(k==='f2'){e.preventDefault();S.debug=!S.debug;return true;}if(k==='escape'&&(MG.active||CB.active||window.PPStats?.active)){S.togglePause();return true;}if(MG.active){keys[k]=true;return true;}return S.paused||CB.active||$('cbWrap').style.display==='flex'||window.PPStats?.active||$('mgWrap').style.display==='flex'||e.target.matches('input,textarea,select');};
  S.togglePause=()=>{S.paused=!S.paused;clearInput();if(CB.active)cbSetPaused(S.paused);$('pauseScreen').hidden=!S.paused;};
  function input(){return PPWorld.normalizeInput((keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+(joy.active?joy.dx:0),(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+(joy.active?joy.dy:0));}
  function view(){const c=$('game');return{x:cam.x,y:cam.y,w:c.width/S.zoom,h:c.height/S.zoom};}
  function camera(){const c=$('game');S.zoom=c.width<650?.82:1.05;cam.x=clamp(player.x-c.width/S.zoom/2,0,Math.max(0,bounds.w-c.width/S.zoom));cam.y=clamp(player.y-c.height/S.zoom*.52,0,Math.max(0,bounds.h-c.height/S.zoom));}
  function resetTown(){WORLD.w=bounds.w;WORLD.h=bounds.h;MAP_BUILDINGS.forEach((b,i)=>{const n=buildings[i];b.door=[n.x/WORLD.w,(n.y+24)/WORLD.h];b.rect=[(n.x-142)/WORLD.w,(n.y-81)/WORLD.h,(n.x+142)/WORLD.w,n.y/WORLD.h];});S.ready=true;}
  function step(dt){
    if(!S.ready)resetTown();if(busy()){player.moving=iplayer.moving=false;return;}S.time+=dt;
    let v=input();const b=body(),actor=screen==='town'?player:iplayer;
    if(v.x||v.y)S.route=[];
    else if(S.route?.length){const dest=S.route[0],dx=dest.x-b.x,dy=dest.y-b.y,d=Math.hypot(dx,dy);if(d<5)S.route.shift();else v={x:dx/d,y:dy/d};}
    actor.direction=PPWorld.direction(v.x,v.y,actor.direction||'s');actor.moving=!!(v.x||v.y);
    const speed=screen==='town'?205:185,p=PPWorld.moveCircle(b,{x:v.x*speed*dt,y:v.y*speed*dt},solids(),screen==='town'?bounds:roomBounds);
    if(screen==='town'){player.x=p.x;player.y=p.y;updatePeople(dt);camera();}else{iplayer.x=p.x/900;iplayer.y=p.y/620;}
    actor.walk+=actor.moving?dt*10.2:dt*.9;
    const target=screen==='town'?nearestBuilding():nearestHotspot();$('prompt').style.display=target&&screen==='town'?'block':'none';$('prompt').textContent=target?(screen==='town'?'Enter '+target.name:target.label)+' · E':'';
    $('btnAct').disabled=!target;positionHotspots();
  }
  function updatePeople(dt){
    for(const n of npcs){
      const end=n.toB?{x:n.bx,y:n.by}:{x:n.ax,y:n.ay};if(!n.route?.length){n.route=PPWorld.pathfind(n,end,townSolids,bounds,32,12);if(!n.route.length){n.toB=!n.toB;continue;}}
      const goal=n.route[0],dx=goal.x-n.x,dy=goal.y-n.y,d=Math.hypot(dx,dy);n.moving=d>2;n.direction=PPWorld.direction(dx,dy,n.direction||'s');
      if(d<5){n.route.shift();if(!n.route.length)n.toB=!n.toB;}else{const speed=Math.min(d,70*dt);Object.assign(n,PPWorld.moveCircle(n,{x:dx/d*speed,y:dy/d*speed},townSolids,bounds));}
      Object.assign(n,PPWorld.separate(n,[player,...npcs.filter(a=>a!==n)],townSolids,bounds,.13));n.walk+=dt*7;
    }
  }
  spawnNpcs=()=>{npcs.length=0;[['Taylor','maya',470,430,1320,990],['Casey','jay',1090,430,1720,990],['Morgan','sam',180,990,2010,990],['Jordan','classic',1960,430,930,990]].forEach(([name,char,ax,ay,bx,by])=>npcs.push({name,char,x:ax,y:ay,ax,ay,bx,by,toB:true,r:12,walk:0,direction:'s',route:[]}));};
  collide=(x,y)=>PPWorld.moveCircle({x,y,r:12},{x:0,y:0},townSolids,bounds);
  nearestBuilding=()=>{const t=PPWorld.nearestInteraction(player,buildings.map(b=>({...b,y:b.y+24,range:68})),townSolids);return t?MAP_BUILDINGS.find(b=>b.id===t.id):null;};
  nearestHotspot=()=>PPWorld.nearestInteraction(body(),targets(interiorId),solids());
  tryInteract=()=>{if(busy())return;const b=nearestBuilding();if(b)enterInterior(b);};
  activateHotspot=h=>{if(!h||busy())return;const valid=nearestHotspot();if(!valid||valid.action!==h.action){toast('Walk closer with a clear path.');return;}clearInput();if(h.action==='leave')leaveInterior();else MENU_FNS[h.action]?.();};
  enterInterior=b=>{if(MG.active||CB.active)return;clearInput();interiorReturn.x=player.x;interiorReturn.y=player.y;interiorId=b.id;screen='interior';iplayer.x=.5;iplayer.y=.87;iplayer.direction='n';iplayer.walk=0;eFresh=true;buildHotspots(b);sfx.door();if(!G.onboardDone&&G.onboardStarted&&G.onboard===0&&b.id===LANES[G.lane].workplace)advanceOnboarding(1);save();};
  leaveInterior=()=>{if(MG.active||CB.active)return;clearInput();screen='town';interiorId=null;const p=collide(interiorReturn.x,interiorReturn.y+24);Object.assign(player,p);player.direction='s';$('hotspots').style.display='none';$('hotspots').innerHTML='';camera();save();};
  interiorRect=()=>{const c=$('game'),top=$('hud').getBoundingClientRect().height+28,bottom=c.width<650?155:55,available=Math.max(220,c.height-top-bottom),phone=c.width<650,s=phone?Math.max(c.width/900,available/620):Math.min(c.width/900,available/620),w=900*s,h=620*s;return{x:phone?clamp(c.width/2-iplayer.x*w,Math.min(0,c.width-w),0):(c.width-w)/2,y:top+(available-h)/2,w,h,top,bottom:c.height-bottom};};
  buildHotspots=()=>{$('hotspots').innerHTML='';for(const h of targets(interiorId)){const el=document.createElement('button');el.className='hotspot';el.textContent=h.label+' · E';el.dataset.action=h.action;el.style.left=h.x/9+'%';el.style.top=h.y/6.2+'%';el.onclick=()=>activateHotspot(h);$('hotspots').appendChild(el);}positionHotspots();};
  positionHotspots=()=>{if(screen!=='interior')return;const r=interiorRect(),box=$('hotspots'),near=nearestHotspot();Object.assign(box.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px',display:busy()?'none':'block'});for(const el of box.children){const current=near?.action===el.dataset.action;el.style.opacity=current?'1':'.72';el.disabled=!current;el.hidden=!current;}};
  const oldOpen=openModal,oldClose=closeModal;openModal=(html,locked)=>{clearInput();oldOpen(html,locked);};closeModal=()=>{clearInput();oldClose();};
  function ground(ctx){
    ctx.fillStyle='#91b97b';ctx.fillRect(0,0,bounds.w,bounds.h);
    if(PPArt.ready.ground){for(let y=0;y<bounds.h;y+=640)for(let x=0;x<bounds.w;x+=960)ctx.drawImage(PPArt.images.ground,x,y,960,640);}
    ctx.fillStyle='#e4d6b9';for(const y of [390,930])ctx.fillRect(0,y,bounds.w,125);for(const x of [20,410,835,1260,1685,2130])ctx.fillRect(x,275,62,800);
    ctx.fillStyle='#74817a';for(const y of [467,1007])ctx.fillRect(0,y,bounds.w,57);
    ctx.strokeStyle='#eedfbb';ctx.lineWidth=3;ctx.setLineDash([25,25]);for(const y of [495,1035]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(bounds.w,y);ctx.stroke();}ctx.setLineDash([]);
    ctx.fillStyle='#6398a3';ctx.beginPath();ctx.roundRect(340,1090,730,110,25);ctx.fill();ctx.strokeStyle='#d4dfb3';ctx.lineWidth=10;ctx.stroke();
    for(const b of buildings){ctx.fillStyle='#e7dbbf';ctx.fillRect(b.x-55,b.y-10,110,105);ctx.fillStyle='#c1b293';for(let y=b.y+5;y<390+(b.index<5?0:540);y+=20)ctx.fillRect(b.x-54,y,108,2);}
  }
  function actor(ctx,a,id,height=88){PPArt.person(ctx,id,a.x,a.y,a.direction||'s',a.walk,a.poseUntil>S.time?a.pose:(a.moving?'walk':'idle'),height);}
  function debug(ctx,rects,actors,interactions){if(!S.debug)return;ctx.save();ctx.lineWidth=2;ctx.strokeStyle='#eb2251';rects.forEach(r=>ctx.strokeRect(r.x,r.y,r.w,r.h));ctx.strokeStyle='#09eef3';actors.forEach(a=>{ctx.beginPath();ctx.arc(a.x,a.y,a.r||12,0,Math.PI*2);ctx.stroke();if(a.route?.length){ctx.beginPath();ctx.moveTo(a.x,a.y);a.route.forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();}});ctx.strokeStyle='#eeaa21';interactions.forEach(t=>{ctx.beginPath();ctx.arc(t.x,t.y,t.range||60,0,Math.PI*2);ctx.stroke();});ctx.restore();}
  renderTown=ctx=>{
    ground(ctx);const objects=[...buildings.map(b=>({y:b.y,draw:()=>{PPArt.sprite(ctx,'town',b.index,b.x,b.y,b.w,b.h);PPArt.label(ctx,b.name,b.x,b.y+45,nearestBuilding()?.id===b.id);}})),...trees.map(t=>({y:t.y,draw:()=>PPArt.sprite(ctx,'town','tree',t.x,t.y,170,200)})),...npcs.map(n=>({y:n.y,draw:()=>actor(ctx,n,n.char,84)})),{y:player.y,draw:()=>actor(ctx,player,G.char)}];objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());debug(ctx,townSolids,[player,...npcs],buildings.map(b=>({x:b.x,y:b.y+24,range:68})));
  };
  renderInterior=(ctx,c)=>{
    ctx.fillStyle='#213e30';ctx.fillRect(0,0,c.width,c.height);const r=interiorRect();ctx.save();ctx.beginPath();ctx.rect(0,r.top,c.width,r.bottom-r.top);ctx.clip();ctx.translate(r.x,r.y);ctx.scale(r.w/900,r.h/620);
    const background=PPAssets.sheets.roomsA.names.includes(interiorId)?'roomsA':'roomsB';
    if(!PPArt.sprite(ctx,background,interiorId,450,620,900,620)){ctx.fillStyle='#ecddba';ctx.fillRect(0,0,900,620);}
    ctx.fillStyle='#536d45';ctx.fillRect(415,574,70,46);ctx.strokeStyle='#c1b376';ctx.lineWidth=3;ctx.strokeRect(419,579,62,37);PPArt.label(ctx,MAP_BUILDINGS.find(b=>b.id===interiorId)?.name||'',450,30);
    const p={...iplayer,x:iplayer.x*900,y:iplayer.y*620,r:12};const objects=(rooms[interiorId]||[]).map(o=>({y:o.y,draw:()=>PPArt.sprite(ctx,'furniture',o.kind,o.x,o.y,o.w,o.h)}));objects.push({y:p.y,draw:()=>actor(ctx,p,G.char,140)});objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    for(const t of targets(interiorId)){ctx.strokeStyle='#bb9b48';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(t.x,t.y,16,6,0,0,Math.PI*2);ctx.stroke();}
    debug(ctx,solids(),[p],targets(interiorId));ctx.restore();
  };
  render=()=>{$('joy').hidden=$('btnAct').hidden=busy();const c=$('game'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);if(screen==='interior')renderInterior(ctx,c);else{ctx.save();ctx.scale(S.zoom,S.zoom);ctx.translate(-cam.x,-cam.y);renderTown(ctx,c);ctx.restore();}if(S.debug){ctx.fillStyle='#132d20';ctx.fillRect(8,c.height-31,290,23);ctx.fillStyle='#fff';ctx.font='12px monospace';ctx.fillText('F2 · feet / solids / reach / NPC routes',15,c.height-15);}};
  loop=ts=>{requestAnimationFrame(loop);if(!S.last)S.last=ts;S.acc+=Math.min(.1,(ts-S.last)/1000);S.last=ts;let i=0;while(S.acc>=1/60&&i++<6){step(1/60);S.acc-=1/60;}render();};
  update=()=>step(1/60);
  window.addEventListener('blur',()=>{clearInput();if(screen!=='title'&&!S.paused)S.togglePause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(screen!=='title'&&!S.paused)S.togglePause();}});
  window.addEventListener('touchcancel',clearInput);window.addEventListener('pointercancel',clearInput);
  const toolbar=document.createElement('nav');toolbar.id='worldTools';toolbar.setAttribute('aria-label','Game controls');toolbar.innerHTML='<button id="ppPause" aria-label="Pause game">Pause</button><button id="ppSound" aria-pressed="false">Sound on</button><button id="ppMotion" aria-pressed="false">Motion on</button><span id="saveStatus" role="status">Ready</span>';document.body.appendChild(toolbar);
  const pause=document.createElement('section');pause.id='pauseScreen';pause.hidden=true;pause.innerHTML='<div><h2>Paused</h2><p>Your campaign stays here.</p><button id="ppResume">Resume</button><button id="ppTitle">Save & return to title</button></div>';document.body.appendChild(pause);
  $('ppPause').onclick=S.togglePause;$('ppResume').onclick=S.togglePause;$('ppSound').onclick=()=>{S.muted=!S.muted;AC?.suspend();if(!S.muted)AC?.resume();$('ppSound').textContent=S.muted?'Sound off':'Sound on';$('ppSound').setAttribute('aria-pressed',String(S.muted));};
  $('ppMotion').onclick=()=>{S.reduced=REDUCED_MOTION=!S.reduced;document.body.classList.toggle('reduced-motion',S.reduced);$('ppMotion').textContent=S.reduced?'Reduced motion':'Motion on';$('ppMotion').setAttribute('aria-pressed',String(S.reduced));};
  $('ppTitle').onclick=()=>{save();S.paused=false;pause.hidden=true;screen='title';$('title').style.display='flex';$('hud').style.display='none';$('mgWrap').style.display='none';$('cbWrap').style.display='none';$('btnContinue').style.display='inline-block';};
  function walkTo(x,y){if(busy())return;S.route=PPWorld.pathfind(body(),{x,y},solids(),screen==='town'?bounds:roomBounds,22,12);if(!S.route.length)toast('Choose a clear spot on the floor.');}
  const mapButton=document.createElement('button');mapButton.textContent='Locations';mapButton.id='ppLocations';toolbar.prepend(mapButton);
  mapButton.onclick=()=>{if(MG.active||CB.active||screen==='title')return;showMenu('Around town','Choose a destination to walk there. Arrows, WASD, or the stick take over immediately.',buildings.map(b=>({label:b.name,fn:()=>{closeModal();if(screen==='interior')leaveInterior();walkTo(b.x,b.y+24);}})));};
  $('game').addEventListener('pointerdown',e=>{if(busy())return;let x,y;if(screen==='town'){x=e.clientX/S.zoom+cam.x;y=e.clientY/S.zoom+cam.y;}else{const r=interiorRect();x=(e.clientX-r.x)*900/r.w;y=(e.clientY-r.y)*620/r.h;}walkTo(x,y);});
  const stick=$('joy');stick.setAttribute('role','group');stick.setAttribute('aria-label','Movement stick');
  stick.addEventListener('touchstart',e=>{e.preventDefault();e.stopImmediatePropagation();},{capture:true,passive:false});
  function pointStick(e){const r=stick.getBoundingClientRect(),v=PPWorld.normalizeInput((e.clientX-r.left-r.width/2)/(r.width*.36),(e.clientY-r.top-r.height/2)/(r.height*.36));joy.dx=v.x;joy.dy=v.y;$('knob').style.transform=`translate(${v.x*36}px,${v.y*36}px)`;}
  stick.onpointerdown=e=>{if(busy())return;e.preventDefault();clearInput();joy.active=true;joy.id=e.pointerId;stick.setPointerCapture(e.pointerId);pointStick(e);};stick.onpointermove=e=>{if(joy.active&&joy.id===e.pointerId)pointStick(e);};stick.onpointerup=stick.onpointercancel=clearInput;
  $('btnAct').addEventListener('touchstart',e=>{e.preventDefault();e.stopImmediatePropagation();},{capture:true,passive:false});$('btnAct').onpointerup=e=>{e.preventDefault();if(screen==='town')tryInteract();else if(screen==='interior')activateHotspot(nearestHotspot());};
  Object.assign(S,{bounds,roomBounds,buildings,rooms,townSolids,targets,solids,body,clearInput,busy,step,resetTown,camera,pose:(name)=>{const a=screen==='town'?player:iplayer;a.pose=name;a.poseUntil=S.time+1.2;}});
  resetTown();spawnNpcs();Object.defineProperty(window.__game,'G',{get:()=>G,set:v=>{G=v;},configurable:true});Object.assign(window.__game,{scene:S,player,iplayer,getScreen:()=>screen,getInterior:()=>interiorId,enterInterior,leaveInterior,render,step:S.step});
  return S;
})();
