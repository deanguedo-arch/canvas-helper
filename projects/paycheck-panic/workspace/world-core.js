/* Shared geometry. All positions and footprints use world units, independent of pixels. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.PPWorld=api;})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const finite=(v,f=0)=>Number.isFinite(v)?v:f;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const directions=['e','se','s','sw','w','nw','n','ne'];
  function normalizeInput(x,y){x=finite(x);y=finite(y);const d=Math.hypot(x,y);return d>.15?{x:x/Math.max(1,d),y:y/Math.max(1,d)}:{x:0,y:0};}
  function direction(x,y,last='s'){return Math.hypot(x,y)<.15?last:directions[(Math.round(Math.atan2(y,x)/(Math.PI/4))+8)%8];}
  function circleRect(x,y,r,b){const dx=x-clamp(x,b.x,b.x+b.w),dy=y-clamp(y,b.y,b.y+b.h);return dx*dx+dy*dy<r*r-1e-7;}
  function resolve(p,r,rects,bounds){
    let x=clamp(p.x,bounds.x+r,bounds.x+bounds.w-r),y=clamp(p.y,bounds.y+r,bounds.y+bounds.h-r);
    for(let pass=0;pass<5;pass++){
      let changed=false;
      for(const b of rects){
        const nx=clamp(x,b.x,b.x+b.w),ny=clamp(y,b.y,b.y+b.h),dx=x-nx,dy=y-ny,d=Math.hypot(dx,dy);
        if(d>=r-1e-6)continue;
        if(d>1e-8){x=nx+dx/d*r;y=ny+dy/d*r;}
        else{
          const candidates=[{x:b.x-r,y},{x:b.x+b.w+r,y},{x,y:b.y-r},{x,y:b.y+b.h+r}].sort((a,c)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(c.x-x,c.y-y));
          const c=candidates.find(q=>q.x>=bounds.x+r&&q.x<=bounds.x+bounds.w-r&&q.y>=bounds.y+r&&q.y<=bounds.y+bounds.h-r&&!rects.some(o=>o!==b&&circleRect(q.x,q.y,r,o)))||candidates[0];x=c.x;y=c.y;
        }changed=true;
      }
      x=clamp(x,bounds.x+r,bounds.x+bounds.w-r);y=clamp(y,bounds.y+r,bounds.y+bounds.h-r);
      if(!changed)break;
    }return{x,y};
  }
  function moveCircle(body,delta,rects=[],bounds={x:0,y:0,w:2560,h:1600}){
    const r=Math.max(1,finite(body.r,12));let p=resolve({x:finite(body.x,bounds.x+r),y:finite(body.y,bounds.y+r)},r,rects,bounds);
    const dx=finite(delta.x),dy=finite(delta.y),steps=Math.min(256,Math.max(1,Math.ceil(Math.hypot(dx,dy)/(r*.45))));
    for(let i=0;i<steps;i++){p=resolve({x:p.x+dx/steps,y:p.y},r,rects,bounds);p=resolve({x:p.x,y:p.y+dy/steps},r,rects,bounds);}return p;
  }
  function segmentBlocked(a,b,rects,padding=0){
    return rects.some(r=>{let lo=0,hi=1;const dx=b.x-a.x,dy=b.y-a.y;const p=[-dx,dx,-dy,dy],q=[a.x-r.x+padding,r.x+r.w+padding-a.x,a.y-r.y+padding,r.y+r.h+padding-a.y];
      for(let i=0;i<4;i++){if(Math.abs(p[i])<1e-9){if(q[i]<0)return false;}else{const t=q[i]/p[i];if(p[i]<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return false;}}return true;});
  }
  function nearestInteraction(body,targets,rects){let best=null,dist=Infinity;for(const t of targets){const d=Math.hypot(body.x-t.x,body.y-t.y);if(d<(t.range||60)&&d<dist&&!segmentBlocked(body,t,rects,0)){best=t;dist=d;}}return best;}
  function pathfind(start,end,rects,bounds,cellSize=28,radius=12){
    const valid=p=>p.x>=bounds.x+radius&&p.y>=bounds.y+radius&&p.x<=bounds.x+bounds.w-radius&&p.y<=bounds.y+bounds.h-radius&&!rects.some(r=>circleRect(p.x,p.y,radius,r));
    if(!valid(end))return[];if(!segmentBlocked(start,end,rects,radius))return[{x:end.x,y:end.y}];
    const cell=p=>({x:Math.round((p.x-bounds.x)/cellSize),y:Math.round((p.y-bounds.y)/cellSize)}),point=c=>({x:bounds.x+c.x*cellSize,y:bounds.y+c.y*cellSize}),key=c=>c.x+','+c.y;
    const s=cell(start),e=cell(end),open=[{...s,g:0,f:0}],seen=new Map([[key(s),0]]),parents=new Map();let found=null,iterations=0;
    while(open.length&&iterations++<12000){open.sort((a,b)=>a.f-b.f);const cur=open.shift();if(cur.x===e.x&&cur.y===e.y){found=cur;break;}
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){if(!dx&&!dy)continue;const c={x:cur.x+dx,y:cur.y+dy},p=point(c);if(!valid(p)||segmentBlocked(point(cur),p,rects,radius))continue;
        const g=cur.g+Math.hypot(dx,dy),k=key(c);if(g>=(seen.get(k)??Infinity))continue;seen.set(k,g);parents.set(k,cur);open.push({...c,g,f:g+Math.hypot(c.x-e.x,c.y-e.y)});}}
    if(!found)return[];const result=[{x:end.x,y:end.y}];let cur=found;while(key(cur)!==key(s)){result.unshift(point(cur));cur=parents.get(key(cur));if(!cur)return[];}return result;
  }
  function separate(body,neighbors,rects,bounds,strength=1){let dx=0,dy=0;for(const n of neighbors){const d=Math.hypot(body.x-n.x,body.y-n.y),min=body.r+(n.r||12)+3;if(d<min){const s=(min-d)*strength;dx+=(d?(body.x-n.x)/d:1)*s;dy+=(d?(body.y-n.y)/d:0)*s;}}return moveCircle(body,{x:dx,y:dy},rects,bounds);}
  return{direction,normalizeInput,circleRect,moveCircle,segmentBlocked,nearestInteraction,pathfind,separate};
});
