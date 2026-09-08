// YouTube IFrame API contract: https://developers.google.com/youtube/iframe_api_reference
// The API supplies its native controls. Never autoplay, score elapsed time or
// mistake cross-origin iframe load for successful video playback.
type Player={cueVideoById(options:{videoId:string;startSeconds:number;endSeconds:number}):void;pauseVideo():void;destroy():void;getIframe():HTMLIFrameElement};
type Api={Player:new(host:HTMLElement,options:{host:string;videoId:string;playerVars:Record<string,string|number>;events:{onReady:(event:{target:Player})=>void;onError:()=>void}})=>Player};
type ProviderWindow=Window&{YT?:Api;onYouTubeIframeAPIReady?:()=>void};
let pending:Promise<Api>|undefined;
export function loadTopicYouTubeApi():Promise<Api> {
 const win=window as ProviderWindow;if(win.YT?.Player)return Promise.resolve(win.YT);if(pending)return pending;
 pending=new Promise<Api>((resolve,reject)=>{
  const prior=win.onYouTubeIframeAPIReady,script=document.createElement('script');let timer:ReturnType<typeof setTimeout>;let done=false;
  const finish=(error?:Error)=>{if(done)return;done=true;clearTimeout(timer);script.onerror=null;if(win.onYouTubeIframeAPIReady===ready)win.onYouTubeIframeAPIReady=prior;if(error){script.remove();reject(error);}else resolve(win.YT!);};
  const ready=()=>{try{prior?.();}finally{finish(win.YT?.Player?undefined:new Error('Provider API did not initialize'));}};
  win.onYouTubeIframeAPIReady=ready;script.src='https://www.youtube.com/iframe_api';script.async=true;script.onerror=()=>finish(new Error('Provider API is unavailable'));timer=setTimeout(()=>finish(new Error('Provider API timed out')),12000);document.head.append(script);
 }).catch(error=>{pending=undefined;throw error;});return pending;
}
export function mountTopicMedia(root:HTMLElement,loadApi:()=>Promise<Api>=loadTopicYouTubeApi) {
 const items=[...root.querySelectorAll<HTMLElement>('[data-pilot2-video]')];let disposed=false;
 const records=items.map(item=>({item,player:null as Player|null,loading:false,failed:false,timer:null as ReturnType<typeof setTimeout>|null}));
 const visible=(item:HTMLElement)=>{const box=item.getBoundingClientRect();return box.width>0&&box.height>0&&box.bottom>0&&box.top<innerHeight&&!item.closest('[hidden]');};
 const fallback=(record:typeof records[number],message:string)=>{if(disposed)return;record.failed=true;if(record.timer)clearTimeout(record.timer);record.item.querySelector<HTMLElement>('[data-pilot2-video-host]')!.hidden=true;try{record.player?.destroy();}catch{}record.player=null;record.item.querySelector<HTMLDetailsElement>('[data-pilot2-video-local]')!.open=true;record.item.querySelector<HTMLElement>('[data-pilot2-video-status]')!.textContent=message;};
 const refresh=()=>{for(const record of records){
  if(!visible(record.item)){try{record.player?.pauseVideo();}catch{}continue;}
  if(record.loading||record.player||record.failed)continue;
  if(!navigator.onLine){fallback(record,'You are offline. The illustrated local path is available below.');continue;}
  record.loading=true;
  void loadApi().then(api=>{
   if(disposed||!visible(record.item)){record.loading=false;return;}
   const videoId=record.item.dataset.pilot2Video!,startSeconds=Number(record.item.dataset.pilot2VideoStart),endSeconds=Number(record.item.dataset.pilot2VideoEnd);
   if(!/^[a-zA-Z0-9_-]{11}$/.test(videoId)||!Number.isInteger(startSeconds)||!Number.isInteger(endSeconds)||startSeconds<0||endSeconds<=startSeconds)throw new Error('Invalid reviewed video segment');
   const host=record.item.querySelector<HTMLElement>('[data-pilot2-video-host]')!,slot=document.createElement('div');host.append(slot);
   record.timer=setTimeout(()=>fallback(record,'The provider has not responded. Use the illustrated local path below.'),12000);
   record.player=new api.Player(slot,{host:'https://www.youtube-nocookie.com',videoId,playerVars:{autoplay:0,playsinline:1,rel:0,cc_load_policy:1,...(location.origin==='null'?{}:{origin:location.origin})},events:{
    onReady:({target})=>{if(disposed||record.failed)return;if(record.timer)clearTimeout(record.timer);target.getIframe().title=record.item.querySelector('h3')!.textContent!;target.cueVideoById({videoId,startSeconds,endSeconds});if(!visible(record.item))target.pauseVideo();if(!record.failed)record.item.querySelector<HTMLElement>('[data-pilot2-video-status]')!.textContent='Use the player’s controls, or open the illustrated local path.';},
    onError:()=>fallback(record,'This video is unavailable here. Use the illustrated local path below.')
   }});
  }).catch(()=>fallback(record,'The provider could not load. Use the illustrated local path below.'));
 }};
 const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(refresh);
 records.forEach(record=>observer?.observe(record.item));
 const offline=()=>records.filter(record=>visible(record.item)).forEach(record=>fallback(record,'You are offline. The illustrated local path is available below.'));
 window.addEventListener('hashchange',refresh);window.addEventListener('offline',offline);window.addEventListener('scroll',refresh,{passive:true});refresh();
 return{dispose(){disposed=true;observer?.disconnect();window.removeEventListener('hashchange',refresh);window.removeEventListener('offline',offline);window.removeEventListener('scroll',refresh);records.forEach(record=>{if(record.timer)clearTimeout(record.timer);try{record.player?.destroy();}catch{}});}};
}
