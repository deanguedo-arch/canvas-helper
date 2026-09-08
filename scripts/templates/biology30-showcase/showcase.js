(() => {
  'use strict';
  const selector = document.querySelector('#unit'), frame = document.querySelector('#course'), status = document.querySelector('#status');
  const key = 'biology30:teacher-showcase:navigation:v1', units = ['a','b','c','d'];
  let saved = { unit: 'a', routes: {} }, active = '', detach = () => {};
  try { const prior = JSON.parse(localStorage.getItem(key) || 'null'); if (prior && units.includes(prior.unit) && prior.routes && typeof prior.routes === 'object') saved = prior; } catch {}
  const validRoute = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{0,180}$/.test(value) ? value : '';
  const persist = () => { try { localStorage.setItem(key, JSON.stringify(saved)); } catch {} };
  const readLink = () => {
    const hash = location.hash.slice(1), match = /^([abcd])(?:\/([a-zA-Z0-9_-]{0,180}))?$/.exec(hash);
    if (match) return { unit: match[1], route: match[2] || '' };
    if (/^lesson-\d{2}(?:-[a-zA-Z0-9_-]+)?$/.test(hash)) return {unit:'a',route:hash};
    return {unit:saved.unit,route:validRoute(saved.routes[saved.unit])};
  };
  const remember = () => {
    try {
      if (!active || !frame.contentWindow.location.pathname.endsWith(`/units/${active}/index.html`)) return;
      const route = validRoute(frame.contentWindow.location.hash.slice(1));
      saved.unit=active; saved.routes[active]=route; persist();
      history.replaceState(null,'',`#${active}${route?'/'+route:''}`);
    } catch {}
  };
  const show = ({unit,route}) => {
    route=validRoute(route); selector.value=unit; saved.unit=unit; persist();
    if (unit===active) { try { if(frame.contentWindow.location.hash.slice(1)!==route) frame.contentWindow.location.hash=route; } catch {} return; }
    detach(); active=unit; frame.title=`Biology 30 · Unit ${unit.toUpperCase()}`;
    frame.contentWindow.location.replace(new URL(`units/${unit}/index.html${route?'#'+route:''}`,location.href).href);
  };
  frame.addEventListener('load',()=>{
    try { const child=frame.contentWindow; if(!child.location.pathname.endsWith(`/units/${active}/index.html`))return;
      child.addEventListener('hashchange',remember); detach=()=>child.removeEventListener('hashchange',remember); remember();
    } catch { status.textContent='The unit could not be opened. Reload this page to try again.'; }
  });
  selector.addEventListener('change',()=>{const unit=selector.value; remember(); const route=validRoute(saved.routes[unit]);history.pushState(null,'',`#${unit}${route?'/'+route:''}`);show({unit,route});});
  window.addEventListener('hashchange',()=>show(readLink()));
  window.addEventListener('popstate',()=>show(readLink()));
  document.querySelector('#copy').addEventListener('click',async()=>{remember();try{await navigator.clipboard.writeText(location.href);status.textContent='Review link copied.';}catch{status.textContent='Copy the review link from your browser address bar.';}});
  show(readLink());
})();
