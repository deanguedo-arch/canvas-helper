/** Route first, then reveal ancestors and focus the exact original activity. */
export function mountTopicReturnLinks(root:HTMLElement, routes:string[]) {
  let frame:number|null=null;
  let pending:{target:HTMLElement;route:string}|null=null;
  const afterRoute=()=>{
    if(!pending||location.hash!==`#${pending.route}`)return;
    if(frame!==null)cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      const target=pending?.target;if(!target||location.hash!==`#${pending!.route}`)return;
      root.dispatchEvent(new CustomEvent('pilot2-reveal-target',{detail:target}));
      if(target instanceof HTMLDetailsElement)target.open=true;
      let parent=target.parentElement;
      while(parent&&parent!==root){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}
      const visible=(node:HTMLElement)=>!node.closest('[hidden]')&&node.getClientRects().length>0;
      const field=target.matches('input,textarea,select,button,a[href]')&&visible(target)?target:[...target.querySelectorAll<HTMLElement>('textarea,input,select'),...target.querySelectorAll<HTMLElement>('button,a[href]')].find(visible);
      const reading=target.hasAttribute('data-p2-reading-target'),focus=reading?target:field??target;if((reading||!field)&&!focus.hasAttribute('tabindex'))focus.tabIndex=-1;focus.focus();focus.scrollIntoView({block:'center'});frame=null;pending=null;
    });
  };
  const onClick=(event:Event)=>{
    const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('[data-pilot2-return-route]'):null;
    if(!link||!root.contains(link))return;
    const route=link.dataset.pilot2ReturnRoute!,id=link.dataset.pilot2ReturnFocus!;
    const target=root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if(!routes.includes(route)||!target)throw new Error(`Missing activity return target: ${route}/${id}`);
    event.preventDefault();
    const routed=route.endsWith('-overview')?'overview':route;
    if(frame!==null){cancelAnimationFrame(frame);frame=null;}
    pending={target,route:routed};
    if(location.hash!==`#${routed}`)location.hash=routed;
    else window.dispatchEvent(new HashChangeEvent('hashchange'));
  };
  root.addEventListener('click',onClick);
  // Wait for the shell's actual route event. Two animation frames can elapse
  // before hashchange under load, leaving focus on a still-hidden activity.
  window.addEventListener('hashchange',afterRoute);
  return {dispose(){root.removeEventListener('click',onClick);window.removeEventListener('hashchange',afterRoute);if(frame!==null)cancelAnimationFrame(frame);pending=null;}};
}
