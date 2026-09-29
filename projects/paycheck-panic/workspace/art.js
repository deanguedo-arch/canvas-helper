/* Illustrated cutout renderer. Limb transforms share one rig across directions. */
window.PPArt = (()=>{
  const images={},ready={};
  for(const [key,def] of Object.entries(PPAssets.sheets)){
    const im=new Image();images[key]=im;
    im.onload=()=>{ready[key]=true;if(!def.frames){def.frames=[];for(let y=0;y<def.rows;y++)for(let x=0;x<def.columns;x++)def.frames.push([x*im.width/def.columns,y*im.height/def.rows,im.width/def.columns,im.height/def.rows]);}window.dispatchEvent(new Event('pp-art-ready'));};
    im.src=def.src;
  }
  function sprite(ctx,sheet,frame,x,y,w,h,anchor=.5){
    const def=PPAssets.sheets[sheet],im=images[sheet];if(!def||!ready[sheet])return false;
    const f=def.frames[typeof frame==='string'?def.names.indexOf(frame):frame];if(!f)return false;
    const height=h||w*f[3]/f[2];ctx.drawImage(im,...f,x-w*anchor,y-height,w,height);return true;
  }
  function person(ctx,id,x,y,dir='s',phase=0,state='idle',height=88){
    const sheet=ready[id]?id:'alex',def=PPAssets.sheets[sheet];if(!ready[sheet])return;
    const idx=Math.max(0,PPAssets.directions.indexOf(dir)),f=def.frames[idx],im=images[sheet],w=height*f[2]/f[3],p=PPAssets.rig;
    const walking=state==='walk'||state==='carry',sw=walking?Math.sin(phase):0,breath=(window.PPScene?.reduced?0:Math.sin(phase*.3)*.4);
    const celebrate=state==='celebrate',interact=state==='interact',setback=state==='setback';
    ctx.save();ctx.translate(x,y);
    ctx.fillStyle='rgba(31,59,39,.20)';ctx.beginPath();ctx.ellipse(0,1,14,5,0,0,Math.PI*2);ctx.fill();
    if(def.mirror?.includes(idx))ctx.scale(-1,1);
    function part(name,angle=0,shift=0){
      const r=p[name],pivot=p.pivots[name],px=(pivot[0]-.5)*w,py=(pivot[1]-1)*height;
      ctx.save();ctx.translate(px,py+shift);ctx.rotate(angle);
      ctx.drawImage(im,f[0]+r[0]*f[2],f[1]+r[1]*f[3],r[2]*f[2],r[3]*f[3],(r[0]-pivot[0])*w,(r[1]-pivot[1])*height,r[2]*w,r[3]*height);ctx.restore();
    }
    const side=dir==='e'||dir==='w';
    part('leftLeg',sw*.22,Math.max(0,sw)*-1.5);part('rightLeg',-sw*.22,Math.max(0,-sw)*-1.5);
    part('torso',setback?.07:0,breath);
    part('leftArm',celebrate?1.05:interact?.6:state==='carry'?.3:-sw*.18,breath);
    part('rightArm',celebrate?-1.05:interact?-.5:state==='carry'?-.3:sw*.18,breath);
    part('head',setback?.09:0,breath);
    if(state==='carry')sprite(ctx,'props','parcel',0,-height*.20,height*.32,height*.29);
    ctx.restore();
  }
  function label(ctx,text,x,y,selected=false){ctx.save();ctx.font='bold 14px Trebuchet MS';ctx.textAlign='center';const width=ctx.measureText(text).width+24;ctx.fillStyle=selected?'#f0c75e':'#fff6df';ctx.strokeStyle='#315b42';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x-width/2,y-20,width,27,5);ctx.fill();ctx.stroke();ctx.fillStyle='#203e2e';ctx.fillText(text,x,y-2);ctx.restore();}
  return{images,ready,sprite,person,label};
})();
